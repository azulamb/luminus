/**
 * MagicalVoxel model
 * MagicalVoxel is Z-up right-handed system.
 * Luminus is Y-up right-handed system.
 * This component convert position.
 *   ( x, y, z ) => ( y, z, x )
 */

((script, init) => {
	customElements.whenDefined((script.dataset.prefix || 'lu') + '-world').then(() => {
		init(script);
	});
})(<HTMLScriptElement> document.currentScript, (script: HTMLScriptElement) => {
	((component, prefix = 'lu') => {
		const tagname = prefix + '-vox';
		if (customElements.get(tagname)) {
			return;
		}
		customElements.define(tagname, component);
	})(
		class extends Luminus.model implements LuminusModelVoxElement {
			public model: LuminusModelVox;

			constructor() {
				super();

				const model = <LuminusModelVox> new Luminus.models.vox();
				model.afterload = () => {
					this.rerender();
				};
				this.model = model;
				if (this.src) {
					this.load();
				}
			}

			get src() {
				return this.getAttribute('src') || '';
			}
			set src(value) {
				const old = this.src;
				if (old === value) {
					return;
				}
				this.setAttribute('src', value);
				this.load();
			}

			public load(init?: RequestInit) {
				const url = this.src;
				if (!url) {
					return;
				}
				this.model.load(fetch(url, init)).then(() => {
					this.rerender();
				});
			}

			public import(file: File) {
				return new Promise<void>((resolve, reject) => {
					const reader = new FileReader();
					reader.onload = () => {
						const data = <ArrayBuffer> reader.result;
						const response = new Response(data);
						this.model.load(Promise.resolve(response)).then(() => {
							this.rerender();
							resolve();
						});
					};
					reader.onerror = reject;
					reader.onabort = reject;
					reader.readAsArrayBuffer(file);
				}).then(() => {
					return this;
				});
			}

			public export() {
				return this.model.export();
			}

			static get observedAttributes() {
				return ['src', ...Luminus.model.observedAttributes];
			}

			// deno-lint-ignore no-explicit-any
			public attributeChangedCallback(attrName: string, oldVal: any, newVal: any) {
				if (oldVal === newVal) {
					return;
				}
				switch (attrName) {
					case 'src':
						// TODO:
						break;
					default:
						super.attributeChangedCallback(attrName, oldVal, newVal);
				}
			}
		},
		script.dataset.prefix,
	);
});
