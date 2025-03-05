import { useNavigate } from "react-router";

const Landing = () => {
  const navigate = useNavigate();

    return (
      <>
      <h1>Welcome to Career Crafting App</h1>
      <div>
      <h2>Craft a Career That Excites You</h2>
      
      <p>Feeling uninspired at work? Wondering what’s next, but unsure where to start? We help you take actionable steps toward a career that energizes you.</p>
      
      <h2>How It Works?</h2>
      <p>We guide you through a structured process to craft a meaningful career—one step at a time.</p>
      
      <ol>
        <li><strong>Assess</strong> – Clarify the kind of work that fulfils you long-term and areas where you naturally excel at.</li>
        <li><strong>Imagine</strong> – Imagine your ideal career path that is filled with meaning and share them with your network.</li>
        <li><strong>Match</strong> – See jobs in the market that are aligned with your ideal career and find out how your skills and experiences fit in.</li>
        <li><strong>Micro-Action</strong> – Take micro-actions towards your ideal jobs.</li>
      </ol>
            
      <p><strong>Take the first step. Try Career Crafting today.</strong></p>

      <button onClick={()=>navigate("/sign-up")}>Let's try</button>
      
    </div>

      </>
    );
  };
  
  export default Landing;
  