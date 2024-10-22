<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>顾客信息</span>
      </div>
      <el-table :data="customerData" style="width: 100%">
        <el-table-column prop="name" label="姓名"></el-table-column>
        <el-table-column prop="phone" label="电话"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="address" label="地址"></el-table-column>
        <el-table-column prop="lastPurchase" label="最近购买日期"></el-table-column>
        <el-table-column prop="totalSpent" label="总消费金额"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Hufu',
  data() {
    return {
      customerData: [
        {
          name: '张三',
          phone: '13800138000',
          email: 'zhangsan@example.com',
          address: '北京市朝阳区',
          lastPurchase: '2023-04-15',
          totalSpent: 5000
        },
        // 添加更多顾客数据...
      ]
    }
  },
  methods: {
    handleEdit(index, row) {
      // 实现编辑功能
      console.log('编辑', index, row)
    },
    handleDelete(index, row) {
      // 实现删除功能
      console.log('删除', index, row)
    }
  }
}
</script>

<style scoped>
.box-card {
  width: 100%;
  margin-bottom: 20px;
}
</style>

