import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
    console.log(
      "MongoDB connected successfully! || Kết nối tới MongoDB thành công!"
    );
  } catch (err) {
    console.error("MongoDB connection failed. ", err);
    console.log("URI:", process.env.MONGODB_CONNECTIONSTRING);
    process.exit(1);
  }
};
