
(function(){
  function request(cap, method, ...params){
    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();
      function onMsg(e){
        const m = e.data;
        if (m && m.type === 'response' && m.id === id){
          window.removeEventListener('message', onMsg);
          m.ok ? resolve(m.result) : reject(new Error(m.error || 'Error'));
        }
      }
      window.addEventListener('message', onMsg);
      parent.postMessage({ type:'request', id, cap, method, params }, '*');
    });
  }
  window.OS = { request };
})();
