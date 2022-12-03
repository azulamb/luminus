(() => {
	Luminus.states.state = class State implements LuminusState {
		public matrix: Float32Array;
		public x: number;
		public y: number;
		public z: number;

		constructor() {
			this.matrix = Luminus.matrix.identity4();
		}

		public update() {
			Luminus.matrix.translation4(this.x, this.y, this.z, this.matrix); // Move
		}
	};
})();
