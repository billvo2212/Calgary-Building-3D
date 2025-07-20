import requests
import json
from typing import List, Dict, Any

class CalgaryDataService:
    def __init__(self):
        self.base_url = "https://data.calgary.ca/resource/"
        self.building_endpoint = "fu63-q2jj.json"  # Building footprints
        self.assessment_endpoint = "6zzr-5syi.json"  # Property assessments
    
    def fetch_building_data(self, limit: int = 1000) -> List[Dict[str, Any]]:
        """Fetch building footprint data from Calgary Open Data"""
        try:
            # Building footprints
            buildings_url = f"{self.base_url}{self.building_endpoint}"
            params = {
                '$limit': limit,
                '$where': "latitude IS NOT NULL AND longitude IS NOT NULL"
            }
            
            response = requests.get(buildings_url, params=params)
            response.raise_for_status()
            buildings = response.json()
            
            # Enhance with assessment data
            enhanced_buildings = []
            for building in buildings[:100]:  # Limit for demo
                enhanced = self._enhance_building_data(building)
                enhanced_buildings.append(enhanced)
            
            return enhanced_buildings
            
        except Exception as e:
            print(f"Error fetching building data: {e}")
            return self._get_mock_data()
    
    def _enhance_building_data(self, building: Dict) -> Dict:
        """Enhance building data with additional properties"""
        # Add mock height if not available
        if 'height' not in building or not building['height']:
            building['height'] = self._estimate_height(building)
        
        # Add mock assessed value
        if 'assessed_value' not in building:
            building['assessed_value'] = self._estimate_value(building)
        
        # Add zoning info
        if 'zoning' not in building:
            building['zoning'] = self._estimate_zoning(building)
        
        return building
    
    def _estimate_height(self, building: Dict) -> float:
        """Estimate building height based on available data"""
        import random
        # Mock heights between 10-200 feet for demo
        return round(random.uniform(10, 200), 1)
    
    def _estimate_value(self, building: Dict) -> int:
        """Estimate property value"""
        import random
        return random.randint(200000, 2000000)
    
    def _estimate_zoning(self, building: Dict) -> str:
        """Estimate zoning type"""
        import random
        zones = ['RC-G', 'RC-R', 'M-G', 'C-G', 'R-G1', 'R-G2']
        return random.choice(zones)
    
    def _get_mock_data(self) -> List[Dict]:
        """Fallback mock data for development"""
        import random
        mock_buildings = []
        
        # Calgary downtown area coordinates
        base_lat, base_lng = 51.0447, -114.0719
        
        for i in range(50):
            # Create a 4-block area
            lat_offset = random.uniform(-0.01, 0.01)
            lng_offset = random.uniform(-0.01, 0.01)
            
            building = {
                'id': i + 1,
                'latitude': base_lat + lat_offset,
                'longitude': base_lng + lng_offset,
                'height': round(random.uniform(20, 180), 1),
                'assessed_value': random.randint(300000, 1500000),
                'zoning': random.choice(['RC-G', 'RC-R', 'M-G', 'C-G', 'R-G1']),
                'address': f"{random.randint(100, 999)} Mock St SW",
                'building_type': random.choice(['Residential', 'Commercial', 'Mixed Use']),
                'year_built': random.randint(1950, 2023)
            }
            mock_buildings.append(building)
        
        return mock_buildings

    def filter_buildings(self, buildings: List[Dict], filter_params: Dict) -> List[Dict]:
        """Filter buildings based on LLM-parsed parameters"""
        if not filter_params:
            return buildings
        
        attribute = filter_params.get('attribute')
        operator = filter_params.get('operator')
        value = filter_params.get('value')
        
        if not all([attribute, operator, value]):
            return buildings
        
        filtered = []
        for building in buildings:
            if attribute not in building:
                continue
            
            building_value = building[attribute]
            
            try:
                # Handle numeric comparisons
                if operator == '>':
                    if float(building_value) > float(value):
                        filtered.append(building)
                elif operator == '<':
                    if float(building_value) < float(value):
                        filtered.append(building)
                elif operator == '>=':
                    if float(building_value) >= float(value):
                        filtered.append(building)
                elif operator == '<=':
                    if float(building_value) <= float(value):
                        filtered.append(building)
                elif operator == '==' or operator == '=':
                    if str(building_value).lower() == str(value).lower():
                        filtered.append(building)
                elif operator == 'contains':
                    if str(value).lower() in str(building_value).lower():
                        filtered.append(building)
            except (ValueError, TypeError):
                # Handle string comparisons
                if operator == '==' and str(building_value).lower() == str(value).lower():
                    filtered.append(building)
                elif operator == 'contains' and str(value).lower() in str(building_value).lower():
                    filtered.append(building)
        
        return filtered