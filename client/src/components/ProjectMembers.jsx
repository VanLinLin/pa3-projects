import { useEffect, useState } from "react";

function ProjectMembers() {
  // stores all projects returned by the server
  const [projects, setProjects] = useState([]);

  // stores all registered users
  const [users, setUsers] = useState([]);

  // stores the selected project
  const [projectId, setProjectId] = useState("");

  // stores the selected user to add
  const [userId, setUserId] = useState("");

  // stores the user ids of the current project members
  const [memberIds, setMemberIds] = useState([]);

  // stores the message returned by the server
  const [message, setMessage] = useState("");

  // get all projects and users when the component first loads
  useEffect(() => {
    const getData = async () => {
      try {
        // get the projects and users from the Express server
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
          setMessage("Could not load projects or users");
        }
      } catch (error) {
        // show an error message if the server cannot be reached
        setMessage("Could not connect to the server");
      }
    };

    getData();
  }, []);

  // get the members whenever a different project is selected
  useEffect(() => {
    const getMembers = async () => {
      if (!projectId) {
        setMemberIds([]);
        return;
      }

      try {
        // get all members of the selected project
        const response = await fetch(
          `http://localhost:9000/api/projects/${projectId}/members`
        );

        const data = await response.json();

        if (response.ok) {
          setMemberIds(data);
        } else {
          setMessage(data.message);
        }
      } catch (error) {
        // show an error message if the server cannot be reached
        setMessage("Could not connect to the server");
      }
    };

    getMembers();
  }, [projectId]);

  // add a user to the selected project
  const handleAddMember = async () => {
    if (!projectId || !userId) {
      setMessage("Please select a project and a user");
      return;
    }

    try {
      // send the selected user id to the Express server
      const response = await fetch(
        `http://localhost:9000/api/projects/${projectId}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
          }),
        }
      );

      const data = await response.json();

      // show the message returned by the server
      setMessage(data.message);

      if (response.ok) {
        // get the updated member list after adding a member
        const memberResponse = await fetch(
          `http://localhost:9000/api/projects/${projectId}/members`
        );

        const memberData = await memberResponse.json();

        if (memberResponse.ok) {
          setMemberIds(memberData);
        }
      }
    } catch (error) {
      // show an error message if the server cannot be reached
      setMessage("Could not connect to the server");
    }
  };

  // remove a user from the selected project
  const handleRemoveMember = async (removeUserId) => {
    try {
      // remove the selected user from the project
      const response = await fetch(
        `http://localhost:9000/api/projects/${projectId}/members/${removeUserId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      // show the message returned by the server
      setMessage(data.message);

      if (response.ok) {
        // get the updated member list after removing a member
        const memberResponse = await fetch(
          `http://localhost:9000/api/projects/${projectId}/members`
        );

        const memberData = await memberResponse.json();

        if (memberResponse.ok) {
          setMemberIds(memberData);
        }
      }
    } catch (error) {
      // show an error message if the server cannot be reached
      setMessage("Could not connect to the server");
    }
  };

  // find the currently selected project
  const project = projects.find((p) => p._id === projectId);

  return (
    <div>
      <h2>Manage Memberships</h2>

      <select
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
      >
        <option value="">Select Project</option>

        {projects.map((project) => (
          <option key={project._id} value={project._id}>
            {project.name}
          </option>
        ))}
      </select>

      {projectId && (
        <div>
          <h3>Members</h3>

          {memberIds.map((memberId) => {
            // find the user that matches this member id
            const user = users.find((u) => u._id === memberId);

            if (!user) {
              return null;
            }

            // check whether this user is the Project Lead
            const isLead =
              user._id === project?.project_lead_id;

            return (
              <div key={user._id}>
                <span>
                  {user.username}
                  {isLead && " (Project Lead)"}
                </span>

                {!isLead && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(user._id)}
                  >
                    Remove
                  </button>
                )}
              </div>
            );
          })}

          <h3>Add Member</h3>

          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          >
            <option value="">Select User</option>

            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.username}
              </option>
            ))}
          </select>

          <button type="button" onClick={handleAddMember}>
            Add Member
          </button>
        </div>
      )}

      {/* show the message only when there is one */}
      {message && <p>{message}</p>}
    </div>
  );
}

export default ProjectMembers;