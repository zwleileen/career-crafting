import { useNavigate } from "react-router";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="w-full bg-[#1e2a38] py-8 px-4 relative">
        <div className="container mx-auto">
        <div className="flex items-center justify-center">
          <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-normal font-[Inter] text-center">
            Career Crafting App
          </h1>
        </div>
          <div className="absolute right-4 md:right-8 bottom-4 flex items-center">
            <span className="text-white text-xs font-normal font-[DM_Sans] mr-2">
              Not signed in
            </span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M5.85 17.1C6.7 16.45 7.65 15.9375 8.7 15.5625C9.75 15.1875 10.85 15 12 15C13.15 15 14.25 15.1875 15.3 15.5625C16.35 15.9375 17.3 16.45 18.15 17.1C18.7333 16.4167 19.1875 15.6417 19.5125 14.775C19.8375 13.9083 20 12.9833 20 12C20 9.78333 19.2208 7.89583 17.6625 6.3375C16.1042 4.77917 14.2167 4 12 4C9.78333 4 7.89583 4.77917 6.3375 6.3375C4.77917 7.89583 4 9.78333 4 12C4 12.9833 4.1625 13.9083 4.4875 14.775C4.8125 15.6417 5.26667 16.4167 5.85 17.1ZM12 13C11.0167 13 10.1875 12.6625 9.5125 11.9875C8.8375 11.3125 8.5 10.4833 8.5 9.5C8.5 8.51667 8.8375 7.6875 9.5125 7.0125C10.1875 6.3375 11.0167 6 12 6C12.9833 6 13.8125 6.3375 14.4875 7.0125C15.1625 7.6875 15.5 8.51667 15.5 9.5C15.5 10.4833 15.1625 11.3125 14.4875 11.9875C13.8125 12.6625 12.9833 13 12 13ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22Z"
                fill="#FEF7FF"
              />
            </svg>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <section className="max-w-4xl mx-auto">
          <h2 className="text-[#f9a825] text-2xl md:text-3xl font-normal font-[DM_Sans] mb-8">
            Don't just search for a job. Find work that excites you.
          </h2>
          
          <div className="text-black text-lg md:text-xl font-normal font-[DM_Sans] space-y-4 mb-10">
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
          
          <p className="text-black text-lg md:text-xl font-normal font-[DM_Sans] mb-10">
            Take the first step. Try Career Crafting today.
          </p>
          
          <button
            onClick={() => navigate("/sign-up")}
            className="bg-[#f9a825] text-black px-6 py-3 rounded-2xl border border-[#f9a825] text-xl font-normal font-[DM_Sans] hover:bg-[#e69c22] transition-colors"
          >
            Let's Try
          </button>
        </section>
      </main>
    </div>
  );
};

  
  export default Landing;
  