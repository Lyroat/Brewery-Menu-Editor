# 酒单编辑器

精酿酒馆酒单设计工具，支持自定义字段、可视化模板编辑、Excel 导入导出、打印及 PDF/PNG 导出。

## 功能

### 角色权限
- 管理员（admin/naburanne）和普通用户两种角色
- 用户注册与登录（localStorage 存储）

### 酒单编辑
- 动态自定义字段（文本、数字、下拉选择、图片）
- 表格内直接编辑酒品数据
- 酒品新增/删除，撤销/重做（Ctrl+Z / Ctrl+Shift+Z）
- Excel 模板下载、批量导入、数据导出
- 多酒单管理（新建、切换、删除）

### 模板系统
- 模板保存/加载，多个模板管理
- 背景颜色、文字颜色、强调色、字体、布局（卡片/列表）设置
- **背景图片**上传，含透明度控制（5%-50%）

### 可视化模板编辑器
- 拖拽移动、拖拽调整每个文案框的位置和尺寸
- 每个文案框独立编辑：文案内容、字体、字号、粗细、对齐、颜色
- 画布缩放（50%-200%）、撤销/重做
- 酒单尺寸拖拽调整：右边手柄调宽度，下边手柄调高度，右下角手柄同时调整

### 导出
- **PNG 导出**：单个或批量导出为高清 PNG 图片
- **PDF 导出**：通过 jsPDF 导出矢量 PDF，自动识别横/竖版
- **打印**：新窗口调用浏览器打印对话框

### 数据持久化
- 酒单和模板数据自动保存到 localStorage
- 刷新页面数据不丢失

## 技术栈

- React 19 + Vite 8
- Ant Design 6 + Ant Design Icons
- html2canvas（PNG 导出）
- jsPDF（PDF 导出，动态加载）
- xlsx（Excel 导入导出）
- file-saver（文件下载）

## 快速开始

```bash
npm install
npm run dev      # 开发模式 http://localhost:5173
npm run build    # 生产构建
npm run preview  # 预览构建结果
```

## 项目结构

```
src/
├── App.jsx                    # 主应用：状态管理、路由、数据持久化、撤销/重做
├── App.css                    # 全局样式、打印样式
├── main.jsx                   # 入口
└── components/
    ├── LoginPage.jsx          # 登录/注册页
    ├── MenuEditor.jsx         # 酒单编辑器（表格、导入导出、字段管理）
    ├── MenuPreview.jsx        # 酒单列表预览、导出、打印
    ├── TemplateManager.jsx    # 模板管理（样式设置、背景图片）
    └── TemplateEditor.jsx     # 可视化模板编辑器（拖拽布局）
```

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Z` | 撤销 |
| `Ctrl+Shift+Z` | 重做 |

## 默认账号

| 账号 | 密码 | 角色 |
|------|------|------|
| admin | naburanne | 管理员 |
