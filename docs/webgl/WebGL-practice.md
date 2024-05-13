# WebGL实践

## 一.绘制星星

![](/webgl-practice/1.png)
::: details 代码实现
```html{13,58,61,72}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>绘制星星</title>
  <style>
    body {
      margin: 0;
      overflow: hidden;
    }

    #webgl {
      background: url("./images/sky.jpg");
      background-size: cover;
      background-position: right bottom;
    }
  </style>
</head>
<body>
  <canvas id="webgl">
  </canvas>
  <!-- 顶点着色器 -->
  <script id="vertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    attribute float a_PointSize;
    void main(){
      gl_Position = a_Position;
      gl_PointSize = a_PointSize;
    }
  </script>
  <!-- 片元着色器 -->
  <script id="fragmentShader" type="x-shader/x-fragment">
    precision mediump float;
    uniform vec4 u_FragColor;
    void main(){
      float dist = distance(gl_PointCoord,vec2(0.5,0.5));
      if (dist < 0.5) {
        gl_FragColor = u_FragColor;
      } else {
        discard;
      }
    }
  </script>
  <script type="module">
    import { initShaders } from "../jsm/Utils.js";

    const canvas = document.querySelector("#webgl");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const gl = canvas.getContext("webgl");

    // 顶点字符串
    const VSHADER_SOURCE = document.querySelector("#vertexShader").innerText;
    // 片元字符串
    const FSHADER_SOURCE = document.querySelector("#fragmentShader").innerText;

    // 开启片元的颜色合成功能
    gl.enable(gl.BLEND);

    // 设置片元的合成方式
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // 初始化着色器
    initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)

    // 获取 attribute 和 uniform 变量存储位置
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    const a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize");
    const u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");

    const stars = [];
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    render();

    // 鼠标点击事件
    canvas.addEventListener("click", ({ clientX, clientY }) => {
      const { left, top, width, height } = canvas.getBoundingClientRect();
      const [cssX, cssY] = [clientX - left, clientY - top];
      const [halfWidth, halfHeight] = [width / 2, height / 2];
      const [xBaseCenter, yBaseCenter] = [cssX - halfWidth, cssY - halfHeight];
      const yBaseCenterTop = -yBaseCenter;
      const [x, y] = [xBaseCenter / halfWidth, yBaseCenterTop / halfHeight];

      const s = Math.random() * 5 + 2;
      const a = Math.random();
      stars.push({ x, y, s, a });
      render();
    });

    // 渲染方法
    function render() {
      gl.clear(gl.COLOR_BUFFER_BIT);
      stars.forEach(({ x, y, s, a }) => {
        gl.vertexAttrib2f(a_Position, x, y);
        gl.vertexAttrib1f(a_PointSize, s);
        const arr = new Float32Array([0.87, 0.91, 1, a]);
        gl.uniform4fv(u_FragColor, arr);
        gl.drawArrays(gl.POINTS, 0, 1);
      });
    }
  </script>
</body>

</html>
```
:::


## 二.星星想你眨眼睛

![](/webgl-practice/1.gif)
::: details 代码实现
```html{48-49,95-121}
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8" />
  <title>星星向你眨眼睛</title>
  <style>
    body {
      margin: 0;
      overflow: hidden;
    }

    #webgl {
      background: url("./images/sky.jpg");
      background-size: cover;
      background-position: right bottom;
    }
  </style>
</head>

<body>
  <canvas id="webgl">
  </canvas>
  <!-- 顶点着色器 -->
  <script id="vertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    attribute float a_PointSize;
    void main(){
      gl_Position = a_Position;
      gl_PointSize = a_PointSize;
    }
  </script>
  <!-- 片元着色器 -->
  <script id="fragmentShader" type="x-shader/x-fragment">
    precision mediump float;
    uniform vec4 u_FragColor;
    void main(){
      float dist = distance(gl_PointCoord,vec2(0.5,0.5));
      if (dist < 0.5) {
        gl_FragColor = u_FragColor;
      } else {
        discard;
      }
    }
  </script>
  <script type="module">
    import { initShaders } from "../jsm/Utils.js";
    import Compose from "../jsm/Compose.js";
    import Track from "../jsm/Track.js";

    const canvas = document.querySelector("#webgl");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const gl = canvas.getContext("webgl");

    // 顶点字符串
    const VSHADER_SOURCE = document.querySelector("#vertexShader").innerText;
    // 片元字符串
    const FSHADER_SOURCE = document.querySelector("#fragmentShader").innerText;

    // 开启片元的颜色合成功能
    gl.enable(gl.BLEND);

    // 设置片元的合成方式
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // 初始化着色器
    initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)

    // 获取 attribute 和 uniform 变量存储位置
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    const a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize");
    const u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");

    const stars = [];

    //合成对象
    const compose = new Compose();

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    render();

    // 鼠标点击事件
    canvas.addEventListener("click", ({ clientX, clientY }) => {
      const { left, top, width, height } = canvas.getBoundingClientRect();
      const [cssX, cssY] = [clientX - left, clientY - top];
      const [halfWidth, halfHeight] = [width / 2, height / 2];
      const [xBaseCenter, yBaseCenter] = [cssX - halfWidth, cssY - halfHeight];
      const yBaseCenterTop = -yBaseCenter;
      const [x, y] = [xBaseCenter / halfWidth, yBaseCenterTop / halfHeight];

      const s = Math.random() * 5 + 2;
      const a = 1;
      const obj = { x, y, s, a }; // s 大小 a 透明度
      stars.push(obj);

      //建立轨道对象
      const track = new Track(obj);
      track.start = new Date();
      track.timeLen = 2000;
      track.loop = true;
      track.keyMap = new Map([
        [
          "a",
          [
            [500, a],
            [1000, 0],
            [1500, a],
          ],
        ],
      ]);
      compose.add(track);
    });

    !(function ani() {
      compose.update(new Date());
      render();
      requestAnimationFrame(ani);
    })();

    // 渲染方法
    function render() {
      gl.clear(gl.COLOR_BUFFER_BIT);
      stars.forEach(({ x, y, s, a }) => {
        gl.vertexAttrib2f(a_Position, x, y);
        gl.vertexAttrib1f(a_PointSize, s);
        const arr = new Float32Array([0.87, 0.91, 1, a]);
        gl.uniform4fv(u_FragColor, arr);
        gl.drawArrays(gl.POINTS, 0, 1);
      });
    }
  </script>
</body>

</html>
```

Track.js
```js
export default class Track {
  constructor(target) {
    this.target = target;
    this.parent = null;
    this.start = 0;
    this.timeLen = 5;
    this.loop = false;
    this.keyMap = new Map();
    this.onEnd = () => { }
    this.prevTime=0
  }
  update(t) {
    const { keyMap, timeLen, target, loop, start,prevTime } = this;
    let time = t - start;
    if (timeLen >= prevTime && timeLen < time) {
      this.onEnd()
    }
    this.prevTime=time
    if (loop) {
      time = time % timeLen;
    }
    for (const [key, fms] of keyMap) {
      const last = fms.length - 1;
      if (time < fms[0][0]) {
        target[key] = fms[0][1];
      } else if (time > fms[last][0]) {
        target[key] = fms[last][1];
      } else {
        target[key] = getValBetweenFms(time, fms, last);
      }
    }
  }
}

function getValBetweenFms(time, fms, last) {
  for (let i = 0; i < last; i++) {
    const fm1 = fms[i];
    const fm2 = fms[i + 1];
    if (time >= fm1[0] && time <= fm2[0]) {
      const delta = {
        x: fm2[0] - fm1[0],
        y: fm2[1] - fm1[1],
      };
      const k = delta.y / delta.x;
      const b = fm1[1] - fm1[0] * k;
      return k * time + b;
    }
  }
}
```
Compose.js
```js
export default class Compose {
  constructor() {
    this.parent = null;
    this.children = new Set();
  }
  add(obj) {
    obj.parent = this;
    this.children.add(obj);
  }
  update(t) {
    this.children.forEach((ele) => {
      ele.update(t);
    });
  }
  // 基于时间轨的目标对象删除时间轨
  deleteByTarget(targrt) {
    const { children } = this
    for (let child of children) {
      if (child.target === targrt) {
        children.delete(child)
        break
      }
    }
  }
}
```
:::

## 三.狮子座

![](/webgl-practice/2.gif)

::: details 代码实现
```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <title>狮子座</title>
    <style>
        body {
            margin: 0;
            overflow: hidden;
        }

        #canvas {
            background: url("./images/sky2.jpg");
            background-size: cover;
            background-position: right bottom;
        }
    </style>
</head>

<body>
    <canvas id="canvas"></canvas>
    <script id="vertexShader" type="x-shader/x-vertex">
        attribute vec4 a_Attr;
        varying float v_Alpha; // varying声明的相当于全局变量
        void main(){
            gl_Position = vec4(a_Attr.x,a_Attr.y,0.0,1.0);
            gl_PointSize = a_Attr.z;
            v_Alpha = a_Attr.w;
        }
  </script>
    <script id="fragmentShader" type="x-shader/x-fragment">
        precision mediump float;
        uniform bool u_IsPOINTS;
        varying float v_Alpha;
        void main(){
            if(u_IsPOINTS){
                float dist=distance(gl_PointCoord,vec2(0.5,0.5));
                if(dist<0.5) {
                    gl_FragColor = vec4(0.87,0.91,1,v_Alpha);
                } else {
                    discard;
                }
            } else {
                gl_FragColor = vec4(0.87,0.91,1,v_Alpha);
            }
        }
  </script>
    <script type="module">
        import { 
          initShaders, 
          getMousePosInWebgl, 
          glToCssPos 
        } from "../jsm/Utils.js";
        import Poly from "../jsm/Poly.js";
        import Sky from "../jsm/Sky.js";
        import Compose from '../jsm/Compose.js';
        import Track from '../jsm/Track.js';

        const canvas = document.querySelector("#canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // 获取着色器文本
        const vsSource = document.querySelector("#vertexShader").innerText;
        const fsSource = document.querySelector("#fragmentShader").innerText;

        // 获取WebGL上下文
        const gl = canvas.getContext("webgl");
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // 初始化着色器
        initShaders(gl, vsSource, fsSource);

        // 设置背景色
        gl.clearColor(0, 0, 0, 0);

        // 刷底色
        gl.clear(gl.COLOR_BUFFER_BIT);

        // 夜空
        const sky = new Sky(gl);

        // 建立合成对象
        const compose = new Compose();

        // 当前正在绘制的多边形
        let poly = null;

        // 鼠标划上的点
        let point = null;

        // 取消右击提示
        canvas.oncontextmenu = function () {
            return false;
        }

        canvas.addEventListener("mousedown", (event) => {
            if (event.button === 2) {
                popVertice()
            } else {
                const { x, y } = getMousePosInWebgl(event, canvas)
                if (poly) {
                    addVertice(x, y)
                } else {
                    crtPoly(x, y)
                }
            }
            render()
        });

        canvas.addEventListener("mousemove", (event) => {
            const { x, y } = getMousePosInWebgl(event, canvas)
            point = hoverPoint(x, y)
            canvas.style.cursor = point ? 'pointer' : 'default'
            if (poly) {
                const obj = poly.geoData[poly.geoData.length - 1]
                obj.x = x
                obj.y = y
            }
        });

        !(function ani() {
            compose.update(new Date())
            sky.updateVertices(['x', 'y', 'pointSize', 'alpha'])
            render()
            requestAnimationFrame(ani)
        })()

        function crtPoly(x, y) {
            const o1 = point ? point : { x, y, pointSize: random(), alpha: 1 }
            const o2 = { x, y, pointSize: random(), alpha: 1 }
            poly = new Poly({
                size: 4,
                attrName: 'a_Attr',
                geoData: [o1, o2],
                types: ['POINTS', 'LINE_STRIP'],
                circleDot: true
            })
            sky.add(poly)
            crtTrack(o1)
            crtTrack(o2)
        }

        function addVertice(x, y) {
            const { geoData } = poly
            if (point) {
                geoData[geoData.length - 1] = point
            }
            let obj = { x, y, pointSize: random(), alpha: 1 }
            geoData.push(obj)
            crtTrack(obj)
        }

        function popVertice() {
            poly.geoData.pop()
            const { children } = compose
            const last = children[children.length - 1]
            children.delete(last)
            poly = null
        }

        function crtTrack(obj) {
            const { pointSize } = obj
            const track = new Track(obj)
            track.start = new Date()
            track.timeLen = 2000
            track.loop = true
            track.keyMap = new Map([
                [
                    "pointSize",
                    [
                        [500, pointSize],
                        [1000, 0],
                        [1500, pointSize],
                    ],
                ],
                [
                    "alpha",
                    [
                        [500, 1],
                        [1000, 0],
                        [1500, 1],
                    ],
                ],
            ]);
            compose.add(track)
        }

        function hoverPoint(mx, my) {
            for (let { geoData } of sky.children) {
                for (let obj of geoData) {
                    if (poly&&obj === poly.geoData[poly.geoData.length - 1]) {
                        continue
                    }
                    const delta = {
                        x: mx - obj.x,
                        y: my - obj.y
                    }
                    const { x, y } = glToCssPos(delta, canvas)
                    const dist = x * x + y * y
                    if (dist < 100) {
                        return obj
                    }
                }
            }
            return null
        }

        function random() {
            return Math.random() * 8 + 3
        }

        function render() {
            gl.clear(gl.COLOR_BUFFER_BIT);
            sky.draw()
        }
    </script>
</body>

</html>
```
:::


## 四.视图矩阵与三角函数

![](/webgl-practice/3.gif)

::: details 代码实现
```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>正弦曲线</title>
  <style>
    body {
      margin: 0;
      overflow: hidden
    }
  </style>
</head>

<body>
  <canvas id="canvas"></canvas>
  <script id="vertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    uniform mat4 u_ViewMatrix;
    void main(){
      gl_Position = u_ViewMatrix*a_Position;
      gl_PointSize = 3.0;
    }
  </script>
  <script id="fragmentShader" type="x-shader/x-fragment">
    void main(){
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  </script>
  <script type="module">
    import { 
      initShaders, 
      ScaleLinear
    } from '../jsm/Utils.js';
    import { 
      Matrix4, 
      Vector3
    } from 'https://unpkg.com/three/build/three.module.js';
    import Poly from './jsm/Poly.js';

    const canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const gl = canvas.getContext('webgl');
    const vsSource = document.getElementById('vertexShader').innerText;
    const fsSource = document.getElementById('fragmentShader').innerText;
    initShaders(gl, vsSource, fsSource);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    /* 视图矩阵 */
    const viewMatrix = new Matrix4().lookAt(
      new Vector3(0.2, 0.3, 1),
      new Vector3(),
      new Vector3(0, 1, 0)
    )

    /* x,z 方向的空间坐标极值 */
    const [minPosX, maxPosX, minPosZ, maxPosZ] = [
      -0.7, 0.8, -1, 1
    ]
    /* x,z 方向的弧度极值 */
    const [minAngX, maxAngX, minAngZ, maxAngZ] = [
      0, Math.PI * 4, 0, Math.PI * 2
    ]

    /* 比例尺：将空间坐标和弧度相映射 */
    const scalerX = ScaleLinear(minPosX, minAngX, maxPosX, maxAngX)
    const scalerZ = ScaleLinear(minPosZ, minAngZ, maxPosZ, maxAngZ)

    /* 波浪对象 */
    const wave = new Poly({
      gl,
      vertices: crtVertices(),
      uniforms: {
        u_ViewMatrix: {
          type: 'uniformMatrix4fv',
          value: viewMatrix.elements
        },
      }
    })

    /* 动画:偏移phi */
    let offset = 0
    !(function ani() {
      offset += 0.08
      updateVertices(offset)
      wave.updateBuffer()
      gl.clear(gl.COLOR_BUFFER_BIT)
      wave.draw()
      requestAnimationFrame(ani)
    })()

    /* 建立顶点集合 */
    function crtVertices(offset = 0) {
      const vertices = []
      for (let z = minPosZ; z < maxPosZ; z += 0.04) {
        for (let x = minPosX; x < maxPosX; x += 0.03) {
          vertices.push(x, 0, z)
        }
      }
      return vertices
    }

    //更新顶点高度
    function updateVertices(offset = 0) {
      const { vertices } = wave
      for (let i = 0; i < vertices.length; i += 3) {
        const [posX, posZ] = [vertices[i], vertices[i + 2]]
        const angZ = scalerZ(posZ)
        const Omega = 2
        const a = Math.sin(angZ) * 0.1 + 0.03
        const phi = scalerX(posX) + offset
        vertices[i + 1] = SinFn(a, Omega, phi)(angZ)
      }
    }

    /* 正弦函数 */
    function SinFn(a, Omega, phi) {
      return function (x) {
        return a * Math.sin(Omega * x + phi);
      }
    }
  </script>
</body>

</html>
```
:::


