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
    if path.endswith('.tsx'):
        # In a real production environment with bundling, this wouldn't be needed.
        # But for this rapid deployment, we serve the file with the JS mime-type.
        with open(os.path.join('.', path), 'r') as f:
            content = f.read()
        return Response(content, mimetype='application/javascript')
    return send_from_directory('.', path)

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        prompt = f"""
        You are a world-class Indian Agricultural Scientist. 
        Target Language: {data.get('language', 'English')}
        Location: {data.get('city', 'India')}
        
        Soil/Weather Metrics:
        - Temp: {data.get('temperature')}°C
        - Humidity: {data.get('humidity')}%
        - Rainfall: {data.get('rainfall')}mm
        - pH: {data.get('ph')}
        
        TASK:
        1. Predict the most profitable crop.
        2. Provide a scientific rationale.
        3. Include economic benefits with Mandi rates in ₹.
        
        OUTPUT FORMAT (Strict JSON):
        {{
          "recommendedCrop": "Crop Name",
          "reason": "Rationale...",
          "productivityBenefit": "Economic forecast..."
        }}
        """
        
        # Use gemini-3-flash-preview for high speed and search grounding
        model = genai.GenerativeModel(
            model_name='gemini-3-flash-preview',
            tools=[{'google_search': {}}]
        )
        
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        return jsonify(json.loads(response.text))
    except Exception as e:
        print(f"Error in predict: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message')
        language = data.get('language', 'English')
        
        model = genai.GenerativeModel(
            model_name='gemini-3-flash-preview',
            system_instruction=f"You are Bharat Agri-AI Pro. Assist the farmer in {language}. Use real-time Mandi data. Bold all currency: **₹ 50,000**."
        )
        
        response = model.generate_content(user_message)
        return jsonify({"text": response.text})
    except Exception as e:
        print(f"Error in chat: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
