const express = require('express');
const router = express.Router();
const authentication = require('../middleware/authentication');
const authorization = require('../middleware/authorization');
const find = require('../middleware/find');
const passport = require('passport');
const Lawyer = require('../models/Lawyer');
const Appointment = require('../models/Appointment');
const upload = require('../middleware/multer');

const lawyersController = require('../controllers/lawyers');

router.get('/login',(req,res) => {
    res.render('lawyers/login');
})

router.post('/login',authentication.ensureNoLogin,passport.authenticate('lawyerLocal',{failureRedirect: '/lawyers/login'}),(req,res) => {
    res.redirect('/lawyers/dashboard');
})

router.get('/signup',authentication.ensureNoLogin,(req,res) => {
    res.render('lawyers/signup');
})

router.get('/appointments',authentication.ensureLogin,authorization.ensureLawyer,async (req,res,next) => {
    try{
        const appointments = [];
        for(const id of req.user.appointments){
            const x = await Appointment.findById(id);
            appointments.push(x);
        }
        res.render('lawyers/appointments',{user: req.user, appointments});
    }catch(err){
        next(err);
    }
})

router.post('/signup',authentication.ensureNoLogin, upload.single('image'),lawyersController.signUp);


router.get('/dashboard',authentication.ensureLogin,(req,res) => {
    res.render('lawyers/dashboard',{user: req.user});
  })

router.get('/:id',authentication.ensureLogin,find.findLawyer,(req,res) => {
    res.render('lawyers/profile',{lawyer: req.find.lawyer});
})

router.get('/',authentication.ensureLogin,(req,res) => {
    res.render('lawyers/index');
})

router.post('/search',authentication.ensureLogin,async (req,res) => {

    // Lawyer.find().then(lawyer => {
    //     if (lawyer) {
    //       res.status(200).json(lawyer);
    //     }
    //   });

    try{
        const filter = {};
        if(req.body.city && req.body.city!=='None') filter['address.city'] = req.body.city;
        if(req.body.practiceAreas && req.body.practiceAreas!=='None') filter.practiceAreas = req.body.practiceAreas;
        if(req.body.courts && req.body.courts!=='None') filter.courts = req.body.courts;
        if(req.body.gender && req.body.gender!=='None') filter.gender = req.body.gender;
        //TODO: rating filter
        // if(req.body.rating && req.body.rating!=='None' && parseInt(req.body.rating)!==NaN){
        //     // filter.rating = {$gte: parseInt(req.body.rating)};
        // }

        const lawyers = await Lawyer.find(filter);
        if(req.body.experience && req.body.experience!=='None'){
            for(let i=0;i<lawyers.length;i++){
                let sum=0;
                for(const exp of lawyer[i].experience) sum+=exp.years;
                if(sum<req.body.experience){
                    lawyers.splice(i,1);
                    i--;
                }
            }
        }

        if(req.body.sort && req.body.sort === 'experience'){
            lawyers.sort(function (a,b){
                let expA=0, expB=0;
                for(const exp of a.experience) expA+=exp.years;
                for(const exp of b.experience) expB+=exp.years;
                if(expA>expB) return -1;
                else if(expA===expB) return 0;
                else return 1;
            })
        }

        //TODO: rating sort
        res.send(lawyers);
    }catch(err){
        res.send([]);
    }
})

router.post('/:id',authentication.ensureLogin,find.findLawyer,authorization.ensureClient,async (req,res) => {
    try{
        const appointment = new Appointment({
            lawyerId: req.params.id,
            clientId: req.user._id
        });
        await appointment.save();
        req.find.lawyer.appointments.push(appointment);
        await req.find.lawyer.save();
        res.redirect(`/lawyers/${req.params.id}`);
    }catch(err){
        next(err);
    }
})

module.exports = router;