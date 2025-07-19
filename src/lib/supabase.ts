import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Authentication helpers
export const auth = {
  signUp: (email: string, password: string) =>
    supabase.auth.signUp({ email, password }),
  
  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),
  
  signOut: () => supabase.auth.signOut(),
  
  getSession: () => supabase.auth.getSession(),
  
  onAuthStateChange: (callback: (event: string, session: any) => void) =>
    supabase.auth.onAuthStateChange(callback),
};

// Database helpers
export const db = {
  // Products
  getProducts: (itemCodes: string[]) =>
    supabase.from('products').select('*').in('item_code', itemCodes),
  
  searchProducts: async (keyword: string) => {
    const { data, error } = await supabase.functions.invoke('rakuten-search', {
      body: { keyword, hits: 20 }
    });
    
    if (error) throw error;
    return data;
  },

  // Comparison History
  saveComparison: (comparison: {
    title: string;
    product_codes: string[];
    user_preferences?: any;
    evaluation_axes?: any;
    comparison_result?: any;
  }) =>
    supabase.from('comparison_history').insert(comparison),
  
  getComparisonHistory: (userId: string) =>
    supabase
      .from('comparison_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  
  deleteComparison: (id: string) =>
    supabase.from('comparison_history').delete().eq('id', id),

  // Favorites
  addToFavorites: (productCode: string, memo?: string) =>
    supabase.from('favorites').insert({ product_code: productCode, memo }),
  
  getFavorites: (userId: string) =>
    supabase
      .from('favorites')
      .select(`
        *,
        products:product_code (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  
  removeFavorite: (id: string) =>
    supabase.from('favorites').delete().eq('id', id),

  // Gemini Comparison
  compareWithGemini: async (productCodes: string[], userPreferences?: any) => {
    const { data, error } = await supabase.functions.invoke('gemini-compare', {
      body: { productCodes, userPreferences }
    });
    
    if (error) throw error;
    return data;
  },
};