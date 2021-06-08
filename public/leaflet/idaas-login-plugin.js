function IDaaSLoginPlugin(config) {
  this.config = config;
  this.config.width = this.config.width ? this.config.width : 400;
  this.config.height = this.config.height ? this.config.height : 500;
  this.config.host = window.location.protocol + '//' + window.location.host;
  this.init();
}

IDaaSLoginPlugin.prototype = {
  init: function() {
    this.appendFrame();
  },

  // 插入登录框Iframe
  appendFrame: function() {
    var doc = document;
    var self = this;

    this.frame = doc.createElement('iframe');
    this.frame.setAttribute('src', this.config.portalUrl);
    this.frame.setAttribute('frameborder', '0');
    this.frame.setAttribute('width', this.config.width);
    this.frame.setAttribute('height', this.config.height);
    this.frame.id = 'idaasLoginPlugin';

    // Iframe插入位置
    if (this.config.box) {
      document.getElementById(this.config.box).append(this.frame);
    } else {
      var getScripts = document.getElementsByTagName('script');
      for (var i = 0; i < getScripts.length; i++) {
        getScripts[i].src.indexOf('idaas-login-plugin.js') != -1 &&
          getScripts[i].parentNode.insertBefore(this.frame, getScripts[i]);
      }
    }

    // iframe加载之后执行操作
    this.frame.onload = function() {
      self.appendParams();
    };
  },

  // 将样式等信息传递给登录模块
  appendParams: function() {
    document
      .getElementById('idaasLoginPlugin')
      .contentWindow.postMessage(this.config, this.config.portalUrl);
  },
};