## 五.一抹绿意
![](/webgl-practice/4.gif)
::: details 代码实现
```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>一抹绿意</title>
  <style>
    body {
      margin: 0;
      overflow: hidden
    }
  </style>
</head>

<body>
  <canvas id="canvas"></canvas>
  <script id="vertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_ViewMatrix;
    varying vec4 v_Color;
    void main(){
      gl_Position = u_ViewMatrix*a_Position;
      gl_PointSize = 3.0;
      v_Color = a_Color;
    }
  </script>
  <script id="fragmentShader" type="x-shader/x-fragment">
    precision mediump float;
    varying vec4 v_Color;
    void main(){
        gl_FragColor = v_Color;
    }
  </script>
  <script type="module">
    import { 
      initShaders, 
      ScaleLinear, 
      SinFn 
    } from '../jsm/Utils.js';
    import { 
      Matrix4, 
      Vector3, 
      Color 
    } from 'https://unpkg.com/three/build/three.module.js';
    import Poly from './jsm/Poly.js';

    const canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const gl = canvas.getContext('webgl');
    const vsSource = document.getElementById('vertexShader').innerText;
    const fsSource = document.getElementById('fragmentShader').innerText;
    initShaders(gl, vsSource, fsSource);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    /* 视图矩阵 */
    const viewMatrix = new Matrix4().lookAt(
      new Vector3(0.2, 0.3, 1),
      new Vector3(),
      new Vector3(0, 1, 0)
    )

    /* x,z 方向的空间坐标极值 */
    const [minPosX, maxPosX, minPosZ, maxPosZ] = [
      -0.7, 0.8, -1, 1
    ]
    /* x,z 方向的弧度极值 */
    const [minAngX, maxAngX, minAngZ, maxAngZ] = [
      0, Math.PI * 4, 0, Math.PI * 2
    ]

    /* 比例尺：将空间坐标和弧度相映射 */
    const scalerX = ScaleLinear(minPosX, minAngX, maxPosX, maxAngX)
    const scalerZ = ScaleLinear(minPosZ, minAngZ, maxPosZ, maxAngZ)

    /* y 方向的坐标极值 */
    const [a1, a2] = [0.1, 0.03]
    const a12 = a1 + a2
    const [minY, maxY] = [-a12, a12]

    /* 色相极值 */
    const [minH, maxH] = [0.1, 0.55]

    /* 比例尺：将y坐标和色相相映射 */
    const scalerC = ScaleLinear(minY, minH, maxY, maxH)

    /* 颜色对象，可通过HSL获取颜色 */
    const color = new Color()

    /* 波浪对象的行数和列数 */
    const [rows, cols] = [50, 50]

    /* 波浪对象的两个attribute变量，分别是位置和颜色 */
    const a_Position = { size: 3, index: 0 }
    const a_Color = { size: 4, index: 3 }

    /* 类目尺寸 */
    const categorySize = a_Position.size + a_Color.size

    /* 波浪对象 */
    const wave = new Poly({
      gl,
      source: getSource(
        cols, rows,
        minPosX, maxPosX, minPosZ, maxPosZ
      ),
      uniforms: {
        u_ViewMatrix: {
          type: 'uniformMatrix4fv',
          value: viewMatrix.elements
        },
      },
      attributes: {
        a_Position,
        a_Color,
      }
    })

    // 渲染
    render()

    /* 动画:偏移phi */
    let offset = 0
    !(function ani() {
      offset += 0.08
      updateSource(offset)
      wave.updateAttribute()
      render()
      requestAnimationFrame(ani)
    })()

    /* 渲染 */
    function render() {
      gl.clear(gl.COLOR_BUFFER_BIT);
      wave.draw()
    }

    /* 建立顶点集合 */
    function getSource(cols, rows, minPosX, maxPosX, minPosZ, maxPosZ) {
      const source = []
      const spaceZ = (maxPosZ - minPosZ) / rows
      const spaceX = (maxPosX - minPosX) / cols
      for (let z = 0; z < rows; z++) {
        for (let x = 0; x < cols; x++) {
          const px = x * spaceX + minPosX
          const pz = z * spaceZ + minPosZ
          source.push(px, 0, pz, 1, 1, 1, 1)
        }
      }
      return source
    }

    /* 更新顶点高度和颜色 */
    function updateSource(offset = 0) {
      const { source, categorySize } = wave
      for (let i = 0; i < source.length; i += categorySize) {
        const [posX, posZ] = [source[i], source[i + 2]]
        const angZ = scalerZ(posZ)
        const Omega = 2
        const a = Math.sin(angZ) * a1 + a2
        const phi = scalerX(posX) + offset
        const y = SinFn(a, Omega, phi)(angZ)
        source[i + 1] = y
        const h = scalerC(y)
        const { r, g, b } = color.setHSL(h, 1, 0.6)
        source[i + 3] = r
        source[i + 4] = g
        source[i + 5] = b
      }
    }
  </script>
</body>

</html>
```
:::



## 六.一片春色
![](/webgl-practice/5.gif)
::: details 代码实现
```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>一片春色</title>
  <style>
    body {
      margin: 0;
      overflow: hidden
    }
  </style>
</head>

<body>
  <canvas id="canvas"></canvas>
  <script id="vertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_ViewMatrix;
    varying vec4 v_Color;
    void main(){
      gl_Position = u_ViewMatrix*a_Position;
      gl_PointSize = 3.0;
      v_Color = a_Color;
    }
  </script>
  <script id="fragmentShader" type="x-shader/x-fragment">
    precision mediump float;
    varying vec4 v_Color;
    void main(){
        gl_FragColor = v_Color;
    }
  </script>
  <script type="module">
    import { 
      initShaders, 
      ScaleLinear, 
      SinFn, 
      GetIndexInGrid 
    } from '../jsm/Utils.js';
    import { 
      Matrix4, 
      Vector3, 
      Color 
    } from 'https://unpkg.com/three/build/three.module.js';
    import Poly from './jsm/Poly.js';

    const canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const gl = canvas.getContext('webgl');
    const vsSource = document.getElementById('vertexShader').innerText;
    const fsSource = document.getElementById('fragmentShader').innerText;
    initShaders(gl, vsSource, fsSource);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    /* 视图矩阵 */
    const viewMatrix = new Matrix4().lookAt(
      new Vector3(0.2, 0.3, 1),
      new Vector3(),
      new Vector3(0, 1, 0)
    )

    /* x,z 方向的空间坐标极值 */
    const [minPosX, maxPosX, minPosZ, maxPosZ] = [
      -0.7, 0.8, -0.9, 1
    ]
    /* x,z 方向的弧度极值 */
    const [minAngX, maxAngX, minAngZ, maxAngZ] = [
      0, Math.PI * 4, 0, Math.PI * 2
    ]
    /* 比例尺：将空间坐标和弧度相映射 */
    const scalerX = ScaleLinear(minPosX, minAngX, maxPosX, maxAngX)
    const scalerZ = ScaleLinear(minPosZ, minAngZ, maxPosZ, maxAngZ)


    /* y 方向的坐标极值 */
    const [a1, a2] = [0.1, 0.03]
    const a12 = a1 + a2
    const [minY, maxY] = [-a12, a12]

    /* 色相极值 */
    const [minH, maxH] = [0.5, 0.2]

    /* 比例尺：将y坐标和色相相映射 */
    const scalerC = ScaleLinear(minY, minH, maxY, maxH)

    /* 颜色对象，可通过HSL获取颜色 */
    const color = new Color()

    /* 波浪对象的行数和列数 */
    const [rows, cols] = [40, 40]

    /* 波浪对象的两个attribute变量，分别是位置和颜色 */
    const a_Position = { size: 3, index: 0 }
    const a_Color = { size: 4, index: 3 }

    /* 类目尺寸 */
    const categorySize = a_Position.size + a_Color.size

    //获取索引位置的方法
    const getInd = GetIndexInGrid(cols, categorySize)

    /* 获取基础数据
       vertices 按照行列形式排列的顶点集合
       indexes 三角网格的顶点索引，其元素为顶点在vertices中的索引
    */
    const { vertices, indexes } = crtBaseData(
      cols, rows,
      minPosX, maxPosX, minPosZ, maxPosZ
    );

    /* 建立波浪对象 */
    const wave = new Poly({
      gl,
      source: getSource(vertices, indexes, categorySize),
      uniforms: {
        u_ViewMatrix: {
          type: 'uniformMatrix4fv',
          value: viewMatrix.elements
        },
      },
      attributes: {
        a_Position,
        a_Color,
      }
    })

    //渲染
    render()


    /* 动画:偏移phi */
    let offset = 0
    !(function ani() {
      offset += 0.08
      updateSource(offset)
      wave.updateAttribute()
      render()
      requestAnimationFrame(ani)
    })()

    /* 渲染 */
    function render() {
      gl.clear(gl.COLOR_BUFFER_BIT);
      wave.draw()
      wave.draw('LINES')
      // wave.draw('TRIANGLES')
    }

    /* 建立基础数据 */
    function crtBaseData(cols, rows, minPosX, maxPosX, minPosZ, maxPosZ) {
      const vertices = []
      const indexes = []
      const spaceZ = (maxPosZ - minPosZ) / rows
      const spaceX = (maxPosX - minPosX) / cols
      for (let z = 0; z < rows; z++) {
        for (let x = 0; x < cols; x++) {
          const px = x * spaceX + minPosX
          const pz = z * spaceZ + minPosZ
          vertices.push(px, 0, pz, 1, 1, 1, 0.5)
          if (z && x) {
            const [x0, z0] = [x - 1, z - 1]
            indexes.push(
              getInd(x0, z0),
              getInd(x, z0),
              getInd(x, z),
              getInd(x0, z0),
              getInd(x, z),
              getInd(x0, z),
            )
          }
        }
      }
      return { vertices, indexes }
    }


    /* 建立顶点集合 */
    function getSource(vertices, indexes, categorySize) {
      const arr = []
      indexes.forEach(i => {
        arr.push(...vertices.slice(i, i + categorySize))
      })
      return arr
    }

    //更新顶点高度
    function updateSource(offset = 0) {
      const { source, categorySize } = wave
      for (let i = 0; i < source.length; i += categorySize) {
        const [posX, posZ] = [source[i], source[i + 2]]
        const angZ = scalerZ(posZ)
        const Omega = 2
        const a = Math.sin(angZ) * a1 + a2
        const phi = scalerX(posX) + offset
        const y = SinFn(a, Omega, phi)(angZ)
        source[i + 1] = y
        const h = scalerC(y)
        const { r, g, b } = color.setHSL(h, 1, 0.6)
        source[i + 3] = r
        source[i + 4] = g
        source[i + 5] = b
      }
    }
  </script>
</body>

</html>
```
:::


## 七.纹理转场
![](/webgl-practice/6.gif)
::: details 代码实现
```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>纹理转场</title>
  <style>
    body {
      margin: 0;
      overflow: hidden
    }
  </style>
</head>

<body>
  <canvas id="canvas"></canvas>
  <script id="vertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    attribute vec2 a_Pin;
    varying vec2 v_Pin;
    void main(){
      gl_Position = a_Position;
      v_Pin = a_Pin;
    }
  </script>
  <script id="fragmentShader" type="x-shader/x-fragment">
    precision mediump float;
    uniform sampler2D u_Sampler;
    uniform sampler2D u_Pattern;
    uniform float u_Ratio;
    varying vec2 v_Pin;
    void main(){
      vec4 o = texture2D(u_Sampler,v_Pin);
      vec4 p = texture2D(u_Pattern,v_Pin);
      gl_FragColor = mix(o, p, u_Ratio);
    }
  </script>
  <script type="module">
    import Track from "../jsm/Track.js";
    import { imgPromise, initShaders, } from '../jsm/Utils.js';
    import Poly from './jsm/Poly.js';

    const canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const gl = canvas.getContext('webgl');
    const vsSource = document.getElementById('vertexShader').innerText;
    const fsSource = document.getElementById('fragmentShader').innerText;
    initShaders(gl, vsSource, fsSource);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //数据源
    const source = new Float32Array([
      -0.4, 0.8, 0, 1,
      -0.4, -0.8, 0, 0,
      0.4, 0.8, 1, 1,
      0.4, -0.8, 1, 0,
    ]);

    let n = 0
    let len = 5
    const obj = { ratio: 0 }
    let track = null

    const rect = new Poly({
      gl,
      source,
      type: 'TRIANGLE_STRIP',
      uniforms: {
        u_Ratio: {
          type: 'uniform1f',
          value: obj.ratio
        }
      },
      attributes: {
        a_Position: {
          size: 2,
          index: 0
        },
        a_Pin: {
          size: 2,
          index: 2
        },
      }
    })

    loadImg()

    function loadImg() {
      n++;
      const i1 = n % len
      const i2 = (n + 1) % len

      const originImg = new Image()
      originImg.src = `./images/pattern${i1}.jpg`

      const pattern = new Image()
      pattern.src = `./images/pattern${i2}.jpg`

      Promise.all([
        imgPromise(originImg),
        imgPromise(pattern),
      ]).then(() => {
        changeImg(originImg, pattern)
        ani()
      })
    }

    function changeImg(...imgs) {
      obj.ratio = 0

      rect.maps = {
        u_Sampler: { image: imgs[0] },
        u_Pattern: { image: imgs[1] },
      }
      rect.updateMaps()
      track = new Track(obj);
      track.start = new Date();
      track.timeLen = 1500;
      track.onEnd = loadImg
      track.keyMap = new Map([
        [
          "ratio",
          [
            [0, 0],
            [700, 1]
          ],
        ],
      ]);
    }

    /* 动画 */
    function ani() {
      track.update(new Date())
      rect.uniforms.u_Ratio.value = obj.ratio;
      rect.updateUniform()
      render()
      requestAnimationFrame(ani)
    }

    //渲染
    function render() {
      gl.clear(gl.COLOR_BUFFER_BIT);
      rect.draw()
    }
  </script>
</body>

</html>
```
:::


