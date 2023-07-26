var canvas = null;
var ctx = null;

var Circle = {
  center: undefined,
  radius: 0,
  angle: 0,
  rays: [],
  contains(x, y, size) {
    let px = this.center.x - x;
    let py = this.center.y - y;
    let len = Math.sqrt(px * px + py * py);
    return len < this.radius + size;
  },
  containsPoint(point) {
    return this.contains(point.x, point.y, point.size);
  },
  pointAngle(px, py) {
    return Math.atan2(this.center.y - py, this.center.x - px);
  },
};

var Point = {
  x: 0,
  y: 0,
  size: 0,
  contains(x, y, size) {
    let px = this.x - x;
    let py = this.y - y;
    let len = Math.sqrt(px * px, py * py);
    return len < this.size + size;
  },
};

var Line = {
  a: null,
  b: null,
  parent: null,
  color: "white",
  ox: 0,
  oy: 0,
  length() {
    let x = this.a.x - this.b.x;
    let y = this.a.y - this.b.y;
    return Math.sqrt(x * x, y * y);
  },

  angle() {
    return Math.atan2(this.b.y - this.a.y, this.b.x - this.a.x);
  },
};

var objectPicker = {
  current: undefined,
  id: "",
};
var circles = [];
var points = [];

window.onload = () => {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  let point = Object.create(Point);
  point.x = 200;
  point.y = 200;
  point.size = 10;
  points.push(point);

  for (let i = 0; i < 10; i++) {
    let circle = Object.create(Circle);
    circle.center = Object.create(Point);
    circle.center.x = Math.random() * ctx.canvas.width * 0.8;
    circle.center.y = Math.random() * ctx.canvas.height * 0.8;
    circle.radius = 10 + Math.random() * 50;
    circle.rays = [];
    circles.push(circle);
  }
};

window.addEventListener("mousedown", (event) => {
  circles.forEach((circle) => {
    if (circle.contains(event.x, event.y, 20)) {
      objectPicker.current = circle;
      objectPicker.id = "circle";
    }
  });
  points.forEach((point) => {
    if (point.contains(event.x, event.y, point.size)) {
      objectPicker.current = point;
      objectPicker.id = "point";
    }
  });
});
window.addEventListener("mousemove", (event) => {
  if (objectPicker.current != undefined) {
    if (objectPicker.id == "circle") {
      let center = objectPicker.current.center;
      center.x = event.x;
      center.y = event.y;
    }
  }

  if (objectPicker.current != undefined) {
    if (objectPicker.id == "point") {
      let point = objectPicker.current;
      point.x = event.x;
      point.y = event.y;
    }
  }
});

window.addEventListener("mouseup", (event) => {
  objectPicker.current = undefined;
});

function dot(px, py, x1, y1, x2, y2) {
  let lx = x1 - x2;
  let ly = y1 - y2;
  let len = Math.sqrt(lx * lx + ly * ly);
  return ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / Math.pow(len, 2);
}

function length(x1, x2, y1, y2) {
  let x = x2 - x1;
  let y = y2 - y1;
  return Math.sqrt(x * x + y * y);
}
function angle(x1, y1, x2, y2) {
  return Math.atan2(x2 - x1, y2 - y1);
}

function createLine(x1, y1, x2, y2) {
  const line = Object.create(Line);
  let a = Object.create(Point);
  let b = Object.create(Point);
  a.x = x1;
  a.y = y1;
  b.x = x2;
  b.y = y2;
  line.a = a;
  line.b = b;
  return line;
}
function circleLineCollision(cx, cy, r, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;

  // Calculate the distance between the line segment's endpoints (x1, y1) and (x2, y2)
  const lineLength = Math.sqrt(dx ** 2 + dy ** 2);

  // Calculate the unit vector representing the line segment
  //get the normal to the vector
  const ux = dx / lineLength;
  const uy = dy / lineLength;

  // Calculate the vector from the line segment's first endpoint to the circle center
  const vx = cx - x1;
  const vy = cy - y1;

  // Calculate the projection of vector (vx, vy) onto the line segment's unit vector (ux, uy)
  const dotProduct = vx * ux + vy * uy;
  const projectedLength = dotProduct;

  // Check if the circle's center lies outside the line segment
  let closest_x, closest_y;
  if (projectedLength < 0) {
    // if it's less than the line from the start line position
    closest_x = x1;
    closest_y = y1;
  } else if (projectedLength > lineLength) {
    //if it's greater than the line edge
    closest_x = x2;
    closest_y = y2;
  } else {
    // if it is within the line line edge
    closest_x = x1 + ux * projectedLength;
    closest_y = y1 + uy * projectedLength;
  }

  // Calculate the distance between the circle center and the closest point on the line segment
  const distanceToClosestPoint = Math.sqrt(
    (cx - closest_x) ** 2 + (cy - closest_y) ** 2
  );

  // Check for collision by comparing the distance to the circle's radius
  if (distanceToClosestPoint < r - 1) {
    // Calculate the collision point (x, y) on the line
    const collision_x =
      closest_x +
      (r / distanceToClosestPoint) * (cx - (cx - closest_x) - closest_x);

    const collision_y =
      closest_y +
      (r / distanceToClosestPoint) * (cy - (cy - closest_y) - closest_y);
    return { x: collision_x, y: collision_y };
  } else {
    return null;
  }
}

