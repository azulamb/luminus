(() => {
	class Cube extends Luminus.models.model implements LuminusModelCube {
		public loaded?: boolean = true;
		public complete?: boolean;
		public color: Float32Array = new Float32Array(4);
		protected verts: Float32Array;
		protected faces: Uint16Array;
		private _length = 1;
		private _change: boolean;

		protected vao: WebGLVertexArrayObject;

		get length() {
			return this._length;
		}
		set length(value) {
			this._length = value;
			this._change = true;
		}

		public onprepare(world: LuminusWorld) {
			Luminus.console.info('Start: cube-prepare.');

			const l = this._length;
			// deno-fmt-ignore
			this.verts = new Float32Array(
				[
					0, 0, l, l, 0, l, l, l, l,
					0, l, l, 0, 0, 0, 0, l, 0,
					l, l, 0, l, 0, 0, 0, l, 0,
					0, l, l, l, l, l, l, l, 0,
					0, 0, 0, l, 0, 0, l, 0, l,
					0, 0, l, l, 0, 0, l, l, 0,
					l, l, l, l, 0, l, 0, 0, 0,
					0, 0, l, 0, l, l, 0, l, 0,
				],
			);

			const colors = new Float32Array([...Array(this.verts.length / 3 * 4)]);
			for (let i = 0; i < colors.length; i += 4) {
				colors[i] = this.color[0];
				colors[i + 1] = this.color[1];
				colors[i + 2] = this.color[2];
				colors[i + 3] = this.color[3];
			}

			// deno-fmt-ignore
			const normals = new Float32Array(
				[
					0, 0, 1, 0, 0, 1, 0, 0, 1,
					0, 0, 1, 0, 0, -1, 0, 0, -1,
					0, 0, -1, 0, 0, -1, 0, 1, 0,
					0, 1, 0, 0, 1, 0, 0, 1, 0,
					0, -1, 0, 0, -1, 0, 0, -1, 0,
					0, -1, 0, 1, 0, 0, 1, 0, 0,
					1, 0, 0, 1, 0, 0, -1, 0, 0,
					-1, 0, 0, -1, 0, 0, -1, 0, 0,
				],
			);

			// deno-fmt-ignore
			this.faces = new Uint16Array(
				[
					0, 1, 2, 0, 2, 3, 4, 5, 6,
					4, 6, 7, 8, 9, 10, 8, 10, 11,
					12, 13, 14, 12, 14, 15, 16, 17, 18,
					16, 18, 19, 20, 21, 22, 20, 22, 23,
				],
			);

			const gl2 = world.support.gl;

			const vao = gl2.createVertexArray();
			if (!vao) {
				return Promise.reject(new Error('Failure createVertexArray.'));
			}

			const support = world.support;

			gl2.bindVertexArray(vao);

			const positionBuffer = gl2.createBuffer();
			gl2.bindBuffer(gl2.ARRAY_BUFFER, positionBuffer);
			gl2.bufferData(gl2.ARRAY_BUFFER, this.verts, gl2.STATIC_DRAW);
			gl2.enableVertexAttribArray(support.in.vPosition);
			gl2.vertexAttribPointer(support.in.vPosition, 3, gl2.FLOAT, false, 0, 0);

			const colorBuffer = gl2.createBuffer();
			gl2.bindBuffer(gl2.ARRAY_BUFFER, colorBuffer);
			gl2.bufferData(gl2.ARRAY_BUFFER, colors, gl2.STATIC_DRAW);
			gl2.enableVertexAttribArray(support.in.vColor);
			gl2.vertexAttribPointer(support.in.vColor, 4, gl2.FLOAT, false, 0, 0);

			const normalBuffer = gl2.createBuffer();
			gl2.bindBuffer(gl2.ARRAY_BUFFER, normalBuffer);
			gl2.bufferData(gl2.ARRAY_BUFFER, normals, gl2.STATIC_DRAW);
			gl2.enableVertexAttribArray(support.in.vNormal);
			gl2.vertexAttribPointer(support.in.vNormal, 3, gl2.FLOAT, false, 0, 0);

			const indexBuffer = gl2.createBuffer();
			gl2.bindBuffer(gl2.ELEMENT_ARRAY_BUFFER, indexBuffer);
			gl2.bufferData(gl2.ELEMENT_ARRAY_BUFFER, this.faces, gl2.STATIC_DRAW);

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
			gl2.drawElements(gl2.TRIANGLES, 36, gl2.UNSIGNED_SHORT, 0);
			gl2.bindVertexArray(null);
		}

		public collisionDetection(cd: CollisionDetection): number {
			return cd.collisionDetectionTriangles(this.verts, this.faces);
		}
	}

	Luminus.models.cube = Cube;
})();
