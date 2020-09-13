
exports.up = function(knex) {
    return knex.schema.createTable('dependentes', table=>{
        table.string('id').primary().notNullable();
        table.string('nome').notNullable();
        table.string('email').notNullable();
        table.string('cpf').notNullable();
        table.string('rg').notNullable();
        table.string('endereco').notNullable();
        table.string('telefones').notNullable();
        table.string('socio_id').references('id').inTable('socios');
        table.boolean('confirmado').defaultTo(false);
      });
};

exports.down = function(knex) {
  return knex.schema.dropTable('dependentes');
};
