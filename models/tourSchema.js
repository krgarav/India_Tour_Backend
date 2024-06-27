const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Tour = sequelize.define('Tour', {
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
  tourImages: {
    type: DataTypes.JSON,
    allowNull: true, // Can be null if no additional images are uploaded
  },
  tourPrice: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tourDuration: {
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
