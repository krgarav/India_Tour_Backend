const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Tour = sequelize.define("Tour", {
  tourTitle: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  miniTourDesc: {
    type: DataTypes.STRING,
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
  tourLocation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  topDeals: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5,
    },
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
