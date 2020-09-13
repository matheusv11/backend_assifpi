
exports.up = function(knex) {
  return knex.schema.createTable('logs', table=>{
    table.increments();
    table.date('data');
    table.time('hora');
    table.string('atividade');
    table.integer('adm_id').references('id').inTable('administradores');
    //Incompleto
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('logs');
};
