const connection= require('../database/connection');
const log= require('../utils/log');

module.exports={
    async index(req,res){
        const response= await connection('convenios').select('*');

        return res.status(200).send(response);
    },

    async create(req,res){
        const {titulo,descricao}=req.body;
        //Temporario
        log(`Criou um convenio`, req.adm_id);

        if(req.files[0]){
            await connection('convenios').insert({
                titulo,descricao,imagem: req.files[0].filename
            })

            return res.status(200).send({message: 'Convenio criado com sucesso',imagem: req.files[0].filename}); //Pegar url da imagem pra exibir mas melhorar isso
        }
        else{
            await connection('convenios').insert({
                titulo,descricao
            })

            return res.status(200).send({message: 'Convenio criado com sucesso'});   
        }


    },

    async delete(req,res){
        const convenio_id= req.params.id;

        await connection('convenios').where('id', convenio_id).delete();

        log(`Deletou um convenio`, req.adm_id);

        return res.status(200).send({message: 'Convenio deletado com sucesso'});
    }
}