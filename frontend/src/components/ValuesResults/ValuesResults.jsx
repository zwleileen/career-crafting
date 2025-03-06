import { useContext, useEffect, useState } from "react";
import { UserContext } from '../../contexts/UserContext';
import * as valuesService from '../../services/valuesService';

const ValuesResults = () => {
    const { user } = useContext(UserContext);
    const [response, setResponse] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [topValues, setTopValues] = useState();
    const [topStrengths, setTopStrengths] = useState();


    useEffect(() => {
      const fetchUserValues = async () => {
        try {
            setIsLoading(true);

          if (user && user._id) {
            const data = await valuesService.show(user._id);
            // console.log("Fetched values results:", data);

            if (data?.aiInsights) {
              setResponse(data.aiInsights);
            } else {
              setResponse(null);
            }
            if (Array.isArray(data.topValues)) {
              setTopValues(data.topValues);
            }
            if (Array.isArray(data.topStrengths)) {
              setTopStrengths(data.topStrengths);
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

      fetchUserValues();
    }, [user, setTopValues, setTopStrengths]);

    const formatValueName = (value) => {
      return value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
    };

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
  
    return (
    <>
    <div className="p-6 bg-white shadow-md rounded-md">
        <h2 className="text-2xl md:text-3xl text-[#f9a825] font-normal font-[DM_Sans] mb-8">Your Values & Strengths Insights</h2>
            <div className="flex gap-x-10">
            {topValues && topValues.length > 0 && (
            <div className="bg-[#f9a825fe] text-black flex flex-col justify-center items-center rounded-2xl border-none text-lg font-normal font-[DM_Sans] mb-4 w-xs h-40">
              <h3 className="font-semibold">Your Top Values:</h3>
              <ol className="list-decimal pl-6">
                {topValues.map((value, index) => (
                  <li key={index}>{formatValueName(value)}</li>
                ))}
              </ol>
            </div>
            )}

            {topStrengths && topStrengths.length > 0 && (
            <div className="bg-[#f9a825fe] text-black flex flex-col justify-center items-center rounded-2xl border-none text-lg font-normal font-[DM_Sans] mb-8 w-xs h-40">
              <h3 className="font-semibold">Your Top Strengths:</h3>
              <ol className="list-decimal pl-6">
                {topStrengths.map((strength, index) => (
                  <li key={index}>{formatValueName(strength)}</li>
                ))}
              </ol>
            </div>
            )}
            </div>
      
          <h3 className="text-2xl md:text-3xl text-[#f9a825] font-normal font-[DM_Sans] mb-8">Insights</h3>
          <p className="text-base md:text-lg font-normal font-[DM_Sans] mb-4">
            <span className="font-semibold">Top Values:</span> 
            <br/>{response["Top values"]}
          </p>
          <p className="text-base md:text-lg font-normal font-[DM_Sans] mb-4">
            <span className="font-semibold">Top Strengths:</span> 
            <br/>{response["Top strengths"]}
          </p>
          <p className="text-base md:text-lg font-normal font-[DM_Sans] mb-4">
            <span className="font-semibold">Ideal Career:</span> 
            <br/>{response["Ideal career"]}
          </p>
    </div>
    </>
    )
};

export default ValuesResults;
