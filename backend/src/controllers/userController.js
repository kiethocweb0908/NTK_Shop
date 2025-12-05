import User from "../models/User.js";
import jwt from "jsonwebtoken";
import Cart from "../models/Cart.js";

// Helper function to set token cookie
const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 40 * 60 * 60 * 1000, // 40 hours
  });
};

//Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

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

    setTokenCookie(res, token);

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      // token,
    });
  } catch (error) {
    console.error("Lỗi khi gọi registerUser: ", error);
    res.status(500).send("Server Error");
  }
};

//Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Find the user by email
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email không đúng!",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch)
      return res.status(400).json({ message: "Mật khẩu không đúng!" });

    // 🎯 MERGE CARTS TRƯỚC KHI TẠO TOKEN
    const guestId = req.cookies?.guestId;
    let mergedItems = 0;
    let result = {};

    if (guestId) {
      try {
        const mergeResult = await Cart.mergeCarts(guestId, user._id);
        mergedItems = mergeResult.cart ? mergeResult.cart.products.length : 0;
        result = { ...mergeResult };
        res.clearCookie("guestId"); // Xóa guestId sau khi merge
      } catch (mergeError) {
        console.error("Merge cart error:", mergeError);
        // Không throw error để không ảnh hưởng login
      }
    }

    //Create JWT Payload
    const payload = { user: { id: user._id, role: user.role } };

    // Sign and return the token along with user data
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "40h",
    });

    setTokenCookie(res, token);

    res.json({
      message: "Đăng nhập thành công!",
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        address: user.address,
        email: user.email,
        role: user.role,
      },
      // token,
      mergedItems,
      result,
    });
  } catch (error) {
    console.error("Lỗi khi gọi loginUser: ", error);
    res.status(500).json("Server Error");
  }
};

//Get User
export const getUser = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error("Lỗi khi gọi getUser: ", error);
    res.status(500).send("Server Error");
  }
};

// Logout User
export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.json({ message: "Đã đăng xuất thành công!" });
  } catch (error) {
    console.error("Lỗi khi gọi logoutUser: ", error);
    res.status(500).send("Server Error");
  }
};
