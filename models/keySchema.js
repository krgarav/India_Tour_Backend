const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");
const Meta = require("./keywordSchema");

const Keyword = sequelize.define("Keyword", {
    keyword: DataTypes.TEXT,
    metaId: {
        type: DataTypes.INTEGER,
        references: {
            model: Meta,
            key: 'id',
        },
    },
});
// Associations
Meta.hasMany(Keyword, { foreignKey: 'metaId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Keyword.belongsTo(Meta, { foreignKey: 'metaId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

module.exports = Keyword;
