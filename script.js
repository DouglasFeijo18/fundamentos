const STORAGE_KEYS = {
  users: 'finanpro_users',
  currentUser: 'finanpro_current_user',
  financeData: 'finanpro_finance_data'
};

const categoryConfig = {
  Água: { color: '#3b82f6', icon: 'fa-tint' },
  Luz: { color: '#60a5fa', icon: 'fa-bolt' },
  Aluguel: { color: '#ef4444', icon: 'fa-house' },
  Comida: { color: '#22c55e', icon: 'fa-utensils' },
  Lazer: { color: '#facc15', icon: 'fa-face-smile-beam' },
  Transporte: { color: '#f97316', icon: 'fa-bus' },
  Saúde: { color: '#a855f7', icon: 'fa-heart-pulse' },
  Outros: { color: '#94a3b8', icon: 'fa-layer-group' }
};

const getUsers = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
const setUsers = (users) => localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
const getCurrentUser = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser) || 'null');
const setCurrentUser = (user) => localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
const getFinanceData = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.financeData) || '{}');
const setFinanceData = (data) => localStorage.setItem(STORAGE_KEYS.financeData, JSON.stringify(data));

const createFinanceModel = () => ({ income: 0, expenses: [], investments: [] });

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' });

function showAlert(elementId, message, type = 'success') {
  const alert = document.getElementById(elementId);
  if (!alert) return;

  alert.textContent = message;
  alert.className = `alert ${type}`;
  setTimeout(() => alert.classList.add('hidden'), 3200);
}

function setFieldState(input, message = '', type = '') {
  const group = input.closest('.input-group');
  if (!group) return;
  group.classList.remove('invalid', 'valid');
  if (type) group.classList.add(type);
  const feedback = group.querySelector('.error-text');
  if (feedback) feedback.textContent = message;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function initPasswordToggles() {
  document.querySelectorAll('.toggle-password').forEach((button) => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.target);
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      button.innerHTML = `<i class="fa-solid ${isPassword ? 'fa-eye-slash' : 'fa-eye'}"></i>`;
    });
  });
}

function handleRegisterPage() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const nameInput = document.getElementById('registerName');
    const emailInput = document.getElementById('registerEmail');
    const passwordInput = document.getElementById('registerPassword');
    const confirmInput = document.getElementById('registerConfirmPassword');

    let isValid = true;

    if (nameInput.value.trim().length < 5) {
      setFieldState(nameInput, 'Informe nome e sobrenome.', 'invalid');
      isValid = false;
    } else {
      setFieldState(nameInput, 'Nome validado com sucesso.', 'valid');
    }

    if (!validateEmail(emailInput.value.trim())) {
      setFieldState(emailInput, 'Digite um email válido.', 'invalid');
      isValid = false;
    } else if (getUsers().some((user) => user.email === emailInput.value.trim().toLowerCase())) {
      setFieldState(emailInput, 'Este email já está cadastrado.', 'invalid');
      isValid = false;
    } else {
      setFieldState(emailInput, 'Email disponível.', 'valid');
    }

    if (passwordInput.value.length < 6) {
      setFieldState(passwordInput, 'A senha deve ter ao menos 6 caracteres.', 'invalid');
      isValid = false;
    } else {
      setFieldState(passwordInput, 'Senha válida.', 'valid');
    }

    if (confirmInput.value !== passwordInput.value || !confirmInput.value) {
      setFieldState(confirmInput, 'As senhas precisam ser iguais.', 'invalid');
      isValid = false;
    } else {
      setFieldState(confirmInput, 'Senhas conferem.', 'valid');
    }

    if (!isValid) {
      showAlert('registerAlert', 'Revise os campos destacados para continuar.', 'error');
      return;
    }

    const normalizedEmail = emailInput.value.trim().toLowerCase();
    const newUser = {
      id: crypto.randomUUID(),
      name: nameInput.value.trim(),
      email: normalizedEmail,
      password: passwordInput.value
    };

    const users = getUsers();
    users.push(newUser);
    setUsers(users);

    const financeData = getFinanceData();
    financeData[newUser.id] = createFinanceModel();
    setFinanceData(financeData);

    showAlert('registerAlert', 'Conta criada com sucesso! Redirecionando para login...', 'success');
    form.reset();
    setTimeout(() => window.location.href = 'index.html', 1200);
  });
}

