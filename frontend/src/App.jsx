import { UserContext } from './contexts/UserContext';
import NavBar from "./components/NavBar/NavBar";
import Landing from "./components/Landing/Landing";
import { useContext, useState } from 'react';
import SignUpForm from './components/SignUpForm/SignUpForm';
import SignInForm from './components/SignInForm/SignInForm';
import Homepage from './components/Homepage/Homepage';
import { Navigate, Route, Routes } from 'react-router';
import ValuesForm from './components/ValuesForm/ValuesForm';
import ValuesResults from './components/ValuesResults/ValuesResults';
import CareerForm from './components/CareerForm/CareerForm';
import CareerResults from './components/CareerResults/CareerResults';

function App() {
  const { user } = useContext(UserContext);
  const [topValues, setTopValues] = useState([]);
  const [topStrengths, setTopStrengths] = useState([]);


return (
  <div className="min-h-screen flex flex-col bg-white">
  <NavBar />
  <div className="flex-grow">
  <Routes>    
    {/* Routes available to all users */}
    <Route path='/' element={ !user ? <Landing /> : <Navigate to="/home" />} />
    <Route path='/sign-up' element={!user ? <SignUpForm /> : <Navigate to="/values/new" />} />
    <Route path='/sign-in' element={!user ? <SignInForm /> : <Navigate to="/home" />} />
        
    {/* Protected routes - only available when logged in */}
    <Route path='/home' element={user ? <Homepage topValues={topValues} setTopValues={setTopValues} topStrengths={topStrengths} setTopStrengths={setTopStrengths} /> : <Navigate to="/" />} />
    <Route path="/values/new" element={user ? (<ValuesForm />) : <Navigate to="/" />} />
    <Route path="/values/results" element={user ? (<ValuesResults setTopValues={setTopValues} topValues={topValues} setTopStrengths={setTopStrengths} topStrengths={topStrengths} />) : <Navigate to="/" />} />
    <Route path="/career" element={user ? (<CareerForm />) : <Navigate to="/" />} />
    <Route path="/career/results" element={user ? (<CareerResults />) : <Navigate to="/" />} />


  </Routes>
  </div>
  </div>
  )
}

export default App
