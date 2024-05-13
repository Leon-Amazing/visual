# GLSL ES 实践

## 一、渐变

### 1-渐变的画布

画一个渐变的画布，其步骤如下：

1.绘制充满 canvas 的矩形，并向片元着色传递 canvas 画布的尺寸。

```json
const source = new Float32Array([
    -1, 1,
    -1, -1,
    1, 1,
    1, -1
]);

const rect = new Poly({
  gl,
  source,
  type: "TRIANGLE_STRIP",
  attributes: {
    a_Position: {
      size: 2,
      index: 0,
    },
  },
  uniforms: {
    u_CanvasSize: {
      type: "uniform2fv",
      value: [canvas.width, canvas.height],
    },
  },
});

gl.clear(gl.COLOR_BUFFER_BIT);
rect.draw();
```

上面的 Poly 之前在纹理部分已经说过。

a_Position 是 attribute 类型的顶点位置。

u_CanvasSize 是 uniform 类型的画布尺寸。

2.顶点着色器

```html
<script id="vertexShader" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  void main(){
      gl_Position=a_Position;
  }
</script>
```

3.片元着色器

```html
<script id="fragmentShader" type="x-shader/x-fragment">
  precision mediump float;
  uniform vec2 u_CanvasSize;
  void main(){
    gl_FragColor=vec4(
      gl_FragCoord.x/u_CanvasSize.x,
      gl_FragCoord.y/u_CanvasSize.y,
      0.8,
      1
    );
  }
</script>
```

上面的 gl_FragCoord 是当前片元在 canvas 画布中的像素位，其坐标系和 canvas 画布的坐标系类似，其坐标基底的两个分量都是一个像素的宽和高。

只不过 FragCoord 坐标原点在左下角，y 轴朝上，效果如下：

![](/glsl-es/1.jpg)

### 2-线性渐变对象

canvas 2d 在绘制线性渐变图形的时候，需要先建立一个线性渐变对象。

线性渐变对象具备一个起点、一个终点，用于限定渐变范围。

线性渐变对象中具备多个渐变节点，每个渐变节点都有以下属性：

- 节点颜色
- 节点位置 ，[0,1] 之间

这里简化一下，只给起点和终点位置设置两个颜色节点。

1.建立矩形对象

```js
const rect = new Poly({
  gl,
  source,
  type: "TRIANGLE_STRIP",
  attributes: {
    a_Position: {
      size: 2,
      index: 0,
    },
  },
  uniforms: {
    u_Start: {
      type: "uniform2fv",
      value: [canvas.width * 0.25, canvas.height * 0.75],
    },
    u_End: {
      type: "uniform2fv",
      value: [canvas.width * 0.75, canvas.height * 0.25],
    },
    u_Color0: {
      type: "uniform4fv",
      value: [1, 0, 0, 1],
    },
    u_Color1: {
      type: "uniform4fv",
      value: [1, 1, 0, 1],
    },
  },
});
```

uniforms 中变量的意思：

- u_Start 起始点
- u_End 终点
- u_Color0 对应起点的颜色
- u_Color1 对应终点的颜色

  2.片元着色器

```java
precision mediump float;

uniform vec4 u_Color0;
uniform vec4 u_Color1;
vec4 c01=u_Color1-u_Color0;

uniform vec2 u_Start;
uniform vec2 u_End;
vec2 se=u_End-u_Start;
float seLen=length(se);
vec2 normal=normalize(se);

void main(){
    vec2 sf=vec2(gl_FragCoord)-u_Start;
    float fsLen=clamp(dot(sf,normal),0.0,seLen);
    float ratio=fsLen/seLen;
    gl_FragColor=u_Color0+c01*ratio;
}
```

效果如下：

![](/glsl-es/1.png)

上面变量的示意如下：

![](/glsl-es/2.png)

其原理就是获取当前片元在起点 u_Start 和终点 u_End 间的距离比 ratio，然后将此距离比作为颜色比，获取其在起始颜色 u_Color0 和结束颜色 u_Color1 间的颜色值。

### 3-多节点线性渐变

上面说了，线性渐变对象中具备多个渐变节点，每个渐变节点都有以下属性：

- 节点颜色
- 节点位置 ，[0,1] 之间

接下来就来架构一下这个逻辑。

先把节点数据在片元着色器里写死，后面再考虑用 js 传递数据。

1.声明渐变的基础数据。

```js
//起始位
vec2 u_Start=vec2(100,100);
//结束位
vec2 u_End=vec2(700,700);
//节点颜色集合
vec4 colors[3];
//节点位置集合
float ratios[3];
```

2.基于渐变起点和结束点计算向量、向量长度和单位向量。

```js
//终点减起点向量
vec2 se=u_End-u_Start;
//长度
float seLen=length(se);
//单位向量
vec2 se1=normalize(se);
```

3.在 main 函数体中填充颜色集合和节点位置集合，然后获取片元颜色。

```js
void main(){
    colors[0]=vec4(1,0,0,1);
    colors[1]=vec4(1,1,0,1);
    colors[2]=vec4(0,1,0,1);
    ratios[0]=0.0;
    ratios[1]=0.5;
    ratios[2]=1.0;
    gl_FragColor=getColor(colors,ratios);
}
```

4.建立基于节点颜色集合和节点位置集合获取颜色的方法。

