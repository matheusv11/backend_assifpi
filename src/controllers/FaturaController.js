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
            const {ano="2020"}= req.query; 
            
            const anos= await connection('faturas').where('renovada', 1)
            .select(connection.raw(`strftime('%Y', substr(data_criacao, 7, 4) || '-' || substr(data_criacao, 4, 2) || '-' || substr(data_criacao, 1, 2)) as ano`)) //Verificar se esse formato ta com mes e dia correto //ex: https://stackoverflow.com/questions/14091183/sqlite-order-by-date1530019888000
            .distinct(); //Ou fazia split //Por conta o strftime tenho que ter 0
            //Gastos //Usuarios esperando confeccao //Usuarios esperanndo validacao            

            const meses= await connection('faturas')
            .where('renovada', 1)
            .andWhere(connection.raw(`strftime('%Y', substr(data_criacao, 7, 4) || '-' || substr(data_criacao, 4, 2) || '-' || substr(data_criacao, 1, 2))`),ano) //Selecionar o ano
            .orderBy(connection.raw('substr(data_criacao, 4, 2)'), 'asc') //Muito bacana //Alterar depois nos outros
            .select('data_criacao').distinct(); //OU SELECT PELO MES //Pode encapsular pro split teste slice //Poderia funcionar pras data talvez
            //01/04/2020
            //0,1,2,3,4
            const todo_meses= meses.map(meses=>{
                let ok= meses.data_criacao.split('/')
                return `${ok[1]}/${ok[2]}`//Podia fazer 
            });
    
            const unico = todo_meses.filter(function(elem, index, self) {
                return index === self.indexOf(elem); //Evitar dados repetidos
            });

            const meses_anos= unico.map(async datas=>{
                const [ok]= await connection('faturas')
                .where(connection.raw(`strftime('%m/%Y', substr(data_criacao, 7, 4) || '-' || substr(data_criacao, 4, 2) || '-' || substr(data_criacao, 1, 2))`),datas)
                // .sum(`recebido as total de ${datas}`)//SumDistinc ele remove a soma de um valor repetido //Somar AS DO MES/ANO
                .sum(`recebido as ${datas}`)

                return ok
                //La no front pode trasnformar pra inteirp o mes pra pegar a posicao
                //Poderia ter join numa so de meses pra facilitar a busca
                //Pode fazer um where pros anos
            })
            
            //GRAFICO PIZZA -----------
            const [emdia]= await connection('faturas')
            .where('renovada', 1)
            .andWhere('status', 'accepted')
            .countDistinct('socio_id as emdia') //Verificar direito isso
            
            const [pendentes]= await connection('faturas')
            // .join('socios', 'socios.id', '=', 'faturas.socio_id') //countDistinct('socios.id')
            .where('faturas.status', 'pending').andWhere('faturas.renovada', 1).countDistinct('faturas.socio_id as pendentes');//Nao vai contar dados repetidos //Evitar dados repetido
            
            const [total]= await connection('socios').count()
            
            const doughnut= [emdia['emdia'],pendentes['pendentes'],total['count(*)']] //Object.values //Talvez algo assim tem validade para outros arrays acima

            //---------------------------

            resolve({
                meses_anos, anos, doughnut
                // total_socios: total['count(*)'],emdia: emdia['emdia'], pendentes: pendentes['pendentes']
            });
    
        }).then((dados)=>{

            Promise.all(dados.meses_anos).then((tudo)=>{
                return res.json({
                    anos: dados.anos, meses_anos: tudo,
                    doughnut: dados.doughnut
                })
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