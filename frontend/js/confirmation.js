// Gestion de la page de confirmation
// Version: 1.0

class ConfirmationManager {
    constructor() {
        this.apiBaseUrl = 'http://localhost:5001';
        this.orderNumber = null;
        this.order = null;
        
        this.init();
    }

    async init() {
        this.parseUrlParams();
        if (this.orderNumber) {
            await this.loadOrder();
            this.renderConfirmation();
        } else {
            this.showError('Numéro de commande manquant');
        }
    }

    // Parse les paramètres URL
    parseUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        this.orderNumber = urlParams.get('order');
    }

    // Charge les détails de la commande
    async loadOrder() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/orders/${this.orderNumber}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Commande non trouvée');
                }
                throw new Error('Erreur lors du chargement de la commande');
            }

            const data = await response.json();
            this.order = data.order;

        } catch (error) {
            console.error('Erreur:', error);
            this.showError(error.message);
        }
    }

    // Affiche la confirmation
    renderConfirmation() {
        const container = document.getElementById('confirmation-container');
        if (!container || !this.order) return;

        const paymentMethodText = this.order.payment_method === 'cod' ? 'Paiement à la livraison' : 'Virement bancaire';
        const orderDate = new Date(this.order.created_at).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const html = `
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <!-- Message de succès -->
                    <div class="text-center mb-5">
                        <div class="success-icon">
                            <i class="fas fa-check fa-3x text-white"></i>
                        </div>
                        <h1 class="h2 fw-bold text-success mb-3">Commande confirmée !</h1>
                        <p class="lead text-muted">
                            Merci ${this.order.shipping_first_name} ! Votre commande a été enregistrée avec succès.
                        </p>
                    </div>

                    <!-- Détails de la commande -->
                    <div class="order-details p-4 mb-4">
                        <h3 class="h5 fw-bold mb-3">
                            <i class="fas fa-receipt me-2"></i>Détails de votre commande
                        </h3>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <p class="mb-2"><strong>Numéro de commande:</strong> ${this.order.order_number}</p>
                                <p class="mb-2"><strong>Date:</strong> ${orderDate}</p>
                                <p class="mb-2"><strong>Statut:</strong> 
                                    <span class="badge bg-warning">En attente</span>
                                </p>
                            </div>
                            <div class="col-md-6">
                                <p class="mb-2"><strong>Mode de paiement:</strong> ${paymentMethodText}</p>
                                <p class="mb-2"><strong>Total:</strong> 
                                    <span class="text-primary fw-bold">${this.order.total_amount.toFixed(2)} MAD</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Adresse de livraison -->
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="fas fa-shipping-fast me-2"></i>Adresse de livraison
                            </h5>
                        </div>
                        <div class="card-body">
                            <address class="mb-0">
                                <strong>${this.order.shipping_first_name} ${this.order.shipping_last_name}</strong><br>
                                ${this.order.shipping_address}<br>
                                ${this.order.shipping_city}${this.order.shipping_postal_code ? ', ' + this.order.shipping_postal_code : ''}<br>
                                <i class="fas fa-phone me-1"></i>${this.order.shipping_phone}<br>
                                <i class="fas fa-envelope me-1"></i>${this.order.shipping_email}
                            </address>
                        </div>
                    </div>

                    <!-- Articles commandés -->
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="fas fa-box me-2"></i>Articles commandés
                            </h5>
                        </div>
                        <div class="card-body">
                            ${this.renderOrderItems()}
                            
                            <!-- Totaux -->
                            <div class="border-top pt-3 mt-3">
                                <div class="row">
                                    <div class="col-md-6 offset-md-6">
                                        <div class="d-flex justify-content-between mb-2">
                                            <span>Sous-total:</span>
                                            <span>${this.order.subtotal.toFixed(2)} MAD</span>
                                        </div>
                                        <div class="d-flex justify-content-between mb-2">
                                            <span>Livraison:</span>
                                            <span>${this.order.shipping_cost === 0 ? 'GRATUIT' : this.order.shipping_cost.toFixed(2) + ' MAD'}</span>
                                        </div>
                                        <div class="d-flex justify-content-between fw-bold text-primary">
                                            <span>Total:</span>
                                            <span>${this.order.total_amount.toFixed(2)} MAD</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Prochaines étapes -->
                    <div class="next-steps p-4 mb-4">
                        <h3 class="h5 fw-bold mb-3">
                            <i class="fas fa-list-check me-2"></i>Prochaines étapes
                        </h3>
                        
                        <div class="step-item">
                            <div class="d-flex align-items-center">
                                <div class="me-3">
                                    <i class="fas fa-phone-alt fa-lg"></i>
                                </div>
                                <div>
                                    <h6 class="mb-1">Confirmation par téléphone</h6>
                                    <small>Notre équipe vous contactera dans les 24h pour confirmer votre commande</small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="step-item">
                            <div class="d-flex align-items-center">
                                <div class="me-3">
                                    <i class="fas fa-box-open fa-lg"></i>
                                </div>
                                <div>
                                    <h6 class="mb-1">Préparation de votre commande</h6>
                                    <small>Nous préparons soigneusement vos articles</small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="step-item">
                            <div class="d-flex align-items-center">
                                <div class="me-3">
                                    <i class="fas fa-truck fa-lg"></i>
                                </div>
                                <div>
                                    <h6 class="mb-1">Expédition</h6>
                                    <small>Livraison sous 2-5 jours ouvrés</small>
                                </div>
                            </div>
                        </div>
                        
                        ${this.order.payment_method === 'bank_transfer' ? `
                            <div class="step-item">
                                <div class="d-flex align-items-center">
                                    <div class="me-3">
                                        <i class="fas fa-university fa-lg"></i>
                                    </div>
                                    <div>
                                        <h6 class="mb-1">Virement bancaire</h6>
                                        <small>N'oubliez pas d'effectuer le virement avec la référence: ${this.order.order_number}</small>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    ${this.order.payment_method === 'bank_transfer' ? this.renderBankDetails() : ''}

                    <!-- Actions -->
                    <div class="text-center">
                        <a href="../index.html" class="btn btn-primary btn-lg me-3">
                            <i class="fas fa-home me-2"></i>Retour à l'accueil
                        </a>
                        <a href="boutique.html" class="btn btn-outline-primary btn-lg">
                            <i class="fas fa-store me-2"></i>Continuer mes achats
                        </a>
                    </div>

                    <!-- Email de confirmation -->
                    <div class="alert alert-info mt-4">
                        <i class="fas fa-envelope me-2"></i>
                        Un email de confirmation a été envoyé à <strong>${this.order.shipping_email}</strong>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    // Affiche les articles de la commande
    renderOrderItems() {
        if (!this.order.items || this.order.items.length === 0) {
            return '<p class="text-muted">Aucun article trouvé</p>';
        }

        return this.order.items.map(item => `
            <div class="d-flex align-items-center py-2 border-bottom">
                <div class="me-3">
                    ${item.product_image ? 
                        `<img src="${this.apiBaseUrl}${item.product_image}" alt="${item.product_name}" 
                             style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"
                             onerror="this.onerror=null;this.src='../assets/images/placeholder.jpg';">` :
                        `<div style="width: 50px; height: 50px; background-color: #f8f9fa; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-image text-muted"></i>
                         </div>`
                    }
                </div>
                <div class="flex-grow-1">
                    <h6 class="mb-1">${item.product_name}</h6>
                    <small class="text-muted">
                        ${item.product_sku ? `Réf: ${item.product_sku} | ` : ''}
                        ${item.unit_price.toFixed(2)} MAD × ${item.quantity}
                    </small>
                </div>
                <div class="text-end">
                    <span class="fw-bold">${item.total_price.toFixed(2)} MAD</span>
                </div>
            </div>
        `).join('');
    }

    // Affiche les détails bancaires
    renderBankDetails() {
        return `
            <div class="card mb-4 border-warning">
                <div class="card-header bg-warning">
                    <h5 class="mb-0">
                        <i class="fas fa-university me-2"></i>Informations pour le virement bancaire
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p class="mb-2"><strong>Banque:</strong> Banque Populaire</p>
                            <p class="mb-2"><strong>Titulaire:</strong> RenovSouk SARL</p>
                            <p class="mb-2"><strong>RIB:</strong> 022 780 0001234567890 12</p>
                        </div>
                        <div class="col-md-6">
                            <p class="mb-2"><strong>IBAN:</strong> MA64 022780000123456789012</p>
                            <p class="mb-2"><strong>SWIFT:</strong> BCPOMAMC</p>
                            <p class="mb-2"><strong>Montant:</strong> <span class="fw-bold text-primary">${this.order.total_amount.toFixed(2)} MAD</span></p>
                        </div>
                    </div>
                    <div class="alert alert-warning mt-3 mb-0">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <strong>Important:</strong> Merci d'indiquer la référence <strong>${this.order.order_number}</strong> 
                        lors de votre virement pour que nous puissions identifier votre paiement.
                    </div>
                </div>
            </div>
        `;
    }

    // Affiche une erreur
    showError(message) {
        const container = document.getElementById('confirmation-container');
        if (!container) return;

        container.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-lg-6 text-center py-5">
                    <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                    <h3>Erreur</h3>
                    <p class="text-muted">${message}</p>
                    <a href="../index.html" class="btn btn-primary">Retour à l'accueil</a>
                </div>
            </div>
        `;
    }
}

// Initialiser la page de confirmation
document.addEventListener('DOMContentLoaded', () => {
    new ConfirmationManager();
});

