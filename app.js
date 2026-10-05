/* ==========================================================================
   열매반 학급 경제 & 게이미피케이션 (열매 빌리지) Application Logic
   ========================================================================== */

// Default Initial Data (7 Students, 7 Roles, Default Missions, Shop Items)
const DEFAULT_ROLES = [
  { id: 'r1', title: '칠판 도우미', icon: '🧹', desc: '자유놀이가 끝나고 칠판과 지우개를 깨끗이 정리해요!' },
  { id: 'r2', title: '문지기 도우미', icon: '🚪', desc: '바깥놀이 나갈 때 줄을 잘 서도록 문을 잡아줘요!' },
  { id: 'r3', title: '우유 도우미', icon: '🥛', desc: '맛있는 간식 시간에 우유를 안상하게 바르게 배달해요!' },
  { id: 'r4', title: '정리정돈 도우미', icon: '🧸', desc: '블록과 장난감이 제자리에 가도록 친구들을 도와요!' },
  { id: 'r5', title: '급식 도우미', icon: '🍱', desc: '점심 식사 전 수저와 식판 배달을 도와요!' },
  { id: 'r6', title: '불끄기 도우미', icon: '💡', desc: '낮잠 시간과 바깥놀이 갈 때 전등을 꺼요!' },
  { id: 'r7', title: '식물 물주기 도우미', icon: '🪴', desc: '창가의 예쁜 열매반 화분에 시원한 물을 줘요!' }
];

const DEFAULT_STUDENTS = [
  { id: 1, name: '김열매', avatar: '🍇', coins: 15, exp: 20, level: 1, roleId: 'r1', roleCompleted: false },
  { id: 2, name: '이포도', avatar: '🍇', coins: 35, exp: 120, level: 2, roleId: 'r2', roleCompleted: true },
  { id: 3, name: '박사과', avatar: '🍎', coins: 20, exp: 50, level: 1, roleId: 'r3', roleCompleted: false },
  { id: 4, name: '최바나나', avatar: '🍌', coins: 50, exp: 280, level: 3, roleId: 'r4', roleCompleted: true },
  { id: 5, name: '정딸기', avatar: '🍓', coins: 10, exp: 10, level: 1, roleId: 'r5', roleCompleted: false },
  { id: 6, name: '강수박', avatar: '🍉', coins: 40, exp: 150, level: 2, roleId: 'r6', roleCompleted: false },
  { id: 7, name: '윤메론', avatar: '🍈', coins: 25, exp: 80, level: 1, roleId: 'r7', roleCompleted: false }
];

const DEFAULT_MISSIONS = [
  { id: 'm1', title: '신발장에 신발 줄 맞춰 가지런히 넣기 👟', reward: 2, completedBy: [2, 4] },
  { id: 'm2', title: '손 씻고 비누 거품 깨끗이 헹구기 🧼', reward: 3, completedBy: [1] },
  { id: 'm3', title: '친구에게 고마운 마음 말로 표현하기 💌', reward: 5, completedBy: [] }
];

const DEFAULT_SHOP_ITEMS = [
  { id: 's1', name: '원하는 자리에 앉기 쿠폰', type: 'coupon', icon: '🎫', price: 30, desc: '하루 동안 내가 좋아하는 친구 옆자리에 앉아요!' },
  { id: 's2', name: '자유놀이 10분 추가 쿠폰', type: 'coupon', icon: '⏳', price: 50, desc: '신나는 자유놀이 시간을 10분 더 즐길 수 있어요!' },
  { id: 's3', name: '줄 제일 먼저 서기 쿠폰', type: 'coupon', icon: '🏃', price: 20, desc: '바깥놀이 갈 때 맨 앞에서 줄을 서요!' },
  { id: 's4', name: '귀여운 열매 스티커 팩', type: 'item', icon: '⭐', price: 15, desc: '알록달록 예쁜 열매 스티커 10장 세트!' },
  { id: 's5', name: '캐릭터 지우개 선물', type: 'item', icon: '✏️', price: 35, desc: '말랑말랑 귀여운 모양 지우개를 받아요!' },
  { id: 's6', name: '비눗방울 놀이 세트', type: 'item', icon: '🫧', price: 60, desc: '바깥놀이 시간에 비눗방울을 마음껏 불어요!' }
];

