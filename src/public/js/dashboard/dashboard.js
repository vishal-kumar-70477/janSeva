/* ============================================================
  JanSeva — page interactions + authentication
   Demo-only. No data is submitted or stored anywhere real.
   ============================================================ */

/* ---------- icons (fail-safe) ---------- */
function icons(){ try{ if(window.lucide) lucide.createIcons(); }catch(e){} }
icons();
setTimeout(()=>document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in')),1500);

/* ---------- scroll reveal + counters ---------- */
window.addEventListener('DOMContentLoaded', ()=>{
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
  document.querySelectorAll('.reveal').forEach((el,i)=>{el.style.transitionDelay=(i%4)*60+'ms';io.observe(el)});

  const co=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){
      const el=e.target, to=+el.dataset.to; let s=null;
      const step=t=>{ if(!s)s=t; const p=Math.min((t-s)/1400,1); el.textContent=Math.floor(p*to).toLocaleString(); if(p<1) requestAnimationFrame(step); };
      requestAnimationFrame(step); co.unobserve(el);
    }}),{threshold:.5});
  document.querySelectorAll('.count').forEach(el=>co.observe(el));

  document.querySelectorAll('#mmenu a').forEach(a=>a.addEventListener('click',()=>document.getElementById('mmenu').classList.add('hidden')));
  document.getElementById('mmenu-toggle')?.addEventListener('click', ()=>document.getElementById('mmenu').classList.toggle('hidden'));
});

/* ============================================================
   DATA MODEL (frontend-only, ready to map to a future backend)
   ============================================================ */
const RoleConfig = {
  patient: {
    label: 'Patient / Family',
    desc: 'Manage your health information and emergency details.',
    icon: 'users', bg:'bg-mint',
    loginTitle: 'Login as Patient / Family',
    loginFields: [
      {name:'mobile', label:'Mobile Number', type:'tel', placeholder:'10-digit mobile number', validate:'mobile'},
      {name:'password', label:'Password', type:'password', placeholder:'••••••••', validate:'requiredOnly'},
    ],
    canRegister: true
  },
  doctor: {
    label: 'Doctor',
    desc: 'Manage incoming cases and coordinate patient care.',
    icon: 'stethoscope', bg:'bg-sgreen',
    loginTitle: 'Login as Doctor',
    loginFields: [
      {name:'idOrEmail', label:'Professional ID / Email', type:'text', placeholder:'MCI-XXXXXX or you@hospital.in', validate:'requiredOnly'},
      {name:'password', label:'Password', type:'password', placeholder:'••••••••', validate:'requiredOnly'},
    ],
    canRegister: true
  },
  hospital: {
    label: 'Hospital',
    desc: 'Manage emergency cases, beds, doctors and hospital readiness.',
    icon: 'hospital', bg:'bg-bg',
    loginTitle: 'Login as Hospital',
    loginFields: [
      {name:'idOrEmail', label:'Hospital ID / Email', type:'text', placeholder:'HOSP-1042 or admin@hospital.in', validate:'requiredOnly'},
      {name:'password', label:'Password', type:'password', placeholder:'••••••••', validate:'requiredOnly'},
    ],
    canRegister: true
  },
  admin: {
    label: 'Administrator',
    desc: 'Manage the JanSeva healthcare network.',
    icon: 'shield', bg:'',
    loginTitle: 'Login as Administrator',
    loginFields: [
      {name:'adminId', label:'Admin ID', type:'text', placeholder:'ADM-0001', validate:'requiredOnly'},
      {name:'password', label:'Password', type:'password', placeholder:'••••••••', validate:'requiredOnly'},
    ],
    canRegister: false
  }
};

let currentRole = null;    // 'patient' | 'doctor' | 'hospital' | 'admin'
let currentMode = 'login'; // 'login' | 'register'
let regStep = 1;           // patient wizard step (1..3)
const PatientDraft = { personal:{}, emergency:{}, medical:{}, security:{} };

/* ============================================================
   MODAL OPEN / CLOSE / NAVIGATION
   ============================================================ */
