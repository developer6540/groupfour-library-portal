'use client';

import React, { createContext, useContext, useState } from 'react';

interface DataContextType {
    globalData: string;
    setGlobalData: (value: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [globalData, setGlobalData] = useState("");

    return (
        <DataContext.Provider value={{ globalData, setGlobalData }}>
            {children}
        </DataContext.Provider>
    );
};

export const useDataContext = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("useData must be used within a DataProvider");
    return context;
};