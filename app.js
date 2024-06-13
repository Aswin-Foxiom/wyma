const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Import cors

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/wyma_db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

// Define user schema
const userSchema = new mongoose.Schema({
  wyma_number: String,
  name: String,
  age_category: String,
  sex: String,
});
const User = mongoose.model("User", userSchema);

// Middleware
app.use(cors()); // Use cors middleware
app.use(express.json());

// Create user
app.post("/users", async (req, res) => {
  try {
    const users = req.body; // Assume req.body is an array of users
    if (!Array.isArray(users)) {
      return res.status(400).json({ error: "Expected an array of users" });
    }

    const savedUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      const savedUser = await user.save();
      savedUsers.push(savedUser);
    }

    res.status(201).json(savedUsers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const filter = {};

    // Only add parameters to filter if they are provided
    if (req.query.name) filter.name = req.query.name;
    if (req.query.wyma_number) filter.wyma_number = req.query.wyma_number;
    if (req.query.age_category) filter.age_category = req.query.age_category;
    if (req.query.sex) filter.sex = req.query.sex;

    console.log(filter); // Log the filter object for debugging

    const users = await User.find(filter); // Find users based on the filter
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user by ID
app.put("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete user by ID
app.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
