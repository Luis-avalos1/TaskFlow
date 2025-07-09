import React from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { isValidEmail } from '@shared/utils'

interface LoginForm {
  email: string
  password: string
}

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuthStore()
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    try {
      console.log('LoginPage: Starting login...')
      await login(data.email, data.password)
      console.log('LoginPage: Login successful, user should be set')
      toast.success('Successfully logged in!')
    } catch (error: any) {
      console.error('LoginPage: Login failed:', error)
      toast.error(error.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
        <p className="mt-2 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-blue-600 hover:text-blue-500">
            Register here
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            {...register('email', {
              required: 'Email is required',
              validate: (value) => isValidEmail(value) || 'Invalid email address'
            })}
            type="email"
            id="email"
            className="input mt-1"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
            type="password"
            id="password"
            className="input mt-1"
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary btn-default w-full"
        >
          {isLoading ? <LoadingSpinner size="small" /> : 'Sign in'}
        </button>
      </form>
    </div>
  )
}