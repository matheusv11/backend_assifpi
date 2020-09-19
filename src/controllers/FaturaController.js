const connection= require('../database/connection');
const axios= require('axios');
const mercadopago = require ('mercadopago');
const WrapperPromise= require('../utils/WrapperPromise');
const varchar= process.env.NODE_ENV=="production" ? '::varchar' : ''

module.exports={
    async index(req,res){

        const response= await connection('faturas')
        .join('socios', 'socios.id', '=', 'faturas.socio_id')
        .where('faturas.status', 'pending').andWhere('faturas.renovada', 1).select('socios.nome','socios.cpf').distinct();//Evitar dados repetido
        //Condicoes pra recusada ainda //Where in 
        return res.status(200).send(response);
    },

    async index_socio_fatura(req,res){
        const socio_id= req.socio_id;

        const response= await connection('faturas').where('socio_id', socio_id).select('*');

        return res.status(200).send(response);
    },

    async index_pagamentos(req,res){

        return new Promise(async resolve=>{
            const {ano="2019"}= req.query;

            const anos= await connection('faturas').where('renovada', 1)
            .select(connection.raw(`substr(data_criacao${varchar}, 1, 4) as ano`)) 
            .distinct();
            
            const anos_gastos= await connection('gastos')
            .select(connection.raw(`substr(data${varchar}, 1, 4) as ano`))
            .distinct()

            const intersection= anos.concat(anos_gastos); 

            const filter_anos = [...new Map(intersection.map(obj => [obj.ano, obj])).values()]
            .sort((a,b)=> {return a.ano-b.ano});

            //GANHOS --------
            const meses_anos= await connection('faturas')
            .where('renovada', 1)
            .andWhere(connection.raw(`substr(data_criacao${varchar}, 1, 4)`),ano) //Selecionar o ano
            .select(connection.raw(`DISTINCT substr(data_criacao${varchar}, 1, 7) as meses_anos`))
            .orderBy(connection.raw(`substr(data_criacao${varchar}, 6, 2)`), 'asc') //Muito bacana //Alterar depois nos outros
            // .select(connection.raw(`substr(data_criacao, 1, 4) || '-' || substr(data_criacao, 6, 2) as meses_anos`)) //Ou object values pra remover o objeto
            //.groupBy(connection.raw(`substr(data_criacao${varchar}, 6, 2)`)) //OU SELECT PELO MES //Pode encapsular pro split teste slice //Poderia funcionar pras data talvez
        
            const soma_ganhos= meses_anos.map(async datas=>{

                const [ok]= await connection('faturas')
                .where(connection.raw(`substr(data_criacao${varchar}, 1, 7)`),datas.meses_anos)
                .sum(`recebido as ${datas.meses_anos}`)
                // .select(connection.raw(`substr(data_criacao, 1, 4) || '/' || substr(data_criacao, 6, 2) as sim`)).first()

                return ok
            })


            //GASTOS --------
            const meses_gastos= await connection('gastos')
            .andWhere(connection.raw(`substr(data${varchar}, 1, 4)`),ano) //Selecionar o ano
            .select(connection.raw(`substr(data${varchar}, 1, 7)  as meses_gastos`)) //Ou object values pra remover o objeto
            .distinct()
            .orderBy(connection.raw(`substr(data${varchar}, 6, 2)`), 'asc') //Muito bacana //Alterar depois nos outros
            // .groupBy(connection.raw(`substr(data${varchar}, 6, 2)`)) //OU SELECT PELO MES //Pode encapsular pro split teste slice //Poderia funcionar pras data talvez

            const soma_gastos= meses_gastos.map(async gastos=>{
                const [sum_gastos]= await connection('gastos')
                .where(connection.raw(`substr(data${varchar}, 1, 7)`), gastos.meses_gastos)
                .sum(`valor as ${gastos.meses_gastos}`)

                return sum_gastos;
            })
            
            //GRAFICO PIZZA -----------
            const [emdia]= await connection('faturas')
            .where('renovada', 1)
            .andWhere('status', 'approved')
            .countDistinct('socio_id as emdia') //Verificar direito isso
            
            const [pendentes]= await connection('faturas')
            .where('faturas.status', 'pending').andWhere('faturas.renovada', 1).countDistinct('faturas.socio_id as pendentes');//Nao vai contar dados repetidos //Evitar dados repetido
            
            const doughnut= [emdia['emdia'],pendentes['pendentes']] //Object.values //Talvez algo assim tem validade para outros arrays acima

            //---------------------------
            const WrappedGanhos= await WrapperPromise(soma_ganhos);
            const WrappedGastos= await WrapperPromise(soma_gastos);

            resolve({soma_ganhos: WrappedGanhos, soma_gastos: WrappedGastos, anos: filter_anos, doughnut});

        }).then((dados)=>{            
            return res.json({
                anos: dados.anos, soma_ganhos: dados.soma_ganhos,
                soma_gastos: dados.soma_gastos, doughnut: dados.doughnut
            });

        });
    },

    async create(req,res){
        const socio_id= req.socio_id;
        const id= req.params.id;//Id da fatura

        const response= await connection('faturas').where('socio_id', socio_id).andWhere('id', id).select('*').first()

        const now = new Date();
        const data_vencimento = new Date(response.data_vencimento);

        const timeDiff = now.getTime() - data_vencimento.getTime() 
        const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
        // console.log(diffDays);

        mercadopago.configure({access_token: process.env.APP_DEV_TOKEN});
        
        const preference = {
        items: [
            {
            title: 'Produto de teste em producao',
            unit_price: diffDays>=7 ? 10 : 5,
            quantity: 1,
            }
        ],

        external_reference: `${socio_id}-${id}`,
        back_urls: {
            success: "https://frontend-assifpi.herokuapp.com/perfil",
            failure: "https://frontend-assifpi.herokuapp.com/perfil",
            pending: "https://frontend-assifpi.herokuapp.com/perfil"
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

        if(req.body.resource){
            return res.status(200).send()
        }

        axios.get(`https://api.mercadopago.com/v1/payments/${req.body.data.id}?access_token=${process.env.APP_DEV_TOKEN}`).then(async(dados)=>{
            console.log(dados.data)
            let external= dados.data.external_reference
            let parts= external.split('-')

            if(dados.data.status=="approved" && parts[1]=="payall"){
                await connection('faturas').where('socio_id', parts[0]).andWhere('faturas.status','pending').andWhere('faturas.renovada',1).update({ //Rejetiada
                    status: dados.data.status, boleto: dados.data.transaction_details.external_resource_url,
                    compra_id: dados.data.id, valor: dados.data.transaction_details.net_received_amount
                })

                return res.status(200).send();
            }
            
            await connection('faturas').where('socio_id', parts[0]).andWhere('id', parts[1]).update({
                status: dados.data.status, boleto: dados.data.transaction_details.external_resource_url,
                compra_id: dados.data.id, valor: dados.data.transaction_details.net_received_amount//Valor com os 5%
            });
            
            return res.status(200).send();

        }).catch((err)=>{
            console.log(err)
        });

        return res.status(200).send();

    },

    async personal_fatura(req,res){
        const valor= parseInt(req.body.valor);
        const cpf= req.body.cpf;
        // const id= req.params.id;//Id da fatura

       const atrasadas= await connection('socios')
       .join('faturas', 'faturas.socio_id','=','socios.id')
       .where('socios.cpf',cpf)
       .andWhere('socios.pagamento','mercadopago')
       .andWhere('faturas.status','pending')
       .andWhere('faturas.renovada', 1)
       .select('socios.id as socio_id','socios.nome','socios.rg','socios.cpf','faturas.status','faturas.data_criacao','faturas.data_vencimento')
    //    .first()
        
       if(!atrasadas[0]){
           return res.status(404).send({message: 'Este usuario não foi encontrado'})
       }
    
       if(req.query.condicao=="consulta"){
           return res.status(200).send(atrasadas)
       }

        mercadopago.configure({access_token: process.env.APP_DEV_TOKEN});

        const preference = {
        items: [
            {
            title: 'Produto de teste em producao',
            unit_price: valor,
            quantity: 1,
            }
        ],

        external_reference: `${atrasadas[0].socio_id}-payall`,
        back_urls: {
            success: "https://frontend-assifpi.herokuapp.com",
            failure: "https://frontend-assifpi.herokuapp.com",
            pending: "https://frontend-assifpi.herokuapp.com"
        },
        auto_return: "approved",
        notification_url: "https://backend-assifpi.herokuapp.com/notifications", //Update

        };

        mercadopago.preferences.create(preference)
        .then(function(response){
            // return res.json({mercadopago: response, faturas: atrasadas})
            return res.json(response)
        }).catch(function(error){
            console.log(error);
        });
    }
}