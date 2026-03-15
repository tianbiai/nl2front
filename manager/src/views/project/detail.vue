<template>
  <div class="project-detail-page">
    <div class="page-header">
      <el-button text @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h2>{{ item?.name }}</h2>
    </div>

    <div class="detail-content">
      <!-- 项目信息 -->
      <div class="info-section">
        <h3>基本信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">图标</span>
            <span class="value icon-value">{{ item?.icon }}</span>
          </div>
          <div class="info-item">
            <span class="label">类型</span>
            <el-tag :type="getTypeTag(item?.type).type">
              {{ getTypeTag(item?.type).label }}
            </el-tag>
          </div>
          <div class="info-item full">
            <span class="label">描述</span>
            <span class="value">{{ item?.description || '暂无描述' }}</span>
          </div>
          <div v-if="item?.url" class="info-item full">
            <span class="label">URL</span>
            <span class="value link" @click="openUrl(item.url)">{{ item.url }}</span>
          </div>
          <div v-if="item?.projectPath" class="info-item full">
            <span class="label">项目路径</span>
            <span class="value">{{ item.projectPath }}</span>
          </div>
        </div>
      </div>

      <!-- 相关文档 -->
      <div v-if="item?.projectPath" class="info-section">
        <h3>相关文档</h3>
        <div class="doc-list">
          <div class="doc-item" @click="viewDoc('spec')">
            <el-icon :size="24"><Document /></el-icon>
            <div class="doc-info">
              <span class="doc-name">项目规格 (spec.md)</span>
              <span class="doc-desc">项目整体规格说明</span>
            </div>
            <el-icon><ArrowRight /></el-icon>
          </div>
          <div class="doc-item" @click="viewDoc('changelog')">
            <el-icon :size="24"><Tickets /></el-icon>
            <div class="doc-info">
              <span class="doc-name">变更日志 (changelog.md)</span>
              <span class="doc-desc">项目变更记录</span>
            </div>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="info-section">
        <h3>快速操作</h3>
        <div class="action-list">
          <el-button type="primary" @click="openProject">
            <el-icon><View /></el-icon>
            打开项目
          </el-button>
          <el-button v-if="item?.url" @click="openExternal">
            <el-icon><Link /></el-icon>
            新窗口打开
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMenuStore } from '@/stores/menu'

const route = useRoute()
const router = useRouter()
const menuStore = useMenuStore()

// 当前项目
const item = computed(() => {
  const itemId = route.params.id
  for (const group of menuStore.groups) {
    const found = group.children?.find(i => i.id === itemId)
    if (found) return found
  }
  return null
})

// 获取类型标签
function getTypeTag(type) {
  const types = {
    web: { label: 'Web 应用', type: '' },
    mobile: { label: '移动端应用', type: 'success' },
    doc: { label: '文档', type: 'info' },
    internal: { label: '内部页面', type: 'warning' }
  }
  return types[type] || types.web
}

// 返回
function goBack() {
  router.back()
}

// 打开项目
function openProject() {
  if (item.value) {
    router.push(`/content/${item.value.type}/${item.value.id}`)
  }
}

// 在新窗口打开
function openExternal() {
  if (item.value?.url) {
    window.open(item.value.url, '_blank')
  }
}

// 打开 URL
function openUrl(url) {
  window.open(url, '_blank')
}

// 查看文档
function viewDoc(type) {
  if (item.value) {
    // 跳转到文档页面
    router.push(`/content/${item.value.type}/${item.value.id}`)
  }
}

// 加载菜单配置
onMounted(() => {
  if (menuStore.groups.length === 0) {
    menuStore.loadMenuConfig()
  }
})
</script>

<style lang="scss" scoped>
.project-detail-page {
  max-width: 800px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;

  h2 {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.info-section {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 24px;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;

  &.full {
    grid-column: 1 / -1;
  }

  .label {
    width: 80px;
    font-size: var(--font-size-sm);
    color: var(--text-tertiary);
  }

  .value {
    flex: 1;
    font-size: var(--font-size-base);
    color: var(--text-primary);

    &.icon-value {
      font-size: 32px;
    }

    &.link {
      color: var(--primary-color);
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.doc-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.doc-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--bg-hover);
  }

  .doc-info {
    flex: 1;

    .doc-name {
      display: block;
      font-size: var(--font-size-base);
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .doc-desc {
      font-size: var(--font-size-sm);
      color: var(--text-tertiary);
    }
  }
}

.action-list {
  display: flex;
  gap: 12px;
}
</style>
