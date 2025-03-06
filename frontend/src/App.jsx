import { UserContext } from './contexts/UserContext';
import NavBar from "./components/NavBar/NavBar";
import Landing from "./components/Landing/Landing";
import { useContext, useEffect, useState } from 'react';
import SignUpForm from './components/SignUpForm/SignUpForm';
import SignInForm from './components/SignInForm/SignInForm';
import Homepage from './components/Homepage/Homepage';
import { Navigate, Route, Routes } from 'react-router';
import ValuesForm from './components/ValuesForm/ValuesForm';
import ValuesResults from './components/ValuesResults/ValuesResults';
// import ValuesForm from "./components/ValuesForm/ValuesForm";
// import ValuesResults from "./components/ValuesResults/ValuesResults";

function App() {
  const { user } = useContext(UserContext);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    if(isNewUser) setIsNewUser(false);
  }, [isNewUser]);

return (
  <div className="min-h-screen flex flex-col bg-white">
  { user ? <NavBar /> : ''}
  <div className="flex-grow">
  <Routes>
    {/* Route for new user after sign up */}
    <Route path="/values/new" element={user ? (<ValuesForm />) : <Navigate to="/" />} />
    
    {/* Routes available to all users */}
    <Route path='/' element={ !user ? <Landing /> : ( isNewUser ? 
      <Navigate to="/values/new" /> :
      <Navigate to="/home" />
    )} />
    <Route path='/sign-up' element={!user ? <SignUpForm /> : <Navigate to="/home" />} />
    <Route path='/sign-in' element={!user ? <SignInForm /> : <Navigate to="/home" />} />
        
    {/* Protected routes - only available when logged in */}
    <Route path='/home' element={user ? <Homepage /> : <Navigate to="/" />} />
    <Route path="/values/results" element={user ? (<ValuesResults />) : <Navigate to="/" />} />
        
    {/* Fallback route for any other paths */}
    <Route path="*" element={<Navigate to={user ? "/home" : "/"} />} />
  </Routes>
  </div>
  </div>
  )
}

export default App
