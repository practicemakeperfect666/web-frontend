<script setup>
import { store, setAccount } from '../store'
</script>

<template>
  <el-radio-group :model-value="store.currentAccount" @update:model-value="setAccount" size="small">
    <el-radio-button value="all">全部</el-radio-button>
    <el-radio-button value="real">实盘</el-radio-button>
    <el-radio-button value="simnow">模拟</el-radio-button>
  </el-radio-group>
</template>
