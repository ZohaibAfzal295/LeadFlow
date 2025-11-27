import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ROUTES
import routes from "./routes/index.js";
app.use("/api", routes);

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port", process.env.PORT);
});
