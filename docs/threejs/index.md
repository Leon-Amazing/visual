## 1-ThreeJS-介绍

> 官网对 Threejs 的介绍非常简单：“Javascript 3D library”。openGL 是一个跨平台 3D/2D 的绘图标准，WebGL 则是 openGL 在浏览器上的一个实现。web 前端开发人员可以直接用 WebGL 接口进行编程，但 WebGL 只是非常基础的绘图 API，需要编程人员有很多的数学知识、绘图知识才能完成 3D 编程任务，而且代码量巨大。Threejs 对 WebGL 进行了封装，让前端开发人员在不需要掌握很多数学知识和绘图知识的情况下，也能够轻松进行 web 3D 开发，降低了门槛，同时大大提升了效率

## 2-ThreeJS 基本要素-场景

> scene 场景：一个三维空间，所有物品的容器，可以把场景想象成一个空房间，可以往房间里放要呈现的物体、相机、光源等  
> 在 ThreeJS 中，场景是作为最外层容器存在的，它相当于 html 中的 window 对象，所有 ThreeJS 中的对象，都可以在 scene 中找到

```js
const scene = new THREE.Scene();
```

## 3-ThreeJS 基本要素-相机

> ThreeJS 必须要往场景中添加一个相机，相机用来确定位置、方向、角度，相机看到的内容就是我们最终在屏幕上看到的内容。在程序运行过程中，可以调整相机的位置、方向和角度  
> ThreeJS 中的相机分为两种一种是正交相机 📷 和透视相机 📷

### 1)透视相机

![](/threejs/PerspectiveCamera.png)

```js
const camera = new THREE.PerspectiveCamera(
  45, // 视野角度 FOV
  width / height, // 长宽比 aspect ratio
  1, // 近截面 near
  1000 // 远截面 far
);
```

**透视相机的特点：就是符合我们人眼观察事物的特点， 近大远小**

### 2)正交相机

![](/threejs/OrthographicCamera.png)

```js
const camera = new THREE.OrthographicCamera(
  width / -2, // 左平面 left
  width / 2, // 右平面  right
  height / 2, // 上平面 top
  height / -2, //下平面 bottom
  1, // 近平面 near
  1000 // 远平面 far
);
```

**正交相机的特点：在最终渲染的图片中物体的大小都保持不变**

## 4-Threejs 的基本要素-灯光

> 假如没有光，摄像机看不到任何东西，因此需要往场景添加光源，为了跟真实世界更加接近，Threejs 支持模拟不同光源，展现不同光照效果，有点光源、平行光、聚光灯、环境光等。

### 1)AmbientLight(环境光)

环境光会均匀的照亮场景中的所有物体，环境光不能用来投射阴影，因为它没有方向

```js
const light = new THREE.AmbientLight(0x404040); // soft white light
```

### 2)平行光（DirectionalLight）

平行光是沿着特定方向发射的光。这种光的表现像是无限远,从它发出的光线都是平行的。常常用平行光来模拟太阳光 的效果; 太阳足够远，因此我们可以认为太阳的位置是无限远，所以我们认为从太阳发出的光线也都是平行的，此灯可以投射阴影

```js
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
```

### 3)点光源（PointLight）

从一个点向各个方向发射的光源。一个常见的例子是模拟一个灯泡发出的光，这种光可以投下阴影

```js
const light = new THREE.PointLight(0xff0000, 1, 100);
```

### 4)聚光灯（SpotLight）

这种光从一个方向的单个点发出，沿着一个锥形，距离它越远，它的尺寸就越大，这种光可以投下阴影

```js
const spotLight = new THREE.SpotLight(0xffffff);
```

## 5-Threejs 的基本要素-渲染器

> 渲染器就是去渲染你场景中灯光、相机、网格...

```js
const renderer = new THREE.WebGLRenderer({
  antialias: true, // true/false表示是否开启反锯齿
  alpha: true, // true/false 表示是否可以设置背景色透明
  precision: "highp", // highp/mediump/lowp 表示着色精度选择
  premultipliedAlpha: false, // true/false 表示是否可以设置像素深度（用来度量图像的分率）
  preserveDrawingBuffer: true, // true/false 表示是否保存绘图缓冲
  maxLights: 3, // 最大灯光数
  stencil: false, // false/true 表示是否使用模板字体或图案
});
```

## 6-Threejs 的基本要素-OrbitControls

> 轨道控制器允许相机围绕目标运行

```js
const controls = new OrbitControls(camera, renderer.domElement);
```

## 7-Threejs 的基本要素-Raycaster

> 点击射线，用于点击事件，用于鼠标拾取（计算鼠标在 3d 空间中的对象）等

```js
const raycaster = new THREE.Raycaster();
```

## 8-Threejs 的基本要素-loader

> 加载器，特殊的物体例如模型需要使用加载器，而且不同格式的模型需要不同的加载器

```js
const loader = new GLTFLoader();
const loader = new OBJLoader();
```

## 9-Threejs 的基本要素-Mesh

> 材质(Material)+几何体(Geometry)就是一个 mesh，Threejs 提供了集中比较有代表性的材质，常用的用漫反射、镜面反射两种材质，还可以引入外部图片，贴到物体表面，成为纹理贴图

```js
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
```
