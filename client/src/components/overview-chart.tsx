import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';
import { MoreHorizontal } from "lucide-react";
import type { ChartData } from "@shared/schema";

interface OverviewChartProps {
  data: ChartData[];
}

export default function OverviewChart({ data }: OverviewChartProps) {
  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-text-primary">Overview</h3>
        <button 
          className="text-text-secondary hover:text-text-primary p-1"
          data-testid="button-chart-options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-medisight-teal rounded-full"></div>
            <span className="text-xs text-text-secondary">Hospitalized patients</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span className="text-xs text-text-secondary">Outpatients</span>
          </div>
        </div>
      </div>

      <div className="h-64" data-testid="chart-overview">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              domain={[0, 'dataMax + 50']}
            />
            <Line
              type="monotone"
              dataKey="hospitalizedPatients"
              stroke="var(--medisight-teal)"
              strokeWidth={2}
              dot={{ fill: 'var(--medisight-teal)', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: 'var(--medisight-teal)', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="outpatients"
              stroke="#D1D5DB"
              strokeWidth={2}
              dot={{ fill: '#D1D5DB', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: '#D1D5DB', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
