![](./docs/icon.svg)

# Luminus

Luminus is 3d webcomponents. (Use WebGL 2)

## Sample

```html
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>Luminus</title>
<script src="./luminus.js" data-debug></script>
</head>
<body style="display:flex;justify-content:center;">
	<lu-world
		width="600" height="400"
		style="background:black;width:600px;height:400px;"
		top="10" bottom="-10" left="-15" right="15" near="-20" far="20"
		eye-x="5" eye-y="5" eye-z="5"
		up-x="0" up-y="1" up-z="0"
		center-x="0" center-y="0" center-z="0"
	>
		<lu-axis></lu-axis>
		<lu-cube></lu-cube>
	</lu-world>
</body>
</html>
```

## Tools

* vox
  * MagicaVoxel
    * https://ephtracy.github.io/
  * Minify
    * https://azulamb.github.io/luminus/voxminify.html

## Build

```
deno task build
```

### Local debug

```
deno task server
```

And access `http://127.0.0.1:4507/`

## TODO

* Download cache.
* Add minify.
* Billboard
* Debug option(lu-world option? script?)
* lu-model.clone
