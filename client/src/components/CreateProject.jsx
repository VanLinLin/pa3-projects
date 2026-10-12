import { useEffect, useState } from "react";

function CreateProject() {
  // one state variable for each project field
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Planning");
  const [project_lead_id, setProjectLeadId] = useState("");

  // stores the registered users for the Project Lead dropdown
  const [users, setUsers] = useState([]);

  // stores the message returned by the server
  const [message, setMessage] = useState("");

  // get all registered users when the component first loads
  useEffect(() => {
    const getUsers = async () => {
      try {
        // get the registered users from the Express server
        const response = await fetch("http://localhost:9000/api/users");
        const data = await response.json();

        if (response.ok) {
          setUsers(data);
        } else {
          setMessage(data.message);
        }
      } catch (error) {
        // show an error message if the server cannot be reached
        setMessage("Could not connect to the server");
      }
    };

    getUsers();
  }, []);

  // runs when the Create Project button is clicked
  const handleSubmit = async (e) => {
    // stop the browser from reloading the page
    e.preventDefault();

    try {
      // send the project information to the Express server as JSON
      const response = await fetch("http://localhost:9000/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          status,
          project_lead_id,
        }),
      });

      // change the server response from JSON into a JavaScript object
      const data = await response.json();

      // show the message returned by the server
      setMessage(data.message);
    } catch (error) {
      // show an error message if the server cannot be reached
      setMessage("Could not connect to the server");
    }
  };

  return (
    <div>
      <h2>Create Project</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="Planning">Planning</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={project_lead_id}
          onChange={(e) => setProjectLeadId(e.target.value)}
        >
          <option value="">Select Project Lead</option>

          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.username}
            </option>
          ))}
        </select>

        <button type="submit">Create Project</button>
      </form>

      {/* show the message only when there is one */}
      {message && <p>{message}</p>}
    </div>
  );
}

export default CreateProject;