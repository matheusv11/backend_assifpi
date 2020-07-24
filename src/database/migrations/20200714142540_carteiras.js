
exports.up = function(knex) {
  return knex.schema.createTable('carteiras', table=>{
    table.increments();
    table.date('data').notNullable();
    table.time('hora').notNullable();
    table.string('status').notNullable();
    table.string('socio_id').references('id').inTable('socios')
    table.string('dependente_id').references('id').inTable('dependentes')
    //Incompleta
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('carteiras');
};
