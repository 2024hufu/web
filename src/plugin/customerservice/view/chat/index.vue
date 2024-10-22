<template>
  <div style="width: 70%;margin-left: auto; margin-right: auto; ">
    <el-container style="overflow: hidden;">
      <!-- Header Section -->
      <el-header class="header">
        <el-row type="flex" justify="space-between" align="bottom">
          <div class="logo"></div>
          <div class="user-info">
            <el-avatar :src="kfInfo.avatar" />
            <span>{{ kfInfo.nickname }}</span>
            <el-badge :value="kfInfo.online ? '在线' : '离线'" class="status-badge" :color="kfInfo.online ? '#ff4d4f' : '#e4e7ed'" ></el-badge>
            <el-button type="primary" @click="logout">退出登录</el-button>
          </div>
        </el-row>
      </el-header>

      <el-container>
        <!-- Sidebar Section -->
        <el-aside width="250px" class="sidebar">
<!--          <el-input placeholder="搜索用户名" class="search-input"></el-input>-->
          <div class="user-list">
            <div class="user-item" :class="{ 'selected': currentUser.id === user.id }" v-for="user in users" :key="user.id" @click="selectUser(user)">
              <div class="avatar">
                <el-avatar :src="user.avatar" :style="{ filter: user.online ? 'none' : 'grayscale(100%)' }"/>
              </div>
              <div class="user-info-2">
                <div>
                  {{ user.nickname }}
                </div>
                <div class="last-message">
                  {{ truncateMessage(user.message) }}
                </div>
              </div>
              <div class="user-meta">
                <div class="message-date">{{ user.add_time_str }}</div>
                <div class="unread-count" v-if="user.no_read > 0">
                  {{ user.no_read > 99 ? '99+' : user.no_read }}
                </div>
                <div class="unread-placeholder" v-else></div>
              </div>
            </div>
          </div>



        </el-aside>
        <!-- Main Content Section -->
        <el-container>
          <el-main class="chat-container">
            <div class="chat-box">
              <el-scrollbar height="500px" ref="chatBox" @scroll="handleScroll">
                <div class="chat-message" v-for="message in messages" :key="message.id" :class="{'message-sent': message.is_kf == 1, 'message-received': message.is_kf != 1}">
                  <span class="timestamp">{{ formatTimestamp(message.add_time) }}</span>
                  <div class="message-content">
                    <el-avatar :src="kfInfo.avatar" class="message-avatar" v-if="message.is_kf===1"/>
                    <el-avatar :src="currentUser.avatar" class="message-avatar" v-else/>
                    <el-card class="chat-bubble" :class="{ 'kf-background': message.is_kf === 1, 'user-background': message.is_kf === 0 }">
                      <el-image
                          preview-teleported
                          style="width: 50px; height: 50px"
                          :src="message.content"
                          fit="cover"
                          :preview-src-list="[message.content]"
                          v-if="message.msg_type ==3"
                      >
                      </el-image>
                      <p v-else>{{ message.content }}</p>
                    </el-card></div>

                </div>
              </el-scrollbar>
            </div>
            <div class="message-options">
              <el-popover
                  placement="top-start"
                  :width="200"
                  trigger="hover"
              >
                <template #reference>
                  <div style="width: 32px;height: 32px;margin-right: 20px;"><svg t="1721982458168" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1587" width="32" height="32"><path d="M508.544 66.88A448 448 0 0 0 60.992 514.432a448 448 0 0 0 447.552 447.552 448 448 0 0 0 447.552-447.552 448 448 0 0 0-447.552-447.552z m0 831.104a384 384 0 0 1-383.552-383.552 384 384 0 0 1 383.552-383.552 384 384 0 0 1 383.552 383.552 384 384 0 0 1-383.552 383.552z" p-id="1588" fill="#409efc"></path><path d="M367.488 404.48m-48 0a48 48 0 1 0 96 0 48 48 0 1 0-96 0Z" p-id="1589" fill="#409efc"></path><path d="M635.52 404.48m-48 0a48 48 0 1 0 96 0 48 48 0 1 0-96 0Z" p-id="1590" fill="#409efc"></path><path d="M669.248 613.056a31.936 31.936 0 0 0-44.16 9.664c-20.8 32.448-67.968 53.44-120.064 53.44-52.096 0-99.2-20.928-120-53.376a32 32 0 1 0-53.888 34.496c32.768 51.136 99.392 82.88 173.888 82.88 74.56 0 141.184-31.744 173.952-82.944a32 32 0 0 0-9.728-44.16z" p-id="1591" fill="#409efc"></path></svg></div>
                </template>
                <div class="emoji-picker">
                  <span v-for="emoji in emojis" :key="emoji" @click="selectEmoji(emoji)">{{ emoji }}</span>
                </div>
              </el-popover>
              <el-upload
                  class="avatar-uploader"
                  action="#"
                  :show-file-list = "false"
                  :http-request="customUpload"
              >
                <el-icon color="#409efc"  :size="32" style="margin-right: 20px;"><Picture />
                </el-icon>
              </el-upload>

              <el-icon color="#409efc" @click="toggleScriptLibrary" :size="32" style="margin-right: 20px;"><Notebook /></el-icon>
            </div>
            <el-input type="textarea" placeholder="请输入文字内容" v-model="newMessage" class="message-input" :autosize="{ minRows: 8, maxRows: 8 }"></el-input>
            <el-button type="primary" @click="sendMessage" class="send-button">发送</el-button>
          </el-main>

          <!-- User Info Section with Tabs -->
          <el-aside width="300px" class="user-details">
            <el-tabs v-model="activeTab" @tab-click="handleTabClick">
              <el-tab-pane label="客户信息" name="customer-info">
                <el-card v-if="currentUser.uid">
                  <el-avatar :src="currentUser.avatar" />
                  <p>手机号码: {{ currentUser.phone }}</p>
                  <p>用户等级: {{ currentUser.level }}</p>
                  <p>推荐人: {{ currentUser.referrer }}</p>
                  <p>余额: {{ currentUser.balance }}</p>
                  <p>推广员: {{ currentUser.promoter ? '是' : '否' }}</p>
                </el-card>
                <el-card v-else>暂无信息</el-card>
              </el-tab-pane>
              <el-tab-pane label="交易订单" name="transaction-orders">
                <el-tabs tab-position="top" v-model="activeOrderTab">
                  <el-tab-pane label="全部" name="all-orders">
                    <p>这里显示全部订单内容。</p>
                  </el-tab-pane>
                  <el-tab-pane label="未支付" name="unpaid-orders">
                    <p>这里显示未支付订单内容。</p>
                  </el-tab-pane>
                  <el-tab-pane label="未发货" name="unshipped-orders">
                    <p>这里显示未发货订单内容。</p>
                  </el-tab-pane>
                  <el-tab-pane label="退款中" name="refunding-orders">
                    <p>这里显示退款中订单内容。</p>
                  </el-tab-pane>
                </el-tabs>
              </el-tab-pane>
              <el-tab-pane label="商品信息" name="product-info">
                <el-tabs tab-position="top" v-model="activeProductTab">
                  <el-tab-pane label="购买" name="purchased-products">
                    <p>这里显示已购买商品内容。</p>
                  </el-tab-pane>
                  <el-tab-pane label="足迹" name="footprints">
                    <p>这里显示浏览足迹内容。</p>
                  </el-tab-pane>
                  <el-tab-pane label="收藏" name="collected-products">
                    <p>这里显示收藏商品内容。</p>
                  </el-tab-pane>
                </el-tabs>
              </el-tab-pane>
            </el-tabs>
          </el-aside>
        </el-container>
      </el-container>
      <!-- Script Library Dialog -->
      <el-dialog title="话术库" v-model="showScriptLibrary" width="50%">
        <el-tabs v-model="activeScriptTab" @tab-click="handleClick">
          <el-tab-pane label="个人库" name="personal-library">
            <div v-for="script in personalScripts" :key="script.id" @click="selectScript(script)" class="script-item">
              <span class="script-title">{{ script.title }}</span>
              <span class="script-content">{{ script.content }}</span>
            </div>

          </el-tab-pane>
          <el-tab-pane label="公共库" name="public-library">
            <div v-for="script in publicScripts" :key="script.id" @click="selectScript(script)" class="script-item">
              <span class="script-title">{{ script.title }}</span>
              <span class="script-content">{{ script.content }}</span>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-dialog>
    </el-container>
  </div>
