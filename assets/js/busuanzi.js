// 不蒜子统计动态加载
(function() {
  // 添加不蒜子脚本
  var script = document.createElement('script');
  script.src = '//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
  script.async = true;
  document.head.appendChild(script);
  
  // 等待页面加载
  window.addEventListener('load', function() {
    // 查找页脚
    var footer = document.querySelector('footer') || 
                 document.querySelector('.footer') || 
                 document.querySelector('.site-footer') ||
                 document.querySelector('.page__footer') ||
                 document.body;
    
    if (!footer) {
      console.log('未找到页脚元素，将统计添加到页面底部');
      footer = document.body;
    }
    
    // 创建统计显示
    var statsDiv = document.createElement('div');
    statsDiv.className = 'busuanzi-counter';
    statsDiv.style.cssText = `
      text-align: center;
      font-size: 0.85rem;
      color: #6c757d;
      margin: 20px 0 0 0;
      padding: 15px 0 0 0;
      border-top: 1px solid #eaeaea;
      clear: both;
    `;
    
    statsDiv.innerHTML = `
      <span id="busuanzi_container_site_pv">
        <i class="fas fa-eye" style="margin-right: 5px;"></i>
        总访问量: <span id="busuanzi_value_site_pv" style="font-weight: bold; color: #495057;"></span>
      </span>
      <span style="margin: 0 12px; color: #adb5bd;">|</span>
      <span id="busuanzi_container_site_uv">
        <i class="fas fa-users" style="margin-right: 5px;"></i>
        访客数: <span id="busuanzi_value_site_uv" style="font-weight: bold; color: #495057;"></span>
      </span>
    `;
    
    // 插入到页脚
    footer.appendChild(statsDiv);
    
    // 检查是否加载成功
    setTimeout(function() {
      var pv = document.getElementById('busuanzi_value_site_pv');
      var uv = document.getElementById('busuanzi_value_site_uv');
      
      if (pv && pv.textContent === '') {
        console.log('不蒜子统计正在加载...');
      }
    }, 3000);
  });
})();