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
		private lSupport: LuminusSupport;

		// Light
		private lColor: Float32Array;
		private aColor: Float32Array;
		// Matrix
		private uProjection: Float32Array;
		private uView: Float32Array;
		private uModel: Float32Array;
		private iModel: Float32Array;

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

		get lightx() { return parseFloat( this.getAttribute( 'lightx' ) || '' ) || 0; }
		set lightx( value ) { this.setAttribute( 'lightx', value + '' ); }

		get lighty() { return parseFloat( this.getAttribute( 'lighty' ) || '' ) || 0; }
		set lighty( value ) { this.setAttribute( 'lighty', value + '' ); }

		get lightz() { return parseFloat( this.getAttribute( 'lightz' ) || '' ) || 0; }
		set lightz( value ) { this.setAttribute( 'lightz', value + '' ); }

		public async init()
		{
			Luminus.console.info( 'Start: init lu-world.' );
			const vertex = `#version 300 es
in vec4 vPosition;
in vec4 vColor;
in vec3 vNormal;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;
uniform vec3 lColor;
uniform vec3 aColor;
uniform float lMin;
uniform vec3 lDirection;
uniform mat4 iModel;
out lowp vec4 oColor;
void main(void) {
	gl_Position = uProjection * uView * uModel * vPosition;

	vec3 invLight = normalize( iModel * vec4( lDirection, 0.0 ) ).xyz;
	float diffuse = lMin + ( 1.0 - lMin ) * clamp( dot( vNormal, invLight ), 0.0, 1.0 );
	oColor = vColor * vec4( vec3( diffuse ), 1.0 ) + vec4( aColor.xyz, 0 ) * vColor.w;
}`;
			const fragment = `#version 300 es
in lowp vec4 oColor;
out lowp vec4 outColor;
void main(void) {
	outColor = oColor;
}`;

			const support = Luminus.createSupport( <WebGL2RenderingContext>this.canvas.getContext("webgl2") );
			await support.init(
				<HTMLScriptElement>document.getElementById( 'vertex' ) || vertex,
				<HTMLScriptElement>document.getElementById( 'fragment' ) || fragment
			);
			this.lSupport = support;

			support.enables( support.gl.DEPTH_TEST, support.gl.CULL_FACE );

			this.lColor = new Float32Array( this.lightColor );
			this.aColor = new Float32Array( this.ambientColor );

			// TODO: frustum
			this.uProjection = support.orthographic( this.left, this.right, this.bottom, this.top, this.near, this.far );
			this.uView = support.matrix.identity4();
			this.uModel = support.matrix.identity4();

			this.iModel = support.matrix.identity4();

			this._complete = true;
		}

		public render()
		{
			if ( !this.complete ) { return; }
			Luminus.console.info( 'Render:' );

			const gl2 = this.support.gl;

			this.support.matrix.lookAt(
				[ this.eyex, this.eyey, this.eyez ],
				[ this.centerx, this.centery, this.centerz ],
				[ this.upx, this.upy, this.upz ],
				this.uView
			);

			// TODO: move Support.
			gl2.useProgram( this.support.info.program );

			gl2.uniformMatrix4fv( this.support.info.uniform.uProjection, false, this.uProjection );
			gl2.uniformMatrix4fv( this.support.info.uniform.uView, false, this.uView );
			gl2.uniformMatrix4fv( this.support.info.uniform.uModel, false, this.uModel );

			// Light.
			gl2.uniform3f( this.support.info.uniform.lDirection, this.lightx, this.lighty, this.lightz);
			this.lColor.set( this.lightColor );
			gl2.uniform3fv( this.support.info.uniform.lColor, this.lColor );
			this.aColor.set( this.ambientColor );
			gl2.uniform3fv( this.support.info.uniform.aColor, this.aColor );
			gl2.uniformMatrix4fv( this.support.info.uniform.iModel, false, this.iModel );

			this.support.clear();

			for ( const model of this.children )
			{
				if ( model instanceof Luminus.model )
				{
					this.support.matrix.translation4( model.x, model.y, model.z, this.uModel );
					gl2.uniformMatrix4fv( this.support.info.uniform.uModel, false, this.uModel );
					this.support.matrix.inverse4( this.uModel, this.iModel );
					gl2.uniformMatrix4fv( this.support.info.uniform.iProjectionMatrix, false, this.iModel );
					gl2.uniform1f( this.support.info.uniform.lMin, model.model.lMin === undefined ? 0.3 : model.model.lMin );

					model.render( this.support );
				}
			}

			gl2.flush();
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
