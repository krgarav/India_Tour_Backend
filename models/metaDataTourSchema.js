const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const TourData = sequelize.define({
  fullDescription: {
    type: DataTypes.STRING,
  },
  amenities: {
    type: DataTypes.STRING,
  },
});

module.exports = TourData;
