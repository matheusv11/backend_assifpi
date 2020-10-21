const fs= require('fs');
const path= require('path');
const dropbox= require('../configs/dropbox');

module.exports= (files)=>{
    files.map(docs=>{
        let objeto= Object.values(docs);

        objeto.map(dados=>{
            let isNull= dados!==null;
            if(isNull){
                dados.split(',').map(files=>{
                    process.env.APP_DROPBOX_TOKEN ?
                    dropbox.connection.filesDeleteV2({path: `/imagens/${files.split('/')[1].replace('?raw=1','')}`})
                    :
                    fs.unlinkSync(path.resolve(__dirname, `../documents/${files}`));
                })
            }
        })
    })

}
