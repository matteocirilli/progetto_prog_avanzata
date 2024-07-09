//importazioni di moduli, file javascript all'interno del codice
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


//istanziazione variabili di Dao e Database
const { UtenteDao, PartiteDao,MosseDao, syncDb, Utente } = require('./dist/db.js');
const utenteDao = new UtenteDao();
const partiteDao = new PartiteDao();
const mosseDao = new MosseDao ();

//variabili che conterranno partite e turni
var partiteLocal =  [];
var turni = [];

//funzione/script di seed
async function seedUtenti() {
    await syncDb();

    await Utente.bulkCreate([
        { email: 'matteo_cirilli@outlook.it', token: 100, vittorie: 0, vintePerAbbandono: 0, perse: 0, persePerAbbandono: 0 },
        { email: 'mariorossi@gmail.com', token: 200, vittorie: 0, vintePerAbbandono:0, perse: 0, persePerAbbandono: 0 },
       
    ]);

    console.log("Utenti seeding completed.");
}
//attivazione funzione dello script di seed del database
seedUtenti().catch((error) => {
    console.error("Utenti seeding failed: ", error);
});

//funzione middleware per analizzare corpo delle richieste HTTP con contenuto JSON
app.use(express.json());

//funzione middleware per l'utilizzo delle sessioni
app.use(session({
    store: new MemoryStore({
        checkPeriod: 86400000 
    }),
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

//token predefiniti
const tokens = ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hdHRlb19jaXJpbGxpQG91dGxvb2suaXQiLCJuYW1lIjoiTWF0dGVvIENpcmlsbGkiLCJpYXQiOjE1MTYyMzkwMjJ9.Aq9GfDrmAsjAIuGeq3Fcx0mp4im4qh_xArLTUsK0POk',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hcmlvcm9zc2lAZ21haWwuY29tIiwibmFtZSI6Ik1hcmlvIFJvc3NpIiwiaWF0IjoxNTE2MjM5MDIyfQ.ntdBL8d-nZIsQJYWA13BqP7NimquTRgQPY5QF7O-9v0'
]

//funzione middleware che verifica se c'è un token nell'header e nel caso lo mette nella richiesta
function checkToken (req,res,next){
   const bearerHeader = req.headers.authorization;
    if (typeof bearerHeader!=='undefined') {
        const bearerToken = bearerHeader.split(' ')[1];
        req.token=bearerToken;
        next();
        console.log(req.token);
    }
    else {
        res.status(403).json({error: "non ti sei autenticato"});
   }
  
  
    
/*if (req.session.token) {
    
    req.token = req.session.token;
} else {
    
    req.session.token = tokens[Math.floor(Math.random() * tokens.length)];
    req.token = req.session.token;
}
next();*/
   
  }

  //funzione middleware per autenticare il token tramite chiave privata, se l'utente non esiste lo crea e mette nella sessione email dell'avversario
  //e id del match (se esiste)
async function verifyAndAuthenticate (req,res,next){
    let decoded = jwt.verify (req.token, process.env.SECRET_KEY);
    if (decoded !== null){
        req.user=decoded;
        req.session.personalEmail=req.user.email;
        var utente;
    utente = await utenteDao.findByEmail(req.user.email);
    
    if (utente==null)
        await utenteDao.create({ email: req.user.email, token: 50, vittorie: 0, vintePerAbbandono: 0, perse: 0, persePerAbbandono:0 })
    }
    const partite = await partiteDao.readAll();
    const partita = partite.find(p => p.emailSfidante1 === req.session.personalEmail || p.emailSfidante2 === req.session.personalEmail);
    if (partita) {
        req.session.idMatch = partita.id;
    if(req.session.personalEmail===partita.emailSfidante1)
        req.session.email=partita.emailSfidante2;
    if(req.session.personalEmail===partita.emailSfidante2)
        req.session.email=partita.emailSfidante1;
    }
    next();
}

//funzione middleware per verificare validità email
function isValidEmail(req,res,next) {
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
   
    if(!emailRegex.test(req.query.mail))
        res.status(403).json({error: 'formato email non valido'});
    else
        next();
}

//funzione middleware per verificare presenza del parametro di query ordine, di valore asc o desc, per visualizzare la classifica
function descAsc (req,res,next){
    if (req.query.ordine) {
        if (req.query.ordine==="asc"||req.query.ordine==="desc")
            next();
        else
        res.status(403).json({error: 'inserisci asc o desc come valore del parametro ordine'});
    }
    else
    res.status(403).json({error: 'inserisci il parametro ordine, con asc o desc'});
    
}

//funzione middleware per verificare se è stata già inserita l'email dell'avversario
function alreadyMail (req, res, next) {
    if (req.session.email)
        res.status(403).json({error: 'la mail è già stata inserita'});
    else
        next();
}

//funzione middleware per verificare se token sono minori di 0.5 (costo di una partita)
async function numToken (req, res, next) {
    
    var user = await utenteDao.findByEmail(req.session.personalEmail);
            numTok = user.token;
            console.log(numTok);
            console.log("numero token");
            if (numTok < 0.5) {
                res.status(401).json({error:'Unauthorized'});}
                else
                next();
}

//funzione middleware per verificare se parametri della select siano giusti (formato storico mosse)
function selectStorico (req, res,next) {
    if (!req.query.formato || !req.query.dataInizio ||!req.query.dataFine)
    res.status(403).json({error: 'mancano uno o più parametri tra: dataInizio, dataFine e formato'});
   else if (req.query.formato!== "JSON"&& req.query.formato !== "PDF")
   res.status(403).json({error: 'formato non valido'});
    
    else next();

        
}
//funzione middleware per verificare se ci sia o meno partita da abbandonare
function checkAbbandona(req,res, next) {
    if (!req.session.idMatch)
        res.status(403).json({error:"nessuna partita da abbandonare"});
    else
    next();
}

//funzione middleware per verificare se ci sia partita di cui verificare il turno, e se sia o meno iniziata
async function checkPartita (req,res,next) {
    const partite = await partiteDao.readAll();
    const partita = partite.find(p => p.emailSfidante1 === req.session.personalEmail || p.emailSfidante2 === req.session.personalEmail);
if (!partita)
{
    res.status(403).json( {error:"non c'è nessuna partita in corso" });
}
else {
    if (partita.active===false) {
        res.status(403).json({error:"la partita deve ancora iniziare"});
    
    }
}
}

//funzione middleware per verificare se l'utente sia di ruolo admin, e se abbia inserito parametri giusti nel corpo della post
async function verifyAdmin (req, res, next) {
    var user;
    console.log(req.user);
    console.log(req.body);
        if (req.user.admin) {
    if (req.body){
    if(req.body.email) {
        user = await utenteDao.findByEmail(req.body.email);
    if (!user)
        res.status(403).json({error: 'non esiste un utente con questa mail'});
    else
        next();}
    else 
    res.status(403).json({error: 'devi inserire la mail'}); }
    else
        res.status(403).json({error: 'devi inserire il body'});
    }
    else
        res.status(403).json({error: 'devi essere admin per fare questa operazione'});
}

//funzione middleware per verificare se l'admin abbia inserito i token da aggiungere nel corpo della post
async function verifyToken (req,res, next){
    if (!req.body.token)
    {
        res.status(403).json({error: 'inserisci il numero di token da aggiungere'});
    }
    else if (!(Number.isInteger(req.body.token) && req.body.token > 0))
        res.status(403).json({error: 'il numero non è corretto'});
    else {
        next();

    }
}





//configurazione di ejs (embedded javascript) come motore di rendering
app.set('view engine', 'ejs');

var sym = ["x", "o"];

//rotta autenticata che restituisce la pagina iniziale
app.get('/', checkToken, verifyAndAuthenticate, async function(req,res) {
    
   
    
  
    
    var partite = await partiteDao.readAll();
  
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
});

//rotta autenticata per effettuare una mossa
app.get('/mossa',checkToken, verifyAndAuthenticate, async function(req,res){
   var sym;
   var occupata = false;
   console.log(req.session.email);
  
    if (!req.session.email){
        res.status(403).json({ error: "inserisci la mail del tuo avversario!" });
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
    res.status(403).json({ error: "aspetta il tuo avversario!" });
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
        res.status(403).json({ error: "non è il tuo turno!" });
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
        res.status(403).json({ error: "la posizione è già occupata!" });
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
//rotta autenticata per inserire la mail dell'avversario
    app.get('/mail',checkToken, verifyAndAuthenticate,alreadyMail, isValidEmail, numToken, async  function(req, res){
       
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
    );
//rotta autenticata che serve al file ejs per ottenere gli array in cui ci sono i contenuti delle 4 tabelle del gioco
    app.get('/stato-partita', checkToken, verifyAndAuthenticate,async function(req, res) {
        const partite = await partiteDao.readAll();
        const partita = partite.find(p => p.emailSfidante1 === req.session.personalEmail || p.emailSfidante2 === req.session.personalEmail);
        
        if (partita) {
            var arrayss = partiteLocal[partita.id];
            res.json({ arrayss });
        }
    });
//rotta autenticata per abbandonare la partita
    app.get('/abbandona', checkToken, verifyAndAuthenticate,checkAbbandona,async function (req, res) {

      
        
            match = await partiteDao.read(req.session.idMatch);
    
        
            let opponentEmail = match.emailSfidante1 === req.session.personalEmail ? match.emailSfidante2 : match.emailSfidante1;
    
           
            req.sessionStore.all(async (err, sessions) =>  {
                if (err) {
                    console.error('Errore durante l\'accesso alle sessioni:', err);
                    res.status(500).json( {error:"Errore durante l'accesso alle sessioni"} );
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
                var winner = await utenteDao.findByEmail(opponentEmail);
                var loser = await utenteDao.findByEmail(req.session.personalEmail);
                console.log(winner);
                
                console.log(loser);
                console.log("winner loser.........");
                await utenteDao.vittoria(opponentEmail, {vittorie: winner.vittorie + 1, vintePerAbbandono: winner.vintePerAbbandono +1 });
                await utenteDao.perdita(req.session.personalEmail, {perse: loser.perse + 1, persePerAbbandono: loser.persePerAbbandono +1 });
                await partiteDao.delete(req.session.idMatch);
                delete partiteLocal[req.session.idMatch];
                req.session.email = null;
                req.session.idMatch = null;
                
                res.send("Partita abbandonata con successo");
            });
        }
     
    );



//rotta pubblica per ottenere la classifica dei giocatori
  app.get('/classifica', descAsc, async (req, res) => {
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
//rotta autenticata per ottenere lo storico delle mosse
  app.get('/storico-mosse',checkToken, verifyAndAuthenticate, selectStorico, async (req, res) => {
    const { formato, dataInizio, dataFine } = req.query;
    const email = req.session.email;
    
  
    const startDate = new Date(dataInizio);
    const endDate = new Date(dataFine);
    
   
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

        
        doc.pipe(res);

       
        doc.text('Storico Mosse');
        filteredMosse.forEach(mossa => {
            doc.text(`ID: ${mossa.id}`);
            doc.text(`Email: ${mossa.email}`);
            doc.text(`Descrizione: ${mossa.descrizione}`);
            doc.text(`Data: ${mossa.data}`);
            doc.moveDown();
        });

     
        doc.end();
    } 
});

//rotta autenticata per verificare di chi è il turno
app.get('/turno',checkToken, verifyAndAuthenticate, checkPartita, async (req,res)=> {

    
        if (((partita.emailSfidante1===req.session.personalEmail)&& (turni[partita.id]===1)) ||((partita.emailSfidante2===req.session.personalEmail)&& (turni[partita.id]===2)))
            res.send("è il tuo turno");
        else
        res.send("non è il tuo turno");

    }


);

//rotta autenticata e riservata all'admin (post) per effettuare la ricarica di token 
app.post('/ricarica', checkToken, verifyAndAuthenticate, verifyAdmin, verifyToken, async (req, res) => {
    var utente = await utenteDao.findByEmail(req.body.email);
        const tokens=utente.token;
         const nuoviToken = tokens + req.body.token;
       await utenteDao.update(req.body.email, {token: nuoviToken});

        res.json({token_precedenti: tokens, 
            token_aggiunti: req.body.token, 
            token_attuali: nuoviToken
        });
})


  
    
    

//server in ascolto sulla porta 3000
app.listen(3000);



