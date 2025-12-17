# Usage Guide

This guide provides practical examples for using `@greatnessinabox/hubspot-form` in different scenarios.

## Table of Contents

- [React Applications](#react-applications)
- [Vanilla JavaScript](#vanilla-javascript)
- [Vue.js](#vuejs)
- [Next.js](#nextjs)
- [Custom Field Mapping](#custom-field-mapping)
- [Error Handling](#error-handling)
- [Styling](#styling)

## React Applications

### Basic Usage

```tsx
import { HubSpotForm } from '@greatnessinabox/hubspot-form/react'

function ContactForm() {
  return (
    <HubSpotForm
      portalId="YOUR_PORTAL_ID"
      formGuid="YOUR_FORM_GUID"
      submissionMethod="direct"
      validation={{
        requiredFields: ['firstName', 'email']
      }}
      onSuccess={() => alert('Success!')}
      renderForm={({ formData, setFieldValue, isSubmitting }) => (
        <>
          <input
            value={formData.firstName || ''}
            onChange={(e) => setFieldValue('firstName', e.target.value)}
            placeholder="First Name"
          />
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFieldValue('email', e.target.value)}
            placeholder="Email"
          />
          <button type="submit" disabled={isSubmitting}>
            Submit
          </button>
        </>
      )}
    />
  )
}
```

### Using the Hook

```tsx
import { useHubSpotForm } from '@greatnessinabox/hubspot-form/react'

function ContactForm() {
  const { formData, setFieldValue, handleSubmit, isSubmitting } = useHubSpotForm({
    portalId: 'YOUR_PORTAL_ID',
    formGuid: 'YOUR_FORM_GUID',
    onSuccess: () => console.log('Success!')
  })

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.firstName || ''}
        onChange={(e) => setFieldValue('firstName', e.target.value)}
      />
      <button type="submit" disabled={isSubmitting}>Submit</button>
    </form>
  )
}
```

## Vanilla JavaScript

### Basic HTML Form

```html
<form id="contact-form" data-hubspot-form>
  <input type="text" name="firstName" placeholder="First Name" required>
  <input type="email" name="email" placeholder="Email" required>
  <button type="submit">Submit</button>
</form>

<script type="module">
  import { initHubSpotForm } from '@greatnessinabox/hubspot-form/vanilla'

  initHubSpotForm({
    portalId: 'YOUR_PORTAL_ID',
    formGuid: 'YOUR_FORM_GUID',
    formId: 'contact-form',
    validation: {
      requiredFields: ['firstName', 'email']
    },
    onSuccess: () => alert('Success!')
  })
</script>
```

### Corner Popup Layout (UNITED-style)

To render a form as a bottom-right popup with a launcher button, set:

```html
<form id="contact-form" data-hubspot-form data-hsf-layout="corner">
  <!-- form fields -->
</form>
```

### Auto-initialize Multiple Forms

```html
<form data-hubspot-form>
  <!-- Form 1 -->
</form>

<form data-hubspot-form>
  <!-- Form 2 -->
</form>

<script type="module">
  import { autoInitHubSpotForms } from '@greatnessinabox/hubspot-form/vanilla'

  autoInitHubSpotForms({
    portalId: 'YOUR_PORTAL_ID',
    formGuid: 'YOUR_FORM_GUID',
    validation: {
      requiredFields: ['firstName', 'email']
    }
  })
</script>
```

## Vue.js

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="formData.firstName" placeholder="First Name" />
    <input v-model="formData.email" type="email" placeholder="Email" />
    <button type="submit" :disabled="isSubmitting">Submit</button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { submitToHubSpot, validateFormData } from '@greatnessinabox/hubspot-form'

const formData = ref({
  firstName: '',
  email: ''
})

const isSubmitting = ref(false)

const config = {
  portalId: 'YOUR_PORTAL_ID',
  formGuid: 'YOUR_FORM_GUID',
  validation: {
    requiredFields: ['firstName', 'email']
  },
  onSuccess: () => alert('Success!')
}

async function handleSubmit() {
  const error = validateFormData(formData.value, config)
  if (error) {
    alert(error)
    return
  }

  isSubmitting.value = true
  const result = await submitToHubSpot(formData.value, config)
  isSubmitting.value = false

  if (!result.success) {
    alert('Submission failed')
  }
}
</script>
```

## Next.js

### Using Proxy Endpoint (Recommended)

```tsx
// components/ContactForm.tsx
import { HubSpotForm } from '@greatnessinabox/hubspot-form/react'

export function ContactForm() {
  return (
    <HubSpotForm
      portalId={process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID || ''}
      formGuid={process.env.NEXT_PUBLIC_HUBSPOT_FORM_GUID || ''}
      submissionMethod="proxy"
      proxyEndpoint="/api/submit-form"
      // ... rest of config
    />
  )
}
```

```typescript
// app/api/submit-form/route.ts
import { NextResponse } from 'next/server'
import { submitToHubSpot } from '@united/hubspot-form'

export async function POST(request: Request) {
  const formData = await request.json()

  const result = await submitToHubSpot(formData, {
    portalId: process.env.HUBSPOT_PORTAL_ID || '',
    formGuid: process.env.HUBSPOT_FORM_GUID || '',
    submissionMethod: 'direct',
    // ... rest of config
  })

  if (!result.success) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

## Custom Field Mapping

```typescript
import { submitToHubSpot } from '@united/hubspot-form'

const config = {
  portalId: 'YOUR_PORTAL_ID',
  formGuid: 'YOUR_FORM_GUID',
  fieldMapper: (formData) => [
    { name: 'firstname', value: formData.firstName },
    { name: 'lastname', value: formData.lastName },
    { name: 'email', value: formData.email },
    { name: 'custom_field_1', value: formData.customValue },
    { name: 'lifecyclestage', value: 'lead' }
  ]
}

await submitToHubSpot(formData, config)
```

## Error Handling

### React

```tsx
<HubSpotForm
  {...config}
  onError={(error) => {
    if (error instanceof Error) {
      console.error('Error:', error.message)
      // Show user-friendly error message
      setErrorMessage('Something went wrong. Please try again.')
    }
  }}
  renderForm={({ errors }) => (
    <>
      {/* Form fields */}
      {errors._general && (
        <div className="error-message">{errors._general}</div>
      )}
    </>
  )}
/>
```

### Vanilla JS

```javascript
initHubSpotForm({
  ...config,
  onError: (error) => {
    console.error('Form error:', error)
    // Errors are automatically displayed in the form
    // You can also add custom error handling here
  }
})
```

## Styling

The library is styling-agnostic. You can use any CSS framework or custom styles.

### Tailwind CSS

```tsx
<HubSpotForm
  {...config}
  className="max-w-md mx-auto space-y-4"
  renderForm={({ formData, setFieldValue }) => (
    <>
      <input
        className="w-full px-4 py-2 border rounded"
        value={formData.firstName || ''}
        onChange={(e) => setFieldValue('firstName', e.target.value)}
      />
    </>
  )}
/>
```

### CSS Modules

```tsx
import styles from './Form.module.css'

<HubSpotForm
  {...config}
  className={styles.form}
  renderForm={({ formData, setFieldValue }) => (
    <input className={styles.input} {...props} />
  )}
/>
```

### Styled Components

```tsx
import styled from 'styled-components'

const StyledInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
`

<HubSpotForm
  {...config}
  renderForm={({ formData, setFieldValue }) => (
    <StyledInput
      value={formData.firstName || ''}
      onChange={(e) => setFieldValue('firstName', e.target.value)}
    />
  )}
/>
```

## Advanced Patterns

### Multi-step Forms

```tsx
const [step, setStep] = useState(1)
const { formData, setFieldValue, handleSubmit } = useHubSpotForm(config)

return (
  <form onSubmit={handleSubmit}>
    {step === 1 && (
      <>
        <input value={formData.firstName} onChange={...} />
        <button type="button" onClick={() => setStep(2)}>Next</button>
      </>
    )}
    {step === 2 && (
      <>
        <input value={formData.email} onChange={...} />
        <button type="submit">Submit</button>
      </>
    )}
  </form>
)
```

### Conditional Fields

```tsx
<HubSpotForm
  {...config}
  renderForm={({ formData, setFieldValue }) => (
    <>
      <input value={formData.email} onChange={...} />

      {formData.subscribeToNewsletter && (
        <input value={formData.newsletterFrequency} onChange={...} />
      )}
    </>
  )}
/>
```

### Pre-fill Form Data

```tsx
<HubSpotForm
  {...config}
  initialData={{
    firstName: 'John',
    email: 'john@example.com'
  }}
  renderForm={({ formData, setFieldValue }) => (
    // Form fields with pre-filled values
  )}
/>
```



