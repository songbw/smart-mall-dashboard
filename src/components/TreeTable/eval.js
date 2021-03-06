/**
 * @Author: jianglei
 * @Date:   2017-10-12 12:06:49
 */
'use strict'
import Vue from 'vue'

export default function treeToArray(data, expandAll, props, parent = null, level = null) {
  let tmp = []
  Array.from(data).forEach(function(record) {
    if (record._expanded === undefined) {
      Vue.set(record, '_expanded', expandAll)
    }
    let _level = 1
    if (level !== undefined && level !== null) {
      _level = level + 1
    }
    Vue.set(record, '_level', _level)
    // 如果有父元素
    if (parent) {
      Vue.set(record, 'parent', parent)
    }
    tmp.push(record)
    let children = 'children'
    if (props) {
      children = props.children || 'children'
    }
    if (record[children] && record[children].length > 0) {
      const sub = treeToArray(record[children], expandAll, props, record, _level)
      tmp = tmp.concat(sub)
    }
  })
  return tmp
}
