import { ref } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import { docApi } from '@/api/doc'

// 配置 marked
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (e) {
        console.error('代码高亮失败:', e)
      }
    }
    return code
  },
  breaks: true,
  gfm: true
})

export function useDoc() {
  const docContent = ref('')
  const docHtml = ref('')
  const loading = ref(false)
  const error = ref(null)
  const docInfo = ref(null)

  // 从 API 加载文档（通过 docId）
  async function loadDocFromApi(docId) {
    if (!docId) {
      error.value = '文档 ID 不能为空'
      return
    }

    loading.value = true
    error.value = null

    try {
      const res = await docApi.getContent(docId)
      docInfo.value = res.doc
      docContent.value = res.content
      docHtml.value = marked.parse(res.content)
    } catch (e) {
      error.value = e.response?.data?.error || e.message || '文档加载失败'
      console.error('文档加载失败:', e)
    } finally {
      loading.value = false
    }
  }

  // 加载文档（保留原方法，用于加载静态文件）
  async function loadDoc(docPath) {
    if (!docPath) {
      error.value = '文档路径不能为空'
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = await fetch(docPath)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      docContent.value = await response.text()
      docHtml.value = marked.parse(docContent.value)
      docInfo.value = null
    } catch (e) {
      error.value = e.message
      console.error('文档加载失败:', e)
    } finally {
      loading.value = false
    }
  }

  // 加载项目 spec.md
  async function loadProjectSpec(projectPath) {
    return loadDoc(`/${projectPath}/spec.md`)
  }

  // 加载项目 changelog.md
  async function loadProjectChangelog(projectPath) {
    return loadDoc(`/${projectPath}/changelog.md`)
  }

  // 加载页面规格文档
  async function loadPageSpec(projectPath, pageName) {
    return loadDoc(`/${projectPath}/specs/${pageName}.md`)
  }

  // 解析 Markdown 文本
  function parseMarkdown(text) {
    if (!text) return ''
    return marked.parse(text)
  }

  return {
    docContent,
    docHtml,
    docInfo,
    loading,
    error,
    loadDoc,
    loadDocFromApi,
    loadProjectSpec,
    loadProjectChangelog,
    loadPageSpec,
    parseMarkdown
  }
}

export default useDoc
