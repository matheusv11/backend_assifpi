const {Joi}= require('celebrate');

module.exports={
    socio:{
        body: Joi.object().keys({
           nome: Joi.string().max(100).required(),
           email: Joi.string().email().required(),
           senha: Joi.string().min(6).max(24).required(),
           cpf: Joi.string().length(11).pattern(/^[0-9]+$/).required(),
           rg: Joi.allow(),
           cnh: Joi.allow(),
           autorizacao_filiacao: Joi.allow(),
           endereco: Joi.string().max(64).required(),
           telefones: Joi.string().required(),
           files: Joi.allow()
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
            data: Joi.string().required(),//pattern(/^[0-9]+$/).
            hora_inicio: Joi.string().required(),
            hora_fim: Joi.string().required(),
            
        }).options({abortEarly: false})
    },
}