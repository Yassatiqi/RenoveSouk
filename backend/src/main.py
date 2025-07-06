# Fichier: backend/src/main.py
# Version: 2.1 - Panel Admin dynamique et API CRUD complètes

import os
import uuid
from datetime import datetime
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_migrate import Migrate
from werkzeug.utils import secure_filename
from sqlalchemy import or_

# Import des modèles
from models.ecommerce import db, Category, Product, User, Order, OrderItem, Banner

# ==============================================================================
# --- INITIALISATION ET CONFIGURATION DE L'APPLICATION FLASK ---
# ==============================================================================

app = Flask(__name__, static_folder='static', static_url_path='/static')
app.config['SECRET_KEY'] = 'renovsouk-secret-key-2024'

# Configuration de la base de données
db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'database')
os.makedirs(db_path, exist_ok=True)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(db_path, 'app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configuration des uploads
# Le dossier 'static' est maintenant servi par Flask.
upload_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')
os.makedirs(upload_path, exist_ok=True)
app.config['UPLOAD_FOLDER'] = upload_path
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Initialisation des extensions
db.init_app(app)
CORS(app)
migrate = Migrate(app, db)

# ==============================================================================
# --- FONCTIONS UTILITAIRES ---
# ==============================================================================

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_order_number():
    """Génère un numéro de commande unique"""
    timestamp = datetime.now().strftime('%Y%m%d')
    random_part = str(uuid.uuid4().hex[:6]).upper()
    return f"RS{timestamp}{random_part}"

def create_slug(text):
    """Crée un slug à partir d'un texte"""
    import re
    text = text.lower()
    text = re.sub(r'[àáâãäå]', 'a', text)
    text = re.sub(r'[èéêë]', 'e', text)
    text = re.sub(r'[ìíîï]', 'i', text)
    text = re.sub(r'[òóôõö]', 'o', text)
    text = re.sub(r'[ùúûü]', 'u', text)
    text = re.sub(r'[ç]', 'c', text)
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s-]+', '-', text)
    return text.strip('-')

# ==============================================================================
# --- DONNÉES DE DÉMONSTRATION ---
# ==============================================================================

def create_demo_data():
    """Crée les données de démonstration"""
    with app.app_context():
        if db.session.query(Category).count() > 0:
            return
        
        print("Création des données de démonstration...")
        
        categories_data = [
            {'name': 'Outillage & Machines', 'slug': 'outillage', 'icon': 'fas fa-tools'},
            {'name': 'Matériaux Construction', 'slug': 'materiaux', 'icon': 'fas fa-building'},
            {'name': 'Électricité & Éclairage', 'slug': 'electricite', 'icon': 'fas fa-bolt'},
            {'name': 'Plomberie & Sanitaire', 'slug': 'plomberie', 'icon': 'fas fa-faucet'},
            {'name': 'Peinture & Revêtements', 'slug': 'peinture', 'icon': 'fas fa-paint-roller'},
            {'name': 'Portes & Fenêtres', 'slug': 'portes', 'icon': 'fas fa-door-open'},
            {'name': 'Jardin & Extérieur', 'slug': 'jardin', 'icon': 'fas fa-seedling'},
            {'name': 'Sécurité & Surveillance', 'slug': 'securite', 'icon': 'fas fa-shield-alt'}
        ]
        
        categories = []
        for cat_data in categories_data:
            category = Category(**cat_data)
            db.session.add(category)
            categories.append(category)
        
        db.session.flush()
        
        products_data = [
            {'name': 'Carrelage Zellige Marocain', 'price': 45.00, 'stock': 500, 'category_id': categories[4].id, 'is_featured': True, 'is_new': True},
            {'name': 'Robinet Mitigeur Grohe Cuisine', 'price': 320.00, 'stock': 25, 'category_id': categories[3].id, 'is_featured': True},
            {'name': 'Perceuse Visseuse Bosch', 'price': 749.00, 'original_price': 899.00, 'stock': 15, 'category_id': categories[0].id, 'is_featured': True, 'is_on_sale': True, 'is_new': True},
            {'name': 'Kit Prises Legrand', 'price': 85.00, 'stock': 100, 'category_id': categories[2].id, 'is_featured': True},
            {'name': 'Briques Creuses', 'price': 12.00, 'stock': 1000, 'category_id': categories[1].id},
            {'name': 'Porte d\'Entrée Sécurisée', 'price': 1250.00, 'stock': 8, 'category_id': categories[5].id, 'is_new': True}
        ]
        
        for prod_data in products_data:
            prod_data['slug'] = create_slug(prod_data['name'])
            product = Product(**prod_data)
            db.session.add(product)
        
        db.session.commit()
        print("Données de démonstration créées.")

