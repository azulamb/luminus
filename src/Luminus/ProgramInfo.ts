( () =>
{
	class ProgramInfo implements LuminusProgramInfo
	{
		protected support: LuminusSupport;
		public program: WebGLProgram;
		public in: { [ keys: string ]: number };
		public uniform: { [ keys: string ]: WebGLUniformLocation };
		protected vertex: string;

		constructor( support: LuminusSupport )
		{
			this.support = support;
		}

		public async init()
		{
			const program = this.support.gl.createProgram();
			if ( !program )
			{
				throw new Error( 'Failure createProgram.' );
			}

			this.program = program;
		}

		public async initShader( vertex: string | HTMLScriptElement, fragment: string | HTMLScriptElement )
		{
			const gl = this.support.gl;
			const program = this.program;

			const vertexShader = await ( typeof vertex === 'string' ? this.loadShader( gl.VERTEX_SHADER, vertex ) : this.loadShader( vertex ) ).then( ( result ) =>
			{
				this.vertex = result.source;
				return this.createShader( result.type, result.source );
			} );
			const fragmentShader = await ( typeof fragment === 'string' ? this.loadShader( gl.FRAGMENT_SHADER, fragment ) : this.loadShader( fragment ) ).then( ( result ) =>
			{
				return this.createShader( result.type, result.source );
			} );

			gl.attachShader( program, vertexShader );
			gl.attachShader( program, fragmentShader );
			gl.linkProgram( program );

			if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) )
			{
				throw new Error( gl.getProgramInfoLog( program ) || '' );
			}
		}

		public async loadShader( element: HTMLScriptElement ): Promise<{ type: number, source: string }>
		public async loadShader( type: number, source: string ): Promise<{ type: number, source: string }>
		async loadShader( type: number | HTMLScriptElement, source?: string ): Promise<{ type: number, source: string }>
		{
			if ( typeof type !== 'number' )
			{
				// HTMLScriptElement.
				source = type.textContent || '';
				// x-shader/x-vertex or x-shader/x-fragment
				type = type.type === 'x-shader/x-fragment' ? this.support.gl.FRAGMENT_SHADER : this.support.gl.VERTEX_SHADER;
			}

			return { type: <number>type, source: <string>source };
		}

		public async createShader( type: number, source: string )
		{
			const gl = this.support.gl;

			const shader = gl.createShader( type );

			if ( !shader )
			{
				throw new Error( 'Failure createShader.' );
			}

			gl.shaderSource( shader, source );
			gl.compileShader( shader );

			if ( gl.getShaderParameter( shader, gl.COMPILE_STATUS ) )
			{
				return shader;
			}

			gl.deleteShader(shader);

			throw new Error( gl.getShaderInfoLog( shader ) || '' );
		}

		public loadPosition()
		{
			const gl = this.support.gl;
			const program = this.program;

			const inPosition: { [ keys: string ]: number } = {};
			const uniformPosition: { [ keys: string ]: WebGLUniformLocation } = {};

			const vertex = this.vertex || '';
			let result: RegExpExecArray | null;

			const inReg = new RegExp( /\sin [^\s]+ ([^\;\s]+)\;/sg );
			while ( result = inReg.exec( vertex ) )
			{
				const key = result[ 1 ];
				inPosition[ key ] = gl.getAttribLocation( program, key );
			}

			const uniformReg = new RegExp( /\suniform [^\s]+ ([^\;\s]+)\;/sg );
			while ( result = uniformReg.exec( vertex ) )
			{
				const key = result[ 1 ];
				uniformPosition[ key ] = <WebGLUniformLocation>gl.getUniformLocation( program, key );
			}

			this.in = inPosition;
			this.uniform = uniformPosition;

			return this;
		}
	}

	Luminus.createProgram = ( support: LuminusSupport ) => { return new ProgramInfo( support ); };
} )();
