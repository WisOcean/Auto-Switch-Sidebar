import { Plugin, WorkspaceLeaf, Platform } from 'obsidian';

const THINO_VIEW_TYPE = 'thino_view';

export default class SwitchRightSidebarForThinoPlugin extends Plugin {
	private lastThinoLeafCount: number = 0;

	async onload() {
		if (!Platform.isDesktop) return;
		// 初次统计当前 thino 叶子数量
		this.lastThinoLeafCount = this.getThinoLeaves().length;
		// 监听布局变化，用于侦测 thino 视图的打开/关闭
		this.registerEvent(this.app.workspace.on('layout-change', () => this.handleLayoutChange()));
	}

	private handleLayoutChange(): void {
		const currentCount = this.getThinoLeaves().length;
		if (this.lastThinoLeafCount === 0 && currentCount > 0) {
			// Thino 打开 -> 若右侧边栏开启则收起
			this.collapseRightSidebarIfOpen();
		}
		if (this.lastThinoLeafCount > 0 && currentCount === 0) {
			// Thino 全部关闭 -> 展开右侧边栏
			this.expandRightSidebar();
		}
		this.lastThinoLeafCount = currentCount;
	}

	private getThinoLeaves(): WorkspaceLeaf[] {
		return this.app.workspace.getLeavesOfType(THINO_VIEW_TYPE) ?? [];
	}

	private isRightSidebarCollapsed(): boolean {
		const rightSplit = (this.app.workspace as any).rightSplit;
		return Boolean(rightSplit?.collapsed);
	}

	private collapseRightSidebarIfOpen(): void {
		try {
			const rightSplit = (this.app.workspace as any).rightSplit;
			if (rightSplit && !rightSplit.collapsed && typeof rightSplit.collapse === 'function') {
				rightSplit.collapse();
				return;
			}
			if (!this.isRightSidebarCollapsed()) {
				(this.app as any).commands.executeCommandById('workspace:toggle-right-sidebar');
			}
		} catch {
			// no-op
		}
	}

	private expandRightSidebar(): void {
		try {
			const rightSplit = (this.app.workspace as any).rightSplit;
			if (rightSplit && rightSplit.collapsed && typeof rightSplit.expand === 'function') {
				rightSplit.expand();
				return;
			}
			if (this.isRightSidebarCollapsed()) {
				(this.app as any).commands.executeCommandById('workspace:toggle-right-sidebar');
			}
		} catch {
			// no-op
		}
	}
}

