import { useState } from 'react';
import { Product, ComparisonResultData, UserPreferences } from '../types';
import { db } from '../lib/supabase';
import { useAuth } from './useAuth';

export const useGeminiComparison = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const compareProducts = async (products: Product[], preferences?: UserPreferences): Promise<ComparisonResultData> => {
    setIsLoading(true);
    setError(null);

    try {
      // Gemini APIを使用した実際の比較分析
      const productCodes = products.map(p => p.itemCode);
      const result = await db.compareWithGemini(productCodes, preferences);
      
      // 比較履歴を保存（ログイン済みの場合）
      if (user) {
        await db.saveComparison({
          title: `${products.length}商品の比較`,
          product_codes: productCodes,
          user_preferences: preferences,
          evaluation_axes: result.axes,
          comparison_result: result,
        });
      }
      
      return result;
    } catch (err) {
      setError('分析中にエラーが発生しました。しばらく後に再試行してください。');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    compareProducts,
    isLoading,
    error,
  };
};