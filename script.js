/* ===================== BACKEND / DATA LAYER ===================== */

const SUBJECTS_BY_CLASS = {
  'CSE': ['DSA', 'Python Programming', 'Database Management System', 'Cloud Computing', 'Aptitude'],
  'CSE-DS': ['Python Programming', 'Database Management System', 'Cloud Computing', 'Aptitude'],
  'AI': ['Python Programming', 'DSA', 'Database Management System', 'Entrepreneurship'],
};

const MAX_MARKS = 100;
const PASS_MARK = 35;

function getGrade(pct) {
  if (pct >= 90) return 'O';
  if (pct >= 75) return 'A';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 35) return 'D';
  return 'F';
}
function gradeLabel(g) {
  return { O: 'Outstanding', A: 'Excellent', B: 'Good', C: 'Average', D: 'Pass', F: 'Fail' }[g] || g;
}
function gradeColor(pct) {
  if (pct >= 90) return 'var(--accent)';
  if (pct >= 75) return 'var(--blue)';
  if (pct >= 60) return 'var(--purple)';
  if (pct >= 50) return 'var(--gold)';
  if (pct >= 35) return '#fb923c';
  return 'var(--red)';
}

// STORE
let db = {
  students: [],
  results: [],
  nextStudentId: 1,
  nextResultId: 1,
};

function save() { localStorage.setItem('gradify_db_v5', JSON.stringify(db)); }
function load() {
  const d = localStorage.getItem('gradify_db_v5');
  if (d) { db = JSON.parse(d); }
  else { seedData(); }
}

function seedData() {
  const sampleStudents = [
    { id: 1, roll: '2026001', name: 'Aarav Sharma', cls: 'CSE', gender: 'Male' },
    { id: 2, roll: '2026002', name: 'Priya Mehta', cls: 'CSE', gender: 'Female' },
    { id: 3, roll: '2026003', name: 'Rohan Patil', cls: 'CSE', gender: 'Male' },
    { id: 4, roll: '2026004', name: 'Sneha Kulkarni', cls: 'CSE-DS', gender: 'Female' },
    { id: 5, roll: '2026005', name: 'Arjun Nair', cls: 'CSE-DS', gender: 'Male' },
    { id: 6, roll: '2026006', name: 'Kavya Reddy', cls: 'AI', gender: 'Female' },
    { id: 7, roll: '2026007', name: 'Vivek Joshi', cls: 'AI', gender: 'Male' },
    { id: 8, roll: '2026008', name: 'Neha Gupta', cls: 'AI', gender: 'Female' },
  ];
  db.students = sampleStudents;
  db.nextStudentId = 9;

  const exams = ['Unit Test 1', 'Mid-Term', 'Final Exam'];
  let rid = 1;
  sampleStudents.forEach(s => {
    exams.forEach(exam => {
      const subjects = SUBJECTS_BY_CLASS[s.cls];
      const marks = {};
      subjects.forEach(sub => {
        marks[sub] = Math.floor(Math.random() * 50) + 40 + (s.id <= 3 ? 10 : 0);
        if (marks[sub] > 100) marks[sub] = 100;
      });
      db.results.push({ id: rid++, studentId: s.id, exam, year: '2024-25', marks });
    });
  });
  // Make student 3 fail one subject
  if (db.results.length > 2) { const sub = Object.keys(db.results[2].marks)[0]; db.results[2].marks[sub] = 28; }
  db.nextResultId = rid;
  save();
}

/* ===================== HELPERS ===================== */

function getStudentResults(studentId, exam = '') {
  return db.results.filter(r => r.studentId === studentId && (!exam || r.exam === exam));
}
function calcResultStats(result, cls) {
  const subjects = SUBJECTS_BY_CLASS[cls] || Object.keys(result.marks);
  const total = subjects.reduce((a, s) => a + (result.marks[s] || 0), 0);
  const pct = Math.round((total / (subjects.length * MAX_MARKS)) * 100);
  const failed = subjects.filter(s => (result.marks[s] || 0) < PASS_MARK);
  return { total, pct, grade: getGrade(pct), failed, subjects };
}
function getStudentAvg(studentId, cls) {
  const results = getStudentResults(studentId);
  if (!results.length) return null;
  const pcts = results.map(r => calcResultStats(r, cls).pct);
  return Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
}
function findStudent(id) { return db.students.find(s => s.id === id); }

/* ===================== 3D CANVAS & CARD TILT EFFECTS ===================== */

let canvas, ctx;
let particles = [];
const particleCount = 90;
let mouse = { x: null, y: null, radius: 150 };

