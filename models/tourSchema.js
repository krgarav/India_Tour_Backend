const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Tour = sequelize.define("Tour", {
  tourTitle: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  miniTourDesc: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  tourTitleImage: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  tourPrice: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tourDurationDay: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tourDurationNight: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tourLocationCity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tourLocationState: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  topDeals: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  rating: {
    type: DataTypes.INTEGER,
  },
  stars: {
    type: DataTypes.FLOAT,
    validate: {
      min: 0,
      max: 5,
    },
  },
});

module.exports = Tour;
