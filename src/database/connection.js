const knex= require('knex');
const config= require('../configs/knexfile');

const connection= knex(process.env.NODE_ENV=="production" ? config.production : config.development);

// const connection= knex(config.development);

module.exports= connection;
