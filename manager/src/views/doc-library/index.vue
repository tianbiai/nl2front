<template>
  <div class="doc-library-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>文档库</h1>
        <span class="doc-count">共 {{ docStore.docCount }} 个文档</span>
      </div>
      <div class="header-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索文档..."
          clearable
          style="width: 240px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <HelpBubble :items="helpItems" />
      </div>
    </div>

    <!-- 上传区域 -->
    <div
      class="upload-area"
      :class="{ 'drag-over': isDragOver }"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="handleDrop"
      @click="triggerUpload"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept=".md"
        style="display: none"
        @change="handleFileSelect"
      />
      <div class="upload-content">
        <el-icon :size="48" color="var(--text-tertiary)"><Upload /></el-icon>
        <p class="upload-text">拖拽 Markdown 文件到此处，或点击上传</p>
        <p class="upload-tip">仅支持 .md 格式文件</p>
      </div>
    </div>

    <!-- 文档列表 -->
    <div class="doc-list">
      <el-table
        :data="filteredDocs"
        style="width: 100%"
        v-loading="docStore.loading"
        empty-text="暂无文档，请上传"
      >
        <el-table-column label="文档名称" min-width="200">
          <template #default="{ row }">
            <div class="doc-name-cell">
              <span class="doc-icon">📄</span>
              <span class="doc-name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="大小" width="100" align="center">
          <template #default="{ row }">
            {{ formatSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column label="上传时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text size="small" @click="handlePreview(row)">
              <el-icon><View /></el-icon>
              预览
            </el-button>
            <el-button type="danger" text size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      :title="previewDoc?.name"
      width="800px"
      destroy-on-close
    >
      <div class="preview-content" v-html="previewHtml"></div>
    </el-dialog>

    <!-- 上传中对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传文档"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="uploadForm" label-width="80px">
        <el-form-item label="文件">
          <span>{{ uploadFile?.name }}</span>
        </el-form-item>
        <el-form-item label="文档名称">
          <el-input v-model="uploadForm.name" placeholder="留空则使用文件名" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="uploadForm.description"
            type="textarea"
            :rows="3"
            placeholder="文档描述（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="confirmUpload">
          确认上传
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { marked } from 'marked'
import { useDocStore } from '@/stores/doc'
import HelpBubble from '@/components/HelpBubble/index.vue'

const docStore = useDocStore()

// 帮助说明
const helpItems = [
  { content: '文档库用于管理所有上传的 Markdown 文档' },
  { content: '上传后的文档可在菜单编辑器中引用' },
  { content: '支持拖拽上传和点击上传两种方式' }
]

// 搜索关键词
const searchKeyword = ref('')

// 拖拽状态
const isDragOver = ref(false)

// 文件输入框引用
const fileInputRef = ref(null)

// 上传相关
const uploadDialogVisible = ref(false)
const uploadFile = ref(null)
const uploadForm = ref({
  name: '',
  description: ''
})
const uploading = ref(false)

// 预览相关
const previewVisible = ref(false)
const previewDoc = ref(null)
const previewHtml = ref('')

// 过滤后的文档列表
const filteredDocs = computed(() => {
  if (!searchKeyword.value) {
    return docStore.docs
  }
  const keyword = searchKeyword.value.toLowerCase()
  return docStore.docs.filter(doc =>
    doc.name.toLowerCase().includes(keyword) ||
    doc.description?.toLowerCase().includes(keyword)
  )
})

// 格式化文件大小
function formatSize(bytes) {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 触发文件选择
function triggerUpload() {
  fileInputRef.value?.click()
}

// 处理文件选择
function handleFileSelect(event) {
  const file = event.target.files?.[0]
  if (file) {
    prepareUpload(file)
  }
  // 清空 input 以便重复选择同一文件
  event.target.value = ''
}

// 处理拖拽上传
function handleDrop(event) {
  isDragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    if (!file.name.endsWith('.md')) {
      ElMessage.warning('只支持 Markdown (.md) 文件')
      return
    }
    prepareUpload(file)
  }
}

// 准备上传
function prepareUpload(file) {
  uploadFile.value = file
  // 默认使用文件名（去掉扩展名）
  uploadForm.value = {
    name: file.name.replace(/\.md$/i, ''),
    description: ''
  }
  uploadDialogVisible.value = true
}

// 确认上传
async function confirmUpload() {
  if (!uploadFile.value) return

  uploading.value = true
  try {
    await docStore.uploadDoc(uploadFile.value, {
      name: uploadForm.value.name || undefined,
      description: uploadForm.value.description || undefined
    })
    ElMessage.success('上传成功')
    uploadDialogVisible.value = false
    uploadFile.value = null
  } catch (error) {
    ElMessage.error(error.response?.data?.error || '上传失败')
  } finally {
    uploading.value = false
  }
}

// 预览文档
async function handlePreview(doc) {
  try {
    const res = await docStore.loadDocContent(doc.id)
    previewDoc.value = doc
    previewHtml.value = marked.parse(res.content)
    previewVisible.value = true
  } catch (error) {
    ElMessage.error('加载文档失败')
  }
}

// 删除文档
async function handleDelete(doc) {
  try {
    await ElMessageBox.confirm(
      `确定要删除文档"${doc.name}"吗？删除后无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await docStore.deleteDoc(doc.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.error || '删除失败')
    }
  }
}

// 初始化
onMounted(async () => {
  try {
    await docStore.fetchDocs()
  } catch (error) {
    ElMessage.error('加载文档列表失败')
  }
})
</script>

<style lang="scss" scoped>
.doc-library-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background: var(--bg-primary);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header-left {
    display: flex;
    align-items: baseline;
    gap: 12px;

    h1 {
      font-size: 24px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .doc-count {
      font-size: var(--font-size-sm);
      color: var(--text-tertiary);
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-lg);
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-secondary);

  &:hover,
  &.drag-over {
    border-color: var(--primary-color);
    background: rgba(0, 122, 255, 0.05);
  }

  .upload-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    .upload-text {
      font-size: 15px;
      color: var(--text-primary);
      margin: 0;
    }

    .upload-tip {
      font-size: var(--font-size-sm);
      color: var(--text-tertiary);
      margin: 0;
    }
  }
}

.doc-list {
  flex: 1;
  min-height: 0;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;

  :deep(.el-table) {
    height: 100%;
  }
}

.doc-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .doc-icon {
    font-size: 18px;
  }

  .doc-name {
    font-weight: 500;
    color: var(--text-primary);
  }
}

.preview-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 16px;
  line-height: 1.7;

  :deep(h1) {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-light);
  }

  :deep(h2) {
    font-size: 20px;
    font-weight: 600;
    margin: 24px 0 12px;
  }

  :deep(h3) {
    font-size: 17px;
    font-weight: 600;
    margin: 20px 0 10px;
  }

  :deep(p) {
    margin-bottom: 12px;
    color: var(--text-secondary);
  }

  :deep(pre) {
    margin: 12px 0;
    padding: 12px;
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
    overflow-x: auto;
  }

  :deep(code) {
    font-family: var(--font-mono);
    font-size: 13px;
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 24px;
    margin-bottom: 12px;
  }
}
</style>