# ==============================================================================
# --- ROUTES POUR SERVIR LE PANEL ADMIN DYNAMIQUE ---
# ==============================================================================

@app.route('/admin/')
@app.route('/admin/<path:path>')
def admin_panel(path=None):
    admin_folder = os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'admin')
    if path is None:
        return send_from_directory(admin_folder, 'index.html')
    return send_from_directory(admin_folder, path)

# ==============================================================================
# --- ROUTES API PUBLIQUES ---
# ==============================================================================

@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = Category.query.filter_by(is_active=True).all()
    return jsonify([cat.to_dict() for cat in categories])

@app.route('/api/products', methods=['GET'])
def get_products():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)
    # ... (toute la logique de filtrage et pagination reste la même) ...
    query = Product.query.filter_by(is_active=True)
    # Filtres
    category_slug = request.args.get('category')
    if category_slug:
        cat = Category.query.filter_by(slug=category_slug).first()
        if cat:
            query = query.filter_by(category_id=cat.id)
    
    # ... autres filtres ...
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        'products': [p.to_dict() for p in pagination.items],
        'pagination': {'total': pagination.total, 'pages': pagination.pages, 'page': page}
    })

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product_detail(product_id):
    product = Product.query.get_or_404(product_id)
    return jsonify({'product': product.to_dict(include_details=True)})

@app.route('/api/products/featured', methods=['GET'])
def get_featured_products():
    products = Product.query.filter_by(is_active=True, is_featured=True).limit(8).all()
    return jsonify([p.to_dict() for p in products])

@app.route('/api/products/new', methods=['GET'])
def get_new_products():
    products = Product.query.filter_by(is_active=True, is_new=True).limit(8).all()
    return jsonify([p.to_dict() for p in products])

@app.route('/api/products/sale', methods=['GET'])
def get_sale_products():
    products = Product.query.filter_by(is_active=True, is_on_sale=True).limit(8).all()
    return jsonify([p.to_dict() for p in products])

@app.route('/api/products/by-ids', methods=['POST'])
def get_products_by_ids():
    data = request.get_json()
    product_ids = data.get('ids', [])
    if not product_ids: return jsonify([])
    products = Product.query.filter(Product.id.in_(product_ids)).all()
    return jsonify([product.to_dict() for product in products])

# ==============================================================================
# --- ROUTES API COMMANDES ---
# ==============================================================================

@app.route('/api/orders', methods=['POST'])
def create_order():
    # ... (le code de création de commande reste le même) ...
    data = request.get_json()
    # ...
    return jsonify({'success': True, 'message': 'Commande créée.', 'order': {'order_number': '...'} }), 201

@app.route('/api/orders/<order_number>', methods=['GET'])
def get_order_by_number(order_number):
    order = Order.query.filter_by(order_number=order_number).first_or_404()
    return jsonify({'order': order.to_dict(include_items=True)})

# ==============================================================================
# --- ROUTES API ADMIN (CRUD Produits, Stats, etc.) ---
# ==============================================================================

