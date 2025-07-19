export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          item_code: string;
          item_name: string;
          item_price: number;
          item_url: string;
          image_url: string | null;
          shop_name: string | null;
          review_average: number | null;
          review_count: number | null;
          description: string | null;
          cached_at: string;
          updated_at: string;
        };
        Insert: {
          item_code: string;
          item_name: string;
          item_price: number;
          item_url: string;
          image_url?: string | null;
          shop_name?: string | null;
          review_average?: number | null;
          review_count?: number | null;
          description?: string | null;
          cached_at?: string;
          updated_at?: string;
        };
        Update: {
          item_code?: string;
          item_name?: string;
          item_price?: number;
          item_url?: string;
          image_url?: string | null;
          shop_name?: string | null;
          review_average?: number | null;
          review_count?: number | null;
          description?: string | null;
          cached_at?: string;
          updated_at?: string;
        };
      };
      comparison_history: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          product_codes: string[];
          user_preferences: any | null;
          evaluation_axes: any | null;
          comparison_result: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          product_codes: string[];
          user_preferences?: any | null;
          evaluation_axes?: any | null;
          comparison_result?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          product_codes?: string[];
          user_preferences?: any | null;
          evaluation_axes?: any | null;
          comparison_result?: any | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          product_code: string;
          memo: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_code: string;
          memo?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_code?: string;
          memo?: string | null;
          created_at?: string;
        };
      };
    };
  };
}