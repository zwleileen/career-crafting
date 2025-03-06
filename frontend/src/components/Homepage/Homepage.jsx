import { useNavigate } from "react-router";

const Homepage = ({topValues, topStrengths}) => {
    const navigate = useNavigate();

    return (
    <div className="min-h-screen flex flex-col bg-white">
    <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-[#D6A36A] text-2xl md:text-3xl font-normal font-[DM_Sans] mb-8">
        Don't just search for a job. Find work that excites you.
        </h1>

        <div className="text-white text-lg md:text-xl font-normal font-[DM_Sans] space-y-4 mb-10">            
            <div
            className="bg-[#D6A36A] mb-10 px-5 py-5 rounded-2xl border-none text-lg font-normal font-[DM_Sans] hover:bg-[#f9a825] transition-colors shadow-md cursor-pointer"
            onClick={() => navigate('/values/results')}
            >
              <span className="font-bold">Insights</span>
              <p>Your top values are {topValues. join(', ')} and top strengths are {topStrengths.join(', ')}.</p>
            </div>

            <p
            className="bg-[#D6A36A] mb-10 px-5 py-5 rounded-2xl border-none text-lg font-normal font-[DM_Sans] hover:bg-[#f9a825] transition-colors shadow-md cursor-pointer"
            onClick={() => navigate('/career/results')}
            >
              <span className="font-bold">Career paths</span>
              <br/>Your ideal career paths are...
            </p>

            <p
            className="bg-[#D6A36A] px-4 py-2 rounded-2xl border-none text-lg font-normal font-[DM_Sans] hover:bg-[#f9a825] transition-colors shadow-md cursor-pointer"
            onClick={() => navigate('/jobs/results')}
            >
              <span className="font-bold">Matched jobs</span>
              <br/>Your matched jobs are...
            </p>
        </div>
    </main>
    </div>
    )
}

export default Homepage;