const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/USER_DATA")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));