## 八.花样转场
![](/webgl-practice/7.gif)
::: details 代码实现
```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>花样转场</title>
  <style>
    body {
      margin: 0;
      overflow: hidden
    }
  </style>
</head>

<body>
  <canvas id="canvas"></canvas>
  <script id="vertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    attribute vec2 a_Pin;
    varying vec2 v_Pin;
    void main(){
      gl_Position = a_Position;
      v_Pin = a_Pin;
    }
  </script>
  <script id="fragmentShader" type="x-shader/x-fragment">
    precision mediump float;
    uniform sampler2D u_Sampler;
    uniform sampler2D u_Pattern;
    uniform sampler2D u_Gradient;
    uniform float u_Ratio;
    varying vec2 v_Pin;
    void main(){
      vec4 o = texture2D(u_Sampler, v_Pin);
      vec4 p = texture2D(u_Pattern, v_Pin);
      vec4 g = texture2D(u_Gradient, v_Pin);
      float f = clamp((g.r + u_Ratio), 0.0, 1.0);
      gl_FragColor = mix(o, p, f);
    }
  </script>
  <script type="module">
    import Track from "../jsm/Track.js";
    import { imgPromise, initShaders, } from '../jsm/Utils.js';
    import Poly from './jsm/Poly.js';

    const canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const gl = canvas.getContext('webgl');
    const vsSource = document.getElementById('vertexShader').innerText;
    const fsSource = document.getElementById('fragmentShader').innerText;
    initShaders(gl, vsSource, fsSource);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //数据源
    const source = new Float32Array([
      -0.4, 0.8, 0, 1,
      -0.4, -0.8, 0, 0,
      0.4, 0.8, 1, 1,
      0.4, -0.8, 1, 0,
    ]);

    let n = 0
    let len = 5
    const obj = { ratio: 0 }
    let track = null

    const rect = new Poly({
      gl,
      source,
      type: 'TRIANGLE_STRIP',
      uniforms: {
        u_Ratio: {
          type: 'uniform1f',
          value: obj.ratio
        }
      },
      attributes: {
        a_Position: {
          size: 2,
          index: 0
        },
        a_Pin: {
          size: 2,
          index: 2
        },
      }
    })

    loadImg()

    function loadImg() {
      n++;
      const i1 = n % len
      const i2 = (n + 1) % len
      const i3 = Math.round(Math.random() * 4)

      const originImg = new Image()
      originImg.src = `./images/pattern${i1}.jpg`

      const pattern = new Image()
      pattern.src = `./images/pattern${i2}.jpg`

      const gradient = new Image()
      gradient.src = `./images/mask${i3}.jpg`

      Promise.all([
        imgPromise(originImg),
        imgPromise(pattern),
        imgPromise(gradient),
      ]).then(() => {
        changeImg(originImg, pattern, gradient)
        ani()
      })
    }

    function changeImg(...imgs) {
      obj.ratio = 0

      rect.maps = {
        u_Sampler: { image: imgs[0] },
        u_Pattern: { image: imgs[1] },
        u_Gradient: { image: imgs[2] },
      }
      rect.updateMaps()
      track = new Track(obj);
      track.start = new Date();
      track.timeLen = 2000;
      track.onEnd = loadImg
      track.keyMap = new Map([
        [
          "ratio",
          [
            [0, 0],
            [1000, 1]
          ],
        ],
      ]);
    }

    /* 动画 */
    function ani() {
      track.update(new Date())
      rect.uniforms.u_Ratio.value = obj.ratio;
      rect.updateUniform()
      render()
      requestAnimationFrame(ani)
    }

    //渲染
    function render() {
      gl.clear(gl.COLOR_BUFFER_BIT);
      rect.draw()
    }
  </script>
</body>

</html>
```
:::


## 九.换装达人
![](/webgl-practice/8.gif)
::: details 代码实现
```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>换装达人</title>
  <style>
    body {
      margin: 0;
      overflow: hidden
    }

    canvas {
      background-color: antiquewhite;
    }
  </style>
</head>

<body>
  <canvas id="canvas"></canvas>
  <script id="vertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    attribute vec2 a_Pin;
    varying vec2 v_Pin;
    void main(){
      gl_Position = a_Position;
      v_Pin = a_Pin;
    }
  </script>
  <script id="fragmentShader" type="x-shader/x-fragment">
    precision mediump float;
    uniform sampler2D u_Sampler;
    uniform sampler2D u_Pattern1;
    uniform sampler2D u_Pattern2;
    uniform sampler2D u_Mask;
    uniform float u_Ratio;
    varying vec2 v_Pin;
    void main(){
      vec4 o = texture2D(u_Sampler, v_Pin);
      vec4 p1 = texture2D(u_Pattern1, v_Pin);
      vec4 p2 = texture2D(u_Pattern2, v_Pin);
      vec4 m = texture2D(u_Mask, v_Pin);
      vec4 p3 = vec4(1, 1, 1, 1);
      if(m.x > 0.5){
        p3 = mix(p1, p2, u_Ratio);
      }
      gl_FragColor = p3*o;
    }
  </script>
  <script type="module">
    import Track from "../jsm/Track.js";
    import { imgPromise, initShaders, } from '../jsm/Utils.js';
    import Poly from './jsm/Poly.js';

    const canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const gl = canvas.getContext('webgl');
    const vsSource = document.getElementById('vertexShader').innerText;
    const fsSource = document.getElementById('fragmentShader').innerText;
    initShaders(gl, vsSource, fsSource);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    const source = new Float32Array([
      -0.4, 0.8, 0, 1,
      -0.4, -0.8, 0, 0,
      0.4, 0.8, 1, 1,
      0.4, -0.8, 1, 0,
    ]);

    let n = 0
    let len = 5
    const obj = { ratio: 0 }
    let track = null

    const rect = new Poly({
      gl,
      source,
      type: 'TRIANGLE_STRIP',
      uniforms: {
        u_Ratio: {
          type: 'uniform1f',
          value: obj.ratio
        }
      },
      attributes: {
        a_Position: {
          size: 2,
          index: 0
        },
        a_Pin: {
          size: 2,
          index: 2
        },
      }
    })

    const originImg = new Image()
    originImg.src = `./images/dress.jpg`

    const mask = new Image()
    mask.src = './images/mask-dress.jpg'

    Promise.all([
      imgPromise(originImg),
      imgPromise(mask),
    ]).then(() => {
      rect.maps = {
        u_Sampler: { image: originImg },
        u_Mask: { image: mask },
      }
      loadImg()
    })

    function loadImg() {
      n++;
      const i1 = n % len
      const i2 = (n + 1) % len

      const pattern1 = new Image()
      pattern1.src = `./images/pattern${i1}.jpg`

      const pattern2 = new Image()
      pattern2.src = `./images/pattern${i2}.jpg`

      Promise.all([
        imgPromise(pattern1),
        imgPromise(pattern2),
      ]).then(() => {
        changeImg(pattern1, pattern2)
        ani()
      })
    }

    function changeImg(...imgs) {
      obj.ratio = 0
      rect.maps.u_Pattern1 = { image: imgs[0] }
      rect.maps.u_Pattern2 = { image: imgs[1] }
      rect.updateMaps()
      track = new Track(obj);
      track.start = new Date();
      track.timeLen = 1500;
      track.onEnd = loadImg
      track.keyMap = new Map([
        [
          "ratio",
          [
            [0, 0],
            [700, 1]
          ],
        ],
      ]);
    }

    /* 动画 */
    function ani() {
      track.update(new Date())
      rect.uniforms.u_Ratio.value = obj.ratio;
      rect.updateUniform()
      render()
      requestAnimationFrame(ani)
    }

    //渲染
    function render() {
      gl.clear(gl.COLOR_BUFFER_BIT);
      rect.draw()
    }
  </script>
</body>

</html>
```
:::


## 十.变换图片

### 1.基点变换

#### 1.1基点变换的原理

![](/webgl-practice/10.png)

`已知`：

图片img，img 在世界坐标系中

`求`：让img基于其左上角点P点进行旋转和缩放的方法

思路：  
1. 不要把目光都放在左上角点上，会很复杂
2. 用矩阵的思想看问题，就会比较轻松。

`解`：

1. 把img装饭盒里，饭盒的本地矩阵是mi。

当前mi和世界坐标系重合。

![](/webgl-practice/11.png)

2. 让mi 的位置减去点P

![](/webgl-practice/12.png)

​如果我们现在旋转mi的话，饭盒会基于mi的坐标原点旋转，这明显不是我们想要的。

3. 把饭盒装冰箱里，冰箱的本地矩阵是mb。

![](/webgl-practice/13.png)

​当前mb和世界坐标系重合。

4. 让mb 的位置加上点P

![](/webgl-practice/14.png)

此时的img和最初始的img重合  
此时img的左上角点P和mb的坐标原点重合  
此时我们旋转mb，冰箱会基于mb的坐标原点旋转，同时也带动了图片基于点P旋转 

5.计算模型矩阵，变换图片顶点的初始点位，从而得到图片顶点基于点P变换后的位置。

模型矩阵 = mb * mi  
图片顶点基于点P变换后的位置 = 模型矩阵 * 图片顶点的初始点位

效果如下：  
![](/webgl-practice/15.png)

`注`：  
饭盒包含了图片的初始点位，可以理解为three.js中Object3D。  
冰箱包含了饭盒，可以理解为three.js中的Group。  

#### 1.2基点变换的代码实现

::: details 代码实现
```html{70,88,137}
<canvas id="canvas"></canvas>
<!-- 纹理 -->
<script id="textureVertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    attribute vec2 a_Pin;
    uniform mat4 u_PvMatrix;
    uniform mat4 u_ModelMatrix;
    varying vec2 v_Pin;
    void main(){
      gl_Position = u_PvMatrix * u_ModelMatrix * a_Position;
      v_Pin = a_Pin;
    }
</script>
<script id="textureFragmentShader" type="x-shader/x-fragment">
    precision mediump float;
    uniform sampler2D u_Sampler;
    varying vec2 v_Pin;
    void main(){
      gl_FragColor = texture2D(u_Sampler, v_Pin);
    }
</script>
<script type="module">
  import { createProgram } from '../jsm/Utils.js';
  import {
    Matrix4,
    OrthographicCamera,
    Vector3
  } from 'https://unpkg.com/three/build/three.module.js';
  import Mat from './jsm/Mat.js';
  import Geo from './jsm/Geo.js';
  import Obj3D from './jsm/Obj3D.js';
  import Scene from './jsm/Scene.js';

  const canvas = document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const gl = canvas.getContext('webgl');
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  //正交相机
  const halfH = 1
  const ratio = canvas.width / canvas.height
  const halfW = halfH * ratio
  const [left, right, top, bottom, near, far] = [
    -halfW, halfW, halfH, -halfH, 1, 8
  ]
  const eye = new Vector3(0, 0, 2)
  const target = new Vector3(0, 0, 0)
  const camera = new OrthographicCamera(
    left, right, top, bottom, near, far
  )
  camera.position.copy(eye)
  camera.lookAt(target)
  camera.updateMatrixWorld()
  const pvMatrix = camera.projectionMatrix.clone().multiply(
    camera.matrixWorldInverse
  )
  const scence = new Scene({ gl })

  //计算图片顶点 
  const [w, h] = [0.6, 0.6]
  const [hw, hh] = [w / 2, h / 2]
  const vertices = new Float32Array([
    -hw, hh,
    -hw, -hh,
    hw, hh,
    hw, -hh,
  ])

  /* 声明饭盒和冰箱的本地矩阵，以及图片的变换基点 */
  // 饭盒本地矩阵
  const mi = new Matrix4()
  // 冰箱本地矩阵
  const mb = new Matrix4()
  //模型矩阵 (由 mb*mi 得到)
  const mm = new Matrix4()
  //基点
  let orignInd = 4

  //基于图片的变换基点布阵
  setOrign(orignInd)
  function setOrign(i) {
    const [x, y] = [vertices[i], vertices[i + 1]]
    mi.setPosition(-x, -y, 0)
    mb.setPosition(x, y, 0)
  }

  /* 准备一张图片 */
  const image = new Image()
  image.src = './images/erha.jpg'
  let mat = null
  image.onload = function () {
    const vs = document.getElementById('textureVertexShader').innerText
    const fs = document.getElementById('textureFragmentShader').innerText
    const program = createProgram(gl, vs, fs)
    mat = new Mat({
      program,
      data: {
        u_PvMatrix: {
          value: pvMatrix.elements,
          type: 'uniformMatrix4fv',
        },
        u_ModelMatrix: {
          value: new Matrix4().elements,
          type: 'uniformMatrix4fv',
        },
      },
      maps: {
        u_Sampler: {
          image,
        }
      },
      mode: 'TRIANGLE_STRIP'
    })
    const geo = new Geo({
      data: {
        a_Position: {
          array: vertices,
          size: 2
        },
        a_Pin: {
          array: new Float32Array([
            0, 1,
            0, 0,
            1, 1,
            1, 0,
          ]),
          size: 2
        }
      }
    })
    const obj = new Obj3D({ geo, mat })
    scence.add(obj)
    render()
  }

  /* 在渲染方法里变换冰箱后，乘以饭盒的本地矩阵，得到图片的模型矩阵 */
  let ang = 0
  function render() {
    ang += 0.02
    const s = (Math.sin(ang) + 1) / 2
    mm.copy(
      mb.clone()
        .multiply(
          new Matrix4().makeRotationZ(ang)
        )
        .scale(new Vector3(s, s, 1))
        .multiply(mi)
    )
    mat.setData('u_ModelMatrix', {
      value: mm.elements
    })
    scence.draw()
    requestAnimationFrame(render)
  }
</script>
```
效果：  
![](/webgl-practice/21.gif)
:::


### 2.二次基点变换

继我们上一次变换之后，若我们想再基于图片的其它角点进行变换，比如右下角，应该怎么办呢？

这个问题的解决思路并不唯一，咱先说一个最简单的思路：  
1.每一次变换完成后，直接基于上一次的模型矩阵修改顶点的原始点位。
2.基于新的基点位置，重复第一次基点变换的步骤。

例子上面的图片每旋转45°，改变一次变换基点。  
具体代码如下：

```js
function render() {
    ang += 0.005
    if (ang > Math.PI / 4) {
        ang = 0
        formatVertices()
        orignInd = (orignInd + 2) % 8
        setOrign(orignInd)
    }
    const s = (Math.sin(ang * 8 + Math.PI / 2) + 1) / 2
    mm.copy(
        mb.clone()
        .multiply(
            new Matrix4().makeRotationZ(ang)
        )
        .scale(new Vector3(s, s, 1))
        .multiply(mi)
    )
    mat.setData('u_ModelMatrix', {
        value: mm.elements
    })
    scence.draw()
    requestAnimationFrame(render)
}

function formatVertices() {
    for (let i = 0; i < vertices.length; i += 2) {
        const p = new Vector3(vertices[i], vertices[i + 1], 0)
        .applyMatrix4(mm)
        vertices[i] = p.x
        vertices[i + 1] = p.y
    }
    geo.setData('a_Position', {
        array: vertices
    })
}
```
上面的formatVertices() 方法便是基于模型矩阵格式化vertices点位的方法，修改完后，同步更新geo几何体里的顶点点位。

### 3.用鼠标变换图片

#### 3.1功能描述

1. 变换节点

变换节点就是图片的四个角点 + 描边。  
变换节点没啥实际功能，就是整个视觉样式，让用户知道此图可变换。

![](/webgl-practice/16.png)

2. 位移

当鼠标在图片中的时候，按住鼠标可以拖拽图片。

![](/webgl-practice/17.png)

3. 缩放

当鼠标到图片节点的距离小于15像素时，开启鼠标对图片的缩放功能。

默认：居中+等比缩放  
alt 键：以鼠标对面的点为基点进行缩放  
shift 键：自由缩放  

![](/webgl-practice/18.png)

3. 旋转

当鼠标到图片节点的距离小于40像素时，开启鼠标对图片的旋转功能。

默认：居中+按照特定弧度(15°)旋转  
alt 键：以鼠标对面的点为基点进行旋转  
shift 键：自由旋转  

