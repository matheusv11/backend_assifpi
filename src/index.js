require('dotenv').config();
const express= require('express');
const app= express();
const cors= require('cors');
const routes= require('./routes');
const handle_errors= require('./configs/handle_errors')
const verifica_fatura= require('./utils/verifica_fatura');
const port= process.env.PORT;

app.use(cors({exposedHeaders: 'total-count'})); //Set header //In pagination eventos
//app.use(cors());
app.use(express.json());
app.use(routes);
app.use(handle_errors);

console.log(process.env.PORT)
console.log(process.env.APP_URL);
console.log(process.env.APP_JWT_SOCIO);


setInterval(verifica_fatura, 2000);
// 21600000

app.listen(port);