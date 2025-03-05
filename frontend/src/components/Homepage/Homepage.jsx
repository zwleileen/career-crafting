import { useNavigate } from "react-router";

const Dashboard = () => {
    const navigate = useNavigate();


    return (
    <>
    <h1>Welcome to Dashboard</h1>
    <div>
        <h2>Here's your values and strengths profile</h2>
        <button onClick={()=>navigate("/values/new")}>Strengths and values assessment</button>
    </div>
    <div>
        <h2>Here's your career profile</h2>
        <button onClick={()=>navigate("/status/new")}>Status assessment</button>
    </div>
    <div>
        <h2>Here's your job profile</h2>
        <button onClick={()=>navigate("/jobroles/new")}>Job role assessment</button>
    </div>
    </>
    )
}

export default Dashboard;