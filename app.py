import os
import json
import google.generativeai as genai
from flask import Flask, request, jsonify, send_from_directory, Response
from dotenv import load_dotenv

# Load local environment variables
load_dotenv()

app = Flask(__name__, static_folder=".", static_url_path="", template_folder=".")

# Configure Gemini API
API_KEY = os.environ.get("API_KEY")
if not API_KEY:
    print("WARNING: API_KEY not found in environment variables.")

genai.configure(api_key=API_KEY)

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

# Special handler for .tsx files to serve them as ESM modules
@app.route('/<path:path>')
def serve_static(path):
    # Ensure standard static files are served correctly
    if path.endswith('.tsx'):
        try:
            with open(os.path.join(os.path.dirname(__file__), path), 'r') as f:
                content = f.read()
            return Response(content, mimetype='application/javascript')
        except FileNotFoundError:
            return "File not found", 404
    return send_from_directory('.', path)

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        prompt = f"""
        You are an expert Indian Agricultural Scientist. 
        Language: {data.get('language', 'English')}
        Location: {data.get('city', 'India')}
        
        Metrics:
        - Temp: {data.get('temperature')}°C, Humidity: {data.get('humidity')}%, Rainfall: {data.get('rainfall')}mm, pH: {data.get('ph')}
        
        Provide a crop recommendation in JSON format.
        Include realistic Mandi prices in ₹.
        """
        
        model = genai.GenerativeModel('gemini-1.5-flash') # Using 1.5-flash for maximum stability on free tiers
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        return jsonify(json.loads(response.text))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(data.get('message'))
        return jsonify({"text": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)