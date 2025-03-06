import { useContext, useEffect, useState } from "react";
import { UserContext } from '../../contexts/UserContext';
import * as careerService from "../../services/careerService"

const CareerResults = () => {
    const { user } = useContext(UserContext);
    const [response, setResponse] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRoleIndex, setSelectedRoleIndex] = useState(null);


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
            <h2 className="text-xl font-semibold mb-4">Your Career Insights</h2>
            
            {response["Summary"] && (
                <div className="mb-4">
                    <h3 className="text-lg font-medium">Summary:</h3>
                    <p className="text-gray-700">{response["Summary"]}</p>
                </div>
            )}

            {response["Possible career paths"] && (
                <div className="mb-4">
                    <h3 className="text-lg font-medium">Select a Job Role:</h3>
                    <ul className="list-disc list-inside text-gray-700">
                        {response["Possible career paths"].map((path, index) => (
                            <li key={index} className="mb-4 p-4 border rounded-md shadow-sm bg-gray-50">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="jobRole"
                                    value={index}
                                    checked={selectedRoleIndex === index}
                                    onChange={() => handleSelection(index)}
                                    className="w-4 h-4"
                                />
                                    <div>
                                        <p className="font-semibold">{path["Career path"]}</p>
                                        <p>{path["Why it fits"]}</p>
                                    </div>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            )}


        </div>
    )
};

export default CareerResults;