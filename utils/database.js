const { Sequelize } = require("sequelize");

// const sequelize = new Sequelize(
//   "triangleindia_tours",
//   "root",
//   "1234",
//   {
//     dialect: "mysql",
//     host: "localhost",
//     port: 3306, // Ensure this is the correct port
//     // logging: false,
//   }
// );

// const sequelize = new Sequelize("triangleindia_tour", "root", "root", {
//   dialect: "mysql",
//   host: "localhost",
//   port: 3306, // Ensure this is the correct port
//   logging: false,
// });
const sequelize = new Sequelize("triangleindia_tour", "gaurav", "9800664253", {
  dialect: "mysql",
  host: "database-1.cpjefdwfpvhf.ap-south-1.rds.amazonaws.com",
  port: 3306, // Ensure this is the correct port
  logging: false,
});



module.exports = sequelize;
