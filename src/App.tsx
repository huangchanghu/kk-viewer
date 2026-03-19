import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { ConfigPage } from './components/ConfigPage';
import { ListPage } from './components/ListPage';

function App() {
  const { config, configLoading, isEditingConfig, loadConfig } = useStore();

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  if (configLoading) {
    return (
      <div className="w-[360px] h-[500px] flex items-center justify-center bg-white dark:bg-gray-800">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show config page if no config or editing config
  if (!config || isEditingConfig) {
    return <ConfigPage isEditing={isEditingConfig} />;
  }

  return <ListPage />;
}

export default App;