const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");
const Tour = require("./tourSchema");

const Inclusion = sequelize.define("Inclusion", {
  serialNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  inclusion: {
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

Tour.hasMany(Inclusion, {
  foreignKey: "tourId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Inclusion.belongsTo(Tour, {
  foreignKey: "tourId",
  onUpdate: "CASCADE",
});

module.exports = Inclusion;
