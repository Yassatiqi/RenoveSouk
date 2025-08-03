# Modèles de base de données pour RenovSouk
# Version: 2.0 - Modèles e-commerce complets

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    icon = db.Column(db.String(50))  # Font Awesome icon class
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relation avec les produits
    products = db.relationship('Product', backref='category', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'icon': self.icon,
            'is_active': self.is_active,
            'product_count': len(self.products) if self.products else 0
        }

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True)
    description = db.Column(db.Text)
    short_description = db.Column(db.String(500))
    price = db.Column(db.Float, nullable=False)
    original_price = db.Column(db.Float)
    stock = db.Column(db.Integer, default=0)
    sku = db.Column(db.String(50), unique=True)
    weight = db.Column(db.Float)  # en kg
    dimensions = db.Column(db.String(100))  # LxlxH en cm
    
    # Statuts
    is_active = db.Column(db.Boolean, default=True)
    is_featured = db.Column(db.Boolean, default=False)
    is_on_sale = db.Column(db.Boolean, default=False)
    is_new = db.Column(db.Boolean, default=False)
    
    # Images
    image_url = db.Column(db.String(255))
    gallery_images = db.Column(db.Text)  # JSON string pour plusieurs images
    
    # Relations
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    
    # Métadonnées
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self, include_details=False):
        base_dict = {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'price': self.price,
            'original_price': self.original_price,
            'stock': self.stock,
            'is_active': self.is_active,
            'is_featured': self.is_featured,
            'is_on_sale': self.is_on_sale,
            'is_new': self.is_new,
            'image_url': self.image_url,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else None,
            'category_slug': self.category.slug if self.category else None
        }
        
        if include_details:
            base_dict.update({
                'description': self.description,
                'short_description': self.short_description,
                'sku': self.sku,
                'weight': self.weight,
                'dimensions': self.dimensions,
                'gallery_images': self.gallery_images,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None
            })
        
        return base_dict

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20))
    
    # Adresse par défaut
    address = db.Column(db.String(255))
    city = db.Column(db.String(100))
    postal_code = db.Column(db.String(10))
    
    # Statuts
    is_active = db.Column(db.Boolean, default=True)
    is_admin = db.Column(db.Boolean, default=False)
    email_verified = db.Column(db.Boolean, default=False)
    
    # Métadonnées
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relations
    orders = db.relationship('Order', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self, include_sensitive=False):
        base_dict = {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'address': self.address,
            'city': self.city,
            'postal_code': self.postal_code,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if include_sensitive:
            base_dict.update({
                'is_admin': self.is_admin,
                'email_verified': self.email_verified,
                'last_login': self.last_login.isoformat() if self.last_login else None
            })
        
        return base_dict

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(20), unique=True, nullable=False)
    
    # Client (peut être un utilisateur enregistré ou invité)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    guest_email = db.Column(db.String(120))  # Pour les commandes invités
    
    # Informations de livraison
    shipping_first_name = db.Column(db.String(50), nullable=False)
    shipping_last_name = db.Column(db.String(50), nullable=False)
    shipping_phone = db.Column(db.String(20), nullable=False)
    shipping_email = db.Column(db.String(120), nullable=False)
    shipping_address = db.Column(db.String(255), nullable=False)
    shipping_city = db.Column(db.String(100), nullable=False)
    shipping_postal_code = db.Column(db.String(10))
    
    # Montants
    subtotal = db.Column(db.Float, nullable=False)
    shipping_cost = db.Column(db.Float, default=0.0)
    tax_amount = db.Column(db.Float, default=0.0)
    total_amount = db.Column(db.Float, nullable=False)
    
    # Statut et paiement
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, shipped, delivered, cancelled
    payment_method = db.Column(db.String(20), default='cod')  # cod, bank_transfer
    payment_status = db.Column(db.String(20), default='pending')  # pending, paid, failed
    
    # Notes
    notes = db.Column(db.Text)
    admin_notes = db.Column(db.Text)
    
    # Métadonnées
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self, include_items=False):
        base_dict = {
            'id': self.id,
            'order_number': self.order_number,
            'user_id': self.user_id,
            'guest_email': self.guest_email,
            'shipping_first_name': self.shipping_first_name,
            'shipping_last_name': self.shipping_last_name,
            'shipping_phone': self.shipping_phone,
            'shipping_email': self.shipping_email,
            'shipping_address': self.shipping_address,
            'shipping_city': self.shipping_city,
            'shipping_postal_code': self.shipping_postal_code,
            'subtotal': self.subtotal,
            'shipping_cost': self.shipping_cost,
            'tax_amount': self.tax_amount,
            'total_amount': self.total_amount,
            'status': self.status,
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_items:
            base_dict['items'] = [item.to_dict() for item in self.items]
        
        return base_dict

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    
    # Informations du produit au moment de la commande
    product_name = db.Column(db.String(200), nullable=False)
    product_sku = db.Column(db.String(50))
    unit_price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    
    # Relations
    product = db.relationship('Product', backref='order_items')
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'product_id': self.product_id,
            'product_name': self.product_name,
            'product_sku': self.product_sku,
            'unit_price': self.unit_price,
            'quantity': self.quantity,
            'total_price': self.total_price,
            'product_image': self.product.image_url if self.product else None
        }

class Banner(db.Model):
    __tablename__ = 'banners'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    subtitle = db.Column(db.String(500))
    description = db.Column(db.Text)
    image_url = db.Column(db.String(255))
    link_url = db.Column(db.String(255))
    link_text = db.Column(db.String(100))
    
    # Position et affichage
    position = db.Column(db.String(20), default='hero')  # hero, promo, sidebar
    order_index = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    
    # Métadonnées
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'subtitle': self.subtitle,
            'description': self.description,
            'image_url': self.image_url,
            'link_url': self.link_url,
            'link_text': self.link_text,
            'position': self.position,
            'order_index': self.order_index,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

