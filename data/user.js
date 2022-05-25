const Sequelize = require('sequelize');
const sequelize = require('../model/Dbconnection');

const User = sequelize.define('user',{
    username:{
        type:Sequelize.STRING,
        allowNull:false,

    },
    password:{
        type:Sequelize.STRING,
        allowNull:false
    }
})

module.exports= User;