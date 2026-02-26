import React from 'react'

function AppTest() {
  console.log('AppTest renderizando...');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0f172a', 
      color: 'white',
      padding: '20px',
      fontFamily: 'Arial'
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>
        ✓ React está funcionando
      </h1>
      <p>Si ves este mensaje, React se está renderizando correctamente.</p>
      <p>Fecha: {new Date().toLocaleString()}</p>
    </div>
  )
}

export default AppTest
