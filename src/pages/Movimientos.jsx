import Card from '../components/Card'
import Table from '../components/Table'
import Button from '../components/Button'
import Badge from '../components/Badge'

const columns = [
  { key: 'fecha', header: 'Fecha' },
  { key: 'producto', header: 'Producto' },
  {
    key: 'tipo',
    header: 'Tipo',
    render: (val) => (
      <Badge variant={val === 'Entrada' ? 'green' : 'yellow'}>{val}</Badge>
    ),
  },
  { key: 'cantidad', header: 'Cantidad' },
  { key: 'sede', header: 'Sede' },
  { key: 'responsable', header: 'Responsable' },
]

export default function Movimientos() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Movimientos</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Registro de entradas y salidas de productos.
          </p>
        </div>
        <Button>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Registrar movimiento
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={[]}
          emptyTitle="Sin movimientos registrados"
          emptyDescription="Los movimientos de entrada y salida aparecerán aquí."
        />
      </Card>
    </div>
  )
}
