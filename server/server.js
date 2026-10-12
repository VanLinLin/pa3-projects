// load MONGO_URI from the .env file
require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");

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


// Create Project: create a new project in MongoDB
app.post("/api/projects", async (req, res) => {
  try {
    // get the project information from the request
    const { name, description, status, project_lead_id } = req.body;

    // make sure all fields were entered
    if (!name || !description || !status || !project_lead_id) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // make sure the project status is valid
    if (
      status !== "Planning" &&
      status !== "Active" &&
      status !== "Completed"
    ) {
      return res.status(400).json({
        message: "Invalid project status",
      });
    }

    // make sure the project lead id has a valid ObjectId format
    if (!ObjectId.isValid(project_lead_id)) {
      return res.status(400).json({
        message: "Invalid project lead",
      });
    }

    // change the project lead id from a string into an ObjectId
    const leadId = new ObjectId(project_lead_id);

    // make sure the selected project lead exists
    const lead = await users.findOne({
      _id: leadId,
    });

    if (!lead) {
      return res.status(404).json({
        message: "Project lead not found",
      });
    }

    // create the new project
    const result = await projects.insertOne({
      name,
      description,
      status,
      project_lead_id: leadId,
    });

    // automatically add the project lead as a project member
    await projectMemberships.insertOne({
      project_id: result.insertedId,
      user_id: leadId,
    });

    // tell the client that the project was created
    res.status(201).json({
      message: "Project created successfully",
    });
  } catch (error) {
    // show an error if MongoDB cannot create the project
    res.status(500).json({
      message: "Server error",
    });
  }
});


// get all projects
app.get("/api/projects", async (req, res) => {
  try {
    // get all projects from MongoDB
    const projectList = await projects.find({}).toArray();

    // send the projects back to the React client
    res.status(200).json(projectList);
  } catch (error) {
    // show an error if MongoDB cannot return the projects
    res.status(500).json({
      message: "Server error",
    });
  }
});


// get all members of one project
app.get("/api/projects/:projectId/members", async (req, res) => {
  try {
    const { projectId } = req.params;

    // make sure the project id has a valid ObjectId format
    if (!ObjectId.isValid(projectId)) {
      return res.status(400).json({
        message: "Invalid project id",
      });
    }

    // change the project id from a string into an ObjectId
    const projectObjectId = new ObjectId(projectId);

    // make sure the project exists
    const project = await projects.findOne({
      _id: projectObjectId,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // get all membership records for this project
    const memberships = await projectMemberships
      .find({
        project_id: projectObjectId,
      })
      .toArray();

    // send the member user ids back to the React client
    res.status(200).json(
      memberships.map((membership) => membership.user_id)
    );
  } catch (error) {
    // show an error if MongoDB cannot return the members
    res.status(500).json({
      message: "Server error",
    });
  }
});


// add a member to one project
app.post("/api/projects/:projectId/members", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { user_id } = req.body;

    // make sure the project id has a valid ObjectId format
    if (!ObjectId.isValid(projectId)) {
      return res.status(400).json({
        message: "Invalid project id",
      });
    }

    // make sure the user id has a valid ObjectId format
    if (!ObjectId.isValid(user_id)) {
      return res.status(400).json({
        message: "Invalid user id",
      });
    }

    // change both ids from strings into ObjectIds
    const projectObjectId = new ObjectId(projectId);
    const userObjectId = new ObjectId(user_id);

    // make sure the project exists
    const project = await projects.findOne({
      _id: projectObjectId,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // make sure the user exists
    const user = await users.findOne({
      _id: userObjectId,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // make sure the user is not already a member of this project
    const existingMembership = await projectMemberships.findOne({
      project_id: projectObjectId,
      user_id: userObjectId,
    });

    if (existingMembership) {
      return res.status(409).json({
        message: "User is already a member of this project",
      });
    }

    // add the user to the project
    await projectMemberships.insertOne({
      project_id: projectObjectId,
      user_id: userObjectId,
    });

    // tell the client that the member was added
    res.status(201).json({
      message: "Member added successfully",
    });
  } catch (error) {
    // show an error if MongoDB cannot add the member
    res.status(500).json({
      message: "Server error",
    });
  }
});

// start listening for requests
app.listen(9000, () => {
    console.log("Server running on port 9000");
});