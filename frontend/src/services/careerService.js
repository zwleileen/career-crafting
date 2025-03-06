const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/career`;

const index = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No authentication token found"); //Prevents sending an unauthenticated request
    }

    const res = await fetch(BASE_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ error: "Invalid JSON response" }));
      throw new Error(errorData.error || "Failed to fetch chat history");
    }

    const data = await res.json();
    console.log("API Response:", data);

    return data;
  } catch (error) {
    console.error("Error fetching chat history:", error.message);
    return []; // Return an empty array instead of breaking the app
  }
};

const create = async (answers) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No authentication token found");
    }

    const requestBody = {
      userId: answers.userId,
      answers: answers.answers,
    };

    console.log(
      "Sending data to backend:",
      JSON.stringify(requestBody, null, 2)
    );

    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(answers),
    });

    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ error: "Invalid JSON response" }));
      throw new Error(errorData.error || "Failed to send answers");
    }

    const saveResponse = await res.json();

    const insightsResponse = await generateInsights(answers.userId);

    return {
      ...saveResponse,
      insights: insightsResponse.insight,
    };
  } catch (error) {
    return { error: error.message };
  }
};

const generateInsights = async (userId) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No authentication token found");
    }

    const res = await fetch(`${BASE_URL}/results`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ error: "Invalid JSON response" }));
      throw new Error(errorData.error || "Failed to generate insights");
    }

    return await res.json();
  } catch (error) {
    console.error("Error generating insights:", error.message);
    return { error: error.message };
  }
};

const show = async (userId) => {
  try {
    const res = await fetch(`${BASE_URL}/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return await res.json();
  } catch (error) {
    console.error("Error fetching status:", error);
    return null;
  }
};

export { index, create, generateInsights, show };
