/*
Format: https://github.com/ephtracy/voxel-model/blob/master/MagicaVoxel-file-format-vox.txt

*/

interface VoxChunkHeader {
	name: string;
	chunk: number;
	child: number;
}

interface VoxData {
	version: number;
	pack: number;
	models: {
		size: { x: number; y: number; z: number };
		count: number;
		xyzi: { x: number; y: number; z: number; c: number }[];
	}[];
	palette: Uint8Array[];
	unknows?: { name: string; chunk: number; child: number; data: Uint8Array }[];
}

(() => {
	class VoxReader {
		protected r: number = 0;

		constructor() {
		}

		public parse(data: Uint8Array, unknown = false) {
			this.r = 0;

			// vox
			const vox = this.readText(data, 4);
			if (vox !== 'VOX ') {
				throw new Error('Error: File format is not vox.');
			}

			const result: VoxData = {
				version: 0,
				pack: 1,
				models: [],
				palette: [],
			};
			if (unknown) {
				result.unknows = [];
			}

			// version.
			result.version = this.readInt(data);

			const chunk = {
				PACK: (header: VoxChunkHeader) => {
					return { models: this.readInt(data) };
				},
				SIZE: (header: VoxChunkHeader) => {
					return {
						x: this.readInt(data),
						y: this.readInt(data),
						z: this.readInt(data),
					};
				},
				XYZI: (header: VoxChunkHeader) => {
					const count = this.readInt(data);
					const boxes: { x: number; y: number; z: number; c: number }[] = [];
					for (let i = 0; i < count; ++i) {
						boxes.push(
							{
								x: this.readByte(data),
								y: this.readByte(data),
								z: this.readByte(data),
								c: this.readByte(data),
							},
						);
					}
					return {
						count: count,
						boxes: boxes,
					};
				},
				RGBA: (header: VoxChunkHeader) => {
					const palette: Uint8Array[] = [];
					const size = header.chunk / 4;
					for (let i = 0; i < size; ++i) {
						palette.push(this.read(data, 4));
					}

					return {
						palette: palette,
					};
				},
				UNKNOWN: (header: VoxChunkHeader) => {
					const d = this.read(data, header.chunk);
					return { ...header, data: d };
				},
			};

			while (true) {
				const header = this.readChunkHeader(data);
				if (!header.name) {
					break;
				}

				if (!(header.name in chunk)) {
					// Unknown chunk.
					const unknown = chunk.UNKNOWN(header);
					if (result.unknows) {
						result.unknows.push(unknown);
					}
				}

				switch (header.name) {
					case 'SIZE': {
						const size = chunk.SIZE(header);
						result.models.push(
							{
								size: size,
								count: 0,
								xyzi: [],
							},
						);
						break;
					}
					case 'XYZI': {
						const xyzi = chunk.XYZI(header);
						result.models[result.models.length - 1].count = xyzi.count;
						result.models[result.models.length - 1].xyzi = xyzi.boxes;
						break;
					}
					case 'RGBA': {
						const rgba = chunk.RGBA(header);
						result.palette = rgba.palette;
						break;
					}
				}
			}

			return result;
		}

		protected readChunkHeader(data: Uint8Array) {
			return {
				name: this.readText(data, 4),
				chunk: this.readInt(data),
				child: this.readInt(data),
			};
		}

		protected seek(seek: number) {
			this.r = seek;
		}

		protected next(next: number) {
			this.r += next;
		}

		protected read(data: Uint8Array, read: number) {
			const result = data.slice(this.r, this.r + read);
			this.r += read;
			return result;
		}

		protected readText(data: Uint8Array, read: number) {
			return new TextDecoder().decode(this.read(data, read));
		}

		protected readByte(data: Uint8Array) {
			const v = this.read(data, 1);
			return v[0];
		}

		protected readInt(data: Uint8Array) {
			const v = this.read(data, 4);
			return v[0] | (v[1] << 8) + (v[2] << 16) + (v[3] << 24);
		}
	}

	class Vox extends Luminus.models.model implements LuminusModelVox {
		public loaded?: boolean;
		public complete?: boolean;
		public color: Float32Array = new Float32Array(4);

		protected vao: WebGLVertexArrayObject;
		protected verts: Float32Array;
		protected colors: Float32Array;
		protected normals: Float32Array;
		protected faces: Uint16Array;
		protected count: number;

		private vox: VoxData;

		public onload(result: Response) {
			if (!result.ok) {
				return Promise.resolve();
			}

			return result.blob().then((blob) => {
				return blob.arrayBuffer();
			}).then((buffer) => {
				const data = new Uint8Array(buffer);
				return (new VoxReader()).parse(data);
			}).then((vox) => {
				// optimization
				const palette: Uint8Array[] = [];

				vox.models.forEach((model) => {
					model.xyzi.forEach((voxel) => {
						const color = vox.palette[voxel.c - 1];
						let index = palette.indexOf(color);
						if (index < 0) {
							index = palette.length;
							palette.push(color);
						}
						voxel.c = index;
					});
				});

				vox.palette = palette;
				return vox;
			}).then((vox) => {
				this.vox = vox;

				const verts: number[] = [];
				const colors: number[] = [];
				const normals: number[] = [];
				const faces: number[] = [];

				const tmpFacef: ({
					v: number[];
					c: number;
					n: number[];
				} | null)[] = [];
				vox.models.forEach((model) => {
					model.xyzi.forEach((voxel) => {
						const x = voxel.y;
						const y = voxel.z;
						const z = voxel.x;
						tmpFacef.push(
							{
								v: [x, y, z + 1, x + 1, y, z + 1, x + 1, y + 1, z + 1, x, y + 1, z + 1],
								c: voxel.c,
								n: [0, 0, 1],
							},
							{
								v: [x, y, z, x, y + 1, z, x + 1, y + 1, z, x + 1, y, z],
								c: voxel.c,
								n: [0, 0, -1],
							},
							{
								v: [x, y + 1, z, x, y + 1, z + 1, x + 1, y + 1, z + 1, x + 1, y + 1, z],
								c: voxel.c,
								n: [0, 1, 0],
							},
							{
								v: [x, y, z, x + 1, y, z, x + 1, y, z + 1, x, y, z + 1],
								c: voxel.c,
								n: [0, -1, 0],
							},
							{
								v: [x + 1, y, z, x + 1, y + 1, z, x + 1, y + 1, z + 1, x + 1, y, z + 1],
								c: voxel.c,
								n: [1, 0, 0],
							},
							{
								v: [x, y, z, x, y, z + 1, x, y + 1, z + 1, x, y + 1, z],
								c: voxel.c,
								n: [-1, 0, 0],
							},
						);
					});
				});

				// Remove facing faces.
				tmpFacef.filter((face, index) => {
					if (!face) {
						return false;
					}
					for (let i = index + 1; i < tmpFacef.length; ++i) {
						const r = tmpFacef[i];
						if (!r || face.c !== r.c) {
							continue;
						}
						if (
							face.v[0] === r.v[0] && face.v[1] === r.v[1] && face.v[2] === r.v[2] &&
							face.v[3] === r.v[9] && face.v[4] === r.v[10] && face.v[5] === r.v[11] &&
							face.v[6] === r.v[6] && face.v[7] === r.v[7] && face.v[8] === r.v[8] &&
							face.v[9] === r.v[3] && face.v[10] === r.v[4] && face.v[11] === r.v[5]
						) {
							tmpFacef[index] = tmpFacef[i] = null;
							return false;
						}
					}
					return true;
				}).forEach((face: { v: number[]; c: number; n: number[] }) => {
					const n = verts.length / 3;
					const c = vox.palette[face.c];
					const color = [c[0] / 255.0, c[1] / 255.0, c[2] / 255.0, c[3] / 255.0];
					verts.push(...face.v);
					colors.push(...color, ...color, ...color, ...color);
					normals.push(...face.n, ...face.n, ...face.n, ...face.n);
					faces.push(n, n + 1, n + 2, n, n + 2, n + 3);
				});

				this.verts = new Float32Array(verts);
				this.colors = new Float32Array(colors);
				this.normals = new Float32Array(normals);
				this.faces = new Uint16Array(faces);
			});
		}

		public onprepare(program: LuminusProgram) {
			Luminus.console.info('Start: vox-prepare.');
			const gl2 = program.support.gl;

			const vao = gl2.createVertexArray();
			if (!vao) {
				return Promise.reject(new Error('Failure createVertexArray.'));
			}

			const support = program.support;

			gl2.bindVertexArray(vao);

			const positionBuffer = gl2.createBuffer();
			gl2.bindBuffer(gl2.ARRAY_BUFFER, positionBuffer);
			gl2.bufferData(gl2.ARRAY_BUFFER, this.verts, gl2.STATIC_DRAW);
			gl2.enableVertexAttribArray(support.in.vPosition);
			gl2.vertexAttribPointer(support.in.vPosition, 3, gl2.FLOAT, false, 0, 0);

			const colorBuffer = gl2.createBuffer();
			gl2.bindBuffer(gl2.ARRAY_BUFFER, colorBuffer);
			gl2.bufferData(gl2.ARRAY_BUFFER, this.colors, gl2.STATIC_DRAW);
			gl2.enableVertexAttribArray(support.in.vColor);
			gl2.vertexAttribPointer(support.in.vColor, 4, gl2.FLOAT, false, 0, 0);

			const normalBuffer = gl2.createBuffer();
			gl2.bindBuffer(gl2.ARRAY_BUFFER, normalBuffer);
			gl2.bufferData(gl2.ARRAY_BUFFER, this.normals, gl2.STATIC_DRAW);
			gl2.enableVertexAttribArray(support.in.vNormal);
			gl2.vertexAttribPointer(support.in.vNormal, 3, gl2.FLOAT, false, 0, 0);

			const indexBuffer = gl2.createBuffer();
			gl2.bindBuffer(gl2.ELEMENT_ARRAY_BUFFER, indexBuffer);
			gl2.bufferData(gl2.ELEMENT_ARRAY_BUFFER, this.faces, gl2.STATIC_DRAW);

			gl2.bindVertexArray(null);
			this.vao = vao;
			this.count = this.faces.length;

			return Promise.resolve();
		}

		public onrender(program: LuminusProgram) {
			const gl2 = program.support.gl;

			gl2.bindVertexArray(this.vao);
			gl2.drawElements(gl2.TRIANGLES, this.count, gl2.UNSIGNED_SHORT, 0);
			gl2.bindVertexArray(null);
		}

		public collisionDetection(cd: CollisionDetection): number {
			return cd.collisionDetectionTriangles(this.verts, this.faces);
		}

		public export() {
			const data: Uint8Array[] = [];

			// Vox header.
			data.push(strToBin('VOX '));
			data.push(intToBin(150));

			// MAIN
			data.push(createChunkHeader('MAIN', 0, 0)); // TODO: rewrite

			let size = 0;
			// Models
			this.vox.models.forEach((model) => {
				// SIZE
				data.push(createChunkHeader('SIZE', 12, 0));
				size += 12;
				data.push(intToBin(model.size.x));
				data.push(intToBin(model.size.y));
				data.push(intToBin(model.size.z));
				size += 12;

				// XYZI
				data.push(createChunkHeader('XYZI', model.xyzi.length * 4 + 4, 0));
				size += 12;
				data.push(intToBin(model.xyzi.length));
				size += 4;
				model.xyzi.forEach((voxel) => {
					data.push(new Uint8Array([voxel.x, voxel.y, voxel.z, voxel.c + 1]));
					size += 4;
				});

				size += 12;
			});

			// RGBA
			data.push(createChunkHeader('RGBA', 256 * 4, 0));
			data.push(...this.vox.palette);
			for (let i = this.vox.palette.length; i < 255; ++i) {
				data.push(new Uint8Array([0, 0, 0, 255]));
			}
			data.push(new Uint8Array([0, 0, 0, 0]));
			size += 256 * 4;

			setSize(data[2], size);

			const result = new Uint8Array(data.reduce((prev, now) => {
				return prev + now.length;
			}, 0));
			let offset = 0;
			for (const d of data) {
				result.set(d, offset);
				offset += d.length;
			}

			return result;
		}
	}

	function createChunkHeader(name: string, chunk: number, children: number) {
		const header = new Uint8Array(12);
		header.set(strToBin(name));
		header.set(intToBin(chunk), 4);
		header.set(intToBin(children), 8);
		return header;
	}

	function strToBin(str: string) {
		return new TextEncoder().encode(str);
	}

	function intToBin(n: number) {
		const result = new Uint8Array(4);

		result[0] = n & 0xff;
		result[1] = (n >>> 8) & 0xff;
		result[2] = (n >>> 16) & 0xff;
		result[3] = (n >>> 24) & 0xff;

		return result;
	}

	function setSize(main: Uint8Array, n: number) {
		main[8] = n & 0xff;
		main[9] = (n >>> 8) & 0xff;
		main[10] = (n >>> 16) & 0xff;
		main[11] = (n >>> 24) & 0xff;
	}

	Luminus.models.vox = Vox;
})();
