var Line = {
  sx: 0,
  sy: 0,
  stx: 0,
  sty: 0,
  parent: null,
  color: "green",
  ox: 0,
  oy: 0,
  length() {
    let x = this.a.x - this.b.x;
    let y = this.a.y - this.b.y;
    return Math.sqrt(x * x, y * y);
  },

  angle() {
    return Math.atan2(this.sty - this.sy, this.stx - this.sx);
  },
  set(sx, sy, stx, sty) {
    this.sx = sx;
    this.sy = sy;
    this.stx = stx;
    this.sty = sty;
  },

  scale(factor) {
    this.sty = this.sy + (this.sty - this.sy) * factor;
    this.stx = this.sx + (this.stx - this.sx) * factor;
  },
  length() {
    let dx = this.stx - this.sx;
    let dy = this.sty - this.sy;
    return Math.sqrt(dx ** 2 + dy ** 2);
  },
};

var Square = {
  w: 0,
  h: 0,
  x: 0,
  y: 0,
  edges: [],
  createEdges() {
    //top face
    this.edges.push(createLine(this.x, this.y, this.x + this.w, this.y));
    //left face
    this.edges.push(createLine(this.x, this.y, this.x, this.y + this.h));
    //bottom face
    this.edges.push(
      createLine(this.x, this.y + this.h, this.x + this.w, this.y + this.h)
    );
    //right face
    this.edges.push(
      createLine(this.x + this.w, this.y, this.x + this.w, this.y + this.h)
    );
  },
  contains(x, y, size) {
    let px = this.x - x;
    let py = this.y - y;
    let len = Math.sqrt(px * px + py * py);
    return len < this.w + size;
  },
  updateEdges() {
    //top face
    this.edges[0].set(this.x, this.y, this.x + this.w, this.y);
    //left face
    this.edges[1].set(this.x, this.y, this.x, this.y + this.h);
    //bottom face
    this.edges[2].set(
      this.x,
      this.y + this.h,
      this.x + this.w,
      this.y + this.h
    );

    //right face
    this.edges[3].set(
      this.x + this.w,
      this.y,
      this.x + this.w,
      this.y + this.h
    );
  },
};

var objectPicker = {
  current: undefined,
  id: "",
};
const quads = [];
var canvas = null;
var ctx = null;
var light = {};
let grad;
window.addEventListener("mousedown", (event) => {
  for (let i = 0; i < quads.length - 1; i++) {
    let quad = quads[i];
    if (quad.contains(event.x, event.y, 20)) {
      objectPicker.current = quad;
      objectPicker.id = "quad";
    }
  }
  const px = event.x - light.x;
  const py = event.y - light.y;
  if (Math.sqrt(px * px + py * py) <= 30) {
    objectPicker.current = light;
    objectPicker.id = "light";
  }
});
window.addEventListener("mousemove", (event) => {
  if (objectPicker.current != undefined) {
    if (objectPicker.id == "quad") {
      objectPicker.current.x = event.x;
      objectPicker.current.y = event.y;
    } else if (objectPicker.id == "light") {
      objectPicker.current.x = event.x;
      objectPicker.current.y = event.y;
    }
  }
});

window.addEventListener("mouseup", (event) => {
  objectPicker.current = undefined;
});

window.onload = () => {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;

  for (let i = 0; i < 3; i++) {
    const quad = Object.create(Square);
    quad.edges = [];
    const size = 50 + 30 * Math.random();
    quad.w = size;
    quad.h = size;
    quad.x = ctx.canvas.width * Math.random() * 0.7;
    quad.y = ctx.canvas.height * Math.random() * 0.7;
    quad.color = "brown";
    quads.push(quad);
    quad.createEdges();
  }
  let world = Object.create(Square);
  world.edges = [];
  world.w = ctx.canvas.width * 0.95;
  world.h = ctx.canvas.height * 0.9;
  world.x = ctx.canvas.width * 0.05;
  world.y = ctx.canvas.height * 0.05;
  world.color = "transparent";
  world.createEdges();
  quads.push(world);
  light.x = ctx.canvas.width * 0.5;
  light.y = ctx.canvas.height * 0.5;
  light.color = "yellow";
};

//if au>0 they intersect
function detect_line_collision(fx1, fy1, fx2, fy2, sx3, sy3, sx4, sy4) {
  let ua = 0.0;
  let ub = 0.0;

  let ud = (sy4 - sy3) * (fx2 - fx1) - (sx4 - sx3) * (fy2 - fy1);

  if (ud != 0) {
    ua = ((sx4 - sx3) * (fy1 - sy3) - (sy4 - sy3) * (fx1 - sx3)) / ud;
    ub = ((fx2 - fx1) * (fy1 - sy3) - (fy2 - fy1) * (fx1 - sx3)) / ud;
    if (ua < 0.0 || ua > 1.0 || ub < 0.0 || ub > 1.0) ua = 0.0;
  }

  return ua;
}

