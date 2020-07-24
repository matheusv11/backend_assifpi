const connection= require('../database/connection');
const log= require('../utils/log');

module.exports={
    async index(req,res){
        const {cpf=''}= req.query

        const response_socios= await connection('carteiras')
        .join('socios', 'socios.id', '=', 'carteiras.socio_id')
        .andWhereNot('status','confeccionada')
        .where('cpf', 'like', `%${cpf}%`)
        .select('socios.id','nome','email','cpf','rg')

        const response_dependentes= await connection('carteiras')
        .join('dependentes', 'dependentes.id', '=', 'carteiras.dependente_id')
        .where('cpf', 'like', `%${cpf}%`)
        .andWhereNot('status','confeccionada')
        .select('dependentes.id','nome', 'email', 'cpf','rg')
        //Unico problema é que no front vai vir primeiro os socios mas blz fazer busca
        return res.status(200).send({
            socios: response_socios, dependentes: response_dependentes
        });
    },

    async create(req,res){
        const socio_id= req.socio_id;
        const now= new Date();
        const data= `${now.getDay()}/${now.getMonth()}/${now.getFullYear()}`
        const hora= `${now.getHours()}:${now.getMinutes()}`;

        const response= await connection('carteiras').where('socio_id', socio_id).select('socio_id').first();

        if(response){
            return res.status(401).send({message: 'Sua carteira ja foi solicitada'})
        }

        await connection('carteiras').insert({
            data,
            hora,
            status: 'solicitada',
            socio_id
        });

        return res.status(200).send({message: 'Carteira solicitada com sucesso'});
    },

    async create_dependente(req,res){
        const dependente_id= req.params.id;

        const now= new Date();
        const data= `${now.getDay()}/${now.getMonth()}/${now.getFullYear()}`
        const hora= `${now.getHours()}:${now.getMinutes()}`;
        //Posso verificar ainda se esse dependente existe mesmo
        const response= await connection('carteiras').where('dependente_id', dependente_id).select('dependente_id').first();

        if(response){
            return res.status(401).send({message: 'A carteira de seu dependente ja foi solicitada'})
        }

        await connection('carteiras').insert({
            data,hora,status:'solicitada',dependente_id
        });

        return res.status(200).send({message: 'Carteira do dependente solicitada com sucesso'});

    },


    async index_carteira_socio(req,res){
        const socio_id= req.socio_id;

        const response= await connection('carteiras').where('socio_id', socio_id)
        .select('status').first();

        return res.status(200).send(response);
    },

    async index_carteira_dependente(req,res){
        const dependente_id= req.params.id
        
        const response= await connection('carteiras').where('dependente_id', dependente_id)
        .select('status').first();

        // const dependente_id= req.params.id;
        // //Pegar estado da carteira de todos dependentes x
        // const response= await connection('carteiras').where('dependente_id', dependente_id)
        // .select('status').first();


        return res.status(200).send(response);
    },

    async change_carteira_socio(req,res){
        const socio_id= req.params.id;

        await connection('carteiras').where('socio_id', socio_id).update({status:'confeccionada'})
        
        log(`Alterou os status da carteira do socio de id=${socio_Id}`, req.adm_id)
        
        return res.status(200).send({message: 'Confirmado a confeccao da carteira do socio'});
    },

    async change_carteira_dependente(req,res){
        const dependente_id= req.params.id;

        await connection('carteiras').where('dependente_id', dependente_id).update({status:'confeccionada'})
        
        log(`Alterou os status da carteira do dependente de id=${dependente_id}`, req.adm_id)

        return res.status(200).send({message: 'Confirmado a confeccao da carteira do dependente'});
    }
}