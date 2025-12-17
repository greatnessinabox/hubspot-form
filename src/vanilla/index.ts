import { submitToHubSpot, validateFormData, type HubSpotFormConfig } from '../index'

/**
 * Initialize HubSpot form on a DOM element
 */
export interface VanillaHubSpotFormOptions extends HubSpotFormConfig {
  formSelector?: string // CSS selector for the form element
  formId?: string // ID of the form element
  autoInit?: boolean // Automatically initialize on DOMContentLoaded
  /**
   * UI layout mode.
   * - 'inline' (default): leaves the form where it is in the DOM
   * - 'corner': moves the form into a bottom-right popup panel with a launcher button
   *
   * You can also set this via the form attribute: data-hsf-layout="corner"
   */
  layout?: 'inline' | 'corner'
  /**
   * Corner popup UI options (only used when layout === 'corner')
   */
  corner?: {
    launcherText?: string
    title?: string
    description?: string
    defaultOpen?: boolean
  }
}

type CornerMount = {
  destroy: () => void
}

const CORNER_STYLE_ID = 'hsf-corner-styles'

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

function readLayoutFromDataset(form: HTMLFormElement): 'inline' | 'corner' | null {
  const raw = form.getAttribute('data-hsf-layout') || form.dataset.hsfLayout
  if (!raw) return null
  if (raw === 'corner') return 'corner'
  if (raw === 'inline') return 'inline'
  return null
}

function ensureCornerStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(CORNER_STYLE_ID)) return

  const style = document.createElement('style')
  style.id = CORNER_STYLE_ID
  style.textContent = `
.hsf-corner-root{
  position:fixed;
  right:24px;
  bottom:24px;
  z-index:999999;
  font-family:var(--hsf-font, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace);
}
.hsf-corner-launcher{
  appearance:none;
  border:0;
  border-radius:12px;
  padding:12px 14px;
  background:var(--hsf-button-bg, #111827);
  color:var(--hsf-button-text, #ffffff);
  font-family:inherit;
  font-weight:700;
  letter-spacing:.06em;
  text-transform:uppercase;
  cursor:pointer;
  box-shadow:0 12px 28px rgba(0,0,0,.18);
}
.hsf-corner-panel{
  width:min(420px, calc(100vw - 48px));
  margin-bottom:12px;
  background:var(--hsf-bg, #ffffff);
  color:var(--hsf-text, #111827);
  border:1px solid var(--hsf-border, #e5e7eb);
  border-radius:14px;
  box-shadow:0 18px 44px rgba(0,0,0,.22);
  overflow:hidden;
  transform:translateY(8px);
  opacity:0;
  pointer-events:none;
  transition:opacity 160ms ease, transform 160ms ease;
}
.hsf-corner-panel.is-open{
  transform:translateY(0);
  opacity:1;
  pointer-events:auto;
}
.hsf-corner-header{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:12px;
  padding:14px 14px 10px;
  border-bottom:1px solid var(--hsf-border, #e5e7eb);
}
.hsf-corner-title{
  font-weight:800;
  font-size:14px;
  letter-spacing:.08em;
  text-transform:uppercase;
}
.hsf-corner-description{
  margin-top:4px;
  font-size:12px;
  color:var(--hsf-muted, #6b7280);
  line-height:1.4;
}
.hsf-corner-close{
  appearance:none;
  border:0;
  background:transparent;
  color:var(--hsf-muted, #6b7280);
  font-size:22px;
  line-height:1;
  cursor:pointer;
  padding:2px 6px;
  border-radius:8px;
}
.hsf-corner-close:hover{
  background:rgba(0,0,0,.06);
  color:var(--hsf-text, #111827);
}
.hsf-corner-body{ padding:14px; }
/* When in corner mode, let the moved form fill the panel */
.hsf-corner-body form[data-hubspot-form]{
  max-width:100% !important;
  margin:0 !important;
}
  `.trim()

  document.head.appendChild(style)
}

