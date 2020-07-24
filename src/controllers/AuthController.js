//Validacao de dados das tabelas administradores e socios
const connection= require('../database/connection');
const bcrypt= require('bcrypt');
const jwt= require('jsonwebtoken');
const log= require('../utils/log');

module.exports={
  
    async authSocio(req,res){
        const {email,senha}=req.body;

        const response= await connection('socios').where('email', email).select('id', 'senha', 'confirmado').first();
        

        if(!response || ! await bcrypt.compare(senha, response.senha) ){
            return res.status(401).send({message: 'Email ou senha incorretos'});
        }

        if(!response.confirmado){
            return res.status(401).send({message: 'Voce precisa ser autorizado para entrar no sistema'})
        }

        const token= jwt.sign({id: response.id}, 'secret', {
            expiresIn: '180min'
        });

        return res.status(200).send({token});
   
    },
    
    async authAdm(req,res){
        const {email,senha}=req.body;

        const response= await connection('administradores').where('email',email).select('id','senha').first();

        if (!response || ! await bcrypt.compare(senha,response.senha)){
            return res.status(401).send({message:'Email ou senha incorretos'});
        }

        const token=jwt.sign({id:response.id},'adm',{
            expiresIn:'180min'
        });

        log('Entrou no sistema', response.id);

        return res.status(200).send({token});



    },

  
}