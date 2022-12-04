/**
 * WebComponents
 */

interface LuminusWorldElement extends HTMLElement {
	readonly complete: boolean;
	readonly world: LuminusWorld;
	// screen
	width: number;
	height: number;
	// camera
	top: number;
	bottom: number;
	left: number;
	right: number;
	near: number;
	far: number;
	view: 'volume' | 'frustum';
	eyex: number;
	eyey: number;
	eyez: number;
	upx: number;
	upy: number;
	upz: number;
	centerx: number;
	centery: number;
	centerz: number;
	// light
	lightx: number;
	lighty: number;
	lightz: number;
	readonly ambientColor: number[];
	readonly lightColor: number[];

	init(): WebGLProgram | null;
	render(): void;
}

interface LuminusModelRender<T> {
	model: LuminusModel<T>;
	state: LuminusState;
	/** Get model matrix. */
	copyMatrix(out: Float32Array): void;
	render(world: LuminusWorld): void;
}

interface LuminusModelElement extends LuminusModelRender<unknown>, HTMLElement {
	readonly complete: boolean;
	readonly world: LuminusWorld | undefined;
	/** true = This model selectable. */
	selectable: boolean;
	/** Model center x */
	cx: number;
	/** Model center y */
	cy: number;
	/** Model center z */
	cz: number;
	/** Rotation x axis */
	xaxis: number;
	/** Rotation y axis */
	yaxis: number;
	/** Rotation z axis */
	zaxis: number;
	/** Translate x */
	x: number;
	/** Translate y */
	y: number;
	/** Translate z */
	z: number;
	/** Rotation x axis */
	roll: number;
	/** Rotation y axis */
	pitch: number;
	/** Rotation z axis */
	yaw: number;
	createState(): LuminusState;
	initStyle(): HTMLStyleElement;
	/**
	 * Update model matrix.
	 * @param sync true = sync
	 */
	updateMatrix(sync?: boolean): void;
	/**
	 * @return Infinity = not collide. Other number = collide.(distance from origin.)
	 */
	collisionDetection(cd: CollisionDetection): number;
	rerender(): void;
}

interface LuminusModelLineElement extends LuminusModelElement {
	/** start x */
	sx: number;
	/** start y */
	sy: number;
	/** start z */
	sz: number;
	/** end x */
	ex: number;
	/** end y */
	ey: number;
	/** end z */
	ez: number;
	start(x: number, y: number, z: number): this;
	end(x: number, y: number, z: number): this;
	color(r: number, g: number, b: number): this;
	color(r: number, g: number, b: number, a: number): this;
	color(r0: number, g0: number, b0: number, r1: number, g1: number, b1: number): this;
	color(r0: number, g0: number, b0: number, a0: number, r1: number, g1: number, b1: number, a1: number): this;
}

interface LuminusModelAxisElement extends LuminusModelElement {
	model: LuminusModelAxis;
	length: number;
}

interface LuminusModelCubeElement extends LuminusModelElement {
	model: LuminusModelCube;
	length: number;
}

// Load .vox model only.
interface LuminusModelVoxElement extends LuminusModelElement {
	model: LuminusModelVox;
	src: string;
	import(file: File): Promise<this>;
	// Export minimize vox.
	export(): Uint8Array;
}