function initCanvas() {
  canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2.2 + 1.2,
      color: Math.random() > 0.5 ? 'rgba(184, 144, 71, 0.42)' : 'rgba(212, 175, 55, 0.32)'
    });
  }
  animateParticles();
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

    if (mouse.x !== null && mouse.y !== null) {
      let dx = mouse.x - p.x;
      let dy = mouse.y - p.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius) {
        let force = (mouse.radius - dist) / mouse.radius;
        p.x += dx * force * 0.025;
        p.y += dy * force * 0.025;

        let mouseAlpha = (mouse.radius - dist) / mouse.radius * 0.45;
        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = `rgba(184, 144, 71, ${mouseAlpha})`;
        ctx.lineWidth = 0.75;
        ctx.stroke();
      }
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  });

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      let dx = particles[i].x - particles[j].x;
      let dy = particles[i].y - particles[j].y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 130) {
        let alpha = (130 - dist) / 130 * 0.32;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(184, 144, 71, ${alpha})`;
        ctx.lineWidth = 0.75;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(animateParticles);
}

function initCardTilt() {
  // We dynamic bind so newly rendered card elements are covered
  applyTiltEffect();
}

function applyTiltEffect() {
  const cards = document.querySelectorAll('.card, .stat-card, .login-card, .circular-progress-card');
  cards.forEach(card => {
    if (card.dataset.tiltInit) return;
    card.dataset.tiltInit = 'true';

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dx = (x - rect.width / 2) / (rect.width / 2);
      const dy = (y - rect.height / 2) / (rect.height / 2);

      card.style.transform = `perspective(1000px) rotateX(${dy * -6}deg) rotateY(${dx * 6}deg) translateZ(6px)`;
      card.style.borderColor = 'var(--border-hover)';
      card.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.4), 0 0 15px rgba(16, 185, 129, 0.06)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      card.style.borderColor = '';
      card.style.boxShadow = '';
    });
  });
}

/* ===================== AUTHENTICATION LAYER ===================== */

let currentSession = null;

function checkAuthSession() {
  const session = sessionStorage.getItem('gradify_session');
  if (session) {
    currentSession = JSON.parse(session);
    loginSuccess();
  } else {
    document.getElementById('app-header').style.display = 'flex';
    document.getElementById('admin-nav').style.display = 'none';
    document.getElementById('student-nav').style.display = 'none';
    document.getElementById('user-profile').style.display = 'none';
    showView('login');
  }
}

function loginAdmin() {
  const user = document.getElementById('login-username').value.trim();
  const pass = document.getElementById('login-password').value.trim();

  if (user === 'admin' && pass === 'admin') {
    currentSession = { role: 'admin', name: 'Administrator', username: 'admin' };
    sessionStorage.setItem('gradify_session', JSON.stringify(currentSession));
    loginSuccess();
  } else {
    showLoginAlert('Invalid administrator credentials.');
  }
}

function loginStudent() {
  const roll = document.getElementById('login-roll').value.trim();
  if (!roll) {
    showLoginAlert('Please enter a roll number.');
    return;
  }
  const student = db.students.find(s => s.roll.toLowerCase() === roll.toLowerCase());
  if (student) {
    currentSession = { role: 'student', id: student.id, name: student.name, roll: student.roll };
    sessionStorage.setItem('gradify_session', JSON.stringify(currentSession));
    loginSuccess();
  } else {
    showLoginAlert('Student roll number not found.');
  }
}

function showLoginAlert(msg) {
  const alertEl = document.getElementById('login-alert');
  alertEl.textContent = msg;
  alertEl.classList.add('show');
  setTimeout(() => alertEl.classList.remove('show'), 4000);
}

function handleLoginKey(e, role) {
  if (e.key === 'Enter') {
    if (role === 'student') loginStudent();
    else loginAdmin();
  }
}

function switchLoginTab(role) {
  document.querySelectorAll('.login-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.login-fields').forEach(f => f.classList.remove('active'));

  if (role === 'student') {
    document.getElementById('tab-student').classList.add('active');
    document.getElementById('login-fields-student').classList.add('active');
  } else {
    document.getElementById('tab-admin').classList.add('active');
    document.getElementById('login-fields-admin').classList.add('active');
  }
}

function loginSuccess() {
  document.getElementById('app-header').style.display = 'flex';

  const avatarLetter = currentSession.name.charAt(0).toUpperCase();
  document.getElementById('avatar-letter').textContent = avatarLetter;
  document.getElementById('profile-name').textContent = currentSession.name;

  // Show user profile container
  document.getElementById('user-profile').style.display = 'flex';

  if (currentSession.role === 'admin') {
    document.getElementById('profile-role').textContent = 'Administrator';
    document.getElementById('admin-nav').style.display = 'flex';
    document.getElementById('student-nav').style.display = 'none';
    showView('dashboard');
  } else {
    document.getElementById('profile-role').textContent = `Student (${currentSession.roll})`;
    document.getElementById('admin-nav').style.display = 'none';
    document.getElementById('student-nav').style.display = 'flex';
    showView('student-dashboard');
  }
}

function logout() {
  currentSession = null;
  sessionStorage.removeItem('gradify_session');

  // Hide specific session elements but keep header visible
  document.getElementById('admin-nav').style.display = 'none';
  document.getElementById('student-nav').style.display = 'none';
  document.getElementById('user-profile').style.display = 'none';

  document.getElementById('login-roll').value = '';
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';

  showView('login');
}

/* ===================== NAVIGATION ===================== */

function showView(name) {
  triggerTopLoadingBar();
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const viewEl = document.getElementById('view-' + name);
  if (viewEl) viewEl.classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(b => {
    if (b.id === 'btn-' + name) b.classList.add('active');
  });

  if (name === 'dashboard') renderDashboard();
  if (name === 'students') renderStudentTable();
  if (name === 'results') renderResultTable();
  if (name === 'analysis') renderAnalysis();
  if (name === 'reports') populateReportDropdowns();

  // Student Portal
  if (name === 'student-dashboard') renderStudentDashboard();
  if (name === 'student-reports') populateStudentReportDropdown();

  applyTiltEffect();
}

/* ===================== DASHBOARD ===================== */

function renderDashboard() {
  const totalStudents = db.students.length;
  const totalResults = db.results.length;
  const allPcts = db.results.map(r => {
    const s = findStudent(r.studentId);
    if (!s) return null;
    return calcResultStats(r, s.cls).pct;
  }).filter(p => p !== null);
  const avgPct = allPcts.length ? Math.round(allPcts.reduce((a, b) => a + b, 0) / allPcts.length) : 0;
  const passCount = allPcts.filter(p => p >= 35).length;
  const passRate = allPcts.length ? Math.round((passCount / allPcts.length) * 100) : 0;

  document.getElementById('dash-stats').innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Total Students</div>
      <div class="stat-value">${totalStudents}</div>
      <div class="stat-sub">Enrolled</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Exams Recorded</div>
      <div class="stat-value">${totalResults}</div>
      <div class="stat-sub">Across all students</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Average Score</div>
      <div class="stat-value">${avgPct}%</div>
      <div class="stat-sub">Overall performance</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Pass Rate</div>
      <div class="stat-value">${passRate}%</div>
      <div class="stat-sub">${passCount} of ${allPcts.length} results</div>
    </div>
  `;

  // Grade dist
  const grades = { O: 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
  allPcts.forEach(p => grades[getGrade(p)]++);
  const gradeColors = { O: 'var(--accent)', A: 'var(--blue)', B: 'var(--purple)', C: 'var(--gold)', D: '#fb923c', F: 'var(--red)' };
  const maxG = Math.max(...Object.values(grades), 1);
  document.getElementById('grade-bar-chart').innerHTML = Object.entries(grades).map(([g, c]) => `
    <div class="bar-row">
      <div class="bar-label">${g} - ${gradeLabel(g)}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${Math.round((c / maxG) * 100)}%;background:${gradeColors[g]}">
          ${c > 0 ? c : ''}
        </div>
      </div>
      <div class="bar-count">${c}</div>
    </div>
  `).join('');

  // Top performers
  const topStudents = db.students.map(s => ({
    ...s, avg: getStudentAvg(s.id, s.cls) || 0
  })).sort((a, b) => b.avg - a.avg).slice(0, 5);
  document.getElementById('top-performers-list').innerHTML = topStudents.length
    ? topStudents.map((s, i) => `
    <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border)">
      <div class="rank-num ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}">${i + 1}</div>
      <div style="flex:1">
        <div style="font-weight:500;font-size:13px">${s.name}</div>
        <div style="font-size:11px;color:var(--text3)">${s.cls}</div>
      </div>
      <span class="grade-badge grade-${getGrade(s.avg)}">${s.avg}%</span>
    </div>
  `).join('')
    : '<div class="empty"><p>No results yet</p></div>';

  // Class avg
  const classMap = {};
  db.students.forEach(s => {
    const avg = getStudentAvg(s.id, s.cls);
    if (avg !== null) {
      if (!classMap[s.cls]) classMap[s.cls] = [];
      classMap[s.cls].push(avg);
    }
  });
  document.getElementById('class-avg-chart').innerHTML = Object.entries(classMap).map(([cls, avgs]) => {
    const avg = Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length);
    return `<div class="bar-row">
      <div class="bar-label" style="min-width:90px;font-size:11px">${cls}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${avg}%;background:var(--blue)">${avg}%</div></div>
      <div class="bar-count">${avgs.length}s</div>
    </div>`;
  }).join('') || '<div class="empty"><p>No data</p></div>';

  // Subject perf
  const subMap = {};
  db.results.forEach(r => {
    const s = findStudent(r.studentId);
    if (!s) return;
    Object.entries(r.marks).forEach(([sub, m]) => {
      if (!subMap[sub]) subMap[sub] = [];
      subMap[sub].push(m);
    });
  });
  const subAvgs = Object.entries(subMap).map(([sub, marks]) => [sub, Math.round(marks.reduce((a, b) => a + b, 0) / marks.length)]).sort((a, b) => b[1] - a[1]);
  document.getElementById('subject-perf-chart').innerHTML = subAvgs.map(([sub, avg]) => `
    <div class="bar-row">
      <div class="bar-label" style="min-width:100px;font-size:11px">${sub}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${avg}%;background:${gradeColor(avg)}">${avg}</div></div>
      <div class="bar-count">${avg}%</div>
    </div>
  `).join('') || '<div class="empty"><p>No data</p></div>';

  applyTiltEffect();
}