function openAuth(role){
  document.getElementById('auth').classList.remove('hidden');
  document.body.style.overflow='hidden';
  if(role) selectRole(roleKeyFromLabel(role)); else goStep('stepRole');
  icons();
}
function closeAuth(){
  document.getElementById('auth').classList.add('hidden');
  document.body.style.overflow='';
}
function roleKeyFromLabel(l){
  const map={'Patient / Family':'patient','Doctor':'doctor','Hospital':'hospital','Administrator':'admin'};
  return map[l] || l.toLowerCase();
}
function goStep(id){
  document.querySelectorAll('.auth-step').forEach(s=>s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  document.getElementById('auth').querySelector('.auth-step:not(.hidden)')?.scrollTo?.(0,0);
}
function selectRole(role){
  currentRole = role;
  regStep = 1;
  document.getElementById('choiceRoleLabel').textContent = RoleConfig[role].label;
  goStep('stepChoice');
  const cfg = RoleConfig[role];
  const regTab = document.getElementById('tabRegister');
  if(!cfg.canRegister){ regTab.classList.add('hidden'); } else { regTab.classList.remove('hidden'); }
  showAuthMode('login');
}
function showAuthMode(mode){
  currentMode = mode;
  document.getElementById('tabLogin').classList.toggle('active', mode==='login');
  document.getElementById('tabRegister').classList.toggle('active', mode==='register');
  const area = document.getElementById('modeArea');
  if(mode==='login') area.innerHTML = renderLogin(currentRole);
  else area.innerHTML = (currentRole==='admin') ? renderAdminRestricted() : renderRegister(currentRole);
  icons();
  wireForm();
}

/* ============================================================
   VALIDATION
   ============================================================ */
const V = {
  required: v => v.trim().length>0 ? '' : 'This field is required.',
  requiredOnly: v => v.trim().length>0 ? '' : 'This field is required.',
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.',
  mobile: v => /^[6-9]\d{9}$/.test(v.trim()) ? '' : 'Please enter a valid 10-digit mobile number.',
  dob: v => v ? '' : 'Please enter your date of birth.',
  password: v => v.length>=8 && /[A-Za-z]/.test(v) && /\d/.test(v) ? '' : 'Password must be at least 8 characters and include a letter and a number.',
};
function validateField(el){
  const rule = el.dataset.validate;
  if(!rule) return true;
  const wrap = el.closest('.field') || el.parentElement;
  let msg='';
  if(el.type==='checkbox'){ msg = el.checked ? '' : 'Please accept the terms to continue.'; }
  else if(rule==='confirm'){
    const other = document.querySelector(`[name="${el.dataset.matches}"]`);
    msg = (other && el.value===other.value && el.value.length>0) ? '' : 'Passwords do not match.';
  } else {
    msg = V[rule] ? V[rule](el.value) : '';
  }
  if(!wrap) return !msg;
  wrap.classList.toggle('error', !!msg);
  const errEl = wrap.querySelector('.err');
  if(errEl) errEl.textContent = msg;
  return !msg;
}
function validateForm(form){
  let ok=true;
  form.querySelectorAll('[data-validate]').forEach(el=>{ if(!validateField(el)) ok=false; });
  return ok;
}
function wireForm(){
  document.querySelectorAll('#modeArea [data-validate]').forEach(el=>{
    el.addEventListener('blur', ()=>validateField(el));
    el.addEventListener('input', ()=>{
      const wrap = el.closest('.field') || el.parentElement;
      if(wrap?.classList.contains('error')) validateField(el);
    });
  });
}

/* ============================================================
   FIELD RENDER HELPERS
   ============================================================ */
function field(f){
  const req = f.validate ? `data-validate="${f.validate}"` : '';
  const matches = f.matches ? `data-matches="${f.matches}"` : '';
  if(f.type==='select'){
    return `<div class="field"><label>${f.label}</label>
      <select name="${f.name}" ${req} ${matches}>
        <option value="">Select ${f.label}</option>
        ${f.options.map(o=>`<option value="${o}">${o}</option>`).join('')}
      </select>
      <span class="err"></span></div>`;
  }
  if(f.type==='file'){
    return `<div class="field"><label>${f.label}${f.optional?' <span class="hint">(optional)</span>':''}</label>
      <label class="field-file"><b>Choose file</b> or drag it here — ${f.hint||'PDF, JPG or PNG'}
      <input type="file" class="hidden" ${f.multiple?'multiple':''}></label></div>`;
  }
  if(f.type==='textarea'){
    return `<div class="field"><label>${f.label}${f.optional?' <span class="hint">(optional)</span>':''}</label>
      <textarea name="${f.name}" rows="2" placeholder="${f.placeholder||''}" ${req}></textarea>
      <span class="err"></span></div>`;
  }
  return `<div class="field"><label>${f.label}${f.optional?' <span class="hint">(optional)</span>':''}</label>
    <input type="${f.type}" name="${f.name}" placeholder="${f.placeholder||''}" ${req} ${matches}>
    <span class="err"></span></div>`;
}
function grid(fields, two=true){
  return `<div class="form-grid ${two?'two':''}">${fields.map(field).join('')}</div>`;
}

/* ============================================================
   LOGIN RENDER
   ============================================================ */
function renderLogin(role){
  const cfg = RoleConfig[role];
  return `
   <form id="loginForm" onsubmit="return submitLogin(event)">
    <h2>${cfg.loginTitle}</h2>
    <div class="mt-5">${grid(cfg.loginFields, false)}</div>
    <div class="flex items-center justify-between mt-1">
      <span></span>
      <a href="#" class="text-xs font-semibold text-teal1" onclick="return notify(event,'Password reset is not available in this demo.')">Forgot Password?</a>
    </div>
    <button class="btn mt-5 w-full rounded-full bg-teal1 text-white py-3.5 font-semibold">Login →</button>
    ${cfg.canRegister ? `<p class="mt-4 text-center text-sm text-ink2">Don't have an account?
      <a href="#" class="text-teal1 font-bold" onclick="event.preventDefault();showAuthMode('register')">Create Account</a></p>` : ''}
    <p class="demo-note">Demo interface — no credentials are submitted or stored.</p>
   </form>`;
}
function submitLogin(e){
  e.preventDefault();
  if(!validateForm(e.target)) return false;
  const credentials = Object.fromEntries(new FormData(e.target).entries());
  fetch('/janseva/patient-auth/login', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    credentials:'same-origin',
    body:JSON.stringify({
      email:credentials.email,
      mobile:credentials.mobile,
      password:credentials.password
    })
  }).then(async response=>{
    const data = await response.json();
    if(!response.ok) throw new Error(data.message || 'Login failed.');
    window.location.href = '/janseva/patient-auth/login';
  }).catch(error=>notify(e, error.message));
  return false;
}

