const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const SubImages = sequelize.define({
  imageName: {
    type: DataTypes.STRING,
  },
});

module.exports = SubImages;
