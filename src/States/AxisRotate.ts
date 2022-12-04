(() => {
	Luminus.states.axisRotate = class AxisRotate extends Luminus.states.state implements LuminusStateAxisRotate {
		public cx: number = 0;
		public cy: number = 0;
		public cz: number = 0;

		public xAxis: number = 0;
		public yAxis: number = 0;
		public zAxis: number = 0;

		public roll: number = 0;
		public pitch: number = 0;
		public yaw: number = 0;

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
