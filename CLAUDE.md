# 前端 Agent 工作流程

## 强制规则

### 规则 1：文档驱动开发

- 编写代码前必须先生成 spec.md 和 plan.md
- 页面级 `specs/{页面名}.md` 不存在时，禁止编写页面代码
- 代码必须与 spec.md 完全一致
- 每完成一个任务必须更新 plan.md 进度

**阻断机制**：发现缺失对应文档 → 立即停止 → 先生成文档

### 规则 2：页面开发检查清单

1. **开发前**：检查 `{页面名}.md` 是否存在，不存在则先生成
2. **编码前**：完整阅读 `{页面名}.md`
3. **编码中**：严格按照 spec.md 实现
4. **完成后**：验证 specs 目录下是否存在对应的 `{页面名}.md`

**页面强制要求**：每个页面右上角必须有帮助说明气泡（问号图标），点击显示页面功能说明、业务流程等。

### 规则 3：技术栈

**版本选择原则**：

- 必须使用生产环境稳定版（非 RC、beta、alpha 等预发布版本）
- 优先选择 LTS（长期支持）版本
- 选用经过大规模生产验证的版本，确保稳定性和安全性
- 避免使用刚发布的大版本，建议等待至少 1-2 个月的社区验证期
- **移动端（uniapp H5）**：

  - Vue 3.4.x
  - Vant 4.x
  - Vite 5.x
  - Pinia 2.x
  - Vue Router 4.x
  - Axios 1.x
- **Web端（Vue 3）**：

  - Vue 3.4.x
  - Vite 5.x
  - Element Plus 2.x
  - Vue Router 4.x
  - Pinia 2.x
  - Axios 1.x

### 规则 4：默认设计理念

- 页面设计**默认采用苹果公司设计理念**（Apple Design Guidelines）
- 核心原则：
  - **简洁克制**：去除冗余元素，保持界面清爽
  - **清晰层次**：通过留白、字体大小、颜色对比建立视觉层级
  - **一致性**：统一的交互模式和视觉语言
  - **深度与动效**：适度使用模糊、阴影和流畅动效增强体验
- 除非用户明确指定其他设计风格，否则所有页面设计均遵循此默认理念

---

## 工作流程

```
需求分析 → 开发计划(plan.md) → 项目spec.md → 搭建框架 → 功能开发 → 验证交付
                                    ↓
                              页面spec.md
```

### 阶段 1：需求分析与澄清

使用 `AskUserQuestion` 确认：

- **基础要素**：页面名称、核心目标、目标平台、功能清单、数据来源、交互流程
- **设计要素**：设计理念、视觉风格、主色调、辅助色、布局方式、参考案例

### 阶段 2：生成开发计划

创建 `projects/项目名/plan.md`（多子系统项目在项目根目录创建，整个项目唯一），包含：

- 项目概述（名称、平台、技术栈、日期）
- 任务清单（初始化 → 页面开发 → 集成验证）
- 当前进度跟踪
- 问题记录

### 阶段 3：生成项目 spec.md

使用模板 `rules/project-spec-template.md`，生成 `projects/项目名/spec.md`（多子系统项目在各子系统目录下分别创建）

### 阶段 4：搭建项目框架

1. 初始化项目，安装依赖
2. 创建目录：`src/pages/` 或 `src/views/`、`components/`、`utils/`、`api/`、`store/`
3. 配置路由、状态管理、工具函数、API 封装、全局样式
4. 创建页面框架和 specs 目录

### 阶段 5：功能开发

```
检查spec存在 → 阅读spec → 编写代码 → 验证功能 → 确认spec存在 → 更新plan.md
```

- API 接口使用 Mock 数据
- uniapp 使用 H5 模式验证

### 阶段 6：项目验证

- 项目可编译且正常启动
- 所有功能正常运行
- 代码与 spec.md 一致
- plan.md 中所有任务已完成

---

## 项目结构

### 单一项目

```
projects/
 └── 项目名/
     ├── spec.md          # 项目级规格
     ├── plan.md          # 开发计划（唯一）
     ├── specs/           # 页面级规格
     │   └── 页面名.md
     └── src/
         ├── pages/       # 移动端页面
         └── views/       # Web端页面
```

### 多子系统项目

```
projects/
 └── 项目名/
     ├── plan.md          # 整个项目唯一的开发计划
     ├── 子系统A/
     │   ├── spec.md      # 子系统A的项目级规格
     │   ├── specs/       # 子系统A的页面级规格
     │   │   └── 页面名.md
     │   └── src/
     ├── 子系统B/
     │   ├── spec.md      # 子系统B的项目级规格
     │   ├── specs/       # 子系统B的页面级规格
     │   │   └── 页面名.md
     │   └── src/
     └── ...
```

**说明**：多子系统项目时，`plan.md` 位于项目根目录统一管理，`spec.md` 和 `specs/` 在各子系统目录下分别创建。

---

## 技能文档参考

- [vue-best-practices/SKILL.md](skills/vue-best-practices/SKILL.md)
- [vue-development-guides/SKILL.md](skills/vue-development-guides/SKILL.md)
- [frontend-design/SKILL.md](skills/frontend-design/SKILL.md)
- [skills-checklist.md](rules/skills-checklist.md)
