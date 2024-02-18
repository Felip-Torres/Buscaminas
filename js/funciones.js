//Variables globales y valores por defecto
let board = document.getElementById("board"); //div en el que se guardara el tablero de juego
let filas = document.getElementById("filas").value;// Numero de filas por defecto
let columnas = document.getElementById("columnas").value;// Numero de columnas por defecto
let mineCount = document.getElementById("minas").value;// Cantidad de minas por defecto
let gameBoard; //Variable que almacena los diferentes parametros de una casilla (Si es una mina, el numero de minas a su alrededor, etc)
let PrimerClick; //Variable booleana que almacena si en esta partida sea revelado una casilla o no
let MinasEncontradas; //Variable que guestiona cuantos banderirenes hay colocados
let unrevealedSafeCells; //Variable que guarda el numero de casillas sin minas que faltan por revelar

//funcion que ejecutara el video cuando acabe de reproducirse.
function videoEnded() {
    document.getElementById('video').style.display = 'none'; // Ocultar el video cuando termine
}
function estilo0(){
    document.querySelector(":root").style.setProperty("--mina", 'url("mina.svg")');
}
function estilo1(){
    document.querySelector(":root").style.setProperty("--mina", 'url("mina1.svg")');
}
principal();//generara la primera partida con los valores pordefecto

//Funcion para iniciar una partida
function principal(){
    //Si las filas introducidas por el usuario son mas de dos se las asignamos a la variable,
    // si no avisamos al usuario, y el valor de filas se mantendra igual al ultimo utilizado
    if(document.getElementById("filas").value > 2)filas = document.getElementById("filas").value;else alert("Escribe 3 filas o mas");
    //Si las columnas introducidas por el usuario son mas de cuatro se las asignamos a la variable,
    // si no avisamos al usuario, y el valor de columnas se mantendra igual al ultimo utilizado
    if(document.getElementById("columnas").value > 4)columnas = document.getElementById("columnas").value;else alert("Escribe 5 columnas o mas");
    //Si las minas son inferiores a filas*columnas(el numero de casillas), entonces se las asignamos a la variable,
    //de lo contrario la generacion de minas quedaria en blucle, por lo que aviso al usuario y asigno la maxima
    //cantidad de minas en el tablero mas pequeño posible(14 minas)
    if(document.getElementById("minas").value<filas*columnas)mineCount = document.getElementById("minas").value;
    else{
        alert("Has introducido mas minas que casillas, introducieno valores por defecto(14)");
        mineCount = 14;
    } // Cantidad de minas
    PrimerClick = true;
    MinasEncontradas = 0;
    unrevealedSafeCells = (filas*columnas)-mineCount;
    gameBoard = [];

    board.innerHTML="";
    for (let row = 0; row < filas; row++) {
        for (let col = 0; col < columnas; col++) {
            const cell = document.createElement("div");
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener("click", handleClick);
            cell.addEventListener("contextmenu", toggleFlag); // Agregar evento de clic derecho
            board.appendChild(cell);
        }
    }
    document.querySelector(":root").style.setProperty("--num-filas", filas);
    document.querySelector(":root").style.setProperty("--num-columnas", columnas);
    document.querySelector("#numMinasRestantes").innerHTML = (mineCount - MinasEncontradas);
    createBoard();
}


function createBoard() {
    // Crea el tablero y llena con casillas vacías.
    for (let row = 0; row < filas; row++) {
        const rowArray = [];
        for (let col = 0; col < columnas; col++) {
            rowArray.push({
                isMine: false,
                isRevealed: false,
                isFlagged: 0,
                neighbors: 0
            });
        }
        gameBoard.push(rowArray);
    }
}

function plantMines(r, c) {
    // Coloca minas en ubicaciones aleatorias.
    for (let i = 0; i < mineCount; i++) {
        let row, col;
        do {
            row = Math.floor(Math.random() * filas);
            col = Math.floor(Math.random() * columnas);
        } while (gameBoard[row][col].isMine || (row===r && col===c) );
        gameBoard[row][col].isMine = true;
    }
}


