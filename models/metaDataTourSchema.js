const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");
const Tour = require("./tourSchema");

const TourData = sequelize.define("TourData", {
  fullDescription: {
    type: DataTypes.TEXT,
  },
  luxuryHotel: {
    type: DataTypes.BOOLEAN,
  },
  wifi: {
    type: DataTypes.BOOLEAN,
  },
  transport: {
    type: DataTypes.BOOLEAN,
  },
  fooding: {
    type: DataTypes.BOOLEAN,
  },
  others: {
    type: DataTypes.STRING,
  },
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

module.exports = TourData;
