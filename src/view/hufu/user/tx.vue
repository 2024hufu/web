<template>
    <div class="page-container">
        <el-card class="transaction-card" :body-style="{ padding: '0px' }">
            <div class="card-header">
                <h2 class="title title-with-bar">交易记录</h2>
                <div class="header-actions">
                    <el-input
                        v-model="searchQuery"
                        placeholder="搜索交易..."
                        prefix-icon="el-icon-search"
                        class="search-input"
                    />
                </div>
            </div>

            <div class="transactions-container">
                <el-table 
                    :data="transactionList" 
                    border 
                    style="width: 100%" 
                    v-loading="loading"
                    :header-cell-style="{
                        background: '#f5f7fa',
                        color: '#606266',
                        fontWeight: '600'
                    }"
                    :row-class-name="tableRowClassName"
                >
                    <el-table-column prop="ID" label="交易ID" width="100">
                        <template #default="{ row }">
                            <span class="id-text">{{ row.ID }}</span>
                        </template>
                    </el-table-column>

                    <el-table-column prop="CreatedAt" label="日期" width="250">
                        <template #default="{ row }">
                            {{ formatDate(row.CreatedAt) }}
                        </template>
                    </el-table-column>

                    <el-table-column prop="from_username" label="付款方" width="160">
                        <template #default="{ row }">
                            {{ `${row.from_username} (钱包ID: ${row.from_wallet_id})` }}
                        </template>
                    </el-table-column>

                    <el-table-column prop="to_username" label="收款方" width="200">
                        <template #default="{ row }">
                            {{ `${row.to_username} (钱包ID: ${row.to_wallet_id})` }}
                        </template>
                    </el-table-column>

                    <el-table-column prop="amount" label="交易金额" min-width="120">
                        <template #default="{ row }">
                            {{ row.amount }}
                        </template>
                    </el-table-column>

                    <el-table-column prop="status" label="交易状况" min-width="100">
                        <template #default="{ row }">
                            <el-tag :type="getStatusType(row.status)">
                                {{ getStatusText(row.status) }}
                            </el-tag>
                        </template>
                    </el-table-column>

                    <el-table-column prop="type" label="交易类型" min-width="120">
                        <template #default="{ row }">
                            {{ getTypeText(row.type) }}
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" min-width="200">
                        <template #default="{ row }">
                            <el-button 
                                class="action-button view-button" 
                                size="small" 
                                @click="handleView(row)"
                            >
                                <el-icon><View /></el-icon>
                                查看
                            </el-button>
                            <el-button 
                                class="action-button edit-button" 
                                size="small" 
                                type="primary" 
                                @click="handleEdit(row)"
                            >
                                <el-icon><Edit /></el-icon>
                                编辑
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <div class="pagination-container">
                <el-pagination
                    background
                    layout="total, sizes, prev, pager, next"
                    :total="total"
                    :page-size="pageSize"
                    :current-page="currentPage"
                    :page-sizes="[10, 20, 50, 100]"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
        </el-card>
    </div>
</template>

<script>
import axios from 'axios'
import dayjs from 'dayjs'
import { useUserStore } from '@/pinia/modules/user'
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { View, Edit } from '@element-plus/icons-vue'
const userStore = useUserStore()


export default {
    name: 'Transactions',
    components: {
        View,
        Edit
    },
    setup() {
        const walletInfo = ref({
            ID: null,
            name: '',
            balance: 0,
            CreatedAt: '',
            UpdatedAt: ''
        })
        const transactionList = ref([])
        const loading = ref(false)
        const total = ref(0)
        const currentPage = ref(1)
        const pageSize = ref(10)
        const searchQuery = ref('')

        const tableRowClassName = ({ row, rowIndex }) => {
            return rowIndex % 2 === 0 ? 'even-row' : 'odd-row'
        }

        // 获取交易列表
        const getTransactionList = async () => {
            try {
                loading.value = true
                const response = await axios.post('http://45.8.113.140:3338/api/v1/hufu/tx/history', {
                    wallet_id: walletInfo.value.ID,
                    page: currentPage.value,
                    page_size: pageSize.value,
                })

                if (response.data.code === 0) {
                    transactionList.value = response.data.data.list || []
                    total.value = response.data.data.total || 0
                }
            } catch (error) {
                console.error('获取交易列表失败:', error)
                ElMessage.error('获取交易列表失败')
            } finally {
                loading.value = false
            }
        }

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

        const handleSizeChange = (val) => {
            pageSize.value = val
            currentPage.value = 1
            getTransactionList()
        }

        const handleCurrentChange = (val) => {
            currentPage.value = val
            getTransactionList()
        }

        onMounted(async () => {
            try {
                await getWalletInfo()
                await getTransactionList()
            } catch (error) {
                console.error('初始化数据失败:', error)
                ElMessage.error('初始化数据失败')
            }
        })

        // 返回��要在模板中使用的数据和方法
        return {
            transactionList,
            loading,
            total,
            currentPage,
            pageSize,
            handleSizeChange,
            handleCurrentChange,
            formatDate(date) {
                return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
            },
            getStatusText(status) {
                const statusMap = {
                    completed: '已完成',
                    pending: '处理中',
                    failed: '失败',
                }
                return statusMap[status] || status
            },
            getStatusType(status) {
                const statusMap = {
                    completed: 'success',
                    pending: 'warning',
                    failed: 'danger',
                }
                return statusMap[status] || 'info'
            },
            getTypeText(type) {
                const typeMap = {
                    direct: '直接转账',
                }
                return typeMap[type] || type
            },
            handleView(row) {
                console.log('查看交易详情', row)
            },
            handleEdit(row) {
                console.log('编辑交易', row)
            },
            searchQuery,
            tableRowClassName,
        }
    }
}
</script>

<style scoped>
.page-container {
    padding: 24px;
    background-color: #f0f2f5;
    min-height: calc(100vh - 84px);
}

.transaction-card {
    border-radius: 8px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03), 
                0 1px 6px -1px rgba(0, 0, 0, 0.02), 
                0 2px 4px 0 rgba(0, 0, 0, 0.02);
}

.card-header {
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
}

.title {
    margin: 0;
    color: #1f2937;
    font-weight: 500;
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

.header-actions {
    display: flex;
    gap: 16px;
}

.search-input {
    width: 250px;
}

.transactions-container {
    padding: 24px;
}

/* 表格样式 */
.even-row {
    background-color: #fafafa;
}

.odd-row {
    background-color: #ffffff;
}

/* 操作按钮样式 */
.action-button {
    margin: 0 4px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    transition: all 0.3s;
}

.view-button {
    color: #606266;
}

.view-button:hover {
    color: #409eff;
    background-color: #ecf5ff;
}

.edit-button {
    background-color: #409eff;
}

.edit-button:hover {
    background-color: #66b1ff;
}

/* 状态标签样式 */
:deep(.el-tag) {
    border-radius: 4px;
    padding: 0 12px;
    height: 28px;
    line-height: 26px;
}

/* 分页容器样式 */
.pagination-container {
    padding: 16px 24px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    justify-content: flex-end;
}

/* ID文本样式 */
.id-text {
    color: #1f2937;
    font-family: 'Roboto Mono', monospace;
}
</style>