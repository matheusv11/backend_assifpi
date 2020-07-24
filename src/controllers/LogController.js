const connection= require('../database/connection');

module.exports={
    async index(req,res){
        const response= await connection('logs')
        .join('administradores','administradores.id','=','logs.adm_id')
        .select('administradores.nome','logs.data','logs.hora','logs.atividade');

        return res.status(200).send(response);
    }
}