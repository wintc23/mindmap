<template>
  <div class="root">
    <div class="setting">
      <div>节点数量</div>
      <InputNumber class="input" v-model="nodeNum" size = "small"/>
      <Button type="success" @click.stop="render" size = "small">渲染</Button>
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
      nodeNum: 100
    }
  },
  created () {
    // 
  },
  mounted () {
    this.manager = new NodeManager()
    let data = this.manager.generateFake(this.nodeNum)
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
    render () {
      if (this.manager) {
        let data = this.manager.generateFake(this.nodeNum)
        this.manager.proxy(this.$refs.mindmap, data)
        this.$Message.success('渲染完成')
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
  flex-direction column
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
  .setting
    display flex
    align-items center
    justify-content center
    padding .5rem
    .input
      margin 0 .5rem
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
