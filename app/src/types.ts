export interface Product {
  id: number;
  name: string;
  code: string;
  description: string;
  image: string;
  buy_price: number;
  sell_price: number;
  stock: number;
  low_stock_level: number;
  expiration_date: string;
  unit_measurements_id: number;
}

export interface CartItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

export interface Transaction {
  id: number;
  payment_method: string;
  date_of_transaction: string;
  email_to: string;
  cash_received: number;
  total_price: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  profile_picture: string;
}

export type RootStackParamList = {
  ProductsList: undefined;
  AddProduct: undefined;
  EditProduct: { product: Product };
};