```js
//获取片元颜色
vec4 getColor(vec4 colors[3],float ratios[3]){
    //片元颜色
    vec4 color=vec4(1);
    //当前片元减起始片元的向量
    vec2 sf=vec2(gl_FragCoord)-u_Start;
    //当前片元在se上的投影长度
    float fsLen=clamp(dot(sf,se1),0.0,seLen);
    //长度比
    float ratio=clamp(fsLen/seLen,ratios[0],ratios[3-1]);
    //第一个比值
    float ratio1=ratios[0];
    //第一个颜色
    vec4 color1=colors[0];
    //遍历节点，按比值取色
    for(int i=1;i<3;i++){
        //第二个比值
        float ratio2=ratios[i];
        //第二个颜色
        vec4 color2=colors[i];
        if(ratio>=ratio1&&ratio<=ratio2){
            //一段颜色的差值
            vec4 color2_1=color2-color1;
            //当前比值在一段比值中的比值
            float ratioInRatio=(ratio-ratio1)/(ratio2-ratio1);
            //当前比值在当前颜色段中所对应的颜色
            color=color1+color2_1*ratioInRatio;
            break;
        }
        ratio1=ratio2;
        color1=color2;
    }
    return color;
}

```

效果如下：

![](/glsl-es/3.png)

### 4-用 js 向片元着色器传递渐变数据

js 只能向着色器传递有限类型的数据，它无法传递任意长度的数组、字符串、json 对象等。

比如无法传递任意长度的数组、字符串、json 对象等。

所以把渐变节点装进了一个四维矩阵中，从而拼 8 个渐变节点出来，这对于一般的渐变操作是够的。

渐变结构如下：

```
[
    123000120, 255000, 255000000, 255077,
    255255000, 255128, 255000, 255178,
    200, 255255,       -1, -1,
    -1, -1,            -1, -1
]
```

- 每两个数字构成一个渐变节点

  如：123000120, 255000

- 第一列对应颜色节点的 rgb 数据

  如：123000120 对应的 rgb 数据分别是 123,0,120

- 第二列对应颜色节点的 a 数据和位置数据

  如：255000 对应的 a 值是 255，节点位置为 0

代码实现：

1.在矩形面中写入节点数据 u_ColorStops

```json
const rect = new Poly({
    gl,
    source,
    type: 'TRIANGLE_STRIP',
    attributes: {
        a_Position: {
            size: 2,
            index: 0
        }
    },
    uniforms: {
        u_Start: {
            type: 'uniform2fv',
            value: [0, 0]
        },
        u_End: {
            type: 'uniform2fv',
            value: [canvas.width, canvas.height]
        },
        u_ColorStops: {
            type: 'uniformMatrix4fv',
            value: [
                123000120, 255000,
                255000000, 255077,
                255255000, 255128,
                255000, 255178,
                200, 255255,
                -1, -1,
                -1, -1,
                -1, -1
            ]
        }
    }
})
```

2.在片元着色器中写入相应的 uniform 变量

```js
//起始位
uniform vec2 u_Start;
//结束位
uniform vec2 u_End;
//四阶矩阵
uniform mat4 u_ColorStops;
//终点减起点向量
vec2 se=u_End-u_Start;
//长度
float seLen=length(se);
//单位向量
vec2 se1=normalize(se);
```

3.在 main 函数内，声明节点的颜色集合和位置集合。

通过 setColorStops()方法将 u_ColorStops 中的数据解析入节点颜色集合和位置集合。

通过 getColor()方法获取片元颜色。

```js
void main(){
    //节点颜色集合
    vec4 colors[8];
    //节点位置集合
    float ratios[8];
    //基于四维矩阵解析节点集合
    setColorStops(colors,ratios);
    //片元颜色
    gl_FragColor=getColor(colors,ratios);
}

```

- setColorStops() 将 u_ColorStops 中的数据解析入节点颜色集合和位置集合。

```js
void setColorStops(out vec4 colors[8],out float ratios[8]){
    //节点颜色数据
    vec4 colorSource=vec4(1);
    //节点位置数据
    float ratioSource=1.0;
    //遍历四维矩阵的
    for (int y=0;y<4;y++){
        for (int x=0;x<2;x++){
            int rgb=int(u_ColorStops[y][x*2]);
            int ar=int(u_ColorStops[y][x*2+1]);
            if(rgb>0){
                setColorStop(rgb,ar,colorSource,ratioSource);
            }
            colors[y*2+x]=colorSource;
            ratios[y*2+x]=ratioSource;
        }
    }
}
```

- setColorStop() 解析节点数据

```js
void setColorStop(int rgb,int ar,out vec4 color,out float ratio){
    int rc=rgb/1000000;
    int gc=(rgb-rc*1000000)/1000;
    int bc=rgb-int(rgb/1000)*1000;
    int ac=ar/1000;
    int ratioI=ar-ac*1000;
    color=vec4(float(rc),float(gc),float(bc),float(ac))/255.0;
    ratio=float(ratioI)/255.0;
}

```

3.getColor() 方法和之前一样。

### 5-优化 js 中的节点数据

觉得之前节点数据的书写方式不方便，也可以换成键值对的书写方式，然后对其进行解析。

1.渐变节点

