// const events = document.querySelectorAll(`[on:]`);

const attributes = ["q", "func", "x", "y", "ax", "ay", "vx", "vy"]
const all = attributes.reduce((acc, cur) => [
  ...acc,
  ...document.querySelectorAll(`[${cur}]`)
], []);
setup(all);
const mags = document.querySelectorAll(`[q]`);

function setup(all) {
  let count = 0;
  for (const el of all) {
    if (el.uid !== undefined) continue;
    const styles = window.getComputedStyle(el);
    let trans = styles.getPropertyValue('transform');
    if (trans === "none") trans = "matrix(1, 0, 0, 1, 0, 0)"
    const numbers = trans
      .slice(7, -1)
      .split(",")
      .map(Number);

    if (el.hasAttribute("q")) el.q = Number(el.getAttribute("q"));
    else el.q = 0;
    // else if (el.matches("[mover]")) el.q = -1;

    if (el.hasAttribute("func")) el.func = new Function(
      "el", 
      "w", 
      "h", 
      "mouseX", 
      "mouseY", 
      "step", 
      "heldKeys", 
      "pressedKeys",
      "collided", 
      "endgame",
      el.getAttribute("func")
    );
   
    
    if (el.hasAttribute("x")) numbers[4] = Number(el.getAttribute("x"));
    if (el.hasAttribute("y")) numbers[5] = Number(el.getAttribute("y"));

    el.ax = el.hasAttribute("ax") ? Number(el.getAttribute("ax")) : 0;
    el.ay = el.hasAttribute("ay") ? Number(el.getAttribute("ay")) : 0;
    el.vx = el.hasAttribute("vx") ? Number(el.getAttribute("vx")) : 0;
    el.vy = el.hasAttribute("vy") ? Number(el.getAttribute("vy")) : 0;
    el.x = numbers[4]; // plus width/2
    el.y = numbers[5]; // plus height/2
    
    el.bounce = el.hasAttribute("bounce") ? Number(el.getAttribute("bounce")) : 1/2;
    if (el.hasAttribute("friction")) {
       el.frictionX = Number(el.getAttribute("friction"));
       el.frictionY = Number(el.getAttribute("friction"));
    } else {
      el.frictionX = 0;
      el.frictionY = 0;
    }
    el.frictionX = el.hasAttribute("friction-x") ? Number(el.getAttribute("friction-x")) : ( el.frictionX ?? 0);
    el.frictionY = el.hasAttribute("friction-y") ? Number(el.getAttribute("friction-y")) : ( el.frictionY ?? 0);

    el.collide = el.hasAttribute("collide")
      ? el.getAttribute("collide") === "" ? [] : el.getAttribute("collide").split(" ")
      : ["top-wall", "left-wall", "bottom-wall", "right-wall"];

    el.floor = null;

    el.style.position = "fixed";
    el.style.transform = `matrix(1, 0, 0, 1, ${numbers[4]}, ${numbers[5]})`

    const { width, height } = el.getBoundingClientRect();
    el.width = width;
    el.height = height;

    el.uid = count;
    
    count++;
  }
}

function getAngle(cx, cy, ex, ey) {
  var dy = ey - cy;
  var dx = ex - cx;
  var theta = Math.atan2(dy, dx); // range (-PI, PI]
  // theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
  //if (theta < 0) theta = 360 + theta; // range [0, 360)
  return theta;
}

const G = 1;
const SOFTENING = 10;

function calculateForce(index) {
  const el = all[index];
  let x0 = el.x;
  let y0 = el.y;
  
  let fx = 0;
  let fy = 0;
  // could be sped up with symmetry
  for (let i = 0; i < mags.length; i++) {
    if (mags[i].uid === el.uid) continue;
    let x1 = mags[i].x;
    let y1 = mags[i].y;
    const dSquared = (x1 - x0)**2 + (y1 - y0)**2 + SOFTENING**2

    const q0 = el.q; // get from redness/blueness
    const q1 = mags[i].q; // get from redness/blueness

    // why are these different?
    
    // const f = G*mag0*mag1/dSquared;
    // const a = getAngle(x0, y0, x1, y1);
    // fx += f*Math.cos(a);
    // fy += f*Math.sin(a);
    
    const dx = x1 - x0;
    const dy = y1 - y0;
    const inv_r2 = (dx**2 + dy**2 + SOFTENING**2)**(-3/2);

    let attract = 1;
    if (q0 < 0 && q1 < 0) attract = -1;
    if (q0 > 0 && q1 > 0) attract = -1;

    fx += G * Math.abs(q0)*Math.abs(q1) * dx * inv_r2 * attract;
    fy += G * Math.abs(q0)*Math.abs(q1) * dy * inv_r2 * attract;
  }

  return [fx, fy];
} 

function haveCollided(el0, el1) {
    return el0.x < el1.x + el1.width &&
           el0.x + el0.width > el1.x &&
           el0.y < el1.y + el1.height &&
           el0.height + el0.y > el1.y;
}

