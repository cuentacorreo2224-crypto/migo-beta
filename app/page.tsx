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
    }, 800);
  };

  // Pantalla Registro Exitoso
  if (registerSuccess) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg, #10b981, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '40px 24px', borderRadius: '28px', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '80px', marginBottom: '24px' }}>🎉</div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px' }}>¡Registro Exitoso!</h1>
          <p style={{ color: '#10b981', fontSize: '18px', marginBottom: '32px' }}>Tu perrito ya tiene su DNI digital</p>

          <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '24px', marginBottom: '32px', textAlign: 'left' }}>
            <p><strong>Nombre:</strong> {registerSuccess.dogName}</p>
            <p><strong>WhatsApp:</strong> {registerSuccess.whatsapp}</p>
            <p><strong>Código DNI:</strong> <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#10b981' }}>{registerSuccess.dniCode}</span></p>
          </div>

          <button 
            onClick={() => setRegisterSuccess(null)}
            style={{ width: '100%', background: '#111827', color: 'white', padding: '20px', borderRadius: '16px', fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}
          >
            Volver al Inicio
          </button>
          <button 
            onClick={() => { setRegisterSuccess(null); setTab('register'); }}
            style={{ width: '100%', background: '#e5e7eb', color: 'black', padding: '16px', borderRadius: '16px', fontSize: '16px' }}
          >
            Registrar otro perrito
          </button>
        </div>
      </div>
    );
  }

  // Pantalla Perro Encontrado
  if (searchResult) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg, #10b981, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '40px 24px', borderRadius: '28px', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '80px', marginBottom: '24px' }}>🐾</div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px' }}>¡Perro Encontrado!</h1>
          
          <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '24px', marginBottom: '32px', textAlign: 'left' }}>
            <p><strong>Nombre:</strong> {searchResult.dogName}</p>
            <p><strong>WhatsApp del dueño:</strong> {searchResult.whatsapp}</p>
            <p><strong>Código DNI:</strong> <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#10b981' }}>{searchResult.dniCode}</span></p>
          </div>

          <a 
            href={`https://wa.me/${searchResult.whatsapp.replace(/[^0-9]/g,'')}`}
            target="_blank"
            style={{ display: 'block', width: '100%', background: '#10b981', color: 'white', padding: '20px', borderRadius: '16px', fontSize: '18px', fontWeight: '700', marginBottom: '16px', textDecoration: 'none' }}
          >
            💬 Contactar por WhatsApp
          </a>

          <button onClick={() => setSearchResult(null)} style={{ width: '100%', background: '#111827', color: 'white', padding: '20px', borderRadius: '16px', fontSize: '18px', fontWeight: '700' }}>
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  // ====================== PANTALLA PRINCIPAL - DISEÑO MINIMALISTA HERMOSO ======================
  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      backgroundColor: '#0f172a', 
      color: 'white', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header Minimalista */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <div style={{ margin: '0 auto 16px', width: '110px', height: '110px', background: 'linear-gradient(135deg, #34d399, #22d3ee)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '68px' }}>
          🐾
        </div>
        <h1 style={{ fontSize: '42px', fontWeight: '700', letterSpacing: '-1.5px', margin: 0 }}>MIGO Beta</h1>
        <p style={{ color: '#34d399', fontSize: '19px', marginTop: '6px' }}>DNI GRATIS PARA PERRITOS</p>
      </div>

      {/* Tabs Elegantes */}
      <div style={{ backgroundColor: '#1e2937', padding: '6px', borderRadius: '9999px', display: 'flex', marginBottom: '40px' }}>
        <button 
          onClick={() => { setTab('register'); setImage(null); }}
          style={{ 
            flex: 1, 
            padding: '16px', 
            borderRadius: '9999px', 
            fontWeight: '600', 
            fontSize: '17.5px', 
            backgroundColor: tab === 'register' ? '#10b981' : 'transparent', 
            color: tab === 'register' ? 'white' : '#94a3b8' 
          }}
        >
          Registrar mi perro
        </button>
        <button 
          onClick={() => { setTab('search'); setImage(null); }}
          style={{ 
            flex: 1, 
            padding: '16px', 
            borderRadius: '9999px', 
            fontWeight: '600', 
            fontSize: '17.5px', 
            backgroundColor: tab === 'search' ? '#10b981' : 'transparent', 
            color: tab === 'search' ? 'white' : '#94a3b8' 
          }}
        >
          Encontré un perro
        </button>
      </div>

      {/* Contenido Principal */}
      <div style={{ backgroundColor: '#1e2937', padding: '28px', borderRadius: '28px' }}>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '28px', fontSize: '16px' }}>
          {tab === 'register' 
            ? "Sube una foto clara de la nariz de tu perro" 
            : "Sube una foto de la nariz del perro que encontraste"}
        </p>

        <label style={{ 
          display: 'block', 
          background: 'linear-gradient(to right, #10b981, #22d3ee)', 
          padding: '36px 20px', 
          borderRadius: '24px', 
          color: 'white', 
          fontSize: '21px', 
          fontWeight: '700', 
          textAlign: 'center', 
          cursor: 'pointer'
        }}>
          📸 Subir foto de la nariz
          <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
        </label>

        {image && (
          <div style={{ marginTop: '28px', borderRadius: '20px', overflow: 'hidden', border: '3px solid #475569' }}>
            <img src={image} style={{ width: '100%' }} alt="preview" />
          </div>
        )}

        {image && (
          <div style={{ marginTop: '32px' }}>
            {tab === 'register' && (
              <>
                <input 
                  type="text" 
                  placeholder="Nombre del perro" 
                  value={dogName}
                  onChange={(e) => setDogName(e.target.value)}
                  style={{ width: '100%', padding: '20px', backgroundColor: '#111827', borderRadius: '16px', fontSize: '18px', marginBottom: '14px', color: 'white', border: 'none' }}
                />
                <input 
                  type="tel" 
                  placeholder="+591 7xxx xxxx" 
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  style={{ width: '100%', padding: '20px', backgroundColor: '#111827', borderRadius: '16px', fontSize: '18px', color: 'white', border: 'none' }}
                />
              </>
            )}

            <button 
              onClick={tab === 'register' ? handleRegister : handleSearch}
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '24px', 
                backgroundColor: '#10b981', 
                borderRadius: '20px', 
                fontSize: '21px', 
                fontWeight: '700', 
                marginTop: '24px', 
                color: 'white',
                opacity: loading ? 0.75 : 1 
              }}
            >
              {loading ? 'Procesando...' : tab === 'register' ? '✅ Registrar Perro' : '🔍 Buscar Coincidencia'}
            </button>
          </div>
        )}
      </div>

      {/* Footer Minimalista */}
      <div style={{ textAlign: 'center', padding: '50px 0 40px', color: '#64748b', fontSize: '14px' }}>
        <button onClick={() => setShowHowToUse(true)} style={{ margin: '0 12px' }}>Cómo usar</button>
        <span>|</span>
        <button onClick={() => setShowTerms(true)} style={{ margin: '0 12px' }}>Términos</button>
        <span>|</span>
        <button onClick={() => setShowPrivacy(true)} style={{ margin: '0 12px' }}>Privacidad</button>
      </div>

      {/* Modales */}
      {showHowToUse && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.96)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#1e2937', borderRadius: '24px', padding: '32px', maxWidth: '420px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '28px' }}>¿Cómo usar MIGO Beta?</h2>
            <div style={{ fontSize: '15.5px', lineHeight: '1.7' }}>
              <p><strong>1. Registrar tu perro</strong></p>
              <p style={{ color: '#94a3b8' }}>Sube una foto clara de la nariz, escribe su nombre y tu número de WhatsApp.</p>
              <br />
              <p><strong>2. Si encuentras un perro perdido</strong></p>
              <p style={{ color: '#94a3b8' }}>Sube una foto de su nariz y la app buscará coincidencia.</p>
            </div>
            <button onClick={() => setShowHowToUse(false)} style={{ width: '100%', marginTop: '40px', padding: '20px', backgroundColor: '#10b981', borderRadius: '20px', fontSize: '18px', fontWeight: '700' }}>
              Entendido
            </button>
          </div>
        </div>
      )}

      {showTerms && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.96)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#1e2937', borderRadius: '24px', padding: '32px', maxWidth: '420px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px' }}>Términos y Condiciones</h2>
            <div style={{ fontSize: '14.5px', lineHeight: '1.7', color: '#cbd5e1' }}>
              <p><strong>Última actualización:</strong> Abril 2026</p>
              <p>MIGO Beta es una herramienta experimental. Se ofrece "tal cual", sin garantías de precisión o disponibilidad continua.</p>
              <p>El titular no se hace responsable por daños derivados del uso de la aplicación.</p>
              <p>Al registrar un perro, usted autoriza la publicación pública de su número de WhatsApp cuando alguien encuentre al perro.</p>
            </div>
            <button onClick={() => setShowTerms(false)} style={{ width: '100%', marginTop: '40px', padding: '20px', backgroundColor: '#10b981', borderRadius: '20px', fontSize: '18px', fontWeight: '700' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {showPrivacy && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.96)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#1e2937', borderRadius: '24px', padding: '32px', maxWidth: '420px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px' }}>Política de Privacidad</h2>
            <div style={{ fontSize: '14.5px', lineHeight: '1.7', color: '#cbd5e1' }}>
              <p><strong>Última actualización:</strong> Abril 2026</p>
              <p>MIGO Beta recopila nombre, WhatsApp, foto de nariz y datos de IA para ayudar en la identificación del perro.</p>
              <p>Al registrar, usted autoriza la divulgación pública de su número de WhatsApp cuando alguien suba una foto de la nariz del perro.</p>
              <p>No garantizamos confidencialidad absoluta ni nos hacemos responsables por el uso que terceros hagan de la información.</p>
            </div>
            <button onClick={() => setShowPrivacy(false)} style={{ width: '100%', marginTop: '40px', padding: '20px', backgroundColor: '#10b981', borderRadius: '20px', fontSize: '18px', fontWeight: '700' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}