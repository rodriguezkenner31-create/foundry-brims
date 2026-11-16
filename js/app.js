// CONFIGURA TU NÚMERO DE WHATSAPP AQUÍ (57 + tu número)
const WHATSAPP_PHONE = "573123187386";

let cart = JSON.parse(localStorage.getItem("foundry_cart")) || [];

const productsGrid = document.getElementById("products-grid");
const filterButtons = document.querySelectorAll(".filter-btn");
const cartDrawer = document.getElementById("cart-drawer");
const cartOverlay = document.getElementById("cart-overlay");
const openCartBtn = document.getElementById("open-cart-btn");
const closeCartBtn = document.getElementById("close-cart-btn");
const cartItemsContainer = document.getElementById("cart-items");
const cartBadge = document.getElementById("cart-badge");
const cartTotalEl = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-whatsapp-btn");
const toastEl = document.getElementById("toast");

const formatCOP = (value) => "$" + value.toLocaleString("es-CO") + " COP";

// Renderizar tarjetas de gorras
function renderProducts(filter = "todos") {
  const filtered = filter === "todos"
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === filter);

  productsGrid.innerHTML = filtered.map((product) => `
    <article class="product-card group bg-[#EAE5D9]/60 rounded-2xl border border-[#DCD6C8] overflow-hidden flex flex-col justify-between hover:border-[#1E3A2F]/50 hover:shadow-lg transition duration-300">
      <div>
        <div class="relative aspect-square bg-[#E2DDD0] overflow-hidden">
          ${product.badge ? `
            <span class="absolute top-3 left-3 z-10 bg-[#1E3A2F] text-[#F4F1EA] text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md">
              ${product.badge}
            </span>
          ` : ""}
          <img src="${product.image}" alt="${product.name}" class="img-primary w-full h-full object-cover transition-opacity duration-300" />
          <img src="${product.imageHover}" alt="${product.name} vista 2" class="img-secondary absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-500" />
        </div>

        <div class="p-5 pb-3">
          <p class="text-[11px] font-bold uppercase tracking-wider text-[#6E695F] mb-1">${product.category} · ${product.color}</p>
          <div class="flex items-baseline justify-between gap-2">
            <h3 class="text-base font-bold text-[#1C1B18] truncate">${product.name}</h3>
            <span class="text-base font-extrabold text-[#1E3A2F] shrink-0">${formatCOP(product.price)}</span>
          </div>
        </div>
      </div>

      <!-- Botones directos: Pedir por WhatsApp o Sumar al carrito -->
      <div class="px-5 pb-5 pt-2 flex gap-2">
        <button onclick="orderSingleWhatsApp(${product.id})" class="flex-1 bg-[#1E3A2F] hover:bg-[#152921] text-[#F4F1EA] font-bold text-xs uppercase tracking-wider py-3 px-3 rounded-xl transition flex items-center justify-center gap-2">
          <i class="ph-fill ph-whatsapp-logo text-base text-emerald-400"></i> Pedir por WhatsApp
        </button>
        <button onclick="addToCart(${product.id})" title="Agregar al pedido múltiple" class="bg-[#DCD6C8] hover:bg-[#1C1B18] hover:text-[#F4F1EA] text-[#1C1B18] font-bold px-3.5 py-3 rounded-xl transition flex items-center justify-center">
          <i class="ph-bold ph-plus"></i>
        </button>
      </div>
    </article>
  `).join("");
}

