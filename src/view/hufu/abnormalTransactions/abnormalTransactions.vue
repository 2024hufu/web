<template>
  <div class="gva-container">
    <div class="gva-table-box">
      <div class="gva-btn-list">
        <h2 class="title-with-bar">异常交易</h2>
      </div>
      <el-divider />


      <div class="gva-search-box">
        <el-form ref="elSearchFormRef" :inline="true" :model="searchInfo" class="demo-form-inline" :rules="searchRule"
          @keyup.enter="onSubmit">
          <el-form-item label="创建日期" prop="createdAt">
            <template #label>
              <span>
                创建日期
                <el-tooltip content="搜索范围是开始日期（包含）至结束日期（不包含）">
                  <el-icon>
                    <QuestionFilled />
                  </el-icon>
                </el-tooltip>
              </span>
            </template>
            <el-date-picker v-model="searchInfo.startCreatedAt" type="datetime" placeholder="开始日期"
              :disabled-date="time => searchInfo.endCreatedAt ? time.getTime() > searchInfo.endCreatedAt.getTime() : false"></el-date-picker>
            —
            <el-date-picker v-model="searchInfo.endCreatedAt" type="datetime" placeholder="结束日期"
              :disabled-date="time => searchInfo.startCreatedAt ? time.getTime() < searchInfo.startCreatedAt.getTime() : false"></el-date-picker>
          </el-form-item>


          <template v-if="showAllQuery">
            <!-- 将需要控制显示状态的查询条件添加到此范围内 -->
          </template>

          <el-form-item>
            <el-button type="primary" icon="search" @click="onSubmit">查询</el-button>
            <el-button icon="refresh" @click="onReset">重置</el-button>
            <el-button link type="primary" icon="arrow-down" @click="showAllQuery = true"
              v-if="!showAllQuery">展开</el-button>
            <el-button link type="primary" icon="arrow-up" @click="showAllQuery = false" v-else>收起</el-button>
          </el-form-item>
        </el-form>

      </div>
      <el-table ref="multipleTable" style="width: 100%" tooltip-effect="dark" :data="tableData" row-key="ID"
        @selection-change="handleSelectionChange" class="my-table" border stripe highlight-current-row>
        <el-table-column type="selection" width="55" align="center" />

        <el-table-column align="center" label="日期" prop="createdAt" min-width="150">
          <template #default="scope">
            <span class="time-cell">{{ formatDate(scope.row.CreatedAt) }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="钱包序号" prop="wallet_id" min-width="120">
          <template #default="scope">
            <el-tag size="small" effect="plain">{{ scope.row.wallet_id }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column align="center" label="交易序号" prop="transaction_id" min-width="120">
          <template #default="scope">
            <el-tag size="small" type="info" effect="plain">{{ scope.row.transaction_id }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column align="left" label="异常证据" prop="evidence" min-width="200">
          <template #default="scope">
            <div class="evidence-cell">
              <el-tag type="danger" effect="light" class="evidence-tag">
                {{ formatEvidence(scope.row.evidence) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column align="left" label="监管签名" prop="signature" min-width="200">
          <template #default="scope">
            <div class="signature-cell">
              <el-tooltip :content="scope.row.signature" placement="top" :show-after="500">
                <span class="signature-text">{{ scope.row.signature }}</span>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <el-table-column align="center" label="操作" fixed="right" min-width="200">
          <template #default="scope">
            <div class="operation-cell">
              <el-button type="primary" link @click="getDetails(scope.row)">
                <el-icon>
                  <InfoFilled />
                </el-icon>
                <span>详情</span>
              </el-button>
              <el-button type="danger" link @click="deleteRow(scope.row)">
                <el-icon>
                  <Delete />
                </el-icon>
                <span>删除</span>
              </el-button>
              <el-button type="success" link @click="downloadRecord(scope.row)">
                <el-icon>
                  <Download />
                </el-icon>
                <span>下载</span>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>


      <div class="gva-pagination">
        <el-pagination layout="total, sizes, prev, pager, next, jumper" :current-page="page" :page-size="pageSize"
          :page-sizes="[10, 30, 50, 100]" :total="total" @current-change="handleCurrentChange"
          @size-change="handleSizeChange" />
      </div>
    </div>


    <el-drawer destroy-on-close size="800" v-model="dialogFormVisible" :show-close="false" :before-close="closeDialog">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="text-lg">{{ type === 'create' ? '添加' : '修改' }}</span>
          <div>
            <el-button type="primary" @click="enterDialog">确 定</el-button>
            <el-button @click="closeDialog">取 消</el-button>
          </div>
        </div>
      </template>

      <el-form :model="formData" label-position="top" ref="elFormRef" :rules="rule" label-width="80px">
        <el-form-item label="钱包序号:" prop="wallet_id">
          <el-input v-model.number="formData.wallet_id" :clearable="true" placeholder="请输入钱包序号" />
        </el-form-item>
        <el-form-item label="交易序号:" prop="transaction_id">
          <el-input v-model.number="formData.transaction_id" :clearable="true" placeholder="请输入交易序号" />
        </el-form-item>
        <el-form-item label="异常证据:" prop="evidence">
          <el-input v-model="formData.evidence" :clearable="true" placeholder="请输入异常证据" />
        </el-form-item>
        <el-form-item label="监管签名:" prop="signature">
          <el-input v-model="formData.signature" :clearable="true" type="textarea" :rows="3" placeholder="请输入监管签名" />
        </el-form-item>
      </el-form>
    </el-drawer>

    <el-drawer destroy-on-close size="800" v-model="detailShow" :show-close="true" :before-close="closeDetailShow">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="钱包序号">
          {{ detailFrom.wallet_id }}
        </el-descriptions-item>
        <el-descriptions-item label="交易序号">
          {{ detailFrom.transaction_id }}
        </el-descriptions-item>
        <el-descriptions-item label="异常证据">
          {{ formatEvidence(detailFrom.evidence) }}
        </el-descriptions-item>
        <el-descriptions-item label="监管签名">
          <div style="word-break: break-all;">
            {{ detailFrom.signature }}
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-drawer>

  </div>
</template>

<script setup>
import {
  createAbnormalTransactions,
  deleteAbnormalTransactions,
  deleteAbnormalTransactionsByIds,
  updateAbnormalTransactions,
  findAbnormalTransactions,
  getAbnormalTransactionsList
} from '@/api/hufu/abnormalTransactions'

// 全量引入格式化工具 请按需保留
import { getDictFunc, formatDate, formatBoolean, filterDict, filterDataSource, returnArrImg, onDownloadFile } from '@/utils/format'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, reactive } from 'vue'
import { Download } from '@element-plus/icons-vue'  // 添加图标引入




defineOptions({
  name: 'AbnormalTransactions'
})

// 控制更多查询条件显示/隐藏状态
const showAllQuery = ref(false)

// 自动化生成的字典（能为空）以及字段
const formData = ref({
  wallet_id: undefined,
  transaction_id: undefined,
  evidence: '',
  signature: '',
})



// 验则
const rule = reactive({
})

const searchRule = reactive({
  createdAt: [
    {
      validator: (rule, value, callback) => {
        if (searchInfo.value.startCreatedAt && !searchInfo.value.endCreatedAt) {
          callback(new Error('请填写结束日期'))
        } else if (!searchInfo.value.startCreatedAt && searchInfo.value.endCreatedAt) {
          callback(new Error('请填写开始日期'))
        } else if (searchInfo.value.startCreatedAt && searchInfo.value.endCreatedAt && (searchInfo.value.startCreatedAt.getTime() === searchInfo.value.endCreatedAt.getTime() || searchInfo.value.startCreatedAt.getTime() > searchInfo.value.endCreatedAt.getTime())) {
          callback(new Error('开始日期应当早于结束日期'))
        } else {
          callback()
        }
      }, trigger: 'change'
    }
  ],
})

const elFormRef = ref()
const elSearchFormRef = ref()

// =========== 表格控制部分 ===========
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])
const searchInfo = ref({})

// 重置
const onReset = () => {
  searchInfo.value = {}
  getTableData()
}

// 搜索
const onSubmit = () => {
  elSearchFormRef.value?.validate(async (valid) => {
    if (!valid) return
    page.value = 1
    pageSize.value = 10
    getTableData()
  })
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  getTableData()
}

// 修改页面容量
const handleCurrentChange = (val) => {
  page.value = val
  getTableData()
}

// 查询
const getTableData = async () => {
  const table = await getAbnormalTransactionsList({ page: page.value, pageSize: pageSize.value, ...searchInfo.value })
  if (table.code === 0) {
    tableData.value = table.data.list
    total.value = table.data.total
    page.value = table.data.page
    pageSize.value = table.data.pageSize
  }
}

getTableData()

// ============== 表格控制部分结束 ===============

// 获取需要的字典 可能为空 按需保留
const setOptions = async () => {
}

// 获取需要的字典 可能为空 按需保留
setOptions()


// 多选数据
const multipleSelection = ref([])
// 多选
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

// 删除行
const deleteRow = (row) => {
  ElMessageBox.confirm('确定要删除吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteAbnormalTransactionsFunc(row)
  })
}

// 多选删除
const onDelete = async () => {
  ElMessageBox.confirm('确定要删除吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const IDs = []
    if (multipleSelection.value.length === 0) {
      ElMessage({
        type: 'warning',
        message: '请选择要删除的数据'
      })
      return
    }
    multipleSelection.value &&
      multipleSelection.value.map(item => {
        IDs.push(item.ID)
      })
    const res = await deleteAbnormalTransactionsByIds({ IDs })
    if (res.code === 0) {
      ElMessage({
        type: 'success',
        message: '删除成功'
      })
      if (tableData.value.length === IDs.length && page.value > 1) {
        page.value--
      }
      getTableData()
    }
  })
}

