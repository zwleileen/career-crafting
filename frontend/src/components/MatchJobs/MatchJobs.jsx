import { useEffect, useState } from "react";
import { UserContext } from '../../contexts/UserContext';
import * as matchJobService from "../../services/matchJobService"
import { useParams } from "react-router";

const MatchJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { responseId } = useParams();

    useEffect(() => {
      const fetchMatchedJobs = async () => {
        try {
            setIsLoading(true);

          if (!responseId) {
            console.error("No responseId");
            setJobs([]);
            setIsLoading(false);
            return;
          }

            const data = await matchJobService.show(responseId);
            console.log("Fetched values results:", data);

            if (Array.isArray(data) && data.length > 0) {
                setJobs(data);  
            } else {
                setJobs([]);  
            }

        } catch (error) {
          console.error("Error fetching matched jobs:", error.message);
          setJobs([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchMatchedJobs();
    }, [responseId]);

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64 text-base md:text-lg font-[DM_Sans] text-[#586E75]">
          <p>Loading your results...</p>
        </div>
      );
    }

    if (!jobs.length) {
      return (
        <p className="p-6 text-base md:text-lg font-normal font-[DM_Sans] mb-8 text-[#586E75]">
        No job matches found. Please choose another job role.
        </p>
      );
    }
  
    return (
        <div className="p-6 bg-white shadow-md rounded-md">
            <h2 className="text-2xl md:text-3xl text-[#D6A36A] font-normal font-[DM_Sans] mb-8">Job Listings</h2>
            
            <div className="flex flex-col space-y-2 font-[DM_Sans]">
                {jobs.map((job) => (
                    <div key={job.id} className="flex flex-col items-start p-3 text-[#586E75] border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">
                            {job.title} 
                        </h3>
                        <p className="text-lg mb-2 font-[DM_Sans] text-[#586E75]">{job.company?.display_name && `${job.company?.display_name}`}</p>
                        <p className="text-[#586E75] text-base mb-4">{job.description.substring(0, 500)}...</p>
                        <p className="text-[#586E75] text-base">Keywords matched: {job.matchedKeywords.join(', ')}</p>
                        <p className="text-[#586E75] text-base">Location: {job.location?.display_name || "N/A"}</p>
                        <a href={job.redirect_url} target="_blank" rel="noopener noreferrer" className="mt-2 text-[#D6A36A] font-sm hover:text-[#e69c23] cursor-pointer transition-colors">
                            View Job Details →
                        </a>
                    </div>
            ))}
            </div>
        </div>
    )
};

export default MatchJobs;