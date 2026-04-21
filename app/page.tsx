'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Paleta de colores optimizada para branding de mascotas
// Verde esmeralda (confianza, salud) + Ámbar (calidez, energía)
const styles = {
  colors: {
    bg: '#0A0C10',           // Fondo principal profundo
    surface: '#14181F',      // Superficie sutil
    surfaceElevated: '#1C212A', // Elementos elevados
    primary: '#10B981',      // Verde esmeralda (acción principal)
    primaryLight: '#34D399',  // Verde claro (hover, acentos)
    primaryDark: '#059669',   // Verde oscuro (botones)
    secondary: '#F59E0B',     // Ámbar (detalles, alertas)
    secondaryLight: '#FBBF24',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    border: '#2D3748',        // Bordes oscuros, no blancos
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
    glow: '0 0 0 2px rgba(16, 185, 129, 0.3)',
  },
  transitions: {
    default: 'all 0.2s ease',
    smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
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

  // Pantalla de éxito - Registro completado
  if (registerSuccess) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: styles.colors.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{
          backgroundColor: styles.colors.surfaceElevated,
          borderRadius: styles.radius.xl,
          padding: '40px 28px',
          maxWidth: '440px',
          width: '100%',
          textAlign: 'center',
          boxShadow: styles.shadows.xl,
          border: `1px solid ${styles.colors.border}`,
        }}>
          <div style={{
            fontSize: '72px',
            marginBottom: '20px',
            background: `linear-gradient(135deg, ${styles.colors.primaryLight}, ${styles.colors.primary})`,
            width: '96px',
            height: '96px',
            borderRadius: styles.radius.full,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            🎉
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '12px',
            color: styles.colors.text,
          }}>¡Registro Exitoso!</h1>
          <p style={{
            color: styles.colors.primaryLight,
            fontSize: '17px',
            marginBottom: '32px',
          }}>Tu perrito ya tiene su DNI digital</p>

          <div style={{
            background: styles.colors.surface,
            borderRadius: styles.radius.lg,
            padding: '24px',
            marginBottom: '32px',
            textAlign: 'left',
            border: `1px solid ${styles.colors.border}`,
          }}>
            <p style={{ marginBottom: '12px', color: styles.colors.text }}>
              <strong style={{ color: styles.colors.primaryLight }}>Nombre:</strong> {registerSuccess.dogName}
            </p>
            <p style={{ marginBottom: '12px', color: styles.colors.text }}>
              <strong style={{ color: styles.colors.primaryLight }}>WhatsApp:</strong> {registerSuccess.whatsapp}
            </p>
            <p style={{ color: styles.colors.text }}>
              <strong style={{ color: styles.colors.primaryLight }}>Código DNI:</strong>{' '}
              <span style={{
                fontFamily: 'monospace',
                fontWeight: '700',
                color: styles.colors.secondary,
                background: `${styles.colors.secondary}10`,
                padding: '4px 8px',
                borderRadius: styles.radius.sm,
              }}>{registerSuccess.dniCode}</span>
            </p>
          </div>

          <button 
            onClick={() => setRegisterSuccess(null)}
            style={{
              width: '100%',
              background: `linear-gradient(135deg, ${styles.colors.primary}, ${styles.colors.primaryDark})`,
              color: 'white',
              padding: '18px',
              borderRadius: styles.radius.lg,
              fontSize: '17px',
              fontWeight: '600',
              marginBottom: '12px',
              border: 'none',
              cursor: 'pointer',
              transition: styles.transitions.default,
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Volver al Inicio
          </button>
          <button 
            onClick={() => { setRegisterSuccess(null); setTab('register'); }}
            style={{
              width: '100%',
              background: 'transparent',
              color: styles.colors.textSecondary,
              padding: '16px',
              borderRadius: styles.radius.lg,
              fontSize: '15px',
              fontWeight: '500',
              border: `1px solid ${styles.colors.border}`,
              cursor: 'pointer',
              transition: styles.transitions.default,
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.colors.surface}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Registrar otro perrito
          </button>
        </div>
      </div>
    );
  }

  // Pantalla de resultado - Perro encontrado
  if (searchResult) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: styles.colors.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{
          backgroundColor: styles.colors.surfaceElevated,
          borderRadius: styles.radius.xl,
          padding: '40px 28px',
          maxWidth: '440px',
          width: '100%',
          textAlign: 'center',
          boxShadow: styles.shadows.xl,
          border: `1px solid ${styles.colors.border}`,
        }}>
          <div style={{
            fontSize: '72px',
            marginBottom: '20px',
            background: `linear-gradient(135deg, ${styles.colors.secondaryLight}, ${styles.colors.secondary})`,
            width: '96px',
            height: '96px',
            borderRadius: styles.radius.full,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            🐾
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '12px',
            color: styles.colors.text,
          }}>¡Perro Encontrado!</h1>
          
          <div style={{
            background: styles.colors.surface,
            borderRadius: styles.radius.lg,
            padding: '24px',
            marginBottom: '32px',
            textAlign: 'left',
            border: `1px solid ${styles.colors.border}`,
          }}>
            <p style={{ marginBottom: '12px', color: styles.colors.text }}>
              <strong style={{ color: styles.colors.secondaryLight }}>Nombre:</strong> {searchResult.dogName}
            </p>
            <p style={{ marginBottom: '12px', color: styles.colors.text }}>
              <strong style={{ color: styles.colors.secondaryLight }}>WhatsApp del dueño:</strong> {searchResult.whatsapp}
            </p>
            <p style={{ color: styles.colors.text }}>
              <strong style={{ color: styles.colors.secondaryLight }}>Código DNI:</strong>{' '}
              <span style={{
                fontFamily: 'monospace',
                fontWeight: '700',
                color: styles.colors.secondary,
                background: `${styles.colors.secondary}10`,
                padding: '4px 8px',
                borderRadius: styles.radius.sm,
              }}>{searchResult.dniCode}</span>
            </p>
          </div>

          <a 
            href={`https://wa.me/${searchResult.whatsapp.replace(/[^0-9]/g,'')}`}
            target="_blank"
            style={{
              display: 'block',
              width: '100%',
              background: `linear-gradient(135deg, ${styles.colors.primary}, ${styles.colors.primaryDark})`,
              color: 'white',
              padding: '18px',
              borderRadius: styles.radius.lg,
              fontSize: '17px',
              fontWeight: '600',
              marginBottom: '16px',
              textDecoration: 'none',
              transition: styles.transitions.default,
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            💬 Contactar por WhatsApp
          </a>

          <button 
            onClick={() => setSearchResult(null)}
            style={{
              width: '100%',
              background: styles.colors.surface,
              color: styles.colors.text,
              padding: '18px',
              borderRadius: styles.radius.lg,
              fontSize: '17px',
              fontWeight: '600',
              border: `1px solid ${styles.colors.border}`,
              cursor: 'pointer',
              transition: styles.transitions.default,
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.colors.border}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = styles.colors.surface}
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  // Pantalla principal - sin marcos blancos
  return (
    <div style={{
      minHeight: '100vh',
      background: styles.colors.bg,
      color: styles.colors.text,
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      margin: 0,
      padding: 0,
      width: '100%',
    }}>
      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        padding: '24px 20px 40px',
      }}>
        {/* Header rediseñado */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            margin: '0 auto 20px',
            width: '80px',
            height: '80px',
            background: `linear-gradient(135deg, ${styles.colors.primaryLight}, ${styles.colors.primary})`,
            borderRadius: styles.radius.full,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            boxShadow: styles.shadows.lg,
          }}>
            🐕
          </div>
          <h1 style={{
            fontSize: '34px',
            fontWeight: '700',
            letterSpacing: '-0.5px',
            margin: 0,
            background: `linear-gradient(135deg, ${styles.colors.text}, ${styles.colors.textSecondary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>MIGO Beta</h1>
          <p style={{
            color: styles.colors.secondaryLight,
            fontSize: '15px',
            marginTop: '8px',
            fontWeight: '500',
            letterSpacing: '0.5px',
          }}>DNI GRATIS PARA PERRITOS</p>
        </div>

        {/* Tabs */}
        <div style={{
          backgroundColor: styles.colors.surface,
          padding: '4px',
          borderRadius: styles.radius.full,
          display: 'flex',
          marginBottom: '32px',
          border: `1px solid ${styles.colors.border}`,
        }}>
          <button 
            onClick={() => { setTab('register'); setImage(null); }}
            style={{ 
              flex: 1,
              padding: '14px 20px',
              borderRadius: styles.radius.full,
              fontWeight: '600',
              fontSize: '15px',
              backgroundColor: tab === 'register' ? styles.colors.primary : 'transparent',
              color: tab === 'register' ? 'white' : styles.colors.textSecondary,
              border: 'none',
              cursor: 'pointer',
              transition: styles.transitions.default,
            }}
          >
            📝 Registrar
          </button>
          <button 
            onClick={() => { setTab('search'); setImage(null); }}
            style={{ 
              flex: 1,
              padding: '14px 20px',
              borderRadius: styles.radius.full,
              fontWeight: '600',
              fontSize: '15px',
              backgroundColor: tab === 'search' ? styles.colors.primary : 'transparent',
              color: tab === 'search' ? 'white' : styles.colors.textSecondary,
              border: 'none',
              cursor: 'pointer',
              transition: styles.transitions.default,
            }}
          >
            🔍 Encontré uno
          </button>
        </div>

        {/* Tarjeta principal */}
        <div style={{
          backgroundColor: styles.colors.surfaceElevated,
          borderRadius: styles.radius.xl,
          padding: '28px',
          border: `1px solid ${styles.colors.border}`,
          boxShadow: styles.shadows.lg,
        }}>
          <p style={{
            textAlign: 'center',
            color: styles.colors.textSecondary,
            marginBottom: '28px',
            fontSize: '14px',
            lineHeight: '1.5',
          }}>
            {tab === 'register' 
              ? "Sube una foto clara de la nariz de tu perro para crear su identificación única"
              : "Sube una foto de la nariz del perro que encontraste para identificar a su dueño"}
          </p>

          {/* Área de subida de foto */}
          <label style={{
            display: 'block',
            background: image ? 'transparent' : `linear-gradient(135deg, ${styles.colors.primary}15, ${styles.colors.primary}05)`,
            border: image ? 'none' : `2px dashed ${styles.colors.primary}40`,
            borderRadius: styles.radius.lg,
            padding: image ? '0' : '48px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: styles.transitions.default,
            overflow: 'hidden',
          }}>
            {!image ? (
              <>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📸</div>
                <div style={{ fontWeight: '600', marginBottom: '8px', color: styles.colors.primaryLight }}>
                  Subir foto de la nariz
                </div>
                <div style={{ fontSize: '13px', color: styles.colors.textMuted }}>
                  Toca para seleccionar
                </div>
              </>
            ) : (
              <div style={{ position: 'relative' }}>
                <img 
                  src={image} 
                  style={{ 
                    width: '100%', 
                    borderRadius: styles.radius.lg,
                    display: 'block',
                  }} 
                  alt="preview" 
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setImage(null);
                  }}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(0,0,0,0.75)',
                    border: 'none',
                    borderRadius: styles.radius.full,
                    width: '32px',
                    height: '32px',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: styles.transitions.default,
                  }}
                >
                  ✕
                </button>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
          </label>

          {/* Formulario dinámico */}
          {image && (
            <div style={{ marginTop: '28px' }}>
              {tab === 'register' && (
                <div style={{ marginBottom: '20px' }}>
                  <input 
                    type="text" 
                    placeholder="Nombre del perro"
                    value={dogName}
                    onChange={(e) => setDogName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '16px',
                      backgroundColor: styles.colors.surface,
                      borderRadius: styles.radius.md,
                      fontSize: '16px',
                      color: styles.colors.text,
                      border: `1px solid ${styles.colors.border}`,
                      outline: 'none',
                      transition: styles.transitions.default,
                      marginBottom: '12px',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = styles.colors.primary}
                    onBlur={(e) => e.currentTarget.style.borderColor = styles.colors.border}
                  />
                  <input 
                    type="tel" 
                    placeholder="+591 7xx xxxxx"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '16px',
                      backgroundColor: styles.colors.surface,
                      borderRadius: styles.radius.md,
                      fontSize: '16px',
                      color: styles.colors.text,
                      border: `1px solid ${styles.colors.border}`,
                      outline: 'none',
                      transition: styles.transitions.default,
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = styles.colors.primary}
                    onBlur={(e) => e.currentTarget.style.borderColor = styles.colors.border}
                  />
                </div>
              )}

              <button 
                onClick={tab === 'register' ? handleRegister : handleSearch}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '18px',
                  background: `linear-gradient(135deg, ${styles.colors.primary}, ${styles.colors.primaryDark})`,
                  borderRadius: styles.radius.lg,
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'white',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: styles.transitions.default,
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{
                      display: 'inline-block',
                      width: '18px',
                      height: '18px',
                      border: `2px solid white`,
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}></span>
                    Procesando...
                  </span>
                ) : (
                  tab === 'register' ? '✅ Registrar Perro' : '🔍 Buscar Coincidencia'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer sin bordes blancos */}
        <div style={{
          textAlign: 'center',
          padding: '48px 0 20px',
          color: styles.colors.textMuted,
          fontSize: '13px',
          borderTop: `1px solid ${styles.colors.border}`,
          marginTop: '32px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '16px' }}>
            <button 
              onClick={() => setShowHowToUse(true)}
              style={{
                background: 'none',
                border: 'none',
                color: styles.colors.textSecondary,
                fontSize: '13px',
                cursor: 'pointer',
                transition: styles.transitions.default,
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = styles.colors.primaryLight}
              onMouseLeave={(e) => e.currentTarget.style.color = styles.colors.textSecondary}
            >
              Cómo usar
            </button>
            <button 
              onClick={() => setShowTerms(true)}
              style={{
                background: 'none',
                border: 'none',
                color: styles.colors.textSecondary,
                fontSize: '13px',
                cursor: 'pointer',
                transition: styles.transitions.default,
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = styles.colors.primaryLight}
              onMouseLeave={(e) => e.currentTarget.style.color = styles.colors.textSecondary}
            >
              Términos
            </button>
            <button 
              onClick={() => setShowPrivacy(true)}
              style={{
                background: 'none',
                border: 'none',
                color: styles.colors.textSecondary,
                fontSize: '13px',
                cursor: 'pointer',
                transition: styles.transitions.default,
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = styles.colors.primaryLight}
              onMouseLeave={(e) => e.currentTarget.style.color = styles.colors.textSecondary}
            >
              Privacidad
            </button>
          </div>
          <p style={{ fontSize: '11px' }}>© 2026 MIGO Beta - Identificación canina</p>
        </div>
      </div>

      {/* Modales - sin marcos blancos */}
      {showHowToUse && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.95)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: styles.colors.surfaceElevated,
            borderRadius: styles.radius.xl,
            padding: '32px',
            maxWidth: '420px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            border: `1px solid ${styles.colors.border}`,
            boxShadow: styles.shadows.xl,
          }}>
            <h2 style={{
              fontSize: '26px',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: '28px',
              color: styles.colors.text,
            }}>¿Cómo usar MIGO?</h2>
            <div style={{ fontSize: '15px', lineHeight: '1.7', color: styles.colors.textSecondary }}>
              <div style={{ marginBottom: '24px' }}>
                <strong style={{ color: styles.colors.primaryLight, display: 'block', marginBottom: '8px' }}>1. Registrar tu perro</strong>
                <p>Sube una foto clara de la nariz de tu perro, escribe su nombre y tu número de WhatsApp. Recibirás un DNI digital único.</p>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <strong style={{ color: styles.colors.primaryLight, display: 'block', marginBottom: '8px' }}>2. Buscar un perro perdido</strong>
                <p>Si encuentras un perro, sube una foto de su nariz y el sistema buscará coincidencias con los perros registrados.</p>
              </div>
              <div>
                <strong style={{ color: styles.colors.primaryLight, display: 'block', marginBottom: '8px' }}>3. Contactar al dueño</strong>
                <p>Cuando encuentres una coincidencia, podrás contactar al dueño directamente por WhatsApp.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowHowToUse(false)}
              style={{
                width: '100%',
                marginTop: '40px',
                padding: '16px',
                background: `linear-gradient(135deg, ${styles.colors.primary}, ${styles.colors.primaryDark})`,
                borderRadius: styles.radius.lg,
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                transition: styles.transitions.default,
              }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {showTerms && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.95)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: styles.colors.surfaceElevated,
            borderRadius: styles.radius.xl,
            padding: '32px',
            maxWidth: '420px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            border: `1px solid ${styles.colors.border}`,
          }}>
            <h2 style={{
              fontSize: '26px',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: '24px',
              color: styles.colors.text,
            }}>Términos y Condiciones</h2>
            <div style={{ fontSize: '14px', lineHeight: '1.7', color: styles.colors.textSecondary }}>
              <p style={{ marginBottom: '16px' }}><strong style={{ color: styles.colors.primaryLight }}>Última actualización:</strong> Abril 2026</p>
              <p style={{ marginBottom: '16px' }}>MIGO Beta es una herramienta experimental. Se ofrece "tal cual", sin garantías de precisión o disponibilidad continua.</p>
              <p style={{ marginBottom: '16px' }}>El titular no se hace responsable por daños derivados del uso de la aplicación.</p>
              <p style={{ marginBottom: '16px' }}>Al registrar un perro, usted autoriza la publicación pública de su número de WhatsApp cuando alguien encuentre al perro.</p>
              <p>De acuerdo con la legislación boliviana, el usuario es responsable de la veracidad de los datos proporcionados.</p>
            </div>
            <button 
              onClick={() => setShowTerms(false)}
              style={{
                width: '100%',
                marginTop: '40px',
                padding: '16px',
                background: `linear-gradient(135deg, ${styles.colors.primary}, ${styles.colors.primaryDark})`,
                borderRadius: styles.radius.lg,
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                transition: styles.transitions.default,
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {showPrivacy && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.95)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: styles.colors.surfaceElevated,
            borderRadius: styles.radius.xl,
            padding: '32px',
            maxWidth: '420px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            border: `1px solid ${styles.colors.border}`,
          }}>
            <h2 style={{
              fontSize: '26px',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: '24px',
              color: styles.colors.text,
            }}>Política de Privacidad</h2>
            <div style={{ fontSize: '14px', lineHeight: '1.7', color: styles.colors.textSecondary }}>
              <p style={{ marginBottom: '16px' }}><strong style={{ color: styles.colors.primaryLight }}>Última actualización:</strong> Abril 2026</p>
              <p style={{ marginBottom: '16px' }}>MIGO Beta recopila nombre, WhatsApp, foto de nariz y datos de IA para ayudar en la identificación del perro.</p>
              <p style={{ marginBottom: '16px' }}>Al registrar, usted autoriza la divulgación pública de su número de WhatsApp cuando alguien suba una foto de la nariz del perro.</p>
              <p>No garantizamos confidencialidad absoluta ni nos hacemos responsables por el uso que terceros hagan de la información.</p>
            </div>
            <button 
              onClick={() => setShowPrivacy(false)}
              style={{
                width: '100%',
                marginTop: '40px',
                padding: '16px',
                background: `linear-gradient(135deg, ${styles.colors.primary}, ${styles.colors.primaryDark})`,
                borderRadius: styles.radius.lg,
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                transition: styles.transitions.default,
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          margin: 0;
          padding: 0;
          background: ${styles.colors.bg};
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}