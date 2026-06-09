from http.server import BaseHTTPRequestHandler
import json
import urllib.request
import os

# Usar la variable de entorno de Next.js que ya existe
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://wcvsztmnjvcnbdylrjdb.supabase.co")
SUPABASE_ANON_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Leer el embedding del body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode())
            embedding = data.get('embedding')
            
            if not embedding:
                raise ValueError("No se recibió embedding")
            
            # Buscar en Supabase usando la API REST directamente
            # Como RPC falla, usamos una consulta SQL directa
            url = f"{SUPABASE_URL}/rest/v1/rpc/match_pets"
            
            payload = json.dumps({
                "query_embedding": embedding,
                "match_threshold": 0.75,
                "match_count": 1
            }).encode()
            
            req = urllib.request.Request(
                url,
                data=payload,
                headers={
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },
                method="POST"
            )
            
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode())
            
            # Procesar resultado
            if result and len(result) > 0 and result[0].get('similarity', 0) > 0.75:
                match = result[0]
                response_data = {
                    "success": True,
                    "found": True,
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
                    "match": None
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