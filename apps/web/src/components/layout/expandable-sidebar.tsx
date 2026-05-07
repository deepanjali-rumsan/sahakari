import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@rs/ui'

export interface SidebarNavItem {
  icon: React.ReactNode
  label: string
  /** TanStack Router route path – when provided, renders a <Link> with auto active state */
  to?: string
  badge?: number
  onClick?: () => void
}

export interface ExpandableSidebarProps {
  navItems?: SidebarNavItem[]
  /** Avatar URL shown at the bottom */
  avatar?: string
  /** Footer label rendered vertically */
  footerLabel?: string
  className?: string
  isExpanded?: boolean
  onToggle?: () => void
}

const activeClass = 'text-white bg-orange-500'
const inactiveClass = 'text-gray-400 hover:text-white hover:bg-gray-700'

function AppLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect width="40" height="40" rx="10" fill="currentColor" opacity="0.15" />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill="currentColor"
        fontSize="14"
        fontWeight="bold"
        fontFamily="Inter, sans-serif"
      >
        RC
      </text>
    </svg>
  )
}

export function ExpandableSidebar({
  navItems = [],
  avatar,
  footerLabel,
  className,
  isExpanded = false,
  onToggle,
}: ExpandableSidebarProps) {
  return (
    <div
      className={cn(
        'bg-[#1a1a1a] flex flex-col py-4 gap-2 flex-shrink-0 transition-all duration-300 ease-in-out relative',
        isExpanded ? 'w-64' : 'w-16',
        className,
      )}
    >
      {/* Logo and Title */}
      <div className="flex items-center px-4 mb-4 h-10">
        <div className="text-white flex h-10 w-10 items-center justify-center flex-shrink-0">
          <AppLogo className="h-8 w-8 text-white" />
        </div>
        {isExpanded && (
          <div className="ml-3 overflow-hidden">
            <h1 className="text-white font-bold text-lg whitespace-nowrap">
              Sahakari Admin
            </h1>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute top-4 -right-3 bg-[#1a1a1a] border border-gray-600 text-gray-400 hover:text-white rounded-full p-1 hover:bg-gray-700 transition-colors z-10"
        >
          {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-2">
        {navItems.map((item, i) =>
          item.to ? (
            <Link
              key={i}
              to={item.to}
              className={cn(
                'relative flex items-center gap-3 p-3 rounded-xl transition-colors mb-1',
                inactiveClass,
              )}
              activeProps={{
                className: cn(
                  'relative flex items-center gap-3 p-3 rounded-xl transition-colors mb-1',
                  activeClass,
                ),
              }}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {isExpanded && (
                <span className="font-medium whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
              {item.badge != null && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 border border-[#1a1a1a] rounded-full text-[10px] flex items-center justify-center text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          ) : (
            <button
              key={i}
              onClick={item.onClick}
              className={cn(
                'relative flex items-center gap-3 p-3 rounded-xl transition-colors mb-1 w-full',
                inactiveClass,
              )}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {isExpanded && (
                <span className="font-medium whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
              {item.badge != null && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 border border-[#1a1a1a] rounded-full text-[10px] flex items-center justify-center text-white">
                  {item.badge}
                </span>
              )}
            </button>
          ),
        )}
      </nav>

      {/* Bottom */}
      <div className="px-2 flex flex-col gap-2">
        <button
          className={cn(
            'flex items-center gap-3 p-3 rounded-xl transition-colors w-full',
            inactiveClass,
          )}
        >
          <div className="flex-shrink-0">
            <Settings size={18} />
          </div>
          {isExpanded && (
            <span className="font-medium whitespace-nowrap overflow-hidden">
              Settings
            </span>
          )}
        </button>

        {avatar && (
          <div className="flex items-center gap-3 px-3 py-2">
            <img
              src={avatar}
              alt="user"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            {isExpanded && (
              <div className="overflow-hidden">
                <p className="text-white text-sm font-medium whitespace-nowrap">
                  Admin User
                </p>
                <p className="text-gray-400 text-xs whitespace-nowrap">
                  admin@sahakari.com
                </p>
              </div>
            )}
          </div>
        )}

        {footerLabel && isExpanded && (
          <p className="text-gray-600 text-xs px-3 py-2">{footerLabel}</p>
        )}
      </div>
    </div>
  )
}
