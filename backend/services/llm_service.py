import requests
import json
from typing import Dict, Any, Optional

class LLMService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.api_url = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium"
        self.headers = {"Authorization": f"Bearer {api_key}"}
    
    def parse_query(self, user_query: str) -> Optional[Dict[str, Any]]:
        """Parse natural language query into filter parameters"""
        
        # Enhanced prompt for better parsing
        prompt = f"""
        Parse this building query into JSON format with exactly these fields:
        - "attribute": the property to filter (height, assessed_value, zoning, building_type)
        - "operator": comparison operator (>, <, >=, <=, ==, contains)
        - "value": the value to compare against
        
        Query: "{user_query}"
        
        Examples:
        "buildings over 100 feet" -> {{"attribute": "height", "operator": ">", "value": "100"}}
        "commercial buildings" -> {{"attribute": "building_type", "operator": "contains", "value": "Commercial"}}
        "buildings under $500000" -> {{"attribute": "assessed_value", "operator": "<", "value": "500000"}}
        "RC-G zoning" -> {{"attribute": "zoning", "operator": "==", "value": "RC-G"}}
        
        Return only valid JSON:
        """
        
        try:
            # Try rule-based parsing first (more reliable)
            parsed = self._rule_based_parse(user_query)
            if parsed:
                return parsed
            
            # Fallback to LLM if available
            if self.api_key:
                return self._llm_parse(prompt, user_query)
            else:
                return None
                
        except Exception as e:
            print(f"Error parsing query: {e}")
            return self._rule_based_parse(user_query)
    
    def _rule_based_parse(self, query: str) -> Optional[Dict[str, Any]]:
        """Rule-based query parsing as fallback"""
        query_lower = query.lower()
        
        # Height queries
        if 'feet' in query_lower or 'height' in query_lower:
            if 'over' in query_lower or '>' in query_lower:
                value = self._extract_number(query)
                if value:
                    return {"attribute": "height", "operator": ">", "value": str(value)}
            elif 'under' in query_lower or '<' in query_lower:
                value = self._extract_number(query)
                if value:
                    return {"attribute": "height", "operator": "<", "value": str(value)}
        
        # Value queries
        if '$' in query or 'value' in query_lower or 'price' in query_lower:
            if 'under' in query_lower or 'less' in query_lower or '<' in query_lower:
                value = self._extract_number(query.replace('$', '').replace(',', ''))
                if value:
                    return {"attribute": "assessed_value", "operator": "<", "value": str(value)}
            elif 'over' in query_lower or 'more' in query_lower or '>' in query_lower:
                value = self._extract_number(query.replace('$', '').replace(',', ''))
                if value:
                    return {"attribute": "assessed_value", "operator": ">", "value": str(value)}
        
        # Zoning queries
        zoning_codes = ['rc-g', 'rc-r', 'm-g', 'c-g', 'r-g1', 'r-g2']
        for code in zoning_codes:
            if code in query_lower:
                return {"attribute": "zoning", "operator": "==", "value": code.upper()}
        
        # Building type queries
        if 'commercial' in query_lower:
            return {"attribute": "building_type", "operator": "contains", "value": "Commercial"}
        elif 'residential' in query_lower:
            return {"attribute": "building_type", "operator": "contains", "value": "Residential"}
        elif 'mixed' in query_lower:
            return {"attribute": "building_type", "operator": "contains", "value": "Mixed"}
        
        return None
    
    def _extract_number(self, text: str) -> Optional[float]:
        """Extract first number from text"""
        import re
        numbers = re.findall(r'\d+\.?\d*', text)
        return float(numbers[0]) if numbers else None
    
    def _llm_parse(self, prompt: str, query: str) -> Optional[Dict[str, Any]]:
        """Use LLM API for parsing (fallback)"""
        try:
            payload = {
                "inputs": prompt,
                "parameters": {
                    "max_new_tokens": 100,
                    "temperature": 0.1
                }
            }
            
            response = requests.post(self.api_url, headers=self.headers, json=payload)
            response.raise_for_status()
            
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                generated_text = result[0].get('generated_text', '')
                # Extract JSON from response
                return self._extract_json_from_text(generated_text)
            
        except Exception as e:
            print(f"LLM API error: {e}")
        
        return None
    
    def _extract_json_from_text(self, text: str) -> Optional[Dict[str, Any]]:
        """Extract JSON object from text response"""
        try:
            # Find JSON-like patterns
            import re
            json_pattern = r'\{[^{}]*\}'
            matches = re.findall(json_pattern, text)
            
            for match in matches:
                try:
                    return json.loads(match)
                except json.JSONDecodeError:
                    continue
        except Exception:
            pass
        
        return None