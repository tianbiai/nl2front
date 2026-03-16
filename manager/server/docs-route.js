/**
 * 文档 API 路由处理
 */
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

// 文档存储目录
const DOCS_DIR = 'docs'
const META_FILE = 'docs.json'

/**
 * 获取文档存储路径
 */
function getDocsPath(root) {
  return path.join(root, DOCS_DIR)
}

/**
 * 获取元数据文件路径
 */
function getMetaPath(root) {
  return path.join(root, DOCS_DIR, META_FILE)
}

/**
 * 确保目录和元数据文件存在
 */
function ensureDocsDir(root) {
  const docsPath = getDocsPath(root)
  const metaPath = getMetaPath(root)

  if (!fs.existsSync(docsPath)) {
    fs.mkdirSync(docsPath, { recursive: true })
  }

  if (!fs.existsSync(metaPath)) {
    fs.writeFileSync(metaPath, JSON.stringify({ docs: [] }, null, 2))
  }
}

/**
 * 读取元数据
 */
function readMeta(root) {
  ensureDocsDir(root)
  const metaPath = getMetaPath(root)
  const content = fs.readFileSync(metaPath, 'utf-8')
  return JSON.parse(content)
}

/**
 * 写入元数据
 */
function writeMeta(root, data) {
  const metaPath = getMetaPath(root)
  fs.writeFileSync(metaPath, JSON.stringify(data, null, 2))
}

/**
 * 解析请求体
 */
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        resolve({})
      }
    })
    req.on('error', reject)
  })
}

/**
 * 解析 multipart/form-data
 */
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => {
      const buffer = Buffer.concat(chunks)
      const contentType = req.headers['content-type'] || ''
      const boundaryMatch = contentType.match(/boundary=(.+)/)

      if (!boundaryMatch) {
        reject(new Error('Invalid content-type'))
        return
      }

      const boundary = boundaryMatch[1]
      const result = parseMultipartBuffer(buffer, boundary)
      resolve(result)
    })
    req.on('error', reject)
  })
}

/**
 * 解析 multipart buffer
 */
function parseMultipartBuffer(buffer, boundary) {
  const result = { file: null, fields: {} }
  const boundaryBuffer = Buffer.from('--' + boundary)
  const parts = []

  // 分割各个 part
  let start = 0
  while (true) {
    const idx = buffer.indexOf(boundaryBuffer, start)
    if (idx === -1) break
    if (start > 0) {
      parts.push(buffer.slice(start, idx))
    }
    start = idx + boundaryBuffer.length + 2 // +2 for \r\n
  }

  // 解析每个 part
  for (const part of parts) {
    const headerEndIdx = part.indexOf('\r\n\r\n')
    if (headerEndIdx === -1) continue

    const header = part.slice(0, headerEndIdx).toString()
    const content = part.slice(headerEndIdx + 4)

    // 移除尾部的 \r\n
    const trimmedContent = content.slice(0, content.length - 2)

    // 解析 header
    const nameMatch = header.match(/name="([^"]+)"/)
    const filenameMatch = header.match(/filename="([^"]+)"/)

    if (nameMatch) {
      const name = nameMatch[1]
      if (filenameMatch) {
        // 文件字段
        result.file = {
          fieldname: name,
          originalname: filenameMatch[1],
          buffer: trimmedContent
        }
      } else {
        // 普通字段
        result.fields[name] = trimmedContent.toString()
      }
    }
  }

  return result
}

/**
 * 处理文档路由
 */
export async function handleDocsRoute(req, res, root) {
  const method = req.method
  const url = req.url || ''

  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // 处理预检请求
  if (method === 'OPTIONS') {
    res.statusCode = 200
    res.end()
    return
  }

  // 路由匹配
  if (method === 'GET' && url === '/' || url === '') {
    // GET /api/docs - 获取文档列表
    await handleGetList(res, root)
  } else if (method === 'POST' && (url === '/upload' || url.startsWith('/upload'))) {
    // POST /api/docs/upload - 上传文档
    await handleUpload(req, res, root)
  } else if (method === 'GET' && url.startsWith('/') && url.length > 1) {
    // GET /api/docs/:id - 获取文档内容
    const id = url.slice(1).split('?')[0]
    await handleGetContent(res, root, id)
  } else if (method === 'DELETE' && url.startsWith('/') && url.length > 1) {
    // DELETE /api/docs/:id - 删除文档
    const id = url.slice(1)
    await handleDelete(res, root, id)
  } else if (method === 'PUT' && url.startsWith('/') && url.length > 1) {
    // PUT /api/docs/:id - 更新文档元数据
    const id = url.slice(1)
    await handleUpdate(req, res, root, id)
  } else {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Not found' }))
  }
}

/**
 * GET /api/docs - 获取文档列表
 */
async function handleGetList(res, root) {
  const meta = readMeta(root)
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ docs: meta.docs }))
}

/**
 * POST /api/docs/upload - 上传文档
 */
async function handleUpload(req, res, root) {
  try {
    const { file, fields } = await parseMultipart(req)

    if (!file) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: '没有上传文件' }))
      return
    }

    // 检查文件类型
    if (!file.originalname.endsWith('.md')) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: '只支持 Markdown (.md) 文件' }))
      return
    }

    ensureDocsDir(root)
    const meta = readMeta(root)

    // 生成文档 ID 和文件名
    const id = `doc-${randomUUID()}`
    const filename = `${id}.md`

    // 保存文件
    const filePath = path.join(getDocsPath(root), filename)
    fs.writeFileSync(filePath, file.buffer)

    // 创建元数据
    const docMeta = {
      id,
      name: fields.name || path.basename(file.originalname, '.md'),
      filename,
      originalName: file.originalname,
      size: file.buffer.length,
      description: fields.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // 更新元数据文件
    meta.docs.push(docMeta)
    writeMeta(root, meta)

    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ doc: docMeta }))
  } catch (error) {
    console.error('Upload error:', error)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: error.message }))
  }
}

/**
 * GET /api/docs/:id - 获取文档内容
 */
async function handleGetContent(res, root, id) {
  const meta = readMeta(root)
  const doc = meta.docs.find(d => d.id === id)

  if (!doc) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: '文档不存在' }))
    return
  }

  const filePath = path.join(getDocsPath(root), doc.filename)

  if (!fs.existsSync(filePath)) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: '文件不存在' }))
    return
  }

  const content = fs.readFileSync(filePath, 'utf-8')

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({
    doc,
    content
  }))
}

/**
 * DELETE /api/docs/:id - 删除文档
 */
async function handleDelete(res, root, id) {
  const meta = readMeta(root)
  const index = meta.docs.findIndex(d => d.id === id)

  if (index === -1) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: '文档不存在' }))
    return
  }

  const doc = meta.docs[index]
  const filePath = path.join(getDocsPath(root), doc.filename)

  // 删除文件
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }

  // 从元数据中移除
  meta.docs.splice(index, 1)
  writeMeta(root, meta)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ success: true }))
}

/**
 * PUT /api/docs/:id - 更新文档元数据
 */
async function handleUpdate(req, res, root, id) {
  const meta = readMeta(root)
  const doc = meta.docs.find(d => d.id === id)

  if (!doc) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: '文档不存在' }))
    return
  }

  const body = await parseBody(req)

  // 更新允许修改的字段
  if (body.name !== undefined) {
    doc.name = body.name
  }
  if (body.description !== undefined) {
    doc.description = body.description
  }
  doc.updatedAt = new Date().toISOString()

  writeMeta(root, meta)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ doc }))
}
