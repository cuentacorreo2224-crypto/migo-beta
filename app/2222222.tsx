'use client';

import { useState } from 'react';

export default function TinoID() {
  const [image, setImage] = useState<string | null>(null);
  const [dogName, setDogName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [status, setStatus] = useState('Elige la foto de la nariz');

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target?.result as string);
        setStatus('✅ Foto cargada - Ahora escribe los datos');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111', color: '#fff', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '42px', textAlign: 'center', marginBottom: '10px' }}>TINO ID</h1>
      <p style={{ textAlign: 'center', color: '#4ade80', marginBottom: '30px' }}>DNI GRATIS PARA PERRITOS</p>

      <div style={{ backgroundColor: '#1f1f1f', padding: '30px', borderRadius: '16px' }}>
        <p style={{ textAlign: 'center', marginBottom: '20px' }}>Sube foto de la nariz</p>

        <input
          type="file"
          accept="image/*"
          onChange={handleImage}
          style={{
            width: '100%',
            padding: '20px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '19px',
            marginBottom: '30px'
          }}
        />

        <p style={{ textAlign: 'center', color: '#4ade80', marginBottom: '20px' }}>{status}</p>

        {image && (
          <div style={{ marginBottom: '25px' }}>
            <img src={image} style={{ width: '100%', borderRadius: '12px' }} alt="preview" />
          </div>
        )}

        {image && (
          <>
            <input
              type="text"
              placeholder="Nombre del perro"
              value={dogName}
              onChange={(e) => setDogName(e.target.value)}
              style={{
                width: '100%',
                padding: '16px',
                marginBottom: '12px',
                backgroundColor: '#333',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '17px'
              }}
            />
            <input
              type="tel"
              placeholder="+591 7xxx xxxx"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              style={{
                width: '100%',
                padding: '16px',
                marginBottom: '20px',
                backgroundColor: '#333',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '17px'
              }}
            />
            <button
              onClick={() => alert(`✅ Registro exitoso!\nPerro: ${dogName}\nWhatsApp: ${whatsapp}`)}
              style={{
                width: '100%',
                padding: '22px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '21px',
                fontWeight: 'bold'
              }}
            >
              ✅ Registrar Perro
            </button>
          </>
        )}
      </div>
    </div>
  );
}