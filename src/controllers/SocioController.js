//Tabela de socios
const connection= require('../database/connection');
const bcrypt= require('bcrypt');
const crypto= require('crypto');
const log= require('../utils/log');

module.exports={
    
    async index(req,res){
        const id = req.socio_id;
        const response= await connection('socios').where('id', id).select('*').first()
        
        return res.status(200).send(response);
        
    },

    async create(req,res){

        if(!req.files[0] || !req.files[1] ||!req.files[2]){
            return res.status(401).send({message: 'Coloque algum arquivo'})
        }

        const {nome,email,senha, cpf, rg, endereco, telefones}= req.body;
        const response= await connection('socios').where('email', email).select('email').first();

        if(response){
            return res.status(401).send({message: 'Usuario ja existente'});
        }
        
        const id= crypto.randomBytes(4).toString('hex');
        const hashed= await bcrypt.hash(senha, 10);


        await connection('socios').insert({
            id,
            nome,
            email,
            senha: hashed,
            cpf,
            rg,
            endereco,
            telefones
        })

        await connection('documentos').insert({
            rg: req.files[0].filename,
            cpf: req.files[1].filename,
            comprovante: req.files[2].filename,
            socio_id: id
        })
        return res.status(200).send({message: 'Socio cadastro com sucesso'});
        
    },

    async update(req,res){
        const id= req.socio_id;
        const {endereco, telefones, senha}=req.body;
        const hashed= await bcrypt.hash(senha,10);

        await connection('socios').where('id',id).update({
            endereco,
            telefones,
            senha: hashed
        })
        
        return res.status(200).send({message: 'Dados alterados com sucesso'});

    },  
    
    async delete(req,res){
        const socio_id= req.params.id;

        await connection('socios').where('id', socio_id).delete();
        await connection('dependentes').where('socio_id', socio_id).delete();

        log(`Deletou o socio de id=${socio_id}`, req.adm_id);

        return res.status(200).send({message: 'Socio deletado com sucesso'});

    },

    async index_socios(req,res){
        const {cpf='', page=1}=req.query;

        const [total]= await connection('socios').count();//Tira o array

        const response= await connection('socios')
        .join('documentos','documentos.socio_id', '=', 'socios.id')
        .where('socios.cpf', 'like', `%${cpf}%`)
        .select('documentos.id', 'socios.nome', 'socios.cpf', 'socios.endereco', 'socios.rg',
         'documentos.comprovante', 'socios.email', 'socios.id as socio_id', 'socios.confirmado', 
         'documentos.rg as imagem_rg', 'documentos.cpf as imagem_cpf','socios.telefones')
        .orderBy('documentos.id', 'desc') //Bem o id do socio é codificado entao fica ruim para ordernar
        .limit(10)
        .offset((page-1)*10)

        res.header('total-count', total['count(*)']);

        return res.status(200).send(response);

    },

    async confirm_socio(req,res){
        const socio_id=req.params.id;

        const response= await connection('socios').where('id', socio_id).select('cpf','confirmado').first();

        if(response.confirmado==1){
            return res.status(401).send({message: 'Este socio ja foi confirmado'});
        }

        await connection('socios').where('id', socio_id).update('confirmado', true);

        const now = new Date();
        const data_criacao= `${("0"+(now.getDate())).slice(-2)}/${("0"+(now.getMonth()+1)).slice(-2)}/${now.getFullYear()}`
        // const vencimento = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));//Vence ainda hoje
        // const data_vencimento= vencimento.getDate() + "/" + (vencimento.getMonth() + 1) + "/" + vencimento.getFullYear()

        await connection('faturas').insert({
            socio_id, cpf: response.cpf, status: 'pending', data_criacao,data_vencimento: data_criacao, renovada: 0
        })

        log(`Confirmou o socio de id=${socio_id}`, req.adm_id);

        return res.status(200).send({message: 'Socio confirmado com sucesso'});
    }
}