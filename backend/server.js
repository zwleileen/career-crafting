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
// const statusRouter = require("./controllers/status");
// const jobrolesRouter = require("./controllers/jobroles");
// const jobkeywordsRouter = require("./controllers/jobkeywords");
// const matchJobsRouter = require("./controllers/matchjobs");

// Connect to MongoDB using the connection string in the .env file
mongoose.connect(process.env.MONGODB_URI);
// log connection status to terminal on start
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(cors());
app.use(express.json()); // ✅ Important: Allows Express to parse JSON requests
app.use(morgan("dev"));

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/values", valuesRouter);
// app.use("/status", statusRouter);
// app.use("/jobroles", jobrolesRouter);
// app.use("/jobkeywords", jobkeywordsRouter);
// app.use("/matchjobs", matchJobsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
