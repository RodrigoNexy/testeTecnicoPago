export class ViaCepService {
  constructor() {
    this.baseUrl = 'https://viacep.com.br/ws';
  }

  async fetchCep(cep) {
    try {
      const response = await fetch(`${this.baseUrl}/${cep}/json/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.erro === true) {
        return {
          success: false,
          error: {
            message: 'CEP não encontrado',
            code: 'CEP_NOT_FOUND'
          }
        };
      }

      return {
        success: true,
        data: {
          cep: data.cep?.replace('-', ''),
          logradouro: data.logradouro || '',
          complemento: data.complemento || '',
          bairro: data.bairro || '',
          localidade: data.localidade || '',
          uf: data.uf || '',
          ibge: data.ibge || '',
          gia: data.gia || '',
          ddd: data.ddd || '',
          siafi: data.siafi || ''
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message,
          code: 'FETCH_ERROR'
        }
      };
    }
  }
}