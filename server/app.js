require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const axios = require("axios");
const nodemailer = require("nodemailer");
const schedule = require("node-schedule");

app.use(cors()); //Cross-Origin-Resource-Sharing
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

//nodemailer configuration to send emails
const transport = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

//using nodemailer to send an email
function sendMail(receiver) {
  const message = {
    from: process.env.EMAIL_USER, // Sender address
    to: receiver, // recipient
    subject: "Time to leave!", // Subject line
    text: "Time to leave!", // Plain text body
  };
  transport.sendMail(message, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
}

//schedule the sendMail procedure
function scheduleSendMail(receiver, arrivalTime, commuteTime) {
  //create date object from arrivalTime
  let d = new Date();
  const [hours, minutes] = arrivalTime.split(":");
  d = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes);

  //calculate departureTime: arrivalTime - commuteTime
  d = new Date(d.getTime() - commuteTime * 1000);

  schedule.scheduleJob(d, () => {
    sendMail(receiver);
    console.log("email sent at: " + d.toLocaleTimeString());
  });
}

app.post("/", async (req, res) => {
  try {
    let origins = req.body.source;
    origins = origins.replace(/ /g, "");            //remove spaces
    let destinations = req.body.destination;
    destinations = destinations.replace(/ /g, "");

    //use the distance matrix api
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=" +
        origins +
        "&destinations=" +
        destinations +
        "&key=" +
        process.env.API_KEY
    );

    const status = response.data.rows[0].elements[0].status;
    if (status !== "OK") {
      throw new Error(status);
    }

    const commuteTime = response.data.rows[0].elements[0].duration.value;
    scheduleSendMail(req.body.email, req.body.time, commuteTime);

    res.status(200).send(response.data.rows[0].elements[0].duration);
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
});

app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    type: "error",
    error: error.message,
  });
});

module.exports = app;
