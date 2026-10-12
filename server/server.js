// load MONGO_URI from the .env file
require("dotenv").config();
const { MongoClient } = require("mongodb");

// create the MongoDB client with the connection string from .env
const client = new MongoClient(process.env.MONGO_URI);

// connect to MongoDB Atlas once when the server starts
async function connectDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Could not connect to MongoDB");
        console.error(error);
    }
}
connectDatabase();



const express = require("express");
const cors = require("cors");

const app = express();

// the pa2 database and the users collection inside it
const db = client.db("pa2");
const users = db.collection("users");
const projects = db.collection("projects");
const projectMemberships = db.collection("projectMemberships");


// read JSON bodies out of incoming requests
app.use(express.json());
// let the React dev server call this API from a different port
app.use(cors());

// simple route to check that the server is alive
app.get("/", (req, res) => {
    res.json({
        message: "Server is running"
    });
});


// get all registered users
app.get("/api/users", async (req, res) => {
  try {
    // get all users without sending their passwords
    const userList = await users
      .find({}, { projection: { password: 0 } })
      .toArray();

    // send the users back to the React client
    res.status(200).json(userList);
  } catch (error) {
    // show an error if MongoDB cannot return the users
    res.status(500).json({
      message: "Server error",
    });
  }
});


// Signup: create a new user in MongoDB
app.post("/signup", async (req, res) => {
  try {
    const { f_name, l_name, username, password } = req.body;

    if (!f_name || !l_name || !username || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await users.findOne({ username });

    if (existingUser) {
      return res.status(409).json({
        message: "Username already exists",
      });
    }

    await users.insertOne({
      f_name,
      l_name,
      username,
      password,
    });

    res.status(201).json({
      message: "User created successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});


// Login: check the username and password against MongoDB
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const user = await users.findOne({ username });

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    res.status(200).json({
      message: "Login successful",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});

// start listening for requests
app.listen(9000, () => {
    console.log("Server running on port 9000");
});