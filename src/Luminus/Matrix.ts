(() => {
	function create4() {
		return new Float32Array(16);
	}
	function identity4(m?: Float32Array) {
		if (!m) {
			m = create4();
		}
		m[1] = m[2] = m[3] = m[4] = m[6] = m[7] = m[8] = m[9] = m[11] = m[12] = m[13] = m[14] = 0;
		m[0] = m[5] = m[10] = m[15] = 1;
		return m;
	}

	function lookAt(eye: number[], center: number[], up: number[], m?: Float32Array) {
		if (!m) {
			m = create4();
		}

		let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
		const eyex = eye[0], eyey = eye[1], eyez = eye[2];
		const upx = up[0], upy = up[1], upz = up[2];
		const centerx = center[0], centery = center[1], centerz = center[2];

		if (
			Math.abs(eyex - centerx) < 0.000001 &&
			Math.abs(eyey - centery) < 0.000001 &&
			Math.abs(eyez - centerz) < 0.000001
		) {
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
		len = Math.hypot(x0, x1, x2);

		if (!len) {
			x0 = x1 = x2 = 0;
		} else {
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

		m[0] = x0;
		m[1] = y0;
		m[2] = z0;
		m[3] = 0;
		m[4] = x1;
		m[5] = y1;
		m[6] = z1;
		m[7] = 0;
		m[8] = x2;
		m[9] = y2;
		m[10] = z2;
		m[11] = 0;
		m[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
		m[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
		m[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
		m[15] = 1;

		return m;
	}

	function translation4(x: number, y: number, z: number, m?: Float32Array) {
		if (!m) {
			m = identity4();
		} else {
			identity4(m);
		}

		m[12] = x;
		m[13] = y;
		m[14] = z;

		return m;
	}

	function scaling4(x: number, y: number, z: number, m?: Float32Array) {
		if (!m) {
			m = identity4();
		} else {
			identity4(m);
		}

		m[0] = x;
		m[5] = y;
		m[10] = z;

		return m;
	}

	function multiply4(a: Float32Array, b: Float32Array, m?: Float32Array) {
		if (!m) {
			m = b.length < 16 ? new Float32Array(4) : create4();
		}
		const A = a[0],
			B = a[1],
			C = a[2],
			D = a[3],
			E = a[4],
			F = a[5],
			G = a[6],
			H = a[7],
			I = a[8],
			J = a[9],
			K = a[10],
			L = a[11],
			M = a[12],
			N = a[13],
			O = a[14],
			P = a[15];

		[m[0], m[1], m[2], m[3]] = [
			b[0] * A + b[1] * E + b[2] * I + b[3] * M,
			b[0] * B + b[1] * F + b[2] * J + b[3] * N,
			b[0] * C + b[1] * G + b[2] * K + b[3] * O,
			b[0] * D + b[1] * H + b[2] * L + b[3] * P,
		];
		if (4 < m.length) {
			[m[4], m[5], m[6], m[7]] = [
				b[4] * A + b[5] * E + b[6] * I + b[7] * M,
				b[4] * B + b[5] * F + b[6] * J + b[7] * N,
				b[4] * C + b[5] * G + b[6] * K + b[7] * O,
				b[4] * D + b[5] * H + b[6] * L + b[7] * P,
			];
			[m[8], m[9], m[10], m[11]] = [
				b[8] * A + b[9] * E + b[10] * I + b[11] * M,
				b[8] * B + b[9] * F + b[10] * J + b[11] * N,
				b[8] * C + b[9] * G + b[10] * K + b[11] * O,
				b[8] * D + b[9] * H + b[10] * L + b[11] * P,
			];
			[m[12], m[13], m[14], m[15]] = [
				b[12] * A + b[13] * E + b[14] * I + b[15] * M,
				b[12] * B + b[13] * F + b[14] * J + b[15] * N,
				b[12] * C + b[13] * G + b[14] * K + b[15] * O,
				b[12] * D + b[13] * H + b[14] * L + b[15] * P,
			];
		}

		return m;
	}

	function quaternion(roll: number, pitch: number, yaw: number, m?: Float32Array) {
		if (!m) {
			m = new Float32Array(4);
		}
		roll = roll / 180 * Math.PI;
		pitch = pitch / 180 * Math.PI;
		yaw = yaw / 180 * Math.PI;
		const cosRoll = Math.cos(roll / 2.0);
		const sinRoll = Math.sin(roll / 2.0);
		const cosPitch = Math.cos(pitch / 2.0);
		const sinPitch = Math.sin(pitch / 2.0);
		const cosYaw = Math.cos(yaw / 2.0);
		const sinYaw = Math.sin(yaw / 2.0);
		m[0] = cosRoll * cosPitch * cosYaw + sinRoll * sinPitch * sinYaw;
		m[1] = sinRoll * cosPitch * cosYaw - cosRoll * sinPitch * sinYaw;
		m[2] = cosRoll * sinPitch * cosYaw + sinRoll * cosPitch * sinYaw;
		m[3] = cosRoll * cosPitch * sinYaw - sinRoll * sinPitch * cosYaw;
		return m;
	}

	function rotation4(roll: number, pitch: number, yaw: number, m?: Float32Array) {
		if (!m) {
			m = create4();
		}

		const a = yaw / 180 * Math.PI;
		const b = pitch / 180 * Math.PI;
		const c = roll / 180 * Math.PI;
		const cosa = Math.cos(a);
		const sina = Math.sin(a);
		const cosb = Math.cos(b);
		const sinb = Math.sin(b);
		const cosc = Math.cos(c);
		const sinc = Math.sin(c);

		/*m[ 0 ] = cosa * cosb * cosc - sina * sinc;
		m[ 1 ] = - cosa * cosb * sinc - sina * cosc;
		m[ 2 ] = cosa * sinb;
		m[ 4 ] = sina * cosb * cosc + cosa * sinc;
		m[ 5 ] = - sina * cosb * sinc + cosa * cosc;
		m[ 6 ] = sina * sinb;
		m[ 8 ] = - sinb * cosc;
		m[ 9 ] = sinb * sinc;
		m[ 10 ] = cosb;*/
		m[0] = cosa * cosb;
		m[1] = cosa * sinb * sinc - sina * cosc;
		m[2] = cosa * sinb * cosc + sina * sinc;
		m[4] = sina * cosb;
		m[5] = sina * sinb * sinc + cosa * cosc;
		m[6] = sina * sinb * cosc - cosa * sinc;
		m[8] = -sinb;
		m[9] = cosb * sinc;
		m[10] = cosb * cosc;
		m[3] = m[7] = m[11] = m[12] = m[13] = m[14] = 0;
		m[15] = 1;

		return m;
	}

	function inverse4(a: Float32Array, m?: Float32Array) {
		const d = a[0] * a[5] * a[10] * a[15] +
			a[0] * a[6] * a[11] * a[13] +
			a[0] * a[7] * a[9] * a[14] +
			a[1] * a[4] * a[11] * a[14] +
			a[1] * a[6] * a[8] * a[15] +
			a[1] * a[7] * a[10] * a[12] +
			a[2] * a[4] * a[9] * a[15] +
			a[2] * a[5] * a[11] * a[12] +
			a[2] * a[7] * a[8] * a[13] +
			a[3] * a[4] * a[10] * a[13] +
			a[3] * a[5] * a[8] * a[14] +
			a[3] * a[6] * a[9] * a[12] -
			a[0] * a[5] * a[11] * a[14] -
			a[0] * a[6] * a[9] * a[15] -
			a[0] * a[7] * a[10] * a[13] -
			a[1] * a[4] * a[10] * a[15] -
			a[1] * a[6] * a[11] * a[12] -
			a[1] * a[7] * a[8] * a[14] -
			a[2] * a[4] * a[11] * a[13] -
			a[2] * a[5] * a[8] * a[15] -
			a[2] * a[7] * a[9] * a[12] -
			a[3] * a[4] * a[9] * a[14] -
			a[3] * a[5] * a[10] * a[12] -
			a[3] * a[6] * a[8] * a[13];

		if (!m) {
			m = create4();
		}

		if (Math.abs(d) < 1.0e-10) {
			return identity4(m);
		}

		const id = 1.0 / d;

		[
			m[0],
			m[1],
			m[2],
			m[3],
			m[4],
			m[5],
			m[6],
			m[7],
			m[8],
			m[9],
			m[10],
			m[11],
			m[12],
			m[13],
			m[14],
			m[15],
		] = [
			id * (a[5] * a[10] * a[15] + a[6] * a[11] * a[13] + a[7] * a[9] * a[14] - a[5] * a[11] * a[14] - a[6] * a[9] * a[15] - a[7] * a[10] * a[13]),
			id * (a[1] * a[11] * a[14] + a[2] * a[9] * a[15] + a[3] * a[10] * a[13] - a[1] * a[10] * a[15] - a[2] * a[11] * a[13] - a[3] * a[9] * a[14]),
			id * (a[1] * a[6] * a[15] + a[2] * a[7] * a[13] + a[3] * a[5] * a[14] - a[1] * a[7] * a[14] - a[2] * a[5] * a[15] - a[3] * a[6] * a[13]),
			id * (a[1] * a[7] * a[10] + a[2] * a[5] * a[11] + a[3] * a[6] * a[9] - a[1] * a[6] * a[11] - a[2] * a[7] * a[9] - a[3] * a[5] * a[10]),

			id * (a[4] * a[11] * a[14] + a[6] * a[8] * a[15] + a[7] * a[10] * a[12] - a[4] * a[10] * a[15] - a[6] * a[11] * a[12] - a[7] * a[8] * a[14]),
			id * (a[0] * a[10] * a[15] + a[2] * a[11] * a[12] + a[3] * a[8] * a[14] - a[0] * a[11] * a[14] - a[2] * a[8] * a[15] - a[3] * a[10] * a[12]),
			id * (a[0] * a[7] * a[14] + a[2] * a[4] * a[15] + a[3] * a[6] * a[12] - a[0] * a[6] * a[15] - a[2] * a[7] * a[12] - a[3] * a[4] * a[14]),
			id * (a[0] * a[6] * a[11] + a[2] * a[7] * a[8] + a[3] * a[4] * a[10] - a[0] * a[7] * a[10] - a[2] * a[4] * a[11] - a[3] * a[6] * a[8]),

			id * (a[4] * a[9] * a[15] + a[5] * a[11] * a[12] + a[7] * a[8] * a[13] - a[4] * a[11] * a[13] - a[5] * a[8] * a[15] - a[7] * a[9] * a[12]),
			id * (a[0] * a[11] * a[13] + a[1] * a[8] * a[15] + a[3] * a[9] * a[12] - a[0] * a[9] * a[15] - a[1] * a[11] * a[12] - a[3] * a[8] * a[13]),
			id * (a[0] * a[5] * a[15] + a[1] * a[7] * a[12] + a[3] * a[4] * a[13] - a[0] * a[7] * a[13] - a[1] * a[4] * a[15] - a[3] * a[5] * a[12]),
			id * (a[0] * a[7] * a[9] + a[1] * a[4] * a[11] + a[3] * a[5] * a[8] - a[0] * a[5] * a[11] - a[1] * a[7] * a[8] - a[3] * a[4] * a[9]),

			id * (a[4] * a[10] * a[13] + a[5] * a[8] * a[14] + a[6] * a[9] * a[12] - a[4] * a[9] * a[14] - a[5] * a[10] * a[12] - a[6] * a[8] * a[13]),
			id * (a[0] * a[9] * a[14] + a[1] * a[10] * a[12] + a[2] * a[8] * a[13] - a[0] * a[10] * a[13] - a[1] * a[8] * a[14] - a[2] * a[9] * a[12]),
			id * (a[0] * a[6] * a[13] + a[1] * a[4] * a[14] + a[2] * a[5] * a[12] - a[0] * a[5] * a[14] - a[1] * a[6] * a[12] - a[2] * a[4] * a[13]),
			id * (a[0] * a[5] * a[10] + a[1] * a[6] * a[8] + a[2] * a[4] * a[9] - a[0] * a[6] * a[9] - a[1] * a[4] * a[10] - a[2] * a[5] * a[8]),
		];

		return m;
	}

	function transpose4(a: Float32Array, m?: Float32Array) {
		if (!m) {
			m = create4();
		}

		[
			m[1],
			m[2],
			m[3],
			m[4],
			m[6],
			m[7],
			m[8],
			m[9],
			m[11],
			m[12],
			m[13],
			m[14],
		] = [
			a[4],
			a[8],
			a[12],
			a[1],
			a[9],
			a[13],
			a[2],
			a[6],
			a[14],
			a[3],
			a[7],
			a[11],
		];
		return m;
	}

	Luminus.matrix = {
		create4: create4,
		identity4: identity4,
		translation4: translation4,
		rotation4: rotation4,
		scaling4: scaling4,
		lookAt: lookAt,
		multiply4: multiply4,
		inverse4: inverse4,
		transpose4: transpose4,
	};
})();
