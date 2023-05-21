class ProxySandBox {
  proxyWindow;
  isRunning = false;

  constructor() {
    const fakeWindow = Object.create(null);

    this.proxyWindow = new Proxy(fakeWindow, {
      get: (target, key, receiver) => {
        return key in target ? target[key] : window[key];
      },
      set: (target, key, value, receiver) => {
        if (this.isRunning) {
          target[key] = value;
        }
      }
    })
  }

  active() {
    this.isRunning = true;
  }

  inactive() {
    this.isRunning = false;
  }
}

// 验证：
window.city = 'Wuhan'
let proxySandBox1 = new ProxySandBox()
let proxySandBox2 = new ProxySandBox()
proxySandBox1.active()
proxySandBox2.active()
proxySandBox1.proxyWindow.city = 'Beijing'
proxySandBox2.proxyWindow.city = 'Shanghai'
console.log('active:proxySandBox1:window.city:', proxySandBox1.proxyWindow.city)
console.log('active:proxySandBox2:window.city:', proxySandBox2.proxyWindow.city)
console.log('window:window.city:', window.city)
proxySandBox1.inactive()
proxySandBox2.inactive()
proxySandBox1.proxyWindow.city = 'Beijing2'
proxySandBox2.proxyWindow.city = 'Shanghai2'
console.log('inactive:proxySandBox1:window.city:', proxySandBox1.proxyWindow.city)
console.log('inactive:proxySandBox2:window.city:', proxySandBox2.proxyWindow.city)
console.log('window:window.city:', window.city)
