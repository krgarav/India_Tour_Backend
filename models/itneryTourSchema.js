const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const ItneryTour = sequelize.define({
  title: {
    type: DataTypes.STRING,
  },

  desc: {
    type: DataTypes.STRING,
  },

  days: {
    type: DataTypes.STRING,
  },
});

module.exports = ItneryTour;
