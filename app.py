import os
import json
import google.generativeai as genai
from flask import Flask, request, jsonify, send_from_directory, Response
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder=".", static_url_path="", template_folder=".")

# Configure Gemini API
API_KEY = os.environ.get("API_KEY")
if not API_KEY:
    print("CRITICAL: API_KEY not found in environment variables.")

genai.configure(api_key=API_KEY)

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    # For browser ESM + Babel Standalone, serve as text/plain or text/javascript
    if path.endswith('.tsx') or path.endswith('.ts'):
        try:
            full_path = os.path.join(os.path.dirname(__file__), path)
            with open(full_path, 'r') as f:
                content = f.read()
            return Response(content, mimetype='text/plain')
        except FileNotFoundError:
            return "File not found", 404
    return send_from_directory('.', path)

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        prompt = f"""
        Act as a professional Indian Agricultural Data Scientist.
        Context: Local farmer in {data.get('city', 'India')} needs a crop recommendation.
        Environment Data:
        - Temp: {data.get('temperature')}°C
        - Humidity: {data.get('humidity')}%
        - Rainfall: {data.get('rainfall')}mm
        - Soil pH: {data.get('ph')}
        - Language: {data.get('language', 'English')}

        Requirements:
        1. Predict the single best crop.
        2. Provide a detailed scientific reason.
        3. Provide productivity benefits including current Mandi rates in ₹ (Rupees) using search for recent accuracy.
        4. Return as JSON.

        Output Schema:
        {{
          "recommendedCrop": "string",
          "reason": "string",
          "productivityBenefit": "string"
        }}
        """
        
        # Use gemini-3-flash-preview with googleSearch for grounding
        model = genai.GenerativeModel(
            model_name='gemini-3-flash-preview',
            tools=[{'google_search': {}}]
        )
        
        response = model.generate_content(prompt)
        
        # Extract grounding sources if available
        sources = []
        if hasattr(response, 'candidates') and response.candidates:
            metadata = getattr(response.candidates[0], 'grounding_metadata', None)
            if metadata and hasattr(metadata, 'grounding_chunks'):
                for chunk in metadata.grounding_chunks:
                    if hasattr(chunk, 'web') and chunk.web:
                        sources.append({
                            "title": chunk.web.title or "Market Report",
                            "uri": chunk.web.uri
                        })

        # Parse JSON from text
        result = json.loads(response.text)
        result['sources'] = sources
        
        return jsonify(result)
    except Exception as e:
        print(f"Prediction Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        model = genai.GenerativeModel('gemini-3-flash-preview')
        
        instr = f"You are Bharat Agri-AI Pro, a professional expert advisor for Indian agriculture. You are currently speaking with a farmer in {data.get('language', 'English')}."
        response = model.generate_content(
            data.get('message'),
            generation_config={"system_instruction": instr}
        )
        return jsonify({"text": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
