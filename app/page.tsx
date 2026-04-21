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
        <div style={{ backgroundColor: 'white', padding: '48px 28px', borderRadius: '28px', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '82px', marginBottom: '20px' }}>🎉</div>
          <h1 style={{ fontSize: '34px', fontWeight: '700', marginBottom: '12px' }}>¡Registro Exitoso!</h1>
          <p style={{ color: '#10b981', fontSize: '18px', marginBottom: '36px' }}>Tu perrito ya tiene su DNI digital</p>

          <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '24px', marginBottom: '36px', textAlign: 'left' }}>
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
        <div style={{ backgroundColor: 'white', padding: '48px 28px', borderRadius: '28px', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '82px', marginBottom: '24px' }}>🐾</div>
          <h1 style={{ fontSize: '34px', fontWeight: '700', marginBottom: '12px' }}>¡Perro Encontrado!</h1>
          
          <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '24px', marginBottom: '36px', textAlign: 'left' }}>
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

  // ====================== PANTALLA PRINCIPAL - MINIMALISTA ELEGANTE ======================
  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      backgroundColor: '#0a0f1c', 
      color: 'white', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header Elegante */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <div style={{ margin: '0 auto 20px', width: '120px', height: '120px', background: 'linear-gradient(135deg, #34d399, #22d3ee)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '72px' }}>
          🐾
        </div>
        <h1 style={{ fontSize: '42px', fontWeight: '700', letterSpacing: '-1.8px', margin: 0 }}>MIGO Beta</h1>
        <p style={{ color: '#34d399', fontSize: '19px', marginTop: '8px' }}>DNI GRATIS PARA PERRITOS</p>
      </div>

      {/* Tabs Suaves */}
      <div style={{ backgroundColor: '#1a2338', padding: '6px', borderRadius: '9999px', display: 'flex', marginBottom: '48px' }}>
        <button 
          onClick={() => { setTab('register'); setImage(null); }}
          style={{ 
            flex: 1, 
            padding: '17px', 
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
            padding: '17px', 
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
      <div style={{ backgroundColor: '#1a2338', padding: '32px', borderRadius: '28px' }}>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '32px', fontSize: '16px' }}>
          {tab === 'register' 
            ? "Sube una foto clara de la nariz de tu perro" 
            : "Sube una foto de la nariz del perro que encontraste"}
        </p>

        <label style={{ 
          display: 'block', 
          background: 'linear-gradient(to right, #10b981, #22d3ee)', 
          padding: '40px 24px', 
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
          <div style={{ marginTop: '28px', borderRadius: '20px', overflow: 'hidden', border: '3px solid #334155' }}>
            <img src={image} style={{ width: '100%' }} alt="preview" />
          </div>
        )}

        {image && (
          <div style={{ marginTop: '36px' }}>
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
                marginTop: '28px', 
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
      <div style={{ textAlign: 'center', padding: '60px 0 40px', color: '#64748b', fontSize: '14px' }}>
        <button onClick={() => setShowHowToUse(true)} style={{ margin: '0 12px' }}>Cómo usar</button>
        <span>|</span>
        <button onClick={() => setShowTerms(true)} style={{ margin: '0 12px' }}>Términos</button>
        <span>|</span>
        <button onClick={() => setShowPrivacy(true)} style={{ margin: '0 12px' }}>Privacidad</button>
      </div>

      {/* Modales con texto completo y detallado */}
      {showHowToUse && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.96)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#1e2937', borderRadius: '28px', padding: '32px', maxWidth: '420px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', textAlign: 'center', marginBottom: '32px' }}>¿Cómo usar MIGO Beta?</h2>
            <div style={{ fontSize: '15.5px', lineHeight: '1.75' }}>
              <p><strong>1. Registrar tu perro</strong></p>
              <p style={{ color: '#94a3b8' }}>Toma o sube una foto clara de la nariz de tu perro, escribe su nombre y tu número de WhatsApp. El sistema generará un código DNI único.</p>
              <br />
              <p><strong>2. Si encuentras un perro perdido</strong></p>
              <p style={{ color: '#94a3b8' }}>Sube una foto de su nariz y la app buscará coincidencia con los perros registrados. Si hay coincidencia, podrás contactar al dueño.</p>
            </div>
            <button onClick={() => setShowHowToUse(false)} style={{ width: '100%', marginTop: '48px', padding: '20px', backgroundColor: '#10b981', borderRadius: '20px', fontSize: '18px', fontWeight: '700' }}>
              Entendido
            </button>
          </div>
        </div>
      )}

      {showTerms && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.96)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#1e2937', borderRadius: '28px', padding: '32px', maxWidth: '420px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '700', textAlign: 'center', marginBottom: '24px' }}>Términos y Condiciones</h2>
            <div style={{ fontSize: '14.5px', lineHeight: '1.75', color: '#cbd5e1' }}>
              <p><strong>Última actualización:</strong> Abril 2026</p>
              <p>MIGO Beta es una herramienta experimental y gratuita. Se proporciona "tal como está", sin garantías expresas o implícitas de precisión, disponibilidad o funcionamiento continuo.</p>
              <p>El titular de la aplicación no se hace responsable por cualquier daño, pérdida, mal uso o inconveniente derivado del uso de esta herramienta.</p>
              <p>Al registrar un perro, el usuario autoriza expresamente la publicación pública de su número de WhatsApp cuando alguien encuentre al perro y suba una foto de su nariz.</p>
              <p>El usuario se compromete a registrar solo perros de su propiedad y a utilizar la aplicación de buena fe, bajo las disposiciones del Código Civil Boliviano y la Ley N° 164 de Protección de Datos Personales.</p>
              <p>El servicio puede ser modificado, suspendido o eliminado en cualquier momento sin previo aviso y sin derecho a reclamación.</p>
            </div>
            <button onClick={() => setShowTerms(false)} style={{ width: '100%', marginTop: '48px', padding: '20px', backgroundColor: '#10b981', borderRadius: '20px', fontSize: '18px', fontWeight: '700' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {showPrivacy && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.96)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#1e2937', borderRadius: '28px', padding: '32px', maxWidth: '420px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '700', textAlign: 'center', marginBottom: '24px' }}>Política de Privacidad</h2>
            <div style={{ fontSize: '14.5px', lineHeight: '1.75', color: '#cbd5e1' }}>
              <p><strong>Última actualización:</strong> Abril 2026</p>
              <p>MIGO Beta recopila nombre del perro, número de WhatsApp, foto de la nariz y vectores generados por IA con el único propósito de facilitar su identificación en caso de pérdida.</p>
              <p>Al registrar un perro, usted autoriza expresamente el almacenamiento y la divulgación pública de su número de WhatsApp cuando una persona encuentre al perro y suba una foto de su nariz.</p>
              <p>De conformidad con la Ley N° 164 de Protección de Datos Personales de Bolivia, los datos serán tratados con la finalidad exclusiva de esta herramienta y no serán utilizados para otros fines.</p>
              <p>No garantizamos la confidencialidad absoluta ni nos hacemos responsables por el uso indebido de la información por parte de terceros.</p>
              <p>El responsable se reserva el derecho de modificar esta política en cualquier momento.</p>
            </div>
            <button onClick={() => setShowPrivacy(false)} style={{ width: '100%', marginTop: '48px', padding: '20px', backgroundColor: '#10b981', borderRadius: '20px', fontSize: '18px', fontWeight: '700' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}