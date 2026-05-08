const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Mechanic = require('../models/Mechanic');

// Helper to calculate distance in km using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// @desc    Create a new assistance request
// @route   POST /api/requests
router.post('/', async (req, res) => {
    try {
        const { driverName, driverPhone, driverId, issue, latitude, longitude, serviceType, towDestLat, towDestLng, towDestAddress } = req.body;

        if (!driverName || !driverPhone || !driverId || !issue || !latitude || !longitude) {
            return res.status(400).json({ success: false, error: 'Please provide all details including driver authentication' });
        }

        // Pricing logic
        const basePrices = {
            'General': 50,
            'Towing': 80, // Lower base for towing, but adds per km
            'Tire': 40,
            'Fuel': 35
        };

        let price = basePrices[serviceType] || 50;
        let distance = 0;

        if (serviceType === 'Towing' && towDestLat && towDestLng) {
            distance = calculateDistance(latitude, longitude, towDestLat, towDestLng);
            const ratePerKm = 5; // $5 per km for towing
            price = basePrices['Towing'] + (distance * ratePerKm);
        }

        const requestData = {
            driverName,
            driverPhone,
            driverId,
            issue,
            serviceType,
            price: Math.round(price),
            distance: Math.round(distance * 10) / 10,
            vehicle: req.body.vehicle,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            }
        };

        if (serviceType === 'Towing' && towDestLat && towDestLng) {
            requestData.towDestination = {
                location: {
                    type: 'Point',
                    coordinates: [parseFloat(towDestLng), parseFloat(towDestLat)]
                },
                address: towDestAddress || 'Destination'
            };
        }

        const request = await Request.create(requestData);

        res.status(201).json({ success: true, data: request });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Get pending requests near a location (For mechanics to find work)
// @route   GET /api/requests/nearby
router.get('/nearby', async (req, res) => {
    try {
        const { latitude, longitude, distanceInKm } = req.query;
        const maxDistance = (distanceInKm || 50) * 1000; // Default 50km

        const requests = await Request.find({
            status: 'PENDING',
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: maxDistance
                }
            }
        }).select('-driverPhone -driverName'); // Hide sensitive info until accepted

        res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Accept a request
// @route   PATCH /api/requests/:id/accept
router.patch('/:id/accept', async (req, res) => {
    try {
        const { mechanicId } = req.body;

        if (!mechanicId) {
            return res.status(400).json({ success: false, error: 'Mechanic ID missing' });
        }

        // Check if mechanic is already busy (now allowing up to 4 concurrent jobs)
        const activeJobCount = await Request.countDocuments({
            assignedMechanic: mechanicId,
            status: { $in: ['ACCEPTED', 'PAYMENT_PENDING'] }
        });

        if (activeJobCount >= 4) {
            return res.status(400).json({ success: false, error: 'You reached the limit of 4 active jobs. Complete one before taking more!' });
        }

        // Atomically update the request status if it's still PENDING
        const request = await Request.findOneAndUpdate(
            { _id: req.params.id, status: 'PENDING' },
            {
                status: 'ACCEPTED',
                assignedMechanic: mechanicId
            },
            { new: true }
        );

        if (!request) {
            return res.status(400).json({ success: false, error: 'Request is no longer available' });
        }

        res.status(200).json({ success: true, data: request });
    } catch (error) {
        console.error("Accept error:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Get requests for a mechanic (Active or Completed)
// @route   GET /api/requests/mechanic/:id
router.get('/mechanic/:id', async (req, res) => {
    try {
        const { status } = req.query;
        const query = { assignedMechanic: req.params.id };

        if (status === 'COMPLETED') {
            query.status = { $in: ['PAYMENT_PENDING', 'COMPLETED'] };
        } else if (status) {
            query.status = status;
        } else {
            query.status = 'ACCEPTED';
        }

        const requests = await Request.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        console.error("Mechanic fetch error:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Get requests for a driver (History and Active)
// @route   GET /api/requests/driver/:id
router.get('/driver/:id', async (req, res) => {
    try {
        const { status } = req.query;
        const query = { driverId: req.params.id };

        if (status) {
            query.status = status;
        }

        const requests = await Request.find(query)
            .populate('assignedMechanic')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        console.error("Driver fetch error:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Get request status (For driver polling)
// @route   GET /api/requests/:id
router.get('/:id', async (req, res) => {
    try {
        const request = await Request.findById(req.params.id).populate('assignedMechanic');
        if (!request) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }
        res.status(200).json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Mechanic marks job as finished (waiting for payment)
router.patch('/:id/finish', async (req, res) => {
    try {
        const { mechanicId } = req.body;
        const request = await Request.findById(req.params.id);

        if (!request) return res.status(404).json({ success: false, error: 'Not found' });

        if (request.assignedMechanic.toString() !== mechanicId) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        request.status = 'PAYMENT_PENDING';
        await request.save();

        res.status(200).json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Driver pays and completes the request
router.patch('/:id/pay', async (req, res) => {
    try {
        const { paymentMethod, driverId } = req.body;
        const request = await Request.findById(req.params.id);

        if (!request) return res.status(404).json({ success: false, error: 'Not found' });

        if (request.driverId.toString() !== driverId) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        request.status = 'COMPLETED';
        request.paymentMethod = paymentMethod || 'Unknown';
        await request.save();

        res.status(200).json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Driver adds a review for the mechanic
// @route   PATCH /api/requests/:id/review
router.patch('/:id/review', async (req, res) => {
    try {
        const { rating, comment, driverId } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, error: 'Valid rating (1-5) is required' });
        }

        const request = await Request.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }

        if (request.driverId.toString() !== driverId) {
            return res.status(403).json({ success: false, error: 'Not authorized to review this job' });
        }

        if (request.status !== 'COMPLETED') {
            return res.status(400).json({ success: false, error: 'You can only review completed jobs' });
        }

        if (request.review && request.review.rating) {
            return res.status(400).json({ success: false, error: 'You have already reviewed this job' });
        }

        // Add review to request
        request.review = { rating, comment };
        await request.save();

        // Update mechanic's aggregate rating
        const mechanic = await Mechanic.findById(request.assignedMechanic);
        if (mechanic) {
            const totalRating = (mechanic.rating * mechanic.numReviews) + rating;
            mechanic.numReviews += 1;
            mechanic.rating = Math.round((totalRating / mechanic.numReviews) * 10) / 10;
            await mechanic.save();
        }

        res.status(200).json({ success: true, data: request });
    } catch (error) {
        console.error("Review error:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
