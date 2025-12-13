import { apiFetch } from '../utils/api';

// Lấy cart của user hiện tại
export async function getCart(token) {
  // Gọi API carts, truyền token vào header
  return await apiFetch('/v1/carts', {
    method: 'GET',
    token,
  });
}

// Thêm sản phẩm vào giỏ hàng
export async function addToCart(items, token) {
  // items là mảng các object: [{ productVariantId, quantity }]
  return await apiFetch('/v1/carts/addCart', {
    method: 'POST',
    body: { items },
    token,
  });
}