function projectRays(lightSource) {
  circles.forEach((circle) => {
    let center = circle.center;
    let radius = circle.radius;
    let rays = circle.rays;
    // clear previous projection
    rays.splice(0, rays.length);
    // project the rays from the light source to the ends of the circle
    let angle = Math.atan2(center.y - lightSource.y, center.x - lightSource.x);

    // rays.push(center.x);
    // rays.push(center.y);
    rays.push(
      createLine(
        lightSource.x,
        lightSource.y,
        center.x + radius * Math.cos((90 / 180) * Math.PI - angle),
        center.y - radius * Math.sin((90 / 180) * Math.PI - angle)
      )
    );
    rays.push(
      createLine(
        lightSource.x,
        lightSource.y,
        center.x - radius * Math.cos((90 / 180) * Math.PI - angle),
        center.y + radius * Math.sin((90 / 180) * Math.PI - angle)
      )
    );
    rays[0].parent = circle;
    rays[1].parent = circle;
    rays[0].ox = rays[0].b.x;
    rays[0].oy = rays[0].b.y;
    rays[1].ox = rays[1].b.x;
    rays[1].oy = rays[1].b.y;
    //scale them since each ray must project to the end of the world
    /*   rays[0].b.x = rays[0].a.x + (rays[0].b.x - rays[0].a.x) * 50;
    rays[0].b.y = rays[0].a.y + (rays[0].b.y - rays[0].a.y) * 50;
    rays[1].b.x = rays[1].a.x + (rays[1].b.x - rays[1].a.x) * 50;
    rays[1].b.y = rays[1].a.y + (rays[1].b.y - rays[1].a.y) * 50;*/
  });
}

function raysToCircleEdgeCollision(lightSource) {
  let rays = [];

  circles.forEach((circle) => {
    rays.push(...circle.rays);
  });
  rays.push(createLine(lightSource.x, lightSource.y, 0, 0));
  rays.push(createLine(lightSource.x, lightSource.y, ctx.canvas.width, 0));
  rays.push(createLine(lightSource.x, lightSource.y, 0, ctx.canvas.height));
  rays.push(
    createLine(
      lightSource.x,
      lightSource.y,
      ctx.canvas.width,
      ctx.canvas.height
    )
  );
  // sort the rays
  rays.sort((a, b) => {
    return a.angle() <= b.angle() ? 1 : -1;
  });

  testRayCollision(lightSource, rays);

  let pRay = [];
  //rays.push()
  for (let i = 0; i < rays.length - 1; i++) {
    let ray = rays[i];
    let stats = undefined;
    let sx = 50000;
    let sy = 50000;
    let pjx = Number.NEGATIVE_INFINITY;
    let pjy = Number.NEGATIVE_INFINITY;

    for (let cb of circles) {
      //ignore self
      if (cb == ray.parent) continue;
      //ignore collided lines
      if (ray.color == "red") continue;
      let pjx = ray.a.x + (ray.b.x - ray.a.x) * 50;
      let pjy = ray.a.y + (ray.b.y - ray.a.y) * 50;
      let collisionPoint = circleLineCollision(
        cb.center.x,
        cb.center.y,
        cb.radius,
        // pass the ray coords
        ray.a.x,
        ray.a.y,
        //scale them since each ray must project to the end of the world
        pjx,
        pjy
      );
      if (!collisionPoint) continue;
      let closestX = collisionPoint.x;
      let closestY = collisionPoint.y;
      let slen = length(ray.a.x, sx, ray.a.y, sy);
      let clen = length(ray.a.x, closestX, ray.a.y, closestY);
      if (slen > clen) {
        sx = closestX;
        sy = closestY;
        stats = collisionPoint;
        stats.circle = ray.parent;
      }
    }

    if (stats) {
      let closestX = stats.x;
      let closestY = stats.y;

      ray.color = "red";
      // create a new ray with this projection and add it to the rays list
      /* ctx.strokeStyle = `${"green"}`;
      ctx.beginPath();
      ctx.moveTo(ray.a.x, ray.a.y);
      ctx.lineTo(closestX, closestY);
      ctx.closePath();
      ctx.stroke();*/
      let nline = createLine(ray.a.x, ray.a.y, closestX, closestY);
      nline.color = "green";
      if (
        nline.angle() <= stats.circle.pointAngle(lightSource.x, lightSource.y)
      ) {
        pRay.push(ray);
        pRay.push(nline);
        //drawTriangle("green", nline, rays[i + 1]);
      } else {
        drawTriangle("green", nline, rays[i - 1]);
        pRay.push(nline);
        pRay.push(ray);
      }
    } else {
      drawTriangle("green", ray, rays[i + 1]);
      pRay.push(ray);
    }
  }
  return pRay;
}

