/* ==========================================================================
   PERSONAL FINANCE ERP - APPLICATION ENGINE (JAVASCRIPT)
   ========================================================================== */

// Local Serverless API (Neon) Configuration
const supabaseMock = {
  auth: {
    listeners: [],
    onAuthStateChange(callback) {
      this.listeners.push(callback);
      const token = localStorage.getItem('home_accounts_token');
      if (token) {
        fetch('/api/auth/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(r => r.json())
        .then(data => {
          if (data.user) {
            callback('SIGNED_IN', { user: data.user, token });
          } else {
            localStorage.removeItem('home_accounts_token');
            callback('SIGNED_OUT', null);
          }
        })
        .catch(() => {
          localStorage.removeItem('home_accounts_token');
          callback('SIGNED_OUT', null);
        });
      } else {
        setTimeout(() => callback('SIGNED_OUT', null), 0);
      }
      return { data: { subscription: { unsubscribe() {} } } };
    },
    async signUp({ email, password }) {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro no cadastro');
      return { data, error: null };
    },
    async signInWithPassword({ email, password }) {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro no login');
      localStorage.setItem('home_accounts_token', data.token);
      this.listeners.forEach(cb => cb('SIGNED_IN', { user: data.user, token: data.token }));
      return { data, error: null };
    },
    async signOut() {
      localStorage.removeItem('home_accounts_token');
      this.listeners.forEach(cb => cb('SIGNED_OUT', null));
      return { error: null };
    },
    async updateUser({ password }) {
      const token = localStorage.getItem('home_accounts_token');
      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao atualizar senha');
      return { data, error: null };
    },
    async resetPasswordForEmail(email, options) {
      return { error: new Error('Recuperação de senha via e-mail não disponível neste servidor Neon. Entre em contato com o suporte ou altere direto no banco.') };
    }
  },
  from(tableName) {
    const token = localStorage.getItem('home_accounts_token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const builder = {
      filters: {},
      updateData: null,
      insertData: null,
      upsertData: null,
      isDelete: false,
      eq(field, value) {
        this.filters[field] = value;
        return this;
      },
      in(field, values) {
        this.filters[field] = values;
        return this;
      },
      maybeSingle() {
        return this.execute();
      },
      single() {
        return this.execute();
      },
      select() {
        return this;
      },
      update(data) {
        this.updateData = data;
        return this;
      },
      insert(data) {
        this.insertData = data;
        return this;
      },
      upsert(data) {
        this.upsertData = data;
        return this;
      },
      delete() {
        this.isDelete = true;
        return this;
      },
      async execute() {
        try {
          if (tableName === 'user_settings') {
            if (this.updateData || this.insertData || this.upsertData) {
              const body = this.updateData || this.upsertData || (this.insertData && this.insertData[0]);
              const res = await fetch('/api/settings', {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error);
              return { data: data.settings, error: null };
            } else {
              const res = await fetch('/api/settings', { headers });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error);
              return { data: data.settings, error: null };
            }
          }

          if (tableName === 'fixed_bills_templates') {
            if (this.isDelete) {
              return { error: null };
            }
            if (this.insertData) {
              const res = await fetch('/api/templates', {
                method: 'POST',
                headers,
                body: JSON.stringify({ templates: this.insertData })
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error);
              return { data: data.templates, error: null };
            }
            const res = await fetch('/api/templates', { headers });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return { data: data.templates, error: null };
          }

          if (tableName === 'fixed_bills') {
            if (this.insertData) {
              return { data: this.insertData, error: null };
            }
            if (this.updateData) {
              const id = this.filters.id;
              const res = await fetch('/api/bills', {
                method: 'POST',
                headers,
                body: JSON.stringify({ id, ...this.updateData })
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error);
              return { data: data.bill, error: null };
            }
            const monthKey = this.filters.month_key;
            const res = await fetch(`/api/bills?monthKey=${monthKey}`, { headers });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return { data: data.bills, error: null };
          }

          if (tableName === 'daily_expenses') {
            if (this.isDelete) {
              const body = { action: 'delete' };
              if (this.filters.installment_group_id) {
                body.action = 'deleteGroup';
                body.installmentGroupId = this.filters.installment_group_id;
              } else {
                body.id = this.filters.id;
              }
              const res = await fetch('/api/transactions', {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error);
              return { error: null };
            }
            if (this.insertData) {
              const res = await fetch('/api/transactions', {
                method: 'POST',
                headers,
                body: JSON.stringify({ action: 'insert', expenses: this.insertData })
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error);
              return { error: null };
            }
            if (this.updateData) {
              const id = this.filters.id;
              const res = await fetch('/api/transactions', {
                method: 'POST',
                headers,
                body: JSON.stringify({ action: 'update', id, ...this.updateData })
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error);
              return { error: null };
            }
            const res = await fetch('/api/transactions', { headers });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return { data: data.expenses, error: null };
          }
        } catch (err) {
          console.error(`Error executing mock query on table ${tableName}:`, err);
          return { data: null, error: err };
        }
      }
    };

    builder.then = function(onFulfilled, onRejected) {
      return this.execute().then(onFulfilled, onRejected);
    };

    return builder;
  }
};
var supabase = supabaseMock;


// Global logged in user state
let loggedInUserId = null;

// Global state schema
let state = {
  version: '1.5',
  currentMonth: '', // format YYYY-MM
  appPassword: '', // local password lock
  salaryFabricio: 4000.00,
  salaryPatricia: 2500.00,
  extraIncome: 0.00,
  cards: ['Cartão Principal', 'Cartão Adicional', 'Pix / Débito', 'Dinheiro'],
  budgetLimits: {
    'Moradia': 2000,
    'Transporte': 1000,
    'Saúde': 500,
    'Alimentação': 1500,
    'Lanches': 200,
    'Alimentação Trabalho': 400,
    'Lazer & Assinaturas': 500,
    'Seguros & Proteção': 300,
    'Outros': 500
  },
  fixedBills: {}, // Key: YYYY-MM, Value: Array of 8 bills
  fixedBillsTemplate: [], // Array of template bills
  savingsGoalType: 'percentage', // 'percentage' or 'absolute'
  savingsGoalValue: 15.00, // default 15%
  dailyExpenses: [] // Array of transaction objects
};

// Default template for the 8 fixed bills
const defaultFixedBillsTemplate = [
  { id: 'f-agua', name: '💧 Água', paid: false, value: 100.00, dueDate: '10', card: 'Pix / Débito' },
  { id: 'f-luz', name: '⚡ Luz', paid: false, value: 180.00, dueDate: '15', card: 'Pix / Débito' },
  { id: 'f-casa', name: '🏠 Parcela Financiamento Casa', paid: false, value: 1800.00, dueDate: '20', card: 'Pix / Débito' },
  { id: 'f-carro', name: '🚗 Financiamento Carro', paid: false, value: 950.00, dueDate: '12', card: 'Pix / Débito' },
  { id: 'f-saude', name: '🏥 Plano de Saúde', paid: false, value: 650.00, dueDate: '05', card: 'Pix / Débito' },
  { id: 'f-vida', name: '🛡️ Seguro de Vida', paid: false, value: 90.00, dueDate: '08', card: 'Pix / Débito' },
  { id: 'f-condo', name: '🏢 Condomínio', paid: false, value: 380.00, dueDate: '10', card: 'Pix / Débito' },
  { id: 'f-solar', name: '☀️ Luz Solar', paid: false, value: 120.00, dueDate: '25', card: 'Pix / Débito' }
];

// Global chart instances
let categoryChartInstance = null;
let cardChartInstance = null;
let historyChartInstance = null;

// ==========================================================================
// TOAST NOTIFICATION & CONFIRM MODAL OVERRIDES
// ==========================================================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  else if (type === 'warning') icon = '⚠️';
  else if (type === 'danger') icon = '❌';

  toast.innerHTML = `<span style="font-size: 1.1rem; line-height: 1; flex-shrink: 0;">${icon}</span> <span style="flex-grow: 1; margin-right: 8px;">${message}</span><button type="button" class="toast-close-btn" aria-label="Fechar">&times;</button>`;
  container.appendChild(toast);

  const closeBtn = toast.querySelector('.toast-close-btn');
  if (closeBtn) {
    closeBtn.onclick = () => {
      toast.remove();
    };
  }

  // Auto-remove toast
  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  }, 4000);
}

// Override window.alert
window.alert = function(message) {
  let type = 'info';
  const msgLower = message.toLowerCase();
  if (msgLower.includes('erro') || msgLower.includes('inválido') || msgLower.includes('não suportado') || msgLower.includes('estourado') || msgLower.includes('negativo') || msgLower.includes('falha')) {
    type = 'danger';
  } else if (msgLower.includes('sucesso') || msgLower.includes('parabéns') || msgLower.includes('realizado') || msgLower.includes('salvos') || msgLower.includes('importado')) {
    type = 'success';
  } else if (msgLower.includes('atenção') || msgLower.includes('alerta') || msgLower.includes('aviso')) {
    type = 'warning';
  }
  showToast(message, type);
};

function showConfirmModal(message, options = {}) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirm-modal');
    const titleEl = document.getElementById('confirm-modal-title');
    const messageEl = document.getElementById('confirm-modal-message');
    const inputWrapper = document.getElementById('confirm-modal-input-wrapper');
    const inputField = document.getElementById('confirm-modal-input');
    const actionsContainer = modal.querySelector('.modal-actions');

    if (!modal) {
      resolve(confirm(message));
      return;
    }

    titleEl.textContent = options.title || 'Confirmação';
    messageEl.textContent = message;

    if (options.requireInput) {
      inputWrapper.classList.remove('hidden');
      inputField.value = '';
      inputField.placeholder = options.inputPlaceholder || 'Digite aqui';
    } else {
      inputWrapper.classList.add('hidden');
    }

    actionsContainer.innerHTML = '';

    if (options.buttons) {
      options.buttons.forEach((btnText, idx) => {
        const btn = document.createElement('button');
        btn.textContent = btnText;
        btn.className = `btn ${idx === 0 ? 'btn-danger' : 'btn-secondary'}`;
        if (idx === 1) btn.style.border = '1px solid var(--border-color)';
        btn.onclick = () => {
          modal.classList.add('hidden');
          resolve(idx);
        };
        actionsContainer.appendChild(btn);
      });
    } else {
      const cancel = document.createElement('button');
      cancel.textContent = options.cancelText || 'Cancelar';
      cancel.className = 'btn btn-secondary';
      cancel.onclick = () => {
        modal.classList.add('hidden');
        resolve(false);
      };

      const ok = document.createElement('button');
      ok.textContent = options.okText || 'Confirmar';
      ok.className = 'btn btn-primary';
      
      if (options.requireInput) {
        ok.disabled = true;
        inputField.oninput = () => {
          ok.disabled = inputField.value !== options.targetInput;
        };
      }
      
      ok.onclick = () => {
        modal.classList.add('hidden');
        resolve(true);
      };

      actionsContainer.appendChild(cancel);
      actionsContainer.appendChild(ok);
    }

    modal.classList.remove('hidden');
  });
}

// ==========================================================================
// STATE PERSISTENCE & INITIALIZATION
// ==========================================================================
// Toggle login/register views
window.showAuthView = function(view) {
  const registerView = document.getElementById('register-view');
  const loginView = document.getElementById('login-view');
  const recoveryView = document.getElementById('recovery-view');
  const resetPasswordView = document.getElementById('reset-password-view');

  // Hide all first
  if (registerView) registerView.classList.add('hidden');
  if (loginView) loginView.classList.add('hidden');
  if (recoveryView) recoveryView.classList.add('hidden');
  if (resetPasswordView) resetPasswordView.classList.add('hidden');

  if (view === 'register') {
    if (registerView) registerView.classList.remove('hidden');
  } else if (view === 'recovery') {
    if (recoveryView) recoveryView.classList.remove('hidden');
  } else if (view === 'reset') {
    if (resetPasswordView) resetPasswordView.classList.remove('hidden');
  } else {
    if (loginView) loginView.classList.remove('hidden');
  }
};

async function loadUserData(userId) {
  loggedInUserId = userId;
  
  try {
    // 1. Load settings (or insert default settings if not exists)
    let { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (settingsError) throw settingsError;

    if (!settings) {
      // Row not found, create default settings row
      const defaultSettings = {
        user_id: userId,
        salary_fabricio: 4000.00,
        salary_patricia: 2500.00,
        extra_income: 0.00,
        cards: ['Cartão Principal', 'Cartão Adicional', 'Pix / Débito', 'Dinheiro'],
        savings_goal_type: 'percentage',
        savings_goal_value: 15.00,
        budget_limits: {
          'Moradia': 2000,
          'Transporte': 1000,
          'Saúde': 500,
          'Alimentação': 1500,
          'Lanches': 200,
          'Alimentação Trabalho': 400,
          'Lazer & Assinaturas': 500,
          'Seguros & Proteção': 300,
          'Outros': 500
        }
      };

      const { data: newSettings, error: insertError } = await supabase
        .from('user_settings')
        .insert([defaultSettings])
        .select()
        .single();

      if (insertError) throw insertError;
      settings = newSettings;
    }

    // Load settings into global state
    state.salaryFabricio = parseFloat(settings.salary_fabricio) || 0;
    state.salaryPatricia = parseFloat(settings.salary_patricia) || 0;
    state.extraIncome = parseFloat(settings.extra_income) || 0;
    state.cards = settings.cards || [];
    state.savingsGoalType = settings.savings_goal_type || 'percentage';
    state.savingsGoalValue = parseFloat(settings.savings_goal_value) || 0;
    state.budgetLimits = settings.budget_limits || {};
    if (!state.budgetLimits._autoCategorizeRules) {
      state.budgetLimits._autoCategorizeRules = [];
    }

    // 2. Load fixed bills templates (or insert defaults if not exists)
    let { data: templates, error: templatesError } = await supabase
      .from('fixed_bills_templates')
      .select('*')
      .eq('user_id', userId);

    if (templatesError) throw templatesError;

    if (!templates || templates.length === 0) {
      // Insert default templates
      const defaults = defaultFixedBillsTemplate.map(bill => ({
        user_id: userId,
        name: bill.name,
        value: bill.value,
        due_date: bill.dueDate,
        card: bill.card
      }));

      const { data: newTemplates, error: insertTemplatesError } = await supabase
        .from('fixed_bills_templates')
        .insert(defaults)
        .select();

      if (insertTemplatesError) throw insertTemplatesError;
      templates = newTemplates;
    }

    state.fixedBillsTemplate = templates.map((t) => ({
      id: t.id,
      name: t.name,
      value: parseFloat(t.value) || 0,
      dueDate: t.due_date,
      card: t.card
    }));

    // 3. Load fixed bills for the current month
    await loadFixedBillsForMonth(state.currentMonth);

    // 4. Load ALL daily expenses
    let { data: expenses, error: expensesError } = await supabase
      .from('daily_expenses')
      .select('*')
      .eq('user_id', userId);

    if (expensesError) throw expensesError;

    state.dailyExpenses = (expenses || []).map(exp => ({
      id: exp.id,
      amount: parseFloat(exp.amount) || 0,
      date: exp.date,
      desc: exp.desc,
      category: exp.category,
      card: exp.card,
      specify: exp.specify || '',
      installmentGroupId: exp.installment_group_id,
      installmentIndex: exp.installment_index,
      installmentCount: exp.installment_count,
      tags: exp.tags || []
    }));

  } catch (err) {
    console.error('Erro ao carregar dados do Supabase:', err);
    alert('Erro ao sincronizar dados: ' + err.message);
  }
}

async function loadFixedBillsForMonth(monthKey) {
  if (!loggedInUserId) return;

  try {
    let { data: bills, error: billsError } = await supabase
      .from('fixed_bills')
      .select('*')
      .eq('user_id', loggedInUserId)
      .eq('month_key', monthKey);

    if (billsError) throw billsError;

    if (!bills || bills.length === 0) {
      // Generate them from templates
      const templates = state.fixedBillsTemplate || [];
      const newBills = templates.map(t => ({
        user_id: loggedInUserId,
        month_key: monthKey,
        name: t.name,
        value: t.value,
        due_date: t.dueDate,
        card: t.card,
        paid: false
      }));

      if (newBills.length > 0) {
        const { data: insertedBills, error: insertError } = await supabase
          .from('fixed_bills')
          .insert(newBills)
          .select();

        if (insertError) throw insertError;
        bills = insertedBills;
      }
    }

    state.fixedBills[monthKey] = (bills || []).map(bill => ({
      id: bill.id,
      name: bill.name,
      paid: bill.paid,
      value: parseFloat(bill.value) || 0,
      dueDate: bill.due_date,
      card: bill.card
    }));

  } catch (err) {
    console.error('Erro ao carregar contas fixas do mês:', err);
  }
}

function initApp() {
  // Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('Service Worker registrado com sucesso:', reg.scope))
        .catch(err => console.log('Erro ao registrar Service Worker:', err));
    });
  }

  // 1. Load Theme Preference
  const savedTheme = localStorage.getItem('erp_theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }

  // 2. Set current month if not set
  if (!state.currentMonth) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    state.currentMonth = `${year}-${month}`;
  }

  // 3. Setup Authentication Checks
  setupAuthentication();

  // 4. Setup page navigation tab listeners
  setupTabs();

  // 5. Setup month switching slider listeners
  setupMonthSlider();

  // 6. Setup Form submission listeners
  setupForms();

  // 7. Setup backup and settings triggers
  setupBackupActions();

  // 8.5 Setup theme toggle
  setupThemeToggle();

  // 8.6 Setup print action
  setupPrintAction();

  // 8.7 Setup simulator logic
  setupSimulator();

  // 8.8 Setup bank statement import logic
  setupImportStatement();

  // 8.9 Setup Voice Command
  setupVoiceCommand();

  // 8.10 Setup Online Sync
  setupOnlineSync();
}

function setupAuthentication() {
  const loginContainer = document.getElementById('login-container');
  const registerView = document.getElementById('register-view');
  const loginView = document.getElementById('login-view');

  if (!supabase) {
    console.error('Supabase client not initialized.');
    alert('Erro: SDK do Supabase não inicializado. Verifique suas chaves no topo de app.js.');
    return;
  }

  // Monitor Auth State Changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth event:', event, session);
    if (event === 'PASSWORD_RECOVERY') {
      // Show recovery password view inside the login container
      loginContainer.classList.remove('hidden');
      showAuthView('reset');
    } else if (session && session.user) {
      // User is logged in
      loginContainer.classList.add('hidden');
      // Load user data from Supabase
      await loadUserData(session.user.id);
      updateUI();
      setTimeout(renderCharts, 100);
    } else {
      // User is logged out
      loginContainer.classList.remove('hidden');
    }
  });

  // Bind register password form submit
  const registerForm = document.getElementById('register-password-form');
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('new-email').value.trim();
    const pwd = document.getElementById('new-password').value;
    const confirmPwd = document.getElementById('confirm-password').value;

    if (pwd.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (pwd !== confirmPwd) {
      alert('As senhas digitadas não coincidem.');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: pwd
      });

      if (error) throw error;

      alert('Cadastro realizado! Se a confirmação de e-mail estiver ativa, verifique sua caixa de entrada. Caso contrário, você já pode fazer login.');
      showAuthView('login');
    } catch (err) {
      console.error(err);
      alert('Erro no cadastro: ' + err.message);
    }
  });

  // Bind login password form submit
  const loginForm = document.getElementById('login-password-form');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('access-email').value.trim();
    const pwd = document.getElementById('access-password').value;
    const card = document.querySelector('.login-card');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: pwd
      });

      if (error) throw error;
    } catch (err) {
      console.error(err);
      card.classList.add('shake');
      setTimeout(() => card.classList.remove('shake'), 400);
      alert('Erro no login: ' + err.message);
    }
  });

  // Bind recovery form submit
  const recoveryForm = document.getElementById('recovery-form');
  if (recoveryForm) {
    recoveryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('recovery-email').value.trim();
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + window.location.pathname
        });
        if (error) throw error;
        alert('E-mail de recuperação enviado! Verifique sua caixa de entrada para redefinir sua senha.');
        showAuthView('login');
      } catch (err) {
        console.error(err);
        alert('Erro ao enviar e-mail de recuperação: ' + err.message);
      }
    });
  }

  // Bind reset password form submit
  const resetPasswordForm = document.getElementById('reset-password-form');
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPwd = document.getElementById('reset-new-password').value;
      const confirmNewPwd = document.getElementById('reset-confirm-password').value;

      if (newPwd.length < 6) {
        alert('A nova senha deve ter no mínimo 6 caracteres.');
        return;
      }
      if (newPwd !== confirmNewPwd) {
        alert('As senhas não coincidem.');
        return;
      }

      try {
        const { error } = await supabase.auth.updateUser({ password: newPwd });
        if (error) throw error;
        alert('Senha atualizada com sucesso! Você agora está logado no sistema.');
      } catch (err) {
        console.error(err);
        alert('Erro ao redefinir senha: ' + err.message);
      }
    });
  }
}

function saveState() {
  localStorage.setItem('home_erp_state', JSON.stringify(state));
}

// Check if fixed bills exist for the YYYY-MM key. If not, generate them from template.
function ensureMonthFixedBills(monthKey) {
  if (!state.fixedBills[monthKey]) {
    // Deep clone the template from state or fallback to default
    const template = (state.fixedBillsTemplate && state.fixedBillsTemplate.length > 0)
      ? state.fixedBillsTemplate
      : defaultFixedBillsTemplate;
    state.fixedBills[monthKey] = template.map(bill => ({
      ...bill,
      paid: false // always start unpaid for a new month
    }));
    saveState();
  } else {
    // Legacy migration: ensure bill.card is set for all bills
    let changed = false;
    state.fixedBills[monthKey].forEach(bill => {
      if (!bill.card) {
        bill.card = state.cards[2] || 'Pix / Débito';
        changed = true;
      }
    });
    if (changed) saveState();
  }
}

// ==========================================================================
// SPA NAVIGATION (TABS)
// ==========================================================================

