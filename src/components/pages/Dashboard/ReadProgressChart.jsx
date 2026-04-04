'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

import "./ReadProgressChart.scss";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function BooksReadChart({ data }) {

    // ✅ Convert API data to chart format
    const lineData = MONTHS.map((month, index) => {
        const found = data?.monthly_reads?.find(
            (m) => m.MonthNumber === index + 1
        );

        return {
            month,
            books: found?.BookCount || 0
        };
    });

    return (
        <div className="card h-100 chart-line shadow-sm border-0 p-3">

            <h6 className="mb-2">Books Read (Monthly) for this Year</h6>

            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={lineData}>

                    {/* Gradient */}
                    <defs>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#9d4edd" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#7b2cbf" stopOpacity={1}/>
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

                    <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: "#636e72", fontWeight: 500 }}
                    />

                    <YAxis tick={{ fontSize: 12, fill: "#b2bec3" }} />

                    <Tooltip
                        contentStyle={{
                            fontSize: "12px",
                            border: "none",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            backgroundColor: "rgba(255,255,255,0.95)",
                            backdropFilter: "blur(4px)"
                        }}
                        itemStyle={{ fontSize: "12px", color: "#2d3436" }}
                    />

                    <Line
                        type="monotone"
                        dataKey="books"
                        stroke="url(#lineGrad)"
                        strokeWidth={3}
                        dot={{ r: 4, stroke: "#636e72", strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                    />

                </LineChart>
            </ResponsiveContainer>

        </div>
    );
}