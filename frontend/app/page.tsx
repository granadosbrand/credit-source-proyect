export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-5xl font-bold text-gray-900">
            Credit Source
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sistema de solicitudes de crédito multi-país con procesamiento asíncrono,
            validaciones en tiempo real y decisiones automatizadas
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">🌍</div>
            <h3 className="text-lg font-semibold mb-2">Multi-País</h3>
            <p className="text-gray-600 text-sm">
              Soporte para México, Colombia y España con reglas de validación específicas
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Procesamiento Rápido</h3>
            <p className="text-gray-600 text-sm">
              Decisiones automáticas con cálculo de riesgo y validaciones en tiempo real
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold mb-2">Seguridad</h3>
            <p className="text-gray-600 text-sm">
              Datos encriptados y cumplimiento normativo en cada país
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">¿Cómo funciona?</h2>
          <ol className="space-y-4">
            <li className="flex items-start space-x-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full flex-shrink-0 font-semibold">
                1
              </div>
              <div>
                <h4 className="font-semibold">Completa tu solicitud</h4>
                <p className="text-gray-600">Ingresa tus datos personales y la información financiera requerida</p>
              </div>
            </li>
            <li className="flex items-start space-x-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full flex-shrink-0 font-semibold">
                2
              </div>
              <div>
                <h4 className="font-semibold">Validación automática</h4>
                <p className="text-gray-600">Nuestro sistema valida tus datos según las reglas del país</p>
              </div>
            </li>
            <li className="flex items-start space-x-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full flex-shrink-0 font-semibold">
                3
              </div>
              <div>
                <h4 className="font-semibold">Decisión de riesgo</h4>
                <p className="text-gray-600">Se calcula tu puntuación de riesgo y se toma una decisión</p>
              </div>
            </li>
            <li className="flex items-start space-x-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full flex-shrink-0 font-semibold">
                4
              </div>
              <div>
                <h4 className="font-semibold">Resultado final</h4>
                <p className="text-gray-600">Recibes la decisión: aprobado, rechazado o revisión requerida</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
