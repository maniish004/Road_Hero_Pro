const express = require('express');
const router = express.Router();
const Mechanic = require('../models/Mechanic');

// @desc    Register a new mechanic
// @route   POST /api/mechanics
router.post('/', async (req, res) => {
    try {
        const { name, phone, serviceType, latitude, longitude } = req.body;

        const mechanic = await Mechanic.create({
            name,
            phone,
            serviceType,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            }
        });

        res.status(201).json({ success: true, data: mechanic });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Get all mechanics (for testing primarily)
// @route   GET /api/mechanics
router.get('/', async (req, res) => {
    try {
        const mechanics = await Mechanic.find();
        res.status(200).json({ success: true, count: mechanics.length, data: mechanics });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Get single mechanic
// @route   GET /api/mechanics/:id
router.get('/:id', async (req, res) => {
    try {
        const mechanic = await Mechanic.findById(req.params.id);
        if (!mechanic) {
            return res.status(404).json({ success: false, error: 'Mechanic not found' });
        }
        res.status(200).json({ success: true, data: mechanic });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

const { protect } = require('../middleware/authMiddleware');

// @desc    Update mechanic profile
// @route   PATCH /api/mechanics/:id/profile
router.patch('/:id/profile', protect, async (req, res) => {
    try {
        const { name, email, phone, photoUrl } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (photoUrl !== undefined) updateData.photoUrl = photoUrl;

        const mechanic = await Mechanic.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select('-password');

        if (!mechanic) {
            return res.status(404).json({ success: false, error: 'Mechanic not found' });
        }

        res.status(200).json({ success: true, data: mechanic });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, error: 'Email already in use' });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Update mechanic location
// @route   PATCH /api/mechanics/:id/location
router.patch('/:id/location', protect, async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        const updateData = {};
        if (latitude && longitude) {
            updateData.location = {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            };
        }

        const mechanic = await Mechanic.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select('-password');

        if (!mechanic) {
            return res.status(404).json({ success: false, error: 'Mechanic not found' });
        }

        res.status(200).json({ success: true, data: mechanic });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Toggle mechanic availability
// @route   PATCH /api/mechanics/:id/availability
router.patch('/:id/availability', async (req, res) => {
    try {
        const { isAvailable } = req.body;
        const mechanic = await Mechanic.findByIdAndUpdate(
            req.params.id,
            { isAvailable },
            { new: true }
        ).select('-password');

        if (!mechanic) {
            return res.status(404).json({ success: false, error: 'Mechanic not found' });
        }

        res.status(200).json({ success: true, data: mechanic });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
