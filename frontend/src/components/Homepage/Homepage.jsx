import { useNavigate } from "react-router";

const Homepage = () => {
    const navigate = useNavigate();

    return (
    <div className="min-h-screen flex bg-white">
    <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-[#D6A36A] text-2xl md:text-3xl font-normal font-[DM_Sans] mb-8">
        Don't just search for a job. Find work that excites you.
        </h1>
        <p className="text-lg font-normal text-[#586E75] mb-8">
        What would you like to work on today?
        </p>

        <div className="text-white font-[DM_Sans] space-y-4 mb-10">            
            <div
            onClick={()=>navigate("/statuscheck")}
            className="bg-[#D6A36A] mb-10 px-5 py-5 rounded-2xl border-none font-[DM_Sans] hover:bg-[#e69c23] transition-colors cursor-pointer"
            >
                <span className="font-bold text-lg">FitCheck</span>
                <p className="mb-2 mt-2 text-base">Not sure if a role is the right fit? <br/>Drop in any job description, and we’ll assess how well it aligns with your skills, ideal career, and desired impact on the world.</p>
            </div>

            <div
            className="bg-[#D6A36A] mb-10 px-5 py-5 rounded-2xl border-none font-[DM_Sans] hover:bg-[#e69c23] transition-colors cursor-pointer"
            >
                <span className="font-bold text-lg">MicroShift</span>
                <p className="mb-2 mt-2 text-base">Struggling to feel fulfilled at work? <br/> MicroShift suggests small but powerful actions to align your current job with your ideal tasks and workplace relationships.</p>
            </div>

            <div
            className="bg-[#D6A36A] mb-10 px-5 py-5 rounded-2xl border-none font-[DM_Sans] hover:bg-[#e69c23] transition-colors cursor-pointer"
            >
                <span className="font-bold text-lg">ImpactLab</span>
                <p className="mb-2 mt-2 text-base">Want to make an impact but don’t know where to start? <br/>ImpactLab suggests high-impact project ideas tailored to your vision of a better world, plus your unique skills and experiences.</p>
            </div>

        </div>

        <p className="text-sm font-normal text-[#586E75] mb-8">
        We are NOT just another job search tool—it's a career-crafting platform that helps you find energising work and take action towards it. We want to empower the world's most brilliant, purpose-driven talents and help them craft work that really matters.
        </p>
        
    </main>

    </div>
    )
}

export default Homepage;