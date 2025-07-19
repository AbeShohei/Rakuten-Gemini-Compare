import React, { useState } from 'react';
import { ProductInput } from './components/ProductInput';
import { LoadingScreen } from './components/LoadingScreen';
import { ProductComparisonResult } from './components/ComparisonResult';
import { Header } from './components/Layout/Header';
import { HistoryModal } from './components/History/HistoryModal';
import { useGeminiComparison } from './hooks/useGeminiComparison';
import { useAuth } from './hooks/useAuth';
import { Product, ComparisonResultData, UserPreferences } from './types';

type AppState = 'input' | 'loading' | 'result';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('input');
  const [products, setProducts] = useState<Product[]>([]);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResultType | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  const { loading: authLoading } = useAuth();
  const { compareProducts, isLoading, error } = useGeminiComparison();

  // 認証の読み込み中は何も表示しない
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleStartComparison = async (preferences: UserPreferences) => {
    if (products.length < 2) return;
    
    setUserPreferences(preferences);
    setCurrentState('loading');
    
    try {
      const result = await compareProducts(products, preferences);
      setComparisonResult(result);
      setCurrentState('result');
    } catch (err) {
      setCurrentState('input');
      console.error('Comparison failed:', err);
    }
  };

  const handleBackToInput = () => {
    setCurrentState('input');
    setComparisonResult(null);
    setUserPreferences(null);
  };

  const handleCancelComparison = () => {
    setCurrentState('input');
  };

  const handleLoadComparison = (comparison: any) => {
    // 履歴から比較結果を復元
    setComparisonResult(comparison.comparison_result);
    setUserPreferences(comparison.user_preferences);
    setCurrentState('result');
    
    // 商品情報も復元（簡易版）
    const restoredProducts = comparison.product_codes.map((code: string, index: number) => ({
      itemCode: code,
      itemName: `商品 ${index + 1}`,
      itemPrice: 0,
      itemUrl: '',
      imageUrl: '',
      shopName: '',
      reviewAverage: 0,
      reviewCount: 0,
    }));
    setProducts(restoredProducts);
  };

  if (currentState === 'loading') {
    return <LoadingScreen onCancel={handleCancelComparison} />;
  }

  if (currentState === 'result' && comparisonResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header 
          onShowHistory={() => setShowHistory(true)}
        />
        <div className="py-4 sm:py-6 lg:py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <ProductComparisonResult
              products={products}
              result={comparisonResult}
              userPreferences={userPreferences}
              onBack={handleBackToInput}
            />
          </div>
        </div>
        
        <HistoryModal
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          onLoadComparison={handleLoadComparison}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header 
        onShowHistory={() => setShowHistory(true)}
      />
      <div className="py-4 sm:py-6 lg:py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <ProductInput
            products={products}
            onProductsChange={setProducts}
            onNext={handleStartComparison}
          />
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>
        
      <HistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onLoadComparison={handleLoadComparison}
      />
    </div>
  );
}

export default App;