```js
const colorStops = [
  {
    color: [123, 0, 123, 255],
    stop: 0,
  },
  {
    color: [255, 0, 0, 255],
    stop: 0.3,
  },
  {
    color: [255, 255, 0, 255],
    stop: 0.5,
  },
  {
    color: [0, 255, 0, 255],
    stop: 0.7,
  },
  {
    color: [0, 0, 200, 255],
    stop: 1,
  },
];
```

2.解析方法

```js
function parseColorStops(source) {
  const stops = new Array(16).fill(-1);
  source.forEach(({ color, stop }, stopInd) => {
    let rgb = "";
    let ar = "";
    color.forEach((ele, ind) => {
      const str = (ele + 1000).toString().slice(1);
      if (ind < 3) {
        rgb += str;
      } else {
        ar += str;
      }
    });
    ar += (Math.round(stop * 255) + 1000).toString().slice(1);
    stops[stopInd * 2] = rgb;
    stops[stopInd * 2 + 1] = ar;
  });
  return stops;
}
```

3.解析键值对类型的节点数据

```js
u_ColorStops: {
    type: 'uniformMatrix4fv',
    value: parseColorStops(colorStops)
}
```

### 6-径向渐变

将之前的代码改改，便可以实现径向渐变。

![](/glsl-es/4.png)

1.在矩形面中，注释终点，添加半径

```js
// u_End: {
//   type: 'uniform2fv',
//   value: [canvas.width, canvas.height]
// },
u_Radius: {
    type: 'uniform1f',
    value: 400
},
```

2.在片元着色器中也做相应调整。

```js
//起始位
uniform vec2 u_Start;
//结束位
//uniform vec2 u_End;
//半径
uniform float u_Radius;
//四阶矩阵
uniform mat4 u_ColorStops;
//终点减起点向量
//vec2 se=u_End-u_Start;
//长度
//float seLen=length(se);
//单位向量
//vec2 se1=normalize(se);
```

3.修改获取片元颜色的方法，基于极径取 ratio 比值。

```js
//获取片元颜色
vec4 getColor(vec4 colors[8],float ratios[8]){
    //片元颜色
    vec4 color=vec4(1);
    //当前片元减起始片元的向量
    //vec2 sf=vec2(gl_FragCoord)-u_Start;
    //当前片元到起始点的距离
    float fsLen=distance(gl_FragCoord.xy,u_Start);
    //当前片元在se上的投影长度
    //float fsLen=clamp(dot(sf,se1),0.0,seLen);
    //极径比
    float ratio=clamp(fsLen/u_Radius,ratios[0],ratios[8-1]);
    ……
}
```

### 7-极坐标渐变

将之前的代码改改，还可以实现极坐标渐变。

![](/glsl-es/5.png)

1.在矩形面中，注释终点

```js
// u_End: {
//   type: 'uniform2fv',
//   value: [canvas.width, canvas.height]
// },
```

2.在片元着色器中也做相应调整。

```js
//起始位
uniform vec2 u_Start;
//结束位
//uniform vec2 u_End;
//终点减起点向量
//vec2 se=u_End-u_Start;
//四阶矩阵
uniform mat4 u_ColorStops;
//长度
//float seLen=length(se);
//单位向量
//vec2 se1=normalize(se);
//一圈的弧度
float pi2=radians(360.0);
```

3.修改获取片元颜色的方法，基于极角取 ratio 比值。

```js
//获取片元颜色
vec4 getColor(vec4 colors[8],float ratios[8]){
    //片元颜色
    vec4 color=vec4(1);
    //当前片元减起始片元的向量
    vec2 sf=vec2(gl_FragCoord)-u_Start;
    //当前片元在se上的投影长度
    //float fsLen=clamp(dot(sf,se1),0.0,seLen);
    //长度比
    //float ratio=clamp(fsLen/seLen,ratios[0],ratios[8-1]);
    //向量方向
    float dir=atan(sf.y,sf.x);
    if(dir<0.0){
        dir+=pi2;
    }
    float ratio=dir/pi2;
    ……
}
```

### 8-三点渐变

通过径向渐变和极坐标渐变的原理，还可以实现三点渐变。

![](/glsl-es/6.png)

1.建立三个点

```js
//点1
vec2 p1=vec2(200,200);
vec4 c1=vec4(1,0,0,1);
//点2
vec2 p2=vec2(800,400);
vec4 c2=vec4(0,1,0,1);
//点3
vec2 p3=vec2(400,800);
vec4 c3=vec4(0,0,1,1);
```

p1 是点位，c1 是颜色。

2.基于三个位置点计算相应向量

```js
vec2 v31=p1-p3;
vec2 v32=p2-p3;
vec2 v12=p2-p1;
```

3.提前算出 p2 和 p1 点位的色差

```js
vec4 c12=c2-c1;
```

4.提前算出一圈的弧度，以备后用

```js
float pi2=radians(360.0);
```

radians() 是将角度转弧度的方法，360°=π\*2

5.建立基于向量获取弧度的方法

```js
float getAngle(vec2 v){
    float ang=atan(v.y,v.x);
    if(ang<0.0){
        ang+=pi2;
    }
    return ang;
}
```

atan() 方法可以计算一个点基于 x 轴正方向的弧度，此弧度的取值范围是[-π,π]，为了方便计算，我将其范围设置为[0,2π]

6.获取点 p1、p2 和当前片元位相对于 p3 点的弧度。

```js
float ang31=getAngle(v31);
float ang32=getAngle(v32);
vec2 v3f=gl_FragCoord.xy-p3;
float ang3f=getAngle(v3f);
```

