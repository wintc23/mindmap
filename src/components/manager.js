export class NodeManager {
  constructor (el, treeData, options = {}) {
    if (el && treeData) {
      this.init(el, treeData, options)
    }
  }
  init (el, treeData, options) {
    this.$el = el
    this.treeData = treeData
    this.options = Object.assign({
      id: 'id',
      parentId: 'parentId',
      elementClass: 'mind-map-node',
      elementChildClass: 'mind-map-node-child'
    }, options)
    this.manager = {}
    this.treeData.forEach(item => this.generateManageData(item))
    this.treeData.forEach(item => {
      if (this.manager[item.parentId]) {
        this.manager[item.parentId].children.push(item)
      }
    })
    this.render()
  }
  releaseResource () {
    if (!this.manager) return
    for (let idx in this.manager) {
      // dom处理
      let data = this.manager[idx]
      for (let element of data.dom) {
        element.__nodeData = null
        element.parentNode.removeChild(element)
      }
    }
    this.manager = {}
  }
  proxy (el, treeData, options) {
    this.releaseResource()
    this.init(el, treeData, options)
  }
  destory () { // 释放资源，释放引用
    this.releaseResource()
    this.$el = null
    this.treeData = null
    this.options = null
  }
  render () {
    this.calBoxPosition()
    this.fixPosition()
  }
  calBoxPosition (node) {
    node = node || this.getRootManageData()
    let rect = node.dom.element.getBoundingClientRect()
    let child = node.dom.element.firstChild
    let childRect = child.getBoundingClientRect()
    node.position = {
      width: rect.width,
      height: rect.height,
      leftX: childRect.left - rect.left,
      leftY: childRect.top - rect.top + childRect.height / 2,
      rightX: childRect.left - rect.left + childRect.width,
      rightY: childRect.top - rect.top + childRect.height / 2
    }
    if (node.children.length) {
      for (let childNode of node.children) {
        this.calBoxPosition(this.getManageDataById(childNode.id))
      }
      let height = 0
      let width = 0
      node.children.forEach(item => {
        let child = this.getManageDataById(item.id)
        width = Math.max(child.position.boxWidth, width)
        height += child.position.boxHeight
      })
      node.position.boxWidth = width + node.position.width
      node.position.boxHeight = height
    } else {
      node.position.boxWidth = node.position.width
      node.position.boxHeight = node.position.height
    }
  }
  fixPosition (nodeList) {
    nodeList = nodeList || [this.getRootManageData()]
    let len = nodeList.length
    for (let i = 0; i < len; i++) {
      let node = nodeList[i]
      let parentNode = this.getParentManageData(node.data.id)
      node.position.top = (node.position.boxHeight - node.position.height) / 2
      console.log(node.position.top, '~~~~~~~1')
      node.position.boxTop = 0
      if (i === 0) {
        if (parentNode) {
          node.position.top = parentNode.position.boxTop + node.position.top
          node.position.boxTop = parentNode.position.boxTop
        }
      } else {
        let bro = nodeList[i-1]
        node.position.boxTop = bro.position.boxTop + bro.position.boxHeight
        node.position.top = node.position.boxTop + node.position.top
      }
      if (parentNode) {
        node.position.left = parentNode.position.left + parentNode.position.width
      } else {
        node.position.left = 0
      }
      if (node.children.length) {
        this.fixPosition(node.children.map(item => this.getManageDataById(item.id)))
        for (let childData of node.children) {
          let child = this.getManageDataById(childData.id)
          let width = (child.position.left + child.position.leftX) - (node.position.left + node.position.rightX)
          let height = (child.position.top + child.position.leftY) - (node.position.top + node.position.leftY)
          let absHeight = height ? Math.abs(height) : 2
          let svg = this.createSvg(child.data.id, width, absHeight, -height)
          window.requestAnimationFrame(
            () => {
              if (height) {
                svg.style.top = Math.round(height < 0 ? (child.position.top + child.position.leftY) : (node.position.top + node.position.leftY)) + 'px'
              } else {
                svg.style.top = Math.round(child.position.top + child.position.leftY - 1) + 'px'
              }
              svg.style.left = Math.round(node.position.left + node.position.rightX) + 'px'
            }
          )
        }
      }
      window.requestAnimationFrame(() => {
        console.log(node.position.top)
        node.dom.element.style.top = Math.round(node.position.top) + 'px'
        node.dom.element.style.left = Math.round(node.position.left) + 'px'
      })
    }
  }
  getRootManageData () {
    let node
    for (let key in this.manager) {
      node = this.manager[key]
      break
    }
    let root
    while (node) {
      root = node
      node = this.getParentManageData(node.data.id)
    }
    return root
  }
  getManageDataById (id) {
    return this.manager[id] || null
  }
  getOriginDataById (id) {
    return this.manager[id].data
  }
  getParentManageData (id) {
    let parentId = this.manager[id].data.parentId
    return this.manager[parentId] || null
  }
  generateManageData (data) {
    if (this.manager[data.id]) throw ('there is a duplicate id ' + data.id)
    this.manager[data.id] = {
      data,
      children: [],
      position: {},
      dom: {}
    }
    this.createElement(data.id)
  }
  createElement (id) {
    let dom = this.manager[id].dom
    if (!dom.element) {
      dom.element = document.createElement('div')
      dom.element.style.position = 'absolute'
      dom.element.classList.add(this.options.elementClass)
      let child = document.createElement('div')
      child.classList.add(this.options.elementChildClass)
      dom.element.appendChild(child)
      dom.element.__nodeData = this.manager[id].data
      child.__nodeData = this.manager[id].data
      this.$el.appendChild(dom.element)
    }
    dom.element.firstChild.innerText = this.manager[id].data.name
  }
  createSvg (id, width, height, k = -1) {
    let dom = this.manager[id].dom
    if (!dom.svg) {
      dom.svg= document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      dom.svg.style.position = 'absolute'
      let path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('stroke', 'black')
      path.setAttribute('fill', 'none')
      dom.svg.appendChild(path)
    }
    let svg = dom.svg
    let path = svg.firstChild
    let d = ''
    if (k < 0) {
      d = `M0,0 C${width/2},0 ${width/2},${height} ${width},${height}`
    } else if (k > 0) {
      d = `M0,${height} C${width/2},${height}, ${width/2},0 ${width},0`
    } else {
      d = `M0,0 L${width},0`
      height = 2
      path.setAttribute('stroke-width', '3')
    }
    svg.setAttribute('width', width)
    svg.setAttribute('height', height)
    path.setAttribute('d', d)
    this.$el.appendChild(svg)
    return svg
  }
  generateFake (num) {
    let lst = []
    let nodeTitle = [
      '新节点',
      '新节点2',
      '新节点3',
      '新节点4',
      '新节点5',
      '新节点6',
      '新节点7',
      '新节点8',
      '新节点9',
      '新节点10',
      '新节点11',
      '新节点12',
      '新节点13',
    ]
    for (let i = 0; i < num; i++) {
      let data = {
        id: i,
        name: nodeTitle[Math.round(Math.random() * 10)]
      }
      if (i !== 0) {
        data.parentId = Math.floor(Math.random() * i)
      }
      lst.push(data)
    }
    return lst
  }
  addNode (data, className) {
    this.generateManageData(data)
    this.manager[data.parentId] && this.manager[data.parentId].children.push(data)
    this.treeData.push(data)
  }
  removeNode () {
    //
  }
  getElementById () {
    // 
  }
}