( () =>
{
	class Cube extends Luminus.models.model  implements LuminusModel
	{
		public loaded?: boolean;
		public complete?: boolean;
		public color: Float32Array = new Float32Array( 4 );

		protected vao: WebGLVertexArrayObject;
		protected verts: Float32Array;
		protected colors: Float32Array;
		protected count: number;

		public onload()
		{
			this.verts = new Float32Array(
			[
				1, 1, 0,
				1, 1, 1,
				1, 0, 0,
				1, 0, 1,
				0, 0, 1,
				1, 1, 1,
				0, 1, 1,
				1, 1, 0,
				0, 1, 0,
				1, 0, 0,
				0, 0, 0,
				0, 0, 1,
				0, 1, 0,
				0, 1, 1,
			] );

			this.colors = new Float32Array( [ ...Array( this.verts.length / 3 * 4 ) ] );
			for ( let i = 0 ; i < this.colors.length ; i += 4 )
			{
				this.colors[ i ] = this.color[ 0 ];
				this.colors[ i + 1 ] = this.color[ 1 ];
				this.colors[ i + 2 ] = this.color[ 2 ];
				this.colors[ i + 3 ] = this.color[ 3 ];
			}

			return Promise.resolve();
		}

		public onprepare( support: LuminusSupport )
		{
			Luminus.console.info( 'Start: cube-prepare.' );
			const gl2 = support.gl;

			const vao = support.gl.createVertexArray();
			if ( !vao ) { return Promise.reject( new Error( 'Failure createVertexArray.' ) ); }

			support.gl.bindVertexArray( vao );

			const positionBuffer = gl2.createBuffer();
			gl2.bindBuffer( gl2.ARRAY_BUFFER, positionBuffer );
			gl2.bufferData( gl2.ARRAY_BUFFER, this.verts, gl2.STATIC_DRAW );
			gl2.enableVertexAttribArray( support.info.in.aVertexPosition );
			gl2.vertexAttribPointer( support.info.in.aVertexPosition, 3, gl2.FLOAT, false, 0, 0 );

			const colorBuffer = gl2.createBuffer();
			gl2.bindBuffer( gl2.ARRAY_BUFFER, colorBuffer );
			gl2.bufferData( gl2.ARRAY_BUFFER, this.colors, gl2.STATIC_DRAW );
			gl2.enableVertexAttribArray( support.info.in.aVertexColor );
			gl2.vertexAttribPointer( support.info.in.aVertexColor, 4, gl2.FLOAT, false, 0, 0 );

			support.gl.bindVertexArray( null );

			this.vao = vao;

			return Promise.resolve();
		}

		public onrender( support: LuminusSupport )
		{
			const gl = support.gl;

			support.gl.bindVertexArray( this.vao );
			gl.drawArrays( gl.TRIANGLE_STRIP, 0, 14 );
			support.gl.bindVertexArray( null );
		}
	}

	Luminus.models.cube = Cube;
} )();