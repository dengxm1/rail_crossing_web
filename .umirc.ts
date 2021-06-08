import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    {
      path: '/ReportGeneration',
      component: '@/components/ReportGeneration/index',
      title: '报告生成',
    },
    {
      path: '/userLogin',
      component: '@/pages/userLogin/index',
      title: '登录页',
    },
    {
      path: '/loading',
      component: '@/pages/loading/index',
      title: '登录跳转中请稍等...',
    },
    {
      path: '/',
      component: '@/layouts/index',
      title: '轨交公交接驳优化分析系统',
      routes: [
        {
          path: '/',
          component: '@/pages/IndexPage/index',
          title: '全局总览-轨交公交接驳优化分析系统',
          wrappers: ['@/pages/auth/index'],
        },
        {
          path: '/AnalysisOfCorrelation',
          component: '@/pages/AnalysisOfCorrelation/index',
          title: '接驳相关性分析-轨交公交接驳优化分析系统',
          wrappers: ['@/pages/auth/index'],
        },
        {
          path: '/AnalysisOfBus',
          component: '@/pages/AnalysisOfBus/index',
          title: '接驳公交分析-轨交公交接驳优化分析系统',
          wrappers: ['@/pages/auth/index'],
        },
        {
          path: '/OptimizeScheme',
          component: '@/pages/OptimizeScheme/index',
          title: '接驳方案优化-轨交公交接驳优化分析系统',
          wrappers: ['@/pages/auth/index'],
        },
        {
          path: '/AnalysisReport',
          component: '@/pages/AnalysisReport/index',
          title: '分析报告',
          wrappers: ['@/pages/auth/index'],
        },
        {
          path: '/userManagement',
          component: '@/pages/userManagement/index',
          title: '用户管理',
          wrappers: ['@/pages/auth/index'],
        },
        { component: '@/pages/404' },
      ],
    },
  ],
  favicon:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAYCAMAAADat72NAAAAY1BMVEUAAACSx/+W0v+X0v+X0v+X0v+W0v+W0/+X0/+X0v+Y0f+Y0v+X0v+W0f+X0v+X0v+X0v+X0v+X0v+X0v+X0/+Y0v+Y0v+Y0f+Y0v+X0/+X0/+X0v+Y0/+Y1P+X0f+Oxv+X0v/BzUihAAAAIHRSTlMAAvTu6XkkHJafQz775eHV0MvGmpB9bkg5MHPbdBaFCaiCJ/wAAACfSURBVCjP1ZJJDsMgDEXtAIHM85y0vv8pa7WiJJUC6/4Vn4dkCT84BadEymRC2y8s7QS9I7oUf1hmJIN21Hps+SBNhl829wVfNbv+dL03XIt+Ri7PR8mlVjGcEquaL0uFkBBVg2PuxVARGRD5AjdZcgEUwW0i+huMq0IPzohSDz627fDNRrzODn2q8a8ElXehTofV6rBaHfwyhVUMiPwCYhEQ1XZwDl0AAAAASUVORK5CYII=',
  polyfill: {
    imports: ['core-js/stable'],
  },
  proxy: {
    '/api/': {
      target: 'http://172.17.168.61:8001/', // 测试环境
      // target: 'http://172.17.168.67:8081/', // 正式环境
      // target: 'http://192.168.97.133:8001/',  // 本地环境
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
});
