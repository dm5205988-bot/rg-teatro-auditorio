import React from 'react';
import { useNavigate } from 'react-router-dom';

const eventos = [
  { 
    id: 1, 
    nombre: 'Mentiras: El Musical', 
    fecha: '20 de Junio, 2025', 
    precio: 200, 
    // Este enlace es directo a la imagen y cargará sin problemas
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTy4Z5TTZgyzQJpqmriER3uOaCv51eHpB_tIQ&s' 
  },
  { 
    id: 2, 
    nombre: 'El Cascanueces', 
    fecha: '25 de Junio, 2025', 
    precio: 250, 
    img: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=500' 
  },
  { 
    id: 3, 
    nombre: 'El Fantasma de la Ópera', 
    fecha: '30 de Junio, 2025', 
    precio: 300, 
    img: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=500' 
  },
];
function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'Segoe UI' }}>
      {/* Header Azul como tu imagen */}
      <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '50px 20px', textAlign: 'left' }}>
        <h1 style={{ margin: 0, fontSize: '32px' }}>🎭 Gran Teatro Nacional</h1>
        <p style={{ opacity: 0.9 }}>Reserva tus boletos para los mejores eventos culturales</p>
      </div>

      <div style={{ padding: '40px max(5%, 20px)' }}>
        <h2 style={{ marginBottom: '30px', color: '#1e293b' }}>Próximos Eventos</h2>
        <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {eventos.map((ev) => (
            <div key={ev.id} style={cardStyle}>
              <img src={ev.img} alt={ev.nombre} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px' }} />
              <div style={{ padding: '15px' }}>
                <h3 style={{ margin: '10px 0' }}>{ev.nombre}</h3>
                <p style={{ color: '#64748b', fontSize: '14px' }}>{ev.fecha}</p>
                <p style={{ fontWeight: 'bold', fontSize: '18px', color: '#2563eb' }}>Desde ${ev.precio}</p>
                <button onClick={() => navigate(`/venta/${ev.id}`)} style={btnStyle}>Seleccionar asientos</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Botón flotante para ir al Admin */}
      <button onClick={() => navigate('/admin')} style={adminBtn}>⚙️ Panel Admin</button>
    </div>
  );
}

const cardStyle = { backgroundColor: 'white', borderRadius: '15px', width: '300px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', overflow: 'hidden' };
const btnStyle = { width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' };
const adminBtn = { position: 'fixed', bottom: '20px', right: '20px', padding: '10px 20px', borderRadius: '50px', border: 'none', backgroundColor: '#1e293b', color: 'white', cursor: 'pointer' };

export default Home;