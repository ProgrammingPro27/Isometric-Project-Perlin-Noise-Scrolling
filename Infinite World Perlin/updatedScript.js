let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

let size = 20;
let chunkSize = 20;

let activateStroke = true;
let isScrolling = true;


function mesh(x, y, mapX, mapY, size) {
    let map = [];
    let oriX = x
    let oriY = y
    for (let i = 0; i < mapX; i++) {
        let mapRow = [];
        for (let j = 0; j < mapY; j++) {
            let isoCube = [x, y];
            x += size;
            y += size / 2;
            mapRow.push(isoCube);
        };
        oriX -= size;
        oriY += size / 2;
        x = oriX;
        y = oriY;
        map.push(mapRow);
    };
    return map;
}




//============================================================================================================





let map3 = mesh(0, 0, chunkSize, chunkSize, size);


let perlin = new Perlin();
perlin.seed();

function baseCoords(map) {
    let mapCoords = [];
    for (let i = 0; i < map.length; i++) {
        let row = []
        for (let j = 0; j < map[i].length; j++) {
            row.push(map[i][j][1])
        }
        mapCoords.push(row)
    }

    return mapCoords;
}

let thisMap = baseCoords(map3)

let flying = 0;
let flying2 = 0;

function update(num, op, map, gridSize, resolution, groundLayers) {
    let map2 = []
    let currentFlying = num
    eval(`${currentFlying} ${op}= gridSize / resolution`)
    let yoff = flying;
    for (let y = 0; y < gridSize; y += gridSize / resolution) {
        let row = [];
        let xoff = flying2;
        for (let x = 0; x < gridSize; x += gridSize / resolution) {
            let v = parseInt((perlin.get(xoff, yoff) / 2 + groundLayers) * 255);//default 255     
            row.push(v);
            xoff += gridSize / resolution
        };
        map2.push(row);
        yoff += gridSize / resolution
    };

    for (let i = 0; i < thisMap.length; i++) {
        for (let j = 0; j < thisMap[i].length; j++) {
            map[i][j][1] = thisMap[i][j]
        }
    }

    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            map[i][j][1] += map2[i][j]
        }
    }
    return [flying2, flying]
}







//for (let i = 0; i < chunkSize - 1; i++) {
//    update("flying", "-", map3, 8, 64, 0.5)//nagore
//}


//  for (let i = 0; i < size-1; i++) {
//update("flying", "+", map3, 8, 64, 0.5)//nadolu
//  }


//  for (let i = 0; i < size-1; i++) {
//update("flying2", "-", map3, 8, 64, 0.5)//nalqvo
//  }


// for (let i = 0; i < size - 1; i++) {
//     update("flying2", "+", map3, 8, 64, 0.5)//nadqsno               
// }

function updateHeights(thisMap, map, oldCoord) {
    for (let i = 0; i < thisMap.length; i++) {
        for (let j = 0; j < thisMap[i].length; j++) {
            thisMap[i][j][1] = map[i][j][1] + oldCoord
        }
    }
}

//============================================================================================================











function updateStroke() {
    activateStroke = false;
    window.clearTimeout(isScrolling);
    isScrolling = setTimeout(function () {
        activateStroke = true;
    }, 500);
};

function Map() {
    this.mapData = {}
    this.offset = 0;
}

Map.prototype.createChunk = function (x, y, code, rows, cols, size) {
    this.mapData[code] = mesh(x, y, rows, cols, size)
    return this;
}
Map.prototype.loadChunk = function (code, color) {
    let map = this.mapData[code];
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            if (map[i + 1] && map[j + 1]) {
                ctx.beginPath()
                ctx.moveTo(map[i][j][0], map[i][j][1])
                ctx.lineTo(map[i][j + 1][0], map[i][j + 1][1])
                ctx.lineTo(map[i + 1][j + 1][0], map[i + 1][j + 1][1])
                ctx.lineTo(map[i + 1][j][0], map[i + 1][j][1])
                ctx.lineTo(map[i][j][0], map[i][j][1])
                ctx.lineTo(map[i + 1][j + 1][0], map[i + 1][j + 1][1])
                ctx.fillStyle = color
                ctx.fill()
                if (activateStroke === true) {
                    ctx.stroke()
                }
            }
        }
    }
    return this;
}

