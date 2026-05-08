const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Mechanic = require('../models/Mechanic');
const { protect } = require('../middleware/authMiddleware');

// Generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

// @desc    Get current user (for session verification)
// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
    res.status(200).json({ success: true, data: req.user });
});

// @desc    Register new Driver
// @route   POST /api/auth/driver/register
router.post('/driver/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({ success: false, error: 'Please provide all fields' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        const user = await User.create({ name, email, password, phone });

        if (user) {
            res.status(201).json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: 'driver',
                    token: generateToken(user._id, 'driver'),
                },
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// @desc    Login Driver
// @route   POST /api/auth/driver/login
router.post('/driver/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide email and password' });
        }

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: 'driver',
                    token: generateToken(user._id, 'driver'),
                },
            });
        } else {
            res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// @desc    Register new Mechanic
// @route   POST /api/auth/mechanic/register
router.post('/mechanic/register', async (req, res) => {
    try {
        const { name, email, password, phone, serviceType, latitude, longitude } = req.body;

        if (!name || !email || !password || !phone || !serviceType) {
            return res.status(400).json({ success: false, error: 'Please provide all fields' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
        }

        const mechanicExists = await Mechanic.findOne({ email });
        if (mechanicExists) {
            return res.status(400).json({ success: false, error: 'Mechanic already exists' });
        }

        const mechanic = await Mechanic.create({
            name,
            email,
            password,
            phone,
            serviceType,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude || 0), parseFloat(latitude || 0)]
            }
        });

        if (mechanic) {
            res.status(201).json({
                success: true,
                data: {
                    _id: mechanic._id,
                    name: mechanic.name,
                    email: mechanic.email,
                    phone: mechanic.phone,
                    serviceType: mechanic.serviceType,
                    role: 'mechanic',
                    location: mechanic.location,
                    token: generateToken(mechanic._id, 'mechanic'),
                },
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// @desc    Login Mechanic
// @route   POST /api/auth/mechanic/login
router.post('/mechanic/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide email and password' });
        }

        const mechanic = await Mechanic.findOne({ email });

        if (mechanic && (await mechanic.matchPassword(password))) {
            res.json({
                success: true,
                data: {
                    _id: mechanic._id,
                    name: mechanic.name,
                    email: mechanic.email,
                    phone: mechanic.phone,
                    serviceType: mechanic.serviceType,
                    role: 'mechanic',
                    location: mechanic.location,
                    token: generateToken(mechanic._id, 'mechanic'),
                },
            });
        } else {
            res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// @desc    Add a vehicle to driver profile
// @route   POST /api/auth/driver/:id/vehicles
router.post('/driver/:id/vehicles', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        user.vehicles.push(req.body);
        await user.save();
        res.status(200).json({ success: true, data: user.vehicles });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// @desc    Delete a vehicle from driver profile
// @route   DELETE /api/auth/driver/:id/vehicles/:vehicleId
router.delete('/driver/:id/vehicles/:vehicleId', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        user.vehicles = user.vehicles.filter(v => v._id.toString() !== req.params.vehicleId);
        await user.save();
        res.status(200).json({ success: true, data: user.vehicles });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
