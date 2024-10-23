import service from '@/utils/request'
// @Tags Transaction
// @Summary 创建交易
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body model.Transaction true "创建交易"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"创建成功"}"
// @Router /tx/createTransaction [post]
export const createTransaction = (data) => {
  return service({
    url: '/tx/createTransaction',
    method: 'post',
    data
  })
}

// @Tags Transaction
// @Summary 删除交易
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body model.Transaction true "删除交易"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"删除成功"}"
// @Router /tx/deleteTransaction [delete]
export const deleteTransaction = (params) => {
  return service({
    url: '/tx/deleteTransaction',
    method: 'delete',
    params
  })
}

// @Tags Transaction
// @Summary 批量删除交易
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.IdsReq true "批量删除交易"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"删除成功"}"
// @Router /tx/deleteTransaction [delete]
export const deleteTransactionByIds = (params) => {
  return service({
    url: '/tx/deleteTransactionByIds',
    method: 'delete',
    params
  })
}

// @Tags Transaction
// @Summary 更新交易
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body model.Transaction true "更新交易"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"更新成功"}"
// @Router /tx/updateTransaction [put]
export const updateTransaction = (data) => {
  return service({
    url: '/tx/updateTransaction',
    method: 'put',
    data
  })
}

// @Tags Transaction
// @Summary 用id查询交易
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query model.Transaction true "用id查询交易"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"查询成功"}"
// @Router /tx/findTransaction [get]
export const findTransaction = (params) => {
  return service({
    url: '/tx/findTransaction',
    method: 'get',
    params
  })
}

// @Tags Transaction
// @Summary 分页获取交易列表
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query request.PageInfo true "分页获取交易列表"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"获取成功"}"
// @Router /tx/getTransactionList [get]
export const getTransactionList = (params) => {
  return service({
    url: '/tx/getTransactionList',
    method: 'get',
    params
  })
}

// @Tags Transaction
// @Summary 不需要鉴权的交易接口
// @accept application/json
// @Produce application/json
// @Param data query hufuReq.TransactionSearch true "分页获取交易列表"
// @Success 200 {object} response.Response{data=object,msg=string} "获取成功"
// @Router /tx/getTransactionPublic [get]
export const getTransactionPublic = () => {
  return service({
    url: '/tx/getTransactionPublic',
    method: 'get',
  })
}
