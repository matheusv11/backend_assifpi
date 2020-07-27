//Tabela de eventos
const connection = require("../database/connection");
const log= require('../utils/log');

module.exports={
    
    async index(req,res){
        //Listar eventos
        const response= await connection('eventos').select('*').orderBy('id', 'desc');

        return res.status(200).send(response);
    },

    async create(req,res){
        const {data,hora,local,titulo, descricao}=req.body

        await connection('eventos').insert({
            data,
            hora,
            local,
            titulo,
            descricao
        })

        log('Criou um evento', req.adm_id);

        return res.status(200).send({message: 'evento criado com sucesso'})
        //Criar evento
    },
    
    async delete(req,res){
        //Deletar evento 
        //Pode verificar se o evento nao existir nao deletar
        //If return 0 nao existe
        const {id}= req.params;
        await connection('eventos').where('id', id).delete();

        log('Deletou um evento', req.adm_id);

        return res.status(200).send({message: 'Evento deletado com sucesso'})
    
    }
}