const express = require("express");
const app = express();
const path = require("path");

const https = require("https");
const fs = require("fs");
const http = require("http");
const sequelize = require("./utils/database");
const User = require("./models/authSchema");
const Tour = require("./models/tourSchema");
const SubImages = require("./models/subImagesSchema");
const TourData = require("./models/metaDataTourSchema");
const ItneryTour = require("./models/itneryTourSchema");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");
const TourPackage = require("./models/tourPackageSchema");

const PORT = 5000; // HTTPS usually runs on port 443

// Middleware to parse JSON bodies
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// CORS error resolved
app.use(cors());

// Routes
app.use(require("./routes/authRoutes"));
app.use(require("./routes/tourRoutes"));
app.use(require("./routes/tourPackageRoutes"));

// Serve static files from the 'extractedFiles' directory
app.use("/images", express.static(path.join(__dirname, "/uploads/images/")));

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
  onUpdate: "CASCADE",
});
TourData.belongsTo(Tour, {
  foreignKey: "tourId",
  onUpdate: "CASCADE",
});

Tour.hasOne(ItneryTour, {
  foreignKey: "tourId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
ItneryTour.belongsTo(Tour, {
  foreignKey: "tourId",
  onUpdate: "CASCADE",
});

TourPackage.hasMany(Tour, {
  foreignKey: "tourId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Tour.belongsTo(TourPackage, {
  foreignKey: "tourId",
  onUpdate: "CASCADE",
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

    // // Read SSL certificate and key files
    // const options = {
    //   key: fs.readFileSync("/etc/letsencrypt/live/testtour.uk.to/privkey.pem"), // Replace with your private key file path
    //   cert: fs.readFileSync("/etc/letsencrypt/live/testtour.uk.to/fullchain.pem") // Replace with your fullchain.pem file path
    // };

    http.createServer(app).listen(PORT, () => {
      console.log(`HTTPS Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
