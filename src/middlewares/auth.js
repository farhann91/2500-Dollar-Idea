const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get the token from request header sent by the user
  const token = req.header("x-auth-token");
  // return console.log(token);

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Veryfy the token if there is one
  try {
    const decoded = jwt.verify(token, process.env.SIRI);
    // assign the decoded to the user
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).send({ msg: "Token is invalid" });
  }
};
