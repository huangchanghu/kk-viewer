import { useStore } from '../store/useStore';

export function Breadcrumb() {
  const { currentPath, navigateTo } = useStore();

  if (currentPath.length === 0) return null;

  return (
    <div className="flex items-center gap-1 text-sm overflow-x-auto py-1">
      <button
        onClick={() => navigateTo(null)}
        className="text-blue-600 dark:text-blue-400 hover:underline shrink-0"
      >
        首页
      </button>
      {currentPath.map((item, index) => (
        <div key={item.id || index} className="flex items-center gap-1 shrink-0">
          <span className="text-gray-400 dark:text-gray-500">/</span>
          {item.icon && <span>{item.icon}</span>}
          <button
            onClick={() => navigateTo(item)}
            className={`hover:underline ${
              index === currentPath.length - 1
                ? 'text-gray-900 dark:text-white font-medium'
                : 'text-blue-600 dark:text-blue-400'
            }`}
          >
            {item.name}
          </button>
        </div>
      ))}
    </div>
  );
}