import api from './api'
import { Usuario, LoginDTO, CriarUsuarioDTO, AtualizarUsuarioDTO } from '../types'

export const usuariosService = {
  async login(credenciais: LoginDTO): Promise<Usuario> {
    const response = await api.post('/api/usuarios/login', credenciais)
    return response.data
  },

  async listar(): Promise<Usuario[]> {
    const response = await api.get('/api/usuarios')
    return response.data
  },

  async buscarPorId(id: number): Promise<Usuario> {
    const response = await api.get(`/api/usuarios/${id}`)
    return response.data
  },

  async criar(dados: CriarUsuarioDTO): Promise<Usuario> {
    const response = await api.post('/api/usuarios', dados)
    return response.data
  },

  async atualizar(id: number, dados: AtualizarUsuarioDTO): Promise<Usuario> {
    const response = await api.put(`/api/usuarios/${id}`, dados)
    return response.data
  },

  async deletar(id: number): Promise<void> {
    await api.delete(`/api/usuarios/${id}`)
  }
}
