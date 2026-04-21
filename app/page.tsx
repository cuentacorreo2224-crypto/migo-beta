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

  // ====================== PANTALLAS DE ÉXITO ======================
  if (registerSuccess) {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '40px 24px', borderRadius: '24px', maxWidth: '420px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>🎉</div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px' }}>¡Registro Exitoso!</h1>
          <p style={{ color: '#10b981', fontSize: '18px', marginBottom: '32px' }}>Tu perrito ya tiene su DNI digital</p>

          <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '24px', marginBottom: '32px', textAlign: 'left' }}>
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

  if (searchResult) {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '40px 24px', borderRadius: '24px', maxWidth: '420px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
          <div style={{ fontSize: '80px', marginBottom: '24px' }}>🐾</div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px' }}>¡Perro Encontrado!</h1>
          
          <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '24px', marginBottom: '32px', textAlign: 'left' }}>
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

  // ====================== PANTALLA PRINCIPAL ======================
  return (
    <div style={{ 
      position: 'fixed',
      inset: 0,
      backgroundColor: '#0f172a',
      color: 'white',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '70px', marginBottom: '12px' }}>🐾</div>
        <h1 style={{ fontSize: '40px', fontWeight: '700', margin: 0 }}>MIGO Beta</h1>
        <p style={{ color: '#34d399', fontSize: '20px' }}>DNI GRATIS PARA PERRITOS</p>
      </div>

      <div style={{ backgroundColor: '#1e2937', padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
        <button 
          onClick={() => { setTab('register'); setImage(null); }}
          style={{ width: '100%', padding: '18px', marginBottom: '10px', backgroundColor: tab === 'register' ? '#10b981' : '#334155', color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: '600' }}
        >
          Registrar mi perro
        </button>
        <button 
          onClick={() => { setTab('search'); setImage(null); }}
          style={{ width: '100%', padding: '18px', backgroundColor: tab === 'search' ? '#10b981' : '#334155', color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: '600' }}
        >
          Encontré un perro
        </button>
      </div>

      <div style={{ backgroundColor: '#1e2937', padding: '24px', borderRadius: '16px' }}>
        <p style={{ textAlign: 'center', marginBottom: '24px', color: '#94a3b8', fontSize: '16px' }}>
          {tab === 'register' 
            ? "Sube una foto clara de la nariz de tu perro" 
            : "Sube una foto de la nariz del perro que encontraste"}
        </p>

        <label style={{ 
          display: 'block', 
          backgroundColor: '#10b981', 
          color: 'white', 
          padding: '36px 20px', 
          borderRadius: '16px', 
          fontSize: '21px', 
          fontWeight: '700', 
          textAlign: 'center', 
          cursor: 'pointer',
          boxShadow: '0 10px 20px rgba(16, 185, 129, 0.4)'
        }}>
          📸 Subir foto de la nariz
          <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
        </label>

        {image && (
          <div style={{ marginTop: '24px', borderRadius: '16px', overflow: 'hidden', border: '3px solid #475569' }}>
            <img src={image} style={{ width: '100%' }} alt="preview" />
          </div>
        )}

        {image && (
          <div style={{ marginTop: '28px' }}>
            {tab === 'register' && (
              <>
                <input 
                  type="text" 
                  placeholder="Nombre del perro" 
                  value={dogName}
                  onChange={(e) => setDogName(e.target.value)}
                  style={{ width: '100%', padding: '18px', backgroundColor: '#111827', borderRadius: '12px', fontSize: '18px', marginBottom: '12px', color: 'white', border: 'none' }}
                />
                <input 
                  type="tel" 
                  placeholder="+591 7xxx xxxx" 
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  style={{ width: '100%', padding: '18px', backgroundColor: '#111827', borderRadius: '12px', fontSize: '18px', color: 'white', border: 'none' }}
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
                borderRadius: '16px', 
                fontSize: '20px', 
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
              <p>MIGO Beta es una herramienta experimental. Se ofrece "tal cual", sin garantías de precisión, disponibilidad o funcionamiento continuo.</p>
              <p>El titular de la aplicación no se hace responsable por cualquier daño, pérdida o inconveniente derivado del uso de la aplicación.</p>
              <p>Al registrar un perro, usted autoriza expresamente la publicación pública de su número de WhatsApp cuando alguien encuentre al perro y suba una foto de su nariz.</p>
              <p>De acuerdo con la Ley N° 164 de Protección de Datos Personales de Bolivia y el Código Civil, el usuario es responsable de la veracidad de los datos proporcionados.</p>
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
              <p>MIGO Beta recopila nombre del perro, número de WhatsApp, foto de la nariz y datos generados por IA para el único fin de identificación en caso de pérdida.</p>
              <p>Al registrar un perro, usted autoriza expresamente que su número de WhatsApp sea mostrado públicamente cuando alguien suba una foto de la nariz del perro.</p>
              <p>No garantizamos la confidencialidad absoluta ni nos hacemos responsables por el uso que terceros hagan de la información publicada.</p>
              <p>De conformidad con la Ley N° 164 de Protección de Datos Personales de Bolivia, los datos serán tratados con la finalidad exclusiva de esta herramienta.</p>
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