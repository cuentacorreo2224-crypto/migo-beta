import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  console.log("📩 API Route llamada");
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;
    const action = formData.get('action') as string;
    console.log(`Acción: ${action}, Imagen: ${image?.name}, Tamaño original: ${image?.size} bytes`);

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Compresión y redimensionado
    const bytes = await image.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);
    const processedBuffer = await sharp(inputBuffer)
      .resize(400, 400, { fit: 'inside' })
      .jpeg({ quality: 70 })
      .toBuffer();
    const base64 = processedBuffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;
    console.log(`Tamaño comprimido: ${processedBuffer.length} bytes`);

    // Modelo Sentence Transformers (texto) pero funciona para generar embeddings
    const modelId = 'sentence-transformers/all-MiniLM-L6-v2';
    const apiUrl = `https://router.huggingface.co/hf-inference/models/${modelId}/pipeline/feature-extraction`;
    console.log("📤 Enviando a Hugging Face:", apiUrl);

    // Reintentos
    let lastError: any;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: dataUrl }),
          signal: AbortSignal.timeout(30000),
        });

        console.log(`✅ Respuesta de HF (intento ${attempt}):`, response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Error de HF (intento ${attempt}):`, errorText);
          throw new Error(`Hugging Face error: ${response.status}`);
        }

        const embedding = await response.json();
        console.log("🧠 Embedding recibido. Longitud:", embedding.length);
        if (!Array.isArray(embedding)) {
          throw new Error("El embedding no es un array");
        }

        return NextResponse.json({ embedding, action });
      } catch (error: any) {
        lastError = error;
        console.error(`🔥 Intento ${attempt} falló:`, error.message);
        if (attempt < 3) {
          const waitMs = attempt * 2000;
          console.log(`⏳ Reintentando en ${waitMs/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, waitMs));
        }
      }
    }

    throw lastError;
  } catch (error: any) {
    console.error("🔥 Error en API Route después de reintentos:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}