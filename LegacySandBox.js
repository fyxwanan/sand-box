class LegacySandBox {
  // 沙箱隔离期间新增的全局变量
  addedPropsMapInSandBox = new Map()
  // 沙箱期间变更的全局变量
  modifiedPropsOriginalMapInSandBox = new Map();
  // 持续记录更新的(新增和修改的)全局变量的 map，用于在任意时刻做 snapshot
  currentUpdatedPropsValueMap = new Map();
  // 代理window对象，用户不要直接操作window对象，而是使用proxyWindow来新增修改属性
  proxyWindow;


  constructor() {
    const fakeWindow = Object.create(null);
    this.proxyWindow = new Proxy(fakeWindow, {
      get: (target, prop, receiver) => {
        return window[prop];
      },

      set: (target, prop, value, receiver) => {
        // 给代理window上新增属性
        if (!window.hasOwnProperty(prop)) {
          this.addedPropsMapInSandBox.set(prop, value); 
        } else if (!this.modifiedPropsOriginalMapInSandBox.has(prop)) {
          // 要修改window的已经有的prop的原始值
          const originalVal = window[prop];
          // 修改代理window上原本的属性，需要保留没有修改之前的该属性值，用于失活的时候恢复
          this.modifiedPropsOriginalMapInSandBox.set(prop, originalVal)
        } 
        this.currentUpdatedPropsValueMap.set(prop, value);
        window[prop] = value;
      }
    })
  }

  setWindowProp(prop, value, toDelete = false) {
    if (value === undefined && toDelete) {
      delete window[prop];
    } else {
      window[prop] = value;
    }
  }

  active() {
    // 恢复上一次运行该微应用的时候所修改过的属性到windows
    this.currentUpdatedPropsValueMap.forEach((value, prop) => this.setWindowProp(prop, value))
  }

  inactive() {
    // 新添加到window上的属性删除
    this.addedPropsMapInSandBox.forEach((value, prop) => this.setWindowProp(prop, undefined, true));
    // 修改window上的属性的值还原为没修改之前的值
    this.modifiedPropsOriginalMapInSandBox.forEach((value, prop) => this.setWindowProp(prop, value))
  }
}


// 验证:
window.city = '上海'
let legacySandBox = new LegacySandBox()
console.log('window.city-00:', window.city) // undefined 激活之前window上没有city属性
legacySandBox.active() // 激活
legacySandBox.proxyWindow.city = 'Beijing' // 激活后给window上设置city属性
console.log('window.city-01:', window.city) // Beijing
legacySandBox.inactive() // 失活后window上的属性恢复到原本的状态
console.log('window.city-02:', window.city) // undefined
legacySandBox.active() // 再次激活，恢复到上次微前端修改后的状态
console.log('window.city-03:', window.city) // Beijing
legacySandBox.inactive()