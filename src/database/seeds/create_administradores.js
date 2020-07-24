const bcrypt= require('bcrypt');
const senha= 'biscoito';


exports.seed= async function(knex){
    const hashed= await bcrypt.hash(senha, 10);

    return knex('administradores').del().then(()=>{
        return knex('administradores').insert({
            nome: 'joazim', email: 'joaobiscoito@gmail.com', senha: hashed
        })
    })
}