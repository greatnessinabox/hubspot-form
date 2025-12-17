/**
 * Example: React Implementation
 *
 * This example shows how to use the HubSpot form in a React application
 *
 * Note: the "corner popup" layout is a vanilla/Squarespace DOM feature (data-hsf-layout="corner").
 * In React, you typically implement the popup/container UI yourself and render the form inside it.
 */

import { HubSpotForm, useHubSpotForm } from '@greatnessinabox/hubspot-form/react'

// Example 1: Using the HubSpotForm component with renderForm prop
export function ExampleForm1() {
  return (
    <HubSpotForm
      portalId={process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID || ''}
      formGuid={process.env.NEXT_PUBLIC_HUBSPOT_FORM_GUID || ''}
      submissionMethod="proxy"
      proxyEndpoint="/api/submit-form"
      validation={{
        requiredFields: ['firstName', 'lastName', 'email'],
      }}
      legalConsent={{
        subscriptions: [
          {
            id: process.env.NEXT_PUBLIC_HUBSPOT_SUBSCRIPTION_ID || '',
            fieldName: 'agreeArtistUpdates',
            text: 'I agree to receive updates about ARTIST_NAME.',
            required: true,
          },
          {
            id: process.env.NEXT_PUBLIC_HUBSPOT_ANOTHERLAND_SUBSCRIPTION_ID || '',
            fieldName: 'agreeAnotherlandUpdates',
            text: 'I agree to receive updates about Anotherland.',
          },
        ],
      }}
      context={{
        pageName: 'Contact Form',
        pageUri: () => window.location.href,
      }}
      onSuccess={data => {
        console.log('Form submitted successfully!', data)
        // Redirect or show success message
      }}
      onError={error => {
        console.error('Form submission failed:', error)
        // Show error message to user
      }}
      renderForm={({ formData, setFieldValue, isSubmitting, errors }) => (
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName || ''}
              onChange={e => setFieldValue('firstName', e.target.value)}
              className="w-full p-2 border rounded"
            />
            {errors.firstName && <div className="text-red-500 text-sm">{errors.firstName}</div>}
          </div>

          <div>
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName || ''}
              onChange={e => setFieldValue('lastName', e.target.value)}
              className="w-full p-2 border rounded"
            />
            {errors.lastName && <div className="text-red-500 text-sm">{errors.lastName}</div>}
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              value={formData.email || ''}
              onChange={e => setFieldValue('email', e.target.value)}
              className="w-full p-2 border rounded"
            />
            {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
          </div>

          <div className="flex gap-2">
            <select
              value={formData.countryCode || '+1'}
              onChange={e => setFieldValue('countryCode', e.target.value)}
              className="p-2 border rounded"
            >
              <option value="+1">+1 US</option>
              <option value="+44">+44 UK</option>
            </select>
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phoneNumber || ''}
              onChange={e => setFieldValue('phoneNumber', e.target.value)}
              className="flex-1 p-2 border rounded"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.agreeUnitedUpdates || false}
                onChange={e => setFieldValue('agreeUnitedUpdates', e.target.checked)}
              />
              <span>I agree to receive updates about UNITED.*</span>
            </label>
            {errors.agreeUnitedUpdates && (
              <div className="text-red-500 text-sm">{errors.agreeUnitedUpdates}</div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.agreeAnotherlandUpdates || false}
                onChange={e => setFieldValue('agreeAnotherlandUpdates', e.target.checked)}
              />
              <span>I agree to receive updates about Anotherland.</span>
            </label>
          </div>

          {errors._general && (
            <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{errors._general}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      )}
    />
  )
}

// Example 2: Using the useHubSpotForm hook for more control
export function ExampleForm2() {
  const { formData, setFormData, isSubmitting, errors, handleSubmit, setFieldValue } =
    useHubSpotForm({
      portalId: process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID || '',
      formGuid: process.env.NEXT_PUBLIC_HUBSPOT_FORM_GUID || '',
      submissionMethod: 'proxy',
      proxyEndpoint: '/api/submit-form',
      validation: {
        requiredFields: ['firstName', 'lastName', 'email'],
      },
      legalConsent: {
        subscriptions: [
          {
            id: process.env.NEXT_PUBLIC_HUBSPOT_UNITED_SUBSCRIPTION_ID || '',
            fieldName: 'agreeUnitedUpdates',
            text: 'I agree to receive updates about UNITED.',
            required: true,
          },
        ],
      },
      onSuccess: data => {
        console.log('Success!', data)
        // Handle success (redirect, show message, etc.)
      },
      onError: error => {
        console.error('Error:', error)
        // Handle error (show message, etc.)
      },
    })

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="First Name"
        value={formData.firstName || ''}
        onChange={e => setFieldValue('firstName', e.target.value)}
      />
      {errors.firstName && <div className="error">{errors.firstName}</div>}

      <input
        type="email"
        placeholder="Email"
        value={formData.email || ''}
        onChange={e => setFieldValue('email', e.target.value)}
      />
      {errors.email && <div className="error">{errors.email}</div>}

      <label>
        <input
          type="checkbox"
          checked={formData.agreeArtistUpdates || false}
          onChange={e => setFieldValue('agreeArtistUpdates', e.target.checked)}
        />
        I agree to receive updates about ARTIST_NAME.*
      </label>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>

      {errors._general && <div className="error">{errors._general}</div>}
    </form>
  )
}