let map = new Map();

let currentMiddle = "0 0"

let globalOffset = {
    main: { offset: [0, 0], coords: [0, 0] },
    leftOfMain: { offset: [0, 0], coords: [0, 0] },
    rightOfMain: { offset: [0, 0], coords: [0, 0] },
    botOfMain: { offset: [0, 0], coords: [0, 0] },
    topOfMain: { offset: [0, 0], coords: [0, 0] },
    botLeftOfMain: { offset: [0, 0], coords: [0, 0] },
    topLeftOfMain: { offset: [0, 0], coords: [0, 0] },
    topRightOfMain: { offset: [0, 0], coords: [0, 0] },
    botRightOfMain: { offset: [0, 0], coords: [0, 0] }
};

function neighboursOfCenterChunkCoords(code) {
    let mainChunk = code.split(" ").map(Number)
    return {
        main: [mainChunk[0], mainChunk[1]],
        leftOfMain: [mainChunk[0] - (chunkSize - 1) * size, mainChunk[1] - (chunkSize - 1) * size / 2],
        rightOfMain: [mainChunk[0] + (chunkSize - 1) * size, mainChunk[1] + (chunkSize - 1) * size / 2],
        botOfMain: [mainChunk[0] - (chunkSize - 1) * size, mainChunk[1] + (chunkSize - 1) * size / 2],
        topOfMain: [mainChunk[0] + (chunkSize - 1) * size, mainChunk[1] - (chunkSize - 1) * size / 2],
        botLeftOfMain: [mainChunk[0] - (chunkSize - 1) * size * 2, mainChunk[1]],
        topLeftOfMain: [mainChunk[0], mainChunk[1] - (chunkSize - 1) * size],
        topRightOfMain: [mainChunk[0] + (chunkSize - 1) * size * 2, mainChunk[1]],
        botRightOfMain: [mainChunk[0], mainChunk[1] + (chunkSize - 1) * size]
    }
}

function createSingleStepFromSpin(op, dir) {
    let up
    for (let i = 0; i < chunkSize - 1; i++) {
        //ако искаш да използваш опцията resolution, трябва да намериш начин да не правиш гигантична матрица
        //обаче - след имплементация на LOD, образуването на шума драстично ще се промени
        up = update(op, dir, map3, 3, chunkSize, 0.5)//default 8,64,0.5
    }
    return up
}

function objectContains(chunk) {

    if (!map.mapData.hasOwnProperty(`${chunk[0]} ${chunk[1]}`)) {
        map.createChunk(chunk[0], chunk[1], `${chunk[0]} ${chunk[1]}`, chunkSize, chunkSize, size)
        updateHeights(map.mapData[`${chunk[0]} ${chunk[1]}`], map3, chunk[1])
    }
    // else {
    //     map.loadChunk(`${chunk[0]} ${chunk[1]}`, "green")
    // }
}
globalOffset["main"].offset = createSingleStepFromSpin("flying2", "+");
function createNeighboursChunk(code) {

    let neighbours = neighboursOfCenterChunkCoords(code);

    globalOffset["botLeftOfMain"].coords = neighbours.botLeftOfMain
    globalOffset["botOfMain"].coords = neighbours.botOfMain
    globalOffset["leftOfMain"].coords = neighbours.leftOfMain
    globalOffset["main"].coords = neighbours.main
    globalOffset["rightOfMain"].coords = neighbours.rightOfMain
    globalOffset["topLeftOfMain"].coords = neighbours.topLeftOfMain
    globalOffset["topOfMain"].coords = neighbours.topOfMain
    globalOffset["topRightOfMain"].coords = neighbours.topRightOfMain
    globalOffset["botRightOfMain"].coords = neighbours.botRightOfMain


   // globalOffset["main"].offset = createSingleStepFromSpin("flying2", "+");
    objectContains(globalOffset["main"].coords);

    globalOffset["rightOfMain"].offset = createSingleStepFromSpin("flying2", "+");
    objectContains(globalOffset["rightOfMain"].coords);

    globalOffset["topRightOfMain"].offset = createSingleStepFromSpin("flying", "-");
    objectContains(globalOffset["topRightOfMain"].coords);

    globalOffset["topOfMain"].offset = createSingleStepFromSpin("flying2", "-");
    objectContains(globalOffset["topOfMain"].coords);

    globalOffset["topLeftOfMain"].offset = createSingleStepFromSpin("flying2", "-");
    objectContains(globalOffset["topLeftOfMain"].coords);

    globalOffset["leftOfMain"].offset = createSingleStepFromSpin("flying", "+");
    objectContains(globalOffset["leftOfMain"].coords);

    globalOffset["botLeftOfMain"].offset = createSingleStepFromSpin("flying", "+");
    objectContains(globalOffset["botLeftOfMain"].coords);

    globalOffset["botOfMain"].offset = createSingleStepFromSpin("flying2", "+");
    objectContains(globalOffset["botOfMain"].coords);

    globalOffset["botRightOfMain"].offset = createSingleStepFromSpin("flying2", "+");
    objectContains(globalOffset["botRightOfMain"].coords);


}
createNeighboursChunk(currentMiddle)



