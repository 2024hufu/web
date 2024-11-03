<template>
    <div class="transaction-page">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="transaction-form">
            <template #header>
              <div class="card-header">
                <span>获取交易记录</span>
                <el-icon class="header-icon"><Search /></el-icon>
              </div>
            </template>
  
            <el-form :model="formData" ref="formRef" label-width="120px">
              <el-form-item label="钱包ID" prop="wallet_id">
                <el-input 
                  v-model="formData.wallet_id" 
                  placeholder="请输入钱包ID"
                  :prefix-icon="Wallet"
                />
              </el-form-item>
              
              <el-form-item label="私钥" prop="private_key">
                <el-input 
                  v-model="formData.private_key"
                  placeholder="请输入私钥"
                  :prefix-icon="Lock"
                  type="password"
                  show-password
                />
              </el-form-item>
  
              <el-form-item>
                <el-button 
                  type="primary" 
                  @click="fetchTransactions"
                  :icon="Search"
                  class="submit-button"
                >
                  获取交易
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
  
        <el-col :span="16">
          <el-card v-if="transactions.length" class="transaction-list">
            <template #header>
              <div class="card-header">
                <span>交易记录</span>
                <el-tag type="info" class="record-count">
                  共 {{ transactions.length }} 条记录
                </el-tag>
              </div>
            </template>
  
            <el-table 
              :data="transactions" 
              style="width: 100%"
              :stripe="true"
              :border="true"
              highlight-current-row
            >
              <el-table-column prop="ID" label="交易ID" width="80" />
              <el-table-column prop="from_wallet_id" label="发送钱包ID" width="120" />
              <el-table-column prop="to_wallet_id" label="接收钱包ID" width="120" />
              <el-table-column prop="amount" label="金额" width="120">
                <template #default="scope">
                  {{ formatAmount(scope.row.amount) }}
                </template>
              </el-table-column>
              <el-table-column prop="CreatedAt" label="创建时间" width="180">
                <template #default="scope">
                  {{ formatTime(scope.row.CreatedAt) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag
                    :type="scope.row.status === 'completed' ? 'success' : 'danger'"
                  >
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue'
  import axios from 'axios'
  import { ElMessage } from 'element-plus'
  import dayjs from 'dayjs'
  import { Search, Wallet, Lock } from '@element-plus/icons-vue'
  
  const formRef = ref(null)
  const formData = reactive({
    wallet_id: '',
    private_key: ''
  })
  
  const transactions = ref([])
  
  const fetchTransactions = async () => {
    if (!formData.wallet_id || !formData.private_key) {
      ElMessage.warning('请填写完整信息')
      return
    }
  
    try {
      const response = await axios.post('http://45.8.113.140:3338/api/v1/hufu/tx/encrypted', {
        wallet_id: parseInt(formData.wallet_id, 10),
        private_key: formData.private_key
      })
  
      if (response.data.code === 0) {
        transactions.value = response.data.data || []
        if (transactions.value.length === 0) {
          ElMessage.info('暂无交易记录')
        } else {
          ElMessage.success(`成功获取 ${transactions.value.length} 条交易记录`)
        }
      } else {
        ElMessage.error(response.data.message || '获取交易失败')
      }
    } catch (error) {
      console.error(error)  
      ElMessage.error('获取交易失败，请检查网络连接')
    }
  }
  
  const formatAmount = (amount) => {
    if (!amount) return '0.00'
    return `${Number(amount).toFixed(2)}`
  }
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '-'
    return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
  }
  </script>
  
  <style scoped>
  .transaction-page {
    padding: 24px;
    min-height: 100vh;
    background-color: #f5f7fa;
  }
  
  .transaction-form, .transaction-list {
    height: 100%;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
  }
  
  .card-header span {
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
  }
  
  .header-icon {
    font-size: 20px;
    color: #409EFF;
  }
  
  .submit-button {
    width: 100%;
    padding: 12px;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 1px;
    border-radius: 8px;
  }
  
  .record-count {
    font-size: 14px;
    padding: 6px 12px;
    border-radius: 16px;
  }
  
  :deep(.el-input__wrapper) {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
  
  :deep(.el-input__wrapper:hover) {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
  
  :deep(.el-table) {
    border-radius: 8px;
    overflow: hidden;
  }
  
  :deep(.el-table th) {
    background-color: #f5f7fa;
    font-weight: 600;
    color: #2c3e50;
  }
  
  :deep(.el-table--striped .el-table__row--striped td) {
    background-color: #fafafa;
  }
  
  :deep(.el-tag) {
    padding: 4px 12px;
    height: 28px;
    line-height: 20px;
    border-radius: 14px;
    font-weight: 500;
  }
  
  :deep(.el-tag--success) {
    background-color: #f0f9eb;
    border-color: #e1f3d8;
    color: #67c23a;
  }
  
  :deep(.el-tag--danger) {
    background-color: #fef0f0;
    border-color: #fde2e2;
    color: #f56c6c;
  }
  
  :deep(.el-tag--info) {
    background-color: #f4f4f5;
    border-color: #e9e9eb;
    color: #909399;
  }
  
  @media (max-width: 768px) {
    .el-row {
      margin: 0 !important;
    }
    
    .el-col {
      padding: 0 !important;
    }
    
    .transaction-form, .transaction-list {
      margin-bottom: 20px;
    }
  }
  </style>
  