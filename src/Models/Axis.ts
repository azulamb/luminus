(() => {
	Luminus.models.axis = class Axis extends Luminus.models.model implements LuminusModelAxis {
		public lMin = 1;
		public loaded?: boolean = true;
		public complete?: boolean;
		private _length: number;
		private _change: boolean;

		protected vao: WebGLVertexArrayObject;

		constructor() {
			super();
			this._length = 10;
		}

		get length() {
			return this._length;
		}
		set length(value) {
			this._length = value;
			this._change = true;
		}

		public onprepare(world: LuminusWorld) {
			const length = this.length;

			const gl2 = world.support.gl;

			const vao = gl2.createVertexArray();
			if (!vao) {
				return Promise.reject(new Error('Failure createVertexArray.'));
			}

			const support = world.support;

			gl2.bindVertexArray(vao);

			const positionBuffer = gl2.createBuffer();
			gl2.bindBuffer(gl2.ARRAY_BUFFER, positionBuffer);
			// deno-fmt-ignore
			gl2.bufferData(
				gl2.ARRAY_BUFFER,
				new Float32Array([
					0, 0, 0, length, 0, 0,
					0, 0, 0, 0, length, 0,
					0, 0, 0, 0, 0, length,
				]),
				gl2.STATIC_DRAW,
			);
			gl2.enableVertexAttribArray(support.in.vPosition);
			gl2.vertexAttribPointer(support.in.vPosition, 3, gl2.FLOAT, false, 0, 0);

			const colorBuffer = gl2.createBuffer();
			gl2.bindBuffer(gl2.ARRAY_BUFFER, colorBuffer);
			// deno-fmt-ignore
			gl2.bufferData(
				gl2.ARRAY_BUFFER,
				new Float32Array([
					1, 0, 0, 1, 1, 0, 0, 1,
					0, 1, 0, 1, 0, 1, 0, 1,
					0, 0, 1, 1, 0, 0, 1, 1,
				]),
				gl2.STATIC_DRAW,
			);
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
			gl2.drawArrays(gl2.LINES, 0, 6);
			gl2.bindVertexArray(null);
		}
	};
})();
