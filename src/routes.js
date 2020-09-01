const express= require('express');
const routes= express.Router();
const path= require('path');

//Controllers
const SocioController= require('./controllers/SocioController');
const DepedenteController= require('./controllers/DependenteController');
const EventoController= require('./controllers/EventoController');
const AuthController= require('./controllers/AuthController');
const AdmController= require('./controllers/AdmController');
const SocioEventoController= require('./controllers/SocioEventoController');
const CarteiraController= require('./controllers/CarteiraController');
const ConvenioController= require('./controllers/ConvenioController');
const LogController= require('./controllers/LogController');
const FaturaController= require('./controllers/FaturaController');
const GastoController= require('./controllers/GastoController');
const AgendaController= require('./controllers/AgendaController');

//Configs
const jwt= require('./middlewares/jwt');
const {socio, update_socio, dependente, agenda, recover}= require('./configs/celebrate');
const {celebrate}= require('celebrate')

const multer= require('multer');
const multer_config= require('./configs/multer');

//rota estática
routes.use('/files', express.static(path.resolve(__dirname, "./documents")));
routes.use('/download', express.static(path.resolve(__dirname, "./documents/download")));

//Auth
routes.post('/auth_socio', AuthController.authSocio);
routes.post('/auth_adm', AuthController.authAdm);

//Socio
routes.get('/socio', jwt.socio, SocioController.index);
routes.post('/socio',multer(multer_config).fields([
    {name:'rg',maxCount:2},{name:'cnh',maxCount:1},{name:'cpf_comprovante',maxCount:2},{name:'autorizacao_filiacao',maxCount:2}
]), celebrate(socio), SocioController.create);

routes.put('/socio', jwt.socio, celebrate(update_socio), SocioController.update);

routes.delete('/socio/:id', jwt.adm, SocioController.delete);
routes.get('/index_socios', jwt.adm, SocioController.index_socios);
routes.put('/confirm_socio/:id', jwt.adm, SocioController.confirm_socio);

routes.post('/request', SocioController.request);
routes.put('/recover/:token', jwt.recover, celebrate(recover), SocioController.recover);

//Dependentes
routes.get('/dependente', jwt.socio, DepedenteController.index);
routes.post('/dependente', jwt.socio, multer(multer_config).array('files'), celebrate(dependente), DepedenteController.create);
routes.delete('/dependente/:id', jwt.socio, DepedenteController.delete);

routes.post('/confirm_dependente/:id', jwt.adm, DepedenteController.confirm_dependente);
routes.get('/index_dependentes', jwt.adm, DepedenteController.index_dependentes);
routes.delete('/delete_dependente/:id', jwt.adm, DepedenteController.deleteDependente);

//Adm
routes.get('/adm', jwt.adm, AdmController.index);
routes.post('/adm', jwt.adm, AdmController.create);
routes.delete('/adm/:id', jwt.adm, AdmController.delete);

//Eventos
routes.get('/evento', EventoController.index);
routes.post('/evento', jwt.adm, multer(multer_config).fields([{name:'anexo',maxCount:1},{name:'imagens',maxCount:6}]), EventoController.create);
routes.delete('/evento/:id', jwt.adm, EventoController.delete);

//SocioEvento
routes.get('/socio_evento/:id', jwt.adm, SocioEventoController.index);
routes.post('/socio_evento/:id', jwt.socio, SocioEventoController.post);
routes.delete('/socio_evento/:id', jwt.socio, SocioEventoController.delete);
routes.get('/index_socio_evento/:id', jwt.socio, SocioEventoController.index_socio);

//Carteira
routes.get('/carteira', jwt.adm, CarteiraController.index);
routes.post('/carteira', jwt.socio, CarteiraController.create);
routes.post('/carteira/:id', jwt.socio, CarteiraController.create_dependente);

routes.get('/index_carteira_socio', jwt.socio, CarteiraController.index_carteira_socio);
routes.get('/index_carteira_dependente/:id', jwt.socio, CarteiraController.index_carteira_dependente);

routes.put('/change_carteira_socio/:id', jwt.adm, CarteiraController.change_carteira_socio)
routes.put('/change_carteira_dependente/:id', jwt.adm, CarteiraController.change_carteira_dependente);

//Convenios
routes.get('/convenios', ConvenioController.index);
routes.post('/convenios', jwt.adm, multer(multer_config).array('file'), ConvenioController.create);
routes.delete('/convenios/:id', jwt.adm, ConvenioController.delete);

//Logs
routes.get('/logs', jwt.adm, LogController.index);

//Faturas
routes.get('/faturas', jwt.adm, FaturaController.index);
routes.get('/index_socio_fatura', jwt.socio, FaturaController.index_socio_fatura);
routes.get('/index_pagamentos', jwt.adm, FaturaController.index_pagamentos);
routes.post('/faturas/:id', jwt.socio, FaturaController.create);
routes.post('/notifications', FaturaController.notifications);

//Gastos
routes.get('/gastos', jwt.adm, GastoController.index);
routes.post('/gastos', jwt.adm, GastoController.create);
routes.delete('/gastos/:id', jwt.adm, GastoController.delete);

//Agenda
routes.get('/agenda', AgendaController.index); //falta jwt
routes.post('/agenda', jwt.socio, celebrate(agenda) , AgendaController.create);
routes.put('/agenda/:id', jwt.adm, AgendaController.update);
routes.delete('/agenda/:id', jwt.adm, AgendaController.delete);
routes.delete('agenda_socio', jwt.socio, AgendaController.remove_socio);

module.exports= routes;