function createLine(sx, sy, stx, sty) {
  var line = Object.create(Line);
  line.set(sx, sy, stx, sty);
  return line;
}

function drawLine(color, sx, sy, stx, sty) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(stx, sty);
  ctx.closePath();
  ctx.stroke();
}

function drawQuad(color, x, y, w, h) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(color, x, y, radius) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
}

function drawQuads() {
  for (let i = 0; i < quads.length; i++) {
    let quad = quads[i];
    quad.updateEdges();
    ctx.strokeStyle = "red";
    const size = quad.w * 1.0;
    const offset = size * 0.5;
    drawCircle(quad.color, quad.x + offset, quad.y + offset, size * 0.75);
    ctx.strokeRect(quad.x, quad.y, quad.w, quad.h);
    quad.edges.forEach((edge) => {
      drawLine(edge.color, edge.sx, edge.sy, edge.stx, edge.sty);
      edge.color = "green";
    });
  }
}

function drawText(x, y, text, color) {
  ctx.strokeStyle = `${color}`;
  ctx.beginPath();
  ctx.strokeText(text, x, y);
  ctx.closePath();
  ctx.stroke();
}

function rotatePoint(x, y, cx, cy, angle) {
  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);
  const dx = x - cx;
  const dy = y - cy;
  const rotatedX = dx * cosAngle - dy * sinAngle + cx;
  const rotatedY = dx * sinAngle + dy * cosAngle + cy;
  return { x: rotatedX, y: rotatedY };
}

function rayToQuadEdgeCollision(rays) {
  rays.forEach((ray) => {
    for (let i = 0; i < quads.length; i++) {
      let quad = quads[i];
      let world = quads[quads.length - 1];
      quad.edges.forEach((edge) => {
        let d = detect_line_collision(
          ray.sx,
          ray.sy,
          ray.stx,
          ray.sty,
          edge.sx,
          edge.sy,
          edge.stx,
          edge.sty
        );

        if (
          d > 0.0 &&
          (quad.parent == undefined || !quad.parent.includes(edge))
        ) {
          let nsx = ray.sx + d * (ray.stx - ray.sx);
          let nsy = ray.sy + d * (ray.sty - ray.sy);
          ray.edge = quad;
          ray.stx = nsx;
          ray.sty = nsy;
          ctx.strokeStyle = "orange";
          ctx.beginPath();
          ctx.arc(nsx, nsy, 2, 0, 2 * Math.PI);
          ctx.closePath();
          ctx.stroke();
          edge.color = "red";
          ray.color = quad != world ? "red" : "white";
        }
      });
    }
  });
}

