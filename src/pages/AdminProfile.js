import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function AdminProfile() {
  const [ventas, setVentas] = useState([]);
  const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split('T')[0]);
  const [autorizado, setAutorizado] = useState(false);
  const navigate = useNavigate();
  const reportRef = useRef();

  // Función de carga ultra-simple
  const cargarBaseDeDatos = () => {
    const raw = localStorage.getItem('ventas_teatro');
    if (raw) {
      const parsed = JSON.parse(raw);
      setVentas(parsed);
    }
  };

  useEffect(() => {
    if (!autorizado) {
      const pass = window.prompt("Clave:");
      if (pass === "admin123") setAutorizado(true);
      else navigate('/');
    }

    // CARGA INICIAL Y REVISIÓN CADA 1 SEGUNDO
    cargarBaseDeDatos();
    const timer = setInterval(cargarBaseDeDatos, 1000);

    return () => clearInterval(timer);
  }, [autorizado, navigate]);

  if (!autorizado) return null;

  // FILTRADO ROBUSTO: Comparamos solo el año-mes-día
  const ventasDelDia = ventas.filter(v => {
    if (!v.fechaISO) return false;
    return v.fechaISO.split('T')[0] === fechaFiltro;
  });

  // Cálculos rápidos
  const ingresos = ventasDelDia.filter(v => v.estado === 'vendido').reduce((acc, v) => acc + v.precio, 0);
  const totalTickets = ventasDelDia.length;

  // Gráficas
  const dataShows = [
    { n: 'Mentiras', v: ventasDelDia.filter(x => x.show.includes('Mentiras')).length },
    { n: 'Cascanueces', v: ventasDelDia.filter(x => x.show.includes('Cascanueces')).length },
    { n: 'Fantasma', v: ventasDelDia.filter(x => x.show.includes('Fantasma')).length }
  ];

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f5f5f5' }}>
      <div style={{ background: 'white', padding: '15px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button onClick={() => navigate('/')}>Volver</button>
        <input type="date" value={fechaFiltro} onChange={e => setFechaFiltro(e.target.value)} />
        <button onClick={() => {
            html2canvas(reportRef.current).then(canvas => {
                const pdf = new jsPDF();
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 150);
                pdf.save('reporte.pdf');
            });
        }}>Descargar PDF</button>
      </div>

      <div ref={reportRef} style={{background: 'white', padding: '20px', borderRadius: '10px'}}>
        <h2 style={{textAlign: 'center'}}>Monitor de Ventas</h2>
        <div style={{display: 'flex', justifyContent: 'space-around', margin: '20px 0'}}>
            <div style={kpi}>💰 Ingresos: <b>${ingresos}</b></div>
            <div style={kpi}>🎫 Tickets: <b>{totalTickets}</b></div>
        </div>

        <div style={{height: '250px', width: '100%', marginBottom: '30px'}}>
            <ResponsiveContainer>
                <BarChart data={dataShows}>
                    <XAxis dataKey="n" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="v" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </div>

        <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead style={{background: '#eee'}}>
                <tr><th>Hora</th><th>Show</th><th>Asiento</th><th>Monto</th></tr>
            </thead>
            <tbody>
                {ventasDelDia.reverse().map((v, i) => (
                    <tr key={i} style={{borderBottom: '1px solid #ddd', textAlign: 'center'}}>
                        <td>{v.fechaLegible.split(' ')[1]}</td>
                        <td>{v.show}</td>
                        <td>{v.id}</td>
                        <td>${v.precio}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}

const kpi = { padding: '20px', border: '1px solid #ddd', borderRadius: '10px', width: '40%' };

export default AdminProfile;