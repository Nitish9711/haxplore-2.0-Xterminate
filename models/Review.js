const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    lawyerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Lawyer',
        requied: true
    },
    rating:{
        type:Number,
        requied: true
    },
    text:{
        type:String,
        requied:true
    }   
})

module.exports = mongoose.model('Review',reviewSchema);