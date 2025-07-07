// Gestion de la page checkout
// Version: 1.0

class CheckoutManager {
    constructor() {
        this.apiBaseUrl = 'http://localhost:5001';
        this.cartItems = [];
        this.productsDetails = [];
        this.subtotal = 0;
        this.shippingCost = 0;
        this.total = 0;
        this.selectedPaymentMethod = 'cod';
        
        this.init();
    }

    async init() {
        await this.loadCartData();
        if (this.cartItems.length === 0) {
            this.redirectToCart();
            return;
        }
        this.renderCheckout();
    }

    // Charge les données du panier
    async loadCartData() {
        try {
            this.cartItems = JSON.parse(localStorage.getItem('renovsoukCart')) || [];
            
            if (this.cartItems.length === 0) {
                return;
            }

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

        this.shippingCost = this.subtotal >= 500 ? 0 : 50;
        this.total = this.subtotal + this.shippingCost;
    }

    // Redirige vers le panier si vide
    redirectToCart() {
        window.location.href = 'panier.html';
    }

    // Affiche le checkout
    renderCheckout() {
        const container = document.getElementById('checkout-container');
        if (!container) return;

        const html = `
            <form id="checkout-form" novalidate>
                <div class="row">
                    <!-- Formulaire de commande -->
                    <div class="col-lg-8">
                        <!-- Informations de livraison -->
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5 class="mb-0">
                                    <i class="fas fa-shipping-fast me-2"></i>Informations de livraison
                                </h5>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="firstName" class="form-label">Prénom *</label>
                                        <input type="text" class="form-control" id="firstName" name="firstName" required>
                                        <div class="invalid-feedback">Veuillez entrer votre prénom.</div>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="lastName" class="form-label">Nom *</label>
                                        <input type="text" class="form-control" id="lastName" name="lastName" required>
                                        <div class="invalid-feedback">Veuillez entrer votre nom.</div>
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="email" class="form-label">Email *</label>
                                        <input type="email" class="form-control" id="email" name="email" required>
                                        <div class="invalid-feedback">Veuillez entrer une adresse email valide.</div>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="phone" class="form-label">Téléphone *</label>
                                        <input type="tel" class="form-control" id="phone" name="phone" required>
                                        <div class="invalid-feedback">Veuillez entrer votre numéro de téléphone.</div>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="address" class="form-label">Adresse complète *</label>
                                    <textarea class="form-control" id="address" name="address" rows="3" required 
                                              placeholder="Numéro, rue, quartier..."></textarea>
                                    <div class="invalid-feedback">Veuillez entrer votre adresse complète.</div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-8 mb-3">
                                        <label for="city" class="form-label">Ville *</label>
                                        <select class="form-select" id="city" name="city" required>
                                            <option value="">Sélectionnez votre ville</option>
                                            <option value="Casablanca">Casablanca</option>
                                            <option value="Rabat">Rabat</option>
                                            <option value="Marrakech">Marrakech</option>
                                            <option value="Fès">Fès</option>
                                            <option value="Tanger">Tanger</option>
                                            <option value="Agadir">Agadir</option>
                                            <option value="Meknès">Meknès</option>
                                            <option value="Oujda">Oujda</option>
                                            <option value="Kenitra">Kenitra</option>
                                            <option value="Tétouan">Tétouan</option>
                                            <option value="Autre">Autre ville</option>
                                        </select>
                                        <div class="invalid-feedback">Veuillez sélectionner votre ville.</div>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="postalCode" class="form-label">Code postal</label>
                                        <input type="text" class="form-control" id="postalCode" name="postalCode">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Méthode de paiement -->
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5 class="mb-0">
                                    <i class="fas fa-credit-card me-2"></i>Méthode de paiement
                                </h5>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <div class="payment-method selected" data-method="cod" onclick="checkout.selectPaymentMethod('cod')">
                                            <div class="d-flex align-items-center">
                                                <input type="radio" name="paymentMethod" value="cod" checked class="me-3">
                                                <div>
                                                    <h6 class="mb-1">
                                                        <i class="fas fa-money-bill-wave me-2"></i>Paiement à la livraison
                                                    </h6>
                                                    <small class="text-muted">Payez en espèces lors de la réception</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <div class="payment-method" data-method="bank_transfer" onclick="checkout.selectPaymentMethod('bank_transfer')">
                                            <div class="d-flex align-items-center">
                                                <input type="radio" name="paymentMethod" value="bank_transfer" class="me-3">
                                                <div>
                                                    <h6 class="mb-1">
                                                        <i class="fas fa-university me-2"></i>Virement bancaire
                                                    </h6>
                                                    <small class="text-muted">Virement sur notre compte bancaire</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Détails du virement bancaire -->
                                <div id="bank-details" style="display: none;">
                                    <div class="bank-details mt-3">
                                        <h6 class="fw-bold mb-2">
                                            <i class="fas fa-info-circle me-2"></i>Informations bancaires
                                        </h6>
                                        <div class="row">
                                            <div class="col-md-6">
                                                <p class="mb-1"><strong>Banque:</strong> Banque Populaire</p>
                                                <p class="mb-1"><strong>Titulaire:</strong> RenovSouk SARL</p>
                                                <p class="mb-1"><strong>RIB:</strong> 022 780 0001234567890 12</p>
                                            </div>
                                            <div class="col-md-6">
                                                <p class="mb-1"><strong>IBAN:</strong> MA64 022780000123456789012</p>
                                                <p class="mb-1"><strong>SWIFT:</strong> BCPOMAMC</p>
                                            </div>
                                        </div>
                                        <div class="alert alert-warning mt-2 mb-0">
                                            <small>
                                                <i class="fas fa-exclamation-triangle me-1"></i>
                                                Votre commande sera traitée après réception du virement. 
                                                Merci d'indiquer votre numéro de commande en référence.
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Notes de commande -->
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5 class="mb-0">
                                    <i class="fas fa-sticky-note me-2"></i>Notes de commande (optionnel)
                                </h5>
                            </div>
                            <div class="card-body">
                                <textarea class="form-control" id="orderNotes" name="orderNotes" rows="3" 
                                          placeholder="Instructions spéciales pour la livraison, étage, code d'accès..."></textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Résumé de commande -->
                    <div class="col-lg-4">
                        <div class="order-summary p-4">
                            <h5 class="fw-bold mb-4">Résumé de votre commande</h5>
                            
                            <!-- Articles -->
                            <div class="order-items mb-4">
                                ${this.renderOrderItems()}
                            </div>
                            
                            <!-- Totaux -->
                            <div class="order-totals">
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Sous-total</span>
                                    <span>${this.subtotal.toFixed(2)} MAD</span>
                                </div>
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Livraison</span>
                                    <span class="${this.shippingCost === 0 ? 'text-success' : ''}">
                                        ${this.shippingCost === 0 ? 'GRATUIT' : this.shippingCost.toFixed(2) + ' MAD'}
                                    </span>
                                </div>
                                <hr>
                                <div class="d-flex justify-content-between mb-4">
                                    <strong>Total</strong>
                                    <strong class="text-primary h5">${this.total.toFixed(2)} MAD</strong>
                                </div>
                            </div>
                            
                            <!-- Bouton de validation -->
                            <div class="d-grid gap-2">
                                <button type="submit" class="btn btn-success btn-lg" id="place-order-btn">
                                    <i class="fas fa-check me-2"></i>Valider ma commande
                                </button>
                                <a href="panier.html" class="btn btn-outline-secondary">
                                    <i class="fas fa-arrow-left me-2"></i>Retour au panier
                                </a>
                            </div>
                            
                            <!-- Sécurité -->
                            <div class="security-badges mt-4 text-center">
                                <small class="text-muted d-block mb-2">
                                    <i class="fas fa-shield-alt text-success me-1"></i>
                                    Commande sécurisée
                                </small>
                                <small class="text-muted">
                                    <i class="fas fa-lock text-success me-1"></i>
                                    Vos données sont protégées
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        `;

        container.innerHTML = html;
        this.setupEventListeners();
    }

    // Affiche les articles de la commande
    renderOrderItems() {
        return this.cartItems.map(cartItem => {
            const productDetail = this.productsDetails.find(p => p.id === cartItem.id);
            if (!productDetail) return '';

            const imageUrl = (productDetail.image_url && productDetail.image_url.startsWith('/static/')) 
                ? `${this.apiBaseUrl}${productDetail.image_url}` 
                : (productDetail.image_url || '../assets/images/placeholder.jpg');

            return `
                <div class="order-item d-flex align-items-center mb-3 pb-3 border-bottom">
                    <img src="${imageUrl}" alt="${productDetail.name}" 
                         class="me-3" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"
                         onerror="this.onerror=null;this.src='../assets/images/placeholder.jpg';">
                    <div class="flex-grow-1">
                        <h6 class="mb-1 small">${productDetail.name}</h6>
                        <small class="text-muted">Qté: ${cartItem.quantity}</small>
                    </div>
                    <div class="text-end">
                        <span class="fw-bold">${(productDetail.price * cartItem.quantity).toFixed(2)} MAD</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Configure les écouteurs d'événements
    setupEventListeners() {
        const form = document.getElementById('checkout-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    // Sélectionne une méthode de paiement
    selectPaymentMethod(method) {
        this.selectedPaymentMethod = method;
        
        // Mettre à jour l'interface
        document.querySelectorAll('.payment-method').forEach(el => {
            el.classList.remove('selected');
        });
        document.querySelector(`[data-method="${method}"]`).classList.add('selected');
        
        // Mettre à jour les radio buttons
        document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
            radio.checked = radio.value === method;
        });
        
        // Afficher/masquer les détails bancaires
        const bankDetails = document.getElementById('bank-details');
        if (bankDetails) {
            bankDetails.style.display = method === 'bank_transfer' ? 'block' : 'none';
        }
    }

    // Gère la soumission du formulaire
    async handleSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const submitBtn = document.getElementById('place-order-btn');
        const originalText = submitBtn.innerHTML;
        
        try {
            // Désactiver le bouton et afficher le loader
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Traitement...';
            
            // Préparer les données de commande
            const formData = new FormData(form);
            const orderData = {
                shipping_first_name: formData.get('firstName'),
                shipping_last_name: formData.get('lastName'),
                shipping_email: formData.get('email'),
                shipping_phone: formData.get('phone'),
                shipping_address: formData.get('address'),
                shipping_city: formData.get('city'),
                shipping_postal_code: formData.get('postalCode') || '',
                payment_method: this.selectedPaymentMethod,
                notes: formData.get('orderNotes') || '',
                items: this.cartItems
            };

            // Envoyer la commande
            const response = await fetch(`${this.apiBaseUrl}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Erreur lors de la création de la commande');
            }

            // Succès - vider le panier et rediriger
            localStorage.removeItem('renovsoukCart');
            window.location.href = `confirmation.html?order=${result.order.order_number}`;

        } catch (error) {
            console.error('Erreur:', error);
			alert('Une erreur est survenue. Vérifiez la console pour les détails. Message : ' + error.message);
            this.showNotification(error.message, 'danger');
            
            // Réactiver le bouton
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    // Affiche une erreur
    showError(message) {
        const container = document.getElementById('checkout-container');
        if (!container) return;

        container.innerHTML = `
            <div class="row">
                <div class="col-12 text-center py-5">
                    <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                    <h3>Erreur</h3>
                    <p class="text-muted">${message}</p>
                    <a href="panier.html" class="btn btn-primary">Retour au panier</a>
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
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }
}

// Initialiser le checkout
let checkout;
document.addEventListener('DOMContentLoaded', () => {
    checkout = new CheckoutManager();
});

