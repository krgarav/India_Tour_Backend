const { Sequelize } = require("sequelize");

// const sequelize = new Sequelize(
//   "triangleindia_newtable",
//   "triangleindia_gaurav",
//   "9800664253Kg@",
//   {
//     dialect: "mysql",
//     host: "triangleindiatours.com",
//     port: 3306, // Ensure this is the correct port
//     logging: false,
//   }
// );

const sequelize = new Sequelize("triangleindia_tour", "root", "root", {
  dialect: "mysql",
  host: "localhost",
  port: 3306, // Ensure this is the correct port
  logging: false,
});

module.exports = sequelize;
