'use client'

import React, { useState, useCallback, type FormEvent } from 'react'
import { submitToHubSpot, validateFormData, isSafeRedirectUrl, type HubSpotFormConfig, type DefaultFormData } from '../index'

export interface HubSpotFormProps extends HubSpotFormConfig {
  children?: React.ReactNode
  className?: string
  renderForm?: (props: FormRenderProps) => React.ReactNode
  initialData?: Partial<DefaultFormData>
}

export interface FormRenderProps {
  formData: Record<string, any>
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>
  isSubmitting: boolean
  handleSubmit: (e: FormEvent) => Promise<void>
  errors: Record<string, string>
  setFieldValue: (field: string, value: any) => void
}

/**
 * React Hook for HubSpot Form
 */
export function useHubSpotForm(config: HubSpotFormConfig, initialData?: Partial<DefaultFormData>) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData || {})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const setFieldValue = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [errors])

  const handleSubmit = useCallback(async (e?: FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    // Clear previous errors
    setErrors({})

    // Validate form data
    const validationError = validateFormData(formData, config)
    if (validationError) {
      setErrors({ _general: validationError })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await submitToHubSpot(formData, config)

      if (!result.success) {
        const errorMessage = result.error instanceof Error
          ? result.error.message
          : String(result.error || 'Form submission failed')
        setErrors({ _general: errorMessage })
      } else if (config.redirectUrl && typeof window !== 'undefined' && isSafeRedirectUrl(config.redirectUrl)) {
        window.location.href = config.redirectUrl
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setErrors({ _general: errorMessage })
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, config])

  return {
    formData,
    setFormData,
    isSubmitting,
    errors,
    handleSubmit,
    setFieldValue,
  }
}

/**
 * React Component for HubSpot Form
 */
export function HubSpotForm({
  children,
  className,
  renderForm,
  initialData,
  ...config
}: HubSpotFormProps) {
  const form = useHubSpotForm(config, initialData)

  const handleFormSubmit = async (e: FormEvent) => {
    await form.handleSubmit(e)
  }

  if (renderForm) {
    return (
      <form onSubmit={handleFormSubmit} className={className}>
        {renderForm({
          formData: form.formData,
          setFormData: form.setFormData,
          isSubmitting: form.isSubmitting,
          handleSubmit: handleFormSubmit,
          errors: form.errors,
          setFieldValue: form.setFieldValue,
        })}
      </form>
    )
  }

  return (
    <form onSubmit={handleFormSubmit} className={className}>
      {children}
    </form>
  )
}

export default HubSpotForm



