const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"].split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, "secretKey", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    } 

    req.userId = decoded.id; // Attach decoded user id to request object
    next(); // Call next middleware or route handler
  });
};

module.exports = verifyToken;
