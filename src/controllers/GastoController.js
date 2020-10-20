const connection= require('../database/connection');
const log= require('../utils/log');

module.exports={
    async index(req,res){

        const {page=1}=req.query;

        const [total]= await connection('gastos').count('id as count');//Tira o array //Or [{total}]

        const response= await connection('gastos')
        .select('*')
        .limit(5)
        .offset((page-1)*5)
        .orderBy('id', 'desc');

        res.header('total-count', total['count']);

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