function bounceOffCollidable(el0, el1) { // WIP
  // bounce off walls
  
  if (!haveCollided(el0, el1)) return false;
  
  const center = el => [
    el.x + el.width/2,
    el.y + el.height/2
  ]

  const [ el0cx, el0cy ] = center(el0);
  const [ el1cx, el1cy ] = center(el1);

  // if (el0cx > el1cx) {
  //   el0.x = el1.x + el1.width;
  //   el0.vx = el0.vx * (el0.vx*el1.vx < 0 ? -1 : 1)*el0.bounce;
  //   el0.ax = 0;
  // }

  // if (el0cx < el1cx) {
  //   el0.x = el1.x - el0.width;
  //   el0.vx = el0.vx * (el0.vx*el1.vx < 0 ? -1 : 1)*el0.bounce;
  //   el0.ax = 0;
  // }

  if (el0cy > el1cy) {
    el0.y = el1.y + el1.height;
    el0.vy = el0.vy * (el0.vy*el1.vy < 0 ? -1 : 1)*el0.bounce;
    el0.ay = 0;
    el0.floor = el1;
  }

  if (el0cy < el1cy) {
    el0.y = el1.y - el0.height;
    el0.vy = el0.vy * (el0.vy*el1.vy < 0 ? -1 : 1)*el0.bounce;
    el0.ay = 0;
  }

  return true;

}

const w = window.innerWidth;
const h = window.innerHeight;

function bounceOffWalls(el) {


    const collisionScale = el.bounce
    // bounce off walls
    if (el.x < 0 && el.collide.includes("left-wall")) {
      el.x = 0;
      el.vx = el.vx < 0 ? el.vx*-collisionScale : el.vx*collisionScale;
      el.ax = 0;
    }
  
    if (el.x > w - el.width && el.collide.includes("right-wall")) {
      el.x = w - el.width;
      el.vx = el.vx > 0 ? el.vx*-collisionScale : el.vx*collisionScale;
      el.ax = 0;
    }

    if (el.y < 0 && el.collide.includes("top-wall")) {
      el.y = 0;
      el.vy = el.vy < 0 ? el.vy*-collisionScale : el.vy*collisionScale;
      el.ay = 0;
    }

    if (el.y > h - el.height && el.collide.includes("bottom-wall")) {
      el.y = h - el.height;
      el.vy = el.vy > 0 ? el.vy*-collisionScale : el.vy*collisionScale;
      el.ay = 0;

      // el.floor = null;
    }
    
}

let mouseX = 0;
let mouseY = 0;
let stepCount = 0;
const heldKeys = {}; // TODO: should be set
const pressedKeys = {}; // TODO: should be set
const collided = {}; // TODO: should be set

function step() {
  for (let i = 0; i < all.length; i++) {
    const el = all[i];
    let [fx, fy] = calculateForce(i)

    el.ax += fx //+ (el.floor ? el.floor.ax : 0);
    el.ay += fy //+ (el.floor ? el.floor.ay : 0);

    // full step should I do half step
    el.vx += el.ax * 1/2 - el.vx*el.frictionX;
    el.vy += el.ay * 1/2 - el.vy*el.frictionY;

    // move
    el.x += el.vx //+ (el.floor ? el.floor.vx : 0);
    el.y += el.vy //+ (el.floor ? el.floor.vy : 0);


    el.style.transform = `matrix(1, 0, 0, 1, ${el.x}, ${el.y})`

    
    bounceOffWalls(el)
    const walls = ["top-wall", "left-wall", "bottom-wall", "right-wall"];

    const queryTerm = el.collide.length > 0 
      ? el.collide.filter(x => !walls.includes(x)).map(x => `.${x}`).join(" ")
      : null;

    const collidables = queryTerm ? document.querySelectorAll(queryTerm) : [];
    collidables.forEach(x => {

      const hasCollided = bounceOffCollidable(el, x);
      // if (hasCollided) 

    })
    
    // half step
    el.vx += el.ax * 1/2 - el.vx*el.frictionX;
    el.vy += el.ay * 1/2 - el.vy*el.frictionY;

    if (el.func) el.func(
      el, 
      w, 
      h, 
      mouseX, 
      mouseY, 
      stepCount, 
      heldKeys, 
      pressedKeys, 
      collided,
      endgame
    );

  }

  for (let key in pressedKeys) {
    if (heldKeys[key]) pressedKeys[key] = false;
  }

  stepCount++;
}

document.addEventListener("mousemove", e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
})

document.addEventListener("keydown", e => {
  const key = e.key;

  if (heldKeys[key]) return;

  heldKeys[key] = true;
  pressedKeys[key] = true;
})

document.addEventListener("keyup", e => {
  const key = e.key;
  delete heldKeys[key];
  delete pressedKeys[key];
})

// setInterval(step, 1000)

let gameover = false;
const endgame = () => { gameover = true };

const animate = () => {
  if (gameover) return;

  step();
  window.requestAnimationFrame(animate);
}

animate();