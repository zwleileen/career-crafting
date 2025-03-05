import { UserContext } from './contexts/UserContext';
import NavBar from "./components/NavBar/NavBar";
import Landing from "./components/Landing/Landing";
// import ValuesForm from "./components/ValuesForm/ValuesForm";
// import ValuesResults from "./components/ValuesResults/ValuesResults";

function App() {
  const { user } = useContext(UserContext);

  
  return (
    <>
    <h1>Hello World</h1>
    </>
  )
}

export default App
