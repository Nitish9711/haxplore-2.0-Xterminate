const express = require('express');
const router = express.Router();
const authentication = require('../middleware/authentication');
const upload = require('../middleware/multer');
const passport = require('passport');
const Client = require('../models/Client');
const Appoitnment = require('../models/Appointment');
const multer = require("multer");
const path = require('path');
const fs = require('fs');
const find = require('../middleware/find');

const clientsController = require('../controllers/clients');

router.get('/login',authentication.ensureNoLogin,(req,res) => {
    res.render('clients/login');
})

router.post('/login',authentication.ensureNoLogin,passport.authenticate('clientLocal',{failureRedirect: '/clients/login'}),(req,res) => {
    console.log(req.body);
    res.redirect('/clients/dashboard');
})

router.get('/dashboard',authentication.ensureLogin,(req,res) => {
    res.render('clients/dashboard',{user: req.user});
  })


router.get('/search',authentication.ensureLogin,(req,res) => {
    res.render('clients/findLawyer',{user: req.user});
})
router.get('/signup',authentication.ensureNoLogin,(req,res) => {
    res.render('clients/signup');
})

router.post('/signup',authentication.ensureNoLogin, upload.single('image'),clientsController.signUp);

router.get('/:id',authentication.ensureLogin,find.findClient,(req,res) => {
    res.render('clients/profile',{clients: req.find.client});
})

router.get('/bookAppointment', authentication.ensureLogin, (req, res) =>{
    lawyer_Id = req.body.lawyerId;
    client_Id = req.userId;
    var temp =  Appointment.findby({lawyerId:lawyer_Id});
    if(temp == None){      
        Appoitnment.save()
    } 
    

});



module.exports = router;