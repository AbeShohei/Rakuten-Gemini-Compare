import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface RakutenSearchParams {
  keyword?: string;
  itemCode?: string;
  genreId?: string;
  hits?: number;
}

interface RakutenProduct {
  Item: {
    itemCode: string;
    itemName: string;
    itemPrice: number;
    itemUrl: string;
    imageFlag: number;
    mediumImageUrls: Array<{ imageUrl: string }>;
    smallImageUrls: Array<{ imageUrl: string }>;
    shopName: string;
    reviewAverage: number;
    reviewCount: number;
    itemCaption: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { keyword, itemCode, genreId, hits = 10 }: RakutenSearchParams = await req.json();
    
    // 楽天商品検索API呼び出し
    const rakutenApiKey = Deno.env.get('RAKUTEN_APP_ID');
    if (!rakutenApiKey) {
      throw new Error('Rakuten API key not configured');
    }

    let apiUrl = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?applicationId=${rakutenApiKey}&format=json&hits=${hits}`;
    
    if (keyword) {
      apiUrl += `&keyword=${encodeURIComponent(keyword)}`;
    }
    if (itemCode) {
      apiUrl += `&itemCode=${encodeURIComponent(itemCode)}`;
    }
    if (genreId) {
      apiUrl += `&genreId=${genreId}`;
    }

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Rakuten API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.Items || data.Items.length === 0) {
      return new Response(
        JSON.stringify({ products: [], count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 商品データを正規化
    const products = data.Items.map((item: RakutenProduct) => ({
      itemCode: item.Item.itemCode,
      itemName: item.Item.itemName,
      itemPrice: item.Item.itemPrice,
      itemUrl: item.Item.itemUrl,
      imageUrl: item.Item.mediumImageUrls?.[0]?.imageUrl || 
                item.Item.smallImageUrls?.[0]?.imageUrl || 
                'https://via.placeholder.com/300x300?text=No+Image',
      shopName: item.Item.shopName,
      reviewAverage: item.Item.reviewAverage || 0,
      reviewCount: item.Item.reviewCount || 0,
      description: item.Item.itemCaption || '',
    }));

    // 商品情報をキャッシュに保存
    for (const product of products) {
      await supabase
        .from('products')
        .upsert({
          ...product,
          cached_at: new Date().toISOString(),
        });
    }

    return new Response(
      JSON.stringify({ products, count: products.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Rakuten search error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});