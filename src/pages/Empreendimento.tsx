import { useState } from 'react'

interface Projetista {
  tipo: string
  fornecedor: string
  profissional: string
  registro: string
  telefone: string
  email: string
}

const Empreendimento = () => {
  const [dadosTecnicosExpandidos, setDadosTecnicosExpandidos] = useState(false)
  const [projetistasExpandidos, setProjetistasExpandidos] = useState(false)

  // Dados fixos do Residencial Jade
  const descricaoCompleta = "O Residencial Jade é um empreendimento realizado pela Demo para que você tenha o máximo de praticidade e conforto. Seus apartamentos foram planejados de modo a oferecer excelente qualidade de vida aos seus moradores."
  
  const dadosTecnicos = {
    proponente: "Predialize S.A.",
    construtora: "Predialize S.A.",
    empreendimento: "Residencial Jade",
    endereco: "Rua Arcanjo Cândido da Silva, 123 - Praia de Fora, Palhoça - SC.",
    areaTerreno: "2.500 m²",
    areaConstrucao: "4.000 m²",
    incorporacao: "Cartório do Registro de Imóveis Comarca de CIDADE com n° R. 02/01.999 em 20/10/2020.",
    alvara: "Alvará de Licença n° 123 em 01/12/2020.",
    composicao: "Empreendimento composto por 01 bloco, totalizando 120 unidades privativas."
  }

  const projetistas: Projetista[] = [
    {
      tipo: "Arquitetônico",
      fornecedor: "João",
      profissional: "Arq. Fulano De Tal",
      registro: "CAU - XXXXX",
      telefone: "(XX) XXXX-XXXX",
      email: "fulano@smarq.com.br"
    },
    {
      tipo: "Climatização/Exaustão",
      fornecedor: "XXX Engenharia",
      profissional: "Eng. Fulano De Tal",
      registro: "CREA SC - 6295-4",
      telefone: "(XX) XXXX-XXXX",
      email: "fulano@cherem.com.br"
    },
    {
      tipo: "Contenção",
      fornecedor: "XXX Engenharia",
      profissional: "Eng. Fulano De Tal",
      registro: "CREA SC - 6295-4",
      telefone: "(XX) XXXX-XXXX",
      email: "fulano@cherem.com.br"
    },
    {
      tipo: "Estrutural",
      fornecedor: "XXX Engenharia Estrutural",
      profissional: "Eng. Fulano De Tal",
      registro: "CREA SC - 6856-1",
      telefone: "(XX) XXXX-XXXX",
      email: "fulano@estrutural.com.br"
    },
    {
      tipo: "Elétrico/ Telefônico",
      fornecedor: "Elétrico Engenharia",
      profissional: "Eng. Fulano De Tal",
      registro: "CREA SC - 7525-0",
      telefone: "(XX) XXXX-XXXX",
      email: "fulano@eletrico.com.br"
    },
    {
      tipo: "Fundações",
      fornecedor: "XYZ Fundações",
      profissional: "Eng. Fulano De Tal",
      registro: "CREA SC - 4523-8",
      telefone: "(XX) XXXX-XXXX",
      email: "fulano@fundacoes.com.br"
    },
    {
      tipo: "Hidrossanitário",
      fornecedor: "FZ Hidro",
      profissional: "Eng. Fulano De Tal",
      registro: "CREA SC - 7168-8",
      telefone: "(XX) XXXX-XXXX",
      email: "fulano@hidro.com.br"
    },
    {
      tipo: "Impermeabilização",
      fornecedor: "Impermeabilizações FGH",
      profissional: "Eng. Fulano De Tal",
      registro: "CREA SC - 5689-2",
      telefone: "(XX) XXXX-XXXX",
      email: "fulano@fgh.com.br"
    },
    {
      tipo: "Interiores",
      fornecedor: "XXX Arquitetura",
      profissional: "Arq. Fulano De Tal",
      registro: "CAU - XXXXX",
      telefone: "(XX) XXXX-XXXX",
      email: "fulano@arq.com.br"
    },
    {
      tipo: "Paisagismo",
      fornecedor: "XXX Paisagismo",
      profissional: "Arq. Fulano De Tal",
      registro: "CAU - XXXXX",
      telefone: "(XX) XXXX-XXXX",
      email: "fulano@paisagismo.com.br"
    },
    {
      tipo: "Piscina",
      fornecedor: "XXX Piscinas",
      profissional: "Arq. Fulano De Tal",
      registro: "",
      telefone: "(XX) XXXX-XXXX",
      email: "fulano@piscinas.com.br"
    }
  ]


  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Empreendimento</h1>
        <p className="text-gray-400 mb-6">Informações do empreendimento</p>
      </div>

      {/* Nome do Empreendimento */}
      <div className="bg-gray-700 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Residencial Jade</h2>
        
        {/* Descrição */}
        <div className="mb-6">
          <p className="text-gray-300 leading-relaxed">
            {descricaoCompleta}
          </p>
        </div>
      </div>

      {/* Dados Técnicos */}
      <div className="bg-gray-700 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Dados Técnicos</h3>
          <button
            onClick={() => setDadosTecnicosExpandidos(!dadosTecnicosExpandidos)}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            {dadosTecnicosExpandidos ? 'Ver menos' : 'Ver mais'}
          </button>
        </div>
        
        {dadosTecnicosExpandidos && (
          <div className="mt-4 space-y-4 bg-gray-800 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase">Proponente</label>
                <p className="text-white font-semibold mt-1">{dadosTecnicos.proponente}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase">Construtora</label>
                <p className="text-white font-semibold mt-1">{dadosTecnicos.construtora}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase">Empreendimento</label>
                <p className="text-white font-semibold mt-1">{dadosTecnicos.empreendimento}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase">Endereço</label>
                <p className="text-white font-semibold mt-1">{dadosTecnicos.endereco}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase">Área do terreno</label>
                <p className="text-white font-semibold mt-1">{dadosTecnicos.areaTerreno}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase">Área da construção</label>
                <p className="text-white font-semibold mt-1">{dadosTecnicos.areaConstrucao}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-400 uppercase">Incorporação</label>
                <p className="text-white font-semibold mt-1">{dadosTecnicos.incorporacao}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-400 uppercase">Alvará de Licença</label>
                <p className="text-white font-semibold mt-1">{dadosTecnicos.alvara}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-400 uppercase">Composição</label>
                <p className="text-white font-semibold mt-1">{dadosTecnicos.composicao}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Projetistas */}
      <div className="bg-gray-700 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Projetistas</h3>
          <button
            onClick={() => setProjetistasExpandidos(!projetistasExpandidos)}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            {projetistasExpandidos ? 'Ver menos' : 'Ver mais'}
          </button>
        </div>
        
        {projetistasExpandidos && (
          <div className="mt-4 space-y-4">
            {projetistas.map((projetista, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3">{projetista.tipo}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-400 uppercase">Fornecedor</label>
                    <p className="text-white font-semibold mt-1">{projetista.fornecedor}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-400 uppercase">Profissional</label>
                    <p className="text-white font-semibold mt-1">{projetista.profissional}</p>
                  </div>
                  {projetista.registro && (
                    <div>
                      <label className="text-xs font-medium text-gray-400 uppercase">Registro</label>
                      <p className="text-white font-semibold mt-1">{projetista.registro}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium text-gray-400 uppercase">Telefone</label>
                    <p className="text-white font-semibold mt-1">{projetista.telefone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-gray-400 uppercase">E-mail</label>
                    <p className="text-white font-semibold mt-1">{projetista.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* O Condomínio e o Meio Ambiente */}
      <div className="bg-gray-700 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <span className="mr-2">🌳</span>
          O Condomínio e o Meio Ambiente
        </h3>
        
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            É responsabilidade dos proprietários e do condomínio manter as condições especificadas em TAC (Termo de Ajustamento de Conduta) e no licenciamento pelo órgão ambiental, quando houver. Caso o edifício tenha obtido certificação ambiental, o condomínio deve seguir as orientações da construtora/incorporadora para que o desempenho ambiental esperado durante o uso do imóvel possa ser alcançado.
          </p>
          
          <p>
            É importante que os responsáveis estejam atentos aos aspectos ambientais e promovam a conscientização dos moradores e funcionários para colaborarem em ações que tragam benefícios, como:
          </p>

          {/* Uso Racional da Água */}
          <div className="bg-gray-800 rounded-lg p-4 mt-4">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
              <span className="mr-2">💦</span>
              Uso Racional da Água
            </h4>
            <ul className="space-y-2 text-gray-300 list-disc list-inside">
              <li>Verificar mensalmente as contas para analisar o consumo de água e checar o funcionamento dos medidores ou existência de vazamentos. Em caso de oscilações, chamar a concessionária para inspeção;</li>
              <li>Orientar os moradores e a equipe de manutenção local para aferir mensalmente a existência de perda de água (torneiras "pingando", bacias "escorrendo", etc.);</li>
              <li>Orientar os moradores e a equipe de manutenção local quanto ao uso adequado da água, evitando o desperdício. Exemplo: ao limpar as calçadas, não utilizar a água para "varrer".</li>
            </ul>
          </div>

          {/* Uso Racional da Energia */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
              <span className="mr-2">💡</span>
              Uso Racional da Energia
            </h4>
            <ul className="space-y-2 text-gray-300 list-disc list-inside">
              <li>É recomendado o uso adequado de energia, desligando, quando possível, pontos de iluminação e equipamentos. Lembre-se de não interferir nos equipamentos que permitem o funcionamento do edifício (ex.: bombas, alarmes, etc.);</li>
              <li>Para evitar fuga de corrente elétrica, realizar as manutenções preventivas, como: rever estado de isolamento das emendas de fios, reapertar as conexões do quadro de distribuição e as conexões de tomadas, interruptores e ponto de luz e, ainda, verificar o estado dos contatos elétricos, substituindo peças que apresentam desgaste;</li>
              <li>É recomendado o uso de equipamentos que possuam bons resultados de eficiência energética, como o selo PROCEL em níveis de eficiência A ou B, ou de desempenho semelhante.</li>
            </ul>
          </div>

          {/* Resíduos Sólidos */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
              <span className="mr-2">♻️</span>
              Resíduos Sólidos
            </h4>
            <ul className="space-y-2 text-gray-300 list-disc list-inside">
              <li>Implantar um programa de coleta seletiva no edifício e destinar os materiais coletados a instituições que possam reciclá-los ou reutilizá-los;</li>
              <li>No caso de reforma ou manutenções, que gerem resíduos de construção ou demolição, atender à legislação específica.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Empreendimento








