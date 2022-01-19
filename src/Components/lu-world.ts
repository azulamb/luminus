/// <reference path="./lu-model.ts" />

( ( script, init ) =>
{
	/*if ( document.readyState !== 'loading' ) { return init( script ); }
	document.addEventListener( 'DOMContentLoaded', () => { init( script ); } );*/
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
		private canvas: HTMLCanvasElement;
		private lSupport: LuminusSupport;
		private uProjection: Float32Array;
		private uView: Float32Array;
		private uModel: Float32Array;

		constructor()
		{
			super();

			const shadow = this.attachShadow( { mode: 'open' } );

			const style = document.createElement( 'style' );
			style.innerHTML =
			[
				':host { display: block; }',
				'canvas { display: block; width: 100%; height: 100%; }',
			].join( '' );

			this.canvas = document.createElement( 'canvas' );

			this.width = ( this.hasAttribute( 'width' ) ? ( parseInt( this.getAttribute( 'width' ) || '' ) ) : 0 ) || 400;
			this.height = ( this.hasAttribute( 'height' ) ? ( parseInt( this.getAttribute( 'height' ) || '' ) ) : 0 ) || 400;

			this.lSupport = Luminus.createSupport( <WebGL2RenderingContext>this.canvas.getContext("webgl2") );

			const contents = document.createElement( 'div' );
			contents.appendChild( this.canvas );

			shadow.appendChild( style );
			shadow.appendChild( contents );

			this.init().then( () =>
			{
				this.render();
			} );

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

		get support() { return this.lSupport; }

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

		public async init()
		{
			await this.support.init(
				<HTMLScriptElement>document.getElementById( 'vertex' ),
				<HTMLScriptElement>document.getElementById( 'fragment' )
			);

			this.support.enables( this.support.gl.DEPTH_TEST, this.support.gl.CULL_FACE );

			// TODO: frustum
			this.uProjection = this.support.orthographic( this.left, this.right, this.bottom, this.top, this.near, this.far );

			this.uView = this.support.matrix.identity4();

			this.uModel = this.support.matrix.identity4();
			// TODO: onload event
		}

		public render()
		{
			const gl2 = this.support.gl;

			this.support.matrix.lookAt(
				[ this.eyex, this.eyey, this.eyez ],
				[ this.centerx, this.centery, this.centerz ],
				[ this.upx, this.upy, this.upz ],
				this.uView
			);

			gl2.useProgram( this.support.info.program );

			gl2.uniformMatrix4fv( this.support.info.uniform.uProjectionMatrix, false, this.uProjection );
			gl2.uniformMatrix4fv( this.support.info.uniform.uViewMatrix, false, this.uView );
			gl2.uniformMatrix4fv( this.support.info.uniform.uModelViewMatrix, false, this.uModel );

			this.support.clear();

			for ( const model of this.children )
			{
				if ( model instanceof Luminus.model )
				{
					(<LuminusModelElement>model).render( this.support );
				}
			}

			gl2.flush();
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
