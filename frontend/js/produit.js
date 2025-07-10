// Page de détail produit
// Version: 1.0

class ProductDetailManager {
    constructor() {
        this.apiBaseUrl = 'http://localhost:5001';
        this.productId = null;
        this.product = null;
        this.selectedQuantity = 1;
        
        this.init();
    }

    async init() {
        this.parseUrlParams();
        if (this.productId) {
            await this.loadProduct();
            await this.loadRelatedProducts();
        } else {
            this.showError('ID de produit manquant');
        }
    }

    // Parse les paramètres URL
    parseUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        this.productId = urlParams.get('id');
    }

    // Charge le produit depuis l'API
    async loadProduct() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/products/${this.productId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Produit non trouvé');
                }
                throw new Error('Erreur lors du chargement du produit');
            }

            const data = await response.json();
            this.product = data.product;
            this.renderProduct();
            this.updateBreadcrumb();
            this.updatePageTitle();

        } catch (error) {
            console.error('Erreur:', error);
            this.showError(error.message);
        }
    }

    // Affiche le produit
    renderProduct() {
        const container = document.getElementById('product-detail-container');
        if (!container || !this.product) return;

        const imageUrl = (this.product.image_url && this.product.image_url.startsWith('/static/')) 
            ? `${this.apiBaseUrl}${this.product.image_url}` 
            : (this.product.image_url || '../assets/images/placeholder.jpg');

        // Calcul du pourcentage de réduction
        let discountPercent = 0;
        if (this.product.is_on_sale && this.product.original_price) {
            discountPercent = Math.round(((this.product.original_price - this.product.price) / this.product.original_price) * 100);
        }

        const html = `
            <div class="row">
                <!-- Images du produit -->
                <div class="col-lg-6">
                    <div class="product-images">
                        <div class="main-image mb-3">
                            <img src="${imageUrl}" alt="${this.product.name}" 
                                 class="img-fluid product-image-main w-100" id="main-product-image"
                                 onerror="this.onerror=null;this.src='../assets/images/placeholder.jpg';">
                        </div>
                        
                        <!-- Galerie d'images (pour l'instant juste l'image principale) -->
                        <div class="product-gallery d-flex gap-2">
                            <img src="${imageUrl}" alt="${this.product.name}" 
                                 class="product-gallery-thumb active" 
                                 onclick="productDetail.changeMainImage(this.src)"
                                 onerror="this.onerror=null;this.src='../assets/images/placeholder.jpg';">
                        </div>
                    </div>
                </div>

                <!-- Informations du produit -->
                <div class="col-lg-6">
                    <div class="product-info">
                        <!-- Badges -->
                        <div class="product-badges mb-2">
                            ${this.product.is_new ? '<span class="badge bg-info me-2">Nouveau</span>' : ''}
                            ${this.product.is_on_sale ? `<span class="badge bg-danger me-2">-${discountPercent}%</span>` : ''}
                            ${this.product.is_featured ? '<span class="badge bg-warning text-dark me-2">En vedette</span>' : ''}
                        </div>

                        <!-- Nom du produit -->
                        <h1 class="product-title h2 fw-bold mb-3">${this.product.name}</h1>

                        <!-- SKU -->
                        ${this.product.sku ? `<p class="text-muted mb-3">Référence: ${this.product.sku}</p>` : ''}

                        <!-- Prix -->
                        <div class="product-price mb-4">
                            <span class="current-price h3 text-primary fw-bold">${this.product.price.toFixed(2)} MAD</span>
                            ${this.product.is_on_sale && this.product.original_price ? 
                                `<span class="original-price h5 text-muted text-decoration-line-through ms-3">${this.product.original_price.toFixed(2)} MAD</span>` 
                                : ''
                            }
                        </div>

                        <!-- Description courte -->
                        ${this.product.short_description ? 
                            `<div class="product-short-description mb-4">
                                <p class="lead">${this.product.short_description}</p>
                            </div>` 
                            : ''
                        }

                        <!-- Stock -->
                        <div class="stock-info mb-4">
                            ${this.product.stock > 0 ? 
                                `<span class="badge bg-success">
                                    <i class="fas fa-check me-1"></i>En stock (${this.product.stock} disponibles)
                                </span>` :
                                `<span class="badge bg-danger">
                                    <i class="fas fa-times me-1"></i>Rupture de stock
                                </span>`
                            }
                        </div>

                        <!-- Sélecteur de quantité et bouton d'ajout au panier -->
                        ${this.product.stock > 0 ? `
                            <div class="add-to-cart-section mb-4">
                                <div class="row align-items-center">
                                    <div class="col-auto">
                                        <label for="quantity" class="form-label">Quantité:</label>
                                        <div class="input-group quantity-selector">
                                            <button class="btn btn-outline-secondary" type="button" onclick="productDetail.decreaseQuantity()">
                                                <i class="fas fa-minus"></i>
                                            </button>
                                            <input type="number" class="form-control text-center" id="quantity" 
                                                   value="1" min="1" max="${this.product.stock}" 
                                                   onchange="productDetail.updateQuantity(this.value)">
                                            <button class="btn btn-outline-secondary" type="button" onclick="productDetail.increaseQuantity()">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="col">
                                        <button class="btn btn-primary btn-lg" onclick="productDetail.addToCart()">
                                            <i class="fas fa-shopping-cart me-2"></i>Ajouter au panier
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ` : ''}

                        <!-- Actions supplémentaires -->
                        <div class="product-actions mb-4">
                            <button class="btn btn-outline-danger me-2" onclick="productDetail.addToWishlist()">
                                <i class="fas fa-heart me-1"></i>Ajouter aux favoris
                            </button>
                            <button class="btn btn-outline-info" onclick="productDetail.addToCompare()">
                                <i class="fas fa-balance-scale me-1"></i>Comparer
                            </button>
                        </div>

                        <!-- Informations de livraison -->
                        <div class="shipping-info bg-light p-3 rounded">
                            <h6 class="fw-bold mb-2">
                                <i class="fas fa-truck me-2"></i>Informations de livraison
                            </h6>
                            <ul class="list-unstyled mb-0">
                                <li><i class="fas fa-check text-success me-2"></i>Livraison gratuite à partir de 500 MAD</li>
                                <li><i class="fas fa-clock text-info me-2"></i>Livraison sous 2-5 jours ouvrés</li>
                                <li><i class="fas fa-shield-alt text-warning me-2"></i>Garantie constructeur</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Onglets de détails -->
            <div class="product-details mt-5">
                <ul class="nav nav-tabs" id="productTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="description-tab" data-bs-toggle="tab" 
                                data-bs-target="#description" type="button" role="tab">
                            Description
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="specifications-tab" data-bs-toggle="tab" 
                                data-bs-target="#specifications" type="button" role="tab">
                            Caractéristiques
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="delivery-tab" data-bs-toggle="tab" 
                                data-bs-target="#delivery" type="button" role="tab">
                            Livraison & Retours
                        </button>
                    </li>
                </ul>
                
                <div class="tab-content" id="productTabsContent">
                    <!-- Description -->
                    <div class="tab-pane fade show active" id="description" role="tabpanel">
                        <div class="p-4">
                            ${this.product.description ? 
                                `<div class="product-description">${this.product.description.replace(/\n/g, '<br>')}</div>` :
                                '<p class="text-muted">Aucune description disponible pour ce produit.</p>'
                            }
                        </div>
                    </div>
                    
                    <!-- Caractéristiques -->
                    <div class="tab-pane fade" id="specifications" role="tabpanel">
                        <div class="p-4">
                            <div class="product-specs">
                                <table class="table table-striped">
                                    <tbody>
                                        ${this.product.sku ? `<tr><th>Référence</th><td>${this.product.sku}</td></tr>` : ''}
                                        ${this.product.weight ? `<tr><th>Poids</th><td>${this.product.weight} kg</td></tr>` : ''}
                                        ${this.product.dimensions ? `<tr><th>Dimensions</th><td>${this.product.dimensions}</td></tr>` : ''}
                                        <tr><th>Stock disponible</th><td>${this.product.stock}</td></tr>
                                        <tr><th>Catégorie</th><td>${this.product.category_name || 'Non classé'}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Livraison & Retours -->
                    <div class="tab-pane fade" id="delivery" role="tabpanel">
                        <div class="p-4">
                            <h5>Livraison</h5>
                            <ul>
                                <li>Livraison gratuite pour les commandes de plus de 500 MAD</li>
                                <li>Frais de livraison: 50 MAD pour les commandes inférieures à 500 MAD</li>
                                <li>Délai de livraison: 2-5 jours ouvrés</li>
                                <li>Livraison dans tout le Maroc</li>
                            </ul>
                            
                            <h5 class="mt-4">Retours</h5>
                            <ul>
                                <li>Retour gratuit sous 14 jours</li>
                                <li>Produit dans son emballage d'origine</li>
                                <li>Remboursement sous 7 jours après réception du retour</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    // Change l'image principale
    changeMainImage(src) {
        const mainImage = document.getElementById('main-product-image');
        if (mainImage) {
            mainImage.src = src;
        }

        // Mettre à jour les classes active des thumbnails
        document.querySelectorAll('.product-gallery-thumb').forEach(thumb => {
            thumb.classList.remove('active');
        });
        event.target.classList.add('active');
    }

    // Gestion de la quantité
    updateQuantity(value) {
        const quantity = parseInt(value);
        if (quantity >= 1 && quantity <= this.product.stock) {
            this.selectedQuantity = quantity;
        } else {
            document.getElementById('quantity').value = this.selectedQuantity;
        }
    }

    increaseQuantity() {
        if (this.selectedQuantity < this.product.stock) {
            this.selectedQuantity++;
            document.getElementById('quantity').value = this.selectedQuantity;
        }
    }

    decreaseQuantity() {
        if (this.selectedQuantity > 1) {
            this.selectedQuantity--;
            document.getElementById('quantity').value = this.selectedQuantity;
        }
    }

    // Ajouter au panier
    addToCart() {
        if (window.cart) {
            window.cart.addItem(this.product.id, this.selectedQuantity);
        }
    }

    // Ajouter aux favoris (simulation)
    addToWishlist() {
        this.showNotification('Produit ajouté aux favoris !', 'success');
    }

    // Ajouter à la comparaison (simulation)
    addToCompare() {
        this.showNotification('Produit ajouté à la comparaison !', 'info');
    }

    // Met à jour le breadcrumb
    updateBreadcrumb() {
        const breadcrumbProduct = document.getElementById('breadcrumb-product');
        if (breadcrumbProduct && this.product) {
            breadcrumbProduct.textContent = this.product.name;
        }
    }

    // Met à jour le titre de la page
    updatePageTitle() {
        if (this.product) {
            document.title = `${this.product.name} - RenovSouk`;
        }
    }

    // Charge les produits similaires
    async loadRelatedProducts() {
		if (!this.product || !this.product.category_slug) {
			console.warn("Impossible de charger les produits similaires : category_slug manquant.");
			return;
		}
        try {
            //const response = await fetch(`${this.apiBaseUrl}/api/products?category=${this.product.category_name}&per_page=4`);
			const response = await fetch(`${this.apiBaseUrl}/api/products?category=${this.product.category_slug}&per_page=5`);
            if (!response.ok) return;

            const data = await response.json();
            const relatedProducts = data.products.filter(p => p.id !== this.product.id).slice(0, 4);
			
            if (relatedProducts.length > 0) {
                this.renderRelatedProducts(relatedProducts);
                document.getElementById('related-products-section').style.display = 'block';
            }

        } catch (error) {
            console.error('Erreur lors du chargement des produits similaires:', error);
        }
    }

    // Affiche les produits similaires
    renderRelatedProducts(products) {
        const container = document.getElementById('related-products-container');
        if (!container) return;

        const html = products.map(product => {
            const imageUrl = (product.image_url && product.image_url.startsWith('/static/')) 
                ? `${this.apiBaseUrl}${product.image_url}` 
                : (product.image_url || '../assets/images/placeholder.jpg');

            return `
                <div class="col-lg-3 col-md-6 mb-4">
                    <div class="card h-100">
                        <img src="${imageUrl}" class="card-img-top" alt="${product.name}" 
                             style="height: 200px; object-fit: cover;"
                             onerror="this.onerror=null;this.src='../assets/images/placeholder.jpg';">
                        <div class="card-body d-flex flex-column">
                            <h6 class="card-title">${this.toTitleCase(product.name)}</h6>
                            <div class="price-section mt-auto">
                                <span class="text-primary fw-bold">${product.price.toFixed(2)} MAD</span>
                            </div>
                            <a href="produit.html?id=${product.id}" class="btn btn-primary btn-sm mt-2">
                                Voir le détail
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    // Affiche une erreur
    showError(message) {
        const container = document.getElementById('product-detail-container');
        if (!container) return;

        container.innerHTML = `
            <div class="row">
                <div class="col-12 text-center py-5">
                    <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                    <h3>Erreur</h3>
                    <p class="text-muted">${message}</p>
                    <a href="boutique.html" class="btn btn-primary">Retour à la boutique</a>
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
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }
}

// Initialiser la page produit
let productDetail;
document.addEventListener('DOMContentLoaded', () => {
    productDetail = new ProductDetailManager();
});

