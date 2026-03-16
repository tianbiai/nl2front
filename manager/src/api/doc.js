/**
 * 文档 API 封装
 */
import request from '@/utils/request'

export const docApi = {
  /**
   * 获取文档列表
   */
  getList() {
    return request.get('/docs')
  },

  /**
   * 上传文档
   * @param {File} file - 文件对象
   * @param {Object} metadata - 元数据 { name, description }
   */
  upload(file, metadata = {}) {
    const formData = new FormData()
    formData.append('file', file)
    if (metadata.name) {
      formData.append('name', metadata.name)
    }
    if (metadata.description) {
      formData.append('description', metadata.description)
    }
    return request.post('/docs/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  /**
   * 获取文档内容
   * @param {string} id - 文档 ID
   */
  getContent(id) {
    return request.get(`/docs/${id}`)
  },

  /**
   * 删除文档
   * @param {string} id - 文档 ID
   */
  delete(id) {
    return request.delete(`/docs/${id}`)
  },

  /**
   * 更新文档元数据
   * @param {string} id - 文档 ID
   * @param {Object} data - 更新数据 { name, description }
   */
  update(id, data) {
    return request.put(`/docs/${id}`, data)
  }
}

export default docApi
