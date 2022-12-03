(() => {
	Luminus.states.state = class State implements LuminusState {
		public matrix: Float32Array;
		public x: number = 0;
		public y: number = 0;
		public z: number = 0;

		constructor() {
			this.matrix = Luminus.matrix.identity4();
		}

		public update() {
			Luminus.matrix.translation4(this.x, this.y, this.z, this.matrix); // Move
		}
	};
})();
