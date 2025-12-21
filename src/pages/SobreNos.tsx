const SobreNos = () => {
  return (
    <div className="mt-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Sobre nós</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Nossa História</h3>
            <p className="text-gray-600 mb-4">
              O CCA é um sistema desenvolvido para facilitar o gerenciamento e acompanhamento 
              de informações relacionadas ao seu imóvel. Nosso objetivo é proporcionar uma 
              experiência completa e transparente para os proprietários.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Nossa Missão</h3>
            <p className="text-gray-600 mb-4">
              Oferecer uma plataforma intuitiva e eficiente que centralize todas as informações 
              importantes sobre o seu imóvel, desde garantias até manutenções, proporcionando 
              tranquilidade e organização.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Nossos Valores</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Transparência nas informações</li>
              <li>Facilidade de uso</li>
              <li>Atendimento de qualidade</li>
              <li>Inovação constante</li>
            </ul>
          </div>
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-gray-900 font-medium">contato@cca.com</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Telefone</p>
                <p className="text-gray-900 font-medium">(11) 1234-5678</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SobreNos








