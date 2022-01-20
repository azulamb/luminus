((script) => {
    const loaded = Promise.all([
        customElements.whenDefined('lu-world'),
        customElements.whenDefined('lu-model'),
    ]).then(() => { });
    const luminus = {
        console: console,
        loaded: loaded,
        matrix: null,
        model: null,
        models: {},
        createProgram: () => { return null; },
        createSupport: () => { return null; },
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
(() => {
    function create4() { return new Float32Array(16); }
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
        let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
        let eyex = eye[0];
        let eyey = eye[1];
        let eyez = eye[2];
        let upx = up[0];
        let upy = up[1];
        let upz = up[2];
        let centerx = center[0];
        let centery = center[1];
        let centerz = center[2];
        if (Math.abs(eyex - centerx) < 0.000001 &&
            Math.abs(eyey - centery) < 0.000001 &&
            Math.abs(eyez - centerz) < 0.000001) {
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
    ;
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
            m = create4();
        }
        m[0] = b[0] * a[0] + b[1] * a[4] + b[2] * m[8] + b[3] * m[12];
        m[1] = b[0] * a[1] + b[1] * a[5] + b[2] * m[9] + b[3] * m[13];
        m[2] = b[0] * a[2] + b[1] * a[6] + b[2] * m[10] + b[3] * m[14];
        m[3] = b[0] * a[3] + b[1] * a[7] + b[2] * m[11] + b[3] * m[15];
        m[4] = b[4] * a[0] + b[5] * a[4] + b[6] * m[8] + b[7] * m[12];
        m[5] = b[4] * a[1] + b[5] * a[5] + b[6] * m[9] + b[7] * m[13];
        m[6] = b[4] * a[2] + b[5] * a[6] + b[6] * m[10] + b[7] * m[14];
        m[7] = b[4] * a[3] + b[5] * a[7] + b[6] * m[11] + b[7] * m[15];
        m[8] = b[8] * a[0] + b[9] * a[4] + b[10] * m[8] + b[11] * m[12];
        m[9] = b[8] * a[1] + b[9] * a[5] + b[10] * m[9] + b[11] * m[13];
        m[10] = b[8] * a[2] + b[9] * a[6] + b[10] * m[10] + b[11] * m[14];
        m[11] = b[8] * a[3] + b[9] * a[7] + b[10] * m[11] + b[11] * m[15];
        m[12] = b[12] * a[0] + b[13] * a[4] + b[14] * m[8] + b[15] * m[12];
        m[13] = b[12] * a[1] + b[13] * a[5] + b[14] * m[9] + b[15] * m[13];
        m[14] = b[12] * a[2] + b[13] * a[6] + b[14] * m[10] + b[15] * m[14];
        m[15] = b[12] * a[3] + b[13] * a[7] + b[14] * m[11] + b[15] * m[15];
        return m;
    }
    ;
    Luminus.matrix = {
        create4: create4,
        identity4: identity4,
        translation4: translation4,
        scaling4: scaling4,
        lookAt: lookAt,
        multiply4: multiply4,
    };
})();
(() => {
    class Support {
        constructor(gl2) {
            this.gl = gl2;
            this.matrix = Luminus.matrix;
            this.info = Luminus.createProgram(this);
        }
        enables(...enables) {
            for (const enable of enables) {
                this.gl.enable(enable);
            }
            return this;
        }
        async init(vertex, fragment) {
            await this.info.init();
            await this.info.initShader(vertex, fragment);
            this.info.loadPosition();
            this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
            this.gl.clearDepth(1.0);
            this.gl.depthFunc(this.gl.LEQUAL);
            return this.info.program;
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
    }
    Luminus.createSupport = (gl2) => { return new Support(gl2); };
})();
(() => {
    class ProgramInfo {
        constructor(support) {
            this.support = support;
        }
        async init() {
            const program = this.support.gl.createProgram();
            if (!program) {
                throw new Error('Failure createProgram.');
            }
            this.program = program;
        }
        async initShader(vertex, fragment) {
            const gl = this.support.gl;
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
                type = type.type === 'x-shader/x-fragment' ? this.support.gl.FRAGMENT_SHADER : this.support.gl.VERTEX_SHADER;
            }
            return { type: type, source: source };
        }
        async createShader(type, source) {
            const gl = this.support.gl;
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
            const gl = this.support.gl;
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
    }
    Luminus.createProgram = (support) => { return new ProgramInfo(support); };
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
            if (this.hasAttribute('length')) {
                model.length = this.length;
            }
            else {
                this.length = model.length;
            }
        }
        get length() { return this.model.length; }
        set length(value) {
            const length = typeof value === 'number' ? value : parseFloat(value);
            this.model.length = length;
            this.setAttribute('length', length + '');
            this.rerender();
        }
        static get observedAttributes() { return ['length']; }
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
            style.innerHTML =
                [
                    ':host { display: none; color: #99ccfd; }',
                ].join('');
            return style;
        }
        get color() {
            return (window.getComputedStyle(this, '').color
                .replace(/\s/g, '')
                .replace(/rgba{0,1}\(([0-9\.\,]+)\)/, '$1') + ',1').split(',')
                .slice(0, 4)
                .map((v, i) => { return i === 3 ? parseFloat(v) : parseInt(v) / 255.0; });
        }
        get length() { return this.model.length; }
        set length(value) {
            const length = typeof value === 'number' ? value : parseFloat(value);
            this.model.length = length;
            this.setAttribute('length', length + '');
            this.rerender();
        }
        static get observedAttributes() { return ['length']; }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (oldVal === newVal) {
                return;
            }
            this.length = newVal;
        }
    }, script.dataset.prefix);
});
(() => {
    class Model {
        load() {
            this.loaded = false;
            this.complete = undefined;
            return Promise.resolve().then(() => {
                return this.onload();
            }).then(() => {
                this.loaded = true;
                if (this.afterload) {
                    this.afterload();
                }
            });
        }
        prepare(support) {
            this.complete = false;
            return this.onprepare(support).then(() => { this.complete = true; });
        }
        render(support) {
            if (this.complete) {
                return this.onrender(support);
            }
            if (this.loaded === undefined) {
                this.load().then(() => { this.prepare(support); }).then(() => { this.render(support); });
            }
            if (this.complete === undefined) {
                this.prepare(support).then(() => { this.render(support); });
            }
        }
        onload() { return Promise.resolve(); }
        onprepare(support) { return Promise.resolve(); }
        onrender(support) { }
    }
    Luminus.models.model = Model;
})();
((script, init) => {
    if (document.readyState !== 'loading') {
        return init(script);
    }
    document.addEventListener('DOMContentLoaded', () => { init(script); });
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
            const shadow = this.attachShadow({ mode: 'open' });
            shadow.appendChild(this.initStyle());
        }
        initStyle() {
            const style = document.createElement('style');
            style.innerHTML =
                [
                    ':host { display: none; }',
                ].join('');
            return style;
        }
        get model() { return this._model; }
        set model(model) {
            this._model = model;
            model.afterload = () => {
                const support = this.support;
                if (support) {
                    model.prepare(support);
                }
            };
        }
        get x() { return parseFloat(this.getAttribute('x') || '0') || 0; }
        set x(value) { this.setAttribute('x', value + ''); }
        get y() { return parseFloat(this.getAttribute('y') || '0') || 0; }
        set y(value) { this.setAttribute('y', value + ''); }
        get z() { return parseFloat(this.getAttribute('z') || '0') || 0; }
        set z(value) { this.setAttribute('z', value + ''); }
        get complete() { return this.model && this.model.complete === true; }
        get support() {
            var _a;
            return (_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.support;
        }
        render(support) {
            this.model.render(support);
        }
        rerender() {
            this.dispatchEvent(new CustomEvent('render'));
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
            style.innerHTML =
                [
                    ':host { display: block; }',
                    'canvas { display: block; width: 100%; height: 100%; }',
                ].join('');
            this.canvas = document.createElement('canvas');
            this.width = (this.hasAttribute('width') ? (parseInt(this.getAttribute('width') || '')) : 0) || 400;
            this.height = (this.hasAttribute('height') ? (parseInt(this.getAttribute('height') || '')) : 0) || 400;
            const contents = document.createElement('div');
            contents.appendChild(this.canvas);
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
        get complete() { return this._complete; }
        get support() { return this.lSupport; }
        get width() { return this.canvas.width; }
        set width(value) { this.canvas.width = typeof value === 'number' ? Math.floor(value) : (parseInt(value) || 0); }
        get height() { return this.canvas.height; }
        set height(value) { this.canvas.height = typeof value === 'number' ? Math.floor(value) : (parseInt(value) || 0); }
        get top() { return parseFloat(this.getAttribute('top') || '') || 0; }
        set top(value) { this.setAttribute('top', value + ''); }
        get bottom() { return parseFloat(this.getAttribute('bottom') || '') || 0; }
        set bottom(value) { this.setAttribute('bottom', value + ''); }
        get left() { return parseFloat(this.getAttribute('left') || '') || 0; }
        set left(value) { this.setAttribute('left', value + ''); }
        get right() { return parseFloat(this.getAttribute('right') || '') || 0; }
        set right(value) { this.setAttribute('right', value + ''); }
        get near() { return parseFloat(this.getAttribute('near') || '') || 0; }
        set near(value) { this.setAttribute('near', value + ''); }
        get far() { return parseFloat(this.getAttribute('far') || '') || 0; }
        set far(value) { this.setAttribute('far', value + ''); }
        get view() { return this.getAttribute('view') === 'volume' ? 'volume' : 'frustum'; }
        set view(value) { this.setAttribute('view', value === 'volume' ? 'volume' : 'frustum'); }
        get eyex() { return parseFloat(this.getAttribute('eyex') || '') || 0; }
        set eyex(value) { this.setAttribute('eyex', value + ''); }
        get eyey() { return parseFloat(this.getAttribute('eyey') || '') || 0; }
        set eyey(value) { this.setAttribute('eyey', value + ''); }
        get eyez() { return parseFloat(this.getAttribute('eyez') || '') || 0; }
        set eyez(value) { this.setAttribute('eyez', value + ''); }
        get upx() { return parseFloat(this.getAttribute('upx') || '') || 0; }
        set upx(value) { this.setAttribute('upx', value + ''); }
        get upy() { return parseFloat(this.getAttribute('upy') || '') || 0; }
        set upy(value) { this.setAttribute('upy', value + ''); }
        get upz() { return parseFloat(this.getAttribute('upz') || '') || 0; }
        set upz(value) { this.setAttribute('upz', value + ''); }
        get centerx() { return parseFloat(this.getAttribute('centerx') || '') || 0; }
        set centerx(value) { this.setAttribute('centerx', value + ''); }
        get centery() { return parseFloat(this.getAttribute('centery') || '') || 0; }
        set centery(value) { this.setAttribute('centery', value + ''); }
        get centerz() { return parseFloat(this.getAttribute('centerz') || '') || 0; }
        set centerz(value) { this.setAttribute('centerz', value + ''); }
        async init() {
            Luminus.console.info('Start: init lu-world.');
            const vertex = `#version 300 es
in vec4 aVertexPosition;
in vec4 aVertexColor;
uniform mat4 uModelViewMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
out lowp vec4 vColor;
void main(void) {
	gl_Position = uProjectionMatrix * uViewMatrix * uModelViewMatrix * aVertexPosition;
	vColor = aVertexColor;
}`;
            const fragment = `#version 300 es
in lowp vec4 vColor;
out lowp vec4 outColor;
void main(void) {
	outColor = vColor;
}`;
            const support = Luminus.createSupport(this.canvas.getContext("webgl2"));
            await support.init(document.getElementById('vertex') || vertex, document.getElementById('fragment') || fragment);
            this.lSupport = support;
            support.enables(support.gl.DEPTH_TEST, support.gl.CULL_FACE);
            this.uProjection = support.orthographic(this.left, this.right, this.bottom, this.top, this.near, this.far);
            this.uView = support.matrix.identity4();
            this.uModel = support.matrix.identity4();
            this._complete = true;
        }
        render() {
            if (!this.complete) {
                return;
            }
            Luminus.console.info('Render:');
            const gl2 = this.support.gl;
            this.support.matrix.lookAt([this.eyex, this.eyey, this.eyez], [this.centerx, this.centery, this.centerz], [this.upx, this.upy, this.upz], this.uView);
            gl2.useProgram(this.support.info.program);
            gl2.uniformMatrix4fv(this.support.info.uniform.uProjectionMatrix, false, this.uProjection);
            gl2.uniformMatrix4fv(this.support.info.uniform.uViewMatrix, false, this.uView);
            gl2.uniformMatrix4fv(this.support.info.uniform.uModelViewMatrix, false, this.uModel);
            this.support.clear();
            for (const model of this.children) {
                if (model instanceof Luminus.model) {
                    Luminus.matrix.translation4(model.x, model.y, model.z, this.uModel);
                    gl2.uniformMatrix4fv(this.support.info.uniform.uModelViewMatrix, false, this.uModel);
                    model.render(this.support);
                }
            }
            gl2.flush();
        }
        static get observedAttributes() { return ['width', 'height']; }
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
(() => {
    class Axis extends Luminus.models.model {
        constructor() {
            super();
            this._length = 10;
        }
        get length() { return this._length; }
        set length(value) {
            this._length = value;
            this._change = true;
        }
        onprepare(support) {
            const length = this.length;
            const gl2 = support.gl;
            const vao = support.gl.createVertexArray();
            if (!vao) {
                return Promise.reject(new Error('Failure createVertexArray.'));
            }
            support.gl.bindVertexArray(vao);
            const positionBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ARRAY_BUFFER, positionBuffer);
            gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array([
                0, 0, 0, length, 0, 0,
                0, 0, 0, 0, length, 0,
                0, 0, 0, 0, 0, length,
            ]), gl2.STATIC_DRAW);
            gl2.enableVertexAttribArray(support.info.in.aVertexPosition);
            gl2.vertexAttribPointer(support.info.in.aVertexPosition, 3, gl2.FLOAT, false, 0, 0);
            const colorBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ARRAY_BUFFER, colorBuffer);
            gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array([
                1, 0, 0, 1, 1, 0, 0, 1,
                0, 1, 0, 1, 0, 1, 0, 1,
                0, 0, 1, 1, 0, 0, 1, 1,
            ]), gl2.STATIC_DRAW);
            gl2.enableVertexAttribArray(support.info.in.aVertexColor);
            gl2.vertexAttribPointer(support.info.in.aVertexColor, 4, gl2.FLOAT, false, 0, 0);
            support.gl.bindVertexArray(null);
            this.vao = vao;
            this._change = false;
            return Promise.resolve();
        }
        onrender(support) {
            const gl = support.gl;
            if (this._change) {
                this.prepare(support);
            }
            support.gl.bindVertexArray(this.vao);
            gl.drawArrays(gl.LINES, 0, 6);
            support.gl.bindVertexArray(null);
        }
    }
    Luminus.models.axis = Axis;
})();
(() => {
    class Cube extends Luminus.models.model {
        constructor() {
            super(...arguments);
            this.color = new Float32Array(4);
        }
        onload() {
            this.verts = new Float32Array([
                0, 0, 1, 0, 0, 0, 0, 1, 1,
                0, 1, 0, 1, 0, 1, 1, 0, 0,
                1, 1, 1, 1, 1, 0, 0, 0, 1,
                0, 1, 1, 1, 0, 1, 1, 1, 1,
                0, 0, 0, 0, 1, 0, 1, 0, 0,
                1, 1, 0, 0, 0, 1, 1, 0, 1,
                0, 0, 0, 1, 0, 0, 0, 1, 1,
                1, 1, 1, 0, 1, 0, 1, 1, 0,
            ]);
            this.colors = new Float32Array([...Array(24 * 4)]);
            for (let i = 0; i < this.colors.length; i += 4) {
                this.colors[i] = this.color[0];
                this.colors[i + 1] = this.color[1];
                this.colors[i + 2] = this.color[2];
                this.colors[i + 3] = this.color[3];
            }
            this.faces = new Uint16Array([
                2, 1, 0, 3, 1, 2,
                4, 5, 6, 6, 5, 7,
                10, 9, 8, 11, 9, 10,
                12, 13, 14, 14, 13, 15,
                18, 17, 16, 19, 17, 18,
                20, 21, 22, 22, 21, 23,
            ]);
            return Promise.resolve();
        }
        onprepare(support) {
            Luminus.console.info('Start: cube-prepare.');
            const gl2 = support.gl;
            const vao = support.gl.createVertexArray();
            if (!vao) {
                return Promise.reject(new Error('Failure createVertexArray.'));
            }
            support.gl.bindVertexArray(vao);
            const positionBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ARRAY_BUFFER, positionBuffer);
            gl2.bufferData(gl2.ARRAY_BUFFER, this.verts, gl2.STATIC_DRAW);
            gl2.enableVertexAttribArray(support.info.in.aVertexPosition);
            gl2.vertexAttribPointer(support.info.in.aVertexPosition, 3, gl2.FLOAT, false, 0, 0);
            const colorBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ARRAY_BUFFER, colorBuffer);
            gl2.bufferData(gl2.ARRAY_BUFFER, this.colors, gl2.STATIC_DRAW);
            gl2.enableVertexAttribArray(support.info.in.aVertexColor);
            gl2.vertexAttribPointer(support.info.in.aVertexColor, 4, gl2.FLOAT, false, 0, 0);
            const indexBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl2.bufferData(gl2.ELEMENT_ARRAY_BUFFER, this.faces, gl2.STATIC_DRAW);
            support.gl.bindVertexArray(null);
            this.vao = vao;
            this.count = this.faces.length;
            return Promise.resolve();
        }
        onrender(support) {
            const gl = support.gl;
            support.gl.bindVertexArray(this.vao);
            gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
            support.gl.bindVertexArray(null);
        }
    }
    Luminus.models.cube = Cube;
})();
