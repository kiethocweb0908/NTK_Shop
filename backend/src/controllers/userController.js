import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    //Registration logic
    // res.send({ name, email, password });
    let user = await User.findOne({ email });

    if (user) {
      return res
        .status(400)
        .json({ message: "User alreader exists! || Người dùng đã tồn tại!" });
    }

    user = new User({ name, email, password });
    await user.save();

    // ✅ KIỂM TRA JWT_SECRET có tồn tại không
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    //Create JWT Payload
    const payload = { user: { id: user._id, role: user.role } };

    // Sign and return the token along with user data
    // jwt.sign(
    //   payload,
    //   process.env.JWT_SECRET,
    //   { expiresIn: "40h" },
    //   (err, token) => {
    //     if (err) throw err;

    //     // Send the user and token in response
    //     res.status(201).json({
    //       user: {
    //         _id: user._id,
    //         name: user.name,
    //         email: user.email,
    //         role: user.role,
    //       },
    //       token,
    //     });
    //   }
    // );

    // Dùng async/await thay vì callback
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "40h",
    });

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Lỗi khi gọi createUser: ", error);
    res.status(500).send("Server Error");
  }
};
