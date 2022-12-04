((script, init) => {
	customElements.whenDefined((script.dataset.prefix || 'lu') + '-world').then(() => {
		init(script);
	});
})(<HTMLScriptElement> document.currentScript, (script: HTMLScriptElement) => {
	((component, prefix = 'lu') => {
		const tagname = prefix + '-axis';
		if (customElements.get(tagname)) {
			return;
		}
		customElements.define(tagname, component);
	})(
		class extends Luminus.model implements LuminusModelAxisElement {
			public model: LuminusModelAxis;

			constructor() {
				super();

				const model = <LuminusModelAxis> new Luminus.models.axis();
				this.model = model;

				setTimeout(() => {
					if (this.hasAttribute('length')) {
						model.length = this.length;
					} else {
						this.length = model.length;
					}
				}, 0);
			}

			get length() {
				return this.model.length;
			}
			set length(value) {
				const length = typeof value === 'number' ? value : parseFloat(value);
				this.model.length = length;
				this.setAttribute('length', length + '');
				this.rerender();
			}

			static get observedAttributes() {
				return ['length', ...Luminus.model.observedAttributes];
			}

			// deno-lint-ignore no-explicit-any
			public attributeChangedCallback(attrName: string, oldVal: any, newVal: any) {
				if (oldVal === newVal) {
					return;
				}
				switch (attrName) {
					case 'length':
						this.length = newVal;
						break;
					default:
						super.attributeChangedCallback(attrName, oldVal, newVal);
				}
			}
		},
		script.dataset.prefix,
	);
});
