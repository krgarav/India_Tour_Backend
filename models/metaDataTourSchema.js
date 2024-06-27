const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const TourData = sequelize.define("TourData", {
  fullDescription: {
    type: DataTypes.TEXT,
  },
  amenities: {
    type: DataTypes.JSON,
  },
});

module.exports = TourData;
