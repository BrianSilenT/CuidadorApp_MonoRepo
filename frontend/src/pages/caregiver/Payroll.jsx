import { useState, useEffect, useMemo } from 'react'
import CaregiverLayout from '../../components/layouts/CaregiverLayout'
import Button from '../../components/common/Button'
import { LoadingState, EmptyState, ErrorState } from '../../components/common/DataState'
import { pagoService, guardiaService, unwrapList } from '../../services/api'

export default function Payroll() {
  const [pagos, setPagos] = useState([])
  const [guardias, setGuardias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [pagosRes, guardiasRes] = await Promise.all([
          pagoService.getAll(),
          guardiaService.getAll()
        ])
        setPagos(unwrapList(pagosRes.data))
        setGuardias(unwrapList(guardiasRes.data))
      } catch (err) {
        setError('Error al cargar los datos financieros.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const totalEarnings = useMemo(() => pagos.filter(p => p.confirmado).reduce((sum, p) => sum + p.monto, 0), [pagos])
  const pendingPayments = useMemo(() => pagos.filter(p => !p.confirmado).reduce((sum, p) => sum + p.monto, 0), [pagos])
  const currentBalance = totalEarnings // Simplified for demo
  
  // Sort pagos by date descending
  const sortedPagos = useMemo(() => {
    return [...pagos].sort((a, b) => new Date(b.fechaPago || b.id) - new Date(a.fechaPago || a.id))
  }, [pagos])

  return (
    <CaregiverLayout title="Payroll & Earnings">
      <div className="p-8 space-y-6 bg-[#f6f7f8] min-h-full">
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="text-sm text-[#4c739a] mb-1 uppercase tracking-wider font-semibold">FINANCIALS / OVERVIEW</div>
            <h1 className="text-3xl font-bold text-[#0d141b]">Payroll & Earnings</h1>
            <p className="text-[#4c739a] mt-1">Manage caregiver payments, view slips, and track financial history.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="bg-white">
              <span className="material-symbols-outlined mr-2 text-sm">print</span>
              Print Summary
            </Button>
            <Button variant="outline" className="bg-white">
              <span className="material-symbols-outlined mr-2 text-sm">download</span>
              Export CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl border border-[#e7edf3] shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-5 text-6xl p-4">
              <span className="material-symbols-outlined text-8xl">account_balance_wallet</span>
            </div>
            <p className="text-sm text-[#4c739a] font-semibold mb-2">Current Balance</p>
            <p className="text-3xl font-bold text-[#0d141b] mb-3">${currentBalance.toFixed(2)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-[#e7edf3] shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-5 text-6xl p-4">
              <span className="material-symbols-outlined text-8xl">attach_money</span>
            </div>
            <p className="text-sm text-[#4c739a] font-semibold mb-2">Total Earnings</p>
            <p className="text-3xl font-bold text-[#0d141b] mb-3">${totalEarnings.toFixed(2)}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#e7edf3] shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-5 text-6xl p-4">
              <span className="material-symbols-outlined text-8xl">pending</span>
            </div>
            <p className="text-sm text-[#4c739a] font-semibold mb-2">Pending Payments</p>
            <p className="text-3xl font-bold text-[#0d141b] mb-3">${pendingPayments.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e7edf3] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#e7edf3] flex justify-between items-center bg-white">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-[#0d141b]">Payment History</h2>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-semibold">{pagos.length} Records</span>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button className="px-4 py-1.5 bg-white shadow-sm rounded-md text-sm font-semibold text-[#0d141b]">All</button>
              <button className="px-4 py-1.5 text-sm font-semibold text-[#4c739a] hover:text-[#0d141b]">Completed</button>
              <button className="px-4 py-1.5 text-sm font-semibold text-[#4c739a] hover:text-[#0d141b]">Pending</button>
              <button className="px-4 py-1.5 text-sm font-semibold text-[#4c739a] hover:text-[#0d141b]">Rejected</button>
            </div>
          </div>

          {loading ? (
            <div className="p-8"><LoadingState label="Cargando pagos..." /></div>
          ) : error ? (
            <div className="p-8"><ErrorState message={error} /></div>
          ) : pagos.length === 0 ? (
            <div className="p-8"><EmptyState label="No hay historial de pagos." /></div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f6f7f8] text-[#4c739a] text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">DATE</th>
                  <th className="px-6 py-4 font-semibold">DESCRIPTION</th>
                  <th className="px-6 py-4 font-semibold">HOURS LOGGED</th>
                  <th className="px-6 py-4 font-semibold">NET AMOUNT</th>
                  <th className="px-6 py-4 font-semibold">STATUS</th>
                  <th className="px-6 py-4 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7edf3]">
                {sortedPagos.map((pago, idx) => {
                  const date = pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Pending'
                  const isPending = !pago.confirmado
                  
                  return (
                    <tr key={pago.id} className="hover:bg-[#f6f7f8]/50">
                      <td className="px-6 py-4 text-[#0d141b] font-medium">{date}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#0d141b]">Pago de Guardia</p>
                      </td>
                      <td className="px-6 py-4 text-[#4c739a]">-</td>
                      <td className="px-6 py-4 font-bold text-[#0d141b]">${pago.monto.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit gap-1 ${
                          isPending ? 'text-amber-700 bg-amber-50' : 'text-green-700 bg-green-50'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-amber-600' : 'bg-green-600'}`}></div>
                          {isPending ? 'Pending' : 'Paid'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-[#4c739a] hover:text-[#0d141b] p-2 rounded-lg hover:bg-gray-100">
                          <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          <div className="p-4 border-t border-[#e7edf3] flex justify-between items-center text-sm text-[#4c739a]">
            <span>Showing 1-{pagos.length} of {pagos.length} results</span>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 border border-[#e7edf3] rounded-lg hover:bg-gray-50 font-semibold">Previous</button>
              <button className="px-3 py-1.5 border border-[#e7edf3] rounded-lg hover:bg-gray-50 font-semibold">Next</button>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-sm text-[#4c739a]">
            <span className="material-symbols-outlined text-[16px] align-middle mr-1">help</span>
            Questions about your pay? <a href="#" className="text-[#2b8cee] font-semibold hover:underline">Contact HR Support</a>
          </p>
        </div>
      </div>
    </CaregiverLayout>
  )
}
