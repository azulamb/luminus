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
		eyex="5" eyey="5" eyez="5"
		upx="0" upy="1" upz="0"
		centerx="0" centery="0" centerz="0"
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

## TODO

* Add minify.
* Billboard
