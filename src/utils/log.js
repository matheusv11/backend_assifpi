const connection= require('../database/connection');

module.exports= async (atividade, adm_id)=>{

    const now= new Date();
    const data= `${now.getDay()}/${now.getMonth()}/${now.getFullYear()}`
    const hora= `${now.getHours()}:${now.getMinutes()}`;

    await connection('logs').insert({
        data,hora, atividade, adm_id
    })

}