/* ============================================================
   ADMIN RESTRICTED
   ============================================================ */
function renderAdminRestricted(){
  return `<div class="text-center py-6">
    <div class="mx-auto w-14 h-14 rounded-2xl bg-mint grid place-items-center text-teal1"><i data-lucide="shield-alert"></i></div>
    <h2 class="mt-4">Administrator access is restricted.</h2>
    <p class="text-ink2 mt-2 text-sm max-w-sm mx-auto">Administrator accounts are provisioned internally by JanSeva. Please use your assigned Admin ID and password to log in.</p>
    <button class="btn mt-5 rounded-full bg-teal1 text-white px-6 py-3 font-semibold text-sm" onclick="showAuthMode('login')">Back to Admin Login</button>
   </div>`;
}

/* ============================================================
   REGISTER RENDER — routed by role
   ============================================================ */
function renderRegister(role){
  if(role==='patient') return renderPatientStep(1);
  if(role==='doctor') return renderDoctorRegister();
  if(role==='hospital') return renderHospitalRegister();
  return '';
}

/* ============================================================
   PATIENT REGISTRATION — 3-STEP WIZARD
   (Personal → Emergency & Medical → Account Security)
   ============================================================ */
const PatientSteps = ['Personal Information','Emergency & Medical Information','Account Security'];

