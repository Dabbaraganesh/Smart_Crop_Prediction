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
    # Fallback for some environments
    API_KEY = os.environ.get("GEMINI_API_KEY")

if API_KEY:
    genai.configure(api_key=API_KEY)
else:
    print("CRITICAL ERROR: No API Key provided in environment variables.")

def clean_json_response(text):
    """
    Cleans the AI response to ensure it's a valid JSON string.
    Removes markdown markers like ```json ... ```
    """
    # Find the first { and the last }
    try:
        start_idx = text.find('{')
        end_idx = text.rfind('}')
        if start_idx != -1 and end_idx != -1:
            return text[start_idx:end_idx + 1]
    except Exception:
        pass
    
    # Fallback regex cleaning
    text = re.sub(r'```(?:json)?\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    return text.strip()

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    # Support for Babel transpilation on shared hosting
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
        if not API_KEY:
            return jsonify({"error": "API Key not configured on server"}), 500

        data = request.json
        # Precise engineering of the prompt to ensure JSON compliance
        prompt = f"""
        System: Act as the Lead Agricultural Scientist at Bharat Agri-AI.
        Task: Provide a localized crop recommendation.
        
        Parameters:
        - City/District: {data.get('city')}
        - Temperature: {data.get('temperature')}°C
        - Humidity: {data.get('humidity')}%
        - Rainfall: {data.get('rainfall')}mm
        - Soil pH: {data.get('ph')}
        - Preferred Language: {data.get('language', 'English')}

        Output Requirement: You MUST respond ONLY with a JSON object.
        JSON Structure:
        {{
          "recommendedCrop": "Specific Crop Name",
          "reason": "Detailed scientific explanation in {data.get('language', 'English')}",
          "productivityBenefit": "Economic benefits and current Mandi price estimate (₹) in {data.get('language', 'English')}"
        }}
        """
        
        # Use gemini-3-flash-preview as per system instructions
        model = genai.GenerativeModel('gemini-3-flash-preview')
        
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        # Defensive parsing
        raw_text = response.text
        cleaned_json = clean_json_response(raw_text)
        result = json.loads(cleaned_json)
        
        return jsonify(result)
    except Exception as e:
        print(f"Prediction Error: {str(e)}")
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        model = genai.GenerativeModel('gemini-3-flash-preview')
        
        system_instr = f"You are Bharat Agri-AI Pro. Provide professional farming advice in {data.get('language', 'English')}."
        response = model.generate_content(
            data.get('message'),
            generation_config={"system_instruction": system_instr}
        )
        return jsonify({"text": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Entry point for Vercel
app = app

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)