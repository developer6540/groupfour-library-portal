'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    defs,
} from "recharts";

import "./ReadProgressChart.scss"

export default function BooksReadChart() {

    const lineData = [
        { month: "Jan", books: 5 },
        { month: "Feb", books: 8 },
        { month: "Mar", books: 3 },
        { month: "Apr", books: 0 },
        { month: "May", books: 0 },
        { month: "Jun", books: 0 },
        { month: "Jul", books: 0 },
        { month: "Aug", books: 0 },
        { month: "Sep", books: 0 },
        { month: "Oct", books: 0 },
        { month: "Nov", books: 0 },
        { month: "Dec", books: 0 }
    ];

    return (
        <div className="card h-100 chart-line shadow-sm border-0 p-3">

            <h6 className="mb-2">Books Read (Monthly) for this Year</h6>

            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={lineData}>

                    {/* Define linear gradient for the line */}
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
                        stroke="url(#lineGrad)"  // <-- gradient stroke
                        strokeWidth={3}
                        dot={{ r: 4, stroke: "#636e72", strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                    />

                </LineChart>
            </ResponsiveContainer>

        </div>
    );
}