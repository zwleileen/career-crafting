import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import * as jobKeywordService from "../../services/jobKeywordService"
import { UserContext } from "../../contexts/UserContext";


const ImagineCareer = () => {
    const { user } = useContext(UserContext);
    const [responses, setResponses] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const { responseId } = useParams();
    const navigate = useNavigate();
    const [searches, setSearches] = useState([]);

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
                    industry: data.industryKeywords.join(', '),
                    skills: data.skillsKeywords.join(', '),
                    typicalPath: data.typicalPath
                });  
            } else {
                setResponses({});  
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
          console.error("Error fetching job details:", error.message);
          setResponses({});
        } finally {
          setIsLoading(false);
        }
      };
      fetchJobDetails();
    }, [responseId, user._id]);

    const handleDelete = async (deleteId) => {
      try {
        await jobKeywordService.deleteById(deleteId)
        navigate(`/careerpath/results/${responseId}`)
      } catch (error) {
        console.error('Error deleting item:', error)
      }
    }

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64 text-base md:text-lg font-[DM_Sans] text-[#586E75]">
          <p>Loading your results...</p>
        </div>
      );
    }
  
    return (
      <>
      <div className="flex">
      <div className="w-4/5 p-6 bg-white shadow-md rounded-md flex flex-col">
            <h2 className="text-2xl md:text-3xl text-[#D6A36A] font-normal font-[DM_Sans] mb-6">A day in the life of {responses.jobTitle}</h2>

            {responses.narrative && (
                <p className="text-base font-normal text-[#586E75] mb-4">{responses.narrative}</p>
            )}

            {responses.industry && responses.skills && (
                <div className="mb-2">
                <p className="text-base font-normal text-[#586E75] mb-4">
                  <span className="font-semibold">Industries: </span>
                  <br/>{responses.industry}
                </p>
                <p className="text-base font-normal text-[#586E75] mb-4">
                  <span className="font-semibold">Essential skills: </span>
                  <br/>{responses.skills}
                </p>
            </div>
            )}

            {responses.typicalPath && (
                <p className="text-base font-normal text-[#586E75] mb-2">
                  <span className="font-semibold">A typical path: </span>
                  <br/>{responses.typicalPath}
                </p>
            )}

        <button 
        type="button" 
        onClick={() => navigate("/careerpath/results")}
        className="max-w-fit mt-6 px-6 py-3 bg-[#D6A36A] text-white font-medium rounded-lg hover:bg-[#e69c23] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f9a825] focus:ring-offset-2 cursor-pointer"        
        >
        Select another path
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
                  onClick={() => handleDelete(job.responseId)}
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

      <div className="p-6 bg-white shadow-md rounded-md flex flex-col items-center text-center">
        <p className="text-base font-[DM_Sans] text-[#D6A36A] place-items-end">Upgrade your plan to find out how you can leverage on your skills and experiences to pursue desired career path and many more features!</p>
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