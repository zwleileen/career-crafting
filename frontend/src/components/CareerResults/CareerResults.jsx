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
    const [searches, setSearches] = useState([]);


    useEffect(() => {
      const fetchCareerPaths = async () => {
        try {
            setIsLoading(true);

          if (user && user._id) {
            const data = await careerService.show(user._id);
            // console.log("Fetched values results:", data);

            if (!data) {
                setResponse(null);
              } else {
                setResponse(data.careerPaths); 
              }
          } else {
            throw new Error("User not logged in or invalid user ID");
          }

          const pathsSearched = await jobKeywordService.showUserId(user._id);
          console.log(pathsSearched);
          if (!pathsSearched) {
            setSearches([]);
          } else {
            const filteredData = pathsSearched.map(item => ({
              role: item.jobTitle,
              responseId: item._id
            }))
            setSearches(filteredData)
          }

        } catch (error) {
          console.error("Error fetching career paths:", error.message);
          setResponse(null);
        } finally {
          setIsLoading(false);
        }
      };

      fetchCareerPaths();
    }, [user]);

    const handleDiscoverPath = async () => {
        try {
            if (selectedRoleIndex === null) {
                return;
            };

            const selectedCareer = response["Possible career paths"][selectedRoleIndex];
            const careerPath = selectedCareer["Career path"];
            const whyItFits = selectedCareer["Why it fits"];
            const narrative = selectedCareer["Narrative"];

            const result = await jobKeywordService.create({
                userId: user._id,
                careerPath: careerPath,
                whyItFits: whyItFits,
                narrative: narrative
            });

            if (!result || result.error) {
                throw new Error(result?.error || "Unexpected error");
            }

            if (result.responseId) {
                localStorage.setItem("latestResponseId:", result.responseId)
            }
                navigate(`/careerpath/results/${result.responseId}`);
        } catch (error) {
            console.error("Error saving career path:", error);
        }
    }

    const handleDelete = async (responseId) => {
      try {
        await jobKeywordService.deleteById(responseId)
      } catch (error) {
        console.error('Error deleting item:', error)
      }
    }
 
    //     const handleImagineCareer = async () => {
    //     try {
    //         if (selectedRoleIndex === null) {
    //             return;
    //         };

    //         const selectedCareer = response["Possible career paths"][selectedRoleIndex];
    //         const careerPath = selectedCareer["Career path"];
    //         const whyItFits = selectedCareer["Why it fits"];
    //         const narrative = selectedCareer["Narrative"];


    //         const result = await imagineService.create({
    //             userId: user._id,
    //             careerPath: careerPath,
    //             whyItFits: whyItFits,
    //             narrative: narrative
    //         });

    //         if (!result || result.error) {
    //             throw new Error(result?.error || "Unexpected error");
    //         }

    //         if (result.responseId) {
    //             localStorage.setItem("latestResponseId:", result.responseId)
    //         }
    //             navigate(`/career/imagine/${result.responseId}`);
    //     } catch (error) {
    //         console.error("Error saving career path:", error);
    //     }
    // }

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
      <div className="flex">
        <div className="w-4/5 p-6 bg-white shadow-md rounded-md">
            <h2 className="text-2xl md:text-3xl text-[#D6A36A] font-normal font-[DM_Sans] mb-8">Your Ideal Career Paths</h2>
            
            {response["Summary"] && (
                <div className="font-[DM_Sans] mb-8 text-[#586E75]">
                    <h3 className="font-semibold text-lg mb-4">Summary:</h3>
                    <p className="text-base">{response["Summary"]}</p>
                </div>
            )}

            {response["Possible career paths"] && (
                <div className="flex flex-col font-[DM_Sans] text-[#586E75]">
                    <h2 className="text-lg font-semibold mb-4">Select a career path below to find out what skills are needed:</h2>
                    <div className="flex flex-col space-y-2">
                        {response["Possible career paths"].map((path, index) => (
                            <label key={index} className="flex items-start p-3 text-base border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                            <input
                                type="radio"
                                name="jobRole"
                                value={index}
                                checked={selectedRoleIndex === index}
                                onChange={() => handleSelection(index)}
                                className="mt-0.5 h-5 w-5"
                            />
                                <div className="ml-3 text-[#586E75] text-base">
                                    <p className="font-semibold">{path["Career path"]}</p>
                                    <p>{path["Why it fits"]}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            )}

        <button
        type="button"
        onClick={handleDiscoverPath}
        disabled={selectedRoleIndex === null}
        className="mt-6 px-6 py-3 bg-[#D6A36A] text-white font-medium rounded-lg hover:bg-[#e69c23] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f9a825] focus:ring-offset-2 cursor-pointer"        
        >
            Let's Find Out
        </button>
        </div>

        <div className="w-1/5 p-6 bg-white shadow-md rounded-md flex flex-col">
            <p className="font-[DM_Sans] mb-8 text-[#D6A36A] text-lg">List of career paths explored</p>
            <div className="space-y-4">
              {searches.length > 0 ? (
                searches.map((job, index) => (
                <div 
                  key={index} 
                  className="flex flex-col justify-between h-35 w-35 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={()=>navigate(`/careerpath/results/${job.responseId}`)}
                  >
                  <h3 className="text-base font-semibold text-[#586E75]">{job.role}</h3>
                  {/* <p className="text-base text-[#586E75]">{job.Detail}</p> */}
                  <span 
                  onClick={handleDelete(job.responseId)}
                  className="material-symbols-outlined cursor-pointer"
                  >
                    delete
                  </span>
                </div>
          ))
        ) : (
          <p className="text-gray-500">None so far...</p>
        )}
      </div>
        </div>
    </div>
    )
};

export default CareerResults;