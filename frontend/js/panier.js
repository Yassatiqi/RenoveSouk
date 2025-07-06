// Fichier: frontend/js/panier.js
// Version: 1.1 - Corrigée pour la cohérence et la robustesse

class CartPageManager {
    constructor() {
        this.apiBaseUrl = 'http://localhost:5001';
        this.cartItems = [];
        this.productsDetails = [];
        this.subtotal = 0;
        this.shippingCost = 0;
        this.total = 0;
        
        // On s'assure que l'objet global window.cart existe
        if (!window.cart) {
            console.error("L'objet global 'cart' de script.js est manquant !");
            return;
        }
        
        this.init();
    }

    async init() {
        // Le `init` est maintenant le point d'entrée unique pour recharger la page
        await this.loadCartData();
        this.renderCart();
    }

    // Charge les données du panier en utilisant l'objet global
    async loadCartData() {
        try {
            // JUSTIFICATION: Utilise la méthode de l'objet global pour plus de cohérence.
            this.cartItems = window.cart.getItems();
            
            if (this.cartItems.length === 0) {
                // Si le panier est vide, on réinitialise les détails et totaux.
                this.productsDetails = [];
                this.calculateTotals();
                return;
            }

            const productIds = this.cartItems.map(item => item.id);
            const response = await fetch(`${this.apiBaseUrl}/api/products/by-ids`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: productIds })
            });

            if (!response.ok) throw new Error('Erreur lors du chargement des détails des produits');
            
            this.productsDetails = await response.json();
            this.calculateTotals();

        } catch (error) {
            console.error('Erreur:', error);
            this.showError('Erreur lors du chargement des données du panier.');
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
                <div class="col-lg-8">
                    <div class="cart-items bg-white rounded shadow-sm p-4">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h3 class="h5 fw-bold mb-0">Articles dans votre panier (${this.getTotalItems()})</h3>
                            <button class="btn btn-outline-danger btn-sm" onclick="cartPage.clearCart()">
                                <i class="fas fa-trash me-1"></i>Vider le panier
                            </button>
                        </div>
                        <div id="cart-items-list">${this.renderCartItems()}</div>
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="cart-summary p-4">
                        <h3 class="h5 fw-bold mb-4">Résumé de la commande</h3>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Sous-total</span>
                            <span>${this.subtotal.toFixed(2)} MAD</span>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Livraison</span>
                            <span class="${this.shippingCost === 0 ? 'text-success' : ''}">${this.shippingCost === 0 ? 'GRATUIT' : this.shippingCost.toFixed(2) + ' MAD'}</span>
                        </div>
                        ${this.subtotal < 500 && this.subtotal > 0 ? `<div class="alert alert-info small mt-3"><i class="fas fa-info-circle me-1"></i>Ajoutez ${(500 - this.subtotal).toFixed(2)} MAD pour la livraison gratuite !</div>` : ''}
                        <hr>
                        <div class="d-flex justify-content-between fw-bold h5 mb-4">
                            <span>Total</span>
                            <strong class="text-primary">${this.total.toFixed(2)} MAD</strong>
                        </div>
                        <div class="d-grid gap-2">
                            <a href="checkout.html" class="btn btn-primary btn-lg"><i class="fas fa-credit-card me-2"></i>Passer la commande</a>
                            <a href="/pages/boutique.html" class="btn btn-outline-secondary"><i class="fas fa-arrow-left me-2"></i>Continuer mes achats</a>
                        </div>
                    </div>
                </div>
            </div>`;
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
                    <div class="row align-items-center py-3 border-bottom">
                        <div class="col-md-2 col-3">
                            <img src="${imageUrl}" alt="${productDetail.name}" class="cart-item-image img-fluid" onerror="this.onerror=null;this.src='../assets/images/placeholder.jpg';">
                        </div>
                        <div class="col-md-4 col-9">
                            <a href="/pages/produit.html?id=${productDetail.id}" class="text-decoration-none fw-bold">${productDetail.name}</a>
                            <p class="text-muted small mb-0">Réf: ${productDetail.sku || 'N/A'}</p>
                        </div>
                        <div class="col-md-3 col-6 mt-2 mt-md-0">
                            <div class="input-group quantity-input mx-auto" style="max-width: 120px;">
                                <button class="btn btn-outline-secondary btn-sm" onclick="cartPage.updateQuantity(${productDetail.id}, ${cartItem.quantity - 1})"><i class="fas fa-minus"></i></button>
                                <!-- JUSTIFICATION: L'input est readonly pour forcer l'utilisation des boutons, et affiche la quantité correcte. -->
                                <input type="text" class="form-control form-control-sm text-center" value="${cartItem.quantity}" readonly>
                                <button class="btn btn-outline-secondary btn-sm" onclick="cartPage.updateQuantity(${productDetail.id}, ${cartItem.quantity + 1})"><i class="fas fa-plus"></i></button>
                            </div>
                        </div>
                        <div class="col-md-1 col-3 mt-2 mt-md-0 text-center fw-bold">
                            <span>${itemTotal.toFixed(2)}</span>
                        </div>
                        <div class="col-md-2 col-3 mt-2 mt-md-0 text-end">
                            <button class="btn btn-outline-danger btn-sm" onclick="cartPage.removeItem(${productDetail.id})" title="Supprimer"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>`;
        }).join('');
    }

    // Affiche un panier vide
    renderEmptyCart() {
        const container = document.getElementById('cart-container');
        container.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="empty-cart d-flex flex-column align-items-center justify-content-center text-center py-5">
                        <i class="fas fa-shopping-cart fa-5x text-muted mb-4"></i>
                        <h3 class="fw-bold mb-3">Votre panier est vide</h3>
                        <p class="text-muted mb-4">Découvrez nos produits et ajoutez-les à votre panier</p>
                        <a href="/pages/boutique.html" class="btn btn-primary btn-lg"><i class="fas fa-store me-2"></i>Découvrir nos produits</a>
                    </div>
                </div>
            </div>`;
    }

    // Met à jour la quantité d'un produit
    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeItem(productId);
            return;
        }

        const productDetail = this.productsDetails.find(p => p.id === productId);
        if (productDetail && newQuantity > productDetail.stock) {
            window.cart.showNotification(`Stock insuffisant. Maximum disponible: ${productDetail.stock}`, 'warning');
            return;
        }
        
        const items = window.cart.getItems();
        const itemIndex = items.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            items[itemIndex].quantity = newQuantity;
            window.cart.saveItems(items);
            // JUSTIFICATION: Appeler init() est plus simple et fiable que de tout recalculer manuellement.
            this.init(); 
            // JUSTIFICATION: Mettre à jour le panier du header pour la cohérence.
            window.cart.updateDisplay();
        }
    }

    // Supprime un produit du panier
    removeItem(productId) {
        const items = window.cart.getItems().filter(item => item.id !== productId);
        window.cart.saveItems(items);
        this.init(); 
        window.cart.updateDisplay();
        window.cart.showNotification('Produit supprimé du panier', 'success');
    }

    // Vide complètement le panier
    clearCart() {
        if (confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
            window.cart.saveItems([]);
            this.init(); 
            window.cart.updateDisplay();
            window.cart.showNotification('Panier vidé', 'success');
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
        container.innerHTML = `<div class="alert alert-danger">${message}</div>`;
    }
}

// Initialiser la page panier
let cartPage;
document.addEventListener('DOMContentLoaded', () => {
    cartPage = new CartPageManager();
});