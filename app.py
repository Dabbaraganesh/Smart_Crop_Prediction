import os
import json
import re
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

def clean_json_response(text):
    """Helper to strip markdown backticks and extract pure JSON."""
    # Remove markdown code block markers
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    return text.strip()

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    # Ensure TSX files are served as plain text for Babel to handle
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
        - Temperature: {data.get('temperature')}°C
        - Humidity: {data.get('humidity')}%
        - Rainfall: {data.get('rainfall')}mm
        - Soil pH: {data.get('ph')}
        - Output Language: {data.get('language', 'English')}

        Requirements:
        1. Predict exactly ONE optimal crop.
        2. Provide a detailed scientific reason for the choice.
        3. Include productivity benefits and CURRENT Mandi (market) price range in ₹ (Rupees).
        4. YOU MUST return the response as a valid JSON object only.

        Expected JSON structure:
        {{
          "recommendedCrop": "Crop Name",
          "reason": "Scientific explanation here...",
          "productivityBenefit": "Economic benefits and price range (e.g. ₹2000-2500 per quintal)..."
        }}
        """
        
        # Use a stable model version for predictable JSON output
        model = genai.GenerativeModel(
            model_name='gemini-1.5-flash',
            tools=[{'google_search': {}}]
        )
        
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        cleaned_text = clean_json_response(response.text)
        result = json.loads(cleaned_text)
        
        # Extract grounding sources if search was triggered
        sources = []
        if hasattr(response, 'candidates') and response.candidates:
            metadata = getattr(response.candidates[0], 'grounding_metadata', None)
            if metadata and hasattr(metadata, 'grounding_chunks'):
                for chunk in metadata.grounding_chunks:
                    if hasattr(chunk, 'web') and chunk.web:
                        sources.append({
                            "title": chunk.web.title or "Market Data Source",
                            "uri": chunk.web.uri
                        })
        
        result['sources'] = sources
        return jsonify(result)
    except Exception as e:
        print(f"Prediction Error: {e}")
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        instr = f"You are Bharat Agri-AI Pro, a professional expert advisor for Indian agriculture. Communicate in {data.get('language', 'English')}."
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