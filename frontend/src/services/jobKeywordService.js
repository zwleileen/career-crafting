const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}jobkeywords`;

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

const create = async (requestBody) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No authentication token found");
    }

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
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ error: "Invalid JSON response" }));
      throw new Error(errorData.error || "Failed to send answers");
    }

    const saveResponse = await res.json();

    const keyWordResponse = await generateKeyWords(saveResponse.responseId);

    return {
      ...saveResponse,
      keywords: keyWordResponse,
    };
  } catch (error) {
    return { error: error.message };
  }
};

const generateKeyWords = async (responseId) => {
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
      body: JSON.stringify({ responseId }),
    });

    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ error: "Invalid JSON response" }));
      throw new Error(errorData.error || "Failed to generate key words");
    }

    return await res.json();
  } catch (error) {
    console.error("Error generating insights:", error.message);
    return { error: error.message };
  }
};

const show = async (responseId) => {
  try {
    const res = await fetch(`${BASE_URL}/${responseId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

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

const showUserId = async (userId) => {
  try {
    const res = await fetch(`${BASE_URL}/user/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

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

const deleteById = async (responseId) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No authentication token found");
    }

    const res = await fetch(`${BASE_URL}/${responseId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ error: "Invalid JSON response" }));
      throw new Error(errorData.error || "Failed to delete entry");
    }

    return { message: "Entry deleted successfully" };
  } catch (error) {
    console.error("Error deleting entry:", error.message);
    return { error: error.message };
  }
};

export { index, create, generateKeyWords, show, showUserId, deleteById };
