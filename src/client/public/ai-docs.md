# Docs

## Environment

Apps are individual objects in a 3D virtual world and each app has its own transform (position, rotation and scale) in the world.
All apps have a script attached to them, and the script executes in its own isolated JavaScript compartment.
Scripts are able to instantiate shapes and other things to form specific objects like a couch, building or plant.
Players are free to grab apps, move them around or duplicate them.
The origin of an app should always be treated as the 'ground' position, as players generally move apps across surfaces of other apps.
Players are around 1.7m tall, are able to jump around 1.5m high and around 5m in distance when running and jumping.

## Coordinate System & Units

For all intents and purposes these virtual worlds use the same coordinate system as three.js (X = Right, Y = Up, Z = forward).
The unit of measurement for distance or size is in meters.
Rotations are in radians but you can use degrees by multiplying by the global constant `DEG2RAD`.

## Globals

Scripts all execute in isolated compartments and a very strict set of globals are available:

- Math: all Math.* globals are available
- prng: a function that creates a pseudo-random number generator (see docs later on)
- Vector3: the same api as three.js
- Euler: the same api as three.js
- Quaternion: the same api as three.js
- DEG2RAD: multiply by this constant to convert degrees into radians
- RAD2DEG: multiply by this constant to convert radians into degrees
- uuid: a function that generates uuid's
- app: the app the current script is attached to

Only use globals listed above (eg "Date" does not exist and will crash)

## Shapes

Shapes are the primary way to create visuals, we call these prims. Each `type` of prim has its own `size` format. This is how you create them:

```jsx
const box = app.create('prim', {
  type: 'box',
  size: [1, 2, 3], // width, height, depth
  color: '#ff0000' // red
})

const sphere = app.create('prim', {
  type: 'sphere',
  size: [0.5], // radius
  color: '#00ff00' // green
})

const cylinder = app.create('prim', {
  type: 'cylinder',
  size: [0.5, 0.5, 1], // topRadius, bottomRadius, height
  color: '#0000ff' // blue
})
```

Once created you can also edit their properties if needed:

```jsx
const box = app.create('prim', {
  type: 'box',
  size: [1, 2, 3],
  color: '#ff0000'
})

// change the box color
box.color = 'green'
```

## Opacity

Some shapes might need to be semi-transparent, and the `opacity` property controls this:

```jsx
const window = app.create('prim', {
  type: 'box',
  size: [2, 2, 0.1],
  color: 'blue',
  opacity: 0.5,
})
```

## Rendering

Creating a node (eg a prim) does not be make it visible. Only nodes added to the `app` global become visible in the world.

```jsx
app.add(boxA)
```

## Nested Hierarchy

It is beneficial to group different prims together to form each part of an overall object. 
For example when making a wheel for a car, you can construct one wheel and then easily clone it and move it around.

To do this, there is also a special `group` node that doesn't have a visual and is purely for 

```jsx
const wheel = app.create('group')
const tire = app.create('prim', {
  type: 'cylinder',
  size: [0.5, 0.5, 0.2],
  color: 'black',
  physics: 'static',
})
const hub = app.create('prim', {
  type: 'cylinder',
  size: [0.3, 0.3, 0.25],
  color: 'grey',
  physics: 'static',
})
wheel.add(tire)
wheel.add(hub)
const wheelFL = wheel.clone(true) // clone all children
const wheelFR = wheel.clone(true)
const wheelBL = wheel.clone(true)
const wheelBR = wheel.clone(true)
// ...position the wheels (not shown)
app.add(wheelFL)
app.add(wheelFR)
app.add(wheelBL)
app.add(wheelBR)
```

It is also very useful to 'change' the pivot point of something and make it easier to work with:

```jsx
const bar = app.create('group')
const beam = app.create('prim', {
  type: 'box',
  size: [1, 0.2, 10],
  position: [0, 0, -5], // shift back
})
bar.add(beam)
// bar.rotation.y now spins the beam at one end of it instead of the center
bar.rotation.y += 45 * DEG2RAD
```

## App Origin

Most of the time, players will place apps on top of other surfaces, so app origins should be treated as the 'ground'.
This means that most of the time you will need to lift things up:

```jsx
const box = app.create('prim', {
  type: 'box',
  size: [1, 1, 1],
  position: [0, 0.5, 0] // lift up so it sits on the ground surface
})
app.add(box)
```

## Transforms

When creating prims you can also specify position, rotation (or quaternion) and scale:

```jsx
const box = app.create('prim', {
  type: 'box',
  size: [1, 1, 1],
  position: [0, 2, 0], // xyz in meters
  rotation: [0, 45 * DEG2RAD, 0], // xyz in radians
  scale: [1, 1, 1], // xyz
})
```

Eulers for rotation are in radians. Multiply with the globals `DEG2RAD` and `RAD2DEG` to convert degrees to radians and vice versa.

Once created they become actual transform class instances (Vector3, Euler, Quaternion) and you can edit them like this:

