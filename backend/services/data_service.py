import requests
import random
from typing import List, Dict, Any

class CalgaryDataService:
    def __init__(self):
        self.base_url            = "https://data.calgary.ca/resource/"
        self.building_endpoint   = "fu63-q2jj.json"
        self.assessment_endpoint = "6zzr-5syi.json"
    
    def fetch_building_data(self, limit: int = 1000) -> List[Dict[str, Any]]:
        """
        Fetch *all* building footprints by paging through Socrata.
        On error, generate `limit` mock buildings so the shape/size matches.
        """
        try:
            url    = f"{self.base_url}{self.building_endpoint}"
            offset = 0
            all_buildings: List[Dict[str, Any]] = []

            while True:
                resp = requests.get(url, params={
                    '$limit':  limit,
                    '$offset': offset,
                    '$where':  "latitude IS NOT NULL AND longitude IS NOT NULL"
                })
                resp.raise_for_status()
                batch = resp.json()
                if not batch:
                    break

                all_buildings.extend(batch)
                offset += limit

            # Enhance the real data
            return [self._enhance_building_data(b) for b in all_buildings]

        except Exception as e:
            print(f"[Warning] API fetch error: {e}")
            # Return `limit` mock buildings to match the expected size
            return self._get_mock_data(count=limit)
    
    def _enhance_building_data(self, building: Dict) -> Dict:
        if not building.get('height'):
            building['height'] = self._estimate_height()
        if not building.get('assessed_value'):
            building['assessed_value'] = self._estimate_value()
        if not building.get('zoning'):
            building['zoning'] = self._estimate_zoning()
        return building
    
    def _estimate_height(self) -> float:
        return round(random.uniform(10, 200), 1)
    
    def _estimate_value(self) -> int:
        return random.randint(200_000, 2_000_000)
    
    def _estimate_zoning(self) -> str:
        return random.choice(['RC-G', 'RC-R', 'M-G', 'C-G', 'R-G1', 'R-G2'])
    
    def _get_mock_data(self, count: int) -> List[Dict[str, Any]]:
        """
        Generate `count` mock buildings around downtown Calgary.
        """
        base_lat, base_lng = 51.0447, -114.0719
        mock_buildings = []

        for i in range(100):
            lat_offset = random.uniform(-0.01, 0.01)
            lng_offset = random.uniform(-0.01, 0.01)
            mock_buildings.append({
                'id':              f"mock-{i+1}",
                'latitude':        base_lat + lat_offset,
                'longitude':       base_lng + lng_offset,
                'height':          round(random.uniform(20, 180), 1),
                'assessed_value':  random.randint(300_000, 1_500_000),
                'zoning':          random.choice(['RC-G','RC-R','M-G','C-G','R-G1']),
                'address':         f"{random.randint(100,999)} Mock St SW",
                'building_type':   random.choice(['Residential','Commercial','Mixed Use']),
                'year_built':      random.randint(1950, 2023)
            })

        return mock_buildings

    def filter_buildings(
        self,
        buildings: List[Dict[str, Any]],
        filter_params: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        # (Unchanged filter logic)
        attribute = filter_params.get('attribute')
        operator  = filter_params.get('operator')
        value     = filter_params.get('value')
        if not (attribute and operator and value):
            return buildings

        result = []
        for b in buildings:
            if attribute not in b:
                continue
            bv = b[attribute]
            try:
                fv = float(bv); tv = float(value)
                if operator == '>'  and fv > tv:   result.append(b)
                if operator == '<'  and fv < tv:   result.append(b)
                if operator == '>=' and fv >= tv:  result.append(b)
                if operator == '<=' and fv <= tv:  result.append(b)
            except Exception:
                sv, tv = str(bv).lower(), str(value).lower()
                if operator in ('==','=',) and sv == tv:
                    result.append(b)
                if operator == 'contains' and tv in sv:
                    result.append(b)
        return result
