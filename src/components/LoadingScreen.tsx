import React from 'react';
import { Brain, Zap, Search } from 'lucide-react';

interface LoadingScreenProps {
  onCancel: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onCancel }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="glass-effect rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 max-w-sm sm:max-w-md lg:max-w-lg w-full mx-4 text-center animate-scale-in">
        <div className="relative mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto animate-pulse shadow-lg">
            <Brain className="text-white" size={28} />
          </div>
          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce shadow-md">
            <Zap className="text-white" size={12} />
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
          🤖 AI分析中...
        </h2>
        
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 text-left text-sm sm:text-base">
            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Search className="text-blue-600" size={14} />
            </div>
            <span className="text-gray-700 font-medium">商品情報を解析中</span>
            <div className="flex-1 flex justify-end ml-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-left text-sm sm:text-base">
            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Brain className="text-green-600" size={14} />
            </div>
            <span className="text-gray-700 font-medium">評価軸を自動生成中</span>
            <div className="flex-1 flex justify-end ml-2">
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-left text-sm sm:text-base">
            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Zap className="text-purple-600" size={14} />
            </div>
            <span className="text-gray-700 font-medium">スコアリング実行中</span>
            <div className="flex-1 flex justify-end ml-2">
              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
            </div>
          </div>
        </div>

        <p className="text-gray-500 text-xs sm:text-sm mb-6 sm:mb-8 leading-relaxed">
          Gemini AIが商品を多角的に分析し、<br className="hidden sm:block" />
          最適な評価軸で比較しています
        </p>

        <button
          onClick={onCancel}
          className="px-4 sm:px-6 py-2 text-sm sm:text-base text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-300"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
};