// App State
let state = {
  currentMode: 'student',       // 'student' | 'teacher'
  currentStudentId: 1,
  studentSubTab: 'tasks',       // 'tasks' | 'shop'
  teacherSubTab: 'students',    // 'students' | 'roles' | 'missions' | 'requests' | 'manage-shop'
  shopFilter: 'all',            // 'all' | 'coupon' | 'item'
  students: [],
  roles: [],
  missions: [],
  shopItems: [],
  purchaseRequests: []
};

// State for Modal Operation
let coinModalTargetStudentId = null;
let coinActionType = 'add'; // 'add' | 'sub'

// --- Web Audio Synth Sound Effects ---
function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'coin') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'levelup') {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'triangle';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.4, now + idx * 0.1);
        g.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.3);
        o.start(now + idx * 0.1);
        o.stop(now + idx * 0.1 + 0.3);
      });
    } else if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch (e) {
    console.log('Audio not allowed without gesture');
  }
}

// --- EXP & Level Calculator ---
function getExpRequiredForLevel(level) {
  // Level 1: 100, Level 2: 150, Level 3: 200, Level 4: 250...
  return 100 + (level - 1) * 50;
}

function calculateLevelFromTotalExp(totalExp) {
  let lvl = 1;
  let accumulated = 0;
  while (true) {
    let req = getExpRequiredForLevel(lvl);
    if (totalExp >= accumulated + req) {
      accumulated += req;
      lvl++;
    } else {
      break;
    }
  }
  return { level: lvl, expInLevel: totalExp - accumulated, reqExp: getExpRequiredForLevel(lvl) };
}

// --- LocalStorage Save & Load ---
function loadData() {
  const saved = localStorage.getItem('yeolmae_app_data_v1');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state.students = parsed.students || DEFAULT_STUDENTS;
      state.roles = parsed.roles || DEFAULT_ROLES;
      state.missions = parsed.missions || DEFAULT_MISSIONS;
      state.shopItems = parsed.shopItems || DEFAULT_SHOP_ITEMS;
      state.purchaseRequests = parsed.purchaseRequests || [];
      return;
    } catch (e) {
      console.error('Failed to parse saved data', e);
    }
  }
  // Initialize Default
  resetToDefaults();
}

function saveData() {
  const payload = {
    students: state.students,
    roles: state.roles,
    missions: state.missions,
    shopItems: state.shopItems,
    purchaseRequests: state.purchaseRequests
  };
  localStorage.setItem('yeolmae_app_data_v1', JSON.stringify(payload));
}

function resetToDefaults() {
  state.students = JSON.parse(JSON.stringify(DEFAULT_STUDENTS));
  state.roles = JSON.parse(JSON.stringify(DEFAULT_ROLES));
  state.missions = JSON.parse(JSON.stringify(DEFAULT_MISSIONS));
  state.shopItems = JSON.parse(JSON.stringify(DEFAULT_SHOP_ITEMS));
  state.purchaseRequests = [];
  saveData();
}

function confirmResetData() {
  if (confirm('모든 데이터(코인, 레벨, 미션, 상점)를 초기화하시겠습니까?')) {
    resetToDefaults();
    renderApp();
    alert('초기화되었습니다!');
  }
}

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderApp();
});

// --- Main Render Function ---
function renderApp() {
  renderStudentTabs();
  renderStudentHero();
  renderStudentSubTabTasks();
  renderStudentShop();
  renderTeacherDashboard();
  renderPendingBadge();
}

