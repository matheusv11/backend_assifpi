const multer= require('multer');
const path= require('path');
const crypto= require('crypto');
const dropbox= require('./dropbox');

const storageType={
    local: multer.diskStorage({
        destination:(req,res,cb)=>{
            cb(null,path.resolve(__dirname,'../documents'))
        },

        filename:(req,file,cb)=>{
            const hash=`${crypto.randomBytes(8).toString('hex')}-${file.originalname}`
            cb(null,hash);
        }

    }),

    dropbox: dropbox.upload
    
}


module.exports={
    storage: storageType[process.env.NODE_ENV ? 'dropbox' : 'local'],

    // storage: storageType['dropbox'],

    limits:{
        fileSize: 1048576,//bytes 
        files: 6 
    },

    fileFilter:(req,file,cb)=>{
        const filetype=['image/png','image/jpg','image/jpeg', 'application/pdf']

        if (filetype.includes(file.mimetype)){
            cb(null,true)
        }else{
            cb(new Error('arquivo nao suportado'))
        }
    }

    


}