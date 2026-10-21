let currentDiscount = 0;

document.addEventListener("DOMContentLoaded", () => {
  renderCart();

  // Nút xóa tất cả sản phẩm
  const clearBtn = document.getElementById("clear-cart-btn");

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      const cart = getCart();

      if (cart.length === 0) {
        return;
      }

      if (confirm("Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?")) {
        localStorage.removeItem("doMobileCart");

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
    });
  }
});

// Lấy giỏ hàng từ localStorage
function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem("doMobileCart")) || [];
    return Array.isArray(cart) ? cart : [];
  } catch (error) {
    console.error("Không thể đọc giỏ hàng:", error);
    return [];
  }
}

// Lưu giỏ hàng vào localStorage
function saveCart(cart) {
  localStorage.setItem("doMobileCart", JSON.stringify(cart));
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
          <a href="../MuaSam/muasam.html" style="color: #5b86e5; text-decoration: none; font-weight: bold; margin-top: 12px; display: inline-block;">
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
(function () {
  "use strict";

  const CART_KEY = "doMobileCart";
  const ORDER_KEY = "doMobileOrders";
  const COUPON_KEY = "doMobileCoupon";

  const cartPage = document.getElementById("cart-page");
  const infoPage = document.getElementById("info-page");
  const donePage = document.getElementById("done-page");
  const form = document.getElementById("checkout-form");

  function getCart() {
    try {
      const data = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  }

  function money(value) {
    return value.toLocaleString("vi-VN") + "₫";
  }

  function safe(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }

  function getTotals(cart) {
    const subtotal = cart.reduce(function (sum, item) {
      const price = Math.max(0, Number(item.price) || 0);
      const qty = Math.max(0, Number(item.quantity) || 0);
      return sum + price * qty;
    }, 0);

    let discount = 0;

    try {
      const coupon = JSON.parse(localStorage.getItem(COUPON_KEY) || "null");

      if (coupon && coupon.code === "DOMOBILE500K" && subtotal >= 20000000) {
        discount = 500000;
      } else if (coupon && coupon.code === "MIXIGAMING") {
        discount = Math.round(subtotal * 0.02);
      }
    } catch (error) {
      discount = 0;
    }

    discount = Math.min(discount, subtotal);

    // Đồng bộ quy tắc miễn phí vận chuyển từ 5 triệu.
    const shipping = subtotal >= 5000000 || subtotal === 0 ? 0 : 30000;

    return {
      subtotal: subtotal,
      discount: discount,
      shipping: shipping,
      total: subtotal - discount + shipping,
    };
  }

  function showPage(page) {
    cartPage.style.display = page === "cart" ? "" : "none";
    infoPage.style.display = page === "info" ? "" : "none";
    donePage.style.display = page === "done" ? "" : "none";

    document
      .getElementById("step-cart")
      .classList.toggle("active", page === "cart");
    document
      .getElementById("step-info")
      .classList.toggle("active", page === "info");
    document
      .getElementById("step-done")
      .classList.toggle("active", page === "done");

    window.scrollTo(0, 0);
  }

  function renderOrderSummary() {
    const cart = getCart();
    const container = document.getElementById("checkout-products");

    container.innerHTML = cart
      .map(function (item) {
        const name = safe(item.name || "Sản phẩm");
        const image = safe(item.image || "");
        const quantity = Math.max(0, Number(item.quantity) || 0);
        const price = Math.max(0, Number(item.price) || 0);

        return `
            <div class="checkout-product">
              <img src="${image}" alt="${name}"
                   onerror="this.style.display='none'">
              <div class="checkout-product-info">
                <strong>${name}</strong>
                <small>Số lượng: ${quantity}</small>
              </div>
              <strong>${money(price * quantity)}</strong>
            </div>`;
      })
      .join("");

    const totals = getTotals(cart);

    document.getElementById("checkout-subtotal").textContent = money(
      totals.subtotal,
    );
    document.getElementById("checkout-discount").textContent =
      "-" + money(totals.discount);
    document.getElementById("checkout-shipping").textContent =
      totals.shipping === 0 ? "Miễn phí" : money(totals.shipping);
    document.getElementById("checkout-total").textContent = money(totals.total);
  }

  document
    .getElementById("checkout-btn")
    .addEventListener("click", function () {
      if (getCart().length === 0) {
        alert("Giỏ hàng đang trống!");
        return;
      }

      renderOrderSummary();
      showPage("info");
    });

  document
    .getElementById("back-to-cart")
    .addEventListener("click", function () {
      showPage("cart");
    });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const cart = getCart();
    const message = document.getElementById("form-message");

    if (cart.length === 0) {
      message.textContent = "Giỏ hàng đang trống!";
      showPage("cart");
      return;
    }

    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const totals = getTotals(cart);

    const order = {
      orderId: "DM" + Date.now(),
      createdAt: new Date().toISOString(),
      customer: {
        fullname: data.get("fullname").trim(),
        phone: data.get("phone").trim(),
        email: data.get("email").trim(),
        city: data.get("city").trim(),
        district: data.get("district").trim(),
        ward: data.get("ward").trim(),
        address: data.get("address").trim(),
        note: data.get("note").trim(),
      },
      payment: data.get("payment"),
      products: cart.map(function (item) {
        return {
          id: item.id,
          name: item.name,
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 0,
          image: item.image || "",
        };
      }),
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping: totals.shipping,
      total: totals.total,
    };

    try {
      const orders = JSON.parse(localStorage.getItem(ORDER_KEY) || "[]");

      if (!Array.isArray(orders)) {
        throw new Error("Dữ liệu đơn hàng không hợp lệ");
      }

      orders.push(order);
      localStorage.setItem(ORDER_KEY, JSON.stringify(orders));

      localStorage.removeItem(CART_KEY);
      localStorage.removeItem(COUPON_KEY);

      // Cập nhật lại giao diện giỏ hàng phía sau.
      // Sự kiện này cũng giúp đồng bộ các tab đang mở.
      window.dispatchEvent(new Event("storage"));

      document.getElementById("success-order-id").textContent = order.orderId;
      document.getElementById("success-total").textContent = money(order.total);

      showPage("done");
    } catch (error) {
      console.error(error);
      message.textContent = "Không thể lưu đơn hàng. Vui lòng thử lại.";
    }
  });
})();
