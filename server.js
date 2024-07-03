const prova = require('./prova');
const express = require("express");
const app = express();
const path = require('path');
const session = require("express-session");
require ('dotenv').config()
const db = require('./dist/db.js');
const jwt = require('jsonwebtoken');

let a = ["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1" ];
let b = ["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1" ];
let c = ["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1" ];
let d = ["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1" ];
let arrays = [a,b,c,d];

const { UtenteDao, PartiteDao,syncDb } = require('./dist/db.js');

const utenteDao = new UtenteDao();
const partiteDao = new PartiteDao();


syncDb();
    

app.use(session({
    secret: 'yourSecretKey', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

const tokens = ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hdHRlb19jaXJpbGxpQG91dGxvb2suaXQiLCJuYW1lIjoiTWF0dGVvIENpcmlsbGkiLCJpYXQiOjE1MTYyMzkwMjJ9.wXUdtn0C9KWU7mgdf09D2KQo3DSfmCqpjLKBAbW203U',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hcmlvcm9zc2lAZ21haWwuY29tIiwibmFtZSI6Ik1hcmlvIFJvc3NpIiwiaWF0IjoxNTE2MjM5MDIyfQ.abcdc7GTOnNxfzaNftwTv1cdR9GWBgxkSR1EhJRXoBo'
]

function checkToken (req,res,next){
   /*const bearerHeader = req.headers.authorization;
    if (typeof bearerHeader!=='undefined') {
        const bearerToken = bearerHeader.split(' ')[1];
        req.token=bearerToken;
        next();
        console.log(req.token);
    }
    else {
        res.sendStatus(403);
   }*/
  
   // req.token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hdHRlb19jaXJpbGxpQG91dGxvb2suaXQiLCJuYW1lIjoiTWF0dGVvIENpcmlsbGkiLCJpYXQiOjE1MTYyMzkwMjJ9.wXUdtn0C9KWU7mgdf09D2KQo3DSfmCqpjLKBAbW203U';
    
   if (req.session.token) {
    
    req.token = req.session.token;
} else {
    
    req.session.token = tokens[Math.floor(Math.random() * tokens.length)];
    req.token = req.session.token;
}
next();
   
  }
function verifyAndAuthenticate (req,res,next){
    let decoded = jwt.verify (req.token, 'aaa');
    if (decoded !== null)
        req.user=decoded;
    next();
}

app.use(checkToken);
app.use(verifyAndAuthenticate);


app.set('view engine', 'ejs');
var sym = ["x", "o"];
var symbol = sym[Math.floor(Math.random() *2)];
app.get('/',async function(req,res) {
    var utente;
    utente = await utenteDao.findByEmail(req.user.email);
    
    if (utente==null)
        await utenteDao.create({ email: req.user.email, token: 100 })
   
    req.session.personalEmail = req.user.email;
  
    
    var partite = await partiteDao.readAll();
    var bool;
    partite.forEach(partita => {
        console.log(partita.id);
        if(partita.emailSfidante2===req.session.personalEmail) {
            partiteDao.update(partita.id, {active: true});
        req.session.email = partita.emailSfidante1;}
        
    });

    var matches = await partiteDao.readAll();
    console.log(matches);


  res.render('index', {email : req.user.email,
        nome : req.user.name,
        symbol : symbol
 });
})
app.get('/mossa', async function(req,res){
   
    if (!req.session.email){
       res.json({ error: "inserisci la mail del tuo avversario!" });
        }
        else {  
            var partite = await partiteDao.readAll();
            var flag = false;
            partite.forEach(partita => {
                if (((req.session.personalEmail===partita.emailSfidante1)||(req.session.personalEmail===partita.emailSfidante1))&&partita.active=== true)
                flag = true;
            });
if (!flag)
    res.json({ error: "aspetta il tuo avversario!" });
else {
        var winner = false;
        var winnersymbol = null;
    var mossa = req.query.mossa;
    var livello = Number(req.query.livello);
    var riga = Number(req.query.riga);
    var col = Number(req.query.col);
    var index = (((riga-1)*4)+col)-1;
    if (arrays[livello-1][index]== 1) {
        arrays[livello-1][index]=mossa;
    if ((prova.verifyColumn(arrays[livello-1]))==1||(prova.verifyDiag(arrays[livello-1]))==1||(prova.verifyRow(arrays[livello-1]))==1||prova.verifyColumnVertical(arrays)==1) {
winner = true;
winnersymbol="x";
    
        console.log("ha vinto il simbolo x");}
    else if (prova.verifyColumn(arrays[livello-1])==2||prova.verifyDiag(arrays[livello-1])==2||prova.verifyRow(arrays[livello-1])==2||prova.verifyColumnVertical(arrays)==2){
       winner = true;
       winnersymbol="o";
        console.log("ha vinto il simbolo o");}
    console.log(a,b,c,d);
    var x;
    if (livello==1)
        x="a";
    else if (livello ==2)
        x="b";
    else if (livello == 3)
        x="c";
    else x = "d";
    res.json({
        winner: winner ? "winner" : "no",
        symbol: winnersymbol,
        pos: (index + 1).toString() + x
    });}
    else {
        res.json({ error: "la posizione è già occupata!" });
    }
} }
    });

    app.get('/mail',async  function(req, res){
        if (!req.session.email) {
            req.session.email = req.query.mail;
            await partiteDao.create({
                emailSfidante1: req.session.personalEmail,
                emailSfidante2: req.session.email,
                active: false
            });
            partite = await partiteDao.readAll();
            console.log (partite);
            
            res.send(req.session.email);
            
        }
        else 
            res.send('hai già inserito la mail');
    });


app.listen(3000);


console.log(prova.verifyRow(b));
console.log(prova.verifyDiag(b)); 