function handleLoginPage() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const users = getUsers();
    const normalizedEmail = emailInput.value.trim().toLowerCase();
    const matchedUser = users.find((user) => user.email === normalizedEmail && user.password === passwordInput.value);

    let isValid = true;

    if (!validateEmail(normalizedEmail)) {
      setFieldState(emailInput, 'Digite um email válido.', 'invalid');
      isValid = false;
    } else {
      setFieldState(emailInput, 'Email válido.', 'valid');
    }

    if (!passwordInput.value) {
      setFieldState(passwordInput, 'Digite sua senha.', 'invalid');
      isValid = false;
    } else {
      setFieldState(passwordInput, '', 'valid');
    }

    if (!isValid) {
      showAlert('loginAlert', 'Preencha email e senha corretamente.', 'error');
      return;
    }

    if (!matchedUser) {
      setFieldState(passwordInput, 'Credenciais inválidas.', 'invalid');
      showAlert('loginAlert', 'Não foi possível entrar. Verifique seus dados.', 'error');
      return;
    }

    setCurrentUser({ id: matchedUser.id, name: matchedUser.name, email: matchedUser.email });
    showAlert('loginAlert', 'Login realizado! Abrindo dashboard...', 'success');
    setTimeout(() => window.location.href = 'dashboard.html', 900);
  });
}

function getUserFinanceState(userId) {
  const financeData = getFinanceData();
  if (!financeData[userId]) {
    financeData[userId] = createFinanceModel();
    setFinanceData(financeData);
  }
  return financeData[userId];
}

function saveUserFinanceState(userId, state) {
  const financeData = getFinanceData();
  financeData[userId] = state;
  setFinanceData(financeData);
}

function getGreeting(name) {
  const hour = new Date().getHours();
  const firstName = name.split(' ')[0];
  if (hour < 12) return `Bom dia, ${firstName} ☀️`;
  if (hour < 18) return `Boa tarde, ${firstName} 🌤️`;
  return `Boa noite, ${firstName} 🌙`;
}

function formatDate(dateString) {
  return dateString ? dateFormatter.format(new Date(`${dateString}T12:00:00`)) : 'Hoje';
}

function buildCategoryOptions(select) {
  if (!select) return;
  select.innerHTML = Object.keys(categoryConfig)
    .map((category) => `<option value="${category}">${category}</option>`)
    .join('');
}

