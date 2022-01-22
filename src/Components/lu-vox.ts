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
		const tagname = prefix + '-vox';
		if ( customElements.get( tagname ) ) { return; }
		customElements.define( tagname, component );
	} )( class extends Luminus.model implements LuminusModelVoxElement
	{
		public model: LuminusModelVox;

		constructor()
		{
			super();

			const model =  <LuminusModelVox>new Luminus.models.vox();
			model.afterload = () => { this.rerender(); };
			this.model = model;
			if ( this.src )
			{
				this.load();
			}
		}

		get src() { return this.getAttribute( 'src' ) || ''; }
		set src( value )
		{
			const old = this.src;
			if ( old === value ) { return; }
			this.setAttribute( 'src', value );
			this.load();
		}

		public load( init?: RequestInit )
		{
			const url = this.src;
			if ( !url ) { return; }
			this.model.load( fetch( url, init ) ).then( () => { this.rerender(); } );
		}

		public toVox()
		{
			return this.model.export();
		}

		static get observedAttributes() { return [ 'src' ]; }

		public attributeChangedCallback( attrName: string, oldVal: any , newVal: any )
		{
			if ( oldVal === newVal ) { return; }
		}
	}, script.dataset.prefix );
} );