// 行为控制标记（弹窗内部需要增还是改）
const type = ref('')

// 更新行
const updateAbnormalTransactionsFunc = async (row) => {
  const res = await findAbnormalTransactions({ ID: row.ID })
  type.value = 'update'
  if (res.code === 0) {
    formData.value = res.data
    dialogFormVisible.value = true
  }
}


// 删除行
const deleteAbnormalTransactionsFunc = async (row) => {
  const res = await deleteAbnormalTransactions({ ID: row.ID })
  if (res.code === 0) {
    ElMessage({
      type: 'success',
      message: '删除成功'
    })
    if (tableData.value.length === 1 && page.value > 1) {
      page.value--
    }
    getTableData()
  }
}

// 弹窗控制标记
const dialogFormVisible = ref(false)

// 打开弹窗
const openDialog = () => {
  type.value = 'create'
  dialogFormVisible.value = true
}

// 关闭弹窗
const closeDialog = () => {
  dialogFormVisible.value = false
  formData.value = {
    wallet_id: undefined,
    transaction_id: undefined,
    evidence: '',
    signature: '',
  }
}
// 弹窗确定
const enterDialog = async () => {
  elFormRef.value?.validate(async (valid) => {
    if (!valid) return
    let res
    switch (type.value) {
      case 'create':
        res = await createAbnormalTransactions(formData.value)
        break
      case 'update':
        res = await updateAbnormalTransactions(formData.value)
        break
      default:
        res = await createAbnormalTransactions(formData.value)
        break
    }
    if (res.code === 0) {
      ElMessage({
        type: 'success',
        message: '创建/更改成功'
      })
      closeDialog()
      getTableData()
    }
  })
}


