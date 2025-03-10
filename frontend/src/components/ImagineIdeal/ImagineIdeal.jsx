import { useContext, useState } from "react";
import * as imagineWorldService from "../../services/imagineWorldService"
import { UserContext } from '../../contexts/UserContext';
import { useParams } from "react-router";
import IdealCareer from "../IdealCareer/IdealCareer";

const ImagineIdeal = () => {
    const { user } = useContext(UserContext);
    const [idealWorldAnswers, setIdealWorldAnswers] = useState({});
    const { responseId } = useParams(); 
    const [showResults, setShowResults] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const idealWorld = {
            id: "1", 
            label: "Imagine a future where society has improved in a way that truly excites you. What does that world look like? You can consider what problems no longer exist, how do people live, work, or interact differently.",
            type: "text",
            placeholder: "My ideal world looks like...",
            alwaysShow: true
    };

    const handleChange = (e) => {
        const { id, value } = e.target; 
        setIdealWorldAnswers((prev) => ({
            ...prev, 
            [id]: value //store the value under the questionID key
            }))
    };

    
    const handleSubmit = async (e) => {
        e.preventDefault();        

        const requestBody = user && user._id
        ? { responseId: responseId, userId: user._id, worldVision: idealWorldAnswers[idealWorld.id] || "" }
        : { responseId: responseId, worldVision: idealWorldAnswers[idealWorld.id] || "" };
        // console.log("Request body before submission:", JSON.stringify(requestBody, null, 2)); 

        try {
        const response = await imagineWorldService.create(requestBody);
        
            if (!response || response.error) {
                throw new Error(response?.error || "Unexpected error");
            }
            setShowResults(true);
            setRefreshKey(prevKey => prevKey + 1); //force IdealCareer to reload
    
        // console.log("Response with insights:", response);

        } catch (error) {
        console.error("Form submission error:", error.message);
        }
    };

    return (
    <main className="min-h-screen flex flex-col bg-white">
    <div className="flex-grow container mx-auto px-4 py-8 md:py-12">

    <form onSubmit={handleSubmit}>
        <h1 className="text-[#D6A36A] text-2xl md:text-3xl font-normal font-[DM_Sans] mb-8">
        Imagining your ideal career paths
        </h1>
        <label 
        htmlFor={idealWorld.id} 
        className="text-[#586E75] text-base md:text-lg font-normal font-[DM_Sans]">
        {idealWorld.label}
        </label>
        <textarea
            required
            name={idealWorld.id}
            id={idealWorld.id}
            onChange={handleChange}
            value={idealWorldAnswers[idealWorld.id] || ""}
            placeholder={idealWorld.placeholder}
            rows={4}
            className="w-full p-3 border border-gray-200 rounded-lg mt-4 text-base font-[DM_Sans]"
        />

        <button 
        type="submit" 
        className="mt-6 px-6 py-3 bg-[#D6A36A] text-white font-medium rounded-lg hover:bg-[#e69c23] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f9a825] focus:ring-offset-2 cursor-pointer"
        >
        Submit
        </button>
    </form>

    {showResults && <IdealCareer responseId={responseId} refreshKey={refreshKey} />}

    </div>
    </main>
    );
};

export default ImagineIdeal