function testRayCollision(lightSource, rays) {
  for (let cb of circles) {
    for (let i = 0; i < rays.length - 1; i++) {
      let ray = rays[i];
      //ignore self
      if (cb == ray.parent && ray.parent != null) continue;
      let stats = circleLineCollision(
        cb.center.x,
        cb.center.y,
        cb.radius,
        // pass the ray coords
        ray.a.x,
        ray.a.y,
        //scale them since each ray must project to the end of the world
        ray.b.x,
        ray.b.y
      );

      if (stats) {
        let closestX = stats.x;
        let closestY = stats.y;
        const pdy = cb.center.y - lightSource.y;
        const pdx = cb.center.x - lightSource.x;

        if (ray.parent != null) {
          let parentCircleRay = ray.parent;
          const vdy = parentCircleRay.center.y - lightSource.y;
          const vdx = parentCircleRay.center.x - lightSource.x;
          const len1 = Math.sqrt(pdx ** 2 + pdy ** 2);

          const len2 = Math.sqrt(vdx ** 2 + vdy ** 2);

          ray.color = len1 < len2 ? "red" : "white";
        }
        ray.color = "red";
        /* ctx.strokeStyle = `red`;
          ctx.beginPath();
          ctx.moveTo(rays[0], rays[1]);
          ctx.lineTo(closestX, closestY);
          ctx.arc(closestX, closestY, 5, 0, 2 * Math.PI);*/

        // ctx.closePath();
        //   ctx.stroke();

        /* ctx.strokeStyle = `blue`;
          ctx.beginPath();
          //   ctx.arc(rays[i], rays[i + 1], 5, 0, 2 * Math.PI);
          ctx.arc(cb.rays[i], cb.rays[i + 1], 5, 0, 2 * Math.PI);
          ctx.closePath();
          ctx.stroke();*/

        ray.b.x = closestX;
        ray.b.y = closestY;
      }
    }
  }
}

function drawTriangle(color, ray1, ray2) {
  ctx.strokeStyle = `${color}`;
  ctx.beginPath();
  ctx.moveTo(ray1.a.x, ray1.a.y);
  ctx.lineTo(ray2.b.x, ray2.b.y);
  ctx.lineTo(ray1.b.x, ray1.b.y);
  ctx.closePath();
  ctx.stroke();
}
function drawLine(color, ray1) {
  ctx.strokeStyle = `${color}`;
  ctx.beginPath();
  ctx.moveTo(ray1.a.x, ray1.a.y);
  ctx.lineTo(ray1.b.x, ray1.b.y);
  ctx.closePath();
  ctx.stroke();
}
function update() {
  if (ctx != null) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let point = points[0];
    projectRays(point);
    let rays = raysToCircleEdgeCollision(point);

    rays.push(rays[0]);
    /* for (let i = 0; i < rays.length - 1; i++) {
      let ray = rays[i];
      ctx.strokeStyle = `${ray.color}`;
      ctx.fillStyle = `${"red"}`;
      ctx.beginPath();
      ctx.moveTo(ray.a.x, ray.a.y);
      ctx.lineTo(ray.b.x, ray.b.y);
      ctx.strokeText(
        `${i} ^ ${(ray.angle() + "").substring(0, 4)}`,
        ray.b.x,
        ray.b.y
      );
      ctx.closePath();
      ctx.stroke();
    }*/
    /*  for (let i = 1; i < rays.length; i += 1) {
      let raya = rays[i - 1];
      let rayb = rays[i];

      ctx.strokeStyle = `${raya.color}`;
      ctx.fillStyle = `${"red"}`;

      ctx.beginPath();
      ctx.moveTo(raya.a.x, raya.a.y);
      ctx.lineTo(rayb.b.x, rayb.b.y);
      ctx.lineTo(raya.b.x, raya.b.y);
      ctx.closePath();
      ctx.stroke();
    }*/
    // join the last to the first
    /* let raya = rays[rays.length - 1];
    let rayb = rays[0];
    ctx.strokeStyle = `${rayb.color}`;
    ctx.fillStyle = `${"red"}`;
    // if (raya.color == "white") {
    ctx.beginPath();
    ctx.moveTo(raya.a.x, raya.a.y);
    ctx.lineTo(rayb.b.x, rayb.b.y);
    ctx.lineTo(raya.b.x, raya.b.y);
    ctx.strokeText(`${0}`, raya.b.x, raya.b.y);
    ctx.closePath();
    ctx.stroke();*/
    //  }*/

    circles.forEach((circle) => {
      ctx.strokeStyle = `white`;
      ctx.beginPath();
      ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.stroke();
    });

    ctx.strokeStyle = `white`;
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.size, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = `white`;
  }

  requestAnimationFrame(update);
}

update();
