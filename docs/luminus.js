((script) => {
    const loaded = Promise.all([
        customElements.whenDefined('lu-world'),
        customElements.whenDefined('lu-model'),
    ]).then(() => { });
    const luminus = {
        version: '',
        console: console,
        loaded: loaded,
        matrix: null,
        model: null,
        models: {},
        states: {},
        world: null,
        createSupport: () => {
            return null;
        },
        ray: null,
    };
    if (script.dataset.debug === undefined) {
        luminus.console = {
            debug: () => { },
            error: () => { },
            info: () => { },
            log: () => { },
            warn: () => { },
        };
    }
    window.Luminus = luminus;
})(document.currentScript);
Luminus.version = '0.1.0';
(() => {
    Luminus.world = class {
        constructor() {
            this.eye = { x: 0, y: 0, z: 0 };
            this.center = { x: 0, y: 0, z: 0 };
            this.up = { x: 0, y: 0, z: 0 };
            this.light = {
                x: 0,
                y: 0,
                z: 0,
                color: new Float32Array([0, 0, 0]),
                ambient: new Float32Array([0, 0, 0]),
            };
            this.screen = {
                left: 0,
                right: 0,
                bottom: 0,
                top: 0,
                near: 0,
                far: 0,
            };
        }
        async init(support) {
            this.support = support;
            const vertex = `#version 300 es
in vec3 vPosition;
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
	gl_Position = uProjection * uView * uModel * vec4(vPosition, 1.0);

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
            await support.init(document.getElementById('vertex') || vertex, document.getElementById('fragment') || fragment);
            support.enables(support.gl.DEPTH_TEST, support.gl.CULL_FACE);
            this.uProjection = support.orthographic(this.screen.left, this.screen.right, this.screen.bottom, this.screen.top, this.screen.near, this.screen.far);
            this.uView = support.matrix.identity4();
            this.uModel = support.matrix.identity4();
            this.iModel = support.matrix.identity4();
        }
        beginRender() {
            const gl2 = this.support.gl;
            this.support.matrix.lookAt([this.eye.x, this.eye.y, this.eye.z], [this.center.x, this.center.y, this.center.z], [this.up.x, this.up.y, this.up.z], this.uView);
            gl2.useProgram(this.support.program);
            gl2.uniformMatrix4fv(this.support.uniform.uProjection, false, this.uProjection);
            gl2.uniformMatrix4fv(this.support.uniform.uView, false, this.uView);
            gl2.uniformMatrix4fv(this.support.uniform.uModel, false, this.uModel);
            gl2.uniform3f(this.support.uniform.lDirection, this.light.x, this.light.y, this.light.z);
            gl2.uniform3fv(this.support.uniform.lColor, this.light.color);
            gl2.uniform3fv(this.support.uniform.aColor, this.light.ambient);
            gl2.uniformMatrix4fv(this.support.uniform.iModel, false, this.iModel);
            this.support.clear();
        }
        modelRender(model) {
            const gl2 = this.support.gl;
            model.copyMatrix(this.uModel);
            gl2.uniformMatrix4fv(this.support.uniform.uModel, false, this.uModel);
            this.support.matrix.inverse4(this.uModel, this.iModel);
            gl2.uniformMatrix4fv(this.support.uniform.iModel, false, this.iModel);
            gl2.uniform1f(this.support.uniform.lMin, model.model.lMin === undefined ? 0.3 : model.model.lMin);
            model.render(this);
        }
        endRender() {
            this.support.gl.flush();
        }
        unProject(viewport, screenX, screenY, z = 1) {
            const x = (screenX - viewport[0]) * 2 / viewport[2] - 1;
            const y = 1 - (screenY - viewport[1]) * 2 / viewport[3];
            const position = Luminus.matrix.unProject(new Float32Array([x, y, z, 1.0]), this.uProjection, this.uView);
            return position;
        }
    };
})();
Luminus.matrix = (() => {
    function create4() {
        return new Float32Array(16);
    }
    function identity4(m) {
        if (!m) {
            m = create4();
        }
        m[1] = m[2] = m[3] = m[4] = m[6] = m[7] = m[8] = m[9] = m[11] = m[12] = m[13] = m[14] = 0;
        m[0] = m[5] = m[10] = m[15] = 1;
        return m;
    }
    function lookAt(eye, center, up, m) {
        if (!m) {
            m = create4();
        }
        const eyex = eye[0], eyey = eye[1], eyez = eye[2];
        const centerx = center[0], centery = center[1], centerz = center[2];
        const upx = up[0], upy = up[1], upz = up[2];
        if (Math.abs(eyex - centerx) < 0.000001 &&
            Math.abs(eyey - centery) < 0.000001 &&
            Math.abs(eyez - centerz) < 0.000001) {
            return identity4(m);
        }
        let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
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
        }
        else {
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
        }
        else {
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
    function translation4(x, y, z, m) {
        if (!m) {
            m = identity4();
        }
        else {
            identity4(m);
        }
        m[12] = x;
        m[13] = y;
        m[14] = z;
        return m;
    }
    function scaling4(x, y, z, m) {
        if (!m) {
            m = identity4();
        }
        else {
            identity4(m);
        }
        m[0] = x;
        m[5] = y;
        m[10] = z;
        return m;
    }
    function multiply4(a, b, m) {
        if (!m) {
            m = b.length < 16 ? new Float32Array(4) : create4();
        }
        if (4 < m.length) {
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
        }
        else {
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
    function quaternion(roll, pitch, yaw, m) {
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
    function rotation4(roll, pitch, yaw, m) {
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
    function inverse4(a, m) {
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
    function transpose4(a, m) {
        if (!m) {
            m = create4();
        }
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
    function normalize3(a, m) {
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
    function unProject(v4, uProjection, uView, m) {
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
(() => {
    class Support {
        constructor(gl2) {
            this.gl = gl2;
            this.texture = [];
            this.matrix = Luminus.matrix;
        }
        enables(...enables) {
            for (const enable of enables) {
                this.gl.enable(enable);
            }
            return this;
        }
        async init(vertex, fragment) {
            const program = this.gl.createProgram();
            if (!program) {
                throw new Error('Failure createProgram.');
            }
            this.program = program;
            await Promise.all([
                this.initShader(vertex, fragment),
                this.loadTexture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQYV2P4////fwAJ+wP9BUNFygAAAABJRU5ErkJggg=='),
            ]);
            this.loadPosition();
            this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
            this.gl.clearDepth(1.0);
            this.gl.depthFunc(this.gl.LEQUAL);
            return this.program;
        }
        async initShader(vertex, fragment) {
            const gl = this.gl;
            const program = this.program;
            const vertexShader = await (typeof vertex === 'string' ? this.loadShader(gl.VERTEX_SHADER, vertex) : this.loadShader(vertex)).then((result) => {
                this.vertex = result.source;
                return this.createShader(result.type, result.source);
            });
            const fragmentShader = await (typeof fragment === 'string' ? this.loadShader(gl.FRAGMENT_SHADER, fragment) : this.loadShader(fragment)).then((result) => {
                return this.createShader(result.type, result.source);
            });
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                throw new Error(gl.getProgramInfoLog(program) || '');
            }
        }
        async loadShader(type, source) {
            if (typeof type !== 'number') {
                source = type.textContent || '';
                type = type.type === 'x-shader/x-fragment' ? this.gl.FRAGMENT_SHADER : this.gl.VERTEX_SHADER;
            }
            return { type: type, source: source };
        }
        async createShader(type, source) {
            const gl = this.gl;
            const shader = gl.createShader(type);
            if (!shader) {
                throw new Error('Failure createShader.');
            }
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                return shader;
            }
            gl.deleteShader(shader);
            throw new Error(gl.getShaderInfoLog(shader) || '');
        }
        loadPosition() {
            const gl = this.gl;
            const program = this.program;
            const inPosition = {};
            const uniformPosition = {};
            const vertex = this.vertex || '';
            let result;
            const inReg = new RegExp(/\sin [^\s]+ ([^\;\s]+)\;/sg);
            while (result = inReg.exec(vertex)) {
                const key = result[1];
                inPosition[key] = gl.getAttribLocation(program, key);
            }
            const uniformReg = new RegExp(/\suniform [^\s]+ ([^\;\s]+)\;/sg);
            while (result = uniformReg.exec(vertex)) {
                const key = result[1];
                uniformPosition[key] = gl.getUniformLocation(program, key);
            }
            this.in = inPosition;
            this.uniform = uniformPosition;
            return this;
        }
        clear(mask) {
            this.gl.clear(mask === undefined ? this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT : mask);
            return this;
        }
        orthographic(left, right, bottom, top, near, far) {
            const m = new Float32Array(16);
            const lr = 1 / (left - right);
            const bt = 1 / (bottom - top);
            const nf = 1 / (near - far);
            m[1] = m[2] = m[3] = m[4] = m[6] = m[7] = m[8] = m[9] = m[11] = 0;
            m[0] = -2 * lr;
            m[5] = -2 * bt;
            m[10] = 2 * nf;
            m[12] = (left + right) * lr;
            m[13] = (top + bottom) * bt;
            m[14] = (far + near) * nf;
            m[15] = 1;
            return m;
        }
        setViewPort(x, y, width, height) {
            this.gl.viewport(x, y, width, height);
            return this;
        }
        getViewport() {
            return this.gl.getParameter(this.gl.VIEWPORT);
        }
        loadTexture(image, num) {
            const img = typeof image === 'string' ? document.createElement('img') : image;
            const index = num === undefined ? this.texture.length : num;
            if (!this.texture[index]) {
                this.texture[index] = null;
            }
            return (img.complete && img.src ? Promise.resolve(img) : new Promise((resolve, reject) => {
                img.onload = () => {
                    resolve(img);
                };
                img.onerror = reject;
                img.onabort = reject;
                if (typeof image === 'string') {
                    img.src = image;
                }
            })).then((img) => {
                const gl = this.gl;
                const texture = gl.createTexture();
                if (!texture) {
                    throw new Error('Failure createTexture.');
                }
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.bindTexture(gl.TEXTURE_2D, null);
                this.texture[index] = texture;
                return index;
            });
        }
        useTexture(num) {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture[num] || null);
        }
    }
    Luminus.createSupport = (gl2) => {
        return new Support(gl2);
    };
})();
(() => {
    Luminus.ray = class {
        constructor(x, y, z, vx, vy, vz) {
            this.origin = new Float32Array(3);
            this.vector = new Float32Array(3);
            if (typeof x === 'number') {
                this.setOrigin(x, y, z);
                this.setVector(vx, vy, vz);
            }
            else {
                this.setOrigin(x);
                this.setVector(y);
            }
        }
        setOrigin(x, y, z) {
            if (typeof x === 'number') {
                this.origin[0] = x;
                this.origin[1] = y;
                this.origin[2] = z;
            }
            else {
                this.origin[0] = x[0];
                this.origin[1] = x[1];
                this.origin[2] = x[2];
            }
            return this;
        }
        setVector(x, y, z) {
            if (typeof x === 'number') {
                this.vector[0] = x;
                this.vector[1] = y;
                this.vector[2] = z;
            }
            else {
                this.vector[0] = x[0];
                this.vector[1] = x[1];
                this.vector[2] = x[2];
            }
            Luminus.matrix.normalize3(this.vector, this.vector);
            return this;
        }
        clone() {
            return new Luminus.ray(this.origin, this.vector);
        }
        transform(matrix) {
            const start = new Float32Array([...this.origin, 1.0]);
            const end = new Float32Array([
                this.origin[0] + this.vector[0],
                this.origin[1] + this.vector[1],
                this.origin[2] + this.vector[2],
                1.0,
            ]);
            Luminus.matrix.multiply4(matrix, start, start);
            Luminus.matrix.multiply4(matrix, end, end);
            this.setOrigin(start);
            this.setVector(end[0] - start[0], end[1] - start[1], end[2] - start[2]);
            return this;
        }
        include(a, b, c) {
            return a[0] * b[1] * c[2] + a[1] * b[2] * c[0] + a[2] * b[0] * c[1] -
                a[0] * b[2] * c[1] - a[1] * b[0] * c[2] - a[2] * b[1] * c[0];
        }
        rayCast(triangle, position) {
            if (!position) {
                position = new Float32Array(3);
            }
            const ray = new Float32Array([-1 * this.vector[0], -1 * this.vector[1], -1 * this.vector[2]]);
            const edge1 = new Float32Array([
                triangle[3] - triangle[0],
                triangle[4] - triangle[1],
                triangle[5] - triangle[2],
            ]);
            const edge2 = new Float32Array([
                triangle[6] - triangle[0],
                triangle[7] - triangle[1],
                triangle[8] - triangle[2],
            ]);
            const denominator = this.include(edge1, edge2, ray);
            if (denominator <= 0) {
                return Infinity;
            }
            const d = new Float32Array([
                this.origin[0] - triangle[0],
                this.origin[1] - triangle[1],
                this.origin[2] - triangle[2],
            ]);
            const u = this.include(d, edge2, ray) / denominator;
            if (0 <= u && u <= 1) {
                const v = this.include(edge1, d, ray) / denominator;
                if (0 <= v && u + v <= 1) {
                    const distance = this.include(edge1, edge2, d) / denominator;
                    if (distance < 0) {
                        return Infinity;
                    }
                    position[0] = this.origin[0] + ray[0] * distance;
                    position[1] = this.origin[1] + ray[1] * distance;
                    position[2] = this.origin[2] + ray[2] * distance;
                    return distance;
                }
            }
            return Infinity;
        }
        collisionDetectionTriangles(verts, faces) {
            let min = Infinity;
            const triangle = new Float32Array(9);
            for (let i = 0; i < faces.length; i += 3) {
                const a = faces[i] * 3;
                triangle[0] = verts[a];
                triangle[1] = verts[a + 1];
                triangle[2] = verts[a + 2];
                const b = faces[i + 1] * 3;
                triangle[3] = verts[b];
                triangle[4] = verts[b + 1];
                triangle[5] = verts[b + 2];
                const c = faces[i + 2] * 3;
                triangle[6] = verts[c];
                triangle[7] = verts[c + 1];
                triangle[8] = verts[c + 2];
                const distance = this.rayCast(triangle);
                if (distance < min) {
                    min = distance;
                }
            }
            return min;
        }
    };
})();
(() => {
    Luminus.models.model = class Model {
        load(p) {
            this.loaded = false;
            this.complete = undefined;
            return (p || Promise.resolve(null)).then((result) => {
                return this.onload(result);
            }).then(() => {
                this.loaded = true;
                if (this.afterload) {
                    this.afterload();
                }
            });
        }
        prepare(world) {
            if (!this.loaded) {
                return Promise.resolve();
            }
            this.complete = false;
            return this.onprepare(world).then(() => {
                this.complete = true;
            });
        }
        render(world) {
            if (this.complete) {
                return this.onrender(world);
            }
            if (this.loaded === true && this.complete === undefined) {
                this.prepare(world).then(() => {
                    this.render(world);
                });
            }
        }
        onload(arg) {
            return Promise.resolve();
        }
        onprepare(world) {
            return Promise.resolve();
        }
        onrender(world) { }
        collisionDetection(cd) {
            return Infinity;
        }
    };
})();
(() => {
    Luminus.states.state = class State {
        constructor() {
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.matrix = Luminus.matrix.identity4();
        }
        update() {
            Luminus.matrix.translation4(this.x, this.y, this.z, this.matrix);
        }
    };
})();
(() => {
    Luminus.states.axisRotate = class AxisRotate extends Luminus.states.state {
        constructor() {
            super();
            this.cx = 0;
            this.cy = 0;
            this.cz = 0;
            this.xaxis = 0;
            this.yaxis = 0;
            this.zaxis = 0;
            this.roll = 0;
            this.pitch = 0;
            this.yaw = 0;
        }
        update() {
            [
                Luminus.matrix.translation4(this.x, this.y, this.z),
                Luminus.matrix.rotation4(this.roll + this.xaxis, this.pitch + this.yaxis, this.yaw + this.zaxis),
                Luminus.matrix.translation4(-this.cx, -this.cy, -this.cz),
            ].reduce((p, n) => {
                return Luminus.matrix.multiply4(n, p, this.matrix);
            }, Luminus.matrix.identity4());
        }
    };
})();
(() => {
    Luminus.models.axis = class Axis extends Luminus.models.model {
        constructor() {
            super();
            this.lMin = 1;
            this.loaded = true;
            this._length = 10;
        }
        get length() {
            return this._length;
        }
        set length(value) {
            this._length = value;
            this._change = true;
        }
        onprepare(world) {
            const length = this.length;
            const gl2 = world.support.gl;
            const vao = gl2.createVertexArray();
            if (!vao) {
                return Promise.reject(new Error('Failure createVertexArray.'));
            }
            const support = world.support;
            gl2.bindVertexArray(vao);
            const positionBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ARRAY_BUFFER, positionBuffer);
            gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array([
                0, 0, 0, length, 0, 0,
                0, 0, 0, 0, length, 0,
                0, 0, 0, 0, 0, length,
            ]), gl2.STATIC_DRAW);
            gl2.enableVertexAttribArray(support.in.vPosition);
            gl2.vertexAttribPointer(support.in.vPosition, 3, gl2.FLOAT, false, 0, 0);
            const colorBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ARRAY_BUFFER, colorBuffer);
            gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array([
                1, 0, 0, 1, 1, 0, 0, 1,
                0, 1, 0, 1, 0, 1, 0, 1,
                0, 0, 1, 1, 0, 0, 1, 1,
            ]), gl2.STATIC_DRAW);
            gl2.enableVertexAttribArray(support.in.vColor);
            gl2.vertexAttribPointer(support.in.vColor, 4, gl2.FLOAT, false, 0, 0);
            gl2.bindVertexArray(null);
            this.vao = vao;
            this._change = false;
            return Promise.resolve();
        }
        onrender(world) {
            const gl2 = world.support.gl;
            if (this._change) {
                this.prepare(world);
            }
            gl2.bindVertexArray(this.vao);
            gl2.drawArrays(gl2.LINES, 0, 6);
            gl2.bindVertexArray(null);
        }
    };
})();
(() => {
    class Cube extends Luminus.models.model {
        constructor() {
            super(...arguments);
            this.loaded = true;
            this.color = new Float32Array(4);
            this._length = 1;
        }
        get length() {
            return this._length;
        }
        set length(value) {
            this._length = value;
            this._change = true;
        }
        onprepare(world) {
            Luminus.console.info('Start: cube-prepare.');
            const l = this._length;
            this.verts = new Float32Array([
                0, 0, l, l, 0, l, l, l, l,
                0, l, l, 0, 0, 0, 0, l, 0,
                l, l, 0, l, 0, 0, 0, l, 0,
                0, l, l, l, l, l, l, l, 0,
                0, 0, 0, l, 0, 0, l, 0, l,
                0, 0, l, l, 0, 0, l, l, 0,
                l, l, l, l, 0, l, 0, 0, 0,
                0, 0, l, 0, l, l, 0, l, 0,
            ]);
            const colors = new Float32Array([...Array(this.verts.length / 3 * 4)]);
            for (let i = 0; i < colors.length; i += 4) {
                colors[i] = this.color[0];
                colors[i + 1] = this.color[1];
                colors[i + 2] = this.color[2];
                colors[i + 3] = this.color[3];
            }
            const normals = new Float32Array([
                0, 0, 1, 0, 0, 1, 0, 0, 1,
                0, 0, 1, 0, 0, -1, 0, 0, -1,
                0, 0, -1, 0, 0, -1, 0, 1, 0,
                0, 1, 0, 0, 1, 0, 0, 1, 0,
                0, -1, 0, 0, -1, 0, 0, -1, 0,
                0, -1, 0, 1, 0, 0, 1, 0, 0,
                1, 0, 0, 1, 0, 0, -1, 0, 0,
                -1, 0, 0, -1, 0, 0, -1, 0, 0,
            ]);
            this.faces = new Uint16Array([
                0, 1, 2, 0, 2, 3, 4, 5, 6,
                4, 6, 7, 8, 9, 10, 8, 10, 11,
                12, 13, 14, 12, 14, 15, 16, 17, 18,
                16, 18, 19, 20, 21, 22, 20, 22, 23,
            ]);
            const gl2 = world.support.gl;
            const vao = gl2.createVertexArray();
            if (!vao) {
                return Promise.reject(new Error('Failure createVertexArray.'));
            }
            const support = world.support;
            gl2.bindVertexArray(vao);
            const positionBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ARRAY_BUFFER, positionBuffer);
            gl2.bufferData(gl2.ARRAY_BUFFER, this.verts, gl2.STATIC_DRAW);
            gl2.enableVertexAttribArray(support.in.vPosition);
            gl2.vertexAttribPointer(support.in.vPosition, 3, gl2.FLOAT, false, 0, 0);
            const colorBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ARRAY_BUFFER, colorBuffer);
            gl2.bufferData(gl2.ARRAY_BUFFER, colors, gl2.STATIC_DRAW);
            gl2.enableVertexAttribArray(support.in.vColor);
            gl2.vertexAttribPointer(support.in.vColor, 4, gl2.FLOAT, false, 0, 0);
            const normalBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ARRAY_BUFFER, normalBuffer);
            gl2.bufferData(gl2.ARRAY_BUFFER, normals, gl2.STATIC_DRAW);
            gl2.enableVertexAttribArray(support.in.vNormal);
            gl2.vertexAttribPointer(support.in.vNormal, 3, gl2.FLOAT, false, 0, 0);
            const indexBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl2.bufferData(gl2.ELEMENT_ARRAY_BUFFER, this.faces, gl2.STATIC_DRAW);
            gl2.bindVertexArray(null);
            this.vao = vao;
            this._change = false;
            return Promise.resolve();
        }
        onrender(world) {
            const gl2 = world.support.gl;
            if (this._change) {
                this.prepare(world);
            }
            gl2.bindVertexArray(this.vao);
            gl2.drawElements(gl2.TRIANGLES, 36, gl2.UNSIGNED_SHORT, 0);
            gl2.bindVertexArray(null);
        }
        collisionDetection(cd) {
            return cd.collisionDetectionTriangles(this.verts, this.faces);
        }
    }
    Luminus.models.cube = Cube;
})();
(() => {
    class Line extends Luminus.models.model {
        constructor() {
            super();
            this.lMin = 1;
            this.loaded = true;
            this.position = new Float32Array([0, 0, 0, 0, 0, 0]);
            this.colors = new Float32Array([1, 1, 1, 1, 1, 1, 1, 1]);
        }
        onprepare(world) {
            const gl2 = world.support.gl;
            const vao = gl2.createVertexArray();
            if (!vao) {
                return Promise.reject(new Error('Failure createVertexArray.'));
            }
            const support = world.support;
            gl2.bindVertexArray(vao);
            const positionBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ARRAY_BUFFER, positionBuffer);
            gl2.bufferData(gl2.ARRAY_BUFFER, this.position, gl2.STATIC_DRAW);
            gl2.enableVertexAttribArray(support.in.vPosition);
            gl2.vertexAttribPointer(support.in.vPosition, 3, gl2.FLOAT, false, 0, 0);
            const colorBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ARRAY_BUFFER, colorBuffer);
            gl2.bufferData(gl2.ARRAY_BUFFER, this.colors, gl2.STATIC_DRAW);
            gl2.enableVertexAttribArray(support.in.vColor);
            gl2.vertexAttribPointer(support.in.vColor, 4, gl2.FLOAT, false, 0, 0);
            gl2.bindVertexArray(null);
            this.vao = vao;
            this._change = false;
            return Promise.resolve();
        }
        onrender(world) {
            const gl2 = world.support.gl;
            if (this._change) {
                this.prepare(world);
            }
            gl2.bindVertexArray(this.vao);
            gl2.drawArrays(gl2.LINES, 0, 2);
            gl2.bindVertexArray(null);
        }
        start(x, y, z) {
            this.position[0] = x;
            this.position[1] = y;
            this.position[2] = z;
            this._change = true;
            return this;
        }
        end(x, y, z) {
            this.position[3] = x;
            this.position[4] = y;
            this.position[5] = z;
            this._change = true;
            return this;
        }
        color(r0, g0, b0, a0, r1, g1, b1, a1) {
            if (a0 === undefined) {
                this.colors[0] = this.colors[4] = r0;
                this.colors[1] = this.colors[5] = g0;
                this.colors[2] = this.colors[6] = b0;
                this.colors[3] = this.colors[7] = 1;
                return this;
            }
            if (r1 === undefined) {
                this.colors[0] = this.colors[4] = r0;
                this.colors[1] = this.colors[5] = g0;
                this.colors[2] = this.colors[6] = b0;
                this.colors[3] = this.colors[7] = a0;
                return this;
            }
            if (b1 === undefined) {
                this.colors[0] = r0;
                this.colors[1] = g0;
                this.colors[2] = b0;
                this.colors[4] = a0;
                this.colors[5] = r1;
                this.colors[6] = g1;
                this.colors[3] = this.colors[7] = 1;
                return this;
            }
            if (a1 !== undefined) {
                this.colors[0] = r0;
                this.colors[1] = g0;
                this.colors[2] = b0;
                this.colors[3] = a0;
                this.colors[4] = r1;
                this.colors[5] = g1;
                this.colors[6] = b1;
                this.colors[7] = a1;
            }
            return this;
        }
    }
    Luminus.models.line = Line;
})();
(() => {
    class VoxReader {
        constructor() {
            this.r = 0;
        }
        parse(data, unknown = false) {
            this.r = 0;
            const vox = this.readText(data, 4);
            if (vox !== 'VOX ') {
                throw new Error('Error: File format is not vox.');
            }
            const result = {
                version: 0,
                pack: 1,
                models: [],
                palette: [],
            };
            if (unknown) {
                result.unknows = [];
            }
            result.version = this.readInt(data);
            const chunk = {
                PACK: (header) => {
                    return { models: this.readInt(data) };
                },
                SIZE: (header) => {
                    return {
                        x: this.readInt(data),
                        y: this.readInt(data),
                        z: this.readInt(data),
                    };
                },
                XYZI: (header) => {
                    const count = this.readInt(data);
                    const boxes = [];
                    for (let i = 0; i < count; ++i) {
                        boxes.push({
                            x: this.readByte(data),
                            y: this.readByte(data),
                            z: this.readByte(data),
                            c: this.readByte(data),
                        });
                    }
                    return {
                        count: count,
                        boxes: boxes,
                    };
                },
                RGBA: (header) => {
                    const palette = [];
                    const size = header.chunk / 4;
                    for (let i = 0; i < size; ++i) {
                        palette.push(this.read(data, 4));
                    }
                    return {
                        palette: palette,
                    };
                },
                UNKNOWN: (header) => {
                    const d = this.read(data, header.chunk);
                    return { ...header, data: d };
                },
            };
            while (true) {
                const header = this.readChunkHeader(data);
                if (!header.name) {
                    break;
                }
                if (!(header.name in chunk)) {
                    const unknown = chunk.UNKNOWN(header);
                    if (result.unknows) {
                        result.unknows.push(unknown);
                    }
                }
                switch (header.name) {
                    case 'SIZE': {
                        const size = chunk.SIZE(header);
                        result.models.push({
                            size: size,
                            count: 0,
                            xyzi: [],
                        });
                        break;
                    }
                    case 'XYZI': {
                        const xyzi = chunk.XYZI(header);
                        result.models[result.models.length - 1].count = xyzi.count;
                        result.models[result.models.length - 1].xyzi = xyzi.boxes;
                        break;
                    }
                    case 'RGBA': {
                        const rgba = chunk.RGBA(header);
                        result.palette = rgba.palette;
                        break;
                    }
                }
            }
            return result;
        }
        readChunkHeader(data) {
            return {
                name: this.readText(data, 4),
                chunk: this.readInt(data),
                child: this.readInt(data),
            };
        }
        seek(seek) {
            this.r = seek;
        }
        next(next) {
            this.r += next;
        }
        read(data, read) {
            const result = data.slice(this.r, this.r + read);
            this.r += read;
            return result;
        }
        readText(data, read) {
            return new TextDecoder().decode(this.read(data, read));
        }
        readByte(data) {
            const v = this.read(data, 1);
            return v[0];
        }
        readInt(data) {
            const v = this.read(data, 4);
            return v[0] | (v[1] << 8) + (v[2] << 16) + (v[3] << 24);
        }
    }
    class Vox extends Luminus.models.model {
        constructor() {
            super(...arguments);
            this.color = new Float32Array(4);
        }
        onload(result) {
            if (!result.ok) {
                return Promise.resolve();
            }
            return result.blob().then((blob) => {
                return blob.arrayBuffer();
            }).then((buffer) => {
                const data = new Uint8Array(buffer);
                return (new VoxReader()).parse(data);
            }).then((vox) => {
                const palette = [];
                vox.models.forEach((model) => {
                    model.xyzi.forEach((voxel) => {
                        const color = vox.palette[voxel.c - 1];
                        let index = palette.indexOf(color);
                        if (index < 0) {
                            index = palette.length;
                            palette.push(color);
                        }
                        voxel.c = index;
                    });
                });
                vox.palette = palette;
                return vox;
            }).then((vox) => {
                this.vox = vox;
                const verts = [];
                const colors = [];
                const normals = [];
                const faces = [];
                const tmpFacef = [];
                vox.models.forEach((model) => {
                    model.xyzi.forEach((voxel) => {
                        const x = voxel.y;
                        const y = voxel.z;
                        const z = voxel.x;
                        tmpFacef.push({
                            v: [x, y, z + 1, x + 1, y, z + 1, x + 1, y + 1, z + 1, x, y + 1, z + 1],
                            c: voxel.c,
                            n: [0, 0, 1],
                        }, {
                            v: [x, y, z, x, y + 1, z, x + 1, y + 1, z, x + 1, y, z],
                            c: voxel.c,
                            n: [0, 0, -1],
                        }, {
                            v: [x, y + 1, z, x, y + 1, z + 1, x + 1, y + 1, z + 1, x + 1, y + 1, z],
                            c: voxel.c,
                            n: [0, 1, 0],
                        }, {
                            v: [x, y, z, x + 1, y, z, x + 1, y, z + 1, x, y, z + 1],
                            c: voxel.c,
                            n: [0, -1, 0],
                        }, {
                            v: [x + 1, y, z, x + 1, y + 1, z, x + 1, y + 1, z + 1, x + 1, y, z + 1],
                            c: voxel.c,
                            n: [1, 0, 0],
                        }, {
                            v: [x, y, z, x, y, z + 1, x, y + 1, z + 1, x, y + 1, z],
                            c: voxel.c,
                            n: [-1, 0, 0],
                        });
                    });
                });
                tmpFacef.filter((face, index) => {
                    if (!face) {
                        return false;
                    }
                    for (let i = index + 1; i < tmpFacef.length; ++i) {
                        const r = tmpFacef[i];
                        if (!r || face.c !== r.c) {
                            continue;
                        }
                        if (face.v[0] === r.v[0] && face.v[1] === r.v[1] && face.v[2] === r.v[2] &&
                            face.v[3] === r.v[9] && face.v[4] === r.v[10] && face.v[5] === r.v[11] &&
                            face.v[6] === r.v[6] && face.v[7] === r.v[7] && face.v[8] === r.v[8] &&
                            face.v[9] === r.v[3] && face.v[10] === r.v[4] && face.v[11] === r.v[5]) {
                            tmpFacef[index] = tmpFacef[i] = null;
                            return false;
                        }
                    }
                    return true;
                }).forEach((face) => {
                    const n = verts.length / 3;
                    const c = vox.palette[face.c];
                    const color = [c[0] / 255.0, c[1] / 255.0, c[2] / 255.0, c[3] / 255.0];
                    verts.push(...face.v);
                    colors.push(...color, ...color, ...color, ...color);
                    normals.push(...face.n, ...face.n, ...face.n, ...face.n);
                    faces.push(n, n + 1, n + 2, n, n + 2, n + 3);
                });
                this.verts = new Float32Array(verts);
                this.colors = new Float32Array(colors);
                this.normals = new Float32Array(normals);
                this.faces = new Uint16Array(faces);
            });
        }
        onprepare(world) {
            Luminus.console.info('Start: vox-prepare.');
            const gl2 = world.support.gl;
            const vao = gl2.createVertexArray();
            if (!vao) {
                return Promise.reject(new Error('Failure createVertexArray.'));
            }
            const support = world.support;
            gl2.bindVertexArray(vao);
            const positionBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ARRAY_BUFFER, positionBuffer);
            gl2.bufferData(gl2.ARRAY_BUFFER, this.verts, gl2.STATIC_DRAW);
            gl2.enableVertexAttribArray(support.in.vPosition);
            gl2.vertexAttribPointer(support.in.vPosition, 3, gl2.FLOAT, false, 0, 0);
            const colorBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ARRAY_BUFFER, colorBuffer);
            gl2.bufferData(gl2.ARRAY_BUFFER, this.colors, gl2.STATIC_DRAW);
            gl2.enableVertexAttribArray(support.in.vColor);
            gl2.vertexAttribPointer(support.in.vColor, 4, gl2.FLOAT, false, 0, 0);
            const normalBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ARRAY_BUFFER, normalBuffer);
            gl2.bufferData(gl2.ARRAY_BUFFER, this.normals, gl2.STATIC_DRAW);
            gl2.enableVertexAttribArray(support.in.vNormal);
            gl2.vertexAttribPointer(support.in.vNormal, 3, gl2.FLOAT, false, 0, 0);
            const indexBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl2.bufferData(gl2.ELEMENT_ARRAY_BUFFER, this.faces, gl2.STATIC_DRAW);
            gl2.bindVertexArray(null);
            this.vao = vao;
            this.count = this.faces.length;
            return Promise.resolve();
        }
        onrender(world) {
            const gl2 = world.support.gl;
            gl2.bindVertexArray(this.vao);
            gl2.drawElements(gl2.TRIANGLES, this.count, gl2.UNSIGNED_SHORT, 0);
            gl2.bindVertexArray(null);
        }
        collisionDetection(cd) {
            return cd.collisionDetectionTriangles(this.verts, this.faces);
        }
        export() {
            const data = [];
            data.push(strToBin('VOX '));
            data.push(intToBin(150));
            data.push(createChunkHeader('MAIN', 0, 0));
            let size = 0;
            this.vox.models.forEach((model) => {
                data.push(createChunkHeader('SIZE', 12, 0));
                size += 12;
                data.push(intToBin(model.size.x));
                data.push(intToBin(model.size.y));
                data.push(intToBin(model.size.z));
                size += 12;
                data.push(createChunkHeader('XYZI', model.xyzi.length * 4 + 4, 0));
                size += 12;
                data.push(intToBin(model.xyzi.length));
                size += 4;
                model.xyzi.forEach((voxel) => {
                    data.push(new Uint8Array([voxel.x, voxel.y, voxel.z, voxel.c + 1]));
                    size += 4;
                });
                size += 12;
            });
            data.push(createChunkHeader('RGBA', 256 * 4, 0));
            data.push(...this.vox.palette);
            for (let i = this.vox.palette.length; i < 255; ++i) {
                data.push(new Uint8Array([0, 0, 0, 255]));
            }
            data.push(new Uint8Array([0, 0, 0, 0]));
            size += 256 * 4;
            setSize(data[2], size);
            const result = new Uint8Array(data.reduce((prev, now) => {
                return prev + now.length;
            }, 0));
            let offset = 0;
            for (const d of data) {
                result.set(d, offset);
                offset += d.length;
            }
            return result;
        }
    }
    function createChunkHeader(name, chunk, children) {
        const header = new Uint8Array(12);
        header.set(strToBin(name));
        header.set(intToBin(chunk), 4);
        header.set(intToBin(children), 8);
        return header;
    }
    function strToBin(str) {
        return new TextEncoder().encode(str);
    }
    function intToBin(n) {
        const result = new Uint8Array(4);
        result[0] = n & 0xff;
        result[1] = (n >>> 8) & 0xff;
        result[2] = (n >>> 16) & 0xff;
        result[3] = (n >>> 24) & 0xff;
        return result;
    }
    function setSize(main, n) {
        main[8] = n & 0xff;
        main[9] = (n >>> 8) & 0xff;
        main[10] = (n >>> 16) & 0xff;
        main[11] = (n >>> 24) & 0xff;
    }
    Luminus.models.vox = Vox;
})();
((script, init) => {
    customElements.whenDefined((script.dataset.prefix || 'lu') + '-world').then(() => {
        init(script);
    });
})(document.currentScript, (script) => {
    ((component, prefix = 'lu') => {
        const tagname = prefix + '-axis';
        if (customElements.get(tagname)) {
            return;
        }
        customElements.define(tagname, component);
    })(class extends Luminus.model {
        constructor() {
            super();
            const model = new Luminus.models.axis();
            this.model = model;
            setTimeout(() => {
                if (this.hasAttribute('length')) {
                    model.length = this.length;
                }
                else {
                    this.length = model.length;
                }
            }, 0);
        }
        get length() {
            return this.model.length;
        }
        set length(value) {
            const length = typeof value === 'number' ? value : parseFloat(value);
            this.model.length = length;
            this.setAttribute('length', length + '');
            this.rerender();
        }
        static get observedAttributes() {
            return ['length'];
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (oldVal === newVal) {
                return;
            }
            this.length = newVal;
        }
    }, script.dataset.prefix);
});
((script, init) => {
    customElements.whenDefined((script.dataset.prefix || 'lu') + '-world').then(() => {
        init(script);
    });
})(document.currentScript, (script) => {
    ((component, prefix = 'lu') => {
        const tagname = prefix + '-cube';
        if (customElements.get(tagname)) {
            return;
        }
        customElements.define(tagname, component);
    })(class extends Luminus.model {
        constructor() {
            super();
            const model = new Luminus.models.cube();
            const color = this.color;
            model.color[0] = color[0];
            model.color[1] = color[1];
            model.color[2] = color[2];
            model.color[3] = color[3];
            model.load();
            this.model = model;
        }
        initStyle() {
            const style = document.createElement('style');
            style.innerHTML = [
                ':host { display: block; color: #99ccfd; }',
            ].join('');
            return style;
        }
        get color() {
            return (window.getComputedStyle(this, '').color
                .replace(/\s/g, '')
                .replace(/rgba{0,1}\(([0-9\.\,]+)\)/, '$1') + ',1').split(',')
                .slice(0, 4)
                .map((v, i) => {
                return i === 3 ? parseFloat(v) : parseInt(v) / 255.0;
            });
        }
        get length() {
            return this.model.length;
        }
        set length(value) {
            const length = typeof value === 'number' ? value : parseFloat(value);
            this.model.length = length;
            this.setAttribute('length', length + '');
            this.rerender();
        }
        static get observedAttributes() {
            return ['length', ...Luminus.model.observedAttributes];
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (oldVal === newVal) {
                return;
            }
            switch (attrName) {
                case 'length':
                    this.length = newVal;
                    break;
                default:
                    super.attributeChangedCallback(attrName, oldVal, newVal);
            }
        }
    }, script.dataset.prefix);
});
((script, init) => {
    customElements.whenDefined((script.dataset.prefix || 'lu') + '-world').then(() => {
        init(script);
    });
})(document.currentScript, (script) => {
    ((component, prefix = 'lu') => {
        const tagname = prefix + '-line';
        if (customElements.get(tagname)) {
            return;
        }
        customElements.define(tagname, component);
    })(class extends Luminus.model {
        constructor() {
            super();
            const model = new Luminus.models.line();
            this.model = model;
            this.updatePosition();
        }
        updatePosition() {
            if (this._updatePosition) {
                clearTimeout(this._updatePosition);
            }
            this._updatePosition = setTimeout(() => {
                this.model.start(this.sx, this.sy, this.sz).end(this.ex, this.ey, this.ez);
                this._updatePosition = 0;
                this.rerender();
            }, 0);
        }
        get sx() {
            return parseFloat(this.getAttribute('sx') || '') || 0;
        }
        set sx(value) {
            const n = typeof value === 'number' ? value : parseFloat(value);
            this.setAttribute('sx', n + '');
        }
        get sy() {
            return parseFloat(this.getAttribute('sy') || '') || 0;
        }
        set sy(value) {
            const n = typeof value === 'number' ? value : parseFloat(value);
            this.setAttribute('sy', n + '');
        }
        get sz() {
            return parseFloat(this.getAttribute('sz') || '') || 0;
        }
        set sz(value) {
            const n = typeof value === 'number' ? value : parseFloat(value);
            this.setAttribute('sz', n + '');
        }
        get ex() {
            return parseFloat(this.getAttribute('ex') || '') || 0;
        }
        set ex(value) {
            const n = typeof value === 'number' ? value : parseFloat(value);
            this.setAttribute('ex', n + '');
        }
        get ey() {
            return parseFloat(this.getAttribute('ey') || '') || 0;
        }
        set ey(value) {
            const n = typeof value === 'number' ? value : parseFloat(value);
            this.setAttribute('ey', n + '');
        }
        get ez() {
            return parseFloat(this.getAttribute('ez') || '') || 0;
        }
        set ez(value) {
            const n = typeof value === 'number' ? value : parseFloat(value);
            this.setAttribute('ez', n + '');
        }
        start(x, y, z) {
            this.sx = x;
            this.sy = y;
            this.sz = z;
            return this;
        }
        end(x, y, z) {
            this.ex = x;
            this.ey = y;
            this.ez = z;
            return this;
        }
        color(r0, g0, b0, a0, r1, g1, b1, a1) {
            return this;
        }
        static get observedAttributes() {
            return ['sx', 'sy', 'sz', 'ex', 'ey', 'ez'];
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (oldVal === newVal) {
                return;
            }
            this.updatePosition();
        }
    }, script.dataset.prefix);
});
((script, init) => {
    if (document.readyState !== 'loading') {
        return init(script);
    }
    document.addEventListener('DOMContentLoaded', () => {
        init(script);
    });
})(document.currentScript, (script) => {
    ((component, prefix = 'lu') => {
        const tagname = prefix + '-model';
        if (customElements.get(tagname)) {
            return;
        }
        customElements.define(tagname, component);
        customElements.whenDefined(tagname).then(() => {
            Luminus.model = (customElements.get(tagname));
        });
    })(class extends HTMLElement {
        constructor() {
            super();
            this._timer = 0;
            this.state = this.createState();
            const shadow = this.attachShadow({ mode: 'open' });
            shadow.appendChild(this.initStyle());
            this.updateMatrix(true);
        }
        createState() {
            return new Luminus.states.axisRotate();
        }
        initStyle() {
            const style = document.createElement('style');
            style.innerHTML = [
                ':host { display: block; }',
            ].join('');
            return style;
        }
        copyMatrix(out) {
            out.set(this.state.matrix);
        }
        updateMatrix(sync = false) {
            if (this._timer) {
                clearTimeout(this._timer);
            }
            if (sync) {
                return this.onUpdateMatrix();
            }
            this._timer = setTimeout(() => {
                this.onUpdateMatrix();
                this.rerender();
            }, 0);
        }
        onUpdateMatrix() {
            this.state.update();
        }
        collisionDetection(cd) {
            const tmp = cd.clone();
            tmp.transform(Luminus.matrix.inverse4(this.state.matrix));
            return this.model.collisionDetection(tmp);
        }
        get model() {
            return this._model;
        }
        set model(model) {
            this._model = model;
            model.afterload = () => {
                var _a;
                if ((_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.complete) {
                    model.prepare(this.world);
                }
            };
        }
        get selectable() {
            return this.hasAttribute('selectable');
        }
        set selectable(value) {
            if (!value) {
                this.removeAttribute('selectable');
            }
            else {
                this.setAttribute('selectable', '');
            }
        }
        get x() {
            return parseFloat(this.getAttribute('x') || '0') || 0;
        }
        set x(value) {
            this.setAttribute('x', value + '');
            this.state.x = value;
            this.updateMatrix();
        }
        get y() {
            return parseFloat(this.getAttribute('y') || '0') || 0;
        }
        set y(value) {
            this.setAttribute('y', value + '');
            this.state.y = value;
            this.updateMatrix();
        }
        get z() {
            return parseFloat(this.getAttribute('z') || '0') || 0;
        }
        set z(value) {
            this.setAttribute('z', value + '');
            this.state.z = value;
            this.updateMatrix();
        }
        get cx() {
            return parseFloat(this.getAttribute('cx') || '0') || 0;
        }
        set cx(value) {
            this.setAttribute('cx', value + '');
            this.state.cx = value;
            this.updateMatrix();
        }
        get cy() {
            return parseFloat(this.getAttribute('cy') || '0') || 0;
        }
        set cy(value) {
            this.setAttribute('cy', value + '');
            this.state.cx = value;
            this.updateMatrix();
        }
        get cz() {
            return parseFloat(this.getAttribute('cz') || '0') || 0;
        }
        set cz(value) {
            this.setAttribute('cz', value + '');
            this.state.cx = value;
            this.updateMatrix();
        }
        get xaxis() {
            return parseFloat(this.getAttribute('xaxis') || '0') || 0;
        }
        set xaxis(value) {
            this.setAttribute('xaxis', value + '');
            this.state.xaxis = value;
            this.updateMatrix();
        }
        get yaxis() {
            return parseFloat(this.getAttribute('yaxis') || '0') || 0;
        }
        set yaxis(value) {
            this.setAttribute('yaxis', value + '');
            this.state.yaxis = value;
            this.updateMatrix();
        }
        get zaxis() {
            return parseFloat(this.getAttribute('zaxis') || '0') || 0;
        }
        set zaxis(value) {
            this.setAttribute('zaxis', value + '');
            this.state.zaxis = value;
            this.updateMatrix();
        }
        get roll() {
            return parseFloat(this.getAttribute('roll') || '0') || 0;
        }
        set roll(value) {
            this.setAttribute('roll', value + '');
            this.state.roll = value;
            this.updateMatrix();
        }
        get pitch() {
            return parseFloat(this.getAttribute('pitch') || '0') || 0;
        }
        set pitch(value) {
            this.setAttribute('pitch', value + '');
            this.state.pitch = value;
            this.updateMatrix();
        }
        get yaw() {
            return parseFloat(this.getAttribute('yaw') || '0') || 0;
        }
        set yaw(value) {
            this.setAttribute('yaw', value + '');
            this.state.yaw = value;
            this.updateMatrix();
        }
        get complete() {
            return this.model && this.model.complete === true;
        }
        get world() {
            var _a;
            return (_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.world;
        }
        render(world) {
            this.model.render(world);
        }
        rerender() {
            this.dispatchEvent(new CustomEvent('render'));
        }
        static get observedAttributes() {
            return ['x', 'y', 'z', 'cx', 'cy', 'cz', 'xaxis', 'yaxis', 'zaxis', 'roll', 'pitch', 'yaw'];
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (oldVal === newVal) {
                return;
            }
            switch (attrName) {
                case 'x':
                case 'y':
                case 'z':
                case 'cx':
                case 'cy':
                case 'cz':
                case 'xaxis':
                case 'yaxis':
                case 'zaxis':
                case 'roll':
                case 'pitch':
                case 'yaw':
                    this[attrName] = parseFloat(newVal);
                    break;
            }
        }
    }, script.dataset.prefix);
});
((script, init) => {
    customElements.whenDefined((script.dataset.prefix || 'lu') + '-world').then(() => {
        init(script);
    });
})(document.currentScript, (script) => {
    ((component, prefix = 'lu') => {
        const tagname = prefix + '-vox';
        if (customElements.get(tagname)) {
            return;
        }
        customElements.define(tagname, component);
    })(class extends Luminus.model {
        constructor() {
            super();
            const model = new Luminus.models.vox();
            model.afterload = () => {
                this.rerender();
            };
            this.model = model;
            if (this.src) {
                this.load();
            }
        }
        get src() {
            return this.getAttribute('src') || '';
        }
        set src(value) {
            const old = this.src;
            if (old === value) {
                return;
            }
            this.setAttribute('src', value);
            this.load();
        }
        load(init) {
            const url = this.src;
            if (!url) {
                return;
            }
            this.model.load(fetch(url, init)).then(() => {
                this.rerender();
            });
        }
        import(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const data = reader.result;
                    const response = new Response(data);
                    this.model.load(Promise.resolve(response)).then(() => {
                        this.rerender();
                        resolve();
                    });
                };
                reader.onerror = reject;
                reader.onabort = reject;
                reader.readAsArrayBuffer(file);
            }).then(() => {
                return this;
            });
        }
        export() {
            return this.model.export();
        }
        static get observedAttributes() {
            return ['src', ...Luminus.model.observedAttributes];
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (oldVal === newVal) {
                return;
            }
            switch (attrName) {
                case 'src':
                    break;
                default:
                    super.attributeChangedCallback(attrName, oldVal, newVal);
            }
        }
    }, script.dataset.prefix);
});
((script, init) => {
    customElements.whenDefined((script.dataset.prefix || 'lu') + '-model').then(() => {
        init(script);
    });
})(document.currentScript, (script) => {
    ((component, prefix = 'lu') => {
        const tagname = prefix + '-world';
        if (customElements.get(tagname)) {
            return;
        }
        customElements.define(tagname, component);
    })(class extends HTMLElement {
        constructor() {
            super();
            this._complete = false;
            const shadow = this.attachShadow({ mode: 'open' });
            const style = document.createElement('style');
            style.innerHTML = [
                ':host { display: block; background: black; --light: white; --ambient: rgba( 255, 255, 255, 0 ); }',
                'canvas { display: block; width: 100%; height: 100%; }',
            ].join('');
            this.canvas = document.createElement('canvas');
            this.canvas.addEventListener('click', (event) => {
                const list = this.searchSelectedModels(event.offsetX, event.offsetY);
                if (list.length <= 0) {
                    return;
                }
                const selectedEvent = this.createSelectedEvent();
                for (const data of list) {
                    console.log('dispatch', data);
                    data.model.dispatchEvent(selectedEvent.event);
                    if (!selectedEvent.next) {
                        continue;
                    }
                }
            });
            this.width = (this.hasAttribute('width') ? (parseInt(this.getAttribute('width') || '')) : 0) || 400;
            this.height = (this.hasAttribute('height') ? (parseInt(this.getAttribute('height') || '')) : 0) || 400;
            const contents = document.createElement('div');
            contents.appendChild(this.canvas);
            contents.appendChild(document.createElement('slot'));
            shadow.appendChild(style);
            shadow.appendChild(contents);
            this.init().then(() => {
                this.render();
            });
            (() => {
                let timer;
                this.addEventListener('render', (event) => {
                    if (timer) {
                        clearTimeout(timer);
                    }
                    timer = setTimeout(() => {
                        this.render();
                        timer = 0;
                    }, 0);
                }, true);
            })();
        }
        createSelectedEvent() {
            const data = {
                next: true,
                event: new CustomEvent('select', {
                    cancelable: true,
                }),
            };
            data.event.stopPropagation = () => {
                data.next = false;
            };
            return data;
        }
        searchSelectedModels(screenX, screenY) {
            const viewport = this.world.support.getViewport();
            const origin = this.world.unProject(viewport, screenX, screenY, -1);
            const position = this.world.unProject(viewport, screenX, screenY, 1);
            const vector = new Float32Array([
                position[0] - origin[0],
                position[1] - origin[1],
                position[2] - origin[2],
            ]);
            const line = document.getElementById('line');
            line.sx = origin[0];
            line.sy = origin[1];
            line.sz = origin[2];
            line.ex = position[0];
            line.ey = position[1];
            line.ez = position[2];
            const ray = new Luminus.ray(origin, vector);
            const list = [];
            for (const child of this.querySelectorAll('[selectable]')) {
                const model = child;
                if (!(model instanceof Luminus.model)) {
                    continue;
                }
                const distance = model.collisionDetection(ray);
                if (isFinite(distance)) {
                    list.push({ distance: distance, model: model });
                }
            }
            if (list.length <= 0) {
                return list;
            }
            list.sort((a, b) => {
                return a.distance - b.distance;
            });
            return list;
        }
        get complete() {
            return this._complete;
        }
        get world() {
            return this._world;
        }
        get width() {
            return this.canvas.width;
        }
        set width(value) {
            this.canvas.width = typeof value === 'number' ? Math.floor(value) : (parseInt(value) || 0);
        }
        get height() {
            return this.canvas.height;
        }
        set height(value) {
            this.canvas.height = typeof value === 'number' ? Math.floor(value) : (parseInt(value) || 0);
        }
        get top() {
            return parseFloat(this.getAttribute('top') || '') || 0;
        }
        set top(value) {
            this.setAttribute('top', value + '');
            this.world.screen.top = value;
        }
        get bottom() {
            return parseFloat(this.getAttribute('bottom') || '') || 0;
        }
        set bottom(value) {
            this.setAttribute('bottom', value + '');
            this.world.screen.bottom = value;
        }
        get left() {
            return parseFloat(this.getAttribute('left') || '') || 0;
        }
        set left(value) {
            this.setAttribute('left', value + '');
            this.world.screen.left = value;
        }
        get right() {
            return parseFloat(this.getAttribute('right') || '') || 0;
        }
        set right(value) {
            this.setAttribute('right', value + '');
            this.world.screen.right = value;
        }
        get near() {
            return parseFloat(this.getAttribute('near') || '') || 0;
        }
        set near(value) {
            this.setAttribute('near', value + '');
            this.world.screen.near = value;
        }
        get far() {
            return parseFloat(this.getAttribute('far') || '') || 0;
        }
        set far(value) {
            this.setAttribute('far', value + '');
            this.world.screen.far = value;
        }
        get view() {
            return this.getAttribute('view') === 'volume' ? 'volume' : 'frustum';
        }
        set view(value) {
            this.setAttribute('view', value === 'volume' ? 'volume' : 'frustum');
        }
        get eyex() {
            return parseFloat(this.getAttribute('eyex') || '') || 0;
        }
        set eyex(value) {
            this.setAttribute('eyex', value + '');
            this.world.eye.x = value;
        }
        get eyey() {
            return parseFloat(this.getAttribute('eyey') || '') || 0;
        }
        set eyey(value) {
            this.setAttribute('eyey', value + '');
            this.world.eye.y = value;
        }
        get eyez() {
            return parseFloat(this.getAttribute('eyez') || '') || 0;
        }
        set eyez(value) {
            this.setAttribute('eyez', value + '');
            this.world.eye.z = value;
        }
        get centerx() {
            return parseFloat(this.getAttribute('centerx') || '') || 0;
        }
        set centerx(value) {
            this.setAttribute('centerx', value + '');
            this.world.center.x = value;
        }
        get centery() {
            return parseFloat(this.getAttribute('centery') || '') || 0;
        }
        set centery(value) {
            this.setAttribute('centery', value + '');
            this.world.center.y = value;
        }
        get centerz() {
            return parseFloat(this.getAttribute('centerz') || '') || 0;
        }
        set centerz(value) {
            this.setAttribute('centerz', value + '');
            this.world.center.z = value;
        }
        get upx() {
            return parseFloat(this.getAttribute('upx') || '') || 0;
        }
        set upx(value) {
            this.setAttribute('upx', value + '');
            this.world.up.x = value;
        }
        get upy() {
            return parseFloat(this.getAttribute('upy') || '') || 0;
        }
        set upy(value) {
            this.setAttribute('upy', value + '');
            this.world.up.y = value;
        }
        get upz() {
            return parseFloat(this.getAttribute('upz') || '') || 0;
        }
        set upz(value) {
            this.setAttribute('upz', value + '');
            this.world.up.z = value;
        }
        get lightx() {
            return parseFloat(this.getAttribute('lightx') || '') || 0;
        }
        set lightx(value) {
            this.setAttribute('lightx', value + '');
            this.world.light.x = value;
        }
        get lighty() {
            return parseFloat(this.getAttribute('lighty') || '') || 0;
        }
        set lighty(value) {
            this.setAttribute('lighty', value + '');
            this.world.light.y = value;
        }
        get lightz() {
            return parseFloat(this.getAttribute('lightz') || '') || 0;
        }
        set lightz(value) {
            this.setAttribute('lightz', value + '');
            this.world.light.z = value;
        }
        async init(world) {
            Luminus.console.info('Start: init lu-world.');
            this._complete = false;
            this._world = null;
            const support = Luminus.createSupport(this.canvas.getContext('webgl2'));
            this._world = !world ? new Luminus.world() : world;
            this.world.screen.left = this.left;
            this.world.screen.right = this.right;
            this.world.screen.bottom = this.bottom;
            this.world.screen.top = this.top;
            this.world.screen.near = this.near;
            this.world.screen.far = this.far;
            this.world.light.x = this.lightx;
            this.world.light.y = this.lighty;
            this.world.light.z = this.lightz;
            this.world.light.color.set(this.lightColor);
            this.world.light.ambient.set(this.ambientColor);
            if (this.hasAttribute('eyex')) {
                this.eyex = this.eyex;
            }
            if (this.hasAttribute('eyey')) {
                this.eyey = this.eyey;
            }
            if (this.hasAttribute('eyez')) {
                this.eyez = this.eyez;
            }
            if (this.hasAttribute('centerx')) {
                this.centerx = this.centerx;
            }
            if (this.hasAttribute('centery')) {
                this.centery = this.centery;
            }
            if (this.hasAttribute('centerz')) {
                this.centerz = this.centerz;
            }
            if (this.hasAttribute('upx')) {
                this.upx = this.upx;
            }
            if (this.hasAttribute('upy')) {
                this.upy = this.upy;
            }
            if (this.hasAttribute('upx')) {
                this.upx = this.upx;
            }
            await this.world.init(support);
            this._complete = true;
        }
        render() {
            if (!this.complete) {
                return;
            }
            Luminus.console.info('Render:');
            this.world.beginRender();
            this.world.light.color.set(this.lightColor);
            this.world.light.ambient.set(this.ambientColor);
            for (const model of this.children) {
                if (model instanceof Luminus.model) {
                    this.world.modelRender(model);
                }
            }
            this.world.endRender();
        }
        get ambientColor() {
            return (window.getComputedStyle(this, '').getPropertyValue('--ambient')
                .replace(/\s/g, '')
                .replace(/rgba{0,1}\(([0-9\.\,]+)\)/, '$1') + ',1').split(',')
                .slice(0, 4)
                .map((v, i, a) => {
                return parseInt(v) / 255.0 * parseFloat(a[3]);
            })
                .slice(0, 3);
        }
        get lightColor() {
            return (window.getComputedStyle(this, '').getPropertyValue('--light')
                .replace(/\s/g, '')
                .replace(/rgba{0,1}\(([0-9\.\,]+)\)/, '$1') + ',1').split(',')
                .slice(0, 3)
                .map((v) => {
                return parseInt(v) / 255.0;
            });
        }
        static get observedAttributes() {
            return ['width', 'height'];
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (oldVal === newVal) {
                return;
            }
            switch (attrName) {
                case 'width':
                    this.width = newVal;
                    break;
                case 'height':
                    this.height = newVal;
                    break;
            }
        }
    }, script.dataset.prefix);
});
