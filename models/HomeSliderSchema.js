const { Sequelize } = require("sequelize");
const sequelize = require("../utils/database");

const homeSliderSchema=sequelize.define("homeSlider",{
    imgPath:{
        type:Sequelize.STRING,
        allowNull:false
    },
    Title:{
        type:Sequelize.STRING,
        allowNull:false
    },
    subTitle:{
        type:Sequelize.STRING,
        allowNull:false  
    }
})
module.exports=homeSliderSchema