// --- Navigation Controls ---
function switchMode(mode) {
  playSound('click');
  state.currentMode = mode;
  document.getElementById('btn-mode-student').classList.toggle('active', mode === 'student');
  document.getElementById('btn-mode-teacher').classList.toggle('active', mode === 'teacher');

  document.getElementById('view-student').classList.toggle('active', mode === 'student');
  document.getElementById('view-teacher').classList.toggle('active', mode === 'teacher');
  document.getElementById('student-selector-bar').style.display = mode === 'student' ? 'flex' : 'none';

  renderApp();
}

function selectStudent(id) {
  playSound('click');
  state.currentStudentId = id;
  renderStudentTabs();
  renderStudentHero();
  renderStudentSubTabTasks();
  renderStudentShop();
}

function switchStudentSubTab(tab) {
  playSound('click');
  state.studentSubTab = tab;
  const buttons = document.querySelectorAll('.view-section#view-student .tab-btn');
  buttons[0].classList.toggle('active', tab === 'tasks');
  buttons[1].classList.toggle('active', tab === 'shop');

  document.getElementById('student-subtab-tasks').classList.toggle('active', tab === 'tasks');
  document.getElementById('student-subtab-shop').classList.toggle('active', tab === 'shop');
}

function switchTeacherSubTab(tab) {
  playSound('click');
  state.teacherSubTab = tab;
  const tabs = document.querySelectorAll('.teacher-tabs .tab-btn');
  const ids = ['students', 'roles', 'missions', 'requests', 'manage-shop'];
  tabs.forEach((btn, idx) => {
    btn.classList.toggle('active', ids[idx] === tab);
  });

  document.getElementById('teacher-subtab-students').classList.toggle('active', tab === 'students');
  document.getElementById('teacher-subtab-roles').classList.toggle('active', tab === 'roles');
  document.getElementById('teacher-subtab-missions').classList.toggle('active', tab === 'missions');
  document.getElementById('teacher-subtab-requests').classList.toggle('active', tab === 'requests');
  document.getElementById('teacher-subtab-manage-shop').classList.toggle('active', tab === 'manage-shop');
}

// --- Student Renderers ---
function renderStudentTabs() {
  const container = document.getElementById('student-tabs');
  container.innerHTML = state.students.map(s => `
    <button class="student-tab-item ${s.id === state.currentStudentId ? 'active' : ''}" onclick="selectStudent(${s.id})">
      <span>${s.avatar}</span>
      <span>${s.name}</span>
    </button>
  `).join('');
}

function renderStudentHero() {
  const student = state.students.find(s => s.id === state.currentStudentId) || state.students[0];
  const lvlInfo = calculateLevelFromTotalExp(student.exp);

  // Sync Level with State
  if (student.level !== lvlInfo.level) {
    student.level = lvlInfo.level;
    saveData();
  }

  document.getElementById('student-avatar').innerText = student.avatar;
  document.getElementById('student-level-badge').innerText = `Lv.${lvlInfo.level}`;
  document.getElementById('student-name').innerText = student.name;
  
  const pct = Math.min(100, Math.round((lvlInfo.expInLevel / lvlInfo.reqExp) * 100));
  document.getElementById('student-exp-text').innerText = `${lvlInfo.expInLevel} / ${lvlInfo.reqExp} EXP`;
  document.getElementById('student-exp-fill').style.width = `${pct}%`;

  document.getElementById('student-coin-balance').innerText = student.coins;
  document.getElementById('shop-student-coins').innerText = student.coins;
}

