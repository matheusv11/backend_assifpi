const connection= require('../database/connection');
const sendmail= require('../utils/mailer');

module.exports={
    
    async index(req,res){

        const response= await connection('agenda')
        .join('socios','socios.id','=','agenda.socio_id')
        .select('agenda.*','socios.cpf','socios.nome').orderBy('id', 'desc');
        
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

        const {email}= await connection('agenda')
        .join('socios','socios.id','=','agenda.socio_id')
        .where('agenda.id', agenda_id)
        .select('socios.email')
        .first()

        await connection('agenda').where('id', agenda_id).update('status', 'confirmado');

        sendmail.agenda_confirmado(email);

        return res.status(200).send({message: 'Agenda confirmada com sucesso'});
    },

    async reject(req,res){
        const agenda_id= req.params.id;

        const {email}= await connection('agenda')
        .join('socios','socios.id','=','agenda.socio_id')
        .where('agenda.id', agenda_id)
        .select('socios.email')
        .first()

        await connection('agenda').where('id', agenda_id).delete();
       
        sendmail.agenda_recusado(email);

        return res.status(200).send({message: 'Agenda recusada com sucesso'})
    },

    async delete(req,res){
        const socio_id= req.socio_id;
        const agenda_id= req.params.id;

        const verify= await connection('agenda').where('id', agenda_id).select('socio_id').first();

        if(verify.socio_id!==socio_id){
            return res.status(401).send({message: 'Esta agenda não lhe pertence'})
        }

        const data_agenda= await connection('agenda').where('id', agenda_id).select('data').first();

        const now= new Date();
        const validade= data_agenda.data
        const parts = validade.split('/');
        const data = new Date(parts[2], parts[1] - 1, parts[0]);

        if(now>=data){
            return res.status(401).send({message: 'Você não pode deletar pois este evento já passou'})
        }

        await connection('agenda').where('id', agenda_id).delete();
        return res.status(200).send({message: 'Agenda deletada com sucesso'});
        // const verify= awati
    }

}