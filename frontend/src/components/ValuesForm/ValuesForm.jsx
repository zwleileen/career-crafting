import { useState } from "react";
import * as valuesService from "../../services/valuesService"
import { UserContext } from '../../contexts/UserContext';
import { useNavigate } from "react-router";

const ValuesForm = () => {
    const navigate = useNavigate();
    const [valuesAnswers, setValuesAnswers] = useState({});
  
    const valuesQuestions = [
        {
            id: "1", 
            label: "What kind of work excites and energises you the most on a day-to-day?",
            options: [
                { value: "universalism, appreciation of beauty, self-direction", label: "I love working with ideas and storytelling." },
                { value: "benevolence, universalism, fairness", label: "I feel fulfilled when contributing to the greater good." },
                { value: 'self-direction, creativity, zest', label: 'I love building new products, solutions, or businesses.' },
                { value: 'power, leadership, perspective', label: 'I thrive in leadership roles that empower people.' },
                { value: 'achievement, judgement, perseverance', label: 'I want to analyze, strategize, and solve complex problems.' },
                { value: 'security, prudence, self-regulation', label: 'I thrive in structured, goal-oriented work environments.' },
            ],
        },
        {
            id: "2", 
            label: "When facing challenges, how do you usually respond?",
            options: [
                { value: "achievement, perseverance, grit", label: "Persist and overcome obstacles" },
                { value: "self-direction, creativity, zest", label: "Find creative solutions to problems" },
                { value: 'stimulation, hedonism, zest', label: 'Adapt quickly and go with the flow' },
                { value: 'benevolence, teamwork, social intelligence', label: 'Seek guidance and work collaboratively' },
                { value: 'hope, optimism, perseverance', label: 'Stay optimistic and reframe the situation' },
            ],
        },
        {
            id: "3", 
            label: "What's the one problem or challenge you would most like to address through your work?",
            options: [
                { value: "benevolence, love, kindness, social intelligence", label: "Helping individuals grow and thrive" },
                { value: "universalism, justice, fairness, leadership, bravery", label: "Advocating for fairness and justice in society " },
                { value: 'self-direction, creativity, curiosity, perspective', label: 'Driving innovation and progress' },
                { value: 'achievement, power, leadership, perseverance, judgement', label: 'Achieving personal and financial success' },
                { value: 'universalism, appreciation of beauty, spirituality, hope', label: 'Creating beauty, meaning, or inspiration' },
                { value: 'universalism, benevolence, leadership, perspective, teamwork', label: 'Transforming how organizations and teams function' },
            ],
        },
        {
            id: "4", 
            label: "How do you like to work best?",
            options: [
                { value: "security, prudence, self-regulation", label: "In structured roles with clear expectations" },
                { value: "stimulation, zest, creativity", label: "In dynamic and fast-paced environments" },
                { value: 'self-direction, perseverance, perspective', label: 'Independently, managing my own work' },
                { value: 'benevolence, teamwork, social intelligence', label: 'Collaborating closely with a team' },
            ],
        },
        {
            id: "5", 
            label: "What values would you never compromise in your work?",
            options: [
                { value: "universalism, bravery, fairness", label: "Standing up for what’s right" },
                { value: "universalism, benevolence, justice", label: "Ensuring fairness and equality for everyone" },
                { value: 'tradition, integrity, honesty, authenticity', label: 'Staying true to my personal beliefs' },
                { value: 'conformity, benevolence, kindness', label: 'Adapting to maintain harmony in a group' },
            ],
        },
        {
            id: "6", 
            label: "How do you define success in your career?",
            options: [
                { value: "universalism, fairness, justice", label: "Making an impact on society" },
                { value: "security, power, prudence", label: "Financial stability and security" },
                { value: 'self-direction, love of learning, curiosity', label: 'Continuous learning and growth' },
                { value: 'achievement, bravery, perseverance', label: 'Recognition and achievement' },
                { value: 'benevolence, kindness, social intelligence', label: 'Building strong relationships' },
            ],
        },
        {
            id: "7", 
            label: "When have you felt truly “in the zone” at work?",
            options: [
                { value: "achievement, judgement, perspective", label: "When solving problems and making decisions" },
                { value: "benevolence, kindness, leadership", label: "When helping or mentoring others" },
                { value: 'self-direction, creativity, curiosity', label: 'When brainstorming new ideas' },
                { value: 'self-direction, love of learning, curiosity', label: 'When I am learning something new' },
            ],
        },
        {
            id: "8", 
            label: "What kind of work environment makes you thrive?",
            options: [
                { value: "stimulation, zest, creativity", label: "Fast-paced and dynamic" },
                { value: "security, prudence, self-regulation", label: "Structured and stable" },
                { value: 'self-direction, creativity, curiosity', label: 'Exploratory and idea-driven' },
                { value: 'universalism, benevolence, fairness', label: 'Mission-driven and collaborative' },
            ],
        },
        {
            id: "9", 
            label: "What do others often appreciate about you at work?",
            options: [
                { value: "achievement, judgement, perspective", label: "My ability to solve problems logically" },
                { value: "self-direction, creativity, curiosity", label: "My creativity and innovative ideas" },
                { value: 'benevolence, social intelligence, kindness', label: 'My ability to connect and support others' },
                { value: 'power, achievement, leadership, zest', label: 'My leadership and ability to inspire people' },
            ],
        },
        {
            id: "10", 
            label: "In the long-run, what’s the deeper purpose that would make your career feel truly meaningful??",
            options: [
                { value: "self-direction, creativity, curiosity", label: "I want to push boundaries and create impact" },
                { value: "benevolence, kindness, social intelligence", label: "I feel fulfilled when improving lives" },
                { value: 'achievement, security, prudence', label: 'I prioritize security and prosperity' },
                { value: 'universalism, fairness, leadership', label: 'I want to create positive societal change' },
                { value: 'universalism, appreciation of beauty, spirituality', label: 'I want to inspire, express, or elevate human experience' },
            ],
        },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target; // e.g. name="1", value="achievement, judgement, problem-solving"
        const questionObj = valuesQuestions.find((q) => q.id === name); // Find matching question

        if (questionObj) {
        const selectedOption = questionObj.options.find((opt) => opt.value === value);
        setValuesAnswers((prev) => ({
            ...prev,
            [name]: {
            label: selectedOption.label, 
            values: value, 
            },
        }));
        // console.log(valuesAnswers);
        }
    };
    
    const countTopValues = (answers) => {
        const normalizedValues = [
            "universalism",
            "benevolence",
            "tradition",
            "conformity",
            "security",
            "power",
            "achievement",
            "hedonism",
            "stimulation",
            "self-direction"
          ];

        const valueCounts = {}; // e.g. {"universalism": 1, "conformity": 3...}
        const strengthCounts = {};

        Object.values(answers).forEach(({ values }) => {
            values.split(", ").forEach((item) => {
            // Normalize item for comparison (lowercase)
            const normalizedItem = item.toLowerCase();
            
            // Check if this is a value or a strength
            let isValue = false;
            for (const value of normalizedValues) {
                if (normalizedItem.includes(value)) {
                isValue = true;
                break;
                }
            }
            
            if (isValue) {
                valueCounts[item] = (valueCounts[item] || 0) + 1; //e.g. checks if valueCounts[universalism] already has count, if not, 0
            } else {
                strengthCounts[item] = (strengthCounts[item] || 0) + 1;
            }
            });
        });

        console.log("Value Counts:", valueCounts);
        console.log("Strength Counts:", strengthCounts);
        
        const topValues = Object.entries(valueCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([value]) => value);
            
        const topStrengths = Object.entries(strengthCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([strength]) => strength);
        

    return {topValues, topStrengths};
    };


    const handleSubmit = async (e) => {
        e.preventDefault();        

        // if (!user || !user._id) {
        //     console.error("No user logged in or missing user ID.");
        //     return;
        // }
        const { topValues, topStrengths } = countTopValues(valuesAnswers);

        const requestBody = {
            // userId: user._id, 
            answers: valuesAnswers, 
            topValues: topValues,
            topStrengths: topStrengths
        };
        // console.log("Sending data to backend:", JSON.stringify(requestBody, null, 2));

        try {
        const response = await valuesService.create(requestBody);
        
            if (!response || response.error) {
                throw new Error(response?.error || "Unexpected error");
            }
        
        
        // console.log("Response with insights:", response);
        if (response.responseId) {
            localStorage.setItem('latestResponseId', response.responseId);

            navigate(`/values/results/${response.responseId}`);
        } else {
            console.error("No responseId returned from the server");
            throw new Error("No responseId returned from the server");
        }
        } catch (error) {
        console.error("Form submission error:", error.message);
        }
    };

    return (
    <main className="min-h-screen flex flex-col bg-white">
    <div className="flex-grow container mx-auto px-4 py-8 md:py-12">

    <form onSubmit={handleSubmit}>
        <h1 className="text-[#D6A36A] text-2xl md:text-3xl font-normal font-[DM_Sans] mb-8">
        Clarifying your strengths and values
        </h1>
        <p className="text-[#586E75] text-lg md:text-xl font-normal font-[DM_Sans] mb-8">
        There are 10 questions in total. Please respond to all the questions by selecting the option that most resonates with you. 
        </p>

        {valuesQuestions.map(({ id, label, options }) => (
        <div key={id} className="mb-8">
            <p className="text-[#D6A36A] text-lg md:text-xl font-normal font-[DM_Sans] mb-4">
            {label}
            </p>
            <div className="flex flex-col space-y-2">
            {options.map(({ value, label }) => (
                <label key={value} className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input 
                    type="radio"
                    name={id}
                    value={value}
                    onChange={handleChange}
                    className="mt-0.5 h-5 w-5 focus:ring-[#D6A36A]"
                    />
                    <span className="ml-3 text-[#586E75] text-base">{label}</span>
                </label>
            ))}
            </div>
        </div> 
        ))}

        <div className="flex justify-between">
        <button 
        type="submit" 
        className="mt-6 px-6 py-3 bg-[#D6A36A] text-white font-medium rounded-lg hover:bg-[#e69c23] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f9a825] focus:ring-offset-2 cursor-pointer"
        >
        Submit
        </button>

        <button 
        type="button"
        onClick={() => navigate('/')}
        className="mt-6 px-6 py-3 bg-[#D6A36A] text-white font-medium rounded-lg hover:bg-[#e69c23] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f9a825] focus:ring-offset-2 cursor-pointer"        
        >
        Cancel
        </button>
      
      </div>
    
    </form>

    </div>
    </main>
    )
};

export default ValuesForm