7.用叉乘计算当前片元在向量 v12 的哪一侧

```js
vec2 v1f=gl_FragCoord.xy-p1;
float z=v1f.x*v12.y-v1f.y*v12.x;
```

其原理之前在说三角形的时候说过，其实还可以这么写：

```js
vec2 v1f=gl_FragCoord.xy-p1;
float z =cross(vec3(v1f,0),vec3(v12,0)).z;
```

之前的运算实际上就是计算了两个 z 值为 0 的三维向量的叉乘结果的 z 值。

8.当片元在向量 v31 和 v32 之间，并且当前片元在向量 v12 的左侧时，当前片元在 △p1p2p3 中，我们便可以计算片元颜色。

```js
vec4 color=vec4(0);
if(ang3f>=ang31&&ang3f<=ang32&&z<0.0){
    //计算∠<v3f,p3p1>在∠<p3p2,p3p1>中的比值
    ang3f=clamp(ang3f,ang31,ang32);
    float angRatio=(ang3f-ang31)/(ang32-ang31);

    //向量v12和向量v3f的交点位置和颜色
    vec2 p4=p1+v12*angRatio;
    vec4 c4=c1+c12*angRatio;

    //向量p3-gl_FragCoord在向量p3p4中的长度比
    float lenE=distance(p4,p3);
    float lenF=length(v3f);
    float lenRatio=lenF/lenE;

    //基于长度比获取当前片元在c3、c4间的颜色
    color=c3+(c4-c3)*lenRatio;
}
//片元颜色
gl_FragColor=color;
```

解释一下 if 语法中的取色逻辑。

9.计算 ∠\<v32,v3f>在 ∠\<v32,v31>中的比值 angRatio

```js
ang3f=clamp(ang3f,ang31,ang32);
float angRatio=(ang3f-ang31)/(ang32-ang31);
```

10.基于 angRatio 计算向量 v12 和向量 v1f 的交点位置 p4 和颜色 c4

```js
vec2 p4=p1+v12*angRatio;
vec4 c4=c1+c12*angRatio;
```

11.计算向量 p3-gl_FragCoord 在向量 p3p4 中的长度比，然后基于此比值获取当前片元在 c3、c4 间的颜色

```js
float lenE=distance(p4,p3);
float lenF=length(v3f);
float lenRatio=lenF/lenE;
color=c3+(c4-c3)*lenRatio;
```

## 二、杂色

### 1-杂色原理

![](/glsl-es/7.png)

杂色的真谛就是通过有规律条件得到无规律的结果。

有规律的条件 => 是片元在 canvas 画布中的像素位。

无规律的结果 => 是片元的随机色值。

杂色实现思路简单，方法也非常多。

接下来就写一个杂色的实现方法。

1.在片元着色器里建立一个基于 gl_FragCoord 获取随机颜色的方法。

```js
float rand(vec2 fragCoord){
    vec2 a= vec2(0.1234,0.5678);
    float n= dot(fragCoord,a);
    return fract(sin(n)*10000.0);
}
//sin(n)∈[-1,1]
//sin(n)=-0.12345678
//sin(n)*10000.0=-1234.5678
//fract(sin(n)*10000.0)=0.5678 ∈(0,1)
```

向量 a 是随便写的一个向量，小数点后的位数要多一点。

n 是片元位置与向量 a 的点积，这么做是为了将两个已知条件，即 fragCoord 的两个分量，合成一个已知条件。

tan(n) 是基于 n 值获取[-∞,∞] 之间一个随机数，是为了把片元位的行列规律破一下。

sin(n)\*10000.0 是为了把小数点左移，之后通过 fract() 只获取小数点后面数字，这样的结果便会更为随机。

2.在主函数体中调用 rand()方法

```js
void main(){
    float f = rand(gl_FragCoord.xy);
    gl_FragColor = vec4(f, f, f, 1);
}
```

3.接下来对上面的向量 a 进行旋转，可以实现噪波动画。

- 在片元着色器中添加 u_Ang 变量：

```html
<script id="fragmentShader" type="x-shader/x-fragment">
  precision mediump float;
  uniform float u_Ang;
  float s=sin(u_Ang);
  float c=cos(u_Ang);
  mat2 m=mat2(
    c,s,
    -s,c
  );
  float rand(vec2 fragCoord){
    vec2 a= m*vec2(0.1234,0.5678);
    float n= dot(fragCoord,a);
    return fract(tan(n)*10000.0);
  }
  void main(){
    float f = rand(gl_FragCoord.xy);
    gl_FragColor = vec4(f, f, f, 1);
  }
</script>
```

- js 代码

```js
const rect = new Poly({
  gl,
  source,
  type: "TRIANGLE_STRIP",
  attributes: {
    a_Position: {
      size: 2,
      index: 0,
    },
  },
  uniforms: {
    u_Ang: {
      type: "uniform1f",
      value: 0,
    },
  },
});

let ang = 1;
!(function ani() {
  ang++;
  rect.uniforms.u_Ang.value = ang;
  rect.updateUniform();
  gl.clear(gl.COLOR_BUFFER_BIT);
  rect.draw();
  requestAnimationFrame(ani);
})();
```

效果如下：

![](/glsl-es/8.gif)

### 2-肌理

肌理是美学中必不可少的一部分，不同的肌理有着不同的视觉体验。

