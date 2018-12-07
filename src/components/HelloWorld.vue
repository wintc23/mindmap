<template>
  <div class="root">
    <div class="map-tree">
      <Button type="success" @click.stop="calNodePosition()">渲染</Button>
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
              id: '2'
            }
          ]
        }
      ]
    }
  },
  methods: {
    createCurve () {
      // 
    },
    calNodePosition () {
      this.createElements(this.treeData)
      this.calBoxPosition(this.treeData)
    },
    createElements (treeData) {
      for (let data of treeData) {
        this.createElement(data)
        if (data.children) {
          this.createElements(data.children)
        }
      }
    },
    createElement (data) {
      let element = data.element
      if (!element) {
        element = document.createElement('div')
      }
      element.classList.add('mind-map-node')
      element.innerText = data.name
      this.$refs.mindmap.appendChild(element)
      let rect = element.getBoundingClientRect()
      data.width = rect.width
      data.height = rect.height
      data.element = element
    },
    calBoxPosition (treeData) {
      for (let data of treeData) {
        if (data.children) {
          this.calBoxPosition(data.children)
          let height = 0
          let width = 0
          data.children.forEach(item => {
            width = Math.max(item.width, width)
            height = item.height + 16
          })
        } else {
          data.boxWidth = data.width
          data.boxHeight = data.height
        }
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
  box-shadow 0 0 1px 1px #3361D8
  padding 4px .5rem
  border-radius 2px
</style>
