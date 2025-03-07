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
    {/* Routes available to users before sign-up */}
    <Route path='/' element={<Landing />} />
    <Route path="/values/new" element={<ValuesForm />} />
    <Route path="/values/results/:responseId" element={<ValuesResults setTopValues={setTopValues} topValues={topValues} setTopStrengths={setTopStrengths} topStrengths={topStrengths} />} />
    <Route path='/sign-up' element={<SignUpForm />} />
    <Route path='/sign-in' element={<SignInForm />} />
        
    {/* Protected routes - only available when logged in */}
    <Route path='/home' element={user ? <Homepage topValues={topValues} setTopValues={setTopValues} topStrengths={topStrengths} setTopStrengths={setTopStrengths} /> : <Navigate to="/" />} />
    <Route path="/career" element={user ? (<CareerForm />) : <Navigate to="/" />} />
    <Route path="/career/results" element={user ? (<CareerResults />) : <Navigate to="/" />} />
    
    {/* Protected routes - only available when paid */}


  </Routes>
  </div>
  </div>
  )
}

export default App
