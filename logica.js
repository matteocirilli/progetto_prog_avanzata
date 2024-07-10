

//funzione per verificare se ci siano o meno 4 'o' o 4 'x' uguali in una delle righe
function verifyRow(array) {
    var arr = [...array];
    var flag = false;

    var b = arr.splice(0, 4);
    var c = arr.splice(0, 4);
    var d = arr.splice(0, 4);
    var e = arr.splice(0, 4);

    if (verifySingleRowColDiag(b) == 1 || verifySingleRowColDiag(c) == 1 || verifySingleRowColDiag(d) == 1 || verifySingleRowColDiag(e) == 1)
        return 1
    else if (verifySingleRowColDiag(b) == 2 || verifySingleRowColDiag(c) == 2 || verifySingleRowColDiag(d) == 2 || verifySingleRowColDiag(e) == 2)
        return 2;
    else return 3;
}

//funzione per verificare se ci siano o meno 4 'o' o 4 'x' uguali in una delle colonne
function verifyColumn(array) {
    var arr = [...array];

    var b = [];
    var c = [];
    var d = [];
    var e = [];
    for (var i = 0; i < 16; i = i + 4) {
        b.push(arr[i]);
        c.push(arr[i + 1]);
        d.push(arr[i + 2]);
        e.push(arr[i + 3]);
    }

    if (verifySingleRowColDiag(b) == 1 || verifySingleRowColDiag(c) == 1 || verifySingleRowColDiag(d) == 1 || verifySingleRowColDiag(e) == 1)
        return 1
    else if (verifySingleRowColDiag(b) == 2 || verifySingleRowColDiag(c) == 2 || verifySingleRowColDiag(d) == 2 || verifySingleRowColDiag(e) == 2)
        return 2;
    else return 3;
}

//funzione per verificare se ci siano o meno 4 'o' o 4 'x' uguali in una delle diagonali
function verifyDiag(array) {
    var arr = [...array];
    var flag = false;

    var b = arr.splice(0, 4);
    var c = arr.splice(0, 4);
    var d = arr.splice(0, 4);
    var e = arr.splice(0, 4);
    var diag1 = [];
    var diag2 = [];
    diag1.push(b[0]);
    diag1.push(c[1]);
    diag1.push(d[2]);
    diag1.push(e[3]);

    diag2.push(b[3]);
    diag2.push(c[2]);
    diag2.push(d[1]);
    diag2.push(e[0]);

    if (verifySingleRowColDiag(diag1) == 1 || verifySingleRowColDiag(diag2) == 1)
        return 1
    else if (verifySingleRowColDiag(diag2) == 2 || verifySingleRowColDiag(diag2) == 2)
        return 2;
    else return 3;



}

//funzione per verificare se ci siano o meno 4 'o' o 4 'x' uguali in una singola riga/colonna/diagonale
function verifySingleRowColDiag(arr) {
    var x = 0;
    var o = 0;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == "x")
            x++;
        else if (arr[i] == "o")
            o++;
    }
    if (x == 4)
        return 1;
    else if (o == 4)
        return 2;
    else return 3;

}
//funzione per verificare se ci siano o meno 4 'o' o 4 'x' uguali in una delle colonne verticali
function verifyColumnVertical(array) {
    var numx = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var numo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (var i = 0; i < array.length; i++) {
        for (var l = 0; l < array[i].length; l++) {
            if (array[i][l] == "x")
                numx[l]++;
            else if (array[i][l] == "o")
                numo[l]++;
        }

    }
    console.log(numx, numo);
    for (var k = 0; k < numx.length; k++) {
        if (numx[k] == 4)
            return 1;
        else if (numo[k] == 4)
            return 2;
        else return 3;
    }


}

//funzione per verificare se ci siano o meno 4 'o' o 4 'x' uguali in una delle diagonali verticali
function check3DTicTacToeDiagonals(levels) {

    if (
        levels[0][0] === levels[1][5] && levels[1][5] === levels[2][10] && levels[2][10] === levels[3][15] &&
        (levels[0][0] === 'x' || levels[0][0] === 'o')
    ) {
        return levels[0][0] === 'x' ? 1 : 2;
    }

    if (
        levels[0][3] === levels[1][6] && levels[1][6] === levels[2][9] && levels[2][9] === levels[3][12] &&
        (levels[0][3] === 'x' || levels[0][3] === 'o')
    ) {
        return levels[0][3] === 'x' ? 1 : 2;
    }

    if (
        levels[3][0] === levels[2][5] && levels[2][5] === levels[1][10] && levels[1][10] === levels[0][15] &&
        (levels[3][0] === 'x' || levels[3][0] === 'o')
    ) {
        return levels[3][0] === 'x' ? 1 : 2;
    }

    if (
        levels[3][3] === levels[2][6] && levels[2][6] === levels[1][9] && levels[1][9] === levels[0][12] &&
        (levels[3][3] === 'x' || levels[3][3] === 'o')
    ) {
        return levels[3][3] === 'x' ? 1 : 2;
    }


    return 3;
}

//export delle funzioni per poterle utilizzare in server.js
module.exports = {
    verifyRow,
    verifyColumn,
    verifyDiag,
    verifySingleRowColDiag,
    verifyColumnVertical,
    check3DTicTacToeDiagonals,
};
