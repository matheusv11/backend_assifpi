const fs= require('fs');
const path= require('path');

module.exports= (files)=>{
    //files && //Caso tenha ele percorre para evitar erros
    files.map(docs=>{
        let objeto= Object.values(docs);
        // const yes=objeto.filter((dados)=>{
        //     return dados!==null;
        // })
        objeto.map(dados=>{
            let isNull= dados!==null;
            // let newDados= isNull && dados;
            if(isNull){
                fs.unlinkSync(path.resolve(__dirname, `../documents/${dados}`));
            }
        })
    })

}
