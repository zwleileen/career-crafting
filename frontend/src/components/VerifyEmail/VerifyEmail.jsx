import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyEmail = () => {
  const [message, setMessage] = useState("Verifying your email...");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const verified = queryParams.get("verified");
    const responseId = queryParams.get("responseId");

    if (verified === "true") {
      setMessage("Email verified successfully! Redirecting to login...");
      setTimeout(() => navigate(`/sign-in?responseId=${responseId}`), 3000);
    } else {
      setMessage("Email verification failed. Please try again.");
      setTimeout(() => navigate(`/sign-up?responseId=${responseId}`), 5000);
    }
  }, [location, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg text-[#586E75]">{message}</p>
    </div>
  );
};

export default VerifyEmail;