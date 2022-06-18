(() => {
	Luminus.ray = class implements LuminusRay {
		protected origin: Float32Array;
		protected vector: Float32Array;

		constructor(x: number, y: number, z: number, vx: number, vy: number, vz: number);
		constructor(origin: Float32Array, vector: Float32Array);
		constructor(x: number | Float32Array, y: number | Float32Array, z?: number, vx?: number, vy?: number, vz?: number) {
			this.origin = new Float32Array(3);
			this.vector = new Float32Array(3);
			if (typeof x === 'number') {
				this.setOrigin(x, <number> y, <number> z);
				this.setVector(<number> vx, <number> vy, <number> vz);
			} else {
				this.setOrigin(x);
				this.setVector(<Float32Array> y);
			}
		}

		public setOrigin(x: number, y: number, z: number): this;
		public setOrigin(origin: Float32Array): this;
		setOrigin(x: Float32Array | number, y?: number, z?: number): this {
			if (typeof x === 'number') {
				this.origin[0] = x;
				this.origin[1] = <number> y;
				this.origin[2] = <number> z;
			} else {
				this.origin[0] = x[0];
				this.origin[1] = x[1];
				this.origin[2] = x[2];
			}
			return this;
		}

		public setVector(x: number, y: number, z: number): this;
		public setVector(vector: Float32Array): this;
		public setVector(x: Float32Array | number, y?: number, z?: number): this {
			if (typeof x === 'number') {
				this.vector[0] = <number> x;
				this.vector[1] = <number> y;
				this.vector[2] = <number> z;
			} else {
				this.vector[0] = <number> x[0];
				this.vector[1] = <number> x[1];
				this.vector[2] = <number> x[2];
			}
			Luminus.matrix.normalize3(this.vector, this.vector);
			return this;
		}

		protected include(a: Float32Array, b: Float32Array, c: Float32Array) {
			return a[0] * b[1] * c[2] + a[1] * b[2] * c[0] + a[2] * b[0] * c[1] -
				a[0] * b[2] * c[1] - a[1] * b[0] * c[2] - a[2] * b[1] * c[0];
		}

		public rayCast(triangle: Float32Array, position?: Float32Array): number {
			if (!position) {
				position = new Float32Array(3);
			}
			const ray = new Float32Array([-1 * this.vector[0], -1 * this.vector[1], -1 * this.vector[2]]);
			// vertex 1 -> 0
			const edge1 = new Float32Array([
				triangle[3] - triangle[0],
				triangle[4] - triangle[1],
				triangle[5] - triangle[2],
			]);
			// vertex 2 -> 0
			const edge2 = new Float32Array([
				triangle[6] - triangle[0],
				triangle[7] - triangle[1],
				triangle[8] - triangle[2],
			]);

			const denominator = this.include(edge1, edge2, ray);
			if (denominator <= 0) {
				return Infinity;
			}

			const d = new Float32Array([
				this.origin[0] - triangle[0],
				this.origin[1] - triangle[1],
				this.origin[2] - triangle[2],
			]);

			const u = this.include(d, edge2, ray) / denominator;
			if (0 <= u && u <= 1) {
				const v = this.include(edge1, d, ray) / denominator;
				if (0 <= v && u + v <= 1) {
					const distance = this.include(edge1, edge2, d) / denominator;

					if (distance < 0) {
						return Infinity;
					}

					position[0] = this.origin[0] + ray[0] * distance;
					position[1] = this.origin[1] + ray[1] * distance;
					position[2] = this.origin[2] + ray[2] * distance;

					return distance;
				}
			}

			return Infinity;
		}

		public collisionDetectionTriangles(verts: Float32Array, faces: Uint16Array): number {
			let min = Infinity;
			const triangle = new Float32Array(9);

			for (let i = 0; i < faces.length; i += 3) {
				const a = faces[i] * 3;
				triangle[0] = verts[a];
				triangle[1] = verts[a + 1];
				triangle[2] = verts[a + 2];
				const b = faces[i + 1] * 3;
				triangle[3] = verts[b];
				triangle[4] = verts[b + 1];
				triangle[5] = verts[b + 2];
				const c = faces[i + 2] * 3;
				triangle[6] = verts[c];
				triangle[7] = verts[c + 1];
				triangle[8] = verts[c + 2];
				const distance = this.rayCast(triangle);
				if (distance < min) {
					min = distance;
				}
			}

			return min;
		}
	};
})();
