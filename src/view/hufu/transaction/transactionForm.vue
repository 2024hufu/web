
<template>
  <div>
    <div class="gva-form-box">
      <el-form :model="formData" ref="elFormRef" label-position="right" :rules="rule" label-width="80px">
        <el-form-item label="发送方钱包地址:" prop="SenderAddress">
          <el-input v-model="formData.SenderAddress" :clearable="true"  placeholder="请输入发送方钱包地址" />
       </el-form-item>
        <el-form-item label="接收方钱包地址:" prop="ReceiverAddress">
          <el-input v-model="formData.ReceiverAddress" :clearable="true"  placeholder="请输入接收方钱包地址" />
       </el-form-item>
        <el-form-item label="交易金额:" prop="交易金额">
          <el-input-number v-model="formData.交易金额" :precision="2" :clearable="true"></el-input-number>
       </el-form-item>
        <el-form-item label="交易时间戳 :" prop="Timestamp">
          <el-input v-model.number="formData.Timestamp" :clearable="true" placeholder="请输入" />
       </el-form-item>
        <el-form-item label="交易状态:" prop="Status">
          <el-input v-model="formData.Status" :clearable="true"  placeholder="请输入交易状态" />
       </el-form-item>
        <el-form-item label="交易Hash:" prop="TransactionHash">
          <el-input v-model="formData.TransactionHash" :clearable="true"  placeholder="请输入交易Hash" />
       </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="save">保存</el-button>
          <el-button type="primary" @click="back">返回</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import {
  createTransaction,
  updateTransaction,
  findTransaction
} from '@/api/hufu/transaction'

defineOptions({
    name: 'TransactionForm'
})

// 自动获取字典
import { getDictFunc } from '@/utils/format'
import { useRoute, useRouter } from "vue-router"
import { ElMessage } from 'element-plus'
import { ref, reactive } from 'vue'


const route = useRoute()
const router = useRouter()

const type = ref('')
const formData = ref({
            SenderAddress: '',
            ReceiverAddress: '',
            交易金额: 0,
            Timestamp: undefined,
            Status: '',
            TransactionHash: '',
        })
// 验证规则
const rule = reactive({
})

const elFormRef = ref()

// 初始化方法
const init = async () => {
 // 建议通过url传参获取目标数据ID 调用 find方法进行查询数据操作 从而决定本页面是create还是update 以下为id作为url参数示例
    if (route.query.id) {
      const res = await findTransaction({ ID: route.query.id })
      if (res.code === 0) {
        formData.value = res.data
        type.value = 'update'
      }
    } else {
      type.value = 'create'
    }
}

init()
// 保存按钮
const save = async() => {
      elFormRef.value?.validate( async (valid) => {
         if (!valid) return
            let res
           switch (type.value) {
             case 'create':
               res = await createTransaction(formData.value)
               break
             case 'update':
               res = await updateTransaction(formData.value)
               break
             default:
               res = await createTransaction(formData.value)
               break
           }
           if (res.code === 0) {
             ElMessage({
               type: 'success',
               message: '创建/更改成功'
             })
           }
       })
}

// 返回按钮
const back = () => {
    router.go(-1)
}

</script>

<style>
</style>
