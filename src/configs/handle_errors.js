module.exports= (err, req,res,next)=>{
    if(err){
        return res.status(400).send({message: err.message})
    }
}

//Dar handle assim https://github.com/danielfsousa/express-rest-es2017-boilerplate/blob/032a005deaa68a06f476432f4d602917609a251a/src/api/middlewares/error.js#L36