const knex= require('knex');
const config= require('../configs/knexfile');

const connection= knex(config.development);

module.exports= connection;
