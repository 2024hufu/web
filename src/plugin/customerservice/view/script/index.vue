<template>
  <div>
    <div class="gva-table-box">
      <div class="gva-btn-list">
        <el-button type="primary" icon="plus" @click="openDialog">新增</el-button>
      </div>
      <el-table
          ref="multipleTable"
          style="width: 100%"
          tooltip-effect="dark"
          :data="tableData"
          row-key="uid"
      >
        <el-table-column align="left" label="ID" prop="id" width="120" />
        <el-table-column align="left" label="标题" prop="title" width="120" />
        <el-table-column align="left" label="详情" prop="content" width="200" />
        <el-table-column align="left" label="排序" prop="sort" width="120" />
        <el-table-column align="left" label="添加时间" prop="add_time_str" width="180">
        </el-table-column>
        <el-table-column align="left" label="操作" fixed="right" min-width="240">
          <template #default="scope">
            <el-button type="primary" link icon="edit" class="table-button" @click="updateScriptFunc(scope.row)">编辑</el-button>
            <el-button type="primary" link icon="delete" @click="deleteRow(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="gva-pagination">
        <el-pagination
            layout="total, sizes, prev, pager, next, jumper"
            :current-page="page"
            :page-size="pageSize"
            :page-sizes="[10, 30, 50, 100]"
            :total="total"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
        />
      </div>
    </div>
    <el-drawer destroy-on-close size="800" v-model="dialogFormVisible" :show-close="false" :before-close="closeDialog">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="text-lg">{{type==='create'?'添加':'修改'}}</span>
          <div>
            <el-button type="primary" @click="enterDialog">确 定</el-button>
            <el-button @click="closeDialog">取 消</el-button>
          </div>
        </div>
      </template>

      <el-form :model="formData" label-position="top" ref="elFormRef" :rules="formRule" label-width="80px">
        <el-form-item label="话术标题:"  prop="title" >
          <el-input v-model="formData.title" :clearable="true"  placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="话术内容:"  prop="content" >
          <el-input v-model="formData.content" :clearable="true"  placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="排序:"  prop="sort" >
          <el-input-number v-model="formData.sort" :clearable="true" placeholder="请输入排序"/>
        </el-form-item>
      </el-form>
    </el-drawer>
    <el-dialog v-model="isDialogVisible" title="媒体库" width="950px" destroy-on-close>
      <ImageLibrary @select="handleImageSelect" :multiple="isMultiple"/>
    </el-dialog>
  </div>
</template>

<script setup>
import {CircleClose, Plus} from '@element-plus/icons-vue'

// 全量引入格式化工具 请按需保留
import { getDictFunc, formatDate, formatBoolean, filterDict ,filterDataSource, ReturnArrImg, onDownloadFile } from '@/utils/format'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, reactive } from 'vue'
import ImageLibrary from "@/plugin/picturelibrary/view/components/imageLibrary.vue";
import {deleteScript, findScript, getScriptList, saveScript} from "@/plugin/customerservice/api/api";

defineOptions({
  name: 'ServiceIndex'
})



const elFormRef = ref()
const elSearchFormRef = ref()
// 控制更多查询条件显示/隐藏状态
const showAllQuery = ref(false)

const isDialogVisible = ref(false)
const isMultiple = ref(false) // 设置是否允许多选
const selectedImages = ref([])

const openImageLibrary = () => {
  isDialogVisible.value = true
}

const fileTypeList = ['png', 'jpg', 'jpeg', 'gif']

const handleImageSelect = (images) => {
  if (isMultiple.value) {
    selectedImages.value = [...selectedImages.value, ...images]
  } else {
    selectedImages.value = Array.isArray(images) ? images : [images]
  }
  formData.value.avatar = selectedImages.value[0]['url']
  isDialogVisible.value = false
}

const removeSelectedImage = (image) => {
  const index = selectedImages.value.indexOf(image)
  if (index !== -1) {
    selectedImages.value.splice(index, 1)
  }
}

// 自动化生成的字典（可能为空）以及字段
const formData = ref({
  id: 0,
  service_id: 0,
  title: '',
  content: '',
  sort: 0,
})



// 验证规则
const formRule = reactive({
  title: [
    { required: true, message: '话术标题必须填写', trigger: 'change' }
  ],
  content: [
    { required: true, message: '话术内容必须填写', trigger: 'change' }
  ],
})


// =========== 表格控制部分 ===========
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

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
const getTableData = async() => {
  const table = await getScriptList({ page: page.value, limit: pageSize.value, keyword:'' })
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
const setOptions = async () =>{
}

// 获取需要的字典 可能为空 按需保留
setOptions()


// 删除行
const deleteRow = (row) => {
  ElMessageBox.confirm('确定要删除吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteSysMemberFunc(row)
  })
}

// 行为控制标记（弹窗内部需要增还是改）
const type = ref('')

// 更新行
const updateScriptFunc = async(row) => {
  const res = await findScript({ id: row.id })
  type.value = 'update'
  if (res.code === 0) {
    formData.value = res.data
    dialogFormVisible.value = true
  }
}


// 删除行
const deleteSysMemberFunc = async (row) => {
  const res = await deleteScript({ id: row.id })
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
    id: 0,
    service_id: 0,
    title: '',
    content: '',
    sort: 0,
  }
  selectedImages.value = []
}
// 弹窗确定
const enterDialog = async () => {
  elFormRef.value?.validate( async (valid) => {
    if (!valid) return
    let res
    let title
    switch (type.value) {
      case 'create':
        title = '创建'
        break
      case 'update':
        title = '更新'
        break
      default:
        title = '创建'
        break
    }
    res = await saveScript(formData.value)
    if (res.code === 0) {
      ElMessage({
        type: 'success',
        message: title
      })
      closeDialog()
      getTableData()
    }
  })
}

</script>

<style>
.selected-images {
  position: relative;
  display: flex;
  flex-wrap: wrap;
}

.selected-image {
  position: relative;
  margin-right: 10px;
  margin-bottom:10px;
  width: 100px;
  height: 100px;
}

.selected-image .remove-icon {
  position: absolute;
  top: 0; /* 微调位置 */
  right: 0; /* 微调位置 */
  color: black;
  padding: 5px;
  cursor: pointer;
  font-size: 22px;
  line-height: 22px;
  text-align: center;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  border: 1px dashed #d4d9e1;
}
</style>
