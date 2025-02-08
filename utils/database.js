const { Sequelize } = require("sequelize");
const path = require("path");
const dotenv = require("dotenv");
const fs = require('fs');
dotenv.config();
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


// const sequelize = new Sequelize(
//   "triangleindia_tours",
//   "triangleindia_tours",
//   "CuE2JpGaYhM4",
//   {
//     dialect: "mysql",
//     host: "triangleindiatours.com",
//     port: 3306, // Ensure this is the correct port
//     logging: false,
//   }
// );

const caCertPath = path.join(__dirname, "../", "ca.pem");
const caCert = fs.readFileSync(caCertPath);

// Sequelize Configuration
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DBUSERNAME, process.env.DBPASSWORD, {
    host: process.env.DBHOSTNAME,
    dialect: 'mysql',
    port: 26370,
    dialectOptions: {
        ssl: {
            ca: caCert
        }
    }
});

module.exports = sequelize;
