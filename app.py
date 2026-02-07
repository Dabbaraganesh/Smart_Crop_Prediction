import os
import json
import re
import google.generativeai as genai
from flask import Flask, request, jsonify, send_from_directory, Response
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder=".", static_url_path="", template_folder=".")

# Configure Gemini API
API_KEY = os.environ.get("API_KEY") or os.environ.get("GEMINI_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)

def clean_json_response(text):
    """
    Strips markdown and extracts the first valid JSON object found in the text.
    This prevents 'missing output' errors caused by AI formatting.
    """
    try:
        # Match anything between the first { and the last }
        match = re.search(r'(\{.*\})', text, re.DOTALL)
        if match:
            return match.group(1)
    except Exception:
        pass
    
    # Fallback: simple markdown stripping
    text = re.sub(r'```(?:json)?\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    return text.strip()

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        if not API_KEY:
            return jsonify({"error": "API Key missing in environment variables"}), 500

        data = request.json
        prompt = f"""
        Act as a Lead Scientist at Bharat Agri-AI. 
        Input: {data.get('city')}, Temp: {data.get('temperature')}°C, Hum: {data.get('humidity')}%, Rain: {data.get('rainfall')}mm, pH: {data.get('ph')}.
        Language: {data.get('language', 'English')}.

        Task: Recommend ONE optimal crop for these Indian conditions.
        Format: Return ONLY a JSON object with keys: recommendedCrop, reason, productivityBenefit.
        Include current Mandi price range in ₹ (Rupees) in the productivityBenefit field.
        """
        
        # Using the latest Gemini 3 Flash model for speed and accuracy
        model = genai.GenerativeModel('gemini-3-flash-preview')
        
        response = model.generate_content(
            prompt,
            generation_config={
                "response_mime_type": "application/json"
            }
        )
        
        cleaned_json = clean_json_response(response.text)
        result = json.loads(cleaned_json)
        return jsonify(result)
        
    except Exception as e:
        print(f"Server Error: {str(e)}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        model = genai.GenerativeModel('gemini-3-flash-preview')
        
        system_instr = f"You are Bharat Agri-AI Pro, a professional agricultural assistant for India. Respond in {data.get('language', 'English')}."
        response = model.generate_content(
            data.get('message'),
            generation_config={"system_instruction": system_instr}
        )
        return jsonify({"text": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Vercel requires the app instance to be available as 'app'
app = app

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)