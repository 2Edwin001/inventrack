import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-200 dark:bg-gray-900">
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
