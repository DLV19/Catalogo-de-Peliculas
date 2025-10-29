// Archivo de configuración de entornos en Angular.
// Aquí se definen variables globales que cambian según el ambiente
// (desarrollo, pruebas o producción).
// En este caso se usa para indicar si está en producción
// y para guardar la URL base de la API de Laravel.

export const environment = {
  production: false,
  apiBase: 'http://127.0.0.1:8000/api'  // 👈 esta debe apuntar a tu Laravel
};

