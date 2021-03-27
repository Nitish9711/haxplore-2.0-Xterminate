const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    lawyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lawyer',
        required: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    isCompleted: {
        type: Boolean,
        required: true,
        default: false
    }
})

module.exports = mongoose.model('Appointment',appointmentSchema);