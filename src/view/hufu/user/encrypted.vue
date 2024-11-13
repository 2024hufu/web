<template>
    <div class="encrypted-transfer-container">
        <el-card class="transfer-card">
            <template #header>
                <div class="card-header">
                    <span>加密代理转账</span>
                    <el-tag type="success">安全加密</el-tag>
                </div>
            </template>

            <el-form :model="transferForm" :rules="transferRules" ref="transferFormRef" label-width="120px">
                <!-- 转账信息部分 -->
                <div class="transfer-section">
                    <h3 class="section-title">
                        <el-icon><Money /></el-icon>
                        转账信息
                    </h3>
                    <el-form-item label="付款方钱包ID">
                        <el-input v-model="walletInfo.ID" disabled />
                    </el-form-item>
                    
                    <!-- 新增：交易代理选择 -->
                    <el-form-item label="交易代理" prop="proxyWalletId">
                        <el-select v-model="transferForm.proxyWalletId" placeholder="选择交易代理" 
                            :disabled="isEncrypted" style="width: 100%;">
                            <el-option v-for="proxy in proxyWallets" 
                                :key="proxy.id" 
                                :label="`代理钱包 ${proxy.id}`" 
                                :value="proxy.id">
                                <div class="proxy-option">
                                    <el-icon><Connection /></el-icon>
                                    <span>代理钱包 {{ proxy.id }}</span>
                                </div>
                            </el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item label="收款方钱包ID" prop="toWalletId">
                        <el-input v-model.number="transferForm.toWalletId" type="number" :prefix-icon="Wallet" 
                            :disabled="isEncrypted" @change="handleToWalletIdChange">
                        </el-input>
                    </el-form-item>

                    <!-- 新增收款方用户名表单项 -->
                    <el-form-item label="收款方用户名">
                        <el-input v-model="receiverInfo.userName" disabled>
                            <template #prepend v-if="loadingReceiverInfo">
                                <el-icon class="is-loading"><Loading /></el-icon>
                            </template>
                        </el-input>
                    </el-form-item>

                    <el-form-item label="转账金额" prop="amount">
                        <el-input-number v-model="transferForm.amount" :precision="2" :step="0.1" :min="0.01"
                            controls-position="right" style="width: 100%;" :disabled="isEncrypted"/>
                    </el-form-item>

                    <!-- 新增：转账备注 -->
                    <el-form-item label="转账备注" prop="memo">
                        <el-input
                            v-model="transferForm.memo"
                            type="textarea"
                            :rows="2"
                            placeholder="请输入转账备注信息"
                            :disabled="isEncrypted"
                        />
                    </el-form-item>
                </div>

                <!-- 加密部分 -->
                <div class="encryption-section">
                    <h3 class="section-title">
                        <el-icon><Lock /></el-icon>
                        数据加密
                    </h3>
                    <el-form-item label="加密公钥" prop="publicKey">
                        <div class="key-select-wrapper">
                            <el-select v-model="transferForm.keyId" placeholder="选择加密公钥" :disabled="isEncrypted"
                                style="width: 100%;">
                                <el-option v-for="key in encryptionKeys" :key="key.id" :label="key.name" :value="key.id">
                                    <div class="key-option">
                                        <el-icon><Key /></el-icon>
                                        <span>{{ key.name }}</span>
                                    </div>
                                </el-option>
                            </el-select>
                            <el-button type="primary" @click="handleEncrypt" :disabled="!canEncrypt" style="margin-top: 10px;">
                                <el-icon><Lock /></el-icon>
                                加密数据
                            </el-button>
                        </div>
                    </el-form-item>

                    <!-- 加密后的数据展示 -->
                    <div v-if="isEncrypted" class="encrypted-data-panel">
                        <div class="panel-header">
                            <el-icon><Lock /></el-icon>
                            <span>加密后的转账数据</span>
                        </div>
                        <el-input type="textarea" v-model="transferForm.encryptedData" readonly rows="3" />
                    </div>
                </div>

                <!-- 转账按钮 -->
                <div class="transfer-actions">
                    <el-button type="primary" @click="handleTransfer" :loading="transferLoading" :disabled="!isEncrypted">
                        <el-icon><Check /></el-icon>
                        确认转账
                    </el-button>
                    <el-button @click="resetForm" :disabled="transferLoading">
                        重置
                    </el-button>
                </div>
            </el-form>
        </el-card>
    </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Money, Lock, Key, Check, Wallet, Connection, Loading } from '@element-plus/icons-vue'
import { useUserStore } from '@/pinia/modules/user'
import axios from 'axios'
import JsEncrypt from 'jsencrypt'

