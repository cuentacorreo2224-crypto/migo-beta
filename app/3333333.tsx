'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MigoBeta() {
  const [tab, setTab] = useState<'register' | 'search'>('register');
  const [image, setImage] = useState<string | null>(null);
  const [dogName, setDogName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  
  const [registerSuccess, setRegisterSuccess] = useState<any>(null);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [showHowToUse, setShowHowToUse] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async () => {
    if (!image || !dogName.trim() || !whatsapp.trim()) {
      alert("Por favor sube una foto y completa el nombre y tu WhatsApp");
      return;
    }

    setLoading(true);

    try {
      const fileName = `migo-${Date.now()}.jpg`;
      const blob = await fetch(image).then(r => r.blob());

      const { error: uploadError } = await supabase.storage
        .from('tino-images')
        .upload(fileName, blob, { upsert: true });

      if (uploadError) throw new Error("No se pudo subir la foto");

      const { data: urlData } = supabase.storage
        .from('tino-images')
        .getPublicUrl(fileName);

      const dniCode = `MIGO-2026-${Math.floor(10000 + Math.random() * 90000)}`;

      const { error: dbError } = await supabase.from('pets').insert({
        dog_name: dogName.trim(),
        owner_whatsapp: whatsapp.replace(/\s+/g, ''),
        image_url: urlData.publicUrl,
        dni_code: dniCode
      });

      if (dbError) throw new Error("No se pudo guardar el registro");

      setRegisterSuccess({ 
        dogName: dogName.trim(), 
        whatsapp: whatsapp.trim(), 
        dniCode 
      });

      setImage(null);
      setDogName('');
      setWhatsapp('');

    } catch (error: any) {
      alert("Error al registrar:\n\n" + error.message);
    }

    setLoading(false);
  };

  const handleSearch = () => {
    if (!image) {
      alert("Por favor sube una foto de la nariz del perro encontrado");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setSearchResult({
        found: true,
        dogName: "Max",
        whatsapp: "+59171234567",
        dniCode: "MIGO-2026-58392"
      });
      setLoading(false);
    }, 1000);
  };

  // Pantalla Registro Exitoso
  if (registerSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-cyan-600 flex items-center justify-center p-6">
        <div className="bg-white text-black rounded-3xl p-10 max-w-md w-full text-center">
          <div className="text-8xl mb-6">🎉</div>
          <h1 className="text-4xl font-bold mb-3">¡Registro Exitoso!</h1>
          <p className="text-emerald-600 text-xl mb-8">Tu perrito ya tiene su DNI digital</p>

          <div className="bg-zinc-100 rounded-2xl p-6 mb-8 text-left space-y-3">
            <p><strong>Nombre:</strong> {registerSuccess.dogName}</p>
            <p><strong>WhatsApp:</strong> {registerSuccess.whatsapp}</p>
            <p><strong>Código DNI:</strong> <span className="font-mono font-bold text-emerald-600">{registerSuccess.dniCode}</span></p>
          </div>

          <div className="space-y-4">
            <button onClick={() => setRegisterSuccess(null)} className="w-full bg-black text-white py-5 rounded-2xl font-bold text-lg">
              Volver al Inicio
            </button>
            <button onClick={() => { setRegisterSuccess(null); setTab('register'); }} className="w-full bg-zinc-200 py-4 rounded-2xl font-medium text-black">
              Registrar otro perrito
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla Perro Encontrado
  if (searchResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-cyan-600 flex items-center justify-center p-6">
        <div className="bg-white text-black rounded-3xl p-10 max-w-md w-full text-center">
          <div className="text-8xl mb-6">🐾</div>
          <h1 className="text-4xl font-bold mb-3">¡Perro Encontrado!</h1>
          
          <div className="bg-zinc-100 rounded-2xl p-6 mb-8 text-left space-y-3">
            <p><strong>Nombre:</strong> {searchResult.dogName}</p>
            <p><strong>WhatsApp del dueño:</strong> {searchResult.whatsapp}</p>
            <p><strong>Código DNI:</strong> <span className="font-mono font-bold text-emerald-600">{searchResult.dniCode}</span></p>
          </div>

          <a 
            href={`https://wa.me/${searchResult.whatsapp.replace(/[^0-9]/g,'')}`}
            target="_blank"
            className="block w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold text-lg mb-4"
          >
            💬 Contactar por WhatsApp
          </a>

          <button onClick={() => setSearchResult(null)} className="w-full bg-black text-white py-5 rounded-2xl font-bold text-lg">
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-12">
      {/* Header */}
      <div className="pt-12 pb-6 text-center relative">
        <div className="mx-auto w-28 h-28 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-3xl flex items-center justify-center text-7xl shadow-2xl mb-4">
          🐾
        </div>
        <h1 className="text-6xl font-bold tracking-tighter">MIGO Beta</h1>
        <p className="text-emerald-400 text-xl mt-1">DNI GRATIS PARA PERRITOS</p>

        <button
          onClick={() => setShowHowToUse(true)}
          className="absolute top-12 right-6 w-11 h-11 bg-zinc-800 rounded-full flex items-center justify-center text-2xl hover:bg-zinc-700"
        >
          ❔
        </button>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-10">
        <div className="bg-zinc-900 rounded-3xl p-1.5 flex gap-2">
          <button 
            onClick={() => { setTab('register'); setImage(null); }}
            className={`flex-1 py-4 rounded-3xl font-semibold text-lg ${tab === 'register' ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}
          >
            Registrar mi perro
          </button>
          <button 
            onClick={() => { setTab('search'); setImage(null); }}
            className={`flex-1 py-4 rounded-3xl font-semibold text-lg ${tab === 'search' ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}
          >
            Encontré un perro
          </button>
        </div>
      </div>

      <div className="px-6 max-w-md mx-auto">
        <div className="bg-zinc-900 rounded-3xl p-6">
          <p className="text-center text-zinc-400 mb-5 text-sm">
            {tab === 'register' 
              ? "Sube una foto clara de la nariz de tu perro" 
              : "Sube una foto de la nariz del perro que encontraste"}
          </p>

          <label className="block w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-110 active:scale-95 transition-all py-8 rounded-3xl text-white text-xl font-bold shadow-lg shadow-emerald-500/40 cursor-pointer text-center">
            📸 Subir foto de la nariz
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>

          {image && (
            <div className="mt-6 rounded-2xl overflow-hidden border border-zinc-700">
              <img src={image} className="w-full" alt="preview" />
            </div>
          )}

          {image && (
            <div className="space-y-5 mt-6">
              {/* Solo mostrar campos en la pestaña Registrar */}
              {tab === 'register' && (
                <>
                  <input 
                    type="text" 
                    placeholder="Nombre del perro" 
                    value={dogName}
                    onChange={(e) => setDogName(e.target.value)}
                    className="w-full p-5 bg-zinc-800 rounded-2xl text-lg"
                  />
                  <input 
                    type="tel" 
                    placeholder="+591 7xxx xxxx" 
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full p-5 bg-zinc-800 rounded-2xl text-lg"
                  />
                </>
              )}

              <button 
                onClick={tab === 'register' ? handleRegister : handleSearch}
                disabled={loading}
                className="w-full py-6 bg-emerald-600 rounded-3xl text-xl font-bold disabled:opacity-70"
              >
                {loading ? 'Procesando...' : tab === 'register' ? '✅ Registrar Perro' : '🔍 Buscar Coincidencia'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-10 text-xs text-zinc-500 flex justify-center gap-4">
        <button onClick={() => setShowHowToUse(true)} className="hover:text-zinc-300">Cómo usar</button>
        <span>|</span>
        <button onClick={() => setShowTerms(true)} className="hover:text-zinc-300">Términos</button>
        <span>|</span>
        <button onClick={() => setShowPrivacy(true)} className="hover:text-zinc-300">Privacidad</button>
      </div>

      {/* ====================== MODALES ====================== */}

      {/* Cómo Usar */}
      {showHowToUse && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
          <div className="bg-zinc-900 rounded-3xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold text-center mb-8">¿Cómo usar MIGO Beta?</h2>
            
            <div className="space-y-8 text-sm leading-relaxed">
              <div>
                <p className="font-semibold mb-3">1. Registrar tu perro</p>
                <p className="text-zinc-400">Sube una foto clara de la nariz, escribe su nombre y tu número de WhatsApp.</p>
              </div>
              <div>
                <p className="font-semibold mb-3">2. Si encuentras un perro perdido</p>
                <p className="text-zinc-400">Sube una foto de su nariz y la app buscará si está registrado.</p>
              </div>
            </div>

            <button onClick={() => setShowHowToUse(false)} className="w-full mt-10 py-5 bg-emerald-600 rounded-3xl font-semibold text-lg">
              Entendido ✓
            </button>
          </div>
        </div>
      )}

      {/* Términos y Condiciones */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
          <div className="bg-zinc-900 rounded-3xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto text-sm leading-relaxed">
            <h2 className="text-2xl font-bold text-center mb-6">Términos y Condiciones</h2>
            <p className="mb-4"><strong>Última actualización:</strong> Abril 2026</p>
            <p>MIGO Beta es una herramienta experimental. Se ofrece "tal cual", sin garantías de precisión o disponibilidad continua.</p>
            <p className="mt-4">Los creadores no se hacen responsables por cualquier daño, pérdida o mal funcionamiento derivado del uso de la aplicación.</p>
            <p className="mt-4">Al registrar un perro autorizas que tu número de WhatsApp sea visible públicamente cuando alguien encuentre a tu perro.</p>
            <p className="mt-4">Te comprometes a usar la app de buena fe y a registrar solo perros que te pertenecen.</p>

            <button onClick={() => setShowTerms(false)} className="w-full mt-10 py-5 bg-emerald-600 rounded-3xl font-semibold text-lg">
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Política de Privacidad */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
          <div className="bg-zinc-900 rounded-3xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto text-sm leading-relaxed">
            <h2 className="text-2xl font-bold text-center mb-6">Política de Privacidad</h2>
            <p className="mb-4"><strong>Última actualización:</strong> Abril 2026</p>
            <p>MIGO Beta recopila nombre del perro, número de WhatsApp, foto de nariz y datos generados por IA.</p>
            <p className="mt-4">Esta información se utiliza exclusivamente para ayudar a identificar al perro en caso de pérdida.</p>
            <p className="mt-4">Al registrar un perro autorizas que tu número de WhatsApp sea mostrado públicamente cuando alguien tome una foto de su nariz.</p>
            <p className="mt-4">No garantizamos confidencialidad absoluta ni nos hacemos responsables del uso que terceros hagan de la información.</p>

            <button onClick={() => setShowPrivacy(false)} className="w-full mt-10 py-5 bg-emerald-600 rounded-3xl font-semibold text-lg">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}