function setupTabs() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const screens = document.querySelectorAll('.app-screen');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTabId = btn.getAttribute('data-tab');
      
      // Update buttons active state
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update screen active state
      screens.forEach(screen => {
        if (screen.id === targetTabId) {
          screen.classList.add('active');
        } else {
          screen.classList.remove('active');
        }
      });

      // Special action if going to Dashboard: recreate charts to avoid size issues
      if (targetTabId === 'dashboard-screen') {
        setTimeout(renderCharts, 100);
      }
      
      // If navigating to Daily screen, set the default date to today
      if (targetTabId === 'daily-screen') {
        const today = new Date().toISOString().substring(0, 10);
        document.getElementById('expense-date').value = today;
      }
    });
  });

  // FAB Quick Add Shortcut
  const fab = document.getElementById('quick-add-fab');
  if (fab) {
    fab.addEventListener('click', () => {
      // Find the normal daily screen tab button and click it
      const dailyBtn = document.querySelector('.nav-btn[data-tab="daily-screen"]');
      if (dailyBtn) dailyBtn.click();
    });
  }
}

window.switchTab = function(targetTabId) {
  const navButtons = document.querySelectorAll('.nav-btn');
  const screens = document.querySelectorAll('.app-screen');
  
  navButtons.forEach(b => {
    if (b.getAttribute('data-tab') === targetTabId) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  screens.forEach(screen => {
    if (screen.id === targetTabId) {
      screen.classList.add('active');
    } else {
      screen.classList.remove('active');
    }
  });

  if (targetTabId === 'dashboard-screen') {
    setTimeout(renderCharts, 100);
  }
  
  if (targetTabId === 'daily-screen') {
    const today = new Date().toISOString().substring(0, 10);
    const dateInput = document.getElementById('expense-date');
    if (dateInput) dateInput.value = today;
  }
};

window.checkPendingBillsAndNotify = function() {
  const activeMonth = state.currentMonth;
  const bills = state.fixedBills[activeMonth] || [];
  if (bills.length === 0) return;

  const today = new Date();
  const todayDay = today.getDate();
  const [yearStr, monthStr] = activeMonth.split('-');
  const currYear = parseInt(yearStr);
  const currMonth = parseInt(monthStr);
  
  const calendarTodayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  let overdueCount = 0;
  let upcomingCount = 0;

  bills.forEach(bill => {
    if (!bill.paid) {
      const dueDay = parseInt(bill.dueDate) || 0;
      if (activeMonth < calendarTodayStr) {
        overdueCount++;
      } else if (activeMonth === calendarTodayStr) {
        if (dueDay < todayDay) {
          overdueCount++;
        } else if (dueDay >= todayDay && dueDay <= todayDay + 3) {
          upcomingCount++;
        }
      }
    }
  });

  const banner = document.getElementById('bills-alert-banner');
  if (banner) {
    if (overdueCount > 0 || upcomingCount > 0) {
      let message = `⚠️ Você tem <strong>${overdueCount + upcomingCount} conta(s) pendente(s)</strong>: `;
      if (overdueCount > 0 && upcomingCount > 0) {
        message += `${overdueCount} vencida(s) e ${upcomingCount} vencendo em breve.`;
      } else if (overdueCount > 0) {
        message += `${overdueCount} vencida(s).`;
      } else {
        message += `${upcomingCount} vencendo nos próximos 3 dias.`;
      }
      banner.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>${message}</span>
        </div>
        <button class="btn-alert-link" onclick="switchTab('fixed-screen')">Ver Contas</button>
      `;
      banner.classList.remove('hidden');

      const lastNotify = sessionStorage.getItem('last_bill_notification');
      const now = Date.now();
      if (Notification.permission === 'granted' && (!lastNotify || now - parseInt(lastNotify) > 1800000)) {
        try {
          new Notification("Contas Pendentes - Finanças ERP", {
            body: `Você tem ${overdueCount + upcomingCount} conta(s) pendente(s). ${overdueCount} já vencida(s).`,
            icon: '/icon.png'
          });
          sessionStorage.setItem('last_bill_notification', now.toString());
        } catch (e) {
          console.warn("Falha ao disparar Notification:", e);
        }
      }
    } else {
      banner.classList.add('hidden');
    }
  }
};

// ==========================================================================
// MONTH SLIDER
// ==========================================================================

function setupMonthSlider() {
  const prevBtn = document.getElementById('prev-month-btn');
  const nextBtn = document.getElementById('next-month-btn');

  prevBtn.addEventListener('click', () => {
    changeMonth(-1);
  });

  nextBtn.addEventListener('click', () => {
    changeMonth(1);
  });
}

async function changeMonth(direction) {
  const [yearStr, monthStr] = state.currentMonth.split('-');
  let year = parseInt(yearStr);
  let month = parseInt(monthStr);

  month += direction;
  if (month > 12) {
    month = 1;
    year += 1;
  } else if (month < 1) {
    month = 12;
    year -= 1;
  }

  state.currentMonth = `${year}-${String(month).padStart(2, '0')}`;
  await loadFixedBillsForMonth(state.currentMonth);
  updateUI();
  
  // Re-render chart on month change
  renderCharts();
}

function formatMonthDisplay(monthKey) {
  const [year, month] = monthKey.split('-');
  const monthsBR = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${monthsBR[parseInt(month) - 1]} de ${year}`;
}

// ==========================================================================
// UI RENDERING - CORE FUNCTIONS
// ==========================================================================

function updateUI() {
  // Update header month title
  document.getElementById('current-month-display').textContent = formatMonthDisplay(state.currentMonth);

  // Render sub-components
  renderDashboardStats();
  renderFixedBills();
  if (typeof window.checkPendingBillsAndNotify === 'function') {
    window.checkPendingBillsAndNotify();
  }
  populateCardDropdowns();
  renderTags();
  renderDailyExpenses();
  renderSettingsData();
  renderBudgetLimitsDashboard();
  renderCharts();
  renderDivisionCalculator();
  renderInstallmentProjections();
  renderLongTermGoalsDashboard();
  if (typeof renderQuickTagsChips === 'function') {
    renderQuickTagsChips();
  }
  if (typeof window.renderImportHistory === 'function') {
    window.renderImportHistory();
  }
}

// Format numbers to currency (Real R$)
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// --------------------------------------------------------------------------
// 1. DASHBOARD SCREEN
// --------------------------------------------------------------------------

function renderDashboardStats() {
  const activeMonth = state.currentMonth;
  const income = (parseFloat(state.salaryFabricio) || 0) + (parseFloat(state.salaryPatricia) || 0) + (parseFloat(state.extraIncome) || 0);
  
  // 1. Calc fixed bills values
  const bills = state.fixedBills[activeMonth] || [];
  let totalFixed = 0;
  let paidFixedCount = 0;
  let totalPaidFixed = 0;

  bills.forEach(bill => {
    const val = parseFloat(bill.value) || 0;
    totalFixed += val;
    if (bill.paid) {
      paidFixedCount++;
      totalPaidFixed += val;
    }
  });

  // 2. Calc daily expenses values
  const dailyExpThisMonth = state.dailyExpenses.filter(exp => exp.date.substring(0, 7) === activeMonth);
  const totalDaily = dailyExpThisMonth.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

  // 3. Calc balance
  const balance = income - totalFixed - totalDaily;

  // Render elements
  document.getElementById('summary-income').textContent = formatCurrency(income);
  document.getElementById('income-subtitle').textContent = `F: ${formatCurrency(state.salaryFabricio || 0)} | P: ${formatCurrency(state.salaryPatricia || 0)} | E: ${formatCurrency(state.extraIncome || 0)}`;
  
  document.getElementById('summary-fixed').textContent = formatCurrency(totalFixed);
  document.getElementById('fixed-subtitle').textContent = `${paidFixedCount} de ${bills.length} pagas (${formatCurrency(totalPaidFixed)} pago)`;
  
  document.getElementById('summary-daily').textContent = formatCurrency(totalDaily);
  document.getElementById('daily-subtitle').textContent = `${dailyExpThisMonth.length} lançamentos diários`;

  const balanceElement = document.getElementById('summary-balance');
  balanceElement.textContent = formatCurrency(balance);
  
  // Balance visual status color
  if (balance < 0) {
    balanceElement.style.color = 'var(--danger)';
    document.getElementById('balance-subtitle').textContent = 'Orçamento estourado!';
  } else if (balance < (income * 0.1)) {
    balanceElement.style.color = 'var(--warning)';
    document.getElementById('balance-subtitle').textContent = 'Saldo abaixo de 10% da receita';
  } else {
    balanceElement.style.color = 'var(--success)';
    document.getElementById('balance-subtitle').textContent = 'Saldo positivo saudável';
  }

  // 4. Warning Alert Banner (80% of salaries limit check)
  const totalExpenses = totalFixed + totalDaily;
  const warningBanner = document.getElementById('income-alert-banner');
  if (warningBanner) {
    if (income > 0 && totalExpenses >= 0.8 * income) {
      const pct = Math.round((totalExpenses / income) * 100);
      warningBanner.innerHTML = `⚠️ <strong>Alerta de Orçamento:</strong> Seus gastos mensais (${formatCurrency(totalExpenses)}) atingiram <strong>${pct}%</strong> da sua renda combinada (${formatCurrency(income)})!`;
      warningBanner.classList.remove('hidden');
    } else {
      warningBanner.classList.add('hidden');
    }
  }

  // 5. Render Savings Goal Progress
  const goalType = state.savingsGoalType || 'percentage';
  const goalVal = parseFloat(state.savingsGoalValue) || 0;
  let targetGoalAmount = 0;
  
  if (goalType === 'percentage') {
    targetGoalAmount = income * (goalVal / 100);
  } else {
    targetGoalAmount = goalVal;
  }

  const savingsGoalSection = document.getElementById('savings-goal-section');
  if (savingsGoalSection) {
    if (targetGoalAmount <= 0) {
      savingsGoalSection.classList.add('hidden');
    } else {
      savingsGoalSection.classList.remove('hidden');
      
      const currentSaved = Math.max(0, balance);
      const goalPct = Math.min(100, Math.round((currentSaved / targetGoalAmount) * 100)) || 0;
      
      document.getElementById('savings-goal-ratio').textContent = `${formatCurrency(currentSaved)} / ${formatCurrency(targetGoalAmount)} (${goalPct}%)`;
      document.getElementById('savings-goal-fill').style.width = `${goalPct}%`;
      
      const subtitleEl = document.getElementById('savings-goal-subtitle');
      if (subtitleEl) {
        if (balance < 0) {
          subtitleEl.textContent = `Você está com saldo negativo este mês. Economize para começar a poupar!`;
          document.getElementById('savings-goal-fill').style.backgroundColor = 'var(--danger)';
        } else if (goalPct >= 100) {
          subtitleEl.innerHTML = `🎉 <strong>Parabéns!</strong> Você atingiu sua meta de poupança deste mês!`;
          document.getElementById('savings-goal-fill').style.backgroundColor = 'var(--success)';
        } else {
          const remaining = targetGoalAmount - currentSaved;
          subtitleEl.textContent = `Faltam ${formatCurrency(remaining)} para atingir sua meta de economia de ${goalType === 'percentage' ? `${goalVal}%` : formatCurrency(goalVal)}.`;
          document.getElementById('savings-goal-fill').style.backgroundColor = 'var(--primary)';
        }
      }
    }
  }
}

// Render dynamic progress bars for expense limits
function renderBudgetLimitsDashboard() {
  const activeMonth = state.currentMonth;
  const container = document.getElementById('budget-progress-container');
  container.innerHTML = '';

  const categories = Object.keys(state.budgetLimits).filter(k => !k.startsWith('_'));
  
  categories.forEach(cat => {
    const limit = parseFloat(state.budgetLimits[cat]) || 0;
    if (limit === 0) return; // skip if no limit set

    // Get daily expenses for this category
    const dailyThisMonth = state.dailyExpenses.filter(exp => 
      exp.date.substring(0, 7) === activeMonth && exp.category === cat
    );
    let totalSpent = dailyThisMonth.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

    // If it's the Moradia category, we also add the fixed bills related to housing:
    // (💧 Água, ⚡ Luz, 🏠 Parcela Financiamento Casa, 🏢 Condomínio, ☀️ Luz Solar)
    if (cat === 'Moradia') {
      const housingBills = ['💧 Água', '⚡ Luz', '🏠 Parcela Financiamento Casa', '🏢 Condomínio', '☀️ Luz Solar'];
      const bills = state.fixedBills[activeMonth] || [];
      bills.forEach(bill => {
        if (housingBills.includes(bill.name)) {
          totalSpent += parseFloat(bill.value) || 0;
        }
      });
    }
    
    // If it's Transporte category, add car financing:
    if (cat === 'Transporte') {
      const transportBills = ['🚗 Financiamento Carro'];
      const bills = state.fixedBills[activeMonth] || [];
      bills.forEach(bill => {
        if (transportBills.includes(bill.name)) {
          totalSpent += parseFloat(bill.value) || 0;
        }
      });
    }

    // If it's Saúde category, add Health Plan:
    if (cat === 'Saúde') {
      const healthBills = ['🏥 Plano de Saúde'];
      const bills = state.fixedBills[activeMonth] || [];
      bills.forEach(bill => {
        if (healthBills.includes(bill.name)) {
          totalSpent += parseFloat(bill.value) || 0;
        }
      });
    }

    // If it's Seguros & Proteção category, add Life Insurance:
    if (cat === 'Seguros & Proteção') {
      const insuranceBills = ['🛡️ Seguro de Vida'];
      const bills = state.fixedBills[activeMonth] || [];
      bills.forEach(bill => {
        if (insuranceBills.includes(bill.name)) {
          totalSpent += parseFloat(bill.value) || 0;
        }
      });
    }

    const percentage = Math.round((totalSpent / limit) * 100) || 0;
    
    let statusClass = 'normal';
    if (percentage >= 70 && percentage < 90) {
      statusClass = 'warning';
    } else if (percentage >= 90) {
      statusClass = 'danger';
    }

    const itemHTML = `
      <div class="budget-item">
        <div class="budget-info">
          <span class="budget-category">${cat}</span>
          <span class="budget-values">${formatCurrency(totalSpent)} / ${formatCurrency(limit)} (${percentage}%)</span>
        </div>
        <div class="budget-bar-track">
          <div class="budget-bar-fill ${statusClass}" style="width: ${Math.min(percentage, 100)}%"></div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', itemHTML);
  });
}

// --------------------------------------------------------------------------
// 2. FIXED BILLS SCREEN
// --------------------------------------------------------------------------

function renderFixedBills() {
  const activeMonth = state.currentMonth;
  const bills = state.fixedBills[activeMonth] || [];
  const listContainer = document.getElementById('fixed-bills-list');
  listContainer.innerHTML = '';

  let paidCount = 0;
  
  // Sort bills: unpaid first, paid last
  const sortedBills = [...bills].sort((a, b) => a.paid - b.paid);

  sortedBills.forEach(bill => {
    if (bill.paid) paidCount++;
    
    // Generate options dynamically
    let cardOptions = '';
    state.cards.forEach(c => {
      cardOptions += `<option value="${c}" ${bill.card === c ? 'selected' : ''}>${c}</option>`;
    });

    const cardHTML = `
      <div class="bill-item-card ${bill.paid ? 'paid' : ''}" data-id="${bill.id}">
        <div class="bill-checkbox-label">
          <input type="checkbox" class="bill-checkbox" ${bill.paid ? 'checked' : ''} onchange="toggleBillPaid('${bill.id}', this.checked)">
          <span class="bill-checkbox-custom"></span>
        </div>
        
        <div class="bill-item-info">
          <div class="bill-name-wrapper">
            <span class="bill-name">${bill.name}</span>
          </div>
          <span class="bill-due-date">Vence dia ${bill.dueDate}</span>
        </div>
        
        <div class="bill-payment-details">
          <select class="bill-card-select" onchange="updateBillCard('${bill.id}', this.value)">
            ${cardOptions}
          </select>
          <div class="bill-value-input-wrapper">
            <span>R$</span>
            <input type="number" step="0.01" class="bill-value-field" value="${bill.value.toFixed(2)}" 
                   onchange="updateBillValue('${bill.id}', this.value)" 
                   inputmode="decimal">
          </div>
        </div>
      </div>
    `;
    listContainer.insertAdjacentHTML('beforeend', cardHTML);
  });

  // Update progress bar
  const percent = bills.length > 0 ? Math.round((paidCount / bills.length) * 100) : 0;
  document.getElementById('fixed-progress-percent').textContent = `${percent}%`;
  document.getElementById('fixed-progress-fill').style.width = `${percent}%`;
}

// Global functions for inline trigger
window.toggleBillPaid = async function(billId, isPaid) {
  const activeMonth = state.currentMonth;
  const bills = state.fixedBills[activeMonth] || [];
  const bill = bills.find(b => b.id === billId);
  if (bill) {
    try {
      const { error } = await supabase
        .from('fixed_bills')
        .update({ paid: isPaid })
        .eq('id', billId)
        .eq('user_id', loggedInUserId);

      if (error) throw error;

      bill.paid = isPaid;
      
      // Smooth transition: render stats and update fixed list
      renderDashboardStats();
      renderBudgetLimitsDashboard();
      renderCharts();
      
      // Quick rerender of fixed list (re-sorting paid items to the bottom)
      setTimeout(renderFixedBills, 200); 
    } catch (err) {
      console.error('Erro ao atualizar status do pagamento:', err);
      alert('Erro ao atualizar status do pagamento: ' + err.message);
      // Revert checkbox state
      const checkbox = document.querySelector(`.bill-item-card[data-id="${billId}"] .bill-checkbox`);
      if (checkbox) checkbox.checked = !isPaid;
    }
  }
};

window.updateBillValue = async function(billId, rawValue) {
  const activeMonth = state.currentMonth;
  const bills = state.fixedBills[activeMonth] || [];
  const bill = bills.find(b => b.id === billId);
  if (bill) {
    const parsedVal = parseFloat(rawValue) || 0;
    try {
      const { error } = await supabase
        .from('fixed_bills')
        .update({ value: parsedVal })
        .eq('id', billId)
        .eq('user_id', loggedInUserId);

      if (error) throw error;

      bill.value = parsedVal;
      renderDashboardStats();
      renderBudgetLimitsDashboard();
      renderFixedBills();
      renderCharts();
    } catch (err) {
      console.error('Erro ao atualizar valor da conta:', err);
      alert('Erro ao atualizar valor da conta: ' + err.message);
    }
  }
};

window.updateBillCard = async function(billId, rawCard) {
  const activeMonth = state.currentMonth;
  const bills = state.fixedBills[activeMonth] || [];
  const bill = bills.find(b => b.id === billId);
  if (bill) {
    try {
      const { error } = await supabase
        .from('fixed_bills')
        .update({ card: rawCard })
        .eq('id', billId)
        .eq('user_id', loggedInUserId);

      if (error) throw error;

      bill.card = rawCard;
      renderDashboardStats();
      renderBudgetLimitsDashboard();
      renderCharts();
      renderFixedBills();
    } catch (err) {
      console.error('Erro ao atualizar cartão da conta:', err);
      alert('Erro ao atualizar cartão da conta: ' + err.message);
    }
  }
};

// --------------------------------------------------------------------------
// 3. DAILY EXPENSES SCREEN
// --------------------------------------------------------------------------

function populateCardDropdowns() {
  const cardSelect = document.getElementById('expense-card');
  const filterCardSelect = document.getElementById('filter-card');
  
  if (!cardSelect || !filterCardSelect) return;

  // Clear options
  cardSelect.innerHTML = '';
  filterCardSelect.innerHTML = '<option value="all">Todos Cartões</option>';

  state.cards.forEach(cardName => {
    // Expense form select dropdown
    const option = document.createElement('option');
    option.value = cardName;
    option.textContent = cardName;
    cardSelect.appendChild(option);

    // Filter select dropdown
    const filterOption = document.createElement('option');
    filterOption.value = cardName;
    filterOption.textContent = cardName;
    filterCardSelect.appendChild(filterOption);
  });
}

function renderDailyExpenses() {
  const activeMonth = state.currentMonth;
  const container = document.getElementById('transaction-list');
  container.innerHTML = '';

  const filterCategory = document.getElementById('filter-category').value;
  const filterCard = document.getElementById('filter-card').value;
  const filterTagSelect = document.getElementById('filter-tag');
  const filterTag = filterTagSelect ? filterTagSelect.value : 'all';
  const searchEl = document.getElementById('search-expense');
  const searchVal = searchEl ? searchEl.value.toLowerCase().trim() : '';

  // Filter daily expenses for active month
  let filtered = state.dailyExpenses.filter(exp => exp.date.substring(0, 7) === activeMonth);

  // Apply selectors
  if (filterCategory !== 'all') {
    filtered = filtered.filter(exp => exp.category === filterCategory);
  }
  if (filterCard !== 'all') {
    filtered = filtered.filter(exp => exp.card === filterCard);
  }
  if (filterTag !== 'all') {
    filtered = filtered.filter(exp => {
      const descTags = exp.desc.match(/#[a-zA-Z0-9_]+/g) || [];
      const dedicatedTags = exp.tags ? (Array.isArray(exp.tags) ? exp.tags : exp.tags.split(/\s+/)) : [];
      const allTags = [...descTags, ...dedicatedTags];
      return allTags.includes(filterTag);
    });
  }
  if (searchVal) {
    filtered = filtered.filter(exp => {
      const descMatch = exp.desc.toLowerCase().includes(searchVal);
      const specifyMatch = exp.specify ? exp.specify.toLowerCase().includes(searchVal) : false;
      const tagsMatch = exp.tags ? (Array.isArray(exp.tags) ? exp.tags.join(' ') : exp.tags).toLowerCase().includes(searchVal) : false;
      return descMatch || specifyMatch || tagsMatch;
    });
  }

  // Sort by date descending, then ID descending
  filtered.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state">Nenhum gasto diário registrado para este mês.</div>';
    return;
  }

  // Render grouped by date
  let lastDate = '';
  filtered.forEach(exp => {
    const expDateFormatted = exp.date.split('-').reverse().join('/');
    
    if (exp.date !== lastDate) {
      const dateHeader = document.createElement('div');
      dateHeader.className = 'tx-group-date';
      dateHeader.textContent = expDateFormatted;
      container.appendChild(dateHeader);
      lastDate = exp.date;
    }

    // Highlight hashtags in description
    const highlightedDesc = exp.desc.replace(/(#[a-zA-Z0-9_]+)/g, '<span class="hashtag-highlight">$1</span>');

    const itemHTML = `
      <div class="tx-item">
        <div class="tx-details">
          <span class="tx-desc">${highlightedDesc}</span>
          <div class="tx-meta">
            <span class="tx-cat-tag">${exp.category === 'Outros' && exp.specify ? `⚙️ Outros (${exp.specify})` : exp.category}</span>
            <span class="tx-card-tag">💳 ${exp.card}</span>
          </div>
        </div>
        <div class="tx-amount-actions">
          <span class="tx-amount">${formatCurrency(exp.amount)}</span>
          <div class="tx-actions">
            <button class="tx-action-btn" title="Editar" onclick="editExpense('${exp.id}')">✏️</button>
            <button class="tx-action-btn" title="Excluir" style="color: var(--danger)" onclick="deleteExpense('${exp.id}')">🗑️</button>
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', itemHTML);
  });
}

// Global functions for delete/edit actions
window.deleteExpense = async function(id) {
  const exp = state.dailyExpenses.find(e => e.id === id);
  if (!exp) return;

  if (exp.installmentGroupId) {
    const cleanDesc = exp.desc.replace(/\s*\[\d+\/\d+\]$/, '');
    const option = await showConfirmModal(
      `Esta é uma compra parcelada "${cleanDesc}" (parcela ${exp.installmentIndex} de ${exp.installmentCount}). Como deseja prosseguir com a exclusão?`,
      {
        title: 'Excluir Parcelamento',
        buttons: ['Excluir Todo o Grupo', 'Excluir Apenas Esta Parcela', 'Cancelar']
      }
    );
    
    if (option === 0) {
      try {
        const { error } = await supabase
          .from('daily_expenses')
          .delete()
          .eq('installment_group_id', exp.installmentGroupId)
          .eq('user_id', loggedInUserId);

        if (error) throw error;
        
        state.dailyExpenses = state.dailyExpenses.filter(e => e.installmentGroupId !== exp.installmentGroupId);
        updateUI();
        showToast('Todo o grupo de parcelas foi excluído com sucesso!', 'success');
      } catch (err) {
        console.error('Erro ao excluir parcelas:', err);
        showToast('Erro ao excluir parcelas: ' + err.message, 'danger');
      }
    } else if (option === 1) {
      try {
        const { error } = await supabase
          .from('daily_expenses')
          .delete()
          .eq('id', id)
          .eq('user_id', loggedInUserId);

        if (error) throw error;

        state.dailyExpenses = state.dailyExpenses.filter(e => e.id !== id);
        updateUI();
        showToast('Apenas esta parcela foi excluída com sucesso!', 'success');
      } catch (err) {
        console.error('Erro ao excluir parcela:', err);
        showToast('Erro ao excluir parcela: ' + err.message, 'danger');
      }
    }
  } else {
    if (await showConfirmModal('Tem certeza que deseja excluir este lançamento?', { title: 'Excluir Lançamento' })) {
      try {
        const { error } = await supabase
          .from('daily_expenses')
          .delete()
          .eq('id', id)
          .eq('user_id', loggedInUserId);

        if (error) throw error;

        state.dailyExpenses = state.dailyExpenses.filter(e => e.id !== id);
        updateUI();
        showToast('Lançamento excluído com sucesso!', 'success');
      } catch (err) {
        console.error('Erro ao excluir lançamento:', err);
        showToast('Erro ao excluir lançamento: ' + err.message, 'danger');
      }
    }
  }
};

window.editExpense = function(id) {
  const exp = state.dailyExpenses.find(e => e.id === id);
  if (!exp) return;

  // Populate form fields
  document.getElementById('edit-expense-id').value = exp.id;
  document.getElementById('expense-amount').value = exp.amount;
  document.getElementById('expense-date').value = exp.date;
  document.getElementById('expense-desc').value = exp.desc;
  document.getElementById('expense-category').value = exp.category;
  document.getElementById('expense-card').value = exp.card;

  // Populate specify field and trigger visibility
  const specifyGroup = document.getElementById('specify-others-group');
  const specifyInput = document.getElementById('expense-specify');
  if (exp.category === 'Outros') {
    specifyInput.value = exp.specify || '';
    specifyGroup.classList.remove('hidden');
    specifyInput.setAttribute('required', 'required');
  } else {
    specifyInput.value = '';
    specifyGroup.classList.add('hidden');
    specifyInput.removeAttribute('required');
  }

  // Handle installment checkbox state during edit
  const isInstallmentCheckbox = document.getElementById('expense-is-installment');
  const installmentGroup = document.getElementById('installment-group');
  const installmentsInput = document.getElementById('expense-installments');
  if (isInstallmentCheckbox && installmentGroup) {
    if (exp.installmentGroupId) {
      isInstallmentCheckbox.checked = true;
      isInstallmentCheckbox.disabled = true;
      installmentGroup.classList.remove('hidden');
      if (installmentsInput) {
        installmentsInput.value = exp.installmentCount;
        installmentsInput.disabled = true;
      }
    } else {
      isInstallmentCheckbox.checked = false;
      isInstallmentCheckbox.disabled = false;
      installmentGroup.classList.add('hidden');
      if (installmentsInput) {
        installmentsInput.value = '2';
        installmentsInput.disabled = false;
      }
    }
  }

  // Populate tags input
  const tagsInput = document.getElementById('expense-tags');
  if (tagsInput) {
    tagsInput.value = exp.tags ? (Array.isArray(exp.tags) ? exp.tags.join(' ') : exp.tags) : '';
  }
  if (typeof updateActiveChips === 'function') {
    updateActiveChips();
  }

  // Scroll to top of daily screen form
  document.querySelector('.input-form-card').scrollIntoView({ behavior: 'smooth' });

  // Update button layouts
  document.getElementById('submit-expense-btn').textContent = 'Salvar Alterações';
  document.getElementById('cancel-edit-btn').classList.remove('hidden');
  const clearFormBtn = document.getElementById('clear-form-btn');
  if (clearFormBtn) {
    clearFormBtn.classList.add('hidden');
  }
};

// --------------------------------------------------------------------------
// 4. SETTINGS & ADJUSTMENTS SCREEN
// --------------------------------------------------------------------------

function renderSettingsData() {
  // Populate monthly salaries & extra
  document.getElementById('setting-salary-fabricio').value = state.salaryFabricio || 0;
  document.getElementById('setting-salary-patricia').value = state.salaryPatricia || 0;
  document.getElementById('setting-extra-income').value = state.extraIncome || 0;

  // Populate card names inputs
  for (let i = 0; i < 4; i++) {
    const cardInput = document.getElementById(`card-name-${i + 1}`);
    if (cardInput) {
      cardInput.value = state.cards[i] || '';
    }
  }

  // Populate savings goal inputs
  const goalTypeSelect = document.getElementById('setting-savings-type');
  if (goalTypeSelect) {
    goalTypeSelect.value = state.savingsGoalType || 'percentage';
  }
  const goalValueInput = document.getElementById('setting-savings-value');
  if (goalValueInput) {
    goalValueInput.value = state.savingsGoalValue || 0;
  }

  // Populate budget limits inputs
  document.getElementById('limit-moradia').value = state.budgetLimits['Moradia'] || 0;
  document.getElementById('limit-transporte').value = state.budgetLimits['Transporte'] || 0;
  document.getElementById('limit-saude').value = state.budgetLimits['Saúde'] || 0;
  document.getElementById('limit-alimentacao').value = state.budgetLimits['Alimentação'] || 0;
  document.getElementById('limit-lanches').value = state.budgetLimits['Lanches'] || 0;
  document.getElementById('limit-alimentacao-trabalho').value = state.budgetLimits['Alimentação Trabalho'] || 0;
  document.getElementById('limit-lazer').value = state.budgetLimits['Lazer & Assinaturas'] || 0;
  document.getElementById('limit-seguros').value = state.budgetLimits['Seguros & Proteção'] || 0;
  document.getElementById('limit-outros').value = state.budgetLimits['Outros'] || 0;
  if (typeof renderFixedBillsTemplateList === 'function') {
    renderFixedBillsTemplateList();
  }
  if (typeof renderLongTermGoalsSettings === 'function') {
    renderLongTermGoalsSettings();
  }
  if (typeof renderCustomRulesSettings === 'function') {
    renderCustomRulesSettings();
  }
}

// ==========================================================================
// FORMS SUBMISSION LOGIC
// ==========================================================================

function addMonths(dateStr, monthsToAdd) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1 + monthsToAdd, day);
  
  const expectedMonth = (month - 1 + monthsToAdd) % 12;
  const targetYear = year + Math.floor((month - 1 + monthsToAdd) / 12);
  
  if (d.getMonth() !== expectedMonth) {
    const lastDay = new Date(targetYear, expectedMonth + 1, 0).getDate();
    return `${targetYear}-${String(expectedMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  }
  
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function setupForms() {
  // Toggle installment view fields
  const isInstallmentCheckbox = document.getElementById('expense-is-installment');
  const installmentGroup = document.getElementById('installment-group');
  const installmentsInput = document.getElementById('expense-installments');
  
  if (isInstallmentCheckbox && installmentGroup) {
    isInstallmentCheckbox.addEventListener('change', () => {
      if (isInstallmentCheckbox.checked) {
        installmentGroup.classList.remove('hidden');
        installmentsInput.setAttribute('required', 'required');
      } else {
        installmentGroup.classList.add('hidden');
        installmentsInput.removeAttribute('required');
      }
    });
  }

  // 1. GASTOS DIÁRIOS SUBMIT FORM
  const expenseForm = document.getElementById('expense-form');
  expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('edit-expense-id').value;
    const amount = parseFloat(document.getElementById('expense-amount').value) || 0;
    const date = document.getElementById('expense-date').value;
    const desc = document.getElementById('expense-desc').value;
    const category = document.getElementById('expense-category').value;
    const card = document.getElementById('expense-card').value;
    const specify = document.getElementById('expense-specify').value.trim();
    
    const tagsVal = document.getElementById('expense-tags') ? document.getElementById('expense-tags').value.trim() : '';
    let tags = [];
    if (tagsVal) {
      tags = tagsVal.split(/[\s,]+/).map(t => {
        let tag = t.trim();
        if (tag && !tag.startsWith('#')) {
          tag = '#' + tag;
        }
        return tag;
      }).filter(t => t.length > 1);
    }
    
    const isInstallment = isInstallmentCheckbox ? isInstallmentCheckbox.checked : false;
    const installmentsCount = isInstallment ? parseInt(installmentsInput.value) || 2 : 1;

    if (amount <= 0) {
      alert('Por favor, insira um valor válido acima de zero.');
      return;
    }

    if (!loggedInUserId) {
      alert('Você precisa estar logado para realizar lançamentos.');
      return;
    }

    if (id) {
      // Edit mode
      const expIdx = state.dailyExpenses.findIndex(exp => exp.id === id);
      if (expIdx !== -1) {
        const currentExp = state.dailyExpenses[expIdx];
        const updatedExp = { 
          ...currentExp,
          amount, 
          date, 
          desc, 
          category, 
          card, 
          specify,
          tags
        };
        
        try {
          const { error } = await supabase
            .from('daily_expenses')
            .update({
              amount,
              date,
              desc,
              category,
              card,
              specify,
              tags
            })
            .eq('id', id)
            .eq('user_id', loggedInUserId);
            
          if (error) throw error;
          
          state.dailyExpenses[expIdx] = updatedExp;
          resetExpenseForm();
          updateUI();
        } catch (err) {
          console.error('Erro ao atualizar lançamento:', err);
          alert('Erro ao atualizar lançamento: ' + err.message);
        }
      }
    } else {
      // New item mode
      if (isInstallment && installmentsCount > 1) {
        const installmentGroupId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        const tempExpenses = [];
        const dbExpenses = [];
        
        for (let i = 0; i < installmentsCount; i++) {
          const newId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5) + `_p${i}`;
          const installmentDate = addMonths(date, i);
          const installmentDesc = `${desc} [${i + 1}/${installmentsCount}]`;
          
          tempExpenses.push({
            id: newId,
            amount,
            date: installmentDate,
            desc: installmentDesc,
            category,
            card,
            specify,
            installmentGroupId,
            installmentIndex: i + 1,
            installmentCount: installmentsCount,
            tags
          });
          
          dbExpenses.push({
            id: newId,
            user_id: loggedInUserId,
            amount,
            date: installmentDate,
            desc: installmentDesc,
            category,
            card,
            specify,
            installment_group_id: installmentGroupId,
            installment_index: i + 1,
            installment_count: installmentsCount,
            tags
          });
        }
        
        try {
          const { error } = await supabase
            .from('daily_expenses')
            .insert(dbExpenses);
            
          if (error) throw error;
          
          state.dailyExpenses.push(...tempExpenses);
          resetExpenseForm();
          updateUI();
        } catch (err) {
          console.error('Erro ao inserir parcelas:', err);
          alert('Erro ao inserir parcelas: ' + err.message);
        }
      } else {
        const newId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        const newExp = {
          id: newId,
          amount,
          date,
          desc,
          category,
          card,
          specify,
          tags
        };
        
        try {
          const { error } = await supabase
            .from('daily_expenses')
            .insert([{
              id: newId,
              user_id: loggedInUserId,
              amount,
              date,
              desc,
              category,
              card,
              specify,
              tags
            }]);
            
          if (error) throw error;
          
          state.dailyExpenses.push(newExp);
          resetExpenseForm();
          updateUI();
        } catch (err) {
          console.error('Erro ao inserir lançamento:', err);
          alert('Erro ao inserir lançamento: ' + err.message);
        }
      }
    }
  });

  // Dynamic show/hide specifying input for Outros
  const categorySelect = document.getElementById('expense-category');
  const specifyGroup = document.getElementById('specify-others-group');
  categorySelect.addEventListener('change', () => {
    if (categorySelect.value === 'Outros') {
      specifyGroup.classList.remove('hidden');
      document.getElementById('expense-specify').setAttribute('required', 'required');
    } else {
      specifyGroup.classList.add('hidden');
      document.getElementById('expense-specify').removeAttribute('required');
      document.getElementById('expense-specify').value = '';
    }
  });

  // Cancel edit button click listener
  const cancelBtn = document.getElementById('cancel-edit-btn');
  cancelBtn.addEventListener('click', () => {
    resetExpenseForm();
  });

  // Clear/Cancel form button click listener
  const clearBtn = document.getElementById('clear-form-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      resetExpenseForm();
    });
  }

  const tagsInput = document.getElementById('expense-tags');
  if (tagsInput) {
    tagsInput.addEventListener('input', updateActiveChips);
  }

  // 2. SETTINGS GENERAL SUBMIT FORM
  const settingsForm = document.getElementById('settings-form');
  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!loggedInUserId) {
      alert('Você precisa estar logado para salvar as configurações.');
      return;
    }

    // Income
    state.salaryFabricio = parseFloat(document.getElementById('setting-salary-fabricio').value) || 0;
    state.salaryPatricia = parseFloat(document.getElementById('setting-salary-patricia').value) || 0;
    state.extraIncome = parseFloat(document.getElementById('setting-extra-income').value) || 0;

    // Savings Goal
    state.savingsGoalType = document.getElementById('setting-savings-type').value;
    state.savingsGoalValue = parseFloat(document.getElementById('setting-savings-value').value) || 0;

    // Card Names
    const newCards = [];
    for (let i = 1; i <= 4; i++) {
      const val = document.getElementById(`card-name-${i}`).value.trim();
      if (val) {
        newCards.push(val);
      }
    }
    if (newCards.length === 0) {
      state.cards = ['Cartão Principal', 'Pix / Débito', 'Dinheiro'];
    } else {
      state.cards = newCards;
    }

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: loggedInUserId,
          salary_fabricio: state.salaryFabricio,
          salary_patricia: state.salaryPatricia,
          extra_income: state.extraIncome,
          cards: state.cards,
          savings_goal_type: state.savingsGoalType,
          savings_goal_value: state.savingsGoalValue,
          budget_limits: state.budgetLimits
        });

      if (error) throw error;
      
      updateUI();
      alert('Configurações salvas com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar configurações no Supabase:', err);
      alert('Erro ao salvar configurações: ' + err.message);
    }
  });

  // 3. BUDGET LIMITS SUBMIT FORM
  const budgetForm = document.getElementById('budget-goals-form');
  budgetForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!loggedInUserId) {
      alert('Você precisa estar logado para salvar os limites.');
      return;
    }

    state.budgetLimits = {
      'Moradia': parseFloat(document.getElementById('limit-moradia').value) || 0,
      'Transporte': parseFloat(document.getElementById('limit-transporte').value) || 0,
      'Saúde': parseFloat(document.getElementById('limit-saude').value) || 0,
      'Alimentação': parseFloat(document.getElementById('limit-alimentacao').value) || 0,
      'Lanches': parseFloat(document.getElementById('limit-lanches').value) || 0,
      'Alimentação Trabalho': parseFloat(document.getElementById('limit-alimentacao-trabalho').value) || 0,
      'Lazer & Assinaturas': parseFloat(document.getElementById('limit-lazer').value) || 0,
      'Seguros & Proteção': parseFloat(document.getElementById('limit-seguros').value) || 0,
      'Outros': parseFloat(document.getElementById('limit-outros').value) || 0
    };

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: loggedInUserId,
          salary_fabricio: state.salaryFabricio,
          salary_patricia: state.salaryPatricia,
          extra_income: state.extraIncome,
          cards: state.cards,
          savings_goal_type: state.savingsGoalType,
          savings_goal_value: state.savingsGoalValue,
          budget_limits: state.budgetLimits
        });

      if (error) throw error;

      updateUI();
      alert('Metas de orçamento salvas com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar limites no Supabase:', err);
      alert('Erro ao salvar limites de orçamento: ' + err.message);
    }
  });

  // Filter dynamic updates
  document.getElementById('filter-category').addEventListener('change', renderDailyExpenses);
  document.getElementById('filter-card').addEventListener('change', renderDailyExpenses);
  const filterTagEl = document.getElementById('filter-tag');
  if (filterTagEl) {
    filterTagEl.addEventListener('change', renderDailyExpenses);
  }
  const searchExpenseEl = document.getElementById('search-expense');
  if (searchExpenseEl) {
    searchExpenseEl.addEventListener('input', renderDailyExpenses);
  }

  // 3.5 FIXED BILLS TEMPLATE FORM & BUTTONS
  const addTemplateBtn = document.getElementById('add-template-item-btn');
  if (addTemplateBtn) {
    addTemplateBtn.addEventListener('click', () => {
      if (!state.fixedBillsTemplate) {
        state.fixedBillsTemplate = [];
      }
      state.fixedBillsTemplate.push({
        id: 'f-custom-' + Date.now().toString(36),
        name: '🆕 Nova Conta',
        paid: false,
        value: 100.00,
        dueDate: '10',
        card: state.cards[0] || 'Cartão Principal'
      });
      renderFixedBillsTemplateList();
    });
  }

  const templateForm = document.getElementById('fixed-bills-template-form');
  if (templateForm) {
    templateForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!loggedInUserId) {
        alert('Você precisa estar logado para salvar modelos.');
        return;
      }

      const rows = document.querySelectorAll('.template-bill-row');
      const newTemplate = [];
      const dbTemplates = [];
      
      rows.forEach(row => {
        const name = row.querySelector('.template-name').value.trim();
        const value = parseFloat(row.querySelector('.template-value').value) || 0;
        const dueDate = row.querySelector('.template-due').value.trim();
        const card = row.querySelector('.template-card').value;
        const index = parseInt(row.getAttribute('data-index'));
        
        const oldId = state.fixedBillsTemplate[index] ? state.fixedBillsTemplate[index].id : 'f-custom-' + Math.random().toString(36).substr(2, 5);
        
        newTemplate.push({
          id: oldId,
          name,
          paid: false,
          value,
          dueDate: String(dueDate).padStart(2, '0'),
          card
        });

        const dbTemplateRow = {
          user_id: loggedInUserId,
          name,
          value,
          due_date: String(dueDate).padStart(2, '0'),
          card
        };
        
        if (oldId && oldId.length === 36 && oldId.includes('-') && !oldId.startsWith('f-custom-')) {
          dbTemplateRow.id = oldId;
        }
        
        dbTemplates.push(dbTemplateRow);
      });
      
      try {
        const { error: deleteError } = await supabase
          .from('fixed_bills_templates')
          .delete()
          .eq('user_id', loggedInUserId);

        if (deleteError) throw deleteError;

        if (dbTemplates.length > 0) {
          const { data: insertedTemplates, error: insertError } = await supabase
            .from('fixed_bills_templates')
            .insert(dbTemplates)
            .select();

          if (insertError) throw insertError;
          
          state.fixedBillsTemplate = insertedTemplates.map(t => ({
            id: t.id,
            name: t.name,
            value: parseFloat(t.value) || 0,
            dueDate: t.due_date,
            card: t.card
          }));
        } else {
          state.fixedBillsTemplate = [];
        }

        updateUI();
        alert('Modelos de contas fixas salvos com sucesso!');
      } catch (err) {
        console.error('Erro ao salvar modelos no Supabase:', err);
        alert('Erro ao salvar modelos: ' + err.message);
      }
    });
  }

  // 3.6 LONG-TERM GOALS FORM & BUTTONS
  const addGoalBtn = document.getElementById('add-goal-btn');
  if (addGoalBtn) {
    addGoalBtn.addEventListener('click', () => {
      if (!state.budgetLimits) state.budgetLimits = {};
      if (!state.budgetLimits._savingsGoals) state.budgetLimits._savingsGoals = [];
      
      state.budgetLimits._savingsGoals.push({
        id: 'g-custom-' + Date.now().toString(36),
        name: '🎯 Novo Objetivo',
        target: 1000.00,
        current: 0.00
      });
      renderLongTermGoalsSettings();
    });
  }

  const goalsForm = document.getElementById('long-term-goals-form');
  if (goalsForm) {
    goalsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!loggedInUserId) {
        alert('Você precisa estar logado para salvar os objetivos.');
        return;
      }

      const rows = document.querySelectorAll('#settings-goals-container .template-bill-row');
      const newGoals = [];
      
      rows.forEach(row => {
        const name = row.querySelector('.goal-name').value.trim();
        const target = parseFloat(row.querySelector('.goal-target').value) || 0;
        const current = parseFloat(row.querySelector('.goal-current').value) || 0;
        const index = parseInt(row.getAttribute('data-index'));
        
        const oldId = state.budgetLimits._savingsGoals[index] ? state.budgetLimits._savingsGoals[index].id : 'g-custom-' + Math.random().toString(36).substr(2, 5);
        
        newGoals.push({
          id: oldId,
          name,
          target,
          current
        });
      });
      
      state.budgetLimits._savingsGoals = newGoals;
      
      try {
        const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: loggedInUserId,
            salary_fabricio: state.salaryFabricio,
            salary_patricia: state.salaryPatricia,
            extra_income: state.extraIncome,
            cards: state.cards,
            savings_goal_type: state.savingsGoalType,
            savings_goal_value: state.savingsGoalValue,
            budget_limits: state.budgetLimits
          });

        if (error) throw error;
        
        updateUI();
        alert('Objetivos de longo prazo salvos com sucesso!');
      } catch (err) {
        console.error('Erro ao salvar objetivos no Supabase:', err);
        alert('Erro ao salvar objetivos: ' + err.message);
      }
    });
  }

  // 3.7 ALLOCATE SAVINGS FORM SUBMIT
  const allocateForm = document.getElementById('allocate-savings-form');
  if (allocateForm) {
    allocateForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!loggedInUserId) {
        alert('Você precisa estar logado para realizar alocações.');
        return;
      }
      
      const goalId = document.getElementById('allocate-goal-select').value;
      const amount = parseFloat(document.getElementById('allocate-amount').value) || 0;
      
      if (amount <= 0) {
        alert('Por favor, insira um valor válido acima de zero.');
        return;
      }
      
      const goals = state.budgetLimits._savingsGoals || [];
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        goal.current = (parseFloat(goal.current) || 0) + amount;
        
        try {
          const { error } = await supabase
            .from('user_settings')
            .upsert({
              user_id: loggedInUserId,
              salary_fabricio: state.salaryFabricio,
              salary_patricia: state.salaryPatricia,
              extra_income: state.extraIncome,
              cards: state.cards,
              savings_goal_type: state.savingsGoalType,
              savings_goal_value: state.savingsGoalValue,
              budget_limits: state.budgetLimits
            });

          if (error) throw error;
          
          document.getElementById('allocate-amount').value = '';
          updateUI();
          alert(`R$ ${amount.toFixed(2)} alocados com sucesso no objetivo "${goal.name}"!`);
        } catch (err) {
          console.error('Erro ao salvar alocação:', err);
          alert('Erro ao salvar alocação: ' + err.message);
        }
      }
    });
  }

  // 3.8 CUSTOM RULES FORM SUBMIT
  const addRuleBtn = document.getElementById('add-rule-btn');
  if (addRuleBtn) {
    addRuleBtn.addEventListener('click', () => {
      if (!state.budgetLimits) state.budgetLimits = {};
      if (!state.budgetLimits._autoCategorizeRules) state.budgetLimits._autoCategorizeRules = [];
      
      const categories = Object.keys(state.budgetLimits).filter(k => !k.startsWith('_'));
      state.budgetLimits._autoCategorizeRules.push({
        keyword: '',
        category: categories[0] || 'Moradia'
      });
      renderCustomRulesSettings();
    });
  }

  const customRulesForm = document.getElementById('custom-rules-form');
  if (customRulesForm) {
    customRulesForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!loggedInUserId) {
        showToast('Você precisa estar logado para salvar as regras.', 'warning');
        return;
      }

      const rows = document.querySelectorAll('#settings-rules-container .custom-rule-row');
      const newRules = [];
      
      rows.forEach(row => {
        const keyword = row.querySelector('.rule-keyword').value.trim();
        const category = row.querySelector('.rule-category').value;
        if (keyword) {
          newRules.push({ keyword, category });
        }
      });
      
      state.budgetLimits._autoCategorizeRules = newRules;
      
      try {
        const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: loggedInUserId,
            salary_fabricio: state.salaryFabricio,
            salary_patricia: state.salaryPatricia,
            extra_income: state.extraIncome,
            cards: state.cards,
            savings_goal_type: state.savingsGoalType,
            savings_goal_value: state.savingsGoalValue,
            budget_limits: state.budgetLimits
          });

        if (error) throw error;
        
        updateUI();
        showToast('Regras de categorização salvas com sucesso!', 'success');
      } catch (err) {
        console.error('Erro ao salvar regras no Supabase:', err);
        showToast('Erro ao salvar regras: ' + err.message, 'danger');
      }
    });
  }
}

function resetExpenseForm() {
  document.getElementById('edit-expense-id').value = '';
  document.getElementById('expense-amount').value = '';
  document.getElementById('expense-desc').value = '';
  document.getElementById('expense-date').value = new Date().toISOString().substring(0, 10);
  document.getElementById('expense-specify').value = '';
  document.getElementById('specify-others-group').classList.add('hidden');
  document.getElementById('expense-specify').removeAttribute('required');
  
  const tagsInput = document.getElementById('expense-tags');
  if (tagsInput) {
    tagsInput.value = '';
  }
  if (typeof updateActiveChips === 'function') {
    updateActiveChips();
  }
  
  // Reset installments form elements
  const isInstallmentCheckbox = document.getElementById('expense-is-installment');
  if (isInstallmentCheckbox) {
    isInstallmentCheckbox.checked = false;
    isInstallmentCheckbox.disabled = false;
  }
  const installmentGroup = document.getElementById('installment-group');
  if (installmentGroup) {
    installmentGroup.classList.add('hidden');
  }
  const installmentsInput = document.getElementById('expense-installments');
  if (installmentsInput) {
    installmentsInput.value = '2';
    installmentsInput.removeAttribute('required');
    installmentsInput.disabled = false;
  }

  // Reset buttons
  document.getElementById('submit-expense-btn').textContent = 'Salvar Lançamento';
  document.getElementById('cancel-edit-btn').classList.add('hidden');
  const clearFormBtn = document.getElementById('clear-form-btn');
  if (clearFormBtn) {
    clearFormBtn.classList.remove('hidden');
  }
}

// ==========================================================================
// CHARTS GENERATION (CHART.JS)
// ==========================================================================

function renderCharts() {
  const activeMonth = state.currentMonth;
  const isLightMode = document.body.classList.contains('light-mode');
  const labelColor = isLightMode ? '#22252a' : '#d1d4dc';
  const chartBorderColor = isLightMode ? '#ffffff' : '#1d2331';
  const dailyThisMonth = state.dailyExpenses.filter(exp => exp.date.substring(0, 7) === activeMonth);

  // Group fixed bills by category to merge into the chart:
  const bills = state.fixedBills[activeMonth] || [];
  
  // 1. Chart 1: Expenses by Cost Center
  const categoryData = {
    'Moradia': 0,
    'Transporte': 0,
    'Saúde': 0,
    'Alimentação': 0,
    'Lanches': 0,
    'Alimentação Trabalho': 0,
    'Lazer & Assinaturas': 0,
    'Seguros & Proteção': 0,
    'Outros': 0
  };

  // Add daily items
  dailyThisMonth.forEach(exp => {
    if (categoryData[exp.category] !== undefined) {
      categoryData[exp.category] += parseFloat(exp.amount) || 0;
    } else {
      categoryData['Outros'] += parseFloat(exp.amount) || 0;
    }
  });

  // Add fixed items to centers of cost
  bills.forEach(bill => {
    const val = parseFloat(bill.value) || 0;
    if (['💧 Água', '⚡ Luz', '🏠 Parcela Financiamento Casa', '🏢 Condomínio', '☀️ Luz Solar'].includes(bill.name)) {
      categoryData['Moradia'] += val;
    } else if (['🚗 Financiamento Carro'].includes(bill.name)) {
      categoryData['Transporte'] += val;
    } else if (['🏥 Plano de Saúde'].includes(bill.name)) {
      categoryData['Saúde'] += val;
    } else if (['🛡️ Seguro de Vida'].includes(bill.name)) {
      categoryData['Seguros & Proteção'] += val;
    }
  });

  const categoryLabels = Object.keys(categoryData).filter(key => categoryData[key] > 0);
  const categoryValues = categoryLabels.map(key => categoryData[key]);

  // Clean previous chart instance
  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }

  const ctxCat = document.getElementById('categoryChart');
  if (ctxCat && categoryLabels.length > 0) {
    ctxCat.parentElement.style.display = 'block';
    const ctx = ctxCat.getContext('2d');
    
    // Gradient definitions: start color, end color
    const gradientColors = [
      { start: '#3a86ff', end: '#00b4d8' }, // Moradia - Light Blue/Blue
      { start: '#ff9e00', end: '#e85d04' }, // Transporte - Amber/Orange
      { start: '#ff006e', end: '#ff4d6d' }, // Saúde - Pink/Red
      { start: '#38b000', end: '#007200' }, // Alimentação - Green/Emerald
      { start: '#ffb703', end: '#fb8500' }, // Lanches - Yellow/Orange
      { start: '#00a896', end: '#028090' }, // Alimentação Trabalho - Teal
      { start: '#8338ec', end: '#c77dff' }, // Lazer - Purple
      { start: '#00f5d4', end: '#00bbf9' }, // Seguros - Mint/Cyan
      { start: '#8d99ae', end: '#5c677d' }  // Outros - Gray/Slate
    ];
    
    // Create canvas gradients
    const backgroundGradients = categoryLabels.map(label => {
      const index = Object.keys(categoryData).indexOf(label);
      const colorSet = gradientColors[index] || { start: '#8d99ae', end: '#5c677d' };
      const gradient = ctx.createLinearGradient(0, 0, 0, 180);
      gradient.addColorStop(0, colorSet.start);
      gradient.addColorStop(1, colorSet.end);
      return gradient;
    });
    
    categoryChartInstance = new Chart(ctxCat, {
      type: 'doughnut',
      data: {
        labels: categoryLabels,
        datasets: [{
          data: categoryValues,
          backgroundColor: backgroundGradients,
          borderWidth: 2,
          borderColor: chartBorderColor,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%', // Sleeker thin doughnut
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: labelColor,
              boxWidth: 8,
              padding: 10,
              font: {
                family: "'Inter', sans-serif",
                size: 10,
                weight: '500'
              }
            }
          },
          tooltip: {
            backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(23, 28, 41, 0.95)',
            titleColor: isLightMode ? '#0f172a' : '#f8fafc',
            bodyColor: isLightMode ? '#334155' : '#cbd5e1',
            borderColor: isLightMode ? '#e2e8f0' : '#2a354f',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            titleFont: { family: "'Inter', sans-serif", weight: 'bold' },
            bodyFont: { family: "'Inter', sans-serif" },
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                if (label) label += ': ';
                if (context.parsed !== undefined) {
                  label += formatCurrency(context.parsed);
                } else if (context.raw !== undefined) {
                  label += formatCurrency(context.raw);
                }
                return label;
              }
            }
          }
        }
      }
    });
  } else if (ctxCat) {
    // Show empty state text or clear
    ctxCat.parentElement.style.display = 'none';
  }

  // 2. Chart 2: Expenses by Card/Responsibility (Daily Expenses + Paid Fixed Bills)
  const cardData = {};
  state.cards.forEach(c => { cardData[c] = 0; });

  // Add daily expenses
  dailyThisMonth.forEach(exp => {
    if (cardData[exp.card] !== undefined) {
      cardData[exp.card] += parseFloat(exp.amount) || 0;
    } else {
      // Dynamic fallback
      cardData[exp.card] = parseFloat(exp.amount) || 0;
    }
  });

  // Add paid fixed bills to their respective cards
  bills.forEach(bill => {
    if (bill.paid && bill.card) {
      if (cardData[bill.card] !== undefined) {
        cardData[bill.card] += parseFloat(bill.value) || 0;
      } else {
        cardData[bill.card] = parseFloat(bill.value) || 0;
      }
    }
  });

  const cardLabels = Object.keys(cardData).filter(key => cardData[key] > 0);
  const cardValues = cardLabels.map(key => cardData[key]);

  // Clean previous chart instance
  if (cardChartInstance) {
    cardChartInstance.destroy();
  }

  const ctxCard = document.getElementById('cardChart');
  if (ctxCard && cardLabels.length > 0) {
    ctxCard.parentElement.style.display = 'block';
    const ctx = ctxCard.getContext('2d');
    
    // Modern gradients for cards/responsible
    const cardGradientsMap = [
      { start: '#00f5d4', end: '#00bbf9' }, // Teal/Blue
      { start: '#ff006e', end: '#f15bb5' }, // Pink/Magenta
      { start: '#8338ec', end: '#9b5de5' }, // Purple/Violet
      { start: '#06d6a0', end: '#52b788' }, // Mint/Green
      { start: '#ff9f1c', end: '#ffbf69' }, // Orange/Yellow
      { start: '#e63946', end: '#f15bb5' }  // Red/Pink
    ];

    const backgroundGradients = cardLabels.map((_, i) => {
      const colorSet = cardGradientsMap[i % cardGradientsMap.length];
      const gradient = ctx.createLinearGradient(0, 0, 0, 180);
      gradient.addColorStop(0, colorSet.start);
      gradient.addColorStop(1, colorSet.end);
      return gradient;
    });

    cardChartInstance = new Chart(ctxCard, {
      type: 'doughnut',
      data: {
        labels: cardLabels,
        datasets: [{
          data: cardValues,
          backgroundColor: backgroundGradients,
          borderWidth: 2,
          borderColor: chartBorderColor,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%', // Sleeker thin doughnut
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: labelColor,
              boxWidth: 8,
              padding: 10,
              font: {
                family: "'Inter', sans-serif",
                size: 10,
                weight: '500'
              }
            }
          },
          tooltip: {
            backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(23, 28, 41, 0.95)',
            titleColor: isLightMode ? '#0f172a' : '#f8fafc',
            bodyColor: isLightMode ? '#334155' : '#cbd5e1',
            borderColor: isLightMode ? '#e2e8f0' : '#2a354f',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            titleFont: { family: "'Inter', sans-serif", weight: 'bold' },
            bodyFont: { family: "'Inter', sans-serif" },
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                if (label) label += ': ';
                if (context.parsed !== undefined) {
                  label += formatCurrency(context.parsed);
                } else if (context.raw !== undefined) {
                  label += formatCurrency(context.raw);
                }
                return label;
              }
            }
          }
        }
      }
    });
  } else if (ctxCard) {
    ctxCard.parentElement.style.display = 'none';
  }

  // 3. Chart 3: 6-Month History (Receita vs Despesa vs Saldo)
  const historyMonths = [];
  const [currYearStr, currMonthStr] = activeMonth.split('-');
  let currYear = parseInt(currYearStr);
  let currMonth = parseInt(currMonthStr);

  for (let i = 5; i >= 0; i--) {
    let m = currMonth - i;
    let y = currYear;
    if (m < 1) {
      m += 12;
      y -= 1;
    }
    historyMonths.push(`${y}-${String(m).padStart(2, '0')}`);
  }

  const income = (parseFloat(state.salaryFabricio) || 0) + (parseFloat(state.salaryPatricia) || 0) + (parseFloat(state.extraIncome) || 0);

  const historyIncomeData = [];
  const historyExpenseData = [];
  const historyBalanceData = [];

  historyMonths.forEach(mKey => {
    // Calc daily expenses
    const dailyThisMonth = state.dailyExpenses.filter(exp => exp.date.substring(0, 7) === mKey);
    const totalDaily = dailyThisMonth.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

    // Calc fixed bills paid
    const bills = state.fixedBills[mKey] || [];
    const totalPaidFixed = bills.reduce((sum, bill) => sum + (bill.paid ? (parseFloat(bill.value) || 0) : 0), 0);

    const totalExpenses = totalDaily + totalPaidFixed;
    const balance = income - totalExpenses;

    historyIncomeData.push(income);
    historyExpenseData.push(totalExpenses);
    historyBalanceData.push(balance);
  });

  const historyLabels = historyMonths.map(mKey => {
    const [y, m] = mKey.split('-');
    const monthsShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${monthsShort[parseInt(m) - 1]}/${y.substring(2)}`;
  });

  if (historyChartInstance) {
    historyChartInstance.destroy();
  }

  const ctxHistory = document.getElementById('historyChart');
  if (ctxHistory) {
    const ctx = ctxHistory.getContext('2d');
    
    // Create fill gradients that fade out beautifully
    const gradReceita = ctx.createLinearGradient(0, 0, 0, 180);
    gradReceita.addColorStop(0, 'rgba(56, 176, 0, 0.22)');
    gradReceita.addColorStop(1, 'rgba(56, 176, 0, 0)');

    const gradDespesa = ctx.createLinearGradient(0, 0, 0, 180);
    gradDespesa.addColorStop(0, 'rgba(255, 77, 109, 0.22)');
    gradDespesa.addColorStop(1, 'rgba(255, 77, 109, 0)');

    const gradSaldo = ctx.createLinearGradient(0, 0, 0, 180);
    gradSaldo.addColorStop(0, 'rgba(58, 134, 255, 0.28)');
    gradSaldo.addColorStop(1, 'rgba(58, 134, 255, 0)');

    historyChartInstance = new Chart(ctxHistory, {
      type: 'line',
      data: {
        labels: historyLabels,
        datasets: [
          {
            label: 'Receita',
            data: historyIncomeData,
            borderColor: '#38b000',
            backgroundColor: gradReceita,
            fill: true,
            borderWidth: 2,
            borderDash: [4, 4],
            pointBackgroundColor: '#38b000',
            pointBorderColor: chartBorderColor,
            pointBorderWidth: 1.5,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.35
          },
          {
            label: 'Despesas',
            data: historyExpenseData,
            borderColor: '#ff4d6d',
            backgroundColor: gradDespesa,
            fill: true,
            borderWidth: 2.5,
            pointBackgroundColor: '#ff4d6d',
            pointBorderColor: chartBorderColor,
            pointBorderWidth: 1.5,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.35
          },
          {
            label: 'Saldo/Economia',
            data: historyBalanceData,
            borderColor: '#3a86ff',
            backgroundColor: gradSaldo,
            fill: true,
            borderWidth: 3.5,
            pointBackgroundColor: '#3a86ff',
            pointBorderColor: chartBorderColor,
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.35
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        scales: {
          y: {
            grid: {
              color: isLightMode ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)'
            },
            ticks: {
              color: labelColor,
              font: {
                family: "'Inter', sans-serif",
                size: 9,
                weight: '500'
              },
              callback: function(value) {
                return 'R$ ' + value;
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: labelColor,
              font: {
                family: "'Inter', sans-serif",
                size: 9,
                weight: '500'
              }
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: labelColor,
              boxWidth: 10,
              padding: 10,
              font: {
                family: "'Inter', sans-serif",
                size: 10,
                weight: '500'
              }
            }
          },
          tooltip: {
            backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(23, 28, 41, 0.95)',
            titleColor: isLightMode ? '#0f172a' : '#f8fafc',
            bodyColor: isLightMode ? '#334155' : '#cbd5e1',
            borderColor: isLightMode ? '#e2e8f0' : '#2a354f',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            titleFont: { family: "'Inter', sans-serif", weight: 'bold' },
            bodyFont: { family: "'Inter', sans-serif" },
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== undefined) {
                  label += formatCurrency(context.parsed.y);
                } else if (context.raw !== undefined) {
                  label += formatCurrency(context.raw);
                }
                return label;
              }
            }
          }
        }
      }
    });
  }
}

