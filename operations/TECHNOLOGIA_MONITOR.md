# Tech.NO-Log.IA — Central de Operações

Versão do módulo: 1.0 · 12/09/2026 · Company: COMPANY_TECHNOLOGIA
Classificação: SHARED_SYSTEM pertencente à Company existente; não cria nova Company.

## Mandato confirmado

Criar o sistema tecnológico da Tech.NO-Log.IA para prevenir problemas evitáveis e tornar visível onde as falhas ocorrem. Proton define critérios e escopo; Tech.NO-Log.IA implementa e acompanha a operação. A conexão do resumo ao Max é uma expansão ainda não implantada neste módulo.

## Implementação real desta versão

- Mesmo projeto Sites e repositório da Tech.No.LOG.IA — Runtime.
- Página principal: painel de aplicações, ocorrências, detalhes e histórico.
- Acesso privado existente mantido; dados operacionais não expostos a usuários anônimos.
- Planos tecnológicos anteriores preservados em `/blueprints`.
- Monitor em função própria do projeto proton-core já existente.
- Registro persistente de 37 aplicações recuperadas do cadastro Sites em 12/09/2026.
- Consultas HTTP externas a cada 5 minutos, inclusive com o painel fechado.
- Consulta manual de todo o cadastro ou de uma aplicação.
- Quatro consultas simultâneas, timeout de 6s, uma repetição de até 4s para falhas transitórias.
- Destinos limitados aos hosts Sites cadastrados; nenhuma credencial dos clientes enviada nas consultas.
- Corpo das respostas não armazenado; amostra limitada usada para reconhecer páginas de login.
- Histórico, evidências, incidentes e acompanhamento persistidos em tabelas isoladas por finalidade.
- Anotação idempotente com ator autenticado; recuperação após duas consultas HTTP positivas consecutivas.
- Evidência com mais de 12 minutos, timestamp inválido ou futuro excessivo retorna a não verificado.
- Falha de consulta ao monitor invalida os indicadores atuais da interface.

## Cobertura explícita

O teste desta versão cobre disponibilidade HTTP externa. HTTP 200 não comprova Company operacional. HTTP 401/403 ou login significa acesso protegido: funcionamento interno desconhecido. Nenhum endereço publicado no cadastro significa lacuna de publicação, não pane presumida.

Fluxos internos, dados, agentes, qualidade dos outputs, autenticação de clientes, fulfillment, logs completos de cada aplicação, reparo de infraestrutura, correção automática de código e integração ao Max NÃO estão instrumentados por esta versão. As telas identificam essa cobertura. Não marcar a Company inteira como operacional.

O cadastro de aplicações é uma captura verificada, não descoberta contínua. Novas aplicações e mudanças de endereço exigem atualização do cadastro com evidência Sites. Recolher inventário antes de interpretar ausência de URL como condição atual após mudanças.

## Inputs → processamento → outputs

| Input | Processamento | Output / ação |
|---|---|---|
| ID e endereço retornados por Sites | Validar host e guardar origem/data | Cadastro de aplicação |
| Horário agendado ou solicitação autenticada | Criar execução exclusiva, consultar endereço com limites | Observação persistida com código, status e duração |
| Erro observado | Criar/atualizar uma ocorrência ativa por aplicação | Company afetada, sinal e próxima investigação |
| Acompanhamento do operador | Validar nota e ID da operação | Nota persistida, ocorrência em análise |
| Duas respostas positivas em sequência | Conferir ordem temporal e histórico | Recuperação externa registrada |
| Dado vencido ou falha do monitor | Invalidar a leitura atual | Estado não verificado, aviso visível |

## Incidentes e autoridade

O responsável inicial é a fila Tech.NO-Log.IA. O painel registra acompanhamento, sem simular que uma pessoa já assumiu a tarefa. Não há envio de email ou WhatsApp. Nenhuma nota encerra uma ocorrência. As hipóteses de investigação são apresentadas como próximas ações; não são diagnósticos de causa raiz confirmados.

O endpoint do monitor exige um bearer secreto próprio; apenas seu SHA-256 fica no código. O segredo fica em Sites e Vault. As tabelas não concedem acesso a anon/authenticated; somente o serviço interno acessa os registros. As funções de persistência são SECURITY INVOKER. O agendador acessa a credencial por referência ao Vault.

## Evidências de validação

- Consulta autenticada real do endpoint: 200, 37 aplicações.
- Consulta sem credencial: 401.
- Primeira coleta real: 37/37 registros processados; 2 HTTP_OK, 27 ACCESS_PROTECTED, 8 NO_PUBLISHED_URL.
- SQL transacional com rollback: deduplicação, nota idempotente, não encerramento por estado desconhecido, recuperação com duas respostas e rejeição de resultado antigo.
- `tests/monitor.test.mjs`: classificação, vencimento, destinos permitidos, repetição limitada e sigilo dos erros.
- Testes anteriores de planejamento preservados.
- Verificação TypeScript do aplicativo Sites e build concluídos.
- Não foi executada inspeção visual no navegador nesta etapa.
- Registros e estado da publicação: control plane do mesmo projeto Sites.

## Runbook

1. Verificar se a coleta automática tem evidência nos últimos 12 minutos.
2. Abrir aplicação afetada e ler código, horário e próxima ação.
3. Para acesso protegido: conectar teste autenticado próprio; não reclassificar como indisponibilidade.
4. Para HTTP 404: verificar endereço e publicação no cadastro Sites.
5. Para HTTP 5xx/conexão: inspecionar os logs da aplicação e dependências no horário informado.
6. Registrar investigação e ação executada na ocorrência.
7. Reexecutar consulta após corrigir a causa; aguardar duas respostas positivas para recuperação externa.
8. Se a central falhar, conferir `technologia-monitor` e as últimas execuções em proton-core. O aplicativo preserva a distinção entre informação antiga e atual.

## Operação e manutenção

Agendamento: `technologia-monitor-every-five-minutes`, `*/5 * * * *`, horário UTC; 288 ciclos/dia. Até 37 consultas/ciclo inicialmente (aplicações sem URL não geram consulta), mais uma repetição por falha transitória. Não há consumo de modelos de IA nesta coleta. Rever custo e retenção quando o volume exigir; nenhum histórico é apagado automaticamente nesta versão.

Pausar somente este monitor: `select cron.unschedule('technologia-monitor-every-five-minutes');`. Para recuperar, reaplicar a declaração em `monitor-schedule.sql`. Não alterar jobs de outras Companies.

Fontes técnicas consultadas em 12/09/2026: https://supabase.com/docs/guides/cron ; https://supabase.com/docs/guides/database/extensions/pg_net ; https://supabase.com/docs/guides/functions/secrets .
