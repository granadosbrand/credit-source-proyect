export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
    metadata?: Record<string, any>;
}
