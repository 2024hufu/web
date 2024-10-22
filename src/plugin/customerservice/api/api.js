import service from '@/utils/request'

export const saveService = (data) => {
  return service({
    url: '/service/save_service',
    method: 'post',
    data
  })
}

export const findService = (params) => {
  return service({
    url: '/service/find_service',
    method: 'get',
    params
  })
}

export const getServiceList = (params) => {
  return service({
    url: '/service/get_service_list',
    method: 'get',
    params
  })
}

export const deleteService = (params) => {
  return service({
    url: '/service/delete_service',
    method: 'delete',
    params
  })
}

export const adminServiceLogin = (params) => {
  return service({
    url: '/service/admin_login',
    method: 'get',
    params
  })
}

export const accountServiceLogin = (data) => {
  return service({
    url: '/service/account_login',
    method: 'POST',
    data
  })
}

export const saveScript = (data) => {
  return service({
    url: '/service/save_script',
    method: 'post',
    data
  })
}

export const findScript = (params) => {
  return service({
    url: '/service/find_script',
    method: 'get',
    params
  })
}

export const getScriptList = (params) => {
  return service({
    url: '/service/get_script_list',
    method: 'get',
    params
  })
}

export const deleteScript = (params) => {
  return service({
    url: '/service/delete_script',
    method: 'delete',
    params
  })
}

export const saveReply = (data) => {
  return service({
    url: '/service/save_reply',
    method: 'post',
    data
  })
}

export const findReply = (params) => {
  return service({
    url: '/service/find_reply',
    method: 'get',
    params
  })
}

export const autoReplyList = (params) => {
  return service({
    url: '/service/auto_reply_list',
    method: 'get',
    params
  })
}

export const deleteReply = (params) => {
  return service({
    url: '/service/delete_reply',
    method: 'delete',
    params
  })
}