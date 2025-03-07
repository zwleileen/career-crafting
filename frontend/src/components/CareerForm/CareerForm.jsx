import { useContext, useState } from "react";
import * as careerService from "../../services/careerService"
import { UserContext } from '../../contexts/UserContext';
import { useNavigate } from "react-router";

const CareerForm = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [careerAnswers, setCareerAnswers] = useState({});

    const careerQuestions = [
        {
            id: "1", 
            label: "Imagine a future where society has improved in a way that truly excites you. What does that world look like? You can consider what problems no longer exist, how do people live, work, or interact differently.",
            type: "text",
            placeholder: "My ideal world looks like...",
            alwaysShow: true
        },
        {
            id: "2", 
            label: "What’s currently making it difficult to move into a career that contributes to your ideal world?",
            type: "multiselect",
            options: [
                { value: "I’m not sure which career path is right for me.", label: "I’m not sure which career path is right for me." },
                { value: "I need financial stability and can’t take a big pay cut.", label: "I need financial stability and can’t take a big pay cut." },
                { value: 'I want to grow, but I’m stuck in my current industry/role.', label: 'I want to grow, but I’m stuck in my current industry/role.' },
                { value: 'I don’t have the necessary experience, skills, or qualifications.', label: 'I don’t have the necessary experience, skills, or qualifications.' },
                { value: 'I’m not sure how to make the transition to my ideal career.', label: 'I’m not sure how to make the transition to my ideal career.' },
                { value: 'I don’t have time to explore new options right now.', label: 'I don’t have time to explore new options right now.' },
                { value: 'I’m afraid of failing or making the wrong career move.', label: 'I’m afraid of failing or making the wrong career move.' },
            ],
            alwaysShow: true
        },
        {
            id: "3", 
            label: "What are your existing skills and qualifications? Do remember to state any skills and experiences that may not seem career-worthy because you never know how they can give you an edge in your next move!",
            type: "text",
            placeholder: "I have 10 years of work experience in philanthropy with diploma in design...",
            alwaysShow: true
        },
        {
            id: "4", 
            label: "What's your current employment status?",
            type: "select",
            options: [
                { value: "I am currently employed.", label: "I am currently employed." },
                { value: "I am currently unemployed.", label: "I am currently unemployed." },
            ],
            alwaysShow: true
        },
        {
            id: "5", 
            label: "What are your plans in the next few months?",
            type: "select",
            options: [
                { value: "I would like to explore how to make my current job more engaging.", label: "I would like to explore how to make my current job more engaging." },
                { value: "I would like to explore other jobs.", label: "I would like to explore other jobs." },
                { value: 'I would like to explore side hustles or start a business on my own.', label: 'I would like to explore side hustles or start a business on my own.' },
                { value: "I'm not sure what my plans are.", label: "I'm not sure what my plans are." },
            ],
            alwaysShow: true
        },
    ];

    const handleChange = (e) => {
        const { id, value } = e.target; 
        setCareerAnswers((prev) => ({
            ...prev, 
            [id]: value //store the value under the questionID key
            }))
    };

    // Special handler for multiselect checkboxes
    const handleMultiSelectChange = (questionId, value, isChecked) => {
        setCareerAnswers(prev => {
            // Initialize as array if it doesn't exist yet
            const currentValues = Array.isArray(prev[questionId]) ? prev[questionId] : [];
            
            // Add or remove value based on checkbox state
            if (isChecked) {
                return {
                    ...prev,
                    [questionId]: [...currentValues, value]
                };
            } else {
                return {
                    ...prev,
                    [questionId]: currentValues.filter(v => v !== value)
                };
            }
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();        

        if (!user || !user._id) {
            console.error("No user logged in or missing user ID.");
            return;
        }
        const requestBody = { 
            userId: user._id,
            answers: careerAnswers 
        };

        try {
        const response = await careerService.create(requestBody);
        
            if (!response || response.error) {
                throw new Error(response?.error || "Unexpected error");
            }
        
        
        console.log("Response with insights:", response);

        navigate("/career/results")
        } catch (error) {
        console.error("Form submission error:", error.message);
        }
    };

    // Check if a value is selected in a multiselect question
    const isOptionSelected = (questionId, value) => {
        return Array.isArray(careerAnswers?.[questionId]) && careerAnswers[questionId].includes(value);
    };

    // Helper to determine if a multiselect question has at least one selection
    const hasMultiSelectValue = (questionId) => {
        return Array.isArray(careerAnswers?.[questionId]) && careerAnswers[questionId].length > 0;
    };

    const renderQuestionInput = (question) => {
        if (question.type === "select") {
            return (
            <div key={question.id} className="mb-8">
                <p className="text-[#D6A36A] text-lg md:text-xl font-normal font-[DM_Sans] mb-4">
                {careerAnswers?.[question.id] || ""}
                </p>
                <div className="flex flex-col space-y-2">
                {question.options.map(({ value, label }) => (
                    <label key={value} className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <input 
                        type="radio"
                        name={question.id}
                        value={value}
                        onChange={handleChange}
                        className="mt-0.5 h-5 w-5"
                        />
                        <span className="ml-3 text-[#586E75] text-base">{label}</span>
                    </label>
                ))}
                </div>
            </div>
            );
        } else if (question.type === "multiselect") {
            return (
                <div className="space-y-2 mt-4">
                    {question.options.map(({value, label}) => (
                        <div key={value}>
                            <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    name={`${question.id}-${value}`}
                                    checked={isOptionSelected(question.id, value)}
                                    onChange={(e) => handleMultiSelectChange(question.id, value, e.target.checked)}
                                    className="h-5 w-5 rounded text-[#D6A36A] focus:ring-[#D6A36A] border-gray-300"
                                />
                                <span className="ml-3 text-[#586E75] text-base">{label}</span>
                            </label>
                        </div>
                    ))}
                    {/* Hidden input for form validity */}
                    {question.required && (
                        <input 
                            type="hidden" 
                            required={true}
                            value={hasMultiSelectValue(question.id) ? "valid" : ""} //if at least one option checked, returns true or "valid"
                            onInvalid={(e) => e.target.setCustomValidity("Please select at least one option")} //since required is true, triggers onInvalid if value is empty
                            onInput={(e) => e.target.setCustomValidity("")} //clears the error message when the user interacts with the checkboxes again
                        />
                    )}
                </div>
            );
        } else if (question.type === "text") {
            return (
                <textarea
                    required
                    name={question.id}
                    id={question.id}
                    onChange={handleChange}
                    value={careerAnswers?.[question.id] || ""}
                    placeholder={question.placeholder}
                    rows={4}
                    className="w-full p-3 border border-gray-200 rounded-lg mt-4"
                />
            );
        }
    };

    return (
    <main className="min-h-screen flex flex-col bg-white">
    <div className="flex-grow container mx-auto px-4 py-8 md:py-12">

    <form onSubmit={handleSubmit}>
        <h1 className="text-[#D6A36A] text-2xl md:text-3xl font-normal font-[DM_Sans] mb-8">
        Imagining your ideal career paths
        </h1>
        <p className="text-[#586E75] text-lg md:text-xl font-normal font-[DM_Sans] mb-8">
        Please respond to all the questions below so that we can generate the most meaningful career paths for you.
        </p>
        
        {careerQuestions.map((question) => (
            <div key={question.id} className="mb-8">
                <label htmlFor={question.id} className="text-[#D6A36A] text-lg md:text-xl font-normal font-[DM_Sans]">
                    {question.label}
                    {question.type === "multiselect" && "(Select up to 2 only)"}
                </label>
                {renderQuestionInput(question)}
            </div> 
        ))}

        <button 
        type="submit" 
        className="mt-6 px-6 py-3 bg-[#D6A36A] text-white font-medium rounded-lg hover:bg-[#e69c23] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f9a825] focus:ring-offset-2 cursor-pointer"
        >
        Submit
        </button>
    </form>

    </div>
    </main>
    );
};

export default CareerForm