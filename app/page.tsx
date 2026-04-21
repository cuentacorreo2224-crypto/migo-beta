'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Estilos mínimos, sin gradientes ni sombras pesadas
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

  // Pantalla principal - diseño minimalista y rápido
  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, margin: 0, padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        {/* Header minimalista */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
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
          <p>© 2026 MIGO Beta</p>
        </div>
      </div>

      {/* Modales simplificados */}
      {showHowToUse && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
          <div style={{ background: colors.card, borderRadius: '24px', padding: '28px', maxWidth: '380px', width: '100%', border: `1px solid ${colors.border}` }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>¿Cómo usar MIGO?</h2>
            <div style={{ fontSize: '14px', lineHeight: '1.6', color: colors.textSec }}>
              <p><strong>1. Registrar tu perro:</strong> Sube una foto clara de su nariz, nombre y WhatsApp.</p>
              <p><strong>2. Encontraste un perro:</strong> Sube foto de su nariz y busca coincidencia.</p>
              <p><strong>3. Contacta al dueño</strong> vía WhatsApp.</p>
            </div>
            <button onClick={() => setShowHowToUse(false)} style={{ width: '100%', marginTop: '28px', padding: '14px', background: colors.primary, borderRadius: '12px', border: 'none', color: 'white', fontWeight: 'bold' }}>Cerrar</button>
          </div>
        </div>
      )}
      {showTerms && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
          <div style={{ background: colors.card, borderRadius: '24px', padding: '28px', maxWidth: '380px', width: '100%', border: `1px solid ${colors.border}` }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>Términos</h2>
            <div style={{ fontSize: '13px', lineHeight: '1.6', color: colors.textSec }}>
              <p>MIGO Beta es una herramienta experimental. Al registrar, autorizas la publicación de tu WhatsApp cuando alguien encuentre a tu perro. No nos hacemos responsables por mal uso.</p>
            </div>
            <button onClick={() => setShowTerms(false)} style={{ width: '100%', marginTop: '28px', padding: '14px', background: colors.primary, borderRadius: '12px', border: 'none', color: 'white', fontWeight: 'bold' }}>Cerrar</button>
          </div>
        </div>
      )}
      {showPrivacy && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
          <div style={{ background: colors.card, borderRadius: '24px', padding: '28px', maxWidth: '380px', width: '100%', border: `1px solid ${colors.border}` }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>Privacidad</h2>
            <div style={{ fontSize: '13px', lineHeight: '1.6', color: colors.textSec }}>
              <p>Recopilamos nombre, WhatsApp y foto de nariz para identificación. Tu WhatsApp se mostrará si alguien encuentra a tu perro.</p>
            </div>
            <button onClick={() => setShowPrivacy(false)} style={{ width: '100%', marginTop: '28px', padding: '14px', background: colors.primary, borderRadius: '12px', border: 'none', color: 'white', fontWeight: 'bold' }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}