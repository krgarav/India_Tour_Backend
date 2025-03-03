const express = require("express");
// const app = express();
const path = require("path");

const https = require("https");
// const http = require("http");

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

const TourTourPackageRelation = require("./models/tour-tourPackageRelation");
const TourPackage = require("./models/tourPackageSchema");
const homeSliderSchema = require("./models/HomeSliderSchema");
const Highlights = require("./models/highlightsSchema");
const Inclusion = require("./models/inclusionSchema");
const Exclusion = require("./models/exclusionSchema");
const Pages = require("./models/pagesSchema");

const builtPath = path.join(__dirname, "dist");
const app = express();

const PORT = 5000; // HTTPS usually runs on port 443

// Middleware to parse JSON bodies
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// CORS error resolved
app.use(cors());

app.use(express.static(builtPath));

// Routes
app.use(require("./routes/authRoutes"));
app.use(require("./routes/tourRoutes"));
app.use(require("./routes/tourPackageRoutes"));
app.use(require("./routes/metaRoute"));

// Serve static files from the 'extractedFiles' directory
app.use("/images", express.static(path.join(__dirname, "/uploads/images/")));
app.use(
  "/sliderImg",
  express.static(path.join(__dirname, "/uploads/sliderImage/"))
);
// Handle all other routes and serve React's index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(builtPath, "index.html"));
});

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

TourPackage.belongsToMany(Tour, {
  through: TourTourPackageRelation,
});
Tour.belongsToMany(TourPackage, {
  through: TourTourPackageRelation,
});

Tour.hasMany(Highlights, {
  foreignKey: "tourId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Highlights.belongsTo(Tour, {
  foreignKey: "tourId",
  onUpdate: "CASCADE",
});

Tour.hasMany(Inclusion, {
  foreignKey: "tourId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Inclusion.belongsTo(Tour, {
  foreignKey: "tourId",
  onUpdate: "CASCADE",
});

Tour.hasMany(Exclusion, {
  foreignKey: "tourId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Exclusion.belongsTo(Tour, {
  foreignKey: "tourId",
  onUpdate: "CASCADE",
});

sequelize
  .sync({ force: !true })
  .then(async () => {
    const users = await User.findAll();
    if (users.length === 0) {
      const hashPassword = await bcrypt.hash("admin", 12);
      await User.create({
        email: "admin@gmail.com",
        password: hashPassword,
      });
    }
    await Pages.findOrCreate({
      where: { page: "Homepage" },
      defaults: { page: "Homepage" },
    });

    await Pages.findOrCreate({
      where: { page: "Contact page" },
      defaults: { page: "Contact page" },
    });
    // Read SSL certificate and key files
    // const options = {
    //   key: fs.readFileSync("/etc/letsencrypt/live/triangleindiatour.uk.to/privkey.pem"), // Replace with your private key file path
    //   cert: fs.readFileSync("/etc/letsencrypt/live/triangleindiatour.uk.to/fullchain.pem") // Replace with your fullchain.pem file path
    // };

    // https.createServer(options, app).listen(PORT, () => {
    //   console.log(`HTTPS Server is running on port ${PORT}`);
    // });

    http.createServer(app).listen(PORT, () => {
      console.log(`HTTP Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
