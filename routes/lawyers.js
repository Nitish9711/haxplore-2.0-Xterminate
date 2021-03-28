const express = require("express");
const router = express.Router();
const authentication = require("../middleware/authentication");
const authorization = require("../middleware/authorization");
const find = require("../middleware/find");
const passport = require("passport");
const Lawyer = require("../models/Lawyer");
const Appointment = require("../models/Appointment");
const Client = require("../models/Client");
const upload = require("../middleware/multer");
const nodemailer = require('nodemailer')
const config = require('../config.json')


const lawyersController = require("../controllers/lawyers");
const { getMaxListeners } = require("../models/Lawyer");

router.get("/login", (req, res) => {
  res.render("lawyers/login");
});

router.post(
  "/login",
  authentication.ensureNoLogin,
  passport.authenticate("lawyerLocal", { failureRedirect: "/lawyers/login" }),
  (req, res) => {
    res.redirect("/lawyers/dashboard");
  }
);

router.get("/signup", authentication.ensureNoLogin, (req, res) => {
  res.render("lawyers/signup");
});

router.get(
  "/appointments",
  authentication.ensureLogin,
  authorization.ensureLawyer,
  async (req, res, next) => {
    try {
      const appointments = [];
      for (const id of req.user.appointments) {
        const x = await Appointment.findById(id);
        if (x) appointments.push(x);
      }
      for (const appointment of appointments) {
        await appointment.populate("clientId").execPopulate();
      }
      // console.log(appointments);
      res.render("lawyers/appointments", { user: req.user, appointments });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/signup",
  authentication.ensureNoLogin,
  upload.single("image"),
  lawyersController.signUp
);

router.get("/dashboard", authentication.ensureLogin, (req, res) => {
  res.render("lawyers/dashboard", { user: req.user });
});

router.get(
  "/:id",
  authentication.ensureLogin,
  find.findLawyer,
  authorization.identifyUserType,
  (req, res) => {
    res.render("lawyers/profile", {
      lawyer: req.find.lawyer,
      user: req.user,
      type: req.find.type,
    });
  }
);

router.get("/", authentication.ensureLogin, (req, res) => {
  res.render("lawyers/index");
});

router.post("/search", authentication.ensureLogin, async (req, res) => {
  // Lawyer.find().then(lawyer => {
  //     if (lawyer) {
  //       res.status(200).json(lawyer);
  //     }
  //   });

  try {
    const filter = {};
    if (req.body.city && req.body.city !== "None")
      filter["address.city"] = req.body.city;
    if (req.body.practiceAreas && req.body.practiceAreas !== "None")
      filter.practiceAreas = req.body.practiceAreas;
    if (req.body.courts && req.body.courts !== "None")
      filter.courts = req.body.courts;
    if (req.body.gender && req.body.gender !== "None")
      filter.gender = req.body.gender;
    //TODO: rating filter
    // if(req.body.rating && req.body.rating!=='None' && parseInt(req.body.rating)!==NaN){
    //     // filter.rating = {$gte: parseInt(req.body.rating)};
    // }

    const lawyers = await Lawyer.find(filter);
    if (req.body.experience && req.body.experience !== "None") {
      for (let i = 0; i < lawyers.length; i++) {
        let sum = 0;
        for (const exp of lawyer[i].experience) sum += exp.years;
        if (sum < req.body.experience) {
          lawyers.splice(i, 1);
          i--;
        }
      }
    }

    if (req.body.sort && req.body.sort === "experience") {
      lawyers.sort(function (a, b) {
        let expA = 0,
          expB = 0;
        for (const exp of a.experience) expA += exp.years;
        for (const exp of b.experience) expB += exp.years;
        if (expA > expB) return -1;
        else if (expA === expB) return 0;
        else return 1;
      });
    }

    //TODO: rating sort
    res.send(lawyers);
  } catch (err) {
    res.send([]);
  }
});

router.post(
  "/:id",
  authentication.ensureLogin,
  find.findLawyer,
  authorization.ensureClient,
  async (req, res, next) => {
    try {
      const appointment = new Appointment({
        lawyerId: req.params.id,
        clientId: req.user._id,
      });
      await appointment.save();
      req.find.lawyer.appointments.push(appointment);
      await req.find.lawyer.save();
      res.redirect(`/lawyers/${req.params.id}`);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  "/:id/:appointmentId",
  authentication.ensureLogin,
  authorization.ensureLawyer,
  find.findLawyer,
  async (req, res, next) => {
    try {
      const appointment = await Appointment.findById(req.params.appointmentId);
      if (!appointment.lawyerId.equals(req.params.id))
        throw Error("Unauthorized");
      await appointment.delete();
      await req.find.lawyer.update({
        $pull: { appointments: req.params.appointmentId },
      });
      res.send(appointment);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/bookAppointment/:id",
  authentication.ensureLogin,
  authorization.ensureLawyer,
  (req, res, next) => {
    // console.log(req.params.id1);
    // console.log(req.params.id2);

    console.log(req.body.date);
    console.log(req.body.time);
    console.log(req.params.id);

    Appointment.findByIdAndUpdate(
      req.params.id,
      { isCompleted: true },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          var email;
          var lawyerDetails;
          Lawyer.findById(docs["lawyerId"])
            .then((lawyer) => {
              // console.log(lawyer["email"]);
              lawyerDetails = lawyer;
            })
            .then(() => {
              Client.findById(docs["clientId"]).then((client) => {
                // console.log(client["email"]);
                // email = client["email"];
                // console.log(lawyerDetails);
                // console.log(email);
                var mailList = [client["email"],lawyerDetails["email"]];
                var clientName = client["name"]["first"] + " " + client["name"]["last"];
                var lawyerName = lawyerDetails["name"]["first"] + " " + lawyerDetails["name"]["last"];
                console.log(clientName);
                console.log(mailList);
                var date = req.body.date;
                var time = req.body.time;
                var meetLink = "https://advocmeet.herokuapp.com/a8b4ee34-d9ec-4297-9a90-fe73267ccff5";
                const transporter = nodemailer.createTransport({
                  host: 'smtp-mail.outlook.com',
                  service: 'hotmail',
                  secureConnection: false, 
                  port: 587, // port for secure SMTP
                  tls: {
                    ciphers:'SSLv3'
                  },
                  auth: {
                    user: config.fromMail, // Set this in environment var
                    pass: config.pass, // Set this in environment var
                  },
                });

                const mailOptions = {
                  from: config.fromMail,
                  to: ['parth1716@gmail.com', 'nitishkumar12c@gmail.com'],
                  subject: "Your Advoc meeting",
                  // Email body.
                  // text: req.body.content,
                  html: `<!DOCTYPE html>
                  <html lang="en">
                  <head>
                      <meta charset="UTF-8">
                      <meta http-equiv="X-UA-Compatible" content="IE=edge">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  </head>
                  <body>
                    <p>
                      Thank you for choosing ADVOC, here is the link for the meeting booked by ` + clientName + ` with lawyer  `+ lawyerName + `  -  
                    </p>
                    <br>` + 
                    meetLink +
                  `</body>
                  </html>`,
                  attachments: [
                    {
                      filename: '',
                      path: './public/assets/logo.jpeg'
                    }
                  ]
                }

                transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                    console.log(error);
                    res
                      .status(500)
                      .send(`Something went wrong. Unable to send email\nERROR:\n${error}`);
                    } else {
                    console.log(`Email sent: ${info.response}`);
                    // console.log(mailList);
                  }
                });  
              });
            })
           
        }
      }
    );

    // Lawyer.findById(req.params.id1).then(lawyer => {
    //     console.log(lawyer);
    //   });

    // Client.findById(req.params.id2).then(client => {
    //     console.log(client);
    //   });;

    res.redirect("/lawyers/appointments");
  }
);

module.exports = router;