可以把之前的代码做一下修改。

- 把 10000.0 变成 10.0：

```js
vec2 a= vec2(0.1234,0.5678);
float n= dot(fragCoord,a);
return fract(tan(n)*10.0);

```

效果如下：

![](/glsl-es/9.png)

有韵律的杂色。

- 或者直接把 10.0 也去掉

```js
vec2 a= vec2(0.1234,0.5678);
float n= dot(fragCoord,a);
return fract(tan(n));

```

效果如下：

![](/glsl-es/10.png)

- 把 a 改一下

```js
vec2 a= vec2(0.111,0.11);
float n= dot(fragCoord,a);
return fract(tan(n));

```

效果如下：

![](/glsl-es/11.png)

- 再把 a 改一下

```js
vec2 a= vec2(0.111,0.111);
float n= dot(fragCoord,a);
return fract(tan(n));

```

这便是拉丝的效果：

![](/glsl-es/12.png)

- 或者还可以这样

```js
float rand(vec2 fragCoord){
    vec2 v=fragCoord-u_CanvasSize/2.0;
    return fract(
        atan(v.x,v.y)*500.0
    );
}

```

![](/glsl-es/13.png)

## 三、极坐标

极坐标的创始人是牛顿，主要应用于数学领域。

### 1-极坐标的基本概念

![](/glsl-es/14.png)

- 极点：极坐标的坐标原点，即点 O
- 极轴：极坐标的起始轴，其对应的弧度为 0，即 Ox
- 正方向：极坐标中，点位按此方向的旋转量越大，其相对于极轴的弧度越大，此方向通常为逆时针方向
- 极径：极坐标系中一点到极点的距离，如|OM|
- 极角：极坐标系中一点相对于极轴的角度，如 θ
- 极坐标：由极坐标系中一点的极径和极角构成的有序数对，如(|OM|,θ)
- 极坐标系：按照以上原理确定某点的坐标位的坐标系

### 2-直角坐标系

gl_FragCoord 所对应的二维直角坐标系中，y 轴是朝上的，以像素为单位。

![](/glsl-es/1.jpg)

一个点的位置既可以用直角坐标来表示，也可以用极坐标来表示。

接下来说一下二维直角坐标系与极坐标系的转换方法。

### 3-极角与 x 轴的映射

可以通过极角与 x 轴的映射实现放射效果。

#### 3-1-放射

![](/glsl-es/15.png)

1.在片元着色器里基于画布尺寸计算画布中心位，声明 360° 所对应的弧度，以备后用。

```j's
uniform vec2 u_CanvasSize;
vec2 center=u_CanvasSize/2.0;
float pi2=radians(360.0);
```

2.以画布中心点为极点，计算当前片元的极角 ang。

```js
void main(){
    vec2 p=gl_FragCoord.xy-center;
    float ang=atan(p.y,p.x);
    ……
}
```

3.以极角为变量，计算与计算一个 x 值

```js
float x=ang*16.0;
```

4.将 x 值拼上一个随意的 y 值，构成向量 v

```js
vec2 v=vec2(int(x),0);
```

5.基于向量 v，通过 rand() 方法生成一个颜色

```js
vec2 v=vec2(int(x),0);
float f = rand(v);
gl_FragColor = vec4(f, f, f, 1);
```

有了渐变的效果后，还可以让其旋转起来。

#### 3-2-渐变旋转

1.通过 requestAnimationFrame() 方法向着色器传递一个时间戳 u_Stamp

```js
const rect = new Poly({
  gl,
  source,
  type: "TRIANGLE_STRIP",
  attributes: {
    a_Position: {
      size: 2,
      index: 0,
    },
  },
  uniforms: {
    u_CanvasSize: {
      type: "uniform2fv",
      value: [canvas.width, canvas.height],
    },
    u_Stamp: {
      type: "uniform1f",
      value: 0,
    },
  },
});

!(function ani(stamp) {
  rect.uniforms.u_Stamp.value = stamp;
  rect.updateUniform();
  gl.clear(gl.COLOR_BUFFER_BIT);
  rect.draw();
  requestAnimationFrame(ani);
})();
```

2.在着色器中建立名为 u_Stamp 的 uniform 变量，并基于此变量建立只负责旋转的模型矩阵 modelMatrix。

```js
uniform vec2 u_CanvasSize;
uniform float u_Stamp;

vec2 center=u_CanvasSize/2.0;
float pi2=radians(360.0);

float angOffset=u_Stamp*0.001;
float cosAng=cos(angOffset);
float sinAng=sin(angOffset);
mat2 modelMatrix=mat2(
    cosAng,sinAng,
    -sinAng,cosAng
);
```

3.在 main() 方法中使用 modelMatrix 旋转点 p

```js
void main(){
    vec2 p=gl_FragCoord.xy-center;
    p=modelMatrix*p;
    float ang=atan(p.y,p.x);
    float x=ang*16.0;

    vec2 v=vec2(int(x),0);
    float f = rand(v);
    gl_FragColor = vec4(f, f, f, 1);
}
```

以此原理，还可以通过时间戳改变上面向量 v 的 y 值，从而实现渐变闪烁。

#### 3-3-渐变闪烁

1.修改一下 main 方法

