import { useEffect, useState } from "react";
import { useParams } from "react-router";
import * as imagineService from "../../services/imagineService"


const ImagineCareer = () => {
    const [responses, setResponses] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const { responseId } = useParams();


    useEffect(() => {
      const fetchImages = async () => {
        try {
            setIsLoading(true);

          if (!responseId) {
            console.error("No responseId");
            setResponses({});
            setIsLoading(false);
            return;
          }

        const existingData = await imagineService.show(responseId);

        if (existingData.images.morningInJob.url && existingData.images.afternoonInJob.url && existingData.images.impact.url) {
            setResponses({
                jobTitle: existingData.jobTitle,
                narrative: existingData.narrative,
                images: existingData.images,
            })
        } else {
            console.log("No existing images found, generating new images...")
        
            const data = await imagineService.generateImages(responseId);
            console.log("Fetched new images:", data);

            if (data) {
                setResponses({
                    jobTitle: data.jobTitle,
                    narrative: data.narrative,
                    images: data.images
                });  
            } else {
                setResponses({});  
            }
        }

        } catch (error) {
          console.error("Error fetching matched jobs:", error.message);
          setResponses({});
        } finally {
          setIsLoading(false);
        }
      };
      fetchImages();
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
            <h2 className="text-2xl md:text-3xl text-[#D6A36A] font-normal font-[DM_Sans] mb-8">A day in the life of {responses.jobTitle}</h2>
            <p className="text-lg mb-6 font-[DM_Sans] text-[#586E75] max-w-2xl">{responses.narrative}</p>

            {responses.images?.morningInJob && (
                <div className="mt-6">
                <h3 className="text-lg font-semibold text-[#586E75] mb-2">A morning in the job</h3>
                <p className="text-base font-normal text-[#586E75] mb-2">{responses.images.morningInJob.prompt}</p>
                <img 
                    src={responses.images.morningInJob.url} 
                    alt="A day in the job scene" 
                    className="w-full max-w-lg h-auto rounded-lg shadow-lg object-cover mx-auto"
                />
            </div>
            )}

            {responses.images?.afternoonInJob && (
                <div className="mt-6">
                <h3 className="text-lg font-semibold text-[#586E75] mb-2">An afternoon in the job</h3>
                <p className="text-base font-normal text-[#586E75] mb-2">{responses.images.afternoonInJob.prompt}</p>
                <img 
                    src={responses.images.afternoonInJob.url} 
                    alt="A day in the job scene" 
                    className="w-full max-w-lg h-auto rounded-lg shadow-lg object-cover mx-auto"
                />
            </div>
            )}

            {responses.images?.impact && (
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-[#586E75] mb-2">Impact at the end of day</h3>
                <p className="text-base font-normal text-[#586E75] mb-2">{responses.images.impact.prompt}</p>
                <img 
                    src={responses.images.impact.url} 
                    alt="Impact of the work scene" 
                    className="w-full max-w-lg h-auto rounded-lg shadow-lg object-cover mx-auto"
                />
            </div>
            )}

        </div>
    )

}

export default ImagineCareer