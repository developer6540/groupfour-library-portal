'use client';

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

import "./BookStatusChart.scss";

export default function BookStatusChart({data}) {

    const pieData = [
        { name: "Reserved book", value: data?.TotalReservedBooks ?? "0", gradientId: "grad1" },
        { name: "Total Books Read", value: data?.TotalBooksRead ?? "0", gradientId: "grad2" },
        { name: "Books Overdue", value: data?.TotalBooksOverdue ?? "0", gradientId: "grad3" },
    ];

    // Radial gradients for 3D effect
    const gradientColors = [
        ["#9d4edd", "#7b2cbf"],
        ["#ff8fab", "#f72585"],
        ["#ff9e66", "#ff6d00"],
    ];

    return (
        <div className="card h-100 chart-pie shadow-sm border-0 p-3">
            <h6 className="mb-2">Book Status Distribution</h6>

            <ResponsiveContainer width="100%" height={250}>
                <PieChart>

                    {/* Radial Gradients */}
                    <defs>
                        {gradientColors.map(([start, end], index) => (
                            <radialGradient
                                id={`grad${index + 1}`}
                                key={index}
                                cx="50%" cy="50%" r="50%"
                                fx="50%" fy="50%"
                            >
                                <stop offset="0%" stopColor={start} stopOpacity={1}/>
                                <stop offset="100%" stopColor={end} stopOpacity={1}/>
                            </radialGradient>
                        ))}
                    </defs>

                    {/* Pie */}
                    <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                    >
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`url(#${entry.gradientId})`} />
                        ))}
                    </Pie>

                    <Tooltip
                        contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
                        itemStyle={{ fontSize: "12px" }}
                    />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 12 }} />

                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}