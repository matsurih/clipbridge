import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './App.css';

interface ClipboardItem {
  id: string;
  content: string;
  timestamp: number;
}

function App() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [clipboardHistory] = useState<ClipboardItem[]>([]);
  const [currentClipboard, setCurrentClipboard] = useState('');

  useEffect(() => {
    checkSyncStatus();
    loadCurrentClipboard();
  }, []);

  const checkSyncStatus = async () => {
    try {
      const syncing = await invoke<boolean>('is_syncing');
      setIsSyncing(syncing);
    } catch (error) {
      console.error('Failed to check sync status:', error);
    }
  };

  const loadCurrentClipboard = async () => {
    try {
      const text = await invoke<string>('get_clipboard_text');
      setCurrentClipboard(text);
    } catch (error) {
      console.error('Failed to load clipboard:', error);
    }
  };

  const toggleSync = async () => {
    try {
      if (isSyncing) {
        await invoke('stop_sync');
        setIsSyncing(false);
      } else {
        await invoke('start_sync');
        setIsSyncing(true);
      }
    } catch (error) {
      console.error('Failed to toggle sync:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await invoke('set_clipboard_text', { text });
      setCurrentClipboard(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>ClipBridge</h1>
        <p className="subtitle">クロスプラットフォーム クリップボード同期</p>
      </header>

      <main className="app-main">
        <section className="sync-control">
          <div className="status">
            <span className={`status-indicator ${isSyncing ? 'active' : 'inactive'}`} />
            <span className="status-text">
              {isSyncing ? '同期中' : '停止中'}
            </span>
          </div>
          <button onClick={toggleSync} className="btn-primary">
            {isSyncing ? '同期を停止' : '同期を開始'}
          </button>
        </section>

        <section className="current-clipboard">
          <h2>現在のクリップボード</h2>
          <div className="clipboard-content">
            {currentClipboard ? (
              <pre>{currentClipboard}</pre>
            ) : (
              <p className="empty-message">クリップボードは空です</p>
            )}
          </div>
          <button onClick={loadCurrentClipboard} className="btn-secondary">
            更新
          </button>
        </section>

        <section className="clipboard-history">
          <h2>クリップボード履歴</h2>
          {clipboardHistory.length > 0 ? (
            <div className="history-list">
              {clipboardHistory.map((item) => (
                <div
                  key={item.id}
                  className="history-item"
                  onClick={() => copyToClipboard(item.content)}
                >
                  <div className="history-content">{item.content}</div>
                  <div className="history-timestamp">
                    {new Date(item.timestamp).toLocaleString('ja-JP')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">履歴がありません</p>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>ClipBridge v0.1.0</p>
      </footer>
    </div>
  );
}

export default App;
