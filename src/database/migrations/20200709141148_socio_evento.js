
exports.up = function(knex) {
  return knex.schema.createTable('socio_evento', table=>{
    table.increments();
    table.string('socio_id').references('id').inTable('socios');
    
    table.integer('evento_id')
    .notNullable()
    .references('id')
    .inTable('eventos')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')  

  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('socio_evento');
};
