const Lawyer = require('../models/Lawyer');
const Client = require('../models/Client');

exports.findLawyer = async (req,res,next)=>{
    try{
        const lawyer = await Lawyer.findById(req.params.id);
        if(!req.find) req.find = {};
        req.find.lawyer = lawyer;
        console.log(lawyer);

        next();
    }catch(err){
        next(err);
    }
}
exports.findClient = async (req,res,next)=>{
    try{
        const client = await Client.findById(req.params.id);
        if(!req.find) req.find = {};
        req.find.client = client;
        next();
    }catch(err){
        next(err);
    }
}