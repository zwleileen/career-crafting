import { useState, useContext } from 'react';
import { useNavigate } from 'react-router';
import { signIn } from '../../services/authService';
import { UserContext } from '../../contexts/UserContext';
import * as valuesService from "../../services/valuesService"
import * as imagineWorldService from "../../services/imagineWorldService"


const SignInForm = () => {
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const responseId = queryParams.get("responseId");

  const { setUser } = useContext(UserContext);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (evt) => {
    setMessage('');
    setFormData({ ...formData, [evt.target.name]: evt.target.value });
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    try {
      const signedInUser = await signIn(formData);
      setUser(signedInUser);

      console.log("Extracted responseId:", responseId);

      if (responseId) {
        await valuesService.update(responseId, signedInUser._id);
    } else {
        console.warn("No responseId found, skipping update.");
    }
        const referenceId = responseId
        if (referenceId) {
            await imagineWorldService.update(referenceId, signedInUser._id);
        } else {
            console.warn("No referenceId found, skipping update.");
        }

      navigate(`/plan/features/${responseId}`);
    } catch (err) {
      setMessage(err.message);
    }
  };
    
  

  return (
    <main className="min-h-screen flex flex-col bg-white">
    <div className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <h2 className="text-[#D6A36A] text-2xl md:text-3xl font-normal font-[DM_Sans] mb-8">
            Please sign in to your account.
        </h2>
      <form autoComplete='off' onSubmit={handleSubmit}>
        <div className=" text-[#586E75] text-lg md:text-xl font-normal font-[DM_Sans] space-x-2 mb-5">
          <label htmlFor='email'>Email:</label>
          <input
            className="border-1 border-[#D6A36A] rounded-lg h-10 w-50 indent-2"
            type='email'
            autoComplete='off'
            id='email'
            value={formData.email}
            name='email'
            onChange={handleChange}
            required
          />
        </div>
        <div className=" text-[#586E75] text-lg md:text-xl font-normal font-[DM_Sans] space-x-2 mb-10">
          <label htmlFor='password'>Password:</label>
          <input
            className="border-1 border-[#D6A36A] rounded-lg h-10 w-50 indent-2"
            type='password'
            autoComplete='off'
            id='password'
            value={formData.password}
            name='password'
            onChange={handleChange}
            required
          />
        </div>
        <div className=" text-[#586E75] text-lg md:text-xl font-normal font-[DM_Sans] space-x-10">
        <button
        type="submit"
        className="px-6 py-3 bg-[#D6A36A] text-white font-medium rounded-lg hover:bg-[#e69c23] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f9a825] focus:ring-offset-2 cursor-pointer"        
        >
            Sign In
        </button>
        <button 
        type="button"
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-[#D6A36A] text-white font-medium rounded-lg hover:bg-[#e69c23] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f9a825] focus:ring-offset-2 cursor-pointer"        
        >
            Cancel
        </button>
        </div>
        <p className="text-[#e69c23] text-sm mt-4">
          {message}
        </p>
      </form>
    </div>
    </main>
  );
};

export default SignInForm;
