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
			// deno-lint-ignore no-explicit-any
			Luminus.model = <{ new (...params: any[]): LuminusModelElement; observedAttributes: string[] }> (customElements.get(tagname));
		});
	})(
		class extends HTMLElement implements LuminusModelElement {
			private _model: LuminusModel<unknown>;
			public state: LuminusStateAxisRotate;
			protected _timer = 0;

			constructor() {
				super();

				this.state = this.createState();

				const shadow = this.attachShadow({ mode: 'open' });

				shadow.appendChild(this.initStyle());
				this.updateMatrix(true);
			}

			public createState(): LuminusStateAxisRotate {
				return <LuminusStateAxisRotate> new Luminus.states.axisRotate();
			}

			public initStyle() {
				const style = document.createElement('style');
				style.innerHTML = [
					':host { display: block; }',
				].join('');

				return style;
			}

			public copyMatrix(out: Float32Array) {
				out.set(this.state.matrix);
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
					this.rerender();
				}, 0);
			}

			protected onUpdateMatrix() {
				this.state.update();
			}

			public collisionDetection(cd: CollisionDetection) {
				const tmp = cd.clone();
				tmp.transform(Luminus.matrix.inverse4(this.state.matrix));
				return this.model.collisionDetection(tmp);
			}

			get model() {
				return this._model;
			}
			set model(model: LuminusModel<unknown>) {
				this._model = model;
				model.afterload = () => {
					if ((<LuminusWorldElement | null> this.parentElement)?.complete) {
						model.prepare(<LuminusWorld> this.world);
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

			get x() {
				return parseFloat(this.getAttribute('x') || '0') || 0;
			}
			set x(value) {
				this.setAttribute('x', value + '');
				this.state.x = value;
				this.updateMatrix();
			}

			get y() {
				return parseFloat(this.getAttribute('y') || '0') || 0;
			}
			set y(value) {
				this.setAttribute('y', value + '');
				this.state.y = value;
				this.updateMatrix();
			}

			get z() {
				return parseFloat(this.getAttribute('z') || '0') || 0;
			}
			set z(value) {
				this.setAttribute('z', value + '');
				this.state.z = value;
				this.updateMatrix();
			}

			get cx() {
				return parseFloat(this.getAttribute('cx') || '0') || 0;
			}
			set cx(value) {
				this.setAttribute('cx', value + '');
				this.state.cx = value;
				this.updateMatrix();
			}

			get cy() {
				return parseFloat(this.getAttribute('cy') || '0') || 0;
			}
			set cy(value) {
				this.setAttribute('cy', value + '');
				this.state.cx = value;
				this.updateMatrix();
			}

			get cz() {
				return parseFloat(this.getAttribute('cz') || '0') || 0;
			}
			set cz(value) {
				this.setAttribute('cz', value + '');
				this.state.cx = value;
				this.updateMatrix();
			}

			get xAxis() {
				return parseFloat(this.getAttribute('xaxis') || '0') || 0;
			}
			set xAxis(value) {
				this.setAttribute('xaxis', value + '');
				this.state.xAxis = value;
				this.updateMatrix();
			}

			get yAxis() {
				return parseFloat(this.getAttribute('yaxis') || '0') || 0;
			}
			set yAxis(value) {
				this.setAttribute('yaxis', value + '');
				this.state.yAxis = value;
				this.updateMatrix();
			}

			get zAxis() {
				return parseFloat(this.getAttribute('zaxis') || '0') || 0;
			}
			set zAxis(value) {
				this.setAttribute('zaxis', value + '');
				this.state.zAxis = value;
				this.updateMatrix();
			}

			get roll() {
				return parseFloat(this.getAttribute('roll') || '0') || 0;
			}
			set roll(value) {
				this.setAttribute('roll', value + '');
				this.state.roll = value;
				this.updateMatrix();
			}

			get pitch() {
				return parseFloat(this.getAttribute('pitch') || '0') || 0;
			}
			set pitch(value) {
				this.setAttribute('pitch', value + '');
				this.state.pitch = value;
				this.updateMatrix();
			}

			get yaw() {
				return parseFloat(this.getAttribute('yaw') || '0') || 0;
			}
			set yaw(value) {
				this.setAttribute('yaw', value + '');
				this.state.yaw = value;
				this.updateMatrix();
			}

			get complete() {
				return this.model && this.model.complete === true;
			}

			get world() {
				return (<LuminusWorldElement | null> this.parentElement)?.world;
			}

			public render(world: LuminusWorld) {
				this.model.render(world);
			}

			public rerender() {
				this.dispatchEvent(new CustomEvent('render'));
			}

			static get observedAttributes() {
				return ['x', 'y', 'z', 'cx', 'cy', 'cz', 'x-axis', 'y-axis', 'z-axis', 'roll', 'pitch', 'yaw'];
			}

			// deno-lint-ignore no-explicit-any
			public attributeChangedCallback(attrName: string, oldVal: any, newVal: any) {
				if (oldVal === newVal) {
					return;
				}

				switch (attrName) {
					case 'x':
					case 'y':
					case 'z':
					case 'cx':
					case 'cy':
					case 'cz':
					case 'roll':
					case 'pitch':
					case 'yaw':
						this[attrName] = parseFloat(newVal);
						break;
					case 'x-axis':
						this.xAxis = parseFloat(newVal);
						break;
					case 'y-axis':
						this.yAxis = parseFloat(newVal);
						break;
					case 'z-axis':
						this.zAxis = parseFloat(newVal);
						break;
				}
			}
		},
		script.dataset.prefix,
	);
});
