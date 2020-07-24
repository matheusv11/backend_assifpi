
exports.up = function(knex) {
  return knex.schema.createTable('documentos', table=>{
      table.increments();
      table.string('rg').notNullable();
      table.string('cpf').notNullable();
      table.string('comprovante').notNullable();
      table.string('socio_id').references('id').inTable('socios')
      table.string('dependente_id').references('id').inTable('dependentes')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('documentos');
};
