import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Users, FileText, CreditCard, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import { AppShell, ExpandableSidebar } from '../components/layout'

export const Route = createFileRoute('/_app')({
  beforeLoad: () => {
    if (!localStorage.getItem('adminToken')) {
      throw redirect({ to: '/login' })
    }
  },
  component: AppLayout,
})

const NAV_ITEMS = [
  {
    icon: <LayoutDashboard size={18} />,
    label: 'Dashboard',
    to: '/dashboard',
  },
  {
    icon: <FileText size={18} />,
    label: 'KYC Applications',
    to: '/kyc',
  },
  {
    icon: <CreditCard size={18} />,
    label: 'Loan Applications',
    to: '/loans',
  },
  {
    icon: <Users size={18} />,
    label: 'Members',
    to: '/customers',
  },
]

function AppLayout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    // Remember sidebar state in localStorage
    const saved = localStorage.getItem('sidebar-expanded')
    return saved ? JSON.parse(saved) : false
  })

  const handleSidebarToggle = () => {
    const newState = !sidebarExpanded
    setSidebarExpanded(newState)
    localStorage.setItem('sidebar-expanded', JSON.stringify(newState))
  }

  return (
    <AppShell
      sidebar={
        <ExpandableSidebar
          navItems={NAV_ITEMS}
          avatar="https://i.pravatar.cc/32?img=33"
          isExpanded={sidebarExpanded}
          onToggle={handleSidebarToggle}
          footerLabel="Sahakari Cooperative Management System"
        />
      }
    >
      <Outlet />
    </AppShell>
  )
}
