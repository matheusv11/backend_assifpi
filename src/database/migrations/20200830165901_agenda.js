
exports.up = function(knex) {
  return knex.schema.createTable('agenda', table=>{
    table.increments();
    table.string('local').notNullable();
    table.date('data').notNullable();
    table.time('hora_inicio').notNullable();
    table.time('hora_fim').notNullable();
    table.string('participantes').notNullable();

    table.string('socio_id')
    .notNullable()
    .references('id')
    .inTable('socios')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

    table.string('status').defaultTo('esperando');
  });
};

exports.down = function(knex) {
 return knex.schema.dropTable('agenda');
};
