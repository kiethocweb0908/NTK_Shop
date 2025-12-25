import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Action } from '@radix-ui/react-alert-dialog';
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Star,
  Trash2,
  XIcon,
  Check,
  XCircle,
} from 'lucide-react';

export function AlertDialogDemo({
  cb,
  product,
  action,
  loading,
  image,
  id,
  index,
  sizeName,
  colorName,
}) {
  if (action === 'cancelOrder') {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            className="flex px-4 py-3 
            font-medium text-white bg-red-500/90 border-red-500/90
            border-2  backdrop-blur-md rounded-xl shadow-lg
            cursor-pointer transition-all duration-200 ease-linear
            hover:px-5 hover:bg-white hover:text-red-600/80 hover:border-red-600/80
            active:bg-red-500/90 active:border-red-500/90 active:text-white"
            title="Huỷ đơn hàng"
          >
            <XCircle className="opacity-80 mr-2" />
            Huỷ bỏ đơn
          </button>
        </AlertDialogTrigger>
        {/* Hộp thoại */}
        <AlertDialogContent
          className={
            'z-50 bg-white w-[500px] p-7 rounded-2xl border-gray-300 duration-300 ease-linear'
          }
        >
          <AlertDialogHeader className={'items-center text-center'}>
            {/* icon */}
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full 
                flex items-center justify-center bg-red-100`}
            >
              <XCircle
                className={`w-8 h-8items-center text-center
                text-red-500 hover:text-red-400
              `}
              />
            </div>
            {/* Title */}
            <AlertDialogTitle className="text-xl font-bold text-gray-900 text-center mb-2">
              Huỷ đơn
            </AlertDialogTitle>
            <AlertDialogTitle className="text-center mb-6">
              <p className="text-gray-600 text-sm">Bạn có muốn huỷ bỏ đơn hàng này</p>
              <div className="text-lg font-semibold text-gray-900 mt-2 px-4 flex gap-1 justify-center">
                <p>"{product.orderNumber}"</p>
              </div>
            </AlertDialogTitle>
            {/* Cảnh báo */}
            <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start justify-center">
                <AlertTriangle className="w-4 h-4 translate-y-0.75 mr-2 text-red-600 shrink-0" />
                <AlertDialogDescription className="block text-sm text-red-600 text-center">
                  Hãy cân nhắc thật kỹ
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="w-full flex justify-between! mt-4">
            <AlertDialogCancel className="w-1/2 py-6 border-0 px-8 text-gray-700 font-medium bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              Huỷ
            </AlertDialogCancel>
            <AlertDialogAction
              // onClick={() => cb(id, colorName)}
              className={`w-1/2 py-6 font-medium text-white rounded-xl 
              hover:opacity-90 transition-colors duration-300
              bg-red-600 hover:bg-red-500
            `}
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (action === 'removeVariant') {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            className="absolute -top-1.5 -right-1.5 p-4 bg-red-500 rounded-xl cursor-pointer
                      hover:bg-red-400 active:bg-red-500"
            title="Xoá biến thể"
          >
            <Trash2 className="text-white" />
          </button>
        </AlertDialogTrigger>
        {/* Hộp thoại */}
        <AlertDialogContent
          className={
            'z-50 bg-white w-[500px] p-7 rounded-2xl border-gray-300 duration-300 ease-linear'
          }
        >
          <AlertDialogHeader className={'items-center text-center'}>
            {/* icon */}
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full 
                flex items-center justify-center bg-red-100`}
            >
              <Trash2
                className={`w-8 h-8items-center text-center
                text-red-500 hover:text-red-400
              `}
              />
            </div>
            {/* Title */}
            <AlertDialogTitle className="text-xl font-bold text-gray-900 text-center mb-2">
              Loại bỏ Biến thể
            </AlertDialogTitle>
            <AlertDialogTitle className="text-center mb-6">
              <p className="text-gray-600 text-sm">
                Bạn có muốn loại bỏ biến thể màu sắc này của sản phẩm
              </p>
              <div className="text-lg font-semibold text-gray-900 mt-2 px-4 flex gap-1 justify-center">
                <p className="text-black/65">Biến thể màu</p>
                <p>"{colorName}"</p>
              </div>
            </AlertDialogTitle>
            {/* Cảnh báo */}
            <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start justify-center">
                <AlertTriangle className="w-4 h-4 translate-y-0.75 text-red-600 shrink-0" />
                <AlertDialogDescription className="block text-sm text-red-600 text-center">
                  Biến thể màu sắc này đang được sử dụng, bạn có chắc muốn loại bỏ
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="w-full flex justify-between! mt-4">
            <AlertDialogCancel className="w-1/2 py-6 border-0 px-8 text-gray-700 font-medium bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              Huỷ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cb(id, colorName)}
              className={`w-1/2 py-6 font-medium text-white rounded-xl 
              hover:opacity-90 transition-colors duration-300
              bg-red-600 hover:bg-red-500
            `}
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (action === 'check') {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            className="bg-white rounded-sm border border-primary
              max-w-4 max-h-4 min-w-4 min-h-4
                    hover:opacity-80 active:opacity-100"
            // disabled={loading}
          >
            <Check className="text-black h-3.5 w-3.5" />
          </button>
        </AlertDialogTrigger>
        {/* Hộp thoại */}
        <AlertDialogContent
          className={
            'z-50 bg-white w-[500px] p-7 rounded-2xl border-gray-300 duration-300 ease-linear'
          }
        >
          <AlertDialogHeader className={'items-center text-center'}>
            {/* icon */}
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full 
                flex items-center justify-center bg-red-100`}
            >
              <Trash2
                className={`w-8 h-8items-center text-center
                text-red-500 hover:text-red-400
              `}
              />
            </div>
            {/* Title */}
            <AlertDialogTitle className="text-xl font-bold text-gray-900 text-center mb-2">
              Loại bỏ kích thước
            </AlertDialogTitle>
            <AlertDialogTitle className="text-center mb-6">
              <p className="text-gray-600 text-sm">
                Bạn có muốn loại bỏ kích thước này của sản phẩm
              </p>
              <p className="text-lg font-semibold text-gray-900 mt-2 px-4">
                "{sizeName}"
              </p>
            </AlertDialogTitle>
            {/* Cảnh báo */}
            <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <AlertDialogDescription className="block text-sm text-red-600 ">
                  Kích thước này đang được sử dụng, bạn có chắc muốn loại bỏ
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="w-full flex justify-between! mt-4">
            <AlertDialogCancel className="w-1/2 py-6 border-0 px-8 text-gray-700 font-medium bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              Huỷ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cb(id, sizeName)}
              className={`w-1/2 py-6 font-medium text-white rounded-xl 
              hover:opacity-90 transition-colors duration-300
              bg-red-600 hover:bg-red-500
            `}
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (action === 'deleteImageVariant') {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            className="bg-black p-1 rounded-full absolute -top-1 -right-1
                    hover:opacity-80 active:opacity-100"
            // disabled={loading}
          >
            <XIcon className="text-white h-4 w-4" />
          </button>
        </AlertDialogTrigger>
        {/* Hộp thoại */}
        <AlertDialogContent
          className={
            'z-50 bg-white w-[500px] p-7 rounded-2xl border-gray-300 duration-300 ease-linear'
          }
        >
          <AlertDialogHeader className={'items-center text-center'}>
            {/* icon */}
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full 
                flex items-center justify-center bg-red-100`}
            >
              <Trash2
                className={`w-8 h-8items-center text-center
                text-red-500 hover:text-red-400
              `}
              />
            </div>
            {/* Title */}
            <AlertDialogTitle className="text-xl font-bold text-gray-900 text-center mb-2">
              Xoá hình ảnh
            </AlertDialogTitle>
            <AlertDialogTitle className="text-center mb-6">
              <p className="text-gray-600 text-sm">Bạn có muốn xoá hình ảnh</p>
              <p className="text-lg font-semibold text-gray-900 mt-2 px-4">
                "{image.altText}"
              </p>
            </AlertDialogTitle>
            {/* Cảnh báo */}
            <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <AlertDialogDescription className="block text-sm text-red-600 ">
                  Hình ảnh này đang được sử dụng, bạn có chắc muốn xoá
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="w-full flex justify-between! mt-4">
            <AlertDialogCancel className="w-1/2 py-6 border-0 px-8 text-gray-700 font-medium bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              Huỷ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cb(id, index)}
              className={`w-1/2 py-6 font-medium text-white rounded-xl 
              hover:opacity-90 transition-colors duration-300
              bg-red-600 hover:bg-red-500
            `}
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  let ActionIcon;
  let actionText;
  if (action === 'published') {
    ActionIcon = product.isPublished ? EyeOff : Eye;
    actionText = product.isPublished ? 'ẩn' : 'hiện';
  } else if (action === 'featured') {
    ActionIcon = Star;
    actionText = product.isFeatured ? 'Bỏ Nỏi Bật' : 'Nổi Bật';
  } else if (action === 'delete') {
    ActionIcon = Trash2;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="px-1 py-1 cursor-pointer" disabled={loading}>
          {/* Published */}
          {action === 'published' &&
            (product?.isPublished ? (
              <Eye className="hover:text-gray-500 h-5 w-5" />
            ) : (
              <EyeOff className="hover:text-gray-500 h-5 w-5" />
            ))}
          {/* Featured */}
          {action === 'featured' && (
            <Star
              className={`${product.isFeatured ? 'fill-yellow-400 text-yellow-500' : 'text-black'} hover:text-yellow-400 hover:fill-yellow-300 h-5 w-5`}
            />
          )}
          {/* Delete */}
          {action === 'delete' && <Trash2 className="h-5 w-5 hover:text-red-400" />}
        </button>
      </AlertDialogTrigger>
      {/* Hộp thoại */}
      <AlertDialogContent
        className={
          'z-50 bg-white w-[500px] p-7 rounded-2xl border-gray-300 duration-300 ease-linear'
        }
      >
        <AlertDialogHeader className={'items-center text-center'}>
          {/* icon */}
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center 
              ${
                action === 'published' &&
                (product.isFeatured && product.isPublished
                  ? 'bg-amber-50'
                  : 'bg-blue-100')
              }
              ${
                action === 'featured' &&
                (product.isFeatured ? 'bg-gray-50' : 'bg-yellow-100')
              }
              ${action === 'delete' && 'bg-red-100'}
            `}
          >
            <ActionIcon
              className={`w-8 h-8items-center text-center 
                ${
                  action === 'published' &&
                  (product.isFeatured && product.isPublished
                    ? 'text-amber-600 hover:text-amber-700'
                    : 'text-blue-600 hover:text-blue-700')
                }
                ${
                  action === 'featured' &&
                  (product.isFeatured
                    ? 'text-gray-300'
                    : 'fill-yellow-300 text-yellow-400')
                }
                ${action === 'delete' && 'text-red-500 hover:text-red-400'}
              `}
            />
          </div>
          {/* Title */}
          <AlertDialogTitle className="text-xl font-bold text-gray-900 text-center mb-2">
            {action === 'published' &&
              (product.isPublished ? 'Ẩn sản phẩm' : 'Hiện sản phẩm')}
            {action === 'featured' &&
              (product.isFeatured ? 'Bổ nổi bật' : 'Kích hoạt nổi bật')}
            {action === 'delete' && 'Xoá sản phẩm'}
          </AlertDialogTitle>
          <AlertDialogTitle className="text-center mb-6">
            <p className="text-gray-600 text-sm">
              {action === 'published' && `Bạn có chắc muốn ${actionText} sản phẩm`}
              {action === 'featured' && `Bạn có muốn ${actionText} sản phẩm`}
              {action === 'delete' && 'Bạn có muốn xoá sản phẩm'}
            </p>
            <p className="text-lg font-semibold text-gray-900 mt-2 px-4">
              "{product.name}"
            </p>
          </AlertDialogTitle>
          {/* Cảnh báo */}
          {action === 'published' && product.isFeatured && product.isPublished && (
            <div className="w-full mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start justify-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 translate-y-0.75" />
                <AlertDialogDescription className="block text-sm text-amber-700 text-center">
                  Sản phẩm này đang được nổi bật, nếu ẩn đi sẽ bị loại khỏi mục nổi bật
                </AlertDialogDescription>
              </div>
            </div>
          )}
          {action === 'published' && (
            <div className="w-full mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0" />
                <AlertDialogDescription className="block text-sm text-blue-700 ">
                  {product.isPublished
                    ? 'Khi ẩn sản phẩm này sẽ không còn xuất hiện trong cửa hàng.'
                    : 'Khi hiển sản phẩm sẽ xuất hiện trở lại cửa hàng.'}
                </AlertDialogDescription>
              </div>
            </div>
          )}
          {action === 'featured' && (
            <div className="w-full mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <AlertDialogDescription className="block text-sm text-amber-700 ">
                  {product.isFeatured
                    ? 'Nếu loại bỏ sản phẩm sẽ biến mất khỏi mục nổi bật'
                    : 'Khi kích hoạt sản phẩm sẽ được thêm vào mục nổi bật'}
                </AlertDialogDescription>
              </div>
            </div>
          )}
          {action === 'delete' && (
            <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <AlertDialogDescription className="block text-sm text-red-600 ">
                  Hãy cân nhắc thật kĩ, khi đã xoá bạn sẽ không thể khôi phục
                </AlertDialogDescription>
              </div>
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="w-full flex justify-between! mt-4">
          <AlertDialogCancel className="w-1/2 py-6 border-0 px-8 text-gray-700 font-medium bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            Huỷ
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => cb(product._id.toString())}
            className={`w-1/2 py-6 font-medium text-white rounded-xl hover:opacity-90 transition-colors duration-300
              ${
                action === 'published' &&
                (product.isFeatured && product.isPublished
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-blue-600 hover:bg-blue-700')
              }
                ${
                  action === 'featured' &&
                  (product.isFeatured
                    ? 'bg-yellow-500/50 hover:bg-yellow-400/50'
                    : 'bg-yellow-500 text hover:bg-yellow-400')
                }
                ${action === 'delete' && 'bg-red-600 hover:bg-red-500'}
            `}
          >
            Xác nhận
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default AlertDialogDemo;
