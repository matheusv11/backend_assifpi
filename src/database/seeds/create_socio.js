const bcrypt= require('bcrypt');
const senha= 'laranja';


exports.seed= async function(knex){
    const hashed= await bcrypt.hash(senha, 10);

    return knex('socios').then(()=>{
        return knex('socios').insert({
            id: 25,
            nome: "joaolaranja",
            email:"joaolaranja@gmail.com",
            senha: hashed,
            cpf: "12451521432",
            rg:"123245565",
            endereco:"assa",
            telefones:"8988191796,8688179520",
            confirmado: 1
        })
    })
}