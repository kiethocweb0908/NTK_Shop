export const navType = {
  all: 'Tất cả',
  tops: 'Áo',
  bottoms: 'Quần',
  outerwears: 'Áo khoác',
};

// Filter
export const colors = [
  { colorName: 'Đen', colorHex: '#111111' },
  { colorName: 'Trắng', colorHex: '#FFFFFF' },
  { colorName: 'Xám', colorHex: '#999999' },
  { colorName: 'Be', colorHex: '#F0E4D7' },
  { colorName: 'Nâu', colorHex: '#D9BCA8' },
  { colorName: 'Đỏ', colorHex: '#FF6666' },
  { colorName: 'Hồng', colorHex: '#FFD1DC' },
  { colorName: 'Cam', colorHex: '#FF9A76' },
  { colorName: 'Vàng', colorHex: '#FFD27A' },
  { colorName: 'Xanh mint', colorHex: '#79D7BE' },
  { colorName: 'Xanh dương', colorHex: '#6EA8FF' },
  { colorName: 'Tím', colorHex: '#C39BE0' },
];
export const sizes = ['XS', 'S', 'M', 'L', 'XL'];
export const genders = [
  {
    value: 'Men',
    name: 'Nam',
  },
  {
    value: 'Women',
    name: 'Nữ',
  },
  {
    value: 'Unisex',
    name: 'Unisex',
  },
];
export const materials = [
  'Cotton',
  'Wool',
  'Denim',
  'Polyester',
  'Silk',
  'Linen',
  'Viscose',
  'Fleece',
];

export const sort = [
  {
    value: 'newest',
    name: 'Mới nhất',
  },
  {
    value: 'oldest',
    name: 'Cũ nhất',
  },
  {
    value: 'nameAsc',
    name: 'Tên A - Z',
  },
  {
    value: 'nameDesc',
    name: 'Tên Z - A',
  },
  {
    value: 'priceAsc',
    name: 'Giá Thấp - Cao',
  },
  {
    value: 'priceDesc',
    name: 'Giá Cao - Thấp',
  },
  {
    value: 'stockAsc',
    name: 'Số lượng ít',
  },
  {
    value: 'stockDesc',
    name: 'Số lượng nhiều',
  },
];

export const sortPublic = [
  {
    value: 'newest',
    name: 'Mới nhất',
  },
  {
    value: 'oldest',
    name: 'Cũ nhất',
  },
  {
    value: 'nameAsc',
    name: 'Tên A - Z',
  },
  {
    value: 'nameDesc',
    name: 'Tên Z - A',
  },
  {
    value: 'priceAsc',
    name: 'Giá Thấp - Cao',
  },
  {
    value: 'priceDesc',
    name: 'Giá Cao - Thấp',
  },
];

export const filter = [
  {
    value: 'all',
    name: 'Tất cả sản phẩm',
  },
  {
    value: 'published',
    name: 'Đang hiển thị',
  },
  {
    value: 'draft',
    name: 'Đã ẩn',
  },
  {
    value: 'featured',
    name: 'Nổi bật',
  },
  {
    value: 'hasDiscount',
    name: 'Đang giảm giá',
  },
  {
    value: 'inStock',
    name: 'Còn hàng',
  },
  {
    value: 'lowStock',
    name: 'Số lượng thấp',
  },
  {
    value: 'outOfStock',
    name: 'Hết hàng',
  },
];

export const rowsPerPage = [
  {
    value: 1,
  },
  {
    value: 2,
  },
  {
    value: 3,
  },
  {
    value: 5,
  },
  {
    value: 10,
  },
  {
    value: 20,
  },
  {
    value: 30,
  },
  {
    value: 50,
  },
];

export const allSizes = ['XS', 'S', 'M', 'L', 'XL'];
// discount;
// rating;

//=======ORDER=======
export const orderStatus = [
  {
    value: 'all',
    name: 'Tất cả tt đơn hàng',
  },
  {
    value: 'processing',
    name: 'Chờ xác nhận',
  },
  {
    value: 'confirmed',
    name: 'Đã xác nhận',
  },
  {
    value: 'shipping',
    name: 'Đang vận chuyển',
  },
  {
    value: 'delivered',
    name: 'Đã giao',
  },
  {
    value: 'completed',
    name: 'Hoàn thành',
  },
  {
    value: 'cancelled',
    name: 'Đã huỷ',
  },
];

export const paymentStatus = [
  {
    value: 'all',
    name: 'Tất cả tt thanh toán',
  },
  {
    value: 'pending',
    name: 'Chờ thanh toán',
  },
  {
    value: 'paid',
    name: 'Đã trả',
  },
  {
    value: 'failed',
    name: 'Thất bại',
  },
  {
    value: 'refunded',
    name: 'Hoàn tiền',
  },
];

export const timeFilter = [
  {
    value: 'all',
    name: 'Tất cả thời gian',
  },
  {
    value: 'today',
    name: 'Hôm nay',
  },
  {
    value: 'week',
    name: 'Tuần này',
  },
  {
    value: 'month',
    name: 'Tháng này',
  },
  {
    value: 'year',
    name: 'Năm nay',
  },
];

export const paymentMethods = [
  {
    value: 'cod',
    name: 'Thanh toán cod',
  },
  {
    value: 'paypal',
    name: 'Thanh toán PayPal',
  },
  {
    value: 'momo',
    name: 'Thanh toán MoMo',
  },
  {
    value: 'vnpay',
    name: 'Thanh toán VNPay',
  },
];

export const sortCollection = [
  {
    value: 'newest',
    name: 'Mới nhất',
  },
  {
    value: 'oldest',
    name: 'Cũ nhất',
  },
  {
    value: 'nameAsc',
    name: 'Tên A - Z',
  },
  {
    value: 'nameDesc',
    name: 'Tên Z - A',
  },
  {
    value: 'productsAsc',
    name: 'Số lượng ít',
  },
  {
    value: 'productsDesc',
    name: 'Số lượng nhiều',
  },
];

export const roles = [
  {
    value: 'all',
    name: 'Tất cả tài khoản',
  },
  {
    value: 'admin',
    name: 'Quản trị viên',
  },
  {
    value: 'customer',
    name: 'Khách hàng',
  },
  {
    value: 'viewer',
    name: 'Người tham quan',
  },
];

export const ORDER_STATUS_COLOR = {
  processing: '#FFD27A', // vàng
  confirmed: '#9FE2BF', // xanh dương
  shipping: '#6EA8FF', // xanh biển
  delivered: '#9FE2BF',
  completed: '#81dead', // xanh lá
  cancelled: '#FF6666', // đỏ
};

export const ORDER_STATUS_LABEL = {
  processing: 'Đang xử lý',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã huỷ',
};
