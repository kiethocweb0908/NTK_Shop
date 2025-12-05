import mongoose from "mongoose";

const uri =
  "mongodb+srv://kiethocweb0908_db_user:g1ypuIhIGhZbhn5T@cluster0.f3ozuvg.mongodb.net/ntkshop?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(uri)
  .then(() => {
    console.log("✅ KẾT NỐI THÀNH CÔNG VỚI MONGODB ATLAS!");
    process.exit(0);
  })
  .catch((err) => {
    console.log("❌ LỖI KẾT NỐI:");
    console.log(err.message);
    if (err.message.includes("Authentication failed"))
      console.log("→ Sai mật khẩu hoặc user");
    if (err.message.includes("Bad auth")) console.log("→ Sai mật khẩu 100%");
    if (err.message.includes("not authorized"))
      console.log("→ User không có quyền");
    process.exit(1);
  });
