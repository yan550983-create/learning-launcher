# Focus Reading Launcher

Focus Reading Launcher 是一个静态前端 MVP：把网页链接、粘贴文本、GPT 周报或本地文件，转成一次有时间限制、有阅读进度条、有进入仪式、有退出仪式的阅读 Session。

> 当前版本不需要后端、不需要账号、不接 AI 总结，所有记录默认保存在浏览器 `localStorage`。

## 网页入口

- 实际应用文件：`web/index.html`
- 根目录入口：`index.html`，会自动跳转到 `web/index.html`

## 本地运行

### 方式 1：直接打开

在文件管理器或浏览器里直接打开：

```text
web/index.html
```

### 方式 2：启动静态服务器（推荐）

在仓库根目录运行：

```bash
python3 -m http.server 8000 --bind 0.0.0.0
```

然后打开：

```text
http://127.0.0.1:8000/web/index.html
```

如果你在远程容器、Codespaces、云 IDE 或 GitHub 预览环境中使用，请通过平台提供的 **Ports / Preview / Open in Browser** 打开 8000 端口，再访问 `/web/index.html`。

## GitHub Pages 部署

这个项目已经包含 GitHub Pages workflow。推送到 `main` 后：

1. 打开 GitHub 仓库的 **Settings → Pages**。
2. Source 选择 **GitHub Actions**。
3. 等待或手动运行 **Deploy Focus Reading Launcher to GitHub Pages**。
4. 部署完成后访问：

```text
https://<你的 GitHub 用户名>.github.io/<仓库名>/
```

## MVP 功能

### 1. 输入区

支持三类材料：

- `link`：网页链接 URL。
- `text`：粘贴文本，例如 GPT 周报、学习笔记。
- `file`：上传本地文件。第一版支持读取 `txt` / `md`；`pdf` 会显示占位提示，后续可接 PDF 解析。

### 2. 阅读任务生成

点击“创建阅读 Session”后会生成阅读卡片，包含：

- 标题
- 来源类型：`link` / `text` / `file`
- 预计阅读时长
- 当前状态：未开始 / 阅读中 / 已完成
- 阅读进度百分比

### 3. 时间限制

开始前可选择：

- 15 分钟
- 25 分钟
- 45 分钟
- 60 分钟
- 自定义分钟数

点击“我已进入阅读状态”后才正式开始倒计时。倒计时结束会自动进入退出仪式。

### 4. 进度条

阅读页有两个进度：

- 时间进度条：根据倒计时自动推进。
- 阅读进度条：用户可以拖动，也可以点击 25% / 50% / 75% / 100% 快速更新。

### 5. 三阶段阅读流程

1. **进入仪式**：确认进入阅读状态后才开始计时。
2. **专注阅读**：展示材料标题、内容区域或链接按钮、倒计时、时间进度、阅读进度、关键点输入框。
3. **退出仪式**：必须填写“读到最重要的点”，完成后保存本次 Session。

### 6. 历史记录

首页显示历史阅读记录：

- 日期
- 标题
- 类型
- 阅读时长
- 完成度
- 关键收获

第一版使用 `localStorage` 保存，数据只留在当前浏览器。

## 项目结构

```text
.
├── AGENTS.md
├── README.md
├── index.html
├── web/
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── .github/
    └── workflows/
        └── deploy-pages.yml
```

## 隐私边界

- 当前版本不上传任何阅读内容。
- localStorage 数据只保存在当前浏览器。
- 清空历史会删除本地历史记录，但不会影响已导出的外部文件（如果未来新增导出功能）。

## 后续迭代路线

### V0.2：阅读材料增强

- PDF 文本解析。
- URL 元信息抓取或手动补充标题。
- 支持 Markdown 更优雅渲染。
- 支持把长文本拆成阅读段落。

### V0.3：Session 体验增强

- 暂停 / 继续计时。
- 阅读中断原因记录。
- 更细的状态：准备中、进入中、阅读中、退出中、已完成、已放弃。
- 关键点支持多个条目。

### V0.4：复盘与导出

- 历史记录筛选和搜索。
- 导出 Markdown / JSON。
- 每周阅读回顾视图。
- 用本地可选 AI 能力生成总结，但默认不上传隐私内容。

### V0.5：部署与产品化

- GitHub Pages 稳定部署。
- PWA 离线支持。
- 响应式细节优化。
- 可配置主题和阅读仪式文案。
