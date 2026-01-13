import React, { useState, useEffect } from 'react'
import { Header, CrawlForm, StatusCard, ResultsTable, ErrorsTable } from './components'

const API_BASE_URL = 'http://localhost:4000'

interface CepResultData {
  cep?: string
  logradouro?: string
  complemento?: string
  bairro?: string
  localidade?: string
  uf?: string
  ibge?: string
  ddd?: string
  siafi?: string
}

interface Result {
  cep: string
  status: 'OK' | 'Erro'
  endereco: string
  processadoEm: string
}

interface ErrorResult {
  cep: string
  erro: string
  processadoEm: string
}

interface CrawlStatus {
  crawlId: string
  status: 'running' | 'finished' | 'failed' | 'pending'
  progress: number
  total: number
  processados: number
  sucessos: number
  erros: number
  criadoEm: string
  atualizadoEm: string
}

interface ApiCrawlStatus {
  crawl_id: string
  status: string
  total: number
  processed: number
  successes: number
  errors: number
  created_at: string
  updated_at: string
}

interface ApiCepResult {
  cep: string
  success: boolean
  data?: CepResultData
  error?: {
    message: string
    code: string
  }
  processed_at: string
}

interface CrawlResultsResponse {
  results: ApiCepResult[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

function App() {
  const [crawlStatus, setCrawlStatus] = useState<CrawlStatus | null>(null)
  const [successResults, setSuccessResults] = useState<Result[]>([])
  const [errorResults, setErrorResults] = useState<ErrorResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentCrawlId, setCurrentCrawlId] = useState<string | null>(null)

  const formatAddress = (data: CepResultData | undefined): string => {
    if (data && data.logradouro) {
      return `${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}`
    }
    return 'Endereço não disponível'
  }

  const formatErrorMessage = (error: any): string => {
    if (error?.code === 'INVALID_CEP') return 'CEP inválido'
    if (error?.code === 'NOT_FOUND') return 'CEP não encontrado'
    if (error?.code === 'TIMEOUT') return 'Timeout na requisição'
    if (error?.message === 'fetch failed') return 'Erro ao processar CEP'
    return error?.message || 'Erro desconhecido'
  }

  const fetchCrawlStatus = async (crawlId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/crawl/${crawlId}`)
      if (!response.ok) throw new Error('Falha ao buscar status')
      
      const data: ApiCrawlStatus = await response.json()
      
      const progress = data.total > 0 ? Math.round((data.processed / data.total) * 100) : 0
      
      setCrawlStatus({
        crawlId: data.crawl_id,
        status: data.status as 'running' | 'finished' | 'failed' | 'pending',
        progress,
        total: data.total,
        processados: data.processed,
        sucessos: data.successes,
        erros: data.errors,
        criadoEm: new Date(data.created_at).toLocaleString('pt-BR'),
        atualizadoEm: new Date(data.updated_at).toLocaleString('pt-BR'),
      })

      const resultsResponse = await fetch(`${API_BASE_URL}/crawl/${crawlId}/results?limit=100`)
      if (resultsResponse.ok) {
        const resultsData: any = await resultsResponse.json()
        
        const successes: Result[] = []
        const errors: ErrorResult[] = []
        
        const resultsList = Array.isArray(resultsData?.results) ? resultsData.results : []
        
        resultsList.forEach((r: ApiCepResult) => {
          try {
            if (r.success && r.data && r.data.logradouro) {
              successes.push({
                cep: r.cep,
                status: 'OK',
                endereco: formatAddress(r.data),
                processadoEm: new Date(r.processed_at).toLocaleString('pt-BR'),
              })
            } else {
              errors.push({
                cep: r.cep,
                erro: r.success ? 'Endereço inválido' : formatErrorMessage(r.error),
                processadoEm: new Date(r.processed_at).toLocaleString('pt-BR'),
              })
            }
          } catch (itemErr) {
            errors.push({
              cep: r.cep,
              erro: 'Erro ao processar resultado',
              processadoEm: new Date().toLocaleString('pt-BR'),
            })
          }
        })
        
        setSuccessResults(successes)
        setErrorResults(errors)
      }

      setError(null)
    } catch (err) {
      setError('Falha ao carregar dados do servidor')
      console.error(err)
    }
  }

  const handleStartCrawl = async (cepInicial: string, cepFinal: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/crawl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cep_start: cepInicial,
          cep_end: cepFinal,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Falha ao iniciar crawl')
      }
      
      const data = await response.json()
      setCurrentCrawlId(data.crawl_id)
      setSuccessResults([])
      setErrorResults([])
      
      await fetchCrawlStatus(data.crawl_id)
    } catch (err: any) {
      setError(err.message || 'Erro ao iniciar crawl')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!currentCrawlId) return

    const interval = setInterval(() => {
      fetchCrawlStatus(currentCrawlId)
    }, 2000)

    return () => clearInterval(interval)
  }, [currentCrawlId])

  return (
    <div className="min-h-screen bg-slate-900">
      <Header 
        title="CEP Crawler" 
        subtitle="Crawl assíncrono de CEPs via ViaCEP"
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 m-6 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <CrawlForm onSubmit={handleStartCrawl} isLoading={isLoading} />

        {crawlStatus && (
          <StatusCard
            crawlId={crawlStatus.crawlId}
            status={crawlStatus.status === 'finished' ? 'Finalizado' : 'Processando'}
            progress={crawlStatus.progress}
            total={crawlStatus.total}
            processados={crawlStatus.processados}
            sucessos={crawlStatus.sucessos}
            erros={crawlStatus.erros}
            criadoEm={crawlStatus.criadoEm}
            atualizadoEm={crawlStatus.atualizadoEm}
          />
        )}

        {successResults.length > 0 && (
          <ResultsTable results={successResults} />
        )}

        {errorResults.length > 0 && (
          <ErrorsTable errors={errorResults} />
        )}
      </div>
    </div>
  )
}

export default App
