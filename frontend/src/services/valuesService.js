const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}values`;

const index = async () => {
  try {
    // const token = localStorage.getItem("token");

    // if (!token) {
    //   throw new Error("No authentication token found"); //Prevents sending an unauthenticated request
    // }

    const res = await fetch(BASE_URL, {
      headers: {
        // Authorization: `Bearer ${token}`,
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

const create = async (requestBody) => {
  try {
    // const token = localStorage.getItem("token");

    // if (!token) {
    //   throw new Error("No authentication token found");
    // }
    console.log(
      "Sending data to backend:",
      JSON.stringify(requestBody, null, 2)
    );

    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        // Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ error: "Invalid JSON response" }));
      throw new Error(errorData.error || "Failed to send answers");
    }

    const saveResponse = await res.json();

    const insightsResponse = await generateInsights(saveResponse.responseId);

    return {
      ...saveResponse,
      insights: insightsResponse.insight,
    };
  } catch (error) {
    return { error: error.message };
  }
};

const generateInsights = async (responseId) => {
  try {
    // const token = localStorage.getItem("token");

    // if (!token) {
    //   throw new Error("No authentication token found");
    // }

    const res = await fetch(`${BASE_URL}/results`, {
      method: "POST",
      headers: {
        // Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ responseId }),
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

const show = async (responseId) => {
  try {
    const res = await fetch(`${BASE_URL}/results/${responseId}`, {
      method: "GET",
      headers: {
        // Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ error: "Invalid JSON response" }));
      throw new Error(errorData.error || "Failed to fetch results");
    }

    const responseData = await res.json();
    // console.log("Response data received:", responseData);

    if (typeof responseData.aiInsights === "string") {
      try {
        responseData.aiInsights = JSON.parse(responseData.aiInsights);
      } catch (error) {
        console.error("Error parsing aiInsights:", error);
        responseData.aiInsights = null; // If parsing fails, set it to `null` instead of causing a crash
      }
    }
    // console.log("API Response:", responseData);

    return responseData;
  } catch (error) {
    console.log(error);
    return {
      topValues: [],
      topStrengths: [],
      aiInsights: null,
    };
  }
};

const update = async (responseId, userId) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No authentication token found.");
    }

    console.log(
      `Updating values for responseId: ${responseId} with userId: ${userId}`
    );

    const res = await fetch(`${BASE_URL}/updateId/${responseId}`, {
      method: "PUT",
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
      throw new Error(errorData.error || "Failed to update values with userId");
    }

    console.log("Successfully updated values with userId!");
  } catch (error) {
    console.error("Error updating values:", error.message);
  }
};

const showUserId = async (userId) => {
  try {
    const res = await fetch(`${BASE_URL}/${userId}`, {
      method: "GET",
      headers: {
        // Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ error: "Invalid JSON response" }));
      throw new Error(errorData.error || "Failed to fetch results");
    }

    const responseData = await res.json();
    // console.log("Response data received:", responseData);

    if (typeof responseData.aiInsights === "string") {
      try {
        responseData.aiInsights = JSON.parse(responseData.aiInsights);
      } catch (error) {
        console.error("Error parsing aiInsights:", error);
        responseData.aiInsights = null; // If parsing fails, set it to `null` instead of causing a crash
      }
    }
    // console.log("API Response:", responseData);

    return responseData;
  } catch (error) {
    console.log(error);
    return {
      topValues: [],
      topStrengths: [],
      aiInsights: null,
    };
  }
};

export { index, create, generateInsights, show, update, showUserId };
