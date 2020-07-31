const connection= require('../database/connection');

module.exports=async ()=>{
    //Caso a data de vencimento seja igual  ou maior que a de hoje gera um nova fatura
    //Quando um boleto dele vencer ele gera o novo para pagamento

    const response= await connection('faturas').select('*');

    const now = new Date();
    const data_criacao= `${("0"+(now.getDate())).slice(-2)}/${("0"+(now.getMonth()+1)).slice(-2)}/${now.getFullYear()}`
    const vencimento = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    const data_vencimento= `${("0"+(now.getDate())).slice(-2)}/${("0"+(vencimento.getMonth()+1)).slice(-2)}/${vencimento.getFullYear()}`
    //Trabalhar melhor com as datas e zeros pro bd e front
        
    response.map(async dados=>{
        
        let vencimento= dados.data_vencimento//Data de vencimento
        let parts = vencimento.split('/');
        let data = new Date(parts[2], parts[1] - 1, parts[0]);

        if(now>=data && dados.renovada==0){ //Melhorar isso vai que o server morre ai restata
            await connection('faturas').where('id', dados.id).update({renovada: 1})//Data de vencimento e id

            await connection('faturas').insert({
                    socio_id: dados.socio_id, cpf: dados.cpf, status: 'pending', data_criacao,
                    data_vencimento, renovada: 0,
                })
        }
    })

}