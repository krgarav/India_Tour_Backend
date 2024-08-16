const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");
const Tour = require("./tourSchema");

const Highlights = sequelize.define("Highlights", {
  serialNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  highlight: {
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

Tour.hasMany(Highlights, {
  foreignKey: "tourId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Highlights.belongsTo(Tour, {
  foreignKey: "tourId",
  onUpdate: "CASCADE",
});

module.exports = Highlights;