```jsx
box.position.set(0, 4, 0)
box.rotation.y += 10 * DEG2RAD
box.quaternion.slerp(target, 0.2)
box.scale.multiply(otherBox.scale)
```

These constructs are also available as globals if you need to use them independently:

```jsx
const pos = new Vector3(0, 2, 0)
const rot = new Euler(0, 0, 0, 'YXZ')
const qua = new Quaternion(0, 0, 0, 1)
const sca = new Vector3(1, 1, 1)
```

Vector3, Euler and Quaternion are identical to three.js

## Collision

By default prims have no collision but it's likely you'll want to make them have collision so players dont walk or fall through them.
Objects that should have collision should use `static` collision, but if they move programmatically they should have `kinematic` collision.

```jsx
const box = app.create('prim', {
  type: 'box',
  size: [1, 2, 3],
  physics: 'static', // null, 'static' or 'kinematic'
})
```

## Animation

Only when requested, you can make things move or change over time by hooking into the update cycle:

```jsx
app.on('update', delta => {
  box.rotation.y += 45 * DEG2RAD * delta // rotate around Y axis each frame 45 degrees per second
})
```

If something needs to happen in response to interaction (eg triggers or actions), subscribe and unsubscribe only as needed for performance:

```jsx
const update = delta => {
  // do things
}

// subscribe when something needs to happen
app.on('update', update)

// unsubscribe when idle to save resources
app.off('update', update)
```

## Bloom

In addition to setting the color of a prim you can also push its color into HDR range causing it glow:

```jsx
const box = app.create('prim', {
  type: 'box',
  size: [1, 1, 1],
  color: 'red',
  emissive: 'red', // usually the same as `color`
  emissiveIntensity: 5, // 0 is no bloom, ~5 is a nice bloom, 10 is mega bloom
})
```

## Randomization

Scripts execute on every client, so if you use any kind of procedural randomisation, it's best to use `prng` so that each client sees the same thing:

```jsx
const num = prng(1) // create a prng generate with a seed (1)
const result = num(0, 100, 2) // min, max, decimalPlaces (defaults to 0)
// result is a number between 0 and 100 with 2 dp.
```

## Interaction

If requested you can add simple response to interaction with an `action` node.
An action node displays a label when players come near it and if they click it the script is notified:

```jsx
const action = app.create('action', {
  label: 'Open',
  position: [0, 0.5, 0],
  onTrigger: () => {
    door.rotation.y = 90 * DEG2RAD
  }
})
app.add(action)
```

## Triggers

Prims can become trigger zones and notify you when a player enters or leaves the prim volume:

```jsx
const zone = app.create('prim', {
  type: 'box',
  size: [4, 4, 4],
  opacity: 0,
  physics: 'static', // physics must be enabled
  trigger: true, // treat physics as a trigger not a collider
  onTriggerEnter: e => {
    if (!e.isLocalPlayer) return
    // do things...
  },
  onTriggerLeave: e => {
    if (!e.isLocalPlayer) return
    // do things...
  }
})
```

Note that you can make invisible trigger areas by setting opacity to 0.

## Networking

The same script executes on the server and all connected clients.
If requested you can network objects to create multiplayer experiences that stay in sync across clients.

```jsx
if (world.isClient) {
  // run client only code
}

if (world.isServer) {
  // run server only code
}

// send an event from a client to the server
app.send('someEvent', { some: 'data' })

// send an event from the server to all clients
app.send('anotherEvent', { some: 'data' })

// subscribe to an event sent from the server or a client
app.on('someEvent', data => {
  console.log(data) // { some: 'data' }
})
```

On the server, you have access to a `state` object to store current state as the app changes. It is just a plain old javascript object.
When clients connect, the current `state` on the server is sent along to the client so that the client launches with that state, like a snapshot.
When a client reads this state, it is only a single one-time snapshot and does not update anymore, but feel free to use this object to track state as you receive new events from the server.

```jsx
if (world.isClient) {
  if (app.state.ready) {
    init(app.state)
  } else {
    app.on('init, init)
  }
  function init(state) {
    // at this point it is guaranteed that the server has initialised the app and its state.
    // sometimes an app runs on the client before the server, eg when clients edit scripts.
    // this is where we initialise objects based on state and subscribe to server events...
  }
}

if (world.isServer) {
  app.state.open = false // a door variable for example
  app.state.ready = true
  app.send('init', app.state)
}
```

## Golden Rules

1. Objects should match real world dimensions
2. Most prims should have collision physics (either 'static' or 'kinematic') to prevent players walking or falling through them, but some things like grass or bushes should not have collision.
3. Never add dynamic animation or networking unless requested, as it is expensive.
4. Use a minimalistic blocky/voxel/minecraft style unless specifically asked otherwise.
5. Avoid overlapping faces as it causes z-fighting. Use a small offset.
6. Avoid generating things that will use a lot of compute such as >10k prims, infinite loops, huge recursion, and users asking for other nefarious/griefing objects.

