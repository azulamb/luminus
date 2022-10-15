((script, init) => {
	customElements.whenDefined((script.dataset.prefix || 'lu') + '-world').then(() => {
		init(script);
	});
})(<HTMLScriptElement> document.currentScript, (script: HTMLScriptElement) => {
	((component, prefix = 'lu') => {
		const tagname = prefix + '-line';
		if (customElements.get(tagname)) {
			return;
		}
		customElements.define(tagname, component);
	})(
		class extends Luminus.model implements LuminusModelLineElement {
			private _updatePosition?: number;

			constructor() {
				super();

				const model = <LuminusModelLine> new Luminus.models.line();
				this.model = model;

				this.updatePosition();
				// TODO: update color.
			}

			private updatePosition() {
				if (this._updatePosition) {
					clearTimeout(this._updatePosition);
				}
				this._updatePosition = setTimeout(() => {
					(<LuminusModelLine> this.model).start(this.sx, this.sy, this.sz).end(this.ex, this.ey, this.ez);

					this._updatePosition = 0;
					this.rerender();
				}, 0);
			}

			get sx() {
				return parseFloat(this.getAttribute('sx') || '') || 0;
			}
			set sx(value) {
				const n = typeof value === 'number' ? value : parseFloat(value);
				this.setAttribute('sx', n + '');
			}

			get sy() {
				return parseFloat(this.getAttribute('sy') || '') || 0;
			}
			set sy(value) {
				const n = typeof value === 'number' ? value : parseFloat(value);
				this.setAttribute('sy', n + '');
			}

			get sz() {
				return parseFloat(this.getAttribute('sz') || '') || 0;
			}
			set sz(value) {
				const n = typeof value === 'number' ? value : parseFloat(value);
				this.setAttribute('sz', n + '');
			}

			get ex() {
				return parseFloat(this.getAttribute('ex') || '') || 0;
			}
			set ex(value) {
				const n = typeof value === 'number' ? value : parseFloat(value);
				this.setAttribute('ex', n + '');
			}

			get ey() {
				return parseFloat(this.getAttribute('ey') || '') || 0;
			}
			set ey(value) {
				const n = typeof value === 'number' ? value : parseFloat(value);
				this.setAttribute('ey', n + '');
			}

			get ez() {
				return parseFloat(this.getAttribute('ez') || '') || 0;
			}
			set ez(value) {
				const n = typeof value === 'number' ? value : parseFloat(value);
				this.setAttribute('ez', n + '');
			}

			start(x: number, y: number, z: number) {
				this.sx = x;
				this.sy = y;
				this.sz = z;

				return this;
			}

			end(x: number, y: number, z: number) {
				this.ex = x;
				this.ey = y;
				this.ez = z;

				return this;
			}

			public color(r: number, g: number, b: number): this;
			public color(r: number, g: number, b: number, a: number): this;
			public color(r0: number, g0: number, b0: number, r1: number, g1: number, b1: number): this;
			public color(r0: number, g0: number, b0: number, a0: number, r1: number, g1: number, b1: number, a1: number): this;
			color(r0: number, g0: number, b0: number, a0?: number, r1?: number, g1?: number, b1?: number, a1?: number) {
				return this;
			}

			static get observedAttributes() {
				return ['sx', 'sy', 'sz', 'ex', 'ey', 'ez'];
			}

			public attributeChangedCallback(attrName: string, oldVal: any, newVal: any) {
				if (oldVal === newVal) {
					return;
				}
				this.updatePosition();
			}
		},
		script.dataset.prefix,
	);
});