const detailFrom = ref({})

// 查看详情控制标记
const detailShow = ref(false)


// 打开详情弹窗
const openDetailShow = () => {
  detailShow.value = true
}


// 打开详情
const getDetails = async (row) => {
  // 打开弹窗
  const res = await findAbnormalTransactions({ ID: row.ID })
  if (res.code === 0) {
    detailFrom.value = res.data
    openDetailShow()
  }
}


// 关闭详情弹窗
const closeDetailShow = () => {
  detailShow.value = false
  detailFrom.value = {}
}

const formatEvidence = (evidence) => {
  const match = evidence.match(/Error:\s(.+)/)
  return match ? match[1] : evidence
}

// 添加下载函数
const downloadRecord = (row) => {
  const content = `异常交易记录
------------------------
创建时间: ${formatDate(row.CreatedAt)}
钱包序号: ${row.wallet_id}
交易序号: ${row.transaction_id}
异常证据: ${row.evidence}
监管签名: ${row.signature}
------------------------`

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `异常交易记录_${row.ID}.txt`
  link.click()
  window.URL.revokeObjectURL(url)
}

</script>

<style scoped>
.gva-container {
  padding: 24px;
}

.gva-table-box {
  padding: 24px;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, .08);
}

.gva-btn-list {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.demo-form-inline {
  display: flex;
  justify-content: space-between;
}

.my-table {
  margin-top: 16px;
  --el-table-border-color: var(--el-border-color-lighter);
}

.time-cell {
  font-family: var(--el-font-family-monospace);
  color: var(--el-text-color-regular);
}

.evidence-cell {
  padding: 4px 0;
}

.evidence-tag {
  max-width: 100%;
  white-space: normal;
  height: auto;
  padding: 4px 8px;
  line-height: 1.4;
}

.signature-cell {
  max-width: 200px;
  overflow: hidden;
}

.signature-text {
  display: inline-block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  color: var(--el-text-color-secondary);
  font-family: var(--el-font-family-monospace);
}

.operation-cell {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.operation-cell :deep(.el-button) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

:deep(.el-table) {
  --el-table-header-bg-color: var(--el-fill-color-light);
  --el-table-row-hover-bg-color: var(--el-fill-color-lighter);
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table__header) th {
  font-weight: 600;
  color: var(--el-text-color-primary);
  background-color: var(--el-fill-color-light) !important;
}

:deep(.el-table--striped) .el-table__body tr.el-table__row--striped td {
  background-color: var(--el-fill-color-lighter);
}

.created-at {
  min-width: 180px;
}

.wallet-id {
  min-width: 120px;
}

.transaction-id {
  min-width: 120px;
}

.error-evidence {
  min-width: 200px;
}

.signature {
  min-width: 200px;
}



:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: var(--el-fill-color-light) !important;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: var(--el-fill-color-lighter);
}

:deep(.el-table__body tr:hover > td) {
  background-color: var(--el-fill-color) !important;
}

:deep(.table-button) {
  padding: 4px 8px;
}

.gva-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding: 8px;
}

/* 美化搜索区域 */
.gva-search-box {
  padding: 24px;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, .08);
  margin-bottom: 16px;
}

/* 美化异常证据显示 */
:deep(.el-table .error-evidence) {
  color: var(--el-color-danger);
  background-color: var(--el-color-danger-light-9);
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
}

/* 美化操作按钮组 */
:deep(.el-button-group) {
  display: flex;
  gap: 8px;
}

/* 美抽屉内容 */
:deep(.el-drawer__body) {
  padding: 20px;
}

:deep(.el-descriptions) {
  padding: 16px;
}

:deep(.el-descriptions__title) {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
}

/* 适配暗色主题 */
:deep(.dark) {

  .gva-table-box,
  .gva-search-box {
    background-color: var(--el-bg-color-overlay);
  }
}

.title-with-bar {
  position: relative;
  padding-left: 12px;
  font-size: 20px;
  font-weight: 800;
  color: var(--el-text-color-primary);
  margin: 0;
  padding: 8px 0 8px 12px;
}

.title-with-bar::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: var(--el-color-primary);
  border-radius: 2px;
}

:deep(.el-divider) {
  margin: 12px 0;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>