function progressBar(step, total){
  let segs='';
  for(let i=1;i<=total;i++){
    segs += `<div class="seg ${i<step?'done':i===step?'current':''}"></div>`;
  }
  return `<div class="progress">${segs}</div><p class="progress-label">Step ${step} of ${total} — ${PatientSteps[step-1]}</p>`;
}

function renderPatientStep(step){
  regStep = step;

  const nav = (isLast) => `
    <div class="flex gap-3 mt-6">
      ${step>1 ? `<button type="button" class="btn flex-1 rounded-full border border-line py-3 font-semibold" onclick="patientNav(${step-1})">Back</button>` : ''}
      <button type="submit" class="btn flex-1 rounded-full bg-teal1 text-white py-3 font-semibold">${isLast ? 'Create Account →' : 'Continue'}</button>
    </div>`;

  let body = '';

  /* ---------- STEP 1 — Personal Information ---------- */
  if(step===1){
    body = grid([
      {name:'fullName', label:'Full Name', type:'text', placeholder:'e.g. Rahul Sharma', validate:'required'},
      {name:'dob', label:'Date of Birth', type:'date', validate:'dob'},
      {name:'gender', label:'Gender', type:'select', options:['Male','Female','Other','Prefer not to say'], validate:'required'},
      {name:'mobile', label:'Mobile Number', type:'tel', placeholder:'10-digit mobile number', validate:'mobile'},
      {name:'email', label:'Email Address', type:'email', placeholder:'you@example.com', validate:'email'},
      {name:'address', label:'Address', type:'text', placeholder:'House / street', validate:'required'},
      {name:'city', label:'City', type:'text', placeholder:'City', validate:'required'},
      {name:'state', label:'State', type:'text', placeholder:'State', validate:'required'},
      {name:'pin', label:'PIN Code', type:'text', placeholder:'6-digit PIN', validate:'required'},
    ]);
  }

  /* ---------- STEP 2 — Emergency + Medical Information ---------- */
  else if(step===2){
    body = `
      <div class="section-title">Emergency Information</div>
      ${grid([
        {name:'bloodGroup', label:'Blood Group', type:'select', options:['A+','A-','B+','B-','AB+','AB-','O+','O-','None'], validate:'required'},
        {name:'ecName', label:'Emergency Contact Name', type:'text', placeholder:'Full name', validate:'required'},
        {name:'ecNumber', label:'Emergency Contact Number', type:'tel', placeholder:'10-digit mobile number', validate:'mobile'},
        {name:'ecRelation', label:'Relationship', type:'select', options:['Father','Mother','Brother','Sister','Spouse','Guardian','Other'], validate:'required'},
      ])}
      <div class="section-title">Medical Information</div>
      <p class="text-sm text-ink2 -mt-2 mb-3">Only baseline information is collected here — you don't need to list every medical detail.</p>
      ${grid([
        {name:'allergies', label:'Known Allergies', type:'text', placeholder:'e.g. Penicillin (or "None")', optional:true},
        {name:'medicalHistory', label:'Existing Medical Conditions', type:'text', placeholder:'e.g. Hypertension (or "None")', optional:true},
        {name:'medications', label:'Current Medications', type:'text', placeholder:'e.g. Amlodipine 5mg (or "None")', optional:true},
        {name:'additionalInfo', label:'Previous Surgeries / Other Notes', type:'text', placeholder:'Optional', optional:true},
      ], false)}
    `;
  }

  /* ---------- STEP 3 — Account Security ---------- */
  else if(step===3){
    body = `
      ${grid([
        {name:'password', label:'Create Password', type:'password', placeholder:'At least 8 characters', validate:'password'},
        {name:'confirmPassword', label:'Confirm Password', type:'password', placeholder:'Re-enter password', validate:'confirm', matches:'password'},
      ], false)}
      <label class="chip-check mt-4">
        <input type="checkbox" name="terms" data-validate="required">
        I agree to the JanSeva Terms &amp; Privacy Policy.
      </label>
      <div class="privacy-note">
        Your health information is sensitive. JanSeva uses role-based access so relevant information
        can be accessed only by authorized users according to the system's permissions.
      </div>
    `;
  }

  return `
    <button class="back-link" onclick="event.preventDefault();showAuthMode('login')">← Back to Login</button>
    <h2>Create Your JanSeva Account</h2>
    <p class="sub">Create your profile so your relevant health information can be available when it matters.</p>
    ${progressBar(step, 3)}
    <form id="patientForm" class="mt-5" onsubmit="return patientSubmit(event, ${step})">
      <div class="section-title">${PatientSteps[step-1]}</div>
      ${body}
      ${nav(step===3)}
    </form>
    <p class="demo-note">Demo interface — no real medical information is stored.</p>
  `;
}

