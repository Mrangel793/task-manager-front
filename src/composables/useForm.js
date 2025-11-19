import { ref, reactive } from 'vue'

export function useForm(initialValues = {}, validationSchema = null) {
  const formData = reactive({ ...initialValues })
  const errors = reactive({})
  const isSubmitting = ref(false)
  const submitError = ref(null)

  const resetForm = () => {
    Object.keys(initialValues).forEach(key => {
      formData[key] = initialValues[key]
    })
    clearErrors()
  }

  const clearErrors = () => {
    Object.keys(errors).forEach(key => {
      delete errors[key]
    })
    submitError.value = null
  }

  const setError = (field, message) => {
    errors[field] = message
  }

  const setErrors = (newErrors) => {
    Object.keys(newErrors).forEach(key => {
      errors[key] = newErrors[key]
    })
  }

  const validate = async () => {
    clearErrors()

    if (!validationSchema) return true

    try {
      await validationSchema.validate(formData, { abortEarly: false })
      return true
    } catch (validationErrors) {
      if (validationErrors.inner) {
        validationErrors.inner.forEach(error => {
          errors[error.path] = error.message
        })
      }
      return false
    }
  }

  const handleSubmit = async (onSubmit) => {
    const isValid = await validate()

    if (!isValid) return

    isSubmitting.value = true
    submitError.value = null

    try {
      await onSubmit(formData)
    } catch (error) {
      submitError.value = error.message || 'Error al enviar el formulario'
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    formData,
    errors,
    isSubmitting,
    submitError,
    resetForm,
    clearErrors,
    setError,
    setErrors,
    validate,
    handleSubmit
  }
}