```js
void main(){
    vec2 p=gl_FragCoord.xy-center;
    //p=modelMatrix*p;
    float ang=atan(p.y,p.x);
    float x=ang*16.0;

    vec2 v=vec2(int(x),int(u_Stamp));
    float f = rand(v);
    gl_FragColor = vec4(f, f, f, 1);
}
```

2.控制一下闪烁速度

```js
let lastTime = 0;
const timeLen = 100;
!(function ani(stamp) {
  if (stamp % timeLen < lastTime % timeLen) {
    rect.uniforms.u_Stamp.value = stamp;
    rect.updateUniform();
    gl.clear(gl.COLOR_BUFFER_BIT);
    rect.draw();
  }
  lastTime = stamp;
  requestAnimationFrame(ani);
})();
```

知道了基本的动画原理后，还可以建立多极点放射效果，从而玩点艺术效果。

#### 3-4-来自深渊的凝视

下图两个极点之间的图形像一只眼睛，所以我就叫它“来自深渊的凝视”啦。

![](/glsl-es/16.png)

这个动画是在放射旋转的基础上实现的，接下来我对其做一下修改。

1.建立两个模型矩阵

```js
float angOffset1=u_Stamp*0.0002;
float cosAng1=cos(angOffset1);
float sinAng1=sin(angOffset1);
mat2 modelMatrix1=mat2(
    cosAng1,sinAng1,
    -sinAng1,cosAng1
);

float angOffset2=u_Stamp*0.0008;
float cosAng2=cos(angOffset2);
float sinAng2=sin(angOffset2);
mat2 modelMatrix2=mat2(
    cosAng2,sinAng1,
    -sinAng2,cosAng2
);
```

- modelMatrix1 是用于旋转片元位的
- modelMatrix2 是用于旋转极点的。

注：modelMatrix2 中的第二个元素是 sinAng1，不是 sinAng2，我这么做是为打破一下其中规中矩的旋转方式。

2.将通过极坐标获取亮度的方法封装一下。

```js
float getBright(vec2 pole){
    pole=center+modelMatrix2*(pole-center);
    vec2 p=gl_FragCoord.xy-pole;
    p=modelMatrix1*p;
    float ang=atan(p.y,p.x);
    float x=ang*16.0;
    vec2 v=vec2(int(x),0);
    return rand(v);
}
```

3.在 mian 中基于两个极点，获取两个亮度值。

```js
void main(){
    vec2 min=u_CanvasSize*0.35;
    vec2 max=u_CanvasSize*0.65;
    float bright1 = getBright(min);
    float bright2 = getBright(max);
    ……
}
```

4.对两个亮度值进行合成。

其合成思路是若两个亮度值都比较暗，那我就让当前片元变亮；若都比较亮，那我就让其变暗。

```js
void main(){
    vec2 min=u_CanvasSize*0.35;
    vec2 max=u_CanvasSize*0.65;
    float bright1 = getBright(min);
    float bright2 = getBright(max);

    float f=0.0;
    float sum=bright1+bright2;
    if(sum>1.0){
        f=bright1*bright2;
    }else{
        f=sum;
    }
    gl_FragColor = vec4(f, f, f, 1);
}
```

以此原理，还可以再玩点别的，比如来上四个极点。

#### 3-5-数字山谷

下面这张图就叫它“数字山谷”了。

要用它来体现数字山谷的现代、科技、格子玻璃、明快、琐碎、进取，以及看似杂乱莫测的变化中又蕴含着的规律。

![](/glsl-es/17.png)

在“来自深渊的凝视”的基础上做一下修改。

1.修改一下矩阵变换的参数

```js
float angOffset1=u_Stamp*0.00015;
float cosAng1=cos(angOffset1);
float sinAng1=sin(angOffset1);
mat2 modelMatrix1=mat2(
    cosAng1,sinAng1,
    -sinAng1,cosAng1
);

float angOffset2=u_Stamp*0.0004;
float cosAng2=cos(angOffset2);
float sinAng2=sin(angOffset2);
mat2 modelMatrix2=mat2(
    cosAng2,sinAng1,
    -sinAng2,cosAng2
);
```

2.通过 4 个极点获取亮度值，然后对其合成

```js
void main(){
    vec2 min=u_CanvasSize*0.25;
    vec2 max=u_CanvasSize*0.75;
    float bright1 = getBright(min);
    float bright2 = getBright(max);
    float bright3 = getBright(vec2(min.x,max.y));
    float bright4 = getBright(vec2(max.x,min.y));
    float f=0.0;
    float sum=bright1+bright2+bright3+bright4;
    if(sum>2.0){
        f=bright1*bright2*bright3*bright4*4.0;
    }else{
        f=sum/2.0;
    }
    gl_FragColor = vec4(f, f, f, 1);
}
```

#### 3-6-正弦型放射

![](/glsl-es/18.png)

先回顾一下正弦型函数：

y=Asin(ωx+φ)

- A 影响的是正弦曲线的波动幅度
- φ 影响的是正弦曲线的平移
- ω 影响的是正弦曲线的周期，ω 越大，周期越小

接下来说一下代码实现。

1.声明 omega 和 a 变量

```js
float omega=7.0;
float a=0.5;
```

- omega 对应的是正弦函数式里的 ω，在放射效果中此值会影响射线的数量
- a 对应的是正弦函数式里的 A，在放射效果中此值会影响亮度

  2.在 main 方法中，以画布中心为极点，计算当前片元的极角

