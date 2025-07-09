import React from 'react'
import { useAuthStore } from '../../store/authStore'

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="card">
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
              <div className="mt-4 space-y-2">
                <p><span className="font-medium">Name:</span> {user?.firstName} {user?.lastName}</p>
                <p><span className="font-medium">Email:</span> {user?.email}</p>
                <p><span className="font-medium">Username:</span> {user?.username}</p>
                <p><span className="font-medium">Role:</span> {user?.role}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <button className="btn btn-primary btn-default">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}