(() => {
	Luminus.states.state = class State implements LuminusState {
		public matrix: Float32Array;
		public x = 0;
		public y = 0;
		public z = 0;

		constructor() {
			this.matrix = Luminus.matrix.identity4();
		}

		public update() {
			Luminus.matrix.translation4(this.x, this.y, this.z, this.matrix); // Move
		}
	};
})();
