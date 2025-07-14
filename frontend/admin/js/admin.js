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
        this.showSection('dashboard'); 
    }
	
	async loadDashboard() {
		try {
			// Appel à la nouvelle route API
			const statsResponse = await fetch(`${this.apiBaseUrl}/api/admin/stats`);
			const stats = await statsResponse.json();

			// Appel pour les commandes et produits récents
			const ordersResponse = await fetch(`${this.apiBaseUrl}/api/admin/orders?status=pending`);
			const ordersData = await ordersResponse.json();
			const recentOrders = ordersData.success ? ordersData.orders.slice(0, 5) : [];

			const productsResponse = await fetch(`${this.apiBaseUrl}/api/admin/products`);
			const productsData = await productsResponse.json();
			const recentProducts = productsData.success ? productsData.products.slice(0, 5) : [];

			this.renderDashboard(stats, recentOrders, recentProducts);

		} catch (error) {
			console.error('Erreur chargement dashboard:', error);
			document.getElementById('content-area').innerHTML = '<div class="alert alert-danger">Erreur de chargement du tableau de bord.</div>';
		}
	}
	renderDashboard(stats, recentOrders, recentProducts) {
		const contentArea = document.getElementById('content-area');
		
		const recentOrdersHTML = recentOrders.map(o => `
			<tr>
				<td><a href="#" class="fw-bold" onclick="event.preventDefault(); adminPanel.showOrderDetailsModal(${JSON.stringify(o).replace(/"/g, '"')})">${o.order_number}</a></td>
				<td>${o.shipping_first_name} ${o.shipping_last_name}</td>
				<td>${o.total_amount.toFixed(2)} MAD</td>
				<td><span class="badge bg-warning">${o.status}</span></td>
			</tr>
		`).join('');

		const recentProductsHTML = recentProducts.map(p => `
			 <tr>
				<td>${p.id}</td>
				<td>${p.name}</td>
				<td>${p.price.toFixed(2)} MAD</td>
				<td><span class="badge bg-${p.is_active ? 'success' : 'secondary'}">${p.is_active ? 'Actif' : 'Inactif'}</span></td>
			</tr>
		`).join('');
		
		contentArea.innerHTML = `
			<!-- Cartes de statistiques -->
			<div class="row g-4 mb-4">
				<div class="col-md-3">
					<div class="card stats-card h-100">
						<div class="card-body d-flex justify-content-between align-items-center">
							<div>
								<h6 class="card-subtitle mb-2 text-white-50">Total Commandes</h6>
								<h2 class="card-title fw-bold">${stats.orders_count || 0}</h2>
							</div>
							<i class="fas fa-shopping-cart fa-3x opacity-50"></i>
						</div>
					</div>
				</div>
				<div class="col-md-3">
					 <div class="card stats-card h-100" style="background: linear-gradient(135deg, #27ae60, #2ecc71);">
						<div class="card-body d-flex justify-content-between align-items-center">
							<div>
								<h6 class="card-subtitle mb-2 text-white-50">Total Produits</h6>
								<h2 class="card-title fw-bold">${stats.products_count || 0}</h2>
							</div>
							<i class="fas fa-box fa-3x opacity-50"></i>
						</div>
					</div>
				</div>
				<div class="col-md-3">
					<div class="card stats-card h-100" style="background: linear-gradient(135deg, #e67e22, #f39c12);">
						<div class="card-body d-flex justify-content-between align-items-center">
							<div>
								<h6 class="card-subtitle mb-2 text-white-50">Chiffre d'Affaires</h6>
								<h2 class="card-title fw-bold">${(stats.total_revenue || 0).toFixed(2)}</h2>
								<small class="text-white-50">MAD</small>
							</div>
							<i class="fas fa-dollar-sign fa-3x opacity-50"></i>
						</div>
					</div>
				</div>
				<div class="col-md-3">
					<div class="card stats-card h-100" style="background: linear-gradient(135deg, #e74c3c, #c0392b);">
						 <div class="card-body d-flex justify-content-between align-items-center">
							<div>
								<h6 class="card-subtitle mb-2 text-white-50">Clients</h6>
								<h2 class="card-title fw-bold">${stats.users_count || 0}</h2>
							</div>
							<i class="fas fa-users fa-3x opacity-50"></i>
						</div>
					</div>
				</div>
			</div>

			<!-- Tableaux récents -->
			<div class="row g-4">
				<div class="col-lg-7">
					<div class="table-container p-4">
						<h5 class="fw-bold mb-3">Commandes en attente</h5>
						<div class="table-responsive">
							<table class="table table-hover">
								<thead><tr><th>N°</th><th>Client</th><th>Total</th><th>Statut</th></tr></thead>
								<tbody>${recentOrdersHTML || '<tr><td colspan="4" class="text-center">Aucune commande en attente.</td></tr>'}</tbody>
							</table>
						</div>
					</div>
				</div>
				<div class="col-lg-5">
					<div class="table-container p-4">
						<h5 class="fw-bold mb-3">Produits Récents</h5>
						<div class="table-responsive">
							<table class="table table-hover">
								<thead><tr><th>ID</th><th>Nom</th><th>Prix</th><th>Statut</th></tr></thead>
								<tbody>${recentProductsHTML || '<tr><td colspan="4" class="text-center">Aucun produit.</td></tr>'}</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		`;
		// Exposer l'instance du panel pour que le onclick fonctionne
		window.adminPanel = this;
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

		const contentArea = document.getElementById('content-area');
		if (!contentArea) return; // Sécurité au cas où l'élément n'existerait pas

		// 1. ÉCOUTEUR POUR LES "CLICS" (votre code original)
		contentArea.addEventListener('click', (e) => {
			const button = e.target.closest('button');
			if (!button) return;

			if (button.classList.contains('btn-add-product')) {
				this.showProductModal();
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
			if (button.classList.contains('btn-view-order')) {
				const orderId = button.dataset.orderId;
				const order = this.orders.find(o => o.id == orderId);
				if (order) {
					this.showOrderDetailsModal(order);
				}
			}
			if (button.classList.contains('btn-filter-order')) {
				const status = button.dataset.status;
				// On appelle loadOrders avec le statut sur lequel on a cliqué
				this.loadOrders(status);
			}
			if (button.classList.contains('btn-add-category')) {
				this.showCategoryModal();
			}
			if (button.classList.contains('btn-edit-category')) {
				const categoryId = button.dataset.id;
				this.showCategoryModal(categoryId);
			}
			if (button.classList.contains('btn-delete-category')) {
				const categoryId = button.dataset.id;
				this.deleteCategory(categoryId);
			}
		});

		// 2. ÉCOUTEUR POUR LES "CHANGEMENTS" (ajouté pour les menus de statut)
		contentArea.addEventListener('change', (e) => {
			// On cible spécifiquement les éléments <select> qui ont la classe 'status-select'
			if (e.target.tagName === 'SELECT' && e.target.classList.contains('status-select')) {
				const orderId = e.target.dataset.orderId;
				const newStatus = e.target.value;
				this.updateOrderStatus(orderId, newStatus);
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
				case 'dashboard':
					await this.loadDashboard();
					break;
                case 'products':
                    await this.loadProducts();
                    break;
				case 'orders':
					await this.loadOrders();
					break;
				case 'categories':
					await this.loadCategories();
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
											<label for="price" class="form-label">Prix de Vente (MAD) *</label>
											<input type="number" step="0.01" class="form-control" name="price" value="${product.price || ''}" required>
										</div>
										
										<!-- Champ "Prix Original" ajouté ici -->
										<div class="mb-3" id="originalPriceContainer" style="display: ${product.is_on_sale ? 'block' : 'none'};">
											<label for="original_price" class="form-label">Prix Original (barré)</label>
											<input type="number" step="0.01" class="form-control" name="original_price" value="${product.original_price || ''}">
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
									<input class="form-check-input" type="checkbox" name="is_active" id="is_active_switch" ${!isEditMode || product.is_active ? 'checked' : ''}>
									<label class="form-check-label">Actif</label>
								</div>
								<div class="form-check form-switch mb-2">
									<input class="form-check-input" type="checkbox" name="is_featured" ${product.is_featured ? 'checked' : ''}>
									<label class="form-check-label">En vedette</label>
								</div>
								<div class="form-check form-switch mb-2">
									<input class="form-check-input" type="checkbox" name="is_on_sale" id="is_on_sale_switch" ${product.is_on_sale ? 'checked' : ''}>
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

		// Logique pour afficher/cacher le champ de prix original
		const saleSwitch = document.getElementById('is_on_sale_switch');
		const originalPriceContainer = document.getElementById('originalPriceContainer');
		saleSwitch.addEventListener('change', (e) => {
			originalPriceContainer.style.display = e.target.checked ? 'block' : 'none';
		});

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

	
	async loadOrders(status = '') {
		try {
			// Construire l'URL avec le filtre si nécessaire
			let url = `${this.apiBaseUrl}/api/admin/orders`;
			if (status) {
				url += `?status=${status}`;
			}

			const response = await fetch(url);
			if (!response.ok) throw new Error('Réponse du serveur non valide');

			const data = await response.json();
			if (data.success) {
				this.orders = data.orders || []; 
				this.renderOrdersList(this.orders);
			} else {
				throw new Error(data.message);
			}
		} catch (error) {
			console.error('Erreur chargement commandes:', error);
			document.getElementById('content-area').innerHTML = `<div class="alert alert-danger">Erreur de chargement des commandes.</div>`;
		}
	}

	renderOrdersList(orders) {
		const contentArea = document.getElementById('content-area');

		// La logique pour créer les lignes du tableau (tableRows) reste exactement la même
		const tableRows = orders.map(order => {
			const orderDate = new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
			const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
			const statusOptions = statuses.map(s => 
				`<option value="${s}" ${order.status === s ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`
			).join('');

			return `
				<tr>
					<td><strong>${order.order_number}</strong></td>
					<td>${order.shipping_first_name} ${order.shipping_last_name}</td>
					<td>${order.total_amount.toFixed(2)} MAD</td>
					<td>
						<select class="form-select form-select-sm status-select" data-order-id="${order.id}">
							${statusOptions}
						</select>
					</td>
					<td>${orderDate}</td>
					<td><button class="btn btn-sm btn-outline-primary btn-view-order" data-order-id="${order.id}"><i class="fas fa-eye me-1"></i>Détails</button></td>
				</tr>
			`;
		}).join('');

		// ** CORRECTION APPLIQUÉE ICI : On ajoute le bloc de boutons de filtre **
		const filterButtonsHTML = `
			<div class="mb-3">
				<div class="btn-group" role="group" aria-label="Filtres de statut">
					<button type="button" class="btn btn-secondary btn-filter-order" data-status="">Toutes</button>
					<button type="button" class="btn btn-warning btn-filter-order" data-status="pending">En attente</button>
					<button type="button" class="btn btn-info btn-filter-order" data-status="confirmed">Confirmées</button>
					<button type="button" class="btn btn-primary btn-filter-order" data-status="shipped">Expédiées</button>
					<button type="button" class="btn btn-success btn-filter-order" data-status="delivered">Livrées</button>
					<button type="button" class="btn btn-danger btn-filter-order" data-status="cancelled">Annulées</button>
				</div>
			</div>
		`;

		// On injecte le code HTML final avec les filtres
		contentArea.innerHTML = `
			<div class="table-container p-4">
				<h5 class="fw-bold mb-3">Gestion des Commandes</h5>
				
				<!-- On insère les boutons de filtre juste ici -->
				${filterButtonsHTML}
				
				<div class="table-responsive">
					<table class="table table-hover">
						<thead>
							<tr>
								<th>N° Commande</th>
								<th>Client</th>
								<th>Total</th>
								<th>Statut</th>
								<th>Date</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							${tableRows.length > 0 ? tableRows : '<tr><td colspan="6" class="text-center text-muted py-4">Aucune commande trouvée.</td></tr>'}
						</tbody>
					</table>
				</div>
			</div>
		`;
	}
	
	showOrderDetailsModal(order) {
		const orderDate = new Date(order.created_at).toLocaleString('fr-FR');
		const itemsHTML = order.items.map(item => `
			<tr>
				<td>${item.product_name}</td>
				<td>${item.quantity}</td>
				<td>${item.unit_price.toFixed(2)} MAD</td>
				<td class="text-end">${item.total_price.toFixed(2)} MAD</td>
			</tr>
		`).join('');

		const modalHTML = `
			<div class="modal fade" id="orderDetailsModal" tabindex="-1">
			  <div class="modal-dialog modal-xl">
				<div class="modal-content">
				  <div class="modal-header">
					<h5 class="modal-title">Détails de la commande: ${order.order_number}</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
				  </div>
				  <div class="modal-body">
					<div class="row">
						<div class="col-md-6">
							<h6>Informations Client</h6>
							<p>
								<strong>${order.shipping_first_name} ${order.shipping_last_name}</strong><br>
								${order.shipping_address}<br>
								${order.shipping_city}, ${order.shipping_postal_code}<br>
								Email: ${order.shipping_email}<br>
								Tél: ${order.shipping_phone}
							</p>
						</div>
						<div class="col-md-6">
							<h6>Informations Commande</h6>
							<p>
								<strong>Date:</strong> ${orderDate}<br>
								<strong>Statut:</strong> <span class="badge bg-warning">${order.status}</span><br>
								<strong>Paiement:</strong> ${order.payment_method}
							</p>
						</div>
					</div>
					<hr>
					<h6>Articles Commandés</h6>
					<div class="table-responsive">
						<table class="table table-sm">
							<thead><tr><th>Produit</th><th>Qté</th><th>Prix Unit.</th><th class="text-end">Total</th></tr></thead>
							<tbody>${itemsHTML}</tbody>
						</table>
					</div>
					<hr>
					<div class="row justify-content-end text-end">
						<div class="col-md-4">
							<p>Sous-total: <strong>${order.subtotal.toFixed(2)} MAD</strong></p>
							<p>Livraison: <strong>${order.shipping_cost.toFixed(2)} MAD</strong></p>
							<h5>Total: <strong>${order.total_amount.toFixed(2)} MAD</strong></h5>
						</div>
					</div>
				  </div>
				</div>
			  </div>
			</div>
		`;

		const oldModal = document.getElementById('orderDetailsModal');
		if (oldModal) oldModal.remove();
		document.body.insertAdjacentHTML('beforeend', modalHTML);
		const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
		modal.show();
	}
    
	async updateOrderStatus(orderId, newStatus) {
		try {
			const response = await fetch(`${this.apiBaseUrl}/api/admin/orders/${orderId}/status`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ status: newStatus }),
			});

			const result = await response.json();

			if (result.success) {
				this.showNotification(result.message, 'success');
				// Mettre à jour les données locales et réafficher la liste
				const index = this.orders.findIndex(o => o.id == orderId);
				if (index !== -1) {
					this.orders[index].status = newStatus;
					this.renderOrdersList(this.orders);
				}
			} else {
				throw new Error(result.message);
			}
		} catch (error) {
			console.error('Erreur mise à jour statut:', error);
			this.showNotification(`Erreur: ${error.message}`, 'danger');
		}
	}
	
	// --- LOGIQUE SPÉCIFIQUE AUX CATÉGORIES ---

	async loadCategories() {
		try {
			const response = await fetch(`${this.apiBaseUrl}/api/admin/categories`);
			const data = await response.json();
			if (data.success) {
				this.categories = data.categories; // On stocke pour les modales
				this.renderCategoriesList();
			} else { throw new Error(data.message); }
		} catch (error) {
			console.error('Erreur chargement catégories:', error);
			document.getElementById('content-area').innerHTML = '<div class="alert alert-danger">Erreur de chargement des catégories.</div>';
		}
	}

	renderCategoriesList() {
		const tableRows = this.categories.map(cat => `
			<tr>
				<td><i class="${cat.icon || 'fas fa-tag'}"></i></td>
				<td><strong>${cat.name}</strong></td>
				<td><code>${cat.slug}</code></td>
				<td><span class="badge bg-info">${cat.product_count}</span></td>
				<td>
					<div class="btn-group">
						<button class="btn btn-sm btn-primary btn-edit-category" data-id="${cat.id}"><i class="fas fa-edit"></i></button>
						<button class="btn btn-sm btn-danger btn-delete-category" data-id="${cat.id}" ${cat.product_count > 0 ? 'disabled' : ''}><i class="fas fa-trash"></i></button>
					</div>
				</td>
			</tr>
		`).join('');

		document.getElementById('content-area').innerHTML = `
			<div class="table-container p-4">
				<div class="d-flex justify-content-between align-items-center mb-3">
					<h5 class="fw-bold mb-0">Gestion des Catégories</h5>
					<button class="btn btn-success btn-add-category"><i class="fas fa-plus me-1"></i>Ajouter</button>
				</div>
				<table class="table table-hover">
					<thead><tr><th>Icône</th><th>Nom</th><th>Slug</th><th>Produits</th><th>Actions</th></tr></thead>
					<tbody>${tableRows.length > 0 ? tableRows : '<tr><td colspan="5" class="text-center">Aucune catégorie.</td></tr>'}</tbody>
				</table>
			</div>
		`;
	}

	showCategoryModal(categoryId = null) {
		const isEditMode = categoryId !== null;
		const category = isEditMode ? this.categories.find(c => c.id == categoryId) : {};
		
		const modalHTML = `
			<div class="modal fade" id="categoryModal" tabindex="-1">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<h5 class="modal-title">${isEditMode ? 'Modifier' : 'Ajouter'} une Catégorie</h5>
							<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
						</div>
						<div class="modal-body">
							<form id="categoryForm">
								<div class="mb-3">
									<label for="cat-name" class="form-label">Nom de la catégorie *</label>
									<input type="text" class="form-control" id="cat-name" value="${category.name || ''}" required>
								</div>
								<div class="mb-3">
									<label for="cat-icon" class="form-label">Icône (classe Font Awesome)</label>
									<input type="text" class="form-control" id="cat-icon" value="${category.icon || 'fas fa-tag'}" placeholder="ex: fas fa-tools">
									<small class="form-text">Trouvez des icônes sur <a href="https://fontawesome.com/search?o=r&m=free" target="_blank">Font Awesome</a>.</small>
								</div>
								<div class="mb-3">
									<label for="cat-desc" class="form-label">Description</label>
									<textarea class="form-control" id="cat-desc" rows="3">${category.description || ''}</textarea>
								</div>
							</form>
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
							<button type="submit" form="categoryForm" class="btn btn-primary">Sauvegarder</button>
						</div>
					</div>
				</div>
			</div>`;

		const oldModal = document.getElementById('categoryModal');
		if (oldModal) oldModal.remove();
		document.body.insertAdjacentHTML('beforeend', modalHTML);

		const modalElement = document.getElementById('categoryModal');
		const modal = new bootstrap.Modal(modalElement);
		modal.show();
		
		document.getElementById('categoryForm').addEventListener('submit', async (e) => {
			e.preventDefault();
			await this.saveCategory(categoryId);
			modal.hide();
		});
	}

	async saveCategory(categoryId = null) {
		const isEditMode = categoryId !== null;
		const url = isEditMode 
			? `${this.apiBaseUrl}/api/admin/categories/${categoryId}`
			: `${this.apiBaseUrl}/api/admin/categories`;
		const method = isEditMode ? 'PUT' : 'POST';

		const data = {
			name: document.getElementById('cat-name').value,
			icon: document.getElementById('cat-icon').value,
			description: document.getElementById('cat-desc').value,
		};

		try {
			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});
			const result = await response.json();
			if(result.success) {
				this.showNotification(result.message, 'success');
				this.loadCategories();
			} else { throw new Error(result.message); }
		} catch(error) {
			this.showNotification(`Erreur: ${error.message}`, 'danger');
		}
	}

	async deleteCategory(categoryId) {
		if (!confirm('Voulez-vous vraiment supprimer cette catégorie ?')) return;

		try {
			const response = await fetch(`${this.apiBaseUrl}/api/admin/categories/${categoryId}`, { method: 'DELETE' });
			const result = await response.json();
			if (result.success) {
				this.showNotification(result.message, 'success');
				this.loadCategories();
			} else { throw new Error(result.message); }
		} catch(error) {
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