function calculateNeighbors() {
    // Calcula el número de minas vecinas para cada casilla.
    for (let row = 0; row < filas; row++) {
        for (let col = 0; col < columnas; col++) {
            if (gameBoard[row][col].isMine) {
                continue;
            }

            for (let r = row - 1; r <= row + 1; r++) {
                for (let c = col - 1; c <= col + 1; c++) {
                    if (r >= 0 && c >= 0 && r < filas && c < columnas && gameBoard[r][c].isMine) {
                        gameBoard[row][col].neighbors++;
                    }
                }
            }
        }
    }
}

function revealCell(row, col) {
    if (row < 0 || col < 0 || row >= filas || col >= columnas) return; // Evita desbordamiento del tablero.

    let cell = gameBoard[row][col]; //Creamos una variable con las propiedades de la casilla en esta fila y columna
    if (cell.isRevealed || cell.isFlagged === 1)return; // No revelamos una casilla ya revelada o con bandera.
    cell.isRevealed = true;
    if(PrimerClick){
        plantMines(row, col);
        calculateNeighbors();
        PrimerClick=false;
    }

    let cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    cellElement.classList.add('destapado');


    if (cell.isMine) {
        cellElement.classList.add("icon-mina");
        cellElement.style.backgroundColor = "red"; // Unicode del símbolo de la bomba
        desabilitar();
        // Revelar todas las minas
        for (let r = 0; r < filas; r++) {
            for (let c = 0; c < columnas; c++) {
                if (gameBoard[r][c].isMine) {
                    cell = gameBoard[r][c];
                    cellElement = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                    cellElement.classList.add('destapado');
                    if(cell.isFlagged === 0)cellElement.classList.add("icon-mina");
                    cellElement.style.backgroundColor = "red";
                }
            }
        }
        video.style.display = 'block'; // Mostrar el video
        video.play(); // Reproducir el video

        const explosionAudio = document.getElementById("explosionAudio");
        explosionAudio.play();
    } else if (cell.neighbors === 0) {
        // Si la casilla no tiene minas vecinas, revela las casillas adyacentes.
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                revealCell(r, c);
            }
        }
        unrevealedSafeCells--;
    } else {
        //Añado la clase que cotrola el color del numero dependiendo las minas que tiene alrededor.
        cellElement.classList.add('c' + gameBoard[row][col].neighbors);
        //Añade dentro de la casilla el numero de minas.
        cellElement.innerHTML = gameBoard[row][col].neighbors;
        unrevealedSafeCells--;
    }
    bubbleSound.currentTime = 0;
    bubbleSound.play();
}

function checkWin() {
    // El jugador gana si todas las casillas no minadas están reveladas.
    if (unrevealedSafeCells === 0) {
        alert("has guanyat");// Muestra un mensaje de victoria.
        desabilitar();
    }
}

function desabilitar(){
    let aCasillas = board.children;
    for (let i = 0 ; i < aCasillas.length; i++) {
        //quitamos los listeners de los eventos a las casillas
        aCasillas[i].removeEventListener("click", handleClick);
        aCasillas[i].removeEventListener("contextmenu", toggleFlag);
    }

}

function toggleFlag(event) {
    event.preventDefault();// Evitar el menú contextual del botón derecho
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    const cell = gameBoard[row][col];
    const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);

    if (!cell.isRevealed) {
        if (cell.isFlagged===0) {
            if (MinasEncontradas<mineCount){
                MinasEncontradas++;
                cellElement.classList.add("icon-bandera"); // Agregar bandera
                cell.isFlagged = 1;// Cambiar el estado a bandera(1)
            }
        } else if(cell.isFlagged === 1){
            cellElement.classList.remove("icon-bandera");
            cellElement.classList.add("icon-duda"); // cambiar a interogante
            MinasEncontradas--;
            cell.isFlagged = 2;// Cambiar el estado a interrogante(2)
        }else{
            cellElement.classList.remove("icon-duda");// Remover interrogante
            cell.isFlagged = 0;// Cambiar el estado a vacio(0)
        }
    }
    document.querySelector("#numMinasRestantes").innerHTML = (mineCount - MinasEncontradas);
}

function handleClick(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    revealCell(row, col);
    checkWin();
}

