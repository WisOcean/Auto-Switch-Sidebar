### 目标
- 实现一个无需设置界面的插件：Switch right sidebar for Thino。
- 行为约束：
  - 当用户点击左侧菜单（或执行命令）打开 Thino 时：
    - 若右侧边栏处于开启状态，则先收起右侧边栏，再让 Thino 打开其视图标签页。
    - 若右侧边栏处于关闭状态，则等待 Thino 打开其视图标签页（不干预）。
  - 当关闭由 Thino 打开的标签页（最后一个 Thino 视图关闭）时，展开右侧边栏。

### 关键信息与约定
- Thino 插件信息（来自目录 `obsidian-memos`）
  - 插件名称：Thino（manifest 中 `name` 为 "Thino"，id 为 `obsidian-memos`）。
  - 视图类型：`thino_view`（在代码中存在 `workspace.getLeavesOfType("thino_view")` 的使用）。
  - 打开 Thino 的方法：Thino 内部有 `openMemos(location?: string, cb?: Function)`，但本插件无需调用它；仅需监听 Thino 视图打开/关闭事件。
- 目标插件（当前模板目录 `Switch right sidebar for Thino/`）
  - 建议 manifest 重命名：
    - id：`switch-right-sidebar-for-thino`
    - name：`Switch right sidebar for Thino`
    - description：`Auto toggle right sidebar when Thino opens/closes`
    - minAppVersion：与模板一致（>= 0.15.0 或按需要设为 1.0.0）
  - 无设置页、无 Ribbon、无命令，仅注册必要的事件监听。

### 技术方案
- 监听点（Workspace 级别事件）：
  - `layout-change`：用于检测 `thino_view` 叶子（leaf）的增减。
  - 可选：`active-leaf-change`（若需要在激活时补充判定）。
- 判定逻辑：
  - 定义工具函数：
    - `getThinoLeaves(): WorkspaceLeaf[]` => `app.workspace.getLeavesOfType('thino_view')`。
    - `isRightSidebarCollapsed(): boolean` => 从 `app.workspace.rightSplit?.collapsed` 判断（或通过是否需要 `getRightLeaf(true)` 才能获取叶子来侧推）。
    - `collapseRightSidebarIfOpen(): Promise<void>` => 若未折叠则执行折叠；优先使用 `app.workspace.rightSplit?.collapse()`，如需更稳妥可回退到执行命令 `app.commands.executeCommandById('workspace:toggle-right-sidebar')`（仅在确认当前为开启状态时调用）。
    - `expandRightSidebar(): Promise<void>` => 优先 `app.workspace.rightSplit?.expand()`，回退同上命令（仅在确认当前为折叠状态时调用）。
  - 触发时机与动作：
    1) 当检测到 Thino 视图被打开（`thinoLeavesCount` 从 0 变为 >0）：
       - 若右侧边栏为开启，则调用 `collapseRightSidebarIfOpen()`。
       - 若右侧边栏为关闭，则不做处理。
    2) 当检测到 Thino 视图全部关闭（`thinoLeavesCount` 从 >0 变为 0）：
       - 调用 `expandRightSidebar()`。
- 平台兼容：
  - 行为仅在桌面端执行：`if (!Platform.isDesktop) return;`（移动端右侧边栏概念不同/可能不存在）。
- 状态处理：
  - 不引入设置，无需持久化状态。
  - 可选择是否记录“是否由本插件折叠”的标记；根据需求 2，不必记录，直接在关闭最后一个 Thino 视图时展开右侧边栏。