![](/webgl-practice/19.png)

基本的变换功能就是这样，接下来说一下具体的代码实现。


#### 3.2前期准备-图片+外框

1. 准备两套着色器，一套绘制点和线，一套着纹理。

```html
<!-- 点和线 -->
<script id="solidVertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    uniform mat4 u_PvMatrix;
    uniform mat4 u_ModelMatrix;
    void main(){
      gl_Position = u_PvMatrix * u_ModelMatrix * a_Position;
      gl_PointSize = 10.0;
    }
</script>
<script id="solidFragmentShader" type="x-shader/x-fragment">
    precision mediump float;
    void main(){
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
</script>
<!-- 着纹理 -->
<script id="textureVertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    attribute vec2 a_Pin;
    uniform mat4 u_PvMatrix;
    uniform mat4 u_ModelMatrix;
    varying vec2 v_Pin;
    void main(){
      gl_Position = u_PvMatrix * u_ModelMatrix * a_Position;
      v_Pin = a_Pin;
    }
</script>
<script id="textureFragmentShader" type="x-shader/x-fragment">
    precision mediump float;
    uniform sampler2D u_Sampler;
    varying vec2 v_Pin;
    void main(){
      gl_FragColor = texture2D(u_Sampler, v_Pin);
    }
</script>
```

2. 准备webgl上下文对象

```js
import { createProgram } from '../jsm/Utils.js';
import { 
  Matrix4, 
  OrthographicCamera, 
  Vector3 
} from 'https://unpkg.com/three/build/three.module.js';
import OrbitControls from './jsm/OrbitControls.js'
import Mat from './jsm/Mat.js'
import Geo from './jsm/Geo.js'
import Obj3D from './jsm/Obj3D.js'
import Scene from './jsm/Scene.js'
import Rect from './jsm/Rect.js'

const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const gl = canvas.getContext('webgl');
gl.clearColor(0.0, 0.0, 0.0, 1.0);
```

3. 通过正交相机获取投影视图矩阵

```js
const halfH = 1
const ratio = canvas.width / canvas.height
const halfW = halfH * ratio
const [left, right, top, bottom, near, far] = [
    -halfW, halfW, halfH, -halfH, 1, 8
]
const eye = new Vector3(0, 0, 2)
const target = new Vector3(0, 0, 0)
const camera = new OrthographicCamera(
    left, right, top, bottom, near, far
)
camera.position.copy(eye)
camera.lookAt(target)
camera.updateMatrixWorld()
const pvMatrix = camera.projectionMatrix.clone().multiply(
    camera.matrixWorldInverse
)
```

4. 通过图片尺寸，获取图片和图片外框的顶点

```js
// 图片尺寸
const [w, h] = [0.6, 0.6]
const [hw, hh] = [w / 2, h / 2]
// 图片顶点
const vertices = new Float32Array([
    -hw, hh,
    -hw, -hh,
    hw, hh,
    hw, -hh,
])
// 图片外框顶点
let verticesOut = getVerticesOut()

/* 基于vertices获取verticesOut */
function getVerticesOut() {
    return new Float32Array([
        vertices[0], vertices[1],
        vertices[2], vertices[3],
        vertices[6], vertices[7],
        vertices[4], vertices[5],
    ])
}
```

`注`：  
图片是用TRIANGLE_STRIP三角带画的；  
图片外框是用LINE_LOOP 闭合线条和点POINTS 画的。  
图片和图片外框的顶点排序是不同的。  

5. 绘制图片外框和图片

```js
// 场景
const scence = new Scene({ gl })

// 图片外框-点和线
let matOut = null
let geoOut = null
{
    const vs = document.getElementById('solidVertexShader').innerText
    const fs = document.getElementById('solidFragmentShader').innerText
    const program = createProgram(gl, vs, fs)
    matOut = new Mat({
        program,
        data: {
            u_PvMatrix: {
                value: pvMatrix.elements,
                type: 'uniformMatrix4fv',
            },
            u_ModelMatrix: {
                value: new Matrix4().elements,
                type: 'uniformMatrix4fv',
            },
        },
        mode: ['LINE_LOOP', 'POINTS']
    })
    geoOut = new Geo({
        data: {
            a_Position: {
                array: verticesOut,
                size: 2
            },
        }
    })
    const obj = new Obj3D({ geo: geoOut, mat: matOut })
    scence.add(obj)
}

// 图片
const image = new Image()
image.src = './images/erha.jpg'
let mat = null
let geo = null
image.onload = function () {
    const vs = document.getElementById('textureVertexShader').innerText
    const fs = document.getElementById('textureFragmentShader').innerText
    const program = createProgram(gl, vs, fs)
    mat = new Mat({
        program,
        data: {
            u_PvMatrix: {
                value: pvMatrix.elements,
                type: 'uniformMatrix4fv',
            },
            u_ModelMatrix: {
                value: new Matrix4().elements,
                type: 'uniformMatrix4fv',
            },
        },
        maps: {
            u_Sampler: {
                image,
            }
        },
        mode: 'TRIANGLE_STRIP'
    })
    geo = new Geo({
        data: {
            a_Position: {
                array: vertices,
                size: 2
            },
            a_Pin: {
                array: new Float32Array([
                    0, 1,
                    0, 0,
                    1, 1,
                    1, 0,
                ]),
                size: 2
            }
        }
    })
    const obj = new Obj3D({ geo, mat })
    scence.unshift(obj)
    scence.draw()
}
```
scence.unshift(obj) 以前置的方式添加三维对象。

```js
unshift(...objs) {
    const { children, gl } = this
    objs.forEach(obj => {
        children.unshift(obj)
        obj.parent=this
        obj.init(gl)
    })
}
```
之所以这么做是为了将图片放在图框下面，也就是先渲染图片，再渲染图框。

效果如下：  
![](/webgl-practice/16.png)


接下来便可以在图片上添加鼠标交互事件了。

#### 3.3拖拽图片

拖拽图片是比较简单的，所以咱们先从最简单的说起。

1. 先声明一些必备变量

```js
// 变换状态
let state = 'none'
// 变换数据是否发生改变
let change = false
// 变换状态与cursor状态的对应关系
const cursorMap = new Map([
    ['drag', 'move'],
    ['rotate', 'alias'],
    ['scale', 'pointer'],
    ['none', 'default'],
])

// 拖拽起始位与结束位(世界坐标系)
const dragStart = new Vector2()
const dragEnd = new Vector2()
// 位移量
let offset = new Vector2()
// 饭盒本地矩阵
const mi = new Matrix4()
// 冰箱本地矩阵
const mb = new Matrix4()
// 模型矩阵
const mm = new Matrix4()
```

2. 监听canvas的鼠标按下事件

```js
canvas.addEventListener('mousedown', event => {
    // 获取鼠标的世界坐标位
    const mp = worldPos(event)
    // 获取变换状态，如果鼠标在图像里，那么变换状态就是'drag'
    if (isInImg(mp)) {
        state = 'drag'
        dragStart.copy(mp)
    }
})
```

鼠标按下时，主要做了2件事情：

- 鼠标在canvas中的位置转世界位，以便于判断鼠标和图片顶点的关系。

```js
const mp = worldPos(event)
```

```js
function worldPos({ clientX, clientY }) {
    const [hw, hh] = [canvas.width / 2, canvas.height / 2]
    // 裁剪空间位
    const cp = new Vector3(
        (clientX - hw) / hw,
        -(clientY - hh) / hh,
        0
    )
    // 鼠标在世界坐标系中的位置
    const p = cp.applyMatrix4(
        pvMatrix.clone().invert()
    )
    return new Vector2(p.x, p.y)
}
```

回顾一下我们之前所学的矩阵知识：

```js
裁剪空间位 = 投影视图矩阵 * 模型矩阵 * 初始顶点位
```

由上式可得：

```js
初始顶点位= (投影视图矩阵 * 模型矩阵)的逆矩阵 * 裁剪空间位
```

因为图片顶点就是基于世界坐标系定位的，世界坐标系是单位矩阵，任何矩阵与单位矩阵相乘都不会发生改变，所以模型矩阵可以忽略。

最终，鼠标的世界点位就是这样的：

```js
const p = cp.applyMatrix4(
    pvMatrix.clone().invert()
)
```

获取变换状态，如果鼠标在图像里，那么变换状态就是'drag'。

```js
if (isInImg(mp)) {
    state = 'drag'
    dragStart.copy(mp)
}
```

isInImg(dragStart) 是判断鼠标是否在图像中的方法。

```js
function isInImg(p) {
    return inTriangle(
        p,
        [
            { x: vertices[0], y: vertices[1] },
            { x: vertices[2], y: vertices[3] },
            { x: vertices[4], y: vertices[5] },
        ]
    ) || inTriangle(
        p,
        [
            { x: vertices[4], y: vertices[5] },
            { x: vertices[2], y: vertices[3] },
            { x: vertices[6], y: vertices[7] },
        ]
    )
}
```
inTriangle()：判断顶点是否在三角形中，返回布尔值。

因为图片由两个三角形组成，所以我做了两次判断。  
只要点位在任意三角形中，就说明点位在图片中。  

至于判断点位是否在三角形中的方法，我们之前说过。

```js
function inTriangle(p0, triangle) {
  let bool = true;
  for (let i = 0; i < 3; i++) {
    const j = (i + 1) % 3;
    const [p1, p2] = [triangle[i], triangle[j]];
    if (cross([p0, p1, p2]) < 0) {
      bool = false;
      break
    }
  }
  return bool;
}
function cross([p0, p1, p2]) {
  const [ax, ay, bx, by] = [
    p1.x - p0.x,
    p1.y - p0.y,
    p2.x - p0.x,
    p2.y - p0.y,
  ];
  return ax * by - bx * ay;
}
```

3. 监听canvas的鼠标移动事件

```js
canvas.addEventListener('mousemove', event => {
    // 获取鼠标世界位
    const mp = worldPos(event)
    // 设置鼠标样式
    if (state === 'none') {
        let cursorState = 'none'
        if (isInImg(mp)) {
            cursorState = 'drag'
        }
        canvas.style.cursor = cursorMap.get(cursorState)
        return
    }
    // 变换图片
    dragEnd.copy(mp)
    change = true
    switch (state) {
        case 'drag':
            drag()
            break
    }
    //渲染
    render()
})
```

鼠标移动时，主要做了4件事情：  
- 获取鼠标世界位，以便于判断鼠标和图片顶点的关系。
- 设置鼠标样式，此操作是在图片不处于任何变换状态时执行的。
- 变换图片
  - drag()：通过拖拽结束位减拖拽起始位得到图片的偏移量。

  ```js
  function drag() {
      offset.copy(
          dragEnd.clone().sub(dragStart)
      )
  }
  ```

渲染 render()

```js
function render() {
    const { elements } = mm.copy(getModelMatrix())
    mat.setData('u_ModelMatrix', {
        value: elements
    })
    matOut.setData('u_ModelMatrix', {
        value: elements
    })
    scence.draw()
}
```

我们重点看一下计算模型矩阵的方法getModelMatrix()

```js
function getModelMatrix() {
    // 位移矩阵
    const { x: px, y: py } = offset
    const moveMatrix = new Matrix4().set(
        1, 0, 0, px,
        0, 1, 0, py,
        0, 0, 1, 0,
        0, 0, 0, 1,
    )
    // 模型矩阵
    return mb.clone()
        .multiply(moveMatrix)
        .multiply(mi)
}
```

3. 监听canvas的鼠标抬起事件

```js
canvas.addEventListener('mouseup', () => {
    if (state !== 'none') {
        state = 'none'
        if (change) {
            change = false
            offset.set(0, 0)
            canvas.style.cursor = 'default'
            formatVertices()
        }
    }
})
```

鼠标抬起时，主要做了以下事情：

- 清理state 状态
- 清空图片的变换数据
- 恢复鼠标样式
- 格式化顶点数据，并更新几何体的顶点集合

```js
function formatVertices() {
    for (let i = 0; i < vertices.length; i += 2) {
        const p = new Vector3(vertices[i], vertices[i + 1], 0)
        .applyMatrix4(mm)
        vertices[i] = p.x
        vertices[i + 1] = p.y
    }
    verticesOut = getVerticesOut()
    geo.setData('a_Position', {
        array: vertices
    })
    geoOut.setData('a_Position', {
        array: verticesOut
    })
}
```

#### 3.4旋转图片

1. 声明必备变量

```js
// 变换基点
let orign = new Vector2()
// 拖拽起始位与结束位减变换基点位
const start2Orign = new Vector2()
const end2Orign = new Vector2()
// 旋转起始弧度
let startAng = 0
// 旋转量
let angle = 0
```

2. 鼠标按下

```js
canvas.addEventListener('mousedown', event => {
    // 获取鼠标拖拽的起始位dragStart，此位置为世界坐标位
    const mp = worldPos(event)
    // 获取变换状态，如果鼠标在图像里，那么变换状态就是'drag'
    if (isInImg(mp)) {
        state = 'drag'
        dragStart.copy(mp)
    } else {
        const node = selectNode(mp)
        if (node) {
            dragStart.copy(mp)
            state = node.state
            setOrign()
            start2Orign.subVectors(dragStart, orign)
            startAng = Math.atan2(start2Orign.y, start2Orign.x)
        }
    }
})
```

鼠标按下时，只要不是在图片里，就会做以下事情：

- 选择节点selectNode(dragStart)，返回节点索引和变换状态

```js
function selectNode(m) {
    let node = null
    for (let i = 0; i < vertices.length; i += 2) {
        const v = new Vector2(vertices[i], vertices[i + 1])
        const len = m.clone().sub(v).length() * canvas.height / 2
        if (len < 40) {
            node = { index: i, state: 'rotate' }
            break
        }
    }
    return node
}
```

- 若选中节点，则更新变换状态、基点、拖拽起点相对于基点的位置、起始弧度。

  详细看一下设置基点的方法：

```js
function setOrign() {
    const { x, y } = getCenter()
    orign.set(x, y)
    mi.makeTranslation(-x, -y, 0)
    mb.makeTranslation(x, y, 0)
}
function getCenter() {
      let [x1, y1] = [vertices[0], vertices[1]]
      let [x2, y2] = [vertices[6], vertices[7]]
      return new Vector2(
        x1 + (x2 - x1) / 2,
        y1 + (y2 - y1) / 2
      )
    }
```

3. 鼠标移动

```js
canvas.addEventListener('mousemove', event => {
    // 获取鼠标世界位
    const mp = worldPos(event)
    // 设置鼠标样式
    if (state === 'none') {
        let cursorState = 'none'
        if (isInImg(mp)) {
            cursorState = 'drag'
        } else {
            const node = selectNode(mp)
            cursorState = node ? node.state : 'none'
        }
        canvas.style.cursor = cursorMap.get(cursorState)
        return
    }
    // 变换图片
    dragEnd.copy(mp)
    end2Orign.subVectors(mp, orign)
    change = true
    switch (state) {
        case 'drag':
            drag()
            break
        case 'rotate':
            rotate()
            break
    }
    //渲染
    render()
})
```

rotate() 旋转方法

```js
function rotate() {
    const endAng = Math.atan2(end2Orign.y, end2Orign.x)
    angle = endAng - startAng
}
```

render() 方法无需改变，只是其中获取模型矩阵getModelMatrix() 的方法里，需要把旋转量算进去。

```js
function getModelMatrix() {
    // 位移矩阵
    const { x: px, y: py } = offset
    const moveMatrix = new Matrix4().set(
        1, 0, 0, px,
        0, 1, 0, py,
        0, 0, 1, 0,
        0, 0, 0, 1,
    )
    // 旋转矩阵
    const [s, c] = [Math.sin(angle), Math.cos(angle),]
    const rotateMatrix = new Matrix4().set(
        c, -s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    )
    // 模型矩阵
    return mb.clone()
        .multiply(moveMatrix)
        .multiply(rotateMatrix)
        .multiply(mi)
}
```

