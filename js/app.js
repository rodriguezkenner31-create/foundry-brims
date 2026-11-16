document.addEventListener('DOMContentLoaded', () => {
  const productsGrid = document.getElementById('products-grid');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const openCartBtn = document.getElementById('open-cart-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartBadge = document.getElementById('cart-badge');
  const cartTotal = document.getElementById('cart-total');
  
  const checkoutLocalBtn = document.getElementById('checkout-local-btn');
  const checkoutNationalBtn = document.getElementById('checkout-national-btn');
  const toast = document.getElementById('toast');

  // Elementos del Modal de Zoom
  const productModal = document.getElementById('product-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalImg = document.getElementById('modal-img');
  const modalTag = document.getElementById('modal-tag');
  const modalTitle = document.getElementById('modal-title');
  const modalPrice = document.getElementById('modal-price');
  const modalDesc = document.getElementById('modal-desc');
  const modalAddBtn = document.getElementById('modal-add-btn');

  let cart = [];
  let selectedProductForModal = null;

  // Renderizar catálogo
  function renderProducts() {
    if (!productsGrid) return;
    productsGrid.innerHTML = '';
    
    if (typeof products === 'undefined') {
      productsGrid.innerHTML = `
        <div class="col-span-full py-12 text-center text-[#5C584F] text-sm">
          Error: No se pudieron cargar los productos del catálogo.
        </div>
      `;
      return;
    }

    products.forEach(product => {
      const card = document.createElement('div');
      card.className = "group bg-[#EAE5D9]/50 rounded-2xl border border-[#DCD6C8] overflow-hidden hover:shadow-xl transition duration-300 flex flex-col cursor-pointer";
      
      card.innerHTML = `
        <div class="aspect-[4/3] w-full overflow-hidden bg-[#DCD6C8]/40 relative">
          <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          <span class="absolute top-3 left-3 bg-[#1C1B18]/80 backdrop-blur-sm text-[#F4F1EA] text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md">
            ${product.category}
          </span>
        </div>
        <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div class="space-y-1">
            <h3 class="font-serif-brand font-bold text-lg text-[#1C1B18] group-hover:text-[#1E3A2F] transition">${product.name}</h3>
            <p class="text-xs text-[#5C584F] line-clamp-2">${product.description}</p>
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-[#DCD6C8]">
            <span class="font-black text-base text-[#1E3A2F]">${product.priceFormatted}</span>
            <button class="add-to-cart-quick bg-[#1E3A2F] hover:bg-[#152921] text-[#F4F1EA] px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm" data-id="${product.id}">
              <i class="ph ph-shopping-bag text-sm"></i> Agregar
            </button>
          </div>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('.add-to-cart-quick')) return;
        openModal(product);
      });

      const quickBtn = card.querySelector('.add-to-cart-quick');
      quickBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(product.id);
      });

      productsGrid.appendChild(card);
    });
  }

  // Modal de Zoom
  function openModal(product) {
    selectedProductForModal = product;
    modalImg.src = product.image;
    modalImg.alt = product.name;
    modalTag.textContent = product.category;
    modalTitle.textContent = product.name;
    modalPrice.textContent = product.priceFormatted;
    modalDesc.textContent = product.description;

    productModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    productModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    selectedProductForModal = null;
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (productModal) {
    productModal.addEventListener('click', (e) => {
      if (e.target === productModal) closeModal();
    });
  }

  if (modalAddBtn) {
    modalAddBtn.addEventListener('click', () => {
      if (selectedProductForModal) {
        addToCart(selectedProductForModal.id);
        closeModal();
      }
    });
  }

  // Carrito
  function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    updateCartUI();
    showToast(`¡${product.name} agregada al pedido!`);
  }

  function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="text-center py-12 text-[#8A8478] text-xs uppercase tracking-wider">
          Tu carrito de pedido está vacío
        </div>
      `;
      cartTotal.textContent = '$0 COP';
      return;
    }

    cartItemsContainer.innerHTML = '';
    let totalPrice = 0;

    cart.forEach(item => {
      totalPrice += item.price * item.quantity;
      const itemEl = document.createElement('div');
      itemEl.className = "flex items-center justify-between bg-[#F4F1EA] border border-[#DCD6C8] p-3 rounded-xl gap-3";
      itemEl.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="w-14 h-14 object-cover rounded-lg shrink-0 bg-[#EAE5D9]" />
        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-bold text-[#1C1B18] truncate">${item.name}</h4>
          <p class="text-[11px] text-[#1E3A2F] font-black mt-0.5">${item.priceFormatted}</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="decrease-qty w-7 h-7 rounded-lg bg-[#EAE5D9] hover:bg-[#DCD6C8] text-xs font-bold transition flex items-center justify-center" data-id="${item.id}">-</button>
          <span class="text-xs font-bold w-4 text-center">${item.quantity}</span>
          <button class="increase-qty w-7 h-7 rounded-lg bg-[#EAE5D9] hover:bg-[#DCD6C8] text-xs font-bold transition flex items-center justify-center" data-id="${item.id}">+</button>
        </div>
      `;
      cartItemsContainer.appendChild(itemEl);
    });

    cartTotal.textContent = `$${totalPrice.toLocaleString('es-CO')} COP`;

    cartItemsContainer.querySelectorAll('.increase-qty').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        const item = cart.find(i => i.id === id);
        if (item) {
          item.quantity += 1;
          updateCartUI();
        }
      });
    });

    cartItemsContainer.querySelectorAll('.decrease-qty').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        const item = cart.find(i => i.id === id);
        if (item) {
          item.quantity -= 1;
          if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
          }
          updateCartUI();
        }
      });
    });
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('opacity-0', 'pointer-events-none');
    toast.classList.add('opacity-100');
    setTimeout(() => {
      toast.classList.remove('opacity-100');
      toast.classList.add('opacity-0', 'pointer-events-none');
    }, 2500);
  }

  openCartBtn.addEventListener('click', () => {
    cartDrawer.classList.remove('translate-x-full');
    cartOverlay.classList.remove('hidden');
  });

  function closeCart() {
    cartDrawer.classList.add('translate-x-full');
    cartOverlay.classList.add('hidden');
  }

  closeCartBtn.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  // Pedido Local (Usa Nombre y Dirección opcionales)
  checkoutLocalBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Agrega al menos una gorra a tu pedido');
      return;
    }

    const name = document.getElementById('client-name').value.trim();
    const address = document.getElementById('client-address').value.trim();

    let message = `*¡Hola! Quiero realizar un PEDIDO LOCAL A CÚCUTA en FOUNDRY BRIMS:*\n\n`;
    if (name) message += `👤 *Cliente:* ${name}\n`;
    if (address) message += `📍 *Dirección:* ${address}\n`;
    message += `\n*Detalle de gorras:*\n`;

    let total = 0;
    cart.forEach(item => {
      const subtotal = item.price * item.quantity;
      total += subtotal;
      message += `• ${item.quantity}x ${item.name} (${item.priceFormatted}) = $${subtotal.toLocaleString('es-CO')} COP\n`;
    });

    message += `\n💰 *Total estimado:* $${total.toLocaleString('es-CO')} COP\n\nQuedo atento para coordinar la entrega en Cúcuta. ¡Gracias!`;

    const storePhone = "573000000000"; // Reemplaza con tu WhatsApp
    window.open(`https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`, '_blank');
  });

  // Pedido Nacional (Va directo a WhatsApp con resumen de productos sin pedir datos intimidantes)
  checkoutNationalBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Agrega al menos una gorra a tu pedido');
      return;
    }

    let message = `*¡Hola! Estoy interesado en hacer un PEDIDO NACIONAL en FOUNDRY BRIMS.*\n\n*Detalle de gorras seleccionadas:*\n`;

    let total = 0;
    cart.forEach(item => {
      const subtotal = item.price * item.quantity;
      total += subtotal;
      message += `• ${item.quantity}x ${item.name} (${item.priceFormatted}) = $${subtotal.toLocaleString('es-CO')} COP\n`;
    });

    message += `\n💰 *Total estimado:* $${total.toLocaleString('es-CO')} COP\n\n¿Me ayudan por favor con el proceso de pago y envío nacional? ¡Gracias!`;

    const storePhone = "573000000000"; // Reemplaza con tu WhatsApp
    window.open(`https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`, '_blank');
  });

  renderProducts();
});