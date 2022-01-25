( () =>
{
	class Support implements LuminusSupport
	{
		public gl: WebGL2RenderingContext;
		public info: LuminusProgramInfo;
		public texture: WebGLTexture[];
		public matrix: Matrix;

		constructor( gl2: WebGL2RenderingContext )
		{
			this.gl = gl2;
			this.texture = [];
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

			await Promise.all(
			[
				this.info.initShader( vertex, fragment ),
				// Load white 1x1 texture.
				this.loadTexture( 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQYV2P4////fwAJ+wP9BUNFygAAAABJRU5ErkJggg==' ),
			] );

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

		public loadTexture( image: string | HTMLImageElement, num?: number )
		{
			const img = typeof image === 'string' ? document.createElement( 'img' ) : image;
			const index = num === undefined ? this.texture.length : num;

			if ( !this.texture[ index ] )
			{
				this.texture[ index ] = <any>null;
			}

			return ( img.complete && img.src ? Promise.resolve( img ) : new Promise<HTMLImageElement>( ( resolve, reject ) =>
			{
				img.onload = () => { resolve( img ); }
				img.onerror = reject;
				img.onabort = reject;
				if ( typeof image === 'string' )
				{
					img.src = image;
				}
			} ) ).then( ( img ) =>
			{
				const gl = this.gl;
				const texture = gl.createTexture();
				if ( !texture ) { throw new Error( 'Failure createTexture.'); }

				gl.bindTexture( gl.TEXTURE_2D, texture );
				gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img );
				gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
				gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST );
				gl.generateMipmap( gl.TEXTURE_2D );
				gl.bindTexture( gl.TEXTURE_2D, null );

				this.texture[ index ] = texture;

				return index;
			} );
		}

		public useTexture( num: number )
		{
			this.gl.bindTexture( this.gl.TEXTURE_2D, this.texture[ num ] || null );
		}
	}

	Luminus.createSupport = ( gl2: WebGL2RenderingContext ) => { return new Support( gl2 ); };
} )();
