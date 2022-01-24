( () =>
{
	function create4() { return new Float32Array( 16 ); }
	function identity4( m?: Float32Array )
	{
		if ( !m ) { m = create4(); }
		m[ 1 ] = m[ 2 ] = m[ 3 ] = m[ 4 ] = m[ 6 ] = m[ 7 ] = m[ 8 ] = m[ 9 ] = m[ 11 ] = m[ 12 ] = m[ 13 ] = m[ 14 ] = 0;
		m[ 0 ] = m[ 5 ] = m[ 10 ] = m[ 15 ] = 1;
		return m;
	}

	function lookAt( eye: number[], center: number[], up: number[], m?: Float32Array )
	{
		if ( !m ) { m = create4(); }

		let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
		let eyex = eye[ 0 ];
		let eyey = eye[ 1 ];
		let eyez = eye[ 2 ];
		let upx = up[ 0 ];
		let upy = up[ 1 ];
		let upz = up[ 2 ];
		let centerx = center[ 0 ];
		let centery = center[ 1 ];
		let centerz = center[ 2 ];

		if (
			Math.abs(eyex - centerx) < 0.000001 &&
			Math.abs(eyey - centery) < 0.000001 &&
			Math.abs(eyez - centerz) < 0.000001
		)
		{
			return identity4();
		}

		z0 = eyex - centerx;
		z1 = eyey - centery;
		z2 = eyez - centerz;

		len = 1 / Math.hypot(z0, z1, z2);
		z0 *= len;
		z1 *= len;
		z2 *= len;

		x0 = upy * z2 - upz * z1;
		x1 = upz * z0 - upx * z2;
		x2 = upx * z1 - upy * z0;
		len = Math.hypot( x0, x1, x2 );

		if (!len)
		{
			x0 = x1 = x2 = 0;
		} else
		{
			len = 1 / len;
			x0 *= len;
			x1 *= len;
			x2 *= len;
		}

		y0 = z1 * x2 - z2 * x1;
		y1 = z2 * x0 - z0 * x2;
		y2 = z0 * x1 - z1 * x0;

		len = Math.hypot(y0, y1, y2);
		if (!len) {
			y0 = y1 = y2 = 0;
		} else {
			len = 1 / len;
			y0 *= len;
			y1 *= len;
			y2 *= len;
		}

		m[ 0 ] = x0;
		m[ 1 ] = y0;
		m[ 2 ] = z0;
		m[ 3 ] = 0;
		m[ 4 ] = x1;
		m[ 5 ] = y1;
		m[ 6 ] = z1;
		m[ 7 ] = 0;
		m[ 8 ] = x2;
		m[ 9 ] = y2;
		m[ 10 ] = z2;
		m[ 11 ] = 0;
		m[ 12 ] = -(x0 * eyex + x1 * eyey + x2 * eyez);
		m[ 13 ] = -(y0 * eyex + y1 * eyey + y2 * eyez);
		m[ 14 ] = -(z0 * eyex + z1 * eyey + z2 * eyez);
		m[ 15 ] = 1;

		return m;
	}

	function translation4( x: number, y: number, z: number, m?: Float32Array )
	{
		if ( !m )
		{
			m = identity4();
		} else
		{
			identity4( m );
		}

		m[ 12 ] = x;
		m[ 13 ] = y;
		m[ 14 ] = z;

		return m;
	};

	function scaling4( x: number, y: number, z: number, m?: Float32Array )
	{
		if ( !m )
		{
			m = identity4();
		} else
		{
			identity4( m );
		}

		m[ 0 ] = x;
		m[ 5 ] = y;
		m[ 10 ] = z;

		return m;
	}

	function multiply4( a: Float32Array, b: Float32Array, m?: Float32Array )
	{
		if ( !m ) { m = create4(); }

		m[ 0 ] = b[ 0 ] * a[ 0 ] + b[ 1 ] * a[ 4 ] + b[ 2 ] * a[ 8 ] + b[ 3 ] * a[ 12 ];
		m[ 1 ] = b[ 0 ] * a[ 1 ] + b[ 1 ] * a[ 5 ] + b[ 2 ] * a[ 9 ] + b[ 3 ] * a[ 13 ];
		m[ 2 ] = b[ 0 ] * a[ 2 ] + b[ 1 ] * a[ 6 ] + b[ 2 ] * a[ 10 ] + b[ 3 ] * a[ 14 ];
		m[ 3 ] = b[ 0 ] * a[ 3 ] + b[ 1 ] * a[ 7 ] + b[ 2 ] * a[ 11 ] + b[ 3 ] * a[ 15 ];
		m[ 4 ] = b[ 4 ] * a[ 0 ] + b[ 5 ] * a[ 4 ] + b[ 6 ] * a[ 8 ] + b[ 7 ] * a[ 12 ];
		m[ 5 ] = b[ 4 ] * a[ 1 ] + b[ 5 ] * a[ 5 ] + b[ 6 ] * a[ 9 ] + b[ 7 ] * a[ 13 ];
		m[ 6 ] = b[ 4 ] * a[ 2 ] + b[ 5 ] * a[ 6 ] + b[ 6 ] * a[ 10 ] + b[ 7 ] * a[ 14 ];
		m[ 7 ] = b[ 4 ] * a[ 3 ] + b[ 5 ] * a[ 7 ] + b[ 6 ] * a[ 11 ] + b[ 7 ] * a[ 15 ];
		m[ 8 ] = b[ 8 ] * a[ 0 ] + b[ 9 ] * a[ 4 ] + b[ 10 ] * a[ 8 ] + b[ 11 ] * a[ 12 ];
		m[ 9 ] = b[ 8 ] * a[ 1 ] + b[ 9 ] * a[ 5 ] + b[ 10 ] * a[ 9 ] + b[ 11 ] * a[ 13 ];
		m[ 10 ] = b[ 8 ] * a[ 2 ] + b[ 9 ] * a[ 6 ] + b[ 10 ] * a[ 10 ] + b[ 11 ] * a[ 14 ];
		m[ 11 ] = b[ 8 ] * a[ 3 ] + b[ 9 ] * a[ 7 ] + b[ 10 ] * a[ 11 ] + b[ 11 ] * a[ 15 ];
		m[ 12 ] = b[ 12 ] * a[ 0 ] + b[ 13 ] * a[ 4 ] + b[ 14 ] * a[ 8 ] + b[ 15 ] * a[ 12 ];
		m[ 13 ] = b[ 12 ] * a[ 1 ] + b[ 13 ] * a[ 5 ] + b[ 14 ] * a[ 9 ] + b[ 15 ] * a[ 13 ];
		m[ 14 ] = b[ 12 ] * a[ 2 ] + b[ 13 ] * a[ 6 ] + b[ 14 ] * a[ 10 ] + b[ 15 ] * a[ 14 ];
		m[ 15 ] = b[ 12 ] * a[ 3 ] + b[ 13 ] * a[ 7 ] + b[ 14 ] * a[ 11 ] + b[ 15 ] * a[ 15 ];

		return m;
	};

	function inverse4( a: Float32Array, m?: Float32Array )
	{
		const d = a[ 0 ] * a[ 5 ] * a[ 10 ] * a[ 15 ] +
			a[ 0 ] * a[ 6 ] * a[ 11 ] * a[ 13 ] +
			a[ 0 ] * a[ 7 ] * a[ 9 ] * a[ 14 ] +
			a[ 1 ] * a[ 4 ] * a[ 11 ] * a[ 14 ] +
			a[ 1 ] * a[ 6 ] * a[ 8 ] * a[ 15 ] +
			a[ 1 ] * a[ 7 ] * a[ 10 ] * a[ 12 ] +
			a[ 2 ] * a[ 4 ] * a[ 9 ] * a[ 15 ] +
			a[ 2 ] * a[ 5 ] * a[ 11 ] * a[ 12 ] +
			a[ 2 ] * a[ 7 ] * a[ 8 ] * a[ 13 ] +
			a[ 3 ] * a[ 4 ] * a[ 10 ] * a[ 13 ] +
			a[ 3 ] * a[ 5 ] * a[ 8 ] * a[ 14 ] +
			a[ 3 ] * a[ 6 ] * a[ 9 ] * a[ 12 ] -
			a[ 0 ] * a[ 5 ] * a[ 11 ] * a[ 14 ] -
			a[ 0 ] * a[ 6 ] * a[ 9 ] * a[ 15 ] -
			a[ 0 ] * a[ 7 ] * a[ 10 ] * a[ 13 ] -
			a[ 1 ] * a[ 4 ] * a[ 10 ] * a[ 15 ] -
			a[ 1 ] * a[ 6 ] * a[ 11 ] * a[ 12 ] -
			a[ 1 ] * a[ 7 ] * a[ 8 ] * a[ 14 ] -
			a[ 2 ] * a[ 4 ] * a[ 11 ] * a[ 13 ] -
			a[ 2 ] * a[ 5 ] * a[ 8 ] * a[ 15 ] -
			a[ 2 ] * a[ 7 ] * a[ 9 ] * a[ 12 ] -
			a[ 3 ] * a[ 4 ] * a[ 9 ] * a[ 14 ] -
			a[ 3 ] * a[ 5 ] * a[ 10 ] * a[ 12 ] -
			a[ 3 ] * a[ 6 ] * a[ 8 ] * a[ 13 ];

		if ( !m ) { m = create4(); }

		if ( Math.abs( d ) < 1.0e-10 )
		{
			return identity4( m );
		}

		const id = 1.0 / d;

		m[ 0 ] = id * ( a[ 5 ] * a[ 10 ] * a[ 15 ] + a[ 6 ] * a[ 11 ] * a[ 13 ] + a[ 7 ] * a[ 9 ] * a[ 14 ] - a[ 5 ] * a[ 11 ] * a[ 14 ] - a[ 6 ] * a[ 9 ] * a[ 15 ] - a[ 7 ] * a[ 10 ] * a[ 13 ] );
		m[ 1 ] = id * ( a[ 1 ] * a[ 11 ] * a[ 14 ] + a[ 2 ] * a[ 9 ] * a[ 15 ] + a[ 3 ] * a[ 10 ] * a[ 13 ] - a[ 1 ] * a[ 10 ] * a[ 15 ] - a[ 2 ] * a[ 11 ] * a[ 13 ] - a[ 3 ] * a[ 9 ] * a[ 14 ] );
		m[ 2 ] = id * ( a[ 1 ] * a[ 6 ] * a[ 15 ] + a[ 2 ] * a[ 7 ] * a[ 13 ] + a[ 3 ] * a[ 5 ] * a[ 14 ] - a[ 1 ] * a[ 7 ] * a[ 14 ] - a[ 2 ] * a[ 5 ] * a[ 15 ] - a[ 3 ] * a[ 6 ] * a[ 13 ] );
		m[ 3 ] = id * ( a[ 1 ] * a[ 7 ] * a[ 10 ] + a[ 2 ] * a[ 5 ] * a[ 11 ] + a[ 3 ] * a[ 6 ] * a[ 9 ] - a[ 1 ] * a[ 6 ] * a[ 11 ] - a[ 2 ] * a[ 7 ] * a[ 9 ] - a[ 3 ] * a[ 5 ] * a[ 10 ] );

		m[ 4 ] = id * ( a[ 4 ] * a[ 11 ] * a[ 14 ] + a[ 6 ] * a[ 8 ] * a[ 15 ] + a[ 7 ] * a[ 10 ] * a[ 12 ] - a[ 4 ] * a[ 10 ] * a[ 15 ] - a[ 6 ] * a[ 11 ] * a[ 12 ] - a[ 7 ] * a[ 8 ] * a[ 14 ] );
		m[ 5 ] = id * ( a[ 0 ] * a[ 10 ] * a[ 15 ] + a[ 2 ] * a[ 11 ] * a[ 12 ] + a[ 3 ] * a[ 8 ] * a[ 14 ] - a[ 0 ] * a[ 11 ] * a[ 14 ] - a[ 2 ] * a[ 8 ] * a[ 15 ] - a[ 3 ] * a[ 10 ] * a[ 12 ] );
		m[ 6 ] = id * ( a[ 0 ] * a[ 7 ] * a[ 14 ] + a[ 2 ] * a[ 4 ] * a[ 15 ] + a[ 3 ] * a[ 6 ] * a[ 12 ] - a[ 0 ] * a[ 6 ] * a[ 15 ] - a[ 2 ] * a[ 7 ] * a[ 12 ] - a[ 3 ] * a[ 4 ] * a[ 14 ] );
		m[ 7 ] = id * ( a[ 0 ] * a[ 6 ] * a[ 11 ] + a[ 2 ] * a[ 7 ] * a[ 8 ] + a[ 3 ] * a[ 4 ] * a[ 10 ] - a[ 0 ] * a[ 7 ] * a[ 10 ] - a[ 2 ] * a[ 4 ] * a[ 11 ] - a[ 3 ] * a[ 6 ] * a[ 8 ] );

		m[ 8 ] = id * ( a[ 4 ] * a[ 9 ] * a[ 15 ] + a[ 5 ] * a[ 11 ] * a[ 12 ] + a[ 7 ] * a[ 8 ] * a[ 13 ] - a[ 4 ] * a[ 11 ] * a[ 13 ] - a[ 5 ] * a[ 8 ] * a[ 15 ] - a[ 7 ] * a[ 9 ] * a[ 12 ] );
		m[ 9 ] = id * ( a[ 0 ] * a[ 11 ] * a[ 13 ] + a[ 1 ] * a[ 8 ] * a[ 15 ] + a[ 3 ] * a[ 9 ] * a[ 12 ] - a[ 0 ] * a[ 9 ] * a[ 15 ] - a[ 1 ] * a[ 11 ] * a[ 12 ] - a[ 3 ] * a[ 8 ] * a[ 13 ] );
		m[ 10 ] = id * ( a[ 0 ] * a[ 5 ] * a[ 15 ] + a[ 1 ] * a[ 7 ] * a[ 12 ] + a[ 3 ] * a[ 4 ] * a[ 13 ] - a[ 0 ] * a[ 7 ] * a[ 13 ] - a[ 1 ] * a[ 4 ] * a[ 15 ] - a[ 3 ] * a[ 5 ] * a[ 12 ] );
		m[ 11 ] = id * ( a[ 0 ] * a[ 7 ] * a[ 9 ] + a[ 1 ] * a[ 4 ] * a[ 11 ] + a[ 3 ] * a[ 5 ] * a[ 8 ] - a[ 0 ] * a[ 5 ] * a[ 11 ] - a[ 1 ] * a[ 7 ] * a[ 8 ] - a[ 3 ] * a[ 4 ] * a[ 9 ] );

		m[ 12 ] = id * ( a[ 4 ] * a[ 10 ] * a[ 13 ] + a[ 5 ] * a[ 8 ] * a[ 14 ] + a[ 6 ] * a[ 9 ] * a[ 12 ] - a[ 4 ] * a[ 9 ] * a[ 14 ] - a[ 5 ] * a[ 10 ] * a[ 12 ] - a[ 6 ] * a[ 8 ] * a[ 13 ] );
		m[ 13 ] = id * ( a[ 0 ] * a[ 9 ] * a[ 14 ] + a[ 1 ] * a[ 10 ] * a[ 12 ] + a[ 2 ] * a[ 8 ] * a[ 13 ] - a[ 0 ] * a[ 10 ] * a[ 13 ] - a[ 1 ] * a[ 8 ] * a[ 14 ] - a[ 2 ] * a[ 9 ] * a[ 12 ] );
		m[ 14 ] = id * ( a[ 0 ] * a[ 6 ] * a[ 13 ] + a[ 1 ] * a[ 4 ] * a[ 14 ] + a[ 2 ] * a[ 5 ] * a[ 12 ] - a[ 0 ] * a[ 5 ] * a[ 14 ] - a[ 1 ] * a[ 6 ] * a[ 12 ] - a[ 2 ] * a[ 4 ] * a[ 13 ] );
		m[ 15 ] = id * ( a[ 0 ] * a[ 5 ] * a[ 10 ] + a[ 1 ] * a[ 6 ] * a[ 8 ] + a[ 2 ] * a[ 4 ] * a[ 9 ] - a[ 0 ] * a[ 6 ] * a[ 9 ] - a[ 1 ] * a[ 4 ] * a[ 10 ] - a[ 2 ] * a[ 5 ] * a[ 8 ] );

		return m;
	}

	Luminus.matrix = {
		create4: create4,
		identity4: identity4,
		translation4: translation4,
		scaling4: scaling4,
		lookAt: lookAt,
		multiply4: multiply4,
		inverse4: inverse4,
	};
} )();
