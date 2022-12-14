require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const credentials = require("./middleware/credentials");
const verifyJWT = require("./middleware/verifyJWT");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 3500;
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn");
const schedule = require("node-schedule");
const getAllUserSchedules = require("./scheduledFunctions/getAllUserSchedules");
const { getAllCostSavings } = require("./controllers/CostController");
const { getAllCarbonSavings } = require("./controllers/CarbonController");

connectDB();

app.use(logger);

app.use(credentials);
app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cookieParser());

app.use(express.static(path.join(__dirname, "/public")));

app.use("/", require("./routes/root"));
app.use("/register", require("./routes/register"));
app.use("/auth", require("./routes/auth"));
app.use("/refresh", require("./routes/refresh"));
app.use("/logout", require("./routes/logout"));

app.use(verifyJWT);
app.use("/employees", require("./routes/api/employees"));
app.use("/chargelog", require("./routes/api/chargelog"));
app.use("/savings", require("./routes/api/savings"));
app.use("/carbon", require("./routes/api/carbon"));
app.use("/planning", require("./routes/api/planning"));

// schedule.scheduleJob("51 * * * *", function () {
//   console.log("execute user schedules");
//   getAllUserSchedules();
// });

// schedule.scheduleJob("05 * * * *", function () {
//   console.log("execute cost savings");
//   getAllCostSavings();
// });

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
});

//getAllCostSavings();
//getAllUserSchedules();
//getAllCarbonSavings();
