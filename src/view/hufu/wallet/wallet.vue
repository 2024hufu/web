<template>
    <div class="wallet-container">
      <h1>钱包信息</h1>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="wallet-info" shadow="hover">
            <div class="balance-header">
              <i class="el-icon-wallet"></i>
              <span>账户余额</span>
            </div>
            <div class="balance-amount">
              <span class="currency">¥</span>
              <span class="amount">{{ walletInfo.balance.toFixed(2) }}</span>
            </div>
            <el-button type="primary" class="recharge-btn" @click="handleRecharge">充值</el-button>
          </el-card>
        </el-col>
        <el-col :span="16">
          <el-card class="transaction-list" shadow="hover">
            <template #header>
              <div class="clearfix">
                <span class="transaction-title">交易记录</span>
              </div>
            </template>
            <el-table :data="transactionData" style="width: 100%" :header-cell-style="{ background: '#f5f7fa' }">
              <el-table-column prop="date" label="日期" width="160"></el-table-column>
              <el-table-column prop="type" label="类型" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.amount > 0 ? 'success' : 'danger'" size="small">
                    {{ scope.row.type }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="amount" label="金额" width="120">
                <template #default="scope">
                  <span :class="scope.row.amount > 0 ? 'income' : 'expense'">
                    {{ scope.row.amount > 0 ? '+' : '' }}{{ scope.row.amount.toFixed(2) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="balance" label="余额" width="120">
                <template #default="scope">
                  {{ scope.row.balance.toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column prop="description" label="描述"></el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </template>
  
  
  <script setup>
  import { ref } from 'vue'
  
  defineOptions({
    name: 'Wallet'
  })
  
  const walletInfo = ref({
    balance: 1000.00,
    hufuCount: 5
  })
  
  const transactionData = ref([
    {
      date: '2023-04-20 14:30:00',
      type: '充值',
      amount: 500.00,
      balance: 1000.00,
      description: '支付宝充值'
    },
    {
      date: '2023-04-19 10:15:00',
      type: '消费',
      amount: -200.00,
      balance: 500.00,
      description: '购买虎符'
    },
    // 添加更多交易记录...
  ])
  
  const handleRecharge = () => {
    // 实现充值功能
    console.log('打开充值对话框')
  }
  </script>
  
  <style scoped>
  .wallet-container {
    padding: 20px;
  }
  
  .wallet-info {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .balance-header {
    display: flex;
    align-items: center;
    font-size: 18px;
    margin-bottom: 20px;
  }
  
  .balance-header i {
    font-size: 24px;
    margin-right: 10px;
    color: #409EFF;
  }
  
  .balance-amount {
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 20px;
  }
  
  .currency {
    font-size: 24px;
    margin-right: 5px;
  }
  
  .recharge-btn {
    align-self: flex-start;
  }
  
  .transaction-list {
    height: 100%;
  }
  
  .transaction-title {
    font-size: 18px;
    font-weight: bold;
  }
  
  .income {
    color: #67C23A;
    font-weight: bold;
  }
  
  .expense {
    color: #F56C6C;
    font-weight: bold;
  }
  
  .el-table {
    margin-top: 10px;
  }
  </style>