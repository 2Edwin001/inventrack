import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Inventario from './pages/Inventario'
import Movimientos from './pages/Movimientos'
import Sedes from './pages/Sedes'
import Reportes from './pages/Reportes'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/movimientos" element={<Movimientos />} />
        <Route path="/sedes" element={<Sedes />} />
        <Route path="/reportes" element={<Reportes />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
