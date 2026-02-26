import Card from '../components/Card'
import Table from '../components/Table'
import Button from '../components/Button'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'

const columns = [
  { key: 'codigo', header: 'Código' },
  { key: 'nombre', header: 'Producto' },
  { key: 'categoria', header: 'Categoría' },
  {
    key: 'stock',
    header: 'Stock',
    render: (val, row) => {
      const variant = val === 0 ? 'red' : val <= row.minimo ? 'yellow' : 'green'
      return <Badge variant={variant}>{val} u.</Badge>
    },
  },
  { key: 'minimo', header: 'Mínimo' },
  { key: 'sede', header: 'Sede' },
  {
    key: 'actions',
    header: '',
    render: () => (
      <div className="flex gap-2">
        <button className="text-xs text-indigo-600 hover:underline dark:text-indigo-400">Editar</button>
        <button className="text-xs text-red-500 hover:underline">Eliminar</button>
      </div>
    ),
  },
]

export default function Inventario() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inventario</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestiona todos los productos y su stock disponible.
          </p>
        </div>
        <Button>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo producto
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={[]}
          emptyTitle="Sin productos registrados"
          emptyDescription="Agrega tu primer producto para comenzar a gestionar el inventario."
        />
      </Card>
    </div>
  )
}
