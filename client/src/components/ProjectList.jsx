import { useEffect, useState } from "react";

function ProjectList() {
  // stores all projects returned by the server
  const [projects, setProjects] = useState([]);

  // stores all registered users
  const [users, setUsers] = useState([]);

  // stores an error message if the data cannot be loaded
  const [message, setMessage] = useState("");

  // get all projects and users when the component first loads
  useEffect(() => {
    const getData = async () => {
      try {
        // get the projects and users from the Express server at the same time
        const [projectResponse, userResponse] = await Promise.all([
          fetch("http://localhost:9000/api/projects"),
          fetch("http://localhost:9000/api/users"),
        ]);

        // change both server responses into JavaScript objects
        const projectData = await projectResponse.json();
        const userData = await userResponse.json();

        if (projectResponse.ok && userResponse.ok) {
          setProjects(projectData);
          setUsers(userData);
        } else {
          setMessage("Could not load projects");
        }
      } catch (error) {
        // show an error message if the server cannot be reached
        setMessage("Could not connect to the server");
      }
    };

    getData();
  }, []);

  return (
    <div>
      <h2>Projects</h2>

      {projects.map((project) => {
        // find the user who is the Project Lead
        const lead = users.find(
          (u) => u._id === project.project_lead_id
        );

        return (
          <div key={project._id}>
            <h3>{project.name}</h3>

            <p>Description: {project.description}</p>

            <p>Status: {project.status}</p>

            <p>
              Project Lead: {lead ? lead.username : "Unknown"}
            </p>
          </div>
        );
      })}

      {/* show the message only when there is one */}
      {message && <p>{message}</p>}
    </div>
  );
}

export default ProjectList;