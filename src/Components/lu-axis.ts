( ( script, init ) =>
{
	customElements.whenDefined( ( script.dataset.prefix || 'lu' ) + '-world' ).then( () =>
	{
		init( script );
	} );
} )( <HTMLScriptElement>document.currentScript, ( script: HTMLScriptElement ) =>
{
	( ( component, prefix = 'lu' ) =>
	{
		const tagname = prefix + '-axis';
		if ( customElements.get( tagname ) ) { return; }
		customElements.define( tagname, component );
	} )( class extends Luminus.model implements LuminusModelAxisElement
	{
		constructor()
		{
			super();

			const model = <LuminusModelAxis>new Luminus.models.axis();
			this.model = model;

			if ( this.hasAttribute( 'length' ) )
			{
				model.length = this.length;
			} else
			{
				this.length = model.length;
			}
		}

		get length() { return (<LuminusModelAxis>this.model).length; }
		set length( value )
		{
			const length = typeof value === 'number' ? value : parseFloat( value );
			(<LuminusModelAxis>this.model).length = length;
			this.setAttribute( 'length', length + '' );
			this.rerender();
		}

		static get observedAttributes() { return [ 'length' ]; }

		public attributeChangedCallback( attrName: string, oldVal: any , newVal: any )
		{
			if ( oldVal === newVal ) { return; }
			this.length = newVal;
		}
	}, script.dataset.prefix );
} );
