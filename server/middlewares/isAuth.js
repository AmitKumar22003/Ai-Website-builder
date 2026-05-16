import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "token not found",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id || decoded._id);

    if (!user) {
      return res.status(401).json({
        message: "invalid user",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("AUTH ERROR:", error);

    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

export default isAuth;