function pointLight() {
  let rays = [];
  for (let i = 0; i < quads.length; i++) {
    let quad = quads[i];
    let world = quads[quads.length - 1];
    let arr = [];
    if (quad != world) {
      arr.push(
        createLine(
          light.x,
          light.y,
          quad.edges[0].stx +
            ((quad.edges[0].stx - quad.edges[0].sx) /
              (quad.edges[0].stx - quad.edges[0].sx + 0.001)) *
              0.1,
          quad.edges[0].sty -
            ((quad.edges[0].sty - light.y + 0.001) /
              (quad.edges[0].sty - light.y + 0.001)) *
              0.1
        ),
        createLine(
          light.x,
          light.y,
          quad.edges[1].stx +
            ((quad.edges[1].stx - quad.edges[1].sx) /
              (quad.edges[1].stx - quad.edges[1].sx + 0.001)) *
              0.1,
          quad.edges[1].sty +
            ((quad.edges[1].sty - light.y + 0.001) /
              (quad.edges[1].sty - light.y + 0.001)) *
              0.1
        ),
        createLine(
          light.x,
          light.y,
          quad.edges[2].stx +
            ((quad.edges[2].stx - quad.edges[2].sx) /
              (quad.edges[2].stx - quad.edges[2].sx + 0.001)) *
              0.1,
          quad.edges[2].sty +
            ((quad.edges[2].sty - light.y + 0.001) /
              (quad.edges[2].sty - light.y + 0.001)) *
              0.1
        ),
        createLine(
          light.x,
          light.y,
          quad.edges[0].sx -
            ((quad.edges[0].stx - quad.edges[0].sx) /
              (quad.edges[0].stx - quad.edges[0].sx + 0.001)) *
              0.1,
          quad.edges[0].sy -
            ((quad.edges[0].sy - light.y + 0.001) /
              (quad.edges[0].sy - light.y + 0.001)) *
              0.1
        )
      );
    } else {
      arr.push(
        createLine(light.x, light.y, quad.edges[0].stx, quad.edges[0].sty),
        createLine(light.x, light.y, quad.edges[1].stx, quad.edges[1].sty),
        createLine(light.x, light.y, quad.edges[2].stx, quad.edges[2].sty),
        createLine(light.x, light.y, quad.edges[0].sx, quad.edges[0].sy)
      );
    }

    rays.push(...arr);
  }

  // first round of collision detection
  rayToQuadEdgeCollision(rays);
  //project the lines to the end of the world this helps us to cast shadows
  rays.forEach((ray) => {
    // remember the original values this will help us later in drawing the triangles
    ray.ox = ray.stx;
    ray.oy = ray.sty;
    ray.color = "white";
    ray.scale(50);
  });
  // second round of collision detection
  rayToQuadEdgeCollision(rays);
  rays.forEach((ray) => {
    drawLine(ray.color, ray.sx, ray.sy, ray.stx, ray.sty);
  });
  // sort the rays
  rays.sort((a, b) => {
    return a.angle() <= b.angle() ? 1 : -1;
  });

  /* for (let i = 0; i < rays.length; i++) {
    let ray = rays[i];
    drawText(ray.stx, ray.sty, i, "cyan");
    drawText(ray.ox, ray.oy - 20, i, "brown");
  }*/

  rays.push(rays[0]);
  let world = quads[quads.length - 1];
  grad = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, 700);
  grad.addColorStop(0, "#58c0dfaf");
  grad.addColorStop(1, "transparent");

  /*rays.forEach((ray) => {
    drawLine(grad, ray.sx, ray.sy, ray.stx, ray.sty);
  });*/

  for (let i = 0; i < rays.length - 1; i++) {
    let a = rays[i];
    let b = rays[i + 1];

    let color = "#58c0dfaf";
    ctx.strokeStyle = `${color}`;

    ctx.fillStyle = grad;
    if (a.edge == b.edge) {
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.lineTo(b.stx, b.sty);
      ctx.lineTo(a.stx, a.sty);
      ctx.closePath();
      ctx.fill();
    } else if (a.color == b.color) {
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.lineTo(b.ox, b.oy);
      ctx.lineTo(a.ox, a.oy);
      ctx.closePath();
      ctx.fill();
    } else if (b.color == "red") {
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.lineTo(b.stx, b.sty);
      ctx.lineTo(a.ox, a.oy);
      ctx.closePath();
      ctx.fill();
    } else if (a.color == "red") {
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.lineTo(b.ox, b.oy);
      ctx.lineTo(a.stx, a.sty);
      ctx.closePath();
      ctx.fill();
    }
  }
  /* let shadowGrad = ctx.createRadialGradient(
    light.x,
    light.y,
    0,
    light.x,
    light.y,
    700
  );
  shadowGrad.addColorStop(0, "#000000");
  shadowGrad.addColorStop(1, "#000000");
  let shadowRays = [];

  rays.forEach((ray) => {
    let ox = ray.ox;
    let oy = ray.oy;
    ray.scale(50);
    const line = createLine(ox, oy, ray.stx, ray.sty);
    line.color = ray.color;
    shadowRays.push(line);
  });

  /*shadowRays.forEach((ray) => {
    drawLine("blue", ray.sx, ray.sy, ray.stx, ray.sty);
  });*/
  /*s  shadowRays.push(shadowRays[0]);
  for (let i = 0; i < shadowRays.length - 1; i++) {
    let a = shadowRays[i];
    let b = shadowRays[i + 1];
    if (b.color == "white" && a.color == "white") continue;
    if (b.color == "red" && a.color == "red") continue;
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.moveTo(a.stx, a.sty);
    ctx.lineTo(b.stx, b.sty);
    ctx.lineTo(a.sx, a.sy);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(b.stx, b.sty);
    ctx.lineTo(a.sx, a.sy);
    ctx.lineTo(b.sx, b.sy);
    ctx.closePath();
    ctx.fill();
  }*/
}
function update() {
  if (ctx != null) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pointLight();
    drawQuads();
    drawCircle(light.color, light.x, light.y, 20);
    for (let i = 0; i < quads.length - 1; i++) {
      const quad = quads[i];
      const max =
        ((1000 - Math.sqrt((light.x + quad.x) ** 2 + (light.y + quad.y) ** 2)) /
          1000) *
        0.02;
      const point = rotatePoint(quad.x, quad.y, light.x, light.y, max);
      quad.x = point.x;
      quad.y = point.y;
      quad.updateEdges();
    }
  }
  requestAnimationFrame(update);
}

update();
