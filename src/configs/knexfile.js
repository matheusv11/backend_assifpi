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

  production:{
    client: 'pg',
    // connection:{
    //   host: process.env.APP_DATABASE_HOST,
    //   user: process.env.APP_DATABASE_USER,
    //   password: process.env.APP_DATABASE_PASSWORD,
    //   database: process.env.APP_DATABASE,
    // },
    // connection:{
      // database: `${process.env.DATABASE_URL}`,
    // },

    connection: process.env.DATABASE_URL,

    pool:{
      min:2,
      max:10
    },
    migrations:{
      directory: '../database/migrations'
    },
    
    useNullAsDefault: true

  },
  
};
