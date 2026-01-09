import React, { useEffect, useState, useRef } from 'react';
import * as atlas from 'azure-maps-control';
import 'azure-maps-control/dist/atlas.min.css';
import { QRCodeCanvas } from 'qrcode.react';
import { useNavigate, useParams } from 'react-router-dom';
import emailjs from '@emailjs/browser'; // IMPORTANTE: Agregado para el envío de correos

function MapaVenta() {
  const { eventoId } = useParams();
  const navigate = useNavigate();
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [paymentStep, setPaymentStep] = useState('none');
  const [formData, setFormData] = useState({ email: '' });
  const dataSourceRef = useRef(null);

  const nombresShows = { "1": "Mentiras: El Musical", "2": "El Cascanueces", "3": "El Fantasma de la Ópera" };
  const nombreShowActual = nombresShows[eventoId] || "Evento Especial";

  useEffect(() => {
    const map = new atlas.Map('map', {
      center: [-99.1892, 19.4250],
      zoom: 17.5,
      authOptions: { authType: 'subscriptionKey', subscriptionKey: 'DfiBU1WsJpWUlTdwyF5t56ubz1cUEFl2KB1DlczQzxLs29LVkeVAJQQJ99CAACYeBjF3acCYAAAgAZMP6BdF' }
    });

    map.events.add('ready', () => {
      const dataSource = new atlas.source.DataSource();
      dataSourceRef.current = dataSource;
      map.sources.add(dataSource);

      dataSource.importDataFromUrl('/mapa_teatro.geojson');

      const features = [];
      const createSeats = (count, startLat, startLng, seccion, precio, cols) => {
        const sepLng = 0.00007;
        const sepLat = 0.00007;
        for (let i = 0; i < count; i++) {
          const row = Math.floor(i / cols);
          const col = i % cols;
          const id = `${seccion}-${i}`;
          features.push(new atlas.data.Feature(new atlas.data.Point([
            startLng + (col * sepLng),
            startLat + (row * sepLat)
          ]), {
            tipo: 'butaca', seccion, precio, estado: 'disponible', id: id
          }, id));
        }
      };

      createSeats(55, 19.4246, -99.1894, 'Platea', 450, 11);
      createSeats(80, 19.4250, -99.1895, 'Preferente', 350, 10);
      createSeats(100, 19.4254, -99.1899, 'General', 200, 10);
      dataSource.add(features);

      map.layers.add(new atlas.layer.PolygonLayer(dataSource, null, {
        fillColor: ['coalesce', ['get', 'color'], '#dddddd'],
        fillOpacity: 0.5,
        filter: ['any', ['==', ['geometry-type'], 'Polygon'], ['==', ['geometry-type'], 'MultiPolygon']]
      }));

      const bubbleLayer = new atlas.layer.BubbleLayer(dataSource, null, {
        color: ['match', ['get', 'estado'], 'disponible', '#00FF00', 'reservado', '#FFFF00', 'vendido', '#FF0000', '#666'],
        radius: 4,
        strokeColor: 'white',
        strokeWidth: 1,
        filter: ['==', ['get', 'tipo'], 'butaca']
      });
      map.layers.add(bubbleLayer);

      map.events.add('click', bubbleLayer, (e) => {
        const shape = e.shapes[0];
        const props = shape.getProperties();
        if (props.estado === "vendido") return;
        const respuesta = window.confirm("¿Deseas COMPRAR este asiento?\n\nOK = Ir a Pagar (Rojo)\nCancelar = Solo Reservar (Amarillo)");
        if (respuesta) {
          setSelectedSeat({ ...props, id: shape.getId() });
          setPaymentStep('pay');
        } else {
          guardarEnAdmin(shape.getId(), props.seccion, props.precio, 'reservado', 'Anónimo');
          actualizarPuntoMapa(shape.getId(), 'reservado', props);
        }
      });
    });
  }, []);

  const actualizarPuntoMapa = (id, nuevoEstado, propsAnteriores) => {
    const ds = dataSourceRef.current;
    const shape = ds.getShapeById(id);
    if (shape) {
      const coords = shape.getCoordinates();
      ds.remove(shape);
      ds.add(new atlas.data.Feature(new atlas.data.Point(coords), { ...propsAnteriores, estado: nuevoEstado }, id));
    }
  };

  const guardarEnAdmin = (id, seccion, precio, estado, cliente) => {
    const db = JSON.parse(localStorage.getItem('ventas_teatro') || '[]');
    const nuevaOp = {
      id: id,
      show: nombreShowActual,
      seccion: seccion,
      precio: precio,
      estado: estado,
      fechaISO: new Date().toISOString(),
      fechaLegible: new Date().toLocaleString(),
      cliente: cliente || 'Anónimo'
    };
    db.push(nuevaOp);
    localStorage.setItem('ventas_teatro', JSON.stringify(db));
    window.dispatchEvent(new Event("storage"));
  };
 const handleFinalPayment = (e) => {

    e.preventDefault();

    const templateParams = {

      email_cliente: formData.email,

      nombre_show: nombreShowActual,

      asiento_id: selectedSeat.id,

      seccion: selectedSeat.seccion,

      precio: selectedSeat.precio,

      fecha: new Date().toLocaleString()

    };
    emailjs.send('service_p59i4hq', 'template_02eormd', templateParams, 'N29zc2hKHwErgkQmc')
      .then((result) => { console.log('Correo enviado:', result.text); },
        (error) => { console.log('Error correo:', error.text); });

    guardarEnAdmin(selectedSeat.id, selectedSeat.seccion, selectedSeat.precio, 'vendido', formData.email);
    actualizarPuntoMapa(selectedSeat.id, 'vendido', selectedSeat);
    setPaymentStep('success');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', fontFamily: 'Arial' }}>
      <div style={{ background: '#111827', color: 'white', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('/')} style={btnNavStyle}>← Menú Principal</button>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '12px', opacity: 0.8 }}>SALA:</span><br />
          <b style={{ fontSize: '18px' }}>{nombreShowActual}</b>
        </div>
        <div style={{ display: 'flex', gap: '15px', fontSize: '12px' }}>
          <div>🟢 Libre</div><div>🟡 Reserva</div><div>🔴 Vendido</div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        <div id="map" style={{ flex: 2, backgroundColor: '#1f2937' }}></div>
        <div style={{ flex: 1, padding: '30px', background: '#f9fafb', borderLeft: '1px solid #e5e7eb' }}>
          {paymentStep === 'pay' && (
            <div style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>💳 Finalizar Compra</h3>
              <p>Asiento: <b>{selectedSeat.id}</b> | <b>${selectedSeat.precio}</b></p>
              <form onSubmit={handleFinalPayment}>
                <input type="email" placeholder="Correo" required style={inputStyle} onChange={e => setFormData({ email: e.target.value })} />
                <input type="text" placeholder="Tarjeta" required style={inputStyle} maxLength="16" />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" placeholder="MM/YY" required style={inputStyle} maxLength="5" />
                  <input type="text" placeholder="CVV" required style={inputStyle} maxLength="3" />
                </div>
                <button type="submit" style={btnPayStyle}>CONFIRMAR PAGO</button>
                <button type="button" onClick={() => setPaymentStep('none')} style={{ ...btnPayStyle, background: '#9ca3af', marginTop: '10px' }}>Cancelar</button>
              </form>
            </div>
          )}

          {paymentStep === 'success' && (
            <div style={{ textAlign: 'center', padding: '20px', background: 'white', borderRadius: '15px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ color: '#059669' }}>¡Éxito!</h2>
              <QRCodeCanvas value={`SHOW: ${nombreShowActual} | ASIENTO: ${selectedSeat.id}`} size={180} includeMargin={true} />
              <div style={{ marginTop: '15px', fontSize: '14px', color: '#374151' }}>
                <p><b>Show:</b> {nombreShowActual}</p>
                <p><b>Asiento:</b> {selectedSeat.id}</p>
              </div>
              <button onClick={() => setPaymentStep('none')} style={{ ...btnNavStyle, width: '100%', marginTop: '10px' }}>Cerrar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Estilos movidos fuera del componente para mayor orden
const inputStyle = { width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' };
const btnNavStyle = { background: '#374151', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold' };
const btnPayStyle = { width: '100%', padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' };
const cardStyle = { background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' };

export default MapaVenta;