function mountCornerUI(
  form: HTMLFormElement,
  opts: VanillaHubSpotFormOptions['corner'] | undefined
): CornerMount {
  ensureCornerStyles()

  const existingRootId = form.dataset.hsfCornerRootId
  if (existingRootId) {
    const existing = document.getElementById(existingRootId)
    if (existing) {
      return {
        destroy: () => {
          // Best-effort cleanup; if user calls init twice we won't double-mount
          existing.remove()
          delete form.dataset.hsfCornerRootId
        },
      }
    }
    delete form.dataset.hsfCornerRootId
  }

  const formId = form.id || `hubspot-form-${Math.random().toString(16).slice(2)}`
  if (!form.id) form.id = formId

  const root = document.createElement('div')
  root.className = 'hsf-corner-root'
  root.id = `hsf-corner-${formId}`
  form.dataset.hsfCornerRootId = root.id

  const launcher = document.createElement('button')
  launcher.type = 'button'
  launcher.className = 'hsf-corner-launcher'
  launcher.textContent = opts?.launcherText || 'Sign up'
  launcher.setAttribute('aria-expanded', 'false')
  launcher.setAttribute('aria-controls', `${root.id}-panel`)

  const panel = document.createElement('div')
  panel.className = 'hsf-corner-panel'
  panel.id = `${root.id}-panel`
  panel.setAttribute('role', 'dialog')
  panel.setAttribute('aria-modal', 'false')
  panel.setAttribute('aria-hidden', 'true')

  const header = document.createElement('div')
  header.className = 'hsf-corner-header'

  const headerText = document.createElement('div')
  headerText.className = 'hsf-corner-header-text'

  const title = document.createElement('div')
  title.className = 'hsf-corner-title'
  title.textContent = opts?.title || 'Join'

  headerText.appendChild(title)

  if (opts?.description) {
    const desc = document.createElement('div')
    desc.className = 'hsf-corner-description'
    desc.textContent = opts.description
    headerText.appendChild(desc)
  }

  const closeBtn = document.createElement('button')
  closeBtn.type = 'button'
  closeBtn.className = 'hsf-corner-close'
  closeBtn.textContent = '×'
  closeBtn.setAttribute('aria-label', 'Close')

  header.appendChild(headerText)
  header.appendChild(closeBtn)

  const body = document.createElement('div')
  body.className = 'hsf-corner-body'

  // Preserve original position so we can restore on destroy
  const originalParent = form.parentElement
  const originalNextSibling = form.nextSibling

  body.appendChild(form)
  panel.appendChild(header)
  panel.appendChild(body)
  root.appendChild(panel)
  root.appendChild(launcher)
  document.body.appendChild(root)

  const setOpen = (open: boolean) => {
    launcher.setAttribute('aria-expanded', open ? 'true' : 'false')
    panel.setAttribute('aria-hidden', open ? 'false' : 'true')
    panel.classList.toggle('is-open', open)
    launcher.classList.toggle('is-open', open)
  }

  const toggle = () => setOpen(panel.getAttribute('aria-hidden') !== 'false')

  const onLauncherClick = () => toggle()
  const onCloseClick = () => setOpen(false)
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false)
  }

  launcher.addEventListener('click', onLauncherClick)
  closeBtn.addEventListener('click', onCloseClick)
  document.addEventListener('keydown', onKeyDown)

  // Default open/closed state
  setOpen(Boolean(opts?.defaultOpen))

  return {
    destroy: () => {
      launcher.removeEventListener('click', onLauncherClick)
      closeBtn.removeEventListener('click', onCloseClick)
      document.removeEventListener('keydown', onKeyDown)

      // Restore the form to its original location if possible
      if (originalParent) {
        if (originalNextSibling && originalNextSibling.parentNode === originalParent) {
          originalParent.insertBefore(form, originalNextSibling)
        } else {
          originalParent.appendChild(form)
        }
      }

      root.remove()
      delete form.dataset.hsfCornerRootId
    },
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
    layout: layoutOverride,
    corner,
    ...config
  } = options

  let formElement: HTMLFormElement | null = null
  let cornerMount: CornerMount | null = null

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

    const layout = layoutOverride || readLayoutFromDataset(formElement) || 'inline'
    if (layout === 'corner') {
      cornerMount = mountCornerUI(formElement, corner)
    }

    formElement.addEventListener('submit', handleSubmit)
  }

  const destroy = () => {
    if (formElement) {
      formElement.removeEventListener('submit', handleSubmit)
    }
    if (cornerMount) {
      cornerMount.destroy()
      cornerMount = null
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

