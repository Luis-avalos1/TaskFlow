import React from 'react'
import { useAuthStore } from '../../store/authStore'

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your projects today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Projects</h3>
          <p className="text-3xl font-bold text-blue-600">3</p>
          <p className="text-sm text-gray-500">2 on track, 1 behind</p>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Tasks</h3>
          <p className="text-3xl font-bold text-orange-600">12</p>
          <p className="text-sm text-gray-500">5 high priority</p>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed Tasks</h3>
          <p className="text-3xl font-bold text-green-600">48</p>
          <p className="text-sm text-gray-500">This month</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="card">
          <div className="p-6">
            <p className="text-gray-600">
              Your dashboard will show recent project activity, task updates, and team notifications here.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}