require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const OpenAI = require("openai");
const mongoose = require("mongoose");
const morgan = require("morgan");

const authRouter = require("./controllers/auth");
const usersRouter = require("./controllers/users");
const valuesRouter = require("./controllers/values");
const careerRouter = require("./controllers/careers");
const jobkeywordsRouter = require("./controllers/jobkeywords");
const imagineIdealRouter = require("./controllers/imagineideal");
const fitCheckRouter = require("./controllers/fitcheck");

// Connect to MongoDB using the connection string in the .env file
mongoose.connect(process.env.MONGODB_URI);
// log connection status to terminal on start
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

const connectWithRetry = () => {
  console.log("Attempting to connect to MongoDB...");
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to MongoDB!");
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
    });
};

connectWithRetry();

// Configure CORS with more specific options
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://career-crafting.vercel.app",
      "http://localhost:3000",
      "http://localhost:5174", // Add this line to allow frontend running on Vite (port 5174)
    ];

    // Allow requests with no origin (e.g., Postman, backend calls)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("Blocked CORS request from:", origin);
      callback(new Error("CORS Not Allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
  credentials: true, // Required for cookies, authentication, etc.
  preflightContinue: false, // Ensures preflight OPTIONS requests are handled properly
  optionsSuccessStatus: 204, // Fixes older browser CORS issues
};

// Apply CORS middleware globally
app.use(cors(corsOptions));

// Handle OPTIONS preflight requests explicitly
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("public"));

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/values", valuesRouter);
app.use("/career", careerRouter);
app.use("/jobkeywords", jobkeywordsRouter);
app.use("/imagineideal", imagineIdealRouter);
app.use("/fitcheck", fitCheckRouter);

app.get("/", (req, res) => {
  res.send("Backend is running on Vercel!");
});
module.exports = app;

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
