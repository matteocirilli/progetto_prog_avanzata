const logica = require('./logica.js');
const express = require("express");
const app = express();
const path = require('path');
const session = require("express-session");
require ('dotenv').config()
const db = require('./dist/db.js');
const jwt = require('jsonwebtoken');
const MemoryStore = require('memorystore')(session);
const PDFDocument = require('pdfkit');
const fs = require('fs');



const { UtenteDao, PartiteDao,MosseDao, syncDb } = require('./dist/db.js');

const utenteDao = new UtenteDao();
const partiteDao = new PartiteDao();
const mosseDao = new MosseDao ();

var partiteLocal =  [];
var turni = [];
syncDb();

app.use(session({
    store: new MemoryStore({
        checkPeriod: 86400000 
    }),
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
//var symbol = sym[Math.floor(Math.random() *2)];
app.get('/',async function(req,res) {
    var utente;
    utente = await utenteDao.findByEmail(req.user.email);
    
    if (utente==null)
        await utenteDao.create({ email: req.user.email, token: 50, vittorie: 0, vintePerAbbandono: 0, perse: 0, persePerAbbandono:0 })
   
    req.session.personalEmail = req.user.email;
  
    
    var partite = await partiteDao.readAll();
    var bool;
    partite.forEach(async partita => {
        console.log(partita.id);
        if(partita.emailSfidante2===req.session.personalEmail&& partita.active===false) {
            partiteDao.update(partita.id, {active: true});
            
            req.session.email = partita.emailSfidante1;
            utente1 = await utenteDao.findByEmail(partita.emailSfidante1);
            utente2 = await utenteDao.findByEmail(partita.emailSfidante2);
            utenteDao.update(partita.emailSfidante1, {token: (utente1.token - 0.5)});
            utenteDao.update(partita.emailSfidante2, {token: (utente2.token - 0.5)});
            partiteLocal[partita.id] = [["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1" ], ["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1" ],
            ["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1" ], ["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1" ]];
            turni[partita.id]=1;
            
           
           
        }
        var utenti = await utenteDao.readAll();
        console.log (utenti);
        
    });

    var matches = await partiteDao.readAll();
    console.log(matches);


  res.render('index', {email : req.user.email,
        nome : req.user.name,
        
 });
})
app.get('/mossa', async function(req,res){
   var sym;
   var occupata = false;
    if (!req.session.email){
       res.json({ error: "inserisci la mail del tuo avversario!" });
        }
        else {  
            
            var partite = await partiteDao.readAll();
            var flag = false;
            partite.forEach(partita => {
                if (((req.session.personalEmail===partita.emailSfidante1)||(req.session.personalEmail===partita.emailSfidante2))&&partita.active=== true) {
                flag = true;
            req.session.idMatch= partita.id;
            if (req.session.personalEmail===partita.emailSfidante1)
                sym = "x";
            else
            sym = "o";
        }
            });
if (!flag)
    res.json({ error: "aspetta il tuo avversario!" });
else {
 
    

        var winner = false;
        var winnersymbol = null;
        var player1 = false;
    var mossa = sym;
    var livello = Number(req.query.livello);
    var riga = Number(req.query.riga);
    var col = Number(req.query.col);
    var index = (((riga-1)*4)+col)-1;

    var partitaa = await partiteDao.read(req.session.idMatch);
  if ((turni[partitaa.id]===1 &&req.session.personalEmail===partitaa.emailSfidante2)||(turni[partitaa.id]===2&&req.session.personalEmail===partitaa.emailSfidante1)) {
        res.json({ error: "non è il tuo turno!" });
    }
    else {

    if (partiteLocal[req.session.idMatch][livello-1][index]== 1) {
        partiteLocal[req.session.idMatch][livello-1][index]=mossa;
        console.log(partiteLocal);
        console.log("partiteLocal");
    if ((logica.verifyColumn(partiteLocal[req.session.idMatch][livello-1]))==1||(logica.verifyDiag(partiteLocal[req.session.idMatch][livello-1]))==1||(logica.verifyRow(partiteLocal[req.session.idMatch][livello-1]))==1||
    logica.verifyColumnVertical(partiteLocal[req.session.idMatch])==1 ||logica.check3DTicTacToeDiagonals(partiteLocal[req.session.idMatch])==1) {
    winner = true;
    winnersymbol="x";
        console.log("ha vinto il simbolo x");}
    else if (logica.verifyColumn(partiteLocal[req.session.idMatch][livello-1])==2||logica.verifyDiag(partiteLocal[req.session.idMatch][livello-1])==2||logica.verifyRow(partiteLocal[req.session.idMatch][livello-1])==2||
    logica.verifyColumnVertical(partiteLocal[req.session.idMatch])==2||logica.check3DTicTacToeDiagonals(partiteLocal[req.session.idMatch])==2){
       winner = true;
       winnersymbol="o";
        console.log("ha vinto il simbolo o");}
    if (req.session.personalEmail===partitaa.emailSfidante1)
        player1=true;
    var x;
    if (livello==1)
        x="a";
    else if (livello ==2)
        x="b";
    else if (livello == 3)
        x="c";
    else x = "d";
  
                   
    if (winner){
        var player;
        var loser;
        if (player1) {
            player = await utenteDao.findByEmail(partitaa.emailSfidante1);
            var vittorieAttuali = player.vittorie;
            await utenteDao.vittoria(partitaa.emailSfidante1, {
                vittorie: (vittorieAttuali + 1)
            });
            loser = await utenteDao.findByEmail(partitaa.emailSfidante2);
            var perditeAttuali = player.perse;
            await utenteDao.perdita(partitaa.emailSfidante2, {
                perse: (perditeAttuali + 1)
            });
        }
        else {
            player = await utenteDao.findByEmail(partitaa.emailSfidante2);
            var vittorieAttuali = player.vittorie;
            await utenteDao.vittoria(partitaa.emailSfidante2, {
                vittorie: (vittorieAttuali + 1)
            });
            loser = await utenteDao.findByEmail(partitaa.emailSfidante1);
            var perditeAttuali = player.perse;
            await utenteDao.perdita(partitaa.emailSfidante1, {
                perse: (perditeAttuali + 1)
            });
        }
    }
   
    res.json({
        winner: winner ? "winner" : "no",
        player: ((req.session.personalEmail===partitaa.emailSfidante1)&&player1) ||((req.session.personalEmail===partitaa.emailSfidante2)&&!player1)? "yes": "no",
        symbol: winnersymbol,
        pos: (index + 1).toString() + x,
    });}
    else {
        res.json({ error: "la posizione è già occupata!" });
        occupata = true;
    }
    if (!occupata) {
     if (req.session.personalEmail===partitaa.emailSfidante1){
        turni[partitaa.id]=2;
      
     }
    else{
     turni[partitaa.id]=1;}
        await mosseDao.create({email: req.session.personalEmail, descrizione: (index + 1).toString() + x, data: new Date() })
 }
       }} 


}
var mosse = await mosseDao.readAll();
console.log("mosse");
console.log(mosse);
}
    );

    app.get('/mail',async  function(req, res){
        if (!req.session.email) {
            var user = await utenteDao.findByEmail(req.session.personalEmail);
            numTok = user.token;
            console.log(numTok);
            console.log("numero token");
            if (numTok < 0.5) {
                res.status(401).send('Unauthorized');}
            else {
            req.session.email = req.query.mail;
            await partiteDao.create({
                emailSfidante1: req.session.personalEmail,
                emailSfidante2: req.session.email,
                active: false
            });
            partite = await partiteDao.readAll();
            console.log (partite);
            
            res.send(req.session.email);
            
        } }
        else 
            res.send('hai già inserito la mail');
    });

    app.get('/stato-partita', async function(req, res) {
        const partite = await partiteDao.readAll();
        const partita = partite.find(p => p.emailSfidante1 === req.session.personalEmail || p.emailSfidante2 === req.session.personalEmail);
        
        if (partita) {
            var arrayss = partiteLocal[partita.id];
            res.json({ arrayss });
        } else {
            res.status(404).json({ error: "Partita non trovata" });
        }
    });

    app.get('/abbandona', async function (req, res) {
       
            const match = await partiteDao.read(req.session.idMatch);
    
        
            let opponentEmail = match.emailSfidante1 === req.session.personalEmail ? match.emailSfidante2 : match.emailSfidante1;
    
           
            req.sessionStore.all(async (err, sessions) =>  {
                if (err) {
                    console.error('Errore durante l\'accesso alle sessioni:', err);
                    res.status(500).json({ error: "Errore durante l'accesso alle sessioni" });
                    return;
                }
    
               
                let opponentSessionID = Object.keys(sessions).find(sessionID => sessions[sessionID].personalEmail === opponentEmail);
                if (opponentSessionID) {
                    let opponentSession = sessions[opponentSessionID];
    
                    
                    opponentSession.email = null;
                    opponentSession.idMatch = null;
    
                    
                    req.sessionStore.set(opponentSessionID, opponentSession, (err) => {
                        if (err) {
                            console.error('Errore durante l\'aggiornamento della sessione dell\'avversario:', err);
                        }
                    });
                }
                var winner = await utenteDao.findByEmail(req.session.email);
                var loser = await utenteDao.findByEmail(req.session.personalEmail);
                console.log(winner);
                console.log(loser);
                console.log("winner loser.........");
                await utenteDao.vittoria(req.session.email, {vittorie: winner.vittorie + 1, vintePerAbbandono: winner.vintePerAbbandono +1 });
                await utenteDao.perdita(req.session.personalEmail, {perse: loser.perse + 1, persePerAbbandono: loser.persePerAbbandono +1 });
                await partiteDao.delete(req.session.idMatch);
                delete partiteLocal[req.session.idMatch];
                req.session.email = null;
                req.session.idMatch = null;
                
                res.send("Partita abbandonata con successo");
            });

     
    });

   /* app.get('/classifica', async function (req,res) {
        var utenti = await utenteDao.readAll();
        var classif = {};
        utenti.forEach(u => classif[u.email] = u.vittorie);
   
    let sortable = [];
    for (var x in classif) {
    sortable.push([x, classif[x]]);
}

    sortable.sort((a, b) =>
    (b[1]-a[1])); 

    console.log(sortable);
console.log("classificaaaa");

var classifica = "";
sortable.forEach(x => classifica = classifica + " " + x[0] + ": " + x[1] + ", ");
res.send(classifica);
});*/



  app.get('/classifica', async (req, res) => {
    const { ordine = 'desc' } = req.query;
    
   
      const users = await utenteDao.readAll();
      var leaderboard = users.map(user => {
        return {
          email: user.email,
          vittorie: user.vittorie,
          vintePerAbbandono: user.vintePerAbbandono,
          perse: user.perse,
          persePerAbbandono: user.persePerAbbandono,
          punteggio: user.vittorie*5
        };
      });
  
      leaderboard.sort((a, b) => {
        if (ordine === 'asc') {
          return a.punteggio - b.punteggio;
        } else {
          return b.punteggio - a.punteggio;
        }
      });

    const classs = leaderboard.map(x => x.email + ",vittorie: " + x.vittorie + ", vinte per abbandono: " 
        + x.vintePerAbbandono + ", perse: " + x.perse + ", perse per abbandono: " + x.persePerAbbandono + ", punteggio: " + x.punteggio);
  var stringClass = " ";
  console.log(classs[0]);
  for (var i=0; i<classs.length; i++){
        stringClass = stringClass + "------" + classs[i];}
        console.log(stringClass);
      res.send(stringClass);
     
  });

  app.get('/storico-mosse', async (req, res) => {
    const { formato, dataInizio, dataFine } = req.query;
    const email = req.session.email;
    
    // Parsing delle date
    const startDate = new Date(dataInizio);
    const endDate = new Date(dataFine);
    
    // Query per ottenere le mosse filtrate per email e intervallo di date
    const mosse = await mosseDao.readByEmail(req.session.personalEmail);

    const filteredMosse = mosse.filter(mossa => {
        const mossaDate = new Date(mossa.data);
        return mossaDate >= startDate && mossaDate <= endDate;
    });

    if (formato === 'JSON') {
        res.json(filteredMosse);
    } else if (formato === 'PDF') {
        const doc = new PDFDocument();

        res.setHeader('Content-Disposition', 'attachment; filename=storico-mosse.pdf');
        res.setHeader('Content-Type', 'application/pdf');

        // Pipe the document to the response
        doc.pipe(res);

        // Aggiungi il contenuto al PDF
        doc.text('Storico Mosse');
        filteredMosse.forEach(mossa => {
            doc.text(`ID: ${mossa.id}`);
            doc.text(`Email: ${mossa.email}`);
            doc.text(`Descrizione: ${mossa.descrizione}`);
            doc.text(`Data: ${mossa.data}`);
            doc.moveDown();
        });

        // Finalizzare il documento PDF
        doc.end();
    } else {
        res.status(400).send('Formato non supportato');
    }
});

app.get('/turno', async (req,res)=> {
    const partite = await partiteDao.readAll();
    const partita = partite.find(p => p.emailSfidante1 === req.session.personalEmail || p.emailSfidante2 === req.session.personalEmail);
if (!partita)
{
    res.send( "non c'è nessuna partita in corso" );
}
else {
    if (partita.active===false) {
        res.send("la partita deve ancora iniziare");
    
    }
    else {
        if (((partita.emailSfidante1===req.session.personalEmail)&& (turni[partita.id]===1)) ||((partita.emailSfidante2===req.session.personalEmail)&& (turni[partita.id]===2)))
            res.send("è il tuo turno");
        else
        res.send("non è il tuo turno");

    }
}

});


  
    
    


app.listen(3000);



