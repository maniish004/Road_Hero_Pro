const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    driverName: { type: String, required: true },
    driverPhone: { type: String, required: true },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    issue: { type: String, required: true },
    vehicle: {
        make: String,
        model: String,
        color: String,
        licensePlate: String
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'PAYMENT_PENDING', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING'
    },
    serviceType: {
        type: String,
        enum: ['General', 'Towing', 'Tire', 'Fuel'],
        default: 'General'
    },
    assignedMechanic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mechanic',
        default: null
    },
    price: {
        type: Number,
        default: 0
    },
    distance: {
        type: Number, // distance in km
        default: 0
    },
    towDestination: {
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                default: undefined
            }
        },
        address: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Card', 'UPI', 'Unknown'],
        default: 'Unknown'
    },
    review: {
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now }
    }
});

requestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Request', requestSchema);
