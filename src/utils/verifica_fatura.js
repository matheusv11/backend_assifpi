const connection= require('../database/connection');

module.exports=async ()=>{
    const response= await connection('faturas').select('*');//Poderia tambem mapear so as faturas nao renovadas

    const now = new Date();
    const data_criacao= now.toISOString().substr(0,10);
    
    response.map(async dados=>{
        let vencida=new Date(dados.data_vencimento); //Data de vencimento

        let data_vencimento= new Date(vencida.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString().substr(0,10);
        //Independente dos status ela sempre renova, so interessa o vencimento e se foi renovada ou paga
        if(now>=vencida && !dados.renovada || dados.status=="approved" && !dados.renovada){ //Poderia colocar tambem questao dos status
            await connection('faturas').where('id', dados.id).update({renovada: 1})//Data de vencimento e id

            await connection('faturas').insert({
                    socio_id: dados.socio_id, cpf: dados.cpf, status: 'pending', data_criacao,
                    data_vencimento, renovada: 0, valor: 62
            })
        }
    })

}