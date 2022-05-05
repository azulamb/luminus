(() => {
	class Support implements LuminusSupport {
		public gl: WebGL2RenderingContext;
		public program: WebGLProgram;

		public in: { [keys: string]: number };
		public uniform: { [keys: string]: WebGLUniformLocation };
		protected vertex: string;
		public texture: WebGLTexture[];
		public matrix: Matrix;

		constructor(gl2: WebGL2RenderingContext) {
			this.gl = gl2;
			this.texture = [];
			this.matrix = Luminus.matrix;
		}

		public enables(...enables: number[]) {
			for (const enable of enables) {
				this.gl.enable(enable);
			}

			return this;
		}

		public async init(vertex: string | HTMLScriptElement, fragment: string | HTMLScriptElement) {
			const program = this.gl.createProgram();
			if (!program) {
				throw new Error('Failure createProgram.');
			}

			this.program = program;

			await Promise.all(
				[
					this.initShader(vertex, fragment),
					// Load white 1x1 texture.
					this.loadTexture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQYV2P4////fwAJ+wP9BUNFygAAAABJRU5ErkJggg=='),
				],
			);

			this.loadPosition();

			this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
			this.gl.clearDepth(1.0);
			this.gl.depthFunc(this.gl.LEQUAL);

			return this.program;
		}

		public async initShader(vertex: string | HTMLScriptElement, fragment: string | HTMLScriptElement) {
			const gl = this.gl;
			const program = this.program;

			const vertexShader = await (typeof vertex === 'string' ? this.loadShader(gl.VERTEX_SHADER, vertex) : this.loadShader(vertex)).then((result) => {
				this.vertex = result.source;
				return this.createShader(result.type, result.source);
			});
			const fragmentShader = await (typeof fragment === 'string' ? this.loadShader(gl.FRAGMENT_SHADER, fragment) : this.loadShader(fragment)).then(
				(result) => {
					return this.createShader(result.type, result.source);
				},
			);

			gl.attachShader(program, vertexShader);
			gl.attachShader(program, fragmentShader);
			gl.linkProgram(program);

			if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
				throw new Error(gl.getProgramInfoLog(program) || '');
			}
		}

		public async loadShader(element: HTMLScriptElement): Promise<{ type: number; source: string }>;
		public async loadShader(type: number, source: string): Promise<{ type: number; source: string }>;
		async loadShader(type: number | HTMLScriptElement, source?: string): Promise<{ type: number; source: string }> {
			if (typeof type !== 'number') {
				// HTMLScriptElement.
				source = type.textContent || '';
				// x-shader/x-vertex or x-shader/x-fragment
				type = type.type === 'x-shader/x-fragment' ? this.gl.FRAGMENT_SHADER : this.gl.VERTEX_SHADER;
			}

			return { type: <number> type, source: <string> source };
		}

		public async createShader(type: number, source: string) {
			const gl = this.gl;

			const shader = gl.createShader(type);

			if (!shader) {
				throw new Error('Failure createShader.');
			}

			gl.shaderSource(shader, source);
			gl.compileShader(shader);

			if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				return shader;
			}

			gl.deleteShader(shader);

			throw new Error(gl.getShaderInfoLog(shader) || '');
		}

		public loadPosition() {
			const gl = this.gl;
			const program = this.program;

			const inPosition: { [keys: string]: number } = {};
			const uniformPosition: { [keys: string]: WebGLUniformLocation } = {};

			const vertex = this.vertex || '';
			let result: RegExpExecArray | null;

			const inReg = new RegExp(/\sin [^\s]+ ([^\;\s]+)\;/sg);
			while (result = inReg.exec(vertex)) {
				const key = result[1];
				inPosition[key] = gl.getAttribLocation(program, key);
			}

			const uniformReg = new RegExp(/\suniform [^\s]+ ([^\;\s]+)\;/sg);
			while (result = uniformReg.exec(vertex)) {
				const key = result[1];
				uniformPosition[key] = <WebGLUniformLocation> gl.getUniformLocation(program, key);
			}

			this.in = inPosition;
			this.uniform = uniformPosition;

			return this;
		}

		public clear(mask?: number) {
			this.gl.clear(mask === undefined ? this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT : mask);

			return this;
		}

		public orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number) {
			const m = new Float32Array(16);

			const lr = 1 / (left - right);
			const bt = 1 / (bottom - top);
			const nf = 1 / (near - far);
			m[1] = m[2] = m[3] = m[4] = m[6] = m[7] = m[8] = m[9] = m[11] = 0;
			m[0] = -2 * lr;
			m[5] = -2 * bt;
			m[10] = 2 * nf;
			m[12] = (left + right) * lr;
			m[13] = (top + bottom) * bt;
			m[14] = (far + near) * nf;
			m[15] = 1;

			return m;
		}

		public loadTexture(image: string | HTMLImageElement, num?: number) {
			const img = typeof image === 'string' ? document.createElement('img') : image;
			const index = num === undefined ? this.texture.length : num;

			if (!this.texture[index]) {
				this.texture[index] = <any> null;
			}

			return (img.complete && img.src ? Promise.resolve(img) : new Promise<HTMLImageElement>((resolve, reject) => {
				img.onload = () => {
					resolve(img);
				};
				img.onerror = reject;
				img.onabort = reject;
				if (typeof image === 'string') {
					img.src = image;
				}
			})).then((img) => {
				const gl = this.gl;
				const texture = gl.createTexture();
				if (!texture) {
					throw new Error('Failure createTexture.');
				}

				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
				gl.generateMipmap(gl.TEXTURE_2D);
				gl.bindTexture(gl.TEXTURE_2D, null);

				this.texture[index] = texture;

				return index;
			});
		}

		public useTexture(num: number) {
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture[num] || null);
		}
	}

	Luminus.createSupport = (gl2: WebGL2RenderingContext) => {
		return new Support(gl2);
	};
})();
