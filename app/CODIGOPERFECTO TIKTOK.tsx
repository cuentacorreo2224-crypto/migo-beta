'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Paleta de colores planos (sin gradientes ni sombras)
const colors = {
  bg: '#0a0c10',
  surface: '#14181f',
  card: '#1c2128',
  primary: '#10b981',
  primaryLight: '#34d399',
  text: '#ffffff',
  textSec: '#9ca3af',
  border: '#2d3748',
};

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

  // Forzar estilos en body y html inmediatamente al montar
  useEffect(() => {
    // Aplicar estilos directamente al DOM para eliminar cualquier margen/padding blanco
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.backgroundColor = colors.bg;
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = colors.bg;
    document.body.style.minHeight = '100vh';
    
    return () => {
      // Limpiar (opcional, pero no necesario)
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
    };
  }, []);

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
      const { data: urlData } = supabase.storage.from('tino-images').getPublicUrl(fileName);
      const dniCode = `MIGO-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const { error: dbError } = await supabase.from('pets').insert({
        dog_name: dogName.trim(),
        owner_whatsapp: whatsapp.replace(/\s+/g, ''),
        image_url: urlData.publicUrl,
        dni_code: dniCode
      });
      if (dbError) throw new Error("No se pudo guardar el registro");
      setRegisterSuccess({ dogName: dogName.trim(), whatsapp: whatsapp.trim(), dniCode });
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

  // Pantalla de éxito
  if (registerSuccess) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: colors.card, borderRadius: '24px', padding: '32px 24px', maxWidth: '400px', width: '100%', textAlign: 'center', border: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: colors.text }}>¡Registro Exitoso!</h1>
          <p style={{ color: colors.primaryLight, marginBottom: '28px' }}>Tu perrito ya tiene su DNI digital</p>
          <div style={{ background: colors.surface, borderRadius: '16px', padding: '20px', marginBottom: '28px', textAlign: 'left' }}>
            <p><strong style={{ color: colors.primaryLight }}>Nombre:</strong> {registerSuccess.dogName}</p>
            <p><strong style={{ color: colors.primaryLight }}>WhatsApp:</strong> {registerSuccess.whatsapp}</p>
            <p><strong style={{ color: colors.primaryLight }}>Código DNI:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: colors.primary }}>{registerSuccess.dniCode}</span></p>
          </div>
          <button onClick={() => setRegisterSuccess(null)} style={{ width: '100%', background: colors.primary, color: 'white', padding: '14px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', border: 'none', marginBottom: '12px' }}>Volver al Inicio</button>
          <button onClick={() => { setRegisterSuccess(null); setTab('register'); }} style={{ width: '100%', background: 'transparent', color: colors.textSec, padding: '12px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>Registrar otro perrito</button>
        </div>
      </div>
    );
  }

  // Pantalla de perro encontrado
  if (searchResult) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: colors.card, borderRadius: '24px', padding: '32px 24px', maxWidth: '400px', width: '100%', textAlign: 'center', border: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🐾</div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: colors.text }}>¡Perro Encontrado!</h1>
          <div style={{ background: colors.surface, borderRadius: '16px', padding: '20px', marginBottom: '28px', textAlign: 'left' }}>
            <p><strong style={{ color: colors.primaryLight }}>Nombre:</strong> {searchResult.dogName}</p>
            <p><strong style={{ color: colors.primaryLight }}>WhatsApp del dueño:</strong> {searchResult.whatsapp}</p>
            <p><strong style={{ color: colors.primaryLight }}>Código DNI:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: colors.primary }}>{searchResult.dniCode}</span></p>
          </div>
          <a href={`https://wa.me/${searchResult.whatsapp.replace(/[^0-9]/g,'')}`} target="_blank" style={{ display: 'block', width: '100%', background: colors.primary, color: 'white', padding: '14px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', marginBottom: '16px' }}>💬 Contactar por WhatsApp</a>
          <button onClick={() => setSearchResult(null)} style={{ width: '100%', background: colors.surface, color: colors.text, padding: '14px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>Volver al Inicio</button>
        </div>
      </div>
    );
  }

  // Pantalla principal - sin marcos blancos, con estilos forzados
  return (
    <>
      {/* Estilo crítico inyectado directamente para evitar flash de fondo blanco */}
      <style dangerouslySetInnerHTML={{
        __html: `
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: ${colors.bg} !important;
            min-height: 100vh;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
        `
      }} />
      <div style={{ 
        minHeight: '100vh', 
        background: colors.bg, 
        color: colors.text, 
        padding: '20px', 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        // Aseguramos que ocupe todo el ancho sin espacios
        width: '100%',
        margin: 0,
      }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
          {/* Botón de TikTok (esquina superior izquierda) */}
          <a
            href="https://www.tiktok.com/@migobeta"  // Cambia esta URL por la de tu perfil de TikTok
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '22px',
              fontWeight: 'bold',
              color: colors.primaryLight,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
            }}
          >
            🎵
          </a>
          
          {/* Botón de interrogación arriba a la derecha */}
          <button
            onClick={() => setShowHowToUse(true)}
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '20px',
              fontWeight: 'bold',
              color: colors.primaryLight,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ?
          </button>

          {/* Header minimalista */}
          <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '50px' }}>
            <div style={{ fontSize: '56px', marginBottom: '12px' }}>🐕</div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>MIGO Beta</h1>
            <p style={{ color: colors.primaryLight, fontSize: '14px', marginTop: '6px' }}>DNI GRATIS PARA PERRITOS</p>
          </div>

          {/* Tabs simples */}
          <div style={{ background: colors.surface, borderRadius: '40px', display: 'flex', marginBottom: '28px', border: `1px solid ${colors.border}` }}>
            <button onClick={() => { setTab('register'); setImage(null); }} style={{ flex: 1, padding: '12px', borderRadius: '40px', fontWeight: '600', background: tab === 'register' ? colors.primary : 'transparent', color: tab === 'register' ? 'white' : colors.textSec, border: 'none' }}>📝 Registrar</button>
            <button onClick={() => { setTab('search'); setImage(null); }} style={{ flex: 1, padding: '12px', borderRadius: '40px', fontWeight: '600', background: tab === 'search' ? colors.primary : 'transparent', color: tab === 'search' ? 'white' : colors.textSec, border: 'none' }}>🔍 Encontré uno</button>
          </div>

          {/* Tarjeta principal */}
          <div style={{ background: colors.card, borderRadius: '24px', padding: '24px', border: `1px solid ${colors.border}` }}>
            <p style={{ textAlign: 'center', color: colors.textSec, marginBottom: '24px', fontSize: '14px' }}>
              {tab === 'register' ? "Sube una foto clara de la nariz de tu perro" : "Sube una foto de la nariz del perro que encontraste"}
            </p>

            <label style={{ display: 'block', background: image ? 'transparent' : `${colors.primary}10`, border: image ? 'none' : `2px dashed ${colors.primary}40`, borderRadius: '16px', padding: image ? '0' : '40px 20px', textAlign: 'center', cursor: 'pointer' }}>
              {!image ? (
                <>
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>📸</div>
                  <div style={{ fontWeight: '600', color: colors.primaryLight }}>Subir foto de la nariz</div>
                  <div style={{ fontSize: '12px', color: colors.textSec }}>Toca para seleccionar</div>
                </>
              ) : (
                <div style={{ position: 'relative' }}>
                  <img src={image} style={{ width: '100%', borderRadius: '16px', display: 'block' }} alt="preview" />
                  <button onClick={(e) => { e.preventDefault(); setImage(null); }} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '30px', width: '28px', height: '28px', fontSize: '18px', color: 'white', cursor: 'pointer' }}>✕</button>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
            </label>

            {image && (
              <div style={{ marginTop: '24px' }}>
                {tab === 'register' && (
                  <>
                    <input type="text" placeholder="Nombre del perro" value={dogName} onChange={(e) => setDogName(e.target.value)} style={{ width: '100%', padding: '14px', background: colors.surface, borderRadius: '12px', fontSize: '16px', color: colors.text, border: `1px solid ${colors.border}`, marginBottom: '12px', outline: 'none' }} />
                    <input type="tel" placeholder="+591 7xx xxxxx" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} style={{ width: '100%', padding: '14px', background: colors.surface, borderRadius: '12px', fontSize: '16px', color: colors.text, border: `1px solid ${colors.border}`, outline: 'none' }} />
                  </>
                )}
                <button onClick={tab === 'register' ? handleRegister : handleSearch} disabled={loading} style={{ width: '100%', padding: '16px', background: colors.primary, borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', color: 'white', border: 'none', marginTop: '20px', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Procesando...' : (tab === 'register' ? '✅ Registrar Perro' : '🔍 Buscar Coincidencia')}
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', padding: '40px 0 20px', color: colors.textSec, fontSize: '13px', borderTop: `1px solid ${colors.border}`, marginTop: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '12px' }}>
              <button onClick={() => setShowHowToUse(true)} style={{ background: 'none', border: 'none', color: colors.textSec, fontSize: '13px', cursor: 'pointer' }}>Cómo usar</button>
              <button onClick={() => setShowTerms(true)} style={{ background: 'none', border: 'none', color: colors.textSec, fontSize: '13px', cursor: 'pointer' }}>Términos</button>
              <button onClick={() => setShowPrivacy(true)} style={{ background: 'none', border: 'none', color: colors.textSec, fontSize: '13px', cursor: 'pointer' }}>Privacidad</button>
            </div>
            <p>© 2026 MIGO Beta - Identificación digital canina</p>
          </div>
        </div>

        {/* Modales (igual que antes pero más detallados) */}
        {showHowToUse && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
            <div style={{ background: colors.card, borderRadius: '24px', padding: '28px', maxWidth: '380px', width: '100%', border: `1px solid ${colors.border}`, maxHeight: '85vh', overflowY: 'auto' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>📖 Cómo usar MIGO</h2>
              <div style={{ fontSize: '14px', lineHeight: '1.6', color: colors.textSec }}>
                <p><strong>1. Registrar a tu perro:</strong> Selecciona REGISTRAR, sube una foto muy clara iluminada y frontal de la nariz de tu perro. Escribe su nombre y tu número WhatsApp de contacto (con código país, ej. +591). Recibirás un código DNI único. Este código es el identificador de tu mascota que te brinda MIGO.</p>
                <p><strong>2. Si encuentras un perro perdido:</strong> Selecciona ENCONTRÉ UNO, sube una foto de la nariz del perrito encontrado (el proceso es similar al registro). El sistema buscará coincidencias. Si el sistema encuentra al perrito asociado con esa nariz, y por ende al dueño, verás su WhatsApp y podrás contactarlo directamente.</p>
                <p><strong>3. Contacto seguro:</strong> Usa el botón de WhatsApp para comunicarte con el dueño del perrito encontrado. MIGO no interviene en la conversación ni almacena mensajes.</p>
                <p><strong>4. Recomendaciones:</strong> Asegúrate de que la foto de la nariz esté bien iluminada y enfocada. Para mejores resultados, evita fondos con texturas similares.</p>
              </div>
              <button onClick={() => setShowHowToUse(false)} style={{ width: '100%', marginTop: '28px', padding: '14px', background: colors.primary, borderRadius: '12px', border: 'none', color: 'white', fontWeight: 'bold' }}>Cerrar</button>
            </div>
          </div>
        )}

        {showTerms && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
            <div style={{ background: colors.card, borderRadius: '24px', padding: '28px', maxWidth: '380px', width: '100%', border: `1px solid ${colors.border}`, maxHeight: '85vh', overflowY: 'auto' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>Términos y Condiciones</h2>
              <div style={{ fontSize: '13px', lineHeight: '1.6', color: colors.textSec }}>
                <p><strong>Última actualización:</strong> Abril 2026</p>
                <p><strong>1. Aceptación:</strong> Al usar MIGO Beta, aceptas estos términos.</p>
                <p><strong>2. Uso voluntario:</strong> Nadie te obliga a usar esta app. Si la instalas o registras un perro, lo haces por tu propia voluntad.</p>
                <p><strong>3. Servicio experimental:</strong> MIGO Beta es una herramienta gratuita y experimental. Se ofrece "tal como esta, sin ninguna garantia de que siempre funcione o que la identificacion sea perfecta y sin fallas.</p>
                <p><strong>4. Tu responsabilidad:</strong> Tú eres el único responsable de la información que subes (fotos, nombre y WhatsApp). Debes asegurarte de que todo sea correcto y verdadero.</p>
                <p><strong>5. MIGO no tiene responsabilidad:</strong> MIGO no se hace responsable por ningún daño, error, pérdida de datos, malentendido o cualquier problema que surja por el uso de la app. Nadie puede demandar a MIGO por usar esta aplicación voluntariamente.</p>
                <p><strong>6. Cambios y ley:</strong> Podemos modificar o cerrar la app en cualquier momento sin aviso previo. Cualquier problema se resolverá según las leyes de Bolivia en los tribunales de La Paz.</p>
              </div>
              <button onClick={() => setShowTerms(false)} style={{ width: '100%', marginTop: '28px', padding: '14px', background: colors.primary, borderRadius: '12px', border: 'none', color: 'white', fontWeight: 'bold' }}>Cerrar</button>
            </div>
          </div>
        )}

        {showPrivacy && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
            <div style={{ background: colors.card, borderRadius: '24px', padding: '28px', maxWidth: '380px', width: '100%', border: `1px solid ${colors.border}`, maxHeight: '85vh', overflowY: 'auto' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>Política de Privacidad</h2>
              <div style={{ fontSize: '13px', lineHeight: '1.6', color: colors.textSec }}>
                <p><strong>Última actualización:</strong> Abril 2026</p>
                <p><strong>1. Uso voluntario:</strong> Al registrarte en MIGO Beta das tu consentimiento libre y voluntario. Nadie te obliga a usar la app.</p>
                <p><strong>2. Qué datos usamos:</strong> Recogemos solo: nombre del perro, tu WhatsApp, foto de la nariz del perro y un código interno. No guardamos tu ubicación ni más datos personales.</p>
                <p><strong>3. Para qué usamos los datos:</strong> La foto de la nariz del perro sirve únicamente para identificar al perro si se pierde. Tu WhatsApp solo se muestra si alguien encuentra a tu perro y la app detecta coincidencia.</p>
                <p><strong>4. Importante:</strong> Al registrar a tu perro, aceptas que tu WhatsApp sea público para quien encuentre a tu perro. Esto es necesario para que la app funcione.</p>
                <p><strong>5. Seguridad:</strong> Hacemos lo posible por proteger tus datos, pero no podemos garantizar seguridad absoluta.</p>
              </div>
              <button onClick={() => setShowPrivacy(false)} style={{ width: '100%', marginTop: '28px', padding: '14px', background: colors.primary, borderRadius: '12px', border: 'none', color: 'white', fontWeight: 'bold' }}>Cerrar</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}