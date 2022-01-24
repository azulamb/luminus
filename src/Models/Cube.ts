( () =>
{
	class Cube extends Luminus.models.model implements LuminusModel<Response>
	{
		public loaded?: boolean = true;
		public complete?: boolean;
		public color: Float32Array = new Float32Array( 4 );

		protected vao: WebGLVertexArrayObject;

		public onprepare( support: LuminusSupport )
		{
			Luminus.console.info( 'Start: cube-prepare.' );

			const verts = new Float32Array(
			[
				0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1,
				0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0,
				0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0,
				0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1,
				1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1,
				0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0,
			] );

			const colors = new Float32Array( [ ...Array( verts.length / 3 * 4 ) ] );
			for ( let i = 0 ; i < colors.length ; i += 4 )
			{
				colors[ i ] = this.color[ 0 ];
				colors[ i + 1 ] = this.color[ 1 ];
				colors[ i + 2 ] = this.color[ 2 ];
				colors[ i + 3 ] = this.color[ 3 ];
			}

			const normals = new Float32Array(
			[
				0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
				0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
				0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
				0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
				1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
				-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
			] );

			const faces = new Uint16Array( 
			[
				0, 1, 2, 0, 2, 3,
				4, 5, 6, 4, 6, 7,
				8, 9, 10, 8, 10, 11,
				12, 13, 14, 12, 14, 15,
				16, 17, 18, 16, 18, 19,
				20, 21, 22, 20, 22, 23,
			] );

			const gl2 = support.gl;

			const vao = support.gl.createVertexArray();
			if ( !vao ) { return Promise.reject( new Error( 'Failure createVertexArray.' ) ); }

			support.gl.bindVertexArray( vao );

			const positionBuffer = gl2.createBuffer();
			gl2.bindBuffer( gl2.ARRAY_BUFFER, positionBuffer );
			gl2.bufferData( gl2.ARRAY_BUFFER, verts, gl2.STATIC_DRAW );
			gl2.enableVertexAttribArray( support.info.in.aVertexPosition );
			gl2.vertexAttribPointer( support.info.in.aVertexPosition, 3, gl2.FLOAT, false, 0, 0 );

			const colorBuffer = gl2.createBuffer();
			gl2.bindBuffer( gl2.ARRAY_BUFFER, colorBuffer );
			gl2.bufferData( gl2.ARRAY_BUFFER, colors, gl2.STATIC_DRAW );
			gl2.enableVertexAttribArray( support.info.in.aVertexColor );
			gl2.vertexAttribPointer( support.info.in.aVertexColor, 4, gl2.FLOAT, false, 0, 0 );

			const normalBuffer = gl2.createBuffer();
			gl2.bindBuffer( gl2.ARRAY_BUFFER, normalBuffer );
			gl2.bufferData( gl2.ARRAY_BUFFER, normals, gl2.STATIC_DRAW );
			gl2.enableVertexAttribArray( support.info.in.aVertexNormal );
			gl2.vertexAttribPointer( support.info.in.aVertexNormal, 3, gl2.FLOAT, false, 0, 0 );

			const indexBuffer = gl2.createBuffer();
			gl2.bindBuffer( gl2.ELEMENT_ARRAY_BUFFER, indexBuffer );
			gl2.bufferData( gl2.ELEMENT_ARRAY_BUFFER, faces, gl2.STATIC_DRAW );

			support.gl.bindVertexArray( null );

			this.vao = vao;

			return Promise.resolve();
		}

		public onrender( support: LuminusSupport )
		{
			const gl = support.gl;

			support.gl.bindVertexArray( this.vao );
			gl.drawElements( gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0 );
			support.gl.bindVertexArray( null );
		}
	}

	Luminus.models.cube = Cube;
} )();