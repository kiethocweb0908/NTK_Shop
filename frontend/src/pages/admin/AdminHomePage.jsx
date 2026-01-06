import StatsCard from '@/components/admin/StatsCard';
import RevenueChart from '@/components/admin/RevenueChart';
import OrderStatusPie from '@/components/admin/OrderStatusPie';
import axiosInstance from '@/lib/axios';
import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';

// shadcn
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// icons
import { FaClipboardList, FaTshirt, FaUser, FaDollarSign, FaCoins } from 'react-icons/fa';
import { Clock } from 'lucide-react';
import { timeFilter } from '@/lib/data/data';
import { useSearchParams } from 'react-router-dom';

const AdminHomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get('filter') || 'all';
  const [stats, setStats] = useState({});

  const handleFilterChange = (value) => {
    setSearchParams(value === 'all' ? {} : { filter: value });
  };

  useEffect(() => {
    const fetchStats = async () => {
      const response = await axiosInstance.get(`/api/admin/stats?filter=${filter}`);

      setStats(response.data);
    };

    fetchStats();
  }, [filter]);

  if (Object.keys(stats).length === 0)
    return <p className="text-center">Đang tải dữ liệu...</p>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold uppercase">Tổng quan</h2>

        {/* Thời gian */}
        <div>
          <Select value={filter} onValueChange={(value) => handleFilterChange(value)}>
            <SelectTrigger className="w-50 py-4">
              <Clock className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Lọc theo thời gian" />
            </SelectTrigger>
            <SelectContent className="bg-white w-50">
              {timeFilter.map((f, index) => (
                <SelectItem className={'hover:bg-gray-100'} key={index} value={f.value}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 ">
        <StatsCard
          icon={FaUser}
          cd="-translate-y-0.5 text-blue-500"
          title="Tổng người dùng"
          value={stats.summary?.totalUsers}
        />
        <StatsCard
          icon={FaTshirt}
          cd="text-green-500"
          title="Tổng sản phẩm"
          value={stats.summary?.totalProducts}
        />
        <StatsCard
          icon={FaClipboardList}
          cd="text-amber-500"
          title="Tổng đơn hàng"
          value={stats.summary?.totalOrders}
        />
        <StatsCard
          icon={FaCoins}
          cd="text-yellow-500"
          title="Doanh thu"
          value={formatCurrency(stats.summary?.totalRevenue)}
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RevenueChart cd={'col-span-2'} data={stats?.revenueChart} />
        <OrderStatusPie title={'sản phẩm'} data={stats?.productByCategory} />
        <OrderStatusPie title={'đơn hàng'} data={stats?.orderStatusData} />
      </div>
    </div>
  );
};

export default AdminHomePage;