function patientNav(step){
  saveCurrentStepDraft();
  document.getElementById('modeArea').innerHTML = renderPatientStep(step);
  icons(); wireForm();
}

/* Saves the current step's form fields into PatientDraft.
   Step 2 covers BOTH emergency and medical fields visually,
   so its data is merged into both draft buckets. */
function saveCurrentStepDraft(){
  const form = document.getElementById('patientForm');
  if(!form) return;
  const data = Object.fromEntries(new FormData(form).entries());
  if(regStep===1){ Object.assign(PatientDraft.personal, data); }
  else if(regStep===2){ Object.assign(PatientDraft.emergency, data); Object.assign(PatientDraft.medical, data); }
  else if(regStep===3){ Object.assign(PatientDraft.security, data); }
}

async function patientSubmit(e, step){
  e.preventDefault();
  if(!validateForm(e.target)) return false;
  saveCurrentStepDraft();

  if(step<3){ patientNav(step+1); return false; }

  /* Step 3 complete — create account */
  const draft = PatientDraft;
  try{
    const response = await fetch('/janseva/patient-auth/register-patient', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      credentials:'same-origin',
      body:JSON.stringify({
        fullName: draft.personal.fullName,
        gender: draft.personal.gender,
        dateOfBirth: draft.personal.dob,
        mobNo: draft.personal.mobile,
        email: draft.personal.email,
        password: draft.security.password,
        address: {
          line1: draft.personal.address,
          city: draft.personal.city,
          state: draft.personal.state,
          pincode: draft.personal.pin
        },
        emergencyContact: {
          fullName: draft.emergency.ecName,
          mobNo: draft.emergency.ecNumber,
          relationship: draft.emergency.ecRelation
        },
        bloodGroup: draft.emergency.bloodGroup,
        medicalHistory: draft.medical.medicalHistory || '',
        allergies: draft.medical.allergies || '',
        medications: draft.medical.medications || '',
        additionalInfo: draft.medical.additionalInfo || ''
      })
    });
    const data = await response.json();
    if(!response.ok){ notify(e, data.message || 'Registration failed.'); return false; }
    window.location.href = '/janseva/patient-auth/login';
  }catch(err){
    notify(e, 'Could not reach the server. Please try again.');
  }
  return false;
}

