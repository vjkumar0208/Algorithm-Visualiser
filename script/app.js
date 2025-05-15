document.querySelector("#clear-path").addEventListener("click", clearGrid);
document.querySelector("#clear").addEventListener("click", (e) => {
    clearGrid(0, false, true);
    e.target.disabled = true;
    document.querySelector("#clear-path").disabled = true;
});
document.querySelector("#clear-path").addEventListener("click", (e) => {
    clearGrid();
    e.target.disabled = true;
});
document
    .querySelector("#maze-prim")
    .addEventListener("click", () => generateMaze("prim"));

document.querySelector("#visualize").addEventListener("click", visualize);

document
    .querySelector("#dijkstra")
    .addEventListener("click", () => makeChoice("Dijkstra (UCS)"));
let status = 0;
let running = "";
let runningMessage = "";
const height =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;
const width =
    window.innerWdith ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;

function generateMaze(choice) {
    document.querySelector("#visualize").textContent = `Visualize`;
    document.querySelector("#visualize").disabled = true;
    document.querySelector("#clear").disabled = true;
    document.querySelector("#clear-path").disabled = true;
    document.querySelector("#size-slider").disabled = true;
    document.querySelector("#path-finding-grp-btn").disabled = true;
    document.querySelector("#maze-generation-grp-btn").disabled = true;
    document.querySelector("#breakpoint-toggler").click();
    if (width < height) {
        setTimeout(
            () =>
                document
                    .querySelector("#grid-container")
                    .scrollIntoView({ behaviour: "smooth" }),
            0
        );
    } else {
        setTimeout(
            () =>
                document
                    .querySelector("#grid-helper")
                    .scrollIntoView({ behaviour: "smooth" }),
            0
        );
    }
    switch (choice) {
        case "prim":
            generateMazePrimRT(nodes);
            break;
    }
}

function pathFinderTab() {
    clearToasts();
    let shortcutToastTriggerEl = document.getElementById("shortcut-toast");
    let shortcutToast = new mdb.Toast(shortcutToastTriggerEl);
    shortcutToast.show();

    setTimeout(() => shortcutToast.hide(), 6500);
}

function visualize() {
    running = runningMessage;
    document.querySelector("#visualize").disabled = true;
    document.querySelector("#clear").disabled = true;
    document.querySelector("#clear-path").disabled = true;
    document.querySelector("#size-slider").disabled = true;
    document.querySelector("#path-finding-grp-btn").disabled = true;
    document.querySelector("#maze-generation-grp-btn").disabled = true;
    document.querySelector("#breakpoint-toggler").click();
    if (width < height) {
        setTimeout(
            () =>
                document
                    .querySelector("#grid-container")
                    .scrollIntoView({ behaviour: "smooth" }),
            0
        );
    } else {
        setTimeout(
            () =>
                document
                    .querySelector("#grid-helper")
                    .scrollIntoView({ behaviour: "smooth" }),
            0
        );
    }
    switch (running) {
        case "Dijkstra (UCS)":
            executeDijkstra();
            break;
    }
}

function visualizeRT() {
    switch (running) {
        case "Dijkstra (UCS)":
            dijkstraRT(nodes, startNode, endNode);
            break;
    }
    document.querySelector("#clear").disabled = false;
    document.querySelector("#clear-path").disabled = false;
    document.querySelector("#size-slider").disabled = false;
}
function makeChoice(choice) {
    running = "";
    clearGrid(1);
    runningMessage = choice;
    let btn = document.querySelector("#visualize");
    btn.disabled = false;
    btn.textContent = `Visualize ${choice}`;
}
function executePrimMazeGeneration() {
    clearGrid(0, false, false);
    document.querySelector("#breakpoint-toggler").click();
    for (let i = 0; i < nodes.length; ++i) {
        for (let j = 0; j < nodes[i].length; ++j) {
            nodes[i][j].divReference.classList.add("node-wall");
            nodes[i][j].isWall = true;
        }
    }
    let choices = [
        [-2, 0],
        [0, 2],
        [2, 0],
        [0, -2],
    ];
    // picking random cell and making it a passage
    let cell =
        nodes[Math.floor(Math.random() * nodes.length)][
            Math.floor(Math.random() * nodes[0].length)
        ];
    cell.isWall = false;
    cell.divReference.classList.remove("node-wall");
    // compute frontier cells of picked random cell
    let frontierList = [];
    computeFrontierCells(nodes, cell, frontierList, choices);
    setTimeout(generateMazePrim, 0, nodes, frontierList, choices);
}

