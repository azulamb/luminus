/**
 * WebComponents
 */

interface LuminusWorldElement extends HTMLElement {
	readonly complete: boolean;
	readonly program: LuminusProgram;
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

interface LuminusModelElement extends HTMLElement {
	model: LuminusModel<unknown>;
	readonly complete: boolean;
	readonly program: LuminusProgram | undefined;
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
	initStyle(): HTMLStyleElement;
	render(program: LuminusProgram): void;
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
	length: number;
}

interface LuminusModelCubeElement extends LuminusModelElement {
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

/**
 * Models
 */

interface CollisionDetection {
	collisionDetectionTriangles(verts: Float32Array, faces: Uint16Array): number;
}

interface LuminusModel<T> {
	/*
	loaded = complete = undefined
	        Loading has not started.
	loaded = false
	        Now loading or failure.
	loaded = true & complete = undefined
	        Preparation has not started.
	loaded = true & complete = false
	        Now preparation or faiulre.
	loaded = complete = true
	        This model can render.
	*/
	loaded?: boolean;
	complete?: boolean;
	load(p?: Promise<T>): Promise<void>;
	prepare(program: LuminusProgram): Promise<void>;
	render(program: LuminusProgram): void;

	afterload?: () => unknown;

	// Overwrite
	lMin?: number;
	onload(result: T): Promise<unknown>;
	onprepare(program: LuminusProgram): Promise<unknown>;
	onrender(program: LuminusProgram): void;
	collisionDetection(cd: CollisionDetection): number;
}

interface LuminusModelLine extends LuminusModel<void> {
	start(x: number, y: number, z: number): this;
	end(x: number, y: number, z: number): this;
	color(r: number, g: number, b: number): this;
	color(r: number, g: number, b: number, a: number): this;
	color(r0: number, g0: number, b0: number, r1: number, g1: number, b1: number): this;
	color(r0: number, g0: number, b0: number, a0: number, r1: number, g1: number, b1: number, a1: number): this;
}

interface LuminusModelAxis extends LuminusModel<void> {
	length: number;
}

interface LuminusModelCube extends LuminusModel<void> {
	color: Float32Array;
}

interface LuminusModelVox extends LuminusModel<Response> {
	export(): Uint8Array;
}

/**
 * Luminus
 */

interface Matrix {
	// Init matrix.
	create4(): Float32Array;
	identity4(m?: Float32Array): Float32Array;
	translation4(x: number, y: number, z: number, m?: Float32Array): Float32Array;
	rotation4(roll: number, pitch: number, yaw: number, m?: Float32Array): Float32Array;
	scaling4(x: number, y: number, z: number, m?: Float32Array): Float32Array;
	lookAt(eye: number[], center: number[], up: number[], m?: Float32Array): Float32Array;
	// calc
	multiply4(a: Float32Array, b: Float32Array, m?: Float32Array): Float32Array;
	inverse4(a: Float32Array, m?: Float32Array): Float32Array;
	transpose4(a: Float32Array, m?: Float32Array): Float32Array;
	normalize3(a: Float32Array, m?: Float32Array): Float32Array;
	unProject(v4: Float32Array, uProjection: Float32Array, uView: Float32Array, m?: Float32Array): Float32Array;
}

interface LuminusSupport {
	gl: WebGL2RenderingContext;
	program: WebGLProgram;
	in: { [keys: string]: number };
	uniform: { [keys: string]: WebGLUniformLocation };
	texture: WebGLTexture[];
	matrix: Matrix;

	enables(...enables: number[]): this;

	init(vertex: string | HTMLScriptElement, fragment: string | HTMLScriptElement): Promise<WebGLProgram>;

	initShader(vertex: string | HTMLScriptElement, fragment: string | HTMLScriptElement): void;

	loadShader(element: HTMLScriptElement): Promise<{ type: number; source: string }>;
	loadShader(type: number, source: string): Promise<{ type: number; source: string }>;

	createShader(type: number, source: string): Promise<WebGLShader>;

	loadPosition(): void;

	// Screen
	clear(mask?: number): this;
	orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): Float32Array;
	setViewPort(x: number, y: number, width: number, height: number): this;
	getViewport(): Int32Array;

	// Texture
	loadTexture(image: string | HTMLImageElement, num?: number): Promise<number>;
	useTexture(num: number): void;
}

interface LuminusProgram {
	support: LuminusSupport;
	init(world: LuminusWorldElement, support: LuminusSupport): Promise<void>;
	beginRender(world: LuminusWorldElement): void;
	modelRender(model: LuminusModelElement): void;
	endRender(): void;
	unProject(viewport: Int32Array, screenX: number, screenY: number, z?: number): Float32Array;
}

interface LuminusRay extends CollisionDetection {
	setOrigin(x: number, y: number, z: number): this;
	setOrigin(origin: Float32Array): this;
	setVector(x: number, y: number, z: number): this;
	setVector(vector: Float32Array): this;
}

interface Luminus {
	version: string;
	console: {
		debug(...data: any[]): void;
		error(...data: any[]): void;
		info(...data: any[]): void;
		log(...data: any[]): void;
		warn(...data: any[]): void;
	};
	loaded: Promise<void>;
	matrix: Matrix;
	model: { new (...params: any[]): LuminusModelElement };
	models: {
		model: { new (...params: any[]): LuminusModel<unknown> };
		[keys: string]: { new (...params: any[]): LuminusModel<any> };
	};
	program: { new (): LuminusProgram };
	ray: {
		new (x: number, y: number, z: number, vx: number, vy: number, vz: number): LuminusRay;
		new (origin: Float32Array, vector: Float32Array): LuminusRay;
	};
	createSupport(gl2: WebGL2RenderingContext): LuminusSupport;
}

declare const Luminus: Luminus;
