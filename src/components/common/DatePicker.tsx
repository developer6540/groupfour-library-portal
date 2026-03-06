'use client';

import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerInputProps {
    label: string;
    value?: string | Date | null;
    onChange: (date: Date | null) => void;
    maxDate?: Date;
    format?: string;
}

export default function DatePickerInput({ label, value, onChange, maxDate, format="yyyy-mm-dd" }: DatePickerInputProps) {

    const selectedDate = value ? new Date(value) : null;

    return (
            <>
                <DatePicker
                    selected={selectedDate}
                    onChange={onChange}
                    dateFormat={format}
                    className="form-control"
                    maxDate={maxDate}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                />
            </>
    );
}