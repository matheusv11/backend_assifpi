const connection= require('../database/connection');
const axios= require('axios');
const mercadopago = require ('mercadopago');
const test_token= 'TEST-7299947505493806-072301-a203cd55e08507243af00f152f981e14-223033116'
// const produc_token= 'APP_USR-7299947505493806-072301-64bc40a25eb38aa61625953a56a198e6-223033116'
const produc_token= 'APP_USR-7254907496015842-072301-a78b3b8e3f32e66b1d9b591207db3caa-613885036'

module.exports={
    async index(req,res){
        const response= await connection('faturas')
        .join('socios', 'socios.id', '=', 'faturas.socio_id')
        .where('faturas.status', 'pending').andWhere('faturas.renovada', 1).select('socios.nome','socios.cpf').distinct();//Evitar dados repetido
        //Condicoes pra recusada ainda
        return res.status(200).send(response);
    },

    async index_socio_fatura(req,res){
        const socio_id= req.socio_id;

        const response= await connection('faturas').where('socio_id', socio_id).select('*');

        return res.status(200).send(response);
    },

    async index_pagamentos(req,res){
        return new Promise(async resolve=>{
            const [total]= await connection('faturas').where('faturas.status', 'accepted').andWhere('renovada', 1).sum('recebido');
            
            const meses= await connection('faturas').select('data_criacao').distinct(); //Aqui ja pegar o mes
            const data= meses.map(async meses=>{
                const parts= meses.data_criacao.split('/');
                // const parts= meses.split('/') // Podia ser por fora mas fica mais facil assim;
                // const [ok]= await connection('faturas').where(connection.raw((`data_criacao`)), meses.data_criacao).sum(`recebido as total_de_${meses.data_criacao}`)
                // const [ok]= await connection('faturas').where('data_criacao', parts[1]).sum(`recebido as total_de_${meses.data_criacao}`)

                // const [ok]= await connection('faturas').where('data_criacao', `%?%/7/2020`).select('recebido')
                const [ok]= await connection('faturas').select('recebido').whereRaw(`strftime('%m', data_criacao) = 7`)
                console.log(ok)
                // qb.select(knex.raw('EXTRACT(MONTH FROM ??)', 'lastPaymentDate'))

                // const [ok]= await connection.raw(`select recebido from faturas where data_criacao`)
                return ok
            })
            
            resolve(data);
            
        }).then((dados)=>{
            Promise.all(dados).then((tudo)=>{
                return res.json(tudo)
            })
        })

    },

    async create(req,res){
        const socio_id= req.socio_id;
        const id= req.params.id;//Id da fatura

        mercadopago.configure({access_token: test_token});

        const preference = {
        items: [
            {
            title: 'Produto de teste em producao',
            unit_price: 5,
            quantity: 1,
            }
        ],


        external_reference: `${socio_id}-${id}`,
        back_urls: {
            success: "http://localhost:3000/perfil",
            failure: "http://localhost:3000/perfil",
            pending: "http://localhost:3000/perfil"
        },
        auto_return: "approved",
        notification_url: "https://backend-assifpi.herokuapp.com/notifications", //Update

        };

        mercadopago.preferences.create(preference)
        .then(function(response){
            return res.json(response)
        
        }).catch(function(error){
            console.log(error);
        });
    },

    async notifications(req,res){
        console.log(req.body)

        axios.get(`https://api.mercadopago.com/v1/payments/${req.body.data.id}?access_token=${test_token}`).then(async(dados)=>{
            console.log(dados.data)
            let external= dados.data.external_reference
            let parts= external.split('-')

            await connection('faturas').where('socio_id', parts[0]).andWhere('id', parts[1]).update({
                status: dados.data.status, boleto: dados.data.transaction_details.external_resource_url,
                compra_id: dados.data.id, valor: dados.data.transaction_details.net_received_amount//Valor com os 5%
            })

            return res.status(200).send();

        }).catch((err)=>{
            console.log(err)
        });

        return res.status(200).send();

    }
}