import Card from '../components/Card'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'

const buildingIcon = (
  <svg className="h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
)

export default function Sedes() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sedes</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Administra las ubicaciones donde se gestiona el inventario.
          </p>
        </div>
        <Button>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva sede
        </Button>
      </div>

      <Card>
        <EmptyState
          title="Sin sedes registradas"
          description="Crea tu primera sede para comenzar a asociar inventario por ubicación."
          icon={buildingIcon}
          action={
            <Button>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Crear sede
            </Button>
          }
        />
      </Card>
    </div>
  )
}
