"use strict";

/* =====================================================
   ĐỘMOBILE - JAVASCRIPT CHO TRANG MUA SẮM
   File: js/muasam.js
   ===================================================== */

document.addEventListener("DOMContentLoaded", function() {

    // ================= 1. LẤY CÁC PHẦN TỬ HTML =================

    const filterForm = document.getElementById("filter-form");
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const sortSelect = document.getElementById("sort-products");
    const productList = document.querySelector(".product-list");

    if (!productList) {
        console.error("Không tìm thấy danh sách sản phẩm!");
        return;
    }

    // Lưu lại các thẻ sản phẩm ban đầu.
    // Không sử dụng danh sách đã lọc để tránh mất sản phẩm.
    const allProducts = Array.from(
        productList.querySelectorAll(".product-card")
    );

    // ================= 2. DỮ LIỆU SẢN PHẨM =================

    const products = allProducts.map(function(card, index) {

        const nameElement = card.querySelector("h3");
        const brandElement = card.querySelector(".product-brand");
        const priceElement = card.querySelector(".product-price");
        const imageElement = card.querySelector(".product-image img");

        const name = nameElement ?
            nameElement.textContent.trim() :
            "Sản phẩm";

        const brand = brandElement ?
            brandElement.textContent.trim() :
            "";

        const priceText = priceElement ?
            priceElement.textContent :
            "0";

        // Chuyển "19.990.000 đ" thành số 19990000.
        const price = Number(
            priceText.replace(/[^\d]/g, "")
        ) || 0;

        const image = imageElement ?
            imageElement.getAttribute("src") :
            "";

        // Đọc thuộc tính bổ sung nếu HTML có khai báo.
        // Nếu chưa khai báo, sử dụng giá trị mặc định.
        const storage =
            card.dataset.storage ||
            (name.match(/\b(64GB|128GB|256GB|512GB|1TB)\b/i) || [])[0] ||
            "128GB";

        const condition = card.dataset.condition || "new";

        // Xác định thương hiệu từ tên hoặc thông tin thương hiệu.
        const brandText = (name + " " + brand).toLowerCase();

        let category = "other";

        if (brandText.includes("iphone") ||
            brandText.includes("apple")) {
            category = "iphone";
        } else if (brandText.includes("samsung")) {
            category = "samsung";
        } else if (brandText.includes("xiaomi") ||
            brandText.includes("redmi")) {
            category = "xiaomi";
        } else if (brandText.includes("oppo")) {
            category = "oppo";
        } else if (brandText.includes("vivo")) {
            category = "vivo";
        }

        // Gắn mã sản phẩm để nhận diện khi thêm vào giỏ hàng.
        const id = card.dataset.id || "phone-" + (index + 1);

        card.dataset.id = id;
        card.dataset.price = price;
        card.dataset.brand = brand;
        card.dataset.category = category;
        card.dataset.storage = storage;
        card.dataset.condition = condition;

        // Tạo đường dẫn riêng cho từng điện thoại.
        const productUrl = new URL(
            "#" + id,
            window.location.href
        ).href;

        return {
            id: id,
            url: productUrl,
            card: card,
            name: name,
            brand: brand,
            price: price,
            image: image,
            category: category,
            storage: storage,
            condition: condition
        };
    });


    // ================= 3. THÔNG BÁO =================

    let toastTimer;

    function showToast(message) {
        let toast = document.getElementById("shopping-toast");

        if (!toast) {
            toast = document.createElement("div");
            toast.id = "shopping-toast";

            Object.assign(toast.style, {
                position: "fixed",
                bottom: "24px",
                right: "24px",
                zIndex: "9999",
                padding: "14px 20px",
                borderRadius: "8px",
                backgroundColor: "#253858",
                color: "#ffffff",
                boxShadow: "0 4px 12px rgba(0,0,0,.2)",
                fontSize: "14px",
                maxWidth: "calc(100% - 48px)",
                opacity: "0",
                transition: "opacity .2s ease"
            });

            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.style.opacity = "1";

        clearTimeout(toastTimer);

        toastTimer = setTimeout(function() {
            toast.style.opacity = "0";
        }, 2500);
    }


    // ================= 4. HIỂN THỊ SỐ KẾT QUẢ =================

    let resultCount = document.getElementById("result-count");

    if (!resultCount) {
        resultCount = document.createElement("p");
        resultCount.id = "result-count";
        resultCount.style.marginBottom = "16px";

        const toolbar = document.querySelector(".product-toolbar");

        if (toolbar) {
            toolbar.insertAdjacentElement("afterend", resultCount);
        } else {
            productList.insertAdjacentElement("beforebegin", resultCount);
        }
    }


    // ================= 5. ĐỌC BỘ LỌC =================

    function getSelectedValues(name) {
        return Array.from(
            document.querySelectorAll(
                'input[name="' + name + '"]:checked'
            )
        ).map(function(input) {
            return input.value;
        });
    }


    // ================= 6. LỌC VÀ TÌM KIẾM =================

    function filterProducts() {

        const keyword = searchInput ?
            searchInput.value.trim().toLowerCase() :
            "";

        const selectedCategories = getSelectedValues("category");
        const selectedStorages = getSelectedValues("storage");
        const selectedPrice = getSelectedValues("price")[0] || "";
        const selectedCondition =
            getSelectedValues("condition")[0] || "";

        const filteredProducts = products.filter(function(product) {

            // Tìm kiếm theo tên và thương hiệu.
            const searchableText = (
                product.name + " " +
                product.brand + " " +
                product.category
            ).toLowerCase();

            const matchesKeyword =
                searchableText.includes(keyword);

            // Lọc theo danh mục.
            const matchesCategory =
                selectedCategories.length === 0 ||
                selectedCategories.includes(product.category);

            // Lọc theo mức giá.
            let matchesPrice = true;

            switch (selectedPrice) {
                case "under5":
                    matchesPrice = product.price < 5000000;
                    break;

                case "5to10":
                    matchesPrice =
                        product.price >= 5000000 &&
                        product.price <= 10000000;
                    break;

                case "10to20":
                    matchesPrice =
                        product.price > 10000000 &&
                        product.price <= 20000000;
                    break;

                case "over20":
                    matchesPrice = product.price > 20000000;
                    break;
            }

            // Lọc theo dung lượng.
            const matchesStorage =
                selectedStorages.length === 0 ||
                selectedStorages.includes(product.storage);

            // Lọc theo tình trạng máy.
            const matchesCondition =
                selectedCondition === "" ||
                product.condition === selectedCondition;

            return (
                matchesKeyword &&
                matchesCategory &&
                matchesPrice &&
                matchesStorage &&
                matchesCondition
            );
        });

        // ================= 7. SẮP XẾP =================

        const sortValue = sortSelect ? sortSelect.value : "";

        if (sortValue === "asc") {
            filteredProducts.sort(function(a, b) {
                return a.price - b.price;
            });
        } else if (sortValue === "desc") {
            filteredProducts.sort(function(a, b) {
                return b.price - a.price;
            });
        } else if (sortValue === "name") {
            filteredProducts.sort(function(a, b) {
                return a.name.localeCompare(b.name, "vi");
            });
        }

        // ================= 8. CẬP NHẬT GIAO DIỆN =================

        products.forEach(function(product) {
            product.card.style.display = "none";
        });

        filteredProducts.forEach(function(product) {
            product.card.style.display = "";
            productList.appendChild(product.card);
        });

        if (resultCount) {
            resultCount.textContent =
                "Tìm thấy " + filteredProducts.length +
                " / " + products.length + " sản phẩm";
        }

        // Hiển thị thông báo khi không tìm thấy sản phẩm.
        let emptyMessage = document.getElementById("empty-products");

        if (!emptyMessage) {
            emptyMessage = document.createElement("p");
            emptyMessage.id = "empty-products";
            emptyMessage.style.padding = "30px 10px";
            emptyMessage.style.textAlign = "center";
            emptyMessage.style.color = "#777";
            productList.insertAdjacentElement("afterend", emptyMessage);
        }

        emptyMessage.textContent = filteredProducts.length === 0 ?
            "Không tìm thấy sản phẩm phù hợp. Vui lòng thử điều kiện khác." :
            "";

        emptyMessage.style.display =
            filteredProducts.length === 0 ? "block" : "none";
    }


    // ================= 9. SỰ KIỆN TÌM KIẾM =================

    if (searchButton) {
        searchButton.addEventListener("click", filterProducts);
    }

    if (searchInput) {
        // Nhấn Enter để tìm kiếm.
        searchInput.addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                filterProducts();
            }
        });

        // Tự cập nhật kết quả khi người dùng nhập.
        searchInput.addEventListener("input", filterProducts);
    }


    // ================= 10. SỰ KIỆN BỘ LỌC =================

    if (filterForm) {

        filterForm.addEventListener("submit", function(event) {
            event.preventDefault();
            filterProducts();
        });

        // Cập nhật ngay khi thay đổi bộ lọc.
        filterForm.addEventListener("change", filterProducts);

        // Đặt lại các điều kiện lọc.
        filterForm.addEventListener("reset", function() {

            setTimeout(function() {

                if (searchInput) {
                    searchInput.value = "";
                }

                if (sortSelect) {
                    sortSelect.value = "";
                }

                filterProducts();

                showToast("Đã đặt lại bộ lọc.");
            }, 0);
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", filterProducts);
    }


    // ================= 11. QUẢN LÝ GIỎ HÀNG =================

    const CART_KEY = "doMobileCart";

    function getCart() {
        try {
            const savedCart = localStorage.getItem(CART_KEY);
            const cart = savedCart ? JSON.parse(savedCart) : [];

            return Array.isArray(cart) ? cart : [];
        } catch (error) {
            console.error("Không thể đọc giỏ hàng:", error);
            return [];
        }
    }

    function saveCart(cart) {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
            updateCartBadge();
            return true;
        } catch (error) {
            console.error("Không thể lưu giỏ hàng:", error);
            showToast("Không thể lưu giỏ hàng trên trình duyệt.");
            return false;
        }
    }

    // Tính tổng số lượng sản phẩm, bao gồm số lượng từng mặt hàng.
    function updateCartBadge() {

        const cartLink = document.querySelector(
            'a[href*="giohang.html"]'
        );

        if (!cartLink) {
            return;
        }

        let badge = document.getElementById("cart-badge");

        if (!badge) {
            badge = document.createElement("span");
            badge.id = "cart-badge";

            Object.assign(badge.style, {
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "20px",
                height: "20px",
                marginLeft: "5px",
                padding: "0 5px",
                borderRadius: "10px",
                backgroundColor: "#e53935",
                color: "#fff",
                fontSize: "12px",
                fontWeight: "bold",
                verticalAlign: "middle"
            });

            cartLink.appendChild(badge);
        }

        const totalQuantity = getCart().reduce(function(sum, item) {
            return sum + (Number(item.quantity) || 0);
        }, 0);

        badge.textContent = totalQuantity;
        badge.style.display = totalQuantity > 0 ? "inline-flex" : "none";

        cartLink.setAttribute(
            "aria-label",
            "Giỏ hàng, " + totalQuantity + " sản phẩm"
        );
    }


    // ================= 12. THÊM SẢN PHẨM VÀO GIỎ =================

    productList.addEventListener("click", function(event) {

        const button = event.target.closest(".add-cart-button");

        if (!button) {
            return;
        }

        const card = button.closest(".product-card");

        if (!card) {
            return;
        }

        const product = products.find(function(item) {
            return item.card === card;
        });

        if (!product) {
            showToast("Không tìm thấy thông tin sản phẩm.");
            return;
        }

        const cart = getCart();


        // Nếu sản phẩm đã có thì tăng số lượng.
        const existingItem = cart.find(function(item) {
            return item.id === product.id;
        });

        if (existingItem) {
            existingItem.quantity =
                (Number(existingItem.quantity) || 0) + 1;

            // Cập nhật lại thông tin sản phẩm.
            existingItem.url = product.url;
            existingItem.name = product.name;
            existingItem.brand = product.brand;
            existingItem.price = product.price;
            existingItem.image = product.image;
            existingItem.storage = product.storage;
            existingItem.condition = product.condition;
        } else {
            cart.push({
                id: product.id,
                url: product.url,
                name: product.name,
                brand: product.brand,
                price: product.price,
                image: product.image,
                storage: product.storage,
                condition: product.condition,
                quantity: 1
            });
        }


        if (saveCart(cart)) {
            showToast("Đã thêm " + product.name + " vào giỏ hàng.");

            // Hiệu ứng phản hồi trên nút.
            const oldText = button.textContent;

            button.textContent = "Đã thêm vào giỏ hàng ✓";
            button.disabled = true;

            setTimeout(function() {
                button.textContent = oldText;
                button.disabled = false;
            }, 1000);
        }
    });


    // ================= 13. KHỞI TẠO TRANG =================

    updateCartBadge();
    filterProducts();

});