@app.route('/api/admin/products', methods=['GET'])
def admin_get_all_products():
    """Récupère TOUS les produits pour le panel admin (actifs et inactifs)"""
    try:
        # On ne filtre plus par is_active=True
        all_products = Product.query.order_by(Product.id.desc()).all()
        return jsonify({
            'success': True,
            'products': [p.to_dict() for p in all_products]
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
        
@app.route('/api/admin/products', methods=['POST'])
def create_product():
    """Crée un nouveau produit"""
    data = request.form
    if not all(k in data for k in ('name', 'price', 'stock')):
        return jsonify({'success': False, 'message': 'Champs requis manquants.'}), 400
    
    image_file = request.files.get('image')
    image_url = None
    if image_file and allowed_file(image_file.filename):
        filename = secure_filename(f"{uuid.uuid4().hex[:8]}-{image_file.filename}")
        image_file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        image_url = f"/static/uploads/{filename}"
    
    try:
        product = Product(
            name=data.get('name'),
            slug=create_slug(data.get('name')),
            description=data.get('description'),
            price=float(data.get('price')),
            stock=int(data.get('stock')),
            category_id=int(data.get('category_id')) if data.get('category_id') else None,
            is_active='is_active' in data,
            is_featured='is_featured' in data,
            is_on_sale='is_on_sale' in data,
            image_url=image_url
        )
        db.session.add(product)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Produit ajouté.', 'product': product.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500
@app.route('/api/admin/products/<int:product_id>', methods=['PUT'])
def admin_update_product(product_id):
    """Met à jour un produit existant (route admin)"""
    try:
        product = Product.query.get_or_404(product_id)
        data = request.form

        product.name = data.get('name', product.name)
        product.slug = create_slug(data.get('name', product.name))
        product.description = data.get('description', product.description)
        product.price = float(data.get('price', product.price))
        product.stock = int(data.get('stock', product.stock))
        product.category_id = int(data.get('category_id')) if data.get('category_id') else product.category_id
        product.is_active = 'is_active' in data
        product.is_featured = 'is_featured' in data
        product.is_on_sale = 'is_on_sale' in data

        image_file = request.files.get('image')
        if image_file and allowed_file(image_file.filename):
            filename = secure_filename(f"{uuid.uuid4().hex[:8]}-{image_file.filename}")
            image_file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            product.image_url = f"/static/uploads/{filename}"

        db.session.commit()
        return jsonify({'success': True, 'message': 'Produit mis à jour avec succès.', 'product': product.to_dict()})

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur lors de la mise à jour : {str(e)}'}), 500


@app.route('/api/admin/products/<int:product_id>', methods=['DELETE'])
def admin_delete_product(product_id):
    """Supprime un produit (route admin)"""
    try:
        product = Product.query.get_or_404(product_id)
        db.session.delete(product)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Produit supprimé avec succès.'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur lors de la suppression : {str(e)}'}), 500
        
@app.route('/api/admin/products/<int:product_id>/toggle-status', methods=['PATCH'])
def admin_toggle_product_status(product_id):
    """Bascule le statut (actif/inactif) d'un produit."""
    try:
        product = Product.query.get_or_404(product_id)
        product.is_active = not product.is_active  # On inverse simplement le statut
        db.session.commit()
        return jsonify({
            'success': True, 
            'message': 'Statut du produit mis à jour.',
            'product': product.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
        
@app.route('/api/admin/stats')
def admin_stats():
    # ... (le code des statistiques reste le même) ...
    return jsonify({'total_orders': 0, 'total_products': 0, 'total_customers': 0})

@app.route('/api/orders/<order_number>/status', methods=['PUT'])
def update_order_status(order_number):
    # ... (le code de mise à jour du statut reste le même) ...
    return jsonify({'message': 'Statut mis à jour.'})

# ==============================================================================
# --- GESTION DES ERREURS ET LANCEMENT DE L'APP ---
# ==============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

# Création de la base de données et des données de démo au premier lancement
with app.app_context():
    db.create_all()
    create_demo_data()

if __name__ == '__main__':
    # Le port 5001 est utilisé pour correspondre à la config du frontend et run_server.py
    app.run(host='0.0.0.0', port=5001, debug=True)