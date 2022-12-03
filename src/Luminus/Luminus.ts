/// <reference path="../types.d.ts" />

((script) => {
	const loaded = Promise.all(
		[
			customElements.whenDefined('lu-world'),
			customElements.whenDefined('lu-model'),
		],
	).then(() => {});

	const luminus: Luminus = {
		version: '',
		console: console,
		loaded: loaded,
		matrix: <any> null,
		model: <any> null,
		models: <any> {},
		states: <any> {},
		program: <any> null,
		createSupport: () => {
			return <any> null;
		},
		ray: <any> null,
	};

	if (script.dataset.debug === undefined) {
		luminus.console = {
			debug: () => {},
			error: () => {},
			info: () => {},
			log: () => {},
			warn: () => {},
		};
	}

	(<any> window).Luminus = luminus;
})(<HTMLScriptElement> document.currentScript);
