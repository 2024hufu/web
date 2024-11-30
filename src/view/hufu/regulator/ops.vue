<template>
  <div>
    <div class="decision-cards">
      <el-card class="page-header">
        <div class="table-header">
          <span class="title-with-bar">区块链决策记录</span>
          <el-tooltip content="数据来源于区块链，不可篡改" placement="top">
            <i class="el-icon-info blockchain-icon"></i>
          </el-tooltip>
        </div>
      </el-card>

      <el-row :gutter="24">
        <el-col :span="8" v-for="item in decisionData" :key="item.id">
          <el-card class="decision-card" shadow="hover">
            <div class="card-header">
              <el-tag 
                :type="item.status === '已通过' ? 'success' : 'danger'" 
                class="status-tag"
                effect="dark"
              >
                {{ item.status }}
              </el-tag>
              <span class="wallet-info">{{ item.walletInfo }}</span>
            </div>
            
            <div class="card-content">
              <div class="evidence-box">
                <div class="label">异常证据:</div>
                <div class="value">{{ item.evidence }}</div>
              </div>
              
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">节点:</span>
                  <span class="value">{{ item.node }}</span>
                </div>
                
                <div class="info-item">
                  <span class="label">时间:</span>
                  <span class="value">{{ item.createTime }}</span>
                </div>
                
                <div class="info-item">
                  <span class="label">区块高度:</span>
                  <span class="value">{{ item.blockHeight }}</span>
                </div>
                
                <div class="info-item">
                  <span class="label">交易哈希:</span>
                  <el-tooltip :content="item.txHash" placement="top">
                    <span class="value hash-text">
                      {{ item.txHash.slice(0, 10) + '...' + item.txHash.slice(-8) }}
                    </span>
                  </el-tooltip>
                </div>
                
                <div class="info-item">
                  <span class="label">合约地址:</span>
                  <el-tooltip :content="item.address" placement="top">
                    <span class="value hash-text">{{ item.address }}</span>
                  </el-tooltip>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
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
        console.log(response.data);
        if (response.data.code === 0 && response.data.message === 'success') {
          this.decisionData = response.data.data.map((item, index) => {
            const { log } = item;
            
            // 解析data字段
            const parts = log.data.split(',');
            // 获取最后三个元素
            const nodeId = parts[parts.length - 3];
            const timestamp = parts[parts.length - 2];
            const status = parts[parts.length - 1];
            
            // 获取异常证据（除去最后三个元素的所有内容）
            const evidence = parts.slice(0, -3).join(',');

            return {
              id: index,
              walletInfo: evidence.split('-')[0] + '-' + evidence.split('-')[1], // 提取wallet-12部分
              evidence: evidence,
              createTime: new Date(parseInt(timestamp)).toLocaleString(),
              node: nodeId,
              timestamp: new Date(parseInt(timestamp)).toLocaleString(),
              status: status === 'true' ? '已通过' : '已拒绝',
              blockHeight: log.blockNumber,
              txHash: log.transactionHash,
              address: log.address
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
.decision-cards {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.table-header {
  font-size: 18px;
  font-weight: 500;
  color: #2c3e50;
  display: flex;
  align-items: center;
}

.blockchain-icon {
  margin-left: 8px;
  color: #1976d2;
  cursor: help;
  transition: color 0.3s ease;
}

.blockchain-icon:hover {
  color: #1565c0;
}

.decision-card {
  margin-bottom: 24px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px -1px rgba(0,0,0,0.1), 
              0 4px 5px 0 rgba(0,0,0,0.07), 
              0 1px 10px 0 rgba(0,0,0,0.06);
}

.decision-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px -2px rgba(0,0,0,0.1), 
              0 6px 20px 0 rgba(0,0,0,0.08);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 8px 0;
}

.status-tag {
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: 500;
}

.wallet-info {
  font-weight: 500;
  color: #2c3e50;
  margin-left: 12px;
}

.card-content {
  font-size: 14px;
}

.evidence-box {
  margin-bottom: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  border-left: 4px solid #1976d2;
}

.evidence-box .label {
  color: #5c6b77;
  margin-bottom: 8px;
  font-weight: 500;
}

.evidence-box .value {
  color: #2c3e50;
  word-break: break-all;
  line-height: 1.5;
}

.info-grid {
  display: grid;
  grid-gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item .label {
  color: #5c6b77;
  width: 80px;
  flex-shrink: 0;
  font-weight: 500;
}

.info-item .value {
  color: #2c3e50;
  word-break: break-all;
}

.hash-text {
  font-family: 'Roboto Mono', monospace;
  color: #1976d2;
  cursor: pointer;
  transition: color 0.3s ease;
  padding: 2px 4px;
  background: rgba(25, 118, 210, 0.08);
  border-radius: 4px;
}

.hash-text:hover {
  color: #1565c0;
  background: rgba(25, 118, 210, 0.12);
}

.title-with-bar {
  position: relative;
  padding-left: 12px;
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.title-with-bar::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background-color: #1976d2;
  border-radius: 2px;
}
</style>