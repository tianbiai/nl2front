import { ref } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'

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

  // 加载文档
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
    loading,
    error,
    loadDoc,
    loadProjectSpec,
    loadProjectChangelog,
    loadPageSpec,
    parseMarkdown
  }
}

export default useDoc