```js
void main(){
    vec2 p=gl_FragCoord.xy-center;
    float ang=atan(p.y,p.x);
    ……
}
```

3.以极角为变量计算正弦函数值

```js
float f = a*sin(omega*ang)+0.5;
gl_FragColor = vec4(f, f, f, 1);
```

上面求 f 时加的 0.5 是为了在[0,1]之间去亮度值：

- a\*sin(omega\*x)∈[-0.5,0.5]
- a\*sin(omega\*x)+0.5∈[0,1]

#### 3-7-光影沉浮

下图就叫它“光影沉浮”了。

![](/glsl-es/19.png)

片元着色器如下：

```js
<script id="fragmentShader" type="x-shader/x-fragment">
  precision mediump float;
  uniform vec2 u_CanvasSize;
  uniform float u_Stamp;

  vec2 center=u_CanvasSize/2.0;
  float pi2=radians(360.0);

  float omega=24.0;
  float a=0.5;

  float angOffset1=u_Stamp*0.001;
  float cosAng1=cos(angOffset1);
  float sinAng1=sin(angOffset1);
  mat2 modelMatrix1=mat2(
    cosAng1,sinAng1,
    -sinAng1,cosAng1
  );

  float angOffset2=u_Stamp*0.001;
  float cosAng2=cos(angOffset2);
  float sinAng2=sin(angOffset2);
  mat2 modelMatrix2=mat2(
    cosAng2,sinAng2,
    -sinAng2,cosAng2
  );

  float getBright(vec2 pole){
    pole=center+modelMatrix2*(pole-center);
    vec2 p=gl_FragCoord.xy-pole;
    p=modelMatrix1*p;
    float ang=atan(p.y,p.x);
    return a*sin(omega*ang)+0.5;
  }

  void main(){
    vec2 min=u_CanvasSize*0.35;
    vec2 max=u_CanvasSize*0.65;
    float bright1 = getBright(min);
    float bright2 = getBright(max);
    float f=(bright1+bright2)*0.55;
    gl_FragColor = vec4(f, f, f, 1);
  }
</script>
```

#### 3-8-湍流

下图具有流体效果，就叫它“湍流”啦。

其动画原理和之前都是一样的，就不再详解了。

![](/glsl-es/20.png)

片元着色器如下：

```js
<script id="fragmentShader" type="x-shader/x-fragment">
  precision mediump float;
  uniform vec2 u_CanvasSize;
  uniform float u_Stamp;

  vec2 center=u_CanvasSize/2.0;
  float pi2=radians(360.0);

  float omega=64.0;
  float a=0.5;

  float angOffset1=u_Stamp*0.0004;
  float sinAng1=sin(angOffset1);

  float angOffset2=u_Stamp*0.0002;
  float cosAng2=cos(angOffset2);
  float sinAng2=sin(angOffset2);
  mat2 modelMatrix2=mat2(
    cosAng2,sinAng1,
    -sinAng2,cosAng2
  );

  float getBright(vec2 pole){
    pole=center+modelMatrix2*(pole-center);
    vec2 p=gl_FragCoord.xy-pole;
    float ang=atan(p.y,p.x);
    return a*sin(omega*ang)+0.5;
  }

  void main(){
    vec2 min=u_CanvasSize*0.25;
    vec2 max=u_CanvasSize*0.75;
    float bright1 = getBright(min);
    float bright2 = getBright(max);
    float bright3 = getBright(vec2(min.x,max.y));
    float bright4 = getBright(vec2(max.x,min.y));
    float f=0.0;
    float sum=bright1+bright2+bright3+bright4;
    if(sum<2.0){
      f=1.0;
    }
    gl_FragColor = vec4(f, f, f, 1);
  }
</script>
```

### 4-全景图的极坐标扭曲

下图是提前准备好的全景图：

![](/glsl-es/21.jpg)

极坐标扭曲效果如下：

![](/glsl-es/22.png)

这就像广角镜头一样，接下来说一下代码实现。

1.建立带贴图的 rect 对象

```json
const source = new Float32Array([
    -1, 1, 0, 1,
    -1, -1, 0, 0,
    1, 1, 1, 1,
    1, -1, 1, 0
]);

const rect = new Poly({
    gl,
    source,
    type: 'TRIANGLE_STRIP',
    attributes: {
        a_Position: {
            size: 2,
            index: 0
        },
        a_Pin: {
            size: 2,
            index: 2
        },
    },
    uniforms: {
        u_CanvasSize: {
            type: 'uniform2fv',
            value: [canvas.width, canvas.height]
        }
    }
})

const image = new Image()
image.src = './images/room.jpg'
image.onload = function () {
    rect.maps = {
        u_Sampler: { image },
    }
    rect.updateMaps()
    render()
}

//渲染
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    rect.draw()
}
```

2.顶点着色器

```js
<script id="vertexShader" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  attribute vec2 a_Pin;
  varying vec2 v_Pin;
  void main(){
      gl_Position=a_Position;
      v_Pin=a_Pin;
  }
</script>
```

3.片元着色器

