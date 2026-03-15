<template>
  <div class="item-editor">
    <div class="item-header">
      <el-icon class="item-drag-handle"><Rank /></el-icon>
      <span class="item-icon">{{ localItem.icon }}</span>
      <el-input
        v-model="localItem.name"
        size="small"
        placeholder="名称"
        class="name-input"
        @change="handleUpdate"
        @click.stop
      />
      <el-tag size="small" :type="typeTag.type">
        <span class="type-tag-content">
          <span class="type-tag-icon">{{ typeTag.icon }}</span>
          <span class="type-tag-label">{{ typeTag.label }}</span>
        </span>
      </el-tag>
      <el-button
        type="primary"
        text
        size="small"
        @click.stop="showEditDialog = true"
      >
        <el-icon><Edit /></el-icon>
      </el-button>
      <el-button
        type="danger"
        text
        size="small"
        @click.stop="$emit('delete')"
      >
        <el-icon><Delete /></el-icon>
      </el-button>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑菜单项"
      width="550px"
      destroy-on-close
      append-to-body
      center
      :modal-append-to-body="true"
    >
      <el-form
        ref="formRef"
        :model="editForm"
        :rules="itemRules"
        label-width="140px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="editForm.name" placeholder="菜单项名称" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="editForm.icon" placeholder="如：📱" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="editForm.type" style="width: 100%">
            <el-option label="Web 应用" value="web" />
            <el-option label="移动端应用" value="mobile" />
            <el-option label="文档" value="doc" />
            <el-option label="API 文档" value="swagger" />
          </el-select>
        </el-form-item>

        <!-- Web/移动端配置 -->
        <template v-if="editForm.type === 'web' || editForm.type === 'mobile'">
          <el-form-item label="URL" prop="url">
            <el-input v-model="editForm.url" placeholder="http://localhost:3000" />
          </el-form-item>
          <el-form-item label="项目路径">
            <el-input v-model="editForm.projectPath" placeholder="projects/my-project" />
          </el-form-item>
          <el-form-item v-if="editForm.type === 'mobile'" label="视口尺寸">
            <div style="display: flex; gap: 12px;">
              <el-input-number v-model="editForm.viewport.width" :min="200" :max="1000" />
              <el-input-number v-model="editForm.viewport.height" :min="400" :max="2000" />
            </div>
          </el-form-item>
        </template>

        <!-- Swagger API 文档配置 -->
        <template v-if="editForm.type === 'swagger'">
          <el-form-item label="API 文档 URL" prop="url">
            <el-input v-model="editForm.url" placeholder="http://localhost:8080/swagger-ui.html" />
          </el-form-item>
          <el-form-item label="接口描述">
            <el-input v-model="editForm.apiDescription" placeholder="接口服务描述（可选）" />
          </el-form-item>
          <el-form-item label="启用 Basic 认证" class="no-wrap-label">
            <el-switch v-model="editForm.useAuth" />
          </el-form-item>
          <template v-if="editForm.useAuth">
            <el-form-item label="用户名">
              <el-input v-model="editForm.authUsername" placeholder="输入用户名" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="editForm.authPassword" type="password" placeholder="输入密码" show-password />
            </el-form-item>
          </template>
        </template>

        <!-- 文档配置 -->
        <template v-if="editForm.type === 'doc'">
          <el-form-item label="文档路径" prop="docPath">
            <el-input v-model="editForm.docPath" placeholder="path/to/doc.md" />
          </el-form-item>
        </template>

        <el-form-item label="描述">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="2"
            placeholder="菜单项描述（可选）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update', 'delete'])

const localItem = reactive({ ...props.item })
const showEditDialog = ref(false)
const formRef = ref(null)

const editForm = reactive({
  name: '',
  icon: '',
  type: 'web',
  url: '',
  docPath: '',
  route: '',
  description: '',
  projectPath: '',
  apiDescription: '',
  useAuth: false,
  authUsername: '',
  authPassword: '',
  viewport: { width: 375, height: 812 }
})

const itemRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

// 类型标签
const typeTag = computed(() => {
  const types = {
    web: { label: 'Web', icon: '🖥️', type: '' },
    mobile: { label: '移动端', icon: '📱', type: 'success' },
    doc: { label: '文档', icon: '📄', type: 'info' },
    swagger: { label: 'API', icon: '📚', type: 'danger' }
  }
  return types[localItem.type] || types.web
})

// 监听 item 变化
watch(() => props.item, (newItem) => {
  Object.assign(localItem, newItem)
}, { deep: true })

// 监听编辑对话框打开
watch(showEditDialog, (visible) => {
  if (visible) {
    Object.assign(editForm, {
      name: localItem.name,
      icon: localItem.icon,
      type: localItem.type,
      url: localItem.url || '',
      docPath: localItem.docPath || '',
      route: localItem.route || '',
      description: localItem.description || '',
      projectPath: localItem.projectPath || '',
      apiDescription: localItem.apiDescription || '',
      useAuth: localItem.useAuth || false,
      authUsername: localItem.authUsername || '',
      authPassword: localItem.authPassword || '',
      viewport: localItem.viewport || { width: 375, height: 812 }
    })
  }
})

// 处理更新
function handleUpdate() {
  emit('update', { name: localItem.name })
}

// 保存编辑
async function handleSave() {
  try {
    await formRef.value.validate()

    const updates = {
      name: editForm.name,
      icon: editForm.icon,
      type: editForm.type,
      description: editForm.description
    }

    if (editForm.type === 'web' || editForm.type === 'mobile') {
      updates.url = editForm.url
      updates.projectPath = editForm.projectPath
      if (editForm.type === 'mobile') {
        updates.viewport = { ...editForm.viewport }
      }
    } else if (editForm.type === 'swagger') {
      updates.url = editForm.url
      updates.apiDescription = editForm.apiDescription
      updates.useAuth = editForm.useAuth
      updates.authUsername = editForm.authUsername
      updates.authPassword = editForm.authPassword
    } else if (editForm.type === 'doc') {
      updates.docPath = editForm.docPath
    }

    Object.assign(localItem, updates)
    emit('update', updates)
    showEditDialog.value = false
  } catch {
    // 验证失败
  }
}
</script>

<style lang="scss" scoped>
.item-editor {
  margin-bottom: 8px;
  padding: 10px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  transition: all 0.2s;

  &:hover {
    border-color: var(--border-color);
  }
}

.item-header {
  display: flex;
  align-items: center;
  gap: 8px;

  .item-drag-handle {
    cursor: grab;
    color: var(--text-tertiary);

    &:active {
      cursor: grabbing;
    }
  }

  .item-icon {
    font-size: 16px;
  }

  .name-input {
    flex: 1;
  }

  .type-tag-content {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .type-tag-icon {
    font-size: 12px;
  }

  .type-tag-label {
    font-size: var(--font-size-xs);
  }
}

.no-wrap-label :deep(.el-form-item__label) {
  white-space: nowrap;
}
</style>