/* ===================== STUDENTS ===================== */

let editStudentId = null;

function openStudentModal(id = null) {
  editStudentId = id;
  document.getElementById('student-modal-title').textContent = id ? 'Edit Student' : 'Add Student';
  if (id) {
    const s = findStudent(id);
    document.getElementById('m-roll').value = s.roll;
    document.getElementById('m-name').value = s.name;
    document.getElementById('m-class').value = s.cls;
    document.getElementById('m-gender').value = s.gender;
  } else {
    document.getElementById('m-roll').value = '';
    document.getElementById('m-name').value = '';
  }
  hideAlert('modal-alert');
  openModal('modal-student');
}

function saveStudent() {
  const roll = document.getElementById('m-roll').value.trim();
  const name = document.getElementById('m-name').value.trim();
  const cls = document.getElementById('m-class').value;
  const gender = document.getElementById('m-gender').value;
  if (!roll || !name) { showAlert('modal-alert', 'error', 'Please fill all fields.'); return; }
  const existing = db.students.find(s => s.roll === roll && s.id !== editStudentId);
  if (existing) { showAlert('modal-alert', 'error', 'Roll number already exists.'); return; }
  if (editStudentId) {
    const idx = db.students.findIndex(s => s.id === editStudentId);
    db.students[idx] = { ...db.students[idx], roll, name, cls, gender };
  } else {
    db.students.push({ id: db.nextStudentId++, roll, name, cls, gender });
  }
  save();
  closeModal('modal-student');
  renderStudentTable();
  showAlert('student-alert', 'success', `Student ${editStudentId ? 'updated' : 'added'} successfully.`);
}

function deleteStudent(id) {
  if (!confirm('Delete this student and all their results?')) return;
  db.students = db.students.filter(s => s.id !== id);
  db.results = db.results.filter(r => r.studentId !== id);
  save();
  renderStudentTable();
}

function renderStudentTable() {
  const search = (document.getElementById('student-search')?.value || '').toLowerCase();
  const clsFilter = document.getElementById('student-class-filter')?.value || '';
  const filtered = db.students.filter(s =>
    (!search || s.name.toLowerCase().includes(search) || s.roll.toLowerCase().includes(search)) &&
    (!clsFilter || s.cls === clsFilter)
  );
  const tbody = document.getElementById('student-tbody');
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty"><p>No students found</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = filtered.map((s, i) => {
    const avg = getStudentAvg(s.id, s.cls);
    const exams = getStudentResults(s.id).length;
    const grade = avg !== null ? getGrade(avg) : '-';
    return `<tr>
      <td><span class="table-index">${i + 1}</span></td>
      <td style="font-weight:500">${s.roll}</td>
      <td>${s.name}</td>
      <td><span class="branch-badge">${s.cls}</span></td>
      <td style="color:var(--text2)">${s.gender}</td>
      <td style="color:var(--text3)">${exams}</td>
      <td>${avg !== null ? avg + '%' : '—'}</td>
      <td>${avg !== null ? `<span class="grade-badge grade-${grade}">${grade}</span>` : '—'}</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="openStudentModal(${s.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteStudent(${s.id})" style="margin-left:4px">Delete</button>
      </td>
    </tr>`;
  }).join('');

  applyTiltEffect();
}

/* ===================== RESULTS ===================== */

function openResultModal() {
  const sel = document.getElementById('r-student');
  sel.innerHTML = db.students.map(s => `<option value="${s.id}">${s.roll} — ${s.name} (${s.cls})</option>`).join('');
  renderSubjectInputs();
  sel.addEventListener('change', renderSubjectInputs);
  hideAlert('result-modal-alert');
  openModal('modal-result');
}

function renderSubjectInputs() {
  const studentId = parseInt(document.getElementById('r-student').value);
  const student = findStudent(studentId);
  const subjects = student ? SUBJECTS_BY_CLASS[student.cls] : [];
  document.getElementById('subjects-inputs').innerHTML = `
    <div style="margin-bottom:8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--text3)">Marks (out of 100)</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      ${subjects.map(sub => `
        <div class="form-group" style="margin-bottom:0">
          <label>${sub}</label>
          <input type="number" id="subj-${sub.replace(/\s/g, '_')}" min="0" max="100" placeholder="0-100" />
        </div>
      `).join('')}
    </div>
  `;
}

function saveResult() {
  const studentId = parseInt(document.getElementById('r-student').value);
  const student = findStudent(studentId);
  const exam = document.getElementById('r-exam').value;
  const year = document.getElementById('r-year').value;
  const subjects = SUBJECTS_BY_CLASS[student.cls];
  const marks = {};
  let valid = true;
  subjects.forEach(sub => {
    const val = parseInt(document.getElementById('subj-' + sub.replace(/\s/g, '_')).value);
    if (isNaN(val) || val < 0 || val > 100) { valid = false; return; }
    marks[sub] = val;
  });
  if (!valid) { showAlert('result-modal-alert', 'error', 'Please enter valid marks (0–100) for all subjects.'); return; }
  // Check duplicate
  const dup = db.results.find(r => r.studentId === studentId && r.exam === exam && r.year === year);
  if (dup) { showAlert('result-modal-alert', 'error', 'Result already exists for this student and exam.'); return; }
  db.results.push({ id: db.nextResultId++, studentId, exam, year, marks });
  save();
  closeModal('modal-result');
  renderResultTable();
  showAlert('result-alert', 'success', 'Result added successfully.');
}

function deleteResult(id) {
  if (!confirm('Delete this result?')) return;
  db.results = db.results.filter(r => r.id !== id);
  save();
  renderResultTable();
}

function renderResultTable() {
  const search = (document.getElementById('result-search')?.value || '').toLowerCase();
  const examFilter = document.getElementById('result-exam-filter')?.value || '';
  const tbody = document.getElementById('result-tbody');
  let rows = db.results.filter(r => {
    const s = findStudent(r.studentId);
    if (!s) return false;
    return (!search || s.name.toLowerCase().includes(search) || s.roll.includes(search)) &&
      (!examFilter || r.exam === examFilter);
  });
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty"><p>No results found</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(r => {
    const s = findStudent(r.studentId);
    const stats = calcResultStats(r, s.cls);
    const marksStr = Object.entries(r.marks).map(([sub, m]) => `<span title="${sub}">${m}</span>`).join(' · ');
    return `<tr>
      <td><div style="font-weight:500">${s.name}</div><div style="font-size:11px;color:var(--text3)">${s.roll}</div></td>
      <td><span class="branch-badge">${s.cls}</span></td>
      <td>${r.exam}</td>
      <td style="color:var(--text2)">${r.year}</td>
      <td style="font-size:12px;color:var(--text2)">${marksStr}</td>
      <td>
        <div style="font-weight:600">${stats.pct}%</div>
        <div class="progress-mini" style="margin-top:4px"><div class="progress-fill" style="width:${stats.pct}%;background:${gradeColor(stats.pct)}"></div></div>
      </td>
      <td><span class="grade-badge grade-${stats.grade}">${stats.grade}</span></td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteResult(${r.id})">Delete</button>
      </td>
    </tr>`;
  }).join('');

  applyTiltEffect();
}

/* ===================== ANALYSIS ===================== */

function switchTab(name) {
  document.querySelectorAll('.tab-view').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).style.display = 'block';
  document.getElementById('tab-btn-' + name).classList.add('active');
  if (name === 'rank') renderRankings();
  if (name === 'subject') renderSubjectAnalysis();
  if (name === 'class') renderClassAnalysis();
  if (name === 'fail') renderFailAnalysis();
}

function renderAnalysis() { renderRankings(); }

function renderRankings() {
  const examF = document.getElementById('rank-exam-filter')?.value || '';
  const ranked = db.students.map(s => {
    const results = getStudentResults(s.id, examF);
    if (!results.length) return null;
    const pcts = results.map(r => calcResultStats(r, s.cls).pct);
    const avg = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
    return { ...s, avg, grade: getGrade(avg) };
  }).filter(Boolean).sort((a, b) => b.avg - a.avg);

  const el = document.getElementById('rankings-list');
  if (!ranked.length) { el.innerHTML = '<div class="empty"><p>No results</p></div>'; return; }
  el.innerHTML = ranked.map((s, i) => `
    <div style="display:grid;grid-template-columns:40px 1fr auto auto;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
      <div class="rank-num ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}">${i + 1}</div>
      <div>
        <div style="font-weight:500">${s.name}</div>
        <div style="font-size:11px;color:var(--text3)">${s.roll} · ${s.cls}</div>
      </div>
      <div style="margin-right: 15px;">
        <div class="progress-mini" style="width:120px;margin-bottom:4px"><div class="progress-fill" style="width:${s.avg}%;background:${gradeColor(s.avg)}"></div></div>
        <div style="font-size:11px;color:var(--text2);text-align:right">${s.avg}%</div>
      </div>
      <span class="grade-badge grade-${s.grade}">${s.grade}</span>
    </div>
  `).join('');

  applyTiltEffect();
}

