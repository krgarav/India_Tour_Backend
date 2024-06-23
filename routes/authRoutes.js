const express = require("express");
const router = express.Router();
const { login, changePasswordAndEmail } = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");

router.post("/login", login);

router.post("/change", verifyToken, changePasswordAndEmail)

module.exports = router;
