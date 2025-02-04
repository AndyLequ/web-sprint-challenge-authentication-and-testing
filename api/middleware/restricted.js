const jwt = require("jsonwebtoken");
const User = require("../user/user-model.js");

const secret = process.env.JWT_SECRET || "secret";

const checkUsernameAvailability = async (req, res, next) => {
  try {
    const { username } = req.body;
    const existingUser = await User.findBy({ username });

    if (!existingUser) {
      next();
    } else {
      res.status(400).json({ message: "username taken" });
    }
  } catch (error) {
    console.error("Error checking username availability:", error);
    res.status(500).json({ message: "Error checking username availability" });
  }
  //   const { username } = req.body;
  //   await User.findBy({ username }).then((user) => {
  //     if (!user) {
  //       next({ status: 201, message: "user created" });
  //     } else {
  //       req.user = user;
  //       next();
  //     }
  //   });
  //   // try {
  //   //   const { username } = req.body;

  //   //   const existingUser = await User.findBy({ username });

  //   //   if (!existingUser) {
  //   //     return res.status(201).json({
  //   //       message: "User created",
  //   //     });
  //   //   } else {
  //   //     return res.status(400).json({
  //   //       message: "username taken",
  //   //     });
  //   //   }
  //   // } catch (error) {
  //   //   console.error("Error checking username availability:", error);
  //   //   res.status(500).json({
  //   //     message: "Error checking username availability",
  //   //   });
  //   // }
};

const authenticateToken = (req, res, next) => {
  // const authHeader = req.headers["authorization"];
  // const token = authHeader && authHeader.split(" ")[1];

  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ message: "token required" });

  jwt.verify(token, secret, (err, decoded) => {
    if (err) return res.status(401).json({ message: "token invalid" });

    req.user = decoded;
    next();
  });
  // const authHeader = req.headers.authorization;
  // const token = authHeader && authHeader.split(" ")[1];

  // if (!token) return res.status(401).json({ message: "token required" });

  // jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
  //   if (err) return res.status(401).json({ message: "token invalid" });

  //   req.user = decoded;
  //   next();
  // });
};

module.exports = {
  checkUsernameAvailability,
  authenticateToken,
};
