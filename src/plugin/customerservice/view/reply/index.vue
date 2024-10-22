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
        <el-table-column align="left" label="回复类型" prop="reply_type" width="100" >
          <template #default="scope">
            {{replyType[scope.row.reply_type]}}
          </template>
        </el-table-column>
        <el-table-column align="left" label="关键字" prop="keyword" width="120" />
        <el-table-column align="left" label="回复内容" prop="content" width="150">
          <template #default="scope">
            <el-image
                preview-teleported
                style="width: 50px; height: 50px"
                :src="scope.row.content"
                fit="cover"
                :preview-src-list="[scope.row.content]"
                v-if="scope.row.reply_type === 2"
            >

            </el-image>
            <span v-else>
              {{scope.row.content}}
            </span>
          </template>
        </el-table-column>
        <el-table-column align="left" label="状态" prop="status" width="120">
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.status === 1">正常</el-tag>
            <el-tag type="danger" v-else>禁用</el-tag>
          </template>
        </el-table-column>
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
        <el-form-item label="是否完全匹配:"  prop="reply_type" >
          <el-switch v-model="formData.is_complete" active-color="#13ce66" active-value="1" inactive-value="0" inactive-color="#ff4949" active-text="是" inactive-text="否" clearable ></el-switch>
        </el-form-item>
        <el-form-item label="关键字:"  prop="keyword" >
          <el-input v-model="formData.keyword" :clearable="true"  placeholder="请输入关键字" />
        </el-form-item>
        <el-form-item label="回复类型:"  prop="reply_type" >
          <el-radio-group v-model="formData.reply_type">
            <el-radio value="1" border>文本</el-radio>
            <el-radio value="2" border>图片</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="回复内容:"  prop="content" >
          <template #default="scope">
            <el-input v-model="formData.content" :clearable="true"  placeholder="请输入内容" v-if="formData.reply_type==1"/>
            <div class="selected-images" v-else>
              <div class="selected-image" v-for="image in selectedImages" :key="image">
                <el-image v-if="fileTypeList.includes(image.tag) === true" :src="image.url" style="width: 100%; height: 100%; object-fit: cover;margin-right: 10px;"></el-image>
                <span class="remove-icon" @click="removeSelectedImage(image)"><el-icon><circle-close></circle-close></el-icon></span>
              </div>
              <el-icon  v-if="isMultiple || selectedImages.length === 0" class="avatar-uploader-icon" @click="openImageLibrary"><Plus /></el-icon>
            </div>
          </template>
        </el-form-item>
        <el-form-item label="是否启用:"  prop="status" >
          <el-switch v-model="formData.status" active-color="#13ce66" active-value="1" inactive-value="0" inactive-color="#ff4949" active-text="是" inactive-text="否" clearable ></el-switch>
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
import {
  autoReplyList,
  deleteReply,
  findReply,
  saveReply
} from "@/plugin/customerservice/api/api";

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
const replyType = ref(['未知','文本','图片'])

const handleImageSelect = (images) => {
  if (isMultiple.value) {
    selectedImages.value = [...selectedImages.value, ...images]
  } else {
    selectedImages.value = Array.isArray(images) ? images : [images]
  }
  formData.value.content = selectedImages.value[0]['url']
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
  reply_type: '1',
  is_complete: '1',
  Keyword: '',
  content: '',
  status: '1',
})



// 验证规则
const formRule = reactive({
  keyword: [
    { required: true, message: '话术关键字必须填写', trigger: 'change' }
  ],
  content: [
    { required: true, message: '内容必须填写', trigger: 'change' }
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
  const table = await autoReplyList({ page: page.value, limit: pageSize.value, keyword:'' })
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
  const res = await findReply({ id: row.id })
  type.value = 'update'
  if (res.code === 0) {
    formData.value = res.data
    formData.value.status = formData.value.status.toString()
    formData.value.reply_type = formData.value.reply_type.toString()
    formData.value.is_complete = formData.value.is_complete.toString()
    dialogFormVisible.value = true
  }
}


// 删除行
const deleteSysMemberFunc = async (row) => {
  const res = await deleteReply({ id: row.id })
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
    reply_type: '1',
    is_complete: '1',
    Keyword: '',
    content: '',
    status: 0,
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
    formData.value.status = parseInt(formData.value.status,10)
    formData.value.reply_type = parseInt(formData.value.reply_type,10)
    formData.value.is_complete = parseInt(formData.value.is_complete,10)
    res = await saveReply(formData.value)
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
