# HTML with Physics!
 
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
- collidable
- unwalled
- func
	- scope contains
		- el
			- x
			- y
			- vx
			- vy
			- ax
			- ay
			- width
			- height
		- w
		- h
		- heldKeys
		- pressedKeys

Example:
```
<div style="">

</div>
```

or

```
<div>
	<img src=""/>
</div>
```


maybe:

on:click="el.vx = 2" 
on:keyheld:ArrowRight="el.vx = 2" 
on:keypress:ArrowUp="el.vx = 2" 
collidable