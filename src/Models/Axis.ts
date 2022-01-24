( () =>
{
	class Axis extends Luminus.models.model implements LuminusModelAxis
	{
		public loaded?: boolean = true;
		public complete?: boolean;
		private _length: number;
		private _change: boolean;

		protected vao: WebGLVertexArrayObject;

		public minLight: number = 1;

		constructor()
		{
			super();
			this._length = 10;
		}

		get length() { return this._length; }
		set length( value )
		{
			this._length = value;
			this._change = true;
		}

		public onprepare( support: LuminusSupport )
		{
			const length = this.length;

			const gl2 = support.gl;

			const vao = support.gl.createVertexArray();
			if ( !vao ) { return Promise.reject( new Error( 'Failure createVertexArray.' ) ); }

			support.gl.bindVertexArray( vao );

			const positionBuffer = gl2.createBuffer();
			gl2.bindBuffer( gl2.ARRAY_BUFFER, positionBuffer );
			gl2.bufferData( gl2.ARRAY_BUFFER, new Float32Array( [
				0, 0, 0, length, 0, 0,
				0, 0, 0, 0, length, 0,
				0, 0, 0, 0, 0, length,
			] ), gl2.STATIC_DRAW );
			gl2.enableVertexAttribArray( support.info.in.aVertexPosition );
			gl2.vertexAttribPointer( support.info.in.aVertexPosition, 3, gl2.FLOAT, false, 0, 0 );

			const colorBuffer = gl2.createBuffer();
			gl2.bindBuffer( gl2.ARRAY_BUFFER, colorBuffer );
			gl2.bufferData( gl2.ARRAY_BUFFER, new Float32Array( [
				1, 0, 0, 1, 1, 0, 0, 1,
				0, 1, 0, 1, 0, 1, 0, 1,
				0, 0, 1, 1, 0, 0, 1, 1,
			] ), gl2.STATIC_DRAW );
			gl2.enableVertexAttribArray( support.info.in.aVertexColor );
			gl2.vertexAttribPointer( support.info.in.aVertexColor, 4, gl2.FLOAT, false, 0, 0 );

			support.gl.bindVertexArray( null );

			this.vao = vao;

			this._change = false;

			return Promise.resolve();
		}

		public onrender( support: LuminusSupport )
		{
			const gl = support.gl;

			if ( this._change ) { this.prepare( support ); }

			support.gl.bindVertexArray( this.vao );
			gl.drawArrays( gl.LINES, 0, 6 );
			support.gl.bindVertexArray( null );
		}
	}
	Luminus.models.axis = Axis;
} )();
