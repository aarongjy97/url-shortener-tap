import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import { connect } from "mongoose";
import morgan from "morgan";
import router from "./routes/routes";

dotenv.config();

const app = express();
const port: number = 5000;
const MONGODB_CONNECTION_URI = process.env.MONGODB_CONNECTION_URI;

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use("/", router);

connect(MONGODB_CONNECTION_URI, {
  autoCreate: false
})
  .then(() => {
    app.listen(port);
    console.log(`Server listening on port ${port}`);
  })
  .catch((error) => {
    console.log(error);
  });