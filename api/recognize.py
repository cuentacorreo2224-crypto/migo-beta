from http.server import BaseHTTPRequestHandler
import json
import numpy as np
from PIL import Image
import io
import onnxruntime as ort
import os
import urllib.request

MODEL_PATH = os.path.join(os.path.dirname(__file__), "efficientnet-lite4.onnx")
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://wcvsztmnjvcnbdylrjdb.supabase.co")
SUPABASE_ANON_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")

session = None

def get_model():
    global session
    if session is None:
        session = ort.InferenceSession(MODEL_PATH)
    return session

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            image = Image.open(io.BytesIO(body))
            if image.mode != 'RGB':
                image = image.convert('RGB')
            image = image.resize((224, 224))
            
            img_array = np.array(image, dtype=np.float32)
            img_array = img_array / 255.0
            mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
            std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
            img_array = (img_array - mean) / std
            # Formato [N, H, W, C] - NO transpose
            img_array = np.expand_dims(img_array, axis=0)
            
            sess = get_model()
            input_name = sess.get_inputs()[0].name
            outputs = sess.run(None, {input_name: img_array})
            embedding = outputs[0].flatten().astype(np.float32)
            norm = np.linalg.norm(embedding)
            if norm > 0:
                embedding = embedding / norm
            
            # Buscar en Supabase
            url = f"{SUPABASE_URL}/rest/v1/rpc/match_pets"
            payload = json.dumps({
                "query_embedding": embedding.tolist(),
                "match_threshold": 0.60,,
                "match_count": 1
            }).encode()
            
            req = urllib.request.Request(
                url,
                data=payload,
                headers={
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                    "Content-Type": "application/json"
                },
                method="POST"
            )
            
            try:
                with urllib.request.urlopen(req) as response:
                    result = json.loads(response.read().decode())
            except urllib.error.HTTPError:
                result = []
            
            if result and len(result) > 0:
                match = result[0]
                response_data = {
                    "success": True,
                    "found": True,
                    "embedding": embedding.tolist(),
                    "match": {
                        "dog_name": match.get('dog_name'),
                        "owner_whatsapp": match.get('owner_whatsapp'),
                        "dni_code": match.get('dni_code'),
                        "similarity": match.get('similarity')
                    }
                }
            else:
                response_data = {
                    "success": True,
                    "found": False,
                    "embedding": embedding.tolist()
                }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": False,
                "error": str(e)
            }).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()