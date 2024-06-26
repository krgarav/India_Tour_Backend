const express = require("express");
const app = express();
const sequelize = require("./utils/database");
const PORT = 6000;
const User = require("./models/authSchema");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");

// Middleware to parse JSON bodies
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

//routes
app.use(require("./routes/authRoutes"));
app.use(require("./routes/tourRoutes"));

sequelize
  .sync({ force: false })
  .then(async () => {
    const users = await User.findAll();
    if (users.length === 0) {
      const hashPassword = await bcrypt.hash("admin", 12);
      await User.create({
        email: "admin@gmail.com",
        password: hashPassword,
      });
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