// ==========================================================================
// BACKUP / SAFETY ACTIONS
// ==========================================================================

function setupBackupActions() {
  // 1. Export JSON Data
  const exportBtn = document.getElementById('export-backup-btn');
  exportBtn.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    
    const timestamp = new Date().toISOString().substring(0, 10);
    dlAnchorElem.setAttribute("download", `erp_financas_backup_${timestamp}.json`);
    dlAnchorElem.click();
  });

  // 2. Import JSON Data
  const importInput = document.getElementById('import-file');
  importInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(evt) {
      try {
        const imported = JSON.parse(evt.target.result);
        
        // Simple safety checks
        if (imported.dailyExpenses && (typeof imported.salaryFabricio === 'number' || typeof imported.monthlyIncome === 'number')) {
          if (await showConfirmModal('Atenção: A importação irá sobrescrever todos os dados atuais. Deseja prosseguir?', { title: 'Importar Backup' })) {
            const currentPassword = state.appPassword;
            state = { ...state, ...imported };
            // Preserve password lock if imported backup has none
            if (!state.appPassword) {
              state.appPassword = currentPassword;
            }
            saveState();
            window.location.reload();
          }
        } else {
          showToast('Erro: Arquivo JSON de backup inválido.', 'danger');
        }
      } catch (err) {
        showToast('Erro ao processar o arquivo de backup: ' + err.message, 'danger');
      }
    };
    reader.readAsText(file);
  });

  // 3. Reset All App Data
  const resetBtn = document.getElementById('reset-app-btn');
  resetBtn.addEventListener('click', async () => {
    if (await showConfirmModal('ATENÇÃO: Isso apagará permanentemente todas as suas despesas, senha, configurações de cartões e contas salvas. Deseja limpar tudo?', { title: 'Limpar Todos os Dados' })) {
      if (await showConfirmModal('Para prosseguir com a exclusão completa, confirme digitando "APAGAR" abaixo:', { title: 'Confirmar Exclusão', requireInput: true, targetInput: 'APAGAR' })) {
        localStorage.removeItem('home_erp_state');
        sessionStorage.removeItem('erp_authenticated');
        window.location.reload();
      }
    }
  });

  // 4. Logout / Lock App Action
  const logoutBtn = document.getElementById('logout-app-btn');
  const headerLogoutBtn = document.getElementById('header-logout-btn');

  window.handleLogout = async () => {
    if (await showConfirmModal('Deseja realmente sair e bloquear o acesso ao ERP?', { title: 'Sair do ERP' })) {
      try {
        if (supabase) await supabase.auth.signOut();
      } catch (err) {
        console.error('Erro ao efetuar logout:', err);
      }
      sessionStorage.removeItem('erp_authenticated');
      window.location.reload();
    }
  };

  if (logoutBtn) {
    logoutBtn.addEventListener('click', window.handleLogout);
  }
  if (headerLogoutBtn) {
    headerLogoutBtn.addEventListener('click', window.handleLogout);
  }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', initApp);

