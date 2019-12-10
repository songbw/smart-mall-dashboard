import Vue from 'vue'

import ELEMENT from 'element-ui'

import '@/styles/index.scss' // global css

if (!window.ELEMENT) Vue.use(ELEMENT)
