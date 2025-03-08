import { useContext, useEffect, useState } from "react";
import { UserContext } from '../../contexts/UserContext';
import * as careerService from "../../services/careerService"
import * as jobKeywordService from "../../services/jobKeywordService"
import { useNavigate } from "react-router";

const CareerResults = () => {
    const { user } = useContext(UserContext);
    const [response, setResponse] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRoleIndex, setSelectedRoleIndex] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
      const fetchUserStatus = async () => {
        try {
            setIsLoading(true);

          if (user && user._id) {
            const data = await careerService.show(user._id);
            // console.log("Fetched values results:", data);

            if (!data) {
                setResponse(null);
              } else {
                setResponse(data); 
              }
          } else {
            throw new Error("User not logged in or invalid user ID");
          }

        } catch (error) {
          console.error("Error fetching user-specific values:", error.message);
          setResponse(null);
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserStatus();
    }, [user]);

    const handleFindJobs = async () => {
        try {
            if (selectedRoleIndex === null) {
                return;
            };

            const selectedCareer = response["Possible career paths"][selectedRoleIndex];
            const careerPath = selectedCareer["Career path"];
            const whyItFits = selectedCareer["Why it fits"];

            const result = await jobKeywordService.create({
                userId: user._id,
                careerPath: careerPath,
                whyItFits: whyItFits
            });

            if (!result || result.error) {
                throw new Error(result?.error || "Unexpected error");
            }

            if (result.responseId) {
                localStorage.setItem("latestResponseId:", result.responseId)
            }
                navigate(`/jobs/results/${result.responseId}`);
        } catch (error) {
            console.error("Error saving career path:", error);
        }
    }

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <p>Loading your results...</p>
        </div>
      );
    }

    if (!response) {
      return (
        <div className="p-4">
          <p>No results found. Please complete the assessment first.</p>
        </div>
      );
    }

    if (typeof response !== "object") {
        console.error("Unexpected response format:", response);
      }

    const handleSelection = (index) => {
        setSelectedRoleIndex(index);
    };

  
    return (
        <div className="p-6 bg-white shadow-md rounded-md">
            <h2 className="text-2xl md:text-3xl text-[#D6A36A] font-normal font-[DM_Sans] mb-8">Your Career Insights</h2>
            
            {response["Summary"] && (
                <div className="text-base md:text-lg font-normal font-[DM_Sans] mb-8 text-[#586E75]">
                    <h3 className="font-semibold">Summary:</h3>
                    <p>{response["Summary"]}</p>
                </div>
            )}

            {response["Possible career paths"] && (
                <div className="flex flex-col font-[DM_Sans] text-[#586E75]">
                    <h2 className="text-lg font-semibold mb-4">Select a job role below to see matching jobs:</h2>
                    <div className="flex flex-col space-y-2">
                        {response["Possible career paths"].map((path, index) => (
                            <label key={index} className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                            <input
                                type="radio"
                                name="jobRole"
                                value={index}
                                checked={selectedRoleIndex === index}
                                onChange={() => handleSelection(index)}
                                className="mt-0.5 h-5 w-5"
                            />
                                <div className="ml-3 text-[#586E75] text-base">
                                    <p>{path["Career path"]}</p>
                                    <p>{path["Why it fits"]}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            )}

        <div className="flex justify-between">
        <button
        type="button" 
        onClick={() => navigate("/career")}
        className="mt-6 px-6 py-3 bg-[#D6A36A] text-white font-medium rounded-lg hover:bg-[#e69c23] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f9a825] focus:ring-offset-2 cursor-pointer"        
        >
            Redo Questionnaire
        </button>
        
        <button
        type="button"
        onClick={handleFindJobs}
        disabled={selectedRoleIndex === null}
        className="mt-6 px-6 py-3 bg-[#D6A36A] text-white font-medium rounded-lg hover:bg-[#e69c23] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f9a825] focus:ring-offset-2 cursor-pointer"        
        >
            Next: Match Jobs
        </button>
        
        </div>

        </div>
    )
};

export default CareerResults;