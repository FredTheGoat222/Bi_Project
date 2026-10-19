let currentDiscount = 0;

document.addEventListener("DOMContentLoaded", () => {
  renderCart();

  // Nút xóa tất cả
  const clearBtn = document.getElementById("clear-cart-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      let cart = getCart();
      if (cart.length === 0) return;
      if (confirm("Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?")) {
        localStorage.removeItem("domobile_cart");
        currentDiscount = 0;
        renderCart();
      }
    });
  }

  // Áp dụng mã giảm giá
  const applyBtn = document.getElementById("apply-coupon-btn");
  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      const codeInput = document.getElementById("coupon-code");
      const code = codeInput ? codeInput.value.trim().toUpperCase() : "";
      processCoupon(code);
    });
  }

  // Nút thanh toán
  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      let cart = getCart();
      if (cart.length === 0) {
        alert("Giỏ hàng của bạn đang trống!");
        return;
      }
      alert("Chuyển hướng sang trang điền thông tin đặt hàng...");
    });
  }
});

// Lấy giỏ hàng từ localStorage
function getCart() {
  return JSON.parse(localStorage.getItem("domobile_cart")) || [];
}

// Lưu giỏ hàng vào localStorage
function saveCart(cart) {
  localStorage.setItem("domobile_cart", JSON.stringify(cart));
}

// Hàm vẽ danh sách sản phẩm và tính toán chi phí
function renderCart() {
  const container = document.getElementById("cart-items-container");
  const cartCountEl = document.getElementById("cart-count");
  const subtotalEl = document.getElementById("subtotal-val");
  const discountEl = document.getElementById("discount-val");
  const totalEl = document.getElementById("total-val");
  const freeshipFill = document.getElementById("freeship-progress");

  const cart = getCart();

  // Tính tổng số lượng
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCountEl) cartCountEl.innerText = totalQty;

  // Nếu giỏ hàng trống
  if (cart.length === 0) {
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 0;">
          <i class="fa-solid fa-cart-flatbed" style="font-size: 48px; color: #ccc; margin-bottom: 15px;"></i>
          <p style="color: #666; font-size: 16px;">Giỏ hàng của bạn đang trống!</p>
          <a href="../MuaSam/MuaSam.html" style="color: #5b86e5; text-decoration: none; font-weight: bold; margin-top: 12px; display: inline-block;">
            <i class="fa-solid fa-arrow-left"></i> Quay lại trang Mua Sắm ngay
          </a>
        </div>
      `;
    }
    if (subtotalEl) subtotalEl.innerText = "0₫";
    if (discountEl) discountEl.innerText = "-0₫";
    if (totalEl) totalEl.innerText = "0₫";
    if (freeshipFill) freeshipFill.style.width = "0%";
    return;
  }

  // Nếu có sản phẩm -> Render giao diện
  if (container) {
    container.innerHTML = cart
      .map((item, index) => {
        const priceNum =
          typeof item.price === "number"
            ? item.price
            : parseFloat(item.price) || 0;
        return `
        <div class="cart-item">
          <div class="item-checkbox">
            <input type="checkbox" checked disabled />
          </div>
          <div class="item-image">
            <img src="${item.image || "https://via.placeholder.com/90"}" alt="${item.name}">
          </div>
          <div class="item-info">
            <h3 class="item-title"><a href="#">${item.name}</a></h3>
            <p class="item-variant">Phiên bản: ${item.variant || "Chính hãng"}</p>
          </div>
          <div class="item-price-qty">
            <div class="item-price">
              <span class="current-price">${(priceNum * item.quantity).toLocaleString("vi-VN")}₫</span>
            </div>
            <div class="quantity-control">
              <button class="qty-btn" onclick="updateQty(${index}, -1)"><i class="fa-solid fa-minus"></i></button>
              <input type="number" class="qty-input" value="${item.quantity}" readonly>
              <button class="qty-btn" onclick="updateQty(${index}, 1)"><i class="fa-solid fa-plus"></i></button>
            </div>
            <button class="btn-remove-item" onclick="removeItem(${index})" title="Xóa sản phẩm">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
      })
      .join("");
  }

  // Tính tổng tiền tạm tính
  const subtotal = cart.reduce((sum, item) => {
    const p =
      typeof item.price === "number" ? item.price : parseFloat(item.price) || 0;
    return sum + p * item.quantity;
  }, 0);

  // Cập nhật thanh Freeship (mốc 5.000.000₫)
  if (freeshipFill) {
    const progress = Math.min((subtotal / 5000000) * 100, 100);
    freeshipFill.style.width = `${progress}%`;
  }

  const finalTotal = Math.max(0, subtotal - currentDiscount);

  if (subtotalEl) subtotalEl.innerText = `${subtotal.toLocaleString("vi-VN")}₫`;
  if (discountEl)
    discountEl.innerText = `-${currentDiscount.toLocaleString("vi-VN")}₫`;
  if (totalEl) totalEl.innerText = `${finalTotal.toLocaleString("vi-VN")}₫`;
}

// Hàm tăng/giảm số lượng
function updateQty(index, delta) {
  let cart = getCart();
  if (cart[index]) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    saveCart(cart);
    renderCart();
  }
}

// Hàm xóa 1 sản phẩm
function removeItem(index) {
  let cart = getCart();
  if (cart[index]) {
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
  }
}

// Chọn voucher gợi ý
function applySuggestedCoupon(code) {
  const codeInput = document.getElementById("coupon-code");
  if (codeInput) codeInput.value = code;
  processCoupon(code);
}

// Xử lý mã voucher
function processCoupon(code) {
  let cart = getCart();
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  if (code === "DOMOBILE500K") {
    if (subtotal >= 20000000) {
      currentDiscount = 500000;
      alert("Áp dụng mã DOMOBILE500K thành công! Giảm 500.000₫");
    } else {
      alert("Mã DOMOBILE500K chỉ áp dụng cho đơn hàng từ 20.000.000₫!");
    }
  } else if (code === "MIXIGAMING") {
    currentDiscount = Math.round(subtotal * 0.02);
    alert("Áp dụng mã MIXIGAMING thành công! Giảm 2%");
  } else {
    alert("Mã giảm giá không hợp lệ!");
    currentDiscount = 0;
  }
  renderCart();
}