canvas.addEventListener("mousewheel", onmousewheel, false);

const view = (() => {
    const matrix = [1, 0, 0, 1, 0, 0];
    var m = matrix;
    var scale = 1;
    var ctx;
    const pos = { x: 0, y: 0 };
    var dirty = true;
    const API = {
        setContext(_ctx) { ctx = _ctx; dirty = true },
        apply() {
            if (dirty) { this.update() }
            ctx.setTransform(...m)
        },
        getScale() { return scale },
        getPosition() { return pos },
        isDirty() { return dirty },
        update() {
            dirty = false;
            m[3] = m[0] = scale;
            m[2] = m[1] = 0;
            m[4] = pos.x;
            m[5] = pos.y;
        },
        scaleAt(at, amount) {
            if (dirty) { this.update() }
            scale *= amount;
            pos.x = at.x - (at.x - pos.x) * amount;
            pos.y = at.y - (at.y - pos.y) * amount;
            dirty = true;
        },
    };
    return API;
})();

view.setContext(ctx);

function onmousewheel(event) {
    var e = window.event || event;
    var x = e.offsetX;
    var y = e.offsetY;
    const delta = e.type === "mousewheel" ? e.wheelDelta : -e.detail;
    if (delta > 0) {
        view.scaleAt({ x, y }, 1.1)
    }
    else {
        view.scaleAt({ x, y }, 1 / 1.1)
    }
    updateStroke();
    e.preventDefault();
}

window.addEventListener("keypress", function (e) {
    let main = currentMiddle.split(" ").map(Number);

    switch (e.code) {
        case "KeyW":
            main[1] -= (chunkSize - 1) * size
            currentMiddle = main.join(" ")
            flying2 = globalOffset["topLeftOfMain"].offset[0]
            flying = globalOffset["topLeftOfMain"].offset[1]
            createNeighboursChunk(currentMiddle)
                ; break;
        case "KeyS":
            main[1] += (chunkSize - 1) * size
            currentMiddle = main.join(" ")
            flying2 = globalOffset["botRightOfMain"].offset[0]
            flying = globalOffset["botRightOfMain"].offset[1]
            createNeighboursChunk(currentMiddle)
                ; break;
        case "KeyA":
            main[0] -= (chunkSize - 1) * size * 2
            currentMiddle = main.join(" ")
            flying2 = globalOffset["botLeftOfMain"].offset[0]
            flying = globalOffset["botLeftOfMain"].offset[1]
            createNeighboursChunk(currentMiddle)
                ; break;
        case "KeyD":
            main[0] += (chunkSize - 1) * size * 2
            currentMiddle = main.join(" ")
            flying2 = globalOffset["topRightOfMain"].offset[0]
            flying = globalOffset["topRightOfMain"].offset[1]
            createNeighboursChunk(currentMiddle)
                ; break;
    }
})


function render() {
    requestAnimationFrame(render);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    view.apply();


    Object.keys(globalOffset).forEach(code => {
        let realCode = globalOffset[code].coords.join(" ");
        if (map.mapData.hasOwnProperty(realCode)) {
            map.loadChunk(realCode, "green")
        }

    })
};

render();