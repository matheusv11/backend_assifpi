
exports.up = function(knex) {
  return knex.schema.createTable('convenios', table=>{
    table.increments();
    table.string('titulo').notNullable();
    table.string('descricao').notNullable();
    table.string('imagem')

  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('convenios')
};
