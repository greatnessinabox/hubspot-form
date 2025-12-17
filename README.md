# @greatnessinabox/hubspot-form

A modular, framework-agnostic HubSpot form submission library that can be easily integrated into any web application.

**Perfect for:** Squarespace sites, React apps, Vue apps, Next.js, and any website!

[![npm version](https://img.shields.io/npm/v/@greatnessinabox/hubspot-form)](https://www.npmjs.com/package/@greatnessinabox/hubspot-form)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Quick Links

- **[Squarespace Setup Guide](./SQUARESPACE_GUIDE.md)** - Step-by-step guide for non-developers
- **[Usage Examples](./USAGE.md)** - Detailed examples for different frameworks

## Features

- 🚀 **Framework Agnostic** - Works with React, Vue, Angular, vanilla JS, or any framework
- 🔧 **Highly Configurable** - Customize fields, subscriptions, validation, and styling
- 📦 **Multiple Entry Points** - Core library, React hooks/components, and vanilla JS implementation
- 🎯 **Type Safe** - Full TypeScript support
- 🔒 **Privacy Compliant** - Built-in GDPR consent handling
- 🍪 **Cookie Support** - Automatic hutk cookie handling for contact linking
- ✅ **Validation** - Built-in and custom validation support
- 🎨 **Styling Agnostic** - Bring your own styles

## Installation

### For Squarespace (No Installation Needed!)

Just use the CDN - see [Squarespace Guide](./SQUARESPACE_GUIDE.md) for step-by-step instructions.

```html
<script type="module">
  import { initHubSpotForm } from 'https://unpkg.com/@greatnessinabox/hubspot-form@latest/dist/vanilla/index.mjs';
  // ... setup code
</script>
```

### For Node.js Projects

```bash
pnpm add @greatnessinabox/hubspot-form
# or
npm install @greatnessinabox/hubspot-form
# or
yarn add @greatnessinabox/hubspot-form
```

## Quick Start

### React

```tsx
import { HubSpotForm } from '@greatnessinabox/hubspot-form/react'

function MyForm() {
  return (
    <HubSpotForm
      portalId="YOUR_PORTAL_ID"
      formGuid="YOUR_FORM_GUID"
      submissionMethod="direct"
      validation={{
        requiredFields: ['firstName', 'lastName', 'email']
      }}
      legalConsent={{
        subscriptions: [
          {
            id: '123',
            fieldName: 'agreeArtistUpdates',
            text: 'I agree to receive updates about ARTIST_NAME.',
            required: true
          },
          {
            id: '456',
            fieldName: 'agreeAnotherlandUpdates',
            text: 'I agree to receive updates about Anotherland.',
            required: false
          }
        ]
      }}
      onSuccess={(data) => {
        console.log('Form submitted successfully!', data)
        // Redirect or show success message
      }}
      onError={(error) => {
        console.error('Form submission failed:', error)
      }}
      renderForm={({ formData, setFieldValue, isSubmitting, errors }) => (
        <>
          <input
            type="text"
            placeholder="First Name"
            value={formData.firstName || ''}
            onChange={(e) => setFieldValue('firstName', e.target.value)}
          />
          {errors.firstName && <div className="error">{errors.firstName}</div>}

          <input
            type="email"
            placeholder="Email"
            value={formData.email || ''}
            onChange={(e) => setFieldValue('email', e.target.value)}
          />
          {errors.email && <div className="error">{errors.email}</div>}

          <label>
            <input
              type="checkbox"
              checked={formData.agreeArtistUpdates || false}
              onChange={(e) => setFieldValue('agreeArtistUpdates', e.target.checked)}
            />
            I agree to receive updates about ARTIST_NAME.*
          </label>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>

          {errors._general && <div className="error">{errors._general}</div>}
        </>
      )}
    />
  )
}
```

### Vanilla JavaScript

```html
<form id="my-form" data-hubspot-form>
  <input type="text" name="firstName" placeholder="First Name" required>
  <input type="text" name="lastName" placeholder="Last Name" required>
  <input type="email" name="email" placeholder="Email" required>

  <label>
    <input type="checkbox" name="agreeArtistUpdates" value="true">
    I agree to receive updates about ARTIST_NAME.*
  </label>

  <label>
    <input type="checkbox" name="agreeAnotherlandUpdates" value="true">
    I agree to receive updates about Anotherland.
  </label>

  <button type="submit">Submit</button>
</form>

<script type="module">
  import { initHubSpotForm } from '@greatnessinabox/hubspot-form/vanilla'

  initHubSpotForm({
    portalId: 'YOUR_PORTAL_ID',
    formGuid: 'YOUR_FORM_GUID',
    formId: 'my-form',
    submissionMethod: 'direct',
    validation: {
      requiredFields: ['firstName', 'lastName', 'email']
    },
    legalConsent: {
      subscriptions: [
        {
          id: '123',
          fieldName: 'agreeArtistUpdates',
          text: 'I agree to receive updates about ARTIST_NAME.',
          required: true
        }
      ]
    },
    onSuccess: (data) => {
      alert('Form submitted successfully!')
      // Redirect or show success message
    },
    onError: (error) => {
      alert('Form submission failed: ' + error.message)
    }
  })
</script>
```

### Core Library (Framework Agnostic)

```typescript
import { submitToHubSpot, validateFormData } from '@greatnessinabox/hubspot-form'

const config = {
  portalId: 'YOUR_PORTAL_ID',
  formGuid: 'YOUR_FORM_GUID',
  submissionMethod: 'direct' as const,
  validation: {
    requiredFields: ['firstName', 'lastName', 'email']
  },
  legalConsent: {
    subscriptions: [
      {
        id: '123',
        fieldName: 'agreeArtistUpdates',
        text: 'I agree to receive updates about ARTIST_NAME.',
        required: true
      },
      {
        id: '456',
        fieldName: 'agreeAnotherlandUpdates',
        text: 'I agree to receive updates about Anotherland.',
        required: false
      }
    ]
  },
  onSuccess: (data) => console.log('Success!', data),
  onError: (error) => console.error('Error:', error)
}

// Validate
const formData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  agreeArtistUpdates: true
}

const validationError = validateFormData(formData, config)
if (validationError) {
  console.error('Validation failed:', validationError)
  return
}

// Submit
const result = await submitToHubSpot(formData, config)
if (result.success) {
  console.log('Form submitted!', result.data)
} else {
  console.error('Submission failed:', result.error)
}
```

## Configuration Options

### HubSpotFormConfig

```typescript
interface HubSpotFormConfig {
  // Required
  portalId: string
  formGuid: string

  // Submission Method
  submissionMethod?: 'direct' | 'proxy' // Default: 'direct'
  proxyEndpoint?: string // Required if submissionMethod is 'proxy'

  // Field Configuration
  fieldMapper?: (formData: Record<string, any>) => HubSpotFormField[]
  customFields?: HubSpotFormField[]

  // Context Configuration
  context?: {
    pageUri?: string | (() => string)
    pageName?: string
    includeHutk?: boolean // Default: true
  }

  // Legal Consent
  legalConsent?: {
    consentText?: string
    privacyPolicyText?: string
    subscriptions: SubscriptionConfig[]
  }

  // Validation
  validation?: {
    requiredFields?: string[]
    customValidator?: (formData: Record<string, any>) => string | null
  }

  // Callbacks
  onSuccess?: (response: any) => void
  onError?: (error: Error | any) => void
  onBeforeSubmit?: (formData: Record<string, any>) => Record<string, any> | Promise<Record<string, any>>
}
```

## Advanced Usage

### Custom Field Mapping

```typescript
const config = {
  portalId: 'YOUR_PORTAL_ID',
  formGuid: 'YOUR_FORM_GUID',
  fieldMapper: (formData) => [
    { name: 'firstname', value: formData.firstName },
    { name: 'lastname', value: formData.lastName },
    { name: 'email', value: formData.email },
    { name: 'custom_field', value: formData.customValue },
  ]
}
```

### Using Proxy Endpoint

```typescript
const config = {
  portalId: 'YOUR_PORTAL_ID',
  formGuid: 'YOUR_FORM_GUID',
  submissionMethod: 'proxy',
  proxyEndpoint: '/api/submit-form', // Your backend endpoint
}
```

### Custom Validation

```typescript
const config = {
  portalId: 'YOUR_PORTAL_ID',
  formGuid: 'YOUR_FORM_GUID',
  validation: {
    requiredFields: ['firstName', 'email'],
    customValidator: (formData) => {
      if (formData.email && !formData.email.includes('@')) {
        return 'Please enter a valid email address'
      }
      return null
    }
  }
}
```

### Transform Data Before Submission

```typescript
const config = {
  portalId: 'YOUR_PORTAL_ID',
  formGuid: 'YOUR_FORM_GUID',
  onBeforeSubmit: async (formData) => {
    // Transform or enrich data before submission
    return {
      ...formData,
      timestamp: new Date().toISOString(),
      source: 'website'
    }
  }
}
```

## React Hook Usage

```tsx
import { useHubSpotForm } from '@greatnessinabox/hubspot-form/react'

function MyForm() {
  const {
    formData,
    setFormData,
    isSubmitting,
    errors,
    handleSubmit,
    setFieldValue
  } = useHubSpotForm({
    portalId: 'YOUR_PORTAL_ID',
    formGuid: 'YOUR_FORM_GUID',
    validation: {
      requiredFields: ['firstName', 'email']
    },
    onSuccess: (data) => {
      console.log('Success!', data)
    }
  })

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
    </form>
  )
}
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11+ (with polyfills for Promise and fetch)

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Support

- 📖 [Documentation](./README.md)
- 🐛 [Report Issues](https://github.com/greatnessinabox/hubspot-form/issues)
- 💬 [Discussions](https://github.com/greatnessinabox/hubspot-form/discussions)
