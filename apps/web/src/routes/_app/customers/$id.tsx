import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  ChevronLeft,
  User,
  Phone,
  Mail,
  FileText,
  CreditCard,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react'

export const Route = createFileRoute('/_app/customers/$id')({
  component: CustomerDetailPage,
})

const apiUrl = import.meta.env['VITE_API_URL'] ?? ''
function getToken() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('adminToken') ?? ''
}

function CustomerDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const token = getToken()

  const {
    data: customer,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-customer', id],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/v1/admin/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        throw new Error(`Failed to fetch customer: ${res.status}`)
      }
      return res.json()
    },
    enabled: !!token,
  })

  if (isLoading)
    return <div className="p-8 text-center text-gray-400">Loading...</div>
  if (error)
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">
          Error loading customer: {(error as Error).message}
        </p>
        <button
          onClick={() => navigate({ to: '/customers' })}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Members
        </button>
      </div>
    )
  if (!customer)
    return (
      <div className="p-8 text-center text-gray-400">Customer not found</div>
    )

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const statusColors: Record<string, string> = {
    APPROVED: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    UNDER_REVIEW: 'bg-orange-100 text-orange-700',
    REJECTED: 'bg-red-100 text-red-700',
    SUBMITTED: 'bg-blue-100 text-blue-700',
    DRAFT: 'bg-gray-100 text-gray-600',
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 size={14} />
      case 'REJECTED':
        return <XCircle size={14} />
      default:
        return <Clock size={14} />
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-7 bg-gray-50">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate({ to: '/customers' })}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft size={16} /> Back to Members
        </button>
      </div>

      <div className="mx-auto max-w-5xl space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-2xl font-bold">
              {customer.fullName?.charAt(0) ?? 'U'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {customer.fullName ?? '—'}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone size={14} />
                  {customer.phone ?? '—'}
                </div>
                {customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={14} />
                    {customer.email}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FileText size={14} />
                  Passbook: {customer.passbookNumber ?? '—'}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  Joined: {formatDate(customer.createdAt)}
                </div>
              </div>
            </div>
            {customer.kyc?.status && (
              <div
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${statusColors[customer.kyc.status] ?? 'bg-gray-100'}`}
              >
                {getStatusIcon(customer.kyc.status)}
                KYC: {customer.kyc.status}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cooperative Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={18} />
              Cooperative Information
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Cooperative Name</p>
                <p className="font-medium text-gray-900">
                  {typeof customer.cooperative === 'string'
                    ? customer.cooperative
                    : (customer.cooperative?.name ?? '—')}
                </p>
              </div>
              {customer.cooperative?.code && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Code</p>
                  <p className="font-medium text-gray-900">
                    {customer.cooperative.code}
                  </p>
                </div>
              )}
              {customer.cooperative?.address && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Address</p>
                  <p className="font-medium text-gray-900">
                    {customer.cooperative.address}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* KYC Summary */}
          {customer.kyc && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User size={18} />
                KYC Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Status</p>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[customer.kyc.status] ?? 'bg-gray-100'}`}
                  >
                    {getStatusIcon(customer.kyc.status)}
                    {customer.kyc.status}
                  </span>
                </div>
                {customer.kyc.citizenshipNumber && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">
                      Citizenship Number
                    </p>
                    <p className="font-medium text-gray-900">
                      {customer.kyc.citizenshipNumber}
                    </p>
                  </div>
                )}
                {customer.kyc.dob && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Date of Birth</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(customer.kyc.dob)}
                    </p>
                  </div>
                )}
                {customer.kyc.submittedAt && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Submitted At</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(customer.kyc.submittedAt)}
                    </p>
                  </div>
                )}
                {customer.kyc.rejectionReason && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">
                      Rejection Reason
                    </p>
                    <p className="font-medium text-red-700">
                      {customer.kyc.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* KYC Details (if approved) */}
        {customer.kyc && customer.kyc.status === 'APPROVED' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Personal Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {(() => {
                const genealogyData = customer.kyc.genealogyJson as Array<{
                  relation?: string
                  nameEn?: string
                  surnameEn?: string
                  nameNp?: string
                  surnameNp?: string
                }> | null

                if (!genealogyData || genealogyData.length === 0) {
                  return null
                }

                const getFullName = (item: (typeof genealogyData)[0]) => {
                  if (!item) return ''
                  const nameEn = [item.nameEn, item.surnameEn]
                    .filter(Boolean)
                    .join(' ')
                  const nameNp = [item.nameNp, item.surnameNp]
                    .filter(Boolean)
                    .join(' ')
                  return nameEn || nameNp
                }

                const grandfather = genealogyData.find(
                  (item) => item.relation === 'Grandfather',
                )
                const father = genealogyData.find(
                  (item) => item.relation === 'Father',
                )
                const spouse = genealogyData.find(
                  (item) => item.relation === 'Spouse',
                )

                return (
                  <>
                    {grandfather && getFullName(grandfather) && (
                      <div>
                        <p className="text-gray-500 text-xs mb-1">
                          Grandfather's Name
                        </p>
                        <p className="font-medium text-gray-900">
                          {getFullName(grandfather)}
                        </p>
                      </div>
                    )}
                    {father && getFullName(father) && (
                      <div>
                        <p className="text-gray-500 text-xs mb-1">
                          Father's Name
                        </p>
                        <p className="font-medium text-gray-900">
                          {getFullName(father)}
                        </p>
                      </div>
                    )}
                    {spouse && getFullName(spouse) && (
                      <div>
                        <p className="text-gray-500 text-xs mb-1">
                          Spouse's Name
                        </p>
                        <p className="font-medium text-gray-900">
                          {getFullName(spouse)}
                        </p>
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
            {(customer.kyc.district || customer.kyc.municipality) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Address Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  {customer.kyc.district?.name && (
                    <div>
                      <p className="text-gray-500 text-xs mb-1">District</p>
                      <p className="font-medium text-gray-900">
                        {customer.kyc.district.name}
                      </p>
                    </div>
                  )}
                  {customer.kyc.municipality?.name && (
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Municipality</p>
                      <p className="font-medium text-gray-900">
                        {customer.kyc.municipality.name}
                      </p>
                    </div>
                  )}
                  {customer.kyc.wardNumber && (
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Ward Number</p>
                      <p className="font-medium text-gray-900">
                        {customer.kyc.wardNumber}
                      </p>
                    </div>
                  )}
                  {customer.kyc.tole && (
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Tole</p>
                      <p className="font-medium text-gray-900">
                        {customer.kyc.tole}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loan Applications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard size={18} />
              Loan Applications ({customer._count?.loanApplications ?? 0})
            </h2>
          </div>
          {!customer.loanApplications ||
          customer.loanApplications.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">
              No loan applications yet
            </p>
          ) : (
            <div className="space-y-3">
              {customer.loanApplications.map((loan: any) => (
                <Link
                  key={loan.id}
                  to={`/loans/${loan.id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 text-sm">
                          Ref: {loan.referenceNumber}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[loan.status] ?? 'bg-gray-100'}`}
                        >
                          {getStatusIcon(loan.status)}
                          {loan.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span>
                          NPR {loan.loanAmount?.toLocaleString() ?? '—'}
                        </span>
                        <span>{loan.purpose?.replace('_', ' ') ?? '—'}</span>
                        <span>{loan.duration?.replace('_', ' ') ?? '—'}</span>
                        {loan.submittedAt && (
                          <span>Submitted: {formatDate(loan.submittedAt)}</span>
                        )}
                      </div>
                    </div>
                    <ChevronLeft
                      className="rotate-180 text-gray-400"
                      size={16}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
