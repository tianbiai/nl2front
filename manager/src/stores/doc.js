/**
 * 文档状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { docApi } from '@/api/doc'

export const useDocStore = defineStore('doc', () => {
  // 状态
  const docs = ref([])
  const loading = ref(false)
  const currentDoc = ref(null)
  const currentContent = ref('')

  // 计算属性
  const docCount = computed(() => docs.value.length)

  /**
   * 获取文档列表
   */
  async function fetchDocs() {
    loading.value = true
    try {
      const res = await docApi.getList()
      docs.value = res.docs || []
      return docs.value
    } catch (error) {
      console.error('获取文档列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 上传文档
   */
  async function uploadDoc(file, metadata = {}) {
    loading.value = true
    try {
      const res = await docApi.upload(file, metadata)
      const newDoc = res.doc
      docs.value.push(newDoc)
      return newDoc
    } catch (error) {
      console.error('上传文档失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取文档内容
   */
  async function loadDocContent(id) {
    loading.value = true
    try {
      const res = await docApi.getContent(id)
      currentDoc.value = res.doc
      currentContent.value = res.content
      return res
    } catch (error) {
      console.error('获取文档内容失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除文档
   */
  async function deleteDoc(id) {
    loading.value = true
    try {
      await docApi.delete(id)
      const index = docs.value.findIndex(d => d.id === id)
      if (index > -1) {
        docs.value.splice(index, 1)
      }
      return true
    } catch (error) {
      console.error('删除文档失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新文档元数据
   */
  async function updateDoc(id, data) {
    loading.value = true
    try {
      const res = await docApi.update(id, data)
      const index = docs.value.findIndex(d => d.id === id)
      if (index > -1) {
        docs.value[index] = res.doc
      }
      return res.doc
    } catch (error) {
      console.error('更新文档失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据 ID 获取文档信息
   */
  function getDocById(id) {
    return docs.value.find(d => d.id === id)
  }

  /**
   * 清除当前文档
   */
  function clearCurrentDoc() {
    currentDoc.value = null
    currentContent.value = ''
  }

  return {
    // 状态
    docs,
    loading,
    currentDoc,
    currentContent,
    docCount,
    // 方法
    fetchDocs,
    uploadDoc,
    loadDocContent,
    deleteDoc,
    updateDoc,
    getDocById,
    clearCurrentDoc
  }
})
