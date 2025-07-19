import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CompareRequest {
  productCodes: string[];
  userPreferences?: {
    priorities: { [key: string]: number };
    customRequirement?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { productCodes, userPreferences }: CompareRequest = await req.json();

    // 商品情報を取得
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('item_code', productCodes);

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`);
    }

    if (!products || products.length === 0) {
      throw new Error('No products found');
    }

    // Gemini APIでの比較分析
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = buildComparisonPrompt(products, userPreferences);
    
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const analysisText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!analysisText) {
      throw new Error('No analysis received from Gemini');
    }

    // JSONレスポンスをパース
    const analysis = parseGeminiResponse(analysisText);

    return new Response(
      JSON.stringify({
        axes: analysis.axes,
        scores: analysis.scores,
        ranking: analysis.ranking,
        overview: analysis.overview,
        userPreferences
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Gemini comparison error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function buildComparisonPrompt(products: any[], userPreferences?: any): string {
  const preferencesText = userPreferences ? `
ユーザーの重視ポイント:
${Object.entries(userPreferences.priorities).map(([key, value]) => `- ${key}: ${value}%`).join('\n')}
${userPreferences.customRequirement ? `\n追加要望: ${userPreferences.customRequirement}` : ''}
` : '';

  return `あなたはECコンサルタントです。以下の楽天市場商品を比較し、適切な評価軸を3-6個設定して分析してください。

${preferencesText}

商品情報:
${products.map((p, i) => `
${i + 1}. ${p.item_name}
   価格: ¥${p.item_price.toLocaleString()}
   ショップ: ${p.shop_name}
   レビュー: ★${p.review_average} (${p.review_count}件)
   説明: ${p.description.substring(0, 200)}...
   商品コード: ${p.item_code}
`).join('\n')}

以下のJSON形式で回答してください:

{
  "axes": [
    {"name": "評価軸名", "definition": "評価軸の定義", "weight": 1.0}
  ],
  "scores": [
    {
      "productId": "商品コード",
      "scores": {"評価軸名": 5},
      "reason": {"評価軸名": "理由"}
    }
  ],
  "ranking": [
    {"productId": "商品コード", "totalScore": 4.2, "reason": "総合理由"}
  ],
  "overview": "分析の総評"
}

重要: 必ずJSONのみを返してください。追加のテキストは含めないでください。`;
}

function parseGeminiResponse(text: string): any {
  try {
    // JSONブロックを抽出
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    // フォールバック：ダミーデータを返す
    console.error('Failed to parse Gemini response:', error);
    return {
      axes: [
        { name: 'コストパフォーマンス', definition: '価格に対する機能や品質の充実度', weight: 1.0 },
        { name: 'デザイン性', definition: '見た目の美しさや洗練度', weight: 0.8 },
        { name: '機能性', definition: '使い勝手や実用的な機能の豊富さ', weight: 0.9 },
        { name: '信頼性', definition: 'ブランドやレビューから見る安心感', weight: 0.7 }
      ],
      scores: [],
      ranking: [],
      overview: 'AI分析中にエラーが発生しましたが、基本的な評価軸で分析を継続します。'
    };
  }
}