
exports.up = function(knex) {
  return knex.schema.createTable('eventos', table=>{
    table.increments();
    table.date('data');
    table.time('hora');
    table.string('local');
    table.string('titulo').notNullable();
    table.string('descricao').notNullable();
    table.string('imagens');
    table.string('anexo');

  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('eventos');
};
