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

			constructor() {
				super();

				const shadow = this.attachShadow({ mode: 'open' });

				shadow.appendChild(this.initStyle());
			}

			public initStyle() {
				const style = document.createElement('style');
				style.innerHTML = [
					':host { display: none; }',
				].join('');

				return style;
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
			}

			get cy() {
				return parseFloat(this.getAttribute('cy') || '0') || 0;
			}
			set cy(value) {
				this.setAttribute('cy', value + '');
			}

			get cz() {
				return parseFloat(this.getAttribute('cz') || '0') || 0;
			}
			set cz(value) {
				this.setAttribute('cz', value + '');
			}

			get xaxis() {
				return parseFloat(this.getAttribute('xaxis') || '0') || 0;
			}
			set xaxis(value) {
				this.setAttribute('xaxis', value + '');
			}

			get yaxis() {
				return parseFloat(this.getAttribute('yaxis') || '0') || 0;
			}
			set yaxis(value) {
				this.setAttribute('yaxis', value + '');
			}

			get zaxis() {
				return parseFloat(this.getAttribute('zaxis') || '0') || 0;
			}
			set zaxis(value) {
				this.setAttribute('zaxis', value + '');
			}

			get x() {
				return parseFloat(this.getAttribute('x') || '0') || 0;
			}
			set x(value) {
				this.setAttribute('x', value + '');
			}

			get y() {
				return parseFloat(this.getAttribute('y') || '0') || 0;
			}
			set y(value) {
				this.setAttribute('y', value + '');
			}

			get z() {
				return parseFloat(this.getAttribute('z') || '0') || 0;
			}
			set z(value) {
				this.setAttribute('z', value + '');
			}

			get roll() {
				return parseFloat(this.getAttribute('roll') || '0') || 0;
			}
			set roll(value) {
				this.setAttribute('roll', value + '');
			}

			get pitch() {
				return parseFloat(this.getAttribute('pitch') || '0') || 0;
			}
			set pitch(value) {
				this.setAttribute('pitch', value + '');
			}

			get yaw() {
				return parseFloat(this.getAttribute('yaw') || '0') || 0;
			}
			set yaw(value) {
				this.setAttribute('yaw', value + '');
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
