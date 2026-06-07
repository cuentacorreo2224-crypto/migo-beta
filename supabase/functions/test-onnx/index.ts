import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const MODEL_URL = "https://wcvsztmnjvcnbdylrjdb.supabase.co/storage/v1/object/public/models/mnist-1.onnx";

let cachedModel: ArrayBuffer | null = null;

serve(async (req) => {
  try {
    const startTime = Date.now();

    if (!cachedModel) {
      console.log("Descargando modelo desde Storage...");
      const response = await fetch(MODEL_URL);
      if (!response.ok) {
        throw new Error(`Error descargando modelo: ${response.status}`);
      }
      cachedModel = await response.arrayBuffer();
      console.log("Modelo descargado:", cachedModel.byteLength, "bytes");
    }

    let onnxRuntime;
    try {
      onnxRuntime = await import("https://deno.land/x/onnxruntime@v0.0.1/mod.ts");
    } catch (e) {
      console.log("Deno land fallo, intentando esm.sh...");
      try {
        onnxRuntime = await import("https://esm.sh/onnxruntime-node@1.17.0");
      } catch (e2) {
        console.log("esm.sh node fallo, intentando web...");
        onnxRuntime = await import("https://esm.sh/onnxruntime-web@1.17.0");
      }
    }

    if (!onnxRuntime || !onnxRuntime.InferenceSession) {
      throw new Error("ONNX Runtime no disponible");
    }

    const session = await onnxRuntime.InferenceSession.create(cachedModel);
    console.log("Sesion ONNX creada");

    const inputData = new Float32Array(1 * 1 * 28 * 28);
    for (let i = 0; i < inputData.length; i++) {
      inputData[i] = Math.random() * 2 - 1;
    }

    const tensor = new onnxRuntime.Tensor("float32", inputData, [1, 1, 28, 28]);
    const feeds = { Input3: tensor };

    const results = await session.run(feeds);
    const output = results.Plus214_Output_0;

    const outputData = output.data as Float32Array;
    const embedding = Array.from(outputData);

    const duration = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        success: true,
        embedding_length: embedding.length,
        first_5_values: embedding.slice(0, 5),
        duration_ms: duration,
        model_cached: cachedModel !== null,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});