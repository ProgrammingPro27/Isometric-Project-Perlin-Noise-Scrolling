let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

let size = 50;
let chunkSize = 64;
let activateStroke = true;
let isScrolling = true;

function updateStroke() {
    activateStroke = false;
    window.clearTimeout(isScrolling);
    isScrolling = setTimeout(function () {
        activateStroke = true;
    }, 500);
};

function mesh(x, y, mapX, mapY) {
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

let map = mesh(width/2, height-chunkSize*size/2, 50, 50);

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

let thisMap = baseCoords(map)

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
            let v = parseInt((perlin.get(xoff, yoff) + groundLayers) * 355);//default 255     
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
}

function renderMap(map) {
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
                ctx.fillStyle = "green"
                ctx.fill()
                if (activateStroke === true) {
                    ctx.stroke()
                }
            }
            //   0,0,0 - 0,0,1 || 0,1,0 - 0,1,1 || 1,1,0 - 1,1,1 || 1,0,0 - 1,0,1 || 0,0,0 - 0,0,1 || 1,1,0 - 1,1,1
        }
    }

}

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

update("flying", "-", map, 12, chunkSize, 0.8)//just to visualise


let chunkData = []


window.addEventListener("keypress", function (e) {
    switch (e.code) {
        case "KeyW":
            update("flying", "-", map, 12, chunkSize, 0.8)//up
                ; break;
        case "KeyS":
            update("flying", "+", map, 12, chunkSize, 0.8)//down
                ; break;
        case "KeyA":
            update("flying2", "-", map, 12, chunkSize, 0.8)//left
                ; break;
        case "KeyD":
            update("flying2", "+", map, 12, chunkSize, 0.8)//right                              
                ; break;
    }
})

function render() {
    //  update(map, 8, 64, 0.5)
    requestAnimationFrame(render);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    view.apply();
    if (chunkData.length !== 0) {
        for (let i = 0; i < chunkData.length; i++) {
            renderMap(chunkData[i])
        }
    }
    renderMap(map)
};

render();
