
exports.up = function(knex) {
    return knex.schema.createTable('ganhos', table=>{
      table.increments();
      table.float('valor').notNullable();
      table.date('data').notNullable();
    })
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('ganhos');
  };
  