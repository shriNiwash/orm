const Sequelize = require('sequelize');
const sequelize = require('../model/Dbconnection');

const Book = sequelize.define('book',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        unique:true,
        primaryKey: true,
    },
    name:{
        type:Sequelize.STRING,
        allowNull:false,
    },
    sold:{
        type:Sequelize.INTEGER,
        allowNull:false,
    },
    image:{
        type:Sequelize.STRING,
        allowNull:false,
    }
})

module.exports= Book;