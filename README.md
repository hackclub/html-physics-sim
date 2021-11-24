# HTML with Physics! (BETA)

[Live Demo](https://hackclub.github.io/live-editor/?file=recF3hPxVFpkYClll)

This is a tiny little game engine to spice up your HTML. Add this script to the top of your page:

```html
<script defer type="module" src="https://hackclub.github.io/html-physics-sim/initialize.js"></script>
```

After you add this script to your page you can add these properties to any element on that page.
 
Properties:

- x (number, can be negative)
- y (number, can be negative)
- vx (number, can be negative)
- vy (number, can be negative)
- ax (number, can be negative)
- ay (number, can be negative)
- q (number, can be negative)
- bounce (0 - 1)
- friction 
	- friction-x (0 - 1)
	- friction-y (0 - 1)
- collide (Takes list of classes it collides with and walls which can be left-wall, right-wall, top-wall, bottom-wall. If blank will default to all walls.)
- func

`func` is a special attribute that takes a JavaScript function that will run ever game loop. The scope of the function contains:

- el (the current el with the properties below)
	- x
	- y
	- vx
	- vy
	- ax
	- ay
	- width
	- height
- w (the width of the page)
- h (the height of the page)
- heldKeys
- pressedKeys

Here is an example game made with the libary.

https://user-images.githubusercontent.com/27078897/143150239-34d2af69-5837-4c19-a833-7461508dabff.mov

Example:

```html
<script defer type="module" src="https://hackclub.github.io/html-physics-sim/initialize.js"></script>

<style>
  body {
    margin: 0px;
  }
  
  .platform {
    height: 50px;
    display: grid;
    place-content: center;
    background: blue;
    color: white;
  }

</style>

<div 
  x="100" 
  y="450"  
  bounce="0.2"
  friction-x=".3"
  collide="bottom-wall left-wall right-wall platform"
  func="
    el.ay = .4; 
  
    if (heldKeys['ArrowRight']) {
      el.vx = 5;
    }

    if (heldKeys['ArrowLeft']) {
      el.vx = -5;
    }

    if (el.y < 0) {
      endgame()
      alert('You won!')
    }

    if (pressedKeys['ArrowUp'] && Math.abs(el.vy) < 0.5) {
      el.vy = -15;
    }
  ">
  <img width="100px" src="https://hips.hearstapps.com/countryliving.cdnds.net/17/47/1511194376-cavachon-puppy-christmas.jpg"/>
</div>

<div 
  x="1000" 
  vx="-2" 
  y="550" 
  bounce="1"
  class="platform"
  style="width: 200px;">
</div>

<div 
  x="300" 
  vx="-1.3" 
  y="350"
  class="platform" 
  collide=""
  func="if (el.x < -el.width) { el.x = w }"
  style="width: 300px;">
</div>

<div 
  x="300" 
  vx="-2.4" 
  y="150" 
  bounce="1"
  class="platform" 
  style="width: 200px;">
</div>
```
