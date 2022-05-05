((script, init) => {
	customElements.whenDefined((script.dataset.prefix || 'lu') + '-world').then(() => {
		init(script);
	});
})(<HTMLScriptElement> document.currentScript, (script: HTMLScriptElement) => {
	((component, prefix = 'lu') => {
		const tagname = prefix + '-cube';
		if (customElements.get(tagname)) {
			return;
		}
		customElements.define(tagname, component);
	})(
		class extends Luminus.model implements LuminusModelCubeElement {
			constructor() {
				super();

				const model = <LuminusModelCube> new Luminus.models.cube();
				const color = this.color;
				model.color[0] = color[0];
				model.color[1] = color[1];
				model.color[2] = color[2];
				model.color[3] = color[3];
				model.load();

				this.model = model;
			}

			public initStyle() {
				const style = document.createElement('style');
				style.innerHTML = [
					':host { display: none; color: #99ccfd; }',
				].join('');

				return style;
			}

			get color(): number[] {
				return (window.getComputedStyle(this, '').color
					.replace(/\s/g, '')
					.replace(/rgba{0,1}\(([0-9\.\,]+)\)/, '$1') + ',1').split(',')
					.slice(0, 4)
					.map((v, i) => {
						return i === 3 ? parseFloat(v) : parseInt(v) / 255.0;
					});
			}

			get length() {
				return (<LuminusModelAxis> this.model).length;
			}
			set length(value) {
				const length = typeof value === 'number' ? value : parseFloat(value);
				(<LuminusModelAxis> this.model).length = length;
				this.setAttribute('length', length + '');
				this.rerender();
			}

			static get observedAttributes() {
				return ['length'];
			}

			public attributeChangedCallback(attrName: string, oldVal: any, newVal: any) {
				if (oldVal === newVal) {
					return;
				}
				this.length = newVal;
			}
		},
		script.dataset.prefix,
	);
});
