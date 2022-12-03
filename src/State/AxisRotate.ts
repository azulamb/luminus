(() => {
	Luminus.states.axisRotate = class AxisRotate extends Luminus.states.state implements LuminusStateAxisRotate {
		public cx: number;
		public cy: number;
		public cz: number;

		public xaxis: number;
		public yaxis: number;
		public zaxis: number;

		public roll: number;
		public pitch: number;
		public yaw: number;

		constructor() {
			super();
		}

		public update() {
			[
				Luminus.matrix.translation4(this.x, this.y, this.z), // Move
				Luminus.matrix.rotation4(this.roll + this.xaxis, this.pitch + this.yaxis, this.yaw + this.zaxis), // Rotate model
				Luminus.matrix.translation4(-this.cx, -this.cy, -this.cz), // Move center
			].reduce((p, n) => {
				return Luminus.matrix.multiply4(n, p, this.matrix);
			}, Luminus.matrix.identity4()); // TODO: change first matrix.
		}
	};
})();
