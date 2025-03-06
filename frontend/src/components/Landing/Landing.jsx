import { useNavigate } from "react-router";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
          <h2 className="text-[#D6A36A] text-2xl md:text-3xl font-normal font-[DM_Sans] mb-8">
            Don't just search for a job. Find work that excites you.
          </h2>
          
          <div className="text-[#586E75] text-lg md:text-xl font-normal font-[DM_Sans] space-y-4 mb-10">
            <p>Instead of forcing yourself to fit into job descriptions, we flip the process:</p>
            
            <p>
              <span className="font-bold">Assess</span> - Clarify the kind of work that fulfils you long-term and areas where you naturally excel at.
            </p>
            
            <p>
              <span className="font-bold">Imagine</span> - Identify the ideal career path that is unique and meaningful to you, and share it with your network.
            </p>
            
            <p>
              <span className="font-bold">Match</span> - Match with jobs in the market and find out how your skills and experiences fit in.
            </p>
            
            <p>
              <span className="font-bold">Micro-Action</span> - Take micro-actions towards the path of meaningful career.
            </p>
            
            <p className="mt-6">
              We are NOT just another job search tool—it's a career-crafting platform that helps you find energising work and take action towards it. We want to empower the world's most brilliant, purpose-driven talents and help them craft work that really matters.
            </p>
          </div>
          
          <p className="text-[#586E75] text-lg md:text-xl font-normal font-[DM_Sans] mb-10">
            Take the first step. Try Career Crafting today.
          </p>
          
          <button
            type="button"
            onClick={() => navigate("/sign-up")}
            className="px-6 py-3 bg-[#D6A36A] text-white font-medium rounded-lg hover:bg-[#e69c23] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f9a825] focus:ring-offset-2 cursor-pointer"        
            >
            Let's Try
          </button>
      </main>
    </div>
  );
};

  
  export default Landing;
  