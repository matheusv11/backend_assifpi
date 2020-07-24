
exports.up = function(knex) {
  return knex.schema.createTable('socio_evento', table=>{
    table.increments();
    table.string('socio_id').references('id').inTable('socios');
    table.string('evento_id').references('id').inTable('eventos');  

  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('socio_evento');
};
