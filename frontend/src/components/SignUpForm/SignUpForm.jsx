import { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { signUp } from '../../services/authService';
import { UserContext } from '../../contexts/UserContext';
import * as valuesService from "../../services/valuesService"
import * as imagineWorldService from "../../services/imagineWorldService"


const SignUpForm = () => {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        passwordConf: '',
        gender: '',
    });

    const { username, password, passwordConf, gender } = formData;
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const responseId = queryParams.get("responseId");

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);

    if (name === 'password' || name === 'passwordConf') {
        if (
          (name === 'password' && value !== updatedFormData.passwordConf && updatedFormData.passwordConf) || 
          (name === 'passwordConf' && value !== updatedFormData.password)
        ) {
          setMessage("Your passwords do not match.");
        } else {
          setMessage('');
        }
      }
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    try {
        const newUser = await signUp(formData);

        if (!newUser || !newUser._id) {
            throw new Error("User ID is missing from response");
        }

        setUser(newUser);
        console.log("Extracted responseId:", responseId);
      
        if (responseId) {
        await valuesService.update(responseId, newUser._id);
        await imagineWorldService.update(responseId, newUser._id);
    } else {
        console.warn("No responseId found, skipping update.");
    }

      navigate(`/home`);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const isFormInvalid = () => {
    return !(username && password && password === passwordConf);
  };

  return (
    <main className="min-h-screen flex flex-col bg-white">
    <div className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <h2 className="text-[#D6A36A] text-2xl md:text-3xl font-normal font-[DM_Sans] mb-8">
            Please sign up and create an account.
        </h2>
        <p className="text-[#D6A36A] text-xl md:text-2xl font-normal font-[DM_Sans] mb-8">
        {message}
        </p>
        <form onSubmit={handleSubmit}>
        <div className=" text-[#586E75] text-lg md:text-xl font-normal font-[DM_Sans] space-x-2 mb-5">
          <label htmlFor='username'>Username:</label>
          <input
            className="border-1 border-[#D6A36A] rounded-lg h-10 w-50 indent-2"
            type='text'
            id='name'
            value={username}
            name='username'
            onChange={handleChange}
            required
          />
        </div>
        <div className=" text-[#586E75] text-lg md:text-xl font-normal font-[DM_Sans] space-x-2 mb-5">
          <label htmlFor='password'>Password:</label>
          <input
            className="border-1 border-[#D6A36A] rounded-lg h-10 w-50 indent-2"
            type='password'
            id='password'
            value={password}
            name='password'
            onChange={handleChange}
            required
          />
        </div>
        <div className=" text-[#586E75] text-lg md:text-xl font-normal font-[DM_Sans] space-x-2 mb-10">
          <label htmlFor='confirm'>Confirm Password:</label>
          <input
            className="border-1 border-[#D6A36A] rounded-lg h-10 w-50 indent-2"
            type='password'
            id='confirm'
            value={passwordConf}
            name='passwordConf'
            onChange={handleChange}
            required
          />
        </div>
        <div className=" text-[#586E75] text-lg md:text-xl font-normal font-[DM_Sans] space-x-2 mb-5">
          <label htmlFor='gender'>Gender you identify with:</label>
            <select
                className="border-1 border-[#D6A36A] rounded-lg h-10 w-50 indent-2"
                id='gender'
                value={gender}
                name='gender'
                onChange={handleChange}
                required
            >
                <option value="" disabled>Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select>
        </div>

        <div className=" text-[#586E75] text-lg md:text-xl font-normal font-[DM_Sans] space-x-10">
          <button 
          type="submit"
          disabled={isFormInvalid()}
          className="px-6 py-3 bg-[#D6A36A] text-white font-medium rounded-lg hover:bg-[#e69c23] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f9a825] focus:ring-offset-2 cursor-pointer"        
          >
            Sign Up
        </button>
          <button 
          type="button"
          onClick={() => navigate(`/values/results/${responseId}`)}
          className="px-6 py-3 bg-[#D6A36A] text-white font-medium rounded-lg hover:bg-[#e69c23] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f9a825] focus:ring-offset-2 cursor-pointer"        
          >
            Cancel
        </button>
        </div>
        </form>
      </div>
    </main>
  );
};

export default SignUpForm;
