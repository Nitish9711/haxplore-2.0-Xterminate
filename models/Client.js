const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const clientSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    name: {
        first: {
            type: String,
            required: true
        },
        last: {
            type: String,
            required: true
        }
    },
    gender: {
        type: String,
        enum: ['Male','Female','Other'],
        required: true
    },
    address: {
        house: {
            type: String,
            required: true
        },
        locality: {
            type: String,
            required: true,
            default: ''
        },
        city: {
            type: String,
            required: true
        },
        pincode:{
            type:Number,
            required:true
        },
        country: {
            type: String,
            required: true
        }
    },
    image: {
        type: String,
        required: false
    }
})
clientSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('Client',clientSchema);