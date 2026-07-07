'use client';

import Script from 'next/script';

export default function Home() {
  const htmlContent = `

  <!-- Login Overlay Container -->
  <div id="login-container" class="login-container">
    <div class="login-bg-glow-1"></div>
    <div class="login-bg-glow-2"></div>
    
    <div class="login-card">
      <div class="login-logo">
        <span class="login-icon">💰</span>
        <h2>Finanças ERP</h2>
      </div>
      
      <!-- View 1: Register Account -->
      <div id="register-view" class="login-view hidden">
        <p class="login-desc">Crie sua conta para acessar suas finanças de qualquer dispositivo.</p>
        <form id="register-password-form">
          <div class="form-group">
            <label for="new-email">E-mail</label>
            <input type="email" id="new-email" placeholder="seu-email@dominio.com" required>
          </div>
          <div class="form-group">
            <label for="new-password">Criar Senha</label>
            <div class="password-input-wrapper">
              <input type="password" id="new-password" placeholder="Mínimo 6 caracteres" required minlength="6">
              <button type="button" class="password-toggle-btn" onclick="togglePasswordVisibility('new-password', this)">
                <svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <svg class="eye-off-icon hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              </button>
            </div>
          </div>
          <div class="form-group">
            <label for="confirm-password">Confirmar Senha</label>
            <div class="password-input-wrapper">
              <input type="password" id="confirm-password" placeholder="Confirme sua senha" required minlength="6">
              <button type="button" class="password-toggle-btn" onclick="togglePasswordVisibility('confirm-password', this)">
                <svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <svg class="eye-off-icon hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              </button>
            </div>
          </div>
          <button type="submit" class="btn btn-primary" style="margin-top: 8px;">Criar Minha Conta</button>
          <p class="auth-switch-text" style="font-size: 0.8rem; text-align: center; margin-top: 12px; color: var(--text-secondary);">
            Já tem uma conta? <a href="#" onclick="showAuthView('login')" style="color: var(--primary); font-weight: 600; text-decoration: none;">Entre aqui</a>
          </p>
        </form>
      </div>

      <!-- View 2: Login Account -->
      <div id="login-view" class="login-view">
        <p class="login-desc">Digite seu e-mail e senha para entrar no ERP.</p>
        <form id="login-password-form">
          <div class="form-group">
            <label for="access-email">E-mail</label>
            <input type="email" id="access-email" placeholder="seu-email@dominio.com" required>
          </div>
          <div class="form-group">
            <label for="access-password">Senha</label>
            <div class="password-input-wrapper">
              <input type="password" id="access-password" placeholder="Sua senha" required>
              <button type="button" class="password-toggle-btn" onclick="togglePasswordVisibility('access-password', this)">
                <svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <svg class="eye-off-icon hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              </button>
            </div>
          </div>
          <div style="text-align: right; margin-top: -6px; margin-bottom: 12px;">
            <a href="#" onclick="showAuthView('recovery')" style="font-size: 0.8rem; color: var(--primary); text-decoration: none; font-weight: 500;">Esqueci minha senha</a>
          </div>
          <button type="submit" class="btn btn-primary" style="margin-top: 8px;">Entrar</button>
          <p class="auth-switch-text" style="font-size: 0.8rem; text-align: center; margin-top: 12px; color: var(--text-secondary);">
            Não tem uma conta? <a href="#" onclick="showAuthView('register')" style="color: var(--primary); font-weight: 600; text-decoration: none;">Cadastre-se</a>
          </p>
        </form>
      </div>

      <!-- View 3: Recover Password -->
      <div id="recovery-view" class="login-view hidden">
        <p class="login-desc">Digite seu e-mail para receber um link de recuperação de senha.</p>
        <form id="recovery-form">
          <div class="form-group">
            <label for="recovery-email">E-mail</label>
            <input type="email" id="recovery-email" placeholder="seu-email@dominio.com" required>
          </div>
          <button type="submit" class="btn btn-primary" style="margin-top: 8px;">Enviar E-mail de Recuperação</button>
          <p class="auth-switch-text" style="font-size: 0.8rem; text-align: center; margin-top: 12px; color: var(--text-secondary);">
            Voltar para o <a href="#" onclick="showAuthView('login')" style="color: var(--primary); font-weight: 600; text-decoration: none;">Login</a>
          </p>
        </form>
      </div>

      <!-- View 4: Reset Password -->
      <div id="reset-password-view" class="login-view hidden">
        <p class="login-desc">Digite sua nova senha de acesso.</p>
        <form id="reset-password-form">
          <div class="form-group">
            <label for="reset-new-password">Nova Senha</label>
            <div class="password-input-wrapper">
              <input type="password" id="reset-new-password" placeholder="Mínimo 6 caracteres" required minlength="6">
              <button type="button" class="password-toggle-btn" onclick="togglePasswordVisibility('reset-new-password', this)">
                <svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <svg class="eye-off-icon hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              </button>
            </div>
          </div>
          <div class="form-group">
            <label for="reset-confirm-password">Confirmar Nova Senha</label>
            <div class="password-input-wrapper">
              <input type="password" id="reset-confirm-password" placeholder="Confirme sua nova senha" required minlength="6">
              <button type="button" class="password-toggle-btn" onclick="togglePasswordVisibility('reset-confirm-password', this)">
                <svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <svg class="eye-off-icon hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              </button>
            </div>
          </div>
          <button type="submit" class="btn btn-primary" style="margin-top: 8px;">Atualizar Senha</button>
        </form>
      </div>
    </div>
  </div>

  <!-- App Container -->
  <div class="app-container">
    
    <!-- Top Header -->
    <header class="app-header">
      <div class="header-top-row">
        <div class="header-logo">
          <span class="logo-icon">💰</span>
          <h1>Finanças ERP</h1>
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="sync-data-btn" class="theme-toggle-btn" aria-label="Sincronizar Dados" title="Sincronizar Dados">
            <span style="font-size: 1.15rem; line-height: 1;">🔄</span>
          </button>
          <button id="print-pdf-btn" class="theme-toggle-btn" aria-label="Exportar PDF" title="Exportar PDF">
            <span style="font-size: 1.15rem; line-height: 1;">🖨️</span>
          </button>
          <button id="theme-toggle-btn" class="theme-toggle-btn" aria-label="Alternar Tema">
            <!-- Sun Icon -->
            <svg class="sun-icon hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            <!-- Moon Icon -->
            <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          </button>
        </div>
      </div>
      <div class="month-selector-wrapper">
        <button id="prev-month-btn" class="month-arrow-btn">◀</button>
        <span id="current-month-display" class="month-name">Junho de 2026</span>
        <button id="next-month-btn" class="month-arrow-btn">▶</button>
      </div>
    </header>

    <!-- Main Content Area (SPA Screens) -->
    <main class="app-main">
      
      <!-- SCREEN 1: DASHBOARD -->
      <section id="dashboard-screen" class="app-screen active">
        <!-- Warning Banner for Income Limit -->
        <div id="income-alert-banner" class="income-alert-banner hidden"></div>

        <!-- Dashboard Summary Cards -->
        <div class="summary-cards">
          <div class="summary-card income">
            <div class="card-header">
              <span>Receita Prevista</span>
              <span class="card-icon">📈</span>
            </div>
            <h2 id="summary-income">R$ 0,00</h2>
            <p id="income-subtitle" class="card-subtitle">Configurado nos ajustes</p>
          </div>
          <div class="summary-card fixed-expense">
            <div class="card-header">
              <span>Contas Fixas</span>
              <span class="card-icon">🏠</span>
            </div>
            <h2 id="summary-fixed">R$ 0,00</h2>
            <p id="fixed-subtitle" class="card-subtitle">0 de 8 pagas</p>
          </div>
          <div class="summary-card daily-expense">
            <div class="card-header">
              <span>Gastos Diários</span>
              <span class="card-icon">🛍️</span>
            </div>
            <h2 id="summary-daily">R$ 0,00</h2>
            <p id="daily-subtitle" class="card-subtitle">Registros deste mês</p>
          </div>
          <div class="summary-card balance">
            <div class="card-header">
              <span>Saldo Disponível</span>
              <span class="card-icon">💳</span>
            </div>
            <h2 id="summary-balance">R$ 0,00</h2>
            <p id="balance-subtitle" class="card-subtitle">Receita - Despesas</p>
          </div>
        </div>

        <!-- Savings Goal Section -->
        <div id="savings-goal-section" class="section-card" style="margin-bottom: 12px;">
          <h3 style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span>🎯 Meta de Poupança Mensal</span>
            <span id="savings-goal-ratio" style="font-size: 0.8rem; font-weight: normal; color: var(--text-secondary);">R$ 0,00 / R$ 0,00 (0%)</span>
          </h3>
          <div class="fixed-progress-bar-wrapper">
            <div class="progress-track" style="height: 12px; background-color: var(--border-color); border-radius: 6px; overflow: hidden; margin-top: 4px;">
              <div id="savings-goal-fill" class="progress-fill" style="width: 0%; height: 100%; background-color: var(--primary); transition: width 0.4s var(--ease);"></div>
            </div>
            <p id="savings-goal-subtitle" style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 6px;">Defina sua meta nas configurações.</p>
          </div>
        </div>

        <!-- Long-Term Savings Goals -->
        <div id="long-term-goals-section" class="section-card" style="margin-bottom: 12px;">
          <h3 style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span>🎯 Objetivos de Longo Prazo</span>
          </h3>
          <div id="long-term-goals-list" style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Goal progress bars will be inserted here dynamically -->
          </div>
          <div id="quick-allocate-wrapper" class="hidden" style="margin-top: 12px; border-top: 1px dashed var(--border-color); padding-top: 12px;">
            <h4 style="font-size: 0.8rem; font-weight: 600; margin-bottom: 8px; color: var(--text-primary);">Alocar Saldo Sobrando:</h4>
            <form id="allocate-savings-form" style="display: flex; gap: 8px;">
              <select id="allocate-goal-select" style="font-size: 0.8rem; padding: 6px 10px; height: 32px; flex: 1.5;" required>
                <!-- Dynamic goals select list -->
              </select>
              <input type="number" step="0.01" id="allocate-amount" placeholder="Valor (R$)" style="font-size: 0.8rem; padding: 6px 10px; height: 32px; flex: 1;" required inputmode="decimal">
              <button type="submit" class="btn btn-primary" style="padding: 0 12px; height: 32px; font-size: 0.8rem; flex: 0.8;">Alocar</button>
            </form>
          </div>
        </div>

        <!-- Budget progress limits -->
        <div class="budget-section section-card">
          <h3>Limites Mensais por Custo</h3>
          <div id="budget-progress-container" class="budget-progress-container">
            <!-- Dynamic elements will be inserted here by JS -->
          </div>
        </div>

        <!-- Proportional Expense Division (Collapsible) -->
        <div class="section-card division-section" style="margin-bottom: 12px;">
          <div class="division-header" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="toggleDivisionCollapse()">
            <h3>⚖️ Divisão de Contas Proporcional</h3>
            <span id="division-toggle-arrow" style="transition: transform 0.3s; transform: rotate(0deg); font-size: 0.8rem; color: var(--text-secondary);">▼</span>
          </div>
          
          <div id="division-content" class="hidden" style="margin-top: 12px; border-top: 1px dashed var(--border-color); padding-top: 12px;">
            <div class="division-summary" style="display: flex; flex-direction: column; gap: 8px;">
              <div class="division-ratio-bar-wrapper">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                  <span id="div-ratio-fabricio">Fabrício: 50%</span>
                  <span id="div-ratio-patricia">Patrícia: 50%</span>
                </div>
                <div class="progress-track" style="height: 8px; background-color: var(--border-color); border-radius: 4px; overflow: hidden; display: flex;">
                  <div id="div-fill-fabricio" style="width: 50%; height: 100%; background-color: var(--primary); transition: width 0.3s;"></div>
                  <div id="div-fill-patricia" style="width: 50%; height: 100%; background-color: var(--danger); transition: width 0.3s;"></div>
                </div>
              </div>
              
              <div class="division-calculations" style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
                <div class="division-row" style="display: flex; justify-content: space-between; font-size: 0.8rem; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
                  <span>Despesas Totais Compartilhadas:</span>
                  <strong id="div-total-shared">R$ 0,00</strong>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 4px;">
                  <!-- Fabrício Details -->
                  <div style="background: rgba(255, 255, 255, 0.01); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; font-size: 0.75rem;">
                    <div style="font-weight: bold; color: var(--primary); margin-bottom: 6px;">👨‍💻 Fabrício</div>
                    <div style="margin-bottom: 4px;">Sua Meta: <strong id="div-target-fabricio">R$ 0,00</strong></div>
                    <div>Pago por ele: <strong id="div-paid-fabricio">R$ 0,00</strong></div>
                  </div>
                  <!-- Patrícia Details -->
                  <div style="background: rgba(255, 255, 255, 0.01); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; font-size: 0.75rem;">
                    <div style="font-weight: bold; color: var(--danger); margin-bottom: 6px;">👩‍💼 Patrícia</div>
                    <div style="margin-bottom: 4px;">Sua Meta: <strong id="div-target-patricia">R$ 0,00</strong></div>
                    <div>Pago por ela: <strong id="div-paid-patricia">R$ 0,00</strong></div>
                  </div>
                </div>
                
                <div id="div-reconciliation-card" class="reconciliation-alert" style="margin-top: 8px; padding: 12px; border-radius: var(--radius-sm); font-size: 0.8rem; font-weight: 600; text-align: center;">
                  <!-- Transfer text goes here -->
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Future Purchases Simulator (Collapsible) -->
        <div class="section-card simulator-section">
          <div class="simulator-header" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="toggleSimulatorCollapse()">
            <h3>💡 Simulador de Compras Futuras</h3>
            <span id="simulator-toggle-arrow" style="transition: transform 0.3s; transform: rotate(0deg); font-size: 0.8rem; color: var(--text-secondary);">▼</span>
          </div>
          
          <div id="simulator-content" class="hidden" style="margin-top: 12px; border-top: 1px dashed var(--border-color); padding-top: 12px;">
            <form id="simulator-form">
              <div class="form-row-2">
                <div class="form-group">
                  <label for="sim-amount">Valor da Compra (R$)</label>
                  <input type="number" step="0.01" id="sim-amount" placeholder="0,00" required inputmode="decimal">
                </div>
                <div class="form-group">
                  <label for="sim-installments">Nº de Parcelas</label>
                  <input type="number" id="sim-installments" min="1" max="60" value="10" required inputmode="numeric">
                </div>
              </div>
              
              <div class="form-row-2">
                <div class="form-group">
                  <label for="sim-category">Centro de Custo</label>
                  <select id="sim-category" required>
                    <option value="Moradia">Moradia</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Alimentação">Alimentação</option>
                    <option value="Lanches">Lanches</option>
                    <option value="Alimentação Trabalho">Alimentação Trabalho</option>
                    <option value="Lazer & Assinaturas">Lazer & Assinaturas</option>
                    <option value="Seguros & Proteção">Seguros & Proteção</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="sim-start-month">Mês de Início</label>
                  <input type="month" id="sim-start-month" required>
                </div>
              </div>
              
              <div class="form-group">
                <label for="sim-desc">Descrição / O que pretende comprar?</label>
                <input type="text" id="sim-desc" placeholder="Ex: Geladeira Inverse" required>
              </div>
              
              <div class="form-actions" style="margin-bottom: 4px;">
                <button type="submit" class="btn btn-primary">Simular Impacto</button>
                <button type="button" id="clear-sim-btn" class="btn btn-secondary hidden">Limpar Simulação</button>
              </div>
            </form>
            
            <div id="sim-results-container" class="hidden" style="margin-top: 16px; border-top: 1px dashed var(--border-color); padding-top: 16px;">
              <h4 style="font-size: 0.85rem; font-weight: 600; margin-bottom: 10px;">Projeção do Orçamento (Próximos 12 meses):</h4>
              <div id="sim-projection-list" style="display: flex; flex-direction: column; gap: 10px; max-height: 200px; overflow-y: auto; padding-right: 4px;">
                <!-- Projection rows dynamically added by JS -->
              </div>
            </div>
          </div>
        </div>

        <!-- Dashboard Charts -->
        <div class="charts-section">
          <div class="chart-card section-card">
            <h3>Gastos por Centro de Custo</h3>
            <div class="chart-container">
              <canvas id="categoryChart"></canvas>
            </div>
          </div>
          <div class="chart-card section-card">
            <h3>Gastos por Cartão/Responsável</h3>
            <div class="chart-container">
              <canvas id="cardChart"></canvas>
            </div>
          </div>
          <div class="chart-card section-card">
            <h3>Evolução Financeira (Últimos 6 Meses)</h3>
            <div class="chart-container" style="height: 200px;">
              <canvas id="historyChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Resumo por Tags -->
        <div class="section-card tags-summary-card">
          <h3>🏷️ Gastos por Tag (Este Mês)</h3>
          <div id="tags-summary-list" class="tags-summary-list" style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
            <div class="empty-state" style="padding: 10px 0;">Nenhuma tag (#) usada nas despesas deste mês.</div>
          </div>
        </div>
      </section>

      <!-- SCREEN 2: FIXED BILLS -->
      <section id="fixed-screen" class="app-screen">
        <div class="section-title-wrapper">
          <h2>Contas Fixas Mensais</h2>
          <span class="section-desc">Monitore o pagamento das contas essenciais do mês.</span>
        </div>

        <div class="section-card fixed-bills-dashboard">
          <div class="fixed-progress-bar-wrapper">
            <div class="progress-label">
              <span>Progresso de Pagamento</span>
              <span id="fixed-progress-percent">0%</span>
            </div>
            <div class="progress-track">
              <div id="fixed-progress-fill" class="progress-fill" style="width: 0%"></div>
            </div>
          </div>
        </div>

        <div class="fixed-bills-list" id="fixed-bills-list">
          <!-- The 8 fixed bills will be rendered dynamically here -->
        </div>
      </section>

      <!-- SCREEN 3: DAILY EXPENSES -->
      <section id="daily-screen" class="app-screen">
        <div class="section-title-wrapper" style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
          <div>
            <h2>Lançar Gastos Diários</h2>
            <span class="section-desc">Registre compras cotidianas e saídas diversas.</span>
          </div>
          <button id="voice-input-btn" type="button" class="btn-voice" title="Lançar por voz" style="display: flex; align-items: center; gap: 6px; padding: 8px 14px; font-size: 0.85rem; font-weight: 600; border-radius: var(--radius-sm); border: 1px solid var(--primary); background: rgba(58, 134, 255, 0.08); color: var(--primary); cursor: pointer; transition: all 0.2s ease;">
            <span style="font-size: 1.1rem; line-height: 1;">🎙️</span> Falar
          </button>
        </div>

        <!-- Voice Overlay / Indicator -->
        <div id="voice-overlay" class="voice-overlay hidden">
          <div class="voice-overlay-card">
            <div class="mic-pulse-wrapper">
              <div class="mic-pulse-ring"></div>
              <div class="mic-pulse-ring-2"></div>
              <div class="voice-mic-btn">🎙️</div>
            </div>
            <h3>Ouvindo...</h3>
            <p class="voice-instructions">Fale a despesa e o valor.<br><small>Ex: "Padaria doze reais e cinquenta centavos" ou "Cinquenta reais no posto"</small></p>
            <p id="voice-transcript-temp" class="voice-transcript-temp">"..."</p>
            <button id="voice-cancel-btn" type="button" class="btn btn-secondary" style="margin-top: 10px;">Cancelar</button>
          </div>
        </div>

        <!-- Add Expense Form -->
        <div class="section-card input-form-card">
          <form id="expense-form">
            <input type="hidden" id="edit-expense-id">
            
            <div class="form-row-2">
              <div class="form-group">
                <label for="expense-amount">Valor (R$)</label>
                <input type="number" step="0.01" id="expense-amount" placeholder="0,00" required inputmode="decimal">
              </div>
              <div class="form-group">
                <label for="expense-date">Data</label>
                <input type="date" id="expense-date" required>
              </div>
            </div>

            <div class="form-group">
              <label for="expense-desc">Descrição / O que comprou?</label>
              <input type="text" id="expense-desc" placeholder="Ex: Supermercado BH" required>
            </div>

            <div class="form-group">
              <label for="expense-tags">Tags (ex: #viagem #combustivel)</label>
              <input type="text" id="expense-tags" placeholder="Digite tags separadas por espaço">
              <div id="quick-tags-chips" class="quick-tags-chips" style="margin-top: 6px; display: flex; flex-wrap: wrap; gap: 6px;">
                <!-- Chips de tags rápidas gerados dinamicamente -->
              </div>
            </div>

            <div class="form-row-2 installment-row" style="margin-bottom: 12px; align-items: center;">
              <div class="form-group" style="flex-direction: row; align-items: center; gap: 8px; margin-bottom: 0;">
                <input type="checkbox" id="expense-is-installment" style="width: 20px; height: 20px; margin: 0; cursor: pointer;">
                <label for="expense-is-installment" style="cursor: pointer; font-size: 0.85rem; user-select: none;">Compra Parcelada?</label>
              </div>
              <div id="installment-group" class="form-group hidden" style="margin-bottom: 0;">
                <label for="expense-installments">Nº de Parcelas</label>
                <input type="number" id="expense-installments" min="2" max="60" value="2" step="1" inputmode="numeric">
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label for="expense-category">Centro de Custo</label>
                <select id="expense-category" required>
                  <option value="Moradia">🏠 Moradia</option>
                  <option value="Transporte">🚗 Transporte</option>
                  <option value="Saúde">🏥 Saúde</option>
                  <option value="Alimentação">🍕 Alimentação</option>
                  <option value="Lanches">🍔 Lanches</option>
                  <option value="Alimentação Trabalho">🍱 Alimentação Trabalho</option>
                  <option value="Lazer & Assinaturas">🎬 Lazer & Assinaturas</option>
                  <option value="Seguros & Proteção">🛡️ Seguros & Proteção</option>
                  <option value="Outros">⚙️ Outros Gastos</option>
                </select>
              </div>
              <div class="form-group">
                <label for="expense-card">Cartão / Quem gastou?</label>
                <select id="expense-card" required>
                  <!-- Options generated dynamically based on settings -->
                </select>
              </div>
            </div>

            <!-- Specify Outros Details -->
            <div id="specify-others-group" class="form-group hidden">
              <label for="expense-specify">Especificar Outro Gasto (Para o que foi?)</label>
              <input type="text" id="expense-specify" placeholder="Ex: Presente sobrinho">
            </div>

            <div class="form-actions">
              <button type="submit" id="submit-expense-btn" class="btn btn-primary">Salvar Lançamento</button>
              <button type="button" id="cancel-edit-btn" class="btn btn-secondary hidden">Cancelar Edição</button>
            </div>
          </form>
        </div>

        <!-- Collapsible Bank Import Section -->
        <div class="section-card import-section">
          <div class="import-header" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="toggleImportCollapse()">
            <h3>📋 Importar Extrato Bancário (OFX/CSV)</h3>
            <span id="import-toggle-arrow" style="transition: transform 0.3s; transform: rotate(0deg); font-size: 0.8rem; color: var(--text-secondary);">▼</span>
          </div>
          
          <div id="import-content" class="hidden" style="margin-top: 12px; border-top: 1px dashed var(--border-color); padding-top: 12px;">
            <p class="card-desc">Carregue um arquivo <strong>OFX</strong> ou <strong>CSV</strong>. Os gastos serão extraídos e você poderá escolher quais importar.</p>
            
            <div class="import-drop-zone" id="import-drop-zone" style="border: 2px dashed var(--border-color); border-radius: var(--radius-sm); padding: 24px; text-align: center; cursor: pointer; transition: all 0.2s ease;">
              <span style="font-size: 0.85rem; color: var(--text-secondary);">📂 Clique para selecionar ou arraste o extrato aqui</span>
              <input type="file" id="import-statement-file" accept=".ofx,.csv" style="display: none;">
            </div>
            
            <div style="margin-top: 10px; display: flex; flex-direction: column; align-items: center; gap: 8px; justify-content: center;">
              <label style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: var(--text-secondary); cursor: pointer;">
                <input type="checkbox" id="import-invert-values">
                💳 Extrato de Cartão de Crédito (Tratar valores positivos como despesas)
              </label>
              <label style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: var(--text-secondary); cursor: pointer;">
                <input type="checkbox" id="import-adjust-dates" checked>
                📅 Mudar gastos do mês seguinte (pós-fechamento) para o último dia do mês do extrato
              </label>
            </div>
            
            <!-- Reconciliation Table -->
            <div id="reconciliation-area" class="hidden" style="margin-top: 16px;">
              <h4 style="font-size: 0.85rem; font-weight: 600; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                <span>Transações Identificadas:</span>
                <span id="import-count-label" style="font-size: 0.75rem; font-weight: normal; color: var(--text-secondary);">0 selecionadas</span>
              </h4>
              <!-- Filtro e Ações em Lote -->
              <input type="text" id="import-search-filter" placeholder="🔍 Filtrar transações..." style="margin-bottom: 10px; font-size: 0.8rem; padding: 6px 10px; height: 32px; width: 100%;" oninput="filterImportTable()">
              
              <div class="bulk-controls-wrapper">
                <span style="font-size: 0.72rem; font-weight: 600; color: var(--text-secondary);">Lote:</span>
                <select id="bulk-category-select" class="bulk-select" style="padding: 4px 6px; font-size: 0.75rem; width: auto; height: 28px;">
                  <option value="">Categoria...</option>
                  <option value="Moradia">🏠 Moradia</option>
                  <option value="Transporte">🚗 Transporte</option>
                  <option value="Saúde">🏥 Saúde</option>
                  <option value="Alimentação">🍕 Alimentação</option>
                  <option value="Lanches">🍔 Lanches</option>
                  <option value="Alimentação Trabalho">🍱 Alimentação Trabalho</option>
                  <option value="Lazer & Assinaturas">🎬 Lazer & Assinaturas</option>
                  <option value="Seguros & Proteção">🛡️ Seguros & Proteção</option>
                  <option value="Outros">⚙️ Outros</option>
                </select>
                <button type="button" class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.7rem; flex: none; height: 28px; line-height: 1;" onclick="applyBulkCategory()">Aplicar Cat</button>
                
                <select id="bulk-card-select" class="bulk-select" style="padding: 4px 6px; font-size: 0.75rem; width: auto; height: 28px;">
                  <option value="">Cartão...</option>
                  <!-- Dynamically populated -->
                </select>
                <button type="button" class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.7rem; flex: none; height: 28px; line-height: 1;" onclick="applyBulkCard()">Aplicar Cartão</button>
              </div>
              
              <div class="reconciliation-table-wrapper" style="overflow-x: auto; border: 1px solid var(--border-color); border-radius: var(--radius-sm); max-height: 250px;">
                <table class="reconciliation-table" style="width: 100%; border-collapse: collapse; font-size: 0.75rem; text-align: left;">
                  <thead>
                    <tr style="background-color: var(--bg-card); border-bottom: 1px solid var(--border-color); color: var(--text-secondary);">
                      <th style="padding: 8px; width: 30px;"><input type="checkbox" id="import-select-all" checked></th>
                      <th style="padding: 8px; width: 70px;">Data</th>
                      <th style="padding: 8px;">Descrição</th>
                      <th style="padding: 8px; width: 70px;">Valor</th>
                      <th style="padding: 8px; width: 90px;">Categoria</th>
                      <th style="padding: 8px; width: 90px;">Cartão</th>
                    </tr>
                  </thead>
                  <tbody id="reconciliation-tbody" style="background-color: rgba(255, 255, 255, 0.005);">
                    <!-- Dynamically populated rows -->
                  </tbody>
                </table>
              </div>
              
              <div class="form-actions" style="margin-top: 12px;">
                <button type="button" id="confirm-import-btn" class="btn btn-primary" style="padding: 8px 12px; font-size: 0.8rem;">Importar Selecionados</button>
                <button type="button" id="cancel-import-btn" class="btn btn-secondary" style="padding: 8px 12px; font-size: 0.8rem;">Cancelar</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Future Installments Projection (Collapsible) -->
        <div class="section-card projection-section" style="margin-bottom: 12px;">
          <div class="projection-header" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="toggleProjectionCollapse()">
            <h3>📅 Projeção de Parcelas Futuras</h3>
            <span id="projection-toggle-arrow" style="transition: transform 0.3s; transform: rotate(0deg); font-size: 0.8rem; color: var(--text-secondary);">▼</span>
          </div>
          
          <div id="projection-content" class="hidden" style="margin-top: 12px; border-top: 1px dashed var(--border-color); padding-top: 12px;">
            <p class="card-desc">Visualize o total comprometido em parcelas de cartão de crédito para os próximos 12 meses.</p>
            
            <!-- Installments summary bar list -->
            <div id="projection-bar-list" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
              <!-- Dynamic month projections will be inserted here -->
            </div>
            
            <h4 style="font-size: 0.8rem; font-weight: 600; margin-bottom: 8px; color: var(--text-primary);">Compras Parceladas Ativas:</h4>
            <div id="active-installments-list" style="max-height: 150px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding-right: 4px; font-size: 0.75rem;">
              <!-- Active installment items will be rendered here -->
            </div>
          </div>
        </div>

        <!-- Transaction History -->
        <div class="section-card history-card">
          <div class="history-header">
            <h3>Histórico de Lançamentos</h3>
            <div class="filters-row">
              <select id="filter-category" class="filter-select">
                <option value="all">Todos Centros</option>
                <option value="Moradia">Moradia</option>
                <option value="Transporte">Transporte</option>
                <option value="Saúde">Saúde</option>
                <option value="Alimentação">Alimentação</option>
                <option value="Lanches">Lanches</option>
                <option value="Alimentação Trabalho">Alimentação Trabalho</option>
                <option value="Lazer & Assinaturas">Lazer & Assinaturas</option>
                <option value="Seguros & Proteção">Seguros</option>
                <option value="Outros">Outros</option>
              </select>
              <select id="filter-card" class="filter-select">
                <option value="all">Todos Cartões</option>
              </select>
              <select id="filter-tag" class="filter-select">
                <option value="all">Todas Tags</option>
              </select>
            </div>
            <div class="search-row" style="margin-top: 10px;">
              <input type="text" id="search-expense" placeholder="🔍 Buscar por descrição..." style="padding: 8px 12px; font-size: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); width: 100%;">
            </div>
          </div>

          <div class="transaction-list" id="transaction-list">
            <!-- Dynamic transactions will render here -->
          </div>
        </div>
      </section>

      <!-- SCREEN 4: SETTINGS & ADJUSTMENTS -->
      <section id="settings-screen" class="app-screen">
        <div class="section-title-wrapper">
          <h2>Ajustes & Configurações</h2>
          <span class="section-desc">Gerencie seus limites, cartões e backups de dados.</span>
        </div>

        <!-- Monthly Income & Cards Setup -->
        <div class="section-card">
          <h3>Configuração Geral</h3>
          <form id="settings-form" style="margin-top: 1rem;">
            <div class="form-row-2">
              <div class="form-group">
                <label for="setting-salary-fabricio">Salário Fabrício (R$)</label>
                <input type="number" step="0.01" id="setting-salary-fabricio" placeholder="Ex: 4000.00" inputmode="decimal">
              </div>
              <div class="form-group">
                <label for="setting-salary-patricia">Salário Patrícia (R$)</label>
                <input type="number" step="0.01" id="setting-salary-patricia" placeholder="Ex: 2500.00" inputmode="decimal">
              </div>
            </div>

            <div class="form-group">
              <label for="setting-extra-income">Renda Extra / Entradas Fora do Padrão (R$)</label>
              <input type="number" step="0.01" id="setting-extra-income" placeholder="Ex: 0,00" inputmode="decimal">
            </div>

            <h4 style="margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">Configurar Nomes dos Cartões/Responsáveis</h4>
            <div class="form-row-2">
              <div class="form-group">
                <label for="card-name-1">Cartão / Usuário 1</label>
                <input type="text" id="card-name-1" placeholder="Ex: Cartão João">
              </div>
              <div class="form-group">
                <label for="card-name-2">Cartão / Usuário 2</label>
                <input type="text" id="card-name-2" placeholder="Ex: Cartão Maria">
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label for="card-name-3">Cartão / Usuário 3</label>
                <input type="text" id="card-name-3" placeholder="Ex: Pix / Débito">
              </div>
              <div class="form-group">
                <label for="card-name-4">Cartão / Usuário 4</label>
                <input type="text" id="card-name-4" placeholder="Ex: Dinheiro">
              </div>
            </div>

            <h4 style="margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">Meta de Poupança/Economia Mensal</h4>
            <div class="form-row-2">
              <div class="form-group">
                <label for="setting-savings-type">Tipo de Meta</label>
                <select id="setting-savings-type">
                  <option value="percentage">Porcentagem da Renda (%)</option>
                  <option value="absolute">Valor Fixo (R$)</option>
                </select>
              </div>
              <div class="form-group">
                <label for="setting-savings-value">Valor da Meta</label>
                <input type="number" step="0.01" id="setting-savings-value" placeholder="Ex: 15 ou 1000" inputmode="decimal">
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="margin-top: 1rem;">Salvar Configurações</button>
          </form>
        </div>

        <!-- Monthly Budget Goals -->
        <div class="section-card">
          <h3>Metas de Limites de Gastos (Centros de Custo)</h3>
          <p class="card-desc">Defina o valor máximo ideal de gasto para cada categoria no mês.</p>
          
          <form id="budget-goals-form" style="margin-top: 1rem;">
            <div class="form-row-2">
              <div class="form-group">
                <label for="limit-moradia">Moradia (R$)</label>
                <input type="number" step="1" id="limit-moradia" value="2000" inputmode="numeric">
              </div>
              <div class="form-group">
                <label for="limit-transporte">Transporte (R$)</label>
                <input type="number" step="1" id="limit-transporte" value="1000" inputmode="numeric">
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label for="limit-saude">Saúde (R$)</label>
                <input type="number" step="1" id="limit-saude" value="500" inputmode="numeric">
              </div>
              <div class="form-group">
                <label for="limit-alimentacao">Alimentação (R$)</label>
                <input type="number" step="1" id="limit-alimentacao" value="1500" inputmode="numeric">
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label for="limit-lazer">Lazer & Assinaturas (R$)</label>
                <input type="number" step="1" id="limit-lazer" value="500" inputmode="numeric">
              </div>
              <div class="form-group">
                <label for="limit-seguros">Seguros & Proteção (R$)</label>
                <input type="number" step="1" id="limit-seguros" value="300" inputmode="numeric">
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label for="limit-lanches">Lanches (R$)</label>
                <input type="number" step="1" id="limit-lanches" value="200" inputmode="numeric">
              </div>
              <div class="form-group">
                <label for="limit-alimentacao-trabalho">Alimentação Trabalho (R$)</label>
                <input type="number" step="1" id="limit-alimentacao-trabalho" value="400" inputmode="numeric">
              </div>
            </div>
            <div class="form-group">
              <label for="limit-outros">Outros Gastos (R$)</label>
              <input type="number" step="1" id="limit-outros" value="500" inputmode="numeric">
            </div>

            <button type="submit" class="btn btn-primary" style="margin-top: 1rem;">Salvar Metas de Limite</button>
          </form>
        </div>

        <!-- Cadastro de Objetivos de Longo Prazo -->
        <div class="section-card">
          <h3>Objetivos de Longo Prazo</h3>
          <p class="card-desc">Cadastre metas de poupança maiores (ex: Reserva de Emergência, Carro Novo).</p>
          
          <form id="long-term-goals-form" style="margin-top: 1rem;">
            <div id="settings-goals-container" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
              <!-- Dynamic goal rows created by JS -->
            </div>
            <div style="display: flex; gap: 8px;">
              <button type="button" id="add-goal-btn" class="btn btn-secondary" style="padding: 10px; font-size: 0.85rem;">+ Novo Objetivo</button>
              <button type="submit" class="btn btn-primary" style="padding: 10px; font-size: 0.85rem;">Salvar Objetivos</button>
            </div>
          </form>
        </div>

        <!-- Modelos de Contas Fixas -->
        <div class="section-card">
          <h3>Modelos de Contas Fixas</h3>
          <p class="card-desc">Defina as contas fixas padrão e os valores que serão carregados ao iniciar um novo mês.</p>
          
          <form id="fixed-bills-template-form" style="margin-top: 1rem;">
            <div id="fixed-bills-template-container" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
              <!-- Linhas de modelos geradas dinamicamente via JS -->
            </div>
            <div style="display: flex; gap: 8px;">
              <button type="button" id="add-template-item-btn" class="btn btn-secondary" style="padding: 10px; font-size: 0.85rem;">+ Adicionar Modelo</button>
              <button type="submit" class="btn btn-primary" style="padding: 10px; font-size: 0.85rem;">Salvar Modelos</button>
            </div>
          </form>
        </div>

        <!-- Data Import & Export -->
        <div class="section-card">
          <h3>Segurança & Backup dos Dados</h3>
          <p class="card-desc">Como o app armazena tudo localmente no seu celular, é altamente recomendável fazer backups regulares.</p>
          
          <div class="backup-actions">
            <button id="export-backup-btn" class="btn btn-secondary">📤 Exportar Backup (JSON)</button>
            <label for="import-file" class="btn btn-secondary btn-file-label">
              📥 Importar Backup (JSON)
              <input type="file" id="import-file" accept=".json" style="display: none;">
            </label>
          </div>

          <div style="margin-top: 10px;">
            <button id="logout-app-btn" class="btn btn-secondary" style="width: 100%; font-weight: 700; border: 1px solid var(--border-color); background: rgba(255,255,255,0.03);">🔒 Bloquear ERP (Sair)</button>
          </div>
          
          <div class="danger-zone" style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px dashed var(--border-color);">
            <button id="reset-app-btn" class="btn btn-danger">⚠️ Limpar Todos os Dados</button>
          </div>
        </div>

        <!-- Hosting Instructions -->
        <div class="section-card">
          <h3>Como Hospedar Online Grátis</h3>
          <p class="card-desc">Siga esses passos simples para colocar seu ERP de finanças no celular:</p>
          <ol class="hosting-steps">
            <li>Crie uma conta gratuita na <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">Vercel</a> ou <a href="https://netlify.com" target="_blank" rel="noopener noreferrer">Netlify</a>.</li>
            <li>Suba os arquivos <code>index.html</code>, <code>style.css</code> e <code>app.js</code> em um repositório no seu GitHub ou simplesmente arraste e solte a pasta do projeto no painel da Netlify.</li>
            <li>Pronto! Você terá um link público seguro (<code>https://...</code>) para abrir no celular e salvar como atalho na sua tela inicial!</li>
          </ol>
        </div>
      </section>

      <!-- PRINT ONLY DETAILS -->
      <div id="print-only-details" class="print-only" style="display: none;">
        
        <!-- Division of Expenses Print Section -->
        <div class="section-card" style="margin-top: 24px; page-break-inside: avoid;">
          <h3>⚖️ Divisão Proporcional de Despesas</h3>
          <div id="print-division-details" style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
            <!-- Rendered proportional division metrics -->
          </div>
        </div>

        <!-- Long Term Goals Print Section -->
        <div class="section-card" style="margin-top: 24px; page-break-inside: avoid;">
          <h3>🎯 Objetivos de Longo Prazo</h3>
          <div id="print-goals-details" style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
            <!-- Rendered long-term goals progress -->
          </div>
        </div>

        <!-- Category Limits Print Section -->
        <div class="section-card" style="margin-top: 24px; page-break-inside: avoid;">
          <h3>📊 Resumo por Centro de Custo</h3>
          <div id="print-categories-details" style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
            <!-- Rendered categories breakdown -->
          </div>
        </div>

        <div class="section-card" style="margin-top: 24px; page-break-inside: avoid;">
          <h3>📋 Detalhamento de Contas Fixas</h3>
          <div id="print-fixed-bills-list" style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
            <!-- Rendered list of fixed bills -->
          </div>
        </div>
        
        <div class="section-card" style="margin-top: 24px; page-break-inside: avoid;">
          <h3>📝 Detalhamento de Gastos Diários</h3>
          <div id="print-daily-expenses-list" style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
            <!-- Rendered list of daily expenses -->
          </div>
        </div>
      </div>

    </main>

    <!-- Bottom Navigation Bar (Mobile Native Style) -->
    <nav class="app-navbar">
      <button class="nav-btn active" data-tab="dashboard-screen">
        <span class="nav-icon">📊</span>
        <span class="nav-label">Dashboard</span>
      </button>
      <button class="nav-btn" data-tab="fixed-screen">
        <span class="nav-icon">💸</span>
        <span class="nav-label">Fixas</span>
      </button>
      
      <!-- Center Quick Add Floating Button -->
      <button class="nav-btn nav-btn-center" id="quick-add-fab" data-tab="daily-screen">
        <span class="nav-icon-fab">+</span>
      </button>
      
      <button class="nav-btn" data-tab="daily-screen">
        <span class="nav-icon">📝</span>
        <span class="nav-label">Gastos</span>
      </button>
      <button class="nav-btn" data-tab="settings-screen">
        <span class="nav-icon">⚙️</span>
        <span class="nav-label">Ajustes</span>
      </button>
    </nav>

  </div>

  <!-- JavaScript Application Logics -->
  <!-- Modal de Conciliação de Duplicidades -->
  <div id="reconciliation-modal" class="modal-overlay hidden">
    <div class="modal-card">
      <div class="modal-header">
        <h3>⚠️ Transação Duplicada Detectada</h3>
      </div>
      <div class="modal-body">
        <p>Detectamos um lançamento manual existente com o mesmo valor deste item do extrato:</p>
        
        <div class="reconcile-comparison-box">
          <div class="comparison-column manual-col">
            <h4>Lançamento Manual</h4>
            <div class="comp-detail"><strong>Data:</strong> <span id="rec-manual-date"></span></div>
            <div class="comp-detail"><strong>Descrição:</strong> <span id="rec-manual-desc"></span></div>
            <div class="comp-detail"><strong>Categoria:</strong> <span id="rec-manual-cat"></span></div>
            <div class="comp-detail"><strong>Valor:</strong> <span id="rec-manual-amount"></span></div>
          </div>
          <div class="comparison-column divider-col">⚡</div>
          <div class="comparison-column import-col">
            <h4>Item do Extrato</h4>
            <div class="comp-detail"><strong>Data:</strong> <span id="rec-import-date"></span></div>
            <div class="comp-detail"><strong>Descrição:</strong> <span id="rec-import-desc"></span></div>
            <div class="comp-detail"><strong>Categoria:</strong> <span id="rec-import-cat"></span></div>
            <div class="comp-detail"><strong>Valor:</strong> <span id="rec-import-amount"></span></div>
          </div>
        </div>
        
        <p style="margin-top: 14px; font-size: 0.8rem; text-align: center; color: var(--text-secondary);">
          Escolha qual lançamento deseja manter no sistema.
        </p>
      </div>
      <div class="modal-actions">
        <button id="btn-keep-manual" class="btn btn-secondary">Manter Manual</button>
        <button id="btn-keep-import" class="btn btn-primary">Substituir pelo Extrato</button>
        <button id="btn-keep-both" class="btn btn-secondary" style="border: 1px solid var(--border-color);">Manter Ambos</button>
      </div>
    </div>
  </div>

  
`;

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      <Script src="https://cdn.jsdelivr.net/npm/chart.js" strategy="beforeInteractive" />
      <Script src="/supabase-mock.js" strategy="beforeInteractive" />
      <Script src="/app.js" strategy="afterInteractive" />
    </>
  );
}