// Compra directa de 1 gorra por WhatsApp
window.orderSingleWhatsApp = (id) => {
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return;

  const message = `🧢 Hola *Foundry Brims*, me interesa pedir esta gorra:\n\n` +
    `• *Modelo:* ${product.name}\n` +
    `• *Detalle:* ${product.color}\n` +
    `• *Precio:* ${formatCOP(product.price)}\n\n` +
    `¿Tienen disponibilidad para envío?`;

  window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`, "_blank");
};

// Filtros
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => {
      b.classList.remove("bg-[#1E3A2F]", "text-[#F4F1EA]");
      b.classList.add("bg-[#EAE5D9]", "text-[#5C584F]");
    });
    btn.classList.remove("bg-[#EAE5D9]", "text-[#5C584F]");
    btn.classList.add("bg-[#1E3A2F]", "text-[#F4F1EA]");

    renderProducts(btn.dataset.filter);
  });
});

// Carrito múltiple
window.addToCart = (id) => {
  const product = PRODUCTS.find((p) => p.id === id);
  const existing = cart.find((item) => item.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveAndUpdateCart();
  showToast(`✓ ${product.name} agregada`);
};

window.updateQty = (id, delta) => {
  const item = cart.find((i) => i.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter((i) => i.id !== id);
  }
  saveAndUpdateCart();
};

function saveAndUpdateCart() {
  localStorage.setItem("foundry_cart", JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  cartBadge.textContent = totalItems;
  cartTotalEl.textContent = formatCOP(totalPrice);

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center text-[#8A8478] py-12">
        <i class="ph ph-shopping-bag text-5xl mb-3 text-[#1E3A2F]/40"></i>
        <p class="font-bold text-[#1C1B18] text-sm">Tu pedido múltiple está vacío</p>
        <p class="text-xs mt-1 max-w-xs">Usa el botón "+" en las gorras si deseas pedir varios modelos juntos.</p>
      </div>
    `;
    return;
  }

  cartItemsContainer.innerHTML = cart.map((item) => `
    <div class="flex gap-3 bg-[#EAE5D9]/80 p-3 rounded-xl border border-[#DCD6C8] items-center">
      <img src="${item.image}" alt="${item.name}" class="w-14 h-14 rounded-lg object-cover bg-[#E2DDD0]" />
      <div class="flex-1 min-w-0">
        <h4 class="text-xs font-bold text-[#1C1B18] truncate">${item.name}</h4>
        <p class="text-xs text-[#1E3A2F] font-extrabold mt-0.5">${formatCOP(item.price * item.qty)}</p>
      </div>
      <div class="flex items-center gap-2 bg-[#F4F1EA] px-2.5 py-1 rounded-lg border border-[#CFC8B8]">
        <button onclick="updateQty(${item.id}, -1)" class="text-[#5C584F] hover:text-[#1C1B18] font-bold px-1">-</button>
        <span class="text-xs font-bold w-4 text-center text-[#1C1B18]">${item.qty}</span>
        <button onclick="updateQty(${item.id}, 1)" class="text-[#5C584F] hover:text-[#1C1B18] font-bold px-1">+</button>
      </div>
    </div>
  `).join("");
}

function toggleCart(open) {
  if (open) {
    cartOverlay.classList.remove("hidden");
    cartDrawer.classList.remove("translate-x-full");
  } else {
    cartOverlay.classList.add("hidden");
    cartDrawer.classList.add("translate-x-full");
  }
}

openCartBtn.addEventListener("click", () => toggleCart(true));
closeCartBtn.addEventListener("click", () => toggleCart(false));
cartOverlay.addEventListener("click", () => toggleCart(false));

checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("Agrega al menos una gorra con el botón +");
    return;
  }

  const name = document.getElementById("customer-name").value.trim();
  const city = document.getElementById("customer-city").value.trim();
  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  let message = `🧢 *PEDIDO DE GORRAS - FOUNDRY BRIMS*\n\n`;
  if (name) message += `👤 *Nombre:* ${name}\n`;
  if (city) message += `📍 *Ciudad:* ${city}\n`;
  if (name || city) message += `\n`;

  cart.forEach((item) => {
    message += `• ${item.qty}x ${item.name} - ${formatCOP(item.price * item.qty)}\n`;
  });

  message += `\n💰 *TOTAL: ${formatCOP(total)}*`;

  window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`, "_blank");
});

function showToast(text) {
  toastEl.textContent = text;
  toastEl.classList.remove("opacity-0");
  setTimeout(() => toastEl.classList.add("opacity-0"), 2000);
}

renderProducts();
renderCart();