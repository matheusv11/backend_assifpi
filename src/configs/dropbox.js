const {Dropbox}= require('dropbox');
const crypto= require('crypto');

const dbx= new Dropbox({
    accessToken: process.env.APP_DROPBOX_TOKEN
})

class DropboxStorage {
  constructor() {
    this.dropbox= dbx
  }

  _handleFile(req,file,cb) {
    // console.log('Arquivos', file);
    const hash=`${crypto.randomBytes(8).toString('hex')}-${file.originalname.replace(/(?:\.(?![^.]+$)|[^\w.])+/g, "-")}`

    this.dropbox.filesUpload({ path: '/documentos/' + hash, contents: file.stream }).then(response => {

        this.dropbox.sharingCreateSharedLinkWithSettings({ path: '/documentos/' + hash}).then((dados)=>{
          const substring= dados.result.url.substr(26).replace('dl=0','raw=1'); //URL= https://www.dropbox.com/s/
          cb(null,{ filename: substring});
        }).catch(error=>{
          console.log('Erro do link: ', error)
          cb(error, null)
        })

    }).catch(error => {
        console.error('Erro do upload:', error);
        cb(error, null);
    });
  }

  __removeFile(req,file,cb){
    this.dropbox.filesDeleteV2({path: file.path_display}).then(dados=>{
      cb(null, dados);
    }).catch(error=>{
      cb(error, null);
    })
  }

}

module.exports = {upload:  new DropboxStorage(), connection: dbx};
