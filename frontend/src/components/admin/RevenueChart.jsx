import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dayjs from 'dayjs';
// import { Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/utils';

export default function RevenueChart({ data, cd }) {
  return (
    <div className={`bg-white p-4 rounded-xl border-gray-200 shadow-md ${cd}`}>
      <h3 className="font-semibold mb-4">Doanh thu</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="date" tickFormatter={(value) => dayjs(value).format('DD/MM')} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="revenue"
            fill="#6EA8FF" // xanh tailwind
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border rounded-md px-3 py-2 shadow text-sm">
      <p className="font-medium">{dayjs(label).format('DD/MM/YYYY')}</p>
      <p className="text-blue-600">Doanh thu: {formatCurrency(payload[0].value)}</p>
    </div>
  );
};
