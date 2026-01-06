import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from '@/lib/data/data';

const COLORS = [
  '#9FE2BF', // xanh mint
  '#6EA8FF', // xanh biển nhạt
  '#FFD27A', // vàng nhạt
  '#FFB3B3', // đỏ hồng nhạt
  '#C9B6E4', // tím nhạt
  '#8FE3CF', // xanh ngọc nhạt
  '#B8D8FF', // xanh dương nhạt
  '#FFE0A3', // vàng kem
];

export default function OrderStatusPie({ data, title }) {
  return (
    <div className="bg-white p-4 rounded-xl border-gray-200 shadow-md">
      <h3 className="font-semibold mb-4">Thống kê {title}</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label={({ name, percent }) =>
              `${ORDER_STATUS_LABEL[name] || name} (${(percent * 100).toFixed(0)}%)`
            }
          >
            {data.map((item, index) =>
              title === 'sản phẩm' ? (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ) : (
                <Cell key={index} fill={ORDER_STATUS_COLOR[item.name] || '#94a3b8'} />
              )
            )}
          </Pie>
          <Tooltip
            formatter={(value, name) => [value, ORDER_STATUS_LABEL[name] || name]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
