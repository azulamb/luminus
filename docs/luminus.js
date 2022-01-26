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
Luminus.version = '0.0.1';
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
        m[0] = b[0] * a[0] + b[1] * a[4] + b[2] * a[8] + b[3] * a[12];
        m[1] = b[0] * a[1] + b[1] * a[5] + b[2] * a[9] + b[3] * a[13];
        m[2] = b[0] * a[2] + b[1] * a[6] + b[2] * a[10] + b[3] * a[14];
        m[3] = b[0] * a[3] + b[1] * a[7] + b[2] * a[11] + b[3] * a[15];
        m[4] = b[4] * a[0] + b[5] * a[4] + b[6] * a[8] + b[7] * a[12];
        m[5] = b[4] * a[1] + b[5] * a[5] + b[6] * a[9] + b[7] * a[13];
        m[6] = b[4] * a[2] + b[5] * a[6] + b[6] * a[10] + b[7] * a[14];
        m[7] = b[4] * a[3] + b[5] * a[7] + b[6] * a[11] + b[7] * a[15];
        m[8] = b[8] * a[0] + b[9] * a[4] + b[10] * a[8] + b[11] * a[12];
        m[9] = b[8] * a[1] + b[9] * a[5] + b[10] * a[9] + b[11] * a[13];
        m[10] = b[8] * a[2] + b[9] * a[6] + b[10] * a[10] + b[11] * a[14];
        m[11] = b[8] * a[3] + b[9] * a[7] + b[10] * a[11] + b[11] * a[15];
        m[12] = b[12] * a[0] + b[13] * a[4] + b[14] * a[8] + b[15] * a[12];
        m[13] = b[12] * a[1] + b[13] * a[5] + b[14] * a[9] + b[15] * a[13];
        m[14] = b[12] * a[2] + b[13] * a[6] + b[14] * a[10] + b[15] * a[14];
        m[15] = b[12] * a[3] + b[13] * a[7] + b[14] * a[11] + b[15] * a[15];
        return m;
    }
    ;
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
        m[0] = id * (a[5] * a[10] * a[15] + a[6] * a[11] * a[13] + a[7] * a[9] * a[14] - a[5] * a[11] * a[14] - a[6] * a[9] * a[15] - a[7] * a[10] * a[13]);
        m[1] = id * (a[1] * a[11] * a[14] + a[2] * a[9] * a[15] + a[3] * a[10] * a[13] - a[1] * a[10] * a[15] - a[2] * a[11] * a[13] - a[3] * a[9] * a[14]);
        m[2] = id * (a[1] * a[6] * a[15] + a[2] * a[7] * a[13] + a[3] * a[5] * a[14] - a[1] * a[7] * a[14] - a[2] * a[5] * a[15] - a[3] * a[6] * a[13]);
        m[3] = id * (a[1] * a[7] * a[10] + a[2] * a[5] * a[11] + a[3] * a[6] * a[9] - a[1] * a[6] * a[11] - a[2] * a[7] * a[9] - a[3] * a[5] * a[10]);
        m[4] = id * (a[4] * a[11] * a[14] + a[6] * a[8] * a[15] + a[7] * a[10] * a[12] - a[4] * a[10] * a[15] - a[6] * a[11] * a[12] - a[7] * a[8] * a[14]);
        m[5] = id * (a[0] * a[10] * a[15] + a[2] * a[11] * a[12] + a[3] * a[8] * a[14] - a[0] * a[11] * a[14] - a[2] * a[8] * a[15] - a[3] * a[10] * a[12]);
        m[6] = id * (a[0] * a[7] * a[14] + a[2] * a[4] * a[15] + a[3] * a[6] * a[12] - a[0] * a[6] * a[15] - a[2] * a[7] * a[12] - a[3] * a[4] * a[14]);
        m[7] = id * (a[0] * a[6] * a[11] + a[2] * a[7] * a[8] + a[3] * a[4] * a[10] - a[0] * a[7] * a[10] - a[2] * a[4] * a[11] - a[3] * a[6] * a[8]);
        m[8] = id * (a[4] * a[9] * a[15] + a[5] * a[11] * a[12] + a[7] * a[8] * a[13] - a[4] * a[11] * a[13] - a[5] * a[8] * a[15] - a[7] * a[9] * a[12]);
        m[9] = id * (a[0] * a[11] * a[13] + a[1] * a[8] * a[15] + a[3] * a[9] * a[12] - a[0] * a[9] * a[15] - a[1] * a[11] * a[12] - a[3] * a[8] * a[13]);
        m[10] = id * (a[0] * a[5] * a[15] + a[1] * a[7] * a[12] + a[3] * a[4] * a[13] - a[0] * a[7] * a[13] - a[1] * a[4] * a[15] - a[3] * a[5] * a[12]);
        m[11] = id * (a[0] * a[7] * a[9] + a[1] * a[4] * a[11] + a[3] * a[5] * a[8] - a[0] * a[5] * a[11] - a[1] * a[7] * a[8] - a[3] * a[4] * a[9]);
        m[12] = id * (a[4] * a[10] * a[13] + a[5] * a[8] * a[14] + a[6] * a[9] * a[12] - a[4] * a[9] * a[14] - a[5] * a[10] * a[12] - a[6] * a[8] * a[13]);
        m[13] = id * (a[0] * a[9] * a[14] + a[1] * a[10] * a[12] + a[2] * a[8] * a[13] - a[0] * a[10] * a[13] - a[1] * a[8] * a[14] - a[2] * a[9] * a[12]);
        m[14] = id * (a[0] * a[6] * a[13] + a[1] * a[4] * a[14] + a[2] * a[5] * a[12] - a[0] * a[5] * a[14] - a[1] * a[6] * a[12] - a[2] * a[4] * a[13]);
        m[15] = id * (a[0] * a[5] * a[10] + a[1] * a[6] * a[8] + a[2] * a[4] * a[9] - a[0] * a[6] * a[9] - a[1] * a[4] * a[10] - a[2] * a[5] * a[8]);
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
})();
(() => {
    class Support {
        constructor(gl2) {
            this.gl = gl2;
            this.texture = [];
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
            await Promise.all([
                this.info.initShader(vertex, fragment),
                this.loadTexture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQYV2P4////fwAJ+wP9BUNFygAAAABJRU5ErkJggg=='),
            ]);
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
        loadTexture(image, num) {
            const img = typeof image === 'string' ? document.createElement('img') : image;
            const index = num === undefined ? this.texture.length : num;
            if (!this.texture[index]) {
                this.texture[index] = null;
            }
            return (img.complete && img.src ? Promise.resolve(img) : new Promise((resolve, reject) => {
                img.onload = () => { resolve(img); };
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
        prepare(support) {
            if (!this.loaded) {
                return Promise.resolve();
            }
            this.complete = false;
            return this.onprepare(support).then(() => { this.complete = true; });
        }
        render(support) {
            if (this.complete) {
                return this.onrender(support);
            }
            if (this.loaded === true && this.complete === undefined) {
                this.prepare(support).then(() => { this.render(support); });
            }
        }
        onload(arg) { return Promise.resolve(); }
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
            model.afterload = () => { this.rerender(); };
            this.model = model;
            if (this.src) {
                this.load();
            }
        }
        get src() { return this.getAttribute('src') || ''; }
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
            this.model.load(fetch(url, init)).then(() => { this.rerender(); });
        }
        import(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const data = reader.result;
                    const response = new Response(data);
                    this.model.load(Promise.resolve(response)).then(() => { this.rerender(); resolve(); });
                };
                reader.onerror = reject;
                reader.onabort = reject;
                reader.readAsArrayBuffer(file);
            }).then(() => { return this; });
        }
        export() {
            return this.model.export();
        }
        static get observedAttributes() { return ['src']; }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (oldVal === newVal) {
                return;
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
            style.innerHTML =
                [
                    ':host { display: block; background: black; --light: white; --ambient: rgba( 255, 255, 255, 0 ); }',
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
        get lightx() { return parseFloat(this.getAttribute('lightx') || '') || 0; }
        set lightx(value) { this.setAttribute('lightx', value + ''); }
        get lighty() { return parseFloat(this.getAttribute('lighty') || '') || 0; }
        set lighty(value) { this.setAttribute('lighty', value + ''); }
        get lightz() { return parseFloat(this.getAttribute('lightz') || '') || 0; }
        set lightz(value) { this.setAttribute('lightz', value + ''); }
        async init() {
            Luminus.console.info('Start: init lu-world.');
            const vertex = `#version 300 es
in vec4 vPosition;
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
	gl_Position = uProjection * uView * uModel * vPosition;

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
            const support = Luminus.createSupport(this.canvas.getContext("webgl2"));
            await support.init(document.getElementById('vertex') || vertex, document.getElementById('fragment') || fragment);
            this.lSupport = support;
            support.enables(support.gl.DEPTH_TEST, support.gl.CULL_FACE);
            this.lColor = new Float32Array(this.lightColor);
            this.aColor = new Float32Array(this.ambientColor);
            this.uProjection = support.orthographic(this.left, this.right, this.bottom, this.top, this.near, this.far);
            this.uView = support.matrix.identity4();
            this.uModel = support.matrix.identity4();
            this.iModel = support.matrix.identity4();
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
            gl2.uniformMatrix4fv(this.support.info.uniform.uProjection, false, this.uProjection);
            gl2.uniformMatrix4fv(this.support.info.uniform.uView, false, this.uView);
            gl2.uniformMatrix4fv(this.support.info.uniform.uModel, false, this.uModel);
            gl2.uniform3f(this.support.info.uniform.lDirection, this.lightx, this.lighty, this.lightz);
            this.lColor.set(this.lightColor);
            gl2.uniform3fv(this.support.info.uniform.lColor, this.lColor);
            this.aColor.set(this.ambientColor);
            gl2.uniform3fv(this.support.info.uniform.aColor, this.aColor);
            gl2.uniformMatrix4fv(this.support.info.uniform.iModel, false, this.iModel);
            this.support.clear();
            for (const model of this.children) {
                if (model instanceof Luminus.model) {
                    this.support.matrix.translation4(model.x, model.y, model.z, this.uModel);
                    gl2.uniformMatrix4fv(this.support.info.uniform.uModel, false, this.uModel);
                    this.support.matrix.inverse4(this.uModel, this.iModel);
                    gl2.uniformMatrix4fv(this.support.info.uniform.iProjectionMatrix, false, this.iModel);
                    gl2.uniform1f(this.support.info.uniform.lMin, model.model.lMin === undefined ? 0.3 : model.model.lMin);
                    model.render(this.support);
                }
            }
            gl2.flush();
        }
        get ambientColor() {
            return (window.getComputedStyle(this, '').getPropertyValue('--ambient')
                .replace(/\s/g, '')
                .replace(/rgba{0,1}\(([0-9\.\,]+)\)/, '$1') + ',1').split(',')
                .slice(0, 4)
                .map((v, i, a) => { return parseInt(v) / 255.0 * parseFloat(a[3]); })
                .slice(0, 3);
        }
        get lightColor() {
            return (window.getComputedStyle(this, '').getPropertyValue('--light')
                .replace(/\s/g, '')
                .replace(/rgba{0,1}\(([0-9\.\,]+)\)/, '$1') + ',1').split(',')
                .slice(0, 3)
                .map((v) => { return parseInt(v) / 255.0; });
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
            this.lMin = 1;
            this.loaded = true;
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
            gl2.enableVertexAttribArray(support.info.in.vPosition);
            gl2.vertexAttribPointer(support.info.in.vPosition, 3, gl2.FLOAT, false, 0, 0);
            const colorBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ARRAY_BUFFER, colorBuffer);
            gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array([
                1, 0, 0, 1, 1, 0, 0, 1,
                0, 1, 0, 1, 0, 1, 0, 1,
                0, 0, 1, 1, 0, 0, 1, 1,
            ]), gl2.STATIC_DRAW);
            gl2.enableVertexAttribArray(support.info.in.vColor);
            gl2.vertexAttribPointer(support.info.in.vColor, 4, gl2.FLOAT, false, 0, 0);
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
            this.loaded = true;
            this.color = new Float32Array(4);
        }
        onprepare(support) {
            Luminus.console.info('Start: cube-prepare.');
            const verts = new Float32Array([
                0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1,
                0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0,
                0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0,
                0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1,
                1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1,
                0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0,
            ]);
            const colors = new Float32Array([...Array(verts.length / 3 * 4)]);
            for (let i = 0; i < colors.length; i += 4) {
                colors[i] = this.color[0];
                colors[i + 1] = this.color[1];
                colors[i + 2] = this.color[2];
                colors[i + 3] = this.color[3];
            }
            const normals = new Float32Array([
                0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
                0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
                0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
                0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
                1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
                -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
            ]);
            const faces = new Uint16Array([
                0, 1, 2, 0, 2, 3,
                4, 5, 6, 4, 6, 7,
                8, 9, 10, 8, 10, 11,
                12, 13, 14, 12, 14, 15,
                16, 17, 18, 16, 18, 19,
                20, 21, 22, 20, 22, 23,
            ]);
            const gl2 = support.gl;
            const vao = support.gl.createVertexArray();
            if (!vao) {
                return Promise.reject(new Error('Failure createVertexArray.'));
            }
            support.gl.bindVertexArray(vao);
            const positionBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ARRAY_BUFFER, positionBuffer);
            gl2.bufferData(gl2.ARRAY_BUFFER, verts, gl2.STATIC_DRAW);
            gl2.enableVertexAttribArray(support.info.in.vPosition);
            gl2.vertexAttribPointer(support.info.in.vPosition, 3, gl2.FLOAT, false, 0, 0);
            const colorBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ARRAY_BUFFER, colorBuffer);
            gl2.bufferData(gl2.ARRAY_BUFFER, colors, gl2.STATIC_DRAW);
            gl2.enableVertexAttribArray(support.info.in.vColor);
            gl2.vertexAttribPointer(support.info.in.vColor, 4, gl2.FLOAT, false, 0, 0);
            const normalBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ARRAY_BUFFER, normalBuffer);
            gl2.bufferData(gl2.ARRAY_BUFFER, normals, gl2.STATIC_DRAW);
            gl2.enableVertexAttribArray(support.info.in.vNormal);
            gl2.vertexAttribPointer(support.info.in.vNormal, 3, gl2.FLOAT, false, 0, 0);
            const indexBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl2.bufferData(gl2.ELEMENT_ARRAY_BUFFER, faces, gl2.STATIC_DRAW);
            support.gl.bindVertexArray(null);
            this.vao = vao;
            return Promise.resolve();
        }
        onrender(support) {
            const gl = support.gl;
            support.gl.bindVertexArray(this.vao);
            gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
            support.gl.bindVertexArray(null);
        }
    }
    Luminus.models.cube = Cube;
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
                if (result.unknows && !(header.name in chunk)) {
                    const unknown = chunk.UNKNOWN(header);
                    result.unknows.push(unknown);
                }
                switch (header.name) {
                    case 'SIZE':
                        {
                            const size = chunk.SIZE(header);
                            result.models.push({
                                size: size,
                                count: 0,
                                xyzi: [],
                            });
                            break;
                        }
                    case 'XYZI':
                        {
                            const xyzi = chunk.XYZI(header);
                            result.models[result.models.length - 1].count = xyzi.count;
                            result.models[result.models.length - 1].xyzi = xyzi.boxes;
                            break;
                        }
                    case 'RGBA':
                        {
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
        onprepare(support) {
            Luminus.console.info('Start: vox-prepare.');
            const gl2 = support.gl;
            const vao = support.gl.createVertexArray();
            if (!vao) {
                return Promise.reject(new Error('Failure createVertexArray.'));
            }
            support.gl.bindVertexArray(vao);
            const positionBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ARRAY_BUFFER, positionBuffer);
            gl2.bufferData(gl2.ARRAY_BUFFER, this.verts, gl2.STATIC_DRAW);
            gl2.enableVertexAttribArray(support.info.in.vPosition);
            gl2.vertexAttribPointer(support.info.in.vPosition, 3, gl2.FLOAT, false, 0, 0);
            const colorBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ARRAY_BUFFER, colorBuffer);
            gl2.bufferData(gl2.ARRAY_BUFFER, this.colors, gl2.STATIC_DRAW);
            gl2.enableVertexAttribArray(support.info.in.vColor);
            gl2.vertexAttribPointer(support.info.in.vColor, 4, gl2.FLOAT, false, 0, 0);
            const normalBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ARRAY_BUFFER, normalBuffer);
            gl2.bufferData(gl2.ARRAY_BUFFER, this.normals, gl2.STATIC_DRAW);
            gl2.enableVertexAttribArray(support.info.in.vNormal);
            gl2.vertexAttribPointer(support.info.in.vNormal, 3, gl2.FLOAT, false, 0, 0);
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
            const result = new Uint8Array(data.reduce((prev, now) => { return prev + now.length; }, 0));
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
