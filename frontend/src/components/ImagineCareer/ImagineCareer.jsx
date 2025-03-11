import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import * as jobKeywordService from "../../services/jobKeywordService"


const ImagineCareer = () => {
    const [responses, setResponses] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const { responseId } = useParams();
    const navigate = useNavigate();


    useEffect(() => {
      const fetchJobDetails = async () => {
        try {
            setIsLoading(true);

          if (!responseId) {
            console.error("No responseId");
            setResponses({});
            setIsLoading(false);
            return;
          }        
            const data = await jobKeywordService.show(responseId);
            console.log("Fetched data:", data);

            if (data) {
                setResponses({
                    jobTitle: data.jobTitle,
                    narrative: data.jobNarrative,
                    industry: data.industryKeywords,
                    skills: data.skillsKeywords,
                    typicalPath: data.typicalPath
                });  
            } else {
                setResponses({});  
            }

        } catch (error) {
          console.error("Error fetching job details:", error.message);
          setResponses({});
        } finally {
          setIsLoading(false);
        }
      };
      fetchJobDetails();
    }, [responseId]);

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
            <h2 className="text-2xl md:text-3xl text-[#D6A36A] font-normal font-[DM_Sans] mb-8">A day in the life of {responses.jobTitle}</h2>

            {responses.narrative && (
                <div className="mt-6">
                <p className="text-base font-normal text-[#586E75] mb-2">{responses.narrative}</p>
            </div>
            )}

            {responses.industry && responses.skills && (
                <div className="mt-6">
                <p className="text-base font-normal text-[#586E75] mb-2">Industries: {responses.industry}</p>
                <p className="text-base font-normal text-[#586E75] mb-2">Essential skills: {responses.skills}</p>
            </div>
            )}

            {responses.typicalPath && (
                <div className="mt-6">
                <p className="text-base font-normal text-[#586E75] mb-2">A typical path: {responses.typicalPath}</p>
            </div>
            )}

        <button 
        type="button" 
        onClick={() => navigate("/careerpath/results")}
        className="mt-6 px-6 py-3 bg-[#D6A36A] text-white font-medium rounded-lg hover:bg-[#e69c23] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f9a825] focus:ring-offset-2 cursor-pointer"        
        >
        Select another path
        </button>
        </div>

        <div className="p-6 bg-white shadow-md rounded-md flex flex-col items-center text-center">
        <p className="text-base font-[DM_Sans] text-[#D6A36A]">Upgrade your plan to find out how you can leverage on your skills and experiences to pursue desired career path and many more features!</p>
        <button
        type="button" 
        onClick={() => navigate("/plan/features")}
        className="max-w-fit mt-2 px-6 py-3 bg-[#D6A36A] text-white font-medium rounded-lg hover:bg-[#e69c23] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f9a825] focus:ring-offset-2 cursor-pointer"
        >
        See features
        </button>
        </div>


        </>
    )

}

export default ImagineCareer