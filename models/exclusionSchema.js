const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");
const Tour = require("./tourSchema");

const Exclusion = sequelize.define("Exclusion", {
  serialNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  exclusion: {
    type: DataTypes.TEXT,
    allowNull: false, // Add constraints as needed
  },

  tourId: {
    // Define the foreign key in the model
    type: DataTypes.INTEGER,
    references: {
      model: Tour, // Reference the Tour model
      key: "id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
});

Tour.hasMany(Exclusion, {
  foreignKey: "tourId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Exclusion.belongsTo(Tour, {
  foreignKey: "tourId",
  onUpdate: "CASCADE",
});

module.exports = Exclusion;
