<template>
  <div class="sign-in">
    <div class="header">
      <h2>客服系统</h2>
    </div>
    <el-form :model="loginForm" class="login-form" :rules="formRule" ref="kfFormRef">
      <el-form-item prop="account">
        <el-input v-model="loginForm.account" placeholder="登录账户" size="large"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="loginForm.password" type="password" placeholder="密码" size="large"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleLogin" size="large">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive ,ref,onMounted} from 'vue'
import {accountServiceLogin} from "@/plugin/customerservice/api/api";
import Cookies from "js-cookie";
import { useRouter } from 'vue-router'

const kfFormRef = ref()
const router = useRouter()
const loginForm = ref({
  account: '',
  password: '',
})

// 验证规则
const formRule = reactive({
  account: [
    { required: true, message: '账户不能为空', trigger: 'change' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'change' }
  ],
})
const handleLogin = () => {
  console.log('登录信息:', loginForm);
  kfFormRef.value?.validate( async (valid) => {
    if (!valid) return
    const res = await accountServiceLogin(loginForm.value)
    if (res.code === 0 && res.data.token) {
      Cookies.set('kf_token', res.data.token, { expires: 3 })
      router.push('/kefu/main')
    }
  })
}

onMounted(async () => {
  let token = Cookies.get('kf_token')
  if(token){
    router.push('/kefu/main')
  }
})
</script>

<style scoped>
.header {
  text-align: center;
  margin-bottom: 20px;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.sign-in {
  width: 380px;
  padding: 20px;
  margin:100px auto;
  background: #fff;
  -webkit-box-shadow: 0 1px 2px 0 rgba(101,129,156,.08);
  box-shadow: 0 1px 2px 0 rgba(101,129,156,.08);
}
.sign-in h1,.sign-in h2,.sign-in .copyright{
  font-weight: normal;
  color: #4d627b;
  text-align: center;
}
.sign-in .loginTitle{
  font-size: 24px;
}
.sign-in .loginDesc{
  font-size: 14px;
  margin-bottom: 15px;
  color: #409EFF;
  text-decoration: none;
  cursor: pointer;
}
.sign-in .copyright{
  font-size: 12px;
}
@media (max-width: 768px) {
  .sign-in{
    width: 90%;
    margin:40px auto;
    background-color: #f5f5f5;
    box-shadow:none;
  }
}
</style>
