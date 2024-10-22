<template>
  <div class="billing-container">
    <h1>账单信息页面</h1>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>账单列表</span>
      </div>
      <el-table :data="bills" style="width: 100%">
        <el-table-column prop="date" label="日期" width="180"></el-table-column>
        <el-table-column prop="amount" label="金额" width="180"></el-table-column>
        <el-table-column prop="status" label="状态"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineOptions({
  name: 'Billing',
})

const bills = ref([
  { date: '2023-05-01', amount: '¥100', status: '已支付' },
  { date: '2023-05-02', amount: '¥200', status: '未支付' },
])
</script>

<style scoped>
.billing-container {
  padding: 20px;
}
</style>
