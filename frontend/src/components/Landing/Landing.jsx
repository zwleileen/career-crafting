import { useNavigate } from "react-router";

const Landing = () => {
  const navigate = useNavigate();

    return (
      <>
      <h1>Arvo</h1>
      <div>
      <h2>Craft a Career That Excites You—One Micro-Action at a Time.</h2>
      
      <p>Feeling uninspired at work? Wondering what’s next, but unsure where to start? <strong>Arvo</strong> helps you take small, actionable steps toward a career that energizes you—without needing a drastic change.</p>
      
      <h2>How Arvo Works in 3 Simple Steps</h2>
      <p>Arvo guides you through a structured process to help you craft a meaningful career—one step at a time.</p>
      
      <ol>
        <li><strong>Assess</strong> – Identify what energizes vs. drains you with quick, science-backed assessments.</li>
        <li><strong>Take Action</strong> – Get personalized micro-actions to shift your work toward more meaning.</li>
        <li><strong>Track & Adjust</strong> – See your progress, refine your direction, and build momentum.</li>
      </ol>
      
      <h2>How Do You Know If Arvo Works For You?</h2>
      <p>We encourage you to go through the following steps and set up an initial profile first:</p>
      <ol>
        <li>Clarify the tasks and relationships that are meaningful to you</li>
        <li>Clarify your values</li>
        <li>Articulate your desired skills and impact</li>
      </ol>
      <p>At the end of these steps, you will have your own profile and a set of insights to help you craft a more meaningful career. All for free.</p>
      
      <p><strong>Take the first step. Try Arvo today. 🚀</strong></p>

      <button onClick={()=>navigate("/sign-up")}>Try Arvo</button>
      
    </div>

      </>
    );
  };
  
  export default Landing;
  