# 计算机图形学

## 一、概述

> 计算机图形学(Computer Graphics，简称CG)是一种使用数学算法将二维或三维图形转化为计算机显示器的栅格形式的科学。简单地说，计算机图形学的主要研究内容就是研究如何在计算机中表示图形、以及利用计算机进行图形的计算、处理和显示的相关原理与算法。

## 二、内容

1. 光栅化（openGL sharder）
2. 曲线和曲面（几何）
3. 光线追踪（电影中生成真实画面）
4. 动画与模拟

## 三、入门需知
1. 基础数学
    - 线性代数、微积分、统计学
2. 基础物理
    - 光学、力学
3. 其他
    - 信号处理
    - 数值分析
4. 还有一点美学

## 三、线性代数综述

### 1. 向量
![](/computer/1.png)

- Usually written as ![](/computer/1-1.png) or in bold **a**
- Or using start and end points 
- Direction and length
- No absolute starting position

1. 单位向量（向量归一化）  
![](/computer/2.png)

2. 单向量加法  
![](/computer/3.png)

3. 笛卡尔坐标  
![](/computer/4.png)

4. 向量乘法

a.点乘  
![](/computer/5.png) 

![](/computer/6.png)  


`点乘告诉方向性`：  
一致>0; 垂直=0; 相反<0  
![](/computer/7.png)

b.叉乘  
遵循`右手螺旋`定则：  
例如x向量叉乘y向量 = +z向量 （右手坐标系）  
![](/computer/8.png)

`判定左右/内外`如下图：  
![](/computer/9.png)

### 2. 矩阵
![](/computer/10.png)

`矩阵 X 矩阵：需要几行几列，就去找几行几列点乘即可`

![](/computer/11.png)


### 3. 变换

**模型变换**（modeling）  
平移tanslation  
旋转rotation  
缩放scaling  

**视图变换**（viewing）  
![](/computer/12.png)  
`3d to 2d projecting`

**1.缩放**  
![](/computer/13.png)  

![](/computer/14.png)  

![](/computer/15.png)  

![](/computer/16.png)  

![](/computer/17.png)  


**2.旋转**  
![](/computer/18.png)  

![](/computer/19.png)  

![](/computer/20.png)  


**3.齐次坐标**  
`a.平移`   
![](/computer/21.png)  

![](/computer/22.png)  

![](/computer/23.png)  

平移不能用矩阵形式表示，平移不是线性变换：   
![](/computer/24.png) 

`b.齐次坐标`    
但是不想平移变成特例，所以引入齐次坐标。  
加入第三个坐标:    
![](/computer/25.png) 

![](/computer/26.png) 

![](/computer/27.png)   
`point + point = 齐次坐标的中点`

![](/computer/28.png) 

![](/computer/29.png) 

**4.组合变换**  
![](/computer/30.png) 

`矩阵无交换律`：  
![](/computer/31.png) 

`矩阵有结合律`（3x3d的矩阵可以表示一个很复杂的变换）：  
![](/computer/32.png) 

`分解复杂变换`：从右到左    
![](/computer/33.png) 