function executeDijkstra() {
    if (!nodes || !startNode || !endNode) {
        return;
    }
    clearGrid();
    let curr = startNode;
    let distanceMap = new Map();
    let processed = new Set();
    let choices = [
        [1, 0],
        [-1, 0],
        [0, -1],
        [0, 1],
    ];
    let parentMap = new Map();
    parentMap.set(curr, null);
    for (let i = 0; i < nodes.length; ++i) {
        for (let j = 0; j < nodes[i].length; ++j) {
            distanceMap.set(nodes[i][j], Infinity);
        }
    }
    distanceMap.set(curr, 0);
    let minHeap = [];
    minHeap.push(curr);
    setTimeout(
        dijkstra,
        0,
        nodes,
        startNode,
        endNode,
        distanceMap,
        processed,
        choices,
        parentMap,
        minHeap
    );
}
function executeDrawPath(parentMap, endNode) {
    let path = getPath(parentMap, endNode);
    setTimeout(drawPath, 0, 0, path);
}

function clearGrid(statusVal = 0, keep = true, initials = true) {
    clearToasts();
    if (!keep) {
        grid.addEventListener("click", divClicked);
    }
    for (let i = 0; i < nodes.length; ++i) {
        for (let j = 0; j < nodes[i].length; ++j) {
            nodes[i][j].divReference.className = "node";
            if (nodes[i][j].isStart) {
                if (keep || initials) {
                    nodes[i][j].divReference.classList.add("node-start");
                } else {
                    startNode = null;
                    nodes[i][j].isStart = false;
                }
            }
            if (nodes[i][j].isEnd) {
                if (keep || initials) {
                    nodes[i][j].divReference.classList.add("node-end");
                } else {
                    endNode = null;
                    nodes[i][j].isEnd = false;
                }
            }
            if (nodes[i][j].isWall) {
                if (keep) {
                    nodes[i][j].divReference.classList.add("node-wall");
                } else {
                    nodes[i][j].isWall = false;
                }
            }
            if (nodes[i][j].weight) {
                if (keep) {
                    nodes[i][j].divReference.classList.add(
                        `node-strong-${nodes[i][j].weight}`
                    );
                } else {
                    nodes[i][j].weight = 0;
                }
            }
        }
    }
    status = statusVal;
}

function chooseRndStartEnd() {
    let rows = nodes.length;
    let cols = nodes[0].length;
    let startRndRow = Math.floor(Math.random() * rows);
    let startRndCol = Math.floor(Math.random() * cols);
    while (nodes[startRndRow][startRndCol].isWall) {
        startRndRow = Math.floor(Math.random() * rows);
        startRndCol = Math.floor(Math.random() * cols);
    }
    let endRndRow = Math.floor(Math.random() * rows);
    let endRndCol = Math.floor(Math.random() * cols);
    while (endRndCol === startRndCol || nodes[endRndRow][endRndCol].isWall) {
        endRndRow = Math.floor(Math.random() * rows);
        endRndCol = Math.floor(Math.random() * cols);
    }

    nodes[startRndRow][startRndCol].divReference.classList.add("node-start");
    startNode = nodes[startRndRow][startRndCol];
    nodes[startRndRow][startRndCol].isStart = true;
    nodes[endRndRow][endRndCol].divReference.classList.add("node-end");
    endNode = nodes[endRndRow][endRndCol];
    nodes[endRndRow][endRndCol].isEnd = true;
}

function clearToasts() {
    let failToastTriggerEl = document.getElementById("fail-toast");
    let failToast = new mdb.Toast(failToastTriggerEl);
    let infoToastTriggerEl = document.getElementById("info-toast");
    let infoToast = new mdb.Toast(infoToastTriggerEl);
    let shortcutToastTriggerEl = document.getElementById("shortcut-toast");
    let shortcutToast = new mdb.Toast(shortcutToastTriggerEl);
    let kahnToastTriggerEl = document.getElementById("fail-kahn-toast");
    let kahnToast = new mdb.Toast(kahnToastTriggerEl);
    kahnToast.hide();
    failToast.hide();
    infoToast.hide();
    shortcutToast.hide();
}
