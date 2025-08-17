# Fichier: backend/src/utils.py
import uuid
from datetime import datetime
import re

# IMPORTANT: On importe les modèles et db directement depuis l'extension
from .models.ecommerce import db, Category, Product

def generate_order_number():
    """Génère un numéro de commande unique"""
    timestamp = datetime.now().strftime('%Y%m%d')
    random_part = str(uuid.uuid4().hex[:6]).upper()
    return f"RS{timestamp}{random_part}"

def create_slug(text):
    """Crée un slug à partir d'un texte"""
    text = str(text).lower()
    text = re.sub(r'[àáâãäå]', 'a', text)
    text = re.sub(r'[èéêë]', 'e', text)
    text = re.sub(r'[ìíîï]', 'i', text)
    text = re.sub(r'[òóôõö]', 'o', text)
    text = re.sub(r'[ùúûü]', 'u', text)
    text = re.sub(r'[ç]', 'c', text)
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s-]+', '-', text)
    return text.strip('-')

def allowed_file(filename):
    """Vérifie si l'extension du fichier est autorisée."""
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def create_demo_data(app):
    """Crée les données de démonstration dans le contexte de l'application."""
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