3. 鼠标抬起

```js
canvas.addEventListener('mouseup', () => {
    if (state !== 'none') {
        state = 'none'
        if (change) {
            change = false
            offset.set(0, 0)
            angle = 0
            canvas.style.cursor = 'default'
            formatVertices()
        }
    }
})
```

图片旋转的整体逻辑就是这样，当前图片默认是基于图片中心自由旋转。  
我们可以再为其做一下优化：按住alt键，基于鼠标对面的节点变换。

4. alt 键改变基点

```js
// 当前按下的键
let keys = new Set()
// 当前节点索引
let nodeInd = 0
// 节点对面的点
const opposite = new Map([[0, 6], [2, 4], [6, 0], [4, 2]])

// 监听canvas的鼠标按下事件
canvas.addEventListener('mousedown', event => {
    // 获取鼠标拖拽的起始位dragStart，此位置为世界坐标位
    const mp = worldPos(event)
    // 获取变换状态，如果鼠标在图像里，那么变换状态就是'drag'
    if (isInImg(mp)) {
        state = 'drag'
        dragStart.copy(mp)
    } else {
        const node = selectNode(mp)
        if (node) {
            dragStart.copy(mp)
            state = node.state
            nodeInd = node.index
            setOrign()
            start2Orign.subVectors(dragStart, orign)
            startAng = Math.atan2(start2Orign.y, start2Orign.x)
        }
    }
})

window.addEventListener('keydown', ({ keyCode }) => {
    keys.add(keyCode)
    setOrign()
})
window.addEventListener('keyup', ({ keyCode }) => {
    keys.delete(keyCode)
    setOrign()
})

/* 设置基点 */
function setOrign() {
    const { x, y } = keys.has(18) ? getOppo() : getCenter()
    orign.set(x, y)
    mi.makeTranslation(-x, -y, 0)
    mb.makeTranslation(x, y, 0)
}

// 对面的点
function getOppo() {
    const i2 = opposite.get(nodeInd)
    return new Vector2(vertices[i2], vertices[i2 + 1])
}
// 中点
function getCenter() {
    let [x1, y1] = [vertices[0], vertices[1]]
    let [x2, y2] = [vertices[6], vertices[7]]
    return new Vector2(
        x1 + (x2 - x1) / 2,
        y1 + (y2 - y1) / 2
    )
}
```

5. 默认按照特定弧度旋转。按住shift键时，再自由旋转。

```js
// 每次旋转的弧度
let angSpace = Math.PI / 12
function rotate() {
    const endAng = Math.atan2(end2Orign.y, end2Orign.x)
    angle = endAng - startAng
    if (!keys.has(16)) {
        angle = Math.round(angle / angSpace) * angSpace
    }
}
```

#### 3.5缩放图片

1. 建立必备变量

```js
// 缩放量
let zoom = new Vector2(1, 1)
```

2. 鼠标移动

```js
canvas.addEventListener('mousemove', event => {
    ……
    switch (state) {
            ……
            case 'scale':
                scale()
                break
    }
    render()
})

/* 缩放 */
function scale() {
    const sx = end2Orign.x / start2Orign.x
    const sy = end2Orign.y / start2Orign.y
    if (keys.has(16)) {
        //自由缩放
        zoom.set(sx, sy)
    } else {
        //等比缩放
        const ratio = end2Orign.length() / start2Orign.length()
        zoom.set(
            ratio * sx / Math.abs(sx),
            ratio * sy / Math.abs(sy),
        )
    }
}
```

3. 选择节点

```js
function selectNode(m) {
    let node = null
    for (let i = 0; i < vertices.length; i += 2) {
        const v = new Vector2(vertices[i], vertices[i + 1])
        const len = m.clone().sub(v).length() * canvas.height / 2
        if (len < 15) {
            node = { index: i, state: 'scale' }
            break
        } else if (len < 40) {
            node = { index: i, state: 'rotate' }
            break
        }
    }
    return node
}
```

4. 鼠标抬起

```js
canvas.addEventListener('mouseup', event => {
    ……
    zoom = new Vector2(1, 1)
    ……
})
```

5. 模型矩阵

```js
function getModelMatrix() {
    // 位移矩阵
    const { x: px, y: py } = offset
    const moveMatrix = new Matrix4().set(
        1, 0, 0, px,
        0, 1, 0, py,
        0, 0, 1, 0,
        0, 0, 0, 1,
    )
    // 旋转矩阵
    const [s, c] = [Math.sin(angle), Math.cos(angle),]
    const rotateMatrix = new Matrix4().set(
        c, -s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    )
    // 缩放矩阵
    const { x: sx, y: sy } = zoom
    const scaleMatrix = new Matrix4().set(
        sx, 0, 0, 0,
        0, sy, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    )
    // 模型矩阵
    return mb.clone()
        .multiply(moveMatrix)
        .multiply(rotateMatrix)
        .multiply(scaleMatrix)
        .multiply(mi)
}
```

上面的位移、旋转、缩放矩阵，我是故意展开的，以方便大家理解矩阵变换的本质。  
其实我们也可以使用Matrix4 对象内置的方法进行变换。

```js
function getModelMatrix() {
    return mb.clone()
        .multiply(
            new Matrix4().makeTranslation(
                position.x, position.y, 0
            )
    	)
        .multiply(
        	new Matrix4().makeRotationZ(angle)
    	)
        .scale(new Vector3(zoom.x, zoom.y, 1))
        .multiply(mi)
}
```

到目前为止，缩放的基本流程就搞定了。

然而，镜像缩放时，还会带来一个坑，此坑会影响图片的选择。


#### 3.6镜像缩放时的图片选择

且看下图：  
![](/webgl-practice/20.png)

之前是通过下面的方法判断点位是否在三角形中的：

```js
function inTriangle(p0, triangle) {
  let bool = true;
  for (let i = 0; i < 3; i++) {
    const j = (i + 1) % 3;
    const [p1, p2] = [triangle[i], triangle[j]];
    if (cross([p0, p1, p2]) < 0) {
      bool = false;
      break
    }
  }
  return bool;
}
function cross([p0, p1, p2]) {
  const [ax, ay, bx, by] = [
    p1.x - p0.x,
    p1.y - p0.y,
    p2.x - p0.x,
    p2.y - p0.y,
  ];
  return ax * by - bx * ay;
}
```

上面的 cross([p0, p1, p2]) < 0 是针对逆时针绘图的情况来判断的。

若是顺时针绘图，点位在三角形中需要满足的条件就应该是cross([p0, p1, p2]) > 0  
因此我们需要判断一下，这个图片是逆时针画的，还是顺时针画的。  

之前我们说过一个原理：叉乘是有方向的。  
通过上面的原理可以知道：在二维多边形中，通过叉乘求出的多边形的面积是有正负之分的。  
通过这个多边形的面积的正负，便可以判断图片是逆时针画的，还是顺时针画的。  
对于多边形求面积的具体推导过程，我就不细说了，因为细说我至少得说一个小时。  
大家先自己理解，要是理解不了，我再单独给大家引一章出来。  

接下来咱们通过代码说一下其具体实现过程。

1. 先封装一个按逆时针获取图片中两个三角形的方法，以便复用

```js
function getTriangles() {
    return [
        [
            { x: vertices[0], y: vertices[1] },
            { x: vertices[2], y: vertices[3] },
            { x: vertices[4], y: vertices[5] },
        ],
        [
            { x: vertices[4], y: vertices[5] },
            { x: vertices[2], y: vertices[3] },
            { x: vertices[6], y: vertices[7] },
        ]
    ]
}
```

2. 再封装一个获取面积的方法

```js
function getArea() {
    const [t1, t2] = getTriangles()
    return cross(t1) + cross(t2)
}
```

上面所求的面积实际上是图片面积的两倍，不过这都无所谓，我只需要面积的正负。

3. 声明面积变量

```js
// 面积
let area = getArea()
```

4. 在判断点位是否在三角形中的时候，乘上面积

```js
function inTriangle(p0, triangle) {
    let bool = true;
    for (let i = 0; i < 3; i++) {
        const j = (i + 1) % 3;
        const [p1, p2] = [triangle[i], triangle[j]];
        if (area * cross([p0, p1, p2]) < 0) {
            bool = false;
            break
        }
    }
    return bool;
}
```

5. 面积需要随顶点数据的格式化同步更新

```js
function formatVertices() {
    for (let i = 0; i < vertices.length; i += 2) {
        const p = new Vector3(vertices[i], vertices[i + 1], 0)
        .applyMatrix4(mm)
        vertices[i] = p.x
        vertices[i + 1] = p.y
    }
    area = getArea()
    geo.setData('a_Position', {
        array: vertices
    })
    geoOut.setData('a_Position', {
        array: getVerticesOut()
    })
}
```

### 4.保留初始点位

我之前在变换图片时，其实还有一处瑕疵，那就是无法保留初始点位。

初始点位与浮点数进行多次运算，容易引起数据失真。

当然，若变换次数不多，肉眼是很难发现失真的。

对于上面的问题，我们是可以通过保留初始点位来解决的。

接下来咱们说一下其实现思路。

#### 4.1实现思路

`已知`：图片img

`求`：基于图片的左上角点P变换图片，且保留图片初始点位的方法

`解`：

1. 搭建矩阵

- 把图片装画框里，画框的本地矩阵是mh
- 把画框装饭盒里，饭盒的本地矩阵是mi
- 把饭盒装冰箱里，冰箱的本地矩阵是mb

2. 设置变换基点：

- mi-P
- mb+P

3. 变换冰箱的本地矩阵mb

4. 在第二次变换时，将所有变换数据合入画框mh中

5. 渲染时的模型矩阵：

```js
mb*mi*mh
```

#### 4.2代码实现

在之前代码的基础上进行修改。

1. 声明必备数据

```js
// 图片初始顶点
const verticesBasic = new Float32Array([
    -hw, hh,
    -hw, -hh,
    hw, hh,
    hw, -hh,
])
// 图片顶点的世界位
const vertices = Float32Array.from(verticesBasic)
// 画框本地矩阵
const mh = new Matrix4()
```

2. 将图片和图片外框的顶点数据写死，之后在变换的时候无需修改初始点位，直接修改模型矩阵即可。

```js
geoOut = new Geo({
    data: {
        a_Position: {
            array: new Float32Array([
                verticesBasic[0], verticesBasic[1],
                verticesBasic[2], verticesBasic[3],
                verticesBasic[6], verticesBasic[7],
                verticesBasic[4], verticesBasic[5],
            ]),
            size: 2
        },
    }
})
……
geo = new Geo({
    data: {
        a_Position: {
            array: verticesBasic,
            size: 2
        },
        a_Pin: {
            array: new Float32Array([0, 1,0, 0,1, 1,1, 0,]),
            size: 2
        }
    }
})
```

3. 在格式化顶点数据的方法里，已经无需更新几何体的顶点数据，只需要获取图片顶点的世界位即可。

```js
function formatVertices() {
    mh.copy(mm.clone().multiply(mh))
    for (let i = 0; i < verticesBasic.length; i += 2) {
        const p = new Vector3(verticesBasic[i], verticesBasic[i + 1], 0)
        .applyMatrix4(mh)
        vertices[i] = p.x
        vertices[i + 1] = p.y
    }
    area = getArea()
}
```

4. 在渲染方法里计算模型矩阵的时候，再乘上画框的本地矩阵

```js
function render() {
    mm.copy(getModelMatrix())
    const { elements } = mm.clone().multiply(mh)
    mat.setData('u_ModelMatrix', {
        value: elements
    })
    matOut.setData('u_ModelMatrix', {
        value: elements
    })
    scence.draw()
}
```

关于鼠标对图像的变换我们就说到这。

虽然我们在这里是拿二维图片举的例子，然而其实现思想都是按三维走的，就比如模型矩阵的运算。

通过上面的例子，大家可以知道修改模型的两种方式：

- 直接修改构成模型的初始点位
- 修改模型矩阵

当然，上面的操作最终都是在移动模型的初始点位，只是其应用场景会有所不同。  
前者适合对模型的局部顶点进行修改，就比如对图片的某一个顶点进行拉扯。  
后者适合对模型的所有顶点统一变换。  

大家理解了这两种方式的差异，也就知道了在three.js 里什么时候要修改BufferGeometry对象里的顶点，什么时候修改Object3D对象的本地矩阵。



### 扩展：展望浏览器3D图形的方向

自2000年后，随着Direct3D 的日益壮大，OpenGL 已经逐渐失去了曾经的辉煌，虽然 2009  年后，OpenGL 陆续从3.1发布到了现在的4.5。  
2011年，基于OpenGL 标准发布的WebGL成为了OpenGL 的一大亮点，WebGL至今在浏览器3d图形始终是一家独大，不可替代。  
然而，成也萧何败也萧何，  WebGL的发展受制于OpenGL 的很多历史遗留问题。  
随着webGPU的出现，WebGL在未来被webGPU替代已经成为了必然。  

因此，我自己做个简单预测：

- 至少5年内，WebGL不会被webGPU替代。
- 就算所有浏览器都兼容webGPU了，WebGL 也不会在短期内被浏览器屏蔽。
- webGPU 生态的形成需要很长的时间，从webgl至今10年的慢热过程，能看出一二。

基于WebGL的现状，我们需要将更多的重心放在图形学，因为当我们图形学扎实了，无论语言规则如何去变，我们都可以稳住阵脚，到时无非就是再学一遍api。

如果大家在考虑为以后的中年危机押注，在我看来，图形学就是一个不错的选择，其次才是three.js、Babylon.js 之类的源码，最后在日常生活中再一点点的练习和积累一下艺术和审美能力。


## 十一.选择三维对象

`注`：这里所说的二维图形和三维图形都是由三角网构成的。

### 1.选择三维对象的基本原理

首先了解几个概念：

- 从相机视点位射向鼠标点可以做一条射线。
- 构成三角形的三个顶点可以确定一个平面。
- 在由三角网构成的三维模型中，选中一个三角形，就是选中了三维模型。

因此，要判断鼠标是否选正了模型，就得按以下几步走：

1. 获取从相机视点位射向鼠标点的射线ray。
2. 获取射线 ray 与三角形所在的平面的交点M。
3. 判断交点 M 是否在三角形中。

#### 1.1射线

首先声明，射线和向量不是一回事，虽然它们都有方向。  
向量是有方向，有长度的量。

在用坐标位(x, y, z)表示的向量中，其起点就是原点。
比如已知A、B两点，那么向量AB=B-A，其图像性质就是A这个起点最终会被对齐到原点上。

而射线是有方向，长度无限，原点可变的线。  
射线（ray），是指由线段的一端无限延长所形成的线。射线仅有一个端点，无法测量长度。

其图像如下：  
![](/webgl-practice/22.png)

可以想象手电筒发出的光线：

- 手电筒的位置就是原点O，也是光源的位置，这个位置是可变的。
- 手电筒所照射的方向就是射线的方向v，我们可以转动手电筒，改变射线的方向。

若在射线上基于某个基底做刻度，那么：

- 在 V 方向上的刻度大小和刻度到原点的距离成正比。
- 在 V 的反方向上的刻度大小和刻度到原点的距离成反比。

通过射线的特性，可以想到齐次坐标系里的x、y、z轴就是射线。

在three.js 里就有一个射线对象 Ray ( origin : Vector3, direction : Vector3 )

- origin 射线原点
- direction 射线方向。