// Password Visibility Toggle Utility
window.togglePasswordVisibility = function(inputId, button) {
  const input = document.getElementById(inputId);
  if (input) {
    const eyeIcon = button.querySelector('.eye-icon');
    const eyeOffIcon = button.querySelector('.eye-off-icon');
    
    if (input.type === 'password') {
      input.type = 'text';
      if (eyeIcon) eyeIcon.classList.add('hidden');
      if (eyeOffIcon) eyeOffIcon.classList.remove('hidden');
    } else {
      input.type = 'password';
      if (eyeIcon) eyeIcon.classList.remove('hidden');
      if (eyeOffIcon) eyeOffIcon.classList.add('hidden');
    }
  }
};

// Theme Management Functions
function setupThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (!toggleBtn) return;

  const currentTheme = localStorage.getItem('erp_theme') || 'dark';
  updateThemeToggleIcon(currentTheme);

  toggleBtn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    const newTheme = isLight ? 'light' : 'dark';
    localStorage.setItem('erp_theme', newTheme);
    updateThemeToggleIcon(newTheme);
    
    // Rerender charts with the new colors
    renderCharts();
  });
}

function updateThemeToggleIcon(theme) {
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');
  if (!sunIcon || !moonIcon) return;

  if (theme === 'light') {
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
  } else {
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  }
}

