// Update with your config settings.
const path= require('path');


module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: path.resolve(__dirname, '../database/db.sqlite')
    },

    migrations: {
      directory: '../database/migrations'
    },

    seeds:{
      directory: '../database/seeds'
    },
    
    useNullAsDefault: true

  },

  making:{
    client: 'mysql',
    connection:{
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'lemon',
    },
    migrations:{
      directory: './src/database/migrations'
    },
  },
  
};
