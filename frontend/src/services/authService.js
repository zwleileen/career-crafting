const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/auth`;

const signUp = async (formData) => {
  try {
    const res = await fetch(`${BASE_URL}/sign-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.err || "Signup failed.");
    }

    return data;
  } catch (err) {
    console.error("Signup error:", err.message);
    throw new Error(err.message);
  }
};

const signIn = async (formData) => {
  try {
    const res = await fetch(`${BASE_URL}/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (data.err) {
      throw new Error(data.err);
    }

    if (data.token) {
      // console.log("saving token to localstorage:", data.token);
      localStorage.setItem("token", data.token);
      return JSON.parse(atob(data.token.split(".")[1])).payload;
    }

    throw new Error("Invalid response from server");
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

const refreshToken = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/refresh-token/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    // console.log("Raw response:", response);

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json();

    if (data.err) {
      throw new Error(data.err);
    }

    if (data.token) {
      // console.log("saving token to localstorage:", data.token);
      localStorage.setItem("token", data.token);
      return JSON.parse(atob(data.token.split(".")[1])).payload;
    }

    throw new Error("Invalid response from server");
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

export { signUp, signIn, refreshToken };
