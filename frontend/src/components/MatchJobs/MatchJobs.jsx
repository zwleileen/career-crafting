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
        <div className="p-4">
          <p>No job matches found. Please choose another job role.</p>
        </div>
      );
    }
  
    return (
        <div className="p-6 bg-white shadow-md rounded-md">
            <h2 className="text-xl font-semibold mb-4">Job Listings</h2>
            
            <ul className="space-y-4">
                {jobs.map((job) => (
                    <li key={job.id} className="p-4 border border-gray-300 rounded-md shadow-md">
                        <h3 className="text-lg font-medium">
                            {job.title} 
                            <span className="text-sm text-gray-600"> {job.company?.display_name && `- ${job.company?.display_name}`}</span>
                        </h3>
                        <p className="text-gray-700 text-sm mb-2">{job.description.substring(0, 150)}...</p>
                        <p className="text-gray-500 text-sm">Location: {job.location?.display_name || "N/A"}</p>
                        <a href={job.redirect_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 font-medium">
                            View Job Details →
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    )
};

export default MatchJobs;