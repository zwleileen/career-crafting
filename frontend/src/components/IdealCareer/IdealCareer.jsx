import { useEffect, useState } from "react";
import * as imagineWorldService from "../../services/imagineWorldService"


const IdealCareer = ({responseId}) => {
    const [responses, setResponses] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const fetchImage = async () => {
        try {
            setIsLoading(true);

          if (!responseId) {
            console.error("No responseId");
            setResponses(null);
            setIsLoading(false);
            return;
          }

        const existingData = await imagineWorldService.show(responseId);

            if (existingData) {
                setResponses(existingData.image)
            } else {
            console.log("No existing image found, generating new image...");
        
            const data = await imagineWorldService.generateImages(responseId);
            console.log("Fetched new image:", data.image);

                if (data) {
                    setResponses(data.image);  
                } else {
                    setResponses(null);  
                }
            }

        } catch (error) {
          console.error("Error fetching image:", error.message);
          setResponses(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchImage();
    }, [responseId]);

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64 text-base md:text-lg font-[DM_Sans] text-[#586E75]">
          <p>Loading your results...</p>
        </div>
      );
    }
  
    return (
        <div className="p-6 bg-white shadow-md rounded-md flex flex-col items-center text-center">
            <h2 className="text-2xl md:text-3xl text-[#D6A36A] font-normal font-[DM_Sans] mb-8">A day in the life of...</h2>
            <p className="text-lg mb-6 font-[DM_Sans] text-[#586E75] max-w-2xl">Narrative</p>

            {responses && (
                <div className="mt-6">
                <h3 className="text-lg font-semibold text-[#586E75] mb-2">A morning in the job</h3>
                <img 
                    src={responses} 
                    alt="A day in the job scene" 
                    className="w-full max-w-lg h-auto rounded-lg shadow-lg object-cover mx-auto"
                />
            </div>
            )}

        </div>
    )

}

export default IdealCareer