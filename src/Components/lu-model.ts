/// <reference path="../Models/Model.ts" />

( ( script, init ) =>
{
	if ( document.readyState !== 'loading' ) { return init( script ); }
	document.addEventListener( 'DOMContentLoaded', () => { init( script ); } );
} )( <HTMLScriptElement>document.currentScript, ( script: HTMLScriptElement ) =>
{
	( ( component, prefix = 'lu' ) =>
	{
		const tagname = prefix + '-model';
		if ( customElements.get( tagname ) ) { return; }
		customElements.define( tagname, component );
		customElements.whenDefined( tagname ).then( () =>
		{
			Luminus.model = <{ new (...params: any[]): LuminusModelElement; }>( customElements.get( tagname ) );
		} );
	} )( class extends HTMLElement implements LuminusModelElement
	{
		private _model: LuminusModel;

		constructor()
		{
			super();

			const shadow = this.attachShadow( { mode: 'open' } );

			shadow.appendChild( this.initStyle() );
		}

		public initStyle()
		{
			const style = document.createElement( 'style' );
			style.innerHTML =
			[
				':host { display: none; }',
			].join( '' );

			return style;
		}

		get model() { return this._model; }
		set model( model: LuminusModel )
		{
			this._model = model;
			model.afterload = () =>
			{
				const support = this.support;
				if ( support ) { model.prepare( support ); }
			};
		}

		get complete() { return this.model && this.model.complete === true; }

		get support()
		{
			return (<LuminusWorldElement | null>this.parentElement)?.support;
		}

		public render( support: LuminusSupport )
		{
			this.model.render( support );
		}

		public rerender()
		{
			this.dispatchEvent( new CustomEvent( 'render' ) );
		}

	}, script.dataset.prefix );
} );
