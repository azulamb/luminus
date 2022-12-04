interface LuminusWorldDefault extends LuminusWorld {
	eye: {
		x: number;
		y: number;
		z: number;
	};
	center: {
		x: number;
		y: number;
		z: number;
	};
	up: {
		x: number;
		y: number;
		z: number;
	};
	light: {
		x: number;
		y: number;
		z: number;
		color: Float32Array;
		ambient: Float32Array;
	};
	screen: {
		left: number;
		right: number;
		bottom: number;
		top: number;
		near: number;
		far: number;
	};
}

(() => {
	Luminus.world = class implements LuminusWorldDefault {
		public eye = { x: 0, y: 0, z: 0 };
		public center = { x: 0, y: 0, z: 0 };
		public up = { x: 0, y: 0, z: 0 };
		public light = {
			x: 0,
			y: 0,
			z: 0,
			color: new Float32Array([0, 0, 0]),
			ambient: new Float32Array([0, 0, 0]),
		};
		public screen = {
			left: 0,
			right: 0,
			bottom: 0,
			top: 0,
			near: 0,
			far: 0,
		};
		public support: LuminusSupport;

		// Matrix
		private uProjection: Float32Array;
		private uView: Float32Array;
		private uModel: Float32Array;
		private iModel: Float32Array;

		public async init(support: LuminusSupport) {
			this.support = support;

			const vertex = `#version 300 es
in vec3 vPosition;
in vec4 vColor;
in vec3 vNormal;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;
uniform vec3 lColor;
uniform vec3 aColor;
uniform float lMin;
uniform vec3 lDirection;
uniform mat4 iModel;
out lowp vec4 oColor;
void main(void) {
	gl_Position = uProjection * uView * uModel * vec4(vPosition, 1.0);

	vec3 invLight = normalize( iModel * vec4( lDirection, 0.0 ) ).xyz;
	float diffuse = lMin + ( 1.0 - lMin ) * clamp( dot( vNormal, invLight ), 0.0, 1.0 );
	oColor = vColor * vec4( vec3( diffuse ), 1.0 ) + vec4( aColor.xyz, 0 ) * vColor.w;
}`;
			const fragment = `#version 300 es
in lowp vec4 oColor;
out lowp vec4 outColor;
void main(void) {
	outColor = oColor;
}`;

			await support.init(
				<HTMLScriptElement> document.getElementById('vertex') || vertex,
				<HTMLScriptElement> document.getElementById('fragment') || fragment,
			);

			support.enables(support.gl.DEPTH_TEST, support.gl.CULL_FACE);

			// TODO: frustum
			this.uProjection = support.orthographic(
				this.screen.left,
				this.screen.right,
				this.screen.bottom,
				this.screen.top,
				this.screen.near,
				this.screen.far,
			);
			this.uView = support.matrix.identity4();
			this.uModel = support.matrix.identity4();
			this.iModel = support.matrix.identity4();
		}

		public beginRender() {
			const gl2 = this.support.gl;

			this.support.matrix.lookAt(
				[this.eye.x, this.eye.y, this.eye.z],
				[this.center.x, this.center.y, this.center.z],
				[this.up.x, this.up.y, this.up.z],
				this.uView,
			);
			//Luminus.matrix.inverse4(this.uView, this.uView);
			//this.support.gl.viewport();

			// TODO: move Support.
			gl2.useProgram(this.support.program);

			//const pv = Luminus.matrix.multiply4(this.uProjection,this.uView);
			//gl2.uniformMatrix4fv(this.support.uniform.uProjection, false, pv);
			//gl2.uniformMatrix4fv(this.support.uniform.uView, false, Luminus.matrix.identity4());
			gl2.uniformMatrix4fv(this.support.uniform.uProjection, false, this.uProjection);
			gl2.uniformMatrix4fv(this.support.uniform.uView, false, this.uView);
			gl2.uniformMatrix4fv(this.support.uniform.uModel, false, this.uModel);

			// Light.
			gl2.uniform3f(this.support.uniform.lDirection, this.light.x, this.light.y, this.light.z);
			gl2.uniform3fv(this.support.uniform.lColor, this.light.color);
			gl2.uniform3fv(this.support.uniform.aColor, this.light.ambient);
			gl2.uniformMatrix4fv(this.support.uniform.iModel, false, this.iModel);

			this.support.clear();
		}

		public modelRender(model: LuminusModelRender<unknown>) {
			const gl2 = this.support.gl;

			/*const r = this.support.matrix.rotation4(model.roll + model.xaxis, model.pitch + model.yaxis, model.yaw + model.zaxis);
			[
				this.support.matrix.translation4(model.x, model.y, model.z), // Move
				r, // Rotate model
				this.support.matrix.translation4(-model.cx, -model.cy, -model.cz), // Move center
			].reduce((p, n) => {
				return this.support.matrix.multiply4(n, p, this.uModel);
			}, this.support.matrix.identity4());*/
			model.copyMatrix(this.uModel);

			gl2.uniformMatrix4fv(this.support.uniform.uModel, false, this.uModel);

			this.support.matrix.inverse4(this.uModel, this.iModel);
			gl2.uniformMatrix4fv(this.support.uniform.iModel, false, this.iModel);
			gl2.uniform1f(this.support.uniform.lMin, model.model.lMin === undefined ? 0.3 : model.model.lMin);

			model.render(this);
		}

		public endRender() {
			this.support.gl.flush();
		}

		public unProject(viewport: Int32Array, screenX: number, screenY: number, z: number = 1): Float32Array {
			const x = (screenX - viewport[0]) * 2 / viewport[2] - 1;
			const y = 1 - (screenY - viewport[1]) * 2 / viewport[3];

			const position = Luminus.matrix.unProject(
				new Float32Array([x, y, z, 1.0]),
				this.uProjection,
				this.uView,
			);

			return position;
		}
	};
})();
