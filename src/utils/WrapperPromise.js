module.exports= async promise=>{

    return new Promise((resolve)=>{
        Promise.all(promise).then((dados)=>{
            resolve(dados)
        })
    })
   
}