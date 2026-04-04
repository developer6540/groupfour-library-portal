'use client';

import React, { createContext, useContext, useState } from 'react';

interface DataContextType {
    getGlobalData: any;
    setGlobalData: (value: any) => void;
    getGlobalDataCart: any;
    setGlobalDataCart: (value: any) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [getGlobalData, setGlobalData] = useState(""); // for search input/global data
    const [getGlobalDataCart, setGlobalDataCart] = useState<any[]>([]); // for cart items

    return (
        <DataContext.Provider value={{
            getGlobalData,
            setGlobalData,
            getGlobalDataCart,
            setGlobalDataCart
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useDataContext = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("useData must be used within a DataProvider");
    return context;
};