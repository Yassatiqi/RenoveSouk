# Fichier: backend/src/main.py
# Version: 2.1 - Panel Admin dynamique et API CRUD complètes

import os
import uuid
from datetime import datetime
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_migrate import Migrate
from werkzeug.utils import secure_filename
from sqlalchemy import or_, func

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
    
    # On commence la requête de base
    query = Product.query.filter_by(is_active=True)
    
    # 1. Filtre par catégorie (déjà existant)
    category_slug = request.args.get('category')
    if category_slug:
        cat = Category.query.filter_by(slug=category_slug).first()
        if cat:
            query = query.filter_by(category_id=cat.id)

    # 2. Filtre par prix
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    # 3. Filtres booléens (on vérifie si la valeur est 'true')
    if request.args.get('on_sale') == 'true':
        query = query.filter_by(is_on_sale=True)
    if request.args.get('is_new') == 'true':
        query = query.filter_by(is_new=True)
    if request.args.get('featured') == 'true':
        query = query.filter_by(is_featured=True)
    if request.args.get('in_stock') == 'true':
        query = query.filter(Product.stock > 0)
         
    # 4. Filtre de recherche (depuis la barre de recherche du header)
    search_query = request.args.get('search')
    if search_query:
        query = query.filter(or_(Product.name.ilike(f'%{search_query}%'), Product.description.ilike(f'%{search_query}%')))

    # 5. Logique de tri
    sort_by = request.args.get('sort_by', 'name_asc')
    if sort_by == 'price_asc':
        query = query.order_by(Product.price.asc())
    elif sort_by == 'price_desc':
        query = query.order_by(Product.price.desc())
    elif sort_by == 'name_desc':
        query = query.order_by(func.lower(Product.name).desc())
    elif sort_by == 'newest':
        query = query.order_by(Product.created_at.desc())
    elif sort_by == 'featured':
        query = query.order_by(Product.is_featured.desc(), Product.created_at.desc())
    else: # name_asc par défaut
        query = query.order_by(func.lower(Product.name).asc())

    # Pagination finale
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    # Retour de la réponse JSON
    return jsonify({
        'products': [p.to_dict() for p in pagination.items],
        'pagination': {
            'total': pagination.total, 
            'pages': pagination.pages, 
            'page': page,
            'has_prev': pagination.has_prev,
            'has_next': pagination.has_next,
            'prev_num': pagination.prev_num,
            'next_num': pagination.next_num
        }
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
    """Crée une nouvelle commande à partir des données du checkout."""
    data = request.get_json()
    
    # Validation basique des données
    required_fields = ['shipping_first_name', 'shipping_last_name', 'shipping_phone', 'shipping_email', 'shipping_address', 'shipping_city', 'items']
    if not all(field in data for field in required_fields) or not data['items']:
        return jsonify({'success': False, 'message': 'Données de commande incomplètes.'}), 400

    try:
        # Création de l'objet Order
        order = Order(
            order_number=generate_order_number(),
            shipping_first_name=data['shipping_first_name'],
            shipping_last_name=data['shipping_last_name'],
            shipping_phone=data['shipping_phone'],
            shipping_email=data['shipping_email'],
            shipping_address=data['shipping_address'],
            shipping_city=data['shipping_city'],
            shipping_postal_code=data.get('shipping_postal_code', ''),
            payment_method=data.get('payment_method', 'cod'),
            notes=data.get('notes', ''),
            guest_email=data['shipping_email']
        )
        

        subtotal = 0.0
        product_ids = [item['id'] for item in data['items']]
        products_in_db = Product.query.filter(Product.id.in_(product_ids)).all()
        products_map = {p.id: p for p in products_in_db}

        # Création des OrderItems
        for item_data in data['items']:
            product = products_map.get(item_data['id'])
            quantity = item_data['quantity']
            
            if not product or not product.is_active or product.stock < quantity:
                # Si un produit n'est pas valide, on annule toute la transaction
                raise Exception(f"Produit ID {item_data['id']} invalide ou stock insuffisant.")

            unit_price = product.price
            total_price = unit_price * quantity
            
            order_item = OrderItem(
                product_id=product.id,
                product_name=product.name,
                product_sku=product.sku,
                unit_price=unit_price,
                quantity=quantity,
                total_price=total_price
            )
            order.items.append(order_item)
            subtotal += total_price
            
            # Décrémenter le stock
            product.stock -= quantity

        # Calcul final des totaux (côté serveur, pour la sécurité)
        order.subtotal = subtotal
        order.shipping_cost = 0.0 if subtotal >= 500 else 50.0
        order.tax_amount = 0.0  # Pas de taxe pour l'instant
        order.total_amount = order.subtotal + order.shipping_cost + order.tax_amount
        
        db.session.add(order)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Commande créée avec succès.',
            'order': order.to_dict(include_items=True)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Erreur lors de la création de la commande : {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Erreur interne du serveur lors de la création de la commande.'
        }), 500
      
        
@app.route('/api/orders/<order_number>', methods=['GET'])
def get_order_by_number(order_number):
    order = Order.query.filter_by(order_number=order_number).first_or_404()
    return jsonify({'order': order.to_dict(include_items=True)})

# ==============================================================================
# --- ROUTES API ADMIN (CRUD Produits, Stats, etc.) ---
# ==============================================================================

@app.route('/api/admin/orders', methods=['GET'])
def admin_get_orders():
    """Récupère les commandes pour le panel admin, avec un filtre de statut optionnel."""
    try:
        # Récupérer le paramètre de filtre depuis l'URL (ex: ?status=pending)
        status_filter = request.args.get('status')
        
        # Commencer avec la requête de base
        query = Order.query

        # Appliquer le filtre s'il est présent et non vide
        if status_filter:
            query = query.filter(Order.status == status_filter)
        
        # Trier par les plus récentes
        orders = query.order_by(Order.created_at.desc()).all()
        
        orders_data = [o.to_dict(include_items=True) for o in orders]
        return jsonify({'success': True, 'orders': orders_data})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
       
       
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
        # Récupérer la valeur, la convertir en float si elle existe, sinon None
        original_price_str = data.get('original_price')
        original_price = float(original_price_str) if original_price_str else None

        product = Product(
            name=data.get('name'),
            slug=create_slug(data.get('name')),
            description=data.get('description'),
            price=float(data.get('price')),
            original_price=original_price,
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
        
        # Récupérer la valeur, la convertir en float si elle existe, sinon None
        original_price_str = data.get('original_price')
        product.original_price = float(original_price_str) if original_price_str else None

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
    """Get admin statistics as JSON"""
    try:
        # On utilise des requêtes `count()` qui sont très efficaces
        stats = {
            'products_count': Product.query.count(),
            'categories_count': Category.query.count(),
            'orders_count': Order.query.count(),
            'users_count': User.query.count(),
            'active_products': Product.query.filter_by(is_active=True).count(),
            'featured_products': Product.query.filter_by(is_featured=True).count(),
            'out_of_stock': Product.query.filter(Product.stock <= 0).count(),
            
            # Bonus : Calcul du chiffre d'affaires total
            # On somme le `total_amount` de toutes les commandes livrées ou expédiées
            'total_revenue': db.session.query(func.sum(Order.total_amount)).filter(
                Order.status.in_(['shipped', 'delivered'])
            ).scalar() or 0.0
        }
        return jsonify(stats)
    except Exception as e:
        # En cas d'erreur, on renvoie une réponse claire
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/orders/<int:order_id>/status', methods=['PATCH'])
def admin_update_order_status(order_id):
    """Met à jour le statut d'une commande par son ID."""
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({'success': False, 'message': 'Nouveau statut manquant'}), 400

        order = Order.query.get_or_404(order_id)
        order.status = new_status
        order.updated_at = datetime.utcnow() # Mettre à jour la date de modification
        
        db.session.commit()
        
        # TODO: Envoyer un email de notification au client ici (étape future)
        
        return jsonify({
            'success': True,
            'message': 'Statut de la commande mis à jour avec succès.',
            'order': order.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
 
 
@app.route('/api/admin/categories', methods=['GET'])
def admin_get_categories():
    """Récupère toutes les catégories pour le panel admin."""
    try:
        categories = Category.query.order_by(Category.name.asc()).all()
        return jsonify({'success': True, 'categories': [c.to_dict() for c in categories]})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/admin/categories', methods=['POST'])
def admin_create_category():
    """Crée une nouvelle catégorie."""
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({'success': False, 'message': 'Le nom est requis'}), 400
    
    try:
        slug = create_slug(data['name'])
        # Vérifier si le slug existe déjà
        if Category.query.filter_by(slug=slug).first():
            return jsonify({'success': False, 'message': 'Cette catégorie existe déjà.'}), 409

        new_category = Category(
            name=data['name'],
            slug=slug,
            description=data.get('description', ''),
            icon=data.get('icon', 'fas fa-tag')
        )
        db.session.add(new_category)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Catégorie créée.', 'category': new_category.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/admin/categories/<int:category_id>', methods=['PUT'])
def admin_update_category(category_id):
    """Met à jour une catégorie existante."""
    category = Category.query.get_or_404(category_id)
    data = request.get_json()
    
    try:
        category.name = data.get('name', category.name)
        category.slug = create_slug(data.get('name', category.name))
        category.description = data.get('description', category.description)
        category.icon = data.get('icon', category.icon)
        category.is_active = data.get('is_active', category.is_active)

        db.session.commit()
        return jsonify({'success': True, 'message': 'Catégorie mise à jour.', 'category': category.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/admin/categories/<int:category_id>', methods=['DELETE'])
def admin_delete_category(category_id):
    """Supprime une catégorie."""
    category = Category.query.get_or_404(category_id)
    # Sécurité : ne pas supprimer si des produits y sont associés
    if category.products:
        return jsonify({'success': False, 'message': 'Impossible de supprimer, des produits sont associés à cette catégorie.'}), 400
    
    try:
        db.session.delete(category)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Catégorie supprimée.'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
 
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