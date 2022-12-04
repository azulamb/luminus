(() => {
	Luminus.states.axisRotate = class AxisRotate extends Luminus.states.state implements LuminusStateAxisRotate {
		public cx = 0;
		public cy = 0;
		public cz = 0;

		public xAxis = 0;
		public yAxis = 0;
		public zAxis = 0;

		public roll = 0;
		public pitch = 0;
		public yaw = 0;

		constructor() {
			super();
		}

		public update() {
			[
				Luminus.matrix.translation4(this.x, this.y, this.z), // Move
				Luminus.matrix.rotation4(this.roll + this.xAxis, this.pitch + this.yAxis, this.yaw + this.zAxis), // Rotate model
				Luminus.matrix.translation4(-this.cx, -this.cy, -this.cz), // Move center
			].reduce((p, n) => {
				return Luminus.matrix.multiply4(n, p, this.matrix);
			}, Luminus.matrix.identity4()); // TODO: change first matrix.
		}
	};
})();