/* Collapsible Toggles */
window.toggleSimulatorCollapse = function() {
  const content = document.getElementById('simulator-content');
  const arrow = document.getElementById('simulator-toggle-arrow');
  if (content && arrow) {
    const isHidden = content.classList.toggle('hidden');
    arrow.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
    if (!isHidden) {
      const today = new Date();
      let nextMonth = today.getMonth() + 2;
      let year = today.getFullYear();
      if (nextMonth > 12) {
        nextMonth = 1;
        year += 1;
      }
      document.getElementById('sim-start-month').value = `${year}-${String(nextMonth).padStart(2, '0')}`;
    }
  }
};

window.toggleImportCollapse = function() {
  const content = document.getElementById('import-content');
  const arrow = document.getElementById('import-toggle-arrow');
  if (content && arrow) {
    const isHidden = content.classList.toggle('hidden');
    arrow.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
  }
};

window.toggleDivisionCollapse = function() {
  const content = document.getElementById('division-content');
  const arrow = document.getElementById('division-toggle-arrow');
  if (content && arrow) {
    const isHidden = content.classList.toggle('hidden');
    arrow.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
    if (!isHidden) {
      renderDivisionCalculator();
    }
  }
};

window.toggleProjectionCollapse = function() {
  const content = document.getElementById('projection-content');
  const arrow = document.getElementById('projection-toggle-arrow');
  if (content && arrow) {
    const isHidden = content.classList.toggle('hidden');
    arrow.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
    if (!isHidden) {
      renderInstallmentProjections();
    }
  }
};

function renderInstallmentProjections() {
  const barList = document.getElementById('projection-bar-list');
  const activeList = document.getElementById('active-installments-list');
  if (!barList || !activeList) return;
  
  barList.innerHTML = '';
  activeList.innerHTML = '';
  
  const activeMonth = state.currentMonth;
  const [currYearStr, currMonthStr] = activeMonth.split('-');
  const currYear = parseInt(currYearStr);
  const currMonth = parseInt(currMonthStr);
  
  const projections = [];
  let maxSpent = 0;
  
  for (let i = 0; i < 12; i++) {
    let m = currMonth + i;
    let y = currYear;
    if (m > 12) {
      y += Math.floor((m - 1) / 12);
      m = ((m - 1) % 12) + 1;
    }
    const mKey = `${y}-${String(m).padStart(2, '0')}`;
    
    const installmentExp = state.dailyExpenses.filter(exp => 
      exp.installmentGroupId && exp.date.substring(0, 7) === mKey
    );
    const totalSpent = installmentExp.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    
    projections.push({ monthKey: mKey, total: totalSpent, year: y, month: m });
    if (totalSpent > maxSpent) maxSpent = totalSpent;
  }
  
  const monthsShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  projections.forEach(proj => {
    const pct = maxSpent > 0 ? (proj.total / maxSpent) * 100 : 0;
    const monthLabel = `${monthsShort[proj.month - 1]}/${String(proj.year).substring(2)}`;
    
    const barHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="width: 50px; font-size: 0.75rem; font-weight: 600; color: var(--text-secondary);">${monthLabel}</span>
        <div class="progress-track" style="flex: 1; height: 10px; background-color: var(--border-color); border-radius: 5px; overflow: hidden; position: relative;">
          <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, var(--primary), var(--primary-hover)); border-radius: 5px; transition: width 0.3s;"></div>
        </div>
        <span style="width: 75px; text-align: right; font-size: 0.75rem; font-weight: 700; color: ${proj.total > 0 ? 'var(--text-primary)' : 'var(--text-muted)'};">
          ${proj.total > 0 ? formatCurrency(proj.total) : 'R$ 0,00'}
        </span>
      </div>
    `;
    barList.insertAdjacentHTML('beforeend', barHTML);
  });
  
  const groups = {};
  state.dailyExpenses.forEach(exp => {
    if (exp.installmentGroupId) {
      if (!groups[exp.installmentGroupId]) {
        groups[exp.installmentGroupId] = [];
      }
      groups[exp.installmentGroupId].push(exp);
    }
  });
  
  let hasActive = false;
  
  Object.keys(groups).forEach(groupId => {
    const group = groups[groupId];
    group.sort((a, b) => a.date.localeCompare(b.date));
    
    const totalCount = group[0].installmentCount || group.length;
    const amount = group[0].amount;
    const card = group[0].card;
    const cleanDesc = group[0].desc.replace(/\s*\[\d+\/\d+\]$/, '');
    
    const activeInstallments = group.filter(exp => exp.date.substring(0, 7) >= activeMonth);
    
    if (activeInstallments.length > 0) {
      hasActive = true;
      const remainingCount = activeInstallments.length;
      
      const currentInst = group.find(exp => exp.date.substring(0, 7) === activeMonth);
      let statusText = '';
      if (currentInst) {
        statusText = `Parcela ${currentInst.installmentIndex} de ${totalCount}`;
      } else {
        const nextInst = activeInstallments[0];
        const nextMonthParts = nextInst.date.split('-');
        statusText = `Inicia em ${monthsShort[parseInt(nextMonthParts[1]) - 1]}/${nextMonthParts[0].substring(2)} (Parc. 1/${totalCount})`;
      }
      
      const itemHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background-color: rgba(255, 255, 255, 0.015); margin-bottom: 6px;">
          <div style="flex: 1; min-width: 0;">
            <strong style="color: var(--text-primary); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${cleanDesc}</strong>
            <div style="font-size: 0.65rem; color: var(--text-secondary); margin-top: 2px;">
              ${statusText} | 💳 ${card}
            </div>
          </div>
          <div style="text-align: right; display: flex; align-items: center; gap: 8px; flex-shrink: 0; margin-left: 8px;">
            <div>
              <strong style="color: var(--danger);">${formatCurrency(amount)}/mês</strong>
              <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 2px;">Faltam ${remainingCount} parc.</div>
            </div>
            <button type="button" class="btn-delete-installment-group" title="Excluir parcelamento completo" onclick="deleteInstallmentGroup('${groupId}', '${cleanDesc.replace(/'/g, "\\'")}')">
              🗑️
            </button>
          </div>
        </div>
      `;
      activeList.insertAdjacentHTML('beforeend', itemHTML);
    }
  });
  
  if (!hasActive) {
    activeList.innerHTML = '<div class="empty-state" style="padding: 10px 0; font-size: 0.75rem;">Nenhuma compra parcelada ativa para este mês ou futuros.</div>';
  }
  
  // Renderizar a Previsão de Saldo Futuro (Receita - Contas Fixas Estimadas - Parcelas)
  const forecastList = document.getElementById('balance-forecast-list');
  if (forecastList) {
    forecastList.innerHTML = '';
    const income = (parseFloat(state.salaryFabricio) || 0) + (parseFloat(state.salaryPatricia) || 0) + (parseFloat(state.extraIncome) || 0);
    const fixedBillsEstimate = (state.fixedBillsTemplate || []).reduce((sum, t) => sum + (parseFloat(t.value) || 0), 0);

    projections.forEach(proj => {
      const totalEstExpenses = fixedBillsEstimate + proj.total;
      const forecastedBalance = income - totalEstExpenses;
      const monthLabel = `${monthsShort[proj.month - 1]}/${String(proj.year).substring(2)}`;
      
      const itemHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background-color: rgba(255, 255, 255, 0.015); margin-bottom: 6px;">
          <div style="width: 55px; font-weight: 600; color: var(--text-primary); font-size: 0.75rem;">${monthLabel}</div>
          <div style="flex: 1; display: flex; justify-content: space-around; font-size: 0.65rem; color: var(--text-secondary); margin: 0 8px; gap: 4px;">
            <span>Rec: <b style="color: var(--success);">${formatCurrency(income)}</b></span>
            <span>Contas: <b style="color: var(--text-muted);">${formatCurrency(fixedBillsEstimate)}</b></span>
            <span>Parc: <b style="color: var(--danger);">${formatCurrency(proj.total)}</b></span>
          </div>
          <div style="text-align: right; width: 85px; flex-shrink: 0;">
            <strong style="color: ${forecastedBalance >= 0 ? 'var(--success)' : 'var(--danger)'}; font-size: 0.75rem;">
              ${formatCurrency(forecastedBalance)}
            </strong>
          </div>
        </div>
      `;
      forecastList.insertAdjacentHTML('beforeend', itemHTML);
    });
  }
}

window.deleteInstallmentGroup = async function(groupId, desc) {
  if (await showConfirmModal(`Tem certeza de que deseja excluir TODAS as parcelas restantes da compra "${desc}"?`, { title: 'Excluir Parcelamento Completo' })) {
    try {
      const { error } = await supabase
        .from('daily_expenses')
        .delete()
        .eq('installment_group_id', groupId)
        .eq('user_id', loggedInUserId);

      if (error) throw error;
      
      state.dailyExpenses = state.dailyExpenses.filter(e => e.installmentGroupId !== groupId);
      updateUI();
      showToast(`Parcelamento "${desc}" excluído com sucesso!`, 'success');
    } catch (err) {
      console.error('Erro ao excluir parcelas:', err);
      showToast('Erro ao excluir parcelas: ' + err.message, 'danger');
    }
  }
};

function renderLongTermGoalsDashboard() {
  const container = document.getElementById('long-term-goals-list');
  const allocateWrapper = document.getElementById('quick-allocate-wrapper');
  const select = document.getElementById('allocate-goal-select');
  if (!container) return;
  
  container.innerHTML = '';
  if (select) select.innerHTML = '';
  
  if (!state.budgetLimits) {
    state.budgetLimits = {};
  }
  if (!state.budgetLimits._savingsGoals) {
    state.budgetLimits._savingsGoals = [];
  }
  
  const goals = state.budgetLimits._savingsGoals;
  
  if (goals.length === 0) {
    container.innerHTML = '<div class="empty-state" style="padding: 10px 0; font-size: 0.8rem;">Nenhum objetivo de longo prazo cadastrado. Defina-os nos ajustes.</div>';
    if (allocateWrapper) allocateWrapper.classList.add('hidden');
    return;
  }
  
  if (allocateWrapper) allocateWrapper.classList.remove('hidden');
  
  goals.forEach(goal => {
    const target = parseFloat(goal.target) || 0;
    const current = parseFloat(goal.current) || 0;
    const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    
    const itemHTML = `
      <div class="long-term-goal-item">
        <div class="long-term-goal-header">
          <span class="long-term-goal-title">${goal.name}</span>
          <span class="long-term-goal-values">${formatCurrency(current)} / ${formatCurrency(target)} (${pct}%)</span>
        </div>
        <div class="long-term-goal-bar">
          <div class="long-term-goal-bar-fill" style="width: ${pct}%"></div>
        </div>
        <div class="goal-actions-row">
          <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.65rem; flex: none; width: auto; height: 24px; border-radius: 4px;" onclick="adjustGoalValue('${goal.id}', 1)">Adicionar</button>
          <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.65rem; flex: none; width: auto; height: 24px; border-radius: 4px; background: rgba(255,255,255,0.02);" onclick="adjustGoalValue('${goal.id}', -1)">Resgatar</button>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', itemHTML);
    
    if (select) {
      const option = document.createElement('option');
      option.value = goal.id;
      option.textContent = goal.name;
      select.appendChild(option);
    }
  });
}

window.adjustGoalValue = async function(goalId, direction) {
  const goals = state.budgetLimits._savingsGoals || [];
  const goal = goals.find(g => g.id === goalId);
  if (!goal) return;
  
  const actionText = direction > 0 ? 'adicionar ao' : 'resgatar do';
  const rawVal = prompt(`Digite o valor a ${actionText} objetivo "${goal.name}":`, '0.00');
  if (rawVal === null) return;
  
  const val = parseFloat(rawVal) || 0;
  if (val <= 0) {
    alert('Por favor, insira um valor válido acima de zero.');
    return;
  }
  
  const current = parseFloat(goal.current) || 0;
  if (direction < 0 && val > current) {
    alert('O valor de resgate não pode ser maior que o saldo atual da meta.');
    return;
  }
  
  goal.current = direction > 0 ? current + val : current - val;
  
  try {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: loggedInUserId,
        salary_fabricio: state.salaryFabricio,
        salary_patricia: state.salaryPatricia,
        extra_income: state.extraIncome,
        cards: state.cards,
        savings_goal_type: state.savingsGoalType,
        savings_goal_value: state.savingsGoalValue,
        budget_limits: state.budgetLimits
      });

    if (error) throw error;
    updateUI();
  } catch (err) {
    console.error('Erro ao atualizar meta:', err);
    alert('Erro ao atualizar meta: ' + err.message);
  }
};

function renderLongTermGoalsSettings() {
  const container = document.getElementById('settings-goals-container');
  if (!container) return;
  container.innerHTML = '';
  
  if (!state.budgetLimits) {
    state.budgetLimits = {};
  }
  if (!state.budgetLimits._savingsGoals) {
    state.budgetLimits._savingsGoals = [];
  }
  
  const goals = state.budgetLimits._savingsGoals;
  
  goals.forEach((goal, index) => {
    const rowHTML = `
      <div class="template-bill-row" data-index="${index}" style="margin-bottom: 6px;">
        <input type="text" class="goal-name" value="${goal.name}" placeholder="Nome (Ex: Viagem)" style="flex: 2; width: auto;" required>
        <div style="display: flex; align-items: center; gap: 4px; flex: 1.2;">
          <span style="font-size: 0.75rem; color: var(--text-secondary);">Alvo</span>
          <input type="number" step="0.01" class="goal-target" value="${(parseFloat(goal.target) || 0).toFixed(2)}" placeholder="0.00" required inputmode="decimal">
        </div>
        <div style="display: flex; align-items: center; gap: 4px; flex: 1.2;">
          <span style="font-size: 0.75rem; color: var(--text-secondary);">Salvo</span>
          <input type="number" step="0.01" class="goal-current" value="${(parseFloat(goal.current) || 0).toFixed(2)}" placeholder="0.00" required inputmode="decimal">
        </div>
        <button type="button" class="btn-delete-template" title="Remover este objetivo" onclick="deleteGoal(${index})">🗑️</button>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', rowHTML);
  });
}

window.deleteGoal = async function(index) {
  if (await showConfirmModal('Tem certeza de que deseja remover este objetivo? O saldo acumulado registrado nele será perdido no app.', { title: 'Remover Objetivo' })) {
    state.budgetLimits._savingsGoals.splice(index, 1);
    renderLongTermGoalsSettings();
  }
};

function renderCustomRulesSettings() {
  const container = document.getElementById('settings-rules-container');
  if (!container) return;
  container.innerHTML = '';

  if (!state.budgetLimits) state.budgetLimits = {};
  if (!state.budgetLimits._autoCategorizeRules) state.budgetLimits._autoCategorizeRules = [];

  const rules = state.budgetLimits._autoCategorizeRules;
  const categories = Object.keys(state.budgetLimits).filter(k => !k.startsWith('_'));

  rules.forEach((rule, index) => {
    let catOptions = '';
    categories.forEach(cat => {
      catOptions += `<option value="${cat}" ${rule.category === cat ? 'selected' : ''}>${cat}</option>`;
    });

    const rowHTML = `
      <div class="custom-rule-row" data-index="${index}" style="margin-bottom: 6px; display: flex; gap: 8px; align-items: center;">
        <input type="text" class="rule-keyword" value="${rule.keyword || ''}" placeholder="Termo (Ex: Amazon)" style="flex: 1.2; padding: 6px 10px; font-size: 0.8rem; height: 32px;" required>
        <select class="rule-category" style="flex: 1; padding: 6px 10px; font-size: 0.8rem; height: 32px; background-position: right 6px center;" required>
          ${catOptions}
        </select>
        <button type="button" class="btn-delete-rule" title="Remover esta regra" onclick="deleteCustomRule(${index})">🗑️</button>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', rowHTML);
  });
}

window.deleteCustomRule = function(index) {
  if (state.budgetLimits && state.budgetLimits._autoCategorizeRules) {
    state.budgetLimits._autoCategorizeRules.splice(index, 1);
    renderCustomRulesSettings();
  }
};

function renderDivisionCalculator() {
  const salaryFabricio = parseFloat(state.salaryFabricio) || 0;
  const salaryPatricia = parseFloat(state.salaryPatricia) || 0;
  
  const totalSalary = salaryFabricio + salaryPatricia;
  if (totalSalary <= 0) {
    document.getElementById('div-ratio-fabricio').textContent = 'Fabrício: -';
    document.getElementById('div-ratio-patricia').textContent = 'Patrícia: -';
    document.getElementById('div-fill-fabricio').style.width = '50%';
    document.getElementById('div-fill-patricia').style.width = '50%';
    document.getElementById('div-total-shared').textContent = formatCurrency(0);
    document.getElementById('div-target-fabricio').textContent = formatCurrency(0);
    document.getElementById('div-paid-fabricio').textContent = formatCurrency(0);
    document.getElementById('div-target-patricia').textContent = formatCurrency(0);
    document.getElementById('div-paid-patricia').textContent = formatCurrency(0);
    const reconCard = document.getElementById('div-reconciliation-card');
    reconCard.className = 'reconciliation-alert balanced';
    reconCard.textContent = 'Defina os salários nas configurações para calcular.';
    return;
  }
  
  const pctFabricio = (salaryFabricio / totalSalary) * 100;
  const pctPatricia = (salaryPatricia / totalSalary) * 100;
  
  document.getElementById('div-ratio-fabricio').textContent = `Fabrício: ${pctFabricio.toFixed(1)}% (${formatCurrency(salaryFabricio)})`;
  document.getElementById('div-ratio-patricia').textContent = `Patrícia: ${pctPatricia.toFixed(1)}% (${formatCurrency(salaryPatricia)})`;
  
  document.getElementById('div-fill-fabricio').style.width = `${pctFabricio}%`;
  document.getElementById('div-fill-patricia').style.width = `${pctPatricia}%`;
  
  const activeMonth = state.currentMonth;
  
  // Calculate Total Shared Expenses
  const bills = state.fixedBills[activeMonth] || [];
  let totalFixed = 0;
  let paidFixedFabricio = 0;
  let paidFixedPatricia = 0;
  
  bills.forEach(bill => {
    if (bill.paid) {
      const val = parseFloat(bill.value) || 0;
      totalFixed += val;
      
      const cardLower = (bill.card || '').toLowerCase();
      if (cardLower.includes('fabricio') || cardLower.includes('fabrício')) {
        paidFixedFabricio += val;
      } else if (cardLower.includes('patricia') || cardLower.includes('patrícia')) {
        paidFixedPatricia += val;
      }
    }
  });
  
  const dailyThisMonth = state.dailyExpenses.filter(exp => exp.date.substring(0, 7) === activeMonth);
  let totalDaily = 0;
  let paidDailyFabricio = 0;
  let paidDailyPatricia = 0;
  
  dailyThisMonth.forEach(exp => {
    const val = parseFloat(exp.amount) || 0;
    totalDaily += val;
    
    const cardLower = (exp.card || '').toLowerCase();
    if (cardLower.includes('fabricio') || cardLower.includes('fabrício')) {
      paidDailyFabricio += val;
    } else if (cardLower.includes('patricia') || cardLower.includes('patrícia')) {
      paidDailyPatricia += val;
    }
  });
  
  const totalShared = totalFixed + totalDaily;
  
  const targetFabricio = totalShared * (salaryFabricio / totalSalary);
  const targetPatricia = totalShared * (salaryPatricia / totalSalary);
  
  const paidFabricio = paidFixedFabricio + paidDailyFabricio;
  const paidPatricia = paidFixedPatricia + paidDailyPatricia;
  
  document.getElementById('div-total-shared').textContent = formatCurrency(totalShared);
  document.getElementById('div-target-fabricio').textContent = formatCurrency(targetFabricio);
  document.getElementById('div-paid-fabricio').textContent = formatCurrency(paidFabricio);
  document.getElementById('div-target-patricia').textContent = formatCurrency(targetPatricia);
  document.getElementById('div-paid-patricia').textContent = formatCurrency(paidPatricia);
  
  const reconCard = document.getElementById('div-reconciliation-card');
  
  let transferMsg = '';
  if (paidFabricio > targetFabricio) {
    const diff = paidFabricio - targetFabricio;
    reconCard.className = 'reconciliation-alert patricia-pays';
    reconCard.innerHTML = `👩‍💼 Patrícia deve transferir <strong>${formatCurrency(diff)}</strong> para Fabrício 👨‍💻`;
    transferMsg = `👩‍💼 Patrícia deve transferir ${formatCurrency(diff)} para Fabrício 👨‍💻`;
  } else if (paidPatricia > targetPatricia) {
    const diff = paidPatricia - targetPatricia;
    reconCard.className = 'reconciliation-alert fabricio-pays';
    reconCard.innerHTML = `👨‍💻 Fabrício deve transferir <strong>${formatCurrency(diff)}</strong> para Patrícia 👩‍💼`;
    transferMsg = `👨‍💻 Fabrício deve transferir ${formatCurrency(diff)} para Patrícia 👩‍💼`;
  } else {
    reconCard.className = 'reconciliation-alert balanced';
    reconCard.innerHTML = `🎉 Contas perfeitamente equilibradas de acordo com as rendas!`;
    transferMsg = `🎉 Contas perfeitamente equilibradas de acordo com as rendas!`;
  }

  // Configuração do botão do WhatsApp
  const shareBtn = document.getElementById('whatsapp-share-btn');
  if (shareBtn) {
    if (totalShared > 0) {
      shareBtn.style.display = 'flex';
      
      const shareText = `⚖️ *Divisão Proporcional de Despesas - ${formatMonthDisplay(state.currentMonth)}*\n\n` +
        `👨‍💻 *Salário Fabrício:* ${formatCurrency(salaryFabricio)} (${pctFabricio.toFixed(1)}%)\n` +
        `👩‍💼 *Salário Patrícia:* ${formatCurrency(salaryPatricia)} (${pctPatricia.toFixed(1)}%)\n` +
        `💰 *Renda Total:* ${formatCurrency(totalSalary)}\n\n` +
        `💸 *Total Compartilhado:* ${formatCurrency(totalShared)}\n` +
        `  • Pago por Fabrício: ${formatCurrency(paidFabricio)} (Alvo: ${formatCurrency(targetFabricio)})\n` +
        `  • Pago por Patrícia: ${formatCurrency(paidPatricia)} (Alvo: ${formatCurrency(targetPatricia)})\n\n` +
        `👉 *Resultado:* ${transferMsg}`;
        
      shareBtn.onclick = () => {
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank');
      };
    } else {
      shareBtn.style.display = 'none';
    }
  }
}

