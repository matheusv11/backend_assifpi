
exports.up = function(knex) {
  return knex.schema.createTable('socio_agenda', table=>{
    table.increments();
    table.string('socio_id').references('id').inTable('socios');
    table.string('agenda_id').references('id').inTable('agenda');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('socio_agenda');
};
