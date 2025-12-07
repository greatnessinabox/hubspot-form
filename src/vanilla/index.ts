import { submitToHubSpot, validateFormData, type HubSpotFormConfig } from '../index'

/**
 * Initialize HubSpot form on a DOM element
 */
export interface VanillaHubSpotFormOptions extends HubSpotFormConfig {
  formSelector?: string // CSS selector for the form element
  formId?: string // ID of the form element
  autoInit?: boolean // Automatically initialize on DOMContentLoaded
}

/**
 * Get form data from a form element
 */
function getFormData(form: HTMLFormElement): Record<string, unknown> {
  const formData = new FormData(form)
  const data: Record<string, unknown> = {}

  // Iterate over FormData using forEach
  formData.forEach((value, key) => {
    // Handle checkboxes
    if (form.querySelector(`input[name="${key}"][type="checkbox"]`)) {
      const checkboxes = form.querySelectorAll(`input[name="${key}"][type="checkbox"]:checked`)
      if (checkboxes.length > 0) {
        data[key] = checkboxes.length === 1
          ? (checkboxes[0] as HTMLInputElement).value || true
          : Array.from(checkboxes).map(cb => (cb as HTMLInputElement).value)
      } else {
        data[key] = false
      }
    } else {
      data[key] = value
    }
  })

  return data
}

/**
 * Set form errors in the DOM
 */
function setFormErrors(form: HTMLFormElement, errors: Record<string, string>) {
  // Clear previous errors
  form.querySelectorAll('.hubspot-form-error').forEach(el => el.remove())

  // Add new errors
  for (const [field, message] of Object.entries(errors)) {
    if (field === '_general') {
      // General error message
      const errorEl = document.createElement('div')
      errorEl.className = 'hubspot-form-error hubspot-form-error-general'
      errorEl.textContent = message
      errorEl.style.color = 'red'
      errorEl.style.marginBottom = '1rem'
      form.insertBefore(errorEl, form.firstChild)
    } else {
      // Field-specific error
      const fieldEl = form.querySelector(`[name="${field}"]`) as HTMLElement
      if (fieldEl) {
        const errorEl = document.createElement('div')
        errorEl.className = 'hubspot-form-error hubspot-form-error-field'
        errorEl.textContent = message
        errorEl.style.color = 'red'
        errorEl.style.fontSize = '0.875rem'
        errorEl.style.marginTop = '0.25rem'
        fieldEl.parentElement?.appendChild(errorEl)
      }
    }
  }
}

/**
 * Initialize HubSpot form on a form element
 */
export function initHubSpotForm(options: VanillaHubSpotFormOptions): {
  submit: () => Promise<void>
  destroy: () => void
} {
  const {
    formSelector,
    formId,
    autoInit = true,
    ...config
  } = options

  let formElement: HTMLFormElement | null = null

  const findForm = (): HTMLFormElement | null => {
    if (formId) {
      return document.getElementById(formId) as HTMLFormElement
    }
    if (formSelector) {
      return document.querySelector(formSelector) as HTMLFormElement
    }
    // Default: find first form with data-hubspot-form attribute
    return document.querySelector('form[data-hubspot-form]') as HTMLFormElement
  }

  const handleSubmit = async (e?: Event) => {
    if (e) {
      e.preventDefault()
    }

    if (!formElement) {
      formElement = findForm()
      if (!formElement) {
        console.error('HubSpot form element not found')
        return
      }
    }

    const formData = getFormData(formElement)

    // Validate
    const validationError = validateFormData(formData, config)
    if (validationError) {
      setFormErrors(formElement, { _general: validationError })
      return
    }

    // Clear errors
    setFormErrors(formElement, {})

    // Disable submit button
    const submitButton = formElement.querySelector('button[type="submit"], input[type="submit"]') as HTMLElement
    const originalText = submitButton?.textContent
    if (submitButton) {
      submitButton.setAttribute('disabled', 'true')
      if (originalText) {
        submitButton.textContent = 'Submitting...'
      }
    }

    try {
      const result = await submitToHubSpot(formData, config)

      if (!result.success) {
        const errorMessage = result.error instanceof Error
          ? result.error.message
          : String(result.error || 'Form submission failed')
        setFormErrors(formElement, { _general: errorMessage })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setFormErrors(formElement, { _general: errorMessage })
    } finally {
      // Re-enable submit button
      if (submitButton) {
        submitButton.removeAttribute('disabled')
        if (originalText) {
          submitButton.textContent = originalText
        }
      }
    }
  }

  const init = () => {
    formElement = findForm()
    if (!formElement) {
      console.warn('HubSpot form element not found. Make sure the form exists in the DOM.')
      return
    }

    formElement.addEventListener('submit', handleSubmit)
  }

  const destroy = () => {
    if (formElement) {
      formElement.removeEventListener('submit', handleSubmit)
    }
  }

  if (autoInit) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init)
    } else {
      init()
    }
  } else {
    init()
  }

  return {
    submit: async () => handleSubmit(),
    destroy,
  }
}

/**
 * Auto-initialize all forms with data-hubspot-form attribute
 */
export function autoInitHubSpotForms(config: HubSpotFormConfig) {
  if (typeof document === 'undefined') return

  const initAll = () => {
    const forms = document.querySelectorAll('form[data-hubspot-form]')
    forms.forEach((form, index) => {
      const formId = form.id || `hubspot-form-${index}`
      if (!form.id) {
        form.id = formId
      }
      initHubSpotForm({
        ...config,
        formId,
        autoInit: false,
      })
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll)
  } else {
    initAll()
  }
}

