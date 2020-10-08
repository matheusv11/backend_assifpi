//Tabela de adm
const connection= require('../database/connection');
const bcrypt= require('bcrypt');
const log= require('../utils/log');

module.exports={
    async index(req,res){
        const response= await connection('administradores').select('*');

        return res.status(200).send(response);
    },

    async create(req,res){
        //Criar um adm
        const {nome,email,senha}=req.body
        const hashed= await bcrypt.hash(senha, 10);

        const response= await connection('administradores').where('email', email).select('id').first();

        if(response){
            return res.status(401).send({message: 'Administrador já cadastrado'})
        }
        //Pode fazer if pra verificar se ja existe mas ja que se trata de um adm espera-se que ele nao faça merda
        await connection('administradores').insert({
            nome,
            email,
            senha: hashed
        })

        log(`cadastrou o administrador ${nome}`, req.adm_id);

        return res.status(200).send({message: 'Administrador cadastrado com sucesso'})
    },

    async delete(req,res){
        //Deletar adm
        const id= req.params.id;
        const {adm}= await connection('administradores').where('id',id).select('nome as adm').first();        

        await connection('administradores').where('id', id).delete();

        log(`deletou o administrador ${adm}`, req.adm_id);

        return res.status(200).send({message: 'Administrador deletado com sucesso'})
    }
}