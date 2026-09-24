import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Script de prueba de rendimiento con k6
 * Ejecuta carga sobre el endpoint de evaluacion de credito en el API Gateway
 *
 * Para ejecutar:
 *   k6 run perf/k6/evaluacion-carga.js
 */
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp-up a 10 usuarios virtuales
    { duration: '1m', target: 20 },   // Carga sostenida a 20 usuarios virtuales
    { duration: '20s', target: 0 },   // Ramp-down a 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500'], // 95% de peticiones deben responder en < 1.5s
    http_req_failed: ['rate<0.05'],    // Menos del 5% de fallos permitidos
  },
};

const BASE_URL = __ENV.GATEWAY_URL || 'http://localhost:8080';

export default function () {
  const payload = JSON.stringify({
    identificacion: '1720000002',
    montoSolicitado: 1000,
    plazoMeses: 12,
    tiendaId: 'TIENDA-SUR-01'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer k6-test-token'
    },
  };

  const res = http.post(`${BASE_URL}/evaluaciones-credito`, payload, params);

  check(res, {
    'status es 200 o 201': (r) => r.status === 200 || r.status === 201,
    'respuesta contiene decision': (r) => r.body && r.body.includes('decision'),
  });

  sleep(1);
}
