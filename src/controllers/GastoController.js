const connection= require('../database/connection');

module.exports={
    async index(req,res){
        const response= await connection('gastos').select('*')

        return res.status(200).send(response);
    },

    async create(req,res){
        const {descricao, valor, data}=req.body;
        
        await connection('gastos').insert({descricao, valor, data})

        return res.status(200).send({message: 'Gasto cadastrado com sucesso'})
    },


    async delete(req,res){
        const id= req.params.id;

        await connection('gastos').where('id', id).delete();
        //Logs  
        return res.status(200).send({message: 'Gasto deletado com sucesso'})
    }
}