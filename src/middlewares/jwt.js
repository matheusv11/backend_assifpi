const jwt= require('jsonwebtoken');

module.exports={

    async socio(req,res, next){
        const token= req.headers.authorization.split(' ')[1];

        try{
            const decode= jwt.verify(token, 'secret');
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
            const decode=jwt.verify(token, 'adm');
            req.adm_id=decode.id
            next();
        }
        catch{
            return res.status(401).send({message:'Token invalido'})
        }
    }
}