/* Tags Consolidation & Rendering */
function renderTags() {
  const activeMonth = state.currentMonth;
  const dailyThisMonth = state.dailyExpenses.filter(exp => exp.date.substring(0, 7) === activeMonth);
  
  const tagTotals = {};
  dailyThisMonth.forEach(exp => {
    const descTags = exp.desc.match(/#[a-zA-Z0-9_]+/g) || [];
    const dedicatedTags = exp.tags ? (Array.isArray(exp.tags) ? exp.tags : exp.tags.split(/\s+/)) : [];
    const allTags = [...descTags, ...dedicatedTags];
    const uniqueTags = [...new Set(allTags)];
    uniqueTags.forEach(tag => {
      if (tag && tag.startsWith('#')) {
        tagTotals[tag] = (tagTotals[tag] || 0) + (parseFloat(exp.amount) || 0);
      }
    });
  });

  const filterTagSelect = document.getElementById('filter-tag');
  if (filterTagSelect) {
    const currentSelected = filterTagSelect.value;
    filterTagSelect.innerHTML = '<option value="all">Todas Tags</option>';
    const sortedTags = Object.keys(tagTotals).sort();
    sortedTags.forEach(tag => {
      const option = document.createElement('option');
      option.value = tag;
      option.textContent = tag;
      if (tag === currentSelected) option.selected = true;
      filterTagSelect.appendChild(option);
    });
  }

  const tagsListContainer = document.getElementById('tags-summary-list');
  if (tagsListContainer) {
    tagsListContainer.innerHTML = '';
    const tagEntries = Object.entries(tagTotals);
    if (tagEntries.length === 0) {
      tagsListContainer.innerHTML = '<div class="empty-state" style="padding: 10px 0;">Nenhuma tag (#) usada nas despesas deste mês.</div>';
      return;
    }
    tagEntries.sort((a, b) => b[1] - a[1]);
    tagEntries.forEach(([tag, total]) => {
      const tagHTML = `
        <div class="tag-badge-item">
          <span class="tag-name-label">${tag}</span>
          <span class="tag-amount-val">${formatCurrency(total)}</span>
        </div>
      `;
      tagsListContainer.insertAdjacentHTML('beforeend', tagHTML);
    });
  }
}

/* PDF Export Logic */
function setupPrintAction() {
  const printBtn = document.getElementById('print-pdf-btn');
  if (printBtn) {
    printBtn.addEventListener('click', exportToPDF);
  }
}

function exportToPDF() {
  const activeMonth = state.currentMonth;

  // 1.5 Populate division details for printing
  const divisionContainer = document.getElementById('print-division-details');
  if (divisionContainer) {
    divisionContainer.innerHTML = '';
    const salaryFabricio = parseFloat(state.salaryFabricio) || 0;
    const salaryPatricia = parseFloat(state.salaryPatricia) || 0;
    const totalSalary = salaryFabricio + salaryPatricia;
    
    if (totalSalary > 0) {
      const pctFabricio = (salaryFabricio / totalSalary) * 100;
      const pctPatricia = (salaryPatricia / totalSalary) * 100;
      
      const bills = state.fixedBills[activeMonth] || [];
      let totalFixed = 0;
      let paidFixedFabricio = 0;
      let paidFixedPatricia = 0;
      bills.forEach(bill => {
        if (bill.paid) {
          const val = parseFloat(bill.value) || 0;
          totalFixed += val;
          const cardLower = (bill.card || '').toLowerCase();
          if (cardLower.includes('fabricio') || cardLower.includes('fabrício')) paidFixedFabricio += val;
          else if (cardLower.includes('patricia') || cardLower.includes('patrícia')) paidFixedPatricia += val;
        }
      });
      
      const dailyThisMonth = state.dailyExpenses.filter(exp => exp.date.substring(0, 7) === activeMonth);
      let totalDaily = 0;
      let paidDailyFabricio = 0;
      let paidDailyPatricia = 0;
      dailyThisMonth.forEach(exp => {
        const val = parseFloat(exp.amount) || 0;
        totalDaily += val;
        const cardLower = (exp.card || '').toLowerCase();
        if (cardLower.includes('fabricio') || cardLower.includes('fabrício')) paidDailyFabricio += val;
        else if (cardLower.includes('patricia') || cardLower.includes('patrícia')) paidDailyPatricia += val;
      });
      
      const totalShared = totalFixed + totalDaily;
      const targetFabricio = totalShared * (salaryFabricio / totalSalary);
      const targetPatricia = totalShared * (salaryPatricia / totalSalary);
      const paidFabricio = paidFixedFabricio + paidDailyFabricio;
      const paidPatricia = paidFixedPatricia + paidDailyPatricia;
      
      let reconText = '';
      if (paidFabricio > targetFabricio) {
        reconText = `👩‍💼 Patrícia deve transferir <strong>${formatCurrency(paidFabricio - targetFabricio)}</strong> para Fabrício 👨‍💻`;
      } else if (paidPatricia > targetPatricia) {
        reconText = `👨‍💻 Fabrício deve transferir <strong>${formatCurrency(paidPatricia - targetPatricia)}</strong> para Patrícia 👩‍💼`;
      } else {
        reconText = `🎉 Contas perfeitamente equilibradas!`;
      }

      divisionContainer.innerHTML = `
        <div style="font-size: 0.85rem; color: var(--text-primary);">
          <div style="margin-bottom: 8px;">Proporção de Renda: Fabrício <strong>${pctFabricio.toFixed(1)}%</strong> | Patrícia <strong>${pctPatricia.toFixed(1)}%</strong></div>
          <div style="margin-bottom: 8px;">Total de Custos Compartilhados: <strong>${formatCurrency(totalShared)}</strong></div>
          <div style="display: flex; gap: 16px; margin-bottom: 12px;">
            <div style="flex: 1; border: 1px solid var(--border-color); padding: 8px; border-radius: 6px;">
              <strong>Fabrício:</strong> Meta ${formatCurrency(targetFabricio)} | Pago ${formatCurrency(paidFabricio)}
            </div>
            <div style="flex: 1; border: 1px solid var(--border-color); padding: 8px; border-radius: 6px;">
              <strong>Patrícia:</strong> Meta ${formatCurrency(targetPatricia)} | Pago ${formatCurrency(paidPatricia)}
            </div>
          </div>
          <div style="padding: 10px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; text-align: center; font-weight: bold;">
            ${reconText}
          </div>
        </div>
      `;
    } else {
      divisionContainer.innerHTML = '<div class="empty-state">Salários não cadastrados.</div>';
    }
  }

  // 1.6 Populate long-term goals for printing
  const goalsContainer = document.getElementById('print-goals-details');
  if (goalsContainer) {
    goalsContainer.innerHTML = '';
    const goals = (state.budgetLimits && state.budgetLimits._savingsGoals) ? state.budgetLimits._savingsGoals : [];
    if (goals.length === 0) {
      goalsContainer.innerHTML = '<div class="empty-state">Nenhum objetivo de longo prazo cadastrado.</div>';
    } else {
      goals.forEach(goal => {
        const target = parseFloat(goal.target) || 0;
        const current = parseFloat(goal.current) || 0;
        const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
        
        const itemHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding: 6px 0; font-size: 0.8rem;">
            <span><strong>${goal.name}</strong> (${pct}%)</span>
            <span>${formatCurrency(current)} / ${formatCurrency(target)}</span>
          </div>
        `;
        goalsContainer.insertAdjacentHTML('beforeend', itemHTML);
      });
    }
  }

  // 1.7 Populate categories breakdown for printing
  const categoriesContainer = document.getElementById('print-categories-details');
  if (categoriesContainer) {
    categoriesContainer.innerHTML = '';
    const categories = Object.keys(state.budgetLimits).filter(k => !k.startsWith('_'));
    let hasCategories = false;
    
    categories.forEach(cat => {
      const limit = parseFloat(state.budgetLimits[cat]) || 0;
      if (limit === 0) return;
      hasCategories = true;
      
      let totalSpent = state.dailyExpenses
        .filter(exp => exp.date.substring(0, 7) === activeMonth && exp.category === cat)
        .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
        
      const bills = state.fixedBills[activeMonth] || [];
      if (cat === 'Moradia') {
        const housingBills = ['💧 Água', '⚡ Luz', '🏠 Parcela Financiamento Casa', '🏢 Condomínio', '☀️ Luz Solar'];
        bills.forEach(bill => { if (housingBills.includes(bill.name)) totalSpent += parseFloat(bill.value) || 0; });
      } else if (cat === 'Transporte') {
        const transportBills = ['🚗 Financiamento Carro'];
        bills.forEach(bill => { if (transportBills.includes(bill.name)) totalSpent += parseFloat(bill.value) || 0; });
      } else if (cat === 'Saúde') {
        const healthBills = ['🏥 Plano de Saúde'];
        bills.forEach(bill => { if (healthBills.includes(bill.name)) totalSpent += parseFloat(bill.value) || 0; });
      } else if (cat === 'Seguros & Proteção') {
        const insuranceBills = ['🛡️ Seguro de Vida'];
        bills.forEach(bill => { if (insuranceBills.includes(bill.name)) totalSpent += parseFloat(bill.value) || 0; });
      }
      
      const pct = Math.round((totalSpent / limit) * 100) || 0;
      const itemHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding: 6px 0; font-size: 0.8rem;">
          <span><strong>${cat}</strong> (${pct}%)</span>
          <span>Gasto: ${formatCurrency(totalSpent)} / Limite: ${formatCurrency(limit)}</span>
        </div>
      `;
      categoriesContainer.insertAdjacentHTML('beforeend', itemHTML);
    });
    
    if (!hasCategories) {
      categoriesContainer.innerHTML = '<div class="empty-state">Nenhum limite definido.</div>';
    }
  }

  // 1. Populate fixed bills for printing
  const fixedContainer = document.getElementById('print-fixed-bills-list');
  if (fixedContainer) {
    fixedContainer.innerHTML = '';
    const bills = state.fixedBills[activeMonth] || [];
    if (bills.length === 0) {
      fixedContainer.innerHTML = '<div class="empty-state">Nenhuma conta fixa registrada para este mês.</div>';
    } else {
      bills.forEach(bill => {
        const itemHTML = `
          <div class="bill-item-card ${bill.paid ? 'paid' : ''}" style="margin: 4px 0; border-left: 4px solid ${bill.paid ? 'var(--success)' : 'var(--warning)'}; opacity: 1; min-height: auto; padding: 10px 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
              <div>
                <strong style="font-size: 0.9rem; color: var(--text-primary);">${bill.name}</strong>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">Vence dia ${bill.dueDate} | Pago via: ${bill.card}</div>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <span class="projection-tag ${bill.paid ? 'success' : 'warning'}" style="font-size: 0.7rem; font-weight: bold; padding: 2px 6px; border-radius: 4px;">${bill.paid ? 'PAGO' : 'PENDENTE'}</span>
                <strong style="font-size: 0.9rem; color: var(--text-primary);">${formatCurrency(bill.value)}</strong>
              </div>
            </div>
          </div>
        `;
        fixedContainer.insertAdjacentHTML('beforeend', itemHTML);
      });
    }
  }

  // 2. Populate daily expenses for printing
  const dailyContainer = document.getElementById('print-daily-expenses-list');
  if (dailyContainer) {
    dailyContainer.innerHTML = '';
    const dailyThisMonth = state.dailyExpenses.filter(exp => exp.date.substring(0, 7) === activeMonth);
    dailyThisMonth.sort((a, b) => b.date.localeCompare(a.date));
    
    if (dailyThisMonth.length === 0) {
      dailyContainer.innerHTML = '<div class="empty-state">Nenhum gasto diário registrado para este mês.</div>';
    } else {
      dailyThisMonth.forEach(exp => {
        const expDateFormatted = exp.date.split('-').reverse().join('/');
        const highlightedDesc = exp.desc.replace(/(#[a-zA-Z0-9_]+)/g, '<span class="hashtag-highlight">$1</span>');
        const itemHTML = `
          <div class="tx-item" style="margin: 4px 0; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 0.85rem; font-weight: bold; color: var(--text-primary);">${highlightedDesc}</div>
              <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 2px;">
                <span style="background-color: var(--border-color); padding: 1px 4px; border-radius: 3px;">${expDateFormatted}</span>
                <span style="margin-left: 8px;">📁 ${exp.category === 'Outros' && exp.specify ? `Outros (${exp.specify})` : exp.category}</span>
                <span style="margin-left: 8px;">💳 ${exp.card}</span>
              </div>
            </div>
            <strong style="font-size: 0.9rem; color: var(--danger);">${formatCurrency(exp.amount)}</strong>
          </div>
        `;
        dailyContainer.insertAdjacentHTML('beforeend', itemHTML);
      });
    }
  }

  // 3. Show printing area
  const printBlock = document.getElementById('print-only-details');
  if (printBlock) printBlock.style.display = 'block';

  // Toggle active tab to dashboard for print rendering
  const currentActiveScreen = document.querySelector('.app-screen.active');
  const currentActiveNav = document.querySelector('.nav-btn.active');
  const dashboardScreen = document.getElementById('dashboard-screen');
  const dashboardNav = document.querySelector('.nav-btn[data-tab="dashboard-screen"]');

  if (currentActiveScreen && currentActiveScreen.id !== 'dashboard-screen') {
    if (currentActiveNav) currentActiveNav.classList.remove('active');
    if (dashboardNav) dashboardNav.classList.add('active');
    currentActiveScreen.classList.remove('active');
    if (dashboardScreen) dashboardScreen.classList.add('active');
  }

  renderCharts();

  setTimeout(() => {
    window.print();
    
    // Restore state
    if (printBlock) printBlock.style.display = 'none';
    if (currentActiveScreen && currentActiveScreen.id !== 'dashboard-screen') {
      if (dashboardNav) dashboardNav.classList.remove('active');
      if (currentActiveNav) currentActiveNav.classList.add('active');
      if (dashboardScreen) dashboardScreen.classList.remove('active');
      currentActiveScreen.classList.add('active');
      renderCharts();
    }
  }, 250);
}

/* Simulator Logic */
function setupSimulator() {
  const form = document.getElementById('simulator-form');
  if (!form) return;

  const clearBtn = document.getElementById('clear-sim-btn');
  const resultsContainer = document.getElementById('sim-results-container');
  const projectionList = document.getElementById('sim-projection-list');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('sim-amount').value) || 0;
    const installments = parseInt(document.getElementById('sim-installments').value) || 1;
    const category = document.getElementById('sim-category').value;
    const startMonthVal = document.getElementById('sim-start-month').value;
    const desc = document.getElementById('sim-desc').value.trim();

    if (amount <= 0 || installments <= 0 || !startMonthVal) {
      alert('Por favor, preencha os dados da simulação corretamente.');
      return;
    }

    const installmentValue = amount / installments;
    const [startYear, startMonth] = startMonthVal.split('-').map(Number);

    projectionList.innerHTML = '';
    const income = (parseFloat(state.salaryFabricio) || 0) + (parseFloat(state.salaryPatricia) || 0) + (parseFloat(state.extraIncome) || 0);

    for (let i = 0; i < 12; i++) {
      let m = startMonth + i;
      let y = startYear;
      if (m > 12) {
        y += Math.floor((m - 1) / 12);
        m = ((m - 1) % 12) + 1;
      }
      const mKey = `${y}-${String(m).padStart(2, '0')}`;

      // Sum existing daily expenses for mKey
      const dailyExpThisMonth = state.dailyExpenses.filter(exp => exp.date.substring(0, 7) === mKey);
      let existingDaily = dailyExpThisMonth.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

      // Sum existing paid fixed bills for mKey (use defaults if none exist)
      const bills = state.fixedBills[mKey] || defaultFixedBillsTemplate;
      const existingFixed = bills.reduce((sum, bill) => sum + (parseFloat(bill.value) || 0), 0);

      // Category specific expenses sum (for limit check)
      let catExpenses = dailyExpThisMonth.filter(exp => exp.category === category)
                                         .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
      
      if (category === 'Moradia') {
        const housingBills = ['💧 Água', '⚡ Luz', '🏠 Parcela Financiamento Casa', '🏢 Condomínio', '☀️ Luz Solar'];
        bills.forEach(bill => { if (housingBills.includes(bill.name)) catExpenses += (parseFloat(bill.value) || 0); });
      } else if (category === 'Transporte') {
        const transportBills = ['🚗 Financiamento Carro'];
        bills.forEach(bill => { if (transportBills.includes(bill.name)) catExpenses += (parseFloat(bill.value) || 0); });
      } else if (category === 'Saúde') {
        const healthBills = ['🏥 Plano de Saúde'];
        bills.forEach(bill => { if (healthBills.includes(bill.name)) catExpenses += (parseFloat(bill.value) || 0); });
      } else if (category === 'Seguros & Proteção') {
        const insuranceBills = ['🛡️ Seguro de Vida'];
        bills.forEach(bill => { if (insuranceBills.includes(bill.name)) catExpenses += (parseFloat(bill.value) || 0); });
      }

      // Check if simulation installment applies to this month
      let simInstallmentApply = 0;
      let isSimulatedMonth = false;
      const simStartAbs = startYear * 12 + startMonth;
      const currentAbs = y * 12 + m;
      if (currentAbs >= simStartAbs && currentAbs < simStartAbs + installments) {
        simInstallmentApply = installmentValue;
        isSimulatedMonth = true;
      }

      const projectedExpenses = existingDaily + existingFixed + simInstallmentApply;
      const projectedBalance = income - projectedExpenses;
      const categoryLimit = parseFloat(state.budgetLimits[category]) || 0;
      const projectedCatSpent = catExpenses + simInstallmentApply;

      // Status tags
      let statusTag = '';
      if (projectedExpenses > income) {
        statusTag = `<span class="projection-tag danger">ESTOURO DE SALDO</span>`;
      } else if (projectedExpenses >= 0.85 * income) {
        statusTag = `<span class="projection-tag warning">ALERTA DE CAIXA</span>`;
      } else {
        statusTag = `<span class="projection-tag success">SALDO SAUDÁVEL</span>`;
      }

      let catLimitAlert = '';
      if (categoryLimit > 0 && projectedCatSpent > categoryLimit) {
        const diff = projectedCatSpent - categoryLimit;
        catLimitAlert = `<div style="font-size: 0.7rem; color: var(--danger); margin-top: 2px;">⚠️ Limite de ${category} excedido em ${formatCurrency(diff)}!</div>`;
      }

      const monthsShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthLabel = `${monthsShort[m - 1]}/${String(y).substring(2)}`;

      const rowHTML = `
        <div class="projection-item" style="${isSimulatedMonth ? 'border-left: 4px solid var(--primary); background-color: rgba(33,150,243,0.03);' : ''}">
          <div>
            <div class="projection-month-title">${monthLabel} ${isSimulatedMonth ? '⚡' : ''}</div>
            <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 2px;">
              Atual: ${formatCurrency(existingDaily + existingFixed)} 
              ${simInstallmentApply > 0 ? `| Simulador: +${formatCurrency(simInstallmentApply)}` : ''}
            </div>
            ${catLimitAlert}
          </div>
          <div class="projection-values-wrapper">
            <strong style="color: ${projectedBalance < 0 ? 'var(--danger)' : 'var(--text-primary)'};">${formatCurrency(projectedBalance)} sobra</strong>
            ${statusTag}
          </div>
        </div>
      `;
      projectionList.insertAdjacentHTML('beforeend', rowHTML);
    }

    resultsContainer.classList.remove('hidden');
    clearBtn.classList.remove('hidden');
  });

  clearBtn.addEventListener('click', () => {
    form.reset();
    projectionList.innerHTML = '';
    resultsContainer.classList.add('hidden');
    clearBtn.classList.add('hidden');
  });
}

/* Bank Statement Import Logic (OFX / CSV) */
function setupImportStatement() {
  const dropZone = document.getElementById('import-drop-zone');
  const fileInput = document.getElementById('import-statement-file');
  const reconciliationArea = document.getElementById('reconciliation-area');
  const tbody = document.getElementById('reconciliation-tbody');
  const confirmBtn = document.getElementById('confirm-import-btn');
  const cancelBtn = document.getElementById('cancel-import-btn');
  const selectAllCheckbox = document.getElementById('import-select-all');
  const countLabel = document.getElementById('import-count-label');

  if (!dropZone) return;

  let parsedTransactions = [];
  let currentImportFileName = '';

  dropZone.addEventListener('click', () => fileInput.click());
  
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  function handleFile(file) {
    currentImportFileName = file.name;
    const reader = new FileReader();
    const ext = file.name.split('.').pop().toLowerCase();
    
    reader.onload = function(evt) {
      const text = evt.target.result;
      let rawTxs = [];
      
      if (ext === 'ofx') {
        rawTxs = parseOFX(text);
      } else if (ext === 'csv') {
        rawTxs = parseCSV(text);
      } else {
        showToast('Formato de arquivo não suportado. Use apenas OFX ou CSV.', 'danger');
        return;
      }

      parsedTransactions = rawTxs
        .filter(t => t.amount < 0)
        .map((t, idx) => ({
          id: `imp_${Date.now()}_${idx}`,
          date: t.date,
          desc: t.desc,
          amount: Math.abs(t.amount),
          category: autoCategorize(t.desc),
          card: state.cards[0] || 'Cartão Principal',
          specify: ''
        }));

      const invertCheckbox = document.getElementById('import-invert-values');
      let shouldInvert = invertCheckbox ? invertCheckbox.checked : false;

      // Auto-detecção de extrato de cartão (valores positivos):
      // Se não houver despesas negativas mas houver valores positivos no arquivo, assumimos como extrato de cartão de crédito.
      const hasNegative = rawTxs.some(t => t.amount < 0);
      const hasPositive = rawTxs.some(t => t.amount > 0);
      if (!hasNegative && hasPositive) {
        shouldInvert = true;
        if (invertCheckbox) invertCheckbox.checked = true;
      }

      // Auto-detect the primary month of the statement (the mode of transaction months)
      const monthCounts = {};
      rawTxs.forEach(t => {
        const m = t.date.substring(0, 7); // YYYY-MM
        monthCounts[m] = (monthCounts[m] || 0) + 1;
      });
      let statementMonth = '';
      let maxCount = 0;
      for (const [m, count] of Object.entries(monthCounts)) {
        if (count > maxCount) {
          maxCount = count;
          statementMonth = m;
        }
      }

      let lastDayStr = '';
      if (statementMonth) {
        const [yr, mn] = statementMonth.split('-').map(Number);
        const lastDayDate = new Date(yr, mn, 0); // Day 0 of next month is last day of current month
        lastDayStr = `${yr}-${String(mn).padStart(2, '0')}-${String(lastDayDate.getDate()).padStart(2, '0')}`;
      }

      const adjustCheckbox = document.getElementById('import-adjust-dates');
      const shouldAdjust = adjustCheckbox ? adjustCheckbox.checked : false;

      parsedTransactions = rawTxs
        .filter(t => shouldInvert ? t.amount > 0 : t.amount < 0)
        .map((t, idx) => {
          let txDate = t.date;
          // If transaction date is after the statement's primary month and adjustment is checked, force it to last day of statement month
          if (shouldAdjust && statementMonth && t.date.substring(0, 7) > statementMonth) {
            txDate = lastDayStr;
          }
          return {
            id: `imp_${Date.now()}_${idx}`,
            date: txDate,
            desc: t.desc,
            amount: Math.abs(t.amount),
            category: autoCategorize(t.desc),
            card: state.cards[0] || 'Cartão Principal',
            specify: ''
          };
        });

      if (parsedTransactions.length === 0) {
        if (rawTxs.length > 0) {
          showToast('Nenhuma transação encontrada com o sinal atual. Se for um extrato de cartão, tente marcar "Inverter Valores"!', 'warning');
        } else {
          showToast('Nenhuma despesa foi encontrada no arquivo com as configurações atuais.', 'warning');
        }
        return;
      }

      showToast(`Arquivo "${file.name}" carregado com sucesso! ${parsedTransactions.length} transações encontradas para conciliação.`, 'success');
      renderReconciliationTable();
    };
    reader.readAsText(file);
  }

  function renderReconciliationTable() {
    tbody.innerHTML = '';
    
    parsedTransactions.forEach((tx, index) => {
      let catOptions = '';
      const categories = Object.keys(state.budgetLimits).filter(k => !k.startsWith('_'));
      categories.forEach(cat => {
        catOptions += `<option value="${cat}" ${tx.category === cat ? 'selected' : ''}>${cat}</option>`;
      });

      let cardOptions = '';
      state.cards.forEach(card => {
        cardOptions += `<option value="${card}" ${tx.card === card ? 'selected' : ''}>${card}</option>`;
      });

      const rowHTML = `
        <tr id="row_${tx.id}">
          <td data-label="Selecionar" style="padding: 8px; text-align: center; border-bottom: 1px solid var(--border-color);">
            <input type="checkbox" class="import-row-checkbox" checked data-id="${tx.id}" onchange="updateImportCount()">
          </td>
          <td data-label="Data" style="padding: 8px; border-bottom: 1px solid var(--border-color); white-space: nowrap;">
            <input type="date" value="${tx.date}" style="padding:2px 4px; font-size:0.75rem;" onchange="updateImportTxData('${tx.id}', 'date', this.value)">
          </td>
          <td data-label="Descrição" style="padding: 8px; border-bottom: 1px solid var(--border-color);">
            <input type="text" value="${tx.desc}" style="padding:2px 4px; font-size:0.75rem;" onchange="updateImportTxData('${tx.id}', 'desc', this.value)">
          </td>
          <td data-label="Valor" style="padding: 8px; border-bottom: 1px solid var(--border-color); font-weight: bold; color: var(--danger);">
            R$ <input type="number" step="0.01" value="${tx.amount.toFixed(2)}" style="padding:2px 4px; font-size:0.75rem; width: 60px; text-align:right;" onchange="updateImportTxData('${tx.id}', 'amount', this.value)">
          </td>
          <td data-label="Categoria" style="padding: 8px; border-bottom: 1px solid var(--border-color);">
            <select style="padding:2px 4px; font-size:0.75rem; width: 100%;" onchange="onImportCategoryChange('${tx.id}', this.value)">
              ${catOptions}
            </select>
            <input type="text" id="specify_input_${tx.id}" placeholder="Especificar..." value="${tx.specify || ''}" class="import-specify-input ${tx.category === 'Outros' ? '' : 'hidden'}" style="padding:2px 4px; font-size:0.7rem; width: 100%; margin-top: 4px;" onchange="updateImportTxData('${tx.id}', 'specify', this.value)">
          </td>
          <td data-label="Cartão" style="padding: 8px; border-bottom: 1px solid var(--border-color);">
            <select style="padding:2px 4px; font-size:0.75rem;" onchange="updateImportTxData('${tx.id}', 'card', this.value)">
              ${cardOptions}
            </select>
          </td>
        </tr>
      `;
      tbody.insertAdjacentHTML('beforeend', rowHTML);
    });

    reconciliationArea.classList.remove('hidden');
    selectAllCheckbox.checked = true;
    updateImportCount();
    
    // Clear search filter input on reload
    const searchFilter = document.getElementById('import-search-filter');
    if (searchFilter) searchFilter.value = '';

    // Populate bulk cards select list
    const bulkCardSelect = document.getElementById('bulk-card-select');
    if (bulkCardSelect) {
      bulkCardSelect.innerHTML = '<option value="">Cartão...</option>';
      state.cards.forEach(card => {
        const option = document.createElement('option');
        option.value = card;
        option.textContent = card;
        bulkCardSelect.appendChild(option);
      });
    }
  }

  window.onImportCategoryChange = function(txId, category) {
    updateImportTxData(txId, 'category', category);
    const specifyInput = document.getElementById(`specify_input_${txId}`);
    if (specifyInput) {
      if (category === 'Outros') {
        specifyInput.classList.remove('hidden');
      } else {
        specifyInput.classList.add('hidden');
        updateImportTxData(txId, 'specify', '');
        specifyInput.value = '';
      }
    }
  };

  window.applyBulkCategory = function() {
    const select = document.getElementById('bulk-category-select');
    const category = select ? select.value : '';
    if (!category) {
      showToast('Selecione uma categoria para aplicar em lote.', 'warning');
      return;
    }
    
    const checkedBoxes = document.querySelectorAll('.import-row-checkbox:checked');
    if (checkedBoxes.length === 0) {
      showToast('Nenhuma transação selecionada.', 'warning');
      return;
    }
    
    checkedBoxes.forEach(box => {
      const id = box.getAttribute('data-id');
      const tx = parsedTransactions.find(t => t.id === id);
      if (tx) {
        tx.category = category;
        const row = document.getElementById(`row_${id}`);
        if (row) {
          const selects = row.querySelectorAll('select');
          if (selects[0]) selects[0].value = category;
          
          const specifyInput = document.getElementById(`specify_input_${id}`);
          if (specifyInput) {
            if (category === 'Outros') {
              specifyInput.classList.remove('hidden');
            } else {
              specifyInput.classList.add('hidden');
              tx.specify = '';
              specifyInput.value = '';
            }
          }
        }
      }
    });
  };

  window.applyBulkCard = function() {
    const select = document.getElementById('bulk-card-select');
    const card = select ? select.value : '';
    if (!card) {
      showToast('Selecione um cartão para aplicar em lote.', 'warning');
      return;
    }
    
    const checkedBoxes = document.querySelectorAll('.import-row-checkbox:checked');
    if (checkedBoxes.length === 0) {
      showToast('Nenhuma transação selecionada.', 'warning');
      return;
    }
    
    checkedBoxes.forEach(box => {
      const id = box.getAttribute('data-id');
      const tx = parsedTransactions.find(t => t.id === id);
      if (tx) {
        tx.card = card;
        const row = document.getElementById(`row_${id}`);
        if (row) {
          const selects = row.querySelectorAll('select');
          if (selects[1]) selects[1].value = card;
        }
      }
    });
  };

  window.filterImportTable = function() {
    const filterVal = document.getElementById('import-search-filter').value.toLowerCase().trim();
    const rows = document.querySelectorAll('#reconciliation-tbody tr');
    
    rows.forEach(row => {
      const textInputs = row.querySelectorAll('input[type="text"]');
      const desc = textInputs[0] ? textInputs[0].value.toLowerCase() : '';
      
      if (desc.includes(filterVal)) {
        row.classList.remove('hidden');
      } else {
        row.classList.add('hidden');
      }
    });
  };

  window.updateImportTxData = function(txId, field, value) {
    const tx = parsedTransactions.find(t => t.id === txId);
    if (tx) {
      if (field === 'amount') {
        tx.amount = parseFloat(value) || 0;
      } else {
        tx[field] = value;
      }
    }
  };

  window.updateImportCount = function() {
    const checkedBoxes = document.querySelectorAll('.import-row-checkbox:checked');
    countLabel.textContent = `${checkedBoxes.length} selecionadas`;
  };

  selectAllCheckbox.addEventListener('change', (e) => {
    const boxes = document.querySelectorAll('.import-row-checkbox');
    boxes.forEach(box => box.checked = e.target.checked);
    updateImportCount();
  });

  confirmBtn.addEventListener('click', async () => {
    const checkedBoxes = document.querySelectorAll('.import-row-checkbox:checked');
    if (checkedBoxes.length === 0) {
      showToast('Nenhuma transação selecionada para importação.', 'warning');
      return;
    }

    if (!loggedInUserId) {
      showToast('Você precisa estar logado para realizar a importação.', 'warning');
      return;
    }

    const toImport = [];
    const toDeleteIds = [];
    const duplicateQueue = [];

    checkedBoxes.forEach(box => {
      const id = box.getAttribute('data-id');
      const tx = parsedTransactions.find(t => t.id === id);
      if (tx && tx.amount > 0) {
        // Search for manual expense with same amount
        const duplicate = state.dailyExpenses.find(exp => Math.abs(exp.amount - tx.amount) < 0.01);
        if (duplicate) {
          duplicateQueue.push({ tx, duplicate });
        } else {
          toImport.push(tx);
        }
      }
    });

    if (duplicateQueue.length > 0) {
      resolveDuplicates(duplicateQueue, toImport, toDeleteIds);
    } else {
      await saveImportedTransactions(toImport, toDeleteIds);
    }
  });

  function resolveDuplicates(queue, toImport, toDeleteIds) {
    const modal = document.getElementById('reconciliation-modal');
    
    function processNext() {
      if (queue.length === 0) {
        modal.classList.add('hidden');
        saveImportedTransactions(toImport, toDeleteIds);
        return;
      }
      
      const { tx, duplicate } = queue.shift();
      
      // Populate modal
      document.getElementById('rec-manual-date').textContent = duplicate.date.split('-').reverse().join('/');
      document.getElementById('rec-manual-desc').textContent = duplicate.desc;
      document.getElementById('rec-manual-cat').textContent = duplicate.category === 'Outros' && duplicate.specify ? `Outros (${duplicate.specify})` : duplicate.category;
      document.getElementById('rec-manual-amount').textContent = formatCurrency(duplicate.amount);
      
      document.getElementById('rec-import-date').textContent = tx.date.split('-').reverse().join('/');
      document.getElementById('rec-import-desc').textContent = tx.desc;
      document.getElementById('rec-import-cat').textContent = tx.category === 'Outros' && tx.specify ? `Outros (${tx.specify})` : tx.category;
      document.getElementById('rec-import-amount').textContent = formatCurrency(tx.amount);
      
      // Show modal
      modal.classList.remove('hidden');
      
      const btnKeepManual = document.getElementById('btn-keep-manual');
      const btnKeepImport = document.getElementById('btn-keep-import');
      const btnKeepBoth = document.getElementById('btn-keep-both');
      
      const cleanUpAndNext = (action) => {
        // Remove event listeners by cloning buttons
        const newKeepManual = btnKeepManual.cloneNode(true);
        const newKeepImport = btnKeepImport.cloneNode(true);
        const newKeepBoth = btnKeepBoth.cloneNode(true);
        
        btnKeepManual.parentNode.replaceChild(newKeepManual, btnKeepManual);
        btnKeepImport.parentNode.replaceChild(newKeepImport, btnKeepImport);
        btnKeepBoth.parentNode.replaceChild(newKeepBoth, btnKeepBoth);
        
        if (action === 'keep-import') {
          toDeleteIds.push(duplicate.id);
          toImport.push(tx);
        } else if (action === 'keep-both') {
          toImport.push(tx);
        }
        
        processNext();
      };
      
      document.getElementById('btn-keep-manual').addEventListener('click', () => cleanUpAndNext('keep-manual'));
      document.getElementById('btn-keep-import').addEventListener('click', () => cleanUpAndNext('keep-import'));
      document.getElementById('btn-keep-both').addEventListener('click', () => cleanUpAndNext('keep-both'));
    }
    
    processNext();
  }

  async function saveImportedTransactions(toImport, toDeleteIds) {
    if (toImport.length === 0 && toDeleteIds.length === 0) {
      showToast('Nenhuma transação importada ou alterada.', 'warning');
      resetImport();
      return;
    }

    // Learn new categorization rules based on user manual adjustments during import
    const newRules = [];
    if (loggedInUserId) {
      if (!state.budgetLimits) state.budgetLimits = {};
      if (!state.budgetLimits._autoCategorizeRules) {
        state.budgetLimits._autoCategorizeRules = [];
      }

      toImport.forEach(tx => {
        const initialGuess = autoCategorize(tx.desc);
        if (tx.category !== initialGuess) {
          // Extract a clean keyword
          let cleanKeyword = tx.desc
            .replace(/\d+/g, '') // remove numbers
            .replace(/[^\w\sÀ-ÿ]/g, '') // remove special characters
            .trim();
          // Keep words with at least 3 letters
          const words = cleanKeyword.split(/\s+/).filter(w => w.length >= 3);
          if (words.length > 0) {
            const keyword = words.slice(0, 3).join(' '); // first 3 words
            // Verify if rule already exists
            const exists = state.budgetLimits._autoCategorizeRules.some(r => r.keyword.toLowerCase() === keyword.toLowerCase());
            if (!exists && keyword.length >= 3) {
              state.budgetLimits._autoCategorizeRules.push({
                keyword: keyword,
                category: tx.category
              });
              newRules.push({ keyword, category: tx.category });
            }
          }
        }
      });
    }

    const batchId = 'batch_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const fileTag = 'file_' + (currentImportFileName || 'extrato').replace(/[^a-zA-Z0-9.-]/g, '_');

    const tempExpenses = [];
    const dbExpenses = [];

    toImport.forEach(tx => {
      const newId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      
      tempExpenses.push({
        id: newId,
        amount: tx.amount,
        date: tx.date,
        desc: tx.desc,
        category: tx.category,
        card: tx.card,
        specify: tx.specify || '',
        tags: [batchId, fileTag]
      });

      dbExpenses.push({
        id: newId,
        user_id: loggedInUserId,
        amount: tx.amount,
        date: tx.date,
        desc: tx.desc,
        category: tx.category,
        card: tx.card,
        specify: tx.specify || '',
        tags: [batchId, fileTag]
      });
    });

    try {
      if (toDeleteIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('daily_expenses')
          .delete()
          .in('id', toDeleteIds)
          .eq('user_id', loggedInUserId);

        if (deleteError) throw deleteError;

        state.dailyExpenses = state.dailyExpenses.filter(e => !toDeleteIds.includes(e.id));
      }

      if (dbExpenses.length > 0) {
        const { error: insertError } = await supabase
          .from('daily_expenses')
          .insert(dbExpenses);

        if (insertError) throw insertError;

        state.dailyExpenses.push(...tempExpenses);
      }

      // If we learned new rules, save user settings to DB
      if (newRules.length > 0) {
        const { error: settingsError } = await supabase
          .from('user_settings')
          .upsert({
            user_id: loggedInUserId,
            salary_fabricio: state.salaryFabricio,
            salary_patricia: state.salaryPatricia,
            extra_income: state.extraIncome,
            cards: state.cards,
            savings_goal_type: state.savingsGoalType,
            savings_goal_value: state.savingsGoalValue,
            budget_limits: state.budgetLimits
          });
        if (settingsError) console.error('Erro ao salvar novas regras:', settingsError);
      }

      saveState();
      updateUI();
      
      let msg = '';
      if (tempExpenses.length > 0) {
        msg += `${tempExpenses.length} transações importadas. `;
      }
      if (toDeleteIds.length > 0) {
        msg += `${toDeleteIds.length} lançamentos duplicados removidos. `;
      }
      if (newRules.length > 0) {
        msg += `Aprendidas ${newRules.length} regras automáticas. `;
      }
      showToast(msg + 'Sincronizado com sucesso!', 'success');
      resetImport();
    } catch (err) {
      console.error('Erro ao salvar transações importadas no Supabase:', err);
      showToast('Erro ao sincronizar importação: ' + err.message, 'danger');
    }
  }

  cancelBtn.addEventListener('click', async () => {
    if (await showConfirmModal('Deseja cancelar a importação atual?', { title: 'Cancelar Importação' })) {
      resetImport();
    }
  });

  function resetImport() {
    parsedTransactions = [];
    tbody.innerHTML = '';
    reconciliationArea.classList.add('hidden');
    fileInput.value = '';
    renderImportHistory();
  }

  function getImportBatches() {
    const batches = {};
    state.dailyExpenses.forEach(exp => {
      if (exp.tags && Array.isArray(exp.tags)) {
        const batchTag = exp.tags.find(t => t.startsWith('batch_'));
        const fileTag = exp.tags.find(t => t.startsWith('file_'));
        if (batchTag) {
          if (!batches[batchTag]) {
            let fileName = 'Extrato Importado';
            if (fileTag) {
              fileName = fileTag.replace(/^file_/, '');
              const parts = fileName.split('_');
              if (parts.length > 1) {
                const ext = parts[parts.length - 1];
                if (ext === 'csv' || ext === 'ofx') {
                  parts[parts.length - 1] = '.' + ext;
                  fileName = parts.slice(0, -1).join(' ') + parts[parts.length - 1];
                } else {
                  fileName = parts.join(' ');
                }
              } else {
                fileName = fileName.replace(/_/g, ' ');
              }
            }
            
            batches[batchTag] = {
              id: batchTag,
              fileName: fileName,
              count: 0,
              amount: 0,
              date: ''
            };
            
            const timestampStr = batchTag.replace(/^batch_/, '');
            const timeBase36 = timestampStr.substring(0, 8);
            try {
              const ms = parseInt(timeBase36, 36);
              if (!isNaN(ms)) {
                batches[batchTag].date = new Date(ms).toLocaleString('pt-BR');
              }
            } catch (e) {}
          }
          batches[batchTag].count += 1;
          batches[batchTag].amount += exp.amount;
        }
      }
    });
    return Object.values(batches).sort((a, b) => b.id.localeCompare(a.id));
  }

  function renderImportHistory() {
    const listContainer = document.getElementById('import-history-list');
    const areaContainer = document.getElementById('import-history-area');
    if (!listContainer || !areaContainer) return;

    const batches = getImportBatches();
    if (batches.length === 0) {
      areaContainer.classList.add('hidden');
      return;
    }

    areaContainer.classList.remove('hidden');
    listContainer.innerHTML = '';

    batches.forEach(batch => {
      const itemHTML = `
        <div style="background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">📂 ${batch.fileName}</div>
            <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 2px;">
              📅 ${batch.date} | 📊 ${batch.count} lançamentos | 💰 Total: ${formatCurrency(batch.amount)}
            </div>
          </div>
          <button type="button" class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.7rem; background-color: rgba(230, 57, 70, 0.1); color: var(--danger); border: 1px solid rgba(230, 57, 70, 0.2);" onclick="deleteImportBatch('${batch.id}', '${batch.fileName.replace(/'/g, "\\'")}')">
            🗑️ Excluir
          </button>
        </div>
      `;
      listContainer.insertAdjacentHTML('beforeend', itemHTML);
    });
  }

  async function deleteImportBatch(batchId, fileName) {
    if (await showConfirmModal(`Deseja realmente excluir todas as transações importadas do arquivo "${fileName}"? Isso removerá permanentemente os lançamentos.`, { title: 'Excluir Importação' })) {
      const toDeleteIds = state.dailyExpenses
        .filter(exp => exp.tags && exp.tags.includes(batchId))
        .map(exp => exp.id);
        
      if (toDeleteIds.length === 0) return;
      
      try {
        const { error } = await supabase
          .from('daily_expenses')
          .delete()
          .in('id', toDeleteIds)
          .eq('user_id', loggedInUserId);
          
        if (error) throw error;
        
        state.dailyExpenses = state.dailyExpenses.filter(exp => !toDeleteIds.includes(exp.id));
        saveState();
        updateUI();
        showToast(`${toDeleteIds.length} transações excluídas com sucesso!`, 'success');
      } catch (err) {
        console.error('Erro ao excluir lote de importação:', err);
        showToast('Erro ao excluir lote: ' + err.message, 'danger');
      }
    }
  }

  // Expose methods to global scope
  window.deleteImportBatch = deleteImportBatch;
  window.getImportBatches = getImportBatches;
  window.renderImportHistory = renderImportHistory;

  // Render on load
  renderImportHistory();
}

function parseOFX(text) {
  text = text.replace(/^\uFEFF/, '');
  const transactions = [];
  const regex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const block = match[1];
    const trnamtMatch = block.match(/<TRNAMT>([\d.-]+)/i);
    const memoMatch = block.match(/<MEMO>([^<\r\n]+)/i) || block.match(/<NAME>([^<\r\n]+)/i);
    const dtpostedMatch = block.match(/<DTPOSTED>(\d{8})/i);

    if (trnamtMatch && memoMatch && dtpostedMatch) {
      const amount = parseFloat(trnamtMatch[1]);
      const desc = memoMatch[1].trim();
      const rawDate = dtpostedMatch[1];
      
      const year = rawDate.substring(0, 4);
      const month = rawDate.substring(4, 6);
      const day = rawDate.substring(6, 8);
      const formattedDate = `${year}-${month}-${day}`;

      transactions.push({
        date: formattedDate,
        desc: desc,
        amount: amount
      });
    }
  }
  return transactions;
}

