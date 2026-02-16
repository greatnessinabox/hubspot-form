/**
 * HubSpot Form Field Configuration
 */
export interface HubSpotFormField {
  name: string
  value: string | number | boolean
}

/**
 * Subscription Configuration
 */
export interface SubscriptionConfig {
  id: string | number
  fieldName: string // Field name in form data (e.g., 'agreeToUpdates')
  text: string // Display text for the subscription
  required?: boolean
}

/**
 * Custom Field Mapper
 * Allows transforming form data before submission
 */
export type FieldMapper = (formData: Record<string, any>) => HubSpotFormField[]

/**
 * Context Configuration
 */
export interface ContextConfig {
  pageUri?: string | (() => string)
  pageName?: string
  includeHutk?: boolean // Automatically include hutk cookie if available
}

/**
 * Legal Consent Options
 */
export interface LegalConsentConfig {
  consentText?: string
  privacyPolicyText?: string
  subscriptions: SubscriptionConfig[]
}

/**
 * HubSpot Form Configuration
 */
export interface HubSpotFormConfig {
  // HubSpot API Configuration
  portalId: string
  formGuid: string

  // Submission Method
  submissionMethod?: 'direct' | 'proxy' // Direct API call or proxy endpoint
  proxyEndpoint?: string // Required if submissionMethod is 'proxy'

  // Field Configuration
  fieldMapper?: FieldMapper // Custom field mapping function
  customFields?: HubSpotFormField[] // Additional fields to include

  // Context Configuration
  context?: ContextConfig

  // Legal Consent
  legalConsent?: LegalConsentConfig

  // Validation
  validation?: {
    requiredFields?: string[]
    customValidator?: (formData: Record<string, any>) => string | null // Returns error message or null
  }

  // Callbacks
  onSuccess?: (response: any) => void
  onError?: (error: Error | any) => void
  onBeforeSubmit?: (formData: Record<string, any>) => Record<string, any> | Promise<Record<string, any>>
}

/**
 * Form Submission Result
 */
export interface SubmissionResult {
  success: boolean
  data?: any
  error?: string | Error
}

/**
 * Default Form Data Structure
 */
export interface DefaultFormData {
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  countryCode?: string
  temp_artist_association?: string
  [key: string]: any // Allow additional fields
}



