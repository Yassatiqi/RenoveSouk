// Fichier: frontend/admin/js/admin.js (Version Complète & Corrigée)

class AdminPanel {
    constructor() {
        this.apiBaseUrl = 'http://localhost:5001';
        this.products = [];
        this.categories = [];
        this.stats = {};
        this.currentSection = 'dashboard';
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        // Démarrer sur la section produits pour se concentrer sur le CRUD
        this.showSection('products'); 
    }

    // Configure les écouteurs d'événements
    setupEventListeners() {
        // Navigation dans la sidebar
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('.nav-link').dataset.section;
                if (section) this.showSection(section);
            });
        });

        // Utiliser la délégation d'événements pour les boutons d'action (plus robuste)
        document.getElementById('content-area').addEventListener('click', (e) => {
			const button = e.target.closest('button');
			if (!button) return;

            if (button.classList.contains('btn-add-product')) {
                this.showProductModal(); // Pas d'ID = mode ajout
            }
            if (button.classList.contains('btn-edit')) {
                const productId = button.dataset.id;
                this.showProductModal(productId);
            }
            if (button.classList.contains('btn-delete')) {
                const productId = button.dataset.id;
                this.deleteProduct(productId);
            }
			if (button.classList.contains('btn-toggle-status')) {
				const productId = button.dataset.id;
				this.toggleProductStatus(productId);
			}
        });
    }
    
    // Affiche une section
    async showSection(section) {
        this.currentSection = section;
        
        document.querySelectorAll('.sidebar .nav-link').forEach(link => link.classList.remove('active'));
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        
        const titles = {
            dashboard: 'Tableau de bord',
            orders: 'Gestion des commandes',
            products: 'Gestion des produits',
            categories: 'Gestion des catégories',
        };
        document.getElementById('page-title').textContent = titles[section] || 'Section';
        
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';
        
        try {
            switch (section) {
                case 'products':
                    await this.loadProducts();
                    break;
                default:
                    contentArea.innerHTML = `<div class="alert alert-info">Section "${section}" non encore implémentée.</div>`;
            }
        } catch (error) {
            console.error(`Erreur lors du chargement de la section ${section}:`, error);
            contentArea.innerHTML = '<div class="alert alert-danger">Erreur de chargement du contenu.</div>';
        }
    }

    // --- LOGIQUE SPÉCIFIQUE AUX PRODUITS ---

    async loadProducts() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/admin/products`); 

			if (!response.ok) throw new Error('Réponse réseau non OK');
			const data = await response.json();

			if(data.success) {
				this.products = data.products || [];
			} else {
				this.products = [];
				console.error("Erreur de l'API admin:", data.message);
			}
			this.renderProductsList();
		} catch (error) {
            console.error('Erreur chargement produits:', error);
            document.getElementById('content-area').innerHTML = '<div class="alert alert-danger">Erreur de chargement des produits.</div>';
        }
    }
    
    // Remplacez toute la fonction renderProductsList dans admin.js par celle-ci

renderProductsList() {
    const contentArea = document.getElementById('content-area');
    
    const tableRows = this.products.map(p => {
        const imageUrl = p.image_url ? `${this.apiBaseUrl}${p.image_url}` : '../assets/images/placeholder.jpg';
        
        // Logique pour le bouton de bascule
        const toggleButton = `
            <button 
                class="btn btn-sm btn-toggle-status ${p.is_active ? 'btn-outline-success' : 'btn-outline-secondary'}" 
                data-id="${p.id}" 
                title="${p.is_active ? 'Désactiver' : 'Activer'}">
                <i class="fas ${p.is_active ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
            </button>
        `;

        // CORRECTION APPLIQUÉE ICI
        return `
            <tr class="${!p.is_active ? 'table-secondary text-muted' : ''}">
                <td>
                    <div style="width: 60px; height: 60px; overflow: hidden; border-radius: 4px; background-color: #f8f9fa;">
                        <img src="${imageUrl}" 
                             alt="${p.name}" 
                             style="width: 100%; height: 100%; object-fit: cover;" 
                             onerror="this.src='../assets/images/placeholder.jpg'">
                    </div>
                </td>
                <td><strong>${p.name}</strong></td>
                <td>${p.category_name || 'N/A'}</td>
                <td>${p.price.toFixed(2)} MAD</td>
                <td>${p.stock}</td>
                <td>
                    <span class="badge bg-${p.is_active ? 'success' : 'secondary'}">
                        ${p.is_active ? 'Actif' : 'Inactif'}
                    </span>
                </td>
                <td>
                    <div class="btn-group">
                        ${toggleButton}
                        <button class="btn btn-sm btn-primary btn-edit" data-id="${p.id}" title="Modifier"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger btn-delete" data-id="${p.id}" title="Supprimer"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    contentArea.innerHTML = `
        <div class="table-container p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold mb-0">Gestion des Produits</h5>
                <button class="btn btn-success btn-add-product"><i class="fas fa-plus me-1"></i>Ajouter un produit</button>
            </div>
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr><th>Image</th><th>Nom</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>Statut</th><th>Actions</th></tr>
                    </thead>
                    <tbody>${tableRows.length > 0 ? tableRows : '<tr><td colspan="7" class="text-center text-muted py-4">Aucun produit trouvé.</td></tr>'}</tbody>
                </table>
            </div>
        </div>
    `;
}

    async showProductModal(productId = null) {
        const isEditMode = productId !== null;
        const product = isEditMode ? this.products.find(p => p.id == productId) : {};

        if (this.categories.length === 0) {
            try {
                const catResponse = await fetch(`${this.apiBaseUrl}/api/categories`);
                this.categories = await catResponse.json();
            } catch (e) { console.error("Erreur chargement catégories:", e); }
        }

        const categoryOptions = this.categories.map(c => 
            `<option value="${c.id}" ${product && product.category_id == c.id ? 'selected' : ''}>${c.name}</option>`
        ).join('');

        const modalHTML = `
            <div class="modal fade" id="productModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${isEditMode ? 'Modifier le Produit' : 'Ajouter un Produit'}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="productForm" enctype="multipart/form-data">
                                <input type="hidden" name="product_id" value="${product.id || ''}">
                                <div class="row">
                                    <div class="col-md-8 mb-3">
                                        <label for="name" class="form-label">Nom *</label>
                                        <input type="text" class="form-control" name="name" value="${product.name || ''}" required>
                                        <label for="description" class="form-label mt-3">Description</label>
                                        <textarea class="form-control" name="description" rows="8">${product.description || ''}</textarea>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label for="category_id" class="form-label">Catégorie *</label>
                                            <select class="form-select" name="category_id" required><option value="">Sélectionner...</option>${categoryOptions}</select>
                                        </div>
                                        <div class="mb-3">
                                            <label for="price" class="form-label">Prix *</label>
                                            <input type="number" step="0.01" class="form-control" name="price" value="${product.price || ''}" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="stock" class="form-label">Stock *</label>
                                            <input type="number" class="form-control" name="stock" value="${product.stock || ''}" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="image" class="form-label">Image</label>
                                            <input type="file" class="form-control" name="image" accept="image/*">
                                            ${isEditMode && product.image_url ? `<img src="${this.apiBaseUrl}${product.image_url}" class="img-thumbnail mt-2" width="100">` : ''}
                                        </div>
                                    </div>
                                </div>
                                <hr>
                                <div class="form-check form-switch mb-2">
                                    <input class="form-check-input" type="checkbox" name="is_active" ${!isEditMode || product.is_active ? 'checked' : ''}>
                                    <label class="form-check-label">Actif</label>
                                </div>
                                <div class="form-check form-switch mb-2">
                                    <input class="form-check-input" type="checkbox" name="is_featured" ${product.is_featured ? 'checked' : ''}>
                                    <label class="form-check-label">En vedette</label>
                                </div>
                                <div class="form-check form-switch mb-2">
                                    <input class="form-check-input" type="checkbox" name="is_on_sale" ${product.is_on_sale ? 'checked' : ''}>
                                    <label class="form-check-label">En promotion</label>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                            <button type="submit" form="productForm" class="btn btn-primary">Sauvegarder</button>
                        </div>
                    </div>
                </div>
            </div>`;
        
        const oldModal = document.getElementById('productModal');
        if (oldModal) oldModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modalElement = document.getElementById('productModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();

        modalElement.addEventListener('hidden.bs.modal', () => modalElement.remove());

        document.getElementById('productForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveProduct(e.target, isEditMode);
            modal.hide();
        });
    }

    async saveProduct(form, isEditMode) {
        const formData = new FormData(form);
        const productId = formData.get('product_id');
        const url = isEditMode 
            ? `${this.apiBaseUrl}/api/admin/products/${productId}`
            : `${this.apiBaseUrl}/api/admin/products`;
        const method = isEditMode ? 'PUT' : 'POST';
        
        try {
            const response = await fetch(url, { method: method, body: formData });
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(result.message, 'success');
                await this.loadProducts();
            } else {
                throw new Error(result.message || 'Erreur inconnue lors de la sauvegarde.');
            }
        } catch (error) {
            this.showNotification(`Erreur: ${error.message}`, 'danger');
        }
    }

    async deleteProduct(productId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/admin/products/${productId}`, { method: 'DELETE' });
            const result = await response.json();

            if (result.success) {
                this.showNotification(result.message, 'success');
                await this.loadProducts();
            } else {
                throw new Error(result.message || 'Erreur inconnue lors de la suppression.');
            }
        } catch (error) {
            this.showNotification(`Erreur: ${error.message}`, 'danger');
        }
    }
	
	async toggleProductStatus(productId) {
		try {
			const response = await fetch(`${this.apiBaseUrl}/api/admin/products/${productId}/toggle-status`, { 
				method: 'PATCH' 
			});
			const result = await response.json();

			if (result.success) {
				// Mettre à jour le produit localement sans recharger toute la liste
				const index = this.products.findIndex(p => p.id == productId);
				if (index !== -1) {
					this.products[index] = result.product;
					this.renderProductsList(); // Redessiner la liste avec les nouvelles données
				}
				this.showNotification(result.message, 'success');
			} else {
				throw new Error(result.message);
			}
		} catch (error) {
			this.showNotification(`Erreur: ${error.message}`, 'danger');
		}
	}

    // Affiche une notification
    showNotification(message, type = 'success') {
        const alertContainer = document.createElement('div');
        alertContainer.style.position = 'fixed';
        alertContainer.style.top = '20px';
        alertContainer.style.right = '20px';
        alertContainer.style.zIndex = '9999';
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;
        document.body.append(alertContainer);
        setTimeout(() => alertContainer.remove(), 5000);
    }
}

// Initialiser le panel d'administration
document.addEventListener('DOMContentLoaded', () => {
    new AdminPanel();
});