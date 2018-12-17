<template>
  <div class="root">
    <div>
      <input type="number" v-model="nodeNum" />
      <button @click.stop="generateData">生成节点</button>
      <Button type="success" @click.stop="calNodePosition()">渲染</Button>
    </div>
    <div class="map-tree" v-show="false">
      <!-- <Button type="success" @click.stop="drawCurve()">贝塞尔</Button> -->
      <simple-tree
        class="tree"
        :treeData="treeData">
        <div slot-scope="{data, parentData, level}">
          {{ data.name }}
        </div>
      </simple-tree>
    </div>
    <div class="mindmap" ref="mindmap"></div>
  </div>
</template>

<script>
import { NodeManager } from './manager'
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data () {
    return {
      nodeNum: '',
      treeData: [
        {
          name: 'hello',
          id: '1',
          children: [
            {
              name: 'child1',
              id: '2',
              children: [
                {
                  name: 'child7',
                  id: '7'
                },
                {
                  name: 'child8',
                  id: '8'
                }
              ]
            },
            {
              name: 'child2',
              id: '3'
            },
            {
              name: 'child3',
              id: '4'
            },
            {
              name: 'child4',
              id: '5'
            },
            {
              name: 'child5',
              id: '6'
            }
          ]
        }
      ],
      currentChoose: null,
      id: 100
    }
  },
  created () {
    // 
  },
  mounted () {
    this.manager = new NodeManager()
    let data = this.manager.generateFake(100)
    this.manager.proxy(this.$refs.mindmap, data)
    // document.addEventListener('keydown', this.checkKeyPress)
    // this.calNodePosition()
    // this.treeData[0].element.click()
  },
  beforeDestroy () {
    if (this.manager) {
      this.manager.destory()
    }
    document.removeEventListener('keydown', this.checkKeyPress)
  },
  methods: {
    generateData () {
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
      let tmpMap = new Map()
      this.treeData = []
      for (let i = 0; i < this.nodeNum; i++) {
        let data = {
          id: i,
          name: nodeTitle[Math.round(Math.random() * 10)],
          children: []
        }
        tmpMap.set(i, data)
        if (i === 0) {
          this.treeData.push(data)
        } else {
          let parentId = Math.floor(Math.random() * i)
          let parentNode = tmpMap.get(parentId)
          if (!parentNode) {
            console.log('未找到父节点', parentId, i)
          } else {
            parentNode.children.push(data)
          }
        }
        if (i % 100 === 0) {
          console.log(i, 'done')
        }
      }
    },
    createCurve (width, height, k = -1) {
      let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.style.position = 'absolute'
      let path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
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
      path.setAttribute('stroke', 'black')
      path.setAttribute('fill', 'none')
      svg.appendChild(path)
      this.$refs.mindmap.appendChild(svg)
      return svg
    },
    calNodePosition () {
      this.createElements(this.treeData)
      this.calBoxPosition(this.treeData)
      this.fixPosition(this.treeData)
    },
    createElements (treeData) {
      for (let data of treeData) {
        this.createElement(data)
        if (data.children) {
          this.createElements(data.children)
          for (let child of data.children) {
            child.parentData = data
          }
        }
      }
    },
    createElement (data) {
      if (!data.element) {
        data.element = document.createElement('div')
        data.element.style.position = 'absolute'
        data.element.classList.add('mind-map-node')
        let child = document.createElement('div')
        child.classList.add('mind-map-node-child')
        data.element.appendChild(child)
        data.element.data = data
        this.$refs.mindmap.appendChild(data.element)
        this.addNodeEventListener(data.element)
      }
      let child = data.element.querySelector('.mind-map-node-child')
      child.innerText = data.name
    },
    calBoxPosition (treeData) {
      for (let data of treeData) {
        let rect = data.element.getBoundingClientRect()
        let child = data.element.querySelector('.mind-map-node-child')
        let childRect = child.getBoundingClientRect()
        data.width = rect.width
        data.height = rect.height
        data.leftX = childRect.left - rect.left
        data.leftY = childRect.top - rect.top + childRect.height / 2
        data.rightX = childRect.left - rect.left + childRect.width
        data.rightY = data.leftY
        if (data.children) {
          this.calBoxPosition(data.children)
          let height = 0
          let width = 0
          data.children.forEach(item => {
            width = Math.max(item.boxWidth, width)
            height += item.boxHeight
          })
          data.boxWidth = width + data.width
          data.boxHeight = height
        } else {
          data.boxWidth = data.width
          data.boxHeight = data.height
        }
      }
    },
    fixPosition (treeData) {
      let len = treeData.length
      for (let i = 0; i < len; i++) {
        let data = treeData[i]
        data.boxTop = 0
        data.top = (data.boxHeight - data.height) / 2
        if (i === 0) {
          if (data.parentData) {
            data.top = data.parentData.boxTop + data.top
            data.boxTop = data.parentData.boxTop
          }
        } else {
          let bro = treeData[i-1]
          data.top = bro.boxTop + bro.boxHeight + data.top
          data.boxTop = bro.boxTop + bro.boxHeight
        }
        if (data.parentData) {
          data.left = data.parentData.left + data.parentData.width
        } else {
          data.left = 0
        }
        if (data.children) {
          this.fixPosition(data.children)
          for (let child of data.children) {
            if (child.svg) {
              child.svg.parentNode.removeChild(child.svg)
            }
            let width = (child.left + child.leftX) - (data.left + data.rightX)
            let height = (child.top + child.leftX) - (data.top + data.leftX)
            let absHeight = height ? Math.abs(height) : 2
            child.svg = this.createCurve(width, absHeight, -height)
            if (height) {
              child.svg.style.top = Math.round(height < 0 ? (child.top + child.leftX) : (data.top + data.leftX)) + 'px'
            } else {
              child.svg.style.top = Math.round(child.top + child.leftX - 1) + 'px'
            }
            child.svg.style.left = Math.round(data.left + data.rightX) + 'px'
          }
        }
        data.element.style.top = Math.round(data.top) + 'px'
        data.element.style.left = Math.round(data.left) + 'px'
      }
    },
    addNodeEventListener (node) {
      let child = node.querySelector('.mind-map-node-child')
      node.addEventListener('click', (event) => {
        if (this.currentChoose) {
          this.currentChoose.classList.remove('choose-node')
        }
        this.currentChoose = child
        this.currentChoose.classList.add('choose-node')
      })
      node.addEventListener('dblclick', (event) => {
        this.editNode(child)
      })
    },
    editNode (element) {
      element.style.userSelect = 'none'
      element.__editing = true
      element.setAttribute('contentEditable', true)
      element.style.userSelect = 'text'
      element.focus()
    },
    checkKeyPress (event) {
      console.log(event)
      if (!this.currentChoose) return
      if (this.currentChoose.__editing) {
        if (event.key === 'Enter') {
          this.currentChoose.setAttribute('contentEditable', false)
          this.currentChoose.__editing = false
          this.currentChoose.parentNode.data.name = this.currentChoose.innerText
          this.calNodePosition()
        }
        return
      }
      let element = this.currentChoose.parentNode
      let data = element.data
      if (event.key === 'Tab') {
        let child = this.newNode()
        let children = data.children || []
        this.$set(data, 'children', children)
        data.children.push(child)
        this.createElement(child)
        child.element.click()
        this.calNodePosition()
        child.element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
        // this.editNode(child.element.querySelector('.mind-map-node-child'))
      } else if (event.key === 'Enter') {
        if (!data.parentData) return
        let brother = this.newNode()
        let idx = data.parentData.children.findIndex(item => item === data)
        data.parentData.children.splice(idx + 1, 0, brother)
        this.createElement(brother)
        brother.element.click()
        this.calNodePosition()
        brother.element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
        // this.editNode(brother.element.querySelector('.mind-map-node-child'))
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        if (data.parentData) {
          let idx = data.parentData.children.findIndex(item => item === data)
          let choose
          if (event.key === 'ArrowUp' && idx > 0) {
            choose = data.parentData.children[idx - 1].element
          } else if (event.key === 'ArrowDown' && idx < data.parentData.children.length - 1) {
            choose = data.parentData.children[idx + 1].element
          }
          choose && choose.click()
        }
      } else if (event.key === 'ArrowLeft') {
        data.parentData && data.parentData.element.click()
      } else if (event.key === 'ArrowRight') {
        data.children && data.children.length && data.children[0].element.click()
      } else {
        return
      }
      event.preventDefault()
    },
    newNode () {
      let name = Math.random() < 0.5 ? '新节点' : '内容长长的新节点点点点点点点点点点点点点点点点点点点点点点点点点点点点点点点点点点点点点点点'
      return {
        id: this.id++,
        name
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
.root
  position fixed
  top 0
  left 0
  bottom 0
  right 0
  display flex
  padding 1rem
  .mindmap
    box-shadow 0 0 1px 0 #3361D8
    position relative
    flex auto
    margin-left 1rem
    border-radius 4px
    overflow auto
  .map-tree
    flex auto
    box-shadow 0 0 1px 0 #3361D8
    border-radius 4px
    display flex
    flex-direction column
    .tree
      flex auto
</style>

<style lang="stylus">
.mind-map-node
  position absolute
  // transition all .2s ease-in-out
  .mind-map-node-child
    white-space nowrap
    padding 4px .5rem
    border-radius 2px
    margin .5rem 1.5rem
    box-shadow 0 0 1px 1px #3361D8
    &.choose-node
      position relative
      background rgba(255, 255, 255, 1)
      z-index 1
      box-shadow 0 0 1px 2px #3361D8

svg
  position absolute
</style>
