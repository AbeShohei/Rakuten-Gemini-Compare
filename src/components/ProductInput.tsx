import React, { useState } from 'react';
import { Plus, Search, Link, X, Star, Sliders, ChevronDown, Check } from 'lucide-react';
import { Product, UserPreferences } from '../types';

interface ProductInputProps {
  products: Product[];
  onProductsChange: (products: Product[]) => void;
  onNext: (preferences: UserPreferences) => void;
}

export const ProductInput: React.FC<ProductInputProps> = ({
  products,
  onProductsChange,
  onNext,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [inputMode, setInputMode] = useState<'url' | 'search'>('url');
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [priorities, setPriorities] = useState({
    'コストパフォーマンス': 80,
    'デザイン性': 60,
    '機能性': 70,
    '信頼性': 50,
  });
  const [customRequirement, setCustomRequirement] = useState('');

  const priorityLabels = {
    'コストパフォーマンス': '価格と性能のバランス',
    'デザイン性': '見た目の美しさ',
    '機能性': '使いやすさ・機能の豊富さ',
    '信頼性': 'ブランド・評判の良さ',
  };

  const handleAddProduct = () => {
    if (!inputValue.trim()) return;

    // 楽天URLからitemCodeを抽出するか、直接IDとして扱う
    const itemCode = inputMode === 'url' ? (extractItemCode(inputValue) || inputValue) : inputValue;
    
    // ダミーデータ（実際は楽天APIから取得）
    const newProduct: Product = {
      itemCode,
      itemName: `商品 ${products.length + 1}`,
      itemPrice: Math.floor(Math.random() * 50000) + 1000,
      itemUrl: inputValue.startsWith('http') ? inputValue : `https://item.rakuten.co.jp/${itemCode}`,
      imageUrl: `https://images.pexels.com/photos/${1000 + products.length}/pexels-photo-${1000 + products.length}.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop`,
      shopName: `ショップ${products.length + 1}`,
      reviewAverage: Math.floor(Math.random() * 50) / 10 + 2.5,
      reviewCount: Math.floor(Math.random() * 1000),
    };

    onProductsChange([...products, newProduct]);
    setInputValue('');
  };

  const removeProduct = (index: number) => {
    const newProducts = products.filter((_, i) => i !== index);
    onProductsChange(newProducts);
  };

  const extractItemCode = (url: string): string | null => {
    const match = url.match(/item\.rakuten\.co\.jp\/([^\/]+)\/([^\/\?]+)/);
    return match ? `${match[1]}:${match[2]}` : null;
  };

  const handleNext = () => {
    const preferences: UserPreferences = {
      priorities,
      customRequirement: customRequirement.trim() || undefined,
    };
    onNext(preferences);
  };

  const inputModes = [
    { id: 'url', label: 'URL/ID入力', icon: Link, description: '楽天商品のURLまたはIDを入力' },
    { id: 'search', label: '商品検索', icon: Search, description: '商品名で検索して選択' }
  ];

  const currentMode = inputModes.find(mode => mode.id === inputMode)!;

  return (
    <>
      <div className="space-y-6 sm:space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Search className="text-white" size={32} />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient mb-3">
              商品比較AI
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-200 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700">Powered by Gemini AI</span>
            </div>
          </div>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-4 leading-relaxed">
            楽天商品のURLや商品名を入力して、あなたの重視ポイントを考慮した<br className="hidden sm:block"/>
            AIによる評価軸で比較します
          </p>
        </div>

        <div className="glass-effect rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl animate-slide-up border border-white/20">
          <div className="space-y-6">
            {/* 商品入力フィールド */}
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-gray-800 text-center">
                {inputMode === 'search' ? '商品名を入力してください' : '楽天商品のURLまたはIDを入力してください'}
              </label>
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <currentMode.icon size={24} />
                  </div>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={
                      inputMode === 'search' 
                        ? "例：iPhone 15 Pro" 
                        : "例：https://item.rakuten.co.jp/..."
                    }
                    className="w-full pl-16 pr-6 py-6 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 bg-white shadow-lg"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddProduct()}
                  />
                </div>
              </div>
              
              {/* 追加方法選択（左寄せ）と+ボタン（右寄せ）を同じ段に */}
              <div className="flex items-center justify-between">
                {/* 入力モード選択（左寄せ） */}
                <div className="relative">
                  <button
                    onClick={() => setShowModeDropdown(!showModeDropdown)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    <currentMode.icon size={16} />
                    <span>{currentMode.label}</span>
                    <ChevronDown 
                      className={`transition-transform duration-200 ${showModeDropdown ? 'rotate-180' : ''}`} 
                      size={14} 
                    />
                  </button>
                  
                  {showModeDropdown && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden min-w-[280px]">
                      {inputModes.map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => {
                            setInputMode(mode.id as 'url' | 'search');
                            setShowModeDropdown(false);
                            setInputValue('');
                          }}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                              <mode.icon className="text-gray-600" size={14} />
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-gray-800 text-sm">{mode.label}</div>
                              <div className="text-xs text-gray-500">{mode.description}</div>
                            </div>
                          </div>
                          {inputMode === mode.id && (
                            <Check className="text-blue-600" size={16} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* +ボタン（右寄せ） */}
                <button
                  onClick={handleAddProduct}
                  disabled={!inputValue.trim()}
                  className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {products.length >= 2 && (
          <div className="glass-effect rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl animate-scale-in border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Star className="text-white" size={20} />
                </div>
                あなたの重視ポイント
              </h2>
              <button
                onClick={() => setShowPreferences(!showPreferences)}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
              >
                <Sliders size={18} />
                <span className="hidden sm:inline">{showPreferences ? '閉じる' : 'カスタマイズ'}</span>
              </button>
            </div>

            {!showPreferences && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {Object.entries(priorities).map(([key, value]) => (
                  <div key={key} className="text-center p-3 bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-100">
                    <div className="text-lg font-bold text-blue-600 mb-1">{value}%</div>
                    <div className="text-xs text-gray-600">{key}</div>
                  </div>
                ))}
              </div>
            )}

            {showPreferences && (
              <div className="space-y-6 border-t border-gray-100 pt-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  {Object.entries(priorities).map(([key, value]) => (
                    <div key={key} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-gray-700">{key}</label>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-blue-600">{value}</span>
                          <span className="text-sm text-gray-500">%</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={value}
                        onChange={(e) => setPriorities(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <p className="text-xs text-gray-500">{priorityLabels[key as keyof typeof priorityLabels]}</p>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700">その他の要望（任意）</label>
                  <textarea
                    value={customRequirement}
                    onChange={(e) => setCustomRequirement(e.target.value)}
                    placeholder="例：デザインが良く、長く使えるものが欲しい"
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none bg-white"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {products.length > 0 && (
          <div className="glass-effect rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl animate-scale-in border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                選択された商品 
                <span className="ml-2 inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                  {products.length}
                </span>
              </h2>
            </div>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product, index) => (
                <div key={index} className="relative border-2 border-gray-100 rounded-2xl p-4 sm:p-5 bg-white shadow-sm hover:shadow-md transition-all duration-200">
                  <button
                    onClick={() => removeProduct(index)}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-all duration-200 z-10"
                  >
                    <X size={16} />
                  </button>
                  <div className="space-y-4">
                    <img
                      src={product.imageUrl}
                      alt={product.itemName}
                      className="w-full h-36 sm:h-40 object-cover rounded-xl bg-gray-100"
                    />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm sm:text-base line-clamp-2 min-h-[2.5rem] text-gray-800">
                        {product.itemName}
                      </h3>
                      <p className="text-xl sm:text-2xl font-bold text-blue-600">
                        ¥{product.itemPrice.toLocaleString()}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Star className="text-yellow-400 fill-current" size={14} />
                          <span className="font-medium">{product.reviewAverage.toFixed(1)}</span>
                        </div>
                        <span>({product.reviewCount}件)</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {products.length >= 2 && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleNext}
                  className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-bold shadow-xl text-lg flex items-center justify-center gap-3 mx-auto"
                >
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <Search className="text-white" size={14} />
                  </div>
                  AIで比較分析を開始
                </button>
              </div>
            )}
          </div>
        )}

        {products.length === 1 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus className="text-gray-400" size={24} />
            </div>
            <p className="text-gray-500 text-base font-medium">
              比較するには最低2つの商品が必要です
            </p>
            <p className="text-sm text-gray-400 mt-2">
              もう1つ商品を追加してください
            </p>
          </div>
        )}
      </div>
    </>
  );
};