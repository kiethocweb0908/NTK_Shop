import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { fetchAdminProductDetails } from '@/redux/admin/slices/adminProductsSlice';
import { AlertTriangle, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

//format
import { formatCurrency, toWebp } from '@/lib/utils';

// icons
import {
  User2,
  Hash,
  Coins,
  FileText,
  Package,
  Layers,
  Palette,
  Image,
  Edit,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// slice action
import { clearSelectedProduct } from '@/redux/admin/slices/adminProductsSlice';
import { Button } from '@/components/ui/button';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const { selectedProduct } = useSelector((state) => state.adminProducts);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const product = selectedProduct;

  const fetchProductDetail = async () => {
    try {
      const response = await dispatch(fetchAdminProductDetails({ productId })).unwrap();
      // toast.success(response?.message || 'Lấy chi tiết sản phẩm thành công!', {
      //   duration: 3000,
      // });
    } catch (error) {
      toast.error(error?.message || 'Lỗi khi lấy chi tiết', { duration: 3000 });
    }
  };

  useEffect(() => {
    if (product) {
      dispatch(clearSelectedProduct());
    }
    fetchProductDetail();

    return () => {
      // cleanup khi thoát trang
      dispatch(clearSelectedProduct());
    };
  }, [dispatch]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto p-7 text-center">
        <p className="text-gray-500">Đang tải dữ liệu sản phẩm...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 fixed right-5 bottom-5 z-10">
        <Link
          to="edit"
          className="flex gap-3 items-center justify-start
          border border-amber-500 rounded-md bg-white 
          underline text-amber-600 py-2 px-3 text-sm 
          hover:text-amber-500 active:text-amber-600"
        >
          <Edit className="h-5 w-5" />
          Chỉnh sửa sản phẩm
        </Link>
        <Button
          // to={`/admin/products`}
          onClick={() => navigate(-1)}
          variant={'outline'}
          className="flex items-center gap-3 bg-white justify-start
          underline text-blue-500
          hover:text-blue-400 active:text-blue-500"
        >
          <ArrowLeft className="" /> Quay lại trang sản phẩm
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center">
          {/* Tiêu đề */}
          <h2 className="text-2xl font-semibold uppercase mb-6 pt-7 px-7">
            Chi tiết sản phẩm
          </h2>
        </div>

        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6 p-7 shadow-md rounded-xl">
          {/* tên */}
          <div>
            <label className="block font-semibold mb-2">Tên sản phẩm *</label>
            <p
              className="w-full px-4 py-2 min-h-14
            border border-gray-500 rounded-lg 
            text-sm font-medium text-black whitespace-pre-line
            mb-2"
            >
              {product.name}
            </p>
          </div>

          {/* SKU */}
          <div>
            <label className="block font-semibold mb-2">SKU sản phẩm *</label>
            <p
              className="w-full px-4 py-2 min-h-14 flex items-center gap-2
            border border-gray-500 rounded-lg 
            text-sm font-normal text-black whitespace-pre-line
            mb-2"
            >
              <Hash className="h-5 w-5" />
              {product.sku}
            </p>
          </div>

          {/* Mô tả */}
          <div className="sm:col-span-2">
            <label className="block font-semibold mb-2">Mô tả sản phẩm *</label>
            <p
              className="w-full px-4 py-2 mb-2 min-h-18 overflow-y-auto
            flex items-start gap-2
            border border-gray-500 rounded-lg 
            text-sm font-normal text-black whitespace-pre-line"
            >
              <FileText className="h-5 w-5 text-blue-500" />
              {product.description}
            </p>
          </div>

          {/* giá gốc */}
          <div className="">
            <label className="block font-semibold mb-2">Giá sản phẩm *</label>
            <p
              className="w-full px-4 py-2 flex items-center gap-2
            border border-gray-500 rounded-lg 
            text-sm font-normal text-black whitespace-pre-line
            mb-2"
            >
              <Coins className="h-5 w-5 text-yellow-500" />
              {formatCurrency(product.price)}
            </p>
          </div>

          {/* giảm giá */}
          <div className="">
            <label className="block font-semibold mb-2">Giá khuyến mãi </label>
            <p
              className={`w-full px-4 py-2 
              flex items-center gap-2
            border border-gray-500 rounded-lg 
            text-sm  whitespace-pre-line
            mb-2
            ${product?.discountPrice ? 'text-red-400 font-semibold' : 'text-black font-normal '}`}
            >
              <Coins className="h-5 w-5 text-yellow-500" />
              {formatCurrency(product?.discountPrice) || 'Chưa có giảm giá'}
            </p>
          </div>

          <div className="col-span-2 flex gap-10 ">
            {/* Danh mục */}
            <div className="flex gap-2 items-center">
              <label className="block font-semibold mb-2">Danh mục: *</label>
              <p
                className="px-4 py-2
              flex items-center gap-2
            border border-gray-500 rounded-lg 
            text-sm font-normal text-black whitespace-pre-line
            mb-2"
              >
                <Layers className="h-5 w-5 text-gray-700" />
                {product.category.name}
              </p>
            </div>

            {/* Giới tính */}
            <div className="flex gap-2 items-center">
              <label className="block font-semibold mb-2">Giới tính: *</label>
              <p
                className="px-4 py-2
            border border-gray-500 rounded-lg 
              flex gap-2 items-center
              text-sm font-normal text-black whitespace-pre-line
            mb-2"
              >
                <User2
                  className={`h-5 w-5
                ${
                  product.gender === 'Men'
                    ? 'text-blue-500'
                    : product.gender === 'Women'
                      ? 'text-pink-500'
                      : 'text-purple-500'
                }`}
                />
                {product.gender}
              </p>
            </div>

            {/* Bộ sưu tập */}
            <div>
              <div className="flex gap-2 items-center">
                <label className="block font-semibold mb-2">Bộ sưu tập: </label>
                <p
                  className="px-4 py-2
                flex items-center gap-2
            border border-gray-500 rounded-lg 
            text-sm font-normal text-black whitespace-pre-line
            mb-2"
                >
                  <Package className="h-5 w-5 text-amber-500" />
                  {product.productCollection || 'Không có'}
                </p>
              </div>
            </div>
          </div>

          {/* Màu sắc */}
          <div>
            <div className="flex items-center gap-4">
              <label className="block font-semibold">Biến thể màu sắc: </label>
              <p
                className="px-4 py-2
              flex items-center gap-2
            border border-gray-500 rounded-lg 
            text-sm font-normal text-black whitespace-pre-line
            mb-2"
              >
                {product.variants.length}/6
                <Palette className="h-5 w-5 text-pink-400" />
              </p>
            </div>
          </div>
        </div>
        {/* Các biến thể màu sắc được thêm vào */}
        {product.variants.map((variant, variantIndex) => {
          return (
            <div
              key={variantIndex}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-7 shadow-md rounded-xl relative border-t border-gray-100"
            >
              {/* Left - Màu và Size */}
              <div>
                <label className="block font-semibold mb-4">
                  Biến thể {variantIndex + 1}
                </label>
                {/* màu */}
                <div className="flex items-center gap-4 mb-6">
                  <label className="block font-medium">Màu sắc: *</label>
                  <div className="flex items-center gap-3">
                    <p
                      className="p-3 rounded-full border-3 border-blue-500"
                      style={{ backgroundColor: variant.colorHex.toLowerCase() }}
                    ></p>
                    <p>
                      {variant.colorName} ({variant.colorHex})
                    </p>
                  </div>
                </div>
                {/* kích thước */}
                <div className="mb-4">
                  <table className="min-w-full text-left text-gray-500">
                    <thead className="bg-gray-100 text-xs uppercase">
                      <tr>
                        <th className="py-3 px-4 w-8 text-right">Trạng thái</th>
                        <th className="py-3 px-4 text-center">Tên kích thước</th>
                        <th className="py-3 px-4 text-center">Số lượng</th>
                      </tr>
                    </thead>
                    <tbody className="text-black">
                      {variant.sizes.map((size, sizeIndex) => {
                        return (
                          <tr key={sizeIndex} className="border-b border-gray-300">
                            {/* checkbox */}
                            <td className="py-2 px-4 text-right">
                              <Badge
                                variant={
                                  size.countInStock <= 0
                                    ? 'soldOut'
                                    : size.countInStock <= 10
                                      ? 'warning'
                                      : 'success'
                                }
                                className="min-w-[93px]"
                              >
                                {size.countInStock === 0 ? (
                                  <XCircle />
                                ) : size.countInStock <= 20 ? (
                                  <AlertTriangle />
                                ) : (
                                  <CheckCircle2 />
                                )}

                                {size.countInStock === 0
                                  ? 'Hết hàng'
                                  : size.countInStock <= 10
                                    ? 'Số lượng ít'
                                    : 'Còn hàng'}
                              </Badge>
                            </td>

                            <td className="py-2 px-4 text-center">
                              <label className="font-semibold">{size.name}</label>
                            </td>
                            <td className="py-2 px-4 text-center">
                              <label className="font-semibold">{size.countInStock}</label>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Right - hình ảnh */}
              <div>
                <label className="block font-semibold mb-4">Hình ảnh</label>
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <label className="block font-medium ">số ảnh:</label>
                    <p
                      className="px-2 py-1
              flex items-center gap-2
            border border-gray-500 rounded-lg 
            text-sm font-normal text-black whitespace-pre-line
            "
                    >
                      {variant.images.length}/5
                      <Image className="h-5 w-5 text-green-700" />
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 sm:max-h-[392px] md:max-h-[284px]">
                    {variant.images.map((image, index) => {
                      return (
                        <div key={index} className="relative">
                          <img
                            src={toWebp(image.url)}
                            alt={`Variant ${variantIndex + 1} - ${index + 1}`}
                            className="w-full h-[134px] sm:h-[188px] md:h-[134px] object-cover rounded-xl"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ProductDetailPage;
