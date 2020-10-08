const connection= require('../database/connection');

module.exports= async (atividade, adm_id)=>{

    const now= new Date();
    const data= now.toISOString().substr(0,10)
    const hora= `${('0'+now.getHours()).slice(-2)}:${('0'+now.getMinutes()).slice(-2)}`

    const {adm}= await connection('administradores').where('id', adm_id).select('nome as adm').first();
    const newAcitvity= `O administrador ${adm} ${atividade}`;

    await connection('logs').insert({
        data,hora, atividade: newAcitvity
    })

}