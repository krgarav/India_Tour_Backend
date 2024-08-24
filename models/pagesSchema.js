const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");



const Pages = sequelize.define("Pages", {
 
  page: {
    type: DataTypes.STRING,
  },
 
});


module.exports = Pages;
