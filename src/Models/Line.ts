(() => {
	class Line extends Luminus.models.model implements LuminusModelLine {
		public lMin = 1;
		public loaded?: boolean = true;
		public complete?: boolean;
		private _change: boolean;
		private position: Float32Array;
		private colors: Float32Array;

		protected vao: WebGLVertexArrayObject;

		constructor() {
			super();
			this.position = new Float32Array([0, 0, 0, 0, 0, 0]);
			this.colors = new Float32Array([1, 1, 1, 1, 1, 1, 1, 1]);
		}

		public onprepare(world: LuminusWorld) {
			const gl2 = world.support.gl;

			const vao = gl2.createVertexArray();
			if (!vao) {
				return Promise.reject(new Error('Failure createVertexArray.'));
			}

			const support = world.support;

			gl2.bindVertexArray(vao);

			const positionBuffer = gl2.createBuffer();
			gl2.bindBuffer(gl2.ARRAY_BUFFER, positionBuffer);
			gl2.bufferData(gl2.ARRAY_BUFFER, this.position, gl2.STATIC_DRAW);
			gl2.enableVertexAttribArray(support.in.vPosition);
			gl2.vertexAttribPointer(support.in.vPosition, 3, gl2.FLOAT, false, 0, 0);

			const colorBuffer = gl2.createBuffer();
			gl2.bindBuffer(gl2.ARRAY_BUFFER, colorBuffer);
			gl2.bufferData(gl2.ARRAY_BUFFER, this.colors, gl2.STATIC_DRAW);
			gl2.enableVertexAttribArray(support.in.vColor);
			gl2.vertexAttribPointer(support.in.vColor, 4, gl2.FLOAT, false, 0, 0);

			gl2.bindVertexArray(null);

			this.vao = vao;

			this._change = false;

			return Promise.resolve();
		}

		public onrender(world: LuminusWorld) {
			const gl2 = world.support.gl;

			if (this._change) {
				this.prepare(world);
			}

			gl2.bindVertexArray(this.vao);
			gl2.drawArrays(gl2.LINES, 0, 2);
			gl2.bindVertexArray(null);
		}

		public start(x: number, y: number, z: number) {
			this.position[0] = x;
			this.position[1] = y;
			this.position[2] = z;
			this._change = true;
			return this;
		}

		public end(x: number, y: number, z: number) {
			this.position[3] = x;
			this.position[4] = y;
			this.position[5] = z;
			this._change = true;
			return this;
		}

		public color(r: number, g: number, b: number): this;
		public color(r: number, g: number, b: number, a: number): this;
		public color(r0: number, g0: number, b0: number, r1: number, g1: number, b1: number): this;
		public color(r0: number, g0: number, b0: number, a0: number, r1: number, g1: number, b1: number, a1: number): this;
		color(r0: number, g0: number, b0: number, a0?: number, r1?: number, g1?: number, b1?: number, a1?: number) {
			// RGB
			if (a0 === undefined) {
				this.colors[0] = this.colors[4] = r0;
				this.colors[1] = this.colors[5] = g0;
				this.colors[2] = this.colors[6] = b0;
				this.colors[3] = this.colors[7] = 1;

				return this;
			}

			// RGBA
			if (r1 === undefined) {
				this.colors[0] = this.colors[4] = r0;
				this.colors[1] = this.colors[5] = g0;
				this.colors[2] = this.colors[6] = b0;
				this.colors[3] = this.colors[7] = a0;

				return this;
			}

			// RGBRGB
			if (b1 === undefined) {
				this.colors[0] = r0;
				this.colors[1] = g0;
				this.colors[2] = b0;
				this.colors[4] = a0;
				this.colors[5] = r1;
				this.colors[6] = <number> g1;
				this.colors[3] = this.colors[7] = 1;

				return this;
			}

			// RGBARGBA
			if (a1 !== undefined) {
				this.colors[0] = r0;
				this.colors[1] = g0;
				this.colors[2] = b0;
				this.colors[3] = a0;
				this.colors[4] = r1;
				this.colors[5] = <number> g1;
				this.colors[6] = b1;
				this.colors[7] = a1;
			}

			return this;
		}
	}
	Luminus.models.line = Line;
})();
