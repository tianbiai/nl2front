import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 权限配置：定义各角色可访问的页面
const rolePermissions = {
  admin: ['menu-editor', 'projects', 'project-detail', 'content', 'settings'],
  guest: ['project-detail', 'content']
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username || '')
  const nickname = computed(() => userInfo.value?.nickname || userInfo.value?.username || '')
  const role = computed(() => userInfo.value?.role || 'guest')

  // 是否为管理员
  const isAdmin = computed(() => {
    return role.value === 'admin'
  })

  // 登录
  async function login(username, password) {
    return new Promise((resolve, reject) => {
      // 模拟登录验证（实际项目中应调用后端 API）
      const validUsers = [
        { id: 1, username: 'admin', password: 'admin123', nickname: '管理员', role: 'admin' },
        { id: 2, username: 'guest', password: 'guest123', nickname: '访客', role: 'guest' }
      ]

      const user = validUsers.find(u => u.username === username && u.password === password)

      if (user) {
        token.value = 'token-' + Date.now() + '-' + Math.random().toString(36).slice(2)
        userInfo.value = {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          role: user.role
        }
        localStorage.setItem('token', token.value)
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
        resolve(userInfo.value)
      } else {
        reject(new Error('用户名或密码错误'))
      }
    })
  }

  // 登出
  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  // 检查登录状态
  function checkAuth() {
    return !!token.value && !!userInfo.value
  }

  // 检查是否有访问指定页面的权限
  function hasPermission(pageName) {
    const userRole = role.value || 'guest'
    const allowedPages = rolePermissions[userRole] || rolePermissions.guest
    return allowedPages.includes(pageName)
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    username,
    nickname,
    role,
    isAdmin,
    login,
    logout,
    checkAuth,
    hasPermission
  }
})
