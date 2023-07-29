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
  distanceToPoint(px, py) {
    let dx = this.x - px;
    let dy = this.y - py;
    return Math.sqrt(dx ** 2 + dy ** 2);
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

var rayLighter;
let grad;
var ctx = null;
window.addEventListener("mousedown", (event) => {
  for (let i = 0; i < rayLighter.quads.length; i++) {
    let quad = rayLighter.quads[i];
    if (quad.contains(event.x, event.y, 20) && quad.id == "quad") {
      objectPicker.current = quad;
      objectPicker.id = quad.id;
    }
  }
  const px = event.x - rayLighter.light.x;
  const py = event.y - rayLighter.light.y;
  if (Math.sqrt(px * px + py * py) <= 30) {
    objectPicker.current = rayLighter.light;
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
  const quads = [];
  var canvas = null;
  var light = {};
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;

  for (let i = 0; i < 6; i++) {
    const quad = createQuad(
      ctx.canvas.width * 0.4 - i * 100,
      ctx.canvas.height * Math.random() * 0.7,
      40 + 30 * Math.random(),
      "brown"
    );
    quad.id = "quad";
    quads.push(quad);
    quad.createEdges();
  }
  let world = Object.create(Square);
  world.edges = [];
  world.w = ctx.canvas.width * 0.98;
  world.h = ctx.canvas.height * 0.98;
  world.x = ctx.canvas.width * 0.01;
  world.y = ctx.canvas.height * 0.01;
  world.color = "transparent";
  world.createEdges();
  world.id = "world";
  quads.push(world);
  light.x = ctx.canvas.width * 0.5;
  light.y = ctx.canvas.height * 0.5;
  light.size = 30;
  light.illumination = 500;
  light.color = "yellow";
  rayLighter = new RayLighter(quads, light);
};

function createQuad(x, y, size, color) {
  const quad = Object.create(Square);
  quad.edges = [];
  quad.w = size;
  quad.h = size;
  quad.x = x;
  quad.y = y;
  quad.color = color;
  return quad;
}

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
  ctx.lineWidth = 5;
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

function drawQuads(quads) {
  for (let i = 0; i < quads.length; i++) {
    let quad = quads[i];
    quad.updateEdges();
    ctx.strokeStyle = "red";
    const size = quad.w * 1.0;
    const offset = size * 0.5;
    //drawCircle(quad.color, quad.x + offset, quad.y + offset, size * 0.75);

    //ctx.strokeRect(quad.x, quad.y, quad.w, quad.h);
    //@debug lines
    /* quad.edges.forEach((edge) => {
      drawLine(edge.color, edge.sx, edge.sy, edge.stx, edge.sty);
      edge.color = "green";
    });*/
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
  const rx = dx * cosAngle - dy * sinAngle + cx;
  const ry = dx * sinAngle + dy * cosAngle + cy;
  return { x: rx, y: ry };
}

function quadEdgeCollision(ray, quad) {
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

    if (d > 0.0 && (quad.parent == undefined || !quad.parent.includes(edge))) {
      let nsx = ray.sx + d * (ray.stx - ray.sx);
      let nsy = ray.sy + d * (ray.sty - ray.sy);
      ray.edge = quad;
      ray.stx = nsx;
      ray.sty = nsy;
      /* ctx.strokeStyle = "orange";
      ctx.beginPath();
      ctx.arc(nsx, nsy, 2, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.stroke();*/
      edge.color = "red";
      ray.color = quad.id != "world" ? "red" : "white";
    }
  });
}
function rayToQuadEdgeCollision(rays, quads) {
  rays.forEach((ray) => {
    for (let i = 0; i < quads.length; i++) {
      let quad = quads[i];
      quadEdgeCollision(ray, quad);
    }
  });
}

function LightRaysProjection(quads, light) {
  let rays = [];
  for (let i = 0; i < quads.length; i++) {
    let quad = quads[i];

    let arr = [];
    if (quad.id != "world") {
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
      arr[0].offsetx =
        ((quad.edges[0].stx - quad.edges[0].sx) /
          (quad.edges[0].stx - quad.edges[0].sx + 0.001)) *
        0.1;
      arr[0].offsety =
        ((quad.edges[0].sty - light.y + 0.001) /
          (quad.edges[0].sty - light.y + 0.001)) *
        -0.1;

      arr[1].offsetx =
        ((quad.edges[1].stx - quad.edges[1].sx) /
          (quad.edges[1].stx - quad.edges[1].sx + 0.001)) *
        0.1;
      arr[1].offsety =
        ((quad.edges[1].sty - light.y + 0.001) /
          (quad.edges[1].sty - light.y + 0.001)) *
        0.1;
      arr[2].offsetx =
        ((quad.edges[2].stx - quad.edges[2].sx) /
          (quad.edges[2].stx - quad.edges[2].sx + 0.001)) *
        0.1;
      arr[2].offsety =
        ((quad.edges[2].sty - light.y + 0.001) /
          (quad.edges[2].sty - light.y + 0.001)) *
        0.1;
      arr[3].offsetx =
        ((quad.edges[0].stx - quad.edges[0].sx) /
          (quad.edges[0].stx - quad.edges[0].sx + 0.001)) *
        -0.1;
      arr[3].offsety =
        ((quad.edges[0].sy - light.y + 0.001) /
          (quad.edges[0].sy - light.y + 0.001)) *
        -0.1;
      quad.proj = arr;
    } else {
      arr.push(
        createLine(light.x, light.y, quad.edges[0].stx, quad.edges[0].sty),
        createLine(light.x, light.y, quad.edges[1].stx, quad.edges[1].sty),
        createLine(light.x, light.y, quad.edges[2].stx, quad.edges[2].sty),
        createLine(light.x, light.y, quad.edges[0].sx, quad.edges[0].sy)
      );
      arr[0].offsetx = 0;
      arr[0].offsety = 0;
      arr[1].offsetx = 0;
      arr[1].offsety = 0;
      arr[2].offsetx = 0;
      arr[2].offsety = 0;
      arr[3].offsetx = 0;
      arr[3].offsety = 0;
      quad.proj = arr;
    }

    rays.push(...arr);
  }
  return rays;
}

function pointLight(quads, light) {
  let rays = LightRaysProjection(quads, light);
  // first round of collision detection
  rayToQuadEdgeCollision(rays, quads);
  //project the lines to the end of the world this helps us to cast shadows
  rays.forEach((ray) => {
    // remember the original values this will help us later in drawing the triangles
    ray.ox = ray.stx;
    ray.oy = ray.sty;
    ray.color = "white";
    ray.scale(50);
  });
  // second round of collision detection
  rayToQuadEdgeCollision(rays, quads);
  /*rays.forEach((ray) => {
    drawLine(ray.color, ray.sx, ray.sy, ray.stx, ray.sty);
  });*/
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
  grad = ctx.createRadialGradient(
    light.x,
    light.y,
    0,
    light.x,
    light.y,
    light.illumination
  );
  grad.addColorStop(0, "#ffeb37af");
  grad.addColorStop(1, "black");

  /*rays.forEach((ray) => {
    drawLine(grad, ray.sx, ray.sy, ray.stx, ray.sty);
  });*/
  ctx.fillStyle = grad;

  for (let i = 0; i < rays.length - 1; i++) {
    let a = rays[i];
    let b = rays[i + 1];

    let color = "#58c0dfee";
    // ctx.strokeStyle = grad;

    if (a.edge == b.edge) {
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.lineTo(b.stx + b.offsetx, b.sty + b.offsety);
      ctx.lineTo(a.stx + a.offsetx, a.sty + a.offsety);
      ctx.closePath();
      ctx.fill();
    } else if (a.color == b.color) {
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.lineTo(b.ox + b.offsetx, b.oy + b.offsety);
      ctx.lineTo(a.ox + a.offsetx, a.oy + a.offsetx);
      ctx.closePath();
      ctx.fill();
    } else if (b.color == "red") {
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.lineTo(b.stx + b.offsetx, b.sty + b.offsety);
      ctx.lineTo(a.ox + a.offsetx, a.oy + a.offsetx);
      ctx.closePath();
      ctx.fill();
    } else if (a.color == "red") {
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.lineTo(b.ox + b.offsetx, b.oy + b.offsety);
      ctx.lineTo(a.stx + a.offsetx, a.sty + a.offsety);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function shadowCaster(quads, light) {
  // sort the quads based on it's distance from the light source
  quads.sort((a, b) => {
    let d1 = a.distanceToPoint(light.x, light.y);
    let d2 = b.distanceToPoint(light.x, light.y);
    return d1 < d2 ? 1 : -1;
  });

  // cast a ray from the light source to the edge
  let rays = LightRaysProjection(quads, light);

  // project the rays to the end of the world
  rays.forEach((ray) => {
    // shadows are drawn from the starting edge
    ray.ox = ray.stx;
    ray.oy = ray.sty;
    ray.color = ray.color;
    ray.scale(50);
  });

  // to cast shadows we need only to test ray collisions by the currect quad
  quads.forEach((quad) => {
    let proj = quad.proj;
    proj.forEach((ray) => {
      quadEdgeCollision(ray, quad);
    });
  });

  // project a shadow from the visible points
  quads.forEach((quad) => {
    let proj = quad.proj;
    //filter out collided rays
    proj = proj.filter((p) => p.color != "red");
    if (quad.id == "quad")
      for (let i = 0; i < proj.length - 1; i++) {
        let a = proj[i];
        let b = proj[i + 1];
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.moveTo(a.stx, a.sty);
        ctx.lineTo(b.stx, b.sty);
        ctx.lineTo(a.ox, a.oy);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(b.stx, b.sty);
        ctx.lineTo(a.ox, a.oy);
        ctx.lineTo(b.ox, b.oy);
        ctx.closePath();
        ctx.fill();
      }
    if (quad.id == "quad")
      drawQuad(
        `rgba(${
          255 *
          Math.max(
            0,
            light.illumination / quad.distanceToPoint(light.x, light.y) / 5
          )
        },0,0,1)`,
        quad.x,
        quad.y,
        quad.w,
        quad.h
      );
    else drawQuad(quad.color, quad.x, quad.y, quad.w, quad.h);
  });
  /*quads.forEach((quad) => {
    quad.proj.forEach((ray) => {
      drawLine(ray.color, ray.ox, ray.oy, ray.stx, ray.sty);
    });
  });*/
}

class RayLighter {
  constructor(quads, light) {
    this.quads = quads;
    this.light = light;
  }
  update() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalCompositeOperation = "lighter";
    pointLight(this.quads, this.light);
    ctx.globalCompositeOperation = "source-over";
    drawQuads(this.quads);
    shadowCaster(this.quads, this.light);
    drawCircle(this.light.color, this.light.x, this.light.y, 20);
    // update revolution around the light
    for (let i = 0; i < this.quads.length; i++) {
      const quad = this.quads[i];
      if (quad.id == "world") continue;
      const max =
        ((1000 -
          Math.sqrt(
            (this.light.x + quad.x) ** 2 + (this.light.y + quad.y) ** 2
          )) /
          1000) *
        0.02;
      const point = rotatePoint(
        quad.x,
        quad.y,
        this.light.x + this.light.size * 0.5,
        this.light.y + this.light.size * 0.5,
        max
      );
      quad.x = point.x;
      quad.y = point.y;
      quad.updateEdges();
    }
  }
}

function update() {
  if (rayLighter != null) {
    rayLighter.update();
  }
  requestAnimationFrame(update);
}

update();
