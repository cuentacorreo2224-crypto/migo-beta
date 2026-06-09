from http.server import BaseHTTPRequestHandler
import json
import numpy as np
from PIL import Image
import io
import onnxruntime as ort
import os
import time
import requests

# Ruta al modelo ONNX
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../extract-embedding/efficientnet-lite4.onnx")

# Configuración de Supabase
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://wcvsztmnjvcnbdylrjdb.supabase.co")
# Intentar leer la variable de entorno de Next.js (ya configurada en Vercel)
SUPABASE_ANON_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", os.environ.get("SUPABASE_ANON_KEY", ""))

# Cargar el modelo una sola vez al iniciar
session = None

def get_session():
    global session
    if session is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Modelo no encontrado en {MODEL_PATH}")
        session = ort.InferenceSession(MODEL_PATH)
    return session

def extract_embedding(image_bytes):
    image = Image.open(io.BytesIO(image_bytes))
    
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    image = image.resize((224, 224))
    img_array = np.array(image, dtype=np.float32)
    
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    
    img_array = img_array / 255.0
    img_array = (img_array - mean) / std
    img_array = np.transpose(img_array, (2, 0, 1))
    img_array = np.expand_dims(img_array, axis=0)
    
    sess = get_session()
    input_name = sess.get_inputs()[0].name
    outputs = sess.run(None, {input_name: img_array})
    
    embedding = outputs[0].flatten().astype(np.float32)
    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm
    
    return embedding.tolist()

def search_pet_in_supabase(embedding, threshold=0.75, count=1):
    # Usar la API REST de Supabase directamente en lugar de RPC
    url = f"{SUPABASE_URL}/rest/v1/pets"
    
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    # Calcular similitud coseno manualmente con pgvector
    # embedding <=> query_embedding es distancia euclidiana en pgvector
    # 1 - (embedding <=> query_embedding) da similitud coseno aproximada
    
    # Usar una consulta SQL directa a través de la API REST
    # Esto requiere una función SQL o usar el endpoint /rpc
    # Como rpc falla, usamos una consulta alternativa
    
    # Método alternativo: obtener todos los embeddings y calcular en Python
    # (no es eficiente para miles, pero funciona para MVP con cientos)
    
    response = requests.get(
        url,
        headers=headers,
        params={"select": "id,dog_name,owner_whatsapp,dni_code,image_url,embedding"}
    )
    
    if response.status_code != 200:
        raise Exception(f"Error consultando Supabase: {response.status_code}")
    
    pets = response.json()
    
    best_match = None
    best_similarity = -1
    
    query_embedding = np.array(embedding)
    
    for pet in pets:
        if pet.get("embedding"):
            pet_embedding = np.array(pet["embedding"])
            # Similitud coseno
            similarity = np.dot(query_embedding, pet_embedding) / (np.linalg.norm(query_embedding) * np.linalg.norm(pet_embedding))
            
            if similarity > best_similarity and similarity > threshold:
                best_similarity = similarity
                best_match = {
                    "id": pet["id"],
                    "dog_name": pet["dog_name"],
                    "owner_whatsapp": pet["owner_whatsapp"],
                    "dni_code": pet["dni_code"],
                    "image_url": pet["image_url"],
                    "similarity": float(similarity)
                }
    
    return best_match

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            start_time = int(time.time() * 1000)
            
            # Leer la imagen del body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            # Extraer embedding
            embedding = extract_embedding(body)
            
            # Buscar en Supabase
            match = search_pet_in_supabase(embedding, threshold=0.75, count=1)
            
            duration = int(time.time() * 1000) - start_time
            
            response = {
                "success": True,
                "found": match is not None,
                "match": match,
                "duration_ms": duration
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            import traceback
            error_detail = traceback.format_exc()
            
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": False,
                "error": str(e),
                "detail": error_detail
            }).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()