import { useState, useContext } from 'react';
import { useNavigate } from 'react-router';
import { signIn } from '../../services/authService';
import { UserContext } from '../../contexts/UserContext';

const Payment = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    cardNumber: '',
    CVV: '',
    expiryDate : '',
  });

  const handleChange = (evt) => {
    setMessage('');
    setFormData({ ...formData, [evt.target.name]: evt.target.value });
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    try {
      const paidUser = await payment(formData);
      paidUser.status = "paid";
      navigate('/home');
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-white">
    <div className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <h2 className="text-[#D6A36A] text-2xl md:text-3xl font-normal font-[DM_Sans] mb-8">
            Please fill in your credit card details.
        </h2>
        <p className="text-[#D6A36A] text-xl md:text-2xl font-normal font-[DM_Sans] mb-8">
        {message}
        </p>
      <form autoComplete='off' onSubmit={handleSubmit}>
        <div className=" text-[#586E75] text-lg md:text-xl font-normal font-[DM_Sans] space-x-2 mb-5">
          <label htmlFor='name'>Name on credit card:</label>
          <input
            className="border-1 border-[#D6A36A] rounded-lg h-10 w-60 indent-2"
            type='text'
            autoComplete='off'
            id='name'
            value={formData.name}
            name='name'
            onChange={handleChange}
            required
          />
        </div>
        <div className=" text-[#586E75] text-lg md:text-xl font-normal font-[DM_Sans] space-x-2 mb-5">
          <label htmlFor='number'>Credit card number:</label>
          <input
            className="border-1 border-[#D6A36A] rounded-lg h-10 w-60 indent-2"
            type='text'
            autoComplete='off'
            id='cardNumber'
            value={formData.cardNumber}
            name='cardNumber'
            onChange={handleChange}
            required
          />
        </div>
        <div className=" text-[#586E75] text-lg md:text-xl font-normal font-[DM_Sans] space-x-2 mb-5">
          <label htmlFor='number'>CVV:</label>
          <input
            className="border-1 border-[#D6A36A] rounded-lg h-10 w-20 indent-2"
            type='text'
            autoComplete='off'
            id='CVV'
            value={formData.CVV}
            name='CVV'
            onChange={handleChange}
            required
          />
        </div>
        <div className=" text-[#586E75] text-lg md:text-xl font-normal font-[DM_Sans] space-x-2 mb-10">
          <label htmlFor='number'>Expiry date:</label>
          <input
            className="border-1 border-[#D6A36A] rounded-lg h-10 w-40 indent-2"
            type='date'
            autoComplete='off'
            id='expiryDate'
            value={formData.expiryDate}
            name='expiryDate'
            onChange={handleChange}
            required
          />
        </div>
        <div className=" text-[#586E75] text-lg md:text-xl font-normal font-[DM_Sans] space-x-10">
        <button
        type="submit"
        className="px-6 py-3 bg-[#D6A36A] text-white font-medium rounded-lg hover:bg-[#e69c23] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f9a825] focus:ring-offset-2 cursor-pointer"        
        >
            Confirm payment
        </button>
        <button 
        type="button"
        onClick={() => navigate('/careerpath/results')}
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

export default Payment;
