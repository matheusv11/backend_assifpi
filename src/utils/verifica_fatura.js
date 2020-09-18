const connection= require('../database/connection');

module.exports=async ()=>{
    const response= await connection('faturas').select('*');

    const now = new Date();
    const data_criacao= now.toISOString().substr(0,10);
    
    response.map(async dados=>{
        let vencida=new Date(dados.data_vencimento); //Data de vencimento

        let data_vencimento= new Date(vencida.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString().substr(0,10);

        if(now>=vencida && dados.renovada==0 || dados.status=="approved" && dados.renovada==0){ //Poderia colocar tambem questao dos status
            await connection('faturas').where('id', dados.id).update({renovada: 1})//Data de vencimento e id

            await connection('faturas').insert({
                    socio_id: dados.socio_id, cpf: dados.cpf, status: 'pending', data_criacao,
                    data_vencimento, renovada: 0,
            })
        }
    })

}