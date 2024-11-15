const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const Register = require("./models/registers.js");
require("./db/conn.js");

const port = process.env.PORT || 3003;

const static_path = path.join(__dirname, "../public");
const templates_path = path.join(__dirname, "../templates/views");
const partial_path = path.join(__dirname, "../templates/partials");

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", templates_path);
hbs.registerPartials(partial_path);

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
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists in the database
    const user = await Register.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Generate a unique reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store hashed token and expiration date in the database
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    // Create reset link
    const resetLink = `http://gmail.com/reset-password/${resetToken}`;

    // Send email with reset link
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "your-email@gmail.com",
        pass: "your-email-password",
      },
    });

    const mailOptions = {
      to: email,
      from: "your-email@gmail.com",
      subject: "Password Reset",
      text: `You requested a password reset. Click this link to reset your password: ${resetLink}`,
    };

    await transporter.sendMail(mailOptions);
    res.send("Password reset link has been sent to your email");
  } catch (error) {
    res.status(500).send("Error sending reset email");
  }
});

app.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // Find user by reset token and ensure token is not expired
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // Ensure token is still valid
    });

    if (!user) {
      return res.status(400).send("Invalid or expired token");
    }

    // Update user's password
    user.password = await bcrypt.hash(newPassword, 10); // Hash the new password
    user.resetPasswordToken = undefined; // Clear reset token and expiry
    user.resetPasswordExpires = undefined;
    await user.save();

    res.send("Password has been successfully reset");
  } catch (error) {
    res.status(500).send("Error resetting password");
  }
});