```js
<script id="fragmentShader" type="x-shader/x-fragment">
  precision mediump float;
  uniform vec2 u_CanvasSize;
  uniform sampler2D u_Sampler;
  varying vec2 v_Pin;
  vec2 center=u_CanvasSize/2.0;
  float diagLen=length(center);
  float pi2=radians(360.0);

  float getAngle(vec2 v){
    float ang=atan(v.y,v.x);
    if(ang<0.0){
        ang+=pi2;
    }
    return ang;
  }

  void main(){
    vec2 p=gl_FragCoord.xy-center;
    float ang=getAngle(p);
    float x=ang/pi2;
    float len=length(p);
    float y=len/diagLen;
    vec4 color=texture2D(u_Sampler,vec2(x,y));
    if(p.x>0.0&&abs(p.y)<1.0){
      color=texture2D(u_Sampler,vec2(0,y));
    }
    gl_FragColor=color;
  }
</script>
```

## 综合案例-磨砂金属按钮

接下来将之前说过的渐变、杂色、极坐标扭曲、拉丝融为一体，做一个磨砂金属按钮。

![](/glsl-es/23.png)

1.先制作一个磨砂材质

```html
<script id="fragmentShader" type="x-shader/x-fragment">
   precision mediump float;
   uniform vec2 u_CanvasSize;
   vec2 center=u_CanvasSize/2.0;
   float diagLen=length(center);
   float pi2=radians(360.0);
   float omega=4.0;
   float a=0.5;

   //渐变
   float gradient(float ang){
     return a*sin(omega*ang)+0.5; ;
   }

   //水平拉丝
   float wire(vec2 v){
     vec2 a= vec2(0.0,1.0);
     float n= dot(v,a);
     return fract(tan(n)*10000.0);
   }

   //杂色
   float noise(vec2 v){
     vec2 a= vec2(0.1234,0.5678);
     float n= dot(v,a);
     return fract(tan(n)*10000.0);
   }

   //获取弧度
   float getAngle(vec2 v){
     float ang=atan(v.y,v.x);
     if(ang<0.0){
         ang+=pi2;
     }
     return ang;
   }

   void main(){
     vec2 p=gl_FragCoord.xy-center;
     //极径
     float len=length(p);
     //极角
     float ang=getAngle(p);

     float x=u_CanvasSize.x*ang/pi2;
     float y=(len/diagLen)*u_CanvasSize.y;

  //渐变
     float f1 = gradient(ang);
     f1=0.65*f1+0.5;

  //拉丝
     float f2 = wire(vec2(int(x),int(y)));
     f2=clamp(f2,0.75,0.8);

  //杂色
     float f3 = noise(gl_FragCoord.xy);
     f3*=0.07;

     //复合亮度
     float f=f1*f2+f3;

     gl_FragColor = vec4(vec3(f), 1);

   }
</script>
```

效果如下：

![](/glsl-es/24.png)

2.绘制凸出效果，对复合亮度做一下加工。

![](/glsl-es/25.png)

```js
float ratio1=smoothstep(-1.0,1.0,sin(ang));
float r=150.0;
float expand1=r+4.0;
if(len>r&&len<expand1){
    f*=ratio1+0.3;
}
```

smoothstep(edge0,edge1,x) 求 x 在 edge0 和 edge1 间的插值[0,1]

- 若 x<edge0 返回 0

- 若 x>edge1 返回 1

- 否则返回 x 在 edge0 和 edge1 间的插值

例子：

smoothstep(3,7,1)=0

smoothstep(3,7,8)=1

smoothstep(3,7,5)=(5-3)/(7-3)=2/4=0.5

sin(ang)的单调性：

- ang∈[-π/2,π/2] 时，ang 越大，sin(ang)越大
- ang∈[π/2,π/2+π] 时，ang 越大，sin(ang)越小

  3.以此原理，我们还可以再做一圈凹陷效果。

```js
float ratio1=smoothstep(-1.0,1.0,sin(ang));
float ratio2=1.0-ratio1;
float r=150.0;
float expand1=r+4.0;
float expand2=expand1+12.0;
if(len>r&&len<expand1){
    f*=ratio1+0.3;
}else if(len>expand1&&len<expand2){
    f*=ratio2+0.1;
}
```

效果如下：

![](/glsl-es/26.png)

上面的 ratio2 是实现了一个自上到下，由暗到亮的效果。

4.我们还可以再来一圈渐变，使凹凸效果更具层次。

```js
float ratio1=smoothstep(-1.0,1.0,sin(ang));
float ratio2=1.0-ratio1;
float r=150.0;
float expand1=r+4.0;
float expand2=expand1+12.0;
float expand3=expand2+2.0;
if(len>r&&len<expand1){
    f*=ratio1+0.3;
}else if(len>expand1&&len<expand2){
    f*=ratio2+0.1;
}else if(len>expand2&&len<expand3){
    f*=ratio2+0.3;
}
```

效果如下：

![](/glsl-es/27.png)

5.也可以对代码做一点优化，把亮度和半径各自装进一个集合里。

```js
//片元亮度集合
float ratio1=(sin(ang)+1.0)/2.0;
float ratio2=1.0-ratio1;
float ls[3];
ls[0]=f*(ratio1+0.3);
ls[1]=f*(ratio2+0.1);
ls[2]=f*(ratio2+0.3);

//初始半径
float r=150.0;
//半径集合
float rs[3];
rs[0]=r+4.0;
rs[1]=rs[0]+12.0;
rs[2]=rs[1]+2.0;

//基于len值，计算片元亮度
for(int i=0;i<3;i++){
    if(len>=r&&len<rs[i]){
        f=ls[i];
        break;
    }
    r=rs[i];
}
```