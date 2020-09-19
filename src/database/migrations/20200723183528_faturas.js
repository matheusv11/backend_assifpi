
exports.up = function(knex) {
    return knex.schema.createTable('faturas', table=>{
        table.increments();
        table.string('socio_id').references('id').inTable('socios')
        table.string('compra_id');
        table.string('cpf');
        table.string('status');
        table.string('boleto');
        table.date('data_criacao');
        table.date('data_vencimento');
        table.boolean('renovada');
        table.float('valor');
        table.float('recebido');
    })
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('faturas');
  };
  