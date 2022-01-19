( () =>
{
	class Support implements LuminusSupport
	{
		public gl: WebGL2RenderingContext;
		public info: LuminusProgramInfo;
		public matrix: Matrix;

		constructor( gl2: WebGL2RenderingContext )
		{
			this.gl = gl2;
			this.matrix = Luminus.matrix;
			this.info = Luminus.createProgram( this );
		}

		public enables( ... enables: number[] )
		{
			for ( const enable of enables )
			{
				this.gl.enable( enable );
			}

			return this;
		}

		public async init( vertex: string | HTMLScriptElement, fragment: string | HTMLScriptElement )
		{
			await this.info.init();

			await this.info.initShader( vertex, fragment );

			this.info.loadPosition();

			this.gl.clearColor( 0.0, 0.0, 0.0, 0.0 );
			this.gl.clearDepth( 1.0 );
			this.gl.depthFunc( this.gl.LEQUAL );

			return this.info.program;
		}

		public clear( mask?: number )
		{
			this.gl.clear( mask === undefined ? this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT : mask );

			return this;
		}

		public orthographic( left: number, right: number, bottom: number, top: number, near: number, far: number )
		{
			const m = new Float32Array( 16 );

			const lr = 1 / (left - right);
			const bt = 1 / (bottom - top);
			const nf = 1 / (near - far);
			m[ 1 ] = m[ 2 ] = m[ 3 ] = m[ 4 ] = m[ 6 ] = m[ 7 ] = m[ 8 ] = m[ 9 ] = m[ 11 ] = 0;
			m[ 0 ] = -2 * lr;
			m[ 5 ] = -2 * bt;
			m[ 10 ] = 2 * nf;
			m[ 12 ] = ( left + right ) * lr;
			m[ 13 ] = (top + bottom) * bt;
			m[ 14 ] = (far + near) * nf;
			m[ 15 ] = 1;

			return m;
		}
	}

	Luminus.createSupport = ( gl2: WebGL2RenderingContext ) => { return new Support( gl2 ); };
} )();
