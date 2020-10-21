const fs= require('fs');
const path= require('path');
const dropbox= require('./dropbox');

module.exports= (err, req,res,next)=>{
    if(err){
        if(req.files){
            const Objeto= Object.values(req.files)
            Objeto.map((dados,index)=>{
                // console.log('Index: ', index)
                // console.log(dados[index])
                dados.map((files)=>{
                    process.env.APP_DROPBOX_TOKEN ? 
                    dropbox.connection.filesDeleteV2({path: `/imagens/${files.filename.split('/')[1].replace('?raw=1','')}`})
                    :
                    fs.unlinkSync(path.resolve(__dirname, `../documents/${files.filename}`))//Caso tenha dois campos e 1 não passe(ficar preso no cb) pode dar erro no server  
                })

            })
        }
        
        return res.status(400).send({message: err.message})
    }
}

//Dar handle assim https://github.com/danielfsousa/express-rest-es2017-boilerplate/blob/032a005deaa68a06f476432f4d602917609a251a/src/api/middlewares/error.js#L36