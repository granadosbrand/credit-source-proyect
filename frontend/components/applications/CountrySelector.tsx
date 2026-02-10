'use client';

import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui';
import { COUNTRY_LIST } from '@/lib/constants';
import { Country } from '@/types';

interface CountrySelectorProps {
    value?: Country;
    onChange?: (country: Country) => void;
    disabled?: boolean;
    placeholder?: string;
}

/**
 * CountrySelector - Selector de país con banderas
 */
export function CountrySelector({
    value,
    onChange,
    disabled,
    placeholder = 'Selecciona un país',
}: CountrySelectorProps) {
    return (
        <Select value={value} onValueChange={(val) => onChange?.(val as Country)}>
            <SelectTrigger disabled={disabled} className="w-full">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {COUNTRY_LIST.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                        {country.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
