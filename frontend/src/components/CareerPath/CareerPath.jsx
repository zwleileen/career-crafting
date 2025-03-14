import { useContext, useEffect, useState } from "react";
import * as imagineWorldService from "../../services/imagineWorldService"
import * as careerService from "../../services/careerService"
import { useNavigate } from "react-router";
import { UserContext } from "../../contexts/UserContext";


const CareerPath = () => {
    const [summary, setSummary] = useState({});
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { user, imagineId } = useContext(UserContext);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchIdealWorld = async () => {
        try {
            setIsLoading(true);

                if (!user) {
                    console.error("No responseId");
                    setSummary({});
                    setIsLoading(false);
                    return;
                }

            const storedData = await imagineWorldService.showUserId(user._id);
            console.log("Fetched data:", storedData);

            if (storedData && Array.isArray(storedData) && storedData.length > 0) {
                const userData = storedData[0];                 
                setSummary(userData.dallEPrompt?.summary || "");
            }

            const newImage = await imagineWorldService.generateImages(imagineId)
            if (newImage) {
              setImage(newImage.image);
            } else {
              setImage(null);
            }

        } catch (error) {
          console.error("Error fetching data:", error.message);
          setSummary({});
        } finally {
          setIsLoading(false);
        }
      };
      fetchIdealWorld();
    }, [user, imagineId]);

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64 text-base font-normal font-[DM_Sans] text-[#586E75]">
          <p>Loading your results...</p>
        </div>
      );
    }

    const handleCareerPaths = async (e) => {
        e.preventDefault();
        setProcessing(true);

        const requestBody = ({ userId: user._id});
        try {
            const response = await careerService.create(requestBody);
            console.log("generated careerpaths:",response);
            
            if (!response || response.error) {
                throw new Error(response?.error || "Unexpected error");
            }
            navigate("/careerpath/results")
        } catch (error) {
            console.error("Generate career paths error:", error.message);
        } finally {
          setProcessing(false);
        }
    }
  
    return (
        <>
        <div className="p-6 bg-white shadow-md rounded-md flex flex-col items-center text-center">
            <h2 className="text-2xl md:text-3xl text-[#D6A36A] font-normal font-[DM_Sans] mb-8">In an ideal world</h2>
            {summary && (
            <p className="text-lg mb-6 font-[DM_Sans] text-[#586E75] max-w-2xl">{summary}</p>
            )}

            {image && (
                <div className="mt-6">
                <img 
                    src={image} 
                    alt="Ideal world" 
                    className="w-full max-w-lg h-auto rounded-lg shadow-lg object-cover mx-auto"
                />
            </div>
            )}

        <button
        type="submit" 
        onClick={handleCareerPaths}
        className="max-w-fit mt-8 px-6 py-3 bg-[#D6A36A] text-white font-medium rounded-lg hover:bg-[#e69c23] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f9a825] focus:ring-offset-2 cursor-pointer"
        disabled={processing}
        >
        { processing ? "Processing..." : "Generate Career Paths" }
        </button>       
        </div>
    
        </>
    )

}

export default CareerPath