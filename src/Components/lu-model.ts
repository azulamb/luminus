/// <reference path="../Models/Model.ts" />

((script, init) => {
	if (document.readyState !== 'loading') {
		return init(script);
	}
	document.addEventListener('DOMContentLoaded', () => {
		init(script);
	});
})(<HTMLScriptElement> document.currentScript, (script: HTMLScriptElement) => {
	((component, prefix = 'lu') => {
		const tagname = prefix + '-model';
		if (customElements.get(tagname)) {
			return;
		}
		customElements.define(tagname, component);
		customElements.whenDefined(tagname).then(() => {
			Luminus.model = <{ new (...params: any[]): LuminusModelElement }> (customElements.get(tagname));
		});
	})(
		class extends HTMLElement implements LuminusModelElement {
			private _model: LuminusModel<unknown>;
			protected _matrix: Float32Array;
			protected _timer: number = 0;

			constructor() {
				super();

				const shadow = this.attachShadow({ mode: 'open' });

				shadow.appendChild(this.initStyle());
				this._matrix = Luminus.matrix.identity4();
				this.updateMatrix(true);
			}

			public initStyle() {
				const style = document.createElement('style');
				style.innerHTML = [
					':host { display: none; }',
				].join('');

				return style;
			}

			public copyMatrix(out: Float32Array) {
				out.set(this._matrix);
			}

			public updateMatrix(sync = false) {
				if (this._timer) {
					clearTimeout(this._timer);
				}
				if (sync) {
					return this.onUpdateMatrix();
				}
				this._timer = setTimeout(() => {
					this.onUpdateMatrix();
				}, 0);
			}

			protected onUpdateMatrix() {
				[
					Luminus.matrix.translation4(this.x, this.y, this.z), // Move
					Luminus.matrix.rotation4(this.roll + this.xaxis, this.pitch + this.yaxis, this.yaw + this.zaxis), // Rotate model
					Luminus.matrix.translation4(-this.cx, -this.cy, -this.cz), // Move center
				].reduce((p, n) => {
					return Luminus.matrix.multiply4(n, p, this._matrix);
				}, Luminus.matrix.identity4()); // TODO: change first matrix.
			}

			public collisionDetection(cd: CollisionDetection) {
				const tmp = cd.clone();
				tmp.transform(Luminus.matrix.inverse4(this._matrix));
				return this.model.collisionDetection(tmp);
			}

			get model() {
				return this._model;
			}
			set model(model: LuminusModel<unknown>) {
				this._model = model;
				model.afterload = () => {
					const program = this.program;
					if (program) {
						model.prepare(program);
					}
				};
			}

			get selectable() {
				return this.hasAttribute('selectable');
			}
			set selectable(value) {
				if (!value) {
					this.removeAttribute('selectable');
				} else {
					this.setAttribute('selectable', '');
				}
			}

			get cx() {
				return parseFloat(this.getAttribute('cx') || '0') || 0;
			}
			set cx(value) {
				this.setAttribute('cx', value + '');
				this.updateMatrix();
			}

			get cy() {
				return parseFloat(this.getAttribute('cy') || '0') || 0;
			}
			set cy(value) {
				this.setAttribute('cy', value + '');
				this.updateMatrix();
			}

			get cz() {
				return parseFloat(this.getAttribute('cz') || '0') || 0;
			}
			set cz(value) {
				this.setAttribute('cz', value + '');
				this.updateMatrix();
			}

			get xaxis() {
				return parseFloat(this.getAttribute('xaxis') || '0') || 0;
			}
			set xaxis(value) {
				this.setAttribute('xaxis', value + '');
				this.updateMatrix();
			}

			get yaxis() {
				return parseFloat(this.getAttribute('yaxis') || '0') || 0;
			}
			set yaxis(value) {
				this.setAttribute('yaxis', value + '');
				this.updateMatrix();
			}

			get zaxis() {
				return parseFloat(this.getAttribute('zaxis') || '0') || 0;
			}
			set zaxis(value) {
				this.setAttribute('zaxis', value + '');
				this.updateMatrix();
			}

			get x() {
				return parseFloat(this.getAttribute('x') || '0') || 0;
			}
			set x(value) {
				this.setAttribute('x', value + '');
				this.updateMatrix();
			}

			get y() {
				return parseFloat(this.getAttribute('y') || '0') || 0;
			}
			set y(value) {
				this.setAttribute('y', value + '');
				this.updateMatrix();
			}

			get z() {
				return parseFloat(this.getAttribute('z') || '0') || 0;
			}
			set z(value) {
				this.setAttribute('z', value + '');
				this.updateMatrix();
			}

			get roll() {
				return parseFloat(this.getAttribute('roll') || '0') || 0;
			}
			set roll(value) {
				this.setAttribute('roll', value + '');
				this.updateMatrix();
			}

			get pitch() {
				return parseFloat(this.getAttribute('pitch') || '0') || 0;
			}
			set pitch(value) {
				this.setAttribute('pitch', value + '');
				this.updateMatrix();
			}

			get yaw() {
				return parseFloat(this.getAttribute('yaw') || '0') || 0;
			}
			set yaw(value) {
				this.setAttribute('yaw', value + '');
				this.updateMatrix();
			}

			get complete() {
				return this.model && this.model.complete === true;
			}

			get program() {
				return (<LuminusWorldElement | null> this.parentElement)?.program;
			}

			public render(program: LuminusProgram) {
				this.model.render(program);
			}

			public rerender() {
				this.dispatchEvent(new CustomEvent('render'));
			}
		},
		script.dataset.prefix,
	);
});