/* ---------- Doctor registration ---------- */
function renderDoctorRegister(){
  const specs = ['General Medicine','Cardiology','Neurology','Pulmonology','Trauma & Surgery','Critical Care','Pediatrics','Orthopedics','Other'];
  return `
   <button class="back-link" onclick="event.preventDefault();showAuthMode('login')">← Back to Login</button>
   <h2>Create Doctor Account</h2>
   <p class="sub">Review incoming cases and coordinate care once your credentials are verified.</p>
   <form id="doctorForm" class="mt-5" onsubmit="return doctorSubmit(event)">
     <div class="section-title">Personal Information</div>
     ${grid([
       {name:'fullName',label:'Full Name',type:'text',placeholder:'Dr. full name',validate:'required'},
       {name:'mobile',label:'Mobile Number',type:'tel',placeholder:'10-digit mobile number',validate:'mobile'},
       {name:'email',label:'Email',type:'email',placeholder:'you@hospital.in',validate:'email'},
       {name:'dob',label:'Date of Birth',type:'date',validate:'dob'},
       {name:'gender',label:'Gender',type:'select',options:['Male','Female','Other','Prefer not to say'],validate:'required'},
     ])}
     <div class="section-title">Professional Information</div>
     ${grid([
       {name:'regNumber',label:'Medical Registration Number',type:'text',placeholder:'e.g. MCI-XXXXXX',validate:'required'},
       {name:'council',label:'Medical Council / Registration Authority',type:'text',placeholder:'e.g. National Medical Commission',validate:'required'},
       {name:'specialization',label:'Specialization',type:'select',options:specs,validate:'required'},
       {name:'experience',label:'Years of Experience',type:'number',placeholder:'e.g. 6',validate:'required'},
       {name:'hospital',label:'Hospital / Organization',type:'text',placeholder:'Current workplace',validate:'required'},
       {name:'profAddress',label:'Professional Address',type:'text',placeholder:'Clinic / hospital address',validate:'required'},
     ])}
     <div class="section-title">Account</div>
     ${grid([
       {name:'password',label:'Password',type:'password',placeholder:'At least 8 characters',validate:'password'},
       {name:'confirmPassword',label:'Confirm Password',type:'password',placeholder:'Re-enter password',validate:'confirm',matches:'password'},
     ])}
     <div class="section-title">Documents</div>
     <div class="form-grid two">
       ${field({name:'regCert',label:'Medical Registration Certificate',type:'file'})}
       ${field({name:'profId',label:'Professional ID',type:'file'})}
     </div>
     <div class="mt-4">${field({name:'photo',label:'Profile Photo',type:'file',optional:true})}</div>
     <div class="privacy-note">Your professional details are verified by the JanSeva team before your account is activated. Newly submitted accounts are marked <b>Verification Pending</b>.</div>
     <button class="btn mt-6 w-full rounded-full bg-teal1 text-white py-3.5 font-semibold">Submit for Verification →</button>
   </form>
   <p class="demo-note">Demo interface — no real medical information is stored.</p>`;
}
function doctorSubmit(e){
  e.preventDefault();
  if(!validateForm(e.target)) return false;
  const name = new FormData(e.target).get('fullName');
  showSuccess('doctor', name);
  return false;
}

