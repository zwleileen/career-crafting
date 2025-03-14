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
import CareerResults from './components/CareerResults/CareerResults';
import ImagineCareer from './components/ImagineCareer/ImagineCareer';
import ImagineIdeal from './components/ImagineIdeal/ImagineIdeal';
import CareerPath from './components/CareerPath/CareerPath';
import PaidFeatures from './components/PaidFeatures/PaidFeatures';
import Payment from './components/Payment/Payment';
import FitCheck from './components/FitCheck/FitCheck';
import CareerForm from './components/CareerForm/CareerForm';
import IdealWorld from './components/IdealWorld/IdealWorld';
import VerifyEmail from './components/VerifyEmail/VerifyEmail';

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
    <Route path='/ideal/:responseId' element={<ImagineIdeal />}>
      <Route path='results' element={<IdealWorld />} />
    </Route> 
    <Route path='/sign-up' element={<SignUpForm />} />
    <Route path="/auth/verify-email" element={<VerifyEmail />} />
    <Route path='/sign-in' element={<SignInForm />} />
        
    {/* Protected routes - only available when logged in */}
    <Route path="/values/results/:responseId" element={<ValuesResults setTopValues={setTopValues} topValues={topValues} setTopStrengths={setTopStrengths} topStrengths={topStrengths} />} />
    <Route path='/careerpath' element={user ? <CareerPath /> : <Navigate to="/" />} />
    <Route path='/careerpath/results' element={user ? <CareerResults />: <Navigate to="/" />} />
    <Route path="/careerpath/results/:responseId" element={user ? (<ImagineCareer />) : <Navigate to="/" />} />
    <Route path='/plan/features' element={user ? <PaidFeatures />: <Navigate to="/" />} />
    <Route path='/upgrade' element={user? <Payment />: <Navigate to="/" />} />

    {/* Protected routes - only available when paid */}
    <Route path='/home' element={user && user.status === "paid" ? <Homepage topValues={topValues} setTopValues={setTopValues} topStrengths={topStrengths} setTopStrengths={setTopStrengths} /> : <Navigate to="/careerpath/results" />} />
    <Route path='/statuscheck' element={user && user.status === "paid" ? <CareerForm /> : <Navigate to="/careerpath/results" />} />
    <Route path='/fitcheck' element={user && user.status === "paid" ? <FitCheck /> : <Navigate to="/careerpath/results" />} />

  </Routes>
  </div>
  </div>
  )
}

export default App