#### 1.2平面

确定一个平面的几种常见方法：

1. 不共线的三点确定一个平面   

![](/webgl-practice/23.png)

2. 平面法线+平面内任意一点

![](/webgl-practice/24.png)

3. 平面法线+平面到原点的有向距离

![](/webgl-practice/25.png)


在three.js 里就有一个平面对象Plane( normal : Vector3, constant : Float)，其构造参数中：

- normal 就是上面的平面法向量，简称法线
- constant 则是平面到原点的有向距离

从此之外，Plane也提供了通过前两种方式建立平面的方法：

- setFromCoplanarPoints ( a : Vector3, b : Vector3, c : Vector3 )  不共线的三点确定平面
- setFromNormalAndCoplanarPoint ( normal : Vector3, point : Vector3 )  平面法线+平面内任意一点确定平面

### 2.射线与平面的交点

#### 2.1数学解

![](/webgl-practice/26.png)

`已知`：

- 平面α
  - 点A(ax,ay,az)为平面α 中任一点
  - 向量n(nx,ny,nz)为平面α的法向量
- 射线l
  - 射线l 的原点为点E(ex,ey,ez) 
  - 射线l 的方向为v(vx,vy,vz)

`求`：射线l与平面α的交点M

`解`：

因为：  
α⊥n⇒α 中的所有直线⊥n   
(M-A)∈α    
所以，由垂直向量的关系得：

```js
(M-A)·n=0 
```

由向量的数乘得：

```js
EM=λ*v
```

所以：

```js
M-E=λ*v
```

因为：

向量的加减运算符合交换律

所以：

```js
M=λv+E
```

接下来求出λ，便可得M 值。

对比上面求出的两个等式：

```js
(M-A)·n=0  ①
M=λv+E     ②
```

- M 是我们最终要求的因变量
- λ 是我们下一步要求的未知数
- 其余的射线方向v、平面法线n、射线原点E，都是已知常量

所以，上面的两个等式就是一个二元一次方程式组，M、λ 就其中的二元。

用消元法把等式②代入等式① 中 消掉M，得到λ：

```js
(λv+E-A)·n=0
λv·n=(A-E)·n
λ=(A-E)·n/v·n
```

将λ 代入等式②中，得到M：

```js
M=((A-E)·n/v·n)*v+E
```

上面的公式便是射线与平面的交点公式了。

数学原理已通，接下来咱们用代码实现一下。

#### 2.2代码实现

拿勾股定理中的特殊数据举例。

![](/webgl-practice/27.png)

`已知`：

```js
// 三角形ABC
const A = new Vector3(-6, 0, -4)
const B = new Vector3(0, 0, 4)
const C = new Vector3(6, 0, -4)
// 视点
const E = new Vector3(0, 12, 16)
// 鼠标点
const P = new Vector3(0, 3, 4)
```

`求`：以相机视点为原点且指向鼠标位置的射线与三角形 ABC 所在的平面的交点 M

`解`：

通过勾股定理可知，其交点M必然是零点，接下来用代码测一下。

先求一下三角形ABC的法线

```js
const AB = new Vector3().subVectors(B, A)
const BC = new Vector3().subVectors(C, B)
const n = new Vector3().crossVectors(AB, BC)
```

通过视点和鼠标点计算射线方向

```js
const v = new Vector3().subVectors(P, E).normalize()
```

射线与平面的交点公式求交点

```js
// M=((A-E)·n/v·n)*v+E
const M = v.clone().multiplyScalar(
    A.clone().sub(E).dot(n) / v.clone().dot(n)
).add(E)
```

最后输出一下M：

```js
console.log('M', M);
// Vector3 {x: 0, y: -1.7763568394002505e-15, z: -3.552713678800501e-15}
```

上面的y、z分量受到了浮点数的误差影响，不好分辨其具体大小。  
可以取其小数点后5位看看：

```js
console.log(
    M.x.toFixed(5),
    M.y.toFixed(5),
    M.z.toFixed(5)
);
// 0.00000 -0.00000 -0.00000
```

由上可知交点M就是零点。  
其实，也可以用 three.js 来测试上面的算法对不对。

#### 2.3three.js测试

1. 用不共线的三点建平面

```js
const plane = new Plane().setFromCoplanarPoints(A, B, C)
```

2. 计算射线方向

```js
const v = new Vector3().subVectors(P, E).normalize()
```

3. 用基点和射线方向建立射线

```js
const ray = new Ray(E, v)
```

4. 用射线对象的 intersectPlane() 方法求射线与平面的交点

```js
const M = new Vector3()
ray.intersectPlane(plane, M)
```

5. 输出M

```js
console.log('M', M);
//M Vector3 {x: 0, y: 0, z: 0}
```

其交点是零点，与之前算过的一样。


接下来，我们还可以再拿几个在勾股定理之内的特殊高度的三角形来试一下。  
比如高度为6、9的三角形：

```js
const A = new Vector3(-6, 6, -4)
const B = new Vector3(0, 6, 4)
const C = new Vector3(6, 6, -4)
```

```js
const A = new Vector3(-6, 9, -4)
const B = new Vector3(0, 9, 4)
const C = new Vector3(6, 9, -4)
```

测试都是没问题的。

现在，知道了射线和三角形所在平面的交点，接下来便可以判断一下这个交点是否在三角形中了。


### 3.在空间中判断点是否在三角形中

之前在二维平面中用叉乘判断过点是否在三角形中，在三维空间中也是要用叉乘来判断的。  
只不过，三维向量的叉乘结果还是向量，无法像二维向量的叉乘那样，用一个实数结果判断其大于零还是小于零。  
因此，在空间中判断点是否在三角形中，还得再加一步操作。至于这一步是啥，咱们一步步来说。

#### 3.1代码实现

![](/webgl-practice/28.png)

由上一个例子的三角形ABC和空间点M为已知条件。  
判断：点M是否在三角形ABC中

`解`：

```js
// 三角形
const triangle = [A, B, C]
// 是否在三角形中
function inTriangle(M, triangle) {
    let bool = true
    for (let i = 0; i < 3; i++) {
        const j = (i + 1) % 3
        const [a, b] = [triangle[i], triangle[j]]
        const ma = a.clone().sub(M)
        const ab = b.clone().sub(a)
        const d = ma.clone().cross(ab)
        const len = d.dot(n)
        if (len < 0) {
            bool = false
            break
        }
    }
    return bool
}
const bool = inTriangle(M, triangle)
console.log(bool);
```

详细解释一下上面的inTriangle()方法

1. for 循环遍历三角形的三条边

```js
const j = (i + 1) % 3
const [a, b] = [triangle[i], triangle[j]]
```

2. 分别将点和三角形的三条边做叉乘运算

```js
const ma = a.clone().sub(M)
const ab = b.clone().sub(a)
// ma和ab的垂直向量
const d = ma.clone().cross(ab)
```

上面的叉乘结果可以理解为一条垂直向量，此垂直向量垂直三角的三条边，且垂直于M点到三角形三条边的连线。

重点要知道，这条垂直向量是有方向的，它可能与三角形的法线同向，也可能与三角形的法线异向。  
当M点在三角形中是，M点连接三角形三边得到的垂直向量会有一个特点，要么都在三角形法线的正方向上，要么都与三角形法线的负方向上。  
至于什么时候在正方向上，什么时候在负方向上，这跟鼠标点和三角形三条边的连接顺序，以及三角形的绘图顺序有关。

3. 判断垂直向量在三角形的哪一侧

```js
const len = d.dot(n)
if (len < 0) {
    bool = false
    break
}
```

在上面，利用两个向量的点积可以将两个向量的方向关系转换为一个实数。  
至于其具体原理，在高中课本的点积里有说，在这里就先简单说一下了。

`已知`：向量a、b

`则`：

```
a·b=|a|*|b|*cos<a,b>
cos<a,b>=a·b/|a|*|b|
```

以向量a 为坐标基线，则：

- 当cos<a,b>大于0时，<a,b>∈(-90°,90°)，a在向量b 的正方向上
- 当cos<a,b>小于0时，<a,b>∈(90°,180°)∪(-90°,-180°)，a在向量b 的负方向上

因为，之前是按照三角形的绘图顺序让鼠标点与三角形的三条边进行的连接，然后分别求出了三条垂直向量。  
所以，当三角形是逆时针画的，且鼠标点在三角形中时，三条垂直向量都在三角形法线的正方向上。  
若有一条垂直向量不在三角形法线的正方向上，那就说明 M 点不在三角形中。  

接下来，依旧 three.js 测试一下。

#### 3.2 three.js 测试

射线对象直接有一个intersectTriangle() 方法，用于判断射线是否穿过了一个三角形。

```js
{
    const plane = new Plane().setFromCoplanarPoints(A, B, C)
    const dir = new Vector3().subVectors(P, E).normalize()
    const ray = new Ray(E, dir)
    const M = new Vector3()
    ray.intersectTriangle(
        A, B, C,
        true,
        M
    )
}
```

intersectTriangle ( a : Vector3, b : Vector3, c : Vector3, backfaceCulling : Boolean, target : Vector3 )

- a, b, c - 组成三角形的三个Vector3。
- backfaceCulling - 是否使用背面剔除。
- target — 结果将会被复制到这一Vector3中。

注：使用intersectTriangle()方法时，若射线没有穿过三角形，会返回零点。这个有点坑，万一射线和三角形的交点就是零点，那就没法判断射线有没有穿过三角形了。


### 4.鼠标选择立方体

在这个案例中所涉及的知识点以前都说过，所以直接上代码。  
之前咱们用顶点索引画过一个彩色的立方体，就在这基础上做选择了。

#### 4.1声明必备变量

先将投影视图矩阵、顶点集合和顶点索引提取出来，以备后用。

```js
// 投影视图矩阵
const pvMatrix = new Matrix4()

// 旋转状态
let selected = false
    
// 顶点集合
const vertices = new Float32Array([
    1, 1, 1,
    -1, 1, 1,
    -1, -1, 1,
    1, -1, 1,
    1, -1, -1,
    1, 1, -1,
    -1, 1, -1,
    -1, -1, -1,
])

// 顶点索引
const indexes = new Uint8Array([
    0, 1, 2, 0, 2, 3,    // front
    0, 3, 4, 0, 4, 5,    // right
    0, 5, 6, 0, 6, 1,    // up
    1, 6, 7, 1, 7, 2,    // left
    7, 4, 3, 7, 3, 2,    // down
    4, 7, 6, 4, 6, 5     // back
])
```



#### 4.2鼠标移动事件

在鼠标移动的时候，更新投影视图矩阵，并选择对象。

```js
canvas.addEventListener('pointermove', event => {
    orbit.pointermove(event)
    pvMatrix.copy(orbit.getPvMatrix())
    selectObj(event)
})
```

重点看一下选择对象的方法selectObj(event)

```js
function selectObj(event) {
    // 鼠标世界位
    const mp = worldPos(event)
    // 射线
    const ray = new Ray(camera.position).lookAt(mp)
    // 选择状态
    selected = false
    // 遍历三维对象里的所有三角形
    for (let i = 0; i < indexes.length; i += 3) {
        //三角形
        const triangle = [
            getVector3(indexes[i]),
            getVector3(indexes[i + 1]),
            getVector3(indexes[i + 2]),
        ]
        //射线与三角形的交点。若有交点，返回交点；若无交点返回null
        const interPos = intersectTriangle(ray, triangle)
        //只要一个三角形被选中，则三维对象被选中
        if (interPos) {
            selected = true
            break
        }
    }
}
```

1. worldPos()获取鼠标世界位，这个方法咱们之前在基点变换中写过

```js
function worldPos({ clientX, clientY }) {
    const [hw, hh] = [canvas.width / 2, canvas.height / 2]
    // 裁剪空间位
    const cp = new Vector3(
        (clientX - hw) / hw,
        -(clientY - hh) / hh,
        0
    )
    // 鼠标在世界坐标系中的位置
    return cp.applyMatrix4(
        pvMatrix.clone().invert()
    )
}
```

2. 建立射线的Ray对象是three.js里的，其lookAt()方法可以让射线射向某个点位，从而改变射线的方向。

```js
const ray = new Ray(camera.position).lookAt(mp)
```

3. 变量立方体中的所有三角形的时候，是先以三个点位单位遍历的顶点索引，然后再基于顶点索引从顶点集合中寻找相应的顶点数据。

```js
for (let i = 0; i < indexes.length; i += 3) {
    //三角形
    const triangle = [
        getVector3(indexes[i]),
        getVector3(indexes[i + 1]),
        getVector3(indexes[i + 2]),
    ]
    ……
}
```

getVector3() 基于顶点索引从顶点集合中寻找相应的顶点数据

```js
function getVector3(j) {
    const i = j * 3
    return new Vector3(
        vertices[i],
        vertices[i + 1],
        vertices[i + 2]
    )
}
```

4. 获取射线与三角形的交点。若有交点，返回交点；若无交点返回null

```js
const interPos = intersectTriangle(ray, triangle)
```

intersectTriangle() 方法的实现原理，之前已经写过

```js
function intersectTriangle(ray, triangle) {
    const { origin: E, direction: v } = ray
    const [A, B, C] = triangle
    // 三角形的法线
    const AB = new Vector3().subVectors(B, A)
    const BC = new Vector3().subVectors(C, B)
    const n = new Vector3().crossVectors(AB, BC)

    // 射线和平面的交点
    const M = v.clone().multiplyScalar(
        A.clone().sub(E).dot(n) / v.clone().dot(n)
    ).add(E)

    // 判断点M是否在三角形中
    let bool = true
    for (let i = 0; i < 3; i++) {
        const j = (i + 1) % 3
        const [a, b] = [triangle[i], triangle[j]]
        const ma = a.clone().sub(M)
        const ab = b.clone().sub(a)
        const d = ma.clone().cross(ab)
        const len = d.dot(n)
        if (len < 0) {
            bool = false
            break
        }
    }
    if (bool) {
        return M
    } else {
        return null
    }
}
```

5. 更新选择状态，只要一个三角形被选中，则三维对象被选中

```js
if (interPos) {
    selected = true
    break
}
```

鼠标选择三维对象的基本原理就是这样。

以前，我遇到一个需求：场景里有一架大风车，当用户把鼠标放在风车的风扇上时，风扇就转动。

接下来，咱们就把这个立方体当成风扇，当鼠标放上去的时候，风扇既能转动，还能变色。


6. 声明必备变量

```js
// 模型矩阵
const modelMatrix = new Matrix4()
// 插值-用于修改片元颜色
let time = 0
// 弧度-用于旋转模型矩阵
let ang = 0
```

7. 在获取顶点的时候，用模型矩阵将其转换成世界位

```js
function getVector3(j) {
    const i = j * 3
    return new Vector3(
        vertices[i],
        vertices[i + 1],
        vertices[i + 2]
    ).applyMatrix4(modelMatrix)
}
```

之前强调过，判断图形关系的时候，一定要统一坐标系。  
之前获取的鼠标位是世界位，所以模型顶点也一定要是世界位。

8. 在连续渲染的时候，若鼠标选中了对象，就让立方体既能旋转，也能变色。

```js
!(function ani() {
    scene.setUniform(
        'u_PvMatrix',
        pvMatrix.elements
    )
    if (selected) {
        time += 20
        ang += 0.05
        mat.setData('u_Time',{value: time})
        mat.setData(
            'u_ModelMatrix',
            {
                value: new Matrix4().makeRotationY(ang).elements
            }
        )
    }
    scene.draw()
    requestAnimationFrame(ani)
})()
```


## 十二.别墅室内布局图

接下来，要做一栋别墅室内布局图的空间展示。  
![](/webgl-practice/29.jpg)

