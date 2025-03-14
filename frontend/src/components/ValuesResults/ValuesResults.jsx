import { useContext, useEffect, useState } from "react";
import * as valuesService from '../../services/valuesService';
import { useNavigate, useParams } from "react-router";
import { UserContext } from "../../contexts/UserContext";

const ValuesResults = ({setTopValues, topValues, setTopStrengths, topStrengths}) => {
    const { user, valuesId } = useContext(UserContext);
    const [response, setResponse] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { responseId } = useParams(); 

    useEffect(() => {
      const fetchUserValues = async () => {
        try {
            setIsLoading(true);

            let identifier = responseId || valuesId;
            if (!identifier) {
                console.error("No identifier available");
                setResponse(null);
                setIsLoading(false);
                return;
              }
  
            const data = user ? await valuesService.show(valuesId) : await valuesService.show(responseId);
            console.log("Fetched values results:", data);

            if (data?.valuesInsights) {
              setResponse(data.valuesInsights);
            } else {
              setResponse(null);
            }
            if (Array.isArray(data.topValues)) {
              setTopValues(data.topValues);
            }
            if (Array.isArray(data.topStrengths)) {
              setTopStrengths(data.topStrengths);
            }

        } catch (error) {
          console.error("Error fetching user-specific values:", error.message);
          setResponse(null);
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserValues();
    }, [user, responseId, valuesId, setTopValues, setTopStrengths]);

    const formatValueName = (value) => {
      return value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
    };

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64 text-base font-normal font-[DM_Sans] text-[#586E75]">
          <p>Loading your results...</p>
        </div>
      );
    }

    if (!response) {
      return (
        <div className="flex justify-center items-center h-64 text-base font-normal font-[DM_Sans] text-[#586E75]">
          <p>No results found. Please complete the assessment first.</p>
        </div>
      );
    }
    
  
    return (
    <>
    <div className="p-6 bg-white shadow-md rounded-md">
        <h2 className="text-2xl md:text-3xl text-[#D6A36A] font-normal font-[DM_Sans] mb-8">Your Values & Strengths Insights</h2>
            <div className="flex gap-x-10">
            {topValues && topValues.length > 0 && (
            <div className="bg-[#D6A36A] text-white flex flex-col justify-center items-center rounded-2xl border-none text-lg font-normal font-[DM_Sans] mb-4 w-xs h-40">
              <h3 className="font-semibold">Your Top Values:</h3>
              <ol className="list-decimal pl-6">
                {topValues.map((value, index) => (
                  <li key={index}>{formatValueName(value)}</li>
                ))}
              </ol>
            </div>
            )}

            {topStrengths && topStrengths.length > 0 && (
            <div className="bg-[#D6A36A] text-white flex flex-col justify-center items-center rounded-2xl border-none text-lg font-normal font-[DM_Sans] mb-8 w-xs h-40">
              <h3 className="font-semibold">Your Top Strengths:</h3>
              <ol className="list-decimal pl-6">
                {topStrengths.map((strength, index) => (
                  <li key={index}>{formatValueName(strength)}</li>
                ))}
              </ol>
            </div>
            )}
            </div>
      
            <h3 className="text-2xl md:text-3xl text-[#D6A36A] font-normal font-[DM_Sans] mb-8">Insights</h3>
            <p className="text-base md:text-lg font-normal font-[DM_Sans] mb-4 text-[#586E75]">
                <span className="font-semibold">Top Values:</span> 
                <br/>{response["Top values"]}
            </p>
            <p className="text-base md:text-lg font-normal font-[DM_Sans] mb-4 text-[#586E75]">
                <span className="font-semibold">Top Strengths:</span> 
                <br/>{response["Top strengths"]}
            </p>
            <p className="text-base md:text-lg font-normal font-[DM_Sans] mb-4 text-[#586E75]">
                <span className="font-semibold">Ideal Career:</span> 
                <br/>{response["Ideal career"]}
            </p>
        
        <div className="flex justify-between">
        <button
        type="button" 
        onClick={() => navigate("/values/new")}
        className="mt-6 px-6 py-3 bg-[#D6A36A] text-white font-medium rounded-lg hover:bg-[#e69c23] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f9a825] focus:ring-offset-2 cursor-pointer"        
        >
            Redo Questionnaire
        </button>
        
        {!user && responseId ? (
        <button
        type="button" 
        onClick={() => navigate(`/ideal/${responseId}`)}
        className="mt-6 px-6 py-3 bg-[#D6A36A] text-white font-medium rounded-lg hover:bg-[#e69c23] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f9a825] focus:ring-offset-2 cursor-pointer"        
        >
        Next: Imagine
        </button>
        ) : ("")}
        </div>
        

    </div>
    </>
    )
};

export default ValuesResults;
