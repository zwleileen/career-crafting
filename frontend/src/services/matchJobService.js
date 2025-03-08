const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/matchjobs`;

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
    return [];
  }
};

const show = async (responseId) => {
  try {
    const res = await fetch(`${BASE_URL}/results/${responseId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ error: "Invalid JSON response" }));
      throw new Error(errorData.error || "Failed to fetch results");
    }

    let responseData = await res.json();
    // console.log("API Response:", responseData);
    // console.log("Type of responseData:", typeof responseData);

    if (typeof responseData === "string") {
      try {
        responseData = JSON.parse(responseData);
        // console.log("Parsed responseData:", responseData);
      } catch (error) {
        console.error("Error parsing responseData:", error);
        responseData = null; // Prevent crashes if parsing fails
      }
    }

    return responseData;
  } catch (error) {
    console.log(error);
  }
};

export { index, show };
