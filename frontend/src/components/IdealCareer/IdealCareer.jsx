import { useContext, useEffect, useState } from "react";
import * as imagineWorldService from "../../services/imagineWorldService"
import { useNavigate } from "react-router";
import { UserContext } from "../../contexts/UserContext";


const IdealCareer = ({responseId, refreshKey}) => {
    const [image, setImage] = useState(null);
    const [summary, setSummary] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    useEffect(() => {
        const fetchImage = async () => {
        try {
            setIsLoading(true);

                if (!responseId) {
                    console.error("No responseId");
                    setImage(null);
                    setSummary({});
                    setIsLoading(false);
                    return;
                }

            const dataImage = await imagineWorldService.generateImages(responseId);
            console.log("Fetched new image:", dataImage.image);

                if (dataImage) {
                    setImage(dataImage.image);  
                } else {
                    setImage(null);  
                }
            const dataSummary = await imagineWorldService.show(responseId);
                
                if (dataSummary) {
                    setSummary(dataSummary.summary);
                } else {
                    setSummary({});
                }


        } catch (error) {
          console.error("Error fetching image:", error.message);
          setImage(null);
          setSummary({});
        } finally {
          setIsLoading(false);
        }
      };
      fetchImage();
    }, [responseId, refreshKey]);

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64 text-base md:text-lg font-[DM_Sans] text-[#586E75]">
          <p>Loading your results...</p>
        </div>
      );
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
                    alt="A day in the job scene" 
                    className="w-full max-w-lg h-auto rounded-lg shadow-lg object-cover mx-auto"
                />
            </div>
            )}
        </div>
        
        {!user && responseId && (
        <div className="p-6 bg-white shadow-md rounded-md flex flex-col">
        <p className="text-base font-[DM_Sans] text-[#D6A36A]">Sign up to save your results and explore more features for free</p>
        <button
        type="button" 
        onClick={() => navigate(`/sign-up?search=${responseId}`)}
        className="max-w-fit mt-2 px-6 py-3 bg-[#D6A36A] text-white font-medium rounded-lg hover:bg-[#e69c23] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f9a825] focus:ring-offset-2 cursor-pointer"
        >
        Sign Up
        </button>
        </div>
        )}

        </>
    )

}

export default IdealCareer