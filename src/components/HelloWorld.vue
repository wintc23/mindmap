<template>
  <div class="root">
    <div class="map-tree">
      <Button type="success" @click.stop="calNodePosition()">渲染</Button>
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
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data () {
    return {
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
  mounted () {
    document.addEventListener('keydown', this.checkKeyPress)
  },
  beforeDestroy () {
    document.removeEventListener('keydown', this.checkKeyPress)
  },
  methods: {
    drawCurve (x = 0, y = 0) {
      let svg = this.createCurve(100, 150, 1)
      svg.style.top = y + 'px'
      svg.style.left = x + 'px'
    },
    createCurve (width, height, k = -1) {
      let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('width', width)
      svg.setAttribute('height', height)
      let path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      let d = k < 0 ? `M0,0 C${width/2},0 ${width/2},${height} ${width},${height}` : `M0,${height} C${width/2},${height}, ${width/2},0 ${width},0`
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
      this.fixPosition(this.treeData, 0, 0)
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
        // child.style.padding = '4px .5rem'
        // child.style.borderRadius = '2px'
        // child.style.margin = '.5rem'
        // child.style.boxShadow = '0 0 1px 1px #3361D8'
        child.classList.add('mind-map-node-child')
        data.element.appendChild(child)
        data.element.data = data
        data.element.style.opacity = 0
        this.$refs.mindmap.appendChild(data.element)
        this.addNodeEventListener(child)
      }
      let child = data.element.querySelector('.mind-map-node-child')
      child.innerText = data.name
    },
    calBoxPosition (treeData) {
      for (let data of treeData) {
        let rect = data.element.getBoundingClientRect()
        if (data.children) {
          this.calBoxPosition(data.children)
          let height = 0
          let width = 0
          data.children.forEach(item => {
            width = Math.max(item.boxWidth, width)
            height += item.boxHeight
          })
          data.boxWidth = width + rect.width
          data.boxHeight = height
        } else {
          data.boxWidth = rect.width
          data.boxHeight = rect.height
        }
      }
    },
    fixPosition (treeData, top, left) {
      let childTop = top
      for (let data of treeData) {
        let rect = data.element.getBoundingClientRect()
        // console.log(childTop + (data.boxHeight - rect.height) / 2)
        data.left = left
        data.top = childTop + (data.boxHeight - rect.height) / 2
        data.element.style.left = data.left + 'px'
        data.element.style.top = data.top + 'px'
        data.element.style.opacity = 1
        if (data.children) {
          this.fixPosition(data.children, childTop, left + rect.width)
          for (let child of data.children) {
            let childRect = child.element.getBoundingClientRect()
            let width = 48
            let height = Math.abs(child.top - data.top)
            let svgTop = Math.min(data.top + rect.height /2, child.top + childRect.height/2) 
            let svgLeft = data.left + rect.width - 24
            if (child.svg) {
              child.svg.parentNode.removeChild(child.svg)
            }
            console.log(width, height, child.top, data.top, data.left)
            child.svg = this.createCurve(width, height, (data.top + rect.height /2) - (child.top + childRect.height/2))
            child.svg.style.top = svgTop + 'px'
            child.svg.style.left = svgLeft + 'px'
            child.svg.style.position = 'absolute'
          }
        }
        childTop += data.boxHeight
      }
    },
    addNodeEventListener (node) {
      node.addEventListener('click', (event) => {
        if (this.currentChoose) {
          this.currentChoose.classList.remove('choose-node')
        }
        this.currentChoose = node
        this.currentChoose.classList.add('choose-node')
      })
    },
    checkKeyPress (event) {
      console.log(event)
      if (!this.currentChoose) return
      let element = this.currentChoose.parentNode
      let data = element.data
      if (event.key === 'Tab') {
        let child = this.newNode()
        data.children = data.children || []
        data.children.push(child)
        this.createElement(child)
      } else if (event.key === 'Enter') {
        let brother = this.newNode()
        data.parentData.children.push(brother)
        this.createElement(brother)
      } else {
        return
      }
      event.preventDefault()
      this.calNodePosition(this.treeData)
      this.fixPosition(this.treeData)
    },
    newNode () {
      return {
        id: this.id++,
        name: '新节点'
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
    padding 4px .5rem
    border-radius 2px
    margin .5rem 1.5rem
    box-shadow 0 0 1px 1px #3361D8
    &.choose-node
      box-shadow 0 0 1px 2px #3361D8
svg
  position absolute
</style>
