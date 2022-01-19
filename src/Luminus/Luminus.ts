/// <reference path="../types.d.ts" />

( ( script ) =>
{
	const loaded = Promise.all(
	[
		customElements.whenDefined( 'lu-world' ),
		customElements.whenDefined( 'lu-model' ),
	] ).then( () => {} );

	const luminus: Luminus =
	{
		loaded: loaded,
		matrix: <any>null,
		model: <any>null,
		models: <any>{},
		createProgram: () => { return <any>null; },
		createSupport: () => { return <any>null; },
	};

	(<any>window).Luminus = luminus;
} )( <HTMLScriptElement>document.currentScript );
