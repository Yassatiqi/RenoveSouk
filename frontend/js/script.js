// Fichier: frontend/js/script.js
// Version: 1.5 - Finale avec Panier et Onglets

// ==============================================================================
// --- CONSTANTES ET CONFIGURATION ---
// ==============================================================================
const API_BASE_URL = 'http://localhost:5000';

// ==============================================================================
// --- GESTION DU PANIER (localStorage) ---
// ==============================================================================
const cart = {
    getItems: () => JSON.parse(localStorage.getItem('renovsoukCart')) || [],
    saveItems: (items) => localStorage.setItem('renovsoukCart', JSON.stringify(items)),
    addItem: function(productId, quantity = 1) {
        const items = this.getItems();
        const existingItem = items.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            items.push({ id: productId, quantity: quantity });
        }
        this.saveItems(items);
        this.updateDisplay();
        this.showNotification(`${quantity} produit(s) ajouté(s) au panier !`);
    },
    updateDisplay: async function() {
        const items = this.getItems();
        const cartBadge = document.querySelector('.user-actions .fa-shopping-cart').nextElementSibling;
        const cartAmountEl = document.querySelector('.user-actions .fa-shopping-cart').parentNode.querySelector('span:last-child');
        if (!cartBadge || !cartAmountEl) return;

        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;

        if (totalItems === 0) {
            cartAmountEl.textContent = '0.00 MAD';
            return;
        }
        
        try {
            const productIds = items.map(item => item.id);
            const response = await fetch(`${API_BASE_URL}/api/products/by-ids`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: productIds })
            });
            if (!response.ok) throw new Error('API error');
            const productsDetails = await response.json();
            
            let totalAmount = 0;
            items.forEach(cartItem => {
                const productDetail = productsDetails.find(p => p.id === cartItem.id);
                if (productDetail) {
                    totalAmount += (productDetail.original_price || productDetail.price) * cartItem.quantity;
                }
            });
            cartAmountEl.textContent = `${totalAmount.toFixed(2)} MAD`;
        } catch(error) {
            console.error("Erreur calcul total:", error);
            cartAmountEl.textContent = 'Erreur';
        }
    },
    showNotification: (message) => {
        const notification = document.createElement('div');
        notification.className = 'alert alert-success position-fixed';
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999;';
        notification.innerHTML = `<i class="fas fa-check-circle me-2"></i> ${message}`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
};

// ==============================================================================
// --- FONCTIONS DE GÉNÉRATION HTML ---
// ==============================================================================
function createProductCard(product) {
    const imageUrl = (product.image_url && product.image_url.startsWith('/static/')) 
        ? `${API_BASE_URL}${product.image_url}` 
        : (product.image_url || './assets/images/placeholder.jpg');
    const placeholderImage = './assets/images/placeholder.jpg';
    let priceHTML = `<span class="current-price text-primary fw-bold">${product.price.toFixed(2)} MAD</span>`;
    if (product.is_on_sale && product.original_price) {
        priceHTML = `<span class="current-price text-primary fw-bold">${product.price.toFixed(2)} MAD</span> <span class="original-price text-muted text-decoration-line-through ms-2">${product.original_price.toFixed(2)} MAD</span>`;
    }
    return `<div class="col-lg-3 col-md-4 col-sm-6 mb-4"><div class="product-card card h-100"><div class="product-image position-relative"><img src="${imageUrl}" class="card-img-top" alt="${product.name}" onerror="this.onerror=null;this.src='${placeholderImage}';">${product.is_on_sale?'<span class="badge bg-danger position-absolute top-0 end-0 m-2">Promo</span>':''}${product.is_new?'<span class="badge bg-info position-absolute top-0 start-0 m-2">Nouveau</span>':''}<div class="product-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"><button class="btn btn-primary btn-sm me-2 add-to-cart-btn" data-product-id="${product.id}" title="Ajouter au panier"><i class="fas fa-shopping-cart"></i></button><button class="btn btn-outline-secondary btn-sm" title="Ajouter aux favoris"><i class="fas fa-heart"></i></button></div></div><div class="card-body d-flex flex-column"><h6 class="card-title">${product.name}</h6><div class="price-section mt-auto pt-2">${priceHTML}</div></div></div></div>`;
}

// ==============================================================================
// --- LOGIQUE D'AFFICHAGE DYNAMIQUE ---
// ==============================================================================
async function loadAndDisplayProducts(endpoint, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `<div class="col-12 text-center py-5"><div class="spinner-border text-primary"></div></div>`;
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${endpoint}`);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const products = await response.json();
        container.innerHTML = '';
        if (products.length === 0) {
            container.innerHTML = '<div class="col-12"><p class="text-center text-muted py-5">Aucun produit à afficher.</p></div>';
        } else {
            products.forEach(product => { container.innerHTML += createProductCard(product); });
        }
    } catch (error) {
        console.error(`Erreur chargement ${endpoint}:`, error);
        container.innerHTML = '<div class="col-12"><p class="text-center text-danger py-5">Erreur de chargement des produits.</p></div>';
    }
}

// ==============================================================================
// --- INITIALISATION DES COMPOSANTS ET ÉVÉNEMENTS ---
// ==============================================================================
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialise le carousel
    const carousel = document.getElementById('heroCarousel');
    if (carousel) new bootstrap.Carousel(carousel, { interval: 5000, wrap: true });

    // Initialise la barre de recherche
    const searchButton = document.querySelector('.search-bar .btn');
    if(searchButton) {
        const searchInput = document.querySelector('.search-bar input[type="text"]');
        const performSearch = () => { if (searchInput.value.trim()) window.location.href = `pages/boutique.html?search=${encodeURIComponent(searchInput.value)}`; };
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', e => { if (e.key === 'Enter') performSearch(); });
    }

    // Met à jour l'affichage du panier
    cart.updateDisplay();

    // Logique pour les onglets produits et les boutons d'ajout au panier
    const mainContent = document.querySelector('body');
    if (mainContent) {
        // Délégation d'événements pour les boutons "Ajouter au panier"
        mainContent.addEventListener('click', event => {
            const addToCartButton = event.target.closest('.add-to-cart-btn');
            if (addToCartButton) {
                event.preventDefault();
                const productId = parseInt(addToCartButton.dataset.productId);
                cart.addItem(productId);
            }
        });

        // Gérer les clics sur les onglets
        const productTabsContainer = document.getElementById('productTabs');
        if (productTabsContainer) {
            loadAndDisplayProducts('featured', 'featured-products-container'); // Charge le premier onglet
            productTabsContainer.addEventListener('click', event => {
                if (event.target.tagName === 'BUTTON') {
                    const targetId = event.target.dataset.bsTarget;
                    const endpoint = targetId.replace('#', '');
                    const containerId = `${endpoint}-products-container`;
                    loadAndDisplayProducts(endpoint, containerId);
                }
            });

            // Gérer le cas où on arrive sur la page avec un # dans l'URL
            const hash = window.location.hash;
            if (hash) {
                const tabButton = document.querySelector(`button[data-bs-target="${hash}"]`);
                if (tabButton) new bootstrap.Tab(tabButton).show();
            }
        }
    }
});