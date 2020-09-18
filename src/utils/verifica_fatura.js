const connection= require('../database/connection');

module.exports=async ()=>{
    const response= await connection('faturas').select('*');

    const now = new Date();
    const data_criacao= now.toLocaleDateString('en-US');
    const data_vencimento = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US');
    // console.log(now.toISOString().substr(0, 10).split('-').reverse().join('/'));
    
    response.map(async dados=>{
        let vencida= dados.data_vencimento//Data de vencimento
        let parts = vencida.split('-');
        let data = new Date(parts[2], parts[1] - 1, parts[0]);
        
        let vencimento= new Date(data.getTime() + (30 * 24 * 60 * 60 * 1000));
        let data_vencimento= vencimento.toISOString().substr(0,10).split('-').reverse().join('/');

        if(now>=data && dados.renovada==0 || dados.status=="approved" && dados.renovada==0){ //Poderia colocar tambem questao dos status
            await connection('faturas').where('id', dados.id).update({renovada: 1})//Data de vencimento e id

            await connection('faturas').insert({
                    socio_id: dados.socio_id, cpf: dados.cpf, status: 'pending', data_criacao,
                    data_vencimento, renovada: 0,
            })
        }
    })

}