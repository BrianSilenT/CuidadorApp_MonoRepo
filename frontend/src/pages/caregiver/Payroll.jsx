import { useState, useEffect, useMemo } from 'react'
import CaregiverLayout from '../../components/layouts/CaregiverLayout'
import Button from '../../components/common/Button'
import { LoadingState, EmptyState, ErrorState } from '../../components/common/DataState'
import { pagoService, unwrapList } from '../../services/api'
import { downloadCsv } from '../../utils/csv'

export default function Payroll() {
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        const pagosRes = await pagoService.getAll()
        setPagos(unwrapList(pagosRes.data))
      } catch {
        setError('Error al cargar los datos financieros.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const totalEarnings = useMemo(() => pagos.filter((p) => p.confirmado).reduce((sum, p) => sum + (p.monto || 0), 0), [pagos])
  const pendingPayments = useMemo(() => pagos.filter((p) => !p.confirmado).reduce((sum, p) => sum + (p.monto || 0), 0), [pagos])
  const currentBalance = totalEarnings

  const sortedPagos = useMemo(() => {
    return [...pagos].sort((a, b) => new Date(b.fechaPago || 0) - new Date(a.fechaPago || 0))
  }, [pagos])

  const pagosFiltrados = useMemo(() => {
    if (filtroEstado === 'pagados') return sortedPagos.filter((p) => p.confirmado)
    if (filtroEstado === 'pendientes') return sortedPagos.filter((p) => !p.confirmado)
    return sortedPagos
  }, [sortedPagos, filtroEstado])

  const exportCsv = () => {
    downloadCsv({
      fileName: `pagos-cuidador-${new Date().toISOString().split('T')[0]}.csv`,
      headers: ['ID', 'Fecha', 'Descripción', 'Monto', 'Estado'],
      rows: pagosFiltrados.map((item) => [
        item.id,
        item.fechaPago || '',
        'Pago de guardia',
        item.monto || 0,
        item.confirmado ? 'Pagado' : 'Pendiente'
      ])
    })
  }

  const openRecibo = (pago) => {
    alert(
      [
        `Recibo #${pago.id}`,
        `Fecha: ${pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString('es-ES') : 'Pendiente'}`,
        `Monto: $${(pago.monto || 0).toFixed(2)}`,
        `Estado: ${pago.confirmado ? 'Pagado' : 'Pendiente'}`
      ].join('\n')
    )
  }

  return (
    <CaregiverLayout title="Pagos y ganancias">
      <div className="p-8 space-y-6 bg-[#f6f7f8] min-h-full">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#0d141b]">Pagos y ganancias</h1>
            <p className="text-[#4c739a] mt-1">Consulta y descarga tu historial de pagos.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="bg-white" onClick={() => window.print()}>
              <span className="material-symbols-outlined mr-2 text-sm">print</span>
              Imprimir resumen
            </Button>
            <Button variant="outline" className="bg-white" onClick={exportCsv}>
              <span className="material-symbols-outlined mr-2 text-sm">download</span>
              Exportar CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl border border-[#e7edf3] shadow-sm relative overflow-hidden">
            <p className="text-sm text-[#4c739a] font-semibold mb-2">Saldo actual</p>
            <p className="text-3xl font-bold text-[#0d141b] mb-3">${currentBalance.toFixed(2)}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#e7edf3] shadow-sm relative overflow-hidden">
            <p className="text-sm text-[#4c739a] font-semibold mb-2">Ganancias totales</p>
            <p className="text-3xl font-bold text-[#0d141b] mb-3">${totalEarnings.toFixed(2)}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#e7edf3] shadow-sm relative overflow-hidden">
            <p className="text-sm text-[#4c739a] font-semibold mb-2">Pagos pendientes</p>
            <p className="text-3xl font-bold text-[#0d141b] mb-3">${pendingPayments.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e7edf3] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#e7edf3] flex justify-between items-center bg-white">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-[#0d141b]">Historial de pagos</h2>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-semibold">{pagos.length} registros</span>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button onClick={() => setFiltroEstado('todos')} className={`px-4 py-1.5 rounded-md text-sm font-semibold ${filtroEstado === 'todos' ? 'bg-white shadow-sm text-[#0d141b]' : 'text-[#4c739a] hover:text-[#0d141b]'}`}>Todos</button>
              <button onClick={() => setFiltroEstado('pagados')} className={`px-4 py-1.5 rounded-md text-sm font-semibold ${filtroEstado === 'pagados' ? 'bg-white shadow-sm text-[#0d141b]' : 'text-[#4c739a] hover:text-[#0d141b]'}`}>Pagados</button>
              <button onClick={() => setFiltroEstado('pendientes')} className={`px-4 py-1.5 rounded-md text-sm font-semibold ${filtroEstado === 'pendientes' ? 'bg-white shadow-sm text-[#0d141b]' : 'text-[#4c739a] hover:text-[#0d141b]'}`}>Pendientes</button>
            </div>
          </div>

          {loading ? (
            <div className="p-8"><LoadingState label="Cargando pagos..." /></div>
          ) : error ? (
            <div className="p-8"><ErrorState message={error} /></div>
          ) : pagosFiltrados.length === 0 ? (
            <div className="p-8"><EmptyState label="No hay historial de pagos para este filtro." /></div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f6f7f8] text-[#4c739a] text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">FECHA</th>
                  <th className="px-6 py-4 font-semibold">DESCRIPCIÓN</th>
                  <th className="px-6 py-4 font-semibold">MONTO</th>
                  <th className="px-6 py-4 font-semibold">ESTADO</th>
                  <th className="px-6 py-4 font-semibold text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7edf3]">
                {pagosFiltrados.map((pago) => {
                  const date = pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString('es-ES') : 'Pendiente'
                  const isPending = !pago.confirmado

                  return (
                    <tr key={pago.id} className="hover:bg-[#f6f7f8]/50">
                      <td className="px-6 py-4 text-[#0d141b] font-medium">{date}</td>
                      <td className="px-6 py-4"><p className="font-semibold text-[#0d141b]">Pago de guardia</p></td>
                      <td className="px-6 py-4 font-bold text-[#0d141b]">${(pago.monto || 0).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit gap-1 ${isPending ? 'text-amber-700 bg-amber-50' : 'text-green-700 bg-green-50'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-amber-600' : 'bg-green-600'}`}></div>
                          {isPending ? 'Pendiente' : 'Pagado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openRecibo(pago)} className="text-[#2b8cee] hover:text-[#0d141b] p-2 rounded-lg hover:bg-gray-100 text-sm font-semibold">
                          Ver recibo
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          <div className="p-4 border-t border-[#e7edf3] flex justify-between items-center text-sm text-[#4c739a]">
            <span>Mostrando {pagosFiltrados.length} de {pagos.length} resultados</span>
            <span>Vista única</span>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-[#4c739a]">
            <span className="material-symbols-outlined text-[16px] align-middle mr-1">help</span>
            ¿Dudas? <a href="mailto:soporte@cuidadorapp.com" className="text-[#2b8cee] font-semibold hover:underline">Contactar soporte</a>
          </p>
        </div>
      </div>
    </CaregiverLayout>
  )
}