function parseCSV(text) {
  text = text.replace(/^\uFEFF/, '');
  const transactions = [];
  const lines = text.split(/\r?\n/);
  if (lines.length === 0) return [];
  
  const cleanLines = lines.map(line => line.trim()).filter(line => line.length > 0);
  if (cleanLines.length <= 1) return [];

  const sampleLine = cleanLines[1];
  const delimiter = (sampleLine.split(';').length > sampleLine.split(',').length) ? ';' : ',';
  const header = cleanLines[0].toLowerCase().split(delimiter);
  
  let dateIdx = header.findIndex(h => h.includes('data') || h.includes('date'));
  let descIdx = header.findIndex(h => h.includes('desc') || h.includes('memo') || h.includes('nome') || h.includes('historico') || h.includes('histórico') || h.includes('name'));
  let valIdx = header.findIndex(h => h.includes('valor') || h.includes('val') || h.includes('amount') || h.includes('quant') || h.includes('preco') || h.includes('preço'));

  if (dateIdx === -1) dateIdx = 0;
  if (descIdx === -1) descIdx = 1;
  if (valIdx === -1) valIdx = 2;

  for (let i = 1; i < cleanLines.length; i++) {
    const cols = cleanLines[i].split(delimiter);
    if (cols.length <= Math.max(dateIdx, descIdx, valIdx)) continue;

    const rawDate = cols[dateIdx].trim();
    const desc = cols[descIdx].trim().replace(/^"(.*)"$/, '$1');
    let rawVal = cols[valIdx].trim().replace(/^"(.*)"$/, '$1');

    // Clean value: remove R$, spaces, and handle currency decimals robustly
    let cleanVal = rawVal.replace(/R\$/gi, '').replace(/\s/g, '');
    if (cleanVal.includes(',')) {
      cleanVal = cleanVal.replace(/\./g, '').replace(/,/g, '.');
    }
    cleanVal = cleanVal.replace(/[^\d.-]/g, '');
    const amount = parseFloat(cleanVal);

    let formattedDate = '';
    if (rawDate.includes('/')) {
      const parts = rawDate.split('/');
      if (parts.length === 3) {
        let day, month, year;
        if (parts[2].length === 4 || (parts[2].length === 2 && parts[0].length <= 2)) {
          day = parts[0].padStart(2, '0');
          month = parts[1].padStart(2, '0');
          year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
        } else {
          year = parts[0].length === 2 ? '20' + parts[0] : parts[0];
          month = parts[1].padStart(2, '0');
          day = parts[2].padStart(2, '0');
        }
        formattedDate = `${year}-${month}-${day}`;
      }
    } else if (rawDate.includes('-')) {
      const parts = rawDate.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          formattedDate = rawDate;
        } else if (parts[0].length === 2 && parts[2].length === 4) {
          formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        } else if (parts[2].length === 2) {
          formattedDate = `20${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        } else if (parts[0].length === 2 && parts[2].length === 2) {
          formattedDate = `20${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        }
      }
    } else if (rawDate.includes('.')) {
      const parts = rawDate.split('.');
      if (parts.length === 3) {
        let day, month, year;
        if (parts[2].length === 4 || (parts[2].length === 2 && parts[0].length <= 2)) {
          day = parts[0].padStart(2, '0');
          month = parts[1].padStart(2, '0');
          year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
        } else {
          year = parts[0].length === 2 ? '20' + parts[0] : parts[0];
          month = parts[1].padStart(2, '0');
          day = parts[2].padStart(2, '0');
        }
        formattedDate = `${year}-${month}-${day}`;
      }
    }

    if (!isNaN(amount) && desc && formattedDate) {
      transactions.push({
        date: formattedDate,
        desc: desc,
        amount: amount
      });
    }
  }
  return transactions;
}

