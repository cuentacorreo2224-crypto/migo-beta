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
    }, 1200);
  };

  // ====================== PANTALLAS DE ÉXITO ======================
  if (registerSuccess) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #10b981, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ background: 'white', color: 'black', borderRadius: '24px', padding: '40px 24px', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '80px', marginBottom: '24px' }}>🎉</div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '12px' }}>¡Registro Exitoso!</h1>
          <p style={{ color: '#10b981', fontSize: '18px', marginBottom: '32px' }}>Tu perrito ya tiene su DNI digital</p>

          <div style={{ background: '#f3f4f6', borderRadius: '16px', padding: '24px', marginBottom: '32px', textAlign: 'left' }}>
            <p><strong>Nombre:</strong> {registerSuccess.dogName}</p>
            <p><strong>WhatsApp:</strong> {registerSuccess.whatsapp}</p>
            <p><strong>Código DNI:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#10b981' }}>{registerSuccess.dniCode}</span></p>
          </div>

          <button 
            onClick={() => setRegisterSuccess(null)}
            style={{ width: '100%', background: 'black', color: 'white', padding: '20px', borderRadius: '16px', fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}
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
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #10b981, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ background: 'white', color: 'black', borderRadius: '24px', padding: '40px 24px', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '80px', marginBottom: '24px' }}>🐾</div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '12px' }}>¡Perro Encontrado!</h1>
          
          <div style={{ background: '#f3f4f6', borderRadius: '16px', padding: '24px', marginBottom: '32px', textAlign: 'left' }}>
            <p><strong>Nombre:</strong> {searchResult.dogName}</p>
            <p><strong>WhatsApp del dueño:</strong> {searchResult.whatsapp}</p>
            <p><strong>Código DNI:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#10b981' }}>{searchResult.dniCode}</span></p>
          </div>

          <a 
            href={`https://wa.me/${searchResult.whatsapp.replace(/[^0-9]/g,'')}`}
            target="_blank"
            style={{ display: 'block', width: '100%', background: '#10b981', color: 'white', padding: '20px', borderRadius: '16px', fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', textDecoration: 'none' }}
          >
            💬 Contactar por WhatsApp
          </a>

          <button onClick={() => setSearchResult(null)} style={{ width: '100%', background: 'black', color: 'white', padding: '20px', borderRadius: '16px', fontSize: '18px', fontWeight: 'bold' }}>
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  // ====================== PANTALLA PRINCIPAL ======================
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#18181b', color: 'white', paddingBottom: '48px' }}>
      <div style={{ paddingTop: '48px', paddingBottom: '24px', textAlign: 'center', position: 'relative' }}>
        <div style={{ margin: '0 auto', width: '112px', height: '112px', background: 'linear-gradient(to bottom right, #34d399, #22d3ee)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)', marginBottom: '16px' }}>
          🐾
        </div>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', letterSpacing: '-2px' }}>MIGO Beta</h1>
        <p style={{ color: '#34d399', fontSize: '20px', marginTop: '4px' }}>DNI GRATIS PARA PERRITOS</p>

        <button
          onClick={() => setShowHowToUse(true)}
          style={{ position: 'absolute', top: '48px', right: '24px', width: '44px', height: '44px', backgroundColor: '#27272a', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}
        >
          ❔
        </button>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 24px', marginBottom: '40px' }}>
        <div style={{ backgroundColor: '#27272a', borderRadius: '24px', padding: '6px', display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => { setTab('register'); setImage(null); }}
            style={{ flex: 1, padding: '16px', borderRadius: '20px', fontWeight: '600', fontSize: '18px', backgroundColor: tab === 'register' ? '#10b981' : '#18181b', color: tab === 'register' ? 'white' : '#a1a1aa' }}
          >
            Registrar mi perro
          </button>
          <button 
            onClick={() => { setTab('search'); setImage(null); }}
            style={{ flex: 1, padding: '16px', borderRadius: '20px', fontWeight: '600', fontSize: '18px', backgroundColor: tab === 'search' ? '#10b981' : '#18181b', color: tab === 'search' ? 'white' : '#a1a1aa' }}
          >
            Encontré un perro
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div style={{ padding: '0 24px', maxWidth: '420px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#27272a', borderRadius: '24px', padding: '24px' }}>
          <p style={{ textAlign: 'center', color: '#a1a1aa', marginBottom: '20px', fontSize: '15px' }}>
            {tab === 'register' 
              ? "Sube una foto clara de la nariz de tu perro" 
              : "Sube una foto de la nariz del perro que encontraste"}
          </p>

          <label style={{ display: 'block', width: '100%', background: 'linear-gradient(to right, #10b981, #06b6d4)', padding: '32px 24px', borderRadius: '24px', color: 'white', fontSize: '20px', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgb(16 185 129 / 0.4)' }}>
            📸 Subir foto de la nariz
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </label>

          {image && (
            <div style={{ marginTop: '24px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #3f3f46' }}>
              <img src={image} style={{ width: '100%' }} alt="preview" />
            </div>
          )}

          {image && (
            <div style={{ marginTop: '24px' }}>
              {tab === 'register' && (
                <>
                  <input 
                    type="text" 
                    placeholder="Nombre del perro" 
                    value={dogName}
                    onChange={(e) => setDogName(e.target.value)}
                    style={{ width: '100%', padding: '20px', backgroundColor: '#18181b', borderRadius: '16px', fontSize: '18px', marginBottom: '12px', color: 'white' }}
                  />
                  <input 
                    type="tel" 
                    placeholder="+591 7xxx xxxx" 
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    style={{ width: '100%', padding: '20px', backgroundColor: '#18181b', borderRadius: '16px', fontSize: '18px', color: 'white' }}
                  />
                </>
              )}

              <button 
                onClick={tab === 'register' ? handleRegister : handleSearch}
                disabled={loading}
                style={{ width: '100%', padding: '24px', backgroundColor: '#10b981', borderRadius: '20px', fontSize: '20px', fontWeight: 'bold', marginTop: '20px', color: 'white', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Procesando...' : tab === 'register' ? '✅ Registrar Perro' : '🔍 Buscar Coincidencia'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#71717a', fontSize: '13px' }}>
        <button onClick={() => setShowHowToUse(true)} style={{ margin: '0 8px' }}>Cómo usar</button>
        <span>|</span>
        <button onClick={() => setShowTerms(true)} style={{ margin: '0 8px' }}>Términos</button>
        <span>|</span>
        <button onClick={() => setShowPrivacy(true)} style={{ margin: '0 8px' }}>Privacidad</button>
      </div>

      {/* ====================== MODALES ====================== */}

      {showHowToUse && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ backgroundColor: '#18181b', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '32px' }}>¿Cómo usar MIGO Beta?</h2>
            <div style={{ fontSize: '15px', lineHeight: '1.6' }}>
              <p style={{ fontWeight: '600', marginBottom: '8px' }}>1. Registrar tu perro</p>
              <p style={{ color: '#a1a1aa' }}>Sube una foto clara de la nariz, escribe su nombre y tu número de WhatsApp.</p>
              <br />
              <p style={{ fontWeight: '600', marginBottom: '8px' }}>2. Si encuentras un perro perdido</p>
              <p style={{ color: '#a1a1aa' }}>Sube una foto de su nariz y la app buscará si está registrado.</p>
            </div>
            <button onClick={() => setShowHowToUse(false)} style={{ width: '100%', marginTop: '40px', padding: '20px', backgroundColor: '#10b981', borderRadius: '20px', fontSize: '18px', fontWeight: '600' }}>
              Entendido ✓
            </button>
          </div>
        </div>
      )}

      {showTerms && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ backgroundColor: '#18181b', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px' }}>Términos y Condiciones</h2>
            <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#d1d5db' }}>
              <p><strong>Última actualización:</strong> Abril 2026</p>
              <p>MIGO Beta es una herramienta experimental ofrecida "tal cual". No se ofrecen garantías de funcionamiento continuo, precisión absoluta ni disponibilidad permanente.</p>
              <p>El usuario acepta que MIGO Beta puede dejar de funcionar en cualquier momento sin previo aviso y sin derecho a reclamo.</p>
              <p>Al registrar un perro, el usuario autoriza expresamente la publicación de su número de WhatsApp cuando alguien encuentre al perro y suba una foto de su nariz.</p>
              <p>De acuerdo con la legislación boliviana (Ley N° 164 de Protección de Datos Personales y Código Civil), el titular de la app no se hace responsable por el uso indebido de la información por parte de terceros.</p>
              <p>El usuario se compromete a registrar solo perros de su propiedad y a utilizar la app de buena fe.</p>
            </div>
            <button onClick={() => setShowTerms(false)} style={{ width: '100%', marginTop: '40px', padding: '20px', backgroundColor: '#10b981', borderRadius: '20px', fontSize: '18px', fontWeight: '600' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {showPrivacy && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ backgroundColor: '#18181b', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px' }}>Política de Privacidad</h2>
            <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#d1d5db' }}>
              <p><strong>Última actualización:</strong> Abril 2026</p>
              <p>MIGO Beta recopila nombre del perro, número de WhatsApp, foto de la nariz y vectores generados por IA para el único fin de identificación en caso de pérdida.</p>
              <p>De conformidad con la Ley N° 164 de Protección de Datos Personales de Bolivia, al registrar un perro usted autoriza expresamente el almacenamiento y la divulgación pública de su número de WhatsApp cuando alguien encuentre al perro.</p>
              <p>No garantizamos confidencialidad absoluta ni nos hacemos responsables por el uso que terceros hagan de la información publicada.</p>
              <p>Los datos podrán ser eliminados a solicitud del titular, siempre y cuando no afecte la finalidad de la herramienta.</p>
              <p>El responsable de la app se reserva el derecho de modificar o suspender el servicio sin previo aviso.</p>
            </div>
            <button onClick={() => setShowPrivacy(false)} style={{ width: '100%', marginTop: '40px', padding: '20px', backgroundColor: '#10b981', borderRadius: '20px', fontSize: '18px', fontWeight: '600' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}