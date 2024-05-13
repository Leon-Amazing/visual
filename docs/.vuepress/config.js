module.exports = {
  // 站点配置
  base: '/visual/',
  lang: 'zh-CN',
  title: '数据可视化',
  description: "Leon's library",
  head: [['link', { rel: 'icon', href: 'logo.png' }]],

  // 主题和它的配置
  theme: '@vuepress/theme-default',
  themeConfig: {
    logo: 'logo.png',
    // 导航
    navbar: [
      {
        text: '计算机图形学',
        link: '/computer/ComputerGraphics.md',
      },
      {
        text: 'WebGL',
        children: [
          {
            text: 'WebGL',
            children: [
              {
                text: 'WebGL基础',
                link: '/webgl/WebGL-share.md',
              },
              {
                text: 'WebGL实践',
                link: '/webgl/WebGL-practice.md',
              },
            ],
          },
          {
            text: 'GLSL ES',
            children: [
              {
                text: 'GLSL ES基础',
                link: '/webgl/GLSL-ES-basic.md',
              },
              {
                text: 'GLSL ES实践',
                link: '/webgl/GLSL-ES-practice.md',
              },
            ],
          },
        ],
      },
      {
        text: 'ThreeJS',
        link: '/threejs/index.md',
      },
      {
        text: 'Echarts',
        link: '/echarts/index.md',
      },
    ],
  },

  // plugins
  plugins: [
    [
      '@vuepress/plugin-search',
      {
        locales: {
          '/': {
            placeholder: 'Search',
          },
          '/zh/': {
            placeholder: '搜索',
          },
        },
      },
    ],
  ],
};
