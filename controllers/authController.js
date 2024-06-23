const User = require("../models/authSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// LET'S LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(404).json({ error: "Please fill in all fields" });
    }
    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      return res.status(400).json({ error: "Invalid Username" });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    const token = jwt.sign(
      {
        email: user.email,
      },
      "secretKey"
    );
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid Password" });
    }

    // Authentication successful
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// LET'S CHANGE PASSWORD AND EMAIL
exports.changePasswordAndEmail = async (req, res) => {
  const { updateEmail, updatePassword } = req.body;
  const userId = req.userId;
  try {
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(400).json({ error: "Invalid Username" });
    }

    if (updateEmail) {
      user.email = updateEmail;
    }

    if (updatePassword) {
      const hashPassword = await bcrypt.hash(updatePassword, 12);
      user.password = hashPassword;
    }
    // Generate a new token (optional) - Example assuming you want to send a new token after changes
    const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: "1h" });

    // Response with success message and token
    res
      .status(200)
      .json({ message: "Password and/or email updated successfully", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
