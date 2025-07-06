from flask import Blueprint, jsonify
from models.ecommerce import Category, db

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('/categories')
def get_all_categories():
    """Get all categories"""
    try:
        categories = Category.query.all()
        return jsonify([{
            'id': c.id,
            'name': c.name,
            'description': c.description,
            'icon': c.icon,
            'product_count': len(c.products)
        } for c in categories])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/categories/<int:category_id>')
def get_category_by_id(category_id):
    """Get single category by ID"""
    try:
        category = Category.query.get_or_404(category_id)
        return jsonify({
            'id': category.id,
            'name': category.name,
            'description': category.description,
            'icon': category.icon,
            'product_count': len(category.products),
            'products': [{
                'id': p.id,
                'name': p.name,
                'price': p.price,
                'image_url': p.image_url
            } for p in category.products if p.is_active]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

