<template>
  <div class="customerservice">
    在此处书写页面代码
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { routerName } from '@/plugin/customerservice/api/api.js'

const data = ref({})

defineOptions({
  name: 'CustomerService'
})

const useApi = async() =>{
    const res = await routerName(data.value)
    if(res.code === 0){
      console.log(res.data)
    }
}


</script>
<style lang="scss" scoped>
.customerservice {

}
</style>
