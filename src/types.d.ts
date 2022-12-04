/**
 * Models
 */

interface CollisionDetection {
	collisionDetectionTriangles(verts: Float32Array, faces: Uint16Array): number;
	clone(): CollisionDetection;
	transform(matrix: Float32Array): this;
}

interface LuminusModel<T> {
	/*
	complete = true
	        This model can render.
	--------
	loaded = complete = undefined
	        Loading has not started.
	loaded = false
	        Now loading or failure.
	loaded = true & complete = undefined
	        Preparation has not started.
	loaded = true & complete = false
	        Now preparation or failure.
	loaded = complete = true
	        This model can render.
	*/
	loaded?: boolean;
	complete?: boolean;
	load(p?: Promise<T>): Promise<void>;
	prepare(world: LuminusWorld): Promise<void>;
	render(world: LuminusWorld): void;

	afterload?: () => unknown;

	// Overwrite
	lMin?: number;
	onload(result: T): Promise<unknown>;
	onPrepare(world: LuminusWorld): Promise<unknown>;
	onRender(world: LuminusWorld): void;
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
	length: number;
	color: Float32Array;
}

interface LuminusModelVox extends LuminusModel<Response> {
	export(): Uint8Array;
}

/**
 * States
 */

interface LuminusWorld {
	support: LuminusSupport;
	init(support: LuminusSupport): Promise<void>;
	beginRender(): void;
	endRender(): void;
	unProject(viewport: Int32Array, screenX: number, screenY: number, z?: number): Float32Array;
	modelRender(model: LuminusModelRender<unknown>): void;
}

interface LuminusState {
	matrix: Float32Array;
	update(): void;

	x: number;
	y: number;
	z: number;
}

interface LuminusStateAxisRotate extends LuminusState {
	cx: number;
	cy: number;
	cz: number;

	xAxis: number;
	yAxis: number;
	zAxis: number;

	roll: number;
	pitch: number;
	yaw: number;
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

	init(vertex: string, fragment: string): Promise<WebGLProgram>;

	initShader(vertex: string, fragment: string): void;

	loadShader(type: number, source: string): Promise<{ type: number; source: string }>;

	createShader(type: number, source: string): Promise<WebGLShader>;

	loadPosition(): void;

	// Screen
	clear(mask?: number): this;
	orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): Float32Array;
	setViewPort(x: number, y: number, width: number, height: number): this;
	getViewport(): Int32Array;

	// Texture
	useTexture(num: number): void;
}

interface LuminusRay extends CollisionDetection {
	origin: Float32Array;
	vector: Float32Array;
	setOrigin(x: number, y: number, z: number): this;
	setOrigin(origin: Float32Array): this;
	setVector(x: number, y: number, z: number): this;
	setVector(vector: Float32Array): this;
}

interface Luminus {
	version: string;
	console: {
		// deno-lint-ignore no-explicit-any
		debug(...data: any[]): void;
		// deno-lint-ignore no-explicit-any
		error(...data: any[]): void;
		// deno-lint-ignore no-explicit-any
		info(...data: any[]): void;
		// deno-lint-ignore no-explicit-any
		log(...data: any[]): void;
		// deno-lint-ignore no-explicit-any
		warn(...data: any[]): void;
	};
	loaded: Promise<void>;
	matrix: Matrix;
	world: { new (): LuminusWorld };
	models: {
		// deno-lint-ignore no-explicit-any
		model: { new (...params: any[]): LuminusModel<unknown> };
		// deno-lint-ignore no-explicit-any
		[keys: string]: { new (...params: any[]): LuminusModel<any> };
	};
	states: {
		// deno-lint-ignore no-explicit-any
		state: { new (...params: any[]): LuminusState };
		// deno-lint-ignore no-explicit-any
		[keys: string]: { new (...params: any[]): LuminusState };
	};
	ray: {
		new (x: number, y: number, z: number, vx: number, vy: number, vz: number): LuminusRay;
		new (origin: Float32Array, vector: Float32Array): LuminusRay;
	};
	createSupport(gl2: WebGL2RenderingContext): LuminusSupport;
}
