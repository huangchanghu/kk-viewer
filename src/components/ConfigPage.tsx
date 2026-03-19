import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';

interface ConfigPageProps {
  isEditing?: boolean;
}

export function ConfigPage({ isEditing = false }: ConfigPageProps) {
  const { config, setConfig, loading, error, clearError, cancelEditConfig } = useStore();
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Pre-fill form with existing config when editing
  useEffect(() => {
    if (isEditing && config) {
      setApiUrl(config.apiUrl);
      setApiKey(config.apiKey);
    }
  }, [isEditing, config]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidating(true);
    setValidationError(null);

    const trimmedUrl = apiUrl.trim();
    const trimmedKey = apiKey.trim();

    if (!trimmedUrl || !trimmedKey) {
      setValidationError('请填写API URL和API Key');
      setValidating(false);
      return;
    }

    const success = await setConfig({ apiUrl: trimmedUrl, apiKey: trimmedKey });
    if (!success) {
      setValidationError('连接失败，请检查API URL和API Key是否正确');
    }
    setValidating(false);
  };

  const handleCancel = () => {
    if (isEditing && cancelEditConfig) {
      cancelEditConfig();
    }
  };

  return (
    <div className="w-[360px] h-[500px] p-4 flex flex-col bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {isEditing ? '设置' : 'Karakeep 配置'}
        </h1>
        {isEditing && (
          <button
            onClick={handleCancel}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            取消
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            API URL
          </label>
          <input
            type="url"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="https://your-karakeep-instance.com"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="ak2_xxx_xxx"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm font-mono"
          />
        </div>

        {(validationError || error) && (
          <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-sm">
            {validationError || error}
          </div>
        )}

        <div className="mt-auto">
          <button
            type="submit"
            disabled={validating || loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
          >
            {validating ? '验证中...' : isEditing ? '保存' : '保存并连接'}
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          <p className="mb-1">提示：</p>
          <ul className="list-disc list-inside space-y-1">
            <li>API URL 是你的 Karakeep 实例地址</li>
            <li>API Key 可在 Karakeep 设置中生成</li>
          </ul>
        </div>
      </form>
    </div>
  );
}