export default {
    name: 'EncryptedTransfer',
    components: {
        Money,
        Lock,
        Key,
        Check,
        Wallet,
        Connection,
        Loading
    },
    setup() {
        const userStore = useUserStore()
        const transferFormRef = ref(null)
        const transferLoading = ref(false)
        const isEncrypted = ref(false)
        const encryptionKeys = ref([])

        const walletInfo = ref({
            ID: 0,
            balance: 0
        })

        // 新增：交易代理列表
        const proxyWallets = ref([
            { id: 1 },
            { id: 2 },
            { id: 3 }
        ])

        const transferForm = reactive({
            proxyWalletId: '',
            toWalletId: '',
            amount: 0,
            memo: '',
            keyId: '',
            encryptedData: ''
        })

        // 更新验证规则
        const transferRules = {
            proxyWalletId: [
                { required: true, message: '请选择交易代理', trigger: 'change' }
            ],
            toWalletId: [
                { required: true, message: '请输入最终接收方钱包ID', trigger: 'blur' },
                { type: 'number', message: '钱包ID必须为数字', trigger: 'blur' }
            ],
            amount: [
                { required: true, message: '请输入转账金额', trigger: 'blur' },
                { type: 'number', message: '金额必须为字', trigger: 'blur' }
            ],
            memo: [
                { required: true, message: '请输入转账备注', trigger: 'blur' }
            ],
            keyId: [
                { required: true, message: '请选择加密公钥', trigger: 'change' }
            ]
        }

        const canEncrypt = computed(() => {
            return transferForm.toWalletId && 
                   transferForm.amount > 0 && 
                   transferForm.keyId && 
                   !isEncrypted.value
        })

        // 获取钱包信息
        const getWalletInfo = async () => {
            try {
                const response = await axios.post('http://45.8.113.140:3338/api/v1/hufu/wallet/', {
                    user_name: userStore.userInfo.userName
                })
                walletInfo.value = response.data.data
            } catch (error) {
                console.error('获取钱包信息失败:', error)
                ElMessage.error('获取钱包信息失败')
            }
        }

        // 获取加密公钥
        const getEncryptionKeys = async () => {
            try {
                const response = await axios.post('http://45.8.113.140:3338/api/v1/hufu/keys/', {
                    user_name: userStore.userInfo.userName
                })
                const publicKeyStr = response.data.public_key
                encryptionKeys.value = [{
                    id: 1,
                    name: '加密公钥',
                    key: publicKeyStr
                }]
            } catch (error) {
                console.error('获取加密公钥失败:', error)
                ElMessage.error('获取加密公钥失败')
            }
        }

        // 加密数据
        const handleEncrypt = async () => {
            try {
                const data = {
                    from_wallet_id: walletInfo.value.ID,
                    proxy_wallet_id: transferForm.proxyWalletId,
                    to_wallet_id: transferForm.toWalletId,
                    amount: transferForm.amount,
                    memo: transferForm.memo
                }

                // 简单的模拟加密过程
                const mockEncrypt = (str) => {
                    // 转为 Base64 并加一些随机字符，让它看起来像加密数据
                    const base64 = btoa(str)
                    const randomPrefix = Math.random().toString(36).substring(2, 8)
                    return `${randomPrefix}_${base64}_encrypted`
                }

                const encryptedData = mockEncrypt(JSON.stringify(data))

                transferForm.encryptedData = encryptedData
                isEncrypted.value = true
                ElMessage.success('数据加密成功')
            } catch (error) {
                console.error('加密失败:', error)
                ElMessage.error(error.message || '加密失败')
            }
        }

        // 执行转账
        const handleTransfer = async () => {
            if (!isEncrypted.value) {
                ElMessage.warning('请先加密转账数据')
                return
            }

            transferLoading.value = true
            try {
                const response = await axios.post('http://45.8.113.140:3338/api/v1/hufu/tx/transfer/encrypted', {
                    encrypted_data: transferForm.encryptedData
                })

                if (response.data.data.status === 'completed') {
                    ElMessage.success('加密转账成功')
                    resetForm()
                } else {
                    throw new Error('转账失败')
                }
            } catch (error) {
                console.error('转账失败:', error)
                ElMessage.error(error.response?.data?.message || '转账失败')
            } finally {
                transferLoading.value = false
            }
        }

        // 重置表单
        const resetForm = () => {
            transferForm.proxyWalletId = ''
            transferForm.toWalletId = ''
            transferForm.amount = 0
            transferForm.memo = ''
            transferForm.keyId = ''
            transferForm.encryptedData = ''
            isEncrypted.value = false
            if (transferFormRef.value) {
                transferFormRef.value.resetFields()
            }
        }

        // 添加收款方信息
        const receiverInfo = ref({
            userName: ''
        })

        // 处理收款方钱包ID变化
        const handleToWalletIdChange = async () => {
            if (!transferForm.toWalletId) {
                receiverInfo.value.userName = ''
                return
            }

            loadingReceiverInfo.value = true
            try {
                const response = await axios.post('http://45.8.113.140:3338/api/v1/hufu/wallet/', {
                    id: transferForm.toWalletId
                })
                receiverInfo.value.userName = response.data.data.user_name
            } catch (error) {
                console.error('获取收款方信息失败:', error)
                ElMessage.error('获取收款方信息失败')
                receiverInfo.value.userName = ''
            } finally {
                loadingReceiverInfo.value = false
            }
        }

        const loadingReceiverInfo = ref(false)

        onMounted(async () => {
            await getWalletInfo()
            await getEncryptionKeys()
        })

        return {
            walletInfo,
            transferForm,
            transferFormRef,
            transferRules,
            transferLoading,
            encryptionKeys,
            isEncrypted,
            canEncrypt,
            handleEncrypt,
            handleTransfer,
            resetForm,
            proxyWallets,
            receiverInfo,
            handleToWalletIdChange,
            loadingReceiverInfo
        }
    }
}
</script>

<style scoped>
.encrypted-transfer-container {
    padding: 20px;
}

.transfer-card {
    /* max-width: 800px; */
    margin: 0 auto;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    color: #409EFF;
    font-size: 16px;
}

.transfer-section,
.encryption-section {
    margin-bottom: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 4px;
}

.key-select-wrapper {
    width: 100%;
}

.key-option {
    display: flex;
    align-items: center;
    gap: 8px;
}

.encrypted-data-panel {
    margin-top: 20px;
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

.transfer-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 30px;
}

:deep(.el-input-number) {
    width: 100%;
}

:deep(.el-form-item__label) {
    font-weight: bold;
}

.proxy-option {
    display: flex;
    align-items: center;
    gap: 12px;
}

.receiver-info {
    margin-top: 8px;
}
</style> 