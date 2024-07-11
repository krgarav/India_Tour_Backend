const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");
const Tour = require("../models/tourSchema");

const TourPackage = sequelize.define("TourPackage", {
  packageTitle: {
    type: DataTypes.STRING,
  },

  backgroundImage: {
    type: DataTypes.STRING,
  },

  homePageSection: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

// Tour.hasMany(TourPackage, {
//   foreignKey: "tourId",
//   onDelete: "CASCADE",
// });
// TourPackage.belongsTo(Tour, {
//   foreignKey: "tourId",
// });

module.exports = TourPackage;
