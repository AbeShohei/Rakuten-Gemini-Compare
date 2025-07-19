import React, { useState, useEffect } from 'react';
import { X, Calendar, Trash2, Eye } from 'lucide-react';
import { db } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadComparison: (comparison: any) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  onLoadComparison,
}) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadHistory();
    }
  }, [isOpen, user]);

  const loadHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await db.getComparisonHistory(user.id);
      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteComparison = async (id: string) => {
    try {
      const { error } = await db.deleteComparison(id);
      if (error) throw error;
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to delete comparison:', error);
    }
  };

  const loadComparison = (comparison: any) => {
    onLoadComparison(comparison);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-effect rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">比較履歴</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">履歴を読み込み中...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">比較履歴がありません</p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[60vh] space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Calendar size={14} />
                      <span>{new Date(item.created_at).toLocaleDateString('ja-JP')}</span>
                      <span>•</span>
                      <span>{item.product_codes.length}商品の比較</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.product_codes.slice(0, 3).map((code: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md"
                        >
                          商品{index + 1}
                        </span>
                      ))}
                      {item.product_codes.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                          +{item.product_codes.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => loadComparison(item)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="比較結果を表示"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => deleteComparison(item.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="削除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};