const express = require("express");
const https = require("https");
const fs = require("fs");
const sequelize = require("./utils/database");
const User = require("./models/authSchema");
const Tour = require("./models/tourSchema");
const SubImages = require("./models/subImagesSchema");
const TourData = require("./models/metaDataTourSchema");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// CORS error resolved
app.use(cors());

// Routes
app.use(require("./routes/authRoutes"));
app.use(require("./routes/tourRoutes"));

// Table Relations
Tour.hasMany(SubImages, {
  foreignKey: "tourId",
  onDelete: "CASCADE",
});
SubImages.belongsTo(Tour, {
  foreignKey: "tourId",
});

Tour.hasOne(TourData, {
  foreignKey: "tourId",
  onDelete: "CASCADE",
});
TourData.belongsTo(Tour, {
  foreignKey: "tourId",
});

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

    // Read SSL certificate and key files
    const options = {
      key: fs.readFileSync("/path/to/your/private.key"), // Replace with your private key file path
      cert: fs.readFileSync("/path/to/your/certificate.crt") // Replace with your certificate file path
    };

    https.createServer(options, app).listen(PORT, () => {
      console.log(`HTTPS Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
