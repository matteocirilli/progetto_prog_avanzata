import { syncDb, Utente } from './dist/db.js';

async function seedUtenti() {
    await syncDb();

    await Utente.bulkCreate([
        { email: 'matteo_cirilli@outlook.it', token: 100, vittorie:0, vintePerAbbandono: 0, perse: 0, persePerAbbandono: 0},
        { email: 'mariorossi@gmail.com', token: 100, vittorie:0, vintePerAbbandono: 0, perse: 0, persePerAbbandono: 0},
       
    ]);

    console.log("Utenti seeding completed.");
}

seedUtenti().catch((error) => {
    console.error("Utenti seeding failed: ", error);
});