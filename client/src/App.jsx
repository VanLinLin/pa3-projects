import Signup from "./components/Signup";
import Login from "./components/Login";
import CreateProject from "./components/CreateProject";
import ProjectList from "./components/ProjectList";

// App puts all interfaces on the same page
function App() {
  return (
    <div>
      <Signup />
      <Login />
      <CreateProject />
      <ProjectList />
    </div>
  );
}

export default App;