function initDashboardPage() {
  const currentUser = getCurrentUser();
  if (!document.body.classList.contains('dashboard-body')) return;
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }

  const state = getUserFinanceState(currentUser.id);
  const dom = {
    userNameDisplay: document.getElementById('userNameDisplay'),
    greetingTitle: document.getElementById('greetingTitle'),
    incomeValue: document.getElementById('incomeValue'),
    expenseValue: document.getElementById('expenseValue'),
    balanceValue: document.getElementById('balanceValue'),
    projectedBalance: document.getElementById('projectedBalance'),
    topCategory: document.getElementById('topCategory'),
    investmentTotal: document.getElementById('investmentTotal'),
    expenseCount: document.getElementById('expenseCount'),
    monthlyIncome: document.getElementById('monthlyIncome'),
    expenseList: document.getElementById('expenseList'),
    investmentCards: document.getElementById('investmentCards'),
    expenseCategory: document.getElementById('expenseCategory')
  };

  dom.userNameDisplay.textContent = currentUser.name;
  dom.greetingTitle.textContent = getGreeting(currentUser.name);
  dom.monthlyIncome.value = state.income || '';
  buildCategoryOptions(dom.expenseCategory);

  const pieChartContext = document.getElementById('expensePieChart');
  const barChartContext = document.getElementById('incomeExpenseBarChart');
  let pieChart;
  let barChart;

  function getTotals() {
    const totalExpenses = state.expenses.reduce((sum, item) => sum + item.amount, 0);
    const totalInvestments = state.investments.reduce((sum, item) => sum + item.amount, 0);
    const balance = state.income - totalExpenses;
    return { totalExpenses, totalInvestments, balance };
  }

  function getTopExpenseCategory() {
    if (!state.expenses.length) return 'Sem dados';
    const grouped = state.expenses.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});
    const [category, amount] = Object.entries(grouped).sort((a, b) => b[1] - a[1])[0];
    return `${category} · ${currencyFormatter.format(amount)}`;
  }

  function renderExpenseList() {
    if (!state.expenses.length) {
      dom.expenseList.innerHTML = '<div class="list-empty">Nenhum gasto cadastrado ainda.</div>';
      return;
    }

    dom.expenseList.innerHTML = [...state.expenses]
      .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
      .map((expense) => {
        const category = categoryConfig[expense.category];
        return `
          <article class="expense-item">
            <div class="item-main">
              <div class="category-badge" style="background:${category.color}">
                <i class="fa-solid ${category.icon}"></i>
              </div>
              <div>
                <strong>${expense.category}</strong>
                <span>${formatDate(expense.date)}</span>
              </div>
            </div>
            <div class="item-actions">
              <strong>${currencyFormatter.format(expense.amount)}</strong>
              <button class="remove-btn" data-expense-id="${expense.id}" aria-label="Remover gasto">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </article>`;
      })
      .join('');
  }

  function renderInvestmentList() {
    if (!state.investments.length) {
      dom.investmentCards.innerHTML = '<div class="list-empty">Nenhum investimento adicionado até o momento.</div>';
      return;
    }

    dom.investmentCards.innerHTML = state.investments
      .map((investment) => `
        <article class="investment-item">
          <div class="item-main">
            <div class="investment-badge" style="background: linear-gradient(135deg, #a855f7, #7c3aed)">
              <i class="fa-solid fa-chart-line"></i>
            </div>
            <div>
              <strong>${investment.name}</strong>
              <span>${investment.type || 'Tipo não informado'}</span>
            </div>
          </div>
          <div class="item-actions">
            <strong>${currencyFormatter.format(investment.amount)}</strong>
            <span class="item-meta">${dateFormatter.format(new Date(investment.createdAt))}</span>
          </div>
        </article>`)
      .join('');
  }

  function renderCharts() {
    const groupedExpenses = Object.keys(categoryConfig).map((category) => ({
      category,
      amount: state.expenses
        .filter((item) => item.category === category)
        .reduce((sum, item) => sum + item.amount, 0)
    })).filter((item) => item.amount > 0);

    const pieData = {
      labels: groupedExpenses.length ? groupedExpenses.map((item) => item.category) : ['Sem gastos'],
      datasets: [{
        data: groupedExpenses.length ? groupedExpenses.map((item) => item.amount) : [1],
        backgroundColor: groupedExpenses.length
          ? groupedExpenses.map((item) => categoryConfig[item.category].color)
          : ['#cbd5e1'],
        borderWidth: 0
      }]
    };

    const { totalExpenses } = getTotals();
    const barData = {
      labels: ['Receita', 'Gastos'],
      datasets: [{
        label: 'Valores mensais',
        data: [state.income || 0, totalExpenses],
        backgroundColor: ['#22c55e', '#ef4444'],
        borderRadius: 14,
        maxBarThickness: 56
      }]
    };

    if (pieChart) pieChart.destroy();
    if (barChart) barChart.destroy();

    pieChart = new Chart(pieChartContext, {
      type: 'pie',
      data: pieData,
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 18, usePointStyle: true } }
        }
      }
    });

    barChart = new Chart(barChartContext, {
      type: 'bar',
      data: barData,
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: false } }
      }
    });
  }

  function renderSummary() {
    const { totalExpenses, totalInvestments, balance } = getTotals();
    dom.incomeValue.textContent = currencyFormatter.format(state.income || 0);
    dom.expenseValue.textContent = currencyFormatter.format(totalExpenses);
    dom.balanceValue.textContent = currencyFormatter.format(balance);
    dom.projectedBalance.textContent = currencyFormatter.format(balance);
    dom.topCategory.textContent = getTopExpenseCategory();
    dom.investmentTotal.textContent = currencyFormatter.format(totalInvestments);
    dom.expenseCount.textContent = `${state.expenses.length} lançamento${state.expenses.length === 1 ? '' : 's'}`;
    renderExpenseList();
    renderInvestmentList();
    renderCharts();
    saveUserFinanceState(currentUser.id, state);
  }

  document.getElementById('incomeForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const income = Number(dom.monthlyIncome.value);
    if (Number.isNaN(income) || income < 0) {
      showAlert('dashboardAlert', 'Informe uma receita válida.', 'error');
      return;
    }
    state.income = income;
    renderSummary();
    showAlert('dashboardAlert', 'Receita mensal atualizada com sucesso.', 'success');
  });

  document.getElementById('expenseForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const amount = Number(document.getElementById('expenseAmount').value);
    const category = dom.expenseCategory.value;
    const date = document.getElementById('expenseDate').value;

    if (Number.isNaN(amount) || amount <= 0) {
      showAlert('dashboardAlert', 'Digite um valor de gasto maior que zero.', 'error');
      return;
    }

    state.expenses.push({
      id: crypto.randomUUID(),
      amount,
      category,
      date,
      createdAt: new Date().toISOString()
    });

    event.target.reset();
    buildCategoryOptions(dom.expenseCategory);
    renderSummary();
    showAlert('dashboardAlert', 'Gasto adicionado com animação e atualização dos gráficos.', 'success');
  });

  document.getElementById('investmentForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('investmentName').value.trim();
    const amount = Number(document.getElementById('investmentAmount').value);
    const type = document.getElementById('investmentType').value.trim();

    if (name.length < 2 || Number.isNaN(amount) || amount <= 0) {
      showAlert('dashboardAlert', 'Preencha nome e valor do investimento corretamente.', 'error');
      return;
    }

    state.investments.unshift({
      id: crypto.randomUUID(),
      name,
      amount,
      type,
      createdAt: new Date().toISOString()
    });

    event.target.reset();
    renderSummary();
    showAlert('dashboardAlert', 'Investimento registrado com sucesso.', 'success');
  });

  dom.expenseList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-expense-id]');
    if (!button) return;
    state.expenses = state.expenses.filter((item) => item.id !== button.dataset.expenseId);
    renderSummary();
    showAlert('dashboardAlert', 'Gasto removido da sua lista.', 'success');
  });

  document.querySelectorAll('.nav-link[data-section]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.nav-link[data-section]').forEach((item) => item.classList.remove('active'));
      document.querySelectorAll('.content-section').forEach((section) => section.classList.remove('active-section'));
      button.classList.add('active');
      document.getElementById(button.dataset.section).classList.add('active-section');
      closeSidebar();
    });
  });

  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const openSidebar = () => {
    sidebar.classList.add('open');
    overlay.classList.add('show');
  };
  const closeSidebar = () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  };

  document.getElementById('openSidebar').addEventListener('click', openSidebar);
  document.getElementById('closeSidebar').addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);

  document.getElementById('logoutButton').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    window.location.href = 'index.html';
  });

  renderSummary();
}

initPasswordToggles();
handleRegisterPage();
handleLoginPage();
initDashboardPage();
