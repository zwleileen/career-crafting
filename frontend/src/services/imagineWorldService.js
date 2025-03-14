const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/imagineideal`;

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
      throw new Error(errorData.error || "Failed to send requestBody");
    }

    const saveResponse = await res.json();

    const promptResponse = await generateDallEPrompt(saveResponse.referenceId);

    return {
      ...saveResponse,
      prompt: promptResponse,
    };
  } catch (error) {
    return { error: error.message };
  }
};

const generateDallEPrompt = async (referenceId) => {
  try {
    const res = await fetch(`${BASE_URL}/results`, {
      method: "POST",
      headers: {
        // Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ referenceId }),
    });

    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ error: "Invalid JSON response" }));
      throw new Error(errorData.error || "Failed to generate prompt");
    }

    return await res.json();
  } catch (error) {
    console.error("Error generating prompt:", error.message);
    return { error: error.message };
  }
};

const generateImages = async (referenceId) => {
  try {
    const res = await fetch(`${BASE_URL}/image`, {
      method: "POST",
      headers: {
        // Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ referenceId }),
    });

    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ error: "Invalid JSON response" }));
      throw new Error(errorData.error || "Failed to generate image");
    }

    return await res.json();
  } catch (error) {
    console.error("Error generating image:", error.message);
    return { error: error.message };
  }
};

const show = async (referenceId) => {
  try {
    const res = await fetch(`${BASE_URL}/results/${referenceId}`, {
      method: "GET",
      //   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    let responseData = await res.json();
    console.log("API Response:", responseData);
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

const update = async (referenceId, userId) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No authentication token found.");
    }

    console.log(
      `Updating values for responseId: ${referenceId} with userId: ${userId}`
    );

    const res = await fetch(`${BASE_URL}/updateId/${referenceId}`, {
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
      throw new Error(errorData.error || "Failed to update ideal with userId");
    }

    console.log("Successfully updated ideal with userId!");
  } catch (error) {
    console.error("Error updating imagine ideal:", error.message);
  }
};

const showUserId = async (userId) => {
  try {
    const res = await fetch(`${BASE_URL}/${userId}`, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return await res.json();
  } catch (error) {
    console.error("Error fetching status:", error);
    return null;
  }
};

export {
  index,
  create,
  generateDallEPrompt,
  generateImages,
  show,
  update,
  showUserId,
};
