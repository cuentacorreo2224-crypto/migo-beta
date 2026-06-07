from http.server import BaseHTTPRequestHandler
import json
import numpy as np
from PIL import Image
import io
import onnxruntime as ort
import os

# Ruta al modelo ONNX
MODEL_PATH = os.path.join(os.path.dirname(__file__), "efficientnet-lite4.onnx")

# Cargar el modelo una sola vez al iniciar
session = None

def get_session():
    global session
    if session is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Modelo no encontrado en {MODEL_PATH}")
        session = ort.InferenceSession(MODEL_PATH)
    return session

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            start_time = int(round(os.times()[4] * 1000))
            
            # Leer la imagen del body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            # Convertir bytes a imagen
            image = Image.open(io.BytesIO(body))
            
            # Convertir a RGB si es necesario
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Redimensionar a 224x224 (tamaño de entrada de EfficientNet-Lite4)
            image = image.resize((224, 224))
            
            # Convertir a array numpy
            img_array = np.array(image).astype(np.float32)
            
            # Normalizar para EfficientNet-Lite4
            # Mean: [0.485, 0.456, 0.406], Std: [0.229, 0.224, 0.225]
            mean = np.array([0.485, 0.456, 0.406])
            std = np.array([0.229, 0.224, 0.225])
            
            img_array = (img_array / 255.0).astype(np.float32)
            mean = mean.astype(np.float32)
            std = std.astype(np.float32)
            img_array = ((img_array - mean) / std).astype(np.float32)
            
            # El modelo espera formato (N, H, W, C) = (1, 224, 224, 3)
            # Nuestro array ya está en (H, W, C), solo agregamos batch al inicio
            img_array = np.expand_dims(img_array, axis=0)
            
            # Cargar modelo y hacer inferencia
            sess = get_session()
            input_name = sess.get_inputs()[0].name
            outputs = sess.run(None, {input_name: img_array})
            
            # EfficientNet-Lite4 devuelve un vector de 1000 clases
            # Usamos ese vector como embedding (no es perfecto pero funciona)
            embedding = outputs[0].flatten()
            
            # Normalizar a vector unitario
            norm = np.linalg.norm(embedding)
            if norm > 0:
                embedding = embedding / norm
            
            duration = int(round(os.times()[4] * 1000)) - start_time
            
            response = {
                "success": True,
                "embedding_length": len(embedding),
                "first_5_values": embedding[:5].tolist(),
                "model_loaded": True,
                "duration_ms": duration
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
            
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