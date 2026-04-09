import { useStore } from '../store/useStore';

const shortcuts = [
  {
    group: '导航',
    items: [
      { key: 'j / k', desc: '上下移动' },
      { key: 'h', desc: '返回上级' },
      { key: 'l / Enter', desc: '进入列表' },
      { key: 'Enter', desc: '新标签页打开书签' },
      { key: 'gg', desc: '跳到顶部' },
      { key: 'G', desc: '跳到底部' },
    ],
  },
  {
    group: '操作',
    items: [
      { key: 'o', desc: '当前标签页打开' },
      { key: 'O', desc: '新标签页打开' },
      { key: 'p', desc: 'Pin / Unpin 列表' },
    ],
  },
  {
    group: '模式',
    items: [
      { key: '/ , i', desc: '搜索' },
      { key: 'Esc', desc: '退出搜索 / 关闭弹窗' },
      { key: '?', desc: '显示 / 关闭此帮助' },
    ],
  },
];

export function HelpPanel() {
  const isHelpOpen = useStore((s) => s.isHelpOpen);
  const setHelpOpen = useStore((s) => s.setHelpOpen);

  if (!isHelpOpen) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={() => setHelpOpen(false)}
    >
      <div
        className="w-[320px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            键盘快捷键
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Esc 关闭
          </span>
        </div>
        <div className="px-4 py-3 space-y-4 max-h-[380px] overflow-y-auto">
          {shortcuts.map((group) => (
            <div key={group.group}>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                {group.group}
              </div>
              <div className="space-y-1.5">
                {group.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between"
                  >
                    <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600">
                      {item.key}
                    </kbd>
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="text-xs text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-200 dark:border-gray-700">
            数字 + 动作键，如 <kbd className="px-1 py-0.5 font-mono bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">5j</kbd> 向下移动 5 项
          </div>
        </div>
      </div>
    </div>
  );
}
