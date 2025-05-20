// Store and retrieve cart data using localStorage
function getCart() {
    try {
        return JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
        console.error("Error reading cart data:", e);
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {
        console.error("Error saving cart data:", e);
    }
}

function addToCart(productId) {
    const cart = getCart();
    const productIndex = cart.findIndex(p => p.id === productId);
    if (productIndex > -1) {
        cart[productIndex].quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    saveCart(cart);
    updateCartCount();
    animateCart();
    renderCartItems();
    showToast('Item added to cart!');
}

function removeFromCart(productId) {
    const cartItemsContainer = document.getElementById('cart-items');
    const itemElement = cartItemsContainer.querySelector(`.cart-item[data-id='${productId}']`);
    if (itemElement) {
        itemElement.classList.add('fade-out');
        itemElement.addEventListener('animationend', () => {
            let cart = getCart();
            cart = cart.filter(p => p.id !== productId);
            saveCart(cart);
            updateCartCount();
            renderCartItems();
            showToast('Item removed from cart');
        }, { once: true });
    }
}

function clearCart() {
    if (confirm('Are you sure you want to clear the cart?')) {
        localStorage.removeItem('cart');
        updateCartCount();
        renderCartItems();
        showToast('Cart cleared successfully!');
    }
}

function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = isError ? '#dc3545' : '#28a745';
    toast.style.color = '#fff';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.fontSize = '16px';
    toast.style.zIndex = '1000';
    toast.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease-in-out';

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }, 3000);
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.textContent = count;
}

function animateCart() {
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        countEl.classList.add('bounce');
        setTimeout(() => countEl.classList.remove('bounce'), 300);
    }
}

function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this,
            args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;

    const cart = getCart();
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty.</p>';
        return;
    }

    let totalPrice = 0;

    cart.forEach(item => {
        const product = getProductDetails(item.id);
        const itemEl = document.createElement('div');
        itemEl.classList.add('cart-item', 'fade-in');
        itemEl.setAttribute('data-id', item.id);

        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.value = item.quantity;
        quantityInput.min = 1;
        quantityInput.classList.add('quantity-input');
        quantityInput.addEventListener('input', debounce((e) => {
            const newQty = parseInt(e.target.value);
            if (!isNaN(newQty) && newQty > 0) {
                item.quantity = newQty;
                const updatedCart = cart.map(p => p.id === item.id ? item : p);
                saveCart(updatedCart);
                renderCartItems();
                updateCartCount();
            }
        }, 300));

        const minusBtn = document.createElement('button');
        minusBtn.textContent = '−';
        minusBtn.addEventListener('click', () => {
            if (item.quantity > 1) {
                item.quantity -= 1;
                saveCart(cart);
                renderCartItems();
                updateCartCount();
            }
        });

        const plusBtn = document.createElement('button');
        plusBtn.textContent = '+';
        plusBtn.addEventListener('click', () => {
            item.quantity += 1;
            saveCart(cart);
            renderCartItems();
            updateCartCount();
        });

        const itemTotal = item.quantity * product.price;
        totalPrice += itemTotal;

        itemEl.innerHTML = `
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <div class="cart-item-details">
                <h4>${product.name}</h4>
                <p>Price: $${product.price}</p>
                <label>Quantity: </label>
            </div>
        `;

        const qtyWrapper = document.createElement('div');
        qtyWrapper.style.display = 'flex';
        qtyWrapper.style.alignItems = 'center';
        qtyWrapper.style.gap = '0.5rem';

        qtyWrapper.appendChild(minusBtn);
        qtyWrapper.appendChild(quantityInput);
        qtyWrapper.appendChild(plusBtn);

        const totalText = document.createElement('p');
        totalText.textContent = `Total: $${itemTotal.toFixed(2)}`;

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.classList.add('remove-btn');
        removeBtn.addEventListener('click', () => removeFromCart(item.id));

        itemEl.querySelector('.cart-item-details').appendChild(qtyWrapper);
        itemEl.querySelector('.cart-item-details').appendChild(totalText);
        itemEl.querySelector('.cart-item-details').appendChild(removeBtn);

        cartItemsContainer.appendChild(itemEl);
    });

    const summary = document.createElement('div');
    summary.classList.add('cart-summary');
    summary.innerHTML = `<h3 class="total-price">Grand Total: $${totalPrice.toFixed(2)}</h3>`;

    const clearCartBtn = document.createElement('button');
    clearCartBtn.textContent = 'Clear Cart';
    clearCartBtn.classList.add('clear-cart-btn');
    clearCartBtn.addEventListener('click', clearCart);
    summary.appendChild(clearCartBtn);

    const checkoutBtn = document.createElement('button');
    checkoutBtn.textContent = 'Proceed to Checkout';
    checkoutBtn.classList.add('btn');
    checkoutBtn.style.marginLeft = '1rem';
    checkoutBtn.addEventListener('click', () => {
        alert('Checkout functionality will be available soon!');
    });
    summary.appendChild(checkoutBtn);

    cartItemsContainer.appendChild(summary);
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();

    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }

    // Contact form
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            if (name && email && message) {
                localStorage.setItem('contactForm', JSON.stringify({ name, email, message }));
                showToast('Message sent successfully!');
                form.reset();
            } else {
                showToast('Please fill all fields', true);
            }
        });
    }

    // Newsletter form
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('newsletter-email').value.trim();
            if (email) {
                localStorage.setItem('newsletter', email);
                showToast('Subscribed successfully!');
                newsletterForm.reset();
            } else {
                showToast('Please enter a valid email', true);
            }
        });
    }

    renderCartItems();
});

// Simulate product info
function getProductDetails(id) {
    const products = {
        1: { name: 'Product 1', price: 10, image: 'assets/images/product1.jpg' },
        2: { name: 'Product 2', price: 15, image: 'assets/images/product2.jpg' },
        3: { name: 'Product 3', price: 12, image: 'assets/images/product3.jpg' },
        4: { name: 'Product 4', price: 20, image: 'assets/images/product4.jpg' },
        5: { name: 'Product 5', price: 8, image: 'assets/images/product5.jpg' },
        6: { name: 'Product 6', price: 25, image: 'assets/images/product6.jpg' },
        7: { name: 'Product 7', price: 18, image: 'assets/images/product7.jpg' },
        8: { name: 'Product 8', price: 22, image: 'assets/images/product8.jpg' },
        9: { name: 'Product 9', price: 30, image: 'assets/images/product9.jpg' },
        10: { name: 'Product 10', price: 35, image: 'assets/images/product10.jpg' }
    };
    return products[id] || { name: 'Unknown', price: 0, image: '' };
}