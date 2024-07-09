# PROGETTO PROGRAMMAZIONE AVANZATA - TIC TAC TOE 3D

## Obiettivo del Progetto

L'obiettivo del progetto era realizzare un server express su Node.js che permettesse di giocare a Tic Tac Toe 3D. Questo gioco, rispetto alla versione classica, differisce sul fatto che oltre a vincere tramite diagonali, righe e colonne sullo stesso livello, si può vincere anche mettendo tutti simboli uguali su una colonna in verticale o su una diagonale in verticale, attraversando i 4 livelli.

## Progettazione

### Diagrammi UML

Descrizione dei diagrammi UML utilizzati per progettare il sistema. Includere immagini o collegamenti ai diagrammi UML.

![Diagramma di esempio](link_al_diagramma_uml.png)

### Pattern utilizzati

Descrizione dei design pattern utilizzati nel progetto e dei motivi di utilizzo.

#### Middleware
Il Middleware è un pattern che serve per filtrare le richieste prima che arrivino al server Express. In particolare due funzioni, ovvero *checkToken* e *verifyAndAuthenticate* sono nel middleware di tutte le richieste *get*, meno che nella rotta */classifica*, in quanto è stata realizzata come unica rotta pubblica.
- `checkToken`: verifica se c'è un token nell'header di autenticazione, nel caso in cui ci sia chiama attraverso la *next()* la funzione di middleware successiva, altrimenti manda indietro un codice di errore.
```javascript
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
```

- `verifyAndAuthenticate`: verifica la firma del token utilizzando una chiave segreta.
```javascript
 let decoded = jwt.verify (req.token, process.env.SECRET_KEY);
```
Queste funzioni sono utilizzate per garantire che tutte le richieste siano autenticate e autorizzate correttamente.

#### DAO (Data Access Object)
Il pattern DAO è utilizzato per astrarre la parte di persistenza. 


## Come Avviare il Progetto con Docker

Istruzioni per avviare il progetto utilizzando Docker.

1. **Clonare la Repository**:

    ```bash
     git clone https://github.com/matteocirilli/progetto_prog_avanzata
    cd progetto_prog_avanzata
    ```

2. **Costruire l'Immagine Docker**:

    ```bash
    docker build -t nomeimmagine .
    ```

3. **Avviare il Container Docker**:

    ```bash
    docker run -d --name nomecontainer -p 3000:3000 nomeimmagine:latest
    ```

4. **Accedere al Progetto**:

    Apri il tuo browser e vai a `http://localhost:3000`.

## Test delle Rotte con Postman

Istruzioni su come testare le API del progetto utilizzando Postman.

1. **Importare la Collezione di Postman**:

    - Scarica il file della collezione Postman dal seguente [link](link_alla_collezione_postman.json).
    - Apri Postman e importa la collezione scaricata.

2. **Configurare le Variabili di Ambiente**:

    Configura le variabili di ambiente necessarie per eseguire i test.

3. **Eseguire i Test**:

    - Seleziona la collezione importata.
    - Clicca su "Run" per eseguire tutti i test delle rotte.

### Esempio di Richiesta

**Richiesta GET a `/api/example`**:

```http
GET /api/example HTTP/1.1
Host: localhost:8000
