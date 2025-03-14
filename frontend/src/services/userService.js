const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}users`;
import * as authService from "../services/authService";

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

// const show = async (responseId) => {
//   try {
//     const res = await fetch(`${BASE_URL}/results/${responseId}`, {
//       method: "GET",
//       headers: {
//         // Authorization: `Bearer ${localStorage.getItem("token")}`,
//         "Content-Type": "application/json",
//       },
//     });

//     if (!res.ok) {
//       const errorData = await res
//         .json()
//         .catch(() => ({ error: "Invalid JSON response" }));
//       throw new Error(errorData.error || "Failed to fetch results");
//     }

//     const responseData = await res.json();
//     // console.log("Response data received:", responseData);

//     if (typeof responseData.aiInsights === "string") {
//       try {
//         responseData.aiInsights = JSON.parse(responseData.aiInsights);
//       } catch (error) {
//         console.error("Error parsing aiInsights:", error);
//         responseData.aiInsights = null; // If parsing fails, set it to `null` instead of causing a crash
//       }
//     }
//     // console.log("API Response:", responseData);

//     return responseData;
//   } catch (error) {
//     console.log(error);
//     return {
//       topValues: [],
//       topStrengths: [],
//       aiInsights: null,
//     };
//   }
// };

const update = async (userId) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No authentication token found.");
    }

    console.log(`Updating status for userId: ${userId}`);

    const res = await fetch(`${BASE_URL}/updateStatus`, {
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
      throw new Error(errorData.error || "Failed to update status with userId");
    }

    const userData = await res.json();
    console.log("Status update response:", userData);

    // After updating the status, refresh the token to update localStorage
    try {
      console.log("Refreshing token after status update");
      await authService.refreshToken(userId);
      console.log("Token refreshed successfully");
    } catch (refreshError) {
      console.error(
        "Error refreshing token after status update:",
        refreshError
      );
      // Continue even if token refresh fails - at least the database was updated
    }

    console.log("Successfully updated status with userId!");
    return userData;
  } catch (error) {
    console.error("Error updating status:", error.message);
    throw error; // Re-throw to allow caller to handle the error
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

export { index, update, show };
