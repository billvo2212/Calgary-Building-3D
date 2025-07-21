from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Project
from services.data_service import CalgaryDataService
from services.llm_service import LLMService
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
        user_query = data.get('query', '').strip()
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
                'error': 'Could not parse query. Try something like "buildings over 100 feet"'
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

@app.route('/api/projects', methods=['GET'])
def get_all_projects():
    """Return every saved project (no auth)."""
    try:
        projects = Project.query.order_by(Project.created_at.desc()).all()
        return jsonify({
            'success': True,
            'projects': [
                {
                    'id':         p.id,
                    'name':       p.name,
                    'filters':    p.get_filters(),
                    'created_at': p.created_at.isoformat()
                }
                for p in projects
            ]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/projects', methods=['POST'])
def save_project():
    data = request.get_json() or {}
    app.logger.debug("Payload:", data)
    name    = data.get('name', '').strip()
    filters = data.get('filters', [])
    if not name:
        return jsonify(success=False, error="Project name is required"), 400
    # Assuming Project.set_filters just stores a JSON blob:
    project = Project(name=name)
    project.set_filters(filters)
    db.session.add(project)
    db.session.commit()
    return jsonify(success=True, project=project.to_dict()), 200


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Urban Dashboard API is running'
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
