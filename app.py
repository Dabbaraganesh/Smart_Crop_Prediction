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
    if path.endswith('.tsx') or path.endswith('.ts'):
        try:
            full_path = os.path.join(os.path.dirname(__file__), path)
            with open(full_path, 'r') as f:
                content = f.read()
            # We use text/plain or application/javascript; Babel standalone handles it.
            return Response(content, mimetype='text/plain')
        except FileNotFoundError:
            return "File not found", 404
    return send_from_directory('.', path)

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        prompt = f"""
        Act as an expert Indian Agricultural Scientist. 
        Input Metrics for {data.get('city', 'this region')}:
        - Temperature: {data.get('temperature')}°C
        - Humidity: {data.get('humidity')}%
        - Rainfall: {data.get('rainfall')}mm
        - Soil pH: {data.get('ph')}
        - Target Language: {data.get('language', 'English')}

        Task: Recommend ONE optimal crop for these conditions.
        Format your response as a JSON object with:
        - recommendedCrop (string)
        - reason (string - detailed scientific explanation)
        - productivityBenefit (string - economic outlook including potential Mandi price in ₹)
        
        Ensure the language is {data.get('language', 'English')}.
        """
        
        model = genai.GenerativeModel('gemini-3-flash-preview')
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        return jsonify(json.loads(response.text))
    except Exception as e:
        print(f"Prediction Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        model = genai.GenerativeModel('gemini-3-flash-preview')
        
        system_instr = f"You are Bharat Agri-AI Pro, a professional agricultural advisor for Indian farmers. Answer in {data.get('language', 'English')}."
        response = model.generate_content(
            data.get('message'),
            generation_config={"system_instruction": system_instr}
        )
        return jsonify({"text": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)