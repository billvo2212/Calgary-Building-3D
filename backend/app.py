from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User, Project
from data_service import CalgaryDataService
from llm_service import LLMService
from config import Config
import os

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
CORS(app)
db.init_app(app)

# Initialize services
data_service = CalgaryDataService()
llm_service = LLMService(app.config.get('HUGGINGFACE_API_KEY'))

# Create tables
with app.app_context():
    db.create_all()

@app.route('/api/buildings', methods=['GET'])
def get_buildings():
    """Fetch building data from Calgary Open Data"""
    try:
        buildings = data_service.fetch_building_data()
        return jsonify({
            'success': True,
            'data': buildings,
            'count': len(buildings)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/query', methods=['POST'])
def process_query():
    """Process natural language query using LLM"""
    try:
        data = request.get_json()
        user_query = data.get('query', '')
        buildings = data.get('buildings', [])
        
        if not user_query:
            return jsonify({
                'success': False,
                'error': 'Query is required'
            }), 400
        
        # Parse query using LLM
        filter_params = llm_service.parse_query(user_query)
        
        if not filter_params:
            return jsonify({
                'success': False,
                'error': 'Could not parse query. Try queries like "buildings over 100 feet" or "commercial buildings"'
            }), 400
        
        # Filter buildings
        filtered_buildings = data_service.filter_buildings(buildings, filter_params)
        
        return jsonify({
            'success': True,
            'filter_params': filter_params,
            'filtered_buildings': filtered_buildings,
            'total_matches': len(filtered_buildings)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/users', methods=['POST'])
def create_user():
    """Create or get user"""
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        
        if not username:
            return jsonify({
                'success': False,
                'error': 'Username is required'
            }), 400
        
        # Check if user exists
        user = User.query.filter_by(username=username).first()
        if not user:
            user = User(username=username)
            db.session.add(user)
            db.session.commit()
        
        return jsonify({
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/projects', methods=['POST'])
def save_project():
    """Save user project"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        project_name = data.get('name', '').strip()
        filters = data.get('filters', {})
        
        if not all([user_id, project_name]):
            return jsonify({
                'success': False,
                'error': 'User ID and project name are required'
            }), 400
        
        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        # Create new project
        project = Project(
            name=project_name,
            user_id=user_id
        )
        project.set_filters(filters)
        
        db.session.add(project)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'project': {
                'id': project.id,
                'name': project.name,
                'filters': project.get_filters()
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/projects/<int:user_id>', methods=['GET'])
def get_user_projects(user_id):
    """Get user's saved projects"""
    try:
        projects = Project.query.filter_by(user_id=user_id).all()
        
        return jsonify({
            'success': True,
            'projects': [{
                'id': p.id,
                'name': p.name,
                'filters': p.get_filters(),
                'created_at': p.created_at.isoformat()
            } for p in projects]
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Urban Dashboard API is running'
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)