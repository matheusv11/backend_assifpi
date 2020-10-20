
exports.up = function(knex) {
  return knex.schema.createTable('documentos', table=>{
      table.increments();
      table.string('rg_frente');
      table.string('rg_verso');
      table.string('cnh');
      table.string('comprovante_parentesco');
      table.string('cpf');
      table.string('comprovante');
      table.string('autorizacao');
      table.string('filiacao');
      
      table.string('socio_id')
      .references('id')
      .inTable('socios')
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
  
      table.string('dependente_id')
      .references('id')
      .inTable('dependentes')
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('documentos');
};
