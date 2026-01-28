export interface Category {
    id: string;
    name: string;
}

export interface Service {
    id: string;
    name: string;
    description?: string;
    price: number; // en el backend es Decimal, aqui number
    durationMin: number;
    imageUrl?: string;
    images?: string[];
    deposit?: number;
    removalPriceOwn?: number;
    removalPriceForeign?: number;
    categoryId: string;
}

export interface GenericResponse {
    success: boolean;
    message?: string;
}

export interface Availability {
    id: string;
    date: string;
    isBlocked: boolean;
    slots: string[] | string;
}

export interface Appointment {
    id: string;
    date: string | Date;
    status: string;
    userId: string;
    serviceId: string;
}
