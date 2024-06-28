const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");
const Tour = require("./tourSchema");

const ItneryTour = sequelize.define('ItneryTour', { // Model name is required here
  title: {
    type: DataTypes.STRING,
    allowNull: false, // Add constraints as needed
  },
  desc: {
    type: DataTypes.STRING,
    allowNull: false, // Add constraints as needed
  },
  day: {
    type: DataTypes.STRING,
    allowNull: false, // Add constraints as needed
  },
  tourId: { // Define the foreign key in the model
    type: DataTypes.INTEGER,
    references: {
      model: Tour, // Reference the Tour model
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
});

// Define associations
Tour.hasOne(ItneryTour, {
  foreignKey: 'tourId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

ItneryTour.belongsTo(Tour, {
  foreignKey: 'tourId',
  onUpdate: 'CASCADE',
});

module.exports = ItneryTour;
