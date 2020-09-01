const connection= require('../database/connection');

module.exports={
    
    async index(req,res){

        const response= await connection('agenda')
        .join('socios','socios.id','=','agenda.socio_id')
        .select('agenda.*','socios.cpf','socios.nome');
        
        return res.status(200).send(response);
    },

    async create(req,res){
        const {local,data,hora_inicio,hora_fim, participantes}= req.body;
        const socio_id= req.socio_id;
        const parts= data.split('-');
        const format_data=`${parts[2]}/${parts[1]}/${parts[0]}`

        await connection('agenda').insert({
            local, data: format_data, hora_inicio, hora_fim, participantes, socio_id, 
        })

        return res.status(200).send({message:'Solicitação de espaço realizada com sucesso'});
        // const {}
    },

    async update(req,res){
        const agenda_id= req.params.id;
        
        await connection('agenda').where('id', agenda_id).update('status', 'confirmado');

        return res.status(200).send({message: 'Agenda confirmada com sucesso'});
    },

    async delete(req,res){
        const agenda_id= req.params.id;

        await connection('agenda').where('id', agenda_id).delete();

        return res.status(200).send({message: 'Agenda deletada com sucesso'})
    },

    async remove_socio(req,res){

    }
}