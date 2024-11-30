<template>
  <div class="dashboard-container">
    <!-- 收入概览卡片 -->
    <div class="overview-cards">
      <el-row :gutter="24">
        <el-col :span="6" v-for="(income, index) in incomeStats" :key="index">
          <el-card class="material-stat-card" shadow="never">
            <div class="stat-card-content">
              <div class="stat-icon-wrapper" :class="`icon-bg-${index}`">
                <el-icon :size="24">
                  <component :is="income.icon" />
                </el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">{{ income.title }}</div>
                <div class="stat-amount">¥{{ income.amount }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- <DashboardChart /> -->

    <!-- 最近转账 -->
    <el-row :gutter="24" class="dashboard-content">
      <el-col :span="24">
        <el-card class="recent-transfers material-card">
          <template #header>
            <div class="transfer-header">
              <span class="header-title title-with-bar">
                <el-icon class="title-icon"><Document /></el-icon>
                最近转账记录
              </span>
              <el-button 
                class="material-button"
                type="primary" 
                text
              >
                查看更多
              </el-button>
            </div>
          </template>
          
          <el-table 
            :data="recentTransfers" 
            style="width: 100%"
            :header-cell-style="{
              background: 'transparent',
              color: '#666',
              fontWeight: 500,
              fontSize: '14px'
            }"
            :cell-style="{
              padding: '16px 8px'
            }"
          >
            <el-table-column prop="date" label="日期" width="180">
              <template #default="{ row }">
                <span class="material-text">{{ row.date }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="customer" label="客户名称" width="180">
              <template #default="{ row }">
                <div class="material-chip"
                  :class="row.customer === '混币代理' ? 'chip-primary' : 'chip-default'"
                >
                  {{ row.customer }}
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="amount" label="金额">
              <template #default="{ row }">
                <span class="material-amount">{{ row.amount }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <div class="material-status-chip"
                  :class="getStatusClass(row.status)"
                >
                  {{ row.status }}
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="180">
              <template #default="scope">
                <el-button
                  class="material-button"
                  @click="handleCreateInvoice(scope.row)"
                  plain
                >
                  <el-icon class="material-icon"><Ticket /></el-icon>
                  开具发票
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>


    <!-- 添加开票对话框 -->
    <el-dialog title="开具发票" v-model="invoiceDialogVisible" width="800px">
      <el-form ref="invoiceForm" :model="invoiceForm" :rules="invoiceRules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发票类型" prop="invoice_type">
              <el-select v-model="invoiceForm.invoice_type" placeholder="请选择发票类型">
                <el-option label="增值税普通发票" value="normal" />
                <el-option label="增值税专用发票" value="special" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开票日期" prop="issue_date">
              <el-date-picker v-model="invoiceForm.issue_date" type="date" placeholder="选择开票日期" />
            </el-form-item>
          </el-col>
        </el-row>


        <el-divider content-position="left">销售方信息</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="销售方名称" prop="seller_name">
              <el-input v-model="invoiceForm.seller_name" placeholder="请输入销售方名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="销售方税号" prop="seller_tax_id">
              <el-input v-model="invoiceForm.seller_tax_id" placeholder="请输入销售方税号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">购买方信息</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="购买方名称" prop="buyer_name">
              <el-input v-model="invoiceForm.buyer_name" placeholder="请输入购买方名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="购买方税号" prop="buyer_tax_id">
              <el-input v-model="invoiceForm.buyer_tax_id" placeholder="请输入购买方税号" />
            </el-form-item>
          </el-col>
        </el-row>


        <el-divider content-position="left">商品信息</el-divider>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="商品名称" prop="item_name">
              <el-input v-model="invoiceForm.item_name" placeholder="请输入商品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="单价" prop="unit_price">
              <el-input-number v-model="invoiceForm.unit_price" :precision="2" :step="0.01" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="数量" prop="quantity">
              <el-input-number v-model="invoiceForm.quantity" :min="1" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="税率" prop="tax_rate">
              <el-input-number v-model="invoiceForm.tax_rate" :precision="2" :step="1" :max="100" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="税额" prop="tax_amount">
              <el-input-number v-model="invoiceForm.tax_amount" :precision="2"  />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="合计金额" prop="total_amount">
              <el-input-number v-model="invoiceForm.total_amount" :precision="2"  />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注" prop="remarks">
          <el-input type="textarea" v-model="invoiceForm.remarks" placeholder="请输入备注信息" />
        </el-form-item>

        <el-form-item label="接收邮箱" prop="email">
          <el-input v-model="invoiceForm.email" placeholder="请输入接收发票的邮箱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="invoiceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitInvoice">确认开票</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';
import DashboardChart from './chart.vue';
import { useUserStore } from '@/pinia/modules/user'
import { ref } from 'vue'

const userStore = useUserStore()

const walletInfo = ref({
  ID: 1,
  name: 'test',
  balance: 0,
  CreatedAt: '2024-01-01',
  UpdatedAt: '2024-01-01'
})

// 获取钱包信息
const getWalletInfo = async () => {
  try {
    const response = await axios.post('http://45.8.113.140:3338/api/v1/hufu/wallet/', {
      user_name: userStore.userInfo.userName
    })
    walletInfo.value = response.data.data
    console.log('钱包信息:', walletInfo.value)
  } catch (error) {
    console.error('获取钱包信息失败:', error)
    ElMessage.error('获取钱包信息失败')
  }
}

export default {
  name: 'Dashboard',
  components: {
    DashboardChart
  },
  data() {
    return {
      totalIncome: '0',
      dailyIncome: '0',
      weeklyIncome: '0',
      monthlyIncome: '0',
      recentTransfers: [],
      page: 1,
      pageSize: 10,
      invoiceDialogVisible: false,
      invoiceForm: {
        invoice_type: '',
        issue_date: new Date(),
        buyer_name: '',
        buyer_tax_id: '',
        seller_name: '',
        seller_tax_id: '',
        item_name: '',
        unit_price: 0,
        quantity: 1,
        amount: 0,
        tax_rate: 13,
        tax_amount: 0,
        total_amount: 0,
        invoice_status: 'pending',
        remarks: '',
        invoice_address: '',
        invoice_purpose: '',
        email: '',
        transactionId: '',
        customerId: '',
        buyer_address: '',
        buyer_phone: '',
        buyer_bank: '',
        buyer_bank_account: ''
      },
      invoiceRules: {
        type: [{ required: true, message: '请选择发票类型', trigger: 'change' }],
        title: [{ required: true, message: '请输入发票抬头', trigger: 'blur' }],
        taxNumber: [{ required: true, message: '请输入税号', trigger: 'blur' }],
        amount: [{ required: true, message: '请输入开票金额', trigger: 'blur' }],
        content: [{ required: true, message: '请输入发票内容', trigger: 'blur' }],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        buyer_name: [{ required: true, message: '请输入购买方名称', trigger: 'blur' }],
        buyer_tax_id: [{ required: true, message: '请输入购买方税号', trigger: 'blur' }],
        buyer_address: [{ required: true, message: '请输入购买方地址', trigger: 'blur' }],
        buyer_phone: [{ required: true, message: '请输入购买方电话', trigger: 'blur' }],
        buyer_bank: [{ required: true, message: '请输入开户银行', trigger: 'blur' }],
        buyer_bank_account: [{ required: true, message: '请输入银行账号', trigger: 'blur' }]
      }
    };
  },
  computed: {
    incomeStats() {
      return [
        { 
          title: '总收入', 
          amount: this.totalIncome, 
          icon: 'Money',
          trend: '+12%'
        },
        { 
          title: '今日收入', 
          amount: this.dailyIncome, 
          icon: 'Sunny',
          trend: '+5%'
        },
        { 
          title: '本周收入', 
          amount: this.weeklyIncome, 
          icon: 'Calendar',
          trend: '+8%'
        },
        { 
          title: '本月收入', 
          amount: this.monthlyIncome, 
          icon: 'TrendCharts',
          trend: '+15%'
        }
      ];
    }
  },
  async mounted() {
    await getWalletInfo()
    await this.fetchTransactions();
    await this.fetchIncomeStats();
  },
  methods: {
    async fetchIncomeStats() {
      try {
        const response = await axios.post('http://45.8.113.140:3338/api/v1/hufu/tx/stats', {
          wallet_id: walletInfo.value.ID,
        });
        if (response.data.code === 0) {
          const stats = response.data.data;
          this.totalIncome = stats.total_amount || '0';
          this.dailyIncome = stats.today_amount || '0';
          this.weeklyIncome = stats.week_amount || '0';
          this.monthlyIncome = stats.month_amount || '0';
        }
      } catch (error) {
        console.error('获取收入统计失败:', error);
        this.$message.error('获取收入统计失败');
      }
    },
    async fetchTransactions() {
      try {
        const response = await axios.post('http://45.8.113.140:3338/api/v1/hufu/tx/received', {
          wallet_id: walletInfo.value.ID,
        });
        if (response.data.code === 0) {
          this.recentTransfers = response.data.data.map(item => ({
            id: item.ID,
            date: new Date(item.CreatedAt).toLocaleDateString(),
            customer: item.from_wallet_id < 10 ? "混币代理" : `客户${item.from_wallet_id}`,
            amount: `¥${item.amount}`,
            status: this.getStatusText(item.status)
          }));
        }
      } catch (error) {
        console.error('获取交易记录失败:', error);
        this.$message.error('获取交易记录失败');
      }
    },
    getStatusText(status) {
      const statusMap = {
        0: '处理中',
        completed: '已完成',
        failed: '已失败'
      };
      return statusMap[status] || '未知状态';
    },
    handleCreateInvoice(row) {
      this.invoiceDialogVisible = true
      this.invoiceForm = {
        type: '',
        title: '',
        taxNumber: '',
        amount: parseFloat(row.amount.replace('¥', '')),
        content: `交易号：${row.id}的收款`,
        email: row.customer === "混币代理" ? "proxy@hufu.com" : "",
        transactionId: row.id,
        customerId: row.customer
      }
    },
    handleSubmitInvoice() {
      this.$refs.invoiceForm.validate(async (valid) => {
        if (valid) {
          try {
            // 这里调用后端开票接口
            await axios.post('http://45.8.113.140:3338/api/v1/hufu/invoice/create', this.invoiceForm)
            this.$message.success('开票申请提交成功')
            this.invoiceDialogVisible = false
          } catch (error) {
            this.$message.error('开票失败：' + error.message)
          }
        }
      })
    },
    calculateInvoiceAmounts() {
      const amount = this.invoiceForm.unit_price * this.invoiceForm.quantity;
      const taxAmount = amount * (this.invoiceForm.tax_rate / 100);
      this.invoiceForm.amount = amount;
      this.invoiceForm.tax_amount = taxAmount;
      this.invoiceForm.total_amount = amount + taxAmount;
    },
    getStatusClass(status) {
      const statusMap = {
        '处理中': 'status-processing',
        '已完成': 'status-completed',
        '已失败': 'status-failed'
      };
      return statusMap[status] || 'status-default';
    }
  }
};
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.overview-cards {
  margin-bottom: 32px;
}

.material-stat-card {
  background: white;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  height: 120px;
  display: flex;
  align-items: center;
}

.material-stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stat-card-content {
  display: flex;
  align-items: center;
  padding: 20px;
  width: 100%;
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: white;
}

.icon-bg-0 {
  background: linear-gradient(135deg, #1976d2, #64b5f6);
}

.icon-bg-1 {
  background: linear-gradient(135deg, #2e7d32, #81c784);
}

.icon-bg-2 {
  background: linear-gradient(135deg, #f57c00, #ffb74d);
}

.icon-bg-3 {
  background: linear-gradient(135deg, #7b1fa2, #ba68c8);
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 8px;
  font-weight: 500;
}

.stat-amount {
  font-size: 24px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  font-family: 'Roboto', sans-serif;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.dashboard-content {
  margin-top: 20px;
}

.recent-transfers {
  margin-bottom: 24px;
  border-radius: 8px;
}

.transfer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #303133;
}

.date-cell {
  color: #606266;
}

.amount-cell {
  font-family: "DIN Alternate", "Arial", sans-serif;
  font-weight: 600;
  color: #67c23a;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table__row) {
  transition: all 0.3s ease;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa !important;
  transform: translateX(5px);
}

:deep(.el-table th) {
  font-weight: 600;
  color: #606266;
  background: #f5f7fa;
}

:deep(.el-button) {
  transition: all 0.3s;
}

:deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

/* Material Design 样式 */
.material-card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.05), 
              0 3px 6px rgba(0,0,0,0.08);
  border: none;
  transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.material-card:hover {
  box-shadow: 0 8px 16px rgba(0,0,0,0.12), 
              0 4px 8px rgba(0,0,0,0.06);
}

.transfer-header {
  padding: 16px;
}

.header-title {
  font-size: 20px;
  font-weight: 500;
  color: rgba(0,0,0,0.87);
  display: flex;
  align-items: center;
  gap: 12px;
}

.material-text {
  color: rgba(0,0,0,0.87);
  font-size: 14px;
}

.material-chip {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chip-primary {
  background: rgba(25, 118, 210, 0.08);
  color: #1976d2;
}

.chip-default {
  background: rgba(0, 0, 0, 0.08);
  color: rgba(0, 0, 0, 0.87);
}

.material-amount {
  font-family: 'Roboto Mono', monospace;
  font-size: 15px;
  font-weight: 500;
  color: #2e7d32;
}

.material-status-chip {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-processing {
  background: rgba(255, 152, 0, 0.08);
  color: #f57c00;
}

.status-completed {
  background: rgba(76, 175, 80, 0.08);
  color: #43a047;
}

.status-failed {
  background: rgba(244, 67, 54, 0.08);
  color: #e53935;
}

.material-button {
  height: 36px;
  padding: 0 16px;
  border-radius: 4px;
  font-weight: 500;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.material-button:hover {
  background: rgba(25, 118, 210, 0.04);
}

.material-button:active {
  background: rgba(25, 118, 210, 0.12);
}

.material-icon {
  margin-right: 8px;
  font-size: 18px;
}

:deep(.el-table) {
  border: none;
}

:deep(.el-table__row) {
  transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.el-table__row:hover) {
  background-color: rgba(0, 0, 0, 0.04) !important;
}

:deep(.el-table th) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  background: transparent;
}

:deep(.el-table td) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .material-stat-card {
    background: #1e1e1e;
  }

  .stat-title {
    color: rgba(255, 255, 255, 0.7);
  }

  .stat-amount {
    color: rgba(255, 255, 255, 0.9);
  }
}

:deep(.el-card__header) {
  border-bottom: 1px solid rgba(0,0,0,0.12);
  padding: 0;
}

.title-with-bar {
  position: relative;
  padding-left: 12px;
}

.title-with-bar::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background: #1976d2;
  border-radius: 2px;
}
</style>
