const express = require("express");
const app = express();
const path = require('path');
require ('dotenv').config()

const { auth } = require('express-openid-connect');
const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SECRET,
    baseURL: 'http://localhost:3000',
    clientID: 'IIxjBJ2B6pxBmTFBz3OqDR9G3xli4Ghh',
    issuerBaseURL: 'https://dev-ichqjusldn3oaiya.us.auth0.com'
  };
  app.use(auth(config));


app.get('/',function(req,res) {
    console.log(req.oidc.isAuthenticated());
    res.sendFile(path.join(__dirname, 'index.html'));
})
app.get('/mossa', function(req,res){
    var mossa = req.query.mossa;
    var livello = req.query.livello;
    var riga = req.query.riga;
    var col = req.query.col;
    
    
res.send(mossa + ' ' + livello +' '  + riga + ' '+ col);
});
app.listen(3000);
console.log("ciao");