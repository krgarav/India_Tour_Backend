const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");
const Tour = require("./tourSchema");
const TourData = require("./metaDataTourSchema");
const TourPackage = require("./tourPackageSchema");

const Meta = sequelize.define("Meta", {
    pageId: {
        type: DataTypes.INTEGER,
    },

    keyword: {
        type: DataTypes.TEXT,
    },
    description: {
        type: DataTypes.TEXT,
    },

});

// Tour.hasMany(Meta, {
//     foreignKey: "pageId",
//     onDelete: "CASCADE",
//     onUpdate: "CASCADE",
// });

// Meta.belongsTo(Tour, {
//     onUpdate: "CASCADE",
//     onDelete: "CASCADE",
// });
// TourPackage.hasMany(Meta, {
//     foreignKey: "pageId",
//     onDelete: "CASCADE",
//     onUpdate: "CASCADE",
// });

// Meta.belongsTo(TourPackage, {
//     onUpdate: "CASCADE",
//     onDelete: "CASCADE",
// });

module.exports = Meta;
