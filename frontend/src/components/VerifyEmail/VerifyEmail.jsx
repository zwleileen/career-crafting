import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyEmail = () => {
  const [message, setMessage] = useState("Verifying your email...");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyEmail = async () => {
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get("token");

      if (!token) {
        setMessage("Invalid verification link.");
        return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACK_END_SERVER_URL}/auth/verify-email?token=${token}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.err || "Verification failed.");
        }

        setMessage("Email verified successfully! Redirecting to login...");
        setTimeout(() => navigate("/sign-in"), 3000);
      } catch (error) {
        setMessage(error.message);
      }
    };

    verifyEmail();
  }, [location, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg text-[#586E75]">{message}</p>
    </div>
  );
};

export default VerifyEmail;