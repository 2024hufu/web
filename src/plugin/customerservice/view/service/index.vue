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
          <el-table-column label="客服头像" width="100">
            <template #default="scope">
              <el-image
                  preview-teleported
                  style="width: 50px; height: 50px"
                  :src="scope.row.avatar"
                  fit="cover"
                  :preview-src-list="[scope.row.avatar]"
              >
              </el-image>
            </template>
          </el-table-column>
          <el-table-column align="left" label="关联用户id" prop="uid" width="120" />
          <el-table-column align="left" label="客服名称" prop="nickname" width="120" />
          <el-table-column align="left" label="客服账户" prop="account" width="120" />
          <el-table-column align="left" label="客服状态" prop="status" width="120">
              <template #default="scope">
                <el-tag type="success" v-if="scope.row.status === 1">正常</el-tag>
                <el-tag type="danger" v-else>禁用</el-tag>
              </template>
          </el-table-column>
          <el-table-column align="left" label="操作" fixed="right" min-width="240">
              <template #default="scope">
                <el-button type="primary" link icon="edit" class="table-button" @click="updateServiceFunc(scope.row)">编辑</el-button>
                <el-button type="primary" link icon="delete" @click="deleteRow(scope.row)">删除</el-button>
                <el-button type="primary" link icon="edit" v-if="scope.row.status === 1" class="table-button" @click="goChat(scope.row)">进入工作台</el-button>
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

            <el-form-item label="客服头像:"  prop="avatar">
              <div class="selected-images">
                <div class="selected-image" v-for="image in selectedImages" :key="image">
                  <el-image v-if="fileTypeList.includes(image.tag) === true" :src="image.url" style="width: 100%; height: 100%; object-fit: cover;margin-right: 10px;"></el-image>
                  <video v-else controls style="width: 100%; height: 100%;">
                    <source :src="image.url" />
                  </video>
                  <span class="remove-icon" @click="removeSelectedImage(image)"><el-icon><circle-close></circle-close></el-icon></span>
                </div>
                <el-icon  v-if="isMultiple || selectedImages.length === 0" class="avatar-uploader-icon" @click="openImageLibrary"><Plus /></el-icon>
              </div>
            </el-form-item>
            <el-form-item label="关联UID:"  prop="uid" >
              <el-input-number v-model="formData.uid" :clearable="true"  placeholder="请输入UID" />
            </el-form-item>
            <el-form-item label="客服名称:"  prop="nickname" >
              <el-input v-model="formData.nickname" :clearable="true"  placeholder="请输入客服名称" />
            </el-form-item>
            <el-form-item label="客服账户:"  prop="account" >
              <el-input v-model="formData.account" :clearable="true"  placeholder="请输入客服账户" />
            </el-form-item>
            <el-form-item label="账户密码:"  prop="password" >
              <el-input v-model="formData.password" :clearable="true" :placeholder="type==='create'?'请输入账户密码':'不修改请留空'"/>
            </el-form-item>
            <el-form-item label="确认密码:"  prop="password2" >
              <el-input v-model="formData.password2" :clearable="true"  :placeholder="type==='create'?'请输入确认密码':'不修改请留空'" />
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
import Cookies from 'js-cookie'
import ImageLibrary from "@/plugin/picturelibrary/view/components/imageLibrary.vue";
import {deleteService, findService, getServiceList, saveService,adminServiceLogin} from "@/plugin/customerservice/api/api";

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
        uid: 0,
        account: '',
        password: '',
        password2: '',
        nickname: '',
        avatar: '',
        status: 0,
        })



// 验证规则
const formRule = reactive({
  avatar: [
    { required: true, message: '客服头像必须选择', trigger: 'change' }
  ],
  nickname: [
    { required: true, message: '客服账户必须填写', trigger: 'change' }
  ],
  uid: [
    { required: true, message: '关联用户id必须填写', trigger: 'change' }
  ],
  account: [
    { required: true, message: '客服账户必须填写', trigger: 'change' }
  ],
  password: [
    { validator: (rule, value, callback) => {
        if (!formData.value.password && type.value !== 'update') {
          callback(new Error('密码必须填写'))
        } else {
          callback()
        }
      }, trigger: 'change' }
  ],
  password2: [
    { validator: (rule, value, callback) => {
        if (formData.value.password2 !== formData.value.password && type.value !== 'update') {
          callback(new Error('两次密码输入不一致'))
        } else {
          callback()
        }
      }, trigger: 'change' }
  ],

})


// =========== 表格控制部分 ===========
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

// 搜索
const onSubmit = () => {
  elSearchFormRef.value?.validate(async(valid) => {
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
const getTableData = async() => {
  const table = await getServiceList({ page: page.value, limit: pageSize.value, keyword:'' })
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
const updateServiceFunc = async(row) => {
    const res = await findService({ id: row.id })
    type.value = 'update'
    if (res.code === 0) {
        formData.value = res.data
        selectedImages.value[0] = { url: formData.value.avatar, tag: 'jpg' }
        formData.value.status = formData.value.status.toString()
        dialogFormVisible.value = true
    }
}

const goChat = async (row) => {
  const res = await adminServiceLogin({id:row.id})
  if (res.code === 0 && res.data.token) {
    Cookies.set('kf_token', res.data.token, { expires: 3 });
    window.open(window.location.protocol + '//' + window.location.host + '/#/kefu/main', '_blank');
  }
}


// 删除行
const deleteSysMemberFunc = async (row) => {
    const res = await deleteService({ id: row.id })
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
          uid: 0,
          account: '',
          password: '',
          password2: '',
          nickname: '',
          avatar: '',
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
              res = await saveService(formData.value)
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
