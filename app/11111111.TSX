'use client';

import { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import Webcam from 'react-webcam';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TinoID() {
  const [tab, setTab] = useState<'register' | 'search'>('register');
  const [showInstructions, setShowInstructions] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [registrationCount, setRegistrationCount] = useState(0);
  const [registeredDniCode, setRegisteredDniCode] = useState('');

  const webcamRef = useRef<Webcam>(null);
  const [image, setImage] = useState<string | null>(null);
  const [dogName, setDogName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [model, setModel] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Cargar conteo de registros
  useEffect(() => {
    const count = localStorage.getItem('tinoid_registrations');
    setRegistrationCount(count ? parseInt(count) : 0);
  }, []);

  // Cargar modelo MobileNetV3 Large
  useEffect(() => {
    async function loadModel() {
      try {
        await tf.ready();
        const mobilenetLarge = await tf.loadLayersModel(
          'https://tfhub.dev/google/imagenet/mobilenet_v3_large_100_224/feature_vector/5/default/1',
          { fromTFHub: true }
        );
        setModel(mobilenetLarge);
        console.log('✅ Modelo MobileNetV3 Large cargado correctamente');
      } catch (err) {
        console.error('Error cargando MobileNetV3 Large:', err);
      }
    }
    loadModel();
  }, []);

  useEffect(() => {
    setImage(null);
    setResult(null);
    setShowConfirm(false);
    setRegisteredDniCode('');
  }, [tab]);

  const capturePhoto = () => {
    if (webcamRef.current) {
      const screenshot = webcamRef.current.getScreenshot();
      if (screenshot) {
        setImage(screenshot);
        setShowConfirm(true);
      }
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target?.result as string);
        setShowConfirm(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const cancelConfirm = () => {
    setImage(null);
    setShowConfirm(false);
  };

  const confirmNosePhoto = () => {
    setShowConfirm(false);
  };

  const retakePhoto = () => {
    setImage(null);
    setShowConfirm(false);
    setResult(null);
    setRegisteredDniCode('');
  };

  const generateDniCode = (): string => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `TINO-2026-${randomNum}`;
  };

  const compressImage = async (imgSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imgSrc;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, 512, 512);
        resolve(canvas.toDataURL('image/jpeg', 0.68));
      };
    });
  };

  const getEmbedding = async (imgSrc: string): Promise<number[]> => {
    if (!model) throw new Error('Modelo no cargado');
    const img = new Image();
    img.src = imgSrc;
    await new Promise(r => img.onload = r);

    const tensor = tf.browser.fromPixels(img)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .expandDims(0)
      .div(255);

    const embeddingTensor = model.predict(tensor) as tf.Tensor;
    const embedding = await embeddingTensor.array();
    tf.dispose([tensor, embeddingTensor]);
    return embedding[0];
  };

  const cosineSimilarity = (a: number[], b: number[]): number => {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] ** 2;
      magB += b[i] ** 2;
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
  };

  const handleRegister = async () => {
    if (registrationCount >= 10) {
      alert('Has alcanzado el límite de pruebas en este dispositivo.');
      return;
    }

    if (!image || !dogName.trim() || !whatsapp.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      const compressed = await compressImage(image);
      const embedding = await getEmbedding(compressed);
      const dniCode = generateDniCode();

      const fileName = `tino-${Date.now()}.jpg`;
      const blob = await fetch(compressed).then(r => r.blob());

      // ←←← USAMOS TU BUCKET 'tino-images' ←←←
      const { error: uploadError } = await supabase.storage
        .from('tino-images')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('tino-images')
        .getPublicUrl(fileName);

      await supabase.from('pets').insert({
        dog_name: dogName.trim(),
        owner_whatsapp: whatsapp.replace(/\s+/g, ''),
        image_url: urlData.publicUrl,
        embedding: embedding,
        dni_code: dniCode
      });

      const newCount = registrationCount + 1;
      localStorage.setItem('tinoid_registrations', newCount.toString());
      setRegistrationCount(newCount);

      setRegisteredDniCode(dniCode);

      alert(`✅ ¡Registro exitoso!\n\nNombre: ${dogName}\nDNI Digital: ${dniCode}\n\nGuarda este código.`);

    } catch (error) {
      console.error(error);
      alert('Error al registrar. Verifica tu conexión a internet.');
    }

    setImage(null);
    setDogName('');
    setWhatsapp('');
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!image) return alert('Primero toma o sube una foto de la nariz');
    setLoading(true);
    setResult(null);

    try {
      const compressed = await compressImage(image);
      const queryEmbedding = await getEmbedding(compressed);

      const { data: pets } = await supabase.from('pets').select('*');

      if (!pets || pets.length === 0) {
        setResult({ found: false });
        setLoading(false);
        return;
      }

      let bestScore = -1;
      let bestPet: any = null;

      for (const pet of pets) {
        const score = cosineSimilarity(queryEmbedding, pet.embedding);
        if (score > bestScore) {
          bestScore = score;
          bestPet = pet;
        }
      }

      if (bestScore > 0.80) {
        setResult({ found: true, pet: bestPet });
      } else {
        setResult({ found: false });
      }
    } catch (error) {
      alert('Error al procesar la búsqueda.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-12">
      {/* Header */}
      <div className="pt-12 pb-6 text-center relative">
        <div className="mx-auto w-28 h-28 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-3xl flex items-center justify-center shadow-2xl mb-4 text-7xl">
          🐾
        </div>
        <h1 className="text-6xl font-bold tracking-tighter">TINO ID</h1>
        <p className="text-emerald-400 text-xl font-medium mt-1">DNI GRATIS PARA PERRITOS</p>

        <button
          onClick={() => setShowInstructions(true)}
          className="absolute top-12 right-6 w-11 h-11 bg-zinc-800 rounded-full flex items-center justify-center text-2xl hover:bg-zinc-700"
        >
          ❔
        </button>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-10">
        <div className="bg-zinc-900 rounded-3xl p-1.5 flex gap-2">
          <button 
            onClick={() => { setTab('register'); setImage(null); setResult(null); }} 
            className={`flex-1 py-4 rounded-3xl font-semibold transition-all text-lg ${tab === 'register' 
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50' 
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
          >
            Registrar mi perro
          </button>
          <button 
            onClick={() => { setTab('search'); setImage(null); setResult(null); }} 
            className={`flex-1 py-4 rounded-3xl font-semibold transition-all text-lg ${tab === 'search' 
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50' 
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
          >
            Encontré un perro
          </button>
        </div>
      </div>

      <div className="px-6 max-w-md mx-auto">
        <div className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">

          {/* Cámara */}
          <div className="relative bg-black">
            <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: "environment" }} className="w-full aspect-square object-cover" />
          </div>

          {/* Botones de foto */}
          <div className="px-6 pt-6 pb-8">
            <div className="flex justify-center gap-12">
              <div className="flex flex-col items-center">
                <button onClick={capturePhoto} className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl active:scale-95 border-4 border-zinc-950 mb-2">
                  <span className="text-4xl">📸</span>
                </button>
                <span className="text-sm font-medium text-white">Foto de Nariz</span>
              </div>

              <div className="flex flex-col items-center">
                <label className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl active:scale-95 border-4 border-zinc-950 mb-2 cursor-pointer">
                  <span className="text-4xl">📁</span>
                  <input type="file" accept="image/*" onChange={handleGalleryUpload} className="hidden" />
                </label>
                <span className="text-sm font-medium text-white">Subir foto</span>
              </div>
            </div>
          </div>

          {/* Confirmación */}
          {showConfirm && image && (
            <div className="p-8 text-center border-t border-zinc-800">
              <p className="text-xl font-semibold mb-6">¿Esta es una foto clara de la nariz del perro?</p>
              <div className="flex gap-4">
                <button onClick={cancelConfirm} className="flex-1 py-5 bg-zinc-800 rounded-2xl font-medium">No, volver a tomar</button>
                <button onClick={confirmNosePhoto} className="flex-1 py-5 bg-emerald-600 rounded-2xl font-medium">Sí, es nariz</button>
              </div>
            </div>
          )}

          {image && !showConfirm && (
            <div className="px-6 pb-6">
              <div className="rounded-2xl overflow-hidden shadow-inner">
                <img src={image} className="w-full" />
              </div>
              <button onClick={retakePhoto} className="mt-4 text-orange-400 text-sm">↺ Tomar otra foto</button>
            </div>
          )}

          {/* Formulario Registrar */}
          {tab === 'register' && image && !showConfirm && (
            <div className="p-6 space-y-6 border-t border-zinc-800">
              <input 
                type="text" 
                placeholder="Nombre del perro" 
                value={dogName} 
                onChange={e => setDogName(e.target.value)} 
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4 text-lg" 
              />
              <input 
                type="tel" 
                placeholder="+591 7xxx xxxx" 
                value={whatsapp} 
                onChange={e => setWhatsapp(e.target.value)} 
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4 text-lg" 
              />
              <button 
                onClick={handleRegister} 
                disabled={loading} 
                className="w-full py-6 bg-emerald-600 rounded-3xl font-semibold text-xl"
              >
                {loading ? 'Registrando...' : '✅ Registrar perro'}
              </button>
            </div>
          )}

          {/* Botón Buscar */}
          {tab === 'search' && image && !showConfirm && (
            <div className="p-6 border-t border-zinc-800">
              <button 
                onClick={handleSearch} 
                disabled={loading} 
                className="w-full py-6 bg-orange-500 rounded-3xl font-semibold text-xl"
              >
                {loading ? 'Buscando...' : '🔍 Buscar coincidencia'}
              </button>
            </div>
          )}

          {/* Resultado de búsqueda */}
          {result && (
            <div className="p-8 text-center border-t border-zinc-800">
              {result.found ? (
                <div className="space-y-8">
                  <div className="text-8xl">🎉</div>
                  <h2 className="text-4xl font-semibold text-emerald-400">¡Perro encontrado!</h2>
                  <p className="text-3xl font-medium">{result.pet.dog_name}</p>
                  <a 
                    href={`https://wa.me/${result.pet.owner_whatsapp.replace('+','')}`} 
                    target="_blank" 
                    className="block w-full py-6 bg-emerald-600 rounded-3xl text-2xl font-semibold"
                  >
                    💬 Contactar por WhatsApp
                  </a>
                </div>
              ) : (
                <div className="py-12">
                  <div className="text-7xl mb-6">🤔</div>
                  <h2 className="text-3xl text-zinc-300">No encontramos coincidencia</h2>
                  <p className="text-zinc-400 mt-4">Prueba con mejor luz o acerca más la cámara</p>
                </div>
              )}
            </div>
          )}

          {/* Links Legales */}
          <div className="text-center py-6 border-t border-zinc-800 text-xs text-zinc-500 flex justify-center gap-4">
            <button onClick={() => setShowTerms(true)} className="hover:text-zinc-400">Términos y Condiciones</button>
            <span>|</span>
            <button onClick={() => setShowPrivacy(true)} className="hover:text-zinc-400">Política de Privacidad</button>
          </div>
        </div>
      </div>

      {/* ====================== INSTRUCCIONES ====================== */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
          <div className="bg-zinc-900 rounded-3xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Cómo usar TINO ID</h2>
            
            <div className="space-y-9">
              <div className="flex gap-5">
                <div className="text-5xl">📸</div>
                <div>
                  <p className="font-semibold">Solo se aceptan fotos de nariz de perro</p>
                  <p className="text-red-400 text-sm mt-2">Fotos de flores, pelotas, manos u otros objetos <strong>NO son válidas</strong>.</p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="text-5xl">📏</div>
                <div>
                  <p className="font-semibold">Cómo tomar una buena foto de nariz:</p>
                  <ul className="text-zinc-400 text-sm mt-3 space-y-2">
                    <li>• Acerca la cámara a 10-15 cm de la nariz</li>
                    <li>• La nariz debe verse grande y centrada</li>
                    <li>• Usa luz natural del día, o una fuerte luz de noche (sin flash)</li>
                    <li>• El perro debe mirar de frente</li>
                    <li>• Limpia la nariz si está mojada</li>
                    <li>• Mantén el celular firme con las dos manos</li>
                    <li>• Esta app solo funciona con internet, recuérdalo</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="text-5xl">⚠️</div>
                <div>
                  <p className="font-semibold">Por favor sé responsable</p>
                  <p className="text-zinc-400 text-sm mt-1">
                    Con TINO ID puedes darle un DNI digital a tu perro para que siempre pueda volver a casa.<br />
                    Gracias por usarla de forma responsable ❤️
                  </p>
                </div>
              </div>
            </div>

            <button onClick={() => setShowInstructions(false)} className="w-full mt-10 py-5 bg-emerald-600 rounded-3xl font-semibold text-lg">
              Entendido ✓
            </button>
          </div>
        </div>
      )}

      {/* ====================== TÉRMINOS Y CONDICIONES ====================== */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
          <div className="bg-zinc-900 rounded-3xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Términos y Condiciones</h2>
            
            <div className="text-sm text-zinc-300 leading-relaxed space-y-6">
              <p><strong>Última actualización:</strong> Abril 2026</p>

              <p>Al usar TINO ID aceptas estos términos de forma completa e incondicional.</p>

              <p><strong>1. Naturaleza del Servicio</strong><br />
              TINO ID es una herramienta experimental. El servicio se ofrece "tal cual", sin garantías de funcionamiento continuo, precisión o disponibilidad.</p>

              <p><strong>2. Sin Garantías y Limitación de Responsabilidad</strong><br />
              TINO ID puede no funcionar, funcionar mal, interrumpirse o desaparecer permanentemente en cualquier momento y sin previo aviso. Los usuarios aceptan expresamente que TINO ID no garantiza su correcto funcionamiento ni su permanencia.</p>

              <p><strong>3. Exoneración de Responsabilidad</strong><br />
              Los creadores de TINO ID quedan totalmente liberados de cualquier responsabilidad por cualquier daño, pérdida, mal funcionamiento, interrupción del servicio o cualquier reclamo derivado del uso de la aplicación.</p>

              <p><strong>4. Datos y WhatsApp</strong><br />
              Al registrar un perro, autorizas que tu número de WhatsApp y los datos sean almacenados y mostrados públicamente a cualquier persona que tome una foto de la nariz del perro.</p>

              <p><strong>5. Uso Responsable</strong><br />
              Te comprometes a registrar solo perros que te pertenecen y a usar la app de buena fe. El mal uso puede resultar en eliminación de registros y bloqueo.</p>

              <p><strong>6. Renuncia a Reclamos</strong><br />
              Al usar TINO ID renuncias expresamente a cualquier derecho de demandar o reclamar contra los creadores de la aplicación por cualquier motivo.</p>
            </div>

            <button onClick={() => setShowTerms(false)} className="w-full mt-10 py-5 bg-emerald-600 rounded-3xl font-semibold text-lg">
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* ====================== POLÍTICA DE PRIVACIDAD ====================== */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
          <div className="bg-zinc-900 rounded-3xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Política de Privacidad</h2>
            
            <div className="text-sm text-zinc-300 leading-relaxed space-y-6">
              <p><strong>Última actualización:</strong> Abril 2026</p>

              <p>TINO ID recopila nombre del perro, número de WhatsApp, fotos de nariz y vectores de características generados por IA.</p>

              <p>Esta información se utiliza exclusivamente para permitir la identificación del perro en caso de pérdida.</p>

              <p>Al registrar un perro, autorizas expresamente el almacenamiento y la divulgación pública de tu número de WhatsApp cuando alguien encuentre al perro y tome una foto de su nariz.</p>

              <p>TINO ID no garantiza la confidencialidad absoluta ni se hace responsable por el uso que terceros hagan de la información.</p>

              <p>Los usuarios aceptan que TINO ID puede dejar de funcionar o desaparecer sin previo aviso, sin derecho a reclamo.</p>
            </div>

            <button onClick={() => setShowPrivacy(false)} className="w-full mt-10 py-5 bg-emerald-600 rounded-3xl font-semibold text-lg">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}