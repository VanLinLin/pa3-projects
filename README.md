# PA3 Projects and Memberships

**Author:** Yu-Fan Lin

## Description
This is the course 418Y programming assignment 3. It extends the PA2 MERN application so that the users can create projects, see the projects, and manage who belongs to each project. The React frontend collects the data and sends it to an Express backend, and the backend stores the projects and the memberships in MongoDB Atlas. The Signup and Login forms from PA2 still work.

## How to Run
1. Clone this repo.
2. Create a file `server/.env` and put your MongoDB Atlas connection string in it as `MONGO_URI=...`. This file is not in the repo.
3. Make sure your current IP address is on the Atlas allowlist, otherwise the server cannot connect to the database.
4. In the `server` folder, run `npm install` and then `node server.js`. The server listens on port 9000.
5. In the `client` folder, run `npm install` and then `npm run dev`, then open the address that Vite prints.

## Data Model
The database has three collections.

- `users` — the accounts created by Signup, as in PA2.
- `projects` — one document per project, with `name`, `description`, `status` and `project_lead_id`. The `project_lead_id` is the `_id` of a user.
- `projectMemberships` — one document per membership, with `project_id` and `user_id`. A user belongs to a project when a document with that pair exists, so one user can belong to many projects and one project can have many users.

When a project is created, the project lead is added to `projectMemberships` automatically, so the lead is always a member of their own project.

## Features
- **Signup and Login** still work the same way as in PA2.
- **See the registered users.** The backend returns the list of users, and the React forms show them in a dropdown so that a user is picked instead of typed.
- **Create a project.** The form takes a name, a description, a status, and a project lead chosen from the registered users. The status must be `Planning`, `Active` or `Completed`.
- **View the projects.** The frontend lists every project in the database.
- **View the members of a project.**
- **Add a registered user to a project.** The same user can be added to more than one project.
- **Refuse a duplicate member.** Adding a user who is already in that project is rejected and the frontend displays the message instead of only writing it to the console.
- **Remove a member.** The project lead cannot be removed; every other member can.
- All of the forms refuse empty fields, and display the message sent back by the server rather than crashing when the server cannot be reached.

## API
| Method | Route | What it does |
|---|---|---|
| `GET` | `/api/users` | list the registered users |
| `POST` | `/signup` | create a user |
| `POST` | `/login` | check a username and password |
| `POST` | `/api/projects` | create a project |
| `GET` | `/api/projects` | list the projects |
| `GET` | `/api/projects/:projectId/members` | list the members of a project |
| `POST` | `/api/projects/:projectId/members` | add a member to a project |
| `DELETE` | `/api/projects/:projectId/members/:userId` | remove a member from a project |

## Status Codes
The backend answers with a status code for each case.

- `200` — the request succeeded (login correct, list returned, member removed).
- `201` — something was created (user, project, membership).
- `400` — missing fields, an id that is not a valid `ObjectId`, or a project status that is not one of the three allowed values.
- `401` — wrong username or password.
- `403` — an attempt to remove the project lead.
- `404` — the project, the user, the project lead, or the membership does not exist.
- `409` — a duplicate: a username that already exists, or a user who is already a member of that project.
- `500` — a database or server error.

## AI Use Disclosure

**Tool:** Claude

**Used for:** Reviewing my code and debugging. I wrote all of the application code myself; Claude read it, pointed out the mistakes, and I fixed them.
