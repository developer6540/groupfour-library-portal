'use client';

import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {partial} from "es-toolkit";
import placeholder = partial.placeholder;

interface DatePickerInputProps {
    label: string;
    value?: string | Date | null;
    onChange: (date: Date | null) => void;
    maxDate?: Date;
    placeholder: string;
}

export default function DatePickerInput({ label, value, onChange, maxDate, placeholder}: DatePickerInputProps) {

    const selectedDate = value ? new Date(value) : null;

    return (
            <>
                <DatePicker
                    selected={selectedDate}
                    onChange={onChange}
                    dateFormat="yyyy-MM-dd"
                    className="form-control"
                    maxDate={maxDate}
                    showMonthDropdown
                    showYearDropdown
                    placeholderText={placeholder || 'YYYY-MM-DD'}
                    dropdownMode="select"
                />
            </>
    );
}