import service from '@/utils/request'
import Cookies from 'js-cookie'

// 添加请求拦截器
service.interceptors.request.use(
config => {
        config.headers['chat-token'] = Cookies.get('kf_token')
        return config
    },
    error => {
      return Promise.reject(error)
    }
)

export const getServiceInfo = (params) => {
    return service({
        url: '/service/get_kf_info',
        method: 'get',
        params
    })
}

export const sendMessageData = (data) => {
    return service({
        url: '/service/send_msg',
        method: 'post',
        data
    })
}
export const getMsgUser = (params) => {
    return service({
        url: '/service/get_msg_user',
        method: 'get',
        params
    })
}

export const getMsgList = (params) => {
    return service({
        url: '/service/get_msg_list',
        method: 'get',
        params
    })
}

export const setMsgView = (params) => {
    return service({
        url: '/service/set_msg_view',
        method: 'get',
        params
    })
}

export const uploadFile = (data) => {
    return service({
        url: '/service/upload_file',
        method: 'POST',
        data
    })
}

export const getScriptList = (params) => {
    return service({
        url: '/service/get_service_script',
        method: 'get',
        params
    })
}