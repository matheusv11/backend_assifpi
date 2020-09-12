//Tabela de dependentes
const connection= require('../database/connection');
const crypto= require('crypto');
const log= require('../utils/log');

module.exports={

    async index(req,res){
        //Listar todos depedentes de um socio especifico
        const id= req.socio_id; //Assim garanto que ele existe logo talvez nao seja necessario verificar sua validade

        const response= await connection('dependentes')
        .leftJoin('carteiras','carteiras.dependente_id','=','dependentes.id')
        .where('dependentes.socio_id', id)
        .select('dependentes.id','dependentes.nome','dependentes.email','dependentes.cpf'
        ,'dependentes.rg','dependentes.telefones',
        'dependentes.endereco','dependentes.confirmado','carteiras.status');
        //Posso alertar que nao tem nenhum dependente
        return res.status(200).send(response);
    },

    async create(req,res,next){
        //Criar um dependente associado a um socio

        // if(!req.files[0] || !req.files[1] || !req.files[2]){
        //     return res.status(401).send({message: 'Coloque algum arquivo'})
        // }
        if(!req.files.comprovante){
            return next({message:'Preencha todos arquivos necessários'})
        }

        const socio_id= req.socio_id;

        const {nome,email,cpf,rg,endereco, telefones}=req.body
        const response= await connection('dependentes').where('email', email).orWhere('cpf', cpf).select('email','cpf').first();

        if(response){
            return next({message:'Depedente já cadastrado'})
        }

        const id= crypto.randomBytes(4).toString('hex');

        await connection('dependentes').insert({
            id,
            nome,
            email,
            cpf,
            rg,
            endereco,
            telefones,
            socio_id
        })

        await connection('documentos').insert({
            // rg: req.files[0].filename,
            comprovante_parentesco: req.files.comprovante[0].filename,
            // cpf: req.files[1].filename,
            // comprovante: req.files[2].filename,
            dependente_id: id
        })

        return res.status(200).send({message: 'Dependente cadastrado com sucesso'})
    },

    async delete(req,res){
        const socio_id= req.socio_id;
        const id= req.params.id;

        await connection('dependentes').where('id', id).andWhere('socio_id', socio_id).delete(); //Posso retornar erro caso tente deletar alguem que nao pertence a ele

        return res.status(200).send({message: 'Dependente deletado com sucesso'})
        //Deletar depedente de um socio
    },

    async confirm_dependente(req,res){
        const dependente_id=req.params.id;

        await connection('dependentes').where('id', dependente_id).update('confirmado', true);

        log(`Confirmou o dependente de id=${dependente_id}`, req.adm_id);

        return res.status(200).send({message: 'Dependente confirmado com sucesso'});
    },

    async index_dependentes(req,res){

        const {cpf='', page=1}= req.query;

        const [total]= await connection('dependentes').count();//Tira o array

        const response= await connection('dependentes')
        .join('documentos','documentos.dependente_id','=','dependentes.id')
        // .where('dependentes.cpf','like',`%${cpf}%`)
        .join('socios','socios.id','=','dependentes.socio_id')
        .where('socios.cpf','like',`%${cpf}%`)
        .select('documentos.id','dependentes.nome', 'dependentes.cpf', 'dependentes.endereco', 'dependentes.rg',
        'documentos.comprovante', 'dependentes.email', 'dependentes.id as dependente_id', 'dependentes.confirmado', 
        'documentos.comprovante_parentesco', 'dependentes.telefones')
        .orderBy('documentos.id', 'desc') //Bem o id do socio é codificado entao fica ruim para ordernar
        .limit(10)
        .offset((page-1)*10)

        res.header('total-count', total['count(*)']);

        return res.status(200).send(response)
    },

    async deleteDependente(req,res){
        //Log
        const dependente_id= req.params.id;

        await connection('dependentes').where('id', dependente_id).delete();

        log(`Deletou o dependente de id ${dependente_id}`, req.adm_id);
        return res.status(200).send({message: 'Dependente deletado com sucesso'})
    }
}

