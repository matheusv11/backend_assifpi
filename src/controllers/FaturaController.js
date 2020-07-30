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
        // Dados do pagamento //Logo so numeros // Mostrar por mes os recebimentos
        //Pode percorrer todos meses e retornar um array com a posicao deles
        //Usar index //Evitar split assim  //E la na frente pegar a posicao pela data -1 
        // total['sum(`recebido`)']

        const [total]= await connection('faturas').where('faturas.status', 'accepted').andWhere('renovada', 1).sum('recebido');
        const meses= await connection('faturas').select('data_criacao').distinct();

        const data= meses.map(async meses=>{
            const ok= await connection('faturas').where('data_criacao', meses.data_criacao).sum('recebido')
            return ok
        }) //Passar isso pra uma funcao de promise


        // Promise.all(data).then((dados)=>{
        //     // console.log(dados)
        // })
        // const meses= await connection('faturas').whereIn('faturas.data_criacao', ['29/7/2020', '30/7/2020']).select('recebido')
        
        return res.json(data);
        
        // return res.status(200).send({
        //     meses:[]
        // });
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