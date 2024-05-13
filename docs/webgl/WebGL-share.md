# WebGL

## 一、WebGL介绍

> WebGL（Web Graphics Library）是一种 3D 绘图协议，WebGL技术结合了HTML5和JavaScript在网页上绘制和渲染复杂的三维图形，并允许用户与之进行交互的技术。并且WebGL是内嵌在浏览器中的，不必安装插件和库就可以直接使用，因为其基于浏览器的特性，可以在多平台上运行WebGL程序，如计算机、平板和手机。

![](/webgl-share/1.png)

### 1.WebGL的起源

WebGL（使用的语言叫做GLSL ES）是基于另一种三维图形渲染技术OpenGL ES2.0产生的，添加了新特性并且移除了很多陈旧无用的旧特性，更加轻量，保持足够的能力来渲染精美的三维图形。

![](/webgl-share/2.png)

### 2.WebGL程序的结构

传统的动态网页和WebGL网页结构对比如下：

![](/webgl-share/3.png)


## 二、WebGL基础知识

### 1.刷底色

::: details 代码实现
```html{11,14}
<canvas id="webgl" width="100" height="100">
</canvas>
<script>
    // 获取 <canvas> 元素
    const canvas = document.querySelector("#webgl");

    // 获取 WebGL 绘图上下文
    const gl = canvas.getContext("webgl");

    // 设置背景颜色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // 清空颜色缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT);
</script>
```
效果：  
![](/webgl-share/4.png)

注意：  
![](/webgl-share/5.png)
:::


### 2.webgl 坐标系

> canvas 2d 画布的坐标系  
> canvas 2d 坐标系的原点在左上角  
> canvas 2d 坐标系的 y 轴方向是朝下的  
> canvas 2d 坐标系的坐标基底有两个分量，分别是一个像素的宽和一个像素的高，即 1 个单位的宽便是 1 个像素的宽，1 个单位的高便是一个像素的高

![](/webgl-share/6.png)

> webgl 的坐标系  
> webgl 坐标系的坐标原点在画布中心  
> webgl 坐标系的 y 轴方向是朝上的  
> webgl 坐标基底中的两个分量分别是半个 canvas 的宽和 canvas 的高，即 1 个单位的宽便是半个个 canvas 的宽，1 个单位的高便是半个 canvas 的高

![](/webgl-share/7.png)


### 3.webgl 画一个点

#### a. canvas 2d 的绘图基本步骤

1. 找一张画布  
2. 找一支画笔  
3. 开始画画  

::: details 代码实现
```js
//canvas画布
const canvas = document.getElementById("canvas");
//二维画笔
const ctx = canvas.getContext("2d");
//设置画笔的颜色
ctx.fillStyle = "red";
//用画笔画一个矩形
ctx.fillRect(20, 20, 300, 200);
```
:::


#### b. canvas 2d 和 webgl 绘图的差异

> 浏览器有三大线程： js 引擎线程、GUI 渲染线程、浏览器事件触发线程  
> GUI 渲染线程就是用于渲图的，在这个渲染线程里，有负责不同渲染工作的工人。比如有负责渲染 HTML+css 的工人，有负责渲染二维图形的工人，有负责渲染三维图形的工人  
> 渲染二维图形的工人说的是 js 语言  
> 渲染三维图形的工人说的是 GLSL ES 语言  
> GLSL ES <=> 程序对象（翻译官） <=> js

#### c. webgl 的绘图思路步骤

1. 找一台电脑 - 浏览器里内置的 webgl 渲染引擎，负责渲染 webgl 图形，只认 GLSL ES 语言
2. 找一块手绘板 - 程序对象，承载 GLSL ES 语言，翻译 GLSL ES 语言和 js 语言，使两者可以相互通信
3. 找一支触控笔 - 通过 canvas 获取的 webgl 类型的上下文对象，可以向手绘板传递绘图命令，并接收手绘板的状态信息
4. 开始画画 - 通过 webgl 类型的上下文对象，用 js 画画

::: details 代码实现
```html{3-18,24,27,35,37}
<canvas id="webgl" width="400" height="400">
</canvas>
<!-- 顶点着色器 -->
<script id="vertexShader" type="x-shader/x-vertex">
void main(){
    // 点位
    gl_Position = vec4(0.0,0.0,0.0,1.0);
    // 尺寸
    gl_PointSize = 10.0;
}
</script>
<!-- 片元着色器 -->
<script id="fragmentShader" type="x-shader/x-fragment">
void main(){
    // 片元颜色
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
</script>
<script>
    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext("webgl");

    // 顶点字符串
    const VSHADER_SOURCE = document.querySelector("#vertexShader").innerText;

    // 片元字符串
    const FSHADER_SOURCE = document.querySelector("#fragmentShader").innerText;
    
    // 初始化着色器
    initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.POINTS, 0, 1);

    function initShaders(gl, vsSource, fsSource) {
        //创建程序对象
        const program = gl.createProgram();
        //建立顶点着色器和片元着色器对象，二者可以分工合作，
        //js解析为计算机语言(GLSL ES)，再让计算机(浏览器的webgl 渲染引擎)识别显示
        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
        //将顶点着色器对象和片元着色器对象装进程序对象中
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        //连接webgl上下文对象和程序对象
        gl.linkProgram(program);
        //启动程序对象
        gl.useProgram(program);
        //将程序对象挂到上下文对象上
        gl.program = program;
        return true;
    }

    function loadShader(gl, type, source) {
        //根据着色类型，建立着色器对象
        const shader = gl.createShader(type);
        //将着色器源文件传入着色器对象中
        gl.shaderSource(shader, source);
        //编译着色器对象
        gl.compileShader(shader);
        //返回着色器对象
        return shader;
    }
</script>
```

效果：  
![](/webgl-share/8.png)
:::

##### 1） 着色器

要使用WebGL进行绘图就必须使用着色器，代码中着色器是以字符串的形式“嵌入”在JavaScript文件中的，在程序真正开始运行前它就已经设置好了。

- 顶点着色器（Vertex shader）：描述顶点的特征，如位置、颜色等
- 片元着色器（Fragment shader）：进行逐片元处理过程，如光照
> 两点决定一条直线，顶点着色器里的顶点就是决定这一条直线的两个点，片元着色器里的片元就是把直线画到画布上后，这两个点之间构成直线的每个像素

在浏览器上的绘制过程： 
1. 运行JavaScript，调用WebGL相关方法
2. 顶点和片元着色器执行，在颜色缓冲区内进行绘制，清空绘图区
3. 颜色缓冲区的内容自动在浏览器的\<canvas\>上显示出来  
![](/webgl-share/9.png)


##### 2） initShaders()  
![](/webgl-share/11.png)

##### 3） gl.drawArrays(mode,first,count)  
![](/webgl-share/12.png)



## 三、js与着色器间的数据传输

### 1.js控制顶点位置

> attribute 变量是只有顶点着色器才能使用它的  
> js 可以通过 attribute 变量向顶点着色器传递与顶点相关的数据

::: details 使用attribute变量
```html{5,8,34,37}
<canvas id="webgl" width="400" height="400">
</canvas>
<!-- 顶点着色器 -->
<script id="vertexShader" type="x-shader/x-vertex">
attribute vec4 a_Position;
void main(){
    //点位
    gl_Position = a_Position;
    //尺寸
    gl_PointSize = 10.0;
}
</script>
<!-- 片元着色器 -->
<script id="fragmentShader" type="x-shader/x-fragment">
void main(){
    // 片元的颜色
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
</script>
<script>
const canvas = document.getElementById('webgl');
const gl = canvas.getContext("webgl");

// 顶点字符串
const VSHADER_SOURCE = document.querySelector("#vertexShader").innerText;

// 片元字符串
const FSHADER_SOURCE = document.querySelector("#fragmentShader").innerText;

// 初始化着色器
initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)

// 获取 attribute 变量 a_Position 的存储位置
var a_Position = gl.getAttribLocation(gl.program, 'a_Position');

// 将顶点位置传递给 attribute 变量
gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);
// 也可这样写
// const position = new Float32Array([0.0, 0.0, 0.0,1.0]);
// gl.vertexAttrib4fv(a_Position,position)

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.POINTS, 0, 1);

function initShaders(gl, vsSource, fsSource) {
    //创建程序对象
    const program = gl.createProgram();
    //建立顶点着色器对象和片元着色器对象，二者可以分工合作
    //js解析为计算机语言(GLSL ES)，然后让计算机(浏览器的webgl 渲染引擎)识别显示
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    //将顶点着色器对象和片元着色器对象装进程序对象中
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    //连接webgl上下文对象和程序对象
    gl.linkProgram(program);
    //启动程序对象
    gl.useProgram(program);
    //将程序对象挂到上下文对象上
    gl.program = program;
    return true;
}

function loadShader(gl, type, source) {
    //根据着色类型，建立着色器对象
    const shader = gl.createShader(type);
    //将着色器源文件传入着色器对象中
    gl.shaderSource(shader, source);
    //编译着色器对象
    gl.compileShader(shader);
    //返回着色器对象
    return shader;
}
</script>
```

效果：  
![](/webgl-share/8.png)

注意：  
![](/webgl-share/13.png)

![](/webgl-share/14.png)

同族函数：  
![](/webgl-share/15.png)  
函数命名规范：  
![](/webgl-share/16.png)

:::

### 2.webgl同步绘图原理

> gl.drawArrays(gl.POINTS, 0, 1) 方法和 canvas 2d 里的 ctx.draw() 方法是不一样的，ctx.draw() 真的像画画一样，一层一层的覆盖图像  
> gl.drawArrays() 方法只会同步绘图，走完了 js 主线程后，再次绘图时，就会从头再来。也就说，异步执行的 drawArrays() 方法会把画布上的图像都刷掉（ webgl 绘图的时候，是先在颜色缓冲区中画出来，颜色缓冲区中存储的图像，只在当前线程有效。比如我们先在 js 主线程中绘图，主线程结束后，会再去执行信息队列里的异步线程。在执行异步线程时，颜色缓冲区就会被 webgl 系统重置 ）

::: details 代码示例1
```html{45-50}
<canvas id="webgl" width="400" height="400">
</canvas>
<!-- 顶点着色器 -->
<script id="vertexShader" type="x-shader/x-vertex">
attribute vec4 a_Position;
void main(){
    //点位
    gl_Position = a_Position;
    //尺寸
    gl_PointSize = 10.0;
}
</script>
<!-- 片元着色器 -->
<script id="fragmentShader" type="x-shader/x-fragment">
void main(){
    // 片元的颜色
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
</script>
<script type="module">
import { initShaders } from "../jsm/Utils.js";

const canvas = document.getElementById('webgl');
const gl = canvas.getContext("webgl");

// 顶点字符串
const VSHADER_SOURCE = document.querySelector("#vertexShader").innerText;

// 片元字符串
const FSHADER_SOURCE = document.querySelector("#fragmentShader").innerText;

// 初始化着色器
initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)

// 获取 attribute 变量 a_Position 的存储位置
var a_Position = gl.getAttribLocation(gl.program, 'a_Position');

// 将顶点位置传递给 attribute 变量
gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.POINTS, 0, 1);

setTimeout(() => {
    //修改attribute 变量
    gl.vertexAttrib2f(a_Position, 0.1, 0.0);
    //绘制顶点
    gl.drawArrays(gl.POINTS, 0, 1);
}, 3000);
</script>
```
效果：    
![](/webgl-share/1.gif)  
:::

::: details 代码示例2
```html{46,53}
<canvas id="webgl" width="400" height="400">
</canvas>
<!-- 顶点着色器 -->
<script id="vertexShader" type="x-shader/x-vertex">
attribute vec4 a_Position;
void main(){
    //点位
    gl_Position = a_Position;
    //尺寸
    gl_PointSize = 10.0;
}
</script>
<!-- 片元着色器 -->
<script id="fragmentShader" type="x-shader/x-fragment">
void main(){
    // 片元的颜色
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
</script>
<script type="module">
import { initShaders } from "../jsm/Utils.js";

const canvas = document.getElementById('webgl');
const gl = canvas.getContext("webgl");

// 顶点字符串
const VSHADER_SOURCE = document.querySelector("#vertexShader").innerText;

// 片元字符串
const FSHADER_SOURCE = document.querySelector("#fragmentShader").innerText;

// 初始化着色器
initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)

// 获取 attribute 变量 a_Position 的存储位置
var a_Position = gl.getAttribLocation(gl.program, 'a_Position');

// 将顶点位置传递给 attribute 变量
gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.POINTS, 0, 1);

// 存储顶点数据的数组
const a_points = [
    { x: 0.0, y: 0.0 },
];

render();

setTimeout(() => {
    a_points.push({ x: 0.1, y: 0 });
    render();
}, 3000);

// 渲染方法
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    a_points.forEach(({ x, y }) => {
    gl.vertexAttrib2f(a_Position, x, y);
    gl.drawArrays(gl.POINTS, 0, 1);
    });
}
</script>
```
效果：    
![](/webgl-share/2.gif)  
:::

### 3.鼠标控制点位

::: details 代码实现
```html{21,47-57}
<canvas id="webgl" width="400" height="400">
</canvas>
<!-- 顶点着色器 -->
<script id="vertexShader" type="x-shader/x-vertex">
attribute vec4 a_Position;
void main(){
    //点位
    gl_Position = a_Position;
    //尺寸
    gl_PointSize = 10.0;
}
</script>
<!-- 片元着色器 -->
<script id="fragmentShader" type="x-shader/x-fragment">
void main(){
    // 片元的颜色
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
</script>
<script type="module">
import { initShaders } from "../jsm/Utils.js";

const canvas = document.getElementById('webgl');
const gl = canvas.getContext("webgl");

// 顶点字符串
const VSHADER_SOURCE = document.querySelector("#vertexShader").innerText;

// 片元字符串
const FSHADER_SOURCE = document.querySelector("#fragmentShader").innerText;

// 初始化着色器
initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)

// 获取 attribute 变量 a_Position 的存储位置
var a_Position = gl.getAttribLocation(gl.program, 'a_Position');

// 将顶点位置传递给 attribute 变量
gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.POINTS, 0, 1);

// 鼠标点击事件
canvas.addEventListener("click", ({ clientX, clientY }) => {
    const { left, top, width, height } = canvas.getBoundingClientRect();
    // 获得 canvas 下的坐标
    const [cssX, cssY] = [clientX - left, clientY - top];
    // 获取 canvas 的中心点
    const [halfWidth, halfHeight] = [width / 2, height / 2];
    // 将 canvas 原点平移到中心点
    const [xBaseCenter, yBaseCenter] = [cssX - halfWidth, cssY - halfHeight];
    // 解决 y 方向的差异
    const yBaseCenterTop = -yBaseCenter;
    // 解决坐标基底的差异
    const [x, y] = [xBaseCenter / halfWidth, yBaseCenterTop / halfHeight];

    gl.vertexAttrib2f(a_Position, x, y);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, 1);
});
</script>
```
浏览器与canvas坐标：  
![](/webgl-share/17.png)
:::

### 4.js修改顶点颜色

::: details 使用uniform变量
```html{37,43}
<canvas id="webgl" width="400" height="400">
  </canvas>
  <!-- 顶点着色器 -->
  <script id="vertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    void main(){
      gl_Position = a_Position;
      gl_PointSize = 10.0;
    }
  </script>
  <!-- 片元着色器 -->
  <script id="fragmentShader" type="x-shader/x-fragment">
    precision mediump float;
    uniform vec4 u_FragColor;
    void main(){
      gl_FragColor = u_FragColor;
    }
  </script>
  <script type="module">
    import { initShaders } from "../jsm/Utils.js";

    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext("webgl");

    // 顶点字符串
    const VSHADER_SOURCE = document.querySelector("#vertexShader").innerText;

    // 片元字符串
    const FSHADER_SOURCE = document.querySelector("#fragmentShader").innerText;

    // 初始化着色器
    initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)

    // 获取 attribute 变量 a_Position 的存储位置
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    //获取 uniform 变量 u_FragColor 的存储位置
    const u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");

    // 将顶点位置传递给 attribute 变量
    gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);

    // 修改uniform 变量
    gl.uniform4f(u_FragColor, 1, 0, 0, 1);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, 1);
  </script>
```
:::


### 5.鼠标绘制随机颜色的点

::: details 代码实现
```html
<canvas id="webgl" width="400" height="400">
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
      gl_FragColor = u_FragColor;
    }
  </script>
  <script type="module">
    import { initShaders } from "../jsm/Utils.js";

    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext("webgl");

    // 顶点字符串
    const VSHADER_SOURCE = document.querySelector("#vertexShader").innerText;

    // 片元字符串
    const FSHADER_SOURCE = document.querySelector("#fragmentShader").innerText;

    // 初始化着色器
    initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)

    // 获取 attribute 和 uniform 变量存储位置
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    const a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize");
    const u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
    const a_points = [
      { x: 0, y: 0, size: 10, color: { r: 1, g: 0, b: 0, a: 1 } },
    ];

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
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

      const size = Math.random() * 50 + 10;
      const n = Math.random();
      const color = { r: n, g: n, b: 1, a: 1 };
      a_points.push({ x, y, size, color });
      render();
    });

    // 渲染方法
    function render() {
      gl.clear(gl.COLOR_BUFFER_BIT);
      a_points.forEach(({ x, y, size, color: { r, g, b, a } }) => {
        gl.vertexAttrib2f(a_Position, x, y);
        gl.vertexAttrib1f(a_PointSize, size);
        const arr = new Float32Array([r, g, b, a]);
        gl.uniform4fv(u_FragColor, arr);
        gl.drawArrays(gl.POINTS, 0, 1);
      });
    }
  </script>
```
:::

### 6.绘制圆点

::: details 代码实现
```html{17-22,29-30}
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

    // 初始化着色器
    initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)

    // 获取 attribute 和 uniform 变量存储位置
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    const a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize");
    const u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
    const a_points = [
      { x: 0, y: 0, size: 10, color: { r: 1, g: 0, b: 0, a: 1 } },
    ];

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
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

      const size = Math.random() * 50 + 10;
      const n = Math.random();
      const color = { r: n, g: n, b: 1, a: 1 };
      a_points.push({ x, y, size, color });
      render();
    });

    // 渲染方法
    function render() {
      gl.clear(gl.COLOR_BUFFER_BIT);
      a_points.forEach(({ x, y, size, color: { r, g, b, a } }) => {
        gl.vertexAttrib2f(a_Position, x, y);
        gl.vertexAttrib1f(a_PointSize, size);
        const arr = new Float32Array([r, g, b, a]);
        gl.uniform4fv(u_FragColor, arr);
        gl.drawArrays(gl.POINTS, 0, 1);
      });
    }
  </script>
```
:::


## 四、绘制图形

### 1.三维模型绘图

构成三维模型的基本单位是三角形，如下图的青蛙，就是由右图所示的许多个三角形以及这些三角形的顶点构成的。不管三维模型的形状多么复杂，其基本组成部分都是三角形，只不过复杂的模型由更多的三角形构成而已。

![](/webgl-share/18.png)

### 2.绘制多个点

WebGL提供了一种很方便的机制，即`缓冲区对象`，她可以一次性地向着色器传入多个顶点的数据。缓冲区对象是WebGL系统中的一块内存区域，我们可以一次性地向缓冲区对象中填充大量的顶点数据，然后将这些数据保存其中，供顶点着色器使用。

::: details 代码实现
```html{32,43-66}
<canvas id="canvas"></canvas>
<script id="vertexShader" type="x-shader/x-vertex">
attribute vec4 a_Position;
void main(){
    gl_Position = a_Position;
    gl_PointSize = 10.0;
}
</script>
<script id="fragmentShader" type="x-shader/x-fragment">
void main(){
    gl_FragColor = vec4(1.0,0.0,0.0,1.0);
}
</script>
<script type="module">
    import { initShaders } from "../jsm/Utils.js";

    const canvas = document.querySelector("#canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 获取着色器文本
    const vsSource = document.querySelector("#vertexShader").innerText;
    const fsSource = document.querySelector("#fragmentShader").innerText;

    // 获取WebGL上下文
    const gl = canvas.getContext("webgl");

    // 初始化着色器
    initShaders(gl, vsSource, fsSource);

    // 设置顶点位置
    const n = initVertexBuffers(gl);

    // 设置背景色
    gl.clearColor(0, 0, 0, 1);

    // 刷底色
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 绘制 n 个点
    gl.drawArrays(gl.POINTS, 0, n);

    function initVertexBuffers(gl) {
        // 顶点数据
        const vertices = new Float32Array([
            0.0, 0.5,
            -0.5, -0.5,
            0.5, -0.5
        ]);
        // 顶点数量
        const n = 3;
        // 1.创建缓冲区对象
        const vertexBuffer = gl.createBuffer();
        // 2.将缓冲区对象绑定到目标
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        // 3.向缓冲区对象中写入数据
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
        // 获取 attribute 变量
        const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
        // 4.将缓冲区对象分配给 a_Position 变量
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
        // 5.连接 a_Position 变量与缓冲区对象
        gl.enableVertexAttribArray(a_Position)
        
        return n;
    }
</script>
```
效果：  
![](/webgl-share/19.png)

五个步骤：  
![](/webgl-share/20.png)

创建缓冲区：  
![](/webgl-share/21.png)

删除缓冲区：  
![](/webgl-share/22.png)

绑定缓冲区：  
![](/webgl-share/23.png)

写入数据到缓冲区：  
![](/webgl-share/24.png)

类型化数组：  
不支持push()和pop()方法，性能更好。  
![](/webgl-share/25.png)
![](/webgl-share/26.png)

将缓冲区对象分配给attribute变量：  
![](/webgl-share/27.png)

开启attribute变量：  
函数名看是用来处理“顶点数组”的，实际上是处理缓冲区对象，历史原因（OpenGL中继承的）。  
![](/webgl-share/28.png)

关闭分配：  
![](/webgl-share/29.png)

gl.drawArrays()的第2个参数和第3个参数：  
![](/webgl-share/12.png)

绘制过程：  
![](/webgl-share/30.png)
:::

### 3.绘制图形
gl.drawArrays(mode,first,count) 方法可以绘制以下图形（）：  
1. POINTS 可视的点
2. LINES 单独线段
3. LINE_STRIP 线条
4. LINE_LOOP 闭合线条
5. TRIANGLES 单独三角形
6. TRIANGLE_STRIP 三角带
7. TRIANGLE_FAN 三角扇

![](/webgl-share/31.png)

![](/webgl-share/32.png)

注意：  
`TRIANGLE_STRIP 三角带的绘制顺序是：`    
v0>v1>v2  
以上一个三角形的第二条边+下一个点为基础，以和第二条边相反的方向绘制三角形  
v2>v1>v3  
以上一个三角形的第三条边+下一个点为基础，以和第三条边相反的方向绘制三角形  
v2>v3>v4  
以上一个三角形的第二条边+下一个点为基础，以和第二条边相反的方向绘制三角形  
v4>v3>v5  
`规律：`  
第偶数个三角形：以上一个三角形的第二条边+下一个点为基础，以和第二条边相反的方向绘制三角形  
第奇数个三角形：以上一个三角形的第三条边+下一个点为基础，以和第三条边相反的方向绘制三角形

`TRIANGLE_FAN 三角扇的绘制顺序是：`  
​ v0>v1>v2  
以上一个三角形的第三条边+下一个点为基础，按照和第三条边相反的顺序，绘制三角形  
​ v0>v2>v3  
以上一个三角形的第三条边+下一个点为基础，按照和第三条边相反的顺序，绘制三角形  
​ v0>v3>v4  
以上一个三角形的第三条边+下一个点为基础，按照和第三条边相反的顺序，绘制三角形  
​ v0>v4>v5

::: details 代码实现
```js
gl.drawArrays(gl.POINTS, 0, n);
gl.drawArrays(gl.LINES, 0, n);
gl.drawArrays(gl.LINE_LOOP, 0, n);
gl.drawArrays(gl.TRIANGLES, 0, n);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
```
:::

### 4.绘制矩形

首先，webgl 可以绘制的面只有三角面，所以要绘制矩形面的话，只能用两个三角形去拼。

方法1： TRIANGLE_STRIP 三角带拼矩形

::: details 代码实现
```html{41,46-49}
<canvas id="canvas"></canvas>
<script id="vertexShader" type="x-shader/x-vertex">
attribute vec4 a_Position;
void main(){
    gl_Position = a_Position;
    gl_PointSize = 10.0;
}
</script>
<script id="fragmentShader" type="x-shader/x-fragment">
void main(){
    gl_FragColor = vec4(1.0,0.0,0.0,1.0);
}
</script>
<script type="module">
    import { initShaders } from "../jsm/Utils.js";

    const canvas = document.querySelector("#canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 获取着色器文本
    const vsSource = document.querySelector("#vertexShader").innerText;
    const fsSource = document.querySelector("#fragmentShader").innerText;

    // 获取WebGL上下文
    const gl = canvas.getContext("webgl");

    // 初始化着色器
    initShaders(gl, vsSource, fsSource);

    // 设置顶点位置
    const n = initVertexBuffers(gl);

    // 设置背景色
    gl.clearColor(0, 0, 0, 1);

    // 刷底色
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 绘制 n 个点
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);

    function initVertexBuffers(gl) {
        // 顶点数据
        const vertices = new Float32Array([
            -0.5, 0.5,
            -0.5, -0.5,
            0.5, 0.5,
            0.5, -0.5
        ]);
        // 顶点数量
        const n = 4;
        // 创建缓冲区对象
        const vertexBuffer = gl.createBuffer();
        // 将缓冲区对象绑定到目标
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        // 向缓冲区对象中写入数据
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
        // 获取 attribute 变量
        const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
        // 将缓冲区对象分配给 a_Position 变量
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
        // 连接 a_Position 变量与缓冲区对象
        gl.enableVertexAttribArray(a_Position)

        return n;
    }
</script>
```
效果如下：  
![](/webgl-share/34.png)
![](/webgl-share/33.png)

若 gl.drawArrays(gl.TRIANGLE_STRIP, 0, n) => gl.drawArrays(gl.TRIANGLE_FAN, 0, n)
![](/webgl-share/35.png)
:::


### 5.Buffer缓冲区异步绘制

> 当缓冲区被绑定在了 webgl 上下文对象上后，在异步方法里直接对其进行修改即可，顶点着色器在绘图的时候会自动从其中调用数据。  
> WebGL Buffer缓冲区中的数据在异步方法里不会被重新置空。

::: details 代码实现
```html{32,45-50,53-57}
<canvas id="canvas"></canvas>
<script id="vertexShader" type="x-shader/x-vertex">
attribute vec4 a_Position;
void main(){
    gl_Position = a_Position;
    gl_PointSize = 10.0;
}
</script>
<script id="fragmentShader" type="x-shader/x-fragment">
void main(){
    gl_FragColor = vec4(1.0,0.0,0.0,1.0);
}
</script>
<script type="module">
    import { initShaders } from "../jsm/Utils.js";

    const canvas = document.querySelector("#canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 获取着色器文本
    const vsSource = document.querySelector("#vertexShader").innerText;
    const fsSource = document.querySelector("#fragmentShader").innerText;

    // 获取WebGL上下文
    const gl = canvas.getContext("webgl");

    // 初始化着色器
    initShaders(gl, vsSource, fsSource);

    // 设置顶点位置
    let vertices = [];
    const n = initVertexBuffers(gl);

    // 设置背景色
    gl.clearColor(0, 0, 0, 1);

    // 刷底色
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 绘制 n 个点
    gl.drawArrays(gl.POINTS, 0, n);

    // 1s后，顶点中再添加的一个顶点，修改缓冲区数据，清理画布，绘制顶点
    setTimeout(() => {
        vertices.push(-0.2, -0.1)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, 2);
    }, 1000);

    // 2s后，清理画布，绘制顶点，绘制线条
    setTimeout(() => {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, 2);
        gl.drawArrays(gl.LINES, 0, 2);
    }, 2000);

    function initVertexBuffers(gl) {
        // 顶点数据
        vertices = [0.0, 0.2];
        // 顶点数量
        const n = 1;
        // 创建缓冲区对象
        const vertexBuffer = gl.createBuffer();
        // 将缓冲区对象绑定到目标
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        // 向缓冲区对象中写入数据
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
        // 获取 attribute 变量
        const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
        // 将缓冲区对象分配给 a_Position 变量
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
        // 连接 a_Position 变量与缓冲区对象
        gl.enableVertexAttribArray(a_Position)

        return n;
    }
</script>
```

效果：  
![](/webgl-share/3.gif)
:::

### 6.封装多边形对象
Poly.js

::: details 代码实现
```js
const defAttr = () => ({
  gl: null,
  vertices: [],
  geoData: [],
  size: 2,
  attrName: 'a_Position',
  uniName: 'u_IsPOINTS',
  count: 0,
  types: ['POINTS'],
  circleDot: false,
  u_IsPOINTS: null
})
export default class Poly {
  constructor(attr) {
    Object.assign(this, defAttr(), attr)
    this.init()
  }
  init() {
    const { attrName, size, gl, circleDot } = this
    if (!gl) { return }
    // 创建缓冲区对象
    const vertexBuffer = gl.createBuffer();
    // 绑定缓冲区对象
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // 写入数据
    this.updateBuffer()
    // 获取attribute 变量
    const a_Position = gl.getAttribLocation(gl.program, attrName)
    // 修改attribute 变量
    gl.vertexAttribPointer(a_Position, size, gl.FLOAT, false, 0, 0)
    // 赋能，批处理
    gl.enableVertexAttribArray(a_Position)
    // 如果是圆点，就获取一下uniform 变量
    if (circleDot) {
      this.u_IsPOINTS = gl.getUniformLocation(gl.program, 'u_IsPOINTS')
    }
  }

  updateBuffer() {
    const { gl, vertices } = this
    this.updateCount()
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
  }
  updateCount() {
    this.count = this.vertices.length / this.size
  }
  addVertice(...params) {
    this.vertices.push(...params)
    this.updateBuffer()
  }
  popVertice() {
    const { vertices, size } = this
    const len = vertices.length
    vertices.splice(len - size, len)
    this.updateCount()
  }
  setVertice(ind, ...params) {
    const { vertices, size } = this
    const i = ind * size
    params.forEach((param, paramInd) => {
      vertices[i + paramInd] = param
    })
  }
  updateVertices(params) {
    const { geoData } = this
    const vertices = []
    geoData.forEach(data => {
      params.forEach(key => {
        vertices.push(data[key])
      })
    })
    this.vertices = vertices
  }
  draw(types = this.types) {
    const { gl, count, circleDot, u_IsPOINTS } = this
    for (let type of types) {
      circleDot && gl.uniform1f(u_IsPOINTS, type === 'POINTS')
      gl.drawArrays(gl[type], 0, count);
    }
  }
}
```
属性：  
- gl webgl上下文对象
- vertices 顶点数据集合，在被赋值的时候会做两件事
  - 更新count 顶点数量，数据运算尽量不放渲染方法里
  - 向缓冲区内写入顶点数据
- geoData 模型数据，对象数组，可解析出vertices 顶点数据
- size 顶点分量的数目
- positionName 代表顶点位置的attribute 变量名
- count 顶点数量
- types 绘图方式，可以用多种方式绘图

方法：  
- init() 初始化方法，建立缓冲对象，并将其绑定到webgl 上下文对象上，然后向其中写入顶点数据。将缓冲对象交给attribute变量，并开启attribute 变量的批处理功能。
- addVertice() 添加顶点
- popVertice() 删除最后一个顶点
- setVertice() 根据索引位置设置顶点
- updateBuffer() 更新缓冲区数据，同时更新顶点数量
- updateCount() 更新顶点数量
- updateVertices() 基于geoData 解析出vetices 数据
- draw() 绘图方法
:::

### 7.鼠标画线

场景：鼠标左击绘制线条

::: details 代码实现
```html
<canvas id="canvas"></canvas>
  <script id="vertexShader" type="x-shader/x-vertex">
      attribute vec4 a_Position;
      void main(){
          gl_Position = a_Position;
          gl_PointSize = 10.0;
      }
</script>
  <script id="fragmentShader" type="x-shader/x-fragment">
      precision mediump float;
      void main(){
          float dist=distance(gl_PointCoord,vec2(0.5,0.5));
          if(dist<0.5) {
              gl_FragColor = vec4(1.0,0.0,0.0,1.0);
          } else {
              discard;
          }
      }
</script>
  <script type="module">
      import { initShaders, getMousePosInWebgl } from "../jsm/Utils.js";
      import Poly from "../jsm/Poly.js";

      const canvas = document.querySelector("#canvas");
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // 获取着色器文本
      const vsSource = document.querySelector("#vertexShader").innerText;
      const fsSource = document.querySelector("#fragmentShader").innerText;

      // 获取WebGL上下文
      const gl = canvas.getContext("webgl");

      // 初始化着色器
      initShaders(gl, vsSource, fsSource);

      // 设置背景色
      gl.clearColor(0, 0, 0, 1);

      // 刷底色
      gl.clear(gl.COLOR_BUFFER_BIT);

      // 实例化多边形
      const poly = new Poly({
          gl,
          types: ['POINTS', 'LINE_STRIP']
      })

      // 鼠标点击事件
      canvas.addEventListener("click", (event) => {
          const { x, y } = getMousePosInWebgl(event, canvas)
          poly.addVertice(x, y)
          gl.clear(gl.COLOR_BUFFER_BIT);
          poly.draw()
      });
  </script>
```
效果：  
![](/webgl-share/4.gif)
:::

### 8.鼠标画多线

场景：鼠标点击画布，绘制多边形路径。鼠标右击，取消绘制。鼠标再次点击，绘制新的多边形。

::: details 代码实现
Sky.js
```js
export default class Sky{
  constructor(gl){
    this.gl=gl
    this.children=[]
  }
  add(obj){
    obj.gl=this.gl
    this.children.push(obj)
  }
  updateVertices(params){
    this.children.forEach(ele=>{
      ele.updateVertices(params)
    })
  }
  draw(){
    this.children.forEach(ele=>{
      ele.init()
      ele.draw()
    })
  }
}
属性：
- gl webgl上下文对象
- children 子级

方法：
- add() 添加子对象
- updateVertices() 更新子对象的顶点数据
- draw() 遍历子对象绘图，每个子对象对应一个buffer 对象，
所以在子对象绘图之前要先初始化。
```

```html{14,51-106}
<canvas id="canvas"></canvas>
  <script id="vertexShader" type="x-shader/x-vertex">
      attribute vec4 a_Position;
      void main(){
          gl_Position = a_Position;
          gl_PointSize = 10.0;
      }
</script>
  <script id="fragmentShader" type="x-shader/x-fragment">
      precision mediump float;
      uniform bool u_IsPOINTS;
      void main(){
          // 修复bug：线条在mac电脑中是断的：
          if(u_IsPOINTS){
              float dist=distance(gl_PointCoord,vec2(0.5,0.5));
              if(dist<0.5) {
                  gl_FragColor = vec4(1.0,0.0,0.0,1.0);
              } else {
                  discard;
              }
          } else {
              gl_FragColor = vec4(1.0,0.0,0.0,1.0);
          }
      }
</script>
  <script type="module">
      import { initShaders, getMousePosInWebgl } from "../jsm/Utils.js";
      import Poly from "../jsm/Poly.js";
      import Sky from "../jsm/Sky.js";

      const canvas = document.querySelector("#canvas");
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // 获取着色器文本
      const vsSource = document.querySelector("#vertexShader").innerText;
      const fsSource = document.querySelector("#fragmentShader").innerText;

      // 获取WebGL上下文
      const gl = canvas.getContext("webgl");

      // 初始化着色器
      initShaders(gl, vsSource, fsSource);

      // 设置背景色
      gl.clearColor(0, 0, 0, 1);

      // 刷底色
      gl.clear(gl.COLOR_BUFFER_BIT);

      // 夜空
      const sky = new Sky(gl);

      // 当前正在绘制的多边形
      let poly = null;

      // 取消右击提示
      canvas.oncontextmenu = function () {
          return false;
      }

      // 鼠标点击事件
      canvas.addEventListener("mousedown", (event) => {
          if (event.button === 2) {
              popVertice()
          } else {
              const { x, y } = getMousePosInWebgl(event, canvas)
              if (poly) {
                  poly.addVertice(x, y)
              } else {
                  crtPoly(x, y)
              }
          }
          render()
      });

      // 最后一个点跟随鼠标移动
      canvas.addEventListener("mousemove", (event) => {
          if (poly) {
              const { x, y } = getMousePosInWebgl(event, canvas)
              poly.setVertice(poly.count - 1, x, y)
              render()
          }
      });

      // 删除最后一个顶点
      function popVertice() {
          poly.popVertice()
          poly = null
      }

      // 创建多边形
      function crtPoly(x, y) {
          poly = new Poly({
              vertices: [x, y, x, y],
              types: ['POINTS', 'LINE_STRIP'],
              circleDot: true
          })
          sky.add(poly)
      }

      // 渲染方法
      function render() {
          gl.clear(gl.COLOR_BUFFER_BIT)
          sky.draw()
      }
  </script>
```
效果：  
![](/webgl-share/5.gif)
:::


### 9.图形转面

#### 1-webgl三种面的适应场景

之前说过，webgl 可以绘制三种面：

- TRIANGLES 单独三角形
- TRIANGLE_STRIP 三角带
- TRIANGLE_FAN 三角扇

在实际的引擎开发中，TRIANGLES 用得最多的。它的优势是可以绘制任意模型，缺点是比较费点。

适合 TRIANGLES 单独三角形的的模型：  
![](/webgl-share/36.png)

TRIANGLE_STRIP 和 TRIANGLE_FAN 优点是相邻的三角形可以共用一条边，省点，其缺点也太明显，因为它们只适合绘制具备相应特点的模型。

适合 TRIANGLE_STRIP 三角带的模型：  
![](/webgl-share/37.png)

适合 TRIANGLE_FAN 三角扇的模型：  
![](/webgl-share/38.png)

three.js 使用的绘制面的方式就是TRIANGLES，可以在其WebGLRenderer 对象的源码的renderBufferImmediate 方法中找到：

```js
_gl.drawArrays( _gl.TRIANGLES, 0, object.count );
```

#### 2-图形转面的基本步骤

在three.js 里有一个图形几何体[ShapeGeometry](https://threejs.org/docs/index.html#api/en/geometries/ShapeGeometry)，可以把图形变成面。  
![](/webgl-share/39.png)

只要有数学支撑，也可以实现这种效果。

接下来就使用TRIANGLES 独立三角形的方式，将图形转成面。

**使用的方法叫做“砍角”（方法不唯一），其原理就是从起点将多边形中符合特定条件的角逐个砍掉，然后保存到一个集合里，直到把多边形砍得只剩下一个三角形为止。这时候集合里的所有三角形就是我们想要的独立三角形。**

举个例子：  
![](/webgl-share/40.png)

已知：逆时针绘图的路径G  
求：将其变成下方网格的方法  
![](/webgl-share/41.png)

解：  
1. 寻找满足以下条件的▲ABC：
  - ▲ABC的顶点索引位置连续，如012,123、234
  - 点C在向量AB的正开半平面里，可以理解为你站在A点，面朝B点，点C要在你的左手边
  - ▲ABC中没有包含路径G 中的其它顶点   
2. 当找到▲ABC 后，就将点B从路径的顶点集合中删掉，然后继续往后找。  
3. 当路径的定点集合只剩下3个点时，就结束。  
4. 由所有满足条件的▲ABC构成的集合就是我们要求的独立三角形集合。  

#### 3-绘制路径G

1. 路径G的顶点数据

```js
const pathData = [0, 0,
      0, 600,
      600, 600,
      600, 200,
      200, 200,
      200, 400,
      300, 400,
      300, 300,
      500, 300,
      500, 500,
      100, 500,
      100, 100,
      600, 100,
      600, 0
 ];
```
在pathData里两个数字为一组，分别代表顶点的ｘ位和ｙ位。  
pathData里的数据是以像素为单位画出来的，在实际项目协作中，UI给我们的svg文件可能也是以像素为单位画出来的。  
因为，webgl画布的宽和高永远都是两个单位。  
所以，要将上面的点画到 webgl 画布中，就需要做一个数据映射。  

2. 在webgl 中绘制正方形。  

从pathData 数据中可以看出，路径G的宽高都是600，是一个正方形。  
所以，可以将路径G映射到 webgl 画布的一个正方形中。  
这个正方形的高度可以暂且定为1，那么其宽度就应该是高度除以canvas画布的宽高比。

```js
// 宽高比
const ratio = canvas.width / canvas.height;
// 正方形高度
const rectH = 1.0;
// 正方形宽度
const rectW = rectH / ratio;
```

3. 正方形的定位，把正方形放在webgl画布的中心。  

获取正方形尺寸的一半，然后求出其x、y方向的两个极值即可。

```js
// 正方形宽高的一半
const [halfRectW, halfRectH] = [rectW / 2, rectH / 2];
// 两个极点
const minX = -halfRectW;
const minY = -halfRectH;
const maxX = halfRectW;
const maxY = halfRectH;
```

4. 利用之前的Poly对象绘制正方形，测试一下效果。

```js
const rect = new Poly({
    gl,
    vertices: [
        minX, maxY,
        minX, minY,
        maxX, minY, 
        maxX, maxY,
    ],
});
rect.draw();
```
先画了4个点，效果没问题。  
![](/webgl-share/42.png)

5. 建立x轴和y轴比例尺。

```js
const scaleX = ScaleLinear(0, minX, 600, maxX);
const scaleY = ScaleLinear(0, minY, 600, maxY);
function ScaleLinear(ax, ay, bx, by) {
  const delta = {
    x: bx - ax,
    y: by - ay,
  };
  const k = delta.y / delta.x;
  const b = ay - ax * k;
  return function (x) {
    return k * x + b;
  };
}
```
ScaleLinear(ax, ay, bx, by) 方法使用的就是点斜式，用于将x轴和y轴上的数据像素数据映射成 webgl数据  
- ax 像素数据的极小值
- ay webgl数据的极小值
- bx 像素数据的极大值
- by webgl数据的极大值

6. 将路径G中的像素数据解析为 webgl 数据

```js
const glData = [];
for (let i = 0; i < pathData.length; i += 2) {
    glData.push(scaleX(pathData[i]), scaleY(pathData[i + 1]));
}
```

画一下看看：
```js
const path = new Poly({
    gl,
    vertices: glData,
    types: ["POINTS", "LINE_LOOP"],
});
path.draw();
```
![](/webgl-share/43.png)


#### 4.将图形网格化

1. 建立了一个ShapeGeo 对象，用于将图形网格化。

```js
const shapeGeo = new ShapeGeo(glData)
```
::: details ShapeGeo
```js
export default class ShapeGeo {
  constructor(pathData=[]) {
    this.pathData = pathData;
    this.geoData = [];
    this.triangles = [];
    this.vertices = [];
    this.parsePath();
    this.update();
  }
  update() {
    this.vertices = [];
    this.triangles = [];
    this.findTriangle(0);
    this.upadateVertices()
  }
  parsePath() {
    this.geoData = [];
    const { pathData, geoData } = this
    for (let i = 0; i < pathData.length; i += 2) {
      geoData.push({ x: pathData[i], y: pathData[i + 1] })
    }
  }
  findTriangle(i) {
    const { geoData, triangles } = this;
    const len = geoData.length;
    if (geoData.length <= 3) {
      triangles.push([...geoData]);
    } else {
      const [i0, i1, i2] = [
        i % len,
        (i + 1) % len,
        (i + 2) % len
      ];
      const triangle = [
        geoData[i0],
        geoData[i1],
        geoData[i2],
      ];
      if (this.cross(triangle) > 0 && !this.includePoint(triangle)) {
        triangles.push(triangle);
        geoData.splice(i1, 1);
      }
      this.findTriangle(i1);
    }
  }
  includePoint(triangle) {
    for (let ele of this.geoData) {
      if (!triangle.includes(ele)) {
        if (this.inTriangle(ele, triangle)) {
          return true;
        }
      }
    }
    return false;
  }
  inTriangle(p0, triangle) {
    let inPoly = true;
    for (let i = 0; i < 3; i++) {
      const j = (i + 1) % 3;
      const [p1, p2] = [triangle[i], triangle[j]];
      if (this.cross([p0, p1, p2]) < 0) {
        inPoly = false;
        break
      }
    }
    return inPoly;
  }
  cross([p0, p1, p2]) {
    const [ax, ay, bx, by] = [
      p1.x - p0.x,
      p1.y - p0.y,
      p2.x - p0.x,
      p2.y - p0.y,
    ];
    return ax * by - bx * ay;
  }
  upadateVertices() {
    const arr = []
    this.triangles.forEach(triangle => {
      for (let { x, y } of triangle) {
        arr.push(x, y)
      }
    })
    this.vertices = arr
  }
}
```
:::

属性：
- pathData 平展开的路径数据
- geoData 由路径数据pathData 转成的对象型数组
- triangles 三角形集合，对象型数组
- vertices 平展开的对立三角形顶点集合

方法：
- update() 更新方法，基于pathData 生成vertices
- parsePath() 基于路径数据pathData 转成对象型数组
- findTriangle(i) 寻找符合条件的三角形
  - i 顶点在geoData 中的索引位置，表示从哪里开始寻找三角形
- includePoint(triangle) 判断三角形中是否有其它顶点
- inTriangle(p0, triangle) 判断一个顶点是否在三角形中
- cross([p0, p1, p2]) 以p0为基点，对二维向量p0p1、p0p2做叉乘运算
- upadateVertices() 基于对象数组geoData 生成平展开的vertices 数据



2. 绘制G形面

```js
const face = new Poly({
    gl,
    vertices: shapeGeo.vertices,
    types: ["TRIANGLES"],
});
face.draw();
```

效果如下：  
![](/webgl-share/44.png)

::: details 图形转面
```html{15}
<canvas id="canvas"></canvas>
<script id="vertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    void main(){
        gl_Position = a_Position;
        gl_PointSize = 10.0;
    }
</script>
<script id="fragmentShader" type="x-shader/x-fragment">
    void main(){
        gl_FragColor=vec4(1.0, 1.0, 0.0, 1.0);
    }
</script>
<script type="module">
    import { initShaders, ScaleLinear } from "../jsm/Utils.js";
    import Poly from "../jsm/Poly.js";
    import ShapeGeo from "../jsm/ShapeGeo.js";

    const canvas = document.querySelector("#canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 获取着色器文本
    const vsSource = document.querySelector("#vertexShader").innerText;
    const fsSource = document.querySelector("#fragmentShader").innerText;

    // 获取WebGL上下文
    const gl = canvas.getContext("webgl");

    // 初始化着色器
    initShaders(gl, vsSource, fsSource);

    // 设置背景色
    gl.clearColor(0, 0, 0, 1);

    // 刷底色
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 路径G-逆时针
    const pathData = [
        0, 0,
        0, 600,
        600, 600,
        600, 200,
        200, 200,
        200, 400,
        300, 400,
        300, 300,
        500, 300,
        500, 500,
        100, 500,
        100, 100,
        600, 100,
        600, 0,
    ];

    // 宽高比
    const ratio = canvas.width / canvas.height;
    // 正方形高度
    const rectH = 1.0;
    // 正方形宽度
    const rectW = rectH / ratio;
    // 正方形宽高的一半
    const [halfRectW, halfRectH] = [rectW / 2, rectH / 2];
    // 两个极点
    const minX = -halfRectW;
    const minY = -halfRectH;
    const maxX = halfRectW;
    const maxY = halfRectH;
    // 正方形
    const rect = new Poly({
        gl,
        vertices: [
            minX, maxY,
            minX, minY,
            maxX, minY,
            maxX, maxY,
        ],
    });
    rect.draw();

    // 建立比例尺
    const scaleX = ScaleLinear(
        0, minX,
        600, maxX
    );
    const scaleY = ScaleLinear(
        0, maxY,
        600, minY
    );

    // 将路径G中的像素数据解析为webgl数据
    const glData = [];
    for (let i = 0; i < pathData.length; i += 2) {
        glData.push(scaleX(pathData[i]), scaleY(pathData[i + 1]));
    }
    const path = new Poly({
        gl,
        vertices: glData,
        types: ["POINTS", "LINE_LOOP"],
    });
    path.draw();

    const shapeGeo = new ShapeGeo(glData)
    const face = new Poly({
        gl,
        vertices: shapeGeo.vertices,
        types: ["TRIANGLES"],
    });
    face.draw();
</script>
```
:::

::: details 鼠标转面
```html{15}
<canvas id="canvas"></canvas>
<script id="vertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    void main(){
        gl_Position = a_Position;
        gl_PointSize = 10.0;
    }
</script>
<script id="fragmentShader" type="x-shader/x-fragment">
    void main(){
        gl_FragColor=vec4(1.0, 1.0, 0.0, 1.0);
    }
</script>
<script type="module">
    import { initShaders, getMousePosInWebgl } from "../jsm/Utils.js";
    import Poly from "../jsm/Poly.js";
    import ShapeGeo from "../jsm/ShapeGeo.js";

    const canvas = document.querySelector("#canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 获取着色器文本
    const vsSource = document.querySelector("#vertexShader").innerText;
    const fsSource = document.querySelector("#fragmentShader").innerText;

    // 获取WebGL上下文
    const gl = canvas.getContext("webgl");

    // 初始化着色器
    initShaders(gl, vsSource, fsSource);

    // 设置背景色
    gl.clearColor(0, 0, 0, 1);

    // 刷底色
    gl.clear(gl.COLOR_BUFFER_BIT);

    const poly = new Poly({
        gl,
        types: ['POINTS', 'LINE_STRIP']
    })

    const face = new Poly({
        gl,
        types: ['TRIANGLES', 'POINTS'],
    });

    const arr = []
    canvas.addEventListener('mousedown', (event) => {
        const { x, y } = getMousePosInWebgl(event, canvas)
        arr.push(x, y)

        face.vertices = new ShapeGeo(arr).vertices
        face.updateBuffer()
        gl.clear(gl.COLOR_BUFFER_BIT);
        face.draw()
    })
</script>
```
:::


## 五、矩阵变换

变换有三种状态：平移、旋转、缩放。

当变换一个图形时，实际上就是在移动这个图形的所有顶点。

### 1.平移

对图形的平移就是对图形所有顶点的平移

![](/webgl-share/45.png)

在实际代码中，要有一个向量的概念，比如 (x,y,z) ，我们既可以说它是一个顶点位置，也可以说它是一个向量，顶点的位移其实就是向量的加法。

GLSL ES 语言里的向量运算
```js
attribute vec4 a_Position;
vec4 translation = vec4(0.1, 0.2, 0.3, 0.0);
void main(){
    gl_Position = a_Position + translation;
}
```
- a_Position 是原始点位，属于 attribute 变量
- translation 是顶点着色器里的私有变量，没有向外部暴露，属于 4 维向量
- a_Position+translation 便是着色器内的向量加法，这里是对原始点位进行位移

### 2.旋转

物体的旋转方向是有正负之分的，在 webgl 中，除裁剪空间之外的大部分功能都使用了右手坐标系。

![](/webgl-share/46.png)

- 当物体绕 z 轴，从 x 轴正半轴向 y 轴正半轴逆时针旋转时，是正向旋转，反之为负。
- 当物体绕 x 轴，从 y 轴正半轴向 z 轴正半轴逆时针旋转时，是正向旋转，反之为负。
- 当物体绕 y 轴，从 z 轴正半轴向 x 轴正半轴逆时针旋转时，是正向旋转，反之为负。

旋转公式:

由一个让顶点围绕 z 轴旋转的例子引出

![](/webgl-share/47.png)

已知：

- 点 A 的位置是(ax,ay,az)
- 点 A 要围绕 z 轴旋转 β 度，转到点 B 的位置

求：点 A 旋转后的 bx、by 位置

因为 ∠β 是已知的，∠α 可以通过点 A 得出:

```js
∠xOB=α+β
```

三角函数就可以推出 bx、by

设 ∠xOB=θ，则：

```js
bx=cosθ*|OA|
by=sinθ*|OA|
```

|OA|是点 O 到点 A 的距离，可以直接用点 A 求出:

```js
|OA|=Math.sqrt(ax*ax+ay*ay)
```

只需要知道 cosθ 和 sinθ 的值即可，因为：θ=α+β  
所以可以利用和角公式求 cosθ 和 sinθ 的值：

```js
cosθ = cos(α + β);
cosθ = cosα * cosβ - sinα * sinβ;

sinθ = sin(α + β);
sinθ = cosβ * sinα + sinβ * cosα;
```

所以：

```js
bx=cosθ*|OA|
bx=(cosα*cosβ-sinα*sinβ)*|OA|
bx=cosα*cosβ*|OA|-sinα*sinβ*|OA|

by=sinθ*|OA|
by=(cosβ*sinα+sinβ*cosα)*|OA|
by=cosβ*sinα*|OA|+sinβ*cosα*|OA|
```

因为：

```js
cosα*|OA|=ax
sinα*|OA|=ay
```

简化得到 bx、by 的公式：

```js
bx = ax * cosβ - ay * sinβ;
by = ay * cosβ + ax * sinβ;
```

在着色器中旋转

```js
<script id="vertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    float angle = radians(80.0);
    float sinB = sin(angle);
    float cosB = cos(angle);
    void main(){
        gl_Position.x = a_Position.x*cosB - a_Position.y*sinB;
        gl_Position.y = a_Position.y*cosB + a_Position.x*sinB;
        gl_Position.z = a_Position.z;
        gl_Position.w = 1.0;
    }
</script>
```
- radians(float degree) 将角度转弧度
- sin(float angle) 正弦
- cos(float angle) 余弦

### 3.缩放

缩放可以理解为对向量长度的改变，或者对向量坐标分量的同步缩放

![](/webgl-share/48.png)

已知：

- 点 A 的位置是(ax,ay,az)
- 点 A 基于原点內缩了一半

求：点 A 內缩了一半后的 bx、by、bz 位置

解：

```js
bx = ax * 0.5;
by = ay * 0.5;
bz = az * 0.5;
```

在着色器中缩放

对 gl_Position 的 x、y、z 依次缩放：

```js
<script id="vertexShader" type="x-shader/x-vertex">
attribute vec4 a_Position;
float scale = 1.2;
void main(){
	gl_Position.x = a_Position.x*scale;
	gl_Position.y = a_Position.y*scale;
	gl_Position.z = a_Position.z*scale;
	gl_Position.w = 1.0;
}
</script>
```

a_Position 中抽离出由 x、y、z 组成的三维向量，对其进行一次性缩放：

```js
<script id="vertexShader" type="x-shader/x-vertex">
attribute vec4 a_Position;
float scale=1.2;
void main(){
	gl_Position=vec4(vec3(a_Position)*scale, 1.0);
}
</script>
```

### 4.矩阵

矩阵（Matrix）是一个按照矩形纵横排列的复数集合  
在矩阵中的每一行，或者每一列数字构成的集合，可以视之为向量

1. 向量   

向量，又叫矢量，指具有大小（magnitude）和方向的量  
webgl 里的向量有 1 维向量、2 维向量、3 维向量和 4 维向量：  
- 维向量中有 1 个数字，对应的是单轴坐标系里的点位。
- 2 维向量中有 2 个数字，对应的是 2 维坐标系里的点位。
- 3 维向量中有 3 个数字，对应的是 3 维坐标系里的点位。
- 4 维向量中有 4 个数字，对应的是 3 维坐标系里的点位，外加一个附加数据，至于这个数据是什么，要看项目需求。

2. 矩阵和向量的乘法  

![](/webgl-share/49.png)

用专业术语来说：  
- 横着的两组遵循的规则是行主序，即将矩阵中的一行数据视之为一个向量。
- 竖着的两组遵循的规则是列主序，即将矩阵中的一列数据视之为一个向量。

至于是使用行主序，还是列主序，这就得看规则的定制者了。  
在 webgl 里，矩阵元素的排列规则是列主序。  
数学中常用的写法是行主序  

可以用矩阵乘以向量的方式让点 p 旋转 β 度：

![](/webgl-share/50.png)

3. 在着色器中写矩阵

```js
<script id="vertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    float angle = radians(40.0);
    float sinB = sin(angle);
    float cosB = cos(angle);
    mat2 m2 = mat2(
      cosB, sinB,
      -sinB,cosB
    );
    void main(){
      gl_Position = vec4(m2*vec2(a_Position), a_Position.z, a_Position.w);
    }
</script>
```

4. 四维矩阵

```js
<script id="vertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    float angle=radians(10.0);
    float cosB=cos(angle);
    float sinB=sin(angle);
    //列主序
    mat4 m4=mat4(
      cosB, sinB,0.0,0.0,
      -sinB,cosB,0.0,0.0,
      0.0,  0.0, 1.0,0.0,
      0.0,  0.0, 0.0,1.0
    );
    void main(){
      gl_Position = m4*a_Position;
    }
</script>
```

5. 矩阵平移

让顶点的 x 移动 0.1，y 移动 0.2，z 移动 0.3：

```js
<script id="vertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    //列主序
    mat4 m4=mat4(
      1.0, 0.0, 0.0,0.0,
      0.0, 1.0, 0.0,0.0,
      0.0, 0.0, 1.0,0.0,
      0.1, 0.2, 0.3,1.0
    );
    void main(){
      gl_Position = m4*a_Position;
    }
</script>
```

6. 矩阵缩放

顶点在 x 轴向缩放 2，y 轴向缩放 3，轴向缩放 4：

```js
<script id="vertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    //列主序
    mat4 m4=mat4(
      2.0, 0.0, 0.0,0.0,
      0.0, 3.0, 0.0,0.0,
      0.0, 0.0, 4.0,0.0,
      0.0, 0.0, 0.0,1.0
    );
    void main(){
      gl_Position = m4*a_Position;
    }
</script>
```

7. 矩阵库

three.js 的 Matrix3 和 Matrix4 对象：

```js
// 1.引入Matrix4对象
import { Matrix4 } from "https://unpkg.com/three/build/three.module.js";

// 2.实例化矩阵对象，在其中写入旋转信息
const matrix = new Matrix4();
matrix.makeRotationZ(Math.PI / 6);

// 3.基于matrix 对象的elements 属性，修改uniform 变量
const u_Matrix = gl.getUniformLocation(gl.program, "u_Matrix");
gl.uniformMatrix4fv(u_Matrix, false, matrix.elements);
```

## 六、 矩阵复合变换

### 1.矩阵相乘

矩阵相乘可以实现复合变换，就比如先位移再旋转、先旋转在位移，或着连续位移。

![](/webgl-share/60.png)
![](/webgl-share/61.png)

### 2.变换规律

1. 使用 three.js 的 Matrix4 对象建立矩阵

```json
const a = new Matrix4().set(
    0, 1, 2, 3,
    4, 5, 6, 7,
    8, 9, 10,11,
    12,13,14,15
)
const b = new Matrix4().set(
    0,  10, 20, 30,
    40, 50, 60, 70,
    80, 90, 100,110,
    120,130,140,150
)
```
注：set()方法里输入的矩阵是行主序的，但 elements 输出的矩阵是列主序的。

2. 位移加位移

例子：让一个物体沿 x 轴位移 ax，沿 y 轴位移 ay 后，再沿 x 轴位移 bx，沿 y 轴位移 by。

已知：

- 初始点位 A(ax,ay,az,1.0)
- 初次位移：沿 x 轴位移 bx，沿 y 轴位移 by
- 第二次位移：沿 x 轴位移 cx，沿 y 轴位移 cy

求：变换后的位置 F(fx,fy,fz,fw)

解：

1.设初次变换矩阵为 bm(行主序)：

```json
bm
[
	1.0,0.0,0.0,bx,
	0.0,1.0,0.0,by,
	0.0,0.0,1.0,0.0,
	0.0,0.0,0.0,1.0,
]
```

则初次变换后的点 F 为：

```js
F = bm * A;
fx = (1.0, 0.0, 0.0, bx) * (ax, ay, az, 1.0) = ax + bx;
fy = (0.0, 1.0, 0.0, by) * (ax, ay, az, 1.0) = ay + by;
fz = (0.0, 0.0, 1.0, 0.0) * (ax, ay, az, 1.0) = az;
fw = (0.0, 0.0, 0.0, 1.0) * (ax, ay, az, 1.0) = 1.0;
```

2.设第二次变换矩阵为 cm(行主序)：

```json
cm
[
	1.0,0.0,0.0,cx,
	0.0,1.0,0.0,cy,
	0.0,0.0,1.0,0.0,
	0.0,0.0,0.0,1.0,
]
```

则第二次变换后的点 F 为第二次变换矩阵乘以上一次变换后的点 F：

```js
F = cm * F;
fx = (1.0, 0.0, 0.0, cx) * (fx, fy, fz, 1.0) = fx + cx;
fy = (0.0, 1.0, 0.0, cy) * (fx, fy, fz, 1.0) = fy + cy;
fz = (0.0, 0.0, 1.0, 0.0) * (fx, fy, fz, 1.0) = fz;
fw = (0.0, 0.0, 0.0, 1.0) * (fx, fy, fz, 1.0) = 1.0;
```

所以理解最终的点 F：

```js
fx = ax + bx + cx;
fy = ay + by + cy;
fz = az;
fw = 1.0;
```

上面的点 F 还可以这么理解：（矩阵乘以矩阵）

```js
F = cm * bm * A;
```

设 cm\*bm 的结果为矩阵 dm(行主序)，参照 dm 中元素的索引位置：

```json
cm
[
    0, 1, 2, 3,
	4, 5, 6, 7,
	8, 9,10,11,
	12,13,14,15,
]
```

则 dm 中的第一行元素为：

```js
dm[0] = (1.0, 0.0, 0.0, bx) * (1.0, 0.0, 0.0, 0.0) = 1.0;
dm[1] = (1.0, 0.0, 0.0, bx) * (0.0, 1.0, 0.0, 0.0) = 0.0;
dm[2] = (1.0, 0.0, 0.0, bx) * (0.0, 0.0, 1.0, 0.0) = 0.0;
dm[3] = (1.0, 0.0, 0.0, bx) * (cx, cy, 0.0, 1.0) = cx + bx;
```

通过 dm 矩阵的第一行元素我们就可以得到点 F 的 fx 值了，验证一下：

```js
fx = (1.0, 0.0, 0.0, cx + bx) * (ax, ay, az, 1.0) = ax + cx + bx;
```
这和之前两次矩阵乘以向量得到的结果是一样的。

`先位移bm再位移cm：`
```js
const [bx, by] = [0.1, 0.1]
const [cx, cy] = [0.1, 0.1]
const bm = new Matrix4().set(
  1, 0, 0, bx,
  0, 1, 0, by,
  0, 0, 1, 0,
  0, 0, 0, 1
)
const cm = new Matrix4().set(
  1, 0, 0, cx,
  0, 1, 0, cy,
  0, 0, 1, 0,
  0, 0, 0, 1
)
const matrix = cm.multiply(bm);
gl.uniformMatrix4fv(u_Matrix, false, matrix.elements);
```

3. 先移动后旋转

```js
const mr = new Matrix4();
mr.makeRotationZ(Math.PI / 4);

const mt = new Matrix4();
mt.makeTranslation(0.3, 0.0, 0.0);

const matrix = mr.multiply(mt);
const u_Matrix = gl.getUniformLocation(gl.program, "u_Matrix");
gl.uniformMatrix4fv(u_Matrix, false, matrix.elements);
```
mr.multiply(mt) 便是先位移再旋转：  
![](/webgl-share/51.png)

4. 先旋转后移动

```js
const mr = new Matrix4();
mr.makeRotationZ(Math.PI / 4);

const mt = new Matrix4();
mt.makeTranslation(0.3, 0, 0);

const matrix = mt.multiply(mr);
const u_Matrix = gl.getUniformLocation(gl.program, "u_Matrix");
gl.uniformMatrix4fv(u_Matrix, false, matrix.elements);
```
mt.multiply(mr)便是先旋转再位移：  
![](/webgl-share/52.png)

5. 其它变换方式

1)旋转和缩放

- 先旋转后缩放

```js
const mr = new Matrix4();
mr.makeRotationZ(Math.PI / 4);

const ms = new Matrix4();
ms.makeScale(2, 0.5, 1);

const matrix = ms.multiply(mr);
const u_Matrix = gl.getUniformLocation(gl.program, "u_Matrix");
gl.uniformMatrix4fv(u_Matrix, false, matrix.elements);
```

- 先缩放后旋转

```js
const matrix = mr.multiply(ms);
```

在此要注意一个性质：当缩放因子一致时，旋转和缩放没有先后之分。

```js
const ms = new Matrix4();
ms.makeScale(2.0, 2.0, 2.0);
```

此是下面的两种变换结果都是一样的:

```js
const matrix = ms.multiply(mr);
const matrix = mr.multiply(ms);
```

2)综合变换

Matrix4 还有一个 compose 综合变换方法，它可以将所有变换信息都写进去，其变换顺序就是 `先缩放，再旋转，最后位移`。

```js
const matrix = new Matrix4();
//位移
const pos = new Vector3(0.3, 0, 0);
//旋转
const rot = new Quaternion();
rot.setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 4);
//缩放
const scale = new Vector3(2, 0.5, 1);
matrix.compose(pos, rot, scale);
const u_Matrix = gl.getUniformLocation(gl.program, "u_Matrix");
gl.uniformMatrix4fv(u_Matrix, false, matrix.elements);
```

compose ( position : Vector3, quaternion : Quaternion, scale : Vector3 )

- position 位置
- quaternion 用四元数存储的旋转数据
- scale 缩放

compose() 方法分解开来，就是这样的：

```js
const mt = new Matrix4();
mt.makeTranslation(0.3, 0, 0);

const mr = new Matrix4();
mr.makeRotationZ(Math.PI / 4);

const ms = new Matrix4();
ms.makeScale(2, 0.5, 1);

const matrix = mt.multiply(mr).multiply(ms);
const u_Matrix = gl.getUniformLocation(gl.program, "u_Matrix");
gl.uniformMatrix4fv(u_Matrix, false, matrix.elements);
```

### 3.视图矩阵

视图矩阵是用于确定相机角度和位置的矩阵。  
能不能在没有视图矩阵的情况下，看见物体的另一个角度呢？  
答案肯定是可以，我们自己用模型矩阵把物体转一下就可以了。  
因此，视图矩阵的本质是对物体的旋转变换。  
而物体变换的本质则是对物体顶点的位移。  

#### 1.相机的定义

![](/webgl-share/53.png)

- 视点：相机的位置
- 视线方向：相机所看的方向
- 上方向：相机绕视线转动的方向

#### 2.相对运动

当相机与它所拍摄的物体同时运动的时候，相机所拍摄的画面不会有任何改变

![](/webgl-share/54.png)

因此，我们可以默认相机的视点就在零点，相机看向-z 方向，其上方向就是 y 轴。  
当我我们改变的相机的视点、视线和上方向的时候，只要相对的去改变场景中的物体即可。  
而这个相对的去改变场景中的物体的矩阵，就是视图矩阵。

![](/webgl-share/55.png)

通过上面原理可以知道，想要计算视图矩阵，让其满足以下条件即可：

1. 把视点 e(ex,ey,ez)对齐到 O 点上
2. 把视线 c(cx,cy,cz) 旋转到-z 轴上
3. 把上方向 b(bx,by,bz) 旋转到 y 轴上
4. 把 c 与 b 的垂线 a(ax,ay,az) 旋转到 x 轴上

#### 3.正交矩阵的旋转

为了理解视图矩阵的运算，从几个例题说起。

题 1  
已知：点 A(1,0,0)  
求：把点 A 绕 z 轴逆时针旋转 30°，旋转到 B 点的行主序矩阵 m1  
![](/webgl-share/56.png)

```js
m1=[
	cos30°,-sin30°,0,0,
	sin30°,cos30°, 0,0,
	0,     0,      1,0,
	0,     0,      0,1,
]
B=m1*A
B.x=(cos30°,-sin30°,0,0)·(1,0,0,1)=cos30°
B.y=(sin30°,cos30°, 0,0)·(1,0,0,1)=sin30°
```

题 2  
继题 1 的已知条件  
求：把点 B 绕 z 轴逆时针旋转-30°，旋转到 A 点的列行序矩阵 m2

```js
m2=[
	cos-30°,-sin-30°,0,0,
	sin-30°,cos-30°, 0,0,
	0,      0,       1,0,
	0,      0,       0,1,
]
m2=[
	cos30°, sin30°,  0,0,
	-sin30°,cos30°,  0,0,
	0,      0,       1,0,
	0,      0,       0,1,
]
```

观察题 1、题 2，我们可以发现两个规律：

- m2 是 m1 的逆矩阵
- m2 也是 m1 的转置矩阵

由此我们可以得到一个结论：**正交旋转矩阵的逆矩阵就是其转置矩阵**。

题 3  
已知：

- 三维直角坐标系 m1，其基向量是：

  - x(1,0,0)
  - y(0,1,0)
  - z(0,0,1)

- 三维直角坐标系 m2，其基向量是：
  - x(cos30°, sin30°,0)
  - y(-sin30°,cos30°,0)
  - z(0, 0, 1)

求：将 m1 中的基向量对齐到 m2 的行主序矩阵 m3  
![](/webgl-share/57.png)

解：

将 m2 的基向量 x,y,z 中的 x 分量写入 m3 第 1 行;  
将 m2 的基向量 x,y,z 中的 y 分量写入 m3 第 2 行;  
将 m2 的基向量 x,y,z 中的 z 分量写入 m3 第 3 行。

```js
m3=[
	cos30°,-sin30°,0,0,
	sin30°,cos30°, 0,0,
	0,     0,      1,0,
	0,     0,      0,1,
]
```

题 4  
继题 3 的已知条件  
求：将 m2 中的基向量对齐到 m1 的行主序矩阵 m4

解：  
由题 3 已知：将 m1 中的基向量对齐到 m2 的行主序矩阵是 m3  
由题 4 的问题可知：m4 就是 m3 的逆矩阵  
因为：正交旋转矩阵的逆矩阵就是其转置矩阵  
所以：m4 就是 m3 的转置矩阵

```js
m3=[
	cos30°,-sin30°,0,0,
	sin30°,cos30°, 0,0,
	0,     0,      1,0,
	0,     0,      0,1,
]
m4=[
	cos30°,sin30°,0,0,
	-sin30°,cos30°,0,0,
	0,0,1,0,
	0,0,0,1
]
```

#### 4.计算视图矩阵

![](/webgl-share/57.png)

1. 先位移：写出把视点 e(ex,ey,ez) 对齐到 O 点上的行主序位移矩阵 mt

```json
mt
mt=[
  1,0,0,-ex,
  0,1,0,-ey,
  0,0,1,-ez,
  0,0,0,1,
]
```

2. 写出把{o;x,y,-z} 对齐到{e;a,b,c} 的行主序旋转矩阵 mr1

把 a,b,-c 的 x 分量写入 mr1 的第 1 行；  
​ 把 a,b,-c 的 y 分量写入 mr1 的第 2 行；  
​ 把 a,b,-c 的 z 分量写入 mr1 的第 3 行；

```json
mr1
mr1=[
	 ax, bx, -cx, 0,
	 ay, by, -cy, 0,
	 az, bz, -cz, 0,
	 0,  0,   0,  1
]
```

3. 计算 mr1 的逆矩阵 mr2。

因为正交旋转矩阵的逆矩阵就是其转置矩阵，所以 mr2 就是 mr1 的转置矩阵。

```json
mr2
mr2=[
	 ax, ay, az, 0,
	 bx, by, bz, 0,
	-cx,-cy,-cz, 0,
	 0,  0,   0, 1
]
```

4. 视图投影矩阵=mr2\*mt

#### 5.视图矩阵的代码实现

![](/webgl-share/58.png)

基于视点、目标点、上方向生成视图矩阵。

```json
getViewMatrix 相当于 threeJS 的 lookAt 方法
function getViewMatrix(e, t, u) {
  //基向量c，视线
  const c = new Vector3().subVectors(e, t).normalize()
  //基向量a，视线和上方向的垂线
  const a = new Vector3().crossVectors(u, c).normalize()
  //基向量b，修正上方向
  const b = new Vector3().crossVectors(c, a).normalize()
  //正交旋转矩阵
  const mr = new Matrix4().set(
    ...a, 0,
    ...b, 0,
    -c.x, -c.y, -c.z, 0,
    0, 0, 0, 1
  )
  //位移矩阵
  const mt = new Matrix4().set(
    1, 0, 0, -e.x,
    0, 1, 0, -e.y,
    0, 0, 1, -e.z,
    0, 0, 0, 1
  )
  return mr.multiply(mt).elements
}
```

getViewMatrix 方法就是从一个新的角度去看某一个东西的意思

- e 视点
- t 目标点
- u 上方向

在其中我借助了 Three.js 的 Vector3 对象

- subVectors(e, t) 向量 e 减向量 t
- normalize() 向量的归一化
- crossVectors(u, d) 向量 u 和向量 d 的叉乘

```js
crossVectors( a, b ) {
  const ax = a.x, ay = a.y, az = a.z;
  const bx = b.x, by = b.y, bz = b.z;
  this.x = ay * bz - az * by;
  this.y = az * bx - ax * bz;
  this.z = ax * by - ay * bx;
  return this;
}
```

解释一下上面基向量 a,b,c 的运算原理，以下图为例：

![](/webgl-share/59.png)

视线 c 之所以是视点 e 减目标点 t，是为了取一个正向的基向量。

```js
c=(e-t)/|e-t|
c=(0,0,2)/2
c=(0,0,1)
```

基向量 a 是上方向 u 和向量 c 的叉乘

```js
a=u^c/|u^c|
a=(cos30°,0,0)/cos30°
a=(1,0,0)
```

基向量 b 是向量 c 和向量 a 的叉乘，可以理解为把上方向摆正

```js
b=c^a/|c^a|
b=(0,1,0)/1
b=(0,1,0)
```

#### 6.测试

1. 顶点着色器

```js
<script id="vertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    //视图矩阵
    uniform mat4 u_ViewMatrix;
    void main(){
      gl_Position = u_ViewMatrix*a_Position;
    }
</script>
```

2. 建立视图矩阵，并传递给顶点着色器

```js
const u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
const viewMatrix = getViewMatrix(
  new Vector3(0.3, 0.2, 0.5),
  new Vector3(0.0, 0.1, 0),
  new Vector3(0, 1, 0)
);
gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix);
```

注：

three.js 里的 lookAt() 方法便可以实现矩阵的正交旋转，其参数也是视点、目标点、上方向，它的实现原理上面说的是一样的。

```js
const u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
const viewMatrix = new Matrix4().lookAt(
  new Vector3(0.5, 0.5, 1),
  new Vector3(0, 0, 0),
  new Vector3(0, 1, 0)
);
gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
```

### 4.模型矩阵

一个模型可能经过了多次变换，将这些变换复合成一个等效的变换，就得到了**模型变换**，相应的模型变换的矩阵称为**模型矩阵**（可以对物体进行位移、旋转、缩放变换）。

代码实现：

1. 在顶点着色器中添加一个模型矩阵

```js
<script id="vertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    //模型矩阵
    uniform mat4 u_ModelMatrix;
    //视图矩阵
    uniform mat4 u_ViewMatrix;
    void main(){
      gl_Position = u_ViewMatrix*u_ModelMatrix*a_Position;
    }
</script>
```

2. 在 js 中建立模型矩阵，并传递给顶点着色器

```js
const u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
const u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");

const modelMatrix = new Matrix4();
const viewMatrix = new Matrix4().lookAt(
  new Vector3(0, 0.25, 1),
  new Vector3(0, 0, 0),
  new Vector3(0, 1, 0)
);

gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
```

3. 添加一个旋转动画

```js
let angle = 0;
!(function ani() {
  angle += 0.02;
  modelMatrix.makeRotationY(angle);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.LINES, 0, indices.length);
  requestAnimationFrame(ani);
})();
```

4. 还可以来个弹性动画

```js
let angle = 0;

const minY = -0.7;
const maxY = 0.7;
let y = maxY;
let vy = 0;
const ay = -0.001;
const bounce = 1;

!(function ani() {
  angle += 0.01;
  vy += ay;
  y += vy;
  modelMatrix.makeRotationY(angle);
  modelMatrix.setPosition(0, y, 0);
  if (modelMatrix.elements[13] < minY) {
    y = minY;
    vy *= -bounce;
  }

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.LINES, 0, indices.length);
  requestAnimationFrame(ani);
})();
```

## 七、颜色与纹理

### 1.多 attribute 变量

如何一次性绘制三个不同颜色的点？

1. 多点同色

::: details 代码实现
```html{42}
<canvas id="canvas"></canvas>
<script id="vertexShader" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  void main(){
      gl_Position = a_Position;
      gl_PointSize = 50.0;
  }
</script>
<script id="fragmentShader" type="x-shader/x-fragment">
  precision mediump float;
  uniform vec4 u_FragColor;
  void main(){
      gl_FragColor = u_FragColor;
  }
</script>
<script type="module">
  import { initShaders } from "../jsm/Utils.js";

  const canvas = document.querySelector("#canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const vsSource = document.querySelector("#vertexShader").innerText;
  const fsSource = document.querySelector("#fragmentShader").innerText;
  const gl = canvas.getContext("webgl");
  initShaders(gl, vsSource, fsSource);

  //顶点数据
  const vertices = new Float32Array([
    0, 0.2,
    -0.2, -0.1,
    0.2, -0.1
  ]);

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  const u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0);

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, 3);
</script>
```
效果：  
![](/webgl-share/62.png)

注意：  
这种方式只会绘制三个同样颜色的点。  
若想给这三个点不同的颜色，就需要再建立一个接收颜色数据的 attribute 变量。
:::

2. 多点异色

::: details 代码实现
```html{4,5,9,14,16}
<canvas id="canvas"></canvas>
<script id="vertexShader" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  varying vec4 v_Color;
  void main(){
      gl_Position = a_Position;
      gl_PointSize = 50.0;
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
  import { initShaders } from "../jsm/Utils.js";

  const canvas = document.querySelector("#canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const vsSource = document.querySelector("#vertexShader").innerText;
  const fsSource = document.querySelector("#fragmentShader").innerText;
  const gl = canvas.getContext("webgl");
  initShaders(gl, vsSource, fsSource);
  gl.clearColor(0, 0, 0, 1);

  // 顶点数据
  const vertices = new Float32Array([
    0, 0.2,
    -0.2, -0.1,
    0.2, -0.1,
  ]);

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(a_Position)

  // 颜色数据
  const colors = new Float32Array([
    0, 0, 1, 1,
    0, 1, 0, 1,
    1, 1, 0, 1
  ]);
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW)
  const a_Color = gl.getAttribLocation(gl.program, 'a_Color')
  gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(a_Color)

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, 3);
</script>
```
效果：  
![](/webgl-share/63.png)

注意：  
1. 这里使用**varying变量**向片元着色器传入数据，实际上，varying变量的作用是从顶点着色器向片元着色器传输数据
2. 建立了两份 attribute 数据，一份是顶点位置数据，一份是顶点颜色数据
:::

3. 多 attribute 数据合一

数据合一，点位数据和颜色数据放一个集合里，让 attribute 变量按照某种规律从其中寻找数据

::: details 代码实现
```html{32-51,62,76}
<canvas id="canvas"></canvas>
<script id="vertexShader" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  varying vec4 v_Color;
  void main(){
      gl_Position = a_Position;
      gl_PointSize = 50.0;
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
  import { initShaders } from "../jsm/Utils.js";

  const canvas = document.querySelector("#canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const vsSource = document.querySelector("#vertexShader").innerText;
  const fsSource = document.querySelector("#fragmentShader").innerText;
  const gl = canvas.getContext("webgl");
  initShaders(gl, vsSource, fsSource);

  gl.clearColor(0, 0, 0, 1);

  //数据源
  const source = new Float32Array([
    0, 0.4, 0, 0, 0, 1, 1,
    -0.2, -0.1, 0, 0, 1, 0, 1,
    0.2, -0.1, 0, 1, 1, 0, 1,
  ]);
  //元素字节数
  const elementBytes = source.BYTES_PER_ELEMENT;
  //系列尺寸
  const verticeSize = 3;
  const colorSize = 4;
  //类目尺寸
  const categorySize = verticeSize + colorSize;
  //类目字节数
  const categoryBytes = categorySize * elementBytes;
  //系列字节索引位置
  const verticeByteIndex = 0;
  const colorByteIndex = verticeSize * elementBytes;
  //顶点总数
  const sourceSize = source.length / categorySize;

  //缓冲对象
  const sourceBuffer = gl.createBuffer();
  //绑定缓冲对象
  gl.bindBuffer(gl.ARRAY_BUFFER, sourceBuffer);
  //写入数据
  gl.bufferData(gl.ARRAY_BUFFER, source, gl.STATIC_DRAW)
  //获取attribute 变量
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  //修改attribute 变量
  gl.vertexAttribPointer(
    a_Position,
    verticeSize,
    gl.FLOAT,
    false,
    categoryBytes,
    verticeByteIndex
  )
  //赋能
  gl.enableVertexAttribArray(a_Position)

  //获取attribute 变量
  const a_Color = gl.getAttribLocation(gl.program, 'a_Color')
  //修改attribute 变量
  gl.vertexAttribPointer(
    a_Color,
    colorSize,
    gl.FLOAT,
    false,
    categoryBytes,
    colorByteIndex
  )
  //赋能
  gl.enableVertexAttribArray(a_Color)

  //刷底色
  gl.clear(gl.COLOR_BUFFER_BIT);
  //绘制顶点
  gl.drawArrays(gl.POINTS, 0, sourceSize);
</script>
```
效果：  
![](/webgl-share/63.png)

对应上面的数据，先有以下概念：  
- 数据源：整个合而为一的数据 source
- 元素字节数：32 位浮点集合中每个元素的字节数
- 类目：一个顶点对应一个类目，也就是上面 source 中的每一行
- 系列：一个类目中所包含的每一种数据，比如顶点位置数据、顶点颜色数据
- 系列尺寸：一个系列所对应的向量的分量数目
- 类目尺寸：一个类目中所有系列尺寸的总和
- 类目字节数：一个类目的所有字节数量
- 系列元素索引位置：一个系列在一个类目中，以集合元素为单位的索引位置
- 系列字节索引位置：一个系列在一个类目中，以字节为单位的索引位置
- 顶点总数：数据源中的顶点总数

gl.vertexAttribPointer() 方法玩转数据源：  
- 以前在说 vertexAttribPointer() 的时候，说过它的功能就是让 gl 修改 attribute 上下文对象的。
- 其实具体而言，它是在告诉顶点着色器中的 attribute 变量以怎样的方式从顶点着色器中寻找它所需要的数据。
- 比如，我想让顶点着色器中，名叫 a_Position 的 attribute 的变量从数据源中，寻找它所需要的数据。

gl.vertexAttribPointer(index, size, type, normalized, stride, offset) ：  
- index：attribute 变量，具体而言是指向存储 attribute 变量的空间的指针
- size：系列尺寸
- type：元素的数据类型
- normalized：是否归一化
- stride：类目字节数
- offset：系列索引位置

![](/webgl-share/64.png)
![](/webgl-share/65.png)
:::


### 2.彩色三角形

::: details 代码实现
```html{92}
<canvas id="canvas"></canvas>
<!-- 顶点着色器 -->
<script id="vertexShader" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  varying vec4 v_Color;
  void main(){
      gl_Position = a_Position;
      gl_PointSize = 50.0;
      v_Color = a_Color;
  }
</script>
<!-- 片元着色器 -->
<script id="fragmentShader" type="x-shader/x-fragment">
  precision mediump float;
  varying vec4 v_Color;
  void main(){
      gl_FragColor = v_Color;
  }
</script>
<script type="module">
  import { initShaders } from "../jsm/Utils.js";

  const canvas = document.querySelector("#canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const vsSource = document.querySelector("#vertexShader").innerText;
  const fsSource = document.querySelector("#fragmentShader").innerText;
  const gl = canvas.getContext("webgl");
  initShaders(gl, vsSource, fsSource);

  gl.clearColor(0, 0, 0, 1);

  //数据源
  const source = new Float32Array([
    0, 0.2, 0, 0, 0, 1, 1,
    -0.2, -0.1, 0, 0, 1, 0, 1,
    0.2, -0.1, 0, 1, 0, 0, 1,
  ]);
  //元素字节数
  const elementBytes = source.BYTES_PER_ELEMENT
  //系列尺寸
  const verticeSize = 3
  const colorSize = 4
  //类目尺寸
  const categorySize = verticeSize + colorSize
  //类目字节数
  const categoryBytes = categorySize * elementBytes
  //系列字节索引位置
  const verticeByteIndex = 0
  const colorByteIndex = verticeSize * elementBytes
  //顶点总数
  const sourceSize = source.length / categorySize

  //缓冲对象
  const sourceBuffer = gl.createBuffer();
  //绑定缓冲对象
  gl.bindBuffer(gl.ARRAY_BUFFER, sourceBuffer);
  //写入数据
  gl.bufferData(gl.ARRAY_BUFFER, source, gl.STATIC_DRAW)
  //获取attribute 变量
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  //修改attribute 变量
  gl.vertexAttribPointer(
    a_Position,
    verticeSize,
    gl.FLOAT,
    false,
    categoryBytes,
    verticeByteIndex
  )
  //赋能-批处理
  gl.enableVertexAttribArray(a_Position)

  //获取attribute 变量
  const a_Color = gl.getAttribLocation(gl.program, 'a_Color')
  //修改attribute 变量
  gl.vertexAttribPointer(
    a_Color,
    colorSize,
    gl.FLOAT,
    false,
    categoryBytes,
    colorByteIndex
  )
  //赋能-批处理
  gl.enableVertexAttribArray(a_Color)

  //刷底色
  gl.clear(gl.COLOR_BUFFER_BIT);
  //绘制顶点
  gl.drawArrays(gl.TRIANGLES, 0, sourceSize);
</script>
```

效果如下：  
![](/webgl-share/66.png)

原理：  
三角形的三个顶点绑定了三种颜色，在三个点之间做线性补间，将补间得出的颜色填充到三角形所围成的每个片元之中。  
![](/webgl-share/67.gif)

顶点着色器和片元着色器之间的图形装配和光栅化：  
**图形装配**：将孤立的顶点坐标装配成几何图形。几何图形的类别由gl.drawArrays()函数的第一个参数决定。

**光栅化**过程：将装配好的几何图形转化为片元。
![](/webgl-share/68.png)

注意：  
1. gl.Position实际上是**几何图形装配**阶段的输入数据
2. 几何图形装配过程又被称为**图元装配过程**
3. 被装配过的图形(点、线、面)又称为**图元**
4. 显示在屏幕上的三角形是由片元(像素)组成的，所以还需要将图形转化为片元，这个过程称为**光栅化**

![](/webgl-share/69.png)
:::

### 3.纹理

纹理，通常指的就是二维的栅格图像，可以将其作为 webgl 图形的贴图。  
而在 webgl 里，还有一个纹理对象的概念，它是对图像又做了一层封装。

::: details 代码实现
```html{4,5,8,14,16,32,80-109}
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
  varying vec2 v_Pin;
  void main(){
    gl_FragColor = texture2D(u_Sampler, v_Pin);
  }
</script>
<script type="module">
  import { initShaders } from '../jsm/Utils.js';

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
    -0.5, 0.5, 0, 1.0,
    -0.5, -0.5, 0, 0.0,
    0.5, 0.5, 1.0, 1,
    0.5, -0.5, 1.0, 0.0,
  ]);
  const FSIZE = source.BYTES_PER_ELEMENT;
  //元素字节数
  const elementBytes = source.BYTES_PER_ELEMENT
  //系列尺寸
  const posSize = 2
  const pinSize = 2
  //类目尺寸
  const categorySize = posSize + pinSize
  //类目字节数
  const categoryBytes = categorySize * elementBytes
  //系列字节索引位置
  const posByteIndex = 0
  const pinByteIndex = posSize * elementBytes
  //顶点总数
  const sourceSize = source.length / categorySize

  const sourceBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sourceBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, source, gl.STATIC_DRAW);

  const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.vertexAttribPointer(
    a_Position,
    posSize,
    gl.FLOAT,
    false,
    categoryBytes,
    posByteIndex
  );
  gl.enableVertexAttribArray(a_Position);

  const a_Pin = gl.getAttribLocation(gl.program, 'a_Pin');
  gl.vertexAttribPointer(
    a_Pin,
    pinSize,
    gl.FLOAT,
    false,
    categoryBytes,
    pinByteIndex
  );
  gl.enableVertexAttribArray(a_Pin);

  /* 图像预处理 */
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)

  /* 准备三个角色 */
  gl.activeTexture(gl.TEXTURE0)
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  const image = new Image()
  image.src = './images/erha.jpg'
  image.onload = function () {
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGB,
      gl.RGB,
      gl.UNSIGNED_BYTE,
      image
    )

    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR
    )

    const u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler')
    gl.uniform1i(u_Sampler, 0)

    render()
  }

  //渲染
  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, sourceSize);
  }
</script>
```
效果：    
![](/webgl-share/80.png)

步骤：  
1. 准备好映射到几何图形上的纹理图像
2. 为几何图形配置纹理映射方式
3. 加载纹理图像，对其进行配置，以在WebGL中使用它
4. 在片元着色器中奖相应的纹素从纹理中抽取出来，并将纹素的颜色赋给片元
:::

#### 1.基础概念

1. 栅格系统

在说图像的时候，往往都是指点阵图、栅格图、位图，而与其相对应的是图形，也做矢量图。   
纹理，就是属于图像，其图像的建立和显示会遵循栅格系统里的规范。  
所有图像都是由像素组成的，在 webgl 里我们把像素称为片元，像素是按照相互垂直的行列排列的。

如下图：  
![](/webgl-share/70.png)

将其放大后就可以看见其中的栅格：  
![](/webgl-share/71.png)

图像中的每个像素都可以通过行数 y 和列数 x 来找到，由(x, y) 构成的点位，就是图像的像素坐标。

因为 canvas 画布也是一张图像，所以图像的栅格坐标系和我们之前说过的 canvas2d 的坐标系是一样的：  
![](/webgl-share/6.png)

栅格坐标系的原点在左上角。  
栅格坐标系的 y 轴方向是朝下的。  
栅格坐标系的坐标基底由两个分量组成，分别是一个像素的宽和一个像素的高。

2. 图钉（WebGL纹理坐标）

图钉是我自己写的概念，源自于 photoshop 中图像的操控变形功能，这种称呼很形象。  
![](/webgl-share/72.png)

webgl 中，图钉的位置是通过 uv （st）坐标来控制的，图钉的 uv 坐标和顶点的 webgl 坐标是两种不同的坐标系统，之后会将其相互映射，从而将图像特定的一块区域贴到 webgl 图形中。

例如：  
![](/webgl-share/73.png)


3. uv 坐标系

![](/webgl-share/74.png)
uv 坐标系，也叫 st 坐标系，坐标原点在图像的左下角，u 轴在右，v 轴在上  
u 轴上的 1 个单位是图像的宽；  
v 轴上的一个单位是图像的高。

4. 采样器

采样器是按照图钉位置从图像中获取片元的方式。

在图像中所打的图钉位置，并不是图像中某一个片元的位置，因为片元位置走的是栅格坐标系。

需要一个采样器去对图钉的 uv 坐标系和像素的栅格坐标系做映射，从而去采集图像中图钉所对应的片元。

着色器基于一张图像可以建立一个或多个采样器，不同的采样器可以定义不同的规则去获取图像中的片元。

采样器在着色器中是一种变量类型，写做 sampler2D，它就像之前写过的 vec4 类型一样，可以在片元着色器中通过 uniform 变量暴露给 js，让 js 对其进行修改。

5. 纹理对象

着色器使用一个纹理对象，就可以建立一个采样器。

纹理对象的建立需要一个图像源，比如 Image 对象。

同时，还需要设置纹理对象和图钉进行数据映射的方式。

js => 纹理对象，webgl => 缓冲区  
缓存区用于存放纹理对象的磁盘空间，这块空间可以将纹理对象翻译成着色器可以读懂的数据。  
之后会把这个空间的索引位置传给着色器，让着色器基于这个空间的索引位置，找到这个空间，然后再从空间中找到纹理对象，最后通过纹理对象建立采样器。

6. 纹理单元

纹理单元是一种专门用来存放纹理对象的缓冲区，就像我们之前用 createBuffer()方法建立的用于存储数据源的缓冲区一样。

webgl=> 纹理单元，如 TEXTURE0|1|2|3|4|5|6|7|

纹理单元虽然无需我们自己建立，但需要我们自己激活，让其进入使用状态

#### 2.整体代码

1. 顶点着色器

```js
<script id="vertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    attribute vec2 a_Pin; // 图钉位置
    varying vec2 v_Pin;
    void main(){
      gl_Position = a_Position;
      v_Pin = a_Pin;
    }
</script>
```

2. 片元着色器

```js
<script id="fragmentShader" type="x-shader/x-fragment">
    precision mediump float;
    uniform sampler2D u_Sampler;
    varying vec2 v_Pin;
    void main(){
      gl_FragColor = texture2D(u_Sampler, v_Pin);
    }
</script>

// sampler2D 是 uniform 变量的类型，叫做二维取样器
// texture2D() 基于图钉从取样器中获取片元颜色
```

3. 初始化着色器

```js
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const gl = canvas.getContext("webgl");

const vsSource = document.getElementById("vertexShader").innerText;
const fsSource = document.getElementById("fragmentShader").innerText;
initShaders(gl, vsSource, fsSource);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
```

4. 建立数据源，并计算相应尺寸

```js
//数据源 (顶点位置系列 和 图钉位置)
const source = new Float32Array([
    -0.5, 0.5, 0.0, 1.0,
    -0.5, -0.5, 0.0, 0.0,
    0.5, 0.5, 1.0, 1.0,
    0.5, -0.5, 1.0, 0.0,
]);
const FSIZE = source.BYTES_PER_ELEMENT;
//元素字节数
const elementBytes = source.BYTES_PER_ELEMENT
//系列尺寸
const posSize = 2
const PinSize = 2
//类目尺寸
const categorySize = posSize + PinSize
//类目字节数
const categoryBytes = categorySize * elementBytes
//系列字节索引位置
const posByteIndex = 0
const pinByteIndex = posSize * elementBytes
//顶点总数
const sourceSize = source.length / categorySize
```

5. 将数据源写入到缓冲区，让 attribute 变量从其中寻找数据

```js
const sourceBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, sourceBuffer);
gl.bufferData(gl.ARRAY_BUFFER, source, gl.STATIC_DRAW);

const a_Position = gl.getAttribLocation(gl.program, "a_Position");
gl.vertexAttribPointer(
  a_Position,
  posSize,
  gl.FLOAT,
  false,
  categoryBytes,
  posByteIndex
);
gl.enableVertexAttribArray(a_Position);

const a_Pin = gl.getAttribLocation(gl.program, "a_Pin");
gl.vertexAttribPointer(
  a_Pin,
  pinSize,
  gl.FLOAT,
  false,
  categoryBytes,
  pinByteIndex
);
gl.enableVertexAttribArray(a_Pin);
```

6. 建立 Image 图像作为图像源，当图像源加载成功后再贴图

```js
//对纹理图像垂直翻转
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

//激活 0 号纹理单元
gl.activeTexture(gl.TEXTURE0);

//纹理对象
const texture = gl.createTexture();
//把纹理对象装进纹理单元里
gl.bindTexture(gl.TEXTURE_2D, texture);

//image 对象
const image = new Image();
image.src = "./images/erha2.jpg";
image.onload = function () {
  showMap();
};

//贴图
function showMap() {
  //配置纹理图像
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  //配置纹理参数
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  //获取u_Sampler
  const u_Sampler = gl.getUniformLocation(gl.program, "u_Sampler");
  //将0号纹理分配给着色器，0 是纹理单元编号
  gl.uniform1i(u_Sampler, 0);

  //渲染
  render();
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, sourceSize);
}
```

#### 3.贴图详解

1. 准备三个角色

- Image 图像
- 纹理对象
- 纹理单元

![](/webgl-share/75.png)

```js
// 激活0号纹理单元
gl.activeTexture(gl.TEXTURE0);

//纹理对象
const texture = gl.createTexture();

//image 对象
const image = new Image();
image.src = "./images/erha.jpg";
```

2. 把纹理对象装进当前已被激活的纹理单元里

![](/webgl-share/76.png)

```js
const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
```

- TEXTURE_2D 纹理对象的类型

3. 当 Image 图像加载成功后，把图像装进当前纹理单元的纹理对象里

![](/webgl-share/77.png)

```js
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
```

texImage2D(type, level, internalformat, format, type, pixels)

- type 纹理类型
- level 基本图像等级
- internalformat 纹理中的颜色组件
- format 纹理数据格式，必须和 internalformat 一样
- type 纹理数据的数据类型
  - UNSIGNED_BYTE 无符号字节
- pixels 图像源

4. 纹理对象还有一些相应参数需要设置一下

```js
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
```

texParameteri(type, pname, param)

- type 纹理类型
  - TEXTURE_2D 二维纹理
- pname 纹理参数的名称
  - TEXTURE_MIN_FILTER 纹理缩小滤波器
- param 与 pname 相对应的纹理参数值
  - gl.LINEAR 线性

5. 在 js 中获取采样器对应的 Uniform 变量,告诉片元着色器中的采样器，纹理对象在哪个单元里。之后采样器便会根据单元号去单元对象中寻找纹理对象

![](/webgl-share/78.png)

```js
const u_Sampler = gl.getUniformLocation(gl.program, "u_Sampler");
gl.uniform1i(u_Sampler, 0);
```

6. 渲染

```js
render();
function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, sourceSize);
}
```

效果如下：  
![](/webgl-share/79.png)

这时候的图像是倒立的，这是由于 Image 对象遵守的是栅格坐标系，栅格坐标系的 y 轴朝下，而 uv 坐标系的 y 朝上，两者相反，所以画出的图形反了。

7. 对图像进行预处理，将图像垂直翻转

```js
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
```

pixelStorei(pname, param) 图像预处理

- pname 参数名
  - gl.UNPACK_FLIP_Y_WEBGL 是否垂直翻，布尔值，1|0
- param 参数值

![](/webgl-share/80.png)

#### 4.纹理容器

在贴图的时候，默认图像源的尺寸只能是 2 的 n 次方，比如 2、4、8、16、……、256、512 等，如果我们把图像的尺寸改成非 2 次幂尺寸，如 300\*300，那贴图就无法显示。

要想解决这种问题，就得设置一下纹理的容器，在图像上打图钉的时候，形成一块 uv 区域，这块区域可以理解为纹理容器。纹理容器可以定义图钉区域的纹理如何显示在 webgl 图形中。通过对纹理容器的设置，我们可以实现以下功能：

- 非二次幂图像源的显示
- 纹理的复制
- 纹理的镜像

1. 非二次幂图像源的显示

```js
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
```

TEXTURE_WRAP_S 和 TEXTURE_WRAP_T 就是纹理容器在 s 方向和 t 方向的尺寸，这里的 s、t 就是 st 坐标系里的 s、t，st 坐标系和 uv 坐标系是一回事。

CLAMP_TO_EDGE 翻译过来就是边缘夹紧的意思，可以理解为任意尺寸的图像源都可以被宽高为 1 的 uv 尺寸夹紧。

注：只有 CLAMP_TO_EDGE 才能实现非二次幂图像源的显示，其它的参数都不可以。

2. 纹理的复制

uv 坐标系的坐标基底分别是 1 个图片的宽和 1 个图片的高，可是如果我们将 2 个图片的宽高映射到了图形上会是什么结果呢？

默认是这样的：  
![](/webgl-share/81.png)

```js
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
```

REPEAT 就是纹理重复的意思

3. 纹理的镜像复制
   纹理的镜像复制可以实现纹理的水平、垂直翻转和复制。

效果如下：  
![](/webgl-share/82.png)

```js
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
```

MIRRORED_REPEAT 就是镜像复制的意思。

也可以通过使用 CLAMP_TO_EDGE 只对某一个方向纹理镜像复制

```js
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
```

效果如下：  
![](/webgl-share/83.png)

#### 5.分子贴图

分子贴图 mipmap 是一种纹理映射技术。

比如：

webgl 中有一个正方形，它在 canvas 画布中显示的时候，占据了 2\*2 个像素，我们要将一个 8\*8 的图像源贴上去。

正方形中肯定不能显示图像源中的所有像素，因为它只有 2\*2=4 个像素。

在 Photoshop 中，会将图像源切割成 2 行、2 列的色块，然后将每个色块的均值交个正方形。

在 webgl 中也有类似的方法，并且它还有一层渲染性能的优化（Photoshop 底层是否有这层优化我尚且不知）。

接下来咱们就说一下这层优化优化的是什么。

先想象一个场景，我要把 1024\*1024 的图像源映射到 canvas 画布上 2\*2 的正方形中，若把图像源分割求均值会产生庞大的数据运算，我们需要想办法把和正方形相映射的图像源的尺寸降到最小，比如就是 2\*2 的。

因此，我们就需要[分子贴图](https://baike.baidu.com/item/Mipmap/3722136?fr=aladdin)了。

分子贴图是一个基于分辨率等比排列的图像集合，集合中每一项的宽高与其前一项宽高的比值都是 1/2。

如下图：

![](/webgl-share/84.png)

在 webgl 中，我们可以使用 gl.generateMipmap() 方法为图像源创建分子贴图，

有了分子贴图后，之前 2\*2 的正方形便会从分子集合中寻找与其分辨率最接近的分子图像。

在找到分子图像后，就需要基于 webgl 图形的片元尺寸对其分割取色了。

对于取色的方法，咱们之前说一个均值算法，其实还有其它算法

```js
//创建分子贴图
gl.generateMipmap(gl.TEXTURE_2D);
//定义从分子图像中取色的方法
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
```

gl.texParameteri()方法中的第 2 个参数和第 3 个参数是键值对的关系。

TEXTURE_MAG_FILTER 和 TEXTURE_MIN_FILTER，对应的是纹理在 webgl 图形中的缩放情况。

- TEXTURE_MAG_FILTER 纹理放大滤波器，是纹理在 webgl 图形中被放大的情况。
- TEXTURE_MIN_FILTER 纹理缩小滤波器，是纹理在 webgl 图形中被缩小的情况。

TEXTURE_MAG_FILTER 具备以下参数：

- LINEAR (默认值) ，线性滤镜， 获取纹理坐标点附近 4 个像素的加权平均值，效果平滑
- NEAREST 最近滤镜， 获得最靠近纹理坐标点的像素 ，效果锐利

TEXTURE_MIN_FILTER 具备以下参数：

- LINEAR 线性滤镜，获取纹理坐标点附近 4 个像素的加权平均值，效果平滑
- NEAREST 最近滤镜， 获得最靠近纹理坐标点的像素，效果锐利
- NEAREST_MIPMAP_NEAREST Select the nearest mip level and perform nearest neighbor filtering .
- NEAREST_MIPMAP_LINEAR (默认值) Perform a linear interpolation between mip levels and perform nearest neighbor filtering within each .
- LINEAR_MIPMAP_NEAREST Select the nearest mip level and perform linear filtering within it .
- LINEAR_MIPMAP_LINEAR Perform a linear interpolation between mip levels and perform linear filtering : also called trilinear filtering .

注：后面这 4 个与分子贴图相关的参数适合比较大的贴图，若是比较小的贴图，使用 LINEAR 或 NEAREST 就好。

注：缩小滤波器的默认值取色方法是 NEAREST_MIPMAP_LINEAR ，这个方法会从分子贴图里找分子图像，然后从其中取色，然而当我们没有使用 gl.generateMipmap()方法建立分子贴图的时候，就得给它一个不需要从分子贴图中去色的方法，如 LINEAR 或 NEAREST。

#### 6.多纹理模型

在实际开发中，经常会遇到一个模型，多个纹理的的情况。

比如这个魔方：

![](/webgl-share/86.gif)

有时候会很自然的想到一个面给它一个贴图，而实际上，最高效的方式是一个物体给它一个贴图，如下图：

![](/webgl-share/85.jpg)

这样只需要加载一次图片，建立一个纹理对象，做一次纹理和顶点数据的映射就可以了。

这里面没有涉及任何新的知识点，但这是一种很重要的项目开发经验。

::: details 代码实现
```html
<canvas id="canvas"></canvas>
<script id="vertexShader" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  attribute vec2 a_Pin;
  uniform mat4 u_ModelMatrix;
  varying vec2 v_Pin;
  void main(){
    gl_Position = u_ModelMatrix*a_Position;
    v_Pin = a_Pin;
  }
</script>
<script id="fragmentShader" type="x-shader/x-fragment">
  precision mediump float;
  uniform sampler2D u_Sampler;
  varying vec2 v_Pin;
  void main(){
    gl_FragColor = texture2D(u_Sampler, v_Pin);
  }
</script>
<script type="module">
  import { initShaders } from '../jsm/Utils.js';
  import { Matrix4 } from 'https://unpkg.com/three/build/three.module.js';

  const canvas = document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const gl = canvas.getContext('webgl');
  const vsSource = document.getElementById('vertexShader').innerText;
  const fsSource = document.getElementById('fragmentShader').innerText;
  initShaders(gl, vsSource, fsSource);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  //数据源
  const source = new Float32Array([
    -0.5, -0.5, -0.5, 0, 0,
    -0.5, 0.5, -0.5, 0, 0.5,
    0.5, -0.5, -0.5, 0.25, 0,
    -0.5, 0.5, -0.5, 0, 0.5,
    0.5, 0.5, -0.5, 0.25, 0.5,
    0.5, -0.5, -0.5, 0.25, 0,

    -0.5, -0.5, 0.5, 0.25, 0,
    0.5, -0.5, 0.5, 0.5, 0,
    -0.5, 0.5, 0.5, 0.25, 0.5,
    -0.5, 0.5, 0.5, 0.25, 0.5,
    0.5, -0.5, 0.5, 0.5, 0,
    0.5, 0.5, 0.5, 0.5, 0.5,

    -0.5, 0.5, -0.5, 0.5, 0,
    -0.5, 0.5, 0.5, 0.5, 0.5,
    0.5, 0.5, -0.5, 0.75, 0,
    -0.5, 0.5, 0.5, 0.5, 0.5,
    0.5, 0.5, 0.5, 0.75, 0.5,
    0.5, 0.5, -0.5, 0.75, 0,

    -0.5, -0.5, -0.5, 0, 0.5,
    0.5, -0.5, -0.5, 0.25, 0.5,
    -0.5, -0.5, 0.5, 0, 1,
    -0.5, -0.5, 0.5, 0, 1,
    0.5, -0.5, -0.5, 0.25, 0.5,
    0.5, -0.5, 0.5, 0.25, 1,

    -0.5, -0.5, -0.5, 0.25, 0.5,
    -0.5, -0.5, 0.5, 0.25, 1,
    -0.5, 0.5, -0.5, 0.5, 0.5,
    -0.5, -0.5, 0.5, 0.25, 1,
    -0.5, 0.5, 0.5, 0.5, 1,
    -0.5, 0.5, -0.5, 0.5, 0.5,

    0.5, -0.5, -0.5, 0.5, 0.5,
    0.5, 0.5, -0.5, 0.75, 0.5,
    0.5, -0.5, 0.5, 0.5, 1,
    0.5, -0.5, 0.5, 0.5, 1,
    0.5, 0.5, -0.5, 0.75, 0.5,
    0.5, 0.5, 0.5, 0.75, 1,
  ]);
  const FSIZE = source.BYTES_PER_ELEMENT;
  //元素字节数
  const elementBytes = source.BYTES_PER_ELEMENT
  //系列尺寸
  const posSize = 3
  const pinSize = 2
  //类目尺寸
  const categorySize = posSize + pinSize
  //类目字节数
  const categoryBytes = categorySize * elementBytes
  //系列字节索引位置
  const posByteIndex = 0
  const pinByteIndex = posSize * elementBytes
  //顶点总数
  const sourceSize = source.length / categorySize

  const sourceBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sourceBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, source, gl.STATIC_DRAW);

  const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.vertexAttribPointer(
    a_Position,
    posSize,
    gl.FLOAT,
    false,
    categoryBytes,
    posByteIndex
  );
  gl.enableVertexAttribArray(a_Position);

  const a_Pin = gl.getAttribLocation(gl.program, 'a_Pin');
  gl.vertexAttribPointer(
    a_Pin,
    pinSize,
    gl.FLOAT,
    false,
    categoryBytes,
    pinByteIndex
  );
  gl.enableVertexAttribArray(a_Pin);

  //模型矩阵
  const modelMatrix = new Matrix4()
  const mx = new Matrix4().makeRotationX(0.02)
  const my = new Matrix4().makeRotationY(0.02)
  const u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix')
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)

  /* 图像预处理 */
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)

  /* 准备三个角色 */
  gl.activeTexture(gl.TEXTURE0)
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)

  const image = new Image()
  image.src = './images/mf.jpg'
  image.onload = function () {
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      image
    )

    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR
    );

    const u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler')
    gl.uniform1i(u_Sampler, 0)

    render()
  }

  //渲染
  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, sourceSize);
  }

  // 连续渲染
  !(function ani() {
    modelMatrix.multiply(my).multiply(mx)
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)
    render()
    requestAnimationFrame(ani)
  })()
</script>
```
:::

### 4.纹理合成

纹理合成就是按照某种规则将多张图片合在一起。

#### 4-1 多图加载

纹理合成是需要多张图像源的，因此我们需要多张图像源都加载成功后，再去合成纹理。

1. 将图像的加载方法封装进一个 Promise 中，等图像加载成功后，再 resolve。

```js
function imgPromise(img) {
  return new Promise((resolve) => {
    img.onload = function () {
      resolve(img);
    };
  });
}
```

2. 建立多个 Image 对象

```js
const originImg = new Image();
originImg.src = "./images/dress.jpg";

const pattern = new Image();
pattern.src = "./images/pattern1.jpg";
```

3. 利用 Promise.all 监听所有图片的记载成功

```js
Promise.all([imgPromise(originImg), imgPromise(pattern)]).then(() => {
  rect.maps = {
    u_Sampler: { image: originImg },
    u_Pattern: { image: pattern },
  };
  rect.updateMaps();
  render();
});
```

等所有的图片都加载成功后，会往 rect 的 maps 集合里写入贴图，然后对其更新和渲染。

接下来，看一下纹理合成最核心的地方，片元着色器。

#### 4-2 在片元着色器中合成纹理

片元着色器：

```js
<script id="fragmentShader" type="x-shader/x-fragment">  
  precision mediump float;  
  uniform sampler2D u_Sampler;  
  uniform sampler2D u_Pattern;  
  varying vec2 v_Pin;  
  void main(){    
    vec4 o = texture2D(u_Sampler,v_Pin);    
    vec4 p = texture2D(u_Pattern,v_Pin);    
    gl_FragColor = p*o;  
  }
</script>
```

- u_Sampler 是原始图片采样器，对应下图：

![](/webgl-share/87.jpg)

- u_Pattern 是纹理图案采样器，对应下图：

![](/webgl-share/88.jpg)

之后，通过采样器找到原始图片和纹理图案的片元后，便可以对其进行运算：

```js
vec4 o = texture2D(u_Sampler,v_Pin);
vec4 p = texture2D(u_Pattern,v_Pin);
gl_FragColor = p*o;
```

上面的 p\*o 便是在对片元做分量相乘的运算，这种算法会让原始图片的亮度变暗，有点类似于 ps 里的正片叠底。

![](/webgl-share/89.png)

举个例子说一下片元相乘的逻辑。

已知：

- 原始图像片元 o(ox,oy,oz,ow)
- 纹理图案片元 p(px,py,pz,pw)

求：p\*o

解：

```js
p * o = (px * ox, py * oy, pz * oz, pw * ow);
```

通过此例可知：因为片元分量的值域为[0,1]，所以 p\*o 的亮度小于等于 p 和 o

- 当 p=(1,1,1,1) 时，p\*o=o

```js
p * o = (1 * ox, 1 * oy, 1 * oz, 1 * ow);
p * o = (ox, oy, oz, ow);
```

- 当 p=(0,0,0,0) 时，p\*o=(0,0,0,0)

#### 4-3 纹理混合

纹理混合就是按照一定比例，将第一张图像合到另一张图像上，这类似于 ps 里的透明度合成。

直接看一下纹理在片元着色里的合成方法。

```js
<script id="fragmentShader" type="x-shader/x-fragment">  
  precision mediump float;
  uniform sampler2D u_Sampler;
  uniform sampler2D u_Pattern;
  varying vec2 v_Pin;
  void main(){
    vec4 o = texture2D(u_Sampler, v_Pin);
    vec4 p = texture2D(u_Pattern, v_Pin);
    gl_FragColor = mix(o, p, 1.0);
  }
</script>
```

上面的 mix() 方法便是按照比例对两个纹理的合成方法。

mix() 方法的返回数据类型会因其合成对象的不同而不同。

其规则如下：

```js
mix(m, n, a) = m + (n - m) * a;
```

例 1：  
- m=3
- n=5
- a=0.5

求：mix(m,n,a)

解：  
```js
mix(m, n, a) = 3 + (5 - 3) * 0.5;
mix(m, n, a) = 3 + 2 * 0.5;
mix(m, n, a) = 4;
```

例 2：

- m=(1,2,3)
- n=(3,4,5)
- a=0.5

求：mix(m,n,a)

解：

```js
mix(m, n, a) = (1 + (3 - 1) * 0.5, 2 + (4 - 2) * 0.5, 3 + (5 - 3) * 0.5);
mix(m, n, a) = (2, 3, 4);
```

简单总结一下 mix(m,n,a) 方法的特性：

- 当 a=0 时，mix(m,n,a)=m
- 当 a=1 时，mix(m,n,a)=n

参考地址：https://www.khronos.org/registry/OpenGL-Refpages/gl4/

利用纹理混合，我们可以实现转场动画。

### 5.跨域图像做贴图

这里要说的跨域图像问题，并不单是 webgl 问题，也是 canvas 2d 里的问题。

1. img 标签与跨域图像

用 img 标签显示跨域图像的时候，只能将图像展示给用户，但并不能获取图像中的数据。

```js
<img src="https://xxx/xxx.png'">
```

不能通过 img 标签获取图像数据，是浏览器出于安全考虑的，因为有的图像里可能会含有验证码、签名、或者其它不可告人的东东，这种数据是不能随意被别人获取的。

2. 获取图像数据

若图像是同域的，下面的方法是没问题的：

```js
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const img = new Image();
img.src = "https://xxx/xxx.png";

img.onload = function () {
  const { width, height } = canvas;
  ctx.drawImage(img, 0, 0);
  ctx.getImageData(0, 0, width, height);
};
```

若图像是跨域的，那就会报错：

```js
Failed to execute 'getImageData' on 'CanvasRenderingContext2D': The canvas has been tainted by cross-origin data.
```

用 webgl 获取跨域图像数据时，也会报错：

```js
const image = new Image();
image.src = "https://xxx/xxx.png";
image.onload = function () {
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  const u_Sampler = gl.getUniformLocation(gl.program, "u_Sampler");
  gl.uniform1i(u_Sampler, 0);
  render();
};
```

错误信息：

```js
Failed to execute 'texImage2D' on 'WebGLRenderingContext': The image element contains cross-origin data, and may not be loaded.
```

3. CORS 跨域

CORS 是 Cross Origin Resource Sharing 的简写，译作跨域资源共享。

CORS 是一种网页向图像服务器请求使用图像许可的方式。

CORS 的实现过程如下：

1.先让服务器向其它域名放权，比如 Apache 服务器需要这样设置：

```js
Header set Access-Control-Allow-Origin "*"
```

上面代码的意思就是允许其它域名的网页跨域获取自己服务端的资源。

上面的\* 是允许所有域名获取其服务端资源。

我们也可以写具体的域名，从而允许特定域名获取其服务端资源。

2.在网页里，通过特定的方法告诉服务端，我需要跨域获取你的资源。

```js
const image = new Image();
image.src = "https://xxx/xxx.png";
image.setAttribute("crossOrigin", "Anonymous");
```

有了上面 crossOrigin 属性的设置，无论是在 canvas 2d 里使用此图像源，还是在 webgl 里使用此图像源，都不会报错。

crossOrigin 接收的值有三种：

- undefined 是默认值，表示不需要向其它域名的服务器请求资源共享
- anonymous 向其它域名的服务器请求资源共享，但不需要向其发送任何信息
- use-credentials 向其它域名的服务器请求资源共享，并发送 cookies 等信息，服务器会通过这些信息决定是否授权

### 6.视频贴图

之前使用 texImage2D 方法将 Image 图像源装进了纹理对象里：

```js
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
```

也可以把上面的 image 换成 video 对象

1. 正常建立纹理对象，并设置其相关属性

```js
gl.activeTexture(gl.TEXTURE0);
const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
```

2. 获取采样器对应的 uniform 变量，并将纹理单元号赋给它

```js
const u_Sampler = gl.getUniformLocation(gl.program, "u_Sampler");
gl.uniform1i(u_Sampler, 0);
```

3. 建立 video 对象，并播放

```js
const video = document.createElement("video");
video.src = "http://img.yxyy.name/ripples.mp4";
video.autoplay = true;
video.muted = true;
video.loop = true;
video.setAttribute("crossOrigin", "Anonymous");
video.play();
video.addEventListener("playing", () => {
  ani();
});
```

4. 在 video 对象播放时，向纹理对象连续写入 video

```js
function render() {
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, sourceSize);
  requestAnimationFrame(render);
}
```

## 八、世界坐标和本地坐标

### 1.基本概念

3D空间拥有一个世界坐标系，3D屏幕中的所有物体都可以在该坐标系系统下移动和旋转，对于屏幕上的所有物体来说，这个坐标系系统都是相同的，并且它不会改变。用户默认的观察视角是沿着Z轴的负半轴方向

除了世界坐标系外，每个物体都有一个本地坐标系，如图：  
![](/webgl-share/90.png)

当物体旋转时，本地坐标系统也会跟着物体一起旋转，如图：  
![](/webgl-share/91.png)

### 2.世界坐标系和本地坐标系点位关系

`已知`：

- 世界坐标系[O1;i1,j1,k1]
- 点 P
- 点 P 所处的本地坐标系是[O2;i2,j2,k2]
- 世界坐标系[O1;i1,j1,k1]∋ 本地坐标系[O2;i2,j2,k2]

`分析`：

[O;i,j,k]中：

- O 是坐标原点
- i,j,k 是坐标向量

这是空间直角坐标系的书写方式，可在高中数学的空间几何部分找到

`提问 1`：

点 P 的坐标位是(x,y,z)，可否找到点 P？

答：不可。

因为没说(x,y,z) 是在世界坐标系[O1;i1,j1,k1]里的位置，还是在本地坐标系是[O2;i2,j2,k2]里的位置。

`提问 2`：

点 P 的世界坐标位是(x,y,z)，可否找到点 P？

答：可

`提问 3`：

点 P 的本地坐标位是(x,y,z)，可否找到点 P？若可以，求点 P 的世界位。

答：可

`解`：

根据空间向量分解定理。

由世界坐标系[O1;i1,j1,k1]可解析出四维矩阵 m1：

```
[
	i1.x, j1.x, k1.x, 0,
	i1.y, j1.y, k1.y, 0,
	i1.z, j1.z, k1.z, 0,
	O1.x, O1.y, O1.z, 1
]
```

同理，由本地坐标系[O2;i2,j2,k2]可解析出四维矩阵 m2：

```
[
	i2.x, j2.x, k2.x, 0,
	i2.y, j2.y, k2.y, 0,
	i2.z, j2.z, k2.z, 0,
	O2.x, O2.y, O2.z, 1
]
```

点 P 的世界位是：

```js
m1 * m2 * (x, y, z);
```


## 九、深入认知三维世界
### 1.用位移矩阵做实验
#### 1.1示例

`已知`：

- 宇宙 universe
- 宇宙的本地坐标系是[O1;i1,j1,k1]
  - O1(0,0,0)
  - i1(1,0,0)
  - j1(0,1,0)
  - k1(0,0,1)
- 宇宙包含万物，其本地坐标系就是万物的世界坐标系
- 银河系 galaxy
- 银河系的本地坐标系是[O2;i2,j2,k2]
  - O2(1,2,3)
  - i2(1,0,0)
  - j2(0,1,0)
  - k2(0,0,1)
- 太阳 sun
- 太阳在银河系内的本地坐标位是 P2(4,5,6)
- 太阳 ∈ 银河系 ∈ 宇宙

求：太阳的世界位 P1

`解`：

由宇宙坐标系[O1;i1,j1,k1]解矩阵 m1：

```
[
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 0,
	0, 0, 0, 1
]
```

由银河系[O2;i2,j2,k2]解矩阵 m2:

```
[
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 0,
	1, 2, 3, 1
]
```

点 P 的世界坐标位是：

```js
P1 = m1 * m2 * (4, 5, 6);
P1 = (1 + 4, 2 + 5, 3 + 6);
P1 = (5, 7, 9);
```

#### 1.2用 three.js 验证

::: details 代码实现
```js
  import { 
    Group, 
    Matrix4, 
    Object3D, 
    Scene, 
    Vector3 
  } from 'https://unpkg.com/three/build/three.module.js'

  //世界坐标系-宇宙
  const m1 = new Matrix4()
  m1.elements = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]

  //本地坐标系-银河系
  const m2 = new Matrix4()
  m2.elements = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    1, 2, 3, 1,
  ]

  //太阳在银河系内的本地坐标位
  const P2 = new Vector3(4, 5, 6)

  //创造宇宙
  const universe = new Scene()
  universe.applyMatrix4(m1)

  //创造银河系
  const galaxy = new Group()
  galaxy.applyMatrix4(m2)

  //创造太阳
  const sun = new Object3D()
  sun.position.copy(P2)

  //银河系包含太阳
  galaxy.add(sun)

  //宇宙包含银河系
  universe.add(galaxy)

  //求太阳在宇宙中的世界位
  const P1 = new Vector3()
  sun.getWorldPosition(P1)
  console.log(P1)  // {x: 5, y: 7, z: 9}
```
:::

### 2.位移法则

若不想求太阳的位置，想求太阳系内的地球的位置，是否还可按照之前的思路来求解？答案是肯定的。

#### 2.1示例

调整一下之前的已知条件。

- 把太阳改成太阳系 solar
- 太阳系的本地坐标系是[O3;i3,j3,k3]

  - O3(4,5,6)
  - i3(1,0,0)
  - j3(0,1,0)
  - k3(0,0,1)

- 地球 earth
- 地球在太阳系内的本地坐标位是 P3(7,8,9)
- 地球 ∈ 太阳系 ∈ 银河系 ∈ 宇宙

求：地球的世界坐标位 P1

`解`：

由太阳系的本地坐标系可得矩阵 m3：

```
[
	1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    4, 5, 6, 1
]
```

求地球的世界坐标位 P1：

```js
P1 = m1 * m2 * m3 * (7, 8, 9);
P1 = (1 + 4 + 7, 2 + 5 + 8, 3 + 6 + 9);
P1 = (12, 15, 18);
```

#### 2.2用 three.js验证

::: details 代码实现
```js
import { 
  Group, 
  Matrix4, 
  Object3D, 
  Scene, 
  Vector3
} from 'https://unpkg.com/three/build/three.module.js';

//世界坐标系-宇宙
const m1 = new Matrix4()
m1.elements = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
]

//本地坐标系-银河系
const m2 = new Matrix4()
m2.elements = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    1, 2, 3, 1
]

//本地坐标系-太阳系
const m3 = new Matrix4()
m3.elements = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    4, 5, 6, 1
]

//本地坐标位-地球
const P3 = new Vector3(7, 8, 9)

//宇宙(世界坐标系是宇宙的本地坐标系)
const universe = new Scene()
universe.applyMatrix4(m1)

//银河系
const galaxy = new Group()
galaxy.applyMatrix4(m2)

//太阳系
const solar = new Group()
solar.applyMatrix4(m3)

//地球
const earth = new Object3D()
earth.position.copy(P3)

//包含关系
solar.add(earth)
galaxy.add(solar)
universe.add(galaxy)

//点P的世界位
const P1 = new Vector3()
earth.getWorldPosition(P1)
console.log(P1); //{x: 12, y: 15, z: 18}
```
:::

#### 2.3推理

可以从上面的结论中得到一个规律：

当一点 P 和宇宙之间存在 n 层嵌套  
点 P 的本地坐标位是 Pn  
第 n 层世界的本地坐标系所对应的矩阵是 mn  
则点 P 的世界位 P1 是：  
```js
P1 = m1 * m2 * …… * mn * pn
```
上面的公式，就暂且叫它“**本地坐标转世界坐标公式**”。

### 3.缩放法则

#### 3.1示例

修改之前已知条件：

- 在银河系的本地坐标系[O2;i2,j2,k2]中，让 j2 是单位向量的 2 倍：

  - O2(1, 2, 3)
  - i2(1, 0, 0)
  - j2(0, 2, 0)
  - k2(0, 0, 1)

- 在太阳系的本地坐标系[O3;i3,j3,k3]，让 k3 是单位向量的 3 倍：
  - O3(4, 5, 6)
  - i3(1, 0, 0)
  - j3(0, 1, 0)
  - k3(0, 0, 3)

求：地球的世界坐标位 P1

`解`：

由银河系的本地坐标系可得矩阵 m2：

```
[
   1, 0, 0, 0,
   0, 2, 0, 0,
   0, 0, 1, 0,
   1, 2, 3, 1
]
```

由太阳系的本地坐标系可得矩阵 m3：

```
[
   1, 0, 0, 0,
   0, 1, 0, 0,
   0, 0, 3, 0,
   4, 5, 6, 1
]
```

求地球的世界坐标位 P1：

```js
P1 = m1 * m2 * m3 * (7, 8, 9)
m1 * m2 * m3 = [
    1,  0,    0,  0,
    0,  2,    0,  0
    0,  0,    3,  0
    4+1,2*5+2,6+3,1
]
m1 * m2 * m3= [
    1, 0, 0, 0,
    0, 2, 0, 0,
    0, 0, 3, 0,
    5, 12,9, 1
]
P1=(7+5, 8*2+12, 9*3+9)
P1=(12, 28, 36)
```

#### 3.2用 three.js验证
::: details 代码实现
```js
import { 
  Group, 
  Matrix4, 
  Object3D, 
  Scene, 
  Vector3
} from 'https://unpkg.com/three/build/three.module.js';

//世界坐标系-宇宙
const m1 = new Matrix4()
m1.elements = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
]

//本地坐标系-银河系
const m2 = new Matrix4()
m2.elements = [
  1, 0, 0, 0,
  0, 2, 0, 0,
  0, 0, 1, 0,
  1, 2, 3, 1,
]

//本地坐标系-太阳系
const m3 = new Matrix4()
m3.elements = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 3, 0,
  4, 5, 6, 1,
]

//地球在太阳系内的本地坐标位
const P3 = new Vector3(7, 8, 9)

//创造宇宙
const universe = new Scene()
universe.applyMatrix4(m1)

//创造银河系
const galaxy = new Group()
galaxy.applyMatrix4(m2)

//创造太阳系
const solar = new Group()
solar.applyMatrix4(m3)

//创造地球
const earth = new Object3D()
earth.position.copy(P3)

//太阳系包含地球
solar.add(earth)

//银河系包含太阳
galaxy.add(solar)

//宇宙包含银河系
universe.add(galaxy)

//求太阳在宇宙中的世界位
const P1 = new Vector3()
earth.getWorldPosition(P1)
console.log(P1);  // {x: 12, y: 28, z: 36}
```
::: 

### 4.旋转法则

#### 4.1示例

修改之前已知条件：

- 让银河系的本地坐标系[O2;i2,j2,k2]绕 j2 轴逆时针旋转 20°。

  设：c2 = cos(-20°)，s2 = sin(-20°)

  则：

  - O2(1, 2, 3)
  - i2(c2, 0, -s2)
  - j2(0, 1, 0)
  - k2(s2, 0, c2)

- 让太阳系的本地坐标系[O3;i3,j3,k3]绕 k3 轴逆时针旋转 30°

  设：c3 = cos(30°)，s3 = sin(30°)

  则：

  - O3(4, 5, 6)
  - i3(c3, -s3, 0)
  - j3(s3, c3, 0)
  - k3(0, 0, 1)

求：地球的世界坐标位 P1

`解`：

由银河系的本地坐标系可得矩阵 m2：

```
[
	c2, 0, s2, 0,
    0,  1, 0,  0,
    -s2,0, c2, 0,
    1,  2, 3,  1
]
```

由太阳系的本地坐标系可得矩阵 m3：

```
[
	c3,  s3, 0, 0,
    -s3, c3, 0, 0,
    0,   0,  1, 0,
    4,   5,  6, 1
]
```

求地球的世界坐标位 P1：

```js
P1 = m1 * m2 * m3 * (7, 8, 9)
m1 * m2 * m3 = [
    c2*c3,      s3,   s2*c3,      0,
    -c2*s3,     c3,   -s2*s3,     0,
    -s2,        0,    c2,         0,
    c2*4-s2*6+1,5+2,s2*4+c2*6+3,1
]
P1 = (11.826885919330648, 17.428203230275507, 15.02200238270646)
```

注意，上式很难像之前那样心算，可以直接用计算机算：

```js
//让银河系的本地坐标系[O2;i2,j2,k2]绕j2轴逆时针旋转20°
const ang2 = -20 * Math.PI / 180
const c2 = Math.cos(ang2)
const s2 = Math.sin(ang2)

//让太阳系的本地坐标系[O3;i3,j3,k3]绕k3轴逆时针旋转30°
const ang3 = 30 * Math.PI / 180
const c3 = Math.cos(ang3)
const s3 = Math.sin(ang3)

const m = new Matrix4()
m.elements = [
    c2 * c3, s3, s2 * c3, 0,
    -c2 * s3, c3, -s2 * s3, 0,
    -s2, 0, c2, 0,
    c2 * 4 - s2 * 6 + 1, 5 + 2, s2 * 4 + c2 * 6 + 3, 1
]
const P1 = P3.applyMatrix4(m)
console.log(P1)
// {x: 11.826885919330648, y: 17.428203230275507, z: 15.02200238270646}
```

#### 4.2用 three.js 验证

::: details 代码实现
```js
import {
  Group,
  Matrix4,
  Object3D,
  Scene,
  Vector3,
} from "https://unpkg.com/three/build/three.module.js";

//世界坐标系-宇宙
const m1 = new Matrix4();
m1.elements = [
  1, 0, 0, 0, 
  0, 1, 0, 0, 
  0, 0, 1, 0, 
  0, 0, 0, 1
];

//本地坐标系-银河系
const ang2 = (20 * Math.PI) / 180;
const m2 = new Matrix4();
m2.makeRotationY(ang2);
m2.setPosition(1, 2, 3);
console.log(m2.elements);

//本地坐标系-太阳系
const ang3 = (30 * Math.PI) / 180;
const m3 = new Matrix4();
m3.makeRotationZ(ang3);
m3.setPosition(4, 5, 6);

//地球在太阳系内的本地坐标位
const P3 = new Vector3(7, 8, 9);

//创造宇宙
const universe = new Scene();
universe.applyMatrix4(m1);

//创造银河系
const galaxy = new Group();
galaxy.applyMatrix4(m2);

//创造太阳系
const solar = new Group();
solar.applyMatrix4(m3);

//创造地球
const earth = new Object3D();
earth.position.copy(P3);

//太阳系包含地球
solar.add(earth);

//银河系包含太阳
galaxy.add(solar);

//宇宙包含银河系
universe.add(galaxy);

//求太阳在宇宙中的世界位
const P1 = new Vector3();
earth.getWorldPosition(P1);
console.log(P1)
// {x: 11.826885919330648, y: 17.428203230275507, z: 15.02200238270646}
```
:::


## 十、旋转法则深度探索

物体旋转的复杂程度是位移和缩放的 n 多倍。  
以前在旋转物体时，只是让其绕坐标轴 x|y|z 旋转。  
然而，在实际项目开发中，会有其它的旋转需求。  

比如：

- 欧拉 Euler：让物体基于世界坐标系绕 x 轴旋转 a°，然后绕本地坐标系 y 轴旋转 b°，最后绕本地坐标系 z 轴旋转 c°。

- 四元数 Quaternion：让物体绕任意一轴旋转 a°。

### 1.顶点绕单轴逆时针旋转

![](/webgl-share/92.png)

在右手坐标系的逆时针旋转里，绕 y 轴的逆时针旋转有点特别。

绕 y 轴旋转时，x 轴正半轴是起始轴，即 x 轴正半轴的弧度为 0。  
一顶点绕 y 轴逆时针旋转时，旋转量越大，弧度值越小。  

而绕其它两个轴旋转时，则与其相反：  
一顶点绕 x 轴或 z 轴逆时针旋转时，旋转量越大，弧度值越大。

所以银河系的本地坐标系 [O2;i2,j2,k2] 绕 j2 轴逆时针旋转 20° 时，是通过-20° 取的 sin 值和 cos 值。

::: details three.js验证
```js
const ang = 30 * Math.PI / 180
//three.js四维矩阵对象
const m = new Matrix4()

//绕x轴逆时针旋转30°
{
    //three.js 旋转
    m.makeRotationX(ang)
    console.log(...m.elements);

    //手动旋转
    const c = Math.cos(ang)
    const s = Math.sin(ang)
    console.log(
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1,
    );
}

//绕y轴逆时针旋转30°
{
    //three.js 旋转
    m.makeRotationY(ang)
    console.log(...m.elements);

    //手动旋转
    const c = Math.cos(-ang)
    const s = Math.sin(-ang)
    console.log(
        c, 0, s, 0,
        0, 1, 0, 0,
        -s, 0, c, 0,
        0, 0, 0, 1,
    );
}

//绕z轴逆时针旋转30°
{
    //three.js 旋转
    m.makeRotationZ(ang)
    console.log(...m.elements);

    //手动旋转
    const c = Math.cos(ang)
    const s = Math.sin(ang)
    console.log(
        c, s, 0, 0,
        -s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    );
}
```
:::

### 2.欧拉旋转

欧拉旋转就是绕单轴多次逆时针旋转，第一次是绕世界坐标系的单轴逆时针旋转，之后则是绕本地坐标系的单轴逆时针旋转。

#### 2.1示例

`已知`：

世界坐标系 m1  
点 P 在世界坐标系内  
点 P 的世界坐标位 P1(x, y, z)  

`求`：

点 P 绕世界坐标系的 x 轴逆时针旋转 angX 度，  
绕本地坐标系的 y 轴逆时针旋转 angY 度，  
绕本地坐标系的 z 轴逆时针旋转 angZ 度后的世界位 P2。  

`解`：

分别基于 angX, angY, angZ 建立三个矩阵 mx,my,mz  
点 P 的世界位是：
```js
P2 = mx * my * mz * P1;
```

#### 2.3用 three.js 验证

```js
import {
  Group,
  Matrix4,
  Object3D,
  Scene,
  Vector3,
  Euler,
} from "https://unpkg.com/three/build/three.module.js";

const [angX, angY, angZ] = [1, 2, 3];
const P1 = new Vector3(1, 1, 1);

//用矩阵乘法实现顶点绕单轴多次逆时针旋转
{
  const mx = new Matrix4().makeRotationX(angX);
  const my = new Matrix4().makeRotationY(angY);
  const mz = new Matrix4().makeRotationZ(angZ);
  //P2=mx*my*mz*P1
  const P2 = P1.clone();
  P2.applyMatrix4(mx.multiply(my).multiply(mz));
  console.log(P2);
}

//用欧拉实现顶点绕单轴多次逆时针旋转
{
  const euler = new Euler(angX, angY, angZ);
  const m = new Matrix4();
  m.makeRotationFromEuler(euler);
  const P2 = P1.clone().applyMatrix4(m);
  console.log(P2);
}
```

上面 P2 的两个输出结果都是一样的。

#### 2.4讲个故事理解欧拉

通过之前的代码，可以发现欧拉旋转和之前说过的世界坐标系、本地坐标系的呼应规律。

可以即此编一个关于王者荣耀故事：

- 宇宙，宇宙的本地坐标系是万物的世界坐标系，此坐标系为单位矩阵
- mx：银河系的本地坐标系
- my：太阳系的本地坐标系
- mz：凡间界的本地坐标系
- P1：瑶在欧拉旋转前的世界位
- 宇宙 ∋ 银河系 ∋ 太阳系 ∋ 凡间界 ∋ 瑶

求：瑶欧拉旋转(angX,angY,angZ) 后的世界位 P2，旋转顺序为 xyz

`解`：

1. 让瑶坠落凡间界。

   当前宇宙万界的本地坐标系都是单位矩阵，所以瑶的世界坐标位 P1，也是瑶在万界中的本地坐标位。

   下面的 P1 也就可以理解为瑶在凡间界的本地坐标位。

   ```
   const P1 = new Vector3(1, 1, 1)
   ```

2. 将银河系、太阳系、凡间界分别沿 x 轴、y 轴、z 轴旋转 angX、angY、angZ 度。

   ```
   const mx = new Matrix4().makeRotationX(angX)
   const my = new Matrix4().makeRotationY(angY)
   const mz = new Matrix4().makeRotationZ(angZ)
   ```

3. 让瑶跳出三界之外，求其世界位

   ```js
   //P2=mx*my*mz*P1
   const P2 = P1.clone();
   P2.applyMatrix4(mx.multiply(my).multiply(mz));
   ```

### 3.四元数

四元数 Quaternion：让物体绕任意轴旋转 a°。

![](/webgl-share/93.png)

`已知`：

- 轴 OC2
- 弧度 ang
- 点 P1(x,y,z)

```j's
const OC2 = new Vector3(3, 2, 1).normalize()
const ang = 2
const P1 = new Vector3(1, 2, 3)
```

`求`：点 P1 绕 OC2 逆时针旋转 ang 度后的位置 P2

`解`：

`接下来要把 OC2 转得与 z 轴同向`。

1. 计算绕 x 轴把 OC2 旋转到平面 Ozx 上的旋转矩阵 mx1。

旋转的度数是 OC2 在平面 Oyz 上的正射影 OB2 与 z 轴的夹角，即 ∠B2OB1。

![](/webgl-share/94.png)

```js
const B2OB1 = Math.atan2(OC2.y, OC2.z);
const mx1 = new Matrix4().makeRotationX(B2OB1);
```

2. 顺便再求出绕 x 轴反向旋转 ∠B2OB1 的矩阵 mx2，以备后用。

```js
const mx2 = new Matrix4().makeRotationX(-B2OB1);
```

3. 基于矩阵 mx1 旋转 OC2，旋转到 OC3 的位置。

```js
//OC3 = m1*OC2
const OC3 = OC2.clone();
OC3.applyMatrix4(mx1);
```

4. 计算绕 y 轴把 OC3 旋转到 z 轴上的旋转矩阵 my1。

旋转的度数是 OC3 与 z 轴的夹角，即 ∠C3OB1。

```js
const C3OB1 = Math.atan2(OC3.x, OC3.z)
const my1 = new Matrix4().makeRotationY(-C3OB1)
```

​ 至于旋转后 OC3 在哪里，就不重要了，只要知道了其旋转了多少度，以及其最后会和 z 轴同向就够了。

5. 顺便再求出绕 y 轴反向旋转 ∠C3OB1 的矩阵 my2，以备后用。

```js
const my2 = new Matrix4().makeRotationY(C3OB1);
```

6. 在 OC2 转到 z 轴上的时候，也让点 P1 做等量的旋转，得 P2 点

```js
//P2 =my1*mx1*P1
const P2 = P1.clone();
P2.applyMatrix4(mx1);
P2.applyMatrix4(my1);
```

7. 计算绕 z 轴旋转 ang 度的矩阵 mz

```js
const mz = new Matrix4().makeRotationZ(ang)
```

8. 让点 P2 绕 z 轴旋转 ang 度

```js
P2.applyMatrix4(mz);
```

9. 让点 P2 按照之前 OC2 的旋转量再逆向转回去。

```js
P2.applyMatrix4(my2);
P2.applyMatrix4(mx2);
```

也可以把所有的矩阵合一下，再乘以 P2

```js
const P2 = P1.clone();
const m = mx2.multiply(my2).multiply(mz).multiply(my1).multiply(mx1);
P2.applyMatrix4(m);
```

10. 验证

```js
const quaternion = new Quaternion();
quaternion.setFromAxisAngle(OC2, ang);
const m = new Matrix4();
m.makeRotationFromQuaternion(quaternion);
console.log(P1.clone().applyMatrix4(m));
```

四元数旋转的`实现原理`：  
1. 将旋转轴带着顶点一起旋转，让旋转轴与 xyz 中的某一个轴同向，比如 z 轴。
2. 让顶点绕 z 轴旋转相应的度数。
3. 让顶点按照之前旋转轴的旋转量逆向转回去。


## 十一、正交投影矩阵

WebGL 是一个光栅引擎，其本身并不会实现三维效果，那要在其中实现三维效果的关键就在于算法：  
**`顶点在裁剪空间中的位置 = 投影矩阵 * 视图矩阵 * 模型矩阵 * 顶点的初始点位`**

正交投影矩阵是投影矩阵的一种，先从它说起。在说正交投影矩阵之前，还需要对裁剪空间有一个清晰的认知。
### 1.裁剪空间

裁剪空间（左手坐标系）是用于显示 webgl 图形的空间，此空间是一个宽、高、深皆为 2 的盒子。其坐标系的原点在 canvas 画布的中心，如下图：

![](/webgl-share/95.png)

裁剪空间中：

- x 轴上-1 的位置对应 canvas 画布的左边界，1 的位置对应 canvas 画布的右边界
- y 轴上-1 的位置对应 canvas 画布的下边界，1 的位置对应 canvas 画布的上边界
- y 轴上-1 的位置朝向屏幕外部，1 的位置朝向屏幕内部，如下图：

![](/webgl-share/96.png)

### 2.正交投影矩阵的实现原理

![](/webgl-share/97.png)

正交投影矩阵 orthographic projection：将世界坐标系中的一块矩形区域(正交相机的可视区域)投射到裁剪空间中，不同深度的物体不具备近大远小的透视规则。

![](/webgl-share/98.png)

`问`：要将一个任意尺寸的长方体塞进裁剪空间里，分几步？

`答`：先位移，再缩放

![](/webgl-share/99.png)

设：正交相机可视区域的上、下、左、右、前、后的边界分别是 t、b、l、r、n、f

1.位移矩阵

```
[
	1, 0, 0, -(r+l)/2,
	0, 1, 0, -(t+b)/2,
	0, 0, 1, -(f+n)/2,
	0, 0, 0, 1,
]
```

2.缩放矩阵

```
[
	2/(r-l), 0,       0,        0,
	0,       2/(t-b), 0,        0,
	0,       0,       2/(f-n), 0,
	0,       0,       0,        1,
]
```

正交投影矩阵 = 缩放矩阵\*位移矩阵

```
[
	2/(r-l), 0,       0,        -(r+l)/(r-l),
	0,       2/(t-b), 0,        -(t+b)/(t-b),
	0,       0,       2/(f-n),  -(f+n)/(f-n),
	0,       0,       0,        1,
]
```

若 n、f 是一个距离量，而不是在 z 轴上的刻度值，正交投影矩阵在 z 轴上的缩放因子需要取反：

```
[
	2/(r-l), 0,       0,         -(r+l)/(r-l),
	0,       2/(t-b), 0,         -(t+b)/(t-b),
	0,       0,       -2/(f-n),  -(f+n)/(f-n),
	0,       0,       0,         1,
]
```

### 3.正交投影矩阵的代码实现

正交投影矩阵的代码实现很简单，可以直接从 three.js 的 Matrix4 对象的 makeOrthographic() 方法中找到：

```js
makeOrthographic( left, right, top, bottom, near, far ) {

    const te = this.elements;
    const w = 1.0 / ( right - left );
    const h = 1.0 / ( top - bottom );
    const p = 1.0 / ( far - near );

    const x = ( right + left ) * w;
    const y = ( top + bottom ) * h;
    const z = ( far + near ) * p;

    te[ 0 ] = 2 * w;	te[ 4 ] = 0;	te[ 8 ] = 0;	te[ 12 ] = - x;
    te[ 1 ] = 0;	te[ 5 ] = 2 * h;	te[ 9 ] = 0;	te[ 13 ] = - y;
    te[ 2 ] = 0;	te[ 6 ] = 0;	te[ 10 ] = - 2 * p;	te[ 14 ] = - z;
    te[ 3 ] = 0;	te[ 7 ] = 0;	te[ 11 ] = 0;	te[ 15 ] = 1;

    return this;
}
```

以前在绘制 webgl 图形的时候，它们会随 canvas 画布的大小发生拉伸，对于这个问题，便可以用投影矩阵来解决。

### 4.正交投影矩阵解决 webgl 图形拉伸问题

::: details 代码实现
```html{5,37-50}
<canvas id="canvas"></canvas>
<!-- 顶点着色器 -->
<script id="vertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    uniform mat4 u_ProjectionMatrix; // 正交投影矩阵
    void main(){
      gl_Position = u_ProjectionMatrix * a_Position;
    }
</script>
<!-- 片元着色器 -->
<script id="fragmentShader" type="x-shader/x-fragment">
    precision mediump float;
    uniform vec4 u_Color;
    void main(){
      gl_FragColor = u_Color;
    }
</script>
<script type="module">
  import { initShaders } from '../jsm/Utils.js';
  import { 
    Matrix4, 
    OrthographicCamera 
  } from 'https://unpkg.com/three/build/three.module.js';
  import Poly from './jsm/Poly.js';

  const canvas = document.getElementById('canvas');
  const [viewW, viewH] = [window.innerWidth, window.innerHeight]
  canvas.width = viewW;
  canvas.height = viewH;
  const gl = canvas.getContext('webgl');

  const vsSource = document.getElementById('vertexShader').innerText;
  const fsSource = document.getElementById('fragmentShader').innerText;
  initShaders(gl, vsSource, fsSource);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  //正交投影矩阵
  const projectionMatrix = new Matrix4()
  //定义相机世界高度尺寸的一半
  const halfH = 2
  //计算画布的宽高比
  const ratio = canvas.width / canvas.height
  //基于halfH和画布宽高比计算相机世界宽度尺寸的一半
  const halfW = halfH * ratio
  //定义相机世界的6个边界
  const [left, right, top, bottom, near, far] = [
    -halfW, halfW, halfH, -halfH, 0, 4
  ]
  //获取正交投影矩阵
  projectionMatrix.makeOrthographic(left, right, top, bottom, near, far)

  const triangle = new Poly({
    gl,
    source: [
      0, 0.3, -0.2,
      - 0.3, -0.3, -0.2,
      0.3, -0.3, -0.2
    ],
    type: 'TRIANGLES',
    attributes: {
      a_Position: {
        size: 3,
        index: 0
      },
    },
    uniforms: {
      u_Color: {
        type: 'uniform4fv',
        value: [1, 1, 0, 1]
      },
      u_ProjectionMatrix: {
        type: 'uniformMatrix4fv',
        value: projectionMatrix.elements
      },
    }
  })

  render()

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    triangle.draw()
  }
</script>
```
:::

利用投影矩阵将现实世界投射到裁剪空间中后，往往还会对裁剪空间中视图进行位移或旋转，这时候就需要视图矩阵了。


## 十二、视图矩阵

之前在说视图变换的时候说过视图矩阵，这里就通过 three.js 里的正交相机对象，更加形象的认识一下视图矩阵。

### 1.视图位移

1.基于之前的代码，再绘制一个三角形

```js
const triangle1 = crtTriangle(
    [1, 0, 0, 1],
    [
        0, 0.3, -0.2,
        - 0.3, -0.3, -0.2,
        0.3, -0.3, -0.2
    ]
)

const triangle2 = crtTriangle(
    [1, 1, 0, 1],
    [
        0, 0.3, 0.2,
        -0.3, -0.3, 0.2,
        0.3, -0.3, 0.2,
    ]
)

render()

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    triangle1.init()
    triangle1.draw()

    triangle2.init()
    triangle2.draw()
}

function crtTriangle(color, source) {
    return new Poly({
        gl,
        source: new Float32Array(source),
        type: 'TRIANGLES',
        attributes: {
            a_Position: {
                size: 3,
                index: 0
            },
        },
        uniforms: {
            u_Color: {
                type: 'uniform4fv',
                value: color
            },
            u_ProjectionMatrix: {
              type: 'uniformMatrix4fv',
              value: projectionMatrix.elements
            },
        }
    })
}
```

这是一前一后两个三角形。  
前面的是黄色三角形，深度为 0.2；   
后面的是红色三角形，深度为-0.2，被前面的三角形挡住了，所以看不见。 

效果如下：  
![](/webgl-share/100.png)

2.从 three.js 里引入正交相机对象 OrthographicCamera

```js
import {
  Matrix4,
  Vector3,
  OrthographicCamera,
} from "https://unpkg.com/three/build/three.module.js";
```

3.建立正交相机对象

```js
const camera = new OrthographicCamera(left, right, top, bottom, near, far)
```

4.设置相机位置 position

```js
camera.position.set(1, 1, 3);
camera.updateWorldMatrix(true);
```

设置完相机位置后，要使用 updateWorldMatrix() 方法更新相机的世界坐标系。  
updateWorldMatrix() 方法主要是考虑到了相机存在父级的情况。  
updateWorldMatrix() 方法会把更新后的世界坐标系写进写进相机的 matrixWorld 属性里。  

```js
console.log(camera.matrixWorld.elements);
1, 0, 0, 0,
0, 1, 0, 0,
0, 0, 1, 0,
1, 1, 3, 1
```

5.将相机的投影矩阵和相机的世界坐标系的逆矩阵合一下，合一个投影视图矩阵。

```js
const pvMatrix = new Matrix4();
pvMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
```

- a.multiplyMatrices(b,c) 相当于：

```js
a = b * c;
```

- camera.projectionMatrix 可以直接获取相机的投影矩阵
- matrixWorldInverse 是 matrixWorld 的逆矩阵，这是因为相机的移动方向和现实中的物体相反。

```json
console.log(camera.matrixWorldInverse);
 1   0  0  0
 0   1  0  0
 0   0  1  0
-1  -1 -3  1
```

7.把之前的 projectionMatrix 改成 pvMatrix

- 顶点着色器

```html
<script id="vertexShader" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  uniform mat4 u_PvMatrix;
  void main(){
    gl_Position = u_PvMatrix * a_Position;
  }
</script>
```

- js 代码

```js
function crtTriangle(color, source) {
  return new Poly({
    gl,
    source: new Float32Array(source),
    type: "TRIANGLES",
    attributes: {
      a_Position: {
        size: 3,
        index: 0,
      },
    },
    uniforms: {
      u_Color: {
        type: "uniform4fv",
        value: color,
      },
      u_PvMatrix: {
        type: "uniformMatrix4fv",
        value: pvMatrix.elements,
      },
    },
  });
}
```

### 扩展-matrixWorld 详解

`已知`：

- 宇宙 universe

  - 本地坐标系是 m1
  - m1 也是宇宙万界的世界坐标系

- 银河系 galaxy
  - 本地坐标系是 m2
- 太阳系 solar
  - 本地坐标系是 m3
- 太阳系 ∈ 银河系 ∈ 宇宙

求：太阳系的世界坐标系 matrixWorld

`解`：

```js
matrixWorld = m1 * m2 * m3;
```

答案就这么简单，拿代码测一下：

```js
//宇宙(世界坐标系是宇宙的本地坐标系)
const universe = new Scene();
universe.applyMatrix4(m1);

//银河系
const galaxy = new Group();
galaxy.applyMatrix4(m2);

//太阳系
const solar = new Group();
solar.applyMatrix4(m3);

//地球
const earth = new Object3D();
earth.position.copy(P3);

//包含关系
solar.add(earth);
galaxy.add(solar);
universe.add(galaxy);

// 更新太阳系的世界坐标系
solar.updateWorldMatrix(true);

//太阳系的世界坐标系
console.log(...solar.matrixWorld.elements);

//手动计算太阳系的世界坐标系
console.log(...m1.multiply(m2).multiply(m3).elements);
```

### 扩展-逆矩阵

之前在说 matrixWorldInverse 的时候说过，它是 matrixWorld 的逆矩阵。  
逆矩阵在图形项目的应用很广，所以接下来就系统说一下逆矩阵的概念。  

#### 1.逆矩阵的概念

逆矩阵就好比学习除法的时候，一个实数的倒数。

`如`：

2 的倒数是 1/2。  
那么，矩阵 m 的倒数就是 1/m。  
只不过，1/m 不叫做矩阵 m 的倒数，而是叫做矩阵 m 的逆矩阵。  
由上，可以推导出的一些特性。  

`已知`：

- 矩阵 m
- 矩阵 n

`可得`：

1.矩阵与其逆矩阵的相乘结果为单位矩阵

`因为`：

2\*1/2=1

`所以`：

m\*1/m=单位矩阵

2.矩阵 m 除以矩阵 n 就等于矩阵 m 乘以矩阵 n 的逆矩阵

`因为`：

3/2=3\*1/2

`所以`：

m/n=m\*1/n

#### 2.矩阵转逆矩阵

1. 位移矩阵的逆矩阵是取位移因子的相反数

```js
const m=new Matrix4()
m.elements=[
  1,0,0,0,
  0,1,0,0,
  0,0,1,0,
  4,5,6,1,
]
console.log(m.invert().elements);
//打印结果
[
  1,0,0,0,
  0,1,0,0,
  0,0,1,0,
  -4,-5,-6,1,
]
```

2. 缩放矩阵的逆矩阵是取缩放因子的倒数

```js
{
  const m=new Matrix4()
  m.elements=[
    2,0,0,0,
    0,4,0,0,
    0,0,8,0,
    0,0,0,1,
  ]
  console.log(m.invert().elements);
}
//打印结果
[
  0.5, 0, 0, 0,
  0, 0.25, 0, 0,
  0, 0, 0.125,
  0, 0, 0, 0, 1
]

```

3.旋转矩阵的逆矩阵是基于旋转弧度反向旋转

```js
{
  const ang=30*Math.PI/180
  const c=Math.cos(ang)
  const s=Math.sin(ang)
  const m=new Matrix4()
  m.elements=[
    c,s,0,0,
    -s,c,0,0,
    0,0,1,0,
    0,0,0,1,
  ]
  console.log(m.invert().elements);
}
//打印结果
[
  0.866, -0.45, 0, 0,
  0.45, 0.866, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1
]
```

关于即旋转又缩放还位移的复合矩阵，也是按照类似的原理转逆矩阵的，只不过过程要更复杂一些。

three.js 的 Matrix4 对象的 invert() 方法。

```js
invert() {
  // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
  const te = this.elements,

        n11 = te[ 0 ], n21 = te[ 1 ], n31 = te[ 2 ], n41 = te[ 3 ],
        n12 = te[ 4 ], n22 = te[ 5 ], n32 = te[ 6 ], n42 = te[ 7 ],
        n13 = te[ 8 ], n23 = te[ 9 ], n33 = te[ 10 ], n43 = te[ 11 ],
        n14 = te[ 12 ], n24 = te[ 13 ], n34 = te[ 14 ], n44 = te[ 15 ],

        t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
        t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
        t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
        t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

  const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

  if ( det === 0 ) return this.set( 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 );

  const detInv = 1 / det;

  te[ 0 ] = t11 * detInv;
  te[ 1 ] = ( n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44 ) * detInv;
  te[ 2 ] = ( n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44 ) * detInv;
  te[ 3 ] = ( n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43 ) * detInv;

  te[ 4 ] = t12 * detInv;
  te[ 5 ] = ( n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44 ) * detInv;
  te[ 6 ] = ( n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44 ) * detInv;
  te[ 7 ] = ( n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43 ) * detInv;

  te[ 8 ] = t13 * detInv;
  te[ 9 ] = ( n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44 ) * detInv;
  te[ 10 ] = ( n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44 ) * detInv;
  te[ 11 ] = ( n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43 ) * detInv;

  te[ 12 ] = t14 * detInv;
  te[ 13 ] = ( n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34 ) * detInv;
  te[ 14 ] = ( n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34 ) * detInv;
  te[ 15 ] = ( n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33 ) * detInv;

  return this;

}
```

### 2.视图旋转

之前实现了视图的移动效果，然而有时候当遇到一个好玩的物体时，需要在不移动相机的前提下看向它。  
这个时候，就需要旋转视图了。

#### 2.1用 three.js 的 lookAt()实现视图旋转

`已知`：

- 正交相机的边界 left, right, top, bottom, near, far
- 正交相机的视点位置 eye
- 正交相机的目标点 target
- 正交相机从 eye 看向 target 时的上方向 up

`求`：从视点看向目标点时的投影视图矩阵 pvMatrix

`解`：

1.声明已知条件

```js
const halfH = 2;
const ratio = canvas.width / canvas.height;
const halfW = halfH * ratio;
const [left, right, top, bottom, near, far] = [
  -halfW,
  halfW,
  halfH,
  -halfH,
  0,
  4,
];
const eye = new Vector3(1, 1, 3);
const target = new Vector3(0, 0, 0);
const up = new Vector3(0, 1, 0);
```

2.建立正交相机

```js
const camera = new OrthographicCamera(left, right, top, bottom, near, far);
```

3.设置相机的位置

```js
camera.position.copy(eye);
```

4.使用 lookAt()方法，让相机看向目标点，并更新一下相机的世界坐标系。

```js
camera.lookAt(target);
camera.updateWorldMatrix(true);
```

上面的 lookAt() 方法实际上就是在让相机世界进行旋转。  
之后，现实世界在裁剪空间中显示的时候，便会基于此旋转量逆向旋转。

5.通过相机计算投影视图矩阵 pvMatrix

```js
const pvMatrix = new Matrix4();
pvMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
```

效果如下：

![](/webgl-share/101.png)

接下来，对 lookAt 功能进行一下深度剖析。

#### 2.2深度剖析 lookAt 功能

先不考虑相机存在父级情况。  
可以从之前的正交相机里分解出以下矩阵：

- 视图矩阵 viewMatrix：相机位移矩阵乘以旋转矩阵后的逆矩阵，即相机的世界矩阵的逆矩阵
  - 位移矩阵 positionMatrix：由视点位置得出
  - 旋转矩阵 rotationMatrix：由视点、目标点、上方向得出
- 投影矩阵 projectionMatrix：由正交相机的 6 个边界得出
- 投影视图矩阵：投影矩阵乘以视图矩阵

接下来就基于之前的代码做一下分解：

1.由视点位置得出位移矩阵 positionMatrix

```js
const positionMatrix = new Matrix4().setPosition(eye);
```

2.由视点、目标点、上方向得出旋转矩阵 rotationMatrix

```js
const rotationMatrix = new Matrix4().lookAt(eye, target, up);
```

3.基于位移矩阵和旋转矩阵计算视图矩阵 viewMatrix

```js
const viewMatrix = new Matrix4()
  .multiplyMatrices(positionMatrix, rotationMatrix)
  .invert();
```

4.由正交相机对象提取投影矩阵 projectionMatrix

```js
const camera = new OrthographicCamera(left, right, top, bottom, near, far);
const projectionMatrix = camera.projectionMatrix;
```

5.由投影矩阵和视图矩阵的相乘得到投影视图矩阵 pvMatrix

```js
const pvMatrix = new Matrix4().multiplyMatrices(projectionMatrix, viewMatrix);
```

6.最后在顶点着色器里让 pvMatrix 乘以顶点点位即可

```js
attribute vec4 a_Position;
uniform mat4 u_PvMatrix;
void main(){
    gl_Position = u_PvMatrix*a_Position;
}
```

注：若相机对象存在父级，就需要基于相机的世界坐标系做相应运算了。


## 十三、透视投影矩阵

透视投影矩阵可以将现实世界更真实的投射到裁剪空间中。
### 1.基础知识

#### 1.1齐次坐标系

在齐次坐标系中以下等式是成立的：

```js
(x, y, z, 1) = (x, y, z, 1) * k = (kx, ky, kz, k) k≠0
(x, y, z, 1) = (x, y, z, 1) * z = (zx, zy, z², z) z≠0
```

比如：  
(1, 0, 0, 1) 和 (2, 0, 0, 2) 都代表同一个三维点位(1, 0 ,0)

#### 1.2线性补间运算

之前说过点斜式 y = kx + b，它就是线性补间运算的公式。  
除了点斜式，两种数据间的线性映射关系还可以用其它方法来表示。

![](/webgl-share/102.png)

`已知`：

- N 类型的数据极值是[minN,maxN]
- M 类型的数据极值是[minM,maxM]
- x 属于 N
- 将 x 映射到 M 的中的值为 y

则 x,y 的关系可以用两个等式表示：

1. 比例式：

```js
(x - minN) / (maxN - minN) = (y - minM) / (maxM - minM);
```

2. 点斜式

```js
k = (maxM - minM) / (maxN - minN);
b = minM - minN * k;
y = kx + b;
```

通过线性插值的特性：

[minN,maxN] 中的每个点都与 [minM,maxM] 中的唯一点相对应，由一个 x 便可以求出唯一一个 y

### 2.认识透视投影矩阵

透视投影矩阵 perspective projection：将世界坐标系中的一块四棱台形的区域投射到裁剪空间中，不同深度的物体具备近大远小的透视规则。

![](/webgl-share/103.png)

![](/webgl-share/104.png)

透视相机的建立需要以下已知条件：

- fov：摄像机视锥体垂直视野角度
- aspect：摄像机视锥体宽高比(近裁剪面)
- near：摄像机近裁剪面到视点的距离
- far：摄像机远裁剪面到视点的距离

![](/webgl-share/105.png)

`问`：要将一个任意尺寸的正四棱台塞进裁剪空间里，分几步？

`答`：从透视到正交

1. 收缩远裁剪面，将原来的正四棱台变成长方体 
2. 像之前的正交投影矩阵一样，将长方体先位移，再缩放

### 3.计算透视投影矩阵

1. 基于 fov、aspect、n(near)、f(far)计算近裁剪面边界。

![](/webgl-share/104.png)

上下左右四个边界：

```js
t = n * tan(fov/2)
b = -t
r = t * aspect
l = -r
```

2. 设：可视区域中一顶点为 P1(x1, y1, z1)

​`求`：求 P1 在近裁剪面上的投影 P2(x2, y2, z2)

![](/webgl-share/106.png)

由相似三角形性质得：

```js
x1/x2 = y1/y2 =z1/z2
```

`因为`：

```js
z2 = -n
```

`所以`：

```js
x2 = nx1/-z1
y2 = ny1/-z1
```

若把 P1 点的 x1,y1 替换成 x2,y2，就可以理解为把相机可视区域塞进了一个长方体里。

![](/webgl-share/107.png)

3. 把长方体里的顶点塞进裁剪空间中。

![](/webgl-share/108.png)

`设`：P2 映射到裁剪空间中的点为 P3(x3, y3, z3) 点

`则`：P2 点和 P3 点满足以下关系式：

- x 方向

```js
(x3-(-1))/(1-(-1)) = (x2-l)/(r-l)
(x3+1)/2 = (x2-l)/(r-l)
(x3+1) = 2(x2-l)/(r-l)
x3 = 2(x2-l)/(r-l)-1
x3 = 2(x2-l)/(r-l)-(r-l)/(r-l)
x3 = (2(x2-l)-(r-l))/(r-l)
x3 = (2x2-(r+l))/(r-l)
x3 = 2x2/(r-l)-(r+l)/(r-l)
```

`因为`：

```js
x2 = nx1 / -z1;
```

`所以`：

```js
x3 = 2(nx1/-z1)/(r-l)-(r+l)/(r-l)
x3 = (2n/(r-l))x1/-z1-(r+l)/(r-l)
```

- y 方向

```js
(y3-(-1))/(1-(-1)) = (y2-b)/(t-b)
y3 = (2n/(t-b))y1/-z1-(t+b)/(t-b)
```

观察一下当前求出的 x3,y3：

```js
x3 = (2n/(r-l))x1/-z1-(r+l)/(r-l)
y3 = (2n/(t-b))y1/-z1-(t+b)/(t-b)
```

只要让 x3,y3 乘以-z1，便可以得到一个齐次坐标 P4(x4, y4, z4, w4)：

```js
x4 = (2n/(r-l))x1+((r+l)/(r-l))z1
y4 = (2n/(t-b))y1+((t+b)/(t-b))z1
z4 = ?
w4=-z1
```

当前把顶点的 z 分量投射到裁剪空间中的方法，还不知道，所以 z4=?

可以先从已知条件中提取投影矩阵(行主序)的矩阵因子：

```js
[
  2n/(r-l)       0         (r+l)/(r-l)   0,
  0              2n/(t-b)  (t+b)/(t-b)   0,
  ?              ?          ?            ?,
  0              0          -1           0
]
```

接下来，就剩下 z 轴相关的矩阵因子了。

因为整个投影矩阵始终是在做线性变换的，投影点的 z 值与投影矩阵的 z 轴向的 x,y 分量无关。

所以投影矩阵的 z 轴向的 x,y 分量可以写做 0，z 和 w 分量可以设为 k,b，如下：

```js
[
  2n/(r-l)       0         (r+l)/(r-l)   0,
  0              2n/(t-b)  (t+b)/(t-b)   0,
  0              0          k            b
  0              0          -1           0
]
```

之前说了，整个投影矩阵始终是在做线性变换，所以可以用 k,b 组合一个点斜式：

```js
z4 = k*z1+b
```

当然，可以认为是点积的结果：

```js
z4 = (0,0,k,b)·(x1,y1,z1,1)
z4 = k*z1 + b
```

接下来，只要求出上面的 k,b,就可以得到透视投影矩阵。

可以用当前的已知条件，构建一个二元一次方程组，求出 k,b：

![](/webgl-share/105.png)

- 当 z1=-n 时，z3=-1，z4=-1\*-z1 （近裁剪面），即：

```js
z4 = k * z1 + b - 1 * n = k * -n + b - n = -kn + b;
b = kn - n;
```

- 当 z1=-f 时，z3=1，z4=1\*-z1（远裁剪面），即：

```js
z4 = k * z1 + b;
1 * f = k * -f + b;
f = -kf + b;
kf = b - f;
k = (b - f) / f;
```

用消元法求 b：

```js
b = kn-n
b = ((b-f)/f)n-n
b = (b-f)n/f-n
fb = (b-f)n-fn
fb = bn-fn-fn
fb-bn = -2fn
b(f-n) = -2fn
b = -2fn/(f-n)
```

再求 k：

```js
k = (b-f)/f
k = (-2fn/(f-n)-f)/f
k = -2n/(f-n)-1
k = (-2n-f+n)/(f-n)
k = (-f-n)/(f-n)
k = -(f+n)/(f-n)
```

最终的透视投影矩阵如下：

```js
[
  2n/(r-l)       0         (r+l)/(r-l)   0,
  0              2n/(t-b)  (t+b)/(t-b)   0,
  0              0         -(f+n)/(f-n)  -2fn/(f-n),
  0              0         -1            0
]
```

透视投影的建立方法，可以在 three.js 的源码里找到。

### 4.three.js 里的透视投影矩阵

three.js 的 PerspectiveCamera 对象的 updateProjectionMatrix() 方法，便是透视相机建立透视投影矩阵的方法。

```js
updateProjectionMatrix() {
    const near = this.near;
	  //近裁剪面上边界
    let top = near * Math.tan( MathUtils.DEG2RAD * 0.5 * this.fov ) / this.zoom;
    //近裁剪面高度
    let height = 2 * top;
    //近裁剪面宽度
    let width = this.aspect * height;
    //近裁剪面左边界
    let left = - 0.5 * width;
    //默认为null
    const view = this.view;

    //多视图
    if ( this.view !== null && this.view.enabled ) {
        const fullWidth = view.fullWidth,
              fullHeight = view.fullHeight;
        left += view.offsetX * width / fullWidth;
        top -= view.offsetY * height / fullHeight;
        width *= view.width / fullWidth;
        height *= view.height / fullHeight;

    }
    //偏离值，默认0
    const skew = this.filmOffset;
    if ( skew !== 0 ) left += near * skew / this.getFilmWidth();

    //基于近裁剪面边界、近裁剪面和远裁剪面到相机视点的距离设置投影矩阵
    this.projectionMatrix.makePerspective( left, left + width, top, top - height, near, this.far );

    //投影矩阵的逆矩阵
    this.projectionMatrixInverse.copy( this.projectionMatrix ).invert();

}
```

- makePerspective() 是 Matrix4 对象里的方法，会基于投影空间建立透视投影矩阵

```js
makePerspective( left, right, top, bottom, near, far ) {
    const te = this.elements;

    const x = 2 * near / ( right - left );
    const y = 2 * near / ( top - bottom );
    const a = ( right + left ) / ( right - left );
    const b = ( top + bottom ) / ( top - bottom );
    const c = - ( far + near ) / ( far - near );
    const d = - 2 * far * near / ( far - near );

    te[ 0 ] = x;	te[ 4 ] = 0;	te[ 8 ] = a;	te[ 12 ] = 0;
    te[ 1 ] = 0;	te[ 5 ] = y;	te[ 9 ] = b;	te[ 13 ] = 0;
    te[ 2 ] = 0;	te[ 6 ] = 0;	te[ 10 ] = c;	te[ 14 ] = d;
    te[ 3 ] = 0;	te[ 7 ] = 0;	te[ 11 ] = - 1;	te[ 15 ] = 0;

    return this;
}
```

### 5.透视投影矩阵牛刀小试

::: details 代码实现
```html{35-41}
<canvas id="canvas"></canvas>
<script id="vertexShader" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  uniform mat4 u_ProjectionMatrix;
  void main(){
    gl_Position = u_ProjectionMatrix*a_Position;
  }
</script>
<script id="fragmentShader" type="x-shader/x-fragment">
  precision mediump float;
  uniform vec4 u_Color;
  void main(){
    gl_FragColor = u_Color;
  }
</script>
<script type="module">
  import { initShaders } from '../jsm/Utils.js';
  import {
    Matrix4,
    PerspectiveCamera
  } from 'https://unpkg.com/three/build/three.module.js';
  import Poly from './jsm/Poly.js'

  const canvas = document.getElementById('canvas');
  const [viewW, viewH] = [window.innerWidth, window.innerHeight]
  canvas.width = viewW;
  canvas.height = viewH;
  const gl = canvas.getContext('webgl');
  const vsSource = document.getElementById('vertexShader').innerText;
  const fsSource = document.getElementById('fragmentShader').innerText;
  initShaders(gl, vsSource, fsSource);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  //建立透视相机
  const [fov, aspect, near, far] = [
    45,
    canvas.width / canvas.height,
    1,
    20
  ]
  const camera = new PerspectiveCamera(fov, aspect, near, far)

  //投影视图矩阵
  const pvMatrix = new Matrix4()
    .multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    )

  // 前面是两个黄色三角形，后面是两个红色三角形。
  const triangle1 = crtTriangle(
    [1, 0, 0, 1],
    [-0.5, 0, -3]
  )
  const triangle2 = crtTriangle(
    [1, 0, 0, 1],
    [0.5, 0, -3]
  )

  const triangle3 = crtTriangle(
    [1, 1, 0, 1],
    [-0.5, 0, -2]
  )

  const triangle4 = crtTriangle(
    [1, 1, 0, 1],
    [0.5, 0, -2]
  )

  render()

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    triangle1.init()
    triangle1.draw()
    triangle2.init()
    triangle2.draw()
    triangle3.init()
    triangle3.draw()
    triangle4.init()
    triangle4.draw()
  }

  function crtTriangle(color, [x, y, z]) {
    return new Poly({
      gl,
      source: [
        x, 0.3 + y, z,
        - 0.3 + x, -0.3 + y, z,
        0.3 + x, -0.3 + y, z
      ],
      type: 'TRIANGLES',
      attributes: {
        a_Position: {
          size: 3,
          index: 0
        },
      },
      uniforms: {
        u_Color: {
          type: 'uniform4fv',
          value: color
        },
        u_ProjectionMatrix: {
          type: 'uniformMatrix4fv',
          value: camera.projectionMatrix.elements
        },
      }
    })
  }
</script>
```
效果：  
![](/webgl-share/109.png)
:::


## 十四、投影矩阵、视图矩阵和模型矩阵共冶一炉

投影矩阵、视图矩阵、模型矩阵的结合方式：  
**最终的顶点坐标 = 投影矩阵 * 视图矩阵 * 模型矩阵 * 初始顶点坐标**

**`投影矩阵`**：
  - 正交投影矩阵：将世界坐标系中的一块矩形区域(正交相机的可视区域)投射到裁剪空间中，不同深度物体不具备近大远小的透视规则  `正交投影矩阵 = 缩放矩阵*位移矩阵`
  - 透视投影矩阵：将世界坐标系中的一块四棱台形的区域投射到裁剪空间中，不同深度的物体具备近大远小的透视规则

**`视图矩阵`**：相机位移矩阵乘以旋转矩阵后的逆矩阵，即相机的世界矩阵的逆矩阵
  - 位移矩阵：由视点位置得出
  - 旋转矩阵：由视点、目标点、上方向得出

**`投影视图矩阵`**：投影矩阵乘以视图矩阵

**`模型矩阵`**：模型矩阵可以对物体进行位移、旋转、缩放变换，比如让物体沿 z 旋转

### 1.投影视图矩阵

1.在顶点着色器里把投影矩阵变成投影视图矩阵。

```html
<script id="vertexShader" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  uniform mat4 u_PvMatrix;
  void main(){
    gl_Position = u_PvMatrix*a_Position;
  }
</script>
```

2.设置相机位置，并让其看向一点

```js
const eye = new Vector3(0, 1, 1);
const target = new Vector3(0, 0, -2.5);
const up = new Vector3(0, 1, 0);

const [fov, aspect, near, far] = [45, canvas.width / canvas.height, 1, 20];

const camera = new PerspectiveCamera(fov, aspect, near, far);
camera.position.copy(eye);
camera.lookAt(target);
camera.updateWorldMatrix(true);
```

3.计算投影视图矩阵，即让相机的投影矩阵乘以视图矩阵

```js
const pvMatrix = new Matrix4();
pvMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
```

4.修改一下建立三角形方法里的 uniform 变量

```js
u_PvMatrix: {
    type: 'uniformMatrix4fv',
    value: pvMatrix.elements
},
```

效果如下：  
![](/webgl-share/110.png)

接下来，再把模型矩阵加进去。

### 2.投影视图矩阵乘以模型矩阵

之前设置三角形位置的时候，是直接对顶点的原始数据进行的修改。

```js
source: [
    x, 0.3 + y, z,
    -0.3 + x, -0.3 + y, z,
    0.3 + x, -0.3 + y, z,
],
```

其实，可以将位移数据写进模型矩阵里的，当然旋转和缩放数据也可以写进去，然后用模型矩阵乘以原始顶点，从而实现对模型的变换。

1.顶点着色器

```js
attribute vec4 a_Position;
uniform mat4 u_PvMatrix;
uniform mat4 u_ModelMatrix;
void main(){
    gl_Position = u_PvMatrix*u_ModelMatrix*a_Position;
}
```

2.在 crtTriangle()方法里，把三角形的数据源写死，在 uniforms 里添加一个模型矩阵。

```js
function crtTriangle(color, modelMatrix) {
  return new Poly({
    gl,
    modelMatrix,
    source: [0, 0.3, 0, -0.3, -0.3, 0, 0.3, -0.3, 0],
    type: "TRIANGLES",
    attributes: {
      a_Position: {
        size: 3,
        index: 0,
      },
    },
    uniforms: {
      u_Color: {
        type: "uniform4fv",
        value: color,
      },
      u_PvMatrix: {
        type: "uniformMatrix4fv",
        value: pvMatrix.elements,
      },
      u_ModelMatrix: {
        type: "uniformMatrix4fv",
        value: modelMatrix,
      },
    },
  });
}
```

2.建立四个三角形

```js
const triangle1 = crtTriangle(
    [1, 0, 0, 1],
    [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        -0.5, 0, -3, 1,
    ]
)

const triangle2 = crtTriangle(
    [1, 0, 0, 1],
    [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0.5, 0, -3, 1,
    ]
)

const triangle3 = crtTriangle(
    [1, 1, 0, 1],
    [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        -0.5, 0, -2, 1,
    ]
)

const triangle4 = crtTriangle(
    [1, 1, 0, 1],
    [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0.5, 0, -2, 1,
    ]
)
```

效果如下：  
![](/webgl-share/111.png)


## 十五、正交相机轨道控制器

相机轨道控制器可以变换相机，从而灵活观察物体。  
three.js 中的相机轨道控制器是通过以下事件变换相机的：（[orbitControls](https://threejs.org/examples/?q=orbi#misc_controls_orbit)）

1. 旋转
- 鼠标左键拖拽
- 单手指移动

2. 缩放
- 鼠标滚轮滚动
- 两个手指展开或挤压

3. 平移
- 鼠标右键拖拽
- 鼠标左键+ctrl/meta/shiftKey 拖拽
- 箭头键
- 两个手指移动

### 1.正交相机的位移轨道

::: details 代码实现
```html{27,130,173}
<canvas id="canvas"></canvas>
<script id="vertexShader" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  uniform mat4 u_PvMatrix;
  uniform mat4 u_ModelMatrix;
  void main(){
    gl_Position = u_PvMatrix * u_ModelMatrix * a_Position;
  }
</script>
<script id="fragmentShader" type="x-shader/x-fragment">
  precision mediump float;
  uniform vec4 u_Color;
  void main(){
    gl_FragColor = u_Color;
  }
</script>
<script type="module">
  import {
    Matrix4,
    Vector2,
    Vector3,
    OrthographicCamera
  } from 'https://unpkg.com/three/build/three.module.js';
  import { initShaders } from '../jsm/Utils.js';
  import Poly from './jsm/Poly.js';

  /* 搭建场景 */
  // 1.初始化着色器 
  const canvas = document.getElementById('canvas');
  const [viewW, viewH] = [window.innerWidth, window.innerHeight];
  canvas.width = viewW;
  canvas.height = viewH;
  const gl = canvas.getContext('webgl');
  const vsSource = document.getElementById('vertexShader').innerText;
  const fsSource = document.getElementById('fragmentShader').innerText;
  initShaders(gl, vsSource, fsSource);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // 2.正交相机
  const halfH = 2;
  const ratio = canvas.width / canvas.height;
  const halfW = halfH * ratio;
  const [left, right, top, bottom, near, far] = [
    -halfW, halfW, halfH, -halfH, 1, 8
  ];
  const eye = new Vector3(1, 1, 2);
  const target = new Vector3(0, 0, -3);
  const up = new Vector3(0, 1, 0);

  const camera = new OrthographicCamera(
    left, right, top, bottom, near, far
  );
  camera.position.copy(eye);
  camera.lookAt(target);
  camera.updateMatrixWorld();
  const pvMatrix = new Matrix4();
  pvMatrix.multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse,
  );
  // 3.创建 4 个三角形
  const triangle1 = crtTriangle(
    [1, 0, 0, 1],
    [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      -0.5, 0, -3, 1,
    ]
  );
  const triangle2 = crtTriangle(
    [1, 0, 0, 1],
    new Matrix4().setPosition(0.5, 0, -3).elements
  );

  const triangle3 = crtTriangle(
    [1, 1, 0, 1],
    new Matrix4().setPosition(-0.5, 0, -2).elements
  );

  const triangle4 = crtTriangle(
    [1, 1, 0, 1],
    new Matrix4().setPosition(0.5, 0, -2).elements
  );

  render();
  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    triangle1.init()
    triangle1.draw()
    triangle2.init()
    triangle2.draw()
    triangle3.init()
    triangle3.draw()
    triangle4.init()
    triangle4.draw()
  };
  function crtTriangle(color, modelMatrix) {
    return new Poly({
      gl,
      source: [
        0, 0.3, 0,
        -0.3, -0.3, 0,
        0.3, -0.3, 0,
      ],
      type: 'TRIANGLES',
      attributes: {
        a_Position: {
          size: 3,
          index: 0
        },
      },
      uniforms: {
        u_Color: {
          type: 'uniform4fv',
          value: color
        },
        u_PvMatrix: {
          type: 'uniformMatrix4fv',
          value: pvMatrix.elements
        },
        u_ModelMatrix: {
          type: 'uniformMatrix4fv',
          value: modelMatrix
        }
      }
    })
  };


  /* 声明基础数据 */
  // 1.鼠标事件集合
  const mouseButtons = new Map([
    [2, 'pan']
  ]);
  //鼠标右键按下时的event.button值为2
  //pan：平移
  // 2.轨道控制器状态，表示控制器正在对相机进行哪种变换。
  // 比如 state 等于 pan 时，代表位移
  let state = 'none';
  // 3.鼠标在屏幕上拖拽时的起始位和结束位，以像素为单位
  const [dragStart, dragEnd] = [new Vector2(), new Vector2()];
  // 4.鼠标每次移动时的位移量，webgl 坐标量
  const panOffset = new Vector3();
  // 5.鼠标在屏幕上垂直拖拽时，是基于相机本地坐标系的 y 方向还是 z 方向移动相机
  const screenSpacePanning = true;
  //true：y向移动
  //false：z向移动

  /* 在canvas上绑定鼠标事件 */
  // 1.取消右击菜单的显示
  canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });
  // 2.指针按下时，设置拖拽起始位，获取轨道控制器状态
  canvas.addEventListener('pointerdown', ({clientX, clientY, button}) => {
    dragStart.set(clientX, clientY);
    state = mouseButtons.get(button);
  });
  //注：指针事件支持多种方式的指针顶点输入，如鼠标、触控笔、触摸屏等。
  // 3.指针移动时，若控制器处于平移状态，平移相机
  canvas.addEventListener('pointermove', (event) => {
    switch (state) {
      case 'pan':
        handleMouseMovePan(event);
        break
    }
  });
  // 4.指针抬起时，清除控制器状态
  canvas.addEventListener('pointerup', (event) => {
    state = 'none';
  });


  /* 相机平移方法 */
  function handleMouseMovePan({ clientX, clientY }) {
    //指针拖拽的结束位(像素单位)
    dragEnd.set(clientX, clientY);
    //基于拖拽距离(像素单位)移动相机
    pan(dragEnd.clone().sub(dragStart));
    //重置拖拽起始位
    dragStart.copy(dragEnd);
  }
  // 平移方法
  function pan({ x, y }) {
    const { right, left, top, bottom, matrix, position, up } = camera;
    const { clientWidth, clientHeight } = canvas;
    //相机近裁剪面尺寸
    const cameraW = right - left;
    const cameraH = top - bottom;
    //指针拖拽量在画布中的比值
    const ratioX = x / clientWidth;
    const ratioY = y / clientHeight;
    //将像素单位的位移量转换为相机近裁剪面上的位移量
    const distanceLeft = ratioX * cameraW;
    const distanceUp = ratioY * cameraH;
    //相机本地坐标系里的x轴(第一列)
    const mx = new Vector3().setFromMatrixColumn(matrix, 0);
    //相机x轴平移量(取反 => 往右拖拽场景，相机往左移动)
    const vx = mx.clone().multiplyScalar(-distanceLeft);
    //相机z|y轴平移量
    const vy = new Vector3();
    if (screenSpacePanning) {
      //y向(第二列)
      vy.setFromMatrixColumn(matrix, 1);
    } else {
      //-z向
      vy.crossVectors(up, mx);
    }
    //相机y向或-z向的平移量
    vy.multiplyScalar(distanceUp);
    //整合平移量
    panOffset.copy(vx.add(vy));
    //更新
    update();
  }

  // 基于平移量，位移相机，更新投影视图矩阵
  function update() {
    target.add(panOffset);
    camera.position.add(panOffset);
    camera.lookAt(target);
    camera.updateMatrixWorld(true);
    pvMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse,
    );
    render();
  }
</script>
```
效果：  
![](/webgl-share/112.gif)

基于拖拽距离(像素单位)移动相机：  
![](/webgl-share/113.png)
::: 


### 2.正交相机的缩放轨道

#### 2.1正交相机的缩放原理

相机的缩放就是让我们在裁剪空间中看到的同一深度上的东西更多或者更少。

通常很容易结合实际生活来考虑，比如我们正对着一面墙壁，墙壁上铺满瓷砖。  
当把镜头拉近时，看到的瓷砖数量就变少了，每块瓷砖的尺寸也变大了；  
反之，当我们把镜头拉远时，看到的瓷砖数量就变多了，每块瓷砖的尺寸也变小了。  
然而这种方式只适用于透视相机，并不适用于正交相机，因为正交相机不具备近大远小规则。  

正交相机的缩放，是直接缩放的投影面，这个投影面在 three.js 里就是近裁剪面。  
当投影面变大了，那么能投影的顶点数量也就变多了；  
反之，当投影面变小了，那么能投影的顶点数量也就变少了。  
![](/webgl-share/97.png)

#### 2.2正交相机缩放方法

在 three.js 里的正交相机对象 OrthographicCamera 的 updateProjectionMatrix() 方法里可以找到正交相机的缩放方法。

```js
updateProjectionMatrix: function () {
    const dx = ( this.right - this.left ) / ( 2 * this.zoom );
    const dy = ( this.top - this.bottom ) / ( 2 * this.zoom );
    const cx = ( this.right + this.left ) / 2;
    const cy = ( this.top + this.bottom ) / 2;

    let left = cx - dx;
    let right = cx + dx;
    let top = cy + dy;
    let bottom = cy - dy;
    ……
}
```

可以将上面的 dx、dy 分解一下：

- 近裁剪面宽度的一半 width：( this.right - this.left ) / 2
- 近裁剪面高度的一半 height：( this.top - this.bottom ) / 2
- dx=width/zoom
- dy=height/zoom

在 three.js 里，zoom 的默认值是 1，即不做缩放。

由上可以得到正交相机缩放的性质：

- zoom 值和近裁剪面的尺寸成反比
- 近裁剪面的尺寸和我们在同一深度所看物体的数量成正比
- 近裁剪面的尺寸和我们所看的同一物体的尺寸成反比

#### 2.4正交相机缩放轨道的实现

::: details 代码实现
```html{99,121,135}
<canvas id="canvas"></canvas>
<script id="vertexShader" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  uniform mat4 u_PvMatrix;
  uniform mat4 u_ModelMatrix;
  void main(){
    gl_Position = u_PvMatrix * u_ModelMatrix * a_Position;
  }
</script>
<script id="fragmentShader" type="x-shader/x-fragment">
  precision mediump float;
  uniform vec4 u_Color;
  void main(){
    gl_FragColor = u_Color;
  }
</script>
<script type="module">
  import {
    Matrix4, 
    Vector2, 
    Vector3,
    OrthographicCamera
  } from 'https://unpkg.com/three/build/three.module.js';
  import { initShaders } from '../jsm/Utils.js';
  import Poly from './jsm/Poly.js';

  const canvas = document.getElementById('canvas');
  const [viewW, viewH] = [window.innerWidth, window.innerHeight]
  canvas.width = viewW;
  canvas.height = viewH;
  const gl = canvas.getContext('webgl');
  const vsSource = document.getElementById('vertexShader').innerText;
  const fsSource = document.getElementById('fragmentShader').innerText;
  initShaders(gl, vsSource, fsSource);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  const halfH = 2
  const ratio = canvas.width / canvas.height
  const halfW = halfH * ratio
  const [left, right, top, bottom, near, far] = [
    -halfW, halfW, halfH, -halfH, 1, 8
  ]
  const eye = new Vector3(1, 1, 2)
  const target = new Vector3(0, 0, -3)
  const up = new Vector3(0, 1, 0)

  const camera = new OrthographicCamera(
    left, right, top, bottom, near, far
  )
  camera.position.copy(eye)
  camera.lookAt(target)
  camera.updateMatrixWorld()
  const pvMatrix = new Matrix4()
  pvMatrix.multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse,
  )

  const triangle1 = crtTriangle(
    [1, 0, 0, 1],
    [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      -0.5, 0, -3, 1,
    ]
  )
  const triangle2 = crtTriangle(
    [1, 0, 0, 1],
    new Matrix4().setPosition(0.5, 0, -3).elements
  )

  const triangle3 = crtTriangle(
    [1, 1, 0, 1],
    new Matrix4().setPosition(-0.5, 0, -2).elements
  )

  const triangle4 = crtTriangle(
    [1, 1, 0, 1],
    new Matrix4().setPosition(0.5, 0, -2).elements
  )


  /* 声明基础数据 */
  const mouseButtons = new Map([
    [2, 'pan']
  ])
  let state = 'none'
  const [dragStart, dragEnd] = [
    new Vector2(),
    new Vector2(),
  ]

  /* 平移轨道 */
  const panOffset = new Vector3()
  const screenSpacePanning = true

  /* 缩放轨道 */
  // 1.定义滚轮在每次滚动时的缩放系数
  const zoomScale = 0.95

  //在canvas上绑定鼠标事件
  canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault()
  })
  canvas.addEventListener('pointerdown', ({ clientX, clientY, button }) => {
    dragStart.set(clientX, clientY)
    state = mouseButtons.get(button)
  })
  canvas.addEventListener('pointermove', (event) => {
    switch (state) {
      case 'pan':
        handleMouseMovePan(event)
        break
    }
  })
  canvas.addEventListener('pointerup', (event) => {
    state = 'none'
  })

  // 2.为 canvas 添加滚轮事件
  canvas.addEventListener('wheel', handleMouseWheel)
  function handleMouseWheel({ deltaY }) {
    console.log('deltaY', deltaY);
    if (deltaY < 0) {
      dolly(1 / zoomScale)
    } else {
      dolly(zoomScale)
    }
    update()
  }
  // 当 deltaY < 0 时，是向上滑动滚轮，会缩小裁剪面；
  // 当 deltaY > 0 时，是向下滑动滚轮，会放大裁剪面。

  // 3.通过 dolly()方法缩放相机
  function dolly(dollyScale) {
    camera.zoom *= dollyScale
    camera.updateProjectionMatrix()
  }


  function handleMouseMovePan({ clientX, clientY }) {
    dragEnd.set(clientX, clientY)
    pan(dragEnd.clone().sub(dragStart))
    dragStart.copy(dragEnd)
  }

  //平移方法
  function pan({ x, y }) {
    const { right, left, top, bottom, matrix, position, up } = camera
    const { clientWidth, clientHeight } = canvas
    const cameraW = right - left
    const cameraH = top - bottom
    const ratioX = x / clientWidth
    const ratioY = y / clientHeight
    const distanceLeft = ratioX * cameraW
    const distanceUp = ratioY * cameraH
    const mx = new Vector3().setFromMatrixColumn(matrix, 0)
    const vx = mx.clone().multiplyScalar(-distanceLeft)
    const vy = new Vector3()
    if (screenSpacePanning) {
      vy.setFromMatrixColumn(matrix, 1)
    } else {
      vy.crossVectors(up, mx)
    }
    vy.multiplyScalar(distanceUp)
    panOffset.copy(vx.add(vy))
    update()
  }

  function update() {
    target.add(panOffset)
    camera.position.add(panOffset)
    camera.lookAt(target)
    camera.updateMatrixWorld(true)
    pvMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse,
    )
    render()
  }

  render()

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    triangle1.init()
    triangle1.draw()
    triangle2.init()
    triangle2.draw()
    triangle3.init()
    triangle3.draw()
    triangle4.init()
    triangle4.draw()
  }

  function crtTriangle(color, modelMatrix) {
    return new Poly({
      gl,
      source: [
        0, 0.3, 0,
        -0.3, -0.3, 0,
        0.3, -0.3, 0,
      ],
      type: 'TRIANGLES',
      attributes: {
        a_Position: {
          size: 3,
          index: 0
        },
      },
      uniforms: {
        u_Color: {
          type: 'uniform4fv',
          value: color
        },
        u_PvMatrix: {
          type: 'uniformMatrix4fv',
          value: pvMatrix.elements
        },
        u_ModelMatrix: {
          type: 'uniformMatrix4fv',
          value: modelMatrix
        }
      }
    })
  }
</script>
```
效果：  
![](/webgl-share/116.gif)
:::

### 3.正交相机的旋转轨道

#### 3.1正交相机的旋转轨道的概念

相机的旋转轨道的实现原理就是让相机绕物体旋转。  
相机旋转轨迹的集合是一个球体。  
相机旋转轨道的实现方式是有许多种的，至于具体用哪种，还要看具体的项目需求。  

**基于球坐标系旋转的相机旋转轨道**:

![](/webgl-share/114.png)

`已知`：

- 三维坐标系[O;x,y,z]
- 正交相机
  - 视点位：点 P
  - 目标位：点 O
- 正交相机旋转轨的旋转轴是 y 轴

`则`：

正交相机在球坐标系中的旋转轨道有两种：

- 点 P 绕旋转轴 y 轴的旋转轨道，即上图的蓝色轨道。
- 点 P 在平面 OPy 中的旋转轨道，即上图的绿色轨迹。

接下来，结合正交相机的实际情况，如何计算正交相机旋转后的视点位。

#### 3.2正交相机旋转后的视点位

![](/webgl-share/114.png)

`已知`：

- 三维坐标系[O;x,y,z]
- 正交相机
  - 视点位：三维坐标点 P(x,y,z)
  - 目标位：点 O
- 正交相机旋转轨的旋转轴是 y 轴

`求`：相机在平面 OPy 中旋转 a 度，绕 y 轴旋转 b 度后，相机视点的三维空间位 P'(x',y',z')

`解`：

1. 将点 P(x,y,z)的三维坐标位换算为球坐标位，即 P(r,φ,θ)
2. 计算点 P 在平面 OPy 中旋转 a 度，绕 y 轴旋转 b 度后的球坐标位，即 P(r,φ+a,θ+b)
3. 将点 P 的球坐标位转换为三维坐标位

求解的思路就这么简单，那具体怎么实现呢？先把上面的球坐标解释一下。

#### 3.3球坐标系

Ⅰ 球坐标系的概念

![](/webgl-share/114.png)

球坐标系（spherical coordinate system）是用球坐标表示空间点位的坐标系。

球坐标由以下分量构成：

- 半径(radial distance) r：OP 长度( 0 ≤ r ) 。
- 极角(polar angle) φ：OP 与 y 轴的夹角(0 ≤ φ ≤ π)
- 方位角(azimuth angle) θ：OP 在平面 Oxz 上的投影与正 x 轴的夹角( 0 ≤ θ < 2π )。

`注`：

- 球坐标系可视极坐标系的三维推广。
- 当 r=0 时，φ 和 θ 无意义。
- 当 φ =0 或 φ =π 时，θ 无意义。

Ⅱ 三维坐标转球坐标

![](/webgl-share/114.png)

`已知`：点 P 的三维坐标位(x,y,z)

`求`：点 P 的球坐标位(r,φ,θ)

`解`：

求半径 r：

```js
r = sqrt(x² + y² + z²)
```

求极角 φ 的方法有三种：

```js
φ = acos(y/r)
φ = asin(sqrt(x² + z²)/r)
φ = atan(sqrt(x² + z²)/y)
```

求方位角 θ 的方法有三种：

```js
θ = acos(x/(r*sinφ))
θ = asin(z/(r*sinφ))
θ = atan(z/x)
```

`注`：

在用反正切求角度时，需要注意点问题。

atan()返回的值域是[-PI/2,PI/2]，这是个半圆，这会导致其返回的弧度失真。

如：

```js
atan(z/x) == atan(-z/-x)
atan(-z/x) == atan(z/-x)
```

所以，在 js 里用反正切计算弧度时，要使用 atan2() 方法，即：

```js
φ = Math.atan2(sqrt(x²+z²),y)
θ = Math.atan2(z,x)
```

atan2()返回的值域是[-PI,PI]，这是一个整圆。

atan2()方法是将 z,x 分开写入的，其保留了其最原始的正负符号，所以其返回的弧度不会失真。

Ⅲ 球坐标转三维坐标

`已知`：点 P 的球坐标位(r,φ,θ)

`求`：点 P 的三维坐标位(x,y,z)

`解`：

```js
x = r * sinφ * cosθ;
y = r * cosφ;
z = r * sinφ * sinθ;
```

#### 3.4正交相机旋转轨道的代码实现

::: details 代码实现
```html{94,110,134,184,197,212}
<canvas id="canvas"></canvas>
<!-- 顶点着色器 -->
<script id="vertexShader" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  uniform mat4 u_PvMatrix;
  uniform mat4 u_ModelMatrix;
  void main(){
    gl_Position = u_PvMatrix*u_ModelMatrix*a_Position;
  }
</script>
<script id="fragmentShader" type="x-shader/x-fragment">
  precision mediump float;
  uniform vec4 u_Color;
  void main(){
    gl_FragColor=u_Color;
  }
</script>
<script type="module">
  import {
    Matrix4,
    Vector2,
    Vector3,
    OrthographicCamera,
    Spherical
  } from 'https://unpkg.com/three/build/three.module.js';
  import { initShaders } from '../jsm/Utils.js';
  import Poly from './jsm/Poly.js'

  const canvas = document.getElementById('canvas');
  const [viewW, viewH] = [window.innerWidth, window.innerHeight]
  canvas.width = viewW;
  canvas.height = viewH;
  const gl = canvas.getContext('webgl');
  const vsSource = document.getElementById('vertexShader').innerText;
  const fsSource = document.getElementById('fragmentShader').innerText;
  initShaders(gl, vsSource, fsSource);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  const halfH = 2
  const ratio = canvas.width / canvas.height
  const halfW = halfH * ratio
  const [left, right, top, bottom, near, far] = [
    -halfW, halfW, halfH, -halfH, 1, 8
  ]
  const eye = new Vector3(1, 1, 2)
  const target = new Vector3(0, 0, -3)
  const up = new Vector3(0, 1, 0)

  const camera = new OrthographicCamera(
    left, right, top, bottom, near, far
  )
  camera.position.copy(eye)
  camera.lookAt(target)
  camera.updateMatrixWorld()
  const pvMatrix = new Matrix4()
  pvMatrix.multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse,
  )

  const triangle1 = crtTriangle(
    [1, 0, 0, 1],
    [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      -0.5, 0, -3, 1,
    ]
  )
  const triangle2 = crtTriangle(
    [1, 0, 0, 1],
    new Matrix4().setPosition(0.5, 0, -3).elements
  )

  const triangle3 = crtTriangle(
    [1, 1, 0, 1],
    new Matrix4().setPosition(-0.5, 0, -2).elements
  )

  const triangle4 = crtTriangle(
    [1, 1, 0, 1],
    new Matrix4().setPosition(0.5, 0, -2).elements
  )


  /* 声明基础数据 */
  //鼠标事件集合
  const mouseButtons = new Map([
    [0, 'rotate'],
    [2, 'pan'],
  ])
  //轨道状态
  let state = 'none'
  //2PI
  const pi2 = Math.PI * 2
  //鼠标拖拽的起始位和结束位，无论是左键按下还是右键按下
  const [dragStart, dragEnd] = [new Vector2(),new Vector2()]

  /* 平移轨道 */
  //平移量
  const panOffset = new Vector3()
  //是否沿相机y轴平移相机
  const screenSpacePanning = true

  /* 缩放轨道 */
  //滚轮在每次滚动时的缩放系数
  const zoomScale = 0.95

  /* 旋转轨道 */
  // 相机视点相对于目标的球坐标
  const spherical = new Spherical()
    .setFromVector3(
      camera.position.clone().sub(target)
    )

  /* 取消右击菜单的显示 */
  canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault()
  })

  /* 指针按下时，设置拖拽起始位，获取轨道控制器状态。 */
  canvas.addEventListener('pointerdown', ({ clientX, clientY, button }) => {
    dragStart.set(clientX, clientY)
    state = mouseButtons.get(button)
  })

  /* 指针移动时，若控制器处于平移状态，平移相机；若控制器处于旋转状态，旋转相机。 */
  canvas.addEventListener('pointermove', ({ clientX, clientY }) => {
    dragEnd.set(clientX, clientY)
    switch (state) {
      case 'pan':
        pan(dragEnd.clone().sub(dragStart))
        break
      case 'rotate':
        rotate(dragEnd.clone().sub(dragStart))
        break
    }
    dragStart.copy(dragEnd)
  })
  canvas.addEventListener('pointerup', (event) => {
    state = 'none'
  })

  //滚轮事件
  canvas.addEventListener('wheel', handleMouseWheel)
  function handleMouseWheel({ deltaY }) {
    console.log('deltaY', deltaY);
    if (deltaY < 0) {
      dolly(1 / zoomScale)
    } else {
      dolly(zoomScale)
    }
    update()
  }

  function dolly(dollyScale) {
    camera.zoom *= dollyScale
    camera.updateProjectionMatrix()
  }

  //平移方法
  function pan({ x, y }) {
    const { right, left, top, bottom, matrix, position, up } = camera
    const { clientWidth, clientHeight } = canvas
    const cameraW = right - left
    const cameraH = top - bottom
    const ratioX = x / clientWidth
    const ratioY = y / clientHeight
    const distanceLeft = ratioX * cameraW
    const distanceUp = ratioY * cameraH
    const mx = new Vector3().setFromMatrixColumn(matrix, 0)
    const vx = mx.clone().multiplyScalar(-distanceLeft)
    const vy = new Vector3()
    if (screenSpacePanning) {
      vy.setFromMatrixColumn(matrix, 1)
    } else {
      vy.crossVectors(up, mx)
    }
    vy.multiplyScalar(distanceUp)
    panOffset.copy(vx.add(vy))
    update()
  }

  // 旋转方法
  function rotate({ x, y }) {
    const { clientHeight } = canvas
    spherical.theta -= pi2 * x / clientHeight // yes, height
    spherical.phi -= pi2 * y / clientHeight
    update()
  }

  function update() {
    //基于平移量平移相机
    target.add(panOffset)
    camera.position.add(panOffset)

    //基于旋转量旋转相机
    const rotateOffset = new Vector3()
      .setFromSpherical(spherical)
    camera.position.copy(
      target.clone().add(rotateOffset)
    )

    //更新投影视图矩阵
    camera.lookAt(target)
    camera.updateMatrixWorld(true)
    pvMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse,
    )

    //重置旋转量和平移量
    spherical.setFromVector3(
      camera.position.clone().sub(target)
    )
    panOffset.set(0, 0, 0)

    // 渲染
    render()
  }

  render()

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    triangle1.init()
    triangle1.draw()
    triangle2.init()
    triangle2.draw()
    triangle3.init()
    triangle3.draw()
    triangle4.init()
    triangle4.draw()
  }

  function crtTriangle(color, modelMatrix) {
    return new Poly({
      gl,
      source: [
        0, 0.3, 0,
        -0.3, -0.3, 0,
        0.3, -0.3, 0,
      ],
      type: 'TRIANGLES',
      attributes: {
        a_Position: {
          size: 3,
          index: 0
        },
      },
      uniforms: {
        u_Color: {
          type: 'uniform4fv',
          value: color
        },
        u_PvMatrix: {
          type: 'uniformMatrix4fv',
          value: pvMatrix.elements
        },
        u_ModelMatrix: {
          type: 'uniformMatrix4fv',
          value: modelMatrix
        }
      }
    })
  }
</script>
```
效果：  
![](/webgl-share/117.gif)
:::

#### 3.5限制旋转轴

在 three.js 的轨道控制器里，无法限制旋转轴，比如只想横向旋转相机，或者竖向旋转相机。

1. 声明一个控制旋转方向的属性

```js
const rotateDir = "xy";
```

- x：可以在 x 方向旋转相机
- y：可以在 y 方向旋转相机
- xy：可以在 x,y 方向旋转相机

2. 旋转方法，基于 rotateDir 属性约束旋转方向

```js
function rotate({ x, y }) {
  const { clientHeight } = canvas;
  const deltaT = (pi2 * x) / clientHeight;
  const deltaP = (pi2 * y) / clientHeight;
  if (rotateDir.includes("x")) {
    spherical.theta -= deltaT;
  }
  if (rotateDir.includes("y")) {
    spherical.phi -= deltaP;
  }
  update();
}
```

#### 3.6限制极角

之前说球坐标系的时候说过，其极角的定义域是[0,180°]，所以在代码里也要对其做一下限制。  
在 rotate() 方法里做下调整即可。

```js
//旋转
function rotate({ x, y }) {
    const { clientHeight } = canvas;
    const deltaT = (pi2 * x) / clientHeight;
    const deltaP = (pi2 * y) / clientHeight;
    if (rotateDir.includes("x")) {
      spherical.theta -= deltaT;
    }
    if (rotateDir.includes('y')) {
        const phi = spherical.phi - deltaP
        spherical.phi = Math.min(Math.PI,Math.max(0, phi))
    }
    update();
}
```

因为当球坐标里的极角等于 0 或 180 度的时候，方位角会失去意义，所以还不能在代码真的给极角 0 或 180 度，不然方位角会默认归零。  
所以，需要分别给极角里的 0 和 180 度一个近似值。

```js
spherical.phi = Math.min(Math.PI * 0.99999999, Math.max(0.00000001, phi));
```

基于球坐标系的相机旋转轨道我们就说到这，其具体代码可以参考 three.js 里的 OrbitControls 对象的源码。

接下来，再说一个另一种形式的正交相机旋转轨道。

### 4.轨迹球旋转

轨迹球这个名字，来自 three.js 的 TrackballControls 对象，其具体的代码实现便可以在这里找到。

轨迹球不像基于球坐标系的旋转轨道那样具有恒定的上方向。  
轨迹球的上方向是一个垂直于鼠标拖拽方向和视线的轴，相机视点会基于此轴旋转。  
轨迹球的上方向会随鼠标拖拽方向的改变而改变。  

如下图：

![](/webgl-share/115.png)

接下来，说一下具体的代码实现。

在 three.js 中，TrackballControls 和 OrbitControls 对象里的代码，不太像一个人写的。

因为完全可以沿用 OrbitControls 里的一部分代码去写 TrackballControls，比如鼠标在相机世界里的偏移量，而 TrackballControls 完全用一套风格迥异的代码从头写了一遍。

当然，这里并不是说 TrackballControls 不好，其原理和功能的实现方法依旧是很值得学习。

只是在写轨迹球的时候，完全可以基于 TrackballControls 的实现原理，把 OrbitControls 给改一下，这样可以少写许多代码。

1.定义用于沿某个轴旋转相机视点的四元数

```js
const quaternion = new Quaternion();
```

2.把之前的 rotate()旋转方法改一下

```js
function rotate({ x, y }) {
  const { right, left, top, bottom, matrix, position } = camera;
  const { clientWidth, clientHeight } = canvas;

  // 相机宽高
  const cameraW = right - left;
  const cameraH = top - bottom;

  // 鼠标位移距离在画布中的占比
  const ratioX = x / clientWidth;
  const ratioY = -y / clientHeight;

  //基于高度的x位置比-用于旋转量的计算
  const ratioXBaseHeight = x / clientHeight;
  //位移量
  const ratioLen = new Vector2(ratioXBaseHeight, ratioY).length();
  //旋转量
  const angle = ratioLen * pi2;

  // 在相机世界中的位移距离
  const distanceLeft = ratioX * cameraW;
  const distanceUp = ratioY * cameraH;

  // 相机本地坐标系的x,y轴
  const mx = new Vector3().setFromMatrixColumn(camera.matrix, 0);
  const my = new Vector3().setFromMatrixColumn(camera.matrix, 1);

  // 将鼠标在相机世界的x,y轴向的位移量转换为世界坐标位
  const vx = mx.clone().multiplyScalar(distanceLeft);
  const vy = my.clone().multiplyScalar(distanceUp);

  //鼠标在s'j'z中的位移方向-x轴
  const moveDir = vx.clone().add(vy).normalize();

  //目标点到视点的单位向量-z轴
  const eyeDir = camera.position.clone().sub(target).normalize();

  //基于位移方向和视线获取旋转轴-上方向y轴
  const axis = moveDir.clone().cross(eyeDir);

  //基于旋转轴和旋转量建立四元数
  quaternion.setFromAxisAngle(axis, angle);

  update();
}
```

3. 在 update()更新方法中，基于四元数设置相机视点位置，并更新相机上方向

```js
/* 更新相机，并渲染 */
function update() {
    ……

    //旋转视线
    const rotateOffset = camera.position
    .clone()
    .sub(target)
    .applyQuaternion(quaternion)

    //基于最新视线设置相机位置
    camera.position.copy(
        target.clone().add(rotateOffset)
    )
    //旋转相机上方向
    camera.up.applyQuaternion(quaternion)

    ……

    //重置旋转量和平移量
    panOffset.set(0, 0, 0)
    quaternion.setFromRotationMatrix(new Matrix4())

    ……
}
```

修改完相机的视点位和上方后，要记得重置四元数，以避免在拖拽和缩放时，造成相机旋转。

`注`：  
轨迹球的操控难度是要比球坐标系轨道大的，它常常让不熟练其特性的操作者找不到北，所以在实际项目中还是球坐标系轨道用得比较多。


## 十六、透视相机轨道控制器

### 1.透视相机的位移轨道

透视相机的位移轨道和正交相机的位移轨道是相同原理的，都是对相机视点和目标点的平移。

1.建透视交相机

```js
const eye = new Vector3(0, 0.5, 1);
const target = new Vector3(0, 0, -2.5);
const up = new Vector3(0, 1, 0);

const [fov, aspect, near, far] = [45, canvas.width / canvas.height, 1, 20];
const camera = new PerspectiveCamera(fov, aspect, near, far);
camera.position.copy(eye);
camera.lookAt(target);
camera.updateWorldMatrix(true);
```

2.在正交相机的位移轨道的基础上改一下 pan 方法

![](/webgl-share/118.png)

- 将鼠标在画布中的位移量转目标平面位移量

```js
const { matrix, position, up } = camera;
const { clientWidth, clientHeight } = canvas;

//视线长度：相机视点到目标点的距离
const sightLen = position.clone().sub(target).length();
//视椎体垂直夹角的一半(弧度) => (fov/2)*Math.PI/180
const halfFov = (fov * Math.PI) / 360;
//目标平面的高度
const targetHeight = sightLen * Math.tan(halfFov) * 2;
//目标平面与画布的高度比
const ratio = targetHeight / clientHeight;
//画布位移量转目标平面位移量
const distanceLeft = x * ratio;
const distanceUp = y * ratio;
```

注：目标平面是过视点，平行于裁剪面的平面

- 将鼠标在目标平面中的位移量转世界坐标

```js
//相机平移方向
//鼠标水平运动时，按照相机本地坐标的x轴平移相机
const mx = new Vector3().setFromMatrixColumn(matrix, 0);
//鼠标水平运动时，按照相机本地坐标的y轴，或者-z轴平移相机
const myOrz = new Vector3();
if (screenSpacePanning) {
  //y轴，正交相机中默认
  myOrz.setFromMatrixColumn(matrix, 1);
} else {
  //-z轴，透视相机中默认
  myOrz.crossVectors(up, mx);
}

//目标平面位移量转世界坐标
const vx = mx.clone().multiplyScalar(-distanceLeft);
const vy = myOrz.clone().multiplyScalar(distanceUp);
panOffset.copy(vx.add(vy));
```

### 2.透视相机的缩放轨道

透视相机缩放是通过视点按照视线的方向，接近或者远离目标点来实现的。

![](/webgl-share/119.png)

#### 2.1举个例子

`已知`：

- 视点 e=5
- 目标点 t=15
- （视点即将位移的距离）/（位移前，视点与与目标点的距离）= 0.4

求：视点移动 2 次后的位置

`解`：

视点第 1 次移动后的位置：5+(15-5)\*0.4=9  
视点第 2 次移动后的位置：9+(15-9)\*0.4= 11.4  
基本原理就是这样，视点移动 n 此后的位置都可以按照上面的逻辑来计算。  

#### 2.2代码实现

可以直接在正交相机缩放轨道的基础上做一下修改。

```js
function dolly(dollyScale) {
  camera.position.lerp(target, 1 - dollyScale);
}
```

- lerp ( v : Vector3, alpha : Float ) 按比例去两点之间的插值

  其源码如下：

```js
lerp( v, alpha ) {
    this.x += ( v.x - this.x ) * alpha;
    this.y += ( v.y - this.y ) * alpha;
    this.z += ( v.z - this.z ) * alpha;
    return this;
}
```

- dollyScale：（位移之后视点与目标点的距离）/（位移前，视点与与目标点的距离）

- 1-dollyScale：（视点即将位移的距离）/（位移前，视点于与目标点的距离）

正交相机缩放轨道的基本实现原理就是这么简单。

然而，后面还得用球坐标对相机进行旋转，球坐标是已经涵盖了相机视点位的。  
因此，还可以直接把相机视点位写进球坐标里。

#### 2.3球坐标缩放

1.像正交相机的旋转轨道那样，定义球坐标对象。

```js
const spherical = new Spherical().setFromVector3(
  camera.position.clone().sub(target)
);
```

2.修改旋转方法

```js
function dolly(dollyScale) {
  spherical.radius *= dollyScale;
}
```

3.更新方法也和正交相机的旋转轨道一样

```js
function update() {
  //基于平移量平移相机
  target.add(panOffset);
  camera.position.add(panOffset);

  //基于球坐标缩放和旋转相机
  const rotateOffset = new Vector3().setFromSpherical(spherical);
  camera.position.copy(target.clone().add(rotateOffset));

  //更新投影视图矩阵
  camera.lookAt(target);
  camera.updateMatrixWorld(true);
  pvMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);

  //重置球坐标和平移量
  spherical.setFromVector3(camera.position.clone().sub(target));
  panOffset.set(0, 0, 0);

  // 渲染
  render();
}
```

### 3.透视相机的旋转轨道

透视相机的旋转轨道和正交相机的实现原理都是一样的，可以用球坐标系实现，也可以用轨迹球实现。

- 基于球坐标系的旋转轨道，可直接参考正交相机基于球坐标系的旋转轨道来写。

```js
/* 旋转轨道 */
const spherical = new Spherical()
.setFromVector3(
    camera.position.clone().sub(target)
)
//'xy','x','y'
const rotateDir = 'xy'

……

/* 指针移动时，若控制器处于平移状态，平移相机；若控制器处于旋转状态，旋转相机。 */
canvas.addEventListener('pointermove', ({ clientX, clientY }) => {
    dragEnd.set(clientX, clientY)
    switch (state) {
        case 'pan':
            pan(dragEnd.clone().sub(dragStart))
            break
        case 'rotate':
            rotate(dragEnd.clone().sub(dragStart))
            break
    }
    dragStart.copy(dragEnd)
})
……

// 旋转方法
function rotate({ x, y }) {
    const { clientHeight } = canvas
    const deltaT = pi2 * x / clientHeight
    const deltaP = pi2 * y / clientHeight
    if (rotateDir.includes('x')) {
        spherical.theta -= deltaT
    }
    if (rotateDir.includes('y')) {
        const phi = spherical.phi - deltaP
        spherical.phi = Math.min(
            Math.PI * 0.99999999,
            Math.max(0.00000001, phi)
        )
    }
    update()
}

function update() {
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
    pvMatrix.multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse,
    )

    //重置旋转量和平移量
    spherical.setFromVector3(
        camera.position.clone().sub(target)
    )
    panOffset.set(0, 0, 0)

    // 渲染
    render()
}
```

- 对于轨迹球的旋转轨道，基于正交相机轨迹球旋转的代码略作调整即可。

```js
/* 旋转轨道 */
const quaternion = new Quaternion();

function rotate({ x, y }) {
  const { matrix, position, fov } = camera;
  const { clientHeight } = canvas;

  /* 1.基于鼠标拖拽距离计算旋转量 */
  // 鼠标位移距离在画布中的占比
  const ratioY = -y / clientHeight;
  //基于高度的x位置比-用于旋转量的计算
  const ratioBaseHeight = x / clientHeight;
  //位移量
  const ratioLen = new Vector2(ratioBaseHeight, ratioY).length();
  //旋转量
  const angle = ratioLen * pi2;

  /* 2.将鼠标在画布中的位移量转目标平面位移量 */
  //视线长度：相机视点到目标点的距离
  const sightLen = position.clone().sub(target).length();
  //视椎体垂直夹角的一半(弧度)
  const halfFov = (fov * Math.PI) / 360;
  //目标平面的高度
  const targetHeight = sightLen * Math.tan(halfFov) * 2;
  //目标平面与画布的高度比
  const ratio = targetHeight / clientHeight;
  //画布位移量转目标平面位移量
  const distanceLeft = x * ratio;
  const distanceUp = -y * ratio;

  /* 3.将鼠标在目标平面中的位移量转世界坐标，并从中提取鼠标在世界坐标系中的位移方向 */
  // 相机本地坐标系的x,y轴
  const mx = new Vector3().setFromMatrixColumn(matrix, 0);
  const my = new Vector3().setFromMatrixColumn(matrix, 1);
  // 将鼠标在相机世界的x,y轴向的位移量转换为世界坐标位
  const vx = mx.clone().multiplyScalar(distanceLeft);
  const vy = my.clone().multiplyScalar(distanceUp);
  //鼠标在世界坐标系中的位移方向-x轴
  const moveDir = vx.clone().add(vy).normalize();

  /* 4.基于位移方向和视线获取旋转轴 */
  //目标点到视点的单位向量-z轴
  const eyeDir = position.clone().sub(target).normalize();
  //基于位移方向和视线获取旋转轴-上方向y轴
  const axis = moveDir.clone().cross(eyeDir);

  /* 5.基于旋转轴和旋转量更新四元数 */
  quaternion.setFromAxisAngle(axis, angle);

  update();
}

function update() {
  //基于平移量平移相机
  target.add(panOffset);
  camera.position.add(panOffset);

  //基于旋转量旋转相机
  const rotateOffset = camera.position
    .clone()
    .sub(target)
    .applyQuaternion(quaternion);

  camera.position.copy(target.clone().add(rotateOffset));
  camera.up.applyQuaternion(quaternion);

  //更新投影视图矩阵
  camera.lookAt(target);
  camera.updateMatrixWorld(true);
  pvMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);

  //重置旋转量和平移量
  quaternion.setFromRotationMatrix(new Matrix4());
  panOffset.set(0, 0, 0);

  // 渲染
  render();
}
```


## 十七、封装相机轨道对象

参考 three.js 里的 OrbitControls 对象，封装一个轨道控制器出来。  
至于轨迹球的封装，可以参考着 TrackballControls 来实现。

**`正交相机轨道和透视相机轨道差异对比`**：

1. 旋转轨道
  - 正交相机和透视相机的旋转轨道都是一样的，都是使用球坐标，让相机视点围绕目标点做的旋转。
2. 位移轨道
  - 正交相机的位移轨道是鼠标从 canvas 画布到近裁剪面，再到世界坐标系的位移量的转换，最后这个位移量会同时作用于相机的目标点和视点。
  - 透视相机的位移轨道是鼠标从 canvas 画布到目标平面，再到世界坐标系的位移量的转换，最后这个位移量会同时作用于相机的目标点和视点。
3. 缩放轨道
  - 正交相机的缩放轨道是通过对其可视区域的宽高尺寸的缩放实现的。
  - 透视相机的缩放轨道是通过相机视点在视线上的位移实现的。

### 1.轨道控制器的封装

::: details 代码实现
```js
import {
  Matrix4,
  Vector2,
  Vector3,
  Spherical,
} from "https://unpkg.com/three/build/three.module.js";

const pi2 = Math.PI * 2;
const pvMatrix = new Matrix4();

const defAttr = () => ({
  camera: null,
  dom: null,
  target: new Vector3(),
  mouseButtons: new Map([
    [0, "rotate"],
    [2, "pan"],
  ]),
  state: "none",
  dragStart: new Vector2(),
  dragEnd: new Vector2(),
  panOffset: new Vector3(),
  screenSpacePanning: true,
  zoomScale: 0.95,
  spherical: new Spherical(),
  rotateDir: "xy",
});

export default class OrbitControls {
  constructor(attr) {
    Object.assign(this, defAttr(), attr);
    this.updateSpherical();
    this.update();
  }
  updateSpherical() {
    const { spherical, camera, target } = this;
    spherical.setFromVector3(camera.position.clone().sub(target));
  }
  pointerdown({ clientX, clientY, button }) {
    const { dragStart, mouseButtons } = this;
    dragStart.set(clientX, clientY);
    this.state = mouseButtons.get(button);
  }
  pointermove({ clientX, clientY }) {
    const {
      dragStart,
      dragEnd,
      state,
      camera: { type },
    } = this;
    dragEnd.set(clientX, clientY);
    switch (state) {
      case "pan":
        this[`pan${type}`](dragEnd.clone().sub(dragStart));
        break;
      case "rotate":
        this.rotate(dragEnd.clone().sub(dragStart));
        break;
    }
    dragStart.copy(dragEnd);
  }
  pointerup() {
    this.state = "none";
  }
  wheel({ deltaY }) {
    const {
      zoomScale,
      camera: { type },
    } = this;
    let scale = deltaY < 0 ? zoomScale : 1 / zoomScale;
    this[`dolly${type}`](scale);
    this.update();
  }
  dollyPerspectiveCamera(dollyScale) {
    this.spherical.radius *= dollyScale;
  }
  dollyOrthographicCamera(dollyScale) {
    const { camera } = this;
    camera.zoom *= dollyScale;
    camera.updateProjectionMatrix();
  }
  panPerspectiveCamera({ x, y }) {
    const {
      camera: { matrix, position, fov, up },
      dom: { clientHeight },
      panOffset,
      screenSpacePanning,
      target,
    } = this;

    //视线长度：相机视点到目标点的距离
    const sightLen = position.clone().sub(target).length();
    //视椎体垂直夹角的一半(弧度)
    const halfFov = (fov * Math.PI) / 360;
    //目标平面的高度
    const targetHeight = sightLen * Math.tan(halfFov) * 2;
    //目标平面与画布的高度比
    const ratio = targetHeight / clientHeight;
    //画布位移量转目标平面位移量
    const distanceLeft = x * ratio;
    const distanceUp = y * ratio;

    //相机平移方向
    //鼠标水平运动时，按照相机本地坐标的x轴平移相机
    const mx = new Vector3().setFromMatrixColumn(matrix, 0);
    //鼠标水平运动时，按照相机本地坐标的y轴，或者-z轴平移相机
    const myOrz = new Vector3();
    if (screenSpacePanning) {
      //y轴，正交相机中默认
      myOrz.setFromMatrixColumn(matrix, 1);
    } else {
      //-z轴，透视相机中默认
      myOrz.crossVectors(up, mx);
    }
    //目标平面位移量转世界坐标
    const vx = mx.clone().multiplyScalar(-distanceLeft);
    const vy = myOrz.clone().multiplyScalar(distanceUp);
    panOffset.copy(vx.add(vy));

    this.update();
  }

  panOrthographicCamera({ x, y }) {
    const {
      camera: { right, left, top, bottom, matrix, up },
      dom: { clientWidth, clientHeight },
      panOffset,
      screenSpacePanning,
    } = this;

    const cameraW = right - left;
    const cameraH = top - bottom;
    const ratioX = x / clientWidth;
    const ratioY = y / clientHeight;
    const distanceLeft = ratioX * cameraW;
    const distanceUp = ratioY * cameraH;
    const mx = new Vector3().setFromMatrixColumn(matrix, 0);
    const vx = mx.clone().multiplyScalar(-distanceLeft);
    const vy = new Vector3();
    if (screenSpacePanning) {
      vy.setFromMatrixColumn(matrix, 1);
    } else {
      vy.crossVectors(up, mx);
    }
    vy.multiplyScalar(distanceUp);
    panOffset.copy(vx.add(vy));
    this.update();
  }

  rotate({ x, y }) {
    const {
      dom: { clientHeight },
      spherical,
      rotateDir,
    } = this;
    const deltaT = (pi2 * x) / clientHeight;
    const deltaP = (pi2 * y) / clientHeight;
    if (rotateDir.includes("x")) {
      spherical.theta -= deltaT;
    }
    if (rotateDir.includes("y")) {
      const phi = spherical.phi - deltaP;
      spherical.phi = Math.min(
        Math.PI * 0.99999999, 
        Math.max(0.00000001, phi)
      );
    }
    this.update();
  }

  update() {
    const { camera, target, spherical, panOffset } = this;
    //基于平移量平移相机
    target.add(panOffset);
    camera.position.add(panOffset);

    //基于球坐标缩放相机
    const rotateOffset = new Vector3().setFromSpherical(spherical);
    camera.position.copy(target.clone().add(rotateOffset));

    //更新投影视图矩阵
    camera.lookAt(target);
    camera.updateMatrixWorld(true);

    //重置旋转量和平移量
    spherical.setFromVector3(camera.position.clone().sub(target));
    panOffset.set(0, 0, 0);
  }

  getPvMatrix() {
    const {
      camera: { projectionMatrix, matrixWorldInverse },
    } = this;
    return pvMatrix.multiplyMatrices(projectionMatrix, matrixWorldInverse);
  }
}
```
:::

### 2.轨道控制器的实例化

OrbitControls 对象就像 three.js 里的样，可以自动根据相机类型去做相应的轨道变换。

::: details 代码实现
```js
/* 透视相机 */
/*
	const eye = new Vector3(0, 0.5, 1)
    const target = new Vector3(0, 0, -2.5)
    const up = new Vector3(0, 1, 0)
    const [fov, aspect, near, far] = [
      45,
      canvas.width / canvas.height,
      1,
      20
    ]
    const camera = new PerspectiveCamera(fov, aspect, near, far)
    camera.position.copy(eye)
*/

/* 正交相机 */
const halfH = 2
const ratio = canvas.width / canvas.height
const halfW = halfH * ratio
const [left, right, top, bottom, near, far] = [
    -halfW, halfW, halfH, -halfH, 1, 8
]
const eye = new Vector3(1, 1, 2)
const target = new Vector3(0, 0, -3)
const up = new Vector3(0, 1, 0)

const camera = new OrthographicCamera(
    left, right, top, bottom, near, far
)
camera.position.copy(eye)

const pvMatrix = new Matrix4()

……

/* 实例化轨道控制器 */
const orbit = new OrbitControls({
    camera,
    target,
    dom: canvas,
})
pvMatrix.copy(orbit.getPvMatrix())
render()

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
    pvMatrix.copy(orbit.getPvMatrix())
    render()
})
canvas.addEventListener('pointerup', event => {
    orbit.pointerup(event)
})

//滚轮事件
canvas.addEventListener('wheel', event => {
    orbit.wheel(event)
    pvMatrix.copy(orbit.getPvMatrix())
    render()
})
```
:::


## 十八、顶点索引

### 1.顶点索引概念

对于顶点索引的概念，在复合变换里 (用 js 实现的顶点索引功能) 的模型矩阵提过。

::: details webgl api代码实现
```html{84,86,90}
<canvas id="canvas"></canvas>
<script id="vertexShader" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ModelMatrix;
  void main(){
    gl_Position = u_ViewMatrix * u_ModelMatrix * a_Position;
  }
</script>
<script id="fragmentShader" type="x-shader/x-fragment">
  void main(){
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
</script>
<script type="module">
  import { initShaders } from '../jsm/Utils.js';
  import {
    Matrix4,
    Vector3
  } from 'https://unpkg.com/three/build/three.module.js';

  const canvas = document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const gl = canvas.getContext('webgl');
  const vsSource = document.getElementById('vertexShader').innerText;
  const fsSource = document.getElementById('fragmentShader').innerText;
  initShaders(gl, vsSource, fsSource);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // 顶点库 （3个一组，代表x, y, z）
  const verticeLib = new Float32Array([
    1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,
    1.0, -1.0, -1.0,
    1.0, 1.0, -1.0,
    -1.0, 1.0, -1.0,
    -1.0, -1.0, -1.0,
  ]);

  // 顶点索引集合，每一个数字对应每一组顶点（3个）
  const indices = new Uint8Array([
    0, 1,
    1, 2,
    2, 3,
    3, 0,

    0, 5,
    1, 6,
    2, 7,
    3, 4,

    4, 5,
    5, 6,
    6, 7,
    7, 4
  ]);

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticeLib, gl.STATIC_DRAW);
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  // 视图矩阵和模型矩阵
  const u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  const u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  const viewMatrix = new Matrix4().lookAt(
    new Vector3(0.2, 0.2, 1),
    new Vector3(0, 0, 0),
    new Vector3(0, 1, 0)
  );
  const modelMatrix = new Matrix4();
  modelMatrix.makeScale(0.5, 0.5, 0.5);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  //建立缓冲区对象
  const indicesBuffer = gl.createBuffer();
  //把缓冲区绑定到webgl 上下文对象
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  //往缓冲区写数据
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  //刷底色
  gl.clear(gl.COLOR_BUFFER_BIT);
  //绘图
  gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_BYTE, 0);
</script>
```
效果：  
![](/webgl-share/120.png)

gl.drawElements()：  
![](/webgl-share/121.png)
:::

### 2.彩色立方体
::: details 代码实现
```html
<canvas id="canvas"></canvas>
<script id="vertexShader" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  uniform mat4 u_PvMatrix;
  uniform mat4 u_ModelMatrix;
  varying vec4 v_Color;
  void main(){
    gl_Position = u_PvMatrix * u_ModelMatrix * a_Position;
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
  import { initShaders } from '../jsm/Utils.js';
  import {
    Matrix4,
    PerspectiveCamera,
    Vector3
  } from 'https://unpkg.com/three/build/three.module.js';
  import OrbitControls from './jsm/OrbitControls.js';

  /* 正常初始化着色器，打开深度测试*/
  const canvas = document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const gl = canvas.getContext('webgl');
  const vsSource = document.getElementById('vertexShader').innerText;
  const fsSource = document.getElementById('fragmentShader').innerText;
  initShaders(gl, vsSource, fsSource);
  gl.clearColor(0, 0, 0, 1);
  //打开深度测试=>深度测试可以解决物体的遮挡问题,不然后面的物体可能挡住前面的物体
  gl.enable(gl.DEPTH_TEST);


  /* 建立透视相机和轨道控制器 */
  //透视相机 
  const eye = new Vector3(1, 2, 3);
  const target = new Vector3(0, 0, 0);
  const up = new Vector3(0, 1, 0);
  const [fov, aspect, near, far] = [
    45,
    canvas.width / canvas.height,
    1,
    20
  ];
  const camera = new PerspectiveCamera(fov, aspect, near, far);
  camera.position.copy(eye);

  //实例化轨道控制器 
  const orbit = new OrbitControls({
    camera, target,
    dom: canvas,
  });
  //取消右击菜单的显示 
  canvas.addEventListener('contextmenu', event => {
    event.preventDefault();
  })
  //指针按下时，设置拖拽起始位，获取轨道控制器状态
  canvas.addEventListener('pointerdown', event => {
    orbit.pointerdown(event);
  })
  //指针移动时,若控制器处于平移状态,平移相机；若控制器处于旋转状态,旋转相机
  canvas.addEventListener('pointermove', event => {
    orbit.pointermove(event);
  })
  //指针抬起 
  canvas.addEventListener('pointerup', event => {
    orbit.pointerup(event);
  })
  //滚轮事件
  canvas.addEventListener('wheel', event => {
    orbit.wheel(event);
  })


  /* 声明顶点数据 vertices 和顶点索引 indexes */
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  const vertices = new Float32Array([
    1, 1, 1, 1, 0, 0,  // v0 White
    -1, 1, 1, 0, 1, 0,  // v1 Magenta
    -1, -1, 1, 0, 0, 1,  // v2 Red
    1, -1, 1, 1, 1, 0,  // v3 Yellow
    1, -1, -1, 0, 1, 1,  // v4 Green
    1, 1, -1, 1, 0, 1,  // v5 Cyan
    -1, 1, -1, 1, 1, 1,  // v6 Blue
    -1, -1, -1, 0, 0, 0   // v7 Black
  ])

  const indexes = new Uint8Array([
    0, 1, 2, 0, 2, 3,    // front
    0, 3, 4, 0, 4, 5,    // right
    0, 5, 6, 0, 6, 1,    // up
    1, 6, 7, 1, 7, 2,    // left
    7, 4, 3, 7, 3, 2,    // down
    4, 7, 6, 4, 6, 5     // back
  ])


  /* 将顶点数据写入缓冲区，并将其中的点位和颜色数据分别分配给 
  *  a_Position 和 a_Color 
  */
  //元素字节数
  const elementBytes = vertices.BYTES_PER_ELEMENT;
  const FSIZE = vertices.BYTES_PER_ELEMENT;
  //系列尺寸
  const verticeSize = 3;
  const colorSize = 3;
  //类目尺寸
  const categorySize = verticeSize + colorSize;
  //类目字节数
  const categoryBytes = categorySize * elementBytes;
  //系列字节索引位置
  const verticeByteIndex = 0;
  const colorByteIndex = verticeSize * elementBytes;

  //顶点缓冲区
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  //将顶点缓冲区里的点位数据分配给a_Position
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.vertexAttribPointer(
    a_Position,
    verticeSize,
    gl.FLOAT,
    false,
    categoryBytes,
    verticeByteIndex
  );
  gl.enableVertexAttribArray(a_Position);

  //将顶点缓冲区里的颜色数据分配给a_Color
  const a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  gl.vertexAttribPointer(
    a_Color,
    colorSize,
    gl.FLOAT,
    false,
    categoryBytes,
    colorByteIndex
  );
  gl.enableVertexAttribArray(a_Color);


  /* 将顶点索引写入缓冲区 */
  // 建立缓冲区对象
  const indexesBuffer = gl.createBuffer();
  //把缓冲区绑定到webgl 上下文对象上
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexesBuffer);
  // 往缓冲区写数据
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexes, gl.STATIC_DRAW);

  
  /* 建立模型矩阵，并传递给片元着色器 */
  const u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  const modelMatrix = new Matrix4();
  modelMatrix.makeScale(0.5, 0.5, 0.5);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);


  /* 建立投影视图矩阵，并传递给片元着色器 */
  const u_PvMatrix = gl.getUniformLocation(gl.program, 'u_PvMatrix');
  gl.uniformMatrix4fv(u_PvMatrix, false, orbit.getPvMatrix().elements);


  /* 用连续渲染的方法绘图 */
  !(function ani() {
    modelMatrix.multiply(new Matrix4().makeRotationY(0.05));
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, indexes.length, gl.UNSIGNED_BYTE, 0);
    requestAnimationFrame(ani);
  })()
</script>
```
效果：  
![](/webgl-share/122.gif)

注意：  
a_Color 和 a_Position 一一对应的，一个顶点，一个颜色，所以用 attribute 声明的 a_Color  
如果整个立方体都是一个颜色，直接在片元着色器里用 uniform 声明就好了
:::


## 十九、多着色器

在实际开发中，不可能只用一套着色器做项目的，比如场景里有两个三角形，一个三角形需要着纯色，一个三角形需要着纹理。

![](/webgl-share/123.png)
### 1.多着色器绘图
#### 1.1准备两套着色器
```html
<!-- 着纯色 -->
<script id="solidVertexShader" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  void main(){
    gl_Position = a_Position;
  }
</script>
<script id="solidFragmentShader" type="x-shader/x-fragment">
  precision mediump float;
  void main(){
    gl_FragColor = vec4(0.9, 0.7, 0.4, 1);
  }
</script>

<!-- 着纹理 -->
<script id="textureVertexShader" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  attribute vec2 a_Pin;
  varying vec2 v_Pin;
  void main(){
    gl_Position = a_Position;
    v_Pin = a_Pin;
  }
</script>
<script id="textureFragmentShader" type="x-shader/x-fragment">
  precision mediump float;
  uniform sampler2D u_Sampler;
  varying vec2 v_Pin;
  void main(){
    gl_FragColor = texture2D (u_Sampler, v_Pin);
  }
</script>
```
#### 1.2绘制纯色三角形

1. 建立程序对象，并应用

```js
const solidVsSource = document.getElementById("solidVertexShader").innerText;
const solidFsSource = document.getElementById("solidFragmentShader").innerText;
const solidProgram = createProgram(gl, solidVsSource, solidFsSource);
gl.useProgram(solidProgram);
```
createProgram() 方法是基于一套着色器建立程序对象的方法：
```js
function createProgram(gl, vsSource, fsSource) {
  //创建程序对象
  const program = gl.createProgram();
  //建立着色对象
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  //把顶点着色对象装进程序对象中
  gl.attachShader(program, vertexShader);
  //把片元着色对象装进程序对象中
  gl.attachShader(program, fragmentShader);
  //连接webgl上下文对象和程序对象
  gl.linkProgram(program);
  return program;
}
```
之前初始化着色器方法 initShaders() 只是比上面的方法多了一个应用程序对象的步骤：

```js
gl.useProgram(program);
```

这里之所以把启用程序的步骤提取出来，是因为一套着色器对应着一个程序对象。  
而一个 webgl 上下文对象，是可以依次应用多个程序对象的。  
通过不同程序对象，可以绘制不同材质的图形。  

2. 用当前的程序对象绘制图形

```js
const solidVertices = new Float32Array([
  -0.5, 0.5, 
  -0.5, -0.5, 
  0.5, -0.5
]);
const solidVertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, solidVertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, solidVertices, gl.STATIC_DRAW);
const solidPosition = gl.getAttribLocation(solidProgram, "a_Position");
gl.vertexAttribPointer(solidPosition, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(solidPosition);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLES, 0, 3);
```
因为后面还需要绘制一个纹理图形，纹理图形是需要等纹理加载成功才能绘制的。  
这会造成两个三角形的异步绘制，这不是我们想要的，因为异步会把之前三角形的缓冲数据给清理掉。  
因此，需要同步绘制两个三角形。  

先把上面的绘图方法封装到一个函数里，等纹理三角形的图片加载成功了，再执行。
```js
function drawSolid() {
  /* 1.建立程序对象，并应用 */
  const solidVsSource = document.getElementById("solidVertexShader").innerText;
  const solidFsSource = document.getElementById(
    "solidFragmentShader"
  ).innerText;
  const solidProgram = createProgram(gl, solidVsSource, solidFsSource);
  gl.useProgram(solidProgram);
  /* 2.用当前的程序对象绘制图形 */
  const solidVertices = new Float32Array([-0.5, 0.5, -0.5, -0.5, 0.5, -0.5]);
  const solidVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, solidVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, solidVertices, gl.STATIC_DRAW);
  const solidPosition = gl.getAttribLocation(solidProgram, "a_Position");
  gl.vertexAttribPointer(solidPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(solidPosition);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
```
#### 1.3绘制纹理三角形

纹理三角形的绘制原理和纯色三角形一样，要用一套新的着色器建立一个新的程序对象，然后用这个新的程序对象进行绘图。

```js
function drawTexture(image) {
  /* 1.建立程序对象，并应用 */
  const textureVsSource = document.getElementById(
    "textureVertexShader"
  ).innerText;
  const textureFsSource = document.getElementById(
    "textureFragmentShader"
  ).innerText;
  const textureProgram = createProgram(gl, textureVsSource, textureFsSource);
  gl.useProgram(textureProgram);

  /* 2.用当前的程序对象绘制图形 */
  // 顶点
  const textureVertices = new Float32Array([0.5, 0.5, -0.5, 0.5, 0.5, -0.5]);
  const textureVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, textureVertices, gl.STATIC_DRAW);
  const texturePosition = gl.getAttribLocation(textureProgram, "a_Position");
  gl.vertexAttribPointer(texturePosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(texturePosition);
  // 图钉
  const pins = new Float32Array([1, 1, 0, 1, 1, 0]);
  const pinBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pinBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, pins, gl.STATIC_DRAW);
  const pin = gl.getAttribLocation(textureProgram, "a_Pin");
  gl.vertexAttribPointer(pin, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(pin);
  // 纹理
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  const u_Sampler = gl.getUniformLocation(textureProgram, "u_Sampler");
  gl.uniform1i(u_Sampler, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
```

#### 1.4同步绘图

当纹理图形加载成功后，进行同步绘图。

```js
const image = new Image();
image.src = "./images/erha.jpg";
image.onload = function () {
  drawSolid();
  drawTexture(image);
};
```

想给场景中的图形添加一个动画，比如想让纯色三角形不断的变换颜色。  
首先要给纯色三角形的片元着色器开一个 uniform 变量。  

然后接下来是不是就要不断修改这个 uniform 变量，然后执行上面的 drawSolid()和 drawTexture(image) 方法呢？
### 2.多着色器动画

在上面的绘图方法中，很多操作都是不需要重复执行的，比如程序对象在建立之后，就不需要再建立了，后面在绘图的时候再接着用。

#### 2.1给纯色三角形添加一个代表时间的 uniform 变量

```html
<script id="solidFragmentShader" type="x-shader/x-fragment">
  precision mediump float;
     uniform float u_Time;
     void main(){
       float r = (sin(u_Time/200.0) + 1.0) / 2.0;
       gl_FragColor = vec4(r, 0.7, 0.4, 1);
     }
</script>
```

#### 2.2声明不需要重复获取变量

```js
let solidProgram,
  solidVertexBuffer,
  solidPosition,
  solidTime = null;
let textureProgram,
  textureVertexBuffer,
  texturePosition = null;
let pinBuffer,
  pin = null;
```

程序对象、缓冲对象、从着色器中获取的 attribute 变量和 uniform 变量都是不需要重复获取的。

#### 2.3初始化方法

把绘制纯色三角形的方法变成初始化方法
```js
function initSolid() {
  /* 1.建立程序对象*/
  const solidVsSource = document.getElementById("solidVertexShader").innerText;
  const solidFsSource = document.getElementById(
    "solidFragmentShader"
  ).innerText;
  solidProgram = createProgram(gl, solidVsSource, solidFsSource);
  gl.useProgram(solidProgram);

  /* 2.用当前的程序对象绘制图形 */
  const solidVertices = new Float32Array([-0.5, 0.5, -0.5, -0.5, 0.5, -0.5]);
  solidVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, solidVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, solidVertices, gl.STATIC_DRAW);
  solidPosition = gl.getAttribLocation(solidProgram, "a_Position");
  gl.vertexAttribPointer(solidPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(solidPosition);

  solidTime = gl.getUniformLocation(solidProgram, "u_Time");

  /* gl.clear(gl.COLOR_BUFFER_BIT)
       gl.drawArrays(gl.TRIANGLES, 0, 3) */
}
```

把绘制纹理三角形的方法变成初始化方法

```js
function initTexture(image) {
  /* 1.建立程序对象，并应用 */
  const textureVsSource = document.getElementById(
    "textureVertexShader"
  ).innerText;
  const textureFsSource = document.getElementById(
    "textureFragmentShader"
  ).innerText;
  textureProgram = createProgram(gl, textureVsSource, textureFsSource);
  gl.useProgram(textureProgram);

  /* 2.用当前的程序对象绘制图形 */
  // 顶点
  const textureVertices = new Float32Array([0.5, 0.5, -0.5, 0.5, 0.5, -0.5]);
  textureVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, textureVertices, gl.STATIC_DRAW);
  texturePosition = gl.getAttribLocation(textureProgram, "a_Position");
  gl.vertexAttribPointer(texturePosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(texturePosition);
  // 图钉
  const pins = new Float32Array([1, 1, 0, 1, 1, 0]);
  pinBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pinBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, pins, gl.STATIC_DRAW);
  pin = gl.getAttribLocation(textureProgram, "a_Pin");
  gl.vertexAttribPointer(pin, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(pin);
  // 纹理
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  const u_Sampler = gl.getUniformLocation(textureProgram, "u_Sampler");
  gl.uniform1i(u_Sampler, 0);

  // gl.drawArrays(gl.TRIANGLES, 0, 3)
}
```
上面已经注释掉的是需要在绘图时重复执行的。

#### 2.4把需要重复执行的方法收集一下，用于连续渲染

```js
function render(time = 0) {
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(solidProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, solidVertexBuffer);
  gl.vertexAttribPointer(solidPosition, 2, gl.FLOAT, false, 0, 0);
  gl.uniform1f(solidTime, time);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  gl.useProgram(textureProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, textureVertexBuffer);
  gl.vertexAttribPointer(texturePosition, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, pinBuffer);
  gl.vertexAttribPointer(pin, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  requestAnimationFrame(render);
}
```
由上可知，在连续渲染时，必须要有的操作：

- clear() 清理画布
- useProgram() 应用程序对象
- bindBuffer() 绑定缓冲区对象
- vertexAttribPointer() 告诉显卡从当前绑定的缓冲区（bindBuffer()指定的缓冲区）中读取顶点数据
- drawArrays() 绘图方法

若 attribute 变量、uniform 变量或者图片发生了变化，那就需要对其进行更新。

#### 2.5当纹理图像加载成功后，初始化绘图方法，连续绘图

```js
const image = new Image();
image.src = "./images/erha.jpg";
image.onload = function () {
  initSolid();
  initTexture(image);
  render();
};
```


## 二十、基于 webgl 的轻量级架构

之前简单架构 Poly 已经无法满足基本需求，需要在其基础上再做一下升级。  
下图便是要搭建的框架，参考了 three.js，但要简单很多。  

意欲先用它整几个案例练练手再说，等以后遇到满足不了的需求了，再做深度扩展。

![](/webgl-share/124.png)

1. 场景 Scene：包含所有的三维对象，并负责绘图
2. 三维对象 Obj3D：包含几何体 Geo 和材质 Mat，对两者进行统一管理
3. 几何体 Geo：对应 attribute 顶点数据
4. 材质 Mat：包含程序对象，对应 uniform 变量

### 1.几何体 Geo
#### 1.1默认属性

```js
const defAttr = () => ({
  data: {},
  count:0,
  index: null,
  drawType:'drawArrays',//drawElements
})
export default class Geo {
  constructor(attr) {
    Object.assign(this, defAttr(), attr)
  }
  ……
}
```
- data 顶点数据
- count 顶点总数
- index 顶点索引数据
  - 默认为 null，用 drawArrays 的方式绘图
  - 若不为 null，用 drawElements 的方式绘图
- drawType 绘图方式
  - drawArrays 使用顶点集合绘图，默认
  - drawElements，使用顶点索引绘图

data 的数据结构如下：

```js
{
  a_Position: {
    array:类型数组,
    size:矢量长度,
    buffer:缓冲对象,
    location:attribute变量,
    needUpdate：true
  },
  a_Color: {
    array:类型数组,
    size:矢量长度,
    buffer:缓冲对象,
    location:attribute变量,
    needUpdate：true
  },
  ……
}
```
- array 存储所有的 attribute 数据
- size 构成一个顶点的所有分量的数目
- buffer 用 createBuffer() 方法建立的缓冲对象
- location 用 getAttribLocation() 方法获取的 attribute 变量
- needUpdate 在连续渲染时，是否更新缓冲对象

index 数据结构

```js
{
    array:类型数组,
    buffer:缓冲对象,
    needUpdate：true
}
```

#### 1.2初始化方法

```js
init(gl,program) {
    gl.useProgram(program)
    this.initData(gl,program)
    this.initIndex(gl)
}
```
- init(gl,program) 方法会在场景 Scene 初始化时被调用
  - gl：webgl 上下文对象，会通过场景 Scene 的初始化方法传入
  - program：程序对象，会通过 Obj3D 的初始化方法传入

- initData() 初始化顶点索引
  - 初始化顶点数量 count 和绘图方式 drawType
  - 若顶点索引不为 null，就建立缓冲区对象，向其中写入顶点索引数据

```js
initData(gl,program) {
    for (let [key, attr] of Object.entries(this.data)) {
        attr.buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer)
        gl.bufferData(gl.ARRAY_BUFFER, attr.array, gl.STATIC_DRAW)
        const location = gl.getAttribLocation(program, key)
        gl.vertexAttribPointer(
            location,
            attr.size,
            gl.FLOAT,
            false,
            0,
            0
        )
        gl.enableVertexAttribArray(location)
        attr.location=location
    }
}
```

initIndex() 初始化 attribute 变量

```js
initIndex(gl) {
    const { index } = this
    if (index) {
        this.count=index.array.length
        this.drawType = 'drawElements'
        index.buffer = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index.buffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index.array, gl.STATIC_DRAW)
    }else{
        const { array, size } = this.data['a_Position']
        this.count = array.length / size
        this.drawType='drawArrays'
    }
}
```

#### 1.3更新方法，用于连续渲染

```js
update(gl) {
    this.updateData(gl)
    this.updateIndex(gl)
}
```

updateData(gl) 更新 attribute 变量

```js
updateData(gl) {
    for (let attr of Object.values(this.data)){
        const { buffer, location, size, needUpdate,array } = attr
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        if (needUpdate) {
            attr.needUpdate = false
            gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW)
        }
        gl.vertexAttribPointer(
            location,
            size,
            gl.FLOAT,
            false,
            0,
            0
        )
    }
}
```

updateIndex(gl) 更新顶点索引

```js
updateIndex(gl) {
    const {index} = this
    if (index) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index.buffer)
        if (index.needUpdate) {
            index.needUpdate = false
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index.array, gl.STATIC_DRAW)
        }
    }
}
```

#### 1.4设置 attribute 数据和顶点索引数据的方法

setData(key,val) 设置 attribute 数据

```js
setData(key,val){
    const { data } = this
    const obj = data[key]
    if (!obj) { return }
    obj.needUpdate=true
    Object.assign(obj,val)
}
```

setIndex(val)设置顶点索引数据

```js
setIndex(val) {
    const {index}=this
    if (val) {
        index.needUpdate = true
        index.array=val
        this.count=index.array.length
        this.drawType = 'drawElements'
    }else{
        const { array, size } = this.data['a_Position']
        this.count = array.length / size
        this.drawType='drawArrays'
    }
}
```

### 2.材质 Mat

#### 1.1默认属性

```js
const defAttr = () => ({
  program: null,
  data: {},
  mode: 'TRIANGLES',
  maps: {}
})
export default class Mat {
  constructor(attr) {
    Object.assign(this, defAttr(), attr)
  }
  ……
}
```

- program 程序对象
- data uniform 数据
- mode 图形的绘制方式，默认独立三角形。  
  注：mode 也可以是数组，表示多种绘图方式，如['TRIANGLE_STRIP', 'POINTS']
- maps 集合

1. data 数据结构：

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
- value uniform 数据值
- type uniform 数据的写入方式
- location 用 getUniformLocation() 方法获取的 uniform 变量
- needUpdate 在连续渲染时，是否更新 uniform 变量

2. maps 数据结构:

```js
{
  u_Sampler:{
    image,
    format,
    wrapS,
    wrapT,
    magFilter,
    minFilter,
    needUpdate:true,
  },
  ……
}
```
- image 图形源
- format 数据类型，默认 gl.RGB
- wrapS 对应纹理对象的 TEXTURE_WRAP_S 属性
- wrapT 对应纹理对象的 TEXTURE_WRAP_T 属性
- magFilter 对应纹理对象的 TEXTURE_MAG_FILTER 属性
- minFilter 对应纹理对象的 TEXTURE_MIN_FILTER 属性

#### 1.2初始化方法

获取 uniform 变量，绑定到其所在的对象上。

```js
init(gl) {
    const {program,data,maps}=this
    for (let [key, obj] of [...Object.entries(data),...Object.entries(maps)]) {
        obj.location = gl.getUniformLocation(program, key)
        obj.needUpdate=true
    }
}
```
#### 1.3更新方法，用于连续渲染

```js
update(gl) {
    this.updateData(gl)
    this.updateMaps(gl)
}
```

updateData(gl) 更新 uniform 变量

```js
updateData(gl) {
    for (let obj of Object.values(this.data)) {
        if (!obj.needUpdate) { continue }
        obj.needUpdate=false
        const { type, value, location } = obj
        if (type.includes('Matrix')) {
            gl[type](location,false,value)
        } else {
            gl[type](location,value)
        }
    }
}
```

updateMaps(gl) 更新纹理

```js
updateMaps(gl) {
    const { maps } = this
    Object.values(maps).forEach((map, ind) => {
        if (!map.needUpdate) { return }
        map.needUpdate = false
        const {
            format = gl.RGB,
            image,
            wrapS,
            wrapT,
            magFilter,
            minFilter,
            location,
        } = map

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
        gl.activeTexture(gl[`TEXTURE${ind}`])
        const texture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, texture)
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
        gl.uniform1i(location, ind)
    })
}
```

#### 1.4设置 uniform 数据和纹理的方法

setData(key,val) 设置 uniform 数据

```js
setData(key,val){
    const { data } = this
    const obj = data[key]
    if (!obj) { return }
    obj.needUpdate=true
    Object.assign(obj,val)
}
```

setMap(val)设置纹理

```js
setMap(key,val) {
    const { maps } = this
    const obj = maps[key]
    if (!obj) { return }
    obj.needUpdate=true
    Object.assign(obj,val)
}
```

### 3.三维对象 Obj3D

obj3D 对象比较简单，主要负责对 Geo 对象和 Mat 对象的统一初始化和更新。

```js
const defAttr = () => ({
  geo: null,
  mat: null,
});
export default class Obj3D {
  constructor(attr) {
    Object.assign(this, defAttr(), attr);
  }
  init(gl) {
    const { mat, geo } = this;
    mat.init(gl);
    geo.init(gl, mat.program);
  }
  update(gl) {
    const { mat, geo } = this;
    mat.update(gl);
    geo.update(gl);
  }
}
```

### 4.场景对象 Scene

Scene 对象的主要功能就是收集所有的三维对象，然后画出来。

```js
/*默认属性*/
const defAttr = () => ({
  gl: null,
  children: [],
});

export default class Scene {
  constructor(attr = {}) {
    Object.assign(this, defAttr(), attr);
  }
  init() {
    const { children, gl } = this;
    children.forEach((obj) => {
      obj.init(gl);
    });
  }
  add(...objs) {
    const { children, gl } = this;
    objs.forEach((obj) => {
      children.push(obj);
      obj.parent = this;
      obj.init(gl);
    });
  }
  remove(obj) {
    const { children } = this;
    const i = children.indexOf(obj);
    if (i !== -1) {
      children.splice(i, 1);
    }
  }
  setUniform(key, val) {
    this.children.forEach(({ mat }) => {
      mat.setData(key, val);
    });
  }
  draw() {
    const { gl, children } = this;
    gl.clear(gl.COLOR_BUFFER_BIT);
    children.forEach((obj) => {
      const {
        geo: { drawType, count },
        mat: { mode, program },
      } = obj;
      gl.useProgram(program);
      obj.update(gl);
      if (typeof mode === "string") {
        this[drawType](gl, count, mode);
      } else {
        mode.forEach((m) => {
          this[drawType](gl, count, m);
        });
      }
    });
  }
  drawArrays(gl, count, mode) {
    gl.drawArrays(gl[mode], 0, count);
  }
  drawElements(gl, count, mode) {
    gl.drawElements(gl[mode], count, gl.UNSIGNED_BYTE, 0);
  }
}
```

我们依次解释一下上面的方法。

- Scene 对象的属性只有两个：

  - gl：webgl 上下文对象
  - children：三维对象集合

- init() 初始化方法
- add() 添加三维对象
- remove() 删除三维对象
- setUniform() 统一设置所有对象共有的属性，比如视图投影矩阵
- draw() 绘图方法

关于 webgl 的轻量级架构就先写到这，以后学到新的知识了，或者遇到新的需求了，再做升级。


### 测试 1

可以基于之前多着色器的例子，测试一下刚才的 webgl 框架在多着色器中的应用。

1. 两套着色器

```html
<!-- 着纯色 -->
<script id="solidVertexShader" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  uniform mat4 u_PvMatrix;
  uniform mat4 u_ModelMatrix;
  void main(){
    gl_Position = u_PvMatrix * u_ModelMatrix * a_Position;
  }
</script>
<script id="solidFragmentShader" type="x-shader/x-fragment">
  precision mediump float;
  uniform float u_Time;
  void main(){
    float r = (sin(u_Time / 200.0) + 1.0) / 2.0;
    gl_FragColor = vec4(r, 0.7, 0.4, 1);
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

2. 引入 js 模块

```js
import { createProgram } from "../jsm/Utils.js";
import {
  Matrix4,
  OrthographicCamera,
  Vector3,
} from "https://unpkg.com/three/build/three.module.js";
import OrbitControls from "./jsm/OrbitControls.js";
import Mat from "./jsm/Mat.js";
import Geo from "./jsm/Geo.js";
import Obj3D from "./jsm/Obj3D.js";
import Scene from "./jsm/Scene.js";
```

3. 备好 webgl 上下文对象

```js
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const gl = canvas.getContext("webgl");
gl.clearColor(0.0, 0.0, 0.0, 1.0);
```

4. 备好相机，稍后从中提取投影视图矩阵

```js
const halfH = 1;
const ratio = canvas.width / canvas.height;
const halfW = halfH * ratio;
const [left, right, top, bottom, near, far] = [
  -halfW,
  halfW,
  halfH,
  -halfH,
  1,
  8,
];
const eye = new Vector3(0, 0, 2);
const target = new Vector3(0, 0, 0);
const camera = new OrthographicCamera(left, right, top, bottom, near, far);
camera.position.copy(eye);
camera.lookAt(target);
camera.updateMatrixWorld();
```

5. 实例化场景对象

```js
const scene = new Scene({ gl });
```

6. 建立纯色三角形

```js
{
  const vs = document.getElementById("solidVertexShader").innerText;
  const fs = document.getElementById("solidFragmentShader").innerText;
  const program = createProgram(gl, vs, fs);
  const mat = new Mat({
    program,
    data: {
      u_Time: {
        value: 0,
        type: "uniform1f",
      },
      u_PvMatrix: {
        value: new Matrix4().elements,
        type: "uniformMatrix4fv",
      },
      u_ModelMatrix: {
        value: new Matrix4().elements,
        type: "uniformMatrix4fv",
      },
    },
  });
  const geo = new Geo({
    data: {
      a_Position: {
        array: new Float32Array([-0.5, 0.5, -0.5, -0.5, 0.5, -0.5]),
        size: 2,
      },
    },
  });
  const obj = new Obj3D({ geo, mat });
  scene.add(obj);
}
```

7. 建立纹理三角形

```js
const image = new Image();
image.src = "./images/erha.jpg";
image.onload = function () {
  const vs = document.getElementById("textureVertexShader").innerText;
  const fs = document.getElementById("textureFragmentShader").innerText;
  const program = createProgram(gl, vs, fs);
  const mat = new Mat({
    program,
    data: {
      u_PvMatrix: {
        value: new Matrix4().elements,
        type: "uniformMatrix4fv",
      },
      u_ModelMatrix: {
        value: new Matrix4().elements,
        type: "uniformMatrix4fv",
      },
    },
    maps: {
      u_Sampler: {
        image,
      },
    },
  });
  const geo = new Geo({
    data: {
      a_Position: {
        array: new Float32Array([0.5, 0.5, -0.5, 0.5, 0.5, -0.5]),
        size: 2,
      },
      a_Pin: {
        array: new Float32Array([1, 1, 0, 1, 1, 0]),
        size: 2,
      },
    },
  });
  const obj = new Obj3D({ geo, mat });
  scene.add(obj);

  /* 统一设置uniform变量 */
  scene.setUniform("u_PvMatrix", {
    value: camera.projectionMatrix.clone().multiply(camera.matrixWorldInverse)
      .elements,
  });
};
```

8. 渲染方法

```js
render();
function render(time = 0) {
  scene.children[0].mat.setData("u_Time", { value: time });
  scene.draw();
  requestAnimationFrame(render);
}
```

### 测试 2

再拿之前的彩色立方体来测试一下 webgl 框架的顶点索引功能。

```html
<canvas id="canvas"></canvas>
<script id="vertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_PvMatrix;
    uniform mat4 u_ModelMatrix;
    varying vec4 v_Color;
    void main(){
      gl_Position = u_PvMatrix * u_ModelMatrix * a_Position;
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
    import { initShaders, createProgram } from '../jsm/Utils.js';
    import { 
      Matrix4, 
      PerspectiveCamera, 
      Vector3 
    } from 'https://unpkg.com/three/build/three.module.js';
    import OrbitControls from './jsm/OrbitControls.js';
    import Mat from './jsm/Mat.js';
    import Geo from './jsm/Geo.js';
    import Obj3D from './jsm/Obj3D.js';
    import Scene from './jsm/Scene.js';

    const canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const gl = canvas.getContext('webgl');
    const vsSource = document.getElementById('vertexShader').innerText;
    const fsSource = document.getElementById('fragmentShader').innerText;
    const program = createProgram(gl, vsSource, fsSource);
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);


    /* 透视相机 */
    const eye = new Vector3(2, 3, 5)
    const target = new Vector3(0, 0, 0)
    const up = new Vector3(0, 1, 0)
    const [fov, aspect, near, far] = [
        45,
        canvas.width / canvas.height,
        1,
        20
    ]
    const camera = new PerspectiveCamera(fov, aspect, near, far)
    camera.position.copy(eye)

    /* 实例化轨道控制器 */
    const orbit = new OrbitControls({
        camera, target,
        dom: canvas,
    })
    orbit.update()

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

    const scene = new Scene({ gl })
    const mat = new Mat({
        program,
        data: {
            u_Time: {
                value: 0,
                type: 'uniform1f',
            },
            u_PvMatrix: {
                value: orbit.getPvMatrix().elements,
                type: 'uniformMatrix4fv',
            },
            u_ModelMatrix: {
                value: new Matrix4().elements,
                type: 'uniformMatrix4fv',
            },
        }
    })
    const geo = new Geo({
        data: {
            a_Position: {
                array: new Float32Array([
                    1, 1, 1,
                    -1, 1, 1,
                    -1, -1, 1,
                    1, -1, 1,
                    1, -1, -1,
                    1, 1, -1,
                    -1, 1, -1,
                    -1, -1, -1,
                ]),
                size: 3
            },
            a_Color: {
                array: new Float32Array([
                    1, 0, 0,
                    0, 1, 0,
                    0, 0, 1,
                    1, 1, 0,
                    0, 1, 1,
                    1, 0, 1,
                    1, 1, 1,
                    0, 0, 0
                ]),
                size: 3
            },
        },
        index: {
            array: new Uint8Array([
                0, 1, 2, 0, 2, 3,    // front
                0, 3, 4, 0, 4, 5,    // right
                0, 5, 6, 0, 6, 1,    // up
                1, 6, 7, 1, 7, 2,    // left
                7, 4, 3, 7, 3, 2,    // down
                4, 7, 6, 4, 6, 5     // back
            ])
        }
    })
    const obj = new Obj3D({ geo, mat })
    scene.add(obj)

    !(function ani() {
        scene.setUniform(
            'u_PvMatrix',
            orbit.getPvMatrix().elements
        )
        scene.draw()
        requestAnimationFrame(ani)
    })()

</script>
```


## 二十一、认识光

光是由光源发出的，光有方向、亮度和颜色。

可以想象手电筒打出的一道白色的光。  
手电筒是光源，其亮度会受电池的影响，颜色为白色，方向可以由你来控制。

因为光的存在，我们可以看到世界的多姿多彩。  
接下就具体看一下光照会对现实世界中的物体产生哪些影响。

### 1.光照对物体的影响

现实世界中的物体被光线照射时，会吸收一部分光，反射一部分光。
当反射的光进入人的眼睛中时，人们便可以看到物体，并识别出它的颜色。

光会对物体产生以下影响：

- 影响物体表面不同位置的明暗程度
- 影响物体的颜色
- 影响物体的投影

物体的明暗差异，可以让我们感觉这个物体是立体的。  
比如下图中，左侧的立方体没有明暗差异，给人的感觉就是一个平面；右侧的立方体具有明暗差异，给人的感觉是立体的。  
![](/webgl-share/125.png)

素描的“三大面”、“五调子”  
三大面、五调子就是在描述光对物体的明暗影响，这两个概念可以让我们画出的东西更有体感。

- 三大面：黑、白、灰三个面，描述的就是物体的明暗差异。  
![](/webgl-share/126.png)

- 五调子：高光、中间调、明暗交界线、反光和投影。  
![](/webgl-share/127.png)

物体的颜色会受光色的影响，这个我们之后会详说。  
物体的影子就是光源看不见的地方，我们之后会通过算法来计算。  
接下来，我们再认识一下光源。  

### 2.光源

光源，就是光的源头。  
基于光源发出的光线的方向，我们可以将光源分成两种：  
![](/webgl-share/128.png)

- 平行光（directional light）：光线相互平行，射向同一方向。比如从窗外摄入房间的阳光就是平行的。
`注`：虽让太阳的光也是向四周发射的，但太阳相对于房间而言太大，光线夹角可以忽略不计，所以就认为从窗外射入室内的阳光是平行的。
- 点光源（point light）：光线从一点向周围放射。比如房间里的的灯泡就是点光源。

若对光源的照射范围做限制，还可以衍生出一些更加具体的光源，比如筒灯、聚光灯等。  
现实世界中还有一种间接光源，叫环境光（ambient light），它是经过物体反射后的光。  
![](/webgl-share/129.png)

当光源射出的光线打到物体上时，物体反射的光便是我们识别物体的关键。  
接下来，我们再认识一下物体反射的光。
### 3.反射光

反射光：当光源射出的光线打到物体上时，物体反射的光。  

物体的反射光是有方向和颜色的，其方向和颜色会受入射光和物体表面的影响。  
![](/webgl-share/130.png)


物体常见的的反射光：
- 漫反射( diffuse reflection)： 物体在接收到直接光源的入射光后，会将光线均匀的反射向四面八方，如下图：  
 ![](/webgl-share/131.png)

物体表面越粗糙，漫反射就越明显。

- 镜面反射(specular reflection)： 物体在接收到直接光源的入射光后，会将光线以与物体表面的法线对称的方向反射出去。  
![](/webgl-share/132.png)

​物体表面越光滑，镜面反射就越明显。

- 环境反射（ enviroment ambient reflection）：物体对环境光的反射。

关于光的基本概念咱们就先说到这，接下来具体的说一下如何为物体着色。


## 二十二、着色

通俗而言，着色(shading)是绘画时，用线条或色块表示物体明暗或颜色的方式。

- 线条着色
![](/webgl-share/133.png)
- 色块着色
![](/webgl-share/134.png)

在计算机图形学中，着色是对不同物体应用不同材质的过程。  
![](/webgl-share/135.png)  

在计算机里为模型着色，是很难原封不动的还原现实的。  
只能让模型更加接近现实。  

让模型接近现实的着色方法是有很多种的。  
接下来，说一个叫 Blinn-Phong 着色方法。  
Blinn-Phong 是一种反射模型，不具备严格的物理意义，它是对物理现象的模拟，所以不要基于现实情况太过较真。  

先看一下要对一个物体进行着色需要考虑的条件。  
![](/webgl-share/136.png)

- 着色点
  - 法线normal 
  - 颜色diffuse coefficient
  - 光泽度 shininess
- 光源
  - 光源位置 position
  - 光源强度 intensity
- 着色点到光源的距离r
- 着色点到光源的方向l
- 着色点到视点的方向v

接下来，先考虑一下着色点的亮度和上面各种条件的关系。

### 1.光线与着色点法线的夹角

在同样的光源下，入射光线和着色点法线的夹角会影响着色点接收光线的数量。  
![](/webgl-share/137.png)


在上图中，假如第一个着色点能接收6条光线，则当着色点旋转45°后，它就只能接收4条光线了。  
因此，我们会用入射光线l 和着色点法线n的夹角的余弦值，来表示着色点的受光程度。
```js
cosθ = l·n
```
解释一下上面的等式是怎么来的。

由点积公式得：
```js
l·n = cosθ * |l| * |n|
```

`所以`：
```js
cosθ = l·n / (|l| * |n|)
```

`因为`：l,n为单位向量

`所以`：
```js
cosθ = l·n / (1 * 1)
cosθ = l·n
```
### 2.光线的衰减

光在传播的过程中会产生衰减。  
着色点到光源的距离越远，着色点接收到的光能就越少。

现实世界中影响光线衰减的因素有很多，比如天气情况、空气质量等。  
我们这里的图形学可以先不考虑太多，我们可以用一个简单的公式来模拟光线的衰减。  
![](/webgl-share/138.png)


`已知`：  

I是光源的强度  
r 是着色点到光源的距离  
求：着色点处的光线强度intensity  

`解`：
```js
intensity = I / r²
```
`注`：

有些光的光线衰减是可以被忽略的，比如从窗外打进房间里的阳光。  
其原理就是，无论光线方向还是光线衰减，只要其在一定范围内变化极小，那就可以忽略，从而提高渲染速度。

接下来，把上面的已知条件和公式做一下梳理，求一下着色点的漫反射。

### 3.漫反射

#### 3.1漫反射公式

![](/webgl-share/136.png)

漫反射的计算公式：
```js
Ld = kd(I / r²) * max(0, n·l)
```
- Ld-diffusely reflected light 漫反射
- kd-diffuse coefficient 漫反射系数，即颜色
- I/r² 着色点处的光线强度
- max(0, n·l) 着色点接收到的光线数量

`注`：漫反射和 视线v 没有任何关系，这是因为漫反射是向四面八方反射的。

接下来，利用这个公式为webgl的世界添加一片阳光。

#### 3-2-漫反射示例

`已知`：

- 球体
  - 漫反射系数 u_Kd
- 球体被阳光照射
- 阳光的特性：
  - 平行光
  - 光线方向为 u_LightDir
  - 光线强度为1，衰减忽略

`求`：球体的漫反射

::: details 代码实现
```html{19,62,79}
<canvas id="canvas"></canvas>
<script id="vs" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  attribute vec3 a_Normal;
  uniform mat4 u_PvMatrix;
  uniform mat4 u_ModelMatrix;
  varying vec3 v_Normal;
  void main(){
    gl_Position = u_PvMatrix * u_ModelMatrix * a_Position;
    v_Normal = a_Normal;
  }
</script>
<script id="fs" type="x-shader/x-fragment">
  precision mediump float;
  uniform vec3 u_Kd;
  uniform vec3 u_LightDir;
  varying vec3 v_Normal;
  void main(){
    vec3 diffuse = u_Kd * max(0.0, dot(v_Normal, u_LightDir));
    gl_FragColor = vec4(diffuse, 1.0);
  }
</script>
<script type="module">
  import { createProgram } from '../jsm/Utils.js';
  import {
    Matrix4,
    PerspectiveCamera,
    Vector3,
    SphereGeometry
  } from 'https://unpkg.com/three/build/three.module.js';
  import OrbitControls from './lv/OrbitControls.js';
  import Mat from './lv/Mat.js';
  import Geo from './lv/Geo.js';
  import Obj3D from './lv/Obj3D.js';
  import Scene from './lv/Scene.js';

  const canvas = document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  let gl = canvas.getContext('webgl');
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.DEPTH_TEST);


  //目标点
  const target = new Vector3()
  //视点
  const eye = new Vector3(0, 0, 3)
  const [fov, aspect, near, far] = [
    45, canvas.width / canvas.height,
    1, 20
  ]
  // 透视相机
  const camera = new PerspectiveCamera(fov, aspect, near, far)
  camera.position.copy(eye)
  // 轨道控制器
  const orbit = new OrbitControls({ camera, target, dom: canvas, })


  /* 声明已知条件 */
  // 阳光光线方向
  const lightDir = new Vector3(0.5, 1, 1).normalize()
  // 漫反射系数- 颜色
  const u_Kd = [0.7, 0.7, 0.7]
  // 球体
  const sphere = new SphereGeometry(0.5, 24, 24)
  // 顶点集合
  const { array: vertices } = sphere.getAttribute('position')
  // 法线集合
  const { array: normals } = sphere.getAttribute('normal')
  // 顶点索引集合
  const { array: indexes } = sphere.index
  // 注意：球体是使用three.js 的SphereGeometry 对象建立的，
  //可以直接从这里面提取球体的顶点集合、法线集合和顶点索引。


  /* 绘图 */
  // 场景
  const scene = new Scene({ gl })
  //注册程序对象
  scene.registerProgram(
    'Blinn-Phong',
    {
      program: createProgram(
        gl,
        document.getElementById('vs').innerText,
        document.getElementById('fs').innerText,
      ),
      attributeNames: ['a_Position', 'a_Normal'],
      uniformNames: [
        'u_PvMatrix', 'u_ModelMatrix', 'u_Kd', 'u_LightDir'
      ]
    }
  )

  const mat = new Mat({
    program: 'Blinn-Phong',
    data: {
      u_PvMatrix: {
        value: orbit.getPvMatrix().elements,
        type: 'uniformMatrix4fv',
      },
      u_ModelMatrix: {
        value: new Matrix4().elements,
        type: 'uniformMatrix4fv',
      },
      u_Kd: {
        value: u_Kd,
        type: 'uniform3fv'
      },
      u_LightDir: {
        value: [...lightDir],
        type: 'uniform3fv'
      },
    },
  })
  const geo = new Geo({
    data: {
      a_Position: {
        array: vertices,
        size: 3
      },
      a_Normal: {
        array: normals,
        size: 3
      }
    },
    index: {
      array: indexes
    }
  })
  const obj = new Obj3D({ geo, mat })
  scene.add(obj)
  scene.draw()

  !(function ani() {
    orbit.getPvMatrix()
    scene.draw()
    requestAnimationFrame(ani)
  })()

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
</script>
```
效果：  
![](/webgl-share/139.png)

注意：  
微调Scene对象中用顶点索引绘图的方法：

将之前的gl.UNSIGNED_BYTE变成gl.UNSIGNED_SHORT。
```js
gl.drawElements(gl[mode],count, gl.UNSIGNED_SHORT,0)
```

之前用顶点索引绘图时，用的数据类型是gl.UNSIGNED_BYTE，如：
```js
gl.drawElements(gl.TRIANGLES,3,gl.UNSIGNED_BYTE,0)
```

此数据类型只能用Uint8Array对象建立顶点索引集合，如：
```js
index: {
  array: new Uint8Array([……])
}
```

然而，Uint8Array 有个弊端，其数据的取值范围只能是[0,255]，这就导致了一个模型的顶点数量不能超过256。

因此，我们需要扩大顶点索引的取值范围，比如用Uint16Array 建立顶点索引。  
Uint16Array数据的取值范围是[0,65535 ]，这对于一般模型而言，已经够用了。  

在three.js  里，其顶点索引用的就是Uint16Array 。  
使用Uint16Array 后，drawElements() 方法里的数据类型就需要变成gl.UNSIGNED_SHORT。
:::

### 4.镜面反射
#### 4.1镜面反射公式

塑料和石膏的差异在于其表面比较光滑，更加接近镜面，会有明显的高光存在。  
我们通过镜面反射考虑一下，我们的眼睛什么时候可以看见物体的高光。  
![](/webgl-share/140.png)

在上图中，方向R 便是 光线I 在物体表面的镜面反射方向，R 和 l 基于法线 n 对称。
当视线v 接近R的时候，便可以看见高光。

因此，Phone 提出了通过∠<v,R> 的夹角来判断眼睛能否看见高光的方法。  
然而，要基于 光线l 和 法线n 去求 l 的反射向量R，是需要不小的计算量的。

所以，后来 Blinn 就对 Phone 的方案作出了改进，设计出了更简便的 Blinn-Phone 材质。
接下来，看一下Blinn-Phone 材质的设计思路。   
![](/webgl-share/141.png)

上图中，向量h 是∠<v,v+l> 的角平分线。

通过观察，我们可以知道：  
随视线的变换，∠<h,n> 和∠<v,R> 的大小是成正比的。  
也就说，当视线v 越接近镜面反射R ，角平分线h就越接近法线n。

Blinn-Phone 计算镜面反射的公式如下：
```js
h = (v+l) / |v+l|
Ls = ks * (I / r²) * pow(max(0, n·h), p)
```

- h：∠<v,v+l> 的角平分线
- |v+l|：(v+l) 的长度
- Ls：镜面反射 specularly reflected light
- ks：镜面反射系数 specularly coefficient
- max(0,n·h)：cos∠<h,n>
- pow(max(0,n·h),p)：cos∠<h,n>的p次方

解释一下cos∠<h,n>的p次方的意义。  
若只用cos∠<h,n> 来计算高光，会得到较大的高光，而我们平时所见的高光一般都是比较小的。  
因此，我们可以对cos∠<h,n>做一下幂运算。  
![](/webgl-share/142.png)

#### 4.1镜面反射示例

接下来，还是基于之前的那个球体来做一下镜面反射。

`已知`：

- 球体
  - 漫反射系数 u_Kd
  - 镜面反射系数 u_Ks
- 球体被阳光照射
- 阳光的特性：
  - 平行光
  - 光线方向为 u_LightDir
  - 光线强度为 1，衰减忽略
- 视点位置：u_Eye

`求`：球体的镜面反射

::: details 代码实现
```html{33,84}
<canvas id="canvas"></canvas>
<script id="vs" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  attribute vec3 a_Normal;
  uniform mat4 u_PvMatrix;
  uniform mat4 u_ModelMatrix;
  varying vec3 v_Normal;
  varying vec3 v_Position;
  void main(){
    gl_Position = u_PvMatrix * u_ModelMatrix * a_Position;
    v_Normal = a_Normal;
    v_Position = vec3(a_Position);
  }
</script>
<script id="fs" type="x-shader/x-fragment">
  precision mediump float;
  uniform vec3 u_Kd;
  uniform vec3 u_Ks;
  uniform vec3 u_LightDir;
  uniform vec3 u_Eye;
  varying vec3 v_Normal;
  varying vec3 v_Position;
  void main(){
    //视点看向当前着色点的视线
    vec3 eyeDir = normalize(u_Eye - v_Position);

    //角平分线
    vec3 h= normalize(eyeDir + u_LightDir);

    //漫反射
    vec3 diffuse = u_Kd * max(0.0, dot(v_Normal, u_LightDir));

    //镜面反射
    vec3 specular = u_Ks * pow(
      max(0.0, dot(v_Normal,h)),
      64.0
    );

    //Blinn-Phong 反射
    vec3 l = diffuse + specular;

    gl_FragColor = vec4(l, 1.0);
  }
</script>
<script type="module">
  import { createProgram } from '../jsm/Utils.js';
  import {
    Matrix4,
    PerspectiveCamera,
    Vector3,
    SphereGeometry
  } from 'https://unpkg.com/three/build/three.module.js';
  import OrbitControls from './lv/OrbitControls.js'
  import Mat from './lv/Mat.js'
  import Geo from './lv/Geo.js'
  import Obj3D from './lv/Obj3D.js'
  import Scene from './lv/Scene.js'

  const canvas = document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  let gl = canvas.getContext('webgl');
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.DEPTH_TEST);


  // 目标点
  const target = new Vector3()
  //视点
  const eye = new Vector3(0, 0, 3)
  const [fov, aspect, near, far] = [
    45, canvas.width / canvas.height,
    1, 20
  ]
  // 透视相机
  const camera = new PerspectiveCamera(fov, aspect, near, far)
  camera.position.copy(eye)
  // 轨道控制器
  const orbit = new OrbitControls({ camera, target, dom: canvas, })

  
  /* 声明已知条件 */
  // 阳光光线方向
  const lightDir = new Vector3(0.5, 1, 1).normalize()
  // 漫反射系数- 颜色
  const u_Kd = [0.7, 0.7, 0.7]
  // 镜面反射系数
  const u_Ks = [0.3, 0.3, 0.3]

  // 球体
  const sphere = new SphereGeometry(0.5, 32, 32)
  // 顶点集合
  const { array: vertices } = sphere.getAttribute('position')
  // 法线集合
  const { array: normals } = sphere.getAttribute('normal')
  // 顶点索引集合
  const { array: indexes } = sphere.index

  // 场景
  const scene = new Scene({ gl })
  //注册程序对象
  scene.registerProgram(
    'Blinn-Phong',
    {
      program: createProgram(
        gl,
        document.getElementById('vs').innerText,
        document.getElementById('fs').innerText,
      ),
      attributeNames: ['a_Position', 'a_Normal'],
      uniformNames: [
        'u_PvMatrix', 'u_ModelMatrix', 'u_Kd', 'u_LightDir',
        'u_Ks', 'u_Eye'
      ]
    }
  )

  const mat = new Mat({
    program: 'Blinn-Phong',
    data: {
      u_PvMatrix: {
        value: orbit.getPvMatrix().elements,
        type: 'uniformMatrix4fv',
      },
      u_ModelMatrix: {
        value: new Matrix4().elements,
        type: 'uniformMatrix4fv',
      },
      u_Kd: {
        value: u_Kd,
        type: 'uniform3fv'
      },
      u_LightDir: {
        value: [...lightDir],
        type: 'uniform3fv'
      },
      u_Ks: {
        value: u_Ks,
        type: 'uniform3fv'
      },
      u_Eye: {
        value: [...camera.position],
        type: 'uniform3fv'
      },

    },
  })
  const geo = new Geo({
    data: {
      a_Position: {
        array: vertices,
        size: 3
      },
      a_Normal: {
        array: normals,
        size: 3
      }
    },
    index: {
      array: indexes
    }
  })
  const obj = new Obj3D({ geo, mat })
  scene.add(obj)
  scene.draw()

  !(function ani() {
    orbit.getPvMatrix()
    scene.setUniform('u_Eye', {
      value: [...camera.position]
    })
    scene.draw()
    requestAnimationFrame(ani)
  })()

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
</script>
```
效果：  
![](/webgl-share/143.png)
:::

### 5.环境反射

#### 5.1环境反射的公式

```js
La = ka * Ia
```

- La：环境反射 reflected ambient light
- ka：环境光系数 ambient coefficient
- Ia：环境光强度 ambient intensity

#### 5.2环境反射示例

`已知`：

- 球体
  - 漫反射系数 u_Kd
  - 镜面反射系数 u_Ks
- 球体被阳光照射

- 阳光的特性：
  - 平行光
  - 光线方向为 u_LightDir
  - 光线强度为 1，衰减忽略
- 视点位置：camera.position
- 环境光系数：u_Ka
- 环境光强度：1

`求`：球体的环境反射

::: details 代码实现
```html{19,41,91,116,148}
<canvas id="canvas"></canvas>
<script id="vs" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  attribute vec3 a_Normal;
  uniform mat4 u_PvMatrix;
  uniform mat4 u_ModelMatrix;
  varying vec3 v_Normal;
  varying vec3 v_Position;
  void main(){
    gl_Position = u_PvMatrix * u_ModelMatrix * a_Position;
    v_Normal = a_Normal;
    v_Position = vec3(a_Position);
  }
</script>
<script id="fs" type="x-shader/x-fragment">
  precision mediump float;
  uniform vec3 u_Kd;
  uniform vec3 u_Ks;
  uniform vec3 u_Ka;
  uniform vec3 u_LightDir;
  uniform vec3 u_Eye;
  varying vec3 v_Normal;
  varying vec3 v_Position;
  void main(){
    //视点看向当前着色点的视线
    vec3 eyeDir = normalize(u_Eye - v_Position);

    //角平分线
    vec3 h = normalize(eyeDir + u_LightDir);

    //漫反射
    vec3 diffuse = u_Kd * max(0.0, dot(v_Normal, u_LightDir));

    //镜面反射
    vec3 specular = u_Ks * pow(
      max(0.0, dot(v_Normal, h)),
      64.0
    );

    //Blinn-Phong 反射 (漫反射 + 镜面反射 + 环境反射)
    vec3 l = diffuse + specular + u_Ka;

    gl_FragColor=vec4(l, 1.0);
  }
</script>
<script type="module">
  import { createProgram } from '../jsm/Utils.js';
  import {
    Matrix4, 
    PerspectiveCamera, 
    Vector3,
    SphereGeometry
  } from 'https://unpkg.com/three/build/three.module.js';
  import OrbitControls from './lv/OrbitControls.js';
  import Mat from './lv/Mat.js';
  import Geo from './lv/Geo.js';
  import Obj3D from './lv/Obj3D.js';
  import Scene from './lv/Scene.js';

  const canvas = document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  let gl = canvas.getContext('webgl');
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.DEPTH_TEST);


  // 目标点
  const target = new Vector3()
  //视点
  const eye = new Vector3(0, 0, 3)
  const [fov, aspect, near, far] = [
    45, canvas.width / canvas.height,
    1, 20
  ]
  // 透视相机
  const camera = new PerspectiveCamera(fov, aspect, near, far)
  camera.position.copy(eye)
  // 轨道控制器
  const orbit = new OrbitControls({ camera, target, dom: canvas, })

  // 阳光光线方向
  const lightDir = new Vector3(0.5, 1, 1).normalize()
  // 漫反射系数- 颜色
  const u_Kd = [0.7, 0.7, 0.7]
  // 镜面反射系数
  const u_Ks = [0.2, 0.2, 0.2]
  //环境反射系数
  const u_Ka = [0.2, 0.2, 0.2]

  // 球体
  const sphere = new SphereGeometry(0.5, 32, 32)
  // 顶点集合
  const { array: vertices } = sphere.getAttribute('position')
  // 法线集合
  const { array: normals } = sphere.getAttribute('normal')
  // 顶点索引集合
  const { array: indexes } = sphere.index

  // 场景
  const scene = new Scene({ gl })
  //注册程序对象
  scene.registerProgram(
    'Blinn-Phong',
    {
      program: createProgram(
        gl,
        document.getElementById('vs').innerText,
        document.getElementById('fs').innerText,
      ),
      attributeNames: ['a_Position', 'a_Normal'],
      uniformNames: [
        'u_PvMatrix', 'u_ModelMatrix', 'u_Kd', 'u_LightDir',
        'u_Ks', 'u_Eye', 'u_Ka'
      ]
    }
  )

  const mat = new Mat({
    program: 'Blinn-Phong',
    data: {
      u_PvMatrix: {
        value: orbit.getPvMatrix().elements,
        type: 'uniformMatrix4fv',
      },
      u_ModelMatrix: {
        value: new Matrix4().elements,
        type: 'uniformMatrix4fv',
      },
      u_Kd: {
        value: u_Kd,
        type: 'uniform3fv'
      },
      u_LightDir: {
        value: [...lightDir],
        type: 'uniform3fv'
      },
      u_Ks: {
        value: u_Ks,
        type: 'uniform3fv'
      },
      u_Eye: {
        value: [...camera.position],
        type: 'uniform3fv'
      },
      u_Ka: {
        value: [...u_Ka],
        type: 'uniform3fv'
      },

    },
  })
  const geo = new Geo({
    data: {
      a_Position: {
        array: vertices,
        size: 3
      },
      a_Normal: {
        array: normals,
        size: 3
      }
    },
    index: {
      array: indexes
    }
  })
  const obj = new Obj3D({ geo, mat })
  scene.add(obj)
  scene.draw()

  !(function ani() {
    orbit.getPvMatrix()
    scene.setUniform('u_Eye', {
      value: [...camera.position]
    })
    scene.draw()
    requestAnimationFrame(ani)
  })()

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
</script>
```
效果：  
![](/webgl-share/144.png)
:::
### 6.Blinn-Phong反射模型

之前将漫反射Diffuse 、高光Specular 和 环境光Ambient 加在一起的方法，就叫Blinn-Phong 反射模型，即：
```js
L = Ld + Ls + La 
L = kd(I/r²)*max(0,n·l) + ks*(I/r²)*pow(max(0,n·h),p) +  ka*Ia
```

通过上面的示例，可以知道：

- 漫反射可以让物体具有体感；
- 镜面反射可以让物体在我们眼前一亮；
- 环境反射可以让物体看起来更加细腻。

现在应该对于着色有了一定的认知，接下来再说一个之前跳过的知识点-着色频率。


## 二十二、着色频率

着色频率与法线是息息相关的，所以得先从法线说起。  
法线就是垂直于着色点的一个单位向量，如下图：  
![](/webgl-share/136.png)

在 webgl 中建立的模型是用三角形拼起来的，而不是用着色点拼起来的，那么之前在片元着色器里计算的法线是怎么来的呢？

那是从three.js的SphereGeometry 对象里来的。  
那SphereGeometry 对象是怎么算法线的呢？   
不妨先看一下法线的分布效果。  
### 1.法线

1. 准备一份用于绘制法线的辅助线的着色器
```html
<script id="vl" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    uniform mat4 u_PvMatrix;
    void main(){
      gl_Position = u_PvMatrix * a_Position;
    }
</script>
<script id="fl" type="x-shader/x-fragment">
    void main(){
      gl_FragColor = vec4(1.0);
    }
</script>
```

2. 建立一个获取法线辅助线的顶点数据的方法 (顶点集合,法线集合,长度)
```js
function getNormalHelper(vertices, normals,length=0.2) {
  const normalVertices = []
  for (let i = 0; i < normals.length; i += 3) {
    // 模型的顶点点位
    const p1 = new Vector3(
      vertices[i], vertices[i + 1], vertices[i + 2]
    )
    // 将法线从模型顶点向外延伸
    const p2 = new Vector3(
      normals[i], normals[i + 1], normals[i + 2]
    )
      .setLength(length)
      .add(p1)
    normalVertices.push(...p1, ...p2)
  }
  return new Float32Array(normalVertices)
}
```

3. 绘制法线辅助线
```js
scene.registerProgram(
  'line',
  {
    program: createProgram(
      gl,
      document.getElementById('vl').innerText,
      document.getElementById('fl').innerText
    ),
    attributeNames: ['a_Position'],
    uniformNames: ['u_PvMatrix']
  }
)
const matN = new Mat({
  program: 'line',
  data: {
    u_PvMatrix: {
      value: orbit.getPvMatrix().elements,
      type: 'uniformMatrix4fv',
    },
  },
  mode: 'LINES',
})
const geoN = new Geo({
  data: {
    a_Position: {
      array: getNormalHelper(vertices, normals),
      size: 3
    },
  },
})
const objN = new Obj3D({ geo: geoN, mat: matN })
scene.add(objN)
```
效果：  
![](/webgl-share/145.png)

由此可见，three.js 里的这个SphereGeometry对象的法线是由球心向四周反射。  
然而，模型的法线法线除了像上面这样分布，还有没有其它的分布方法呢？  
这就涉及着色频率的问题，接下来就通过着色频率说一下模型法线常见的设置方法。  

### 2.认识着色频率

![](/webgl-share/146.png)

常见的着色频率有三种：

- 逐三角形着色(flat shading)：模型的每个面都拥有统一的法线，效果比较硬朗。
- 逐顶点着色(gouraud shading)：模型的每个顶点都拥有各自的法线。

  每三个点构成的三角形的内部的点的法线会通过三角形的插值算法计算出来。  
  webgl 着色器已经通过varying 变量实现了此功能。  
  效果比较平滑，但是三角形太大的话，高光就看不见了。  

- 逐片元着色(phong shading)：模型的每个片元都拥有各自的法线，由phong 提出。

接下来，考虑一下要渲染一个光滑球体，用哪种着色频率合适。  
![](/webgl-share/147.png)

上图自上而下，球体顶点的数量是由少到多的。  
由图可知：

- 当顶点数量很少时：
  - 逐三角形着色效果生硬，渲染速度最快。
  - 逐顶点着色效果较为平滑，会失去高光，渲染速度适中。
  - 逐片元着色效果最为平滑，渲染速度最慢。
- 当顶点数量适中时，若对效果要求不苛刻，适合用顶点着色。因为其具有平滑的效果和高光，渲染速度也适中。
- 当顶点达到一定的数量，三种着色频率的着色效果都是一样的，且逐片元着色频率的渲染速度不一定会比其他的两种着色频率慢。

接下来用代码写一下上面的着色频率。  
为了对着色频率有一个深刻的认知，先自己写个球体。

### 3.球体

对于球体的绘制原理，将其展开就很好理解了。  
![](/webgl-share/148.png)

上图是一个4行6列的球体。

在绘制的时候，只要将其分成两部分考虑就可以了：

- 上下两行三角形
- 中间的矩阵

接下来建立一个Sphere对象。

- 属性：
  - r：半径
  - widthSegments：横向段数，最小3段
  - heightSegments：纵向段数，最小3段
  - vertices：顶点集合
  - normals：法线集合
  - indexes：顶点索引集合
  - count：顶点数量
- 方法
  - init() 基于球体的半径和分段，计算其用于顶点索引绘图的数据
  - getTriangles() 基于顶点索引集合解析出相对应的顶点集合，可以用于独立三角形的绘制
  - getVertice(ind) 基于某个顶点索引获取顶点

代码实现：

1. 建立 Sphere 球体对象
```js
import {Vector3,Spherical} from 'https://unpkg.com/three/build/three.module.js';

/*
属性：
  r：半径
  widthSegments：横向段数，最小3端
  heightSegments：纵向段数，最小3端
  vertices：顶点集合
  normals：法线集合
  indexes：顶点索引集合
  count：顶点数量
*/
export default class Sphere{
  constructor(r=1, widthSegments=16, heightSegments=16){
    this.r=r
    this.widthSegments=widthSegments
    this.heightSegments=heightSegments
    this.vertices=[]
    this.normals=[]
    this.indexes = []
    this.count=0
    this.init()
  }
  init() {
    const { r, widthSegments, heightSegments } = this
    //顶点数量
    this.count = widthSegments * (heightSegments - 1) + 2
    // 球坐标系
    const spherical = new Spherical()
    // theta和phi方向的旋转弧度
    const thetaSize = Math.PI * 2 / widthSegments
    const phiSize = Math.PI / heightSegments

    // 顶点集合，先内置北极点
    const vertices = [0, r, 0]
    // 法线集合，先内置北极法线
    const normals = [0, 1, 0]
    // 顶点索引集合
    const indexes = []
    // 最后一个顶点索引
    const lastInd = this.count-1
    // 逐行列遍历
    for (let y = 0; y < heightSegments; y++) {
      // 球坐标垂直分量
      const phi = phiSize * y
      for (let x1 = 0; x1 < widthSegments; x1++) {
        // x1后的两列
        const x2 = x1 + 1
        const x3 = x2 % widthSegments + 1
        if (y) {
          // 计算顶点和法线
          spherical.set(r, phi, thetaSize * x1)
          const vertice = new Vector3().setFromSpherical(spherical)
          vertices.push(...vertice)
          normals.push(...vertice.normalize())
        } else {
          // 第一行的三角网
          indexes.push(0, x2, x3)
        }
        if (y < heightSegments - 2) {
          // 一个矩形格子的左上lt、右上rt、左下lb、右下rb点
          const lt = y * widthSegments + x2
          const rt = y * widthSegments + x3
          const lb = (y + 1) * widthSegments + x2
          const rb = (y + 1) * widthSegments + x3
          // 第一行和最后一行中间的三角网
          indexes.push(lb, rb, lt, lt, rb, rt)
          if (y === heightSegments - 3) {
            // 最后一行的三角网
            indexes.push(lastInd, rb, lb)
          }
        }
      }
    }
    // 南极顶点
    vertices.push(0, -r, 0)
    // 南极法线
    normals.push(0, -1, 0)

    this.vertices=new Float32Array(vertices)
    this.normals=new Float32Array(normals)
    this.indexes=new Uint16Array(indexes)
  }

  getTriangles() {
    const {indexes}=this
    // 顶点集合
    const vertices = []
    // 通过顶点索引遍历三角形
    for (let i = 0; i < indexes.length; i += 3) {
      // 三角形的三个顶点
      const p0 = this.getVertice(indexes[i])
      const p1 = this.getVertice(indexes[i + 1])
      const p2 = this.getVertice(indexes[i + 2])
      vertices.push(...p0, ...p1, ...p2)
    }
    return new Float32Array(vertices)
  }

  getVertice(ind) {
    const {vertices}=this
    const i = ind * 3
    return new Vector3(vertices[i], vertices[i + 1], vertices[i + 2])
  }
}
```

2. 实例化 Sphere 对象，将之前 three.js 的 SphereGeometry 对象替换掉
```js
import Sphere from './jsm/Sphere.js'
const sphere = new Sphere(0.5, 6, 4)
const { vertices, indexes,normals } = sphere
```

接下来，就用不同的着色频率为这个球体着色。


### 4.Flat逐三角形着色

逐三角形着色的法线是比较好算的，直接通过三角形两边的叉乘便可以得到。

1. 建立一个专门用于计算着色频率的模块。

ShadingFrequency.js
```js
import {Vector3} from 'https://unpkg.com/three/build/three.module.js';

// 逐三角形着色
function flatShading(vertices, indexes) {
  // flat 法线集合
  const normals = []
  // 通过顶点索引遍历三角形
  for (let i = 0; i < indexes.length; i += 3) {
    // 三角形的三个顶点
    const p0 = getVertice(vertices, indexes[i])
    const p1 = getVertice(vertices, indexes[i + 1])
    const p2 = getVertice(vertices, indexes[i + 2])
    // 三角面的法线
    const n = p2.clone().sub(p1)
      .cross(
        p0.clone().sub(p1)
      ).normalize()
    
    normals.push(...n, ...n, ...n)
  }
  return new Float32Array(normals)
}

// 获取顶点
function getVertice(vertices, ind) {
  const i = ind * 3
  return new Vector3(vertices[i], vertices[i + 1], vertices[i + 2])
}

export {
  flatShading,
}
```

2. 在项目文件中调用上面逐三角形着色的方法。
```js
import { flatShading } from './jsm/ShadingFrequency.js'

// 球体
const sphere = new Sphere(0.5, 12, 12)
// 用独立三角形绘制球体的顶点
const vertices = sphere.getTriangles()
// 逐三角形着色的法线
const normals = flatShading(sphere.vertices, sphere.indexes)
```

因为在逐三角形着色的模型中，每个顶点都有不同的法线，所以不需要再使用顶点索引绘图了，直接用独立三角形gl.TRIANGLES  绘图即可。

3. 绘图
```js
// 场景
const scene = new Scene({ gl })
// 注册程序对象
scene.registerProgram(
  'Blinn-Phong',
  {
    program: createProgram(
      gl,
      document.getElementById('vs').innerText,
      document.getElementById('fs').innerText
    ),
    attributeNames: ['a_Position', 'a_Normal'],
    uniformNames: [
      'u_PvMatrix', 'u_ModelMatrix', 'u_Kd', 'u_LightDir',
      'u_Ks', 'u_Eye', 'u_Ka'
    ]
  }
)
const mat = new Mat({
  program: 'Blinn-Phong',
  data: {
    u_PvMatrix: {
      value: orbit.getPvMatrix().elements,
      type: 'uniformMatrix4fv',
    },
    u_ModelMatrix: {
      value: new Matrix4().elements,
      type: 'uniformMatrix4fv',
    },
    u_LightDir: {
      value: Object.values(LightDir),
      type: 'uniform3fv',
    },
    u_Kd: {
      value: u_Kd,
      type: 'uniform3fv',
    },
    u_Ks: {
      value: u_Ks,
      type: 'uniform3fv',
    },
    u_Ka: {
      value: u_Ka,
      type: 'uniform3fv',
    },
    u_Eye: {
      value: Object.values(camera.position),
      type: 'uniform3fv',
    },
  },
  mode: 'TRIANGLES',
})
const geo = new Geo({
  data: {
    a_Position: {
      array: vertices,
      size: 3
    },
    a_Normal: {
      array: normals,
      size: 3
    },
  },
})
const obj = new Obj3D({ geo, mat })
scene.add(obj)

scene.registerProgram(
  'line',
  {
    program: createProgram(
      gl,
      document.getElementById('vl').innerText,
      document.getElementById('fl').innerText
    ),
    attributeNames: ['a_Position'],
    uniformNames: ['u_PvMatrix']
  }
)
const matN = new Mat({
  program: 'line',
  data: {
    u_PvMatrix: {
      value: orbit.getPvMatrix().elements,
      type: 'uniformMatrix4fv',
    },
  },
  mode: 'LINES',
})
const geoN = new Geo({
  data: {
    a_Position: {
      array: getNormalHelper(vertices, normals),
      size: 3
    },
  },
})
const objN = new Obj3D({ geo: geoN, mat: matN })
scene.add(objN)

scene.draw()
```

最终效果如下：  
![](/webgl-share/149.png)

接下来，再考虑一下逐顶点着色的法线。

`注`：

在对使用模型矩阵变换模型的时候，需要将顶点的和法线的插值一起变换。

这是我们之前的顶点着色器：

```html
<script id="vs" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    attribute vec3 a_Normal;
    uniform mat4 u_PvMatrix;
    uniform mat4 u_ModelMatrix;
    varying vec3 v_Normal;
    varying vec3 v_Position;
    void main(){
      gl_Position = u_PvMatrix*u_ModelMatrix*a_Position;
      v_Normal=a_Normal;
      v_Position=vec3(a_Position);
    }
</script>
```

需要让上面的的v_Normal和v_Position也受模型矩阵u_ModelMatrix的影响。

```html
<script id="vs" type="x-shader/x-vertex">
    ……
    void main(){
      vec4 worldPos = u_ModelMatrix * a_Position;
      gl_Position = u_PvMatrix * worldPos;
      v_Normal = normalize(mat3(u_ModelMatrix) * a_Normal);
      v_Position = vec3(worldPos);
    }
</script>
```
- u_ModelMatrix*a_Position 是模型矩阵对顶点的变换
- mat3(u_ModelMatrix) 是为了提取模型矩阵的变换因子，也就是去掉位移数据
- mat3(u_ModelMatrix)*a_Normal 就是对法线的变换，变换之后，别忘了再用normalize 方法将其归一化

### 5.Gouraud逐顶点着色

#### 5.1算法原理

three.js 里SphereGeometry 对象的法线，就是用于逐顶点着色的。  
![](/webgl-share/150.png)


然而，如果一个模型不是球体，应该如何计算其逐顶点着色的法线呢？  
我们可以这么算：求顶点相邻三角形法线的均值。
![](/webgl-share/151.png)

以上图中的顶点法线Nv 为例，其计算公式如下  
![](/webgl-share/152.png)

然而，为了追求更好的效果，我们还可以在求均值的时候，基于三角形的面积做一下加权处理。

#### 5.2代码实现

1. 在之前的ShadingFrequency.js 文件里添加一个gouraudShading() 方法，用于获取逐顶点着色的法线。

gouraudShading(vertices, indexes,type=1)

- vertices 顶点集合
- indexes 顶点索引集合
- type 计算法线的方式
  - 0，相邻三角形的法线的平均值
  - 1，相邻的三角形法线基于面积的加权平均值，默认

```js
function gouraudShading(vertices, indexes,type=1) {
  const normals = []
  for (let i = 0; i < vertices.length / 3; i++) {
    normals.push(...getGouraudNormal(i,vertices,indexes,type))
  }
  return new Float32Array(normals)
}
//基于顶点索引获取顶点的法线
function getGouraudNormal(ind, vertices, indexes, type) {
  // 法线
  const normal = new Vector3()
  if (type) {
    // 与顶点相邻三角形的数据集合
    const triangles = []
    // 与顶点相邻三角形的面积的总和
    let sumArea = 0
    // 寻找相邻三角形
    findTriangles(ind,vertices, indexes, n => {
      const area = n.length()
      sumArea += area
      triangles.push({n,area})
    })
    // 加权平均值
    triangles.forEach(({ n, area }) => {
      normal.add(
        n.setLength(area / sumArea)
      )
    })
  } else {
    // 与顶点相邻三角形的法线的总和
    findTriangles(ind,vertices, indexes, n => {
      normal.add(n.normalize())
    })
    // 法线之和归一化
    normal.normalize()
  }
  return normal
}

// 寻找与顶点相邻的所有三角形
function findTriangles(ind,vertices, indexes,fn) {
  for (let i = 0; i < indexes.length; i += 3) {
    // 寻找共点三角形
    if (indexes.slice(i, i + 3).includes(ind)) {
      // 三角形的三个顶点
      const p0 = getVertice(vertices, indexes[i])
      const p1 = getVertice(vertices, indexes[i + 1])
      const p2 = getVertice(vertices, indexes[i + 2])
      // 三角面的法线
      const n = p2.clone().sub(p1)
        .cross(
          p0.clone().sub(p1)
      )
      fn(n)
    }
  }
} 
```

2. 使用之前的球体测试一下

```js
import { gouraudShading } from './jsm/ShadingFrequency.js'

const sphere = new Sphere(0.5, 12, 12)
const { vertices, indexes } = sphere
const normals = gouraudShading(vertices, indexes)
```
效果如下：  
![](/webgl-share/153.png)

由上图可见，高光没了。  
这就是逐顶点着色的弊端，只要面数不够，高光就没了。  
若是用逐片元着色来绘图，这个问题就不会出现。  

### 6.Phong-逐片元着色

之前逐顶点着色时，在片元着色器里计算的法线插值已经不一定是单位向量，而是长度小于等于1的向量。
比如下图中橙色法线之间的黑色向量，其长度已经小于了1，这就是逐顶点着色中高光消失的原因。    
![](/webgl-share/154.png)


若想让高光出现，将黑色向量单位化即可，也就是让其长度再加上蓝色的那一段，如此着色的方法就叫逐片元着色。  
接下里，我们可以直接基于逐顶点着色的方法改一下片元着色器即可。

```js
<script id="fs" type="x-shader/x-fragment">
    precision mediump float;
    uniform vec3 u_Kd;
    uniform vec3 u_Ks;
    uniform vec3 u_Ka;
    uniform vec3 u_LightDir;
    uniform vec3 u_Eye;
    varying vec3 v_Normal;
    varying vec3 v_Position;

    void main(){
      //法线插值归一化
      vec3 normal=normalize(v_Normal);
      //眼睛看向当前着色点的视线
      vec3 eyeDir=normalize(u_Eye-v_Position);
      //视线与光线之和
      vec3 el=eyeDir+u_LightDir;
      //视线与光线的角平分线
      vec3 h=el/length(el);
      //漫反射
      vec3 diffuse=u_Kd*max(0.0,dot(normal,u_LightDir));
      //反射
      vec3 specular=u_Ks*pow(
        max(0.0,dot(normal,h)),
        64.0
      );
      //Blinn-Phong反射
      vec3 l=diffuse+specular+u_Ka;
      gl_FragColor=vec4(l,1.0);
    }
</script>
```
效果如下：  
![](/webgl-share/155.png)

上面球体的宽、高段数是6和4，面数很低，但其表面效果依旧很细腻，这就是逐片元着色的优势。


## 二十三、光源类型

之前用平行光说了着色频率的概念。  
光源除了平行光，还有点光源，若对平行光和点光源的照射范围和衰减做限制，还会衍生出筒灯、聚光灯等类型的灯光。
### 1.筒灯
#### 1.1筒灯概念

对平行光的照射范围做限制后，其灯光打出的效果便可以如下图一样：  
![](/webgl-share/156.png)

筒灯的照射方式如下：  
![](/webgl-share/157.png)

通过上面的两个图，可以知道，要把平行光限制成筒灯，需要以下已知条件：

- 筒灯位置  u_LightPos
- 筒灯目标点  u_LightTarget
- 光照强度 u_Intensity
- 衰减距离 
  - 衰减起始距离 u_Dist1
  - 衰减结束距离 u_Dist2
  - 反向衰减距离 u_Dist3
- 衰减范围
  - 衰减起始范围 u_R1
  - 衰减结束范围 u_R2

#### 1.2代码实现

下图是将要实现的筒灯效果。  
![](/webgl-share/158.png)

为了更好的观察灯光，需要先建立一块幕布。

1. 幕布 Backdrop.js

```js
/*
属性：
  w：宽
  h：高
  d：深
  vertices：顶点集合
  normals：法线集合
  indexes：顶点索引集合
  count：顶点数量
*/
export default class Backdrop{
  constructor(w,h,d){
    this.w=w
    this.h=h
    this.d=d
    this.vertices=new Float32Array()
    this.normals=new Float32Array()
    this.indexes = new Float32Array()
    this.count = 12
    this.init()
  }
  init() {
    const [x, y, z] = [this.w / 2, this.h, this.d]
    this.vertices = new Float32Array([
      -x, 0, 0,
      -x, 0, z,
      x, 0, 0,
      x, 0, z,
      -x, y, 0,
      -x, 0, 0,
      x, y, 0,
      x, 0, 0,
    ])
    this.normals = new Float32Array([
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
    ])

    this.indexes = new Uint16Array([
      0, 1, 2, 2, 1, 3,
      4, 5, 6, 6, 5, 7
    ])
  }
}
```

2. 着色器

```html
  <script id="vs" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    attribute vec3 a_Normal;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_PvMatrix;
    varying vec3 v_Normal;
    varying vec3 v_Position;
    void main(){
      vec4 worldPos=u_ModelMatrix*a_Position;
      gl_Position = u_PvMatrix*worldPos;
      v_Normal=normalize(mat3(u_ModelMatrix)*a_Normal);
      v_Position=vec3(worldPos);
    }
  </script>
  <script id="fs" type="x-shader/x-fragment">
    precision mediump float;
    //漫反射系数
    uniform vec3 u_Kd;
    //镜面反射系数
    uniform vec3 u_Ks;
    //环境光反射系数
    uniform vec3 u_Ka;

    //视点
    uniform vec3 u_Eye;
    // 筒灯位置
    uniform vec3 u_LightPos;
    // 筒灯目标点 
    uniform vec3 u_LightTarget;
    //灯光强度
    uniform float u_Intensity;
    
    //衰减起始距离
    uniform float u_Dist1;
    //衰减结束距离
    uniform float u_Dist2;
    //反向衰减距离
    uniform float u_Dist3;
    
    //衰减起始范围
    uniform float u_R1;
    //衰减结束范围
    uniform float u_R2;
    
    //法线插值
    varying vec3 v_Normal;
    //点位插值
    varying vec3 v_Position;

    void main(){
      //光线方向
      vec3 lightDir=normalize(u_LightPos-u_LightTarget);
      //法线插值归一化
      vec3 normal=normalize(v_Normal);
      //眼睛看向当前着色点的视线
      vec3 eyeDir=normalize(u_Eye-v_Position);
      //视线与光线的角平分线
      vec3 h=normalize(eyeDir+lightDir);
      //漫反射
      vec3 diffuse=u_Kd*max(0.0,dot(normal,lightDir));
      //镜面反射
      vec3 specular=u_Ks*pow(
        max(0.0,dot(normal,h)),
        64.0
      );

      //着色点到光源的向量
      vec3 pl=u_LightPos-v_Position;
      //着色点到光线的距离
      float r=length(cross(pl,lightDir));
      //光线垂直方向的衰减
      float fallY=1.0-smoothstep(u_R1,u_R2,r);
      //当前着色点到筒灯光源平面的距离
      float dist=dot(pl,lightDir);
      //光线方向的衰减
      float fallX=1.0-smoothstep(u_Dist1,u_Dist2,dist);
      //反向衰减
      float fallB=smoothstep(u_Dist3,0.0,dist);

      //筒灯作用于当前着色点的亮度
      float intensity=u_Intensity*fallY*fallX*fallB;
      //着色点颜色
      vec3 color=intensity*(diffuse+specular)+u_Ka;
      gl_FragColor=vec4(color,1.0);
  </script>
```

2. 导入相关组件

```js
import { createProgram} from '/jsm/Utils.js';
import {
  Matrix4, PerspectiveCamera, Vector3
} from 'https://unpkg.com/three/build/three.module.js';
import OrbitControls from './jsm/OrbitControls.js'
import Mat from './lv/Mat.js'
import Geo from './lv/Geo.js'
import Obj3D from './lv/Obj3D.js'
import Scene from './lv/Scene.js'
import Sphere from './lv/Sphere.js'
import Backdrop from './lv/Backdrop.js'
import { gouraudShading } from './lv/ShadingFrequency.js'

```

3. 建立webgl上下文对象

```js
const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let gl = canvas.getContext('webgl');
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.enable(gl.DEPTH_TEST);
```

4. 建立相机轨道

```js
// 视点
const target = new Vector3()
const eye = new Vector3(0, 4, 10)
const [fov, aspect, near, far] = [
  45, canvas.width / canvas.height,
  1, 50
]
// 透视相机
const camera = new PerspectiveCamera(fov, aspect, near, far)
camera.position.copy(eye)
// 轨道控制器
const orbit = new OrbitControls({ camera, target, dom: canvas, })
```

5. 实例化球体和幕布

```js
/* 球体 */
const sphere = new Sphere(0.5, 18, 18)
const { vertices, indexes } = sphere
const normals = gouraudShading(vertices, indexes)
//球体模型矩阵
const sphereMatrix = new Matrix4().setPosition(0, sphere.r, 0)

/* 幕布 */
const backdrop = new Backdrop(20, 10, 10)
// 幕布模型矩阵
const backMatrix = new Matrix4().setPosition(0, 0, -1)
```

6. 声明模型的颜色系数和灯光数据

```js
// 漫反射系数-颜色
const u_Kd = [0.7, 0.7, 0.7]
// 镜面反射系数-颜色
const u_Ks = [0.2, 0.2, 0.2]
// 环境光系数-颜色
const u_Ka = [0.2, 0.2, 0.2]

// 筒灯位置
const u_LightPos = new Vector3(1.5, 3, 2)
// 筒灯目标点
const u_LightTarget = new Vector3()
// 光照强度
const u_Intensity = 1
// 衰减起始距离
const u_Dist1 = 0
// 衰减结束距离
const u_Dist2 = 10
// 反向衰减距离
const u_Dist3 = -1
// 衰减起始范围
const u_R1 = 2
// 衰减结束范围
const u_R2 = 2.5
```

7. 基于上面的已知条件，建立三类uniform数据

```js
// 灯光数据
const lightData = {
  u_LightPos: {
    value: [...u_LightPos],
    type: 'uniform3fv',
  },
  u_LightTarget: {
    value: [...u_LightTarget],
    type: 'uniform3fv',
  },
  u_Intensity: {
    value: 1,
    type: 'uniform1f',
  },
  u_R1: {
    value: u_R1,
    type: 'uniform1f',
  },
  u_R2: {
    value: u_R2,
    type: 'uniform1f',
  },
  u_Dist1: {
    value: u_Dist1,
    type: 'uniform1f',
  },
  u_Dist2: {
    value: u_Dist2,
    type: 'uniform1f',
  },
  u_Dist3: {
    value: u_Dist3,
    type: 'uniform1f',
  },
}
// 材质数据
const matData = {
  u_Kd: {
    value: u_Kd,
    type: 'uniform3fv',
  },
  u_Ks: {
    value: u_Ks,
    type: 'uniform3fv',
  },
  u_Ka: {
    value: u_Ka,
    type: 'uniform3fv',
  },
}
// 相机数据
const cameraData = {
  u_PvMatrix: {
    value: orbit.getPvMatrix().elements,
    type: 'uniformMatrix4fv',
  },
  u_Eye: {
    value: Object.values(camera.position),
    type: 'uniform3fv',
  },
}
```

8. 绘图

```js
// 场景
const scene = new Scene({ gl })
// 注册程序对象
scene.registerProgram(
  'Blinn-Phong',
  {
    program: createProgram(
      gl,
      document.getElementById('vs').innerText,
      document.getElementById('fs').innerText
    ),
    attributeNames: ['a_Position', 'a_Normal'],
    uniformNames: [
      'u_PvMatrix', 'u_ModelMatrix', 'u_Eye',
      'u_Kd', 'u_Ks', 'u_Ka',
      'u_LightPos', 'u_LightTarget', 'u_Intensity',
      'u_Dist1', 'u_Dist2', 'u_Dist3',
      'u_R1', 'u_R2',
    ]
  }
)
// 球体
const matSphere = new Mat({
  program: 'Blinn-Phong',
  data: {
    u_ModelMatrix: {
      value: sphereMatrix.elements,
      type: 'uniformMatrix4fv',
    },
    ...cameraData,
    ...lightData,
    ...matData
  },
  mode: 'TRIANGLES',
})
const geoSphere = new Geo({
  data: {
    a_Position: {
      array: vertices,
      size: 3
    },
    a_Normal: {
      array: normals,
      size: 3
    },
  },
  index: {
    array: indexes
  }
})
const objSphere = new Obj3D({ geo: geoSphere, mat: matSphere })
scene.add(objSphere)

// 幕布
const matBack = new Mat({
  program: 'Blinn-Phong',
  data: {
    u_ModelMatrix: {
      value: backMatrix.elements,
      type: 'uniformMatrix4fv',
    },
    ...cameraData,
    ...lightData,
    ...matData
  },
})
const geoBack = new Geo({
  data: {
    a_Position: {
      array: backdrop.vertices,
      size: 3
    },
    a_Normal: {
      array: backdrop.normals,
      size: 3
    },
  },
  index: {
    array: backdrop.indexes
  }
})
const objBack = new Obj3D({ mat: matBack, geo: geoBack })
scene.add(objBack)

!(function render() {
  orbit.getPvMatrix()
  scene.setUniform('u_Eye', {
    value: Object.values(camera.position)
  })
  scene.draw()
  requestAnimationFrame(render)
})()
```

9. 相机轨道交互事件

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

### 2.锥形灯
#### 1.1锥形灯概念

锥形灯可以理解为对点光源的限制，从侧面看，其打出的光线成锥形。  
![](/webgl-share/159.png)

锥形灯的照射效果如下：  
![](/webgl-share/160.png)

定义锥形灯的条件：

- 锥形灯位置  u_LightPos
- 锥形灯目标点  u_LightTarget
- 光照强度 u_Intensity
- 衰减距离
  - 衰减起始距离 u_Dist1
  - 衰减结束距离 u_Dist2
- 衰减夹角
  - 衰减起始夹角 u_Fov1
  - 衰减结束夹角 u_Fov2

#### 1.2代码实现

可以直接在之前筒灯的基础上做一下修改。

1. 把之前的衰减范围变成衰减夹角
```js
// 衰减起始范围
const u_Fov1 = 20 * Math.PI / 180
// 衰减结束范围
const u_Fov2 = u_Fov1 + 2 * Math.PI / 180
// 灯光数据
const lightData = {
  ……
  u_Fov1: {
    value: u_Fov1,
    type: 'uniform1f',
  },
  u_Fov2: {
    value: u_Fov2,
    type: 'uniform1f',
  },
  ……
}
```

2. 在片元着色器中，根据衰减夹角计算灯光在光线垂直方向的衰减
```js
//衰减范围
float r1=tan(u_Fov1)*dist;
float r2=tan(u_Fov2)*dist;
//着色点到光线的距离
float r=length(cross(pl,lightDir));
//光线垂直方向的衰减
float fallY=1.0-smoothstep(r1,r2,r);
//取消灯光背面的照明
float fallB=step(0.0,dist);
```

对于灯光的类型，就先说这两个。  
其实，灯光中是可以绘图的，只是这块知识有点复杂，后面说。  
这里，就看个小例子。

### 扩展-泉

可以基于着色点到光线的距离做一个正弦波衰减。  
![](/webgl-share/161.png)

1. 片元着色器中的算法如下：
```js
//衰减范围
float r1=tan(u_Fov1)*dist;
float r2=tan(u_Fov2)*dist;
//着色点到光线的距离
float r=length(cross(pl,lightDir));
//光线垂直方向的衰减
float fallY=1.0-smoothstep(r1,r2,r);

//正弦波衰减弧度
float fallAng=smoothstep(0.0,r2,r)*40.0-u_Time/60.0;
//正弦波衰减
float fallSin=1.0-smoothstep(-0.3,1.0,sin(fallAng));

//取消灯光背面的照明
float fallB=step(0.0,dist);

//光源作用于当前着色点的亮度
float intensity=u_Intensity*fallX*fallY*fallSin*fallB;
//着色点颜色
vec3 color=intensity*(diffuse+specular)+u_Ka;
```

2. 调整一下相机和灯光
```js
//相机目标点
const target = new Vector3(0, 1.5, 0)
//相机视点
const eye = new Vector3(0, 4, 10)
……

// 锥形灯位置
const u_LightPos = new Vector3(0, 8, 1)
// 锥形灯目标点
const u_LightTarget = new Vector3()
// 光照强度
const u_Intensity = 15
// 衰减起始距离
const u_Dist1 = 0
// 衰减结束距离
const u_Dist2 = 8.5
// 衰减起始范围
const u_Fov1 = 25 * Math.PI / 180
// 衰减结束范围
const u_Fov2 = u_Fov1 + 10 * Math.PI / 180
……
```

## 二十四、帧缓冲区

其实，接下来想说投影的，然而投影的计算还需要帧缓冲区，所以得先解释一下帧缓冲区的概念。
### 1.帧缓冲区的概念

webgl 绘图过程是：顶点着色器定形，片元着色器逐片元填颜色，然后绘制到canvas画布上。  
![](/webgl-share/162.png)

其实，绘图的时候，也可以不把图形绘制到画布上，而是绘制到内存之中，这样可以在不显示图像的前提下，获取webgl 绘制的图像数据。  
这块在内存中存储webgl 图像的区域，就叫**帧缓冲区**。  
![](/webgl-share/163.png)

有了帧缓冲区的图像数据之后，还不显示它，那帧缓冲区有啥用呢？  
帧缓冲区的作用非常强大，可以对webgl 的渲染结果做后处理，比如为模型添加描边、光晕等；还可以基于光源生成深度贴图，计算投影……

对于帧缓冲区的基本概念和作用就说到这，接下来用代码敲一下。
### 2.帧缓冲区的代码实现

入门webgl 的时候画过一个点，接下把这个点画到帧缓冲区里去。

1. 这是在canvas 画布中绘制一个点的方法。

```html
  <script id="vs1" type="x-shader/x-vertex">
    void main(){
      //点位
      gl_Position=vec4(0,0,0,1);
      //尺寸
      gl_PointSize=100.0;
    }
  </script>
  <script id="fs1" type="x-shader/x-fragment">
    void main(){
      gl_FragColor=vec4(1,1,0,1);
    }
  </script>
  <script type="module">
    import { createProgram } from '../jsm/Utils.js';

    const canvas = document.getElementById('canvas');
    canvas.width = 512;
  	canvas.height = 512;
    const gl = canvas.getContext('webgl');

    const vs1 = document.getElementById('vs1').innerText;
    const fs1 = document.getElementById('fs1').innerText;
    const program1 = createProgram(gl, vs1, fs1);
    gl.useProgram(program1)
    
    gl.clearColor(0.4, 0.6, 0.9, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, 1);
  </script>
```
效果如下：  
![](/webgl-share/164.png)

2. 在绘制图形的时候做个拦截，把图形画到帧缓冲区里。

```js
……
const vs1 = document.getElementById('vs1').innerText;
const fs1 = document.getElementById('fs1').innerText;
const program1 = createProgram(gl, vs1, fs1);
gl.useProgram(program1)

//纹理对象
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
gl.activeTexture(gl.TEXTURE0)
let texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texParameteri(
  gl.TEXTURE_2D,
  gl.TEXTURE_MIN_FILTER,
  gl.LINEAR
);
gl.texImage2D(
  gl.TEXTURE_2D, 0, gl.RGBA, 256, 256,
  0, gl.RGBA, gl.UNSIGNED_BYTE, null
);

//帧缓冲区
const framebuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
gl.framebufferTexture2D(
  gl.FRAMEBUFFER,
  gl.COLOR_ATTACHMENT0,
  gl.TEXTURE_2D,
  texture, 0
);

//设置渲染尺寸
gl.viewport(0, 0, 256, 256);

//绘图
gl.clearColor(0.2, 0.2, 0.4, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.POINTS, 0, 1);
```

运行上面的代码，会发现浏览器在没有报错的前提下，成功绘制不出任何东西来了。  
上面的代码可以分两部分看，一部分是纹理对象，一部分是帧缓冲区。

1. 纹理对象是用来装webgl 绘图结果的，可以将其理解为像素数据。

```js
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
gl.activeTexture(gl.TEXTURE0)
const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texParameteri(
  gl.TEXTURE_2D,
  gl.TEXTURE_MIN_FILTER,
  gl.LINEAR
);
gl.texImage2D(
  gl.TEXTURE_2D, 0, gl.RGBA, 256, 256,
  0, gl.RGBA, gl.UNSIGNED_BYTE, null
);
```
- createTexture() 创建纹理对象
- bindTexture(target, texture) 将纹理对象绑定到目标对象上，上面代码里的目标对象就是二维纹理对象gl.TEXTURE_2D
- texParameteri() 设置纹理参数
- texImage2D(target, level, internalformat, width, height, border, format, type, ArrayBufferView? pixels) 设置纹理对象的图像源
  - target 纹理目标
  - level  mipmap 图像级别 
  - internalformat 颜色格式
  - width, height 纹理对象的尺寸
  - border 边界宽度，必须为0
  - format  颜色格式， WebGL 1 中必须和internalformat 一致
  - type 纹理数据类型
  - pixels 纹理的像素源

2. 帧缓冲区可以理解为用来装纹理对象缓冲区。

```js
const framebuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
gl.framebufferTexture2D(
  gl.FRAMEBUFFER,
  gl.COLOR_ATTACHMENT0,
  gl.TEXTURE_2D,
  texture, 0
);
```
- createFramebuffer() 建立帧缓冲区
- bindFramebuffer(target, framebuffer) 将帧缓冲区绑定到目标对象上。
  - target 目标对象，用于收集渲染图像的时所需的颜色、透明度、深度和模具缓冲区数据
  - framebuffer 帧缓冲区
- framebufferTexture2D(target, attachment, textarget, texture, level) 将纹理对象添加到帧缓冲区中
  - target 目标对象
  - attachment 设置将纹理对象绑定到哪个缓冲区中
    -  gl.COLOR_ATTACHMENT0 将纹理对象绑定到颜色缓冲区
    -  gl.DEPTH_ATTACHMENT 将纹理对象绑定到深度缓冲区
    -  gl.STENCIL_ATTACHMENT 将纹理对象绑定到模板缓冲区
  - textarget 纹理的目标对象
  - texture 纹理对象
  - level  mipmap 图像级别 

3. 渲染方法，把图形渲染进帧缓冲区的纹理对象里。
```js
gl.clearColor(0.4, 0.6, 0.9, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.POINTS, 0, 1);
```

4. 图形在渲染的时候，会有一个VIEWPORT 尺寸，可以把这个尺寸理解为渲染尺寸，这个尺寸默认和canvas 画布一致。

可以用gl.getParameter(gl.VIEWPORT) 方法获取画布的像素尺寸。  
也需要知道设置这个渲染尺寸的方法：
```js
//设置渲染尺寸
gl.viewport(0, 0, 256, 256);

//绘图
gl.clearColor(0.4, 0.6, 0.9, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.POINTS, 0, 1);
```
- viewport(x,y,w,h)
  - x,y 是VIEWPORT 的左下角点位置
  - w,h 是VIEWPORT 的宽高

在帧缓冲区中，一般会把VIEWPORT 尺寸设置的和纹理对象一样大，这样最终渲染出的图像就是和纹理对象一样大的图像。

有了帧缓冲区之后，就可以把帧缓冲区中的纹理对象当成真的纹理对象来用，把它贴到模型上。

### 3.帧缓冲区的显示

接着上面的代码往后写。

1. 写一套纹理着色器，用于显示帧缓冲区里的纹理对象。

```html
<script id="vs2" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  attribute vec2 a_Pin;
  varying vec2 v_Pin;
  void main(){
    gl_Position = a_Position;
    v_Pin=a_Pin;
  }
</script>
<script id="fs2" type="x-shader/x-fragment">
  precision mediump float;
  uniform sampler2D u_Sampler;
  varying vec2 v_Pin;
  void main(){
    gl_FragColor=texture2D(u_Sampler,v_Pin);
  }
</script>
```

2. 帧缓冲区绘制完图像后，把帧缓冲区置空，否则下次绘图还是会画到帧缓冲区里，而不是画到canvas 画布里。
```js
gl.bindFramebuffer(gl.FRAMEBUFFER, null);
```

3. 将viewport 恢复到当前canvas 画布的尺寸。
```js
gl.viewport(0, 0, canvas.width, canvas.height);
```

4. 绘制一个矩形面，把帧缓冲区里的纹理对象贴上去。
```js
const vs2 = document.getElementById('vs2').innerText;
const fs2 = document.getElementById('fs2').innerText;
const program2 = createProgram(gl, vs2, fs2);
gl.useProgram(program2)

const source = new Float32Array([
-0.5, 0.5, 0, 1,
-0.5, -0.5, 0, 0,
0.5, 0.5, 1, 1,
0.5, -0.5, 1, 0
])
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, source, gl.STATIC_DRAW);
const a_Position = gl.getAttribLocation(program2, 'a_Position');
gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 16, 0);
gl.enableVertexAttribArray(a_Position);
const a_Pin = gl.getAttribLocation(program2, 'a_Pin');
gl.vertexAttribPointer(a_Pin, 2, gl.FLOAT, false, 16, 8);
gl.enableVertexAttribArray(a_Pin);

gl.bindTexture(gl.TEXTURE_2D, texture)
const u_Sampler = gl.getUniformLocation(program2, 'u_Sampler')
gl.uniform1i(u_Sampler, 0)

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
```
最终效果如下：  
![](/webgl-share/165.png)

当把帧缓冲区里的纹理对象显示出来后，还需要考虑一个深度问题。

### 4.帧缓冲区里的深度测试
#### 4.1深度测试的概念

在webgl中绘图的时候，若没有开启深度测试 gl.DEPTH_TEST，那它就会像画水粉一样，一层层的往canvas 画布上覆盖颜色，它不会考虑图形在深度上的遮挡问题。  
![](/webgl-share/166.png)

当开启了深度测试，离视点近的图形就会遮挡例视点远的图形。  
当然，这种对于深度测试的解释是有点笼统的，比如像下面的三个三角形，就没法判断谁远谁近了。  
![](/webgl-share/167.png)

webgl的深度测试是先基于整个场景生成一张深度贴图，深度贴图里存储了离视点最近的片元的深度信息。  
webgl 在逐片元着色时，会判断一下当前片元的的深度是否小于深度贴图里相应片元的深度，若是的话，那webgl就不会对当前片元进行渲染。    
从而webgl就通过只绘制在深度上离视点最近的片元的方式，解决了图形遮挡问题。  

在代码里给大家演示一下深度测试的原理。
#### 4.2深度测试的代码实现

1. 画两个不同深度的点。
```html
<script id="vs1" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    varying float v_Z;
    void main(){
      gl_Position=a_Position;
      gl_PointSize=200.0;
      v_Z=a_Position.z;
    }
</script>
<script id="fs1" type="x-shader/x-fragment">
    precision mediump float;
    varying float v_Z;
    void main(){
      gl_FragColor=vec4(vec3(v_Z),1);
    }
</script>
<script type="module">
  import { createProgram } from '/jsm/Utils.js';

  const canvas = document.getElementById('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const gl = canvas.getContext('webgl');

  const vs1 = document.getElementById('vs1').innerText;
  const fs1 = document.getElementById('fs1').innerText;
  const program1 = createProgram(gl, vs1, fs1);
  gl.useProgram(program1)

  const source = new Float32Array([
    -0.1, 0.1, 0,
    0.1, -0.1, 0.9,
  ])
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, source, gl.STATIC_DRAW);
  const a_Position = gl.getAttribLocation(program1, 'a_Position');
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.clearColor(0.4, 0.6, 0.9, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, 2);

</script>
```
其效果如下：  
![](/webgl-share/168.png)

通过代码可以知道，在裁剪空间中，黑点的深度是0，白点深度是0.9，按理说是应该黑点遮挡白点的。  
这就因为在没有开启深度测试的情况下，webgl 会像画油画一样，根据顶点数据的排序，一个个绘制。  
```js
const source = new Float32Array([
  //黑点
  -0.1, 0.1, 0,
  //白点
  0.1, -0.1, 0.9,
])
```
在上面的代码里，先写入了黑点，又写入了白点，所以webgl先画完了黑点后，又在黑点上面覆盖了一个白点。

注：上面的点位是裁剪空间中的点位，不要将其当成世界坐标系里的点位，裁剪空间和右手规则的世界坐标系的z轴是相反的。

2. 为webgl 开启深度测试

```js
gl.enable(gl.DEPTH_TEST);
```

效果如下：  
![](/webgl-share/169.png)

这样 webgl 就可以解决不同深度上得图形遮挡问题。

接下来，测一下在帧缓冲区里是否也可以用同样的方式解决图形遮挡问题。

```html
<!-- 点 -->
<script id="vs1" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  varying float v_Z;
  void main(){
    gl_Position=a_Position;
    gl_PointSize=200.0;
    v_Z=a_Position.z;
  }
</script>
<script id="fs1" type="x-shader/x-fragment">
  precision mediump float;
  varying float v_Z;
  void main(){
    gl_FragColor=vec4(vec3(v_Z),1);
  }
</script>
<!-- 纹理着色器 -->
<script id="vs2" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  attribute vec2 a_Pin;
  varying vec2 v_Pin;
  void main(){
    gl_Position = a_Position;
    v_Pin=a_Pin;
  }
</script>
<script id="fs2" type="x-shader/x-fragment">
  precision mediump float;
  uniform sampler2D u_Sampler;
  varying vec2 v_Pin;
  void main(){
    gl_FragColor=texture2D(u_Sampler,v_Pin);
  }
</script>
<script type="module">
  import { createProgram } from '/jsm/Utils.js';

  const canvas = document.getElementById('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const gl = canvas.getContext('webgl');

  let texture = null

  {
    const vs1 = document.getElementById('vs1').innerText;
    const fs1 = document.getElementById('fs1').innerText;
    const program1 = createProgram(gl, vs1, fs1);
    gl.useProgram(program1)
    gl.enable(gl.DEPTH_TEST);

    const source = new Float32Array([
      -0.1, 0.1, 0,
      0.1, -0.1, 0.9,
    ])
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, source, gl.STATIC_DRAW);
    const a_Position = gl.getAttribLocation(program1, 'a_Position');
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    gl.activeTexture(gl.TEXTURE0)
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR
    );
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, 512, 512,
      0, gl.RGBA, gl.UNSIGNED_BYTE, null
    );

    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture, 0
    );

    gl.viewport(0, 0, 512, 512);
    gl.clearColor(0.3, 0.5, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, 2);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  {
    const vs2 = document.getElementById('vs2').innerText;
    const fs2 = document.getElementById('fs2').innerText;
    const program2 = createProgram(gl, vs2, fs2);
    gl.useProgram(program2)

    const source = new Float32Array([
      -0.5, 0.5, 0, 1,
      -0.5, -0.5, 0, 0,
      0.5, 0.5, 1, 1,
      0.5, -0.5, 1, 0
    ])
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, source, gl.STATIC_DRAW);
    const a_Position = gl.getAttribLocation(program2, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(a_Position);
    const a_Pin = gl.getAttribLocation(program2, 'a_Pin');
    gl.vertexAttribPointer(a_Pin, 2, gl.FLOAT, false, 16, 8);
    gl.enableVertexAttribArray(a_Pin);

    gl.bindTexture(gl.TEXTURE_2D, texture)
    const u_Sampler = gl.getUniformLocation(program2, 'u_Sampler')
    gl.uniform1i(u_Sampler, 0)
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

</script>
```

效果如下：   
![](/webgl-share/170.png)

由此可见，在帧缓冲区中开启了帧缓冲区后，依旧无法实现不同深度的图形遮挡。  
这是因为还需要为帧缓冲区绑定深度缓冲区。
#### 4.3深度缓冲区

在帧缓冲区绘图之前，再建立一个渲染缓冲区，然后将其添加到帧缓冲区中。  
渲染缓冲区可以用于存储深度缓冲区。
```js
const depthbuffer = gl.createRenderbuffer();
gl.bindRenderbuffer(gl.RENDERBUFFER, depthbuffer);
gl.renderbufferStorage(
  gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
  512, 512
);
gl.framebufferRenderbuffer(
  gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
  gl.RENDERBUFFER, depthbuffer
);

gl.viewport(0, 0, 512, 512);
gl.clearColor(0.3, 0.5, 0.8, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.POINTS, 0, 2);
```
- createRenderbuffer() 建立渲染缓冲区，渲染缓冲区可以用于存储渲染数据
- renderbufferStorage(target, internalFormat, width, height) 初始化渲染缓冲区
  - target 渲染缓冲区的目标对象，只能是 gl.RENDERBUFFER 
  - internalFormat 数据格式，gl.DEPTH_COMPONENT16便是针对深度数据的
  - width, height  渲染缓冲区的宽、高
- framebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer) 向帧缓冲区中添加渲染缓冲区
  - target 帧缓冲区的目标对象
  - attachment 要为帧缓冲区绑定的缓冲区
    - gl.DEPTH_ATTACHMENT 深度缓冲区
    - ……
  - renderbuffertarget 渲染缓冲区的目标对象，只能是gl.RENDERBUFFER
  - renderbuffer 渲染缓冲区

最终效果如下：  
![](/webgl-share/171.png)

注：webgl 的有些API 读起来有些晦涩，这里面有些是webgl 的历史遗留问题。有些API，先知道其实现原理和功能即可，有些参数不必太过深究。

## 二十五、投影

当生活有了光的时候，也会有投影的存在。  
投影可以更好的衬托光明，让生活变得立体，有节奏。  

接下来，就让我们一起探索投影，发现未知。在光影沉浮之中，寻找生活的节奏感。
### 1.投影的概念

投影就是光源照射不到的地方。  
可以把光源想象成视点，光源看不见它所照射的物体的影子。  
在webgl里，要知道一个地方有没有投影，只要知道视点所看的地方有没有被光源看见到即可。  
![](/webgl-share/172.png)

以上图的锥形灯为例，说一下如何判断一个地方有没有投影：  
1. 把光源当成相机，渲染一张投影贴图塞进帧缓冲区里。投影贴图是存储图形到相机距离的图像。
2. 在实际相机中逐片元渲染时，对比当前片元与投影贴图中相应位置的片元的深度大小。若当前片元的深度小于投影贴图中相应片元的深度，就说明当前片元在投影中。

看了上面的步骤，大家可能会有很多的疑问：  
- 投影贴图怎么做？
- 如何把图形到光源的深度数据存入投影贴图中？
- 如何找到渲染时，当前片元在投影贴图中所对应的片元？
- ……

接下来，带着疑问，看一下其代码实现过程。
### 2.投影的代码实现

在下面的代码里，通过锥形灯给一个三角形添加投影。   
为了直击重点，先不考虑三角形对光的反射，我们只关注三角形的投影。  
其效果如下：  
![](/webgl-share/173.png)
#### 2.1在帧缓冲区中绘制投影贴图

1. 在帧缓冲区绘制投影贴图的着色器
```html
<script id="vs1" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  uniform mat4 u_PvMatrix;
  uniform mat4 u_ModelMatrix;
  void main(){
    gl_Position=u_PvMatrix*u_ModelMatrix*a_Position;
  }
</script>
<script id="fs1" type="x-shader/x-fragment">
  precision mediump float;
  void main(){
    gl_FragColor=vec4(gl_FragCoord.z,0.0,0.0,0.0);
  }
</script>
```

在顶点着色器里，u_PvMatrix 是基于把锥形灯当成相机后，获取的投影视图矩阵。  
在片元着色器里，gl_FragCoord.z 是片元的深度信息，这个信息被写进了gl_FragColor 片元颜色里。  
gl_FragCoord 对应的是片元坐标的意思，我们需要知道片元坐标和裁剪坐标的映射关系。   

我之前说过，裁剪空间在x,y,z 方向的边界都是(-1,1)，这三个方向的边界映射到片元坐标后就是(0,1)，如下图所示：  
![](/webgl-share/174.png)

2. 在js 中准备相机、灯光和模型数据
```js
import { createProgram } from '/jsm/Utils.js';
import {
  Matrix4, 
  PerspectiveCamera, 
  Vector3
} from '/three/build/three.module.js';

const canvas = document.getElementById('canvas');
const ratio = window.innerWidth / window.innerHeight
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const gl = canvas.getContext('webgl');

// 灯光
const light = new PerspectiveCamera(70, ratio, 0.1, 10.0)
light.position.set(0, 0.3, 0)
light.lookAt(0, 0, 0)
light.updateMatrixWorld(true)
const pvMatrixLight = light.projectionMatrix.clone()
.multiply(light.matrixWorldInverse)

// 相机
const camera = new PerspectiveCamera(45, ratio, 0.1, 10.0)
camera.position.set(0, 0.3, 0.9)
camera.lookAt(0, 0.0, 0.0)
camera.updateMatrixWorld(true)
const pvMatrix = camera.projectionMatrix.clone()
.multiply(camera.matrixWorldInverse)

// 三角形数据
const triangleVertice = new Float32Array([
  -0.1, 0.1, -0.1,
  0.1, 0.1, -0.1,
  0.0, 0.1, 0.1
])
// 地面数据
const floorVertice = new Float32Array([
  -0.2, 0, 0.2,
  0.2, 0, 0.2,
  -0.2, 0, -0.2,
  0.2, 0, -0.2,
])
```

3. 在帧缓冲区中绘图
```js
// 纹理尺寸
const width = 1024, height = 1024
// 纹理对象
let texture = null

/* 帧缓冲区内绘图 */
{
  // 程序对象
  const program = createProgram(
    gl,
    document.getElementById('vs1').innerText,
    document.getElementById('fs1').innerText
  )
  gl.useProgram(program)
  gl.enable(gl.DEPTH_TEST)

  // 纹理对象
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
  gl.activeTexture(gl.TEXTURE0)
  texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.LINEAR
  );
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA,
    width, height,
    0, gl.RGBA, gl.UNSIGNED_BYTE, null
  );

  // 帧缓冲区
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture, 0
  );
  
  // 渲染缓冲区，存储深度数据
  const depthbuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthbuffer);
  gl.renderbufferStorage(
    gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
    width, height
  );
  gl.framebufferRenderbuffer(
    gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
    gl.RENDERBUFFER, depthbuffer
  );

  // 视口尺寸
  gl.viewport(0, 0, width, height);

  // 清理画布
  gl.clearColor(0, 0, 0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 灯光的投影视图矩阵
  const u_PvMatrixLight = gl.getUniformLocation(program, 'u_PvMatrix');
  gl.uniformMatrix4fv(u_PvMatrixLight, false, pvMatrixLight.elements);

  // 三角形的模型矩阵
  const u_ModelMatrix = gl.getUniformLocation(program, 'u_ModelMatrix');
  gl.uniformMatrix4fv(u_ModelMatrix, false, new Matrix4().elements);

  // 绘制三角形
  drawObj(program, triangleVertice, 3)

  // 绘制平面
  drawObj(program, floorVertice, 4)

  //还原
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, canvas.width, canvas.height);
}

//绘制图形
function drawObj(program, vertice, count) {
  const verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertice, gl.STATIC_DRAW);
  const attribute = gl.getAttribLocation(program, 'a_Position');
  gl.vertexAttribPointer(attribute, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attribute);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, count);
}
```
在帧缓冲区中绘图的原理，已经说过，这里就不再过多解释。
#### 2.2在canvas 画布上绘图

1. 着色器
```html
<script id="vs2" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  uniform mat4 u_PvMatrix;
  uniform mat4 u_ModelMatrix;
  
  uniform mat4 u_PvMatrixLight;
  varying vec4 v_ClipPosLight;
  void main(){
    vec4 worldPos=u_ModelMatrix*a_Position;
    gl_Position=u_PvMatrix*worldPos;
    v_ClipPosLight=u_PvMatrixLight*worldPos;
  }
</script>
<script id="fs2" type="x-shader/x-fragment">
  precision mediump float;
  uniform sampler2D u_ShadowMap;
  varying vec4 v_ClipPosLight;
  bool isInShadow(){
    vec3 fragPos=(v_ClipPosLight.xyz/v_ClipPosLight.w)/2.0 + 0.5;
    vec4 shadowFrag = texture2D(u_ShadowMap, fragPos.xy);
    return fragPos.z>shadowFrag.r+1.0/256.0;
  }
  void main(){
    float darkness=isInShadow()?0.7:1.0;
    gl_FragColor=vec4(vec3(darkness),1.0);
  }
</script>
```
在顶点着色器中，用到了两种点位，两种投影视图矩阵。

- a_Position 当前模型的顶点点位。
- u_ModelMatrix 当前模型的模型矩阵。
- u_PvMatrix 相机的投影视图矩阵。
- u_PvMatrixLight 灯光的投影视图矩阵。
- v_ClipPosLight 以锥形灯为相机时，顶点在裁剪空间里的位置。

在片元着色器里，isInShadow() 即使判断当前片元是否在投影里的方法。

fragPos就是当前片元在灯光相机里的片元位。  
fragPos的x,y 值就是当前片元在投影贴图里的x,y位置。  
基于fragPos的x,y 值，就可以找到投影贴图里的相应片元，即shadowFrag。  
因为shadowFrag的r 值里面存储了离光源最近的片元的深度，所以将其和fragPos.z 做大小判断，就可以知道当前片元是否在投影中了。  
按理说，我用fragPos.z>shadowFrag.r  便可以判断两个深度值的大小。   
但是，我还让shadowFrag.r 加上了1.0/256.0，这是为了解决数据的精度问题。    
fragPos.z 属于float 浮点数，其精度是mediump 中等精度，其范围(-pow(2,14),pow(2,14))  
shadowFrag.r 属于像素数据，其精度只有1/pow(2,8)，即1/256=0.00390625    
低精度的数据在存储时，会发生数据丢失。  

举个例子：
```js
gl_FragColor.r=1.0/256.0-0.0000000001;
float z=1.0/256.0;
if(z==gl_FragColor.r){
  //绿色
  gl_FragColor=vec4(0.0,1.0,0.0,1.0); 
}else if(z>gl_FragColor.r){
  //红色
  gl_FragColor=vec4(1.0,0.0,0.0,1.0);
}
```
按理说，z肯定是要比gl_FragColor.r 大的。  
但是，因为精度问题，gl_FragColor.r 依旧等于1.0/256.0  
所以，最终gl_FragColor是绿色。  
这也就导致了，本应该显示出来的投影不会显示。  
所以，我又为gl_FragColor.r 加上了一个精度。

2. 在canvas画布上绘图
```js
{
  // 程序对象
  const program = createProgram(
    gl,
    document.getElementById('vs2').innerText,
    document.getElementById('fs2').innerText
  );
  gl.useProgram(program)
  gl.enable(gl.DEPTH_TEST);

  // 清理画布
  gl.clearColor(0, 0, 0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 纹理
  gl.bindTexture(gl.TEXTURE_2D, texture)
  const u_Sampler = gl.getUniformLocation(program, 'u_ShadowMap')
  gl.uniform1i(u_Sampler, 0)

  //相机的投影视图矩阵
  const u_PvMatrix = gl.getUniformLocation(program, 'u_PvMatrix');
  gl.uniformMatrix4fv(u_PvMatrix, false, pvMatrix.elements);

  //灯光的投影视图矩阵
  const u_PvMatrixLight = gl.getUniformLocation(program, 'u_PvMatrixLight');
  gl.uniformMatrix4fv(u_PvMatrixLight, false, pvMatrixLight.elements);

  // 三角形的模型矩阵
  const u_ModelMatrix = gl.getUniformLocation(program, 'u_ModelMatrix');
  gl.uniformMatrix4fv(u_ModelMatrix, false, new Matrix4().elements);

  // 绘制三角形
  drawObj(program, triangleVertice, 3)

  // 绘制平面
  drawObj(program, floorVertice, 4)
}
```
上面的绘图逻辑之前都说过，所以就不再赘述了。
### 3.提高深度数据的精度

当着色点间的深度差异较小，在gl_FragColor的1/256的精度下，可能就难以其深度差异。

比如，我把之前的光源高度调高，阴影就会消失。

```js
light.position.set(0, 2, 0)
```
效果如下：  
![](/webgl-share/175.png)

对于这种问题，可以通过把深度数据存储到gl_FragColor 的所有分量里，从而提高深度数据的存储精度。
#### 3.1算法

1/256的精度不太直观，拿1/10的精度举例子。

`已知`：  
- 深度n=0.1234
- 四维向量v(r,g,b,a)
- 向量v 中每个分量的精度都是1/10

`求`：  
- 在不丢失数据的前提下，将实数n 存入向量v 的方法
- 从向量v 中读取完整数据的方法

`思路`：

根据已知条件可知，向量v中的每个分量只能存储小数点后的一位数，即0.0到0.9。  
若我们给v.x一个0.11的数字，那么向量v 会将0.11 解析为小数点后的一位数。  
至于解析方式是四舍五入、还是银行家舍入，那都不重要，我们只需要知道向量v中的每个分量只能存储小数点后的一位数即可。  
根据目测，可以知道，将实数n 小数点后的1,2,3,4 分别存入向量v 即可，因此v=(0.1,0.2,0.3,0.4)

`解`：
```js
a=(pow(10,0), pow(10,1), pow(10,2), pow(10,3))
a=(1,10,100,1000)

b=n*a
b=(0.1234, 1.234, 12.34, 123.4)

c=fract(b)
c=(0.1234, 0.234, 0.34, 0.4)

d=(1/10, 1/10, 1/10, 0)

e=(c.gba,0)*d
e=(0.0234, 0.034, 0.04,0)

v=c-e
v=(0.1,0.2,0.3,0.4)
```

上面的运算过程，就是在不丢失数据的前提下，将实数n 存入向量v 的方法。  
接下来，再从向量v 中提取完整数据。
```js
a=(1/pow(10,0), 1/pow(10,1), 1/pow(10,2), 1/pow(10,3))
a=(1,1/10,1/100,1/1000)

n=v·a
n=0.1+0.02+0.003+0.0004
n=0.1234
```
这就是把一个实数存入特定精度的向量，并取出的方法。  
当向量v 中每个分量的精度不是1/10，而是256 的时候，只要将10 替换成256 即可。
#### 3.2代码

1. 在帧缓冲区绘制投影贴图时，把深度存入gl_FragColor 的所有分量里。
```html
<script id="fs1" type="x-shader/x-fragment">
  precision mediump float;
  void main(){
    const vec4 bitShift = vec4(
      1.0, 
      256.0, 
      256.0 * 256.0, 
      256.0 * 256.0 * 256.0
    );
    const vec4 bitMask = vec4(vec3(1.0/256.0), 0.0);
    vec4 depth = fract(gl_FragCoord.z * bitShift);
    depth -= depth.gbaa * bitMask;
    gl_FragColor=depth;
  }
</script>	
```

2. 在canvas 画布上绘图时，从投影贴图中提取投影数据。
```html
<script id="fs2" type="x-shader/x-fragment">
  precision mediump float;
  uniform sampler2D u_ShadowMap;
  varying vec4 v_ClipPosLight;
  bool isInShadow(){
    vec3 fragPos=(v_ClipPosLight.xyz/v_ClipPosLight.w)/2.0 + 0.5;
    vec4 shadowFrag = texture2D(u_ShadowMap, fragPos.xy);
    const vec4 bitShift = vec4(
      1.0, 
      1.0/256.0, 
      1.0/(256.0*256.0), 
      1.0/(256.0*256.0*256.0)
    );
    float depth = dot(shadowFrag, bitShift);
    return fragPos.z>depth+1.0/(256.0*4.0);
  }
  void main(){
    float darkness=isInShadow()?0.7:1.0;
    gl_FragColor=vec4(vec3(darkness),1.0);
  }
</script>
```
这样就可以正常绘制出投影：  
![](/webgl-share/173.png)

帧缓冲区以及帧缓冲区在投影中的应用就说到这，接下来封装个帧缓冲区出来。

### 4.帧缓冲区的封装

帧缓冲区和之前建立的 Scene 场景对象是差不多的。只是在其基础上，要额外告诉webgl，在绘图的时候，不要再画到canvas 画布上了，而是要画到帧缓冲区里。

所以，可以建立一个Frame 对象，继承自 Scene对象，然后再为其新增帧缓冲区相关的方法。

#### 4.1完善Scene 对象

1. 先给Scene 对象添加两个属性：

- backgroundColor 背景色
- depthTest 是否开启深度测试
```js
const defAttr = () => ({
  ……
  backgroundColor: [0, 0, 0, 1],
  depthTest:true
})
```
之前是把这两个属性写在Scene外面的，但有了帧缓冲区后，这就不合适了。比如，帧缓冲区和Scene 对象可能有两种不一样的背景色。

2. 在绘图方法中，更新背景色和深度测试。
```js
draw() {
  const { gl, children2Draw, programs,backgroundColor,depthTest } = this
  gl.clearColor(...backgroundColor)
  depthTest ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST)
	……
}
```
#### 4.2建立Frame 对象

Frame.js 代码如下：
```js
import Scene from './Scene.js'

const defAttr = () => ({
  texture: null,
  framebuffer: null,
  depthbuffer: null,
  width: 1024,
  height: 1024,
})
export default class Frame extends Scene{
  constructor(attr) {
    super(Object.assign(defAttr(),attr))
    this.init()
  }
  // 初始化帧缓冲区
  init() {
    const { gl } = this
    this.texture = gl.createTexture()
    this.framebuffer = gl.createFramebuffer();
    this.depthbuffer = gl.createRenderbuffer();
  }
  // 更新化帧缓冲区
  update() {
    const { gl, width, height } = this
    // 纹理对象
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR
    );
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA,
      width, height,
      0, gl.RGBA, gl.UNSIGNED_BYTE, null
    );

    // 帧缓冲区
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.texture, 0
    );

    // 渲染缓冲区，存储深度数据
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthbuffer);
    gl.renderbufferStorage(
      gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
      width, height
    );
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER, this.depthbuffer
    );
    
    // 视口尺寸
    gl.viewport(0, 0, width, height);
  }
  
  //清理缓冲区，重置视口
  reset() {
    const { gl } = this
    const { canvas: { width,height}}=gl
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.bindRenderbuffer(gl.RENDERBUFFER, null)
    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.viewport(0, 0, width, height);
  }
  
  draw() {
    this.update()
    super.draw()
    this.reset() 
  }
}
```
属性：

- texture 纹理对象
- framebuffer 帧缓冲区
- depthbuffer 深度缓冲区
- width 纹理对象的宽度
- height 纹理对象的高度

方法：

- init() 初始化
- update() 绑定帧缓冲区
- reset() 清理缓冲区，重置视口
- draw() 绘图方法

Frame对象执行了draw() 方法后，便可以将渲染结果存储到texture 对象里。

之后在canvas 画布中绘图的时候，需要texture 交给Scene场景中三维物体的Mat对象，如下：
```js
const mat=new Mat({
  program: 'Blinn-Phong',
  data:{……},
  maps:{
    u_ShadowMap: {
      texture: frame.texture
    }
  }
})
```
以前在 maps 中是通过 image 图像源建立的 texture 纹理对象，而现在 texture 纹理对象已经有了，所需要对之前的Mat 材质对象也做下调整。

#### 4.3调整Mat 对象

1. 在init() 初始化方法中，若map贴图没有texture 纹理对象，再去建立纹理对象。

```js
init(gl){
  Object.values(this.maps).forEach((map, ind) => {
    if (!map.texture) {
      map.texture = gl.createTexture()
    }
    this.updateMap(gl,map,ind)
  })
}
```

2. 在updateMap() 方法中，若image 图像源存在，再执行图像源的设置方法。

```js
updateMap(gl, map, ind) {
  ……
  image&&gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    format,
    format,
    gl.UNSIGNED_BYTE,
    image
  )
  ……
}
```
完成了帧缓冲区的封装，接下来将其实例化，测试一下。

#### 4.4实例化帧缓冲区对象

可以在之前锥形灯的基础上，为小球添加一个投影，效果如下：  
![](/webgl-share/176.png)

1. 着色器

```html
<!-- 在帧缓冲区绘制投影贴图 -->
<script id="vShadow" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  uniform mat4 u_PvMatrix;
  uniform mat4 u_ModelMatrix;
  void main(){
    gl_Position=u_PvMatrix*u_ModelMatrix*a_Position;
  }
</script>
<script id="fShadow" type="x-shader/x-fragment">
  precision mediump float;
  void main(){
    const vec4 bitShift = vec4(
      1.0, 
      256.0, 
      256.0 * 256.0, 
      256.0 * 256.0 * 256.0
    );
    const vec4 bitMask = vec4(vec3(1.0/256.0), 0.0);
    vec4 depth = fract(gl_FragCoord.z * bitShift);
    depth -= depth.gbaa * bitMask;
    gl_FragColor=depth;
  }
</script>

<!-- Blinn-Phong -->
<script id="vs" type="x-shader/x-vertex">
  ……
  uniform mat4 u_PvMatrixLight;
  varying vec4 v_ClipPosLight;
  void main(){
    ……
    v_ClipPosLight=u_PvMatrixLight*worldPos;
  }
</script>
<script id="fs" type="x-shader/x-fragment">
  ……   
  //投影贴图
  uniform sampler2D u_ShadowMap;
  //当前着色点在灯光里的裁剪坐标
  varying vec4 v_ClipPosLight;
  
  //当前着色点是否在投影中
  bool isInShadow(){
    vec3 fragPos=(v_ClipPosLight.xyz/v_ClipPosLight.w)/2.0 + 0.5;
    vec4 shadowFrag = texture2D(u_ShadowMap, fragPos.xy);
    const vec4 bitShift = vec4(
      1.0, 
      1.0/256.0, 
      1.0/(256.0*256.0), 
      1.0/(256.0*256.0*256.0)
    );
    float depth = dot(shadowFrag, bitShift);
    return fragPos.z>depth+1.0/(256.0*4.0);
  }

  void main(){
    ……
    //投影
    float darkness=isInShadow()?0.4:1.0;
    //着色点颜色
    vec3 color=intensity*darkness*(diffuse+specular)+u_Ka;
    
    gl_FragColor=vec4(color,1.0);
  }
</script>
```

2. 引入缓冲区对象

```js
import Frame from './lv/Frame.js'
```

3. 建立webgl上下文对象
```js
const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let gl = canvas.getContext('webgl');
//gl.clearColor(0.0, 0.0, 0.0, 1.0);
//gl.enable(gl.DEPTH_TEST);
```

4. 建立相机和相机轨道
```js
// 目标点
const target = new Vector3(0,1.5,0)
//视点
const eye = new Vector3(0, 4, 10)
const [fov, aspect, near, far] = [
  45, canvas.width / canvas.height,
  1, 50
]
// 透视相机
const camera = new PerspectiveCamera(fov, aspect, near, far)
camera.position.copy(eye)
// 轨道控制器
const orbit = new OrbitControls({ camera, target, dom: canvas, })
```

5. 实例化球体和幕布

```js
/* 球体 */
const sphere = new Sphere(0.5, 18, 18)
const { vertices, indexes,normals } = sphere
//球体模型矩阵
const sphereMatrix = new Matrix4().setPosition(0, sphere.r, 0)

/* 幕布 */
const backdrop = new Backdrop(20, 10, 10)
// 幕布模型矩阵
const backMatrix = new Matrix4().setPosition(0, 0, -1)
```

6. 用透视相机建立灯光对象，并从中获取透视视图矩阵，存入灯光数据中。

```js
const light = new PerspectiveCamera(70, ratio, 0.5, 8)
light.position.copy(u_LightPos)
light.lookAt(u_LightTarget)
light.updateMatrixWorld(true)
const pvMatrixLight = light.projectionMatrix.clone()
.multiply(light.matrixWorldInverse)

// 灯光数据
const lightData = {
  ……
  u_PvMatrixLight: {
    value: pvMatrixLight.elements,
    type: 'uniformMatrix4fv',
  },
}
```

7. 实例化帧缓冲区对象
```js
// 帧缓冲区
const frame = new Frame({ gl })
frame.registerProgram(
  'shadow',
  {
    program: createProgram(
      gl,
      document.getElementById('vShadow').innerText,
      document.getElementById('fShadow').innerText
    ),
    attributeNames: ['a_Position'],
    uniformNames: ['u_PvMatrix', 'u_ModelMatrix']
  }
)
```

8. 实例化场景对象

```js
// 场景
const scene = new Scene({ gl })
// 注册程序对象
scene.registerProgram(
  'Blinn-Phong',
  {
    ……
    uniformNames: [
      ……
      'u_PvMatrixLight', 'u_ShadowMap'
    ]
  }
)
```

9. 建立球体和幕布所对应的Geo和Mat
```js
// 球体
const matSphere = new Mat({
  program: 'Blinn-Phong',
  data: {
    u_ModelMatrix: {
      value: sphereMatrix.elements,
      type: 'uniformMatrix4fv',
    },
    ...cameraData,
    ...lightData,
    ...matData
  },
})
const geoSphere = new Geo({
  data: {
    a_Position: {
      array: vertices,
      size: 3
    },
    a_Normal: {
      array: normals,
      size: 3
    },
  },
  index: {
    array: indexes
  }
})

// 幕布
const matBack = new Mat({
  program: 'Blinn-Phong',
  data: {
    u_ModelMatrix: {
      value: backMatrix.elements,
      type: 'uniformMatrix4fv',
    },
    ...cameraData,
    ...lightData,
    ...matData
  },
})
const geoBack = new Geo({
  data: {
    a_Position: {
      array: backdrop.vertices,
      size: 3
    },
    a_Normal: {
      array: backdrop.normals,
      size: 3
    },
  },
  index: {
    array: backdrop.indexes
  }
})
```

10. 基于球体和幕布所对应的Geo和Mat，在帧缓冲区中绘制投影贴图。
```js
// 在帧缓冲区中绘图
frame.add(
  new Obj3D({
    geo: new Geo({
      data: {
        a_Position: geoSphere.data.a_Position,
      },
      index: geoSphere.index
    }),
    mat: new Mat({
      program: 'shadow',
      data: {
        u_ModelMatrix: matSphere.data.u_ModelMatrix,
        u_PvMatrix: matSphere.data.u_PvMatrixLight,
      },
    })
  }),
  new Obj3D({
    geo: new Geo({
      data: {
        a_Position: geoBack.data.a_Position,
      },
      index: geoBack.index
    }),
    mat: new Mat({
      program: 'shadow',
      data: {
        u_ModelMatrix: matBack.data.u_ModelMatrix,
        u_PvMatrix: matBack.data.u_PvMatrixLight,
      },
    })
  })
)
frame.draw()
```

11. 将帧缓冲区里的纹理对象交给球体和幕布的材质对象，用于渲染投影。

```js
const maps = {
  u_ShadowMap: {
    texture: frame.texture
  }
}
matSphere.maps = maps
matBack.maps = maps
```

12. 在canvas 画布中绘图。

```js
const objSphere = new Obj3D({ geo: geoSphere, mat: matSphere })
scene.add(objSphere)
const objBack = new Obj3D({ mat: matBack, geo: geoBack })
scene.add(objBack)

!(function render() {
  orbit.getPvMatrix()
  scene.setUniform('u_Eye', {
    value: Object.values(camera.position)
  })
  scene.draw()
  requestAnimationFrame(render)
})()
```

13. 我们也可以为小球添加一个弹跳动画，测试一下异步渲染。
```js
!(function render(time = 0) {
  const y = Math.sin(time / 200) * 2 + 2 + sphere.r
  sphereMatrix.elements[13] = y
  frame.draw()
  orbit.getPvMatrix()
  scene.setUniform('u_Eye', {
    value: Object.values(camera.position)
  })
  scene.draw()
  requestAnimationFrame(render)
})()
```

关于投影和帧缓冲区的用法，就先说到这。  
对于投影的模糊，以及帧缓冲区的其它玩法，等走完了整个课程，再做深度剖析。  
到目前为止，都是用纯色定义的模型的反射系数。  
在实际项目中，纹理是不可或缺的，因此还需要说一下纹理映射。


## 二十六、纹理映射

纹理映射就是将纹理中的像素映射到模型相应位置的着色点上。  
纹理中所存储的像素信息，可以用来表示模型的漫反射、镜面反射、透明度、凹凸等。  
纹理映射是通过UV 坐标实现的。  
在实际项目中，若模型是由建模师提供的，那我们可以跟他要一份贴图的 UV 坐标。  
然而，有些模型是需要我们动态建模的，这种模型所需的 UV 坐标就需要我们自己来计算了。  

接下来说两个常见纹理映射。
### 1.等距圆柱投影

#### 1.1概念

之前画过一个球体：  
![](/webgl-share/144.png)

然后从基维百科上找了一张地球的等距圆柱投影贴图：  
![](/webgl-share/177.jpg)

接下来便可以利用等距投影规则把上面的贴图贴到球体上：  
![](/webgl-share/178.png)

实现上面这个效果的关键就是纹理映射，我所使用的纹理映射方法就是等距圆柱投影。  
等距的意思就是上面的贴图里，每个格子的宽(纬线)、高(经线)尺寸都是相等的。  
圆柱投影的意思是，用圆柱包裹球体，圆柱的面与球体相切。在球体中心放一个点光源，点光源会把球体投射到圆柱上，从而得到球体的圆柱投影。  
![](/webgl-share/179.png)

等距圆柱投影贴图也可以理解为球体展开后的样子。  
![](/webgl-share/180.png)

等距圆柱投影除了可以画地球，它在VR 中也得到了广泛的应用。  
现在市面上的720°全景相机拍摄出的全景图片，一般都是等距圆柱投影图片。  
![](/webgl-share/181.jpg)

等距圆柱投影的计算挺简单的，之前说球坐标系的时候就已经为其打好了基础。
#### 1.2地理坐标系
地理坐标系(Geographic coordinate system) 就是一种球坐标系(Spherical coordinate system)。  
地理坐标系和three.js 里的Spherical 球坐标系差不多，只是在θ和φ的定义上略有差异。

Spherical 球坐标系里的方位角θ和极角φ的定义规则：
- θ 起始于z轴的正半轴，逆时针旋转，旋转量越大θ 值越大，0 ≤ θ  < 2π
- φ 起始于y轴的正半轴，向下旋转，旋转量越大φ 值越大，0 ≤ φ < π

下图是地理坐标系：  
![](/webgl-share/182.png)

- θ 对应经度，起始于x轴的正半轴，即本初子午线的位置，θ=0
  - 从0° 逆时针旋转，旋转量越大θ 值越大，旋转到180°结束，是为东经，0 ≤ θ  < π
  - 从0° 顺时针旋转，旋转量越大θ 值越小，旋转到-180°结束，是为西经，0 ≤ θ  < -π
- φ 对应维度，起始于赤道，φ=0
  - 从0° 向上旋转，旋转量越大φ 值越大，旋转到90°结束，是为北纬，0 ≤ φ < π/2
  - 从0° 向下旋转，旋转量越大φ 值越小，旋转到-90°结束，是为南纬，0 ≤ φ < -π/2

对于已知一点的经纬度，求此点的三维直角坐标位的方法，上图已经详细画出。

#### 1.3经纬度与等距圆柱投影贴图的线性映射

通过上面经纬度的定义规则，可以知道：

- 经度和U值相映射
- 维度和V值相映射

其具体的映射映射方式如下图所示：  
![](/webgl-share/183.png)

- 经度[-π,π] 映射u[0,1]
- 维度[-π/2,π/2] 映射v[0,1]

#### 1.4绘制地球

1. 建立一个地理坐标系Geography对象，方便把经纬度转三维直角坐标。
```js
import {Vector3} from 'https://unpkg.com/three/build/three.module.js';
/*
属性：
  r：半径
  longitude：经度(弧度)
  latitude：纬度(弧度)
  position：三维坐标位

构造参数：
  r,longitude,latitude 
  或者
  position
*/
export default class Geography{
  constructor(r=1,longitude=0, latitude=0){
    this.r=r
    this.longitude=longitude
    this.latitude = latitude
    this.position=new Vector3()
    this.updatePos()
  }
  //克隆
  clone() {
    const { r, longitude, latitude } = this
    return new Geography(r, longitude, latitude)
  }
  //设置半径，更新三维直角坐标位
  setR(r) {
    this.r = r
    this.updatePos()
    return this
  }
  //根据经纬度更新三维直角坐标位
  updatePos() {
    const { r,longitude,latitude } = this
    const len = Math.cos(latitude) * r
    this.position.set(
      Math.cos(longitude)*len,
      Math.sin(latitude)*r,
      -Math.sin(longitude)*len
    )
  }
}
```

2. 建模

之前画过一个球体Sphere.js，只不过这个球体的南极和北极共用一个顶点，不适合做柱状投影贴图。

接下来，在其基础上再改装一个球体Earth出来，这个Earth对象是按照矩形网格建模的，如下图所示：  
![](/webgl-share/184.png)

当前这个Earth对象是直接按照矩形网格建模的。
```js
import Geography from './Geography.js'

/*
属性：
  r：半径
  widthSegments：横向段数，最小3端
  heightSegments：纵向段数，最小2端
  vertices：顶点集合
  normals：法线集合
  indexes：顶点索引集合
  uv：uv坐标
  count：顶点数量
*/
export default class Earth{
  constructor(r=1, widthSegments=3, heightSegments=2){
    this.r=r
    this.widthSegments=widthSegments
    this.heightSegments=heightSegments
    this.vertices=[]
    this.normals=[]
    this.indexes = []
    this.uv=[]
    this.count=0
    this.init()
  }
  init() {
    const {r,widthSegments, heightSegments } = this
    //网格线的数量
    const [width,height]=[widthSegments+1,heightSegments +1]
    //顶点数量
    this.count = width*height
    // theta和phi方向的旋转弧度
    const thetaSize = Math.PI * 2 / widthSegments
    const phiSize = Math.PI / heightSegments

    // 顶点集合
    const vertices = []
    // 法线集合
    const normals = []
    // 顶点索引集合
    const indexes = []
    //uv 坐标集合
    const uv=[]
    // 逐行列遍历
    for (let y = 0; y < height; y++) {
      // 维度 
      const phi = Math.PI/2-phiSize * y
      for (let x = 0; x < width; x++) {
        //经度，-Math.PI是为了让0°经线经过x轴的正半轴
        const theta = thetaSize * x-Math.PI
        // 计算顶点和法线
        const vertice = new Geography(r,theta,phi).position
        vertices.push(...Object.values(vertice))
        normals.push(...Object.values(vertice.normalize()))
        const [u, v] = [
          x / widthSegments,
          1-y/heightSegments
        ]
        uv.push(u, v)
        // 顶点索引
        if (y && x) {
          // 一个矩形格子的左上lt、右上rt、左下lb、右下rb点
          const lt = (y-1) * width + (x-1)
          const rt = (y-1) * width + x
          const lb = y * width + (x-1)
          const rb = y * width + x
          indexes.push(lb, rb, lt, lt, rb, rt)
        }
      }
    }
    this.vertices=new Float32Array(vertices)
    this.normals=new Float32Array(normals)
    this.uv=new Float32Array(uv)
    this.indexes=new Uint16Array(indexes)
  }
}
```

3. 着色器
```html
<script id="vs" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  attribute vec2 a_Pin;
  uniform mat4 u_PvMatrix;
  uniform mat4 u_ModelMatrix;
  varying vec2 v_Pin;
  void main(){
    gl_Position=u_PvMatrix*u_ModelMatrix*a_Position;
    v_Pin=a_Pin;
  }
</script>
<script id="fs" type="x-shader/x-fragment">
  precision mediump float;
  uniform sampler2D u_Sampler;
  varying vec2 v_Pin;
  void main(){
    gl_FragColor=texture2D(u_Sampler,v_Pin);
  }
</script>
```

3. 贴图
```js
import { createProgram, } from "/jsm/Utils.js";
import {
  Matrix4, PerspectiveCamera, Vector3
} from 'https://unpkg.com/three/build/three.module.js';
import OrbitControls from './lv/OrbitControls.js'
import Mat from './lv/Mat.js'
import Geo from './lv/Geo.js'
import Obj3D from './lv/Obj3D.js'
import Scene from './lv/Scene.js'
import Earth from './lv/Earth.js'

const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const gl = canvas.getContext('webgl');

// 球体
const earth = new Earth(0.5, 64, 32)

// 目标点
const target = new Vector3()
//视点
const eye = new Vector3(2, 0, 0)
const [fov, aspect, near, far] = [
  45, canvas.width / canvas.height,
  0.1, 5
]
// 透视相机
const camera = new PerspectiveCamera(fov, aspect, near, far)
camera.position.copy(eye)
// 轨道控制器
const orbit = new OrbitControls({ camera, target, dom: canvas, })

// 场景
const scene = new Scene({ gl })
//注册程序对象
scene.registerProgram(
  'map',
  {
    program: createProgram(
      gl,
      document.getElementById('vs').innerText,
      document.getElementById('fs').innerText,
    ),
    attributeNames: ['a_Position', 'a_Pin'],
    uniformNames: ['u_PvMatrix', 'u_ModelMatrix']
  }
)

//地球
const matEarth = new Mat({
  program: 'map',
  data: {
    u_PvMatrix: {
      value: orbit.getPvMatrix().elements,
      type: 'uniformMatrix4fv',
    },
    u_ModelMatrix: {
      value: new Matrix4().elements,
      type: 'uniformMatrix4fv',
    },
  },
})
const geoEarth = new Geo({
  data: {
    a_Position: {
      array: earth.vertices,
      size: 3
    },
    a_Pin: {
      array: earth.uv,
      size: 2
    }
  },
  index: {
    array: earth.indexes
  }
})

//加载图片
const image = new Image()
image.src = './images/earth.jpg'
image.onload = function () {
  matEarth.maps.u_Sampler = { image }
  scene.add(new Obj3D({
    geo: geoEarth,
    mat: matEarth
  }))
  render()
}

// 连续渲染
function render(time = 0) {
  orbit.getPvMatrix()
  scene.draw()
  requestAnimationFrame(render)
}

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
效果如下：  
![](/webgl-share/178.png)

到现在，应该对等距圆柱投影有了一个整体的认知。  
接下就可以再做一下扩展，根据经纬度，为某个地点做标记。
#### 1.5标记点

百度地图里拿到了天安门的经纬度(116.404,39.915)，其意思就是东经116.404°, 北纬39.915°  
使用Geography 对象便可以将经纬度转三维直角坐标位，然后再根据这个三维直角坐标位做个标记即可。  
![](/webgl-share/185.png)

标记点的制作思路有两种：  
- 用<img>之类的HTML标签实现。
  - 优点：制作便捷，尤其是要为其添加文字的时候。
  - 缺点：要将标记点在webgl 裁剪空间坐标位转换到css 坐标位。需要额外考虑标记点与模型的遮挡问题。
- 在webgl 中实现。
  - 优点：标记点操作方便，模型遮挡实现便捷。
  - 缺点：若标记点中存在文字，需做额外考量。

对于文字标记的显示问题，这里先不说，后面会单独详解。  
接下来，先用webgl 在地图上显示一个不带文字的标记点。  

1. 建立一个矩形面对象，方便之后把标记点作为贴图贴上去。
```js
import {Vector2} from 'https://unpkg.com/three/build/three.module.js';

/*
属性：
  size:尺寸
  orign:基点，百分比，默认左下角
  vertices：顶点集合
  normals：法线集合
  indexes：顶点索引集合
  uv：uv坐标
*/
export default class Rect{
  constructor(w=1, h=1,x=0,y=0){
    this.size=new Vector2(w,h)
    this.orign=new Vector2(x,y)
    this.vertices=[]
    this.normals=[]
    this.indexes = []
    this.uv=[]
    this.update()
  }
  update() {
    const { size, orign } = this
    const l=-orign.x*size.x
    const b =-orign.y * size.y
    const r=size.x+l
    const t=size.y+b
    
    this.vertices = new Float32Array([
      l, t, 0,
      l, b, 0,
      r, t, 0,
      r, b, 0,
    ])
    this.normals = new Float32Array([
      0,0,1,
      0,0,1,
      0,0,1,
      0,0,1,
    ])
    this.uv = new Float32Array([
      0, 1,
      0, 0,
      1, 1,
      1, 0
    ])
    this.indexes = new Uint16Array([
      0, 1, 2,
      2,1,3
    ])
  }
}
```
接下来，基于之前圆柱投影文件略作调整。
 
2. 实例化Rect 对象
```js
import Rect from './lv/Rect.js'
……
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
……
// 矩形面
const rect = new Rect(0.02, 0.02, 0.5, 0)
```

3. 基于天安门经纬度，建立Geography 对象。

```js
const rad = Math.PI / 180
const geography = new Geography(
  earth.r,
  116.404 * rad,
  39.915 * rad
)
```

4. 让相机的视点直视天门。

```js
const eye = geography.clone()
      .setR(earth.r + 1)
      .position
```

5. 基于标记点的三维直角坐标位构建一个模型矩阵

```js
const modelMatrix = new Matrix4()
	.setPosition(geography.position)
```

6. 建立标记点的Mat和Geo 对象

```js
const matMark = new Mat({
  program: 'map',
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
})
const geoMark = new Geo({
  data: {
    a_Position: {
      array: rect.vertices,
      size: 3
    },
    a_Pin: {
      array: rect.uv,
      size: 2
    }
  },
  index: {
    array: rect.indexes
  }
})
```

7. 当所有贴图都加载成功后，将贴图传给相应的Mat 对象。然后建立地球和标记点所对应的Obj3D对象，将其添加到Scene 场景中，进行渲染。
```js
//加载图形
const imgPromises = ['earth.jpg', 'mark.png'].map(name => {
  const img = new Image()
  img.src = `./images/${name}`
  return imgPromise(img)
})
Promise.all(imgPromises).then((imgs) => {
  matEarth.maps.u_Sampler = { image: imgs[0] }
  matMark.maps.u_Sampler = {
    image: imgs[1],
    format: gl.RGBA
  }
  scene.add(new Obj3D({
    geo: geoEarth,
    mat: matEarth
  }))
  scene.add(new Obj3D({
    geo: geoMark,
    mat: matMark
  }))
  render()
})

// 连续渲染
function render(time = 0) {
  orbit.getPvMatrix()
  scene.draw()
  requestAnimationFrame(render)
}
```

8. 让标记点贴合到地球表面

```js
const modelMatrix = new Matrix4()
      .setPosition(geography.position)
      .multiply(
        new Matrix4().lookAt(
          geography.position,
          target,
          new Vector3(0, 1, 0)
        )
      )
```
最终效果如下：  
![](/webgl-share/186.png)

在实际项目中，围绕地球，是可以做很多东西。  
比如在球体上绘制柱状图，表示不同地区的经济增长情况；  
在两个地点之间绘制3D路径，以表示两地之间存在的联系；  
对于这些效果，就先不做扩展了。

接下来，再把相机塞进地球里，做一个VR的效果。


### 2.VR

VR(Virtual Reality) 的意思就是虚拟现实，可以通过VR 眼镜给人环境沉浸感。

VR 的制作需要考虑两点：

- 搭建场景，当前比较常见的搭建场景的方法就是将全景图贴到立方体，或者球体上。
- 场景变换，一般会把透视相机塞进立方体，或者球体里，然后变换场景。

接下来具体说一下其实现步骤。
#### 2.1搭建场景

1. 用720°全景相机拍摄一张室内全景图。  
![](/webgl-share/181.jpg)

2. 在之前地球文件的基础上做修改，把地图替换成上面的室内全景图。
```js
const image = new Image()
image.src = './images/room.jpg'
```

3. 把相机打入球体之中
```js
// 目标点
const target = new Vector3()
//视点
const eye = new Vector3(0.15, 0, 0)
const [fov, aspect, near, far] = [
  60, canvas.width / canvas.height,
  0.1, 1
]
```

效果如下：  
![](/webgl-share/187.png)

现在VR的效果就已经有了，接下来还需要考虑VR 场景的变换。

#### 2.2 VR场景的变换

VR 场景的变换通过相机轨道控制器便可以实现。  
当前相机轨道控制器已经具备了旋转、缩放和平移功能。  
只不过，针对VR 还得对相机轨道控制器做一下微调。

1. 取消相机的平移，以避免相机跑到球体之外。

为相机轨道控制器 OrbitControls 添加一个是否启用平移的功能。
```js
const defAttr = () => ({
  ……
  enablePan: true,
})

```

在平移方法中，做个是否平移的判断：
```js
pointermove({ clientX, clientY }) {
  const { dragStart, dragEnd, state,enablePan, camera: { type } } = this
  dragEnd.set(clientX, clientY)
  switch (state) {
    case 'pan':
      enablePan&&this[`pan${type}`](dragEnd.clone().sub(dragStart))
      break
    ……
  }
  dragStart.copy(dragEnd)
}
```

这样就可以在实例化OrbitControls 对象的时候，将enablePan 设置为false，从而禁止相机平移。
```js
const orbit = new OrbitControls({
  camera,
  target,
  dom: canvas,
  enablePan: false
})
```

2. 使用透视相机缩放VR 场景时，不再使用视点到目标的距离来缩放场景，因为这样的放大效果不太明显。所以，可以直接像正交相机那样，缩放裁剪面。

为OrbitControls 对象的wheel 方法添加一个控制缩放方式的参数。

```js
wheel({ deltaY },type=this.camera.type) {
  const { zoomScale} = this
  let scale=deltaY < 0?zoomScale:1 / zoomScale
  this[`dolly${type}`](scale)
  this.updateSph()
}
```

这样就可以像缩放正交相机那样缩放透视相机。

```js
canvas.addEventListener('wheel', event => {
  orbit.wheel(event, 'OrthographicCamera')
})
```

3. 在缩放的时候，需要限制一下缩放范围，免得缩放得太大，或者缩小得超出了球体之外。

为OrbitControls 添加两个缩放极值：

- minZoom 缩放的最小值
- maxZoom 缩放的最大值
```js
const defAttr = () => ({
  ……
  minZoom:0,
  maxZoom: Infinity,
})
```

在相应的缩放方法中，对缩放量做限制：
```js
dollyOrthographicCamera(dollyScale) {
  const {camera,maxZoom,minZoom}=this
  const zoom=camera.zoom*dollyScale
  camera.zoom = Math.max(
    Math.min(maxZoom, zoom),
    minZoom
  )
  camera.updateProjectionMatrix()
}
```

在实例化OrbitControls 对象时，设置缩放范围：
```js
const orbit = new OrbitControls({
  ……
  maxZoom: 15,
  minZoom: 0.4
})
```
#### 2.3陀螺仪

VR 的真正魅力在于，你可以带上VR 眼镜，体会身临其境的感觉。  
VR 眼镜之所以能给你身临其境的感觉，是因为它内部有一个陀螺仪，可以监听设备的转动，从而带动VR 场景的变换。  
目前市场上常见的VR 眼镜有两种：需要插入手机的VR眼镜和一体机。  
一般手机里都是有陀螺仪的，因此我们可以用手机来体验VR。  

接下来，可以先整个小例子练练手。  
要画个立方体，然后用陀螺仪旋转它。  

为了更好的理解陀螺仪。我们把之前的球体变成立方体，在其上面贴上画有东、西、南、北和上、下的贴图。然后在其中打入相机，用陀螺仪变换相机视点，如下图：  
![](/webgl-share/188.png)

1. 建立立方体对象Box
```js
/*
属性：
  w：宽
  h：高
  d：深
  vertices：顶点集合
  normals：法线集合
  indexes：顶点索引集合
  uv：uv坐标集合
  count：顶点数量
*/
export default class Box{
  constructor(w=1,h=1,d=1){
    this.w=w
    this.h=h
    this.d=d
    this.vertices=null
    this.normals=null
    this.indexes = null
    this.uv = null
    this.count = 36
    this.init()
  }
  init() {
    const [x, y, z] = [this.w / 2, this.h / 2, this.d / 2]
    this.vertices = new Float32Array([
      // 前 0 1 2 3
      -x, y, z, -x, -y, z, x, y, z, x, -y, z,
      // 右 4 5 6 7
      x, y, z, x, -y, z, x, y, -z, x, -y, -z,
      // 后 8 9 10 11
      x, y, -z, x, -y, -z, -x, y, -z, -x, -y, -z,
      // 左 12 13 14 15 
      -x, y, -z, -x, -y, -z, -x, y, z, -x, -y, z,
      // 上 16 17 18 19
      -x, y, -z, -x, y, z, x, y, -z, x, y, z,
      // 下 20 21 22 23 
      -x,-y,z,-x,-y,-z,x,-y,z,x,-y,-z,
    ])
    this.normals = new Float32Array([
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
      1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
      0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 
      -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
      0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
      0,-1,0,0,-1,0,0,-1,0,0,-1,0,
    ])
    /* this.uv = new Float32Array([
      0,1,0,0,1,1,1,0,
      0,1,0,0,1,1,1,0,
      0,1,0,0,1,1,1,0,
      0,1,0,0,1,1,1,0,
      0,1,0,0,1,1,1,0,
      0,1,0,0,1,1,1,0,
    ]) */
    this.uv = new Float32Array([
      0,1, 0,0.5, 0.25,1, 0.25,0.5,
      0.25,1, 0.25,0.5, 0.5,1, 0.5,0.5,
      0.5,1, 0.5,0.5, 0.75,1, 0.75,0.5,
      0,0.5,0,0,0.25,0.5,0.25,0,
      0.25,0.5,0.25,0,0.5,0.5,0.5,0,
      0.5,0.5,0.5,0,0.75,0.5,0.75,0,
    ])
    this.indexes = new Uint16Array([
      0, 1, 2, 2, 1, 3,
      4, 5, 6, 6, 5, 7,
      8, 9, 10, 10, 9, 11,
      12, 13, 14, 14, 13, 15,
      16, 17, 18, 18, 17, 19, 
      20,21,22,22,21,23
    ])
  }
}
```

2. 在Google浏览器中打开传感器，模拟陀螺仪的旋转。

在电脑里做测试的时候，需要用浏览器里的开发者工具  
![](/webgl-share/189.jpg)

之后可以在js中通过 deviceorientation 事件监听陀螺仪的变化。  
从deviceorientation 事件的回调参数event里，可以解构出alpha, beta, gamma 三个参数。
```js
window.addEventListener('deviceorientation', (event) => {
  const { alpha, beta, gamma }=event
})
```

alpha, beta, gamma对应了陀螺仪欧拉旋转的三个参数。

在右手坐标系中，其概念如下：

- alpha：绕世界坐标系的y轴逆时针旋转的角度，旋转范围是[-180°,180°)
- beta：绕本地坐标系的x轴逆时针旋转的角度，旋转范围是[-180°,180°)
- gamma ：绕本地坐标系的z轴顺时针旋转的角度，旋转范围是[-90°,90°)

`注`：alpha, beta, gamma具体是绕哪个轴旋转，跟我们当前程序所使用的坐标系有关。所以大家之后若是看到有些教程在说陀螺仪时，跟我说的不一样，也不要惊奇，只要在实践中没有问题就可以。

陀螺仪欧拉旋转的顺序是'YXZ'，而不是欧拉对象默认的'XYZ'。  
欧拉旋转顺序是很重要的，如果乱了，就无法让VR旋转与陀螺仪相匹配了。  

接下来，基于之前VR.html 文件做下调整。

3. 建立立方体对象
```js
import Box from './lv/Box.js'
const box = new Box(1, 1, 1)
```

4. 调整相机数据
```js
// 目标点
const target = new Vector3()
//视点
const eye = new Vector3(0, 0.45, 0.0001)
const [fov, aspect, near, far] = [
  120, canvas.width / canvas.height,
  0.01, 2
]
// 透视相机
const camera = new PerspectiveCamera(fov, aspect, near, far)
camera.position.copy(eye)
```

相机的视线是根据陀螺仪的初始状态设置的。  
在陀螺仪的alpha, beta, gamma皆为0的情况下，手机成俯视状态。  
![](/webgl-share/190.png)

所以，相机也要成俯视状态，因此视点的y值设置为0.45。  
然而，视线也不能完全垂直，因为这样视点绕y轴旋转就会失效。  
所以，视点的z值给了一个较小的数字0.0001。

5. 场景的渲染和之前是一样。
```js
// 轨道控制器
const orbit = new OrbitControls({
  camera,
  target,
  dom: canvas,
  enablePan: false,
  maxZoom: 15,
  minZoom: 0.4
})

// 场景
const scene = new Scene({ gl })
//注册程序对象
scene.registerProgram(
  'map',
  {
    program: createProgram(
      gl,
      document.getElementById('vs').innerText,
      document.getElementById('fs').innerText,
    ),
    attributeNames: ['a_Position', 'a_Pin'],
    uniformNames: ['u_PvMatrix', 'u_ModelMatrix']
  }
)

//立方体
const matBox = new Mat({
  program: 'map',
  data: {
    u_PvMatrix: {
      value: orbit.getPvMatrix().elements,
      type: 'uniformMatrix4fv',
    },
    u_ModelMatrix: {
      value: new Matrix4().elements,
      type: 'uniformMatrix4fv',
    },
  },
})
const geoBox = new Geo({
  data: {
    a_Position: {
      array: box.vertices,
      size: 3
    },
    a_Pin: {
      array: box.uv,
      size: 2
    }
  },
  index: {
    array: box.indexes
  }
})

//加载图片
const image = new Image()
image.src = './images/magic.jpg'
image.onload = function () {
  matBox.maps.u_Sampler = {
    image,
    magFilte: gl.LINEAR,
    minFilter: gl.LINEAR,
  }
  scene.add(new Obj3D({
    geo: geoBox,
    mat: matBox
  }))
  render()
}

function render() {
  orbit.getPvMatrix()
  scene.draw()
  requestAnimationFrame(render)
}
```
效果如下：  
![](/webgl-share/190.png)

7. 监听陀螺仪事件时，需要考虑三件事：

- 判断当前设备里是否有陀螺仪。
- 让用户触发浏览器对陀螺仪事件的监听，可通过click 之类的事件触发。
- 若系统是ios，需要请求用户许可。

css 样式：
```css
html {height: 100%;}
body {
  margin: 0;
  height: 100%;
  overflow: hidden
}
.wrapper {
  display: flex;
  position: absolute;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  top: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 10;
}
#playBtn {
  padding: 24px 24px;
  border-radius: 24px;
  background-color: #00acec;
  text-align: center;
  color: #fff;
  cursor: pointer;
  font-size: 24px;
  font-weight: bold;
  border: 6px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 9px 9px rgba(0, 0, 0, 0.7);
}
```

html 标签：
```html
<canvas id="canvas"></canvas>
<div class="wrapper">
  <div id="playBtn">开启VR之旅</div>
</div>
```

js 代码：
```js
// 遮罩
const wrapper = document.querySelector('.wrapper')
// 按钮
const btn = document.querySelector('#playBtn')
// 判断设备中是否有陀螺仪
if (window.DeviceMotionEvent) {
  // 让用户触发陀螺仪的监听事件
  btn.addEventListener('click', () => {
    //若是ios系统，需要请求用户许可
    if (DeviceMotionEvent.requestPermission) {
      requestPermission()
    } else {
      rotate()
    }
  })
} else {
  btn.innerHTML = '您的设备里没有陀螺仪！'
}

//请求用户许可
function requestPermission() {
  DeviceMotionEvent.requestPermission()
    .then(function (permissionState) {
    // granted:用户允许浏览器监听陀螺仪事件
    if (permissionState === 'granted') {
      rotate()
    } else {
      btn.innerHTML = '请允许使用陀螺仪🌹'
    }
  }).catch(function (err) {
    btn.innerHTML = '请求失败！'
  });
}

//监听陀螺仪
function rotate() {
  wrapper.style.display = 'none'
  window.addEventListener('deviceorientation', ({ alpha, beta, gamma }) => {
    const rad = Math.PI / 180
    const euler = new Euler(
      beta * rad,
      alpha * rad,
      -gamma * rad,
      'YXZ'
    )
    camera.position.copy(
      eye.clone().applyEuler(euler)
    )
    orbit.updateCamera()
    orbit.resetSpherical()
  })
}
```

关于陀螺仪的基本用法就说到这。

之前在网上看了一些陀螺仪相关的教程，很多都没说到点上，因为若是不知道欧拉旋转的概念，就说不明白陀螺仪。

所以，一定要花时间学习图形学，图形学关系着自身发展的潜力。  
接下来可以在VR.html 文件里，以同样的原理把陀螺仪写进去，并结合项目的实际需求做一下优化。
#### 2.4 VR+陀螺仪

可以先把陀螺仪封装一下，以后用起来方便。

1. 封装一个陀螺仪对象Gyro.js
```js
import {Euler} from 'https://unpkg.com/three/build/three.module.js';

const rad = Math.PI / 180

const defAttr = () => ({
  //用于触发事件的按钮
  btn: null,
  //没有陀螺仪
  noDevice: () => { },
  //当点击按钮时
  onClick: () => { },
  //可以使用陀螺仪时触发一次
  init: () => { },
  //用户拒绝开启陀螺仪
  reject: () => { },
  //请求失败
  error: () => { },
  //陀螺仪变换
  change: () => { },
})

export default class Gyro {
  constructor(attr) {
    Object.assign(this, defAttr(), attr)
  }
  start() {
    const { btn } = this
    if (window.DeviceMotionEvent) {
      // 让用户触发陀螺仪的监听事件
      btn.addEventListener('click', () => {
        this.onClick()
        //若系统是ios，需要请求用户许可
        if (DeviceMotionEvent.requestPermission) {
          this.requestPermission()
        } else {
          this.translate()
        }
      })
    } else {
      this.noDevice()
    }
  }
  //请求用户许可
  requestPermission() {
    DeviceMotionEvent.requestPermission()
      .then((permissionState) => {
      // granted:用户允许浏览器监听陀螺仪事件
      if (permissionState === 'granted') {
        this.translate()
      } else {
        this.reject()
      }
    }).catch((err) => {
      this.error(err)
    });
  }
  // 监听陀螺仪
  translate() {
    this.init()
    window.addEventListener('deviceorientation', ({ beta, alpha, gamma }) => {
      this.change(new Euler(
        beta * rad,
        alpha * rad,
        -gamma * rad,
        'YXZ'
      ))
    })
  }
}
```

2. 把陀螺仪对象引入VR文件
```js
import Gyro from './lv/Gyro.js'

// 遮罩
const wrapper = document.querySelector('.wrapper')
// 按钮
const btn = document.querySelector('#playBtn')
// 陀螺仪
const gyro = new Gyro({
  btn,
  noDevice: () => {
    btn.innerHTML = '您的设备里没有陀螺仪！'
  },
  reject: () => {
    btn.innerHTML = '请允许使用陀螺仪🌹'
  },
  error: () => {
    btn.innerHTML = '请求失败！'
  },
  init: () => {
    wrapper.style.display = 'none'
  },
  change: (euler) => {
    camera.position.copy(
      eye.clone().applyEuler(euler)
    )
    orbit.updateCamera()
    orbit.resetSpherical()
  }
})
gyro.start()
```

3. 优化图像的加载。

在实际开发中，为了让用户看到比较清晰的效果，往往需要使用比较大的全景图，比如4096*2048 的尺寸。  
大尺寸的图片加载起来会很慢，为了减少用户的等待，可以先加载一个较小的图片，然后慢慢的过度到大图。

比如，可以从小到大准备4张不同尺寸的全景图：

- 512*256
- 1024*512
- 2048*1024
- 4096*2048

接下来先加载第一张小图，将其显示出来后，再依次加载后面的大图。
```js
//图片序号
let level = 0
//加载图片
loadImg()
function loadImg() {
  const image = new Image()
  image.src = `./images/room${level}.jpg`
  image.onload = function () {
    if (level === 0) {
      firstRender(image)
    } else {
      //更新贴图
      matEarth.setMap('u_Sampler', { image })
    }
    if (level < 3) {
      level++
      loadImg()
    }
  }
}
// 第一次渲染
function firstRender(image) {
  btn.innerHTML = '开启VR之旅'
  matEarth.maps.u_Sampler = {
    image,
    magFilte: gl.LINEAR,
    minFilter: gl.LINEAR,
  }
  scene.add(new Obj3D({
    geo: geoEarth,
    mat: matEarth
  }))
  render()
}
```

与此同时，我们还得微调一下Mat.js里的更新贴图方法：
```js
updateMap(gl,map,ind) {
  ……
  //gl.bindTexture(gl.TEXTURE_2D, null)
}
```
需要取消对纹理缓冲区的清理。  
以前要清理纹理缓冲区，是因为不需要对纹理缓冲区里的纹理对象进行更新，将其清理掉还可以节约内存。  
而现在需要对纹理缓冲区里的纹理对象进行更新，那就不能清理掉了。
#### 2.5开场动画

开场动画的作用，就是给用户一个吸引眼球的效果，提高项目的趣味性。  
开场动画的开场方式有很多，咱们这里就说一个比较常见的：从上帝视角到普通视角的过度。

上帝视角就是一个俯视的视角，视野一定要广，如下图：  
![](/webgl-share/191.png)

之后，我会用补间动画，将其过度到普通视角，如下图：  
![](/webgl-share/187.png)

从上帝视角到普通视角的变换涉及以下属性：

- 相机视点的位置
- 相机视椎体的垂直视角

接下来便可以基于上面的属性做缓动动画。

1. 把当前的相机视角调为上帝视角。
```js
// 目标点
const target = new Vector3()
//视点-根据陀螺仪做欧拉旋转
const eye = new Vector3( 0.15,0, 0.0001)
// 透视相机
const [fov, aspect, near, far] = [
  130, canvas.width / canvas.height,
  0.01, 2
]
const camera = new PerspectiveCamera(fov, aspect, near, far)
// 上帝视角
camera.position.set(0, 0.42, 0)
```

2. 基于相机的视点和视椎体的垂直夹角建立两个目标变量
```js
const endPos = camera.position.clone()
let endFov = fov
```
上面的两个目标变量默认是和当前相机一致的，之后陀螺仪发生变化时会对其做修改。

3. 在陀螺仪发生变化时，设置目标变量

```js
// 陀螺仪
const gyro = new Gyro({
  ……
  change: (euler) => {
    endFov = 60
    endPos.copy(
      eye.clone().applyEuler(euler)
    )
  }
})
```
当前的开场动画是针对有陀螺仪的手机而言的，接下来再做对PC端的开场动画。

4. 当鼠标点击“开启VR之旅” 的时候，若浏览器在PC端，将视角调为普通视角。
```js
const pc = isPC()
const gyro = new Gyro({
 	……
  onClick: () => {
    if (pc) {
      endPos.set(0.15, 0, 0.0001)
      endFov = 60
    }
  }
})
```

isPC() 是判断浏览器是否在PC端的方法。
```js
const isPC=()=>!navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)

```

5. 建立缓动动画方法
```js
function tween(ratio = 0.05) {
  //若当前设备为PC,缓动结束后就不再缓动，之后的变换交给轨道控制器
  if (pc && camera.fov < endFov + 1) { return }

  camera.position.lerp(endPos, ratio)
  camera.fov += (endFov - camera.fov) * ratio
  camera.updateProjectionMatrix()
  orbit.updateCamera()
  orbit.resetSpherical()
}
```
- camera.updateProjectionMatrix() 更新投影矩阵。

  因为上面更新了视椎体的垂直夹角，所以相机的投影矩阵也要做同步的更新，具体原理参见之前的透视投影矩阵。
- orbit.updateCamera() 更新相机，将相机的视点位置和视线写入相机的本地矩阵里。
- orbit.resetSpherical() 重置球坐标。用鼠标旋转相机的时候会将旋转信息写入球坐标。

6. 在连续渲染时执行缓动动画

```js
function render() {
  tween()
  orbit.getPvMatrix()
  scene.draw()
  requestAnimationFrame(render)
}
```
#### 2.6添加标记点

标记点可以告诉用户不同区域的名称，或者为用户指引方向。  
在添加标记点的时候，我们要考虑两点：
- 如何添加标记点
- 如何制作标记点

接下来在 VR 场景中添加HTML类型的标记点，这种方法是比较常见的。  
在VR中添加HTML类型标记点的核心问题是：如何让HTML 标记点随VR 场景同步变换。  
解决这个问题要按以下几步走：  
![](/webgl-share/192.png)

1. 鼠标点击canvas 画布时，将此点的canvas坐标转世界坐标A。  
​`注`：canvas坐标转世界坐标的原理在“进入三维世界”的选择立方体里说过。  
2. 以视点为起点，A点位方向做射线EA。
3. 求射线EA与球体的交点P，此点便是标记点在世界坐标系内的世界坐标。
4. 在变换VR场景时，将标记点的世界坐标转canvas坐标，然后用此坐标更新标记点的位置。

在上面的步骤中，第3步是关键，我们详细讲解以下。  

`已知`：

- 射线 EA
- 球体球心为O，半径为 r

`求`：射线 EA与球体的交点P

`解`：

先判断射线的基线与球体的关系。

`设`：EA的单位向量为v

用EO叉乘EA的单位向量，求得球心O 到直线的距离|OB|
```js
|OB|=|EO^v|
```

基于|OB|和半径r，可以知道基线与球体的关系：  
![](/webgl-share/193.png)

- |OB|>r，直线与球体相离，没有交点
- |OB|=r，直线与球体相切，1个交点 ，交点为B点

```js
B=v*(EO·v)
```

- |OB|<r，直线与球体相交，2个交点，其算法如下：  
![](/webgl-share/192.png)

在直线EA上的点可以写做：
```js
E+λv, λ∈R
```

直线和球体相交的点满足：
```js
(E+λv-O)²=r²
```

(λv+OE)²可理解为向量OP的长度的平方。  
E-O可写做OE：  
```js
(λv+OE)²=r²
```

展开上式：
```js
λ²v²+2λv·OE+OE²=r²
```

`因为`：单位向量与其自身的点积等于1  
`所以`：
```js
λ²+2λv·OE+OE²=r²
λ²+2λv·OE+OE²-r²=0
```

解一元二次方程式，求λ：  
为了方便书写，设：  
```js
b=2v·OE
c=OE²-r²
```

`则`：
```js
λ²+λb+c=0
λ²+bλ+(b/2)²=-c+(b/2)²
(λ+b/2)²=(b²-4c)/4
λ+b/2=±sqrt(b²-4c)/2
λ=(-b±sqrt(b²-4c))/2
```

知道了λ ，也就可以直线与球体的交点。
```js
λv+OE
```
`注`：当λ小于0时，交点在射线EA的反方向，应该舍弃。  
关于射线与球体的交点，就说到这。

接下来基于之前的VR.html 代码，在VR球体上打一个标记点。

1. 建立一个标记点。当前先不考虑标记点的文字内容的编辑，只关注标记点的位置。
```html
<style>
  #mark {
    position: absolute;
    top: 0;
    left: 0;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.6);
    padding: 6px 12px;
    border-radius: 3px;
    user-select: none;
  }
</style>

<div id="mark">标记点</div>
```

2. 获取标记点，建立markWp变量，用于记录标记点的世界坐标。
```js
// 标记
const mark = document.querySelector('#mark')
// 标记点的世界位
let markWp = null
```

3. 当鼠标双击canvas 画布的时候，添加标记点。
```js
canvas.addEventListener('dblclick', event => {
  addMark(event)
})
```
addMark() 方法做了3件事情：
- worldPos() 把鼠标点击在canvas画布上的canvas坐标转换为世界坐标.  
  此方法咱们之前写过，从Utils.js 中引入即可。
- getMarkWp() 根据鼠标点的世界坐标设置标记点的世界坐标。  
  这便是参照之前射线和球体交点的数学公式来写的。  
  `注`：鼠标点的世界坐标并不是标记点的世界坐标。  
- setMarkCp() 设置标记点的canvas坐标位。
```js
function addMark(event) {
  //鼠标点的世界坐标
  const A = worldPos(event, canvas, pvMatrix)
  //获取标记点的世界坐标
  markWp =getMarkWp(camera.position, A, target, earth.r)
  //设置标记点的canvas坐标位
  setMarkCp(event.clientX, event.clientY)
}

/* 获取射线和球体的交点
  E 射线起点-视点
  A 射线目标点
  O 球心
  r 半径
*/
function getMarkWp(E, A, O, r) {
  const v = A.clone().sub(E).normalize()
  const OE = E.clone().sub(O)
  //b=2v·OE
  const b = v.clone().multiplyScalar(2).dot(OE)
  //c=OE²-r²
  const c = OE.clone().dot(OE) - r * r
  //λ=(-b±sqrt(b²-4c))/2
  const lambda = (-b + Math.sqrt(b * b - 4 * c)) / 2
  //λv+OE
  return v.clone().multiplyScalar(lambda).add(OE)
}

//设置标记点的canvas坐标位
function setMarkCp(x, y) {
  mark.style.left = `${x}px`
  mark.style.top = `${y}px`
}
```

4. 当旋转和缩放相机的时候，对标记点进行同步变换。
```js
canvas.addEventListener('pointermove', event => {
  orbit.pointermove(event)
  updateMarkCp()
})
canvas.addEventListener('wheel', event => {
  orbit.wheel(event, 'OrthographicCamera')
  updateMarkCp()
})

//更新标记点的位置
function updateMarkCp() {
  if (!markWp) { return }

  //判断标记点在相机的正面还是背面
  const {position}=camera
  const dot = markWp.clone().sub(position).dot(
    target.clone().sub(position)
  )
  if (dot > 0) {
    mark.style.display = 'block'
  } else {
    mark.style.display = 'none'
  }

  // 将标记点的世界坐标转裁剪坐标
  const { x, y } = markWp.clone().applyMatrix4(pvMatrix)
  // 将标记点的裁剪坐标转canvas坐标
  setMarkCp(
    (x + 1) * canvas.width / 2,
    (-y + 1) * canvas.height / 2
  )
}
```
之后围绕标记点还可以再进一步优化：

- 使标记点的文字内容可编辑
- 优化标记点样式
- 使标记点可拖拽
- 添加多个标记点
- ……

这些都是正常的前端业务逻辑，我这里就只重点说图形学相关的知识了。  
之后可以参考一个叫“[720云](https://720yun.com/)”的网站，它就是专业做VR的。  
![](/webgl-share/194.png)
#### 2.7 VR场景的切换

在实际开发中通常会遇到这样的需求：  
在客厅的VR场景中有一扇进入卧室的门，在卧室门上有一个写着“卧室”的标记点。  
当点击“卧室”标记点时，就进入卧室的VR 中。  
这个需求便涉及了客厅和卧室两个VR场景的切换。  
两个VR场景的切换最简单的实现方法就是直接换贴图了，这个方法快速、简单、直接，然而通常老板还想让我们给它一个过度效果。  
因此，两个VR 场景的过度才是这里要说的重点。  

1. 准备一份VR数据vr.json，相当于后端数据库里的数据。
```json
[
  {
    "id": 1,
    "imgSrc": "./images/room.jpg",
    "eye": [-0.14966274559865525, -0.009630159419482085, 0.002884893313037499],
    "marks": [
      {
        "name": "次卧",
        "pos": [-0.45099085840209097, 0.0889607157340315, 0.19670596506927274],
        "link": 2
      },
      {
        "name": "主卧",
        "pos": [-0.34961792927865026, 0.30943492493218633, -0.17893387258739163],
        "link": 3
      }
    ]
  },
  {
    "id": 2,
    "imgSrc": "./images/secBed.jpg",
    "eye": [-0.14966274559865525, -0.009630159419482085, 0.002884893313037499],
    "marks": [
      {
        "name": "客厅",
        "pos": [-0.34819482247111166, 0.29666506812630905, -0.20186679508508473],
        "link": 1
      }
    ]
  },
  {
    "id": 3,
    "imgSrc": "./images/mainBed.jpg",
    "eye": [-0.14966274559865525, -0.009630159419482085, 0.002884893313037499],
    "marks": [
      {
        "name": "客厅",
        "pos": [-0.07077938553590507, 0.14593627464082626, -0.47296181910077806],
        "link": 1
      }
    ]
  }
]
```
当前这个json 文件里有3个VR 场景的数据，分别是客厅、主卧、次卧。
- imgSrc VR图片
- eye 相机视点
- marks 标记点
  - name 标记点名称
  - pos 标记点世界位，可在上一节添加标记点的时候，将其存储到后端
  - link 当前标记点链接的VR 的id

2. 基于之前添加标记点文件，做下调整，建立一个标记点容器marks，之后会往marks里放html类型的标记点
```html
<style>
  .mark {
    position: absolute;
    transform: translate(-50%, -50%);
    top: 0;
    left: 0;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.6);
    padding: 6px 12px;
    border-radius: 3px;
    user-select: none;
    cursor: pointer;
  }
</style>

<body>
  <canvas id="canvas"></canvas>
  <div id="marks"></div>
  ……
</body>
```

3. 简化出一个VR场景
```js
import { createProgram, worldPos } from "/jsm/Utils.js";
import {
  Matrix4, PerspectiveCamera, Vector3
} from 'https://unpkg.com/three/build/three.module.js';
import OrbitControls from './lv/OrbitControls.js'
import Mat from './lv/Mat.js'
import Geo from './lv/Geo.js'
import Obj3D from './lv/Obj3D.js'
import Scene from './lv/Scene.js'
import Earth from './lv/Earth.js'

const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let gl = canvas.getContext('webgl');

// 球体
const earth = new Earth(0.5, 64, 32)

// 目标点
const target = new Vector3()
const [fov, aspect, near, far] = [
  60, canvas.width / canvas.height,
  0.1, 5
]
// 透视相机
const camera = new PerspectiveCamera(fov, aspect, near, far)
// 轨道控制器
const orbit = new OrbitControls({
  camera,
  target,
  dom: canvas,
  enablePan: false,
  maxZoom: 15,
  minZoom: 0.4
})

//投影视图矩阵
const pvMatrix = orbit.getPvMatrix()

//标记
const marks = document.querySelector('#marks')

// 场景
const scene = new Scene({ gl })
//注册程序对象
scene.registerProgram(
  'map',
  {
    program: createProgram(
      gl,
      document.getElementById('vs').innerText,
      document.getElementById('fs').innerText,
    ),
    attributeNames: ['a_Position', 'a_Pin'],
    uniformNames: ['u_PvMatrix', 'u_ModelMatrix', 'u_Sampler']
  }
)

//球体
const mat = new Mat({
  program: 'map',
  data: {
    u_PvMatrix: {
      value: orbit.getPvMatrix().elements,
      type: 'uniformMatrix4fv',
    },
    u_ModelMatrix: {
      value: new Matrix4().elements,
      type: 'uniformMatrix4fv',
    },
  },
  maps: {
    u_Sampler: {
      magFilter: gl.LINEAR,
      minFilter: gl.LINEAR,
    }
  }
})
const geo = new Geo({
  data: {
    a_Position: {
      array: earth.vertices,
      size: 3
    },
    a_Pin: {
      array: earth.uv,
      size: 2
    }
  },
  index: {
    array: earth.indexes
  }
})
scene.add(new Obj3D({ geo, mat }))

// 渲染
render()

function render() {
  orbit.getPvMatrix()
  scene.draw()
  requestAnimationFrame(render)
}

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
  updateMarkCp()
})
/* 指针抬起 */
canvas.addEventListener('pointerup', event => {
  orbit.pointerup(event)
})
/* 滚轮事件 */
canvas.addEventListener('wheel', event => {
  orbit.wheel(event, 'OrthographicCamera')
  updateMarkCp()
})
```
当前是渲染不出东西来的，因为我还没有给球体指定贴图。

4. 请求VR 数据，更新VR。
```js
let data;
let curVr;
fetch('./data/vr.json')
  .then((res) => res.json())
  .then(dt => {
    data = dt
    curVr = getVrById(1)
    //更新VR
    updateVr()
    // 渲染
    render()
  });

//根据id获取VR数据
function getVrById(id) {
  for (let i = 0; i < data.length; i++) {
    if (id === data[i].id) {
      return data[i]
    }
  }
}

//根据数据更新VR
function updateVr() {
  const image = new Image()
  image.src = curVr.imgSrc
  image.onload = function () {
    //更新图片
    mat.setMap('u_Sampler', { image })
    //更新相机视点
    camera.position.set(...curVr.eye)
    orbit.updateCamera()
    orbit.resetSpherical()
    //显示标记点
    showMark()
  }
}

//显示标记点
function showMark() {
  curVr.marks.forEach(ele => {
    const div = document.createElement('div')
    div.className = 'mark'
    div.innerText = ele.name
    div.setAttribute('data-link', ele.link)
    marks.append(div)
  })
}

//更新标记点的canvas坐标位
function updateMarkCp() {
  if (!marks.children.length) { return }
  const { position } = camera
  const EO = target.clone().sub(position)
  curVr.marks.forEach((ele, ind) => {
    const markWp = new Vector3(...ele.pos)
    const mark = marks.children[ind]
    const dot = markWp.clone().sub(position).dot(EO)
    mark.style.display = dot > 0 ? 'block' : 'none'
    const { x, y } = markWp.clone().applyMatrix4(pvMatrix)
    mark.style.left = `${(x + 1) * canvas.width / 2}px`
    mark.style.top = `${(-y + 1) * canvas.height / 2}px`
  })
}
```

5. 点击标记点时，根据标记点的data-link 更新VR
```js
marks.addEventListener('click', ({ target }) => {
  if (target.className !== 'mark') { return }
  marks.innerHTML = ''
  curVr = getVrById(parseInt(target.getAttribute('data-link')))
  updateVr()
})
```

6. 连续渲染的时候，更新标记点的canvas坐标位
```js
function render() {
  orbit.getPvMatrix()
  scene.draw()
  updateMarkCp()
  requestAnimationFrame(render)
}
```

7. 把鼠标的位移事件绑定到window上

当鼠标移动到标记点上时，会被标记点卡住，无法移动，这是因为标记点挡住了canvas，所以不能再把鼠标事件绑定到canvas上了。

```js
window.addEventListener('pointermove', event => {
  orbit.pointermove(event)
})
```

#### 2.8 VR场景的过渡动画

当前显示的VR就叫它旧VR，接下来要显示的VR就叫它新VR。  
这两个VR可以想象成两张图片，旧VR在新VR上面，旧VR遮挡了新VR。  
在切换VR的时候，可以先实现这样一个过渡效果：让旧VR渐隐，从而露出下面的新VR。  
帧缓冲区便可以视之为存储在内存里的图片。  
将两个VR场景分别渲染到两个帧缓冲区里后，便可以基于透明度融合一下，然后贴到一个充满窗口的平面上，从而实现过度效果。  

1. 封装个场景对象出来，这个场景里只有一个充满窗口的平面，之后会把帧缓冲区贴上去

VRPlane.js
```js
import { createProgram } from "./Utils.js";
import Mat from './Mat.js'
import Geo from './Geo.js'
import Obj3D from './Obj3D.js'
import Scene from './Scene.js'
import Rect from './Rect.js'

const vs = `
  attribute vec4 a_Position;
  attribute vec2 a_Pin;
  varying vec2 v_Pin;
  void main(){
    gl_Position=a_Position;
    v_Pin=a_Pin;
  }
`

const fs = `
  precision mediump float;
  uniform float u_Ratio;
  uniform sampler2D u_SampNew;
  uniform sampler2D u_SampOld;
  varying vec2 v_Pin;
  void main(){
    vec4 t1 = texture2D( u_SampNew, v_Pin );
    vec4 t2 = texture2D( u_SampOld, v_Pin );
    gl_FragColor = mix(t2,t1, u_Ratio);
  }
`

export default class VRPlane extends Scene{
  constructor(attr){
    super(attr)
    this.createModel()
  }
  createModel() {
    const { gl } = this
    this.registerProgram('map', {
      program: createProgram(gl,vs,fs),
      attributeNames: ['a_Position', 'a_Pin'],
      uniformNames: ['u_SampNew', 'u_SampOld', 'u_Ratio']
    })
    const mat = new Mat({
      program: 'map',
      data: {
        u_Ratio: {
          value: 0,
          type: 'uniform1f',
        },
      }
    })
    const rect = new Rect(2, 2, 0.5, 0.5)
    const geo = new Geo({
      data: {
        a_Position: {
          array: rect.vertices,
          size: 3
        },
        a_Pin: {
          array: rect.uv,
          size: 2
        }
      },
      index: {
        array: rect.indexes
      }
    })
    this.add(new Obj3D({ geo, mat }))
    this.mat=mat
  }
  
}
```

2. 封装一个包含VR场景的帧缓冲区对象

VRFrame.js
```js
import { createProgram } from "./Utils.js";
import {Matrix4} from 'https://unpkg.com/three/build/three.module.js';
import Mat from './Mat.js'
import Geo from './Geo.js'
import Obj3D from './Obj3D.js'
import Earth from './Earth.js'
import Frame from './Frame.js'

const vs = `
  attribute vec4 a_Position;
  attribute vec2 a_Pin;
  uniform mat4 u_PvMatrix;
  uniform mat4 u_ModelMatrix;
  varying vec2 v_Pin;
  void main(){
    gl_Position=u_PvMatrix*u_ModelMatrix*a_Position;
    v_Pin=a_Pin;
  }
`
const fs = `
  precision mediump float;
  uniform sampler2D u_Sampler;
  varying vec2 v_Pin;
  void main(){
    gl_FragColor=texture2D(u_Sampler,v_Pin);
  }
`

/* 参数
  gl,
  orbit,
*/
export default class VRFrame extends Frame{
  constructor(attr){
    super(attr)
    this.createModel()
  }
  createModel() {
    const { orbit, gl } = this

    this.registerProgram('map', {
      program: createProgram(gl,vs,fs),
      attributeNames: ['a_Position', 'a_Pin'],
      uniformNames: ['u_PvMatrix', 'u_ModelMatrix', 'u_Sampler']
    })
    const mat = new Mat({
      program: 'map',
      data: {
        u_PvMatrix: {
          value: orbit.getPvMatrix().elements,
          type: 'uniformMatrix4fv',
        },
        u_ModelMatrix: {
          value: new Matrix4().elements,
          type: 'uniformMatrix4fv',
        },
      },
      maps: {
        u_Sampler: {
          magFilter: gl.LINEAR,
          minFilter: gl.LINEAR,
        }
      }
    })
    const earth = new Earth(0.5, 64, 32)
    const geo = new Geo({
      data: {
        a_Position: {
          array: earth.vertices,
          size: 3
        },
        a_Pin: {
          array: earth.uv,
          size: 2
        }
      },
      index: {
        array: earth.indexes
      }
    })
    this.add(new Obj3D({ geo, mat }))
    this.draw()
    this.mat=mat
  }

}
```

3. 基于之前的场景切换文件修改代码，引入组件
```js
import {
  Matrix4, PerspectiveCamera, Vector3
} from 'https://unpkg.com/three/build/three.module.js';
import OrbitControls from './lv/OrbitControls.js'
import VRFrame from './lv/VRFrame.js';
import VRPlane from './lv/VRPlane.js';
import Track from '/jsm/Track.js';
```

4. 开启透明度
```js
let gl = canvas.getContext('webgl');
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
```

5. 实例化一个场景对象，两个帧缓冲区
```js
const scene = new VRPlane({ gl })
const vrNew = new VRFrame({ gl, orbit })
const vrOld = new VRFrame({ gl, orbit })
scene.mat.setMap('u_SampOld', {
  texture: vrOld.texture
})
```

初始状态，旧VR 是没有图片的，默认画出来就是一张黑图，将其传给场景对象的u_SampOld后，便可以实现在黑暗中渐现新VR的效果。  
新VR 需要在加载到图片后，画出VR，再传给场景对象的u_SampNew。

6. 实例化时间轨对象
```js
// 是否制作补间动画
let tweenable = false
// 补间数据
let aniDt = { ratio: 0 }
// 时间轨
let track = new Track(aniDt)
track.timeLen = 1000
track.keyMap = new Map([
  ['ratio', [[0, 0], [1000, 1]]]
])
track.onEnd = () => {
  tweenable = false
}
```

7. 在切换图片时：
- 开启补间动画
- 设置新、旧VR的图片
- 把旧VR的纹理对象传入u_SampOld
- 根据VR 数据更新视点位置
- 根据VR 数据显示标记点
```js
//暂存当前的VR图像
let tempImg = null
// 更新VR图像
function updateVr() {
  const image = new Image()
  image.src = curVr.imgSrc
  image.onload = function () {
    //开启补间动画
    tweenable = true
    //时间轨起始时间
    track.start = new Date()
    
    //若tempImg 不为null
    if (tempImg) {
      // 设置旧VR的图片
      vrOld.mat.setMap('u_Sampler', { image: tempImg })
      vrOld.draw()
      // 把旧VR的纹理对象传入u_SampOld
      scene.mat.setMap('u_SampOld', {
        texture: vrOld.texture
      })
    }
    //暂存当前图片
    tempImg = image
    //设置新VR的图片
    vrNew.mat.setMap('u_Sampler', { image })
    //设置相机视点
    camera.position.set(...curVr.eye)
    orbit.updateCamera()
    orbit.resetSpherical()
    //显示当前VR的标记点
    showMark()
  }
}
```

将之前 Mat.js 对象的setMap 方法做下调整
```js
setMap(key,val) {
  const obj = this.maps[key]
  val.needUpdate = true
  if (obj) {
    Object.assign(obj,val)
  } else {
    this.maps[key]=val
  }
}
```
这样，若key在maps中存在，就合并val；若不存在，就写入val。

8. 连续渲染
```js
function render() {
  if (tweenable) {
    // 更新时间轨的时间
    track.update(new Date())
    // 更新场景对象的插值数据
    scene.mat.setData('u_Ratio', {
      value: aniDt.ratio
    })
  }
  // 更新投影视图矩阵
  orbit.getPvMatrix()
  // 新VR绘图
  vrNew.draw()
  // 更新场景对象的u_SampNew
  scene.mat.setMap('u_SampNew', {
    texture: vrNew.texture
  })
  //场景对象绘图
  scene.draw()
  // 更新标记点的canvas坐标
  updateMarkCp()

  requestAnimationFrame(render)
}
```
到目前为止，便可以实现VR场景的透明度补间动画。  
接下来，还可以再丰富一下补间动画效果。

9. 在透明度动画的基础上，再让旧VR做一个放大效果，给用户营造一个拉进视口的效果，使项目看起来更加走心
```java
precision mediump float;
uniform float u_Ratio;
uniform sampler2D u_SampNew;
uniform sampler2D u_SampOld;
varying vec2 v_Pin;
void main(){
  vec2 halfuv=vec2(0.5,0.5);
  float scale=1.0-u_Ratio*0.1;
  vec2 pin=(v_Pin-halfuv)*scale+halfuv;
  vec4 t1 = texture2D( u_SampNew, v_Pin );
  vec4 t2 = texture2D( u_SampOld, pin );
  gl_FragColor = mix(t2,t1, u_Ratio);
}
```

放大旧VR的方法有很多，可以从模型、相机、片元着色器等方面来实现。  
这里就找了个比较简单的方法，在片元着色器里放大旧VR。  

在片元着色器里放大旧VR 的方法，至少有两种：
- 基于片元放大旧VR
- 基于UV放大旧VR

基于片元放大旧VR，需要在片元着色器里知道canvas画布在gl_FragCoord 坐标系里的中心点，有点麻烦。  
基于UV放大旧VR，直接基于uv 坐标系的中心点(0.5,0.5) 缩小uv坐标即可，比较简单，所以就使用这个方法放大旧VR了。



### 3.线条的纹理映射
之前在说WebGL图形的时候说过，WebGL有LINES、LINE_STRIP、LINE_LOOP  三种画线的方法。  
不过，三种方法只能绘制一个像素宽的线，如果要想画的是下图中粗点的公路呢？  
![](/webgl-share/195.png)

这条公路的绘制要分两部分考虑：  
- 宽度线
- 纹理映射

#### 3.1认识宽度线

当线有了宽度之后，它就不仅仅是有了宽度那么简单，因为这本质上是一个由线转面，提升了一个维度的问题。这会延伸出许多除宽度之外的其它特性。  
对于有宽度的线，canvas 2d 就做得很好，所以咱们先通过canvas 2d 认识一下有宽度的线的特性：  
- lineWidth 定义描边的宽度，它是从路径的中心开始绘制的，内外各占宽度的一半。  
![](/webgl-share/196.png)

- lineCap 线条端点样式    
![](/webgl-share/197.png)

- lineJoin 拐角类型  
![](/webgl-share/198.png)

- miterLimit 限制尖角  
当lineJoin 为miter 时，若拐角过小，拐角的厚度就会过大。  
![](/webgl-share/199.png)

​miterLimit=1 后，可避免此问题  
![](/webgl-share/200.png)

- setLineDash(segments) 虚线   
ctx.setLineDash([ 60, 90 ])  
![](/webgl-share/201.png)

​ctx.setLineDash([ 60, 90, 120 ])  
![](/webgl-share/202.png)

- lineDashOffset 虚线偏移  

ctx.lineDashOffset=0  
![](/webgl-share/203.png)

​ctx.lineDashOffset=-60  
![](/webgl-share/205.png)


#### 3.2宽度线的绘制思路
- 着色器绘图：先用WebGL 原生方法绘制单像素的线，然后利用帧缓冲区为其描边。  
![](/webgl-share/206.png)

  - 优点：简单快速，可以画出拐角和端点都为round 类型的线
  - 缺点：难以控制其端点和拐角样式，无法做纹理映射，无法深度测试

- 顶点建模，基于线条路径，向其内外两侧挤压线条。  
![](/webgl-share/207.png)

  - 优点：可控性强，可满足各种线条特性，可做纹理映射，支持深度测试
  - 缺点：顶点点位的计算量有点大。

因为要为宽度线贴图，所以就用顶点建模的方式绘制有宽度的线了。  
先用最简单的方式画一条宽度线：像canvas 2d那样，以lineCap为butt，lineJoin 为miter的方式绘制。


#### 3.3宽度线的挤压原理
宽度线中相邻的两条线段存在两种关系：

- 相交  
![](/webgl-share/207.png)

- 平行  
![](/webgl-share/208.png)


挤压顶点的方式有两种：  
- 垂直挤压，对应线条端点或相邻线段平行时的点。
- 非垂直挤压，对应相邻线段不平行时的点，即相交线段的拐点。

#### 3.4垂直挤压点

以下图为例：  
![](/webgl-share/208.png)

`已知`：  
- 点A、点B
- 线条宽度为lineWidth
- A1、A2是自点A 沿AB方向垂直挤压出的点

`求`：A1、A2

`解`：

计算线条宽度的一半h：

```js
h=lineWidth/2
```

由点A、点B计算向量AB：

```js
AB(x,y)=B-A
```

将向量AB逆时针旋转90°，设置长度为h，得点A1：

```js
A1=h*(-y,x)/|(-y,x)|
```

将向量AB顺时针旋转90°，设置长度为h，得点A2：

```js
A2=h*(y,-x)/|(y,-x)|
```

挤压端点C 后的点C1、C2 亦是同理。  
至于挤压中间点B 后的B1、B2，若点B相邻的线段平行，其计算方法亦是同理。  
AB是否平行于BC的判断方法：  
```js
(Math.atan2(AB.y,AB.x)-Math.atan2(BC.y,BC.x))%Math.PI
```

#### 3.4计算拐点

![](/webgl-share/209.png)

`已知`：

- 点A、点B、点C
- 线条宽度为lineWidth
- AB、BC 不平行

`求`：拐点B1、B2

`思路`：

求拐点的本质，就是求两条直线的的交点。
求直线交点的方法有很多，高中数学有一个用直线一般式求交点的方法，我们也可以用向量推导。

`解`：

由已知条件可知：

```js
BD∥EB2
BE∥DB2
|BF|=|BG|
```

`所以`：

BEB2D 是等边平行四边形。

计算向量BD的单位向量d：

```js
d=AB/|AB| 
```

计算向量BE的单位向量e：

```js
e=CB/|CB|
```

由等边平行四边形定理，可求得BB2 的单位向量b：

```js
b=(d+e)/|d+e|
```

接下来，只要求得BB2的长度，便可知道点B2。

由向量的点积公式可知：

```js
cos∠B2BG=(BG·b)/(|BG|*|b|)
```

`因为`：

b是单位向量

`所以`：

```js
cos∠B2BG=(BG·b)/|BG|
```

由余弦公式可知：

```js
cos∠B2BG=|BG|/|BB2|
|BB2|=|BG|/cos∠B2BG
```

`所以`：

```js
BB2=b*|BB2|
```

所以：

```js
B2=BB2+B
```

知道了B2后，B1也就好求了：

```js
B1=-BB2+B
```

这便是用向量推导拐点的方法。

对于用直线的一般式求交点的方法，[相关文章](http://yxyy.name/blog/md.html?ossName=162765212208629481006223312756.md&title=%E6%BC%AB%E8%B0%88%E7%9B%B4%E7%BA%BF%E4%B9%8B%E7%82%B9%E6%96%9C%E5%BC%8F%E5%92%8C%E4%B8%80%E8%88%AC%E5%BC%8F)。


#### 3.5绘制宽度线

1. 建立一个BoldLine 对象
```js
import {Vector2} from 'https://unpkg.com/three/build/three.module.js'
/*
属性：
  points:线条节点,二维，[Vector2,Vector2,……]
  lineWidth：线宽
  vertices：顶点集合
  normals：法线集合
  indexes：顶点索引集合
  uv：uv坐标集合
*/
export default class BoldLine{
  constructor(points=[],lineWidth=1){
    this.points=points
    this.lineWidth=lineWidth
    this.vertices=null
    this.normals=null
    this.indexes = null
    this.uv = null
    this.init()
  }
  init() {
    const { points,lineWidth:h } = this
    const len = points.length
    if (len < 2) { return }
    
    // 挤压线条，获取顶点
    const extrudePoints=this.extrude()
    
    // 顶点集合
    const vertices = []
    // 顶点索引
    const indexes = []
    
    // 以线段挤压出的四边形为单位，构建顶点集合、顶点索引
    const len1 = points.length - 1
    for (let i = 0; i < len1; i++) {
      //四边形的4个顶点
      const pi=i * 2
      const [A1, A2, B1, B2] = [
        extrudePoints[pi],
        extrudePoints[pi+1],
        extrudePoints[pi+2],
        extrudePoints[pi+3],
      ]
      vertices.push(
        ...A1, ...A2, ...B1, ...B2
      )
      // 顶点索引
      const A1i = i * 4
      const A2i = A1i+1
      const B1i = A1i+2
      const B2i = A1i + 3
      indexes.push(
        A1i,A2i,B1i,
        B1i,A2i,B2i
      )
    }
    
    this.vertices=new Float32Array(vertices)
    this.indexes=new Uint16Array(indexes)
  }

  // 挤压线条
  extrude() {
    const { points } = this
    //线宽的一半
    const h = this.lineWidth / 2
    //顶点集合，挤压起始点置入其中
    const extrudePoints = [
      ...this.verticalPoint(points[0],points[1],h)
    ]
    // 挤压线条内部点，置入extrudePoints
    const len1=points.length-1
    const len2=len1-1
    for (let i = 0; i < len2; i++){
      // 三个点,两条线
      const A=points[i]
      const B=points[i+1]
      const C = points[i + 2]
      // 两条线是否相交
      if (this.intersect(A,B,C)) {
        extrudePoints.push(...this.interPoint(A, B, C, h))
      } else {
        extrudePoints.push(...this.verticalPoint(B, C, h))
      }
    }
    // 挤压最后一个点
    extrudePoints.push(...this.verticalPoint(
      points[len2], points[len1], h, points[len1]
    ))
    return extrudePoints
  }

  // 判断两条直线是否相交
  intersect(A,B,C) {
    const angAB=B.clone().sub(A).angle ()
    const angBC = C.clone().sub(B).angle ()
    return !!(angAB-angBC)%Math.PI
  }
  //垂直挤压点
  verticalPoint(A,B,h,M=A) {
    const {x,y} = B.clone().sub(A)
    return [
      new Vector2(-y, x).setLength(h).add(M),
      new Vector2(y,-x).setLength(h).add(M)
    ]
  }
  // 拐点
  interPoint(A, B, C, h) {
    const d=B.clone().sub(A).normalize()
    const e = B.clone().sub(C).normalize()
    const b = d.clone().add(e).normalize()
    const BG = new Vector2(d.y, -d.x).setLength(h)
    const BGLen=BG.length()
    const cos = BG.clone().dot(b) / BGLen
    const BB2 = b.setLength(BGLen / cos)
    const BB1 = BB2.clone().negate()
    return [
      BB1.add(B),
      BB2.add(B)
    ]
  }
}
```

2. 绘制宽度线

```html
<canvas id="canvas"></canvas>
<script id="vs" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    void main(){
      gl_Position = a_Position;
    }
</script>
<script id="fs" type="x-shader/x-fragment">
    precision mediump float;
    void main(){
      gl_FragColor=vec4(1.0);
    }
</script>
<script type="module">
  import { createProgram, imgPromise } from './lv/Utils.js';
  import { 
    Matrix4, 
    PerspectiveCamera, 
    Vector3, 
    Vector2 
  } from 'https://unpkg.com/three/build/three.module.js';
  import OrbitControls from './jsm/OrbitControls.js'
  import Mat from './lv/Mat.js'
  import Geo from './lv/Geo.js'
  import Obj3D from './lv/Obj3D.js'
  import Scene from './lv/Scene.js'
  import BoldLine from './lv/BoldLine.js'

  const canvas = document.getElementById('canvas');
  canvas.width = 900;
  canvas.height = 900;
  let gl = canvas.getContext('webgl');

  // 场景
  const scene = new Scene({ gl })
  // 注册程序对象
  scene.registerProgram(
    'line',
    {
      program: createProgram(
        gl,
        document.getElementById('vs').innerText,
        document.getElementById('fs').innerText
      ),
      attributeNames: ['a_Position'],
    }
  )
  const mat = new Mat({
    program: 'line',
    mode: 'TRIANGLES'
  })

  const line = new BoldLine([
    new Vector2(-0.7, 0),
    new Vector2(-0.4, 0),
    new Vector2(-0.4, 0.4),
    new Vector2(0.3, 0.4),
    new Vector2(-0.3, -0.4),
    new Vector2(0.4, -0.4),
    new Vector2(0.4, 0),
    new Vector2(0.7, 0.4),
  ], 0.2)

  const geo = new Geo({
    data: {
      a_Position: {
        array: line.vertices,
        size: 2
      },
    },
    index: {
      array: line.indexes
    }
  })
  scene.add(new Obj3D({ geo, mat }))
  scene.draw()
</script>	
```
效果如下：

![](/webgl-share/210.png)


#### 3.6宽度线贴图思路

![](/webgl-share/211.png)

1. 以线段挤出的四边形为单位进行贴图。
2. 贴图的时候，为了方便做纹理映射，可以先让每一个四边形躺平，再做纹理映射。
3. 为了避免贴图拉伸，可基于线宽，设置贴图在u向的reapeat 系数。

举个例子。

`已知`：

- 贴图是一个正方形图片。
- 线宽为h

`求`：则点B1、B2、C1、C2所对应的uv坐标

`解`：

```js
B1:(B12.x/h,1)
B2:(B22.x/h,0)
C1:(C12.x/h,1)
C2:(C22.x/h,0)
```



#### 3.7宽度线贴图代码

1. 在BoldLine.js 中计算uv坐标。

```js
init() {
  const { points,lineWidth:h } = this
  const len = points.length
  if (len < 2) { return }

  // 挤压线条，获取顶点
  const extrudePoints=this.extrude()

  // 顶点集合
  const vertices = []
  // 顶点索引
  const indexes = []
  // uv 坐标
  const uv=[]

  // 以线段挤压成的四边形为单位，构建顶点集合、顶点索引、uv
  const len1 = points.length - 1
  for (let i = 0; i < len1; i++) {
    //四边形的4个顶点
    const pi=i * 2
    const [A1, A2, B1, B2] = [
      extrudePoints[pi],
      extrudePoints[pi+1],
      extrudePoints[pi+2],
      extrudePoints[pi+3],
    ]
    vertices.push(
      ...A1, ...A2, ...B1, ...B2
    )
    // 顶点索引
    const A1i = i * 4
    const A2i = A1i+1
    const B1i = A1i+2
    const B2i = A1i + 3
    indexes.push(
      A1i,A2i,B1i,
      B1i,A2i,B2i
    )
    //逆向旋转四边形
    const ang = -B1.clone().sub(A1).angle()
    const O = new Vector2()
    const [lb, rt, rb] = [
      A2.clone().sub(A1).rotateAround(O,ang),
      B1.clone().sub(A1).rotateAround(O,ang),
      B2.clone().sub(A1).rotateAround(O,ang),
    ]
    uv.push(
      0, 1,        //A1
      lb.x / h, 0, //A2
      rt.x / h, 1, //B1
      rb.x / h, 0, //B2
    )
  }

  this.vertices = new Float32Array(vertices)
  this.uv=new Float32Array(uv)
  this.indexes=new Uint16Array(indexes)
}
```

2. 绘制宽度线
```html
<canvas id="canvas"></canvas>
<script id="vs" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    attribute vec2 a_Pin;
    varying vec2 v_Pin;
    void main(){
      gl_Position = a_Position;
      v_Pin=a_Pin;
      gl_PointSize=10.0;
    }
</script>
<script id="fs" type="x-shader/x-fragment">
    precision mediump float;
    uniform sampler2D u_Sampler;
    varying vec2 v_Pin;
    void main(){
      gl_FragColor=texture2D(u_Sampler,v_Pin);
    }
</script>
<script type="module">
  import { createProgram, imgPromise } from './lv/Utils.js';
  import { 
    Matrix4, 
    PerspectiveCamera, 
    Vector3, 
    Vector2 
  } from 'https://unpkg.com/three/build/three.module.js';
  import OrbitControls from './jsm/OrbitControls.js'
  import Mat from './lv/Mat.js'
  import Geo from './lv/Geo.js'
  import Obj3D from './lv/Obj3D.js'
  import Scene from './lv/Scene.js'
  import BoldLine from './lv/BoldLine.js'

  const canvas = document.getElementById('canvas');
  canvas.width = 900;
  canvas.height = 900;
  let gl = canvas.getContext('webgl');

  // 场景
  const scene = new Scene({ gl })
  // 注册程序对象
  scene.registerProgram(
    'line',
    {
      program: createProgram(
        gl,
        document.getElementById('vs').innerText,
        document.getElementById('fs').innerText
      ),
      attributeNames: ['a_Position', 'a_Pin'],
      uniformNames: ['u_Sampler']
    }
  )
  const mat = new Mat({
    program: 'line',
    mode: 'TRIANGLES'
  })

  const line = new BoldLine([
    new Vector2(-0.7, 0),
    new Vector2(-0.4, 0),
    new Vector2(-0.4, 0.4),
    new Vector2(0.3, 0.4),
    new Vector2(-0.3, -0.4),
    new Vector2(0.4, -0.4),
    new Vector2(0.4, 0),
    new Vector2(0.7, 0.4),
  ], 0.2)

  const geo = new Geo({
    data: {
      a_Position: {
        array: line.vertices,
        size: 2
      },
      a_Pin: {
        array: line.uv,
        size: 2
      }
    },
    index: {
      array: line.indexes
    }
  })
  scene.add(new Obj3D({ geo, mat }))

  const image = new Image()
  image.src = `./images/road.jpg`
  image.onload = function () {
    mat.setMap('u_Sampler', {
      image
    })
    scene.draw()
  }
</script>
```

3. 对Mat.js 对象里的updateMap() 方法稍作调整，判断一下要更新的贴图里有没有纹理对象texture，若没有，就新建一个。
```js
updateMap(gl, map, ind) {
  const {
    format = gl.RGB,
    image,
    wrapS,
    wrapT,
    magFilter,
    minFilter,
    texture
  } = map
  if (!texture) {
    map.texture = gl.createTexture()
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
  gl.activeTexture(gl[`TEXTURE${ind}`])
  gl.bindTexture(gl.TEXTURE_2D, map.texture)
  ……
}
```

效果如下：

![](/webgl-share/195.png)


