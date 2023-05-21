
class SnapshotSandBox {
  windowSnapshot = {};
  modifiedWindowProps = {};

  constructor() {

  }

  active() {
    // 把window快照保存一下
    for (const prop in window) {
      this.windowSnapshot[prop] = window[prop];
    }
    // 恢复上次微应用修改过后的变量
    Object.keys(this.modifiedWindowProps).forEach((prop) => {
      window[prop] = this.modifiedWindowProps[prop];
    })
  }

  inactive() {
    for (const prop in window) {
      // 
      if (window[prop] !== this.windowSnapshot[prop]) {
        // 记录修改的
        this.modifiedWindowProps[prop] = window[prop];
        window[prop] = this.windowSnapshot[prop];
      }
    }
  }

}

window.city = '上海';
// 验证:
let snapshotSandBox = new SnapshotSandBox()
console.log('window.city-00:', window.city) // undefined 激活之前window上没有city属性
snapshotSandBox.active() // 激活
window.city = 'Beijing' // 激活后给window上设置city属性
console.log('window.city-01:', window.city) // Beijing
snapshotSandBox.inactive() // 失活后window上的属性恢复到原本的状态
console.log('window.city-02:', window.city) // undefined
snapshotSandBox.active() // 再次激活，恢复到上次微前端修改后的状态
console.log('window.city-03:', window.city) // Beijing
snapshotSandBox.inactive()