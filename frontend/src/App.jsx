import { UserContext } from './contexts/UserContext';
import NavBar from "./components/NavBar/NavBar";
import Landing from "./components/Landing/Landing";
import { useContext } from 'react';
import SignUpForm from './components/SignUpForm/SignUpForm';
import SignInForm from './components/SignInForm/SignInForm';
import Homepage from './components/Homepage/Homepage';
import { Navigate, Route, Routes } from 'react-router';
// import ValuesForm from "./components/ValuesForm/ValuesForm";
// import ValuesResults from "./components/ValuesResults/ValuesResults";

function App() {
  const { user } = useContext(UserContext);

  
return (
  <>
  {user ? <NavBar /> : ""}
  <Routes>
    {/* Routes available to all users */}
    <Route path='/' element={!user ? <Landing /> : <Navigate to="/home" />} />
    <Route path='/sign-up' element={!user ? <SignUpForm /> : <Navigate to="/home" />} />
    <Route path='/sign-in' element={!user ? <SignInForm /> : <Navigate to="/home" />} />
        
    {/* Protected routes - only available when logged in */}
    <Route path='/home' element={user ? <Homepage /> : <Navigate to="/" />} />
        
    {/* Fallback route for any other paths */}
    <Route path="*" element={<Navigate to={user ? "/home" : "/"} />} />
  </Routes>
  </>
  )
}

export default App
