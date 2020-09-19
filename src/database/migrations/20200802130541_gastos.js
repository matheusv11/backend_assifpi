
exports.up = function(knex) {
  return knex.schema.createTable('gastos', table=>{
    table.increments();
    table.string('descricao')
    table.float('valor')
    table.date('data')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('gastos');
};