此案例会每隔一段时间，依次对楼层进行特写。  
楼层的特写要通过两个矩阵实现：

- 模型矩阵：让当前楼层向前一步走，然后放大。
- 视图矩阵：把镜头拉向当前楼层。

上面的效果不是瞬间完成的，它还需要一个补间动画去过渡。  
因此，在这个案例里，我们重点要说的知识点是相机轨道的补间动画。  
相机轨道的补间动画，是我们实际工作中不可避免的。

我们可以想象到许许多多与之相关的场景。  
比如在4s店里，一辆汽车模型的展示。我可以通过一个交互操作，将相机从外部打入内部，看一下汽车的内部结构。  

接下来，咱们就先完善一下之前的webgl 框架，以方便我们更好的去举例子。

### 1.完善webgl 框架

当前这个 webgl 框架是以需求为驱动的，没有一下子尽善尽美，那样会有太多功能用不上，也不好理解。  
在对其做进一步完善之前，先通过一个例子回顾一下当前webgl 框架的运作原理。

`已知`：

- 程序点对象A，属于此程序对象的三维对象有两个
  - 三维对象A1
  - 三维对象A2
- 程序点对象B，属于此程序对象的三维对象有两个
  - 三维对象B1
  - 三维对象B2

`绘图逻辑`：

1. 清理画布

2. 绘制三维对象A1

  - 应用程序对象A
  - 更新attribute 变量
  - 更新uniform 变量
  - 绘图

3. 绘制三维对象A2

  - 应用程序对象A
  - 更新attribute 变量
  - 更新uniform 变量
  - 绘图

4. 绘制三维对象B1

  - 应用程序对象B
  - 更新attribute 变量
  - 更新uniform 变量
  - 绘图

5. 绘制三维对象B2

  - 应用程序对象B
  - 更新attribute 变量
  - 更新uniform 变量
  - 绘图

观察上面的绘图逻辑，可以知道：

- 同一材质的三维对象，可以共用以下数据：
  - 程序对象
  - attribute变量名
  - uniform 变量名
- 不同的三维对象，独立具备以下数据：
  - attribute 数据
  - uniform 数据
  - buffer 缓冲区对象

因此可以将材质提取出来，相同材质的对象一起渲染，逻辑如下：

1. 清理画布

2. 应用程序对象A

   - 绘制三维对象A1

   - 绘制三维对象A2

3. 应用程序对象B

   - 绘制三维对象B1

   - 绘制三维对象B2

上面便是基本的优化思路，接下来用代码写一下。

#### 1.1 Scene 场景对象

整体代码
```js
const defAttr = () => ({
  gl:null,
  children: new Set(),
  programs:new Map(),
  children2Draw: new Set(),
})
export default class Scene{
  constructor(attr){
    Object.assign(this,defAttr(),attr)
  }
  registerProgram(name, { program, attributeNames, uniformNames}) {
    const { gl,programs } = this
    const attributes = new Map()
    const uniforms = new Map()
    gl.useProgram(program)
    attributeNames.forEach(name => {
      attributes.set(name,gl.getAttribLocation(program, name))
    })
    uniformNames.forEach(name => {
      uniforms.set(name,gl.getUniformLocation(program, name))
    })
    programs.set(name,{program,attributes,uniforms})
  }
  add(...objs) {
    this.children=new Set([...this.children,...objs])
    this.setObjs(objs)
  }
  unshift(...objs) {
    this.children=new Set([...objs,...this.children,])
    this.setObjs(objs)
  }
  setObjs(objs) {
    objs.forEach(obj => {
      obj.parent=this
      obj.init(this.gl)
    })
    this.updateChildren2Draw()
  }
  remove(obj) {
    this.children.delete(obj)
    this.updateChildren2Draw()
  }
  updateChildren2Draw() {
    const { children} = this
    if (!children.size) { return }
    const children2Draw = new Map()
    children.forEach(child => {
      const { program:name } = child.mat
      if (children2Draw.has(name)) {
        children2Draw.get(name).add(child)
      } else {
        children2Draw.set(name, new Set([child]))
      }
    })
    this.children2Draw=children2Draw
  }
  setUniform(key, val) {
    this.children.forEach(({ mat }) => {
      mat.setData(key,val)
    })
  }
  draw() {
    const {gl,children2Draw,programs}=this
    gl.clear(gl.COLOR_BUFFER_BIT)
    for(let [key,objs] of children2Draw.entries()){
      const { program, attributes, uniforms } = programs.get(key)
      gl.useProgram(program)
      objs.forEach(obj => {
        const { geo: { drawType,count},mat:{mode}}=obj
        obj.update(gl, attributes, uniforms)
        if (typeof mode === 'string') {
          this[drawType](gl,count,mode)
        } else {
          mode.forEach(m => {
            this[drawType](gl,count,m)
          })
        }
      })
    }
  }
  drawArrays(gl, count, mode) {
    gl.drawArrays(gl[mode],0,count)
  }
  drawElements(gl, count, mode) {
    gl.drawElements(gl[mode],count,gl.UNSIGNED_BYTE,0)
  }
}
```

1. 默认属性

```js
const defAttr = () => ({
  gl:null,
  children: new Set(),
  programs:new Map(),
  children2Draw: new Map(),
})
```
children 变成了Set对象，以避免三维对象的重复添加。  
programs 程序对象集合  

```js
{
  程序对象的名称:{
    program:程序对象,
    attributes:attribute变量名集合
    uniforms:uniform变量名集合
  }
}
```

children2Draw 用于绘图的程序对象和三维对象的集合，数据结构如下：
```js
{
  程序对象的名称:[属于此程序对象的所有三维对象]
}
```

2. 建立一个注册程序对象的方法，方便将具有相同程序对象的三维对象一起渲染。

```js
registerProgram(name, { program, attributeNames, uniformNames}) {
  const { gl,programs } = this
  const attributes = new Map()
  const uniforms = new Map()
  gl.useProgram(program)
  attributeNames.forEach(name => {
    attributes.set(name,gl.getAttribLocation(program, name))
  })
  uniformNames.forEach(name => {
    uniforms.set(name,gl.getUniformLocation(program, name))
  })
  programs.set(name,{program,attributes,uniforms})
}
```
- name：程序对象的名称
- option：{}
  - program：程序对象
  - attributeNames：attribute变量名集合，如['a_Position','a_Pin',……]
  - uniformNames：uniform变量名集合，如['u_PvMatrix','u_ModelMatrix',……]

3. 之前的init 初始化方法可以删掉了，因为Scene对象的registerProgram方法和Object 对象的init() 方法已经分摊了此功能。

4. 增删三维对象，其原理和之前一样
```js
add(...objs) {
    this.children=new Set([...this.children,...objs])
    this.setObjs(objs)
}
unshift(...objs) {
    this.children=new Set([...objs,...this.children,])
    this.setObjs(objs)
}
setObjs(objs) {
    objs.forEach(obj => {
        obj.parent=this
        obj.init(this.gl)
    })
    this.updateChildren2Draw()
}
remove(obj) {
    this.children.delete(obj)
    this.updateChildren2Draw()
}
```

在增删三维对象时，需要同步更新children2Draw 集合

```js
updateChildren2Draw() {
  const { children} = this
  if (!children.size) { return }
  const children2Draw = new Map()
  children.forEach(child => {
    const { program:name } = child.mat
    if (children2Draw.has(name)) {
      children2Draw.get(name).add(child)
    } else {
      children2Draw.set(name, new Set([child]))
    }
  })
  this.children2Draw=children2Draw
}
```

5. 批量设置所有模型的uniform 变量

```js
setUniform(key, val) {
    this.children.forEach(({ mat }) => {
        mat.setData(key,val)
    })
}
```

6. 绘图

```js
draw() {
  const {gl,children2Draw,programs}=this
  gl.clear(gl.COLOR_BUFFER_BIT)
  for(let [key,objs] of children2Draw.entries()){
    const { program, attributes, uniforms } = programs.get(key)
    gl.useProgram(program)
    objs.forEach(obj => {
      const { geo: { drawType,count},mat:{mode}}=obj
      obj.update(gl, attributes, uniforms)
      if (typeof mode === 'string') {
        this[drawType](gl,count,mode)
      } else {
        mode.forEach(m => {
          this[drawType](gl,count,m)
        })
      }
    })
  }
}
drawArrays(gl, count, mode) {
  gl.drawArrays(gl[mode],0,count)
}
drawElements(gl, count, mode) {
  gl.drawElements(gl[mode],count,gl.UNSIGNED_BYTE,0)
}
```

#### 1.2 Geo 几何体对象

整体代码：
```js
const defAttr = () => ({
  data: {},
  count: 0,
  index: null,
  drawType:'drawArrays'
})
export default class Geo{
  constructor(attr){
    Object.assign(this,defAttr(),attr)
  }
  init(gl){
    this.initData(gl)
    this.initIndex(gl)
  }
  initData(gl) {
    for (let attr of Object.values(this.data)) {
      attr.buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer)
      gl.bufferData(gl.ARRAY_BUFFER, attr.array, gl.STATIC_DRAW)
      gl.bindBuffer(gl.ARRAY_BUFFER, null)
      attr.needUpdate=true
    }
  }
  initIndex(gl) {
    const { index } = this
    if (index) {
      this.count = index.array.length
      this.drawType='drawElements'
      index.buffer = gl.createBuffer()
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,index.buffer)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index.array, gl.STATIC_DRAW)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
      index.needUpdate=true
    } else {
      const { array, size } = this.data['a_Position']
      this.count = array.length / size
      this.drawType='drawArrays'
    }
  }
  update(gl,attrs) {
    this.updateData(gl,attrs)
    this.updateIndex(gl,attrs)
  }
  updateData(gl,attrs) {
    for (let [key,attr] of Object.entries(this.data)) {
      const { buffer, size, needUpdate, array } = attr
      const location=attrs.get(key)
      gl.bindBuffer(gl.ARRAY_BUFFER,buffer)
      if (needUpdate) {
        attr.needUpdate = false
        gl.bufferData(gl.ARRAY_BUFFER,array,gl.STATIC_DRAW)
      }
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(location)
    }
  }
  updateIndex(gl) {
    const { index } = this
    if (index) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,index.buffer)
      if (index.needUpdate) {
        index.needUpdate = false
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,index.array,gl.STATIC_DRAW)
      }
    }
  }
  setData(key,val) {
    const obj = this.data[key]
    if(!obj){return}
    obj.needUpdate = true
    Object.assign(obj,val)
  }
  setIndex(val) {
    const { index } = this
    if (val) {
      index.needUpdate = true
      index.array=val
      this.count = val.length
      this.drawType='drawElements'
    } else {
      const {array,size}=this.data['a_Position']
      this.count=array.length/size
      this.drawType='drawArrays'
    }
  }
}
```

解释一下上面的代码。

1. 初始化方法

- 删掉之前的useProgram 方法，因为此方法已经在Scene对象中统一执行。
- 在初始化方法中，只建立存储attribute 数据和顶点索引集合的WebGLBuffer 缓冲区。

```js
init(gl){
  this.initData(gl)
  this.initIndex(gl)
}
initData(gl) {
  for (let attr of Object.values(this.data)) {
    attr.buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer)
    gl.bufferData(gl.ARRAY_BUFFER, attr.array, gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    attr.needUpdate=true
  }
}
initIndex(gl) {
  const { index } = this
  if (index) {
    this.count = index.array.length
    this.drawType='drawElements'
    index.buffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,index.buffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index.array, gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
    index.needUpdate=true
  } else {
    const { array, size } = this.data['a_Position']
    this.count = array.length / size
    this.drawType='drawArrays'
  }
}
```

2. 更新方法和之前的差异不大。在更新attribute 数据时，location需要从Scene 对象的programs中获取。

```js
update(gl,attrs) {
  this.updateData(gl,attrs)
  this.updateIndex(gl,attrs)
}
updateData(gl,attrs) {
  for (let [key,attr] of Object.entries(this.data)) {
    const { buffer, size, needUpdate, array } = attr
    const location=attrs.get(key)
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer)
    if (needUpdate) {
      attr.needUpdate = false
      gl.bufferData(gl.ARRAY_BUFFER,array,gl.STATIC_DRAW)
    }
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(location)
  }
}
updateIndex(gl) {
  const { index } = this
  if (index) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,index.buffer)
    if (index.needUpdate) {
      index.needUpdate = false
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,index.array,gl.STATIC_DRAW)
    }
  }
}
```
3. 设置attribute 数据和索引集合的方法和之前一样。

#### 1.3 Mat 材质对象

整体代码。

```js
const defAttr = () => ({
  program:'', 
  data: {},
  mode: 'TRIANGLES',
  maps: {},
})
export default class Mat{
  constructor(attr){
    Object.assign(this,defAttr(),attr)
  }
  init(gl) {
    Object.values(this.maps).forEach((map, ind) => {
      map.texture = gl.createTexture()
      this.updateMap(gl, map, ind)
    })
  }
  updateMap(gl,map, ind) {
    const {
      format = gl.RGB,
      image,
      wrapS,
      wrapT,
      magFilter,
      minFilter,
    } = map
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    gl.activeTexture(gl[`TEXTURE${ind}`])
    gl.bindTexture(gl.TEXTURE_2D, map.texture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      format,
      format,
      gl.UNSIGNED_BYTE,
      image
    )
    wrapS&&gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_WRAP_S,
      wrapS
    )
    wrapT&&gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_WRAP_T,
      wrapT
    )
    magFilter&&gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MAG_FILTER,
      magFilter
    )
    if (!minFilter || minFilter > 9729) {
      gl.generateMipmap(gl.TEXTURE_2D)
    }
    minFilter&&gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      minFilter
    )
    gl.bindTexture(gl.TEXTURE_2D, null)
  }
  update(gl,uniforms) {
    this.updateData(gl,uniforms)
    this.updateMaps(gl,uniforms)
  }
  updateData(gl,uniforms) {
    for (let [key,obj] of Object.entries(this.data)) {
      const location = uniforms.get(key)
      const { type, value } = obj
      if (type.includes('Matrix')) {
        gl[type](location,false,value)
      } else {
        gl[type](location,value)
      }
    }
  }
  updateMaps(gl,uniforms) {
    Object.entries(this.maps).forEach((arr, ind) => {
      const [key,map]=arr
      if (map.needUpdate) {
        map.needUpdate=false
        this.updateMap(gl,map, ind)
      } else {
        gl.bindTexture(gl.TEXTURE_2D, map.texture)
      }
      gl.uniform1i(uniforms.get(key), ind)
    })
  }
  setData(key,val) {
    const obj = this.data[key]
    if(!obj){return}
    Object.assign(obj,val)
  }
  setMap(key, val) {
    const obj = this.maps[key]
    if (!obj) { return }
    obj.needUpdate=true
    Object.assign(obj,val)
  }
}
```

解释一下上面的代码。

1. 在默认属性中，program属性对应程序对象的注册名，实际的程序对象需要通过注册名从Scene对象的programs 中获取。

```js
const defAttr = () => ({
  program:'', 
  data: {},
  mode: 'TRIANGLES',
  maps: {},
})
```

2. 改变默认属性中data 的数据结构。

之前data 的数据结果如下：

```js
{
  u_Color: {
    value:1,
    type: 'uniform1f',    
    location:null,
    needUpdate:true,
  },
  ……    
}
```
- location 已经放在了Scene 对象的programs中，所以可以删掉。
- needUpdate 只适用于一个程序对象对应一个三维对象的情况。

  在一个程序对象对应多个三维对象的时候，在每个三维对象绘制前，都需要更新uniform数据。

  所以，needUpdate 刻意删掉

