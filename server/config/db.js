import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("DB is Connected");
  } catch (error) {
    console.log("DB Error:", error.message);
  }
};

export default connectDb;