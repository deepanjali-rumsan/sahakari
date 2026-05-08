import { createFileRoute, redirect } from '@tanstack/react-router'
import { CooperativeRegistrationForm } from '../components/CooperativeRegistrationForm'

export const Route = createFileRoute('/setup-cooperative')({
  beforeLoad: async () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      throw redirect({ to: '/login' })
    }

    // Check if cooperative is already set up
    try {
      const apiUrl = import.meta.env['VITE_API_URL'] ?? ''
      const res = await fetch(`${apiUrl}/v1/cooperative/check`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()

      // If already set up, redirect to dashboard
      if (data.isSetup) {
        throw redirect({ to: '/dashboard' })
      }
    } catch (error) {
      // If error, allow them to proceed to setup page
      console.error('Error checking cooperative setup:', error)
    }
  },
  component: SetupCooperativePage,
})

function SetupCooperativePage() {
  return <CooperativeRegistrationForm />
}
