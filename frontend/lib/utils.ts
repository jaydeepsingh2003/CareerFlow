import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Simulate delay for async ops visualization
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Format currency
export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
};

// Generate random ID
export const generateId = () => Math.random().toString(36).substring(2, 9);