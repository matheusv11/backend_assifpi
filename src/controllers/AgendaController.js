const connection= require('../database/connection');
const sendmail= require('../utils/mailer');
const log= require('../utils/log');

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

        await connection('agenda').insert({
            local, data, hora_inicio, hora_fim, participantes, socio_id, 
        })

        return res.status(200).send({message:'Solicitação de espaço realizada com sucesso'});
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

        log(`aprovou uma agenda`, req.adm_id);

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

        log(`rejeitou uma agenda`, req.adm_id);
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
        const data = new Date(data_agenda.data);

        if(now>=data){
            return res.status(401).send({message: 'Você não pode deletar pois este evento já passou'})
        }

        await connection('agenda').where('id', agenda_id).delete();
        return res.status(200).send({message: 'Agenda deletada com sucesso'});
        // const verify= awati
    }

}