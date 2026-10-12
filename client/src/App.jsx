import Signup from "./components/Signup";
import Login from "./components/Login";
import CreateProject from "./components/CreateProject";

// App puts all forms on the same page
function App() {
  return (
    <div>
      <Signup />
      <Login />
      <CreateProject />
    </div>
  );
}

export default App;