const {Joi}= require('celebrate');

const mensagens={
    "string.base": `{#key} precisar ser um 'texto'`,
    "string.empty": `{#key} não pode ser vazio`,
    "string.min": `{#key} deve ter no minimo {#limit} caracteres`,
    "string.max": `{#key} deve ter no maximo {#limit} caracteres`,
    "any.required": `preencha o campo {#key}`,
    "string.length": `{#key} precisar ter {#limit} caracteres`,
    "string.pattern.base": `{#key} precisa conter somente números`,
    "string.email": `Insira um email válido no campo {#key}`
}

module.exports={
    socio:{
        body: Joi.object().keys({
           nome: Joi.string().max(100).required(),
           email: Joi.string().email().required(),
           senha: Joi.string().min(6).max(24).required(),
        //    cpf: Joi.string().length(13).pattern(/^[0-9]+$/).required(),
           cpf: Joi.string().length(14).required(),
           rg: Joi.allow(), //documento
           rg_file: Joi.allow(),
           cnh: Joi.allow(), //documento
           autorizacao_filiacao: Joi.allow(), //documento
           cpf_comprovante: Joi.allow(), //documento
           endereco: Joi.string().max(64).required(),
           telefones: Joi.string().required(),
        }).options({abortEarly: false}).messages(mensagens)

    },

    update_socio:{
        body: Joi.object().keys({
            endereco: Joi.string().max(64).required(),
            telefones: Joi.string().required(),//pattern(/^[0-9]+$/).
            senha: Joi.string().min(6).max(24).required(),
            
        }).options({abortEarly: false}).messages(mensagens)
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
         }).options({abortEarly: false}).messages(mensagens)
    },

    agenda:{
        body: Joi.object().keys({
            local: Joi.string().max(64).required(),
            participantes: Joi.string().required(),
            data: Joi.string().required(),//pattern(/^[0-9]+$/).
            hora_inicio: Joi.string().required(),
            hora_fim: Joi.string().required(),
            
        }).options({abortEarly: false}).messages(mensagens)
    },

    recover:{
        body: Joi.object().keys({
            senha: Joi.string().min(6).max(24).required()
        }).options({abortEarly: false}).messages(mensagens)
    },
}