/* ---------- Hospital registration ---------- */
function renderHospitalRegister(){
  return `
   <button class="back-link" onclick="event.preventDefault();showAuthMode('login')">← Back to Login</button>
   <h2>Register Your Hospital</h2>
   <p class="sub">Manage beds, doctors and incoming emergency cases once verified.</p>
   <form id="hospitalForm" class="mt-5" onsubmit="return hospitalSubmit(event)">
     <div class="section-title">Hospital Information</div>
     ${grid([
       {name:'name',label:'Hospital Name',type:'text',placeholder:'Hospital name',validate:'required'},
       {name:'regNumber',label:'Hospital Registration Number',type:'text',placeholder:'Registration number',validate:'required'},
       {name:'type',label:'Hospital Type',type:'select',options:['Government','Private','Other'],validate:'required'},
     ])}
     <div class="section-title">Contact</div>
     ${grid([
       {name:'email',label:'Official Email',type:'email',placeholder:'admin@hospital.in',validate:'email'},
       {name:'phone',label:'Phone Number',type:'tel',placeholder:'10-digit number',validate:'mobile'},
       {name:'emgPhone',label:'Emergency Contact Number',type:'tel',placeholder:'10-digit number',validate:'mobile'},
     ])}
     <div class="section-title">Location</div>
     ${grid([
       {name:'address',label:'Address',type:'text',placeholder:'Street address',validate:'required'},
       {name:'city',label:'City',type:'text',placeholder:'City',validate:'required'},
       {name:'state',label:'State',type:'text',placeholder:'State',validate:'required'},
       {name:'pin',label:'PIN Code',type:'text',placeholder:'6-digit PIN',validate:'required'},
     ])}
     <div class="section-title">Hospital Capacity</div>
     ${grid([
       {name:'totalBeds',label:'Total Beds',type:'number',placeholder:'e.g. 120',validate:'required'},
       {name:'emgBeds',label:'Emergency Beds',type:'number',placeholder:'e.g. 20',validate:'required'},
       {name:'icuBeds',label:'ICU Beds',type:'number',placeholder:'e.g. 15',validate:'required'},
       {name:'ot',label:'OT Availability',type:'select',options:['Available','Not Available'],validate:'required'},
     ])}
     <div class="section-title">Medical Services</div>
     <div class="flex flex-wrap gap-2">
      ${['Emergency Department','Cardiology','Neurology','Pulmonology','Trauma','Critical Care','Other'].map(s=>`
       <label class="chip-check"><input type="checkbox" name="services"> ${s}</label>`).join('')}
     </div>
     <div class="section-title">Hospital Administrator</div>
     ${grid([
       {name:'adminName',label:'Name',type:'text',placeholder:'Administrator name',validate:'required'},
       {name:'adminEmail',label:'Email',type:'email',placeholder:'admin@hospital.in',validate:'email'},
       {name:'adminPhone',label:'Phone',type:'tel',placeholder:'10-digit number',validate:'mobile'},
     ])}
     <div class="section-title">Documents</div>
     <div class="form-grid two">
       ${field({name:'hospCert',label:'Hospital Registration Certificate',type:'file'})}
       ${field({name:'verifyDocs',label:'Required Verification Documents',type:'file',multiple:true})}
     </div>
     <div class="section-title">Account</div>
     ${grid([
       {name:'password',label:'Password',type:'password',placeholder:'At least 8 characters',validate:'password'},
       {name:'confirmPassword',label:'Confirm Password',type:'password',placeholder:'Re-enter password',validate:'confirm',matches:'password'},
     ])}
     <div class="privacy-note">Hospital accounts are marked <b>Verification Pending</b> until the JanSeva team confirms your registration documents.</div>
     <button class="btn mt-6 w-full rounded-full bg-teal1 text-white py-3.5 font-semibold">Submit Hospital for Verification →</button>
   </form>
   <p class="demo-note">Demo interface — no real hospital data is stored.</p>`;
}
function hospitalSubmit(e){
  e.preventDefault();
  if(!validateForm(e.target)) return false;
  const name = new FormData(e.target).get('name');
  showSuccess('hospital', name);
  return false;
}

/* ============================================================
   SUCCESS SCREEN
   ============================================================ */
function showSuccess(role, name){
  const pendingRoles = ['doctor','hospital'];
  const statusHtml = pendingRoles.includes(role)
    ? `<span class="status-pill status-pending"><i data-lucide="clock" style="width:13px;height:13px"></i>Verification Pending</span>`
    : '';
  document.getElementById('stepSuccess').innerHTML = `
   <div class="success-box">
     <div class="tick"><i data-lucide="check"></i></div>
     <h2>Account Created Successfully</h2>
     <p class="text-ink2 mt-2 text-sm">${role==='patient' ? 'Complete your health profile to make your relevant information available when it matters.' : 'Your submission is being reviewed by the JanSeva team.'}</p>
     ${statusHtml ? `<div class="mt-3">${statusHtml}</div>` : ''}
     <button class="btn mt-6 rounded-full bg-teal1 text-white px-7 py-3 font-semibold" onclick="window.location.href='/janseva/patient-auth/login'">
       Go to Login →
     </button>
   </div>`;
  goStep('stepSuccess');
  icons();
}

function notify(e, msg){ e.preventDefault(); const b=document.createElement('div'); b.textContent=msg; b.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#263B3A;color:#fff;padding:.7rem 1.1rem;border-radius:999px;font-size:.82rem;z-index:999;box-shadow:0 10px 25px -10px rgba(0,0,0,.4)'; document.body.appendChild(b); setTimeout(()=>b.remove(),2200); return false; }

/* ============================================================
   MODAL: close on backdrop click / Escape
   ============================================================ */
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeAuth(); });
document.addEventListener('click', e=>{ if(e.target && e.target.id==='auth') closeAuth(); });