function renderSubjectAnalysis() {
  const subMap = {};
  db.results.forEach(r => {
    const s = findStudent(r.studentId);
    if (!s) return;
    Object.entries(r.marks).forEach(([sub, m]) => {
      if (!subMap[sub]) subMap[sub] = { marks: [], fails: 0, total: 0 };
      subMap[sub].marks.push(m);
      subMap[sub].total++;
      if (m < PASS_MARK) subMap[sub].fails++;
    });
  });
  const el = document.getElementById('subject-analysis');
  el.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      ${Object.entries(subMap).map(([sub, data]) => {
    const avg = Math.round(data.marks.reduce((a, b) => a + b, 0) / data.marks.length);
    const failRate = Math.round((data.fails / data.total) * 100);
    return `<div class="card" style="padding:1.25rem;box-shadow:none;background:var(--surface2)">
          <div style="font-weight:600;margin-bottom:8px;font-size:14px;">${sub}</div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;color:var(--text2)">Average Marks</span>
            <span style="font-size:13px;font-weight:700;color:${gradeColor(avg)}">${avg}%</span>
          </div>
          <div class="progress-mini" style="margin-bottom:8px"><div class="progress-fill" style="width:${avg}%;background:${gradeColor(avg)}"></div></div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text3)">
            <span>Fail rate: <b style="color:${failRate > 0 ? 'var(--red)' : 'var(--text3)'}">${failRate}%</b></span>
            <span>${data.total} entries</span>
          </div>
        </div>`;
  }).join('')}
    </div>
  `;

  applyTiltEffect();
}

function renderClassAnalysis() {
  const classMap = {};
  db.students.forEach(s => {
    if (!classMap[s.cls]) classMap[s.cls] = { students: [], avgs: [] };
    classMap[s.cls].students.push(s);
    const avg = getStudentAvg(s.id, s.cls);
    if (avg !== null) classMap[s.cls].avgs.push(avg);
  });
  const el = document.getElementById('class-analysis');
  el.innerHTML = Object.entries(classMap).map(([cls, data]) => {
    const avg = data.avgs.length ? Math.round(data.avgs.reduce((a, b) => a + b, 0) / data.avgs.length) : 0;
    const highest = data.avgs.length ? Math.max(...data.avgs) : 0;
    const lowest = data.avgs.length ? Math.min(...data.avgs) : 0;
    return `<div style="padding:12px 0;border-bottom:1px solid var(--border)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div>
          <div style="font-weight:600;font-size:14px;">${cls}</div>
          <div style="font-size:11px;color:var(--text3)">${data.students.length} students</div>
        </div>
        <span class="grade-badge grade-${getGrade(avg)}">${avg}% avg</span>
      </div>
      <div class="progress-mini" style="margin-bottom:6px"><div class="progress-fill" style="width:${avg}%;background:${gradeColor(avg)}"></div></div>
      <div style="display:flex;gap:16px;font-size:11px;color:var(--text3)">
        <span>Highest score: <b style="color:var(--text)">${highest}%</b></span>
        <span>Lowest score: <b style="color:var(--text)">${lowest}%</b></span>
      </div>
    </div>`;
  }).join('') || '<div class="empty"><p>No data</p></div>';

  applyTiltEffect();
}

function renderFailAnalysis() {
  const flagged = [];
  db.students.forEach(s => {
    const results = getStudentResults(s.id);
    results.forEach(r => {
      const stats = calcResultStats(r, s.cls);
      if (stats.failed.length > 0 || stats.pct < 35) {
        flagged.push({ student: s, result: r, stats });
      }
    });
  });
  const el = document.getElementById('fail-analysis');
  if (!flagged.length) { el.innerHTML = '<div class="empty"><p>🎉 No students requiring attention!</p></div>'; return; }
  el.innerHTML = flagged.map(({ student: s, result: r, stats }) => `
    <div style="padding:12px 0;border-bottom:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="flex:1">
          <div style="font-weight:500;font-size:14px">${s.name} <span style="color:var(--text3);font-size:12px">(${s.roll})</span></div>
          <div style="font-size:11px;color:var(--text3)">${s.cls} · ${r.exam} · ${r.year}</div>
        </div>
        <span class="grade-badge grade-${stats.grade}">${stats.pct}%</span>
      </div>
      ${stats.failed.length ? `<div style="margin-top:6px;font-size:12px;color:var(--red)">
        ⚠ Failed: ${stats.failed.join(', ')}
      </div>` : ''}
    </div>
  `).join('');

  applyTiltEffect();
}

/* ===================== REPORTS (ADMIN) ===================== */

function populateReportDropdowns() {
  const sel = document.getElementById('report-student-sel');
  sel.innerHTML = db.students.map(s => `<option value="${s.id}">${s.roll} — ${s.name}</option>`).join('');
}

function generateReport() {
  const studentId = parseInt(document.getElementById('report-student-sel').value);
  const examFilter = document.getElementById('report-exam-sel').value;
  const student = findStudent(studentId);
  if (!student) return;
  const results = getStudentResults(studentId, examFilter);
  const el = document.getElementById('report-output');
  if (!results.length) { el.innerHTML = '<div class="card"><div class="card-body empty"><p>No results found for this selection.</p></div></div>'; return; }
  const subjects = SUBJECTS_BY_CLASS[student.cls];
  const overallPct = Math.round(results.reduce((a, r) => a + calcResultStats(r, student.cls).pct, 0) / results.length);
  el.innerHTML = `
    <div class="report-card">
      <div class="report-card-header">
        <h2>${student.name}</h2>
        <p>${student.roll} · ${student.cls} · ${student.gender}</p>
        <div style="margin-top:12px;display:flex;gap:24px">
          <div><div style="font-size:11px;opacity:.5">Overall Avg</div><div style="font-family:'DM Serif Display',serif;font-size:1.5rem">${overallPct}%</div></div>
          <div><div style="font-size:11px;opacity:.5">Grade</div><div style="font-family:'DM Serif Display',serif;font-size:1.5rem">${getGrade(overallPct)}</div></div>
          <div><div style="font-size:11px;opacity:.5">Exams</div><div style="font-family:'DM Serif Display',serif;font-size:1.5rem">${results.length}</div></div>
        </div>
      </div>
      <div class="card-body" style="padding: 1.5rem 2rem;">
        ${results.map(r => {
    const stats = calcResultStats(r, student.cls);
    return `
          <div style="margin-bottom:1.5rem">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
              <div>
                <div style="font-weight:600">${r.exam}</div>
                <div style="font-size:11px;color:var(--text3)">${r.year}</div>
              </div>
              <div style="text-align:right">
                <span class="grade-badge grade-${stats.grade}">${stats.grade} · ${stats.pct}%</span>
                ${stats.failed.length ? `<div style="font-size:11px;color:var(--red);margin-top:3px">Failed: ${stats.failed.join(', ')}</div>` : ''}
              </div>
            </div>
            <div class="subject-row header">
              <div>Subject</div><div>Max</div><div>Scored</div><div>%</div><div style="text-align:right">Status</div>
            </div>
            ${subjects.map(sub => {
      const m = r.marks[sub] || 0;
      const pct = Math.round((m / MAX_MARKS) * 100);
      const passed = m >= PASS_MARK;
      return `<div class="subject-row">
                <div>${sub}</div>
                <div style="color:var(--text3)">${MAX_MARKS}</div>
                <div style="font-weight:500">${m}</div>
                <div>${pct}%</div>
                <div style="text-align:right"><span style="font-size:11px;padding:2px 8px;border-radius:4px;background:${passed ? 'var(--accent-light)' : 'var(--red-light)'};color:${passed ? 'var(--accent)' : 'var(--red)'}">${passed ? 'Pass' : 'Fail'}</span></div>
              </div>`;
    }).join('')}
            <div style="display:flex;justify-content:space-between;margin-top:8px;padding-top:8px;border-top:1px solid var(--border);font-weight:600;font-size:13px">
              <span>Total</span>
              <span>${stats.total} / ${subjects.length * MAX_MARKS}</span>
            </div>
          </div>`;
  }).join('<hr style="border:none;border-top:1px dashed var(--border);margin:1.5rem 0">')}
      </div>
    </div>
  `;

  applyTiltEffect();
}

/* ===================== STUDENT PORTAL FUNCTIONS ===================== */

function createCircularProgress(percentage, color, label, size = 100, strokeWidth = 8) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius; // 2 * PI * 46 = 289
  const offset = circumference - (percentage / 100) * circumference;

  return `
    <div class="circular-progress-card">
      <div class="circular-progress-container" style="width: ${size}px; height: ${size}px;">
        <svg width="${size}" height="${size}" class="circular-progress-svg">
          <defs>
            <linearGradient id="circGold-${label.replace(/\s+/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#d4af37" />
              <stop offset="100%" stop-color="#aa7c11" />
            </linearGradient>
          </defs>
          <circle class="bg" cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke-width="${strokeWidth}"></circle>
          <circle class="fg" cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke-width="${strokeWidth}"
            stroke="url(#circGold-${label.replace(/\s+/g, '')})"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${circumference}"
            data-offset="${offset}"
            stroke-linecap="round"
            transform="rotate(-90 ${size / 2} ${size / 2})">
          </circle>
        </svg>
        <div class="circular-progress-text" style="color: #aa7c11;">${percentage}%</div>
      </div>
      <div class="circular-progress-label">${label}</div>
    </div>
  `;
}

function triggerCircularProgressAnimation() {
  setTimeout(() => {
    document.querySelectorAll('.circular-progress-svg circle.fg').forEach(circle => {
      const offset = circle.getAttribute('data-offset');
      circle.style.strokeDashoffset = offset;
    });
  }, 100);
}

function renderStudentDashboard() {
  if (currentSession.role !== 'student') return;
  const studentId = currentSession.id;
  const student = findStudent(studentId);
  if (!student) return;

  document.getElementById('student-welcome-title').textContent = `Welcome back, ${student.name}!`;

  const results = getStudentResults(studentId);
  let overallAvg = 0;
  let grade = 'F';
  let passed = true;
  let failedSubjectsList = [];

  if (results.length > 0) {
    const statsList = results.map(r => calcResultStats(r, student.cls));
    const totalPcts = statsList.map(s => s.pct);
    overallAvg = Math.round(totalPcts.reduce((a, b) => a + b, 0) / totalPcts.length);
    grade = getGrade(overallAvg);

    const allFailed = new Set();
    statsList.forEach(s => {
      s.failed.forEach(sub => allFailed.add(sub));
    });
    failedSubjectsList = Array.from(allFailed);
    passed = failedSubjectsList.length === 0;
  }

  const gradeBadge = document.getElementById('student-overall-grade');
  gradeBadge.className = `grade-badge grade-${grade}`;
  gradeBadge.textContent = `Grade ${grade} — ${gradeLabel(grade)}`;

  document.getElementById('student-avg-score').textContent = `${overallAvg}%`;
  document.getElementById('student-exams-count').textContent = results.length;

  const statusEl = document.getElementById('student-status');
  const backlogEl = document.getElementById('student-failed-subjects');
  if (passed) {
    statusEl.textContent = 'PASS';
    statusEl.style.color = 'var(--accent)';
    backlogEl.textContent = 'No backlog subjects';
    backlogEl.style.color = 'var(--text3)';
  } else {
    statusEl.textContent = 'FAIL';
    statusEl.style.color = 'var(--red)';
    backlogEl.textContent = `Failing: ${failedSubjectsList.join(', ')}`;
    backlogEl.style.color = 'var(--red)';
  }

  const classStudents = db.students.filter(s => s.cls === student.cls);
  const rankedClass = classStudents.map(s => {
    return { id: s.id, avg: getStudentAvg(s.id, s.cls) || 0 };
  }).sort((a, b) => b.avg - a.avg);

  const myRankIdx = rankedClass.findIndex(r => r.id === studentId);
  const myRank = myRankIdx !== -1 ? myRankIdx + 1 : '--';

  document.getElementById('student-rank').textContent = `#${myRank}`;
  document.getElementById('student-rank-sub').textContent = `Out of ${classStudents.length} students in ${student.cls}`;

  const subjects = SUBJECTS_BY_CLASS[student.cls] || [];
  const subjectScores = {};
  subjects.forEach(sub => { subjectScores[sub] = []; });

  results.forEach(r => {
    Object.entries(r.marks).forEach(([sub, score]) => {
      if (subjectScores[sub]) subjectScores[sub].push(score);
    });
  });

  const circularChartsGrid = document.getElementById('student-circular-charts');
  if (results.length === 0) {
    circularChartsGrid.innerHTML = `<div class="empty" style="grid-column: 1/-1;"><p>No exam results recorded yet.</p></div>`;
  } else {
    circularChartsGrid.innerHTML = subjects.map(sub => {
      const scores = subjectScores[sub] || [];
      const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const color = gradeColor(avg);
      return createCircularProgress(avg, color, sub);
    }).join('');
    triggerCircularProgressAnimation();
  }

  const historyList = document.getElementById('student-exam-history-list');
  if (results.length === 0) {
    historyList.innerHTML = `<div class="empty"><p>No exams recorded</p></div>`;
  } else {
    historyList.innerHTML = results.map(r => {
      const stats = calcResultStats(r, student.cls);
      return `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--border)">
          <div>
            <div style="font-weight:600; color:var(--text2)">${r.exam}</div>
            <div style="font-size:11px; color:var(--text3)">Academic Year: ${r.year}</div>
          </div>
          <div style="display:flex; align-items:center; gap:12px">
            <span style="font-weight:700; color:var(--text)">${stats.pct}%</span>
            <span class="grade-badge grade-${stats.grade}">${stats.grade}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  const comparisonList = document.getElementById('student-comparison-list');
  if (results.length === 0) {
    comparisonList.innerHTML = `<div class="empty"><p>No comparison data</p></div>`;
  } else {
    const classResults = db.results.filter(r => {
      const s = findStudent(r.studentId);
      return s && s.cls === student.cls;
    });

    comparisonList.innerHTML = subjects.map(sub => {
      const myScores = subjectScores[sub] || [];
      const myAvg = myScores.length ? Math.round(myScores.reduce((a, b) => a + b, 0) / myScores.length) : 0;

      const classScores = [];
      classResults.forEach(cr => {
        if (cr.marks && cr.marks[sub] !== undefined) {
          classScores.push(cr.marks[sub]);
        }
      });
      const classAvg = classScores.length ? Math.round(classScores.reduce((a, b) => a + b, 0) / classScores.length) : 0;

      return `
        <div>
          <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px">
            <span style="font-weight:600; color:var(--text2)">${sub}</span>
            <span>You: <b style="color:var(--text)">${myAvg}%</b> | Class Avg: <b style="color:var(--text3)">${classAvg}%</b></span>
          </div>
          <div style="display:flex; flex-direction:column; gap:4px">
            <div class="progress-mini" title="Your Average: ${myAvg}%">
              <div class="progress-fill my-avg-fill" style="width:${myAvg}%;"></div>
            </div>
            <div class="progress-mini" title="Class Average: ${classAvg}%">
              <div class="progress-fill class-avg-fill" style="width:${classAvg}%;"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  applyTiltEffect();
}

function populateStudentReportDropdown() {
  const sel = document.getElementById('student-report-exam-sel');
  if (!sel) return;
  const studentId = currentSession.id;
  const results = getStudentResults(studentId);
  if (results.length === 0) {
    sel.innerHTML = `<option value="">No exams recorded</option>`;
    return;
  }
  sel.innerHTML = `
    <option value="">All Exams Combined</option>
    ${results.map(r => `<option value="${r.exam}">${r.exam} (${r.year})</option>`).join('')}
  `;
  renderStudentReportCard();
}

function renderStudentReportCard() {
  if (currentSession.role !== 'student') return;
  const studentId = currentSession.id;
  const examFilter = document.getElementById('student-report-exam-sel').value;
  const student = findStudent(studentId);
  if (!student) return;

  const results = getStudentResults(studentId, examFilter);
  const el = document.getElementById('student-report-output');
  if (!results.length) {
    el.innerHTML = '<div class="card"><div class="card-body empty"><p>No results found for this selection.</p></div></div>';
    return;
  }

  const subjects = SUBJECTS_BY_CLASS[student.cls];
  const overallPct = Math.round(results.reduce((a, r) => a + calcResultStats(r, student.cls).pct, 0) / results.length);

  el.innerHTML = `
    <div class="report-card">
      <div class="report-card-header">
        <h2>${student.name}</h2>
        <p>Roll No: ${student.roll} &nbsp;|&nbsp; Class: ${student.cls} &nbsp;|&nbsp; Gender: ${student.gender}</p>
        <div style="margin-top: 1.5rem; display: flex; gap: 2rem;">
          <div>
            <div style="font-size: 11px; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.05em;">Overall Avg</div>
            <div style="font-family: 'DM Serif Display', serif; font-size: 1.8rem;">${overallPct}%</div>
          </div>
          <div>
            <div style="font-size: 11px; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.05em;">Overall Grade</div>
            <div style="font-family: 'DM Serif Display', serif; font-size: 1.8rem; color: ${gradeColor(overallPct)}">${getGrade(overallPct)}</div>
          </div>
          <div>
            <div style="font-size: 11px; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.05em;">Status</div>
            <div style="font-family: 'DM Serif Display', serif; font-size: 1.8rem; color: ${overallPct >= 35 ? 'var(--accent)' : 'var(--red)'}">${overallPct >= 35 ? 'Passed' : 'Failed'}</div>
          </div>
        </div>
      </div>
      <div class="card-body" style="padding: 1.5rem 2rem;">
        ${results.map(r => {
    const stats = calcResultStats(r, student.cls);
    return `
          <div style="margin-bottom: 2rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
              <div>
                <div style="font-weight: 700; font-size: 14px; color: var(--text);">${r.exam}</div>
                <div style="font-size: 11px; color: var(--text3)">Academic Year: ${r.year}</div>
              </div>
              <div style="text-align: right;">
                <span class="grade-badge grade-${stats.grade}">${stats.grade} &nbsp;·&nbsp; ${stats.pct}%</span>
                ${stats.failed.length ? `<div style="font-size: 11px; color: var(--red); margin-top: 4px;">Failed: ${stats.failed.join(', ')}</div>` : ''}
              </div>
            </div>
            
            <div class="subject-row header">
              <div>Subject</div>
              <div style="text-align: center;">Max Marks</div>
              <div style="text-align: center;">Scored Marks</div>
              <div style="text-align: center;">Percentage</div>
              <div style="text-align: right;">Status</div>
            </div>
            
            ${subjects.map(sub => {
      const m = r.marks[sub] !== undefined ? r.marks[sub] : 0;
      const pct = Math.round((m / MAX_MARKS) * 100);
      const passed = m >= PASS_MARK;
      return `
              <div class="subject-row">
                <div style="font-weight: 500;">${sub}</div>
                <div style="text-align: center; color: var(--text3);">${MAX_MARKS}</div>
                <div style="text-align: center; font-weight: 600; color: ${passed ? 'var(--text)' : 'var(--red)'}">${m}</div>
                <div style="text-align: center;">${pct}%</div>
                <div style="text-align: right;">
                  <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: ${passed ? 'var(--accent-light)' : 'var(--red-light)'}; color: ${passed ? 'var(--accent)' : 'var(--red)'}">
                    ${passed ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              </div>`;
    }).join('')}
            
            <div style="display:flex; justify-content:space-between; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); font-weight: 700; font-size: 13px;">
              <span>Total Score</span>
              <span>${stats.total} / ${subjects.length * MAX_MARKS}</span>
            </div>
          </div>`;
  }).join('<hr style="border:none; border-top: 1px dashed var(--border); margin: 2rem 0;">')}
      </div>
    </div>
  `;

  applyTiltEffect();
}

/* ===================== MODAL / ALERT UTILS ===================== */

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function showAlert(id, type, msg) {
  const el = document.getElementById(id);
  el.className = `alert alert-${type} show`;
  el.textContent = msg;
  setTimeout(() => el.className = 'alert', 4000);
}
function hideAlert(id) { document.getElementById(id).className = 'alert'; }

// Click outside modal to close
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });
});

