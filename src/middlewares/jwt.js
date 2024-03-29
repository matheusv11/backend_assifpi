const jwt= require('jsonwebtoken');

module.exports={

    async socio(req,res, next){
        const token= req.headers.authorization.split(' ')[1];

        try{
            const decode= jwt.verify(token, process.env.APP_JWT_SOCIO);
            req.socio_id= decode.id;
            next();
        }
        catch{
            return res.status(401).send({message: 'Token invalido'});
        }
    },

    async adm(req,res, next){
        const token=req.headers.authorization.split(' ')[1];

        try{
            const decode=jwt.verify(token, process.env.APP_JWT_ADM);
            req.adm_id=decode.id
            next();
        }
        catch{
            return res.status(401).send({message:'Token invalido'})
        }
    },

    async recover(req,res,next){
        const token= req.headers.authorization.split(' ')[1];

        try{
            const decode= jwt.verify(token, 'email');
            req.recover_email= decode.email;
            next();
        }
        catch{
            return res.status(401).send({message: 'Sessao expirada'});
        }
    }
}
