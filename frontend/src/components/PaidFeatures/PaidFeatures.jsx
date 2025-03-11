import { useNavigate } from "react-router";

const PaidFeatures = () => {
    const navigate = useNavigate();

    return (
    <div className="min-h-screen flex bg-white">
    <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-[#D6A36A] text-2xl md:text-3xl font-normal font-[DM_Sans] mb-8">
        Don't just search for a job. Find work that excites you.
        </h1>
        <p className="text-lg font-normal text-[#586E75] mb-8">For just $5 a month, you get access to the following features no matter which stage of career or life you are at:</p>

        <div className="text-white font-[DM_Sans] space-y-4 mb-10">            
            <div
            className="bg-[#D6A36A] mb-10 px-5 py-5 rounded-2xl border-none font-[DM_Sans]"
            >
                <span className="font-bold text-lg">RoleMatch</span>
                <p className="mb-2 mt-2 text-base">Drop in any job description, and we’ll assess how well it aligns with your skills, ideal career, and desired impact on the world. Instantly see what are the possible gaps you need to close!</p>
                <p className="mb-2 text-base">Upgrade to unlock: Personalized resume tweaks and LinkedIn headline suggestions to boost your chances of getting the role.</p>
            </div>

            <div
            className="bg-[#D6A36A] mb-10 px-5 py-5 rounded-2xl border-none font-[DM_Sans]"
            >
                <span className="font-bold text-lg">MicroShift</span>
                <p className="mb-2 mt-2 text-base">Struggling to feel fulfilled at work? MicroShift suggests small but powerful actions to align your current job with your ideal tasks and workplace relationships. Learn how to redesign your role without shifting jobs!</p>
                <p className="mb-2 text-base">Upgrade to unlock: Personalized job-crafting plan + a manager-friendly roadmap for making meaningful changes.</p>
            </div>

            <div
            className="bg-[#D6A36A] mb-10 px-5 py-5 rounded-2xl border-none font-[DM_Sans]"
            >
                <span className="font-bold text-lg">ImpactLab</span>
                <p className="mb-2 mt-2 text-base">Want to make an impact but don’t know where to start? ImpactLab suggests high-impact project ideas tailored to your vision of a better world, plus your unique skills and experiences.</p>
                <p className="mb-2 text-base">Upgrade to unlock: Step-by-step project roadmap + expert-backed guidance to kickstart your idea.</p>
            </div>

        </div>

        <p className="text-lg font-normal text-[#586E75] mb-8">The plan renews every month but don't worry, you can opt out anytime. You can also decide if you want to keep the account when you opt out just in case you pop back in the future.</p>
    
        <button
        type="button" 
        onClick={() => navigate("/upgrade")}
        className="max-w-fit mt-2 px-6 py-3 bg-[#D6A36A] text-white font-medium rounded-lg hover:bg-[#e69c23] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f9a825] focus:ring-offset-2 cursor-pointer"
        >
        Upgrade
        </button>
    
    </main>

    </div>
    )
}

export default PaidFeatures;