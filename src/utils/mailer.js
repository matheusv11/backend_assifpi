const nodemailer= require('nodemailer');
const jwt= require('jsonwebtoken');
//connection sqlite

const transporter= nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.APP_EMAIL,
        pass: process.env.APP_SENHA_EMAIL
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
            from:'Matheus Sales <mathsales360@gmail.com>',
            to: emails,
            subject:'Evento',
            text:  "Um novo evento foi adicionado confira no link",
        }, error)
    },

    async confirm(email){
        transporter.sendMail({
            from:'Matheus Sales <mathsales360@gmail.com>',
            to: email,
            subject:'Confirmacao de socio',
            text:  "Voce foi confirmado no sistema",
        }, error)
    },

    async carteira(email){
        transporter.sendMail({
            from:'Matheus Sales <mathsales360@gmail.com>',
            to: email,
            subject:'Carteira pronta!',
            text:  "Sua carteira ASSIFPI esta pronta!",
        }, error)
    },


    async agenda_confirmado(email){
        transporter.sendMail({
            from:'Matheus Sales <mathsales360@gmail.com>',
            to: email,
            subject:'Solicitação de espaço',
            text:  "Sua Solicitação de espaço foi aceita, aproveite bem!",
        }, error)
    },

    async agenda_recusado(email){
        transporter.sendMail({
            from:'Matheus Sales <mathsales360@gmail.com>',
            to: email,
            subject:'Solicitação de espaço',
            text:  "Sua Solicitação de espaço foi recusada!",
        }, error)
    },

    // async carteira_dependente(email){
    //     transporter.sendMail({
    //         from:'Matheus Sales <mathsales360@gmail.com>',
    //         to: email,
    //         subject:'Carteira pronta!',
    //         text:  "Sua carteira ASSIFPI esta pronta!",
    //     }, error)
    // },

    async recover(email){

        const token= jwt.sign({email},'email',{
            expiresIn: '24h'
        })

        transporter.sendMail({
            from:'Matheus Sales <mathsales360@gmail.com>',
            to: email,
            subject:'Resetar senha',
            text:  "Email de solicitação de recuperação de senha",
            html: `Confirme seu email no seguinte link: ${process.env.APP_URL}/recuperar/${token}`
        }, error)
    }
}