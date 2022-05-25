const Sequelize = require('sequelize');

const sequelize = new Sequelize("new_inventory","root","",{
    dialect:'mysql',
    host:'localhost',
});

module.exports = sequelize;