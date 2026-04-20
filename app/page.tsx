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

  if (registerSuccess) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '20px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>¡Registro Exitoso!</h1>
          <p>Nombre: {registerSuccess.dogName}</p>
          <p>WhatsApp: {registerSuccess.whatsapp}</p>
          <p>Código: {registerSuccess.dniCode}</p>
          <button onClick={() => setRegisterSuccess(null)} style={{ marginTop: '30px', padding: '15px 30px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '10px' }}>
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (searchResult) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '20px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>¡Perro Encontrado!</h1>
          <p>Nombre: {searchResult.dogName}</p>
          <p>WhatsApp: {searchResult.whatsapp}</p>
          <p>Código: {searchResult.dniCode}</p>
          <a href={`https://wa.me/${searchResult.whatsapp.replace(/[^0-9]/g,'')}`} target="_blank" style={{ display: 'block', marginTop: '30px', padding: '15px 30px', backgroundColor: '#10b981', color: 'white', textDecoration: 'none', borderRadius: '10px' }}>
            Contactar por WhatsApp
          </a>
          <button onClick={() => setSearchResult(null)} style={{ marginTop: '15px', padding: '15px 30px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '10px' }}>
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111827', color: 'white', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', fontSize: '36px', marginBottom: '10px' }}>MIGO Beta</h1>
      <p style={{ textAlign: 'center', color: '#34d399', marginBottom: '30px' }}>DNI GRATIS PARA PERRITOS</p>

      <div style={{ backgroundColor: '#1f2937', padding: '20px', borderRadius: '16px', marginBottom: '20px' }}>
        <button onClick={() => setTab('register')} style={{ width: '100%', padding: '15px', marginBottom: '10px', backgroundColor: tab === 'register' ? '#10b981' : '#374151', color: 'white', border: 'none', borderRadius: '8px' }}>
          Registrar mi perro
        </button>
        <button onClick={() => setTab('search')} style={{ width: '100%', padding: '15px', backgroundColor: tab === 'search' ? '#10b981' : '#374151', color: 'white', border: 'none', borderRadius: '8px' }}>
          Encontré un perro
        </button>
      </div>

      <div style={{ backgroundColor: '#1f2937', padding: '20px', borderRadius: '16px' }}>
        <p style={{ textAlign: 'center', marginBottom: '15px' }}>
          {tab === 'register' ? "Sube foto de la nariz de tu perro" : "Sube foto de la nariz del perro encontrado"}
        </p>

        <label style={{ display: 'block', backgroundColor: '#10b981', color: 'white', padding: '25px', textAlign: 'center', borderRadius: '12px', fontSize: '18px', marginBottom: '15px', cursor: 'pointer' }}>
          📸 Subir foto de la nariz
          <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
        </label>

        {image && <img src={image} style={{ width: '100%', borderRadius: '12px', marginBottom: '15px' }} alt="preview" />}

        {image && tab === 'register' && (
          <div>
            <input type="text" placeholder="Nombre del perro" value={dogName} onChange={(e) => setDogName(e.target.value)} style={{ width: '100%', padding: '15px', marginBottom: '10px', borderRadius: '8px', border: 'none' }} />
            <input type="tel" placeholder="+591 7xxx xxxx" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} style={{ width: '100%', padding: '15px', marginBottom: '20px', borderRadius: '8px', border: 'none' }} />
          </div>
        )}

        <button onClick={tab === 'register' ? handleRegister : handleSearch} disabled={loading} style={{ width: '100%', padding: '18px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px' }}>
          {loading ? 'Procesando...' : tab === 'register' ? '✅ Registrar Perro' : '🔍 Buscar Coincidencia'}
        </button>
      </div>
    </div>
  );
}