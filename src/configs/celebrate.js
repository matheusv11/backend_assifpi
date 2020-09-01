const {Joi}= require('celebrate');

module.exports={
    socio:{
        body: Joi.object().keys({
           nome: Joi.string().max(100).required().error(new Error('Nome deve ser preenchido')),
           email: Joi.string().email().required().error(new Error('Insira um email valido')),
           senha: Joi.string().min(6).max(24).required().error(new Error('A senha deve conter entre 6 e 24 caracteres')),
           cpf: Joi.string().length(11).pattern(/^[0-9]+$/).required().error(new Error('CPF deve conter 11 digitos')),
           rg: Joi.allow(), //documento
           cnh: Joi.allow(), //documento
           autorizacao_filiacao: Joi.allow(), //documento
           cpf_comprovante: Joi.allow(), //documento
           endereco: Joi.string().max(64).required().error(new Error('Insira seu endereço')),
           telefones: Joi.string().required().error(new Error('Insira seu(s) telefone(s)')),
        }).options({abortEarly: false})

    },

    update_socio:{
        body: Joi.object().keys({
            endereco: Joi.string().max(64).required(),
            telefones: Joi.string().required(),//pattern(/^[0-9]+$/).
            senha: Joi.string().min(6).max(24).required(),
            
        }).options({abortEarly: false})
    },

    dependente:{
        body: Joi.object().keys({
            nome: Joi.string().max(100).required(),
            email: Joi.string().email().required(),
            cpf: Joi.string().length(11).pattern(/^[0-9]+$/).required(),
            rg: Joi.allow(),
            endereco: Joi.string().max(64).required(),
            telefones: Joi.string().required(),
            files: Joi.allow()
         }).options({abortEarly: false})
    },

    agenda:{
        body: Joi.object().keys({
            local: Joi.string().max(64).required(),
            participantes: Joi.string().required(),
            data: Joi.string().required(),//pattern(/^[0-9]+$/).
            hora_inicio: Joi.string().required(),
            hora_fim: Joi.string().required(),
            
        }).options({abortEarly: false})
    },

    recover:{
        body: Joi.object().keys({
            senha: Joi.string().min(6).max(24).required()
        }).options({abortEarly: false})
    },
}