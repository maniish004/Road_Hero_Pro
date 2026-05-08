const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Mechanic = require('../models/Mechanic');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

            if (decoded.role === 'driver') {
                req.user = await User.findById(decoded.id).select('-password');
                if (req.user) req.user.role = 'driver';
            } else if (decoded.role === 'mechanic') {
                req.user = await Mechanic.findById(decoded.id).select('-password');
                if (req.user) req.user.role = 'mechanic';
            }

            if (!req.user) {
                return res.status(401).json({ success: false, error: 'User not found' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ success: false, error: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ success: false, error: 'Not authorized, no token' });
    }
};

module.exports = { protect };