function renderStudentSubTabTasks() {
  const student = state.students.find(s => s.id === state.currentStudentId);
  if (!student) return;

  // 1인 1역
  const role = state.roles.find(r => r.id === student.roleId);
  if (role) {
    document.getElementById('student-role-icon').innerText = role.icon;
    document.getElementById('student-role-title').innerText = role.title;
    document.getElementById('student-role-desc').innerText = role.desc;
  } else {
    document.getElementById('student-role-icon').innerText = '❓';
    document.getElementById('student-role-title').innerText = '배정 대기 중';
    document.getElementById('student-role-desc').innerText = '선생님이 1인 1역 역할을 배정할 예정이에요.';
  }

  const btnCheck = document.getElementById('btn-check-role');
  const checkIcon = document.getElementById('role-check-icon');
  const checkText = document.getElementById('role-check-text');

  if (student.roleCompleted) {
    btnCheck.className = 'btn-large btn-secondary';
    checkIcon.innerText = '✅';
    checkText.innerText = '오늘의 역할 완수 완료!';
  } else {
    btnCheck.className = 'btn-large btn-success';
    checkIcon.innerText = '✨';
    checkText.innerText = '오늘 역할 완료했어요!';
  }

  // 오늘의 미션
  const missionContainer = document.getElementById('student-mission-list');
  missionContainer.innerHTML = state.missions.map(m => {
    const isDone = m.completedBy.includes(student.id);
    return `
      <li class="mission-item ${isDone ? 'completed' : ''}">
        <div class="mission-info">
          <span>${isDone ? '✅' : '📌'}</span>
          <span>${m.title}</span>
        </div>
        <div class="flex-center gap-2">
          <span class="mission-reward">+${m.reward} 🍇</span>
          ${isDone ? '<span class="text-sm text-muted">완료</span>' : `
            <button class="btn-primary btn-sm" onclick="completeMission('${m.id}')">완료하기</button>
          `}
        </div>
      </li>
    `;
  }).join('');
}

function toggleRoleComplete() {
  const student = state.students.find(s => s.id === state.currentStudentId);
  if (!student) return;

  student.roleCompleted = !student.roleCompleted;
  if (student.roleCompleted) {
    playSound('coin');
    // Give 1 bonus coin for completing role
    addCoinsAndExp(student.id, 1, '1인 1역 역할 수행 완료! ✨');
  }
  saveData();
  renderApp();
}

function completeMission(missionId) {
  const student = state.students.find(s => s.id === state.currentStudentId);
  const mission = state.missions.find(m => m.id === missionId);
  if (!student || !mission) return;

  if (!mission.completedBy.includes(student.id)) {
    mission.completedBy.push(student.id);
    addCoinsAndExp(student.id, mission.reward, `미션 완수: ${mission.title}`);
    playSound('coin');
    saveData();
    renderApp();
  }
}

function renderStudentShop() {
  const student = state.students.find(s => s.id === state.currentStudentId);
  const grid = document.getElementById('student-shop-grid');

  let filtered = state.shopItems;
  if (state.shopFilter !== 'all') {
    filtered = state.shopItems.filter(i => i.type === state.shopFilter);
  }

  grid.innerHTML = filtered.map(item => {
    const canAfford = student.coins >= item.price;
    // Check pending requests
    const isPending = state.purchaseRequests.some(r => r.studentId === student.id && r.itemId === item.id && r.status === 'pending');

    return `
      <div class="shop-item-card">
        <div class="shop-item-icon">${item.icon}</div>
        <h4 class="shop-item-name">${item.name}</h4>
        <p class="shop-item-desc">${item.desc}</p>
        <div class="shop-item-price">
          <span>${item.price}</span> 🍇
        </div>
        <button class="btn-buy" ${!canAfford || isPending ? 'disabled' : ''} onclick="buyShopItem('${item.id}')">
          ${isPending ? '승인 대기 중...' : (canAfford ? '구매하기' : '코인 부족')}
        </button>
      </div>
    `;
  }).join('');
}

function filterShop(type) {
  playSound('click');
  state.shopFilter = type;
  const btns = document.querySelectorAll('.shop-filter-bar .filter-btn');
  btns[0].classList.toggle('active', type === 'all');
  btns[1].classList.toggle('active', type === 'coupon');
  btns[2].classList.toggle('active', type === 'item');
  renderStudentShop();
}

function buyShopItem(itemId) {
  const student = state.students.find(s => s.id === state.currentStudentId);
  const item = state.shopItems.find(i => i.id === itemId);
  if (!student || !item) return;

  if (student.coins < item.price) {
    alert('열매 코인이 부족해요!');
    return;
  }

  // Add purchase request
  const newReq = {
    id: 'req_' + Date.now(),
    studentId: student.id,
    itemId: item.id,
    status: 'pending',
    timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  };

  state.purchaseRequests.push(newReq);
  saveData();
  playSound('click');
  alert(`'${item.name}' 구매 신청을 완료했습니다! 선생님 승인 후 완료돼요.`);
  renderApp();
}

