//Relacao da tabela socio evento
const connection= require('../database/connection');

module.exports={
    async index(req,res){

        //Posso verificar se existe mesmo esse evento
        const id= req.params.id;

        const response=await connection('socio_evento')
        .leftJoin('socios', 'socios.id', '=', 'socio_evento.socio_id')
        .where('evento_id', id)
        .select('socios.id', 'socios.nome', 'socios.email')
        
        return res.status(200).send(response);
    },

    async post(req,res){
        const socio_id= req.socio_id;
        const evento_id= req.params.id;
        //Ainda posso verificar se de fato esse socio existe apesar do jwt ou verificar se o evento existe mesmo;

        const response= await connection('socio_evento').where('socio_id', socio_id).andWhere('evento_id', evento_id).select('socio_id').first();

        if(response){
            return res.status(401).send({message: 'Voce já está cadastrado nesse evento'})
        }

        await connection('socio_evento').insert({socio_id, evento_id});

        return res.status(200).send({message: 'Voce foi cadastrado no evento com sucesso'});

    },
    async delete(req,res){
        const evento_id= req.params.id;
        const socio_id= req.socio_id;

        await connection('socio_evento').where('socio_id', socio_id).andWhere('evento_id', evento_id).delete();

        return res.status(200).send({message: 'Voce saiu do evento com sucesso'});
        
    },
    async index_socio(req,res){
        const evento_id= req.params.id;
        const socio_id= req.socio_id;

        const response= await connection('socio_evento').where('evento_id', evento_id).andWhere('socio_id', socio_id).select('*').first();

        return res.status(200).send(response);
    }
}

//Listar socios de um evento (adm)
//Confirmar presenca (socio)
//Deletar presenca de um socio (socio)