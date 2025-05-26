export interface Product {
    id: number;
    name: string;
    code: string;
    description?: string;
    image?: string;
    imageUrl?: string;
    buyPrice: number;
    sellPrice: number;
    stock: number;
    lowStockLevel?: number;
    expirationDate?: string;
    unitMeasurementsId?: number;
    categoryId?: number;
    clerkId: string;
    brand?: string;
}

export interface CartItem {
    id: number;
    name: string;
    product_id: number,
    quantity: number;
    price: number;
}

export interface Transaction {
    id: number;
    paymentMethodId: number;
    dateOfTransaction: string;
    emailTo?: string;
    cashReceived?: number;
    totalPrice: number;
    status: string;
    items?: string;
    paymentMethodName?: string;
    referenceNumber?: string;
    totalRefund: number;
}

export interface PaymentMethod {
    id: number;
    name: string;
    clerkId?: string;
}

export interface Category {
    id: number;
    name: string;
    parentId: number | null;
}

export interface User {
    id: number;
    name: string;
    email: string;
    profile_picture: string;
}

export type RefundType = "full" | "partial";

export interface RefundItem {
    orderId: number;
    productId: number;
    productName: string;
    originalQuantity: number;
    refundedQuantity: number;
    availableQuantity: number;
    quantityToRefund: number;
    unitPrice: number;
    totalRefund: number;
    refundStatus?: "none" | "partial" | "full";
}

export interface RefundFormData {
    transactionId: number;
    reason: string;
    type: RefundType;
    items: RefundItem[];
    totalAmount: number;
}

export interface Refund {
    id: number;
    transactionId: number;
    dateOfRefund: string;
    totalAmount: number;
    reason?: string;
    type: RefundType;
    clerkId: string;
    items?: RefundItem[];
}

export type RootStackParamList = {
    ProductsList: undefined;
    AddProduct: undefined;
    EditProduct: { product: Product };
    PaymentMethods: undefined;
    AddPaymentMethod: undefined;
    EditPaymentMethod: { paymentMethod: PaymentMethod };
};