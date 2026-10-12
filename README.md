# PA2 Login and Signup

**Author:** Yu-Fan Lin

## Description
This is the course 418Y programming assignment 2. I need to build a MERN application with a Signup form and a Login form. The React frontend collects the form data and sends it to an Express backend, and the backend creates and looks up the users in MongoDB Atlas.

## How to Run
1. Clone this repo.
2. Create a file `server/.env` and put your MongoDB Atlas connection string in it as `MONGO_URI=...`. This file is not in the repo.
3. Make sure your current IP address is on the Atlas allowlist, otherwise the server cannot connect to the database.
4. In the `server` folder, run `npm install` and then `node server.js`. The server listens on port 9000.
5. In the `client` folder, run `npm install` and then `npm run dev`, then open the address that Vite prints.

## Features
- Fill in first name, last name, username and password, then click `Signup` to create a new user document in MongoDB.
- Fill in username and password, then click `Login` to check the credentials against the database.
- Signup refuses a username that already exists in the database.
- Both forms refuse empty fields.
- Both forms display the message sent back by the server, and display a message instead of crashing when the server cannot be reached.
- The backend answers with a status code for each case: `201` created, `200` login correct, `400` missing fields, `401` wrong username or password, `409` duplicate username, `500` database or server error.

## AI Use Disclosure

**Tool:** Claude

**Used for:** Reviewing my code and debugging. I wrote all of the application code myself; Claude read it, pointed out the mistakes, and I fixed them.
