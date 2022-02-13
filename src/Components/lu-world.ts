/// <reference path="./lu-model.ts" />

( ( script, init ) =>
{
	customElements.whenDefined( ( script.dataset.prefix || 'lu' ) + '-model' ).then( () =>
	{
		init( script );
	} );
} )( <HTMLScriptElement>document.currentScript, ( script: HTMLScriptElement ) =>
{
	( ( component, prefix = 'lu' ) =>
	{
		const tagname = prefix + '-world';
		if ( customElements.get( tagname ) ) { return; }
		customElements.define( tagname, component );
	} )( class extends HTMLElement implements LuminusWorldElement
	{
		private _complete: boolean;
		private canvas: HTMLCanvasElement;
		private lProgram: LuminusProgram;

		constructor()
		{
			super();
			this._complete = false;

			const shadow = this.attachShadow( { mode: 'open' } );

			const style = document.createElement( 'style' );
			style.innerHTML =
			[
				':host { display: block; background: black; --light: white; --ambient: rgba( 255, 255, 255, 0 ); }',
				'canvas { display: block; width: 100%; height: 100%; }',
			].join( '' );

			this.canvas = document.createElement( 'canvas' );

			this.width = ( this.hasAttribute( 'width' ) ? ( parseInt( this.getAttribute( 'width' ) || '' ) ) : 0 ) || 400;
			this.height = ( this.hasAttribute( 'height' ) ? ( parseInt( this.getAttribute( 'height' ) || '' ) ) : 0 ) || 400;

			const contents = document.createElement( 'div' );
			contents.appendChild( this.canvas );

			shadow.appendChild( style );
			shadow.appendChild( contents );

			// TODO: autoload
			this.init().then( () =>
			{
				this.render();
			} );

			// Rerender
			( () =>
			{
				let timer: number;

				this.addEventListener( 'render', ( event ) =>
				{
					if ( timer ) { clearTimeout( timer ); }
					timer = setTimeout( () =>
					{
						this.render();
						timer = 0;
					}, 0 );
				}, true);
			} )();
		}

		get complete() { return this._complete; }

		get program() { return this.lProgram; }

		get width() { return this.canvas.width; }
		set width( value ) { this.canvas.width = typeof value === 'number' ? Math.floor( value) : ( parseInt( value ) || 0 ); }

		get height() { return this.canvas.height; }
		set height( value ) { this.canvas.height = typeof value === 'number' ? Math.floor( value) : ( parseInt( value ) || 0 ); }

		get top() { return parseFloat( this.getAttribute( 'top' ) || '' ) || 0; }
		set top( value ) { this.setAttribute( 'top', value + '' ); }

		get bottom() { return parseFloat( this.getAttribute( 'bottom' ) || '' ) || 0; }
		set bottom( value ) { this.setAttribute( 'bottom', value + '' ); }

		get left() { return parseFloat( this.getAttribute( 'left' ) || '' ) || 0; }
		set left( value ) { this.setAttribute( 'left', value + '' ); }

		get right() { return parseFloat( this.getAttribute( 'right' ) || '' ) || 0; }
		set right( value ) { this.setAttribute( 'right', value + '' ); }

		get near() { return parseFloat( this.getAttribute( 'near' ) || '' ) || 0; }
		set near( value ) { this.setAttribute( 'near', value + '' ); }

		get far() { return parseFloat( this.getAttribute( 'far' ) || '' ) || 0; }
		set far( value ) { this.setAttribute( 'far', value + '' ); }

		get view() { return this.getAttribute( 'view' ) === 'volume' ? 'volume' : 'frustum'; }
		set view( value ) { this.setAttribute( 'view', value === 'volume' ? 'volume' : 'frustum' ); }

		get eyex() { return parseFloat( this.getAttribute( 'eyex' ) || '' ) || 0; }
		set eyex( value ) { this.setAttribute( 'eyex', value + '' ); }

		get eyey() { return parseFloat( this.getAttribute( 'eyey' ) || '' ) || 0; }
		set eyey( value ) { this.setAttribute( 'eyey', value + '' ); }

		get eyez() { return parseFloat( this.getAttribute( 'eyez' ) || '' ) || 0; }
		set eyez( value ) { this.setAttribute( 'eyez', value + '' ); }

		get upx() { return parseFloat( this.getAttribute( 'upx' ) || '' ) || 0; }
		set upx( value ) { this.setAttribute( 'upx', value + '' ); }

		get upy() { return parseFloat( this.getAttribute( 'upy' ) || '' ) || 0; }
		set upy( value ) { this.setAttribute( 'upy', value + '' ); }

		get upz() { return parseFloat( this.getAttribute( 'upz' ) || '' ) || 0; }
		set upz( value ) { this.setAttribute( 'upz', value + '' ); }

		get centerx() { return parseFloat( this.getAttribute( 'centerx' ) || '' ) || 0; }
		set centerx( value ) { this.setAttribute( 'centerx', value + '' ); }

		get centery() { return parseFloat( this.getAttribute( 'centery' ) || '' ) || 0; }
		set centery( value ) { this.setAttribute( 'centery', value + '' ); }

		get centerz() { return parseFloat( this.getAttribute( 'centerz' ) || '' ) || 0; }
		set centerz( value ) { this.setAttribute( 'centerz', value + '' ); }

		get lightx() { return parseFloat( this.getAttribute( 'lightx' ) || '' ) || 0; }
		set lightx( value ) { this.setAttribute( 'lightx', value + '' ); }

		get lighty() { return parseFloat( this.getAttribute( 'lighty' ) || '' ) || 0; }
		set lighty( value ) { this.setAttribute( 'lighty', value + '' ); }

		get lightz() { return parseFloat( this.getAttribute( 'lightz' ) || '' ) || 0; }
		set lightz( value ) { this.setAttribute( 'lightz', value + '' ); }

		public async init( program?: LuminusProgram )
		{
			Luminus.console.info( 'Start: init lu-world.' );
			this._complete = false;
			this.lProgram = <any>null;

			if ( !program ) { program = new Luminus.program(); }

			const support = Luminus.createSupport( <WebGL2RenderingContext>this.canvas.getContext("webgl2") );

			await program.init( this, support );
			this.lProgram = !program ? new Luminus.program() : program;

			this._complete = true;
		}

		public render()
		{
			if ( !this.complete ) { return; }
			Luminus.console.info( 'Render:' );

			this.program.beginRender( this );

			for ( const model of this.children )
			{
				if ( model instanceof Luminus.model )
				{
					this.program.modelRender( model );
				}
			}

			this.program.endRender();
		}

		get ambientColor(): number[]
		{
			return (window.getComputedStyle( this, '' ).getPropertyValue( '--ambient' )
				.replace( /\s/g, '' )
				.replace( /rgba{0,1}\(([0-9\.\,]+)\)/, '$1' ) + ',1'
			).split( ',' )
				.slice( 0, 4 )
				.map( ( v, i, a ) => { return parseInt( v ) / 255.0 * parseFloat( a[ 3 ] ); } )
				.slice( 0, 3 );
		}

		get lightColor(): number[]
		{
			return (window.getComputedStyle( this, '' ).getPropertyValue( '--light' )
				.replace( /\s/g, '' )
				.replace( /rgba{0,1}\(([0-9\.\,]+)\)/, '$1' ) + ',1'
			).split( ',' )
				.slice( 0, 3 )
				.map( ( v ) => { return parseInt( v ) / 255.0; } );
		}

		static get observedAttributes() { return [ 'width', 'height' ]; }

		public attributeChangedCallback( attrName: string, oldVal: any , newVal: any )
		{
			if ( oldVal === newVal ) { return; }

			switch ( attrName )
			{
				case 'width': this.width = newVal; break;
				case 'height': this.height = newVal; break;
			}
		}
	}, script.dataset.prefix );
} );
