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
                <select 
                    required 
                    name={question.id} 
                    id={question.id} 
                    onChange={handleChange} 
                    value={careerAnswers?.[question.id] || ""}
                >
                    <option value="">Select</option>
                    {question.options.map(({value, label}) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            );
        } else if (question.type === "multiselect") {
            return (
                <div className="checkbox-group" style={{ marginTop: "8px" }}>
                    {question.options.map(({value, label}) => (
                        <div key={value} style={{ marginBottom: "6px" }}>
                            <label style={{ display: "flex", alignItems: "flex-start", cursor: "pointer" }}>
                                <input
                                    type="checkbox"
                                    name={`${question.id}-${value}`}
                                    checked={isOptionSelected(question.id, value)}
                                    onChange={(e) => handleMultiSelectChange(question.id, value, e.target.checked)}
                                    style={{ marginRight: "8px", marginTop: "3px" }}
                                />
                                <span>{label}</span>
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
                    style={{
                        width: "80%", 
                        padding: "8px", 
                        borderRadius: "4px",
                        border: "1px solid #ccc"
                    }}
                />
            );
        }
    };

    return (
    <form onSubmit={handleSubmit}>
        <h1>Understanding your current status</h1>
        <p>Please respond to all the questions below and choose the option that most resonates with you. We understand sometimes it's tough to choose one, just try to go with the one that feels the most right!</p>
        
        {careerQuestions.map((question) => (
            <div key={question.id} style={{marginBottom:"15px"}}>
                <label htmlFor={question.id} style={{ display: "block", fontWeight: "bold" }}>
                    {question.label}
                    {question.type === "multiselect" && "(Select up to 2 only)"}
                </label>
                {renderQuestionInput(question)}
            </div> 
        ))}

        <button type="submit" style={{ marginTop: "20px", padding: "10px", fontSize: "16px" }}>
            Submit
        </button>
    </form>
    );
};

export default CareerForm