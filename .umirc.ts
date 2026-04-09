import { defineConfig } from '@umijs/max';
import px2rem from 'postcss-pxtorem';
export default defineConfig({
  npmClient: 'yarn',
  history: { type: 'browser' },
  locale: {
    default: 'en',
    antd: false,
    baseNavigator: true,
    title: false,
  },
  routes: [
    { path: '/login', component: '@/pages/login', layout: false },
    {
      path: '/',
      component: '@/layouts/BasicLayout',
      routes: [
        { path: 'list', component: '@/pages/list' },
        { path: 'me', component: '@/pages/me' },
        { path: 'events/:id', component: '@/pages/detail' },
        { path: '/', redirect: '/list' },
      ],
    },
  ],
  model: {},
  request: {
    dataField: '',
  },
  extraPostCSSPlugins: [
    px2rem({
      // 1rem 默认为 16px（不注入 flexible 动态改根字号）
      rootValue: 16,
      propList: ['*'], // 转换所有属性，可设置为 ['*'] 或指定具体属性
      selectorBlackList: ['html'], // 排除特定选择器（如 html）不进行转换
      minPixelValue: 2, // 1px 细线/边框不转换，避免在不同宽度下出现“忽粗忽细”
      exclude: /node_modules/i, // 排除 node_modules 目录下的文件
    }),
  ],
  proxy: {
    '/api': {
      target: process.env.API_BASE,
      changeOrigin: true,
    },
  },
  define: {
    'process.env.API_BASE': process.env.API_BASE || '',
  },
  esbuildMinifyIIFE: true,
  hash: true,
});