// --- Teacher Renderers & Handlers ---
function renderTeacherDashboard() {
  renderTeacherStudentsGrid();
  renderTeacherRoles();
  renderTeacherMissions();
  renderTeacherRequests();
  renderTeacherShopManage();
}

function renderTeacherStudentsGrid() {
  const container = document.getElementById('teacher-students-grid');
  container.innerHTML = state.students.map(s => {
    const role = state.roles.find(r => r.id === s.roleId);
    const lvlInfo = calculateLevelFromTotalExp(s.exp);
    return `
      <div class="t-student-card">
        <div class="t-student-top">
          <div class="t-student-avatar">${s.avatar}</div>
          <div class="t-student-meta">
            <h4>${s.name}</h4>
            <span class="t-student-role">👑 ${role ? role.title : '미배정'} ${s.roleCompleted ? '✅' : ''}</span>
          </div>
        </div>

        <div class="t-student-stats">
          <div class="stat-box">
            <div class="stat-title">레벨</div>
            <div class="stat-value text-purple">Lv.${lvlInfo.level}</div>
          </div>
          <div class="stat-box">
            <div class="stat-title">EXP</div>
            <div class="stat-value">${s.exp}</div>
          </div>
          <div class="stat-box">
            <div class="stat-title">열매 코인</div>
            <div class="stat-value text-amber">🍇 ${s.coins}</div>
          </div>
        </div>

        <div class="t-student-actions">
          <button class="btn-primary btn-sm flex-1" onclick="openCoinModal(${s.id}, 'add')">➕ 화폐 지급</button>
          <button class="btn-secondary btn-sm" onclick="openCoinModal(${s.id}, 'sub')">➖ 차감</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderTeacherRoles() {
  const container = document.getElementById('teacher-roles-list');
  container.innerHTML = state.students.map(s => {
    return `
      <div class="role-assign-card">
        <div class="flex-center gap-2">
          <span style="font-size: 24px;">${s.avatar}</span>
          <strong>${s.name}</strong>
        </div>
        <select class="form-control" onchange="assignRole(${s.id}, this.value)">
          <option value="">-- 역할 선택 --</option>
          ${state.roles.map(r => `
            <option value="${r.id}" ${s.roleId === r.id ? 'selected' : ''}>
              ${r.icon} ${r.title}
            </option>
          `).join('')}
        </select>
      </div>
    `;
  }).join('');
}

function assignRole(studentId, roleId) {
  const student = state.students.find(s => s.id === studentId);
  if (student) {
    student.roleId = roleId;
    student.roleCompleted = false;
    saveData();
    renderApp();
  }
}

function randomizeRoles() {
  playSound('click');
  const shuffledRoles = [...state.roles].sort(() => 0.5 - Math.random());
  state.students.forEach((s, idx) => {
    s.roleId = shuffledRoles[idx % shuffledRoles.length].id;
    s.roleCompleted = false;
  });
  saveData();
  renderApp();
  alert('7명 학생의 1인 1역을 무작위로 배정했습니다! 🎲');
}

function renderTeacherMissions() {
  const container = document.getElementById('teacher-missions-list');
  container.innerHTML = state.missions.map(m => `
    <li class="mission-item">
      <div class="mission-info">
        <strong>${m.title}</strong>
        <span class="mission-reward">+${m.reward} 🍇</span>
        <span class="text-sm text-muted">(완수: ${m.completedBy.length}명)</span>
      </div>
      <button class="btn-secondary btn-sm" onclick="deleteMission('${m.id}')">삭제</button>
    </li>
  `).join('');
}

function deleteMission(id) {
  state.missions = state.missions.filter(m => m.id !== id);
  saveData();
  renderApp();
}

function renderTeacherRequests() {
  const container = document.getElementById('teacher-requests-list');
  const pending = state.purchaseRequests.filter(r => r.status === 'pending');

  if (pending.length === 0) {
    container.innerHTML = '<p class="text-muted text-center py-4">대기 중인 구매 요청이 없습니다. 🎉</p>';
    return;
  }

  container.innerHTML = pending.map(req => {
    const student = state.students.find(s => s.id === req.studentId);
    const item = state.shopItems.find(i => i.id === req.itemId);
    if (!student || !item) return '';

    return `
      <div class="request-item">
        <div>
          <strong>${student.name}</strong> 어린이 ➔ 
          <span class="badge badge-purple">${item.icon} ${item.name} (${item.price} 코인)</span>
          <div class="text-sm text-muted">${req.timestamp}</div>
        </div>
        <div class="flex-center gap-2">
          <button class="btn-success btn-sm" onclick="approveRequest('${req.id}')">승인 및 차감</button>
          <button class="btn-secondary btn-sm" onclick="rejectRequest('${req.id}')">거절</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderPendingBadge() {
  const pendingCount = state.purchaseRequests.filter(r => r.status === 'pending').length;
  const badge = document.getElementById('pending-requests-badge');
  badge.innerText = pendingCount;
  badge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
}

function approveRequest(reqId) {
  const req = state.purchaseRequests.find(r => r.id === reqId);
  if (!req) return;

  const student = state.students.find(s => s.id === req.studentId);
  const item = state.shopItems.find(i => i.id === req.itemId);

  if (student && item) {
    if (student.coins < item.price) {
      alert('학생 잔액이 부족하여 승인할 수 없습니다.');
      req.status = 'rejected';
    } else {
      student.coins -= item.price; // Deduct coins only! EXP stays same
      req.status = 'approved';
      playSound('coin');
      alert(`${student.name} 어린이의 '${item.name}' 구매를 승인하고 ${item.price} 코인을 차감했습니다.`);
    }
  }
  saveData();
  renderApp();
}

function rejectRequest(reqId) {
  const req = state.purchaseRequests.find(r => r.id === reqId);
  if (req) {
    req.status = 'rejected';
    saveData();
    renderApp();
  }
}

function renderTeacherShopManage() {
  const grid = document.getElementById('teacher-shop-items-grid');
  grid.innerHTML = state.shopItems.map(item => `
    <div class="shop-item-card">
      <div class="shop-item-icon">${item.icon}</div>
      <h4 class="shop-item-name">${item.name}</h4>
      <p class="shop-item-desc">${item.desc}</p>
      <div class="shop-item-price"><span>${item.price}</span> 🍇</div>
      <button class="btn-secondary btn-sm" onclick="deleteShopItem('${item.id}')">삭제</button>
    </div>
  `).join('');
}

function deleteShopItem(id) {
  state.shopItems = state.shopItems.filter(i => i.id !== id);
  saveData();
  renderApp();
}

// --- Helper Core: Add Coins & EXP & Check Levelup ---
function addCoinsAndExp(studentId, amount, reason) {
  const student = state.students.find(s => s.id === studentId);
  if (!student) return;

  const oldLvlInfo = calculateLevelFromTotalExp(student.exp);

  student.coins += amount;
  student.exp += amount; // Accumulate EXP automatically!

  const newLvlInfo = calculateLevelFromTotalExp(student.exp);

  // Levelup Event Trigger
  if (newLvlInfo.level > oldLvlInfo.level) {
    student.level = newLvlInfo.level;
    triggerLevelUpModal(student, newLvlInfo.level);
  }
}

function triggerLevelUpModal(student, newLevel) {
  playSound('levelup');
  
  // Confetti Explosion
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  document.getElementById('levelup-avatar').innerText = student.avatar;
  document.getElementById('levelup-student-name').innerText = `${student.name} 어린이`;
  document.getElementById('levelup-new-level').innerText = `Lv.${newLevel} 달성! 🌟`;

  openModal('modal-levelup');
}

// --- Modal Handlers ---
function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

function openCoinModal(studentId, defaultType = 'add') {
  coinModalTargetStudentId = studentId;
  const student = state.students.find(s => s.id === studentId);
  if (!student) return;

  document.getElementById('modal-coin-student-name').innerText = `${student.name} 어린이`;
  setCoinActionType(defaultType);
  document.getElementById('coin-amount-input').value = 1;
  document.getElementById('coin-reason-input').value = '';
  openModal('modal-coin');
}

function setCoinActionType(type) {
  coinActionType = type;
  document.getElementById('coin-type-add').classList.toggle('active', type === 'add');
  document.getElementById('coin-type-sub').classList.toggle('active', type === 'sub');
  document.getElementById('modal-coin-title').innerText = type === 'add' ? '🍇 화폐 지급 (칭찬)' : '➖ 화폐 차감 (차감)';
}

function setCoinAmount(val) {
  document.getElementById('coin-amount-input').value = val;
}

function setCoinReason(txt) {
  document.getElementById('coin-reason-input').value = txt;
}

function submitCoinTransaction() {
  const amount = parseInt(document.getElementById('coin-amount-input').value, 10) || 1;
  const reason = document.getElementById('coin-reason-input').value.trim() || '칭찬 보상';
  const student = state.students.find(s => s.id === coinModalTargetStudentId);

  if (!student) return;

  if (coinActionType === 'add') {
    addCoinsAndExp(student.id, amount, reason);
    playSound('coin');
  } else {
    student.coins = Math.max(0, student.coins - amount);
    // Note: Deducting coins does not decrease total EXP/Level per PRD spec
  }

  saveData();
  closeModal('modal-coin');
  renderApp();
}

function openBulkCoinModal() {
  document.getElementById('bulk-coin-amount-input').value = 3;
  openModal('modal-bulk-coin');
}

function setBulkCoinAmount(val) {
  document.getElementById('bulk-coin-amount-input').value = val;
}

function submitBulkCoin() {
  const amount = parseInt(document.getElementById('bulk-coin-amount-input').value, 10) || 3;
  const reason = document.getElementById('bulk-coin-reason-input').value || '전체 칭찬 보상';

  state.students.forEach(s => {
    addCoinsAndExp(s.id, amount, reason);
  });

  playSound('coin');
  saveData();
  closeModal('modal-bulk-coin');
  renderApp();
  alert(`7명 학생 전체에게 코인 ${amount}개가 지급되었습니다! 🍇`);
}

function openAddMissionModal() {
  document.getElementById('mission-title-input').value = '';
  document.getElementById('mission-reward-input').value = 2;
  openModal('modal-mission');
}

function submitAddMission() {
  const title = document.getElementById('mission-title-input').value.trim();
  const reward = parseInt(document.getElementById('mission-reward-input').value, 10) || 2;

  if (!title) {
    alert('미션 제목을 입력해주세요.');
    return;
  }

  state.missions.push({
    id: 'm_' + Date.now(),
    title,
    reward,
    completedBy: []
  });

  saveData();
  closeModal('modal-mission');
  renderApp();
}

function openAddShopItemModal() {
  document.getElementById('shop-item-name').value = '';
  document.getElementById('shop-item-desc').value = '';
  document.getElementById('shop-item-price').value = 15;
  openModal('modal-shop-item');
}

function submitAddShopItem() {
  const type = document.getElementById('shop-item-type').value;
  const icon = document.getElementById('shop-item-icon').value.trim() || '🎁';
  const name = document.getElementById('shop-item-name').value.trim();
  const price = parseInt(document.getElementById('shop-item-price').value, 10) || 10;
  const desc = document.getElementById('shop-item-desc').value.trim();

  if (!name) {
    alert('상품 이름을 입력하세요.');
    return;
  }

  state.shopItems.push({
    id: 's_' + Date.now(),
    type,
    icon,
    name,
    price,
    desc
  });

  saveData();
  closeModal('modal-shop-item');
  renderApp();
}
