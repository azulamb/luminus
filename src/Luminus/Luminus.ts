/// <reference path="../types.d.ts" />

((script) => {
	const loaded = Promise.all(
		[
			customElements.whenDefined('lu-world'),
			customElements.whenDefined('lu-model'),
		],
	).then(() => {});

	const luminus: LuminusBrowser = {
		version: '',
		console: console,
		loaded: loaded,
		// deno-lint-ignore no-explicit-any
		matrix: <any> null,
		// deno-lint-ignore no-explicit-any
		model: <any> null,
		// deno-lint-ignore no-explicit-any
		models: <any> {},
		// deno-lint-ignore no-explicit-any
		states: <any> {},
		// deno-lint-ignore no-explicit-any
		world: <any> null,
		createSupport: () => {
			// deno-lint-ignore no-explicit-any
			return <any> null;
		},
		// deno-lint-ignore no-explicit-any
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

	// deno-lint-ignore no-explicit-any
	(<any> window).Luminus = luminus;
})(<HTMLScriptElement> document.currentScript);
