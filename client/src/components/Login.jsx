import { useState } from "react";

function Login() {
  // one state variable for each input box
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // stores the message returned by the server
  const [message, setMessage] = useState("");

  // runs when the Login button is clicked
  const handleSubmit = async (e) => {
    // stop the browser from reloading the page
    e.preventDefault();

    try {
      // send the username and password to the Express server as JSON
      await fetch("http://localhost:9000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })
        // change the server response from JSON into a JavaScript object
        .then((response) => response.json())
        // show the message returned by the server
        .then((data) => {
          setMessage(data.message);
        });
    } catch (error) {
      // show an error message if the server cannot be reached
      setMessage("Could not connect to the server");
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>

      {/* show the message only when there is one */}
      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;