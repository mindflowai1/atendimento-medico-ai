# Script de Deploy no Cloud Run com Variáveis de Ambiente
# Projeto: warley-mtp

Write-Host "🚀 Iniciando deploy no Cloud Run..." -ForegroundColor Cyan
Write-Host ""

# Navegar para o diretório do projeto
cd "c:\Gaveta 2\Projetos\atendimento-medico-ai-main\atendimento-medico-ai-main"

Write-Host "📦 Passo 1: Build da imagem Docker com variáveis de ambiente..." -ForegroundColor Yellow
Write-Host "⏳ Isso pode levar 2-3 minutos..." -ForegroundColor Gray
Write-Host ""

gcloud builds submit `
  --tag gcr.io/warley-mtp/atendimento-medico-ai `
  --build-arg VITE_SUPABASE_URL="https://yibxoxqhwhfqsktuwaeq.supabase.co" `
  --build-arg VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpYnhveHFod2hmcXNrdHV3YWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDE0NjgsImV4cCI6MjA4MDc3NzQ2OH0.Dm5KhvYpXnOopeHVpQ_bTPGQ3I57xaUpFcyn2gItrFw" `
  --build-arg VITE_EVOLUTION_API_URL="https://n8n-evolution.kof6cn.easypanel.host" `
  --build-arg VITE_EVOLUTION_API_KEY="qwSYwLlijZOh+FaBHrK0tfGzxG6W/J4O"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Build concluído com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Passo 2: Deploy no Cloud Run..." -ForegroundColor Yellow
    Write-Host "⏳ Isso pode levar 30-60 segundos..." -ForegroundColor Gray
    Write-Host ""
    
    gcloud run deploy atendimento-medico-ai `
      --image gcr.io/warley-mtp/atendimento-medico-ai `
      --platform managed `
      --region us-central1 `
      --allow-unauthenticated `
      --port 8080 `
      --memory 512Mi `
      --cpu 1 `
      --min-instances 0 `
      --max-instances 10
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅✅✅ DEPLOY CONCLUÍDO COM SUCESSO! ✅✅✅" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
        Write-Host "1. Copie a URL do serviço (mostrada acima)" -ForegroundColor White
        Write-Host "2. Acesse a URL no navegador para testar" -ForegroundColor White
        Write-Host "3. Atualize o Supabase com a nova URL" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Erro no deploy do Cloud Run" -ForegroundColor Red
        Write-Host "Verifique os logs acima para mais detalhes" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "❌ Erro no build da imagem" -ForegroundColor Red
    Write-Host "Verifique os logs acima para mais detalhes" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
