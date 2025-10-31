import React from "react";
import moment from "moment";

interface MonthYearSelectorProps {
    selectedMonth: string;
    onChange: (newMonth: string) => void;
}


export const MonthYearSelector: React.FC<MonthYearSelectorProps> = ({ selectedMonth, onChange }) => {
    // Gera últimos 12 meses
    const monthOptions = Array.from({ length: 12 }, (_, i) => {
        const monthNumber = (i + 1).toString().padStart(2, "0");
        return { value: monthNumber, label: moment(monthNumber, "MM").format("MMM") };
    });

    // Gera anos a partir de 2025
    const yearOptions = Array.from({ length: 1 }, (_, i) => (2025 + i).toString());

    return (
        <div className="flex gap-2">
            <select
                className="px-3 py-2 rounded-lg bg-white shadow text-sm"
                value={selectedMonth.split("-")[0]}
                onChange={(e) => {
                    const month = e.target.value;
                    const year = selectedMonth.split("-")[1];
                    onChange(`${month}-${year}`);
                }}
            >
                {monthOptions.map((m) => (
                    <option key={m.value} value={m.value}>
                        {m.label}
                    </option>
                ))}
            </select>

            <select
                className="px-3 py-2 rounded-lg bg-white shadow text-sm"
                value={selectedMonth.split("-")[1]}
                onChange={(e) => {
                    const year = e.target.value;
                    const month = selectedMonth.split("-")[0];
                    onChange(`${month}-${year}`);
                }}
            >
                {yearOptions.map((y) => (
                    <option key={y} value={y}>
                        {y}
                    </option>
                ))}
            </select>
        </div>
    );
};
