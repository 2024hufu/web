<template>
    <div>
      <div class="decision-table">
        <el-card>
          <div slot="header" class="table-header">
            <span>区块链决策记录</span>
            <el-tooltip content="数据来源于区块链，不可篡改" placement="top">
              <i class="el-icon-info blockchain-icon"></i>
            </el-tooltip>
          </div>
          <el-table :data="decisionData" style="width: 100%">
            <el-table-column prop="id" label="ID" width="100" />
            <el-table-column prop="evidence" label="证据" width="200" />
            <el-table-column prop="node" label="节点" width="150" />
            <el-table-column prop="timestamp" label="时间戳" width="200" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '已通过' ? 'success' : 'danger'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="blockHeight" label="区块高度" width="120" />
            <el-table-column prop="txHash" label="交易哈希" min-width="220">
              <template #default="{ row }">
                <el-link type="primary" :href="'https://explorer.example.com/tx/' + row.txHash" target="_blank"
                  class="hash-link">
                  {{ row.txHash.slice(0, 10) + '...' + row.txHash.slice(-8) }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column prop="address" label="合约地址" width="200" />
          </el-table>
        </el-card>
      </div>
  
      <EventLogs />
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'DecisionTable',
    data() {
      return {
        decisionData: []
      };
    },
    async created() {
      await this.fetchDecisionData();
    },
    methods: {
      async fetchDecisionData() {
        try {
          const response = await axios.post('http://45.8.113.140:3338/api/v1/regulator/event');
  
          if (response.data.code === 0 && response.data.message === 'success') {
            this.decisionData = response.data.data.map((item, index) => {
              const { log } = item;
              // 解析 data 字段，格式为: "证据,节点ID,时间戳,状态"
              const [evidence, nodeId, timestamp, status] = log.data.split(',');
  
              return {
                id: index,
                evidence: evidence,  // 第一个值作为证据
                node: nodeId,       // 第二个值作为节点ID
                timestamp: new Date(parseInt(timestamp)).toLocaleString(),  // 转换时间戳
                status: status === 'true' ? '已通过' : '已拒绝',
                blockHeight: log.blockNumber,
                txHash: log.transactionHash,
                address: log.address // 合约地址
              };
            });
          }
        } catch (error) {
          console.error('获取区块链决策记录失败:', error);
          this.$message.error('获取区块链决策记录失败');
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .decision-table {
    padding: 20px;
  }
  
  .table-header {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    display: flex;
    align-items: center;
  }
  
  .blockchain-icon {
    margin-left: 8px;
    color: #409EFF;
    cursor: help;
  }
  
  .hash-link {
    font-family: monospace;
  }
  
  .hash-link:hover {
    text-decoration: underline;
  }
  
  .el-table th {
    background-color: #f5f7fa;
    color: #333;
  }
  
  .el-table td {
    color: #666;
  }
  </style>