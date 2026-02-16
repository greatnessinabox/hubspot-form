import type {
  HubSpotFormConfig,
  HubSpotFormField,
  SubmissionResult,
  ContextConfig,
  LegalConsentConfig,
} from '../types'

/**
 * Check if a redirect URL is safe (relative path, or http/https)
 */
export function isSafeRedirectUrl(url: string): boolean {
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return true
  }
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Get hutk cookie from browser
 */
function getHutkCookie(): string | null {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie.split(';')
  const hutkCookie = cookies.find(cookie => cookie.trim().startsWith('hutk='))

  if (hutkCookie) {
    return hutkCookie.split('=')[1]?.trim() || null
  }

  return null
}

/**
 * Build HubSpot context object
 */
function buildContext(config: ContextConfig | undefined): Record<string, any> {
  const context: Record<string, any> = {}

  if (!config) return context

  if (config.pageUri) {
    context.pageUri = typeof config.pageUri === 'function'
      ? config.pageUri()
      : config.pageUri
  }

  if (config.pageName) {
    context.pageName = config.pageName
  }

  if (config.includeHutk !== false) {
    const hutk = getHutkCookie()
    if (hutk) {
      context.hutk = hutk
    }
  }

  return context
}

/**
 * Build legal consent options
 */
function buildLegalConsent(
  formData: Record<string, any>,
  config: LegalConsentConfig | undefined
): Record<string, any> | undefined {
  if (!config) return undefined

  const communications = config.subscriptions.map(sub => ({
    value: Boolean(formData[sub.fieldName]),
    subscriptionTypeId: Number(sub.id),
    text: sub.text,
  }))

  return {
    consent: {
      consentToProcess: true,
      text: config.consentText || 'I agree to allow processing of my personal data.',
      communications,
    },
    privacyPolicy: {
      consentToProcess: true,
      text: config.privacyPolicyText || 'By submitting, you consent to our Privacy Policy.',
    },
  }
}

/**
 * Default field mapper - maps common form fields to HubSpot format
 */
function defaultFieldMapper(formData: Record<string, any>): HubSpotFormField[] {
  const fields: HubSpotFormField[] = []

  if (formData.firstName) {
    fields.push({ name: 'firstname', value: formData.firstName })
  }

  if (formData.lastName) {
    fields.push({ name: 'lastname', value: formData.lastName })
  }

  if (formData.email) {
    fields.push({ name: 'email', value: formData.email })
  }

  if (formData.phoneNumber && formData.phoneNumber.trim()) {
    const phoneValue = formData.countryCode
      ? `${formData.countryCode}${formData.phoneNumber}`
      : formData.phoneNumber
    fields.push({ name: 'phone', value: phoneValue })
  }

  return fields
}

/**
 * Submit form data to HubSpot
 */
export async function submitToHubSpot(
  formData: Record<string, any>,
  config: HubSpotFormConfig
): Promise<SubmissionResult> {
  try {
    // Validate required configuration
    if (!config.portalId || !config.formGuid) {
      throw new Error('HubSpot portalId and formGuid are required')
    }

    // Transform form data if custom transformer provided
    let transformedData = formData
    if (config.onBeforeSubmit) {
      transformedData = await config.onBeforeSubmit(formData)
    }

    // Build fields array
    const fieldMapper = config.fieldMapper || defaultFieldMapper
    const fields = fieldMapper(transformedData)

    // Add custom fields
    if (config.customFields) {
      fields.push(...config.customFields)
    }

    // Build context
    const context = buildContext(config.context)

    // Build legal consent
    const legalConsentOptions = buildLegalConsent(transformedData, config.legalConsent)

    // Prepare HubSpot payload
    const payload: Record<string, any> = {
      fields,
      ...(Object.keys(context).length > 0 && { context }),
      ...(legalConsentOptions && { legalConsentOptions }),
    }

    // Determine submission method
    const submissionMethod = config.submissionMethod || 'direct'

    let response: Response

    if (submissionMethod === 'proxy') {
      // Submit via proxy endpoint
      if (!config.proxyEndpoint) {
        throw new Error('proxyEndpoint is required when submissionMethod is "proxy"')
      }

      response = await fetch(config.proxyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies (hutk)
        body: JSON.stringify(transformedData),
      })
    } else {
      // Direct HubSpot API submission
      const url = `https://api.hsforms.com/submissions/v3/integration/submit/${config.portalId}/${config.formGuid}`

      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
    }

    const responseText = await response.text()
    let responseData: any

    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = responseText
    }

    if (!response.ok) {
      const error = new Error(
        `HubSpot API error: ${response.status} - ${JSON.stringify(responseData)}`
      )

      if (config.onError) {
        config.onError(error)
      }

      return {
        success: false,
        error,
      }
    }

    const result: SubmissionResult = {
      success: true,
      data: responseData,
    }

    if (config.onSuccess) {
      config.onSuccess(responseData)
    }

    return result
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))

    if (config.onError) {
      config.onError(err)
    }

    return {
      success: false,
      error: err,
    }
  }
}

/**
 * Validate form data
 */
export function validateFormData(
  formData: Record<string, any>,
  config: HubSpotFormConfig
): string | null {
  // Check required fields
  if (config.validation?.requiredFields) {
    for (const field of config.validation.requiredFields) {
      if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
        return `${field} is required`
      }
    }
  }

  // Check subscription requirements
  if (config.legalConsent?.subscriptions) {
    for (const subscription of config.legalConsent.subscriptions) {
      if (subscription.required && !formData[subscription.fieldName]) {
        return subscription.text || `${subscription.fieldName} is required`
      }
    }
  }

  // Custom validator
  if (config.validation?.customValidator) {
    const customError = config.validation.customValidator(formData)
    if (customError) {
      return customError
    }
  }

  return null
}



