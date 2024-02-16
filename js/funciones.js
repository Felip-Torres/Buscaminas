let board = document.getElementById("board");
let filas = 12;// Numero de filas
let columnas = 12;// Numero de columnas
let mineCount = 30;// Cantidad de minas
let PrimerClick;
let MinasRestantes;
let unrevealedSafeCells;
let gameBoard;
principal();

function principal(){
    if(document.getElementById("filas").value > 2)filas = document.getElementById("filas").value;else alert("")// Numero de filas
    if(document.getElementById("columnas").value > 4)columnas = document.getElementById("columnas").value;// Numero de columnas
    if(document.getElementById("minas").value<filas*columnas)mineCount = document.getElementById("minas").value;// Cantidad de minas
    PrimerClick = true;
    MinasRestantes = 0;
    unrevealedSafeCells = (filas*columnas)-mineCount;
    gameBoard = [];

    board.innerHTML="";
    for (let row = 0; row < filas; row++) {
        for (let col = 0; col < columnas; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener("click", handleClick);
            cell.addEventListener("contextmenu", handleRightClick); // Agregar evento de clic derecho
            board.appendChild(cell);
        }
    }
    document.querySelector(":root").style.setProperty("--num-filas", filas);
    document.querySelector(":root").style.setProperty("--num-columnas", columnas);
    document.querySelector("#numMinasRestantes").innerHTML = (mineCount - MinasRestantes);
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
                isFlagged: false,
                neighbors: 0
            });
        }
        gameBoard.push(rowArray);
    }
}

document.querySelector("#numMinasRestantes").innerHTML = (mineCount - MinasRestantes);

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

function desabilitar(){
    let aCasillas = board.children;
    for (let i = 0 ; i < aCasillas.length; i++) {
        //quitamos los listeners de los eventos a las casillas
        aCasillas[i].removeEventListener("click", handleClick);
        aCasillas[i].removeEventListener("contextmenu", handleRightClick);
    }

}

function revealCell(row, col) {
    if (row < 0 || col < 0 || row >= filas || col >= columnas) return; // Evita desbordamiento del tablero.

    const cell = gameBoard[row][col]; //Creamos una constante con las propiedades de la casilla en esta fila y columna
    if (cell.isRevealed || cell.isFlagged)return; // No revelamos una casilla ya revelada o con bandera.
    cell.isRevealed = true;
    if(PrimerClick){
        plantMines(row, col);
        calculateNeighbors();
        PrimerClick=false;
    }

    const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    cellElement.classList.add('destapado');
    //Añado la clase que cotrola el color del numero dependiendo las minas que tiene alrededor.
    cellElement.classList.add('c' + gameBoard[row][col].neighbors);
    //Añade dentro de la casilla el numero de minas.


    if (cell.isMine) {
        cellElement.classList.add('icon-bomba'); // Unicode del símbolo de la bomba
        alert("has perdut");
        desabilitar();
    } else if (cell.neighbors === 0) {
        // Si la casilla no tiene minas vecinas, revela las casillas adyacentes.
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                revealCell(r, c);
            }
        }
        unrevealedSafeCells--;
    } else {
        cellElement.innerHTML = gameBoard[row][col].neighbors;
        unrevealedSafeCells--;
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

function checkWin() {
    // Verifica si el jugador ha ganado.
    // El jugador gana si todas las casillas no minadas están reveladas.

    if (unrevealedSafeCells === 0) {
        alert("has guanyat");
        desabilitar();
        // El jugador ha ganado.
        // Muestra un mensaje de victoria.
    }
}

function toggleFlag(row, col) {
    const cell = gameBoard[row][col];
    const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);

    if (!cell.isRevealed) {
        if (!cell.isFlagged) {
            if (MinasRestantes<mineCount){
                MinasRestantes++;
                cellElement.classList.add('icon-bandera'); // Agregar clase para mostrar la bandera
                cell.isFlagged = !cell.isFlagged;// Cambiar el estado de la bandera
            }
        } else {
            cellElement.classList.remove('icon-bandera'); // Remover clase para quitar la bandera
            MinasRestantes--;
            cell.isFlagged = !cell.isFlagged;// Cambiar el estado de la bandera
        }
    }
    document.querySelector("#numMinasRestantes").innerHTML = (mineCount - MinasRestantes);
}

function handleClick(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    revealCell(row, col);
    checkWin();
}

function handleRightClick(event) {
    event.preventDefault(); // Evitar el menú contextual del botón derecho

    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    toggleFlag(row, col);
}