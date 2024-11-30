<template>
  <div class="transaction-page">
    <el-row>
      <el-col :span="24">
        <el-card class="transaction-form">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <span class="title-with-bar">获取加密交易记录</span>
                <el-icon class="header-icon"><Search /></el-icon>
              </div>
            </div>
          </template>

          <el-form :model="formData" ref="formRef" label-width="120px" class="search-form">
            <el-row :gutter="30">
              <el-col :span="14">
                <el-form-item label="钱包私钥" prop="private_key">
                  <el-input 
                    v-model="formData.private_key"
                    placeholder="请输入私钥"
                    :prefix-icon="Lock"
                    type="textarea"
                    :rows="8"
                    resize="none"
                    show-password
                    class="private-key-input"
                  />
                </el-form-item>
              </el-col>
              
              <el-col :span="10">
                <div class="right-form-content">
                  <el-form-item label="钱包ID" prop="wallet_id">
                    <el-input 
                      v-model="formData.wallet_id" 
                      placeholder="请输入钱包ID"
                      :prefix-icon="Wallet"
                      class="wallet-id-input"
                    />
                  </el-form-item>

                  <el-form-item class="submit-form-item">
                    <el-button 
                      type="primary" 
                      @click="fetchTransactions"
                      :icon="Search"
                      class="submit-button"
                    >
                      获取交易记录
                    </el-button>
                  </el-form-item>
                </div>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="margin-top: 24px">
      <el-col :span="24">
        <el-card v-if="transactions.length" class="transaction-list">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <span>交易记录</span>
                <el-tag type="success" effect="dark" class="record-count">
                  共 {{ transactions.length }} 条记录
                </el-tag>
              </div>
              <el-button 
                type="primary"
                @click="decryptAllData"
                :loading="decrypting"
                class="decrypt-button"
                v-if="!showDecrypted"
              >
                <el-icon><Lock /></el-icon>
                解密数据
              </el-button>
            </div>
          </template>

          <!-- 交易记录表格 -->
          <div class="table-container">
            <!-- 加密数据表格 -->
            <div class="encrypted-table">
              <div class="table-title">
                <el-icon><Lock /></el-icon>
                <span>加密数据</span>
              </div>
              <el-table 
                :data="transactions" 
                style="width: 100%"
                :stripe="true"
                :border="true"
              >
                <el-table-column prop="transaction_id" label="交易ID" width="120" fixed />
                <el-table-column prop="encrypted_from_wallet_id" label="加密发送方钱包ID" min-width="250">
                  <template #default="scope">
                    {{ scope.row.encrypted_from_wallet_id?.substring(0, 100) + '...' }}
                  </template>
                </el-table-column>
                <el-table-column prop="encrypted_to_wallet_id" label="加密接收方钱包ID" min-width="250">
                  <template #default="scope">
                    {{ scope.row.encrypted_to_wallet_id?.substring(0, 100) + '...' }}
                  </template>
                </el-table-column>
                <el-table-column prop="encrypted_amount" label="加密金额" min-width="250">
                  <template #default="scope">
                    {{ scope.row.encrypted_amount?.substring(0, 100) + '...' }}
                  </template>
                </el-table-column>
                <el-table-column prop="CreatedAt" label="创建时间" width="180" fixed="right">
                  <template #default="scope">
                    {{ formatTime(scope.row.CreatedAt) }}
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 解密后的数据表格 -->
            <div v-if="showDecrypted" class="decrypted-table">
              <div class="table-title">
                <el-icon><Unlock /></el-icon>
                <span>解密数据</span>
              </div>
              <el-table 
                :data="decryptedTransactions" 
                style="width: 100%"
                :stripe="true"
                :border="true"
              >
                <el-table-column prop="transaction_id" label="交易ID" width="120" fixed />
                <el-table-column prop="from_wallet_id" label="发送方钱包ID" min-width="250" />
                <el-table-column prop="to_wallet_id" label="接收方钱包ID" min-width="250" />
                <el-table-column prop="amount" label="金额" min-width="250">
                  <template #default="scope">
                    {{ formatAmount(scope.row.amount) }}
                  </template>
                </el-table-column>
                <el-table-column prop="CreatedAt" label="创建时间" width="180" fixed="right">
                  <template #default="scope">
                    {{ formatTime(scope.row.CreatedAt) }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
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
  import { Search, Wallet, Lock, Unlock } from '@element-plus/icons-vue'
  
  const formRef = ref(null)
  const formData = reactive({
    wallet_id: '',
    private_key: ''
  })
  
  const transactions = ref([])
  const decrypting = ref(false)
  const showDecrypted = ref(false)
  const decryptedTransactions = ref([])
  
  const fetchTransactions = async () => {
    if (!formData.wallet_id || !formData.private_key) {
      ElMessage.warning('请填写完整信息')
      return
    }
  
    try {
      const response = await axios.post('http://45.8.113.140:3338/api/v1/hufu/tee/encrypted-history', {
        id: formData.wallet_id,
        private_key: formData.private_key
      })

      // 检查是否有错误返回
      if (response.data.error) {
        ElMessage.error(response.data.error)
        return
      }

      console.log('response.data')
      console.log(response.data)

      transactions.value = response.data || []

      if (transactions.value.length === 0) {
        ElMessage.info('暂无交易记录')
      } else {
        ElMessage.success(`成功获取 ${transactions.value.length} 条交易记录`)
      }


    } catch (error) {
      console.error(error)
      if (error.response) {
        switch (error.response.status) {
          case 400:
            ElMessage.error('请求格式错误：' + error.response.data.error)
            break
          case 401:
            ElMessage.error('私钥验证失败')
            break
          case 404:
            ElMessage.error(error.response.data.error)
            break
          default:
            ElMessage.error('获取交易失败：' + error.response.data.error)
        }
      } else {
        ElMessage.error('获取交易失败，请检查网络连接')
      }
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
  
  const decryptAllData = async () => {
    if (decrypting.value) return
    decrypting.value = true
    
    try {
      const response = await axios.post('http://45.8.113.140:3338/api/v1/hufu/tee/decrypt-history', {
        id: formData.wallet_id,
        private_key: formData.private_key
      })

      if (response.data.error) {
        ElMessage.error(response.data.error)
        return
      }

      // 将解密后的数据与原始加密数据合并
      decryptedTransactions.value = transactions.value.map((tx, index) => ({
        ...tx,
        from_wallet_id: response.data[index]?.from,
        to_wallet_id: response.data[index]?.to,
        amount: response.data[index]?.amount,
        decrypted_create_at: response.data[index]?.create_at
      }))

      showDecrypted.value = true
      ElMessage.success(`成功解密 ${response.data.length} 条记录`)

    } catch (error) {
      console.error(error)
      ElMessage.error('解密失败：' + (error.response?.data?.error || '请检查网络连接'))
    } finally {
      decrypting.value = false
    }
  }
  </script>
  
  <style scoped>
  .transaction-page {
    padding: 24px;
    min-height: calc(100vh - 48px);
    background-color: #f5f7fa;
  }
  
  .transaction-form, .transaction-list {
    height: 100%;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
  }
  
  .transaction-form:hover, .transaction-list:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .card-header span {
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
    letter-spacing: 0.5px;
  }
  
  .header-icon {
    font-size: 22px;
    color: #409EFF;
  }
  
  .search-form {
    padding: 20px 0;
  }
  
  .private-key-input :deep(.el-textarea__inner) {
    border-radius: 12px;
    padding: 12px;
    font-family: monospace;
    background-color: #fafafa;
    transition: all 0.3s ease;
  }
  
  .private-key-input :deep(.el-textarea__inner:focus) {
    background-color: #fff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
  }
  
  .wallet-id-input :deep(.el-input__wrapper) {
    border-radius: 12px;
    padding: 8px 16px;
    background-color: #fafafa;
  }
  
  .right-form-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .submit-form-item {
    margin-top: auto;
    margin-bottom: 0;
  }
  
  .submit-button {
    width: 100%;
    height: 44px;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 1px;
    border-radius: 12px;
    transition: all 0.3s ease;
  }
  
  .decrypt-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 500;
  }
  
  .record-count {
    margin-left: 12px;
    padding: 6px 16px;
    border-radius: 20px;
    font-weight: 500;
  }
  
  :deep(.el-table) {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  }
  
  :deep(.el-table th) {
    background-color: #f8fafd;
    font-weight: 600;
    color: #1a1a1a;
    padding: 16px 12px;
  }
  
  :deep(.el-table td) {
    padding: 16px 12px;
  }
  
  :deep(.el-table--striped .el-table__row--striped td) {
    background-color: #fafbfd;
  }
  
  /* 响应式优化 */
  @media (max-width: 768px) {
    .transaction-page {
      padding: 16px;
    }
    
    .el-row {
      margin: 0 !important;
    }
    
    .el-col {
      padding: 0 !important;
    }
    
    .card-header span {
      font-size: 18px;
    }
    
    .submit-button {
      height: 40px;
      font-size: 15px;
    }
  }
  
  /* 添加新的样式 */
  .table-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .encrypted-table,
  .decrypted-table {
    background-color: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  }
  
  .table-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;
  }
  
  .table-title .el-icon {
    font-size: 18px;
    color: #409EFF;
  }
  
  .table-title span {
    font-size: 16px;
    font-weight: 500;
    color: #1a1a1a;
  }
  
  .decrypted-table {
    border: 1px solid #67c23a;
    position: relative;
  }
  
  .decrypted-table::before {
    content: '';
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 12px solid transparent;
    border-right: 12px solid transparent;
    border-bottom: 12px solid #67c23a;
  }
  
  .title-with-bar {
    position: relative;
    padding-left: 12px;
    font-size: 20px;
    font-weight: bold;
    color: #333;
  }
  
  .title-with-bar::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 20px;
    background-color: #409EFF;
    border-radius: 2px;
  }
  </style>
  