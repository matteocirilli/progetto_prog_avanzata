

let a = ["x", "x", "x", "o", "o", "x", "o", "x", "x", "o", "x", "x", "o", "o", "x", "o"];
let b = ["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1" ];

function verifyRow (array) {
    var arr = [...array];
    var flag = false;
    
    var b = arr.splice (0,4);
    var c = arr.splice (0,4);
    var d = arr.splice (0,4);
    var e = arr.splice (0,4);

    if (verifySingleRowColDiag(b)==1||verifySingleRowColDiag(c)==1||verifySingleRowColDiag(d)==1||verifySingleRowColDiag(e)==1)
        return 1
    else if (verifySingleRowColDiag(b)==2||verifySingleRowColDiag(c)==2||verifySingleRowColDiag(d)==2||verifySingleRowColDiag(e)==2)
        return 2;
    else return 3;
   }

   function verifyColumn (array) {
    var arr = [...array];

    var b = [];
    var c = [];
    var d = [];
    var e = [];  
    for (var i = 0; i<16;i=i+4){
        b.push(arr[i]);
        c.push(arr[i+1]);
        d.push(arr[i+2]);   
        e.push(arr[i+3]); 
    }
    
    if (verifySingleRowColDiag(b)==1||verifySingleRowColDiag(c)==1||verifySingleRowColDiag(d)==1||verifySingleRowColDiag(e)==1)
        return 1
    else if (verifySingleRowColDiag(b)==2||verifySingleRowColDiag(c)==2||verifySingleRowColDiag(d)==2||verifySingleRowColDiag(e)==2)
        return 2;
    else return 3;
    }

    
    function verifyDiag (array) {
    var arr = [...array];
    var flag = false;
    
    var b = arr.splice (0,4);
    var c = arr.splice (0,4);
    var d = arr.splice (0,4);
    var e = arr.splice (0,4);
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

    if (verifySingleRowColDiag(diag1)==1||verifySingleRowColDiag(diag2)==1)
        return 1
    else if (verifySingleRowColDiag(diag2)==2||verifySingleRowColDiag(diag2)==2)
        return 2;
    else return 3;

   

    }

function verifySingleRowColDiag(arr){
    var x = 0;
    var o = 0;
    for (var i = 0; i<arr.length; i++){
        if (arr[i]== "x")
            x++;
        else if (arr[i]=="o")
            o++;
    }
    if (x==4) 
        return 1;
    else if (o==4)
        return 2;
    else return 3;
   
}

function verifyColumnVertical (array) {
    var numx = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    var numo = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
   for (var i=0;i<array.length;i++) {
    for (var l=0; l<array[i].length;l++){
        if (array[i][l]=="x")
            numx[l]++;
        else if (array[i][l]=="o")
            numo[l]++;
    }

   }
   console.log(numx, numo);
   for (var k=0; k<numx.length;k++){
    if (numx[k]==4)
        return 1;
    else if (numo[k]==4)
        return 2;
    else return 3;
   }

    
}

module.exports = {
    verifyRow,
    verifyColumn,
    verifyDiag,
    verifySingleRowColDiag,
    verifyColumnVertical
};
console.log(verifyRow(a));
console.log(verifyColumn(a));
console.log(verifyDiag(a));
console.log(verifyRow(b));
console.log(verifyColumn(b));
console.log(verifyDiag(b));