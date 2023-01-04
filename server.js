const  express = require('express');
const mysql = require('mysql'); 
const myconn =  require('express-myconnection') 
const cors = require('cors'); 

const jwt = require('jsonwebtoken');

const routes = require('./routes');

const app = express()
app.set('port', process.env.PORT || 9000 )
const dbOptions = { 
host: '173.201.185.36',
user: 'adminProyection2',
password: 'Entrada2021.',
database: 'proyection2'} 


const whiteList = ['https://react.proyection.net','https://proyection.net']

app.use(cors({origin:whiteList}))
//midelware---------------------------
app.use(myconn(mysql, dbOptions, 'single'))
app.use(express.json())



/////routes
app.get('/',(req,res)=>{res.send('Welcome to my api')})
app.use('/api',routes)

////server running
app.listen(app.get('port'), ()=>{
    console.log('server running on http://localhost:'+ app.get('port'))
})