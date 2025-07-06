// Boutique dynamique avec pagination et filtres
// Version: 1.0

class BoutiqueManager {
    constructor() {
        this.apiBaseUrl = 'http://localhost:5001';
        this.currentPage = 1;
        this.perPage = 12;
        this.currentFilters = {};
        this.currentSort = 'name_asc';
        this.categories = [];
        
        this.init();
    }

    async init() {
        await this.loadCategories();
        this.setupEventListeners();
        this.parseUrlParams();
        await this.loadProducts();
    }

    // Charge les catégories depuis l'API
    async loadCategories() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/categories`);
            if (!response.ok) throw new Error('Erreur lors du chargement des catégories');
            
            this.categories = await response.json();
            this.renderCategoriesFilter();
        } catch (error) {
            console.error('Erreur:', error);
            this.showError('Erreur lors du chargement des catégories');
        }
    }

    // Affiche les catégories dans le filtre
    renderCategoriesFilter() {
        const container = document.getElementById('categories-filter');
        if (!container) return;

        const html = this.categories.map(category => `
            <div class="form-check">
                <input class="form-check-input category-filter" type="checkbox" 
                       id="cat-${category.slug}" value="${category.slug}">
                <label class="form-check-label" for="cat-${category.slug}">
                    <i class="${category.icon} me-2"></i>${category.name}
                    <span class="text-muted">(${category.product_count})</span>
                </label>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    // Configure les écouteurs d'événements
    setupEventListeners() {
        // Filtres de catégories
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('category-filter')) {
                this.updateCategoryFilters();
            }
        });

        // Filtre de prix
        const applyPriceBtn = document.getElementById('apply-price-filter');
        if (applyPriceBtn) {
            applyPriceBtn.addEventListener('click', () => this.updatePriceFilters());
        }

        // Autres filtres
        ['in-stock', 'on-sale', 'new-products', 'featured'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.updateFilters());
            }
        });

        // Tri
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.currentPage = 1;
                this.loadProducts();
            });
        }

        // Effacer les filtres
        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearAllFilters());
        }

        // Pagination (délégation d'événements)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-link')) {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                if (page && page !== this.currentPage) {
                    this.currentPage = page;
                    this.loadProducts();
                }
            }
        });
    }

    // Parse les paramètres URL
    parseUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Catégorie
        const category = urlParams.get('category');
        if (category) {
            this.currentFilters.category = category;
            // Cocher la catégorie correspondante
            const categoryCheckbox = document.getElementById(`cat-${category}`);
            if (categoryCheckbox) {
                categoryCheckbox.checked = true;
            }
        }

        // Recherche
        const search = urlParams.get('search');
        if (search) {
            this.currentFilters.search = search;
        }
    }

    // Met à jour les filtres de catégories
    updateCategoryFilters() {
        const checkedCategories = Array.from(document.querySelectorAll('.category-filter:checked'))
            .map(cb => cb.value);
        
        if (checkedCategories.length > 0) {
            this.currentFilters.category = checkedCategories[0]; // Pour l'instant, une seule catégorie
        } else {
            delete this.currentFilters.category;
        }

        this.currentPage = 1;
        this.loadProducts();
    }

    // Met à jour les filtres de prix
    updatePriceFilters() {
        const minPrice = document.getElementById('min-price').value;
        const maxPrice = document.getElementById('max-price').value;

        if (minPrice) {
            this.currentFilters.min_price = parseFloat(minPrice);
        } else {
            delete this.currentFilters.min_price;
        }

        if (maxPrice) {
            this.currentFilters.max_price = parseFloat(maxPrice);
        } else {
            delete this.currentFilters.max_price;
        }

        this.currentPage = 1;
        this.loadProducts();
    }

    // Met à jour les autres filtres
    updateFilters() {
        const inStock = document.getElementById('in-stock');
        const onSale = document.getElementById('on-sale');
        const newProducts = document.getElementById('new-products');
        const featured = document.getElementById('featured');

        this.currentFilters.in_stock = inStock ? inStock.checked : true;
        this.currentFilters.on_sale = onSale ? onSale.checked : false;
        this.currentFilters.is_new = newProducts ? newProducts.checked : false;
        this.currentFilters.featured = featured ? featured.checked : false;

        this.currentPage = 1;
        this.loadProducts();
    }

    // Efface tous les filtres
    clearAllFilters() {
        // Décocher toutes les cases
        document.querySelectorAll('.category-filter').forEach(cb => cb.checked = false);
        document.querySelectorAll('#in-stock, #on-sale, #new-products, #featured').forEach(cb => {
            if (cb.id === 'in-stock') {
                cb.checked = true;
            } else {
                cb.checked = false;
            }
        });

        // Vider les champs de prix
        document.getElementById('min-price').value = '';
        document.getElementById('max-price').value = '';

        // Réinitialiser les filtres
        this.currentFilters = { in_stock: true };
        this.currentPage = 1;
        this.currentSort = 'name_asc';
        document.getElementById('sort-select').value = this.currentSort;

        this.loadProducts();
    }

    // Charge les produits depuis l'API
    async loadProducts() {
        const container = document.getElementById('products-grid');
        if (!container) return;

        // Afficher le loader
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Chargement des produits...</span>
                </div>
                <p class="mt-3 text-muted">Chargement des produits...</p>
            </div>
        `;

        try {
            // Construction des paramètres
            const params = new URLSearchParams({
                page: this.currentPage,
                per_page: this.perPage,
                sort_by: this.currentSort,
                ...this.currentFilters
            });

            const response = await fetch(`${this.apiBaseUrl}/api/products?${params}`);
            if (!response.ok) throw new Error('Erreur lors du chargement des produits');

            const data = await response.json();
            this.renderProducts(data.products);
            this.renderPagination(data.pagination);
            this.updateResultsCount(data.pagination.total);

        } catch (error) {
            console.error('Erreur:', error);
            this.showError('Erreur lors du chargement des produits');
        }
    }

    // Affiche les produits
    renderProducts(products) {
        const container = document.getElementById('products-grid');
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h5>Aucun produit trouvé</h5>
                    <p class="text-muted">Essayez de modifier vos critères de recherche</p>
                </div>
            `;
            return;
        }

        const html = products.map(product => this.createProductCard(product)).join('');
        container.innerHTML = html;
    }

    // Crée une carte produit
    createProductCard(product) {
        const imageUrl = (product.image_url && product.image_url.startsWith('/static/')) 
            ? `${this.apiBaseUrl}${product.image_url}` 
            : (product.image_url || '../assets/images/placeholder.jpg');
        
        let priceHTML = `<span class="current-price text-primary fw-bold">${product.price.toFixed(2)} MAD</span>`;
        if (product.is_on_sale && product.original_price) {
            priceHTML = `
                <span class="current-price text-primary fw-bold">${product.price.toFixed(2)} MAD</span>
                <span class="original-price text-muted text-decoration-line-through ms-2">${product.original_price.toFixed(2)} MAD</span>
            `;
        }

        const badges = [];
        if (product.is_on_sale) badges.push('<span class="badge bg-danger position-absolute top-0 end-0 m-2">Promo</span>');
        if (product.is_new) badges.push('<span class="badge bg-info position-absolute top-0 start-0 m-2">Nouveau</span>');

        return `
            <div class="col-lg-4 col-md-6 col-sm-6 mb-4">
                <div class="product-card card h-100">
                    <div class="product-image position-relative">
                        <img src="${imageUrl}" class="card-img-top" alt="${product.name}" 
                             style="height: 200px; object-fit: cover;"
                             onerror="this.onerror=null;this.src='../assets/images/placeholder.jpg';">
                        ${badges.join('')}
                        <div class="product-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                            <a href="produit.html?id=${product.id}" class="btn btn-primary btn-sm me-2" title="Voir le détail">
                                <i class="fas fa-eye"></i>
                            </a>
                            <button class="btn btn-success btn-sm me-2 add-to-cart-btn" 
                                    data-product-id="${product.id}" title="Ajouter au panier">
                                <i class="fas fa-shopping-cart"></i>
                            </button>
                            <button class="btn btn-outline-secondary btn-sm" title="Ajouter aux favoris">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h6 class="card-title">${product.name}</h6>
                        <p class="card-text text-muted small">${product.short_description || ''}</p>
                        <div class="price-section mt-auto pt-2">
                            ${priceHTML}
                        </div>
                        <div class="mt-2">
                            <small class="text-muted">
                                Stock: ${product.stock > 0 ? product.stock : 'Rupture'}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Affiche la pagination
    renderPagination(pagination) {
        const container = document.getElementById('pagination');
        if (!container) return;

        if (pagination.pages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = '';

        // Bouton Précédent
        if (pagination.has_prev) {
            html += `<li class="page-item">
                <a class="page-link" href="#" data-page="${pagination.prev_num}">Précédent</a>
            </li>`;
        }

        // Numéros de pages
        const startPage = Math.max(1, pagination.page - 2);
        const endPage = Math.min(pagination.pages, pagination.page + 2);

        if (startPage > 1) {
            html += `<li class="page-item">
                <a class="page-link" href="#" data-page="1">1</a>
            </li>`;
            if (startPage > 2) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `<li class="page-item ${i === pagination.page ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>`;
        }

        if (endPage < pagination.pages) {
            if (endPage < pagination.pages - 1) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
            html += `<li class="page-item">
                <a class="page-link" href="#" data-page="${pagination.pages}">${pagination.pages}</a>
            </li>`;
        }

        // Bouton Suivant
        if (pagination.has_next) {
            html += `<li class="page-item">
                <a class="page-link" href="#" data-page="${pagination.next_num}">Suivant</a>
            </li>`;
        }

        container.innerHTML = html;
    }

    // Met à jour le compteur de résultats
    updateResultsCount(total) {
        const container = document.getElementById('results-count');
        if (!container) return;

        const start = (this.currentPage - 1) * this.perPage + 1;
        const end = Math.min(this.currentPage * this.perPage, total);

        container.textContent = `Affichage de ${start}-${end} sur ${total} produits`;
    }

    // Affiche une erreur
    showError(message) {
        const container = document.getElementById('products-grid');
        if (!container) return;

        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                <h5>Erreur</h5>
                <p class="text-muted">${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">Réessayer</button>
            </div>
        `;
    }
}

// Initialiser la boutique quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    new BoutiqueManager();
});

// Gestion des boutons "Ajouter au panier"
document.addEventListener('click', (e) => {
    if (e.target.closest('.add-to-cart-btn')) {
        e.preventDefault();
        const btn = e.target.closest('.add-to-cart-btn');
        const productId = parseInt(btn.dataset.productId);
        
        if (window.cart) {
            window.cart.addItem(productId, 1);
        }
    }
});

