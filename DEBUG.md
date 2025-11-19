# Debugging - Error 422 en Registro

## Error actual
POST http://127.0.0.1:8000/api/v1/auth/register/ 422 (Unprocessable Content)

## Datos que se están enviando
```javascript
{
  name: "Nombre del usuario",
  phone: "+573001234567",  // Formato E.164
  password: "Password123"
}
```

## Posibles causas del error 422

### 1. Nombres de campos incorrectos
El backend podría esperar:
- `full_name` en lugar de `name`
- `username` en lugar de `name`
- `phone_number` en lugar de `phone`
- `password_confirmation` o `password2` además de `password`

### 2. Formato de teléfono
El backend podría esperar:
- Solo números: "3001234567"
- Con código de país sin +: "573001234567"
- Formato diferente

### 3. Campos faltantes
Podrían faltar campos requeridos como:
- `email`
- `password_confirmation`
- `accept_terms`

## Cómo verificar

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Intenta registrarte
4. Busca el log que dice "Datos enviados al registro:" - muestra qué enviamos
5. Busca el log que dice "API Error:" - muestra qué responde el servidor

El error del servidor te dirá exactamente qué campo está mal y por qué.

## Ejemplo de error de FastAPI
```json
{
  "detail": [
    {
      "loc": ["body", "full_name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

Esto significaría que el backend espera `full_name` en lugar de `name`.
