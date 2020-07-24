const express= require('express');
const app= express();
const cors= require('cors');
const routes= require('./routes');
const handle_errors= require('./configs/handle_errors')
const verifica_fatura= require('./utils/verifica_fatura');

app.use(cors());
app.use(express.json());
app.use(routes);
app.use(handle_errors);

setInterval(verifica_fatura, 5000);


app.listen(3030);