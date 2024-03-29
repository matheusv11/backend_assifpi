//Tabela de eventos
const connection = require("../database/connection");
const deleteFiles = require("../utils/deleteFiles");
const log= require('../utils/log');
const sendmail= require('../utils/mailer');

module.exports={
    
    async index(req,res){

        const {page=1}=req.query;

        const [total]= await connection('eventos').count('id as count');//Tira o array

        const response= await connection('eventos')
        .select('*')
        .limit(5)
        .offset((page-1)*5)
        .orderBy('id', 'desc');

        res.header('total-count', total['count']);

        return res.status(200).send(response);
    },

    async create(req,res){
        const {data,hora,local,titulo, descricao}=req.body;

        await connection('eventos').insert({
                data: !data ? null : data,  //Mudar
                hora: !hora ? null : hora,
                local,
                titulo,
                descricao,
                anexo: req.files.anexo ? req.files.anexo[0].filename : null,
                imagens: req.files.imagens ? req.files.imagens.map((img)=>{
                    return img.filename
                }).toString() : null
        })

        const emails= await connection('socios').where('confirmado',1).select('email');

        sendmail.event(emails.map((dados)=>{
            return dados.email
        }));
        
        log('criou um evento', req.adm_id);

        return res.status(200).send({message: 'evento criado com sucesso'})
        //Criar evento
    },
    
    async delete(req,res){
        //Pode verificar se o evento nao existir nao deletar
        //If return 0 nao existe
        const {id}= req.params;

        const documents= await connection('eventos').where('id',id).select('imagens','anexo'); //Verificar
        
        await connection('eventos').where('id', id).delete();
        
        deleteFiles(documents);
        log('deletou um evento', req.adm_id);

        return res.status(200).send({message: 'Evento deletado com sucesso'})
    
    }
}