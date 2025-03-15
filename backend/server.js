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
  origin: ["https://career-crafting.vercel.app", "http://localhost:3000"], // Allow all origins, or specify your frontend URL like 'http://localhost:3000'
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
  credentials: true, // Allow cookies if your app uses them
  preflightContinue: false, // Ensure the preflight request is terminated correctly
  optionsSuccessStatus: 204, // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle OPTIONS preflight requests explicitly

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

// app.get("/", (req, res) => {
//   res.send("Backend is running on Vercel!");
// });
// module.exports = app;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
