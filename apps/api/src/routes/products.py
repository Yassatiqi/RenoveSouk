from flask import Blueprint, jsonify, request
from models.ecommerce import Product, Category, Brand, db

products_bp = Blueprint('products', __name__)

@products_bp.route('/products')
def get_all_products():
    """Get all active products"""
    try:
        products = Product.query.filter_by(is_active=True).all()
        return jsonify([{
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'price': p.price,
            'original_price': p.original_price,
            'stock': p.stock,
            'image_url': p.image_url,
            'is_featured': p.is_featured,
            'is_on_sale': p.is_on_sale,
            'category': p.category.name if p.category else None,
            'brand': p.brand.name if p.brand else None,
            'discount_percentage': p.discount_percentage
        } for p in products])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/products/<int:product_id>')
def get_product_by_id(product_id):
    """Get single product by ID"""
    try:
        product = Product.query.get_or_404(product_id)
        return jsonify({
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'price': product.price,
            'original_price': product.original_price,
            'stock': product.stock,
            'image_url': product.image_url,
            'is_featured': product.is_featured,
            'is_on_sale': product.is_on_sale,
            'category': product.category.name if product.category else None,
            'brand': product.brand.name if product.brand else None,
            'discount_percentage': product.discount_percentage,
            'is_in_stock': product.is_in_stock
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/products/search')
def search_products():
    """Search products by name or description"""
    try:
        query = request.args.get('q', '')
        category_id = request.args.get('category_id')
        
        products_query = Product.query.filter_by(is_active=True)
        
        if query:
            products_query = products_query.filter(
                Product.name.contains(query) | 
                Product.description.contains(query)
            )
        
        if category_id:
            products_query = products_query.filter_by(category_id=category_id)
        
        products = products_query.all()
        
        return jsonify([{
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'price': p.price,
            'original_price': p.original_price,
            'stock': p.stock,
            'image_url': p.image_url,
            'category': p.category.name if p.category else None,
            'brand': p.brand.name if p.brand else None
        } for p in products])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

