const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const lawyerSchema = new mongoose.Schema({
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
        country: {
            type: String,
            required: true
        }
    },
    aboutMe: {
        type:String,
        required: true
    },
    education:{
        degreeType: {
            type: String,
            required: true
        },
        institutionName: {
            type: String,
            required: true
        },
        completed: {
            type: String,
            required: true
        },
    },
    
    experience:{
        expType:{
            type: String,
            required: true
        },

        years: {
            type: Number,
            required: true
        },
        workPlace:  {
            type: String,
            required: true
        },
    },
    specialization:
        {
            specType:   {
                type: String,
                required: true
            },
            totalCases:   {
                type: Number,
                required: true
            },
            wonCases:   {
                type: Number,
                required: true
            },
            pendingCases:  {
                type: Number,
                required: true
            }
        }
    ,
   
    courts: 
        {
            type:String,
            required: true
        }
    ,
    verified: {
        type:Boolean,
        required: true,
        default: false,
    },
    image: {
        type: String,
        required: false
    },
    practiceAreas:{
        type:String
    },
    clientCount:{
        type:Number,
        required:true,
        default :0
    },
    appointments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    }]
})

//TODO: reviews, rating
lawyerSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('Lawyer',lawyerSchema);