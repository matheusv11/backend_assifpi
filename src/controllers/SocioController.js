//Tabela de socios
const connection= require('../database/connection');
const bcrypt= require('bcrypt');
const crypto= require('crypto');
const sendmail= require('../utils/mailer');
const log= require('../utils/log');

module.exports={
    
    async index(req,res){
        const id = req.socio_id;
        const response= await connection('socios').where('id', id).select('*').first()
        
        return res.status(200).send(response);
        
    },

    async create(req,res){
        let compare= ''; 
        const cnh= req.files.cnh;
        const rg_file= req.files.rg_file;
        cnh ? compare=cnh : compare=rg_file;

        // console.log(req.files.cpf_comprovante);//Falta as posicoes

        if(!req.files.cpf_comprovante || !req.files.cpf_comprovante || !compare){
            return res.status(401).send({message: 'Preencha todos arquivos necessários'});
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
            // rg_frente: req.files.rg[0].filename || null,
            rg_frente: req.files.rg_file ? req.files.rg_file[0].filename : null,
            rg_verso: req.files.rg_file ? req.files.rg_file[1].filename : null,
            cnh: req.files.cnh ? req.files.cnh[0].filename : null,
            cpf: req.files.cpf_comprovante[0].filename,
            comprovante: req.files.cpf_comprovante[1].filename,
            autorizacao: req.files.autorizacao_filiacao ? req.files.autorizacao_filiacao[0].filename : null,
            filiacao: req.files.autorizacao_filiacao ? req.files.autorizacao_filiacao[1].filename : null,
            socio_id: id
        })
        return res.status(200).send({message: 'Solicitacao de cadastro realizada com sucesso'});
        
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
         'documentos.rg_frente', 'documentos.rg_verso', 'documentos.cpf as imagem_cpf', 'socios.pagamento',
         'documentos.cnh', 'socios.telefones', 'documentos.autorizacao','documentos.filiacao')
        .orderBy('documentos.id', 'desc') //Bem o id do socio é codificado entao fica ruim para ordernar
        .limit(10)
        .offset((page-1)*10)

        res.header('total-count', total['count(*)']);

        return res.status(200).send(response);

    },

    async confirm_socio(req,res){
        const socio_id=req.params.id;
        const presencial= req.query.presencial;
        const response= await connection('socios').where('id', socio_id).select('cpf','confirmado','email').first();

        if(response.confirmado==1){
            return res.status(401).send({message: 'Este socio ja foi confirmado'});
        }

        await connection('socios').where('id', socio_id).update({
            confirmado: true, pagamento: presencial
        }); //

        if(presencial==="mercadopago"){
            const now = new Date();
            const data_criacao= `${("0"+(now.getDate())).slice(-2)}/${("0"+(now.getMonth()+1)).slice(-2)}/${now.getFullYear()}`
    
            await connection('faturas').insert({
                socio_id, cpf: response.cpf, status: 'pending', data_criacao,data_vencimento: data_criacao, renovada: 0
            })
            
        }
        sendmail.confirm(response.email);
        log(`Confirmou o socio de id=${socio_id}`, req.adm_id);

        return res.status(200).send({message: 'Socio confirmado com sucesso'});
    },

    async request(req,res){
        const {email}= req.body;

        const verify= await connection('socios').where('email',email).select('email').first();

        if(!verify){
            return res.status(401).send({message: 'Este email não consta no sistema'});
        }
        sendmail.recover(email);

        return res.status(200).send({message: 'Email de recuperação enviado com sucesso'});
    },

    async recover(req,res){
        const email= req.recover_email;
        const {senha}= req.body;
        const hashed= await bcrypt.hash(senha,10);

        await connection('socios').where('email', email).update('senha', hashed);

        return res.status(200).send({message: 'Senha atualizada com sucesso'});
        // console.log(req.params.token);
        //Ou authorization;
        //Poderia ter um catch
    }
}