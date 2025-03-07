import { useContext, useEffect, useState } from "react";
import { UserContext } from '../../contexts/UserContext';
import * as matchJobService from "../../services/matchJobService"

const MatchJobs = () => {
    const { user } = useContext(UserContext);
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const fetchMatchedJobs = async () => {
        try {
            setIsLoading(true);

          if (user && user._id) {
            const data = await matchJobService.show(user._id);
            // console.log("Fetched values results:", data);

            if (Array.isArray(data) && data.length > 0) {
                setJobs(data);  
            } else {
                setJobs([]);  
            }
        } else {
            throw new Error("User not logged in or invalid user ID");
        }

        } catch (error) {
          console.error("Error fetching matched jobs:", error.message);
          setJobs([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchMatchedJobs();
    }, [user]);

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <p>Loading your results...</p>
        </div>
      );
    }

    if (!jobs.length) {
      return (
        <p className="text-base md:text-lg font-normal font-[DM_Sans] mb-8 text-[#586E75]">
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
                            <span className="text-base text-gray-600"> {job.company?.display_name && `- ${job.company?.display_name}`}</span>
                        </h3>
                        <p className="text-gray-700 text-base mb-2">{job.description.substring(0, 150)}...</p>
                        <p className="text-gray-500 text-base">Location: {job.location?.display_name || "N/A"}</p>
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