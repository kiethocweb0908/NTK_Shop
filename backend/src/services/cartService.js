import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// validate
export const validateCart = async (cart) => {
  let changed = false;
  const messages = [];
  const validItems = [];

  for (const item of cart.products) {
    const product = await Product.findById(item.productId);

    // Product bị xoá / ẩn
    if (!product || !product.isPublished) {
      changed = true;
      messages.push(`Sản phẩm "${item.name}" đã ngừng kinh doanh`);
      continue;
    }

    // Variant màu
    const variant = product.variants.find((v) => v.colorName === item.color);

    if (!variant) {
      changed = true;
      messages.push(`"${item.name}" không còn màu ${item.color}`);
      continue;
    }

    // Size
    const size = variant.sizes.find((s) => s.name === item.size);

    if (!size || size.countInStock === 0) {
      changed = true;
      messages.push(`"${item.name}" (${item.color}-${item.size}) đã hết hàng`);
      continue;
    }

    // Đồng bộ số lượng
    if (item.quantity > size.countInStock) {
      item.quantity = size.countInStock;
      changed = true;
      messages.push(`"${item.name}" đã được điều chỉnh số lượng`);
    }

    // 5️⃣ Đồng bộ giá
    const finalPrice =
      product.discountPrice && product.discountPrice < product.price
        ? product.discountPrice
        : product.price;

    if (item.price !== finalPrice) {
      item.price = finalPrice;
      changed = true;
    }

    validItems.push(item);
  }

  cart.products = validItems;

  if (changed) {
    await cart.save();
  }

  return {
    cart,
    changed,
    messages,
  };
};

// add to cart
export const addToCart = async ({
  cart,
  user,
  guestId,
  productId,
  color,
  size,
  quantity,
}) => {
  const product = await Product.findById(productId);
  if (!product || !product.isPublished) {
    throw new Error("Lỗi! Sản phẩm không tồn tại");
  }

  const variant = product.variants.find((v) => v.colorName === color);
  if (!variant) throw new Error("Lỗi! Màu không tồn tại");

  const sizeVariant = variant.sizes.find((s) => s.name === size);
  if (!sizeVariant || sizeVariant.countInStock === 0) {
    throw new Error("Lỗi! Sản phẩm đã hết hàng");
  }

  if (quantity > sizeVariant.countInStock) {
    throw new Error(`Lỗi! Chỉ còn ${sizeVariant.countInStock} sản phẩm`);
  }

  let currentCart = cart;

  if (!currentCart) {
    currentCart = new Cart(user ? { user: user._id } : { guestId });
  }

  const price =
    product.discountPrice && product.discountPrice < product.price
      ? product.discountPrice
      : product.price;

  await currentCart.addItem({
    productId: product._id,
    name: product.name,
    image: variant.images[0]?.url || "",
    price,
    color,
    size,
    quantity,
  });

  return currentCart;
};

export const updateCartItemQuantity = async ({
  cart,
  productId,
  color,
  size,
  quantity,
}) => {
  if (!cart) throw new Error("Lỗi! Lỗi! Không tìm thấy giỏ hàng");

  if (quantity === undefined) {
    throw new Error("Lỗi! Thiếu số lượng");
  }

  if (quantity < 1) {
    throw new Error("Lỗi! Số lượng phải lớn hơn 0");
  }

  const product = await Product.findById(productId);
  if (!product || !product.isPublished) {
    throw new Error("Lỗi! Sản phẩm không tồn tại");
  }

  const variant = product.variants.find((v) => v.colorName === color);
  if (!variant) throw new Error("Lỗi! Màu không tồn tại");

  const sizeVariant = variant.sizes.find((s) => s.name === size);
  if (!sizeVariant) throw new Error("Lỗi! Size không tồn tại");

  if (quantity > sizeVariant.countInStock) {
    throw new Error(`Lỗi! Chỉ còn ${sizeVariant.countInStock} sản phẩm`);
  }

  await cart.updateQuantity(product._id, color, size, quantity);

  return cart;
};

export const removeCartItem = async ({ cart, productId, color, size }) => {
  if (!cart) throw new Error("Lỗi! Không tìm thấy giỏ hàng");

  const deletedProduct = await cart.removeItem(productId, color, size);

  if (!deletedProduct) {
    throw new Error("Lỗi! Sản phẩm không tồn tại trong giỏ");
  }

  return {
    cart,
    deletedProduct,
  };
};
