const { User } = require("../user/user-model");

const checkUsernameAvailability = (req, res, next) => {
  const { username } = req.body;
  User.findBy(username).then((user) => {
    if (user) {
      res.status(404).json({
        message: "username taken",
      });
      return;
    }
    next();
  });
};

const checkUserAndPass = (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(404).json({
      message: "username and password required",
    });
    return;
  }
  next();
};

module.exports = {
  checkUsernameAvailability,
  checkUserAndPass,
};
