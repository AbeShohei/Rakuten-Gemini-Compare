export interface Product {
  itemCode: string;
  itemName: string;
  itemPrice: number;
  itemUrl: string;
  imageUrl: string;
  shopName: string;
  reviewAverage: number;
  reviewCount: number;
  description?: string;
}

export interface EvaluationAxis {
  name: string;
  definition: string;
  weight: number;
}

export interface ProductScore {
  productId: string;
  scores: { [axisName: string]: number };
  reason: { [axisName: string]: string };
}

export interface ComparisonResultData {
  axes: EvaluationAxis[];
  scores: ProductScore[];
  ranking: { productId: string; totalScore: number; reason: string }[];
  overview: string;
  userPreferences?: UserPreferences;
}

export interface UserPreferences {
  priorities: { [key: string]: number };
  customRequirement?: string;
}