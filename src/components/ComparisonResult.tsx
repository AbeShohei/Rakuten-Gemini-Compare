import React, { useState } from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Product, ComparisonResultData } from '../types';
import { ChevronDown, ChevronUp, Info, Award, TrendingUp } from 'lucide-react';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface ComparisonResultProps {
  products: Product[];
  result: ComparisonResultData;
  userPreferences?: UserPreferences;
  onBack: () => void;
}

export const ProductComparisonResult: React.FC<ComparisonResultProps> = ({
  products,
  result,
  userPreferences,
  onBack,
}) => {
  const [selectedAxis, setSelectedAxis] = useState<string | null>(null);
  const [showOverview, setShowOverview] = useState(true);

  const colors = [
    'rgba(59, 130, 246, 0.6)',
    'rgba(16, 185, 129, 0.6)',
    'rgba(249, 115, 22, 0.6)',
    'rgba(139, 92, 246, 0.6)',
    'rgba(236, 72, 153, 0.6)',
  ];

  const borderColors = [
    'rgb(59, 130, 246)',
    'rgb(16, 185, 129)',
    'rgb(249, 115, 22)',
    'rgb(139, 92, 246)',
    'rgb(236, 72, 153)',
  ];

  const chartData = {
    labels: result.axes.map(axis => axis.name),
    datasets: products.map((product, index) => {
      const productScore = result.scores.find(s => s.productId === product.itemCode);
      return {
        label: product.itemName,
        data: result.axes.map(axis => productScore?.scores[axis.name] || 0),
        backgroundColor: colors[index % colors.length],
        borderColor: borderColors[index % borderColors.length],
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      };
    }),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 5,
        ticks: {
          stepSize: 1,
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  const getRankingIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Award className="text-yellow-500" size={20} />;
      case 2: return <Award className="text-gray-400" size={20} />;
      case 3: return <Award className="text-amber-600" size={20} />;
      default: return <TrendingUp className="text-gray-400" size={16} />;
    }
  };

  const getProduct = (productId: string) => 
    products.find(p => p.itemCode === productId);

  const getTopRecommendation = () => {
    if (!userPreferences || result.ranking.length === 0) return null;
    
    const topProduct = getProduct(result.ranking[0].productId);
    const highestPriority = Object.entries(userPreferences.priorities)
      .sort(([,a], [,b]) => b - a)[0];
    
    return {
      product: topProduct,
      reason: highestPriority ? `特に重視される「${highestPriority[0]}」の観点で優秀` : '',
    };
  };

  const topRecommendation = getTopRecommendation();
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gradient">
          📊 比較結果
        </h1>
        <button
          onClick={onBack}
          className="self-start sm:self-auto px-4 py-2 text-sm sm:text-base text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
        >
          ← 戻る
        </button>
      </div>

      {/* あなたへのおすすめ */}
      {topRecommendation && (
        <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg animate-slide-up bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              AI
            </div>
            あなたへのおすすめ
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white/80 rounded-lg">
            <img
              src={topRecommendation.product?.imageUrl}
              alt={topRecommendation.product?.itemName}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg shadow-md"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-base sm:text-lg mb-2">{topRecommendation.product?.itemName}</h3>
              <p className="text-sm text-gray-600 mb-2">{topRecommendation.reason}</p>
              {userPreferences?.customRequirement && (
                <p className="text-xs text-blue-600">ご要望「{userPreferences.customRequirement}」も考慮されています</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-green-600">¥{topRecommendation.product?.itemPrice.toLocaleString()}</div>
              <div className="text-sm text-gray-500">★{topRecommendation.product?.reviewAverage.toFixed(1)}</div>
            </div>
          </div>
        </div>
      )}

      {/* 総合ランキング */}
      <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg animate-slide-up">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
          <Award className="text-yellow-500" size={24} />
          総合ランキング
        </h2>
        <div className="space-y-3 sm:space-y-4">
          {result.ranking.map((rank, index) => {
            const product = getProduct(rank.productId);
            return (
              <div
                key={rank.productId}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  {getRankingIcon(index + 1)}
                  <span className="font-bold text-base sm:text-lg">{index + 1}位</span>
                </div>
                <div className="flex items-start sm:items-center gap-3 flex-1">
                  <img
                    src={product?.imageUrl}
                    alt={product?.itemName}
                    className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm sm:text-base line-clamp-2">{product?.itemName}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{rank.reason}</p>
                  </div>
                </div>
                <div className="text-right sm:text-center">
                  <div className="font-bold text-lg sm:text-xl text-blue-600">{rank.totalScore.toFixed(1)}</div>
                  <div className="text-xs sm:text-sm text-gray-500">総合スコア</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* レーダーチャート */}
      <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg animate-scale-in">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">📈 評価軸別比較</h2>
        <div className="h-64 sm:h-80 lg:h-96 mb-4 sm:mb-6">
          <Radar data={chartData} options={chartOptions} />
        </div>
        
        {/* 評価軸の説明 */}
        <div className="grid gap-2 sm:gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {result.axes.map((axis, index) => (
            <div
              key={axis.name}
              className="p-3 sm:p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-200"
              onClick={() => setSelectedAxis(selectedAxis === axis.name ? null : axis.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: borderColors[index % borderColors.length] }}
                  ></div>
                  <span className="font-medium text-sm sm:text-base">{axis.name}</span>
                </div>
                <Info size={14} className="text-gray-400 flex-shrink-0" />
              </div>
              {selectedAxis === axis.name && (
                <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">{axis.definition}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AIの総評 */}
      <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg animate-slide-up">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowOverview(!showOverview)}
        >
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md">
              AI
            </div>
            <span>Geminiによる総評</span>
          </h2>
          <div className="flex-shrink-0">
            {showOverview ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
        
        {showOverview && (
          <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-lg border border-gray-100">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
              {result.overview}
            </p>
          </div>
        )}
      </div>

      {/* 詳細スコア表 */}
      <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg animate-scale-in">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">📋 詳細スコア</h2>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-2 font-semibold text-gray-700 min-w-[200px]">商品</th>
                {result.axes.map(axis => (
                  <th key={axis.name} className="text-center py-3 px-2 font-semibold text-gray-700 min-w-[80px] text-sm">
                    {axis.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.scores.map(score => {
                const product = getProduct(score.productId);
                return (
                  <tr key={score.productId} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <img
                          src={product?.imageUrl}
                          alt={product?.itemName}
                          className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-lg flex-shrink-0"
                        />
                        <span className="font-medium text-xs sm:text-sm line-clamp-2 min-w-0">{product?.itemName}</span>
                      </div>
                    </td>
                    {result.axes.map(axis => (
                      <td key={axis.name} className="text-center py-4 px-2">
                        <div className="font-bold text-base sm:text-lg text-blue-600">{score.scores[axis.name]}</div>
                        <div className="text-xs text-gray-500 max-w-16 sm:max-w-20 mx-auto line-clamp-2 mt-1">
                          {score.reason[axis.name]}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};