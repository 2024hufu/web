<template>
    <div class="wallet-container">
        <!-- 钱包信息卡片 -->
        <el-row :gutter="20">
            <el-col :span="8">
                <el-card class="wallet-card" shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <span>钱包信息</span>
                            <el-button type="primary" link @click="handleEdit">
                                编辑名称
                            </el-button>
                        </div>
                    </template>
                    <div class="wallet-info">
                        <div class="info-item">
                            <span class="label">钱包ID：</span>
                            <span class="value">{{ walletInfo.ID }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">用户名：</span>
                            <span class="value">{{ walletInfo.user_name }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">钱包名称：</span>
                            <span class="value">{{ walletInfo.wallet_name }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">创建时间：</span>
                            <span class="value">{{ formatDate(walletInfo.CreatedAt) }}</span>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <el-col :span="8">
                <el-card class="balance-card" shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <span>账户余额</span>
                        </div>
                    </template>
                    <div class="balance-info">
                        <div class="balance-amount">
                            {{ formatBalance(walletInfo.balance) }}
                        </div>
                        <div class="balance-actions">
                            <el-button type="primary" @click="handleTransfer">转账</el-button>
                            <el-button type="success" @click="handleReceive">收款</el-button>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <el-col :span="8">
                <el-card class="stats-card" shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <span>交易统计</span>
                        </div>
                    </template>
                    <div class="stats-info">
                        <div class="stats-item">
                            <div class="stats-label">今日交易</div>
                            <div class="stats-value">{{ stats.todayCount || 0 }}</div>
                        </div>
                        <div class="stats-item">
                            <div class="stats-label">总交易次数</div>
                            <div class="stats-value">{{ stats.totalCount || 0 }}</div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="24">
                <TransactionsChart :wallet-id="walletInfo.ID" />
            </el-col>
        </el-row>

        <!-- 转账弹窗 -->
        <el-dialog v-model="transferDialogVisible" title="安全转账" width="500px">
            <el-form :model="transferForm" :rules="transferRules" ref="transferFormRef" label-width="100px">
                <!-- 转账信息部分 -->
                <div class="transfer-content">
                    <el-form-item label="接收钱包ID" prop="toWalletId">
                        <el-input v-model.number="transferForm.toWalletId" type="number" :prefix-icon="Wallet"
                            :disabled="isEncrypted" />
                    </el-form-item>
                    <el-form-item label="转账额" prop="amount">
                        <el-input-number v-model="transferForm.amount" :precision="2" :step="0.1" :min="0.01"
                            controls-position="right" style="width: 100%;" :disabled="isEncrypted" />
                    </el-form-item>
                </div>

                <!-- 加密部分 -->
                <div class="encryption-section">
                    <div class="encryption-header">
                        <el-icon :size="24" :class="{ 'is-active': isEncrypted }">
                            <Lock />
                        </el-icon>
                        <span>加密数据</span>
                    </div>

                    <el-form-item label="加密密钥" prop="keyId">
                        <div class="key-select-wrapper">
                            <div class="key-select-row">
                                <el-select v-model="transferForm.keyId" placeholder="选择密钥加密数据" :disabled="isEncrypted"
                                    style="flex: 1;">
                                    <el-option v-for="key in encryptionKeys" :key="key.id" :label="key.name || ''"
                                        :value="key.id || ''">
                                        <div class="key-option">
                                            <el-icon>
                                                <Key />
                                            </el-icon>
                                            <span>{{ key.name || '' }}</span>
                                        </div>
                                    </el-option>
                                </el-select>
                                <el-button type="primary" @click="generateEncryptedData"
                                    :disabled="!transferForm.keyId || isEncrypted" style="margin-left: 10px;">
                                    <el-icon>
                                        <Lock />
                                    </el-icon>
                                    生成加密数据
                                </el-button>
                            </div>

                            <!-- 加密后的数据展示 -->
                            <div v-if="isEncrypted" class="encrypted-data-panel">
                                <div class="panel-header">
                                    <el-icon>
                                        <Lock />
                                    </el-icon>
                                    <span>加密后的转账数据</span>
                                </div>
                                <el-input type="textarea" v-model="transferForm.encryptedData" readonly rows="3"
                                    placeholder="加密后的数据将显示在这里" />
                            </div>
                        </div>
                    </el-form-item>
                </div>
            </el-form>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="transferDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="confirmTransfer" :loading="transferLoading"
                        :disabled="!isEncrypted">
                        <el-icon>
                            <Lock />
                        </el-icon> 确认转账
                    </el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 编辑名称弹窗 -->
        <el-dialog v-model="editNameDialogVisible" title="编钱包名称" width="400px">
            <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
                <el-form-item label="钱包名称" prop="name">
                    <el-input v-model="editForm.name" maxlength="100" show-word-limit />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="editNameDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="confirmEdit" :loading="editLoading">
                        确认
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import axios from 'axios'
import TransactionsChart from './chart.vue'
import { useUserStore } from '@/pinia/modules/user'
import { Lock, Key, CircleCheck, Wallet } from '@element-plus/icons-vue'
import JsEncrypt from 'jsencrypt'

const userStore = useUserStore()
export default {
    name: 'Wallet',
    components: {
        TransactionsChart,
        Lock,
        Key,
        CircleCheck,
        Wallet
    },
    setup() {
        const walletInfo = ref({
            ID: 0,
            CreatedAt: '',
            UpdatedAt: '',
            DeletedAt: null,
            user_name: '',
            wallet_name: '',
            balance: 0
        })
        const stats = ref({})
        const transferDialogVisible = ref(false)
        const editNameDialogVisible = ref(false)
        const transferLoading = ref(false)
        const editLoading = ref(false)
        const transferFormRef = ref(null)
        const editFormRef = ref(null)

        const encryptionKeys = ref([])
        const isEncrypted = ref(false)

        const transferForm = reactive({
            toWalletId: '',
            amount: 0,
            keyId: '',
            encryptedData: ''
        })

        const editForm = reactive({
            name: ''
        })

        const transferRules = {
            toWalletId: [
                { required: true, message: '请输入接收钱包ID', trigger: 'blur' },
                { type: 'number', message: '钱包ID必须为数字', trigger: 'blur' }
            ],
            amount: [
                { required: true, message: '请输入转账金额', trigger: 'blur' },
                { type: 'number', message: '金额必须为数字', trigger: 'blur' }
            ],
            keyId: [
                { required: true, message: '请选择加密密钥', trigger: 'change' }
            ]
        }

        const editRules = {
            name: [
                { required: true, message: '请输入钱包名称', trigger: 'blur' },
                { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
            ]
        }

        const formatDate = (date) => {
            return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
        }

        const formatBalance = (balance) => {
            return Number(balance).toFixed(2)
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

        // 获取钱包统计信息
        const getWalletStats = async () => {
            if (!walletInfo.value.ID) {
                console.warn('钱包ID不存在，跳过获取统计信息')
                return
            }

            try {
                const response = await axios.post('http://45.8.113.140:3338/api/v1/hufu/wallet/stats', {
                    wallet_id: walletInfo.value.ID
                })
                stats.value.todayCount = response.data.data.today_transactions
                stats.value.totalCount = response.data.data.total_transactions
            } catch (error) {
                console.error('获取统计信息失败:', error)
                ElMessage.error('获取统计信息失败')
            }
        }

        const handleTransfer = () => {
            transferForm.amount = 0
            transferForm.toWalletId = ''
            transferDialogVisible.value = true
        }

        const handleEdit = () => {
            editForm.name = walletInfo.value.WalletName
            editNameDialogVisible.value = true
        }

        const confirmTransfer = async () => {
            if (!transferFormRef.value) return

            await transferFormRef.value.validate(async (valid) => {
                if (valid) {
                    transferLoading.value = true
                    try {
                        const data = {
                            from_wallet_id: walletInfo.value.ID,
                            to_wallet_id: transferForm.toWalletId,
                            amount: transferForm.amount
                        }

                        const encryptedData = new JsEncrypt().encrypt(JSON.stringify(data))

                        isEncrypted.value = true

                        const response = await axios.post('http://45.8.113.140:3338/api/v1/hufu/tx/transfer', {
                            from_wallet_id: walletInfo.value.ID,
                            to_wallet_id: transferForm.toWalletId,
                            amount: transferForm.amount,
                        })

                        const transferStatus = response.data.data.status;
                        if (transferStatus === 'completed') {
                            ElMessage.success('转账成功');
                            transferDialogVisible.value = false;
                            getWalletInfo(); // 刷新钱包信息
                        } else {
                            ElMessage.error('转账失败');
                        }
                    } catch (error) {
                        console.error('转账失败:', error)
                        ElMessage.error(error.response?.data?.message || '转账失败')
                    } finally {
                        transferLoading.value = false
                        isEncrypted.value = false
                    }
                }
            })
        }

        const confirmEdit = async () => {
            if (!editFormRef.value) return

            await editFormRef.value.validate(async (valid) => {
                if (valid) {
                    editLoading.value = true
                    try {
                        await axios.post('http://45.8.113.140:3338/api/v1/hufu/wallet/update', {
                            id: walletInfo.value.ID,
                            wallet_name: editForm.name,
                            balance: walletInfo.value.balance
                        })
                        ElMessage.success('更新成功')
                        editNameDialogVisible.value = false
                        getWalletInfo()
                    } catch (error) {
                        console.error('更新失败:', error)
                        ElMessage.error('更新失败')
                    } finally {
                        editLoading.value = false
                    }
                }
            })
        }

        const getEncryptionKeys = async () => {
            try {
                const response = await axios.post('http://45.8.113.140:3338/api/v1/hufu/keys/', {
                    user_name: userStore.userInfo.userName
                })
                console.log('获取加密密钥响应:', response.data)

                // 后端只返回了公钥字符串，我们需要创建一个唯一的ID
                const publicKeyStr = response.data.public_key
                encryptionKeys.value = [{
                    id: 1,  // 使用固定ID，因为只有一个公钥
                    name: '加密公钥',
                    key: publicKeyStr
                }]
                console.log('加密钥设置成功:', encryptionKeys.value)
            } catch (error) {
                console.error('获取加密密钥失败:', error)
                ElMessage.error('获取加密密钥失败')
                encryptionKeys.value = []
            }
        }

        const handleKeySelect = async () => {
            if (!transferForm.toWalletId || !transferForm.amount) {
                ElMessage.warning('请先填写转账信息')
                transferForm.keyId = ''
                return
            }

            try {
                const data = {
                    from_wallet_id: walletInfo.value.ID,
                    to_wallet_id: transferForm.toWalletId,
                    amount: transferForm.amount
                }

                const encryptedData = await encrypt(data, transferForm.keyId)
                transferForm.encryptedData = encryptedData
                isEncrypted.value = true

                ElMessage.success('数据加密功')
            } catch (error) {
                console.error('数据加密失败:', error)
                ElMessage.error('数据加密失败')
                transferForm.keyId = ''
                isEncrypted.value = false
            }
        }

        const generateEncryptedData = async () => {
            if (!transferForm.toWalletId || !transferForm.amount) {
                ElMessage.warning('请先填写转账信息')
                return
            }

            if (!transferForm.keyId) {
                ElMessage.warning('请选择加密密钥')
                return
            }

            const data = {
                from_wallet_id: walletInfo.value.ID,
                to_wallet_id: transferForm.toWalletId,
                amount: transferForm.amount
            }

            const encryptedData = new JsEncrypt().encrypt(JSON.stringify(data))
            transferForm.encryptedData = encryptedData
            isEncrypted.value = true

            ElMessage.success('数据加密成功')

        }

        onMounted(async () => {
            try {
                await getWalletInfo()      // 等待获取钱包信息完成
                await getWalletStats()     // 等待获取统计信息完成
                await getEncryptionKeys()  // 等待获取加密密钥完成
            } catch (error) {
                console.error('初始化数据失败:', error)
                ElMessage.error('初始化数据失败')
            }
        })

        return {
            walletInfo,
            stats,
            transferDialogVisible,
            editNameDialogVisible,
            transferLoading,
            editLoading,
            transferForm,
            editForm,
            transferFormRef,
            editFormRef,
            transferRules,
            editRules,
            formatDate,
            formatBalance,
            handleTransfer,
            handleEdit,
            confirmTransfer,
            confirmEdit,
            encryptionKeys,
            isEncrypted,
            handleKeySelect,
            generateEncryptedData
        }
    }
}
</script>

<style scoped>
.wallet-container {
    padding: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.wallet-info {
    padding: 10px;
}

.info-item {
    margin-bottom: 15px;
    display: flex;
    align-items: center;
}

.info-item .label {
    width: 100px;
    color: #666;
}

.info-item .value {
    flex: 1;
    color: #333;
}

.balance-info {
    text-align: center;
    padding: 20px;
}

.balance-amount {
    font-size: 32px;
    font-weight: bold;
    color: #409EFF;
    margin-bottom: 20px;
}

.balance-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
}

.stats-info {
    display: flex;
    justify-content: space-around;
    padding: 20px;
}

.stats-item {
    text-align: center;
}

.stats-label {
    color: #666;
    margin-bottom: 10px;
}

.stats-value {
    font-size: 24px;
    font-weight: bold;
    color: #409EFF;
}

.el-card {
    margin-bottom: 20px;
}

.wallet-card,
.balance-card,
.stats-card {
    height: 100%;
}

.encryption-status {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #909399;
}

.encryption-status .el-icon {
    font-size: 16px;
}

.encryption-status .is-active {
    color: #67C23A;
}

.encryption-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 20px 20px;
    border-bottom: 1px solid #EBEEF5;
    color: #409EFF;
    font-size: 18px;
    font-weight: bold;
}

.key-select-wrapper {
    width: 100%;
}

.key-select-row {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
}

.key-option {
    display: flex;
    align-items: center;
    gap: 8px;
}

.key-id {
    color: #909399;
    font-size: 12px;
    margin-left: auto;
}

.encryption-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
}

.encryption-indicator.is-active {
    color: #67C23A;
}

.transfer-content {
    position: relative;
    padding: 20px;
    border-radius: 4px;
    transition: all 0.3s;
}

.transfer-content.is-encrypted {
    background: #F0F9EB;
    border: 1px solid #E1F3D8;
}

.encryption-status-panel {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: #F5F7FA;
    border-radius: 4px;
}

.status-icon {
    font-size: 24px;
    color: #909399;
}

.status-icon .is-active {
    color: #67C23A;
}

.status-info {
    flex: 1;
}

.status-title {
    font-weight: bold;
    margin-bottom: 4px;
}

.status-desc {
    font-size: 12px;
    color: #909399;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
}

.dialog-footer .el-button {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: 0;
}

:deep(.el-dialog__body) {
    padding: 20px 24px;
}

:deep(.el-dialog__footer) {
    padding: 0 24px 20px;
}

.encryption-section {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #EBEEF5;
}

.encrypted-data-panel {
    margin-top: 15px;
    padding: 15px;
    background: #F0F9EB;
    border: 1px solid #E1F3D8;
    border-radius: 4px;
}

.panel-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    color: #67C23A;
    font-weight: bold;
}

.transfer-content {
    padding: 0;
    margin-bottom: 20px;
}

/* 禁用状态的样式 */
.el-input.is-disabled .el-input__inner,
.el-input-number.is-disabled .el-input__inner {
    background-color: #F5F7FA;
    border-color: #E4E7ED;
    color: #909399;
}
</style>