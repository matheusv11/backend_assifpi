const knex= require('knex');
const config= require('../configs/knexfile');

const connection= knex(config.development);

module.exports= connection;


//cadastrar socio e dependente
//login socio e dependente
//editar socio e dependente 
//deletar socio e dependente