## Switch right sidebar for Thino

一个极简的 Obsidian 插件：当你打开 Thino（`obsidian-memos`）时自动收起右侧边栏；当关闭最后一个 Thino 标签页时自动展开右侧边栏。无需任何设置。

— 本插件 100% 由 AI 完成，作者不再更新，欢迎 Fork 自行修改。 —


### 功能
- 打开 Thino 时：若右侧边栏为开启状态，自动收起右侧边栏；若右侧边栏已关闭，则不干预。
- 关闭 Thino 时：当最后一个 Thino 视图被关闭时，自动展开右侧边栏。
- 无设置页、无命令、无 Ribbon 图标，开箱即用。

### 工作原理
- 监听工作区 `layout-change` 事件，统计 `thino_view` 视图叶子数量变化：
  - 0 → >0：判定为 Thino 打开，触发收起右侧栏。
  - >0 → 0：判定为 Thino 全部关闭，触发展开右侧栏。
- 优先调用内部 API `workspace.rightSplit.collapse()/expand()`，若不可用则回退执行命令 `workspace:toggle-right-sidebar`。
- 仅在桌面端生效。

### 兼容性
- Obsidian ≥ 0.15.0（与本仓库 `manifest.json` 一致）。
- 桌面端：已适配。
- 移动端：不执行任何动作。
- 依赖插件：Thino（`obsidian-memos`）。

### 安装
1) 从构建产物手动安装（推荐）
- 将以下文件复制到你的库目录：`<你的库>/.obsidian/plugins/switch-right-sidebar-for-thino/`
  - `manifest.json`
  - `main.js`
  - `styles.css`
- 在 Obsidian 设置 → 第三方插件中启用本插件与 Thino。

2) 从源码构建
- Node.js ≥ 16
- 在插件根目录执行：
  - `npm i`
  - `npm run build`
- 构建完成后会生成 `main.js`，按“手动安装”章节复制至你的库。

### 使用
- 启用插件后，无需额外操作。
- 从左侧栏点击 Thino（或使用命令/快捷键）打开 Thino 视图：
  - 若右侧栏当前为开启，则会先被自动收起。
  - 当关闭最后一个 Thino 标签页后，右侧栏会自动展开。

### 已知限制与说明
- 仅桌面端生效；移动端无右侧边栏的概念。
- 若 Obsidian 内部 API 变更（如 `rightSplit` 行为），本插件将回退使用命令 `workspace:toggle-right-sidebar`，但在极端情况下可能出现误判或闪烁。
- 如果你在 Thino 打开期间手动切换右侧栏状态，本插件不会强行覆盖；当 Thino 全部关闭时仍会尝试展开右侧栏。

### 常见问题
- 看不到效果？请确认：
  - 已安装并启用 Thino（`obsidian-memos`）。
  - 在桌面端使用。
  - 右侧边栏确实处于“展开/收起”的可切换状态。

### 许可
- 继承模板的 MIT 许可（见仓库中的 `LICENSE`）。
