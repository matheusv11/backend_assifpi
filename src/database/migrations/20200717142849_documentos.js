
exports.up = function(knex) {
  return knex.schema.createTable('documentos', table=>{
      table.increments();
      table.string('rg_frente');
      table.string('rg_verso');
      table.string('cnh');
      table.string('comprovante_parentesco');
      table.string('cpf');
      table.string('comprovante');
      table.string('socio_id').references('id').inTable('socios')
      table.string('dependente_id').references('id').inTable('dependentes')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('documentos');
};
