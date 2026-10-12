import Signup from "./components/Signup";
import Login from "./components/Login";

// App puts the Signup form and the Login form on the same page
function App() {
  return (
    <div>
      <Signup />
      <Login />
    </div>
  );
}

export default App;