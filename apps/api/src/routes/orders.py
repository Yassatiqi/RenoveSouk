from flask import Blueprint, jsonify, request
from models.ecommerce import Order, OrderItem, Product, db
from datetime import datetime
import uuid

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/orders', methods=['POST'])
def create_order():
    """Create a new order"""
    try:
        data = request.get_json()
        
        # Generate order number
        order_number = f"RNV{datetime.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:8].upper()}"
        
        # Create order
        order = Order(
            order_number=order_number,
            customer_name=data.get('customer_name'),
            customer_email=data.get('customer_email'),
            customer_phone=data.get('customer_phone'),
            shipping_address=data.get('shipping_address'),
            shipping_city=data.get('shipping_city'),
            shipping_postal_code=data.get('shipping_postal_code'),
            total_amount=data.get('total_amount', 0),
            payment_method=data.get('payment_method', 'cash_on_delivery'),
            notes=data.get('notes', '')
        )
        
        db.session.add(order)
        db.session.flush()  # Get order ID
        
        # Add order items
        total_amount = 0
        for item_data in data.get('items', []):
            product = Product.query.get(item_data['product_id'])
            if product and product.stock >= item_data['quantity']:
                order_item = OrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    product_name=product.name,
                    product_price=product.price,
                    quantity=item_data['quantity']
                )
                db.session.add(order_item)
                
                # Update stock
                product.stock -= item_data['quantity']
                
                total_amount += product.price * item_data['quantity']
        
        # Update total amount
        order.total_amount = total_amount
        
        db.session.commit()
        
        return jsonify({
            'message': 'Commande créée avec succès',
            'order_number': order_number,
            'order_id': order.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/orders')
def get_all_orders():
    """Get all orders"""
    try:
        orders = Order.query.order_by(Order.created_at.desc()).all()
        return jsonify([{
            'id': o.id,
            'order_number': o.order_number,
            'customer_name': o.customer_name,
            'total_amount': o.total_amount,
            'status': o.status,
            'created_at': o.created_at.isoformat(),
            'total_items': o.total_items
        } for o in orders])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/orders/<int:order_id>')
def get_order_by_id(order_id):
    """Get single order by ID"""
    try:
        order = Order.query.get_or_404(order_id)
        return jsonify({
            'id': order.id,
            'order_number': order.order_number,
            'customer_name': order.customer_name,
            'customer_email': order.customer_email,
            'customer_phone': order.customer_phone,
            'shipping_address': order.shipping_address,
            'shipping_city': order.shipping_city,
            'total_amount': order.total_amount,
            'status': order.status,
            'payment_status': order.payment_status,
            'payment_method': order.payment_method,
            'created_at': order.created_at.isoformat(),
            'items': [{
                'product_name': item.product_name,
                'product_price': item.product_price,
                'quantity': item.quantity,
                'subtotal': item.subtotal
            } for item in order.order_items]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