/* ===================== INIT ===================== */

// On DOM Loaded
window.addEventListener('DOMContentLoaded', () => {
  load();
  initCanvas();
  initCardTilt();
  checkAuthSession();

  // Load saved theme
  const savedTheme = localStorage.getItem('resultseeker_theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    const icon = document.getElementById('theme-toggle-icon');
    if (icon) {
      icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
    }
  }

  // Fade out global loader when loaded
  setTimeout(() => {
    const loader = document.getElementById('global-loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 400);
    }
  }, 1500);
});

function triggerTopLoadingBar() {
  const bar = document.getElementById('top-loading-bar');
  if (!bar) return;
  bar.style.transition = 'none';
  bar.style.width = '0%';
  bar.style.opacity = '1';

  // Force browser layout reflow
  bar.offsetHeight;

  bar.style.transition = 'width 0.4s cubic-bezier(0.1, 0.8, 0.3, 1)';
  bar.style.width = '75%';

  setTimeout(() => {
    bar.style.transition = 'width 0.2s ease, opacity 0.2s ease';
    bar.style.width = '100%';
    setTimeout(() => {
      bar.style.opacity = '0';
    }, 200);
  }, 400);
}

function toggleTheme() {
  const body = document.body;
  const icon = document.getElementById('theme-toggle-icon');
  body.classList.toggle('dark-theme');

  const isDark = body.classList.contains('dark-theme');
  localStorage.setItem('resultseeker_theme', isDark ? 'dark' : 'light');

  if (isDark) {
    icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
  } else {
    icon.innerHTML = `
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    `;
  }
}

function openAboutModal() { openModal('modal-about'); }
function openContactModal() { openModal('modal-contact'); }