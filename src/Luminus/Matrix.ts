Luminus.matrix = (() => {
	function create4() {
		return new Float32Array(16);
	}

	function identity4(m?: Float32Array) {
		if (!m) {
			m = create4();
		}
		// deno-fmt-ignore
		m[1] = m[2] = m[3] = m[4] = m[6] = m[7] = m[8] = m[9] = m[11] = m[12] = m[13] = m[14] = 0;
		// deno-fmt-ignore
		m[0] = m[5] = m[10] = m[15] = 1;
		return m;
	}

	function lookAt(eye: number[], center: number[], up: number[], m?: Float32Array) {
		if (!m) {
			m = create4();
		}

		const eyeX = eye[0], eyeY = eye[1], eyeZ = eye[2];
		const centerX = center[0], centerY = center[1], centerZ = center[2];
		const upX = up[0], upY = up[1], upZ = up[2];

		if (
			Math.abs(eyeX - centerX) < 0.000001 &&
			Math.abs(eyeY - centerY) < 0.000001 &&
			Math.abs(eyeZ - centerZ) < 0.000001
		) {
			return identity4(m);
		}

		let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;

		z0 = eyeX - centerX;
		z1 = eyeY - centerY;
		z2 = eyeZ - centerZ;

		len = 1 / Math.hypot(z0, z1, z2);
		z0 *= len;
		z1 *= len;
		z2 *= len;

		x0 = upY * z2 - upZ * z1;
		x1 = upZ * z0 - upX * z2;
		x2 = upX * z1 - upY * z0;
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
		m[12] = -(x0 * eyeX + x1 * eyeY + x2 * eyeZ);
		m[13] = -(y0 * eyeX + y1 * eyeY + y2 * eyeZ);
		m[14] = -(z0 * eyeX + z1 * eyeY + z2 * eyeZ);
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

		if (4 < m.length) {
			// deno-fmt-ignore
			[
				m[0], m[1], m[2], m[3],
				m[4], m[5], m[6], m[7],
				m[8], m[9], m[10], m[11],
				m[12], m[13], m[14], m[15],
			] = [
				a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12],
				a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13],
				a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14],
				a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15],
				a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12],
				a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13],
				a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14],
				a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15],
				a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12],
				a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13],
				a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14],
				a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15],
				a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12],
				a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13],
				a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14],
				a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15],
			];
		} else {
			// deno-fmt-ignore
			[
				m[0],
				m[1],
				m[2],
				m[3],
			] = [
				a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3],
				a[1] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13] * b[3],
				a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3],
				a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3],
			];
		}

		return m;
	}

	/*function quaternion(roll: number, pitch: number, yaw: number, m?: Float32Array) {
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
	}*/

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
		// deno-fmt-ignore
		m[3] = m[7] = m[11] = m[12] = m[13] = m[14] = 0;
		m[15] = 1;

		return m;
	}

	function inverse4(a: Float32Array, m?: Float32Array) {
		// deno-fmt-ignore
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

		// deno-fmt-ignore
		[
			m[0], m[1], m[2], m[3],
			m[4], m[5], m[6], m[7],
			m[8], m[9], m[10], m[11],
			m[12], m[13], m[14], m[15],
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

		// deno-fmt-ignore
		[
			m[1], m[2], m[3],
			m[4], m[6], m[7],
			m[8], m[9], m[11],
			m[12], m[13], m[14],
		] = [
			a[4], a[8], a[12],
			a[1], a[9], a[13],
			a[2], a[6], a[14],
			a[3], a[7], a[11],
		];
		return m;
	}

	function normalize3(a: Float32Array, m?: Float32Array) {
		let len = a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
		if (len > 0) {
			len = 1 / Math.sqrt(len);
		}

		if (!m) {
			m = new Float32Array(3);
		}

		m[0] = a[0] * len;
		m[1] = a[1] * len;
		m[2] = a[2] * len;

		return m;
	}

	function unProject(v4: Float32Array, uProjection: Float32Array, uView: Float32Array, m?: Float32Array) {
		if (!m) {
			m = new Float32Array(3);
		}

		const pv = multiply4(uView, uProjection);
		inverse4(pv, pv);

		const v = multiply4(pv, v4);

		if (v[3] === 0.0) {
			return create4();
		}

		m[0] = v[0] / v[3];
		m[1] = v[1] / v[3];
		m[2] = v[2] / v[3];

		return m;
	}

	return {
		create4: create4,
		identity4: identity4,
		translation4: translation4,
		rotation4: rotation4,
		scaling4: scaling4,
		lookAt: lookAt,
		multiply4: multiply4,
		inverse4: inverse4,
		transpose4: transpose4,
		normalize3: normalize3,
		unProject: unProject,
	};
})();