function autoCategorize(desc) {
  const d = desc.toLowerCase().trim();
  
  // 0. Check custom rules defined by the user
  if (state.budgetLimits && state.budgetLimits._autoCategorizeRules) {
    const customRules = state.budgetLimits._autoCategorizeRules;
    for (const rule of customRules) {
      if (rule.keyword && d.includes(rule.keyword.toLowerCase().trim())) {
        return rule.category;
      }
    }
  }

  // 1. Search history for previous occurrences of this description
  if (state.dailyExpenses && state.dailyExpenses.length > 0) {
    const matches = state.dailyExpenses.filter(exp => 
      exp.desc.toLowerCase().trim().includes(d) || d.includes(exp.desc.toLowerCase().trim())
    );
    
    if (matches.length > 0) {
      // Sort matches to find the most recent one
      matches.sort((a, b) => b.date.localeCompare(a.date));
      const recentCat = matches[0].category;
      
      // Ensure the category is still valid
      if (Object.keys(state.budgetLimits).includes(recentCat)) {
        return recentCat;
      }
    }
  }
  
  // Fallback to keyword-based regex rules
  if (d.includes('uber') || d.includes('99app') || d.includes('cabify') || d.includes('posto') || d.includes('combustivel') || d.includes('gasolina') || d.includes('pedagio')) {
    return 'Transporte';
  }
  if (d.includes('supermercado') || d.includes('carrefour') || d.includes('pao de acucar') || d.includes('mercado') || d.includes('sacolao') || d.includes('hortifruti') || d.includes('padaria') || d.includes('panificadora')) {
    return 'Alimentação';
  }
  if (d.includes('drogaria') || d.includes('farmacia') || d.includes('pague menos') || d.includes('hospital') || d.includes('unimed') || d.includes('clinica') || d.includes('medico') || d.includes('dentista') || d.includes('exame')) {
    return 'Saúde';
  }
  if (d.includes('mcdonald') || d.includes('bk ') || d.includes('burger king') || d.includes('pizza') || d.includes('ifood') || d.includes('restaurante') || d.includes('sushi') || d.includes('lanche') || d.includes('starbucks') || d.includes('cafe')) {
    return 'Lanches';
  }
  if (d.includes('almoco') || d.includes('almoço') || d.includes('quentinha') || d.includes('refeicao') || d.includes('refeição') || d.includes('restaurante trabalho') || d.includes('trabalho')) {
    return 'Alimentação Trabalho';
  }
  if (d.includes('netflix') || d.includes('spotify') || d.includes('disney') || d.includes('prime video') || d.includes('cinema') || d.includes('hbo') || d.includes('teatro') || d.includes('show') || d.includes('viagem') || d.includes('hotel') || d.includes('hospedagem')) {
    return 'Lazer & Assinaturas';
  }
  if (d.includes('seguro') || d.includes('porto seguro') || d.includes('azul seguro') || d.includes('allianz')) {
    return 'Seguros & Proteção';
  }
  if (d.includes('parcela financiamento') || d.includes('financiamento casa') || d.includes('aluguel') || d.includes('iptu') || d.includes('condominio') || d.includes('condomínio') || d.includes('agua') || d.includes('água') || d.includes('copasa') || d.includes('luz') || d.includes('cemig') || d.includes('energia') || d.includes('solar')) {
    return 'Moradia';
  }
  
  return 'Outros';
}

/* ==========================================================================
   FUNÇÕES AUXILIARES - MELHORIAS DE TAGS RÁPIDAS E MODELOS DE CONTAS
   ========================================================================== */

function renderQuickTagsChips() {
  const container = document.getElementById('quick-tags-chips');
  if (!container) return;
  container.innerHTML = '';

  // Agrega a contagem de tags para encontrar as mais frequentes
  const tagCounts = {};
  state.dailyExpenses.forEach(exp => {
    const descTags = exp.desc.match(/#[a-zA-Z0-9_]+/g) || [];
    const dedicatedTags = exp.tags ? (Array.isArray(exp.tags) ? exp.tags : exp.tags.split(/\s+/)) : [];
    const allTags = [...descTags, ...dedicatedTags];
    const uniqueTags = [...new Set(allTags)];
    uniqueTags.forEach(tag => {
      if (tag && tag.startsWith('#')) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    });
  });

  // Ordena por uso e pega as 10 principais
  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0])
    .slice(0, 10);

  // Sugestões padrão caso não existam tags cadastradas
  const suggestions = sortedTags.length > 0 ? sortedTags : ['#combustivel', '#mercado', '#viagem', '#lazer', '#saude'];

  suggestions.forEach(tag => {
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.textContent = tag;
    chip.addEventListener('click', () => {
      const tagsInput = document.getElementById('expense-tags');
      if (tagsInput) {
        let currentVal = tagsInput.value.trim();
        const tagList = currentVal ? currentVal.split(/\s+/) : [];
        if (!tagList.includes(tag)) {
          tagList.push(tag);
          tagsInput.value = tagList.join(' ') + ' ';
        } else {
          const index = tagList.indexOf(tag);
          tagList.splice(index, 1);
          tagsInput.value = tagList.join(' ') ? tagList.join(' ') + ' ' : '';
        }
        updateActiveChips();
      }
    });
    container.appendChild(chip);
  });
  
  updateActiveChips();
}

function updateActiveChips() {
  const tagsInput = document.getElementById('expense-tags');
  if (!tagsInput) return;
  const currentVal = tagsInput.value.toLowerCase().trim();
  const currentTags = currentVal ? currentVal.split(/[\s,]+/) : [];
  
  const chips = document.querySelectorAll('#quick-tags-chips .tag-chip');
  chips.forEach(chip => {
    const chipTag = chip.textContent.toLowerCase();
    if (currentTags.includes(chipTag)) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
}

function renderFixedBillsTemplateList() {
  const container = document.getElementById('fixed-bills-template-container');
  if (!container) return;
  container.innerHTML = '';

  const template = (state.fixedBillsTemplate && state.fixedBillsTemplate.length > 0)
    ? state.fixedBillsTemplate
    : defaultFixedBillsTemplate;

  template.forEach((bill, index) => {
    let cardOptions = '';
    state.cards.forEach(c => {
      cardOptions += `<option value="${c}" ${bill.card === c ? 'selected' : ''}>${c}</option>`;
    });

    const rowHTML = `
      <div class="template-bill-row" data-index="${index}">
        <input type="text" class="template-name" value="${bill.name}" placeholder="Nome (Ex: 💧 Água)" required>
        <div style="display: flex; align-items: center; gap: 4px;">
          <span style="font-size: 0.75rem; color: var(--text-secondary);">R$</span>
          <input type="number" step="0.01" class="template-value" value="${bill.value.toFixed(2)}" placeholder="0.00" required inputmode="decimal">
        </div>
        <div style="display: flex; align-items: center; gap: 4px;">
          <span style="font-size: 0.75rem; color: var(--text-secondary);">Venc.</span>
          <input type="number" min="1" max="31" class="template-due" value="${bill.dueDate}" placeholder="Dia" style="width: 50px;" required inputmode="numeric">
        </div>
        <select class="template-card" required>
          ${cardOptions}
        </select>
        <button type="button" class="btn-delete-template" title="Remover este modelo" onclick="deleteTemplateBill(${index})">🗑️</button>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', rowHTML);
  });
}

window.deleteTemplateBill = async function(index) {
  if (await showConfirmModal('Tem certeza de que deseja remover este modelo de conta fixa? Ela não será gerada automaticamente nos próximos meses.', { title: 'Remover Modelo de Conta Fixa' })) {
    const bill = state.fixedBillsTemplate[index];
    state.fixedBillsTemplate.splice(index, 1);
    
    if (bill && bill.id && !bill.id.startsWith('f-custom-')) {
      try {
        const { error } = await supabase
          .from('fixed_bills_templates')
          .delete()
          .eq('id', bill.id)
          .eq('user_id', loggedInUserId);
        
        if (error) throw error;
      } catch (err) {
        console.error('Erro ao excluir modelo do banco de dados:', err);
        alert('Erro ao excluir modelo do banco: ' + err.message);
      }
    }
    
    renderFixedBillsTemplateList();
  }
};

// ==========================================================================
// VOICE COMMANDS & ONLINE SIMULTANEOUS SYNC
// ==========================================================================

function setupVoiceCommand() {
  const voiceBtn = document.getElementById('voice-input-btn');
  const voiceOverlay = document.getElementById('voice-overlay');
  const voiceCancelBtn = document.getElementById('voice-cancel-btn');
  const transcriptTempEl = document.getElementById('voice-transcript-temp');

  if (!voiceBtn || !voiceOverlay) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    // Hide voice option if browser does not support it
    voiceBtn.style.display = 'none';
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  let finalTranscript = '';

  voiceBtn.addEventListener('click', () => {
    finalTranscript = '';
    transcriptTempEl.textContent = '"..."';
    voiceOverlay.classList.remove('hidden');
    
    try {
      recognition.start();
    } catch (err) {
      console.error('Erro ao iniciar reconhecimento:', err);
    }
  });

  const stopRecognition = () => {
    voiceOverlay.classList.add('hidden');
    try {
      recognition.stop();
    } catch (err) {}
  };

  if (voiceCancelBtn) {
    voiceCancelBtn.addEventListener('click', stopRecognition);
  }

  recognition.onresult = (event) => {
    const result = event.results[event.results.length - 1];
    const transcriptText = result[0].transcript;
    transcriptTempEl.textContent = `"${transcriptText}"`;
    
    if (result.isFinal) {
      finalTranscript = transcriptText;
      stopRecognition();
      
      // Parse values
      const parsed = parseVoiceTranscript(finalTranscript);
      
      if (parsed.amount > 0 && parsed.desc) {
        // Pre-fill inputs in the form
        document.getElementById('expense-amount').value = parsed.amount.toFixed(2);
        document.getElementById('expense-desc').value = parsed.desc;
        
        // Auto-detect category
        const guessedCategory = detectCategoryFromDescription(parsed.desc);
        const categorySelect = document.getElementById('expense-category');
        if (categorySelect && guessedCategory) {
          categorySelect.value = guessedCategory;
          
          // Trigger specify others block if needed
          const specifyOthersGroup = document.getElementById('specify-others-group');
          if (guessedCategory === 'Outros') {
            specifyOthersGroup.classList.remove('hidden');
          } else {
            specifyOthersGroup.classList.add('hidden');
          }
        }
        
        // Highlight form inputs briefly for visual feedback
        const inputs = [
          document.getElementById('expense-amount'),
          document.getElementById('expense-desc'),
          document.getElementById('expense-category')
        ];
        inputs.forEach(el => {
          if (el) {
            el.style.borderColor = 'var(--primary)';
            el.style.boxShadow = '0 0 10px rgba(58, 134, 255, 0.4)';
            setTimeout(() => {
              el.style.borderColor = '';
              el.style.boxShadow = '';
            }, 1500);
          }
        });
      } else {
        alert('Não consegui identificar a despesa e o valor. Por favor, fale claramente o valor e o que comprou.');
      }
    }
  };

  recognition.onerror = (event) => {
    console.error('Erro no reconhecimento de voz:', event.error);
    stopRecognition();
    if (event.error !== 'aborted') {
      alert('Erro ao ouvir voz: ' + event.error);
    }
  };

  recognition.onend = () => {
    voiceOverlay.classList.add('hidden');
  };
}

function parseVoiceTranscript(transcript) {
  let text = transcript.toLowerCase().trim();
  let amount = 0;
  let desc = '';

  // 1. Try to match "XX e YY" (e.g. 12 e 50)
  const regexAnd = /\b(\d+)\s+e\s+(\d{1,2})\b/;
  const matchAnd = text.match(regexAnd);
  if (matchAnd) {
    const whole = matchAnd[1];
    let cents = matchAnd[2];
    if (cents.length === 1) cents += '0'; // "12 e 5" -> "12.50"
    amount = parseFloat(whole + '.' + cents) || 0;
    text = text.replace(matchAnd[0], '');
  } else {
    // 2. Try to match standard numbers like 85,90 or 150.00 or 50
    const regexNum = /\b\d+(?:[.,]\d+)?\b/;
    const matchNum = text.match(regexNum);
    if (matchNum) {
      amount = parseFloat(matchNum[0].replace(',', '.')) || 0;
      text = text.replace(matchNum[0], '');
    } else {
      // 3. Fallback to common words for small values in Portuguese
      const wordNumbers = {
        'um': 1, 'uma': 1, 'dois': 2, 'tres': 3, 'três': 3, 'quatro': 4, 'cinco': 5,
        'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9, 'dez': 10, 'onze': 11, 'doze': 12,
        'treze': 13, 'quatorze': 14, 'quinze': 15, 'vinte': 20, 'trinta': 30,
        'quarenta': 40, 'cinquenta': 50, 'cem': 100, 'cento': 100
      };
      
      for (const [word, val] of Object.entries(wordNumbers)) {
        const wordRegex = new RegExp(`\\b${word}\\b`, 'g');
        if (wordRegex.test(text)) {
          amount = val;
          text = text.replace(wordRegex, '');
          break;
        }
      }
    }
  }

  // Clean description text from filler words in Portuguese
  desc = text
    .replace(/\breais?\b/g, '')      // remove "real" / "reais"
    .replace(/\bcentavos?\b/g, '')  // remove "centavo" / "centavos"
    .replace(/\bcom\b/g, '')        // remove "com"
    .replace(/\bde\b/g, '')         // remove "de"
    .replace(/\bno\b/g, '')         // remove "no"
    .replace(/\bna\b/g, '')         // remove "na"
    .replace(/\bem\b/g, '')         // remove "em"
    .replace(/\s+/g, ' ')           // combine double spaces
    .trim();

  // Capitalize first letter of description
  if (desc) {
    desc = desc.charAt(0).toUpperCase() + desc.slice(1);
  }

  return { amount, desc };
}

function setupOnlineSync() {
  const syncBtn = document.getElementById('sync-data-btn');
  if (syncBtn) {
    syncBtn.addEventListener('click', async () => {
      if (!loggedInUserId) {
        alert('Por favor, acesse sua conta no ERP para sincronizar.');
        return;
      }
      
      syncBtn.style.pointerEvents = 'none';
      const originalContent = syncBtn.innerHTML;
      syncBtn.innerHTML = '<span style="font-size: 1.15rem; line-height: 1; display: inline-block; animation: spinIcon 1s linear infinite;">🔄</span>';
      
      try {
        await loadUserData(loggedInUserId);
        updateUI();
        renderCharts();
        
        // Visual feedback for success
        syncBtn.style.color = '#4caf50';
        setTimeout(() => {
          syncBtn.style.color = '';
        }, 1500);
      } catch (err) {
        console.error('Erro de sincronização:', err);
        alert('Erro ao sincronizar dados do servidor: ' + err.message);
      } finally {
        syncBtn.style.pointerEvents = 'auto';
        syncBtn.innerHTML = originalContent;
      }
    });
  }

  // Auto-sync when tab gains visibility (Page Visibility API)
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && loggedInUserId) {
      console.log('Foco reestabelecido. Sincronizando dados com o Supabase...');
      try {
        await loadUserData(loggedInUserId);
        updateUI();
        renderCharts();
      } catch (err) {
        console.error('Erro na auto-sincronização automática:', err);
      }
    }
  });

  // Inject rotation animation for sync button
  if (!document.getElementById('sync-spin-style')) {
    const style = document.createElement('style');
    style.id = 'sync-spin-style';
    style.textContent = `
      @keyframes spinIcon {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

// Solicitar permissão de notificação se suportado e ainda não configurado
if ('Notification' in window && Notification.permission === 'default') {
  window.addEventListener('click', function askPermissionOnce() {
    Notification.requestPermission();
    window.removeEventListener('click', askPermissionOnce);
  }, { once: true });
}
