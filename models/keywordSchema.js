const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");
const Tour = require("./tourSchema");
const TourData = require("./metaDataTourSchema");
const TourPackage = require("./tourPackageSchema");

const Meta = sequelize.define("Meta", {
    label: {
        type: DataTypes.TEXT,
    },
    pageId: {
        type: DataTypes.INTEGER,
    },
    description: {
        type: DataTypes.TEXT,
    },

});


module.exports = Meta;
