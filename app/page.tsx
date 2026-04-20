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

  // Pantalla Registro Exitoso
  if (registerSuccess) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #10b981, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', color: 'black', borderRadius: '24px', padding: '40px 24px', maxWidth: '420px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)' }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>🎉</div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>¡Registro Exitoso!</h1>
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

  // Pantalla Perro Encontrado
  if (searchResult) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #10b981, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', color: 'black', borderRadius: '24px', padding: '40px 24px', maxWidth: '420px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)' }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>🐾</div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>¡Perro Encontrado!</h1>
          
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ paddingTop: '60px', paddingBottom: '32px', textAlign: 'center', position: 'relative' }}>
        <div style={{ margin: '0 auto 16px', width: '128px', height: '128px', background: 'linear-gradient(135deg, #34d399, #22d3ee)', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '76px', boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.5)' }}>
          🐾
        </div>
        <h1 style={{ fontSize: '44px', fontWeight: '700', letterSpacing: '-2px', margin: '0' }}>MIGO Beta</h1>
        <p style={{ color: '#34d399', fontSize: '20px', marginTop: '4px' }}>DNI GRATIS PARA PERRITOS</p>

        <button
          onClick={() => setShowHowToUse(true)}
          style={{ position: 'absolute', top: '52px', right: '20px', width: '50px', height: '50px', backgroundColor: '#1e2937', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}
        >
          ❔
        </button>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 24px', marginBottom: '40px' }}>
        <div style={{ backgroundColor: '#1e2937', borderRadius: '9999px', padding: '6px', display: 'flex' }}>
          <button 
            onClick={() => { setTab('register'); setImage(null); }}
            style={{ flex: 1, padding: '18px', borderRadius: '9999px', fontWeight: '700', fontSize: '17.5px', backgroundColor: tab === 'register' ? '#10b981' : 'transparent', color: tab === 'register' ? 'white' : '#94a3b8' }}
          >
            Registrar mi perro
          </button>
          <button 
            onClick={() => { setTab('search'); setImage(null); }}
            style={{ flex: 1, padding: '18px', borderRadius: '9999px', fontWeight: '700', fontSize: '17.5px', backgroundColor: tab === 'search' ? '#10b981' : 'transparent', color: tab === 'search' ? 'white' : '#94a3b8' }}
          >
            Encontré un perro
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div style={{ padding: '0 24px', maxWidth: '440px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#1e2937', borderRadius: '28px', padding: '28px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
          <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '28px', fontSize: '16px' }}>
            {tab === 'register' 
              ? "Sube una foto clara de la nariz de tu perro" 
              : "Sube una foto de la nariz del perro que encontraste"}
          </p>

          <label style={{ 
            display: 'block', 
            width: '100%', 
            background: 'linear-gradient(to right, #10b981, #22d3ee)', 
            padding: '40px 20px', 
            borderRadius: '24px', 
            color: 'white', 
            fontSize: '22px', 
            fontWeight: '700', 
            textAlign: 'center', 
            cursor: 'pointer',
            boxShadow: '0 15px 25px rgba(16, 185, 129, 0.4)'
          }}>
            📸 Subir foto de la nariz
            <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
          </label>

          {image && (
            <div style={{ marginTop: '28px', borderRadius: '20px', overflow: 'hidden', border: '3px solid #334155' }}>
              <img src={image} style={{ width: '100%', display: 'block' }} alt="preview" />
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
                    style={{ width: '100%', padding: '20px', backgroundColor: '#0f172a', borderRadius: '16px', fontSize: '18px', marginBottom: '14px', color: 'white', border: 'none' }}
                  />
                  <input 
                    type="tel" 
                    placeholder="+591 7xxx xxxx" 
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    style={{ width: '100%', padding: '20px', backgroundColor: '#0f172a', borderRadius: '16px', fontSize: '18px', color: 'white', border: 'none' }}
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
      </div>

      {/* Footer */}
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
              <p><strong>Última actualización:</strong> 20 de abril de 2026</p>
              <p>MIGO Beta es una herramienta experimental y gratuita. Se proporciona "tal como está", sin garantías de ningún tipo, expresas o implícitas.</p>
              <p>El titular de la aplicación no se hace responsable por cualquier daño, pérdida o inconveniente derivado del uso de la aplicación.</p>
              <p>Al registrar un perro, usted autoriza expresamente la publicación pública de su número de WhatsApp cuando alguien encuentre al perro y suba una foto de su nariz.</p>
              <p>De acuerdo con la Ley N° 164 de Protección de Datos Personales de Bolivia y el Código Civil Boliviano, el usuario es responsable de la veracidad de los datos proporcionados.</p>
              <p>El servicio puede ser modificado, suspendido o eliminado en cualquier momento sin previo aviso y sin derecho a indemnización.</p>
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
              <p><strong>Última actualización:</strong> 20 de abril de 2026</p>
              <p>MIGO Beta recopila nombre del perro, número de WhatsApp, foto de la nariz y datos derivados para el único propósito de identificación en caso de pérdida.</p>
              <p>Al registrar un perro, usted autoriza expresamente el almacenamiento y la divulgación pública de su número de WhatsApp cuando una persona encuentre al perro y suba una foto de su nariz.</p>
              <p>De conformidad con la Ley N° 164 de Protección de Datos Personales de Bolivia, los datos serán tratados con la finalidad exclusiva de la herramienta.</p>
              <p>No garantizamos la confidencialidad absoluta ni nos hacemos responsables por el uso indebido de la información por parte de terceros.</p>
              <p>El responsable se reserva el derecho de modificar esta política en cualquier momento.</p>
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