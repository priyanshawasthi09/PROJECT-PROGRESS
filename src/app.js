const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Register = require("./models/registers.js");
require("./db/conn.js");

const port = process.env.PORT || 3003;

const static_path = path.join(__dirname, "../public");
const templates_path = path.join(__dirname, "../templates/views");

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", templates_path);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("index");
});

//signup rendering and data_collection
app.get("/signup.hbs", (req, res) => {
  res.render("signup");
});
app.post("/signup", async (req, res) => {
  try {
    const userdata = new Register({
      full_name: req.body.full_name,
      email: req.body.email,
      password: req.body.password,
    });
    const registered = await userdata.save();
    res.status(201).render("login");
  } catch (error) {
    res.status(400).send("Already exists");
  }
});

//Login page rendering and Data_authorization
app.get("/login.hbs", (req, res) => {
  res.render("login");
});
app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userEmail = await Register.findOne({ email: email });
    if (userEmail.password === password) {
      res.status(201).render("dashboard");
    } else {
      res.status(400).send("Invalid Login Details");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.listen(port, () => {
  console.log(`connection successful at port no ${port}`);
});

//email verification for password change
app.get("/forgot_password.hbs", (req, res) => {
  res.render("forgot_password");
});
