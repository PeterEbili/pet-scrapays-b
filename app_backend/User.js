const {Model, DataTypes} = require('sequelize');
const sequelize = require('./database');

class User extends Model {}

User.init({ 
        username: {
          type: DataTypes.STRING,
          required: true,
        },
        email: {
            type: DataTypes.STRING,
            required: true,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            required: true,
        },
    },{sequelize, modelName:'user'})


module.exports = User;