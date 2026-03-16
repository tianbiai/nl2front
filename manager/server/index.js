/**
 * Vite 中间件插件 - 文档服务
 * 提供文档上传、列表、读取、删除 API
 */
import { handleDocsRoute } from './docs-route.js'

/**
 * 文档服务 Vite 插件
 */
export function docsServerPlugin() {
  return {
    name: 'vite-plugin-docs-server',
    configureServer(server) {
      // 处理 /api/docs 路由
      server.middlewares.use('/api/docs', async (req, res, next) => {
        try {
          await handleDocsRoute(req, res, server.config.root)
        } catch (error) {
          console.error('Docs API Error:', error)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: error.message }))
        }
      })
    }
  }
}

export default docsServerPlugin
