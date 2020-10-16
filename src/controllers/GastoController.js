const connection= require('../database/connection');
const log= require('../utils/log');

module.exports={
    async index(req,res){
        const response= await connection('gastos').select('*')

        return res.status(200).send(response);
    },

    async create(req,res){
        const {descricao, valor, data}=req.body;
        let inserted_id=0;

        if(process.env.NODE_ENV){
            const [insert]= await connection('gastos').insert({descricao, valor, data}).returning('id');
            inserted_id=insert;
        }else{
            const [insert]= await connection('gastos').insert({descricao, valor, data}).then(id=>{
                return id
            })
            inserted_id=insert;
        }

        log(`adicionou um gasto`, req.adm_id);
        return res.status(200).send({message: 'Gasto cadastrado com sucesso', id: inserted_id})
    },


    async delete(req,res){
        const id= req.params.id;

        await connection('gastos').where('id', id).delete();
        log(`deletou um gasto`, req.adm_id);  
        return res.status(200).send({message: 'Gasto deletado com sucesso'})
    }
}