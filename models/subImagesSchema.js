const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");
const Tour = require("./tourSchema"); // Import the Tour model

const SubImages = sequelize.define('SubImages', {
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

SubImages.belongsTo(Tour, {
  foreignKey: 'tourId',
  onDelete: 'CASCADE',
});
Tour.hasMany(SubImages, {
  foreignKey: 'tourId',
});

module.exports = SubImages;