</template>

<script setup>
defineOptions({
  name: 'ServiceMain'
})
import { ref ,nextTick, onMounted ,onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { ElScrollbar } from 'element-plus'
import { Picture,Notebook } from '@element-plus/icons-vue'
import Cookies from 'js-cookie'
import {
  getServiceInfo,
  getMsgList,
  getMsgUser,
  sendMessageData,
  setMsgView,
  uploadFile,
  getScriptList
} from "@/plugin/customerservice/api/ws"
import { useRouter } from 'vue-router'

const currentUser = ref({})
const token = ref('')
const router = useRouter()

// 定义消息结构体
const message = ref('')

const kfInfo = ref({
  nickname:"",
  avatar:"",
  online:0,
  id:0
})

const fileList = ref([])
const chatBox = ref(null)

const websocket = ref(null)

const currentPage = ref(2)

// Function to initialize the WebSocket connection
const initWebSocket = () => {
  websocket.value = new WebSocket(`ws://localhost:8888/service/serve_ws?token=${token.value}`) // Replace with your WebSocket URL

  websocket.value.onopen = () => {
    console.log('WebSocket connection opened')
  }

  websocket.value.onmessage = async (event) => {
    const message = JSON.parse(event.data)
    switch (message.type){
      case "pong":
        break;
      case "message":
        if(message.data.receiver == kfInfo.value.id){
          if(users.value.length === 0){
            await getMsgUsers()
          }
          else{
            const user = users.value.find(user => user.uid == message.data.sender)
            if (user) {
              if(user.uid == currentUser.value.uid){
                messages.value.push({
                  id: Date.now(),
                  content: message.data.content,
                  msg_type: message.data.msg_type,
                  type: message.data.msg_type,
                  role: 'user',
                  timestamp: Math.floor(Date.now() / 1000),
                  add_time: Math.floor(Date.now() / 1000),
                  is_kf:0
                })
              }
              if( message.data.msg_type == 3){
                user.message = '[图片]'
              }
              else{
                user.message = message.data.content
              }
              user.no_read = (user.no_read || 0 ) + 1

              await nextTick()
              chatBox.value.wrapRef.scrollTop = chatBox.value.wrapRef.scrollHeight
            }
          }
        }
        break;
      case "offline":
        //更新用户在线状态
        updateUserOnlineStatus(message.data.sender,0)
        break;
      case "online":
        //更新用户在线状态
        updateUserOnlineStatus(message.data.sender,1)
        break;
    }
  }

  // 更新用户在线状态的方法
  const updateUserOnlineStatus = (userId, isOnline) => {
    const user = users.value.find(user => user.uid == userId);
    if (user) {
      user.online = isOnline ? 1 : 0;
    }
  }

  websocket.value.onerror = (error) => {
    console.error('WebSocket error:', error)
  }

  websocket.value.onclose = () => {
    kfInfo.value.online = 0
    console.log('WebSocket connection closed')
  }
}

const truncateMessage = (message) => {
  return message.length > 10 ? message.slice(0, 10) + '...' : message
}

const formatDate = (date) => {
  return date.toLocaleDateString() // 或者根据需求自定义格式
}

const sendMessage = async () => {
  if(!currentUser.value.uid){
    ElMessage.error('先选择聊天用户')
    return
  }
  if (!newMessage.value) {
    ElMessage.error('请输入消息内容')
    return
  }
  const message = {
    sender: String(kfInfo.value.id),
    receiver: String(currentUser.value.uid),
    msg_type: '1',
    type: '1',
    role: 'kf',
    timestamp: Math.floor(Date.now() / 1000),
    add_time: Math.floor(Date.now() / 1000),
    avatar_url: kfInfo.value.avatar,
    nickname: kfInfo.value.nickname,
    content: newMessage.value,
    is_kf:1
  }

  try {
    const response = await sendMessageData(message);
    if(response.code !== 0){
      ElMessage.error(response.msg)
      return
    }
    currentUser.value.message = newMessage.value
    messages.value.push(message)
    newMessage.value = ''
    await nextTick()
    chatBox.value.wrapRef.scrollTop = chatBox.value.wrapRef.scrollHeight
    currentUser.value.no_read = 0
    setMsgView({uid:currentUser.value.uid})

  } catch (error) {
    console.error('请求失败:', error);
  }
}

const sendPing = () => {
  setInterval(function () {
    if(websocket.value && websocket.value.readyState === WebSocket.OPEN){
      websocket.value.send(JSON.stringify({
        type: 'ping',data: {timestamp:Date.now(),}
      }))
    }
  },5000)
}

const getMsgUsers = async () => {
  const response = await getMsgUser({kf_id:kfInfo.value.id});
  if(response.code === 0){
    users.value = response.data
  }else{
    ElMessage.error(response.msg)
  }
}

const getKfInfo = async () => {
  const response = await getServiceInfo({});
  if(response.code === 0){
    kfInfo.value = response.data
  }else{
    ElMessage.error(response.msg)
  }
}

onMounted(async () => {
  await getCookie()
})

const customUpload = async (response) => {
  if(!currentUser.value.uid){
    ElMessage.error('请先选择用户')
    return
  }
  const formData = new FormData();
  console.log(response)
  formData.append('file', response.file);
  const res = await uploadFile(formData)
  // 使用上传后的文件URL（例如，显示图片或保存URL）
  if (res.code===0) {
    const message = {
      sender: String(kfInfo.value.id),
      receiver: String(currentUser.value.uid),
      msg_type: '3',
      type: '3',
      role: 'kf',
      timestamp: Math.floor(Date.now() / 1000),
      add_time: Math.floor(Date.now() / 1000),
      avatar_url: kfInfo.value.avatar,
      nickname: kfInfo.value.nickname,
      content: res.data,
      is_kf:1
    }
    try {
      const response2 = await sendMessageData(message);
      if(response2.code !== 0){
        ElMessage.error(response2.msg)
        return
      }
      currentUser.value.message = '[图片]'
      currentUser.value.add_time_str = formatTimestamp2(Date.now())
      messages.value.push(message)
      newMessage.value = ''
      await nextTick()
      chatBox.value.wrapRef.scrollTop = chatBox.value.wrapRef.scrollHeight

    } catch (error) {
      console.error('请求失败:', error)
    }
  }
}

const formatTimestamp2 = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);

  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  if (date >= todayStart) {
    // 显示小时和分钟
    return date.toTimeString().slice(0, 5); // HH:mm
  } else if (date >= yesterdayStart && date < todayStart) {
    // 显示“昨天”
    return '昨天';
  } else {
    // 显示月日
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}-${day}`; // MM-DD
  }
}

const getCookie = async () => {
  token.value = Cookies.get('kf_token')
  if(!token.value){
    // window.open(window.location.protocol + '//' + window.location.host + '/#/kefu/login')
    // return
    router.push('/kefu/login')
  }
  else{
    await getKfInfo()
    await getMsgUsers()
    initWebSocket()
    sendPing()
  }
  console.log('Cookie value: ' + token.value)
}

// 滚动事件处理函数
const handleScroll =  async (e) => {
  if(e.scrollTop === 0){
    await loadMessages(currentPage.value)
  }
}

// 加载聊天记录的函数
const loadMessages = async (page = 1) => {

  try {
    const response2 = await getMsgList({kf_id:kfInfo.value.id,uid:currentUser.value.uid,page:page})
    if(response2.code === 0 && response2.data.list.length > 0){
      messages.value = [...response2.data.list, ...messages.value]
      currentPage.value++;
    }
  } catch (error) {
    console.error('Failed to load messages:', error)
  }
}

// 在组件卸载时关闭 WebSocket 连接
onUnmounted(() => {
  if (websocket.value) {
    websocket.value.close()
  }
})

const users = ref([])
const user = ref({
  nickname:"",
  avatar:""
});

const messages = ref([])

const newMessage = ref('')
const activeTab = ref('customer-info')
const activeOrderTab = ref('all-orders')
const activeProductTab = ref('purchased-products')

const emojis = ref(['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊'])
const showEmojiPicker = ref(false)
const showScriptLibrary = ref(false)
const activeScriptTab = ref('personal-library')

const personalScripts = ref([
])

const publicScripts = ref([
])

// 时间格式化函数
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000); // 将秒转换为毫秒
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const selectUser = async (user) => {
  user.no_read = 0
  currentUser.value = user;
  currentPage.value = 2
  //把选中用户的消息设置为已读
  await setMsgView({kf_id:kfInfo.value.id,uid:currentUser.value.uid})
  const response2 = await getMsgList({kf_id:kfInfo.value.id,uid:currentUser.value.uid})
  if(response2.code === 0){
    messages.value = response2.data.list
    await nextTick()
    chatBox.value.wrapRef.scrollTop = chatBox.value.wrapRef.scrollHeight
  }else{
    ElMessage.error(response2.msg)
  }
}

const handleTabClick = (tab) => {
  console.log('Tab clicked:', tab);
}

const logout = () => {
  token.value = Cookies.set('kf_token','');
  router.push('/kefu/login');
}

const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value;
}

const selectEmoji = (emoji) => {
  newMessage.value += emoji;
  showEmojiPicker.value = false;
}


const toggleScriptLibrary = async () => {
  showScriptLibrary.value = !showScriptLibrary.value;
  const res = await getScriptList({type:'1'})
  if (res.code === 0) {

  }
}

const handleClick = async (tab, event) => {
  let cType
  if(tab.paneName === 'personal-library'){
    cType = '1'
    const res = await getScriptList({type:cType})
    if(res.code === 0){
      personalScripts.value = res.data
      console.log(personalScripts.value)
    }
  }else{
    cType = '2'
    const res = await getScriptList({type:cType})
    if(res.code === 0){
      publicScripts.value = res.data
    }
  }
}

const selectScript = (script) => {
  newMessage.value = script.content;
  showScriptLibrary.value = false;
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: filter 0.5s;
}
.header {
  background-color: #409EFF;
  display: flex;
  color: #fff;
  padding: 0 20px;
  justify-content: flex-end; /* 将内容右对齐 */
  align-items: center; /* 使文字垂直居中 */
  height: 60px; /* 设置头部高度 */
}

.logo {
  font-size: 24px;
  font-weight: bold;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-info span {
  margin-left: 10px;
}

.status-badge {
  margin-left: 10px;
}

.sidebar {
  background-color: #f5f5f5;
  padding: 10px;
}

.search-input {
  margin-bottom: 10px;
}

.chat-container {
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.chat-box {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 10px;
}

.chat-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.timestamp {
  font-size: 0.75em;
  color: #888;
  margin-bottom: 5px;
  text-align: center;
  width: 100%;
}

.message-content {
  display: flex;
  align-items: center;
  width: 95%;
}

.message-sent .message-content {
  justify-content: flex-end;
}

.message-received .message-content {
  justify-content: flex-start;
}

.chat-bubble {
  max-width: 70%;
  word-wrap: break-word;
  padding: 10px;
}

.message-avatar {
  margin-right: 10px;
}

.message-sent .message-avatar {
  order: 2;
  margin-left: 10px;
  margin-right: 0;
}



.message-options {
  display: flex;
  justify-content: flex-start; /* Align buttons to the left */
  margin-bottom: 10px;
}

.message-input {
  margin-bottom: 10px;
}

.send-button {
  align-self: flex-end;
}

.user-details {
  background-color: #f5f5f5;
  padding: 10px;
}

.emoji-picker {
  display: flex;
  flex-wrap: wrap;
}

.emoji-picker span {
  cursor: pointer;
  margin: 5px;
  font-size: 24px;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.user-item.selected {
  background-color: #e4e7ed; /* 高亮显示颜色 */
}

.avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.user-info-2 {
  flex-grow: 1;
  margin-left: 10px;
}


.last-message {
  color: #999;
  font-size: 12px;
}

.user-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-date {
  font-size: 12px;
  color: #999;
}

.unread-count {
  margin-top: 5px;
  background-color: #ff4d4f;
  color: #fff;
  border-radius: 10px;
  font-size: 13px;
  padding: 0 5px;
}
.unread-placeholder {
  height: 20px;
  visibility: hidden; /* 保持布局但不显示内容 */
}

.kf-background {
  background-color: #95ec69; /* 类似微信的背景色 */
  border-radius: 10px;
}

.user-background {
  background-color:#ffffff; /* 用户消息的背景色 */
  border-radius: 10px;
}
.script-item {
  margin-top: 15px; /* Add space between each item */
}

.script-title {
  font-weight: bold;
}

.script-content {
  color: #7a7a7a;
  margin-left: 10px;
}
</style>
