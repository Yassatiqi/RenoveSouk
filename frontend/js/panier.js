// Gestion de la page panier
// Version: 1.0

class CartPageManager {
    constructor() {
        this.apiBaseUrl = 'http://localhost:5001';
        this.cartItems = [];
        this.productsDetails = [];
        this.subtotal = 0;
        this.shippingCost = 0;
        this.total = 0;
        
        this.init();
    }

    async init() {
        await this.loadCartData();
        this.renderCart();
    }

    // Charge les données du panier
    async loadCartData() {
        try {
            // Récupérer les items du localStorage
            this.cartItems = JSON.parse(localStorage.getItem('renovsoukCart')) || [];
            
            if (this.cartItems.length === 0) {
                return; // Panier vide
            }

            // Récupérer les détails des produits
            const productIds = this.cartItems.map(item => item.id);
            const response = await fetch(`${this.apiBaseUrl}/api/products/by-ids`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: productIds })
            });

            if (!response.ok) throw new Error('Erreur lors du chargement des produits');
            
            this.productsDetails = await response.json();
            this.calculateTotals();

        } catch (error) {
            console.error('Erreur:', error);
            this.showError('Erreur lors du chargement du panier');
        }
    }

    // Calcule les totaux
    calculateTotals() {
        this.subtotal = 0;
        
        this.cartItems.forEach(cartItem => {
            const productDetail = this.productsDetails.find(p => p.id === cartItem.id);
            if (productDetail) {
                this.subtotal += productDetail.price * cartItem.quantity;
            }
        });

        // Frais de livraison (gratuit si > 500 MAD)
        this.shippingCost = this.subtotal >= 500 ? 0 : 50;
        this.total = this.subtotal + this.shippingCost;
    }

    // Affiche le panier
    renderCart() {
        const container = document.getElementById('cart-container');
        if (!container) return;

        if (this.cartItems.length === 0) {
            this.renderEmptyCart();
            return;
        }

        const html = `
            <div class="row">
                <!-- Items du panier -->
                <div class="col-lg-8">
                    <div class="cart-items bg-white rounded shadow-sm p-4">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h3 class="h5 fw-bold mb-0">Articles dans votre panier (${this.getTotalItems()})</h3>
                            <button class="btn btn-outline-danger btn-sm" onclick="cartPage.clearCart()">
                                <i class="fas fa-trash me-1"></i>Vider le panier
                            </button>
                        </div>
                        
                        <div id="cart-items-list">
                            ${this.renderCartItems()}
                        </div>
                    </div>
                </div>

                <!-- Résumé de la commande -->
                <div class="col-lg-4">
                    <div class="cart-summary p-4">
                        <h3 class="h5 fw-bold mb-4">Résumé de la commande</h3>
                        
                        <div class="summary-line d-flex justify-content-between mb-2">
                            <span>Sous-total (${this.getTotalItems()} articles)</span>
                            <span>${this.subtotal.toFixed(2)} MAD</span>
                        </div>
                        
                        <div class="summary-line d-flex justify-content-between mb-2">
                            <span>Frais de livraison</span>
                            <span class="${this.shippingCost === 0 ? 'text-success' : ''}">
                                ${this.shippingCost === 0 ? 'GRATUIT' : this.shippingCost.toFixed(2) + ' MAD'}
                            </span>
                        </div>
                        
                        ${this.subtotal < 500 && this.subtotal > 0 ? `
                            <div class="alert alert-info small mt-3">
                                <i class="fas fa-info-circle me-1"></i>
                                Ajoutez ${(500 - this.subtotal).toFixed(2)} MAD pour bénéficier de la livraison gratuite !
                            </div>
                        ` : ''}
                        
                        <hr>
                        
                        <div class="summary-total d-flex justify-content-between mb-4">
                            <strong>Total</strong>
                            <strong class="text-primary h5">${this.total.toFixed(2)} MAD</strong>
                        </div>
                        
                        <div class="d-grid gap-2">
                            <a href="checkout.html" class="btn btn-primary btn-lg">
                                <i class="fas fa-credit-card me-2"></i>Passer la commande
                            </a>
                            <a href="boutique.html" class="btn btn-outline-secondary">
                                <i class="fas fa-arrow-left me-2"></i>Continuer mes achats
                            </a>
                        </div>
                        
                        <!-- Informations de sécurité -->
                        <div class="security-info mt-4 text-center">
                            <small class="text-muted">
                                <i class="fas fa-shield-alt text-success me-1"></i>
                                Paiement sécurisé
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    // Affiche les items du panier
    renderCartItems() {
        return this.cartItems.map(cartItem => {
            const productDetail = this.productsDetails.find(p => p.id === cartItem.id);
            if (!productDetail) return '';

            const imageUrl = (productDetail.image_url && productDetail.image_url.startsWith('/static/')) 
                ? `${this.apiBaseUrl}${productDetail.image_url}` 
                : (productDetail.image_url || '../assets/images/placeholder.jpg');

            const itemTotal = productDetail.price * cartItem.quantity;

            return `
                <div class="cart-item-row" data-product-id="${productDetail.id}">
                    <div class="row align-items-center">
                        <!-- Image du produit -->
                        <div class="col-md-2 col-3">
                            <img src="${imageUrl}" alt="${productDetail.name}" 
                                 class="cart-item-image img-fluid"
                                 onerror="this.onerror=null;this.src='../assets/images/placeholder.jpg';">
                        </div>
                        
                        <!-- Informations du produit -->
                        <div class="col-md-4 col-9">
                            <h6 class="fw-bold mb-1">
                                <a href="produit.html?id=${productDetail.id}" class="text-decoration-none">
                                    ${productDetail.name}
                                </a>
                            </h6>
                            <p class="text-muted small mb-1">
                                ${productDetail.short_description || ''}
                            </p>
                            <span class="badge bg-${productDetail.stock > 0 ? 'success' : 'danger'}">
                                ${productDetail.stock > 0 ? 'En stock' : 'Rupture'}
                            </span>
                        </div>
                        
                        <!-- Prix unitaire -->
                        <div class="col-md-2 col-6 text-center">
                            <span class="fw-bold">${productDetail.price.toFixed(2)} MAD</span>
                        </div>
                        
                        <!-- Quantité -->
                        <div class="col-md-2 col-6">
                            <div class="input-group quantity-input">
                                <button class="btn btn-outline-secondary btn-sm" type="button" 
                                        onclick="cartPage.updateQuantity(${productDetail.id}, ${cartItem.quantity - 1})">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <input type="number" class="form-control form-control-sm text-center" 
                                       value="${cartItem.quantity}" min="1" max="${productDetail.stock}"
                                       onchange="cartPage.updateQuantity(${productDetail.id}, this.value)">
                                <button class="btn btn-outline-secondary btn-sm" type="button" 
                                        onclick="cartPage.updateQuantity(${productDetail.id}, ${cartItem.quantity + 1})">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Total de la ligne -->
                        <div class="col-md-1 col-6 text-center">
                            <span class="fw-bold text-primary">${itemTotal.toFixed(2)} MAD</span>
                        </div>
                        
                        <!-- Bouton supprimer -->
                        <div class="col-md-1 col-6 text-center">
                            <button class="btn btn-outline-danger btn-sm" 
                                    onclick="cartPage.removeItem(${productDetail.id})"
                                    title="Supprimer cet article">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Affiche un panier vide
    renderEmptyCart() {
        const container = document.getElementById('cart-container');
        if (!container) return;

        container.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="empty-cart d-flex flex-column align-items-center justify-content-center text-center">
                        <i class="fas fa-shopping-cart fa-5x text-muted mb-4"></i>
                        <h3 class="fw-bold mb-3">Votre panier est vide</h3>
                        <p class="text-muted mb-4">Découvrez nos produits et ajoutez-les à votre panier</p>
                        <a href="boutique.html" class="btn btn-primary btn-lg">
                            <i class="fas fa-store me-2"></i>Découvrir nos produits
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    // Met à jour la quantité d'un produit
    updateQuantity(productId, newQuantity) {
        const quantity = parseInt(newQuantity);
        
        if (quantity <= 0) {
            this.removeItem(productId);
            return;
        }

        // Vérifier le stock disponible
        const productDetail = this.productsDetails.find(p => p.id === productId);
        if (productDetail && quantity > productDetail.stock) {
            this.showNotification(`Stock insuffisant. Maximum disponible: ${productDetail.stock}`, 'warning');
            return;
        }

        // Mettre à jour le localStorage
        const cartItems = JSON.parse(localStorage.getItem('renovsoukCart')) || [];
        const itemIndex = cartItems.findIndex(item => item.id === productId);
        
        if (itemIndex !== -1) {
            cartItems[itemIndex].quantity = quantity;
            localStorage.setItem('renovsoukCart', JSON.stringify(cartItems));
            
            // Recharger et réafficher
            this.cartItems = cartItems;
            this.calculateTotals();
            this.renderCart();
            
            // Mettre à jour l'affichage global du panier
            if (window.cart) {
                window.cart.updateDisplay();
            }
            
            this.showNotification('Quantité mise à jour', 'success');
        }
    }

    // Supprime un produit du panier
    removeItem(productId) {
        const cartItems = JSON.parse(localStorage.getItem('renovsoukCart')) || [];
        const updatedItems = cartItems.filter(item => item.id !== productId);
        
        localStorage.setItem('renovsoukCart', JSON.stringify(updatedItems));
        
        // Recharger et réafficher
        this.cartItems = updatedItems;
        this.productsDetails = this.productsDetails.filter(p => p.id !== productId);
        this.calculateTotals();
        this.renderCart();
        
        // Mettre à jour l'affichage global du panier
        if (window.cart) {
            window.cart.updateDisplay();
        }
        
        this.showNotification('Produit supprimé du panier', 'success');
    }

    // Vide complètement le panier
    clearCart() {
        if (confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
            localStorage.removeItem('renovsoukCart');
            this.cartItems = [];
            this.productsDetails = [];
            this.calculateTotals();
            this.renderCart();
            
            // Mettre à jour l'affichage global du panier
            if (window.cart) {
                window.cart.updateDisplay();
            }
            
            this.showNotification('Panier vidé', 'success');
        }
    }

    // Calcule le nombre total d'articles
    getTotalItems() {
        return this.cartItems.reduce((total, item) => total + item.quantity, 0);
    }

    // Affiche une erreur
    showError(message) {
        const container = document.getElementById('cart-container');
        if (!container) return;

        container.innerHTML = `
            <div class="row">
                <div class="col-12 text-center py-5">
                    <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                    <h3>Erreur</h3>
                    <p class="text-muted">${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">Réessayer</button>
                </div>
            </div>
        `;
    }

    // Affiche une notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 300px;';
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }
}

// Initialiser la page panier
let cartPage;
document.addEventListener('DOMContentLoaded', () => {
    cartPage = new CartPageManager();
});