3. 在maps 数据结构中，写入texture和needUpdate 属性，让贴图在需要更新的时候再更新。

```js
{
  u_Sampler:{
    image,
    format,
    wrapS,
    wrapT,
    magFilter,
    minFilter,
    texture,  
    needUpdate,
  },
  ……
}
```

4. 在初始化方法中，只对贴图数据做一下缓存。

```js
init(gl) {
  Object.values(this.maps).forEach((map, ind) => {
    map.texture = gl.createTexture()
    this.updateMap(gl, map, ind)
  })
}
```

updateMap()更新贴图的方法会设置WebGLTexture 对象的各种属性。

```js
updateMap(gl,map, ind) {
  const {
    format = gl.RGB,
    image,
    wrapS,
    wrapT,
    magFilter,
    minFilter,
  } = map
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
  gl.activeTexture(gl[`TEXTURE${ind}`])
  gl.bindTexture(gl.TEXTURE_2D, map.texture)
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    format,
    format,
    gl.UNSIGNED_BYTE,
    image
  )
  wrapS&&gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_WRAP_S,
    wrapS
  )
  wrapT&&gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_WRAP_T,
    wrapT
  )
  magFilter&&gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MAG_FILTER,
    magFilter
  )
  if (!minFilter || minFilter > 9729) {
    gl.generateMipmap(gl.TEXTURE_2D)
  }
  minFilter&&gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    minFilter
  )
  gl.bindTexture(gl.TEXTURE_2D, null)
}
```

5. 更新方法

```js
update(gl,uniforms) {
  this.updateData(gl,uniforms)
  this.updateMaps(gl,uniforms)
}
updateData(gl,uniforms) {
  for (let [key,obj] of Object.entries(this.data)) {
    const location = uniforms.get(key)
    const { type, value } = obj
    if (type.includes('Matrix')) {
      gl[type](location,false,value)
    } else {
      gl[type](location,value)
    }
  }
}
updateMaps(gl,uniforms) {
  Object.entries(this.maps).forEach((arr, ind) => {
    const [key,map]=arr
    if (map.needUpdate) {
      map.needUpdate=false
      this.updateMap(gl,map, ind)
    } else {
      gl.bindTexture(gl.TEXTURE_2D, map.texture)
    }
    gl.uniform1i(uniforms.get(key), ind)
  })
}
```

6. 设置uniform数据和贴图数据的方法

```js
setData(key,val) {
  const obj = this.data[key]
  if(!obj){return}
  Object.assign(obj,val)
}
setMap(key, val) {
  const obj = this.maps[key]
  if (!obj) { return }
  obj.needUpdate=true
  Object.assign(obj,val)
}
```

#### 1.4 Obj3D 三维对象

Obj3D 三维对象的整体代码和之前的差异不大。

```js
const defAttr = () => ({
  geo:null,
  mat:null,
})
export default class Obj3D{
  constructor(attr){
    Object.assign(this,defAttr(),attr)
  }
  init(gl){
    this.geo.init(gl)
    this.mat.init(gl)
  }
  update(gl,attributes,uniforms) {
    this.geo.update(gl,attributes)
    this.mat.update(gl,uniforms)
  }
}
```

对于webgl框架的搭建，大家简单理解一下其实现原理和过程就可以了。  
并不建议大家在webgl框架刻意花费太多的时间，原因有两点：
- 与webgl框架相比，图形学才是重点。因为我们若不懂图形学，是无法灵活驾驭three.js 这种现有框架的。
- 未来WebGPU 会替代WebGL。


### 2.绘制别墅的楼层布局图

当前这栋别墅有六层楼，咱们先将这六层楼的布局图画出来。

1. 着色器

```html
<script id="vs" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    attribute vec2 a_Pin;
    uniform mat4 u_PvMatrix;
    uniform mat4 u_ModelMatrix;
    varying vec2 v_Pin;
    void main(){
      gl_Position = u_PvMatrix * u_ModelMatrix * a_Position;
      v_Pin = a_Pin;
    }
</script>
<script id="fs" type="x-shader/x-fragment">
    precision mediump float;
    uniform sampler2D u_Sampler;
    varying vec2 v_Pin;
    void main(){
      gl_FragColor = texture2D(u_Sampler, v_Pin);
    }
</script>
```

2. 引入各种组件

```js
import { createProgram, imgPromise } from '/jsm/Utils.js';
import { 
  Matrix4, 
  PerspectiveCamera, 
  Vector3 
} from 'https://unpkg.com/three/build/three.module.js';
import OrbitControls from './jsm/OrbitControls.js'
import Mat from './jsm/Mat.js'
import Geo from './jsm/Geo.js'
import Obj3D from './jsm/Obj3D.js'
import Scene from './jsm/Scene.js'
```

3. 获取webgl上下文对象，设置其清理画布的颜色，开启深度测试和透明度。

```js
const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let gl = canvas.getContext('webgl');
gl.clearColor(0, 0, 0, 1);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.enable(gl.DEPTH_TEST);
```

4. 建立加载图片的promise集合，等所有图片都加载成功后再渲染。

```js
const promises = [-2, -1, 1, 2, 3, 4].map(ele => {
  const image = new Image()
  image.src = `./images/${ele}.png`
  return imgPromise(image)
})
```

5. 声明每层楼之间的高度

```js
// 层高
const fh = 0.5
```

6. 建立轨道控制器

```js
//视点相对于目标点的位置
const dist = new Vector3(-0.5, 2.8, 1.5)
// 目标点
const target = new Vector3(0, 2, 0.6)
//视点
const eye = target.clone().add(dist)
const [fov, aspect, near, far] = [
  45, canvas.width / canvas.height,
  1, 20
]
// 透视相机
const camera = new PerspectiveCamera(fov, aspect, near, far)
camera.position.copy(eye)
// 轨道控制器
const orbit = new OrbitControls({ camera, target, dom: canvas, })
```

7. 建立场景对象，然后注册程序对象。

```js
// 场景
const scene = new Scene({ gl })
// 注册程序对象
scene.registerProgram(
  'img',
  {
    program: createProgram(
      gl,
      document.getElementById('vs').innerText,
      document.getElementById('fs').innerText
    ),
    attributeNames: ['a_Position', 'a_Pin'],
    uniformNames: ['u_PvMatrix', 'u_ModelMatrix', 'u_Sampler']
  }
)
```

8. 当所有图片都加载成功后再绘图

```js
Promise.all(promises).then(imgs => {
  imgs.forEach((img, ind) => scene.add(crtObj(img, ind)))
  render()
});
```

crtObj(img, ind)  基于图片和图片索引建立三维对象

```js
function crtObj(image, ind) {
  const y = fh * ind
  const modelMatrix = new Matrix4()
  modelMatrix.elements[13] = y
  const mat = new Mat({
    program: 'img',
    data: {
      u_PvMatrix: {
        value: orbit.getPvMatrix().elements,
        type: 'uniformMatrix4fv',
      },
      u_ModelMatrix: {
        value: modelMatrix.elements,
        type: 'uniformMatrix4fv',
      },
    },
    maps: {
      u_Sampler: {
        image,
        format: gl.RGBA
      }
    },
    mode: 'TRIANGLE_STRIP'
  })
  const geo = new Geo({
    data: {
      a_Position: {
        array: new Float32Array([
          -0.5, 0, 0.5,
          -0.5, 0, -0.5,
          0.5, 0, 0.5,
          0.5, 0, -0.5,
        ]),
        size: 3
      },
      a_Pin: {
        array: new Float32Array([
          0, 0,
          0, 1,
          1, 0,
          1, 1,
        ]),
        size: 2
      }
    }
  })
  return new Obj3D({ geo, mat })
}
```

render() 连续渲染方法

```js
function render() {
  scene.setUniform('u_PvMatrix', {
    value: orbit.getPvMatrix().elements
  })
  scene.draw()
  requestAnimationFrame(render)
}
```

9. orbit轨道控制器的交互事件和之前都一样

```js
/* 取消右击菜单的显示 */
canvas.addEventListener('contextmenu', event => {
  event.preventDefault()
})
/* 指针按下时，设置拖拽起始位，获取轨道控制器状态。 */
canvas.addEventListener('pointerdown', event => {
  orbit.pointerdown(event)
})
/* 指针移动时，若控制器处于平移状态，平移相机；若控制器处于旋转状态，旋转相机。 */
canvas.addEventListener('pointermove', event => {
  orbit.pointermove(event)
})
/* 指针抬起 */
canvas.addEventListener('pointerup', event => {
  orbit.pointerup(event)
})
/* 滚轮事件 */
canvas.addEventListener('wheel', event => {
  orbit.wheel(event)
})
```

最终效果如下：  
![](/webgl-practice/29.jpg)


场景已经搭建完成，接下来就要考虑别墅楼层的切换动画了。  
别墅楼层的切换，需要一个通过手动设置视点和目标点更新相机轨道的功能。  
当前写的OrbitControls 还有点瑕疵，无法实现此功能，所以需要完善一下。  


### 3.完善相机轨道控制器

先回顾一下当前相机轨道控制器的更新方法：

```js
update() {
  const {camera,target,spherical,panOffset} = this
  //基于平移量平移相机
  target.add(panOffset)
  camera.position.add(panOffset)

  //基于球坐标缩放相机
  const rotateOffset = new Vector3()
  .setFromSpherical(spherical)
  camera.position.copy(
    target.clone().add(rotateOffset)
  )

  //更新投影视图矩阵
  camera.lookAt(target)
  camera.updateMatrixWorld(true)

  //重置旋转量和平移量
  spherical.setFromVector3(
    camera.position.clone().sub(target)
  )
  panOffset.set(0, 0, 0)
}
```

上面的基于平移量平移相机，实际上是没意义的。因为相机位置会被后面的球坐标重写。

1. 我们若想让相机目标点和视点位置影响轨道控制器，那就得把这个更新方法拆分一下。

```js
//基于平移量更新相机轨道
updatePos() {
  const {camera,target,spherical,panOffset} = this
  target.add(panOffset)
  camera.position.add(panOffset)
  this.updateCamera()
  // 重置偏移量
  this.panOffset.set(0, 0, 0)
}
//基于球坐标更新相机轨道
updateSph() {
  const {camera,target,spherical,panOffset} = this
  const rotateOffset = new Vector3()
  .setFromSpherical(spherical)
  camera.position.copy(
    target.clone().add(rotateOffset)
  )
  this.updateCamera()
  // 重置球坐标
  this.resetSpherical()
}
//更新投影视图矩阵
updateCamera() {
  const {camera,target} = this
  camera.lookAt(target)
  camera.updateMatrixWorld(true)
}
//重置球坐标
resetSpherical() {
  const {spherical,camera,target}=this
  spherical.setFromVector3(
    camera.position.clone().sub(target)
  )
}
```

2. 在相机轨道的平移方法中调用updatePos() 方法

```js
panPerspectiveCamera({ x, y }) {
  ……
  this.updatePos()
}

panOrthographicCamera({ x, y }) {
  ……
  this.updatePos()
}
```

3. 在相机轨道的缩放和旋转方法中调用updateSph() 方法

```js
dollyPerspectiveCamera(dollyScale) {
  ……
  this.updateSph()
}
dollyOrthographicCamera(dollyScale) {
  ……
  this.updateSph()
}
rotate({ x, y }) {
  ……
  this.updateSph()
}
```

4. 构造函数

```js
constructor(attr){
  Object.assign(this, defAttr(), attr)
  this.resetSpherical()
  this.updateCamera()
}
```

关于相机轨道的完善就说到这，自己造轮子的好处就是可以基于自己的功能需求随时调整。

接下来我们去做补间动画。


### 4.相机轨道的补间动画

1. 引入合成对象和轨道对象

```js
import Compose from '/jsm/Compose.js';
import Track from '/jsm/Track.js';
```

2. 声明必备数据

```js
// 当前楼层
let curFloor = 0
//建立合成对象
const compose = new Compose()
// 补间数据
const [z1, z2] = [0, 0.65]
const [s1, s2] = [0.8, 2]
// 所有楼层所对应的补间数据
const floorData = Array.from({ length: promises.length }, () => {
  return { z: z1, s: s1 }
})
// 相机的补间数据
const cameraData = { y: 0 }
// 楼层运动方向
let dir = 1
```

3. 每隔一段时间，切换楼层

```js
function changeFloor() {
  if (curFloor > promises.length - 2) {
    dir = -1
  } else if (curFloor < 1) {
    dir = 1
  }
  setFloor(curFloor + dir)
}
```

4. 对某个楼层进行特写 setFloor(n)

```js
function setFloor(n) {
  updateFloor(curFloor, z1, s1)
  curFloor = n
  updateFloor(curFloor, z2, s2)
}
```

对以前特写的楼层取消特写，然后再对当前楼层进行特写。

5. 更新楼层updateFloor(n, z, s)

- n 层数
- z 楼层z位置
- s 楼层缩放数据

```js
function updateFloor(n, z, s) {
  const floor2 = floorData[n]
  const floor1 = { ...floor2 }
  Object.assign(floor2, { z, s })
  const cameraData1 = { ...cameraData }
  cameraData.y = fh * n
  crtTrack(floor1, floor2)
  crtTrack(cameraData1, cameraData)
}
```

- floor1 楼层补间动画的第1帧
- floor2 楼层补间动画的第2帧
- cameraData1 相机补间动画的第1帧
- cameraData 相机补间动画的第2帧

6. 建立时间轨crtTrack(f1,f2)

- f1 补间动画第1帧的数据
- f2 补间动画第2帧的数据

```js
function crtTrack(obj1, obj2) {
  compose.deleteByTarget(obj2)
  const track = new Track(obj2)
  track.start = new Date()
  track.keyMap = new Map([
    ['y',[[0,   obj1.y],[300, obj2.y]]],
    ['z',[[200, obj1.z],[500, obj2.z]]],
    ['s',[[200, obj1.s],[500, obj2.s]]]
  ]);
  compose.add(track)
}
```

7. 当所有图片都加载成功后，渲染。

```js
Promise.all(promises).then(imgs => {
  imgs.forEach((img, ind) => scene.add(crtObj(img, ind)))
  setFloor(curFloor)
  render()
  setInterval(changeFloor, 2000)
});
```

8. 在渲染方法中，更新合成对象、模型矩阵和相机轨道。

```js
function render() {
  compose.update(new Date())
  updateModelMatrix()
  updateOrbit()
  scene.draw()
  requestAnimationFrame(render)
}
```

updateModelMatrix() 更新模型矩阵

```js
function updateModelMatrix() {
  floorData.forEach(({ z, s }, n) => {
    const { value } = [...scene.children][n].mat.data.u_ModelMatrix
    value[14] = z
    value[0] = s
    value[5] = s
    value[10] = s
  })
}
```

updateOrbit() 更新相机轨道

```js
function updateOrbit() {
  const { y } = cameraData
  target.y = y
  camera.position.y = dist.y + y
  orbit.updatePos()
  scene.setUniform('u_PvMatrix', {
    value: orbit.getPvMatrix().elements
  })
}
```

别墅三维布局图的整体代码就写到这。

之后大家还可以再做进一步完善：

- 将平面图变成3d模型图，这就是一个模型导入的问题，很简单，我们后面会说。
- 通过鼠标事件切换楼层。
  - 点击按钮切换楼层。
  - 点击模型切换楼层。模型的选择方法我们之前已经说过，所以我也就不再对楼层做选择了


![](/webgl-practice/29.png)

希望大家可以照葫芦画瓢，将课程里底层原理融汇贯通，据为己用。  
以后遇到相关需求的项目，都可以快速的抓住本质，有条不紊的开发项目。  
即使现有的框架用着不顺手了，也可以自己去改装。