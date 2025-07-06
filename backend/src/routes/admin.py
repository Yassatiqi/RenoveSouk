from flask import Blueprint, render_template_string, jsonify, request
from models.ecommerce import Product, Category, Brand, Order, User, db

admin_bp = Blueprint('admin', __name__)

# Simple admin panel HTML template
ADMIN_TEMPLATE = '''
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RenovSouk - Panel Admin</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <nav class="navbar navbar-dark bg-primary">
        <div class="container-fluid">
            <span class="navbar-brand">
                <i class="fas fa-tools me-2"></i>RenovSouk Admin
            </span>
            <span class="text-white">Version 1.0</span>
        </div>
    </nav>
    
    <div class="container-fluid">
        <div class="row">
            <nav class="col-md-2 d-md-block bg-light sidebar">
                <div class="position-sticky pt-3">
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a class="nav-link active" href="#dashboard">
                                <i class="fas fa-tachometer-alt me-2"></i>Dashboard
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#products">
                                <i class="fas fa-box me-2"></i>Produits
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#categories">
                                <i class="fas fa-tags me-2"></i>Catégories
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#orders">
                                <i class="fas fa-shopping-cart me-2"></i>Commandes
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
            
            <main class="col-md-10 ms-sm-auto px-md-4">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">Dashboard</h1>
                </div>
                
                <div id="content">
                    <div class="row">
                        <div class="col-md-3">
                            <div class="card text-white bg-primary">
                                <div class="card-body">
                                    <h5 class="card-title">Produits</h5>
                                    <h2>{{ products_count }}</h2>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card text-white bg-success">
                                <div class="card-body">
                                    <h5 class="card-title">Catégories</h5>
                                    <h2>{{ categories_count }}</h2>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card text-white bg-warning">
                                <div class="card-body">
                                    <h5 class="card-title">Commandes</h5>
                                    <h2>{{ orders_count }}</h2>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card text-white bg-info">
                                <div class="card-body">
                                    <h5 class="card-title">Utilisateurs</h5>
                                    <h2>{{ users_count }}</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        <h3>Produits Récents</h3>
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nom</th>
                                        <th>Prix</th>
                                        <th>Stock</th>
                                        <th>Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {% for product in recent_products %}
                                    <tr>
                                        <td>{{ product.id }}</td>
                                        <td>{{ product.name }}</td>
                                        <td>{{ product.price }} MAD</td>
                                        <td>{{ product.stock }}</td>
                                        <td>
                                            <span class="badge bg-{{ 'success' if product.is_active else 'secondary' }}">
                                                {{ 'Actif' if product.is_active else 'Inactif' }}
                                            </span>
                                        </td>
                                    </tr>
                                    {% endfor %}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
'''

@admin_bp.route('/')
def admin_dashboard():
    """Admin dashboard with statistics"""
    try:
        # Get statistics
        products_count = Product.query.count()
        categories_count = Category.query.count()
        orders_count = Order.query.count()
        users_count = User.query.count()
        
        # Get recent products
        recent_products = Product.query.order_by(Product.created_at.desc()).limit(5).all()
        
        return render_template_string(ADMIN_TEMPLATE, 
                                    products_count=products_count,
                                    categories_count=categories_count,
                                    orders_count=orders_count,
                                    users_count=users_count,
                                    recent_products=recent_products)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/api/stats')
def admin_stats():
    """Get admin statistics as JSON"""
    try:
        stats = {
            'products_count': Product.query.count(),
            'categories_count': Category.query.count(),
            'orders_count': Order.query.count(),
            'users_count': User.query.count(),
            'active_products': Product.query.filter_by(is_active=True).count(),
            'featured_products': Product.query.filter_by(is_featured=True).count(),
            'out_of_stock': Product.query.filter(Product.stock <= 0).count()
        }
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