### 代码骨架（放入 `main.ts`）
```ts
import { Plugin, WorkspaceLeaf, Platform } from 'obsidian';

const THINO_VIEW_TYPE = 'thino_view';

export default class SwitchRightSidebarForThinoPlugin extends Plugin {
	private lastThinoLeafCount = 0;

	async onload() {
		if (!Platform.isDesktop) return;
		this.registerEvent(this.app.workspace.on('layout-change', () => this.handleLayoutChange()));
		// 初次启动做一次基线统计
		this.lastThinoLeafCount = this.getThinoLeaves().length;
	}

	private handleLayoutChange() {
		const count = this.getThinoLeaves().length;
		if (this.lastThinoLeafCount === 0 && count > 0) {
			// Thino 打开
			this.collapseRightSidebarIfOpen();
		}
		if (this.lastThinoLeafCount > 0 && count === 0) {
			// Thino 全部关闭
			this.expandRightSidebar();
		}
		this.lastThinoLeafCount = count;
	}

	private getThinoLeaves(): WorkspaceLeaf[] {
		return this.app.workspace.getLeavesOfType(THINO_VIEW_TYPE) ?? [];
	}

	private isRightSidebarCollapsed(): boolean {
		// 优先使用内部属性（较新 API 可用）。如不可用可替换为其它判定方式。
		return Boolean((this.app.workspace as any).rightSplit?.collapsed);
	}

	private collapseRightSidebarIfOpen() {
		try {
			const rightSplit = (this.app.workspace as any).rightSplit;
			if (rightSplit && !rightSplit.collapsed && typeof rightSplit.collapse === 'function') {
				rightSplit.collapse();
				return;
			}
			if (!this.isRightSidebarCollapsed()) {
				this.app.commands.executeCommandById('workspace:toggle-right-sidebar');
			}
		} catch {}
	}

	private expandRightSidebar() {
		try {
			const rightSplit = (this.app.workspace as any).rightSplit;
			if (rightSplit && rightSplit.collapsed && typeof rightSplit.expand === 'function') {
				rightSplit.expand();
				return;
			}
			if (this.isRightSidebarCollapsed()) {
				this.app.commands.executeCommandById('workspace:toggle-right-sidebar');
			}
		} catch {}
	}
}
```

### 需要修改/新增的文件
- `manifest.json`
  - id：`switch-right-sidebar-for-thino`
  - name：`Switch right sidebar for Thino`
  - description：`Auto toggle right sidebar when Thino opens/closes`
  - 其它字段沿用模板或按需更新版本号。
- `main.ts`
  - 用上述骨架替换示例代码（删除示例的 Ribbon、命令、设置页相关）。
- `styles.css`
  - 不需要内容，可留空。

### 测试用例（手动验证）
- 桌面端开启插件后：
  - 场景 A：右侧边栏开启 → 点击 Thino 左侧图标/命令 → 右侧边栏被折叠，Thino 视图打开。
  - 场景 B：右侧边栏关闭 → 点击 Thino 左侧图标/命令 → 保持关闭，Thino 视图打开。
  - 场景 C：关闭所有 Thino 标签（最后一个关闭）→ 右侧边栏自动展开。
  - 场景 D：多次打开/关闭 Thino，行为稳定且无闪烁。
  - 场景 E：在移动端（若能安装）不触发任何动作（可直接 return）。

### 边界与兼容性
- 若未来 Obsidian 内部 `rightSplit` 属性变动：
  - 回退策略使用命令 `workspace:toggle-right-sidebar`（在判定状态的前提下只调用一次）。
- 若 Thino 将视图类型名更改：
  - 需同步更新 `THINO_VIEW_TYPE`（当前从代码中确认为 `thino_view`）。
- 若用户在 Thino 打开期间手动再次切换右栏：
  - 本插件不干预；关闭 Thino 最后一个标签时仍会尝试展开右栏。

### 构建与发布
- `npm i`，`npm run dev` / `npm run build`。
- 手动安装：将 `main.js`、`styles.css`、`manifest.json` 复制到库路径下的 `.obsidian/plugins/switch-right-sidebar-for-thino/`。

### 待办清单
- [x] 更新 `manifest.json` 元数据（id/name/description/minAppVersion）。
- [x] 用上述骨架实现 `main.ts` 并移除示例 Ribbon/命令/设置页。
- [x] 在 `onload` 中注册 `layout-change` 监听，完成计数差分逻辑。
- [x] 实现并验证右侧边栏收起/展开的两种实现（内部 API 与命令回退）。
- [ ] 桌面端多场景手测；必要时增加去抖（如快速开关导致多次触发）。
- [ ] 版本号与 `versions.json` 更新（如需要发布）。
