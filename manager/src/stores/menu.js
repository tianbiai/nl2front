import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generateId } from '@/config/menu-default'

export const useMenuStore = defineStore('menu', () => {
  // 状态
  const menuConfig = ref({
    title: '项目管理聚合基座',
    version: '1.0.0',
    groups: []
  })
  const currentItemId = ref(null)
  const loading = ref(false)

  // 计算属性
  const groups = computed(() => menuConfig.value.groups || [])
  const currentItem = computed(() => {
    if (!currentItemId.value) return null
    for (const group of groups.value) {
      const item = group.children?.find(i => i.id === currentItemId.value)
      if (item) return item
    }
    return null
  })

  // 加载菜单配置
  async function loadMenuConfig() {
    loading.value = true
    try {
      // 先从 JSON 文件读取最新配置（用于版本检查）
      const response = await fetch('/data/menus.json')
      if (response.ok) {
        const serverConfig = await response.json()

        // 检查 localStorage 中的版本
        const localConfig = localStorage.getItem('menuConfig')
        if (localConfig) {
          const localData = JSON.parse(localConfig)
          // 如果版本不匹配，使用服务器配置
          if (localData.version !== serverConfig.version) {
            menuConfig.value = serverConfig
            localStorage.setItem('menuConfig', JSON.stringify(serverConfig))
            return
          }
          menuConfig.value = localData
          return
        }

        // 没有本地缓存，使用服务器配置
        menuConfig.value = serverConfig
        localStorage.setItem('menuConfig', JSON.stringify(serverConfig))
      }
    } catch (error) {
      console.error('加载菜单配置失败:', error)
      // 如果网络请求失败，尝试使用本地缓存
      const localConfig = localStorage.getItem('menuConfig')
      if (localConfig) {
        menuConfig.value = JSON.parse(localConfig)
      }
    } finally {
      loading.value = false
    }
  }

  // 保存菜单配置
  async function saveMenuConfig() {
    try {
      localStorage.setItem('menuConfig', JSON.stringify(menuConfig.value))
      return true
    } catch (error) {
      console.error('保存菜单配置失败:', error)
      return false
    }
  }

  // 设置当前菜单项
  function setCurrentItem(itemId) {
    currentItemId.value = itemId
  }

  // 添加分组
  function addGroup(group) {
    const newGroup = {
      id: generateId('group'),
      name: group.name || '新分组',
      icon: group.icon || '📁',
      expanded: true,
      children: []
    }
    menuConfig.value.groups.push(newGroup)
    saveMenuConfig()
    return newGroup
  }

  // 更新分组
  function updateGroup(groupId, updates) {
    const group = menuConfig.value.groups.find(g => g.id === groupId)
    if (group) {
      Object.assign(group, updates)
      saveMenuConfig()
    }
  }

  // 删除分组
  function deleteGroup(groupId) {
    const index = menuConfig.value.groups.findIndex(g => g.id === groupId)
    if (index > -1) {
      menuConfig.value.groups.splice(index, 1)
      saveMenuConfig()
    }
  }

  // 添加菜单项
  function addMenuItem(groupId, item) {
    const group = menuConfig.value.groups.find(g => g.id === groupId)
    if (group) {
      const newItem = {
        id: generateId('item'),
        name: item.name || '新菜单项',
        icon: item.icon || '📄',
        type: item.type || 'web',
        url: item.url || '',
        description: item.description || '',
        ...item
      }
      if (!group.children) {
        group.children = []
      }
      group.children.push(newItem)
      saveMenuConfig()
      return newItem
    }
    return null
  }

  // 更新菜单项
  function updateMenuItem(itemId, updates) {
    for (const group of menuConfig.value.groups) {
      const item = group.children?.find(i => i.id === itemId)
      if (item) {
        Object.assign(item, updates)
        saveMenuConfig()
        break
      }
    }
  }

  // 删除菜单项
  function deleteMenuItem(itemId) {
    for (const group of menuConfig.value.groups) {
      const index = group.children?.findIndex(i => i.id === itemId)
      if (index > -1) {
        group.children.splice(index, 1)
        saveMenuConfig()
        break
      }
    }
  }

  // 重新排序分组
  function reorderGroups(oldIndex, newIndex) {
    const [removed] = menuConfig.value.groups.splice(oldIndex, 1)
    menuConfig.value.groups.splice(newIndex, 0, removed)
    saveMenuConfig()
  }

  // 重新排序菜单项
  function reorderMenuItems(groupId, oldIndex, newIndex) {
    const group = menuConfig.value.groups.find(g => g.id === groupId)
    if (group && group.children) {
      const [removed] = group.children.splice(oldIndex, 1)
      group.children.splice(newIndex, 0, removed)
      saveMenuConfig()
    }
  }

  // 切换分组展开状态
  function toggleGroupExpanded(groupId) {
    const group = menuConfig.value.groups.find(g => g.id === groupId)
    if (group) {
      group.expanded = !group.expanded
      saveMenuConfig()
    }
  }

  // 重置为默认配置
  function resetToDefault() {
    localStorage.removeItem('menuConfig')
    loadMenuConfig()
  }

  return {
    menuConfig,
    currentItemId,
    currentItem,
    groups,
    loading,
    loadMenuConfig,
    saveMenuConfig,
    setCurrentItem,
    addGroup,
    updateGroup,
    deleteGroup,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    reorderGroups,
    reorderMenuItems,
    toggleGroupExpanded,
    resetToDefault
  }
})
