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

module.exports = TourPackage;
