const nodemailer= require('nodemailer');
const jwt= require('jsonwebtoken');
//connection sqlite
const transporter= nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user:'mathsales360@gmail.com',
        pass:'hyperpunk2025'
    }
});

const error= (err,data)=>{
    if(err){
        console.log('Fail to send email: ', err);
    }
    else{
        console.log('Email delivered!!: ', data);
    }
}

module.exports= {
    async event(emails){
        // console.log(emails);
        transporter.sendMail({
            from:'mathsales360@gmail.com',
            to: emails,
            subject:'Evento',
            text:  "Um novo evento foi adicionado confira no link",
        }, error)
    },

    async confirm(email){
        transporter.sendMail({
            from:'mathsales360@gmail.com',
            to: email,
            subject:'Confirmacao de socio',
            text:  "Voce foi confirmado no sistema",
        }, error)
    },


    async recover(email){

        const token= jwt.sign({email},'email',{
            expiresIn: '24h'
        })

        transporter.sendMail({
            from:'mathsales360@gmail.com',
            to: email,
            subject:'Resetar senha',
            text:  "Email de solicitação de recuperação de senha",
            html: `Confirme seu email no seguinte link: http://localhost:3000/recuperar/${token}`
        }, error)
    }
}