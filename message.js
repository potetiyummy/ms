  import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
  import {
    getDatabase, ref, set, get, push, update, remove,
    onValue, onChildAdded, onDisconnect, query, orderByChild, limitToLast, serverTimestamp
  } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js';
  import {
    getAuth, signInWithEmailAndPassword, signOut
  } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';

  // ============================================================
  // ☁E�E☁EFirebase設宁E☁E�E☁E  // ============================================================
  const firebaseConfig = {
    apiKey:            "AIzaSyAALAQqqe_cy4fyKi0UPRXTLYjVHfHfwo8",
    authDomain:        "message-3d6f7.firebaseapp.com",
    databaseURL:       "https://message-3d6f7-default-rtdb.firebaseio.com",
    projectId:         "message-3d6f7",
    storageBucket:     "message-3d6f7.firebasestorage.app",
    messagingSenderId: "841376778463",
    appId:             "1:841376778463:web:ae2bb4ee491f202c58016a"
  };
  // ============================================================

  const app  = initializeApp(firebaseConfig);
  const db   = getDatabase(app);
  const auth = getAuth(app);
  const ADMIN_EMAIL = 'yumaninia@gmail.com';

  const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB

  // ── DOM ──
  const authScreen    = document.getElementById('auth-screen');
  const appEl         = document.getElementById('app');
  const tabLogin      = document.getElementById('tab-login');
  const tabRegister   = document.getElementById('tab-register');
  const formLogin     = document.getElementById('form-login');
  const formRegister  = document.getElementById('form-register');
  const loginCodeIn   = document.getElementById('login-code');
  const loginPassIn   = document.getElementById('login-pass');
  const loginBtn      = document.getElementById('login-btn');
  const regNickIn     = document.getElementById('reg-nickname');
  const regCodeIn     = document.getElementById('reg-code');
  const regPassIn     = document.getElementById('reg-pass');
  const registerBtn   = document.getElementById('register-btn');
  const authError     = document.getElementById('auth-error');
  const logoutBtn     = document.getElementById('logout-btn');
  const myAv          = document.getElementById('my-av');
  const myNicknameEl  = document.getElementById('my-nickname');
  const myCodeSpan    = document.getElementById('my-code-span');
  const myCodeDisplay = document.getElementById('my-code-display');
  const copyBtn       = document.getElementById('copy-btn');
  const toCodeInput   = document.getElementById('to-code-input');
  const toCodeBtn     = document.getElementById('to-code-btn');
  const sidebarError  = document.getElementById('sidebar-error');
  const convList      = document.getElementById('conv-list');
  const noChatEl      = document.getElementById('no-chat');
  const activeChatEl  = document.getElementById('active-chat');
  const messagesEl    = document.getElementById('messages');
  const msgInput      = document.getElementById('msg-input');
  const sendBtn       = document.getElementById('send-btn');
  const partnerNameEl = document.getElementById('partner-name-el');
  const partnerCodeEl = document.getElementById('partner-code-el');
  const partnerAvEl   = document.getElementById('partner-av');
  const backBtn       = document.getElementById('back-btn');
  const sidebar       = document.getElementById('sidebar');
  const toastEl         = document.getElementById('toast');
  const fileInput       = document.getElementById('file-input');
  const uploadBarWrap   = document.getElementById('upload-bar-wrap');
  const uploadFilenameLbl = document.getElementById('upload-filename');
  const uploadPctLbl    = document.getElementById('upload-pct');
  const uploadBarFill   = document.getElementById('upload-bar-fill');
  const lightbox        = document.getElementById('lightbox');
  const lightboxImg     = document.getElementById('lightbox-img');

  // ── Call DOM refs ──
  const incomingCallEl  = document.getElementById('incoming-call');
  const incCallerAv     = document.getElementById('inc-caller-av');
  const incCallerName   = document.getElementById('inc-caller-name');
  const incCallType     = document.getElementById('inc-call-type');
  const acceptCallBtn   = document.getElementById('accept-call-btn');
  const rejectCallBtn   = document.getElementById('reject-call-btn');
  const callOverlayEl   = document.getElementById('call-overlay');
  const remoteVideoEl    = document.getElementById('remote-video');
  const remoteVideoImgEl = document.getElementById('remote-video-img');
  const localVideoEl     = document.getElementById('local-video');
  const remoteAudioEl   = document.getElementById('remote-audio');
  const callTopBarEl    = document.getElementById('call-top-bar');
  const callTopNameEl   = document.getElementById('call-top-name');
  const callTopTimerEl  = document.getElementById('call-top-timer');
  const callCenterEl    = document.getElementById('call-center');
  const callCenterAvEl  = document.getElementById('call-center-av');
  const callCenterNameEl= document.getElementById('call-center-name');
  const callStatusEl    = document.getElementById('call-status');
  const callTimerEl     = document.getElementById('call-timer');
  const toggleMicBtn    = document.getElementById('toggle-mic-btn');
  const toggleCamBtn    = document.getElementById('toggle-cam-btn');
  const endCallBtn      = document.getElementById('end-call-btn');
  const camPipLocalEl   = document.getElementById('cam-pip-local');
  const voiceCallBtn    = document.getElementById('voice-call-btn');
  const videoCallBtn    = document.getElementById('video-call-btn');

  // ── State ──
  let me = null; // { code, nickname }
  let currentChatId = null;
  let currentPartner = null;
  let currentGroupCode = null;
  let currentIsGroup = false;
  let msgUnsub = null;
  let convUnsub = null;
  let groupListUnsub = null;
  let inviteUnsub = null;
  let allDMs = {};
  let allGroups = {};
  let activeConvTab = 'dm';

  // ── グループ通話 state ──
  let groupCallPeers = {};
  let groupCallLocalStream = null;
  let currentGroupCallCode = null;
  let groupCallSignalingUnsubs = [];
  let groupCallMicMuted = false;
  let groupCallCamMuted = false;
  let groupCallType = null;
  let groupCallTimerSecs = 0;
  let groupCallTimerInterval = null;
  let gcallNotifUnsub = null;

  // ── Call State ──
  let callPc = null;
  let callLocalStream = null;
  let activeCallType = null;
  let activeCallRole = null;
  let activeCallChatId = null;
  let activeCallPartnerCode = null;
  let callTimerSecs = 0;
  let callTimerInterval = null;
  let incomingCallUnsub = null;
  let callStatusUnsub = null;
  let callIceUnsub = null;
  let micMuted = false;
  let camMuted = false;
  let callTimeoutTimer = null;
  let callVideoInterval = null;
  let callVideoUnsub = null;
  let callVideoCanvas = null;
  let screenStream = null;
  let groupCallScreenStream = null;
  let gcallCompositeCanvas = null;
  let gcallCompositeStream = null;
  let gcallCompositeInterval = null;

  // ── ログイン維持日数 ──
  let loginDays = 7;

  // ── プレゼンスキャチE��ュ ──
  const presenceCache = {};
  const presenceUnsubs = {};

  function subscribePresence(codes) {
    codes.forEach(code => {
      if (!code || presenceUnsubs[code]) return;
      presenceUnsubs[code] = onValue(ref(db, `presence/${code}`), snap => {
        const online = snap.exists() && snap.val().online === true;
        presenceCache[code] = online;
        document.querySelectorAll(`.online-dot[data-code="${CSS.escape(code)}"]`).forEach(dot => {
          dot.classList.toggle('is-online', online);
        });
      });
    });
  }

  // ── アバターキャチE��ュ ──
  const avatarCache = {};

  function applyAvatar(el, url, fallbackChar) {
    if (url) {
      el.textContent = '';
      const img = document.createElement('img');
      img.src = url;
      el.appendChild(img);
    } else {
      el.innerHTML = '';
      el.textContent = fallbackChar;
    }
  }

  async function loadAvatar(code) {
    if (code in avatarCache) return avatarCache[code];
    const snap = await get(ref(db, `users/${code}/avatar`));
    const url = snap.exists() ? snap.val() : null;
    avatarCache[code] = url;
    return url;
  }

  function compressAvatar(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');
        const s = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = url;
    });
  }
  let typingTimer         = null;
  let typingUnsub         = null;
  let pendingDeleteKey     = null;
  let pendingDeleteIsGroup = false;
  let pendingDeleteMsgType = null;

  const saved = localStorage.getItem('me');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.expires && Date.now() < parsed.expires) {
        me = { code: parsed.code, nickname: parsed.nickname };
        loginDays = parsed.loginDays || 7;
        authScreen.classList.add('hidden');
        showApp();
      } else {
        localStorage.removeItem('me');
      }
    } catch (_) { localStorage.removeItem('me'); }
  }

  // ── タブ�Eり替ぁE──
  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    formLogin.style.display = '';
    formRegister.style.display = 'none';
    authError.textContent = '';
  });
  tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    formRegister.style.display = '';
    formLogin.style.display = 'none';
    authError.textContent = '';
  });

  // ── ログイン ──
  // ── パスワードハチE��ュ�E�EHA-256�E�──
  async function hashPassword(pass) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pass));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  loginBtn.addEventListener('click', doLogin);
  loginPassIn.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  loginCodeIn.addEventListener('keydown', e => { if (e.key === 'Enter') loginPassIn.focus(); });

  async function doLogin() {
    const code = loginCodeIn.value.trim();
    const pass = loginPassIn.value;
    if (!code) { authError.textContent = 'ルームコードを入力してください'; return; }
    if (!pass) { authError.textContent = 'パスワードを入力してください'; return; }
    authError.textContent = '';
    loginBtn.disabled = true;
    loginBtn.textContent = '確認中...';
    try {
      const snap = await get(ref(db, 'users/' + code));
      if (!snap.exists()) {
        authError.textContent = 'こ�Eコード�E登録されてぁE��せん';
        return;
      }
      const hash = await hashPassword(pass);
      if (snap.val().password !== hash) {
        authError.textContent = 'パスワードが違います';
        return;
      }
      me = { code, nickname: snap.val().nickname };
      localStorage.setItem('me', JSON.stringify({ ...me, expires: Date.now() + loginDays * 86400000, loginDays }));
      authScreen.classList.add('hidden');
      showApp();
    } catch (e) {
      authError.textContent = 'エラー: ' + e.message;
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = 'ログイン';
    }
  }

  // ── 新規登録 ──
  registerBtn.addEventListener('click', doRegister);
  regPassIn.addEventListener('keydown', e => { if (e.key === 'Enter') doRegister(); });
  regCodeIn.addEventListener('keydown', e => { if (e.key === 'Enter') regPassIn.focus(); });

  async function doRegister() {
    const nickname = regNickIn.value.trim();
    const code     = regCodeIn.value.trim();
    const pass     = regPassIn.value;
    authError.textContent = '';

    if (!nickname) { authError.textContent = 'ニックネ�Eムを�E力してください'; return; }
    if (!code)     { authError.textContent = 'ルームコードを入力してください'; return; }
    if (!pass)     { authError.textContent = 'パスワードを入力してください'; return; }
    if (!/^[a-zA-Z0-9_\-]+$/.test(code)) {
      authError.textContent = 'コードは半角英数字・_・- のみ使えます';
      return;
    }

    registerBtn.disabled = true;
    registerBtn.textContent = '確認中...';
    try {
      const snap = await get(ref(db, 'users/' + code));
      if (snap.exists()) {
        authError.textContent = 'このコードはすでに使われています';
        return;
      }
      await set(ref(db, 'users/' + code), {
        nickname,
        password: await hashPassword(pass),
        createdAt: serverTimestamp()
      });
      me = { code, nickname };
      localStorage.setItem('me', JSON.stringify({ ...me, expires: Date.now() + loginDays * 86400000, loginDays }));
      authScreen.classList.add('hidden');
      showApp();
    } catch (e) {
      authError.textContent = 'エラー: ' + e.message;
    } finally {
      registerBtn.disabled = false;
      registerBtn.textContent = '登録';
    }
  }

  // ── 設定パネル ──
  const meSettingsTrigger = document.getElementById('me-settings-trigger');
  const meSettingsArrow   = document.getElementById('me-settings-arrow');
  const settingsPanel     = document.getElementById('settings-panel');
  const loginDaysSlider   = document.getElementById('login-days-slider');
  const loginDaysValEl    = document.getElementById('login-days-val');

  meSettingsTrigger.addEventListener('click', () => {
    const open = settingsPanel.classList.toggle('hidden');
    meSettingsArrow.classList.toggle('open', !open);
  });
  meSettingsArrow.addEventListener('click', () => {
    const open = settingsPanel.classList.toggle('hidden');
    meSettingsArrow.classList.toggle('open', !open);
  });
  document.addEventListener('click', e => {
    if (!settingsPanel.classList.contains('hidden') &&
        !settingsPanel.contains(e.target) &&
        !meSettingsTrigger.contains(e.target) &&
        !meSettingsArrow.contains(e.target)) {
      settingsPanel.classList.add('hidden');
      meSettingsArrow.classList.remove('open');
    }
  });

  loginDaysSlider.addEventListener('input', () => {
    loginDays = parseInt(loginDaysSlider.value);
    loginDaysValEl.textContent = loginDays + '日';
    if (me) {
      const raw = localStorage.getItem('me');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          parsed.loginDays = loginDays;
          parsed.expires = Date.now() + loginDays * 86400000;
          localStorage.setItem('me', JSON.stringify(parsed));
        } catch {}
      }
    }
  });

  // ── アプリ表示 ──
  function showApp() {
    appEl.classList.remove('hidden');
    myAv.textContent = me.nickname[0].toUpperCase();
    myNicknameEl.textContent = me.nickname;
    myCodeSpan.textContent = me.code;
    myCodeDisplay.textContent = me.code;
    document.getElementById('login-days-slider').value = loginDays;
    document.getElementById('login-days-val').textContent = loginDays + '日';

    loadAvatar(me.code).then(url => applyAvatar(myAv, url, me.nickname[0].toUpperCase()));

    loadConversations();
    setupPresence();
    listenForIncomingCalls();
    loadGroupInviteCount();
    listenForGroupCallNotifications();
    registerFcmToken();
    window.dispatchEvent(new CustomEvent('ms:login', { detail: { code: me.code, nickname: me.nickname } }));
  }

  // ── アバター変更 ──
  const avatarInput = document.getElementById('avatar-input');
  myAv.addEventListener('click', () => avatarInput.click());
  avatarInput.addEventListener('change', async () => {
    const file = avatarInput.files[0];
    avatarInput.value = '';
    if (!file || !me) return;
    try {
      const base64 = await compressAvatar(file);
      await update(ref(db, `users/${me.code}`), { avatar: base64 });
      avatarCache[me.code] = base64;
      applyAvatar(myAv, base64, me.nickname[0].toUpperCase());
      showToast('プロフィール画像を更新しました');
    } catch { showToast('画像�E処琁E��失敗しました'); }
  });

  // ── FCMト�Eクン登録 ──
  async function registerFcmToken() {
    if (!window.NotifBridge) return;
    const token = window.NotifBridge.getToken();
    window.NotifBridge.saveUserCode(me.code);
    if (token) {
      await update(ref(db, `users/${me.code}`), { fcmToken: token }).catch(() => {});
    }
  }

  // ── FCMプッシュ通知送信 ──
  async function sendFcmNotification(toCode, title, body) {
    try {
      const snap = await get(ref(db, `users/${toCode}/fcmToken`));
      if (!snap.exists() || !snap.val()) return;
      await fetch('https://buzzgis.com/ms/notify.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: snap.val(), title, body })
      });
    } catch (_) {}
  }

  // ── コピ�E ──
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(me.code).then(() => showToast('コードをコピ�Eしました'));
  });

  // ── 相手�EコードでDM開姁E──
  toCodeBtn.addEventListener('click', openByCode);
  toCodeInput.addEventListener('keydown', e => { if (e.key === 'Enter') openByCode(); });

  async function openByCode() {
    const code = toCodeInput.value.trim();
    sidebarError.textContent = '';
    if (!code) return;
    if (code === me.code) { sidebarError.textContent = '自分のコードです'; return; }

    toCodeBtn.disabled = true;
    toCodeBtn.textContent = '...';
    try {
      const snap = await get(ref(db, 'users/' + code));
      if (!snap.exists()) {
        sidebarError.textContent = 'こ�Eコード�E存在しません';
        return;
      }
      const partner = { code, nickname: snap.val().nickname };
      toCodeInput.value = '';
      openChat(partner);
    } catch (e) {
      sidebarError.textContent = 'エラー: ' + e.message;
    } finally {
      toCodeBtn.disabled = false;
      toCodeBtn.textContent = '開く';
    }
  }

  // ── 会話一覧レンダリング�E�タブ別�E�──
  function renderConvList() {
    const isDM = activeConvTab === 'dm';
    const items = [];

    if (isDM) {
      Object.entries(allDMs).forEach(([chatId, data]) => {
        items.push({ type:'dm', id:chatId, name:data.partnerNickname||'?', sub:data.lastMessage||'', ts:data.lastTimestamp||0, unread:data.unread||0, data });
      });
    } else {
      Object.entries(allGroups).forEach(([groupCode, data]) => {
        items.push({ type:'group', id:groupCode, name:data.name||'グループ', sub:data.lastMessage||'', ts:data.lastTimestamp||0, unread:data.unread||0, data });
      });
    }
    items.sort((a, b) => b.ts - a.ts);

    convList.innerHTML = '';
    if (!items.length) {
      const icon = isDM ? '&#128172;' : '&#128101;';
      const msg  = isDM ? '会話がありません<br>相手のコードを入力して開始' : 'グループがありません<br>作成ボタンから始めましょう';
      convList.innerHTML = `<div class="empty-state"><div class="empty-icon">${icon}</div>${msg}</div>`;
      return;
    }

    items.forEach(item => {
      const isActiveItem = item.type === 'dm' ? item.id === currentChatId : item.id === currentGroupCode;
      const el = document.createElement('div');
      el.className = 'conv-item' + (isActiveItem ? ' active' : '');
      const unread = item.unread || 0;

      if (item.type === 'group') {
        el.dataset.groupCode = item.id;
        el.innerHTML = `
          <div class="av av-group">&#128101;</div>
          <div class="conv-info">
            <div class="conv-name">${esc(item.name)}</div>
            <div class="conv-sub">${esc(item.sub)}</div>
          </div>
          <div class="conv-meta">
            <div class="conv-time">${fmtTime(item.ts)}</div>
            ${unread > 0 ? `<span class="badge">${unread}</span>` : ''}
          </div>`;
        el.addEventListener('click', () => openGroupChat({ code: item.id, name: item.data.name||'グループ', adminCode: item.data.adminCode||'' }));
      } else {
        el.dataset.chatId = item.id;
        const fallbackChar = esc((item.data.partnerNickname||'?')[0].toUpperCase());
        const pCode = item.data.partnerCode || '';
        const isOnline = presenceCache[pCode] === true;
        el.innerHTML = `
          <div class="av-wrap">
            <div class="av" style="font-size:13px">${fallbackChar}</div>
            <span class="online-dot${isOnline ? ' is-online' : ''}" data-code="${esc(pCode)}"></span>
          </div>
          <div class="conv-info">
            <div class="conv-name">${esc(item.name)}</div>
            <div class="conv-sub">${esc(item.sub)}</div>
          </div>
          <div class="conv-meta">
            <div class="conv-time">${fmtTime(item.ts)}</div>
            ${unread > 0 ? `<span class="badge">${unread}</span>` : ''}
          </div>`;
        if (pCode) {
          loadAvatar(pCode).then(url => {
            if (url) applyAvatar(el.querySelector('.av'), url, fallbackChar);
          });
        }
        el.addEventListener('click', () => openChat({ code: item.data.partnerCode, nickname: item.data.partnerNickname }));
      }
      convList.appendChild(el);
    });
  }

  // ── タブ�Eり替ぁE──
  document.getElementById('tab-dm').addEventListener('click', () => {
    activeConvTab = 'dm';
    document.getElementById('tab-dm').classList.add('active');
    document.getElementById('tab-group').classList.remove('active');
    document.getElementById('group-actions-bar').style.display = 'none';
    renderConvList();
  });
  document.getElementById('tab-group').addEventListener('click', () => {
    activeConvTab = 'group';
    document.getElementById('tab-group').classList.add('active');
    document.getElementById('tab-dm').classList.remove('active');
    document.getElementById('group-actions-bar').style.display = '';
    renderConvList();
  });

  // ── 会話一覧読み込み ──
  function loadConversations() {
    if (convUnsub) convUnsub();
    if (groupListUnsub) groupListUnsub();
    allDMs = {}; allGroups = {};
    convList.innerHTML = '<div class="loading"><div class="spinner"></div>読み込み中...</div>';

    let _prevDMUnreads = null;
    convUnsub = onValue(ref(db, 'userChats/' + me.code), snap => {
      const newDMs = {};
      if (snap.exists()) snap.forEach(child => { newDMs[child.key] = child.val(); });
      if (_prevDMUnreads === null) {
        _prevDMUnreads = Object.fromEntries(Object.entries(newDMs).map(([k, v]) => [k, v.unread || 0]));
      } else {
        Object.entries(newDMs).forEach(([chatId, data]) => {
          const prev = _prevDMUnreads[chatId] || 0;
          const curr = data.unread || 0;
          if (curr > prev && chatId !== currentChatId) {
            window.dispatchEvent(new CustomEvent('ms:newmessage', {
              detail: { from: data.partnerNickname || '?', text: data.lastMessage || '' }
            }));
          }
          _prevDMUnreads[chatId] = curr;
        });
      }
      allDMs = newDMs;
      const dmCodes = Object.values(newDMs).map(d => d.partnerCode).filter(Boolean);
      subscribePresence(dmCodes);
      renderConvList();
    });

    let _prevGrpUnreads = null;
    groupListUnsub = onValue(ref(db, 'userGroups/' + me.code), snap => {
      const newGroups = {};
      if (snap.exists()) snap.forEach(child => { newGroups[child.key] = child.val(); });
      if (_prevGrpUnreads === null) {
        _prevGrpUnreads = Object.fromEntries(Object.entries(newGroups).map(([k, v]) => [k, v.unread || 0]));
      } else {
        Object.entries(newGroups).forEach(([groupCode, data]) => {
          const prev = _prevGrpUnreads[groupCode] || 0;
          const curr = data.unread || 0;
          if (curr > prev && groupCode !== currentGroupCode) {
            window.dispatchEvent(new CustomEvent('ms:newgroupmessage', {
              detail: { groupName: data.name || 'グループ', from: data.lastMessage ? '' : '?', text: data.lastMessage || '' }
            }));
          }
          _prevGrpUnreads[groupCode] = curr;
        });
      }
      allGroups = newGroups;
      renderConvList();
    });
  }

  // ── チャチE��を開く！EM�E�──
  function openChat(partner) {
    currentIsGroup = false;
    currentGroupCode = null;
    currentPartner = partner;
    currentChatId = [me.code, partner.code].sort().join('__');

    noChatEl.style.display = 'none';
    activeChatEl.style.display = 'flex';
    msgInput.disabled = false;

    partnerNameEl.textContent = partner.nickname;
    partnerCodeEl.textContent = 'コード: ' + partner.code;
    partnerAvEl.classList.remove('av-group');
    applyAvatar(partnerAvEl, null, partner.nickname[0].toUpperCase());
    loadAvatar(partner.code).then(url => applyAvatar(partnerAvEl, url, partner.nickname[0].toUpperCase()));
    voiceCallBtn.style.display = '';
    videoCallBtn.style.display = '';
    document.getElementById('group-call-btn').style.display = 'none';
    document.getElementById('group-settings-btn').style.display = 'none';

    sidebar.classList.add('slide-out');
    sidebarError.textContent = '';

    document.querySelectorAll('.conv-item').forEach(el => {
      el.classList.toggle('active', el.dataset.chatId === currentChatId);
    });

    get(ref(db, `userChats/${me.code}/${currentChatId}`)).then(snap => {
      if (!snap.exists()) {
        update(ref(db, `userChats/${me.code}/${currentChatId}`), {
          partnerCode: partner.code,
          partnerNickname: partner.nickname,
          lastMessage: '',
          lastTimestamp: Date.now(),
          unread: 0
        }).catch(() => {});
      } else {
        // 未読リセチE��
        update(ref(db, `userChats/${me.code}/${currentChatId}`), { unread: 0 }).catch(() => {});
      }
    }).catch(() => {});

    stopTyping();
    listenForTyping(partner.code, currentChatId);
    loadMessages(currentChatId);
  }

  // ── メチE��ージ読み込み ──
  function loadMessages(chatId) {
    if (msgUnsub) msgUnsub();
    messagesEl.innerHTML = '<div class="loading"><div class="spinner"></div>読み込み中...</div>';
    sendBtn.disabled = true;

    const q = query(ref(db, `chats/${chatId}/messages`), orderByChild('timestamp'), limitToLast(100));
    let lastDate = null;

    msgUnsub = onValue(q, snap => {
      messagesEl.innerHTML = '';
      lastDate = null;

      if (!snap.exists()) {
        messagesEl.innerHTML = '<div class="empty-state" style="height:100%"><div class="empty-icon">&#128172;</div>最初のメッセージを送ってみましょう</div>';
        sendBtn.disabled = false;
        msgInput.disabled = false;
        return;
      }

      snap.forEach(child => {
        const msg = child.val();
        const ts  = msg.timestamp || Date.now();
        const d   = new Date(ts);
        const dateStr = d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });

        if (dateStr !== lastDate) {
          const sep = document.createElement('div');
          sep.className = 'date-sep';
          sep.textContent = dateStr;
          messagesEl.appendChild(sep);
          lastDate = dateStr;
        }

        // ── 通話ログ�E�センタリングシスチE��メチE��ージ�E�──
        if (msg.type === 'call') {
          const isCaller = msg.from === me.code;
          const icon = msg.callType === 'video' ? '📹' : '📞';
          let label;
          if (msg.callStatus === 'missed') {
            label = isCaller ? `${icon} 不在着信�E�発信�E�` : `${icon} 不在着信`;
          } else if (msg.callStatus === 'rejected') {
            label = isCaller ? `${icon} 通話を拒否された` : `${icon} 通話を拒否`;
          } else {
            label = `${icon} 通話${msg.duration ? ' ' + fmtDuration(msg.duration) : ''}`;
          }
          const time = d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
          const el = document.createElement('div');
          el.style.cssText = 'text-align:center;margin:4px 0 8px;font-size:12px;color:#999;user-select:none';
          el.textContent = `${label}　${time}`;
          messagesEl.appendChild(el);
          return;
        }

        const isMe = msg.from === me.code;
        const group = document.createElement('div');
        group.className = 'msg-group ' + (isMe ? 'me' : 'other');

        if (isMe && !msg.deleted) {
          let pressTimer = null;
          const openSheet = () => showDeleteSheet(child.key, currentIsGroup, msg.type || 'text');
          group.addEventListener('touchstart', () => { pressTimer = setTimeout(openSheet, 600); }, { passive: true });
          group.addEventListener('touchend',   () => { clearTimeout(pressTimer); pressTimer = null; });
          group.addEventListener('touchmove',  () => { clearTimeout(pressTimer); pressTimer = null; });
          group.addEventListener('contextmenu', e => { e.preventDefault(); openSheet(); });
        }

        let contentEl;
        if (msg.deleted) {
          contentEl = document.createElement('div');
          contentEl.className = 'bubble';
          contentEl.style.cssText = 'color:#bbb;font-style:italic;font-size:13px';
          contentEl.textContent = 'このメッセージは削除されました';
        } else if (msg.type === 'image') {
          contentEl = document.createElement('a');
          contentEl.className = 'img-bubble';
          contentEl.href = '#';
          contentEl.addEventListener('click', e => {
            e.preventDefault();
            lightboxImg.src = msg.url;
            lightbox.classList.add('show');
          });
          const img = document.createElement('img');
          img.src = msg.url; img.alt = msg.filename || '画像'; img.loading = 'lazy';
          contentEl.appendChild(img);
        } else if (msg.type === 'video') {
          contentEl = document.createElement('div');
          contentEl.className = 'video-bubble';
          const video = document.createElement('video');
          video.src = msg.url; video.controls = true; video.preload = 'metadata';
          contentEl.appendChild(video);
        } else if (msg.type === 'file') {
          contentEl = document.createElement('a');
          contentEl.className = 'bubble file-card';
          contentEl.href = msg.url; contentEl.target = '_blank'; contentEl.rel = 'noopener';
          const icon = document.createElement('span');
          icon.className = 'file-icon'; icon.textContent = getFileIcon(msg.filename || '');
          const info = document.createElement('div'); info.className = 'file-info';
          const fname = document.createElement('div');
          fname.className = 'file-name'; fname.textContent = msg.filename || 'ファイル';
          const fsize = document.createElement('div');
          fsize.className = 'file-size'; fsize.textContent = fmtSize(msg.filesize || 0);
          info.appendChild(fname); info.appendChild(fsize);
          contentEl.appendChild(icon); contentEl.appendChild(info);
        } else if (msg.type === 'stamp') {
          contentEl = document.createElement('div');
          contentEl.className = 'stamp-bubble';
          const si = document.createElement('img');
          si.src = `stamps/${msg.stampFile}`; si.alt = 'スタンプ'; si.loading = 'lazy';
          contentEl.appendChild(si);
        } else {
          contentEl = document.createElement('div');
          contentEl.className = 'bubble';
          contentEl.textContent = msg.text || '';
        }
        group.appendChild(contentEl);

        const meta = document.createElement('div');
        meta.className = 'msg-meta';
        const t = document.createElement('span');
        t.className = 'msg-time';
        t.textContent = d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
        meta.appendChild(t);
        if (isMe && msg.read) {
          const r = document.createElement('span');
          r.className = 'msg-read'; r.textContent = '既読';
          meta.appendChild(r);
        }
        group.appendChild(meta);
        messagesEl.appendChild(group);
      });

      sendBtn.disabled = false;
      msgInput.disabled = false;
      messagesEl.scrollTop = messagesEl.scrollHeight;
      markRead(chatId);
    });
  }

  async function markRead(chatId) {
    try {
      const snap = await get(ref(db, `chats/${chatId}/messages`));
      if (!snap.exists()) return;
      const updates = {};
      snap.forEach(child => {
        if (child.val().from !== me.code && !child.val().read) {
          updates[`chats/${chatId}/messages/${child.key}/read`] = true;
        }
      });
      if (Object.keys(updates).length) await update(ref(db), updates);
    } catch (_) {}
  }

  // ── 送信 ──
  async function sendMessage() {
    if (currentIsGroup) { await sendGroupMessage(); return; }
    const text = msgInput.value.trim();
    if (!text || !currentChatId) return;
    stopTyping();
    msgInput.value = '';
    msgInput.style.height = '';
    sendBtn.disabled = true;

    const chatId  = currentChatId;
    const partner = currentPartner;
    const ts      = Date.now();

    try {
      await push(ref(db, `chats/${chatId}/messages`), {
        from: me.code, text, timestamp: serverTimestamp(), read: false
      });

      await update(ref(db, `userChats/${me.code}/${chatId}`), {
        partnerCode: partner.code, partnerNickname: partner.nickname,
        lastMessage: text, lastTimestamp: ts
      });

      const ps = await get(ref(db, `userChats/${partner.code}/${chatId}`));
      const prev = ps.exists() ? (ps.val().unread || 0) : 0;
      await update(ref(db, `userChats/${partner.code}/${chatId}`), {
        partnerCode: me.code, partnerNickname: me.nickname,
        lastMessage: text, lastTimestamp: ts, unread: prev + 1
      });
      sendFcmNotification(partner.code, me.nickname, text);
    } catch (e) {
      console.error(e);
    } finally {
      sendBtn.disabled = false;
      msgInput.focus();
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  msgInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  msgInput.addEventListener('input', () => {
    msgInput.style.height = 'auto';
    msgInput.style.height = Math.min(msgInput.scrollHeight, 120) + 'px';
    sendBtn.disabled = msgInput.value.trim().length === 0;
    startTyping();
  });

  // ── ログアウチE──
  logoutBtn.addEventListener('click', () => {
    if (convUnsub) convUnsub();
    if (msgUnsub) msgUnsub();
    if (groupListUnsub) { groupListUnsub(); groupListUnsub = null; }
    if (inviteUnsub) { inviteUnsub(); inviteUnsub = null; }
    if (gcallNotifUnsub) { gcallNotifUnsub(); gcallNotifUnsub = null; }
    cleanupGroupCall();
    if (incomingCallUnsub) { incomingCallUnsub(); incomingCallUnsub = null; }
    stopTyping();
    if (typingUnsub) { typingUnsub(); typingUnsub = null; }
    if (me) update(ref(db, `presence/${me.code}`), { online: false, visible: false }).catch(() => {});
    cleanupCall();
    localStorage.removeItem('me');
    Object.values(presenceUnsubs).forEach(u => u());
    Object.keys(presenceUnsubs).forEach(k => delete presenceUnsubs[k]);
    Object.keys(presenceCache).forEach(k => delete presenceCache[k]);
    settingsPanel.classList.add('hidden');
    meSettingsArrow.classList.remove('open');
    window.dispatchEvent(new CustomEvent('ms:logout'));
    me = null; currentChatId = null; currentGroupCode = null; currentIsGroup = false;
    allDMs = {}; allGroups = {};
    appEl.classList.add('hidden');
    authScreen.classList.remove('hidden');
    loginCodeIn.value = '';
    regNickIn.value = '';
    regCodeIn.value = '';
    authError.textContent = '';
  });

  // ── モバイル戻めE──
  backBtn.addEventListener('click', () => {
    sidebar.classList.remove('slide-out');
    noChatEl.style.display = 'flex';
    activeChatEl.style.display = 'none';
    currentGroupCode = null;
    currentIsGroup = false;
    document.getElementById('group-call-btn').style.display = 'none';
    document.getElementById('group-settings-btn').style.display = 'none';
    document.getElementById('call-picker').classList.add('hidden');
  });

  // ── Toast ──
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 2000);
  }

  function showMediaDeviceError(e) {
    const msg = mediaErrorMsg(e);
    if (e.name === 'NotReadableError' && e._retried && window.electronBridge?.reloadPage) {
      toastEl.innerHTML = '';
      const text = document.createElement('span');
      text.textContent = 'カメラ/マイクを確保できません　';
      const btn = document.createElement('button');
      btn.textContent = '再起動';
      btn.style.cssText = 'margin-left:8px;padding:3px 10px;border-radius:99px;border:none;background:#fff;color:#333;cursor:pointer;font-size:12px;';
      btn.onclick = () => window.electronBridge.reloadPage();
      toastEl.appendChild(text);
      toastEl.appendChild(btn);
      toastEl.classList.add('show');
      toastEl.style.pointerEvents = 'auto';
      setTimeout(() => { toastEl.classList.remove('show'); toastEl.style.pointerEvents = ''; }, 6000);
    } else {
      showToast(msg);
    }
  }

  // ── 画像送信�E�Ease64�E�──
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    fileInput.value = '';
    if (!file || (!currentChatId && !currentGroupCode)) return;
    if (!file.type.startsWith('image/')) { showToast('画像ファイルのみ送信できます'); return; }
    if (file.size > MAX_IMAGE_SIZE) { showToast('画像�E3MB以下にしてください'); return; }
    sendImage(file);
  });

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX_PX = 1280;
        let w = img.width, h = img.height;
        if (w > MAX_PX || h > MAX_PX) {
          if (w > h) { h = Math.round(h * MAX_PX / w); w = MAX_PX; }
          else       { w = Math.round(w * MAX_PX / h); h = MAX_PX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        // 品質を下げながら500KB以内に収まる最高品質を選ぶ
        for (let q = 0.85; q >= 0.3; q -= 0.1) {
          const data = canvas.toDataURL('image/jpeg', q);
          if (data.length * 0.75 < 500 * 1024) { resolve(data); return; }
        }
        resolve(canvas.toDataURL('image/jpeg', 0.3));
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  function sendImage(file) {
    msgInput.disabled = true;
    sendBtn.disabled = true;
    const chatId = currentChatId;
    const partner = currentPartner;
    const groupCode = currentGroupCode;
    const isGroup = currentIsGroup;
    compressImage(file).then(async (base64) => {
      const ts = Date.now();
      try {
        if (isGroup) {
          await push(ref(db, `groupChats/${groupCode}/messages`), {
            from: me.code, fromNickname: me.nickname,
            type: 'image', url: base64,
            filename: file.name, filesize: file.size,
            timestamp: serverTimestamp()
          });

          const [groupInfoSnap, membersSnap] = await Promise.all([
            get(ref(db, `groups/${groupCode}`)),
            get(ref(db, `groups/${groupCode}/members`))
          ]);
          const groupName = groupInfoSnap.exists() ? groupInfoSnap.val().name : 'グループ';
          const adminCode = groupInfoSnap.exists() ? groupInfoSnap.val().adminCode : '';

          if (membersSnap.exists()) {
            const baseUpdates = {};
            const memberKeys = [];
            membersSnap.forEach(m => {
              memberKeys.push(m.key);
              baseUpdates[`userGroups/${m.key}/${groupCode}/lastMessage`] = '[画像]';
              baseUpdates[`userGroups/${m.key}/${groupCode}/lastTimestamp`] = ts;
              baseUpdates[`userGroups/${m.key}/${groupCode}/name`] = groupName;
              baseUpdates[`userGroups/${m.key}/${groupCode}/adminCode`] = adminCode;
            });
            await update(ref(db), baseUpdates);

            const unreadUpdates = {};
            await Promise.all(memberKeys.filter(k => k !== me.code).map(async k => {
              const snap = await get(ref(db, `userGroups/${k}/${groupCode}/unread`));
              unreadUpdates[`userGroups/${k}/${groupCode}/unread`] = (snap.exists() ? (snap.val() || 0) : 0) + 1;
            }));
            if (Object.keys(unreadUpdates).length) await update(ref(db), unreadUpdates);
            memberKeys.filter(k => k !== me.code).forEach(k => {
              sendFcmNotification(k, groupName, `${me.nickname}: [画像]`);
            });
          }
        } else {
          await push(ref(db, `chats/${chatId}/messages`), {
            from: me.code, type: 'image', url: base64,
            filename: file.name, filesize: file.size,
            timestamp: serverTimestamp(), read: false
          });
          await update(ref(db, `userChats/${me.code}/${chatId}`), {
            partnerCode: partner.code, partnerNickname: partner.nickname,
            lastMessage: '[画像]', lastTimestamp: ts
          });
          const ps = await get(ref(db, `userChats/${partner.code}/${chatId}`));
          const prev = ps.exists() ? (ps.val().unread || 0) : 0;
          await update(ref(db, `userChats/${partner.code}/${chatId}`), {
            partnerCode: me.code, partnerNickname: me.nickname,
            lastMessage: '[画像]', lastTimestamp: ts, unread: prev + 1
          });
        }
      } catch (e) {
        console.error(e);
        showToast('送信に失敗しました');
      } finally {
        msgInput.disabled = false;
        sendBtn.disabled = msgInput.value.trim().length === 0;
      }
    }).catch(() => showToast('画像の処理に失敗しました'));
  }

  // ── ライト�EチE��ス ──
  lightbox.addEventListener('click', () => {
    lightbox.classList.remove('show');
    lightboxImg.src = '';
  });

  // ── Utils ──

  // ── 管理者ログイン ──
  const adminAuthErr   = document.getElementById('admin-auth-err');
  const adminLoginBtn  = document.getElementById('admin-login-btn');
  const adminEmailIn   = document.getElementById('admin-email-in');
  const adminPassIn    = document.getElementById('admin-pass-in');

  async function doAdminLogin() {
    adminAuthErr.textContent = '';
    const email = adminEmailIn.value.trim();
    const pass  = adminPassIn.value;
    if (!email || !pass) { adminAuthErr.textContent = 'メールとパスワードを入力してください'; return; }
    adminLoginBtn.disabled = true;
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      if (result.user.email !== ADMIN_EMAIL) {
        await signOut(auth);
        adminAuthErr.textContent = 'このアカウントに管理者権限はありません';
        return;
      }
      adminPassIn.value = '';
      authScreen.classList.add('hidden');
      showAdminScreen(result.user);
    } catch (e) {
      adminAuthErr.textContent = 'ログイン失敗: ' + (e.code === 'auth/invalid-credential' ? 'メールまたはパスワードが違います' : e.message);
    } finally {
      adminLoginBtn.disabled = false;
    }
  }

  adminLoginBtn.addEventListener('click', doAdminLogin);
  adminPassIn.addEventListener('keydown', e => { if (e.key === 'Enter') doAdminLogin(); });

  // ── 管琁E��E��面 ──
  const adminScreen     = document.getElementById('admin-screen');
  const adminUserEmail  = document.getElementById('admin-user-email');
  const adminSignoutBtn = document.getElementById('admin-signout-btn');
  const noticesList     = document.getElementById('notices-list');
  const noticeForm      = document.getElementById('notice-form');
  const noticeTitleIn   = document.getElementById('notice-title-in');
  const noticeBodyIn    = document.getElementById('notice-body-in');
  const noticeAddBtn    = document.getElementById('notice-add-btn');
  const noticeSubmitBtn = document.getElementById('notice-submit-btn');
  const noticeCancelBtn = document.getElementById('notice-cancel-btn');
  const versionDisplay  = document.getElementById('version-display');
  const versionInput    = document.getElementById('version-input');
  const versionSaveBtn  = document.getElementById('version-save-btn');

  let editingNoticeKey = null;
  let noticesOnValue = null;
  let noticeViewerUnsub = null;

  function showAdminScreen(user) {
    adminScreen.classList.remove('hidden');
    adminUserEmail.textContent = user.email;
    loadVersion();
    loadNotices();
  }

  adminSignoutBtn.addEventListener('click', async () => {
    if (noticesOnValue) { noticesOnValue(); noticesOnValue = null; }
    await signOut(auth);
    adminScreen.classList.add('hidden');
    authScreen.classList.remove('hidden');
  });

  // ── ストレージクリーンアップ ──
  const cleanupScanBtn   = document.getElementById('cleanup-scan-btn');
  const cleanupRunBtn    = document.getElementById('cleanup-run-btn');
  const cleanupResultEl  = document.getElementById('cleanup-result');
  const cleanupListEl    = document.getElementById('cleanup-list');

  // key → { label, type, paths, bytes }
  let cleanupGroups = {};

  // paths の配列を500件ずつバッチ削除して返す
  async function deleteCleanupPaths(paths, onProgress) {
    const BATCH = 500;
    for (let i = 0; i < paths.length; i += BATCH) {
      const updates = {};
      paths.slice(i, i + BATCH).forEach(p => {
        updates[`${p}/url`]     = null;
        updates[`${p}/deleted`] = true;
      });
      await update(ref(db), updates);
      if (onProgress) onProgress(Math.min(i + BATCH, paths.length), paths.length);
    }
  }

  // 個別エントリーのDOM行を生成
  function buildCleanupRow(key, entry) {
    const mb  = (entry.bytes / 1024 / 1024).toFixed(2);
    const row = document.createElement('div');
    row.id = `cu-row-${key}`;
    row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--surface2);border-radius:8px;font-size:13px';

    const label = document.createElement('span');
    label.style.flex = '1';
    label.textContent = `${entry.type === 'group' ? '👥' : '💬'} ${entry.label}：${entry.paths.length}件 (約${mb}MB)`;
    row.appendChild(label);

    const status = document.createElement('span');
    status.style.cssText = 'font-size:12px;color:var(--text-dim)';
    row.appendChild(status);

    const btn = document.createElement('button');
    btn.className = 'btn btn-sm';
    btn.style.cssText = 'background:#c0392b;color:#fff;white-space:nowrap';
    btn.textContent = '消去';
    btn.addEventListener('click', async () => {
      if (!confirm(`${entry.paths.length}件の画像を削除しますか？`)) return;
      btn.disabled = true;
      try {
        await deleteCleanupPaths(entry.paths, (done, total) => {
          status.textContent = `${done}/${total}件`;
        });
        label.textContent = `✓ ${entry.label} 削除完了`;
        status.textContent = '';
        btn.remove();
        delete cleanupGroups[key];
        updateCleanupTotal();
      } catch (e) {
        status.textContent = '失敗: ' + e.message;
        btn.disabled = false;
      }
    });
    row.appendChild(btn);
    return row;
  }

  function updateCleanupTotal() {
    const keys   = Object.keys(cleanupGroups);
    const total  = keys.reduce((s, k) => s + cleanupGroups[k].paths.length, 0);
    const bytes  = keys.reduce((s, k) => s + cleanupGroups[k].bytes, 0);
    const mb     = (bytes / 1024 / 1024).toFixed(2);
    if (total > 0) {
      cleanupResultEl.textContent = `合計: ${total}件・約${mb}MB`;
      cleanupRunBtn.style.display = '';
    } else {
      cleanupResultEl.textContent = 'クリーンアップ完了';
      cleanupRunBtn.style.display = 'none';
    }
  }

  cleanupScanBtn.addEventListener('click', async () => {
    cleanupScanBtn.disabled = true;
    cleanupRunBtn.style.display = 'none';
    cleanupResultEl.textContent = 'スキャン中...';
    cleanupListEl.innerHTML = '';
    cleanupGroups = {};

    try {
      const [chatsSnap, groupChatsSnap] = await Promise.all([
        get(ref(db, 'chats')),
        get(ref(db, 'groupChats'))
      ]);

      chatsSnap.forEach(chatNode => {
        const key = chatNode.key;
        chatNode.child('messages').forEach(msgNode => {
          const msg = msgNode.val();
          if (msg.url) {
            if (!cleanupGroups[key]) cleanupGroups[key] = { type: 'dm', label: key, paths: [], bytes: 0 };
            cleanupGroups[key].paths.push(`chats/${key}/messages/${msgNode.key}`);
            cleanupGroups[key].bytes += msg.url.length * 0.75;
          }
        });
      });

      groupChatsSnap.forEach(groupNode => {
        const key = groupNode.key;
        groupNode.child('messages').forEach(msgNode => {
          const msg = msgNode.val();
          if (msg.url) {
            if (!cleanupGroups[key]) cleanupGroups[key] = { type: 'group', label: key, paths: [], bytes: 0 };
            cleanupGroups[key].paths.push(`groupChats/${key}/messages/${msgNode.key}`);
            cleanupGroups[key].bytes += msg.url.length * 0.75;
          }
        });
      });

      Object.entries(cleanupGroups).forEach(([key, entry]) => {
        cleanupListEl.appendChild(buildCleanupRow(key, entry));
      });

      updateCleanupTotal();
      if (!Object.keys(cleanupGroups).length) cleanupResultEl.textContent = '画像データなし';
    } catch (e) {
      cleanupResultEl.textContent = 'スキャン失敗: ' + e.message;
    } finally {
      cleanupScanBtn.disabled = false;
    }
  });

  cleanupRunBtn.addEventListener('click', async () => {
    const allPaths = Object.values(cleanupGroups).flatMap(e => e.paths);
    if (!allPaths.length) return;
    if (!confirm(`${allPaths.length}件の画像データを全件削除しますか？`)) return;
    cleanupRunBtn.disabled = true;
    cleanupScanBtn.disabled = true;
    try {
      await deleteCleanupPaths(allPaths, (done, total) => {
        cleanupResultEl.textContent = `削除中... ${done}/${total}件`;
      });
      cleanupResultEl.textContent = `✓ ${allPaths.length}件を削除しました`;
      cleanupListEl.innerHTML = '';
      cleanupGroups = {};
      cleanupRunBtn.style.display = 'none';
    } catch (e) {
      cleanupResultEl.textContent = '削除失敗: ' + e.message;
    } finally {
      cleanupRunBtn.disabled = false;
      cleanupScanBtn.disabled = false;
    }
  });

  // バ�Eジョン
  function loadVersion() {
    get(ref(db, 'meta/version')).then(snap => {
      versionDisplay.textContent = snap.exists() ? snap.val() : '1.0.0';
    });
  }
  versionSaveBtn.addEventListener('click', async () => {
    const v = versionInput.value.trim();
    if (!v) return;
    versionSaveBtn.disabled = true;
    try {
      await set(ref(db, 'meta/version'), v);
      versionDisplay.textContent = v;
      versionInput.value = '';
      showToast('バ�Eジョンを更新しました');
    } catch (e) {
      showToast('失敗: ' + e.message);
    } finally {
      versionSaveBtn.disabled = false;
    }
  });

  noticeAddBtn.addEventListener('click', () => {
    editingNoticeKey = null;
    noticeTitleIn.value = '';
    noticeBodyIn.value = '';
    noticeForm.style.display = '';
    noticeTitleIn.focus();
  });
  noticeCancelBtn.addEventListener('click', () => {
    noticeForm.style.display = 'none';
    editingNoticeKey = null;
  });
  noticeSubmitBtn.addEventListener('click', async () => {
    const title = noticeTitleIn.value.trim();
    const body  = noticeBodyIn.value.trim();
    if (!title || !body) { showToast('タイトルと冁E��を�E力してください'); return; }
    noticeSubmitBtn.disabled = true;
    try {
      if (editingNoticeKey) {
        await update(ref(db, `notices/${editingNoticeKey}`), { title, body, editedAt: serverTimestamp() });
        showToast('お知らせを更新しました');
      } else {
        await push(ref(db, 'notices'), { title, body, timestamp: serverTimestamp() });
        showToast('お知らせを投稿しました');
      }
      noticeForm.style.display = 'none';
      editingNoticeKey = null;
    } catch (e) {
      showToast('失敗しました: ' + e.message);
    } finally {
      noticeSubmitBtn.disabled = false;
    }
  });

  function loadNotices() {
    noticesList.innerHTML = '<div class="loading"><div class="spinner"></div>読み込み中...</div>';
    if (noticesOnValue) noticesOnValue();
    noticesOnValue = onValue(ref(db, 'notices'), snap => {
      noticesList.innerHTML = '';
      if (!snap.exists()) {
        noticesList.innerHTML = '<div class="empty-state"><div class="empty-icon">&#128226;</div>お知らせはありません</div>';
        return;
      }
      const items = [];
      snap.forEach(c => { items.push({ key: c.key, ...c.val() }); });
      items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'notice-card';
        const d = item.timestamp ? new Date(item.timestamp) : new Date();
        const dateStr = d.toLocaleDateString('ja-JP', { year:'numeric', month:'long', day:'numeric' });
        card.innerHTML = `
          <div class="notice-card-title">${esc(item.title)}</div>
          <div class="notice-card-body">${parseLinks(item.body || '')}</div>
          <div class="notice-card-meta">
            <span>${dateStr}${item.editedAt ? ' (編雁E��E' : ''}</span>
            <div class="notice-card-actions">
              <button class="notice-act-btn edit-btn" data-key="${esc(item.key)}">編雁E/button>
              <button class="notice-act-btn del del-btn" data-key="${esc(item.key)}">削除</button>
            </div>
          </div>`;
        noticesList.appendChild(card);
      });
      noticesList.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const item = items.find(i => i.key === btn.dataset.key);
          if (!item) return;
          editingNoticeKey = btn.dataset.key;
          noticeTitleIn.value = item.title;
          noticeBodyIn.value = item.body;
          noticeForm.style.display = '';
          noticeTitleIn.focus();
        });
      });
      noticesList.querySelectorAll('.del-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('このお知らせを削除しますか？')) return;
          await set(ref(db, `notices/${btn.dataset.key}`), null);
          showToast('削除しました');
        });
      });
    });
  }

  // ── お知らせ閲覧�E�一般ユーザー・読み取り専用�E�E──
  const noticeViewer     = document.getElementById('notice-viewer');
  const noticeViewerList = document.getElementById('notice-viewer-list');
  const noticeViewerClose= document.getElementById('notice-viewer-close');

  document.getElementById('notice-view-btn').addEventListener('click', () => {
    noticeViewer.classList.remove('hidden');
    noticeViewerList.innerHTML = '<div class="loading"><div class="spinner"></div>読み込み中...</div>';
    if (noticeViewerUnsub) noticeViewerUnsub();
    noticeViewerUnsub = onValue(ref(db, 'notices'), snap => {
      noticeViewerList.innerHTML = '';
      if (!snap.exists()) {
        noticeViewerList.innerHTML = '<div class="empty-state"><div class="empty-icon">&#128226;</div>お知らせはありません</div>';
        return;
      }
      const items = [];
      snap.forEach(c => { items.push({ key: c.key, ...c.val() }); });
      items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'notice-card';
        const d = item.timestamp ? new Date(item.timestamp) : new Date();
        const dateStr = d.toLocaleDateString('ja-JP', { year:'numeric', month:'long', day:'numeric' });
        card.innerHTML = `
          <div class="notice-card-title">${esc(item.title)}</div>
          <div class="notice-card-body">${parseLinks(item.body || '')}</div>
          <div class="notice-card-meta"><span>${dateStr}${item.editedAt ? ' (編雁E��E' : ''}</span></div>`;
        noticeViewerList.appendChild(card);
      });
    });
  });
  noticeViewerClose.addEventListener('click', () => {
    noticeViewer.classList.add('hidden');
    if (noticeViewerUnsub) { noticeViewerUnsub(); noticeViewerUnsub = null; }
  });

  function parseLinks(text) {
    const parts = text.split(/(https:\/\/\S+)/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        const escaped = esc(part);
        return `<a href="${escaped}" target="_blank" rel="noopener">${escaped}</a>`;
      }
      return esc(part);
    }).join('');
  }

  // ============================================================
  // ☁E�E☁E通話機�E�E�EebRTC + Firebase シグナリング�E��E☁E�E
  // ============================================================

  async function getMediaStreamSafe(constraints) {
    if (!window.isSecureContext) throw Object.assign(new Error('secure_context'), { name: '_secure' });
    if (!navigator.mediaDevices?.getUserMedia) throw Object.assign(new Error('not_supported'), { name: '_support' });
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (e) {
      console.error('[media] getUserMedia failed:', e.name, e.message, constraints);
      if (e.name === 'NotReadableError' || e.name === 'NotAllowedError') {
        const simple = {};
        if (constraints.audio) simple.audio = true;
        if (constraints.video) simple.video = true;
        await new Promise(r => setTimeout(r, 1500));
        try {
          return await navigator.mediaDevices.getUserMedia(simple);
        } catch (e2) {
          console.error('[media] retry failed:', e2.name, e2.message, simple);
          throw Object.assign(e2, { _retried: true, _origName: e.name });
        }
      }
      throw e;
    }
  }

  function mediaErrorMsg(e) {
    if (e.name === '_secure')         return 'カメラ/マイクはHTTPS接続でのみ使えます';
    if (e.name === '_support')        return 'このブラウザはカメラ/マイクに対応していません';
    if (e.name === 'NotAllowedError') return 'カメラ/マイクへのアクセスが拒否されています\nブラウザのアドレスバー左のアイコンから許可してください';
    if (e.name === 'NotFoundError')   return 'カメラ/マイクが見つかりません';
    if (e.name === 'NotReadableError') return e._retried
      ? 'カメラ/マイクを確保できませんでした\nアプリ冁E�E「�E起動」�Eタンを押すか、アプリを�E起動してください'
      : 'カメラ/マイクが他のアプリで使用中です（再試行中…）';
    return 'カメラ/マイクへのアクセスを許可してください';
  }

  const RTC_CONFIG = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      {
        urls: [
          'turn:openrelay.metered.ca:80',
          'turn:openrelay.metered.ca:443',
          'turns:openrelay.metered.ca:443'
        ],
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ]
  };

  // ── プレゼンス ──
  function setupPresence() {
    const presRef = ref(db, `presence/${me.code}`);
    onValue(ref(db, '.info/connected'), snap => {
      if (!snap.val()) return;
      onDisconnect(presRef).update({ online: false, visible: false });
      update(presRef, { online: true, visible: !document.hidden, ts: serverTimestamp(), platform: window.NotifBridge ? 'android' : 'web' });
    });
    document.addEventListener('visibilitychange', () => {
      if (!me) return;
      update(ref(db, `presence/${me.code}`), { visible: !document.hidden, ts: Date.now() });
    });
  }

  async function getPartnerReachability(code) {
    try {
      const [presSnap, tokenSnap] = await Promise.all([
        get(ref(db, `presence/${code}`)),
        get(ref(db, `users/${code}/fcmToken`))
      ]);
      const online = presSnap.exists() && presSnap.val().online === true;
      const hasFcm = tokenSnap.exists() && !!tokenSnap.val();
      return { online, hasFcm, viaFcm: !online && hasFcm };
    } catch { return { online: false, hasFcm: false, viaFcm: false }; }
  }

  // ── 着信リスナ�E ──
  function listenForIncomingCalls() {
    if (incomingCallUnsub) incomingCallUnsub();
    incomingCallUnsub = onValue(ref(db, `incomingCalls/${me.code}`), async snap => {
      if (!snap.exists() || !snap.val()) { hideIncomingCall(); return; }
      const inc = snap.val();
      if (!inc.chatId) return;
      // 1秒以上前のデータは古い着信として無視・削除
      if (inc.ts && (Date.now() - inc.ts) > 1000) {
        await set(ref(db, `incomingCalls/${me.code}`), null);
        return;
      }
      const callSnap = await get(ref(db, `calls/${inc.chatId}`));
      if (!callSnap.exists()) return;
      const callData = callSnap.val();
      if (callData.status !== 'calling') return;
      if (callPc) {
        await update(ref(db, `calls/${inc.chatId}`), { status: 'rejected' });
        await set(ref(db, `incomingCalls/${me.code}`), null);
        return;
      }
      showIncomingCallUI(inc.chatId, callData);
    });
  }

  // ── 発信 ──
  async function initiateCall(type) {
    if (!currentPartner || !currentChatId) return;
    if (callPc) { showToast('すでに通話中です'); return; }

    const reach = await getPartnerReachability(currentPartner.code);
    if (!reach.online && !reach.hasFcm) {
      showToast('相手がオフラインです');
      return;
    }

    let stream;
    try {
      stream = await getMediaStreamSafe(
        type === 'video' ? { audio: true, video: { facingMode: 'user' } } : { audio: true, video: false }
      );
    } catch (e) {
      showMediaDeviceError(e);
      return;
    }

    callLocalStream      = stream;
    activeCallType       = type;
    activeCallRole       = 'caller';
    activeCallChatId     = currentChatId;
    activeCallPartnerCode = currentPartner.code;
    micMuted = camMuted  = false;

    callPc = new RTCPeerConnection(RTC_CONFIG);
    stream.getAudioTracks().forEach(t => callPc.addTrack(t, stream));

    callPc.ontrack = e => {
      if (!remoteAudioEl.srcObject) remoteAudioEl.srcObject = new MediaStream();
      remoteAudioEl.srcObject.addTrack(e.track);
      remoteAudioEl.play().catch(() => {});
    };
    callPc.onicecandidate = e => {
      if (e.candidate)
        push(ref(db, `calls/${activeCallChatId}/ice_caller`), e.candidate.toJSON());
    };

    const offer = await callPc.createOffer();
    await callPc.setLocalDescription(offer);

    await set(ref(db, `calls/${activeCallChatId}`), {
      from: me.code, fromNickname: me.nickname,
      to: currentPartner.code,
      type, status: 'calling',
      offer: { sdp: offer.sdp, type: offer.type },
      ts: serverTimestamp()
    });
    await set(ref(db, `incomingCalls/${currentPartner.code}`), {
      chatId: activeCallChatId, from: me.code,
      fromNickname: me.nickname, type, ts: serverTimestamp()
    });
    sendFcmNotification(
      currentPartner.code,
      me.nickname,
      type === 'video' ? '📹 ビデオ通話がかかっています' : '📞 音声通話がかかっています'
    );

    showCallOverlayUI(type, reach.viaFcm ? 'notifying' : 'calling', currentPartner.nickname);

    callStatusUnsub = onValue(ref(db, `calls/${activeCallChatId}/status`), async snap => {
      const status = snap.val();
      if (!status || status === 'calling') return;
      if (callTimeoutTimer) { clearTimeout(callTimeoutTimer); callTimeoutTimer = null; }

      const _chatId  = activeCallChatId;
      const _type    = activeCallType;
      const _partner = activeCallPartnerCode;
      const _dur     = callTimerSecs;

      if (status === 'rejected') {
        showToast('通話が拒否されました');
        if (_chatId && _type && _partner) writeCallLog(_chatId, _type, 'rejected', 0, me.code, _partner);
        cleanupCall(); return;
      }
      if (status === 'missed') {
        showToast('応答がありませんでした');
        if (_chatId && _type && _partner) writeCallLog(_chatId, _type, 'missed', 0, me.code, _partner);
        cleanupCall(); return;
      }
      if (status === 'ended') {
        if (_chatId && _type && _partner) writeCallLog(_chatId, _type, 'ended', _dur, me.code, _partner);
        cleanupCall(); return;
      }

      if (status === 'active') {
        const ansSnap = await get(ref(db, `calls/${activeCallChatId}/answer`));
        if (ansSnap.exists() && callPc && callPc.signalingState === 'have-local-offer') {
          await callPc.setRemoteDescription(new RTCSessionDescription(ansSnap.val()));
        }
        startCallTimer();
        setCallStatusText('通話中');
        if (activeCallType === 'video') {
          callTopBarEl.style.display = 'flex';
          callCenterEl.style.display = 'none';
          startVideoFrameSend(activeCallChatId);
          startVideoFrameListen(activeCallChatId, activeCallRole);
        }
        callIceUnsub = onChildAdded(ref(db, `calls/${activeCallChatId}/ice_callee`), c => {
          if (!callPc) return;
          callPc.addIceCandidate(new RTCIceCandidate(c.val())).catch(() => {});
        });
      }
    });

    callTimeoutTimer = setTimeout(async () => {
      if (activeCallChatId)
        await update(ref(db, `calls/${activeCallChatId}`), { status: 'missed' });
    }, reach.viaFcm ? 60000 : 30000);
  }

  // ── 着信応筁E──
  async function acceptCall(chatId, callData) {
    activeCallChatId = chatId;
    activeCallType   = callData.type;
    activeCallRole   = 'callee';
    micMuted = camMuted = false;

    let stream;
    try {
      stream = await getMediaStreamSafe(
        callData.type === 'video' ? { audio: true, video: { facingMode: 'user' } } : { audio: true, video: false }
      );
    } catch (e) {
      showMediaDeviceError(e);
      await update(ref(db, `calls/${chatId}`), { status: 'rejected' });
      await set(ref(db, `incomingCalls/${me.code}`), null);
      hideIncomingCall();
      return;
    }

    callLocalStream = stream;
    callPc = new RTCPeerConnection(RTC_CONFIG);
    stream.getAudioTracks().forEach(t => callPc.addTrack(t, stream));

    callPc.ontrack = e => {
      if (!remoteAudioEl.srcObject) remoteAudioEl.srcObject = new MediaStream();
      remoteAudioEl.srcObject.addTrack(e.track);
      remoteAudioEl.play().catch(() => {});
    };
    callPc.onicecandidate = e => {
      if (e.candidate)
        push(ref(db, `calls/${activeCallChatId}/ice_callee`), e.candidate.toJSON());
    };

    await callPc.setRemoteDescription(new RTCSessionDescription(callData.offer));
    const answer = await callPc.createAnswer();
    await callPc.setLocalDescription(answer);

    await update(ref(db, `calls/${chatId}`), {
      answer: { sdp: answer.sdp, type: answer.type },
      status: 'active'
    });
    await set(ref(db, `incomingCalls/${me.code}`), null);

    const nick = callData.fromNickname || callData.from;
    showCallOverlayUI(callData.type, 'active', nick);
    startCallTimer();
    hideIncomingCall();
    if (callData.type === 'video') {
      startVideoFrameSend(chatId);
      startVideoFrameListen(chatId, activeCallRole);
    }

    callIceUnsub = onChildAdded(ref(db, `calls/${chatId}/ice_caller`), c => {
      if (!callPc) return;
      callPc.addIceCandidate(new RTCIceCandidate(c.val())).catch(() => {});
    });

    callStatusUnsub = onValue(ref(db, `calls/${chatId}/status`), snap => {
      if (snap.val() === 'ended') cleanupCall();
    });
  }

  // ── 映像フレーム送受信�E�E5fps JPEG ↁEFirebase RTDB�E�──
  function startVideoFrameSend(chatId) {
    const canvas = document.createElement('canvas');
    canvas.width = 320; canvas.height = 240;
    const ctx = canvas.getContext('2d');
    callVideoCanvas = canvas;
    callVideoInterval = setInterval(() => {
      try {
        if (screenStream) {
          if (localVideoEl.readyState < 2) return;
          ctx.drawImage(localVideoEl, 0, 0, 320, 240);
          if (!camMuted && camPipLocalEl && camPipLocalEl.readyState >= 2) {
            ctx.drawImage(camPipLocalEl, 320 - 84, 240 - 63, 80, 60);
          }
        } else {
          if (camMuted || !callLocalStream || localVideoEl.readyState < 2) return;
          ctx.drawImage(localVideoEl, 0, 0, 320, 240);
        }
        set(ref(db, `calls/${chatId}/vf_${activeCallRole}`), canvas.toDataURL('image/jpeg', 0.5));
      } catch {}
    }, 22);
  }

  function startVideoFrameListen(chatId, role) {
    const peerRole = role === 'caller' ? 'callee' : 'caller';
    callVideoUnsub = onValue(ref(db, `calls/${chatId}/vf_${peerRole}`), snap => {
      if (snap.exists()) remoteVideoImgEl.src = snap.val();
    });
  }

  // ── 通話終亁E──
  async function endCall() {
    if (activeCallChatId) {
      const _chatId  = activeCallChatId;
      const _type    = activeCallType;
      const _role    = activeCallRole;
      const _partner = activeCallPartnerCode;
      const _dur     = callTimerSecs;
      try { await update(ref(db, `calls/${_chatId}`), { status: 'ended' }); } catch {}
      if (_role === 'caller' && _partner) {
        writeCallLog(_chatId, _type, 'ended', _dur, me.code, _partner);
      }
    }
    cleanupCall();
  }

  function cleanupCall() {
    const _chatId = activeCallChatId;
    const _role   = activeCallRole;
    if (screenStream) { screenStream.getTracks().forEach(t => t.stop()); screenStream = null; }
    camPipLocalEl.srcObject = null;
    camPipLocalEl.style.display = 'none';
    const screenBtn = document.getElementById('toggle-screen-btn');
    screenBtn.classList.remove('active');
    screenBtn.textContent = '🖥️';
    if (callVideoInterval) { clearInterval(callVideoInterval); callVideoInterval = null; }
    if (callVideoUnsub)    { callVideoUnsub(); callVideoUnsub = null; }
    callVideoCanvas = null;
    remoteVideoImgEl.src = '';
    remoteVideoImgEl.style.display = 'none';
    if (_chatId && _role) set(ref(db, `calls/${_chatId}/vf_${_role}`), null).catch(() => {});
    if (callTimeoutTimer)  { clearTimeout(callTimeoutTimer); callTimeoutTimer = null; }
    if (callTimerInterval) { clearInterval(callTimerInterval); callTimerInterval = null; }
    if (callStatusUnsub)   { callStatusUnsub(); callStatusUnsub = null; }
    if (callIceUnsub)      { callIceUnsub(); callIceUnsub = null; }
    if (callPc)            { callPc.close(); callPc = null; }
    if (callLocalStream)   { callLocalStream.getTracks().forEach(t => t.stop()); callLocalStream = null; }
    remoteVideoEl.srcObject = null;
    localVideoEl.srcObject  = null;
    remoteAudioEl.srcObject = null;
    activeCallType = activeCallRole = activeCallChatId = activeCallPartnerCode = null;
    callTimerSecs = 0;
    micMuted = camMuted = false;
    callOverlayEl.classList.add('hidden');
    callTimerEl.textContent = callTopTimerEl.textContent = '00:00';
    toggleMicBtn.textContent = '🎤'; toggleMicBtn.classList.remove('muted');
    toggleCamBtn.textContent = '📷'; toggleCamBtn.classList.remove('muted');
  }

  // ── 通話オーバ�EレイUI ──
  function showCallOverlayUI(type, status, partnerNick) {
    callOverlayEl.classList.remove('hidden');
    applyAvatar(callCenterAvEl, null, (partnerNick || '?')[0].toUpperCase());
    if (activeCallPartnerCode) {
      loadAvatar(activeCallPartnerCode).then(url => applyAvatar(callCenterAvEl, url, (partnerNick || '?')[0].toUpperCase()));
    }
    callCenterNameEl.textContent = partnerNick || '';
    callTopNameEl.textContent    = partnerNick || '';

    const isVideo    = type === 'video';
    const isCalling  = status === 'calling' || status === 'notifying';

    remoteVideoEl.style.display    = 'none';
    remoteVideoImgEl.style.display = isVideo ? 'block' : 'none';
    localVideoEl.style.display     = isVideo ? 'block' : 'none';
    toggleCamBtn.style.display   = isVideo ? 'flex'  : 'none';
    document.getElementById('toggle-screen-btn').style.display = isVideo ? 'flex' : 'none';
    callTopBarEl.style.display   = (isVideo && !isCalling) ? 'flex' : 'none';
    callCenterEl.style.display   = (!isVideo || isCalling) ? 'flex' : 'none';

    if (isVideo && callLocalStream) localVideoEl.srcObject = callLocalStream;
    const statusText = status === 'notifying' ? 'プッシュ通知で呼び出し中...' :
                       isCalling               ? '呼び出し中...' : '通話中';
    setCallStatusText(statusText);
  }

  function setCallStatusText(text) { callStatusEl.textContent = text; }

  function showIncomingCallUI(chatId, callData) {
    const nick = callData.fromNickname || callData.from;
    applyAvatar(incCallerAv, null, nick[0].toUpperCase());
    loadAvatar(callData.from).then(url => applyAvatar(incCallerAv, url, nick[0].toUpperCase()));
    incCallerName.textContent = nick;
    incCallType.textContent   = callData.type === 'video' ? '🎥 ビデオ通話' : '📞 音声通話';
    incomingCallEl.dataset.chatId = chatId;
    incomingCallEl.classList.remove('hidden');
    window.dispatchEvent(new CustomEvent('ms:incomingcall', {
      detail: { from: nick, callType: callData.type }
    }));
  }

  function hideIncomingCall() {
    incomingCallEl.classList.add('hidden');
    delete incomingCallEl.dataset.chatId;
  }

  function startCallTimer() {
    callTimerSecs = 0;
    if (callTimerInterval) clearInterval(callTimerInterval);
    callTimerInterval = setInterval(() => {
      callTimerSecs++;
      const m = String(Math.floor(callTimerSecs / 60)).padStart(2, '0');
      const s = String(callTimerSecs % 60).padStart(2, '0');
      const t = `${m}:${s}`;
      callTimerEl.textContent    = t;
      callTopTimerEl.textContent = t;
    }, 1000);
  }

  // ── 通話ボタンイベンチE──
  voiceCallBtn.addEventListener('click', () => initiateCall('voice'));
  videoCallBtn.addEventListener('click', () => initiateCall('video'));

  acceptCallBtn.addEventListener('click', async () => {
    const chatId = incomingCallEl.dataset.chatId;
    if (!chatId) return;
    const snap = await get(ref(db, `calls/${chatId}`));
    if (!snap.exists()) { hideIncomingCall(); return; }
    acceptCall(chatId, snap.val());
  });

  rejectCallBtn.addEventListener('click', async () => {
    const chatId = incomingCallEl.dataset.chatId;
    if (chatId) {
      await update(ref(db, `calls/${chatId}`), { status: 'rejected' });
      await set(ref(db, `incomingCalls/${me.code}`), null);
    }
    hideIncomingCall();
  });

  endCallBtn.addEventListener('click', () => endCall());

  toggleMicBtn.addEventListener('click', () => {
    if (!callLocalStream) return;
    micMuted = !micMuted;
    callLocalStream.getAudioTracks().forEach(t => t.enabled = !micMuted);
    toggleMicBtn.classList.toggle('muted', micMuted);
    toggleMicBtn.textContent = micMuted ? '🔇' : '🎤';
  });

  toggleCamBtn.addEventListener('click', () => {
    if (!callLocalStream) return;
    camMuted = !camMuted;
    callLocalStream.getVideoTracks().forEach(t => t.enabled = !camMuted);
    toggleCamBtn.classList.toggle('muted', camMuted);
    toggleCamBtn.textContent = camMuted ? '🚫' : '📷';
  });

  document.getElementById('toggle-screen-btn').addEventListener('click', async () => {
    if (!callLocalStream || !localVideoEl) return;
    const btn = document.getElementById('toggle-screen-btn');
    if (screenStream) {
      screenStream.getTracks().forEach(t => t.stop());
      screenStream = null;
      localVideoEl.srcObject = callLocalStream;
      camPipLocalEl.srcObject = null;
      camPipLocalEl.style.display = 'none';
      btn.classList.remove('active');
      btn.textContent = '🖥️';
    } else {
      try {
        const s = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        screenStream = s;
        localVideoEl.srcObject = s;
        camPipLocalEl.srcObject = callLocalStream;
        camPipLocalEl.style.display = 'block';
        btn.classList.add('active');
        btn.textContent = '🛑';
        s.getVideoTracks()[0].addEventListener('ended', () => {
          if (!screenStream) return;
          screenStream = null;
          if (localVideoEl) localVideoEl.srcObject = callLocalStream;
          camPipLocalEl.srcObject = null;
          camPipLocalEl.style.display = 'none';
          btn.classList.remove('active');
          btn.textContent = '🖥️';
        });
      } catch { /* ユーザーがキャンセル */ }
    }
  });

  function getFileIcon(filename) {
    const ext = (filename.split('.').pop() || '').toLowerCase();
    const map = { pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊',
                  ppt: '📊', pptx: '📊', zip: '🗜️', txt: '📃' };
    return map[ext] || '📎';
  }
  function fmtSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }
  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  // ── タイピングインジケーター ──
  const typingIndicatorEl = document.getElementById('typing-indicator');

  function startTyping() {
    if (!currentChatId || currentIsGroup) return;
    const r = ref(db, `typing/${me.code}/${currentChatId}`);
    set(r, Date.now()).catch(() => {});
    onDisconnect(r).remove();
    if (typingTimer) clearTimeout(typingTimer);
    typingTimer = setTimeout(stopTyping, 3000);
  }

  function stopTyping() {
    if (typingTimer) { clearTimeout(typingTimer); typingTimer = null; }
    if (currentChatId && !currentIsGroup)
      remove(ref(db, `typing/${me.code}/${currentChatId}`)).catch(() => {});
  }

  function listenForTyping(partnerCode, chatId) {
    if (typingUnsub) { typingUnsub(); typingUnsub = null; }
    typingIndicatorEl.classList.add('hidden');
    typingUnsub = onValue(ref(db, `typing/${partnerCode}/${chatId}`), snap => {
      if (snap.exists() && Date.now() - snap.val() < 5000) {
        typingIndicatorEl.textContent = '入力中...';
        typingIndicatorEl.classList.remove('hidden');
      } else {
        typingIndicatorEl.classList.add('hidden');
      }
    });
  }

  // ── メチE��ージ削除シーチE──
  const deleteSheetEl      = document.getElementById('delete-sheet');
  const deleteOverlayEl    = document.getElementById('delete-overlay');
  const deleteTextBtn      = document.getElementById('delete-text-btn');
  const deleteImageBtn     = document.getElementById('delete-image-btn');
  const deleteCancelBtn    = document.getElementById('delete-cancel-btn');

  function showDeleteSheet(key, isGroup, msgType) {
    pendingDeleteKey     = key;
    pendingDeleteIsGroup = isGroup;
    pendingDeleteMsgType = msgType;
    // メッセージ種類に応じてボタンを出し分け
    deleteTextBtn.style.display  = msgType === 'image' ? 'none' : '';
    deleteImageBtn.style.display = msgType === 'image' ? ''     : 'none';
    deleteSheetEl.style.display  = 'flex';
  }

  function hideDeleteSheet() {
    deleteSheetEl.style.display = 'none';
    pendingDeleteKey     = null;
    pendingDeleteIsGroup = false;
    pendingDeleteMsgType = null;
  }

  function addTapListener(el, fn) {
    el.addEventListener('click', fn);
    el.addEventListener('touchend', e => { e.preventDefault(); fn(); });
  }

  addTapListener(deleteOverlayEl, hideDeleteSheet);
  addTapListener(deleteCancelBtn, hideDeleteSheet);
  addTapListener(deleteTextBtn,  () => handleDeleteConfirm());
  addTapListener(deleteImageBtn, () => handleDeleteConfirm());

  async function handleDeleteConfirm() {
    if (!pendingDeleteKey) return;
    const key     = pendingDeleteKey;
    const isGroup = pendingDeleteIsGroup;
    hideDeleteSheet();
    try {
      const path = isGroup
        ? `groupChats/${currentGroupCode}/messages/${key}`
        : `chats/${currentChatId}/messages/${key}`;
      await update(ref(db, path), { deleted: true, text: null, url: null, stampFile: null });
    } catch { showToast('削除に失敗しました'); }
  }

  function fmtDuration(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  async function writeCallLog(chatId, callType, callStatus, durationSecs, callerCode, calleeCode) {
    const icon  = callType === 'video' ? '📹' : '📞';
    const label = callStatus === 'missed'   ? `${icon} 不在着信` :
                  callStatus === 'rejected' ? `${icon} 通話拒否` :
                                             `${icon} 通話${durationSecs ? ' ' + fmtDuration(durationSecs) : ''}`;
    const ts = Date.now();
    try {
      await push(ref(db, `chats/${chatId}/messages`), {
        type: 'call', callType, callStatus,
        from: callerCode, duration: durationSecs,
        timestamp: serverTimestamp(), read: false
      });
      const updates = {
        [`userChats/${callerCode}/${chatId}/lastMessage`]:  label,
        [`userChats/${callerCode}/${chatId}/lastTimestamp`]: ts,
        [`userChats/${calleeCode}/${chatId}/lastMessage`]:  label,
        [`userChats/${calleeCode}/${chatId}/lastTimestamp`]: ts,
      };
      if (callStatus === 'missed') {
        const snap = await get(ref(db, `userChats/${calleeCode}/${chatId}/unread`));
        updates[`userChats/${calleeCode}/${chatId}/unread`] = (snap.exists() ? (snap.val() || 0) : 0) + 1;
      }
      await update(ref(db), updates);
    } catch (e) { console.error('writeCallLog', e); }
  }

  function fmtTime(ts) {
    if (!ts) return '';
    const d = new Date(ts), now = new Date();
    if (d.toDateString() === now.toDateString())
      return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
  }

  // ============================================================
  // ☁E�E☁Eグループ機�E ☁E�E☁E  // ============================================================

  // ── グループチャチE��を開ぁE──
  function openGroupChat(group) {
    stopTyping();
    if (typingUnsub) { typingUnsub(); typingUnsub = null; }
    typingIndicatorEl.classList.add('hidden');
    currentGroupCode = group.code;
    currentIsGroup = true;
    currentChatId = null;
    currentPartner = null;

    noChatEl.style.display = 'none';
    activeChatEl.style.display = 'flex';
    msgInput.disabled = false;
    sendBtn.disabled = msgInput.value.trim().length === 0;

    partnerNameEl.textContent = group.name;
    partnerCodeEl.textContent = 'グループコード: ' + group.code;
    partnerAvEl.textContent = '\uD83D\uDC65';
    partnerAvEl.classList.add('av-group');

    voiceCallBtn.style.display = 'none';
    videoCallBtn.style.display = 'none';
    document.getElementById('group-call-btn').style.display = '';
    const gsBtn = document.getElementById('group-settings-btn');
    gsBtn.style.display = '';
    gsBtn.dataset.adminCode = group.adminCode || '';
    gsBtn.dataset.groupCode = group.code;
    gsBtn.dataset.groupName = group.name;

    sidebar.classList.add('slide-out');
    sidebarError.textContent = '';
    activeConvTab = 'group';
    document.getElementById('tab-group').classList.add('active');
    document.getElementById('tab-dm').classList.remove('active');
    document.getElementById('group-actions-bar').style.display = '';
    renderConvList();

    update(ref(db, `userGroups/${me.code}/${group.code}`), { unread: 0 }).catch(() => {});
    loadGroupMessages(group.code);
  }

  // ── グループメチE��ージ読み込み ──
  function loadGroupMessages(groupCode) {
    if (msgUnsub) msgUnsub();
    messagesEl.innerHTML = '<div class="loading"><div class="spinner"></div>読み込み中...</div>';
    sendBtn.disabled = true;

    const q = query(ref(db, `groupChats/${groupCode}/messages`), orderByChild('timestamp'), limitToLast(100));
    let lastDate = null;

    msgUnsub = onValue(q, snap => {
      messagesEl.innerHTML = '';
      lastDate = null;

      if (!snap.exists()) {
        messagesEl.innerHTML = '<div class="empty-state" style="height:100%"><div class="empty-icon">&#128101;</div>最初のメッセージを送ってみましょう</div>';
        sendBtn.disabled = false;
        msgInput.disabled = false;
        return;
      }

      snap.forEach(child => {
        const msg = child.val();
        const ts  = msg.timestamp || Date.now();
        const d   = new Date(ts);
        const dateStr = d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });

        if (dateStr !== lastDate) {
          const sep = document.createElement('div');
          sep.className = 'date-sep';
          sep.textContent = dateStr;
          messagesEl.appendChild(sep);
          lastDate = dateStr;
        }

        const isMe = msg.from === me.code;
        const grpEl = document.createElement('div');
        grpEl.className = 'msg-group ' + (isMe ? 'me' : 'other');

        const senderEl = document.createElement('div');
        senderEl.className = 'msg-sender';
        senderEl.textContent = msg.fromNickname || msg.from || '?';
        grpEl.appendChild(senderEl);

        let contentEl;
        if (msg.type === 'image') {
          contentEl = document.createElement('a');
          contentEl.className = 'img-bubble';
          contentEl.href = '#';
          contentEl.addEventListener('click', e => {
            e.preventDefault();
            lightboxImg.src = msg.url;
            lightbox.classList.add('show');
          });
          const img = document.createElement('img');
          img.src = msg.url; img.alt = msg.filename || '画像'; img.loading = 'lazy';
          contentEl.appendChild(img);
        } else if (msg.type === 'stamp') {
          contentEl = document.createElement('div');
          contentEl.className = 'stamp-bubble';
          const si = document.createElement('img');
          si.src = `stamps/${msg.stampFile}`; si.alt = 'スタンプ'; si.loading = 'lazy';
          contentEl.appendChild(si);
        } else {
          contentEl = document.createElement('div');
          contentEl.className = 'bubble';
          contentEl.textContent = msg.text || '';
        }
        grpEl.appendChild(contentEl);

        const meta = document.createElement('div');
        meta.className = 'msg-meta';
        const t = document.createElement('span');
        t.className = 'msg-time';
        t.textContent = d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
        meta.appendChild(t);
        grpEl.appendChild(meta);
        messagesEl.appendChild(grpEl);
      });

      sendBtn.disabled = false;
      msgInput.disabled = false;
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  // ── グループメチE��ージ送信 ──
  async function sendGroupMessage() {
    const text = msgInput.value.trim();
    if (!text || !currentGroupCode) return;
    msgInput.value = '';
    msgInput.style.height = '';
    sendBtn.disabled = true;

    const groupCode = currentGroupCode;
    const ts = Date.now();

    try {
      await push(ref(db, `groupChats/${groupCode}/messages`), {
        from: me.code, fromNickname: me.nickname,
        text, timestamp: serverTimestamp(), type: 'text'
      });

      const [groupInfoSnap, membersSnap] = await Promise.all([
        get(ref(db, `groups/${groupCode}`)),
        get(ref(db, `groups/${groupCode}/members`))
      ]);
      const groupName = groupInfoSnap.exists() ? groupInfoSnap.val().name : 'グループ';
      const adminCode = groupInfoSnap.exists() ? groupInfoSnap.val().adminCode : '';

      if (membersSnap.exists()) {
        const baseUpdates = {};
        const memberKeys = [];
        membersSnap.forEach(m => {
          memberKeys.push(m.key);
          baseUpdates[`userGroups/${m.key}/${groupCode}/lastMessage`] = text;
          baseUpdates[`userGroups/${m.key}/${groupCode}/lastTimestamp`] = ts;
          baseUpdates[`userGroups/${m.key}/${groupCode}/name`] = groupName;
          baseUpdates[`userGroups/${m.key}/${groupCode}/adminCode`] = adminCode;
        });
        await update(ref(db), baseUpdates);

        const unreadUpdates = {};
        await Promise.all(memberKeys.filter(k => k !== me.code).map(async k => {
          const snap = await get(ref(db, `userGroups/${k}/${groupCode}/unread`));
          unreadUpdates[`userGroups/${k}/${groupCode}/unread`] = (snap.exists() ? (snap.val() || 0) : 0) + 1;
        }));
        if (Object.keys(unreadUpdates).length) await update(ref(db), unreadUpdates);
        memberKeys.filter(k => k !== me.code).forEach(k => {
          sendFcmNotification(k, groupName, `${me.nickname}: ${text}`);
        });
      }
    } catch (e) {
      console.error(e);
      showToast('送信に失敗しました');
    } finally {
      sendBtn.disabled = false;
      msgInput.focus();
    }
  }

  // ── グループ作�E ──
  async function createGroup(name, code) {
    const snap = await get(ref(db, 'groups/' + code));
    if (snap.exists()) throw new Error('このグループコードはすでに使われています');

    await set(ref(db, 'groups/' + code), {
      name, code, adminCode: me.code,
      createdAt: serverTimestamp(),
      members: { [me.code]: { nickname: me.nickname, joinedAt: serverTimestamp() } }
    });
    await set(ref(db, `userGroups/${me.code}/${code}`), {
      name, adminCode: me.code, lastMessage: '', lastTimestamp: Date.now(), unread: 0
    });
  }

  // ── グループ招征E──
  async function inviteToGroup(groupCode, targetCode) {
    const [userSnap, memberSnap, groupSnap] = await Promise.all([
      get(ref(db, 'users/' + targetCode)),
      get(ref(db, `groups/${groupCode}/members/${targetCode}`)),
      get(ref(db, `groups/${groupCode}`))
    ]);
    if (!userSnap.exists()) throw new Error('こ�Eコード�Eユーザーは存在しません');
    if (memberSnap.exists()) throw new Error('このユーザーはすでにメンバーです');
    if (!groupSnap.exists()) throw new Error('グループが存在しません');
    const banSnap = await get(ref(db, `groups/${groupCode}/bans/${targetCode}`));
    if (banSnap.exists()) throw new Error('このユーザーはBANされています');

    const existingSnap = await get(ref(db, `groupInvites/${targetCode}`));
    if (existingSnap.exists()) {
      let already = false;
      existingSnap.forEach(inv => { if (inv.val().groupCode === groupCode) already = true; });
      if (already) throw new Error('すでに招待済みです');
    }

    await push(ref(db, `groupInvites/${targetCode}`), {
      groupCode, groupName: groupSnap.val().name,
      inviterCode: me.code, inviterNickname: me.nickname,
      ts: serverTimestamp()
    });
  }

  // ── 招征E��誁E──
  async function acceptInvite(inviteKey, inviteData) {
    const groupSnap = await get(ref(db, `groups/${inviteData.groupCode}`));
    if (!groupSnap.exists()) {
      await remove(ref(db, `groupInvites/${me.code}/${inviteKey}`));
      throw new Error('グループが削除されています');
    }
    const banSnap = await get(ref(db, `groups/${inviteData.groupCode}/bans/${me.code}`));
    if (banSnap.exists()) {
      await remove(ref(db, `groupInvites/${me.code}/${inviteKey}`));
      throw new Error('このグループからBANされています');
    }
    const group = groupSnap.val();
    await update(ref(db, `groups/${inviteData.groupCode}/members/${me.code}`), {
      nickname: me.nickname, joinedAt: serverTimestamp()
    });
    await set(ref(db, `userGroups/${me.code}/${inviteData.groupCode}`), {
      name: group.name, adminCode: group.adminCode,
      lastMessage: '', lastTimestamp: Date.now(), unread: 0
    });
    await remove(ref(db, `groupInvites/${me.code}/${inviteKey}`));
  }

  // ── 招征E��否 ──
  async function rejectInvite(inviteKey) {
    await remove(ref(db, `groupInvites/${me.code}/${inviteKey}`));
  }

  // ── グループ名変更�E�管琁E��E�Eみ�E�──
  async function renameGroup(groupCode, newName) {
    await update(ref(db, `groups/${groupCode}`), { name: newName });
    const membersSnap = await get(ref(db, `groups/${groupCode}/members`));
    if (membersSnap.exists()) {
      const updates = {};
      membersSnap.forEach(m => { updates[`userGroups/${m.key}/${groupCode}/name`] = newName; });
      await update(ref(db), updates);
    }
  }

  // ── グループ削除�E�管琁E��E�Eみ�E�──
  async function deleteGroup(groupCode) {
    const membersSnap = await get(ref(db, `groups/${groupCode}/members`));
    const updates = {};
    if (membersSnap.exists()) {
      membersSnap.forEach(m => { updates[`userGroups/${m.key}/${groupCode}`] = null; });
    }
    updates[`groups/${groupCode}`] = null;
    updates[`groupChats/${groupCode}`] = null;
    await update(ref(db), updates);
  }

  // ── グループ退出�E�非管琁E��E��──
  async function leaveGroup(groupCode) {
    await remove(ref(db, `groups/${groupCode}/members/${me.code}`));
    await remove(ref(db, `userGroups/${me.code}/${groupCode}`));
  }

  // ── KICK�E�管琁E��E�Eみ�E�──
  async function kickMember(groupCode, memberCode) {
    const snap = await get(ref(db, `groups/${groupCode}/members/${memberCode}`));
    const nick = snap.exists() ? (snap.val().nickname || memberCode) : memberCode;
    await remove(ref(db, `groups/${groupCode}/members/${memberCode}`));
    await remove(ref(db, `userGroups/${memberCode}/${groupCode}`));
    await set(ref(db, `groups/${groupCode}/kicks/${memberCode}`), { kickedAt: serverTimestamp(), nickname: nick });
  }

  // ── BAN�E�管琁E��E�Eみ�E�──
  async function banMember(groupCode, memberCode) {
    const snap = await get(ref(db, `groups/${groupCode}/members/${memberCode}`));
    const nick = snap.exists() ? (snap.val().nickname || memberCode) : memberCode;
    await remove(ref(db, `groups/${groupCode}/members/${memberCode}`));
    await remove(ref(db, `userGroups/${memberCode}/${groupCode}`));
    await set(ref(db, `groups/${groupCode}/bans/${memberCode}`), { bannedAt: serverTimestamp(), nickname: nick });
  }

  // ── BAN/KICK解除して復允E��管琁E��E�Eみ�E�──
  // type: 'force' = 強制参加 / 'invite' = 招征E��送る
  async function restoreMember(groupCode, memberCode, nick, type) {
    await Promise.all([
      remove(ref(db, `groups/${groupCode}/bans/${memberCode}`)).catch(() => {}),
      remove(ref(db, `groups/${groupCode}/kicks/${memberCode}`)).catch(() => {})
    ]);
    if (type === 'force') {
      const [userSnap, groupSnap] = await Promise.all([
        get(ref(db, `users/${memberCode}`)),
        get(ref(db, `groups/${groupCode}`))
      ]);
      if (!userSnap.exists()) throw new Error('ユーザーが見つかりません');
      if (!groupSnap.exists()) throw new Error('グループが見つかりません');
      const actualNick = userSnap.val().nickname || nick;
      const group = groupSnap.val();
      await update(ref(db, `groups/${groupCode}/members/${memberCode}`), {
        nickname: actualNick, joinedAt: serverTimestamp()
      });
      await set(ref(db, `userGroups/${memberCode}/${groupCode}`), {
        name: group.name, adminCode: group.adminCode,
        lastMessage: '', lastTimestamp: Date.now(), unread: 0
      });
    } else {
      await inviteToGroup(groupCode, memberCode);
    }
  }

  // ── 招征E��バッジ ──
  function loadGroupInviteCount() {
    if (inviteUnsub) inviteUnsub();
    inviteUnsub = onValue(ref(db, `groupInvites/${me.code}`), snap => {
      const count = snap.exists() ? Object.keys(snap.val() || {}).length : 0;
      const badge = document.getElementById('invite-count-badge');
      if (count > 0) { badge.textContent = count; badge.style.display = ''; }
      else { badge.style.display = 'none'; }
    });
  }

  // ── 招征E��覧モーダル ──
  async function openInviteListModal() {
    document.getElementById('invite-list-modal').classList.remove('hidden');
    const body = document.getElementById('invite-list-body');
    body.innerHTML = '<div class="loading"><div class="spinner"></div>読み込み中...</div>';

    const snap = await get(ref(db, `groupInvites/${me.code}`));
    body.innerHTML = '';

    if (!snap.exists() || !snap.val()) {
      body.innerHTML = '<div class="empty-state"><div class="empty-icon">&#128140;</div>招征E�Eありません</div>';
      return;
    }

    const items = [];
    snap.forEach(c => { items.push({ key: c.key, ...c.val() }); });
    items.sort((a, b) => (b.ts || 0) - (a.ts || 0));

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'invite-card';
      card.innerHTML = `
        <div class="invite-card-name">&#128101; ${esc(item.groupName || item.groupCode)}</div>
        <div class="invite-card-from">招征E��E ${esc(item.inviterNickname || item.inviterCode)}</div>
        <div class="invite-card-btns">
          <button class="btn btn-primary btn-sm accept-btn">承誁E/button>
          <button class="btn btn-ghost btn-sm reject-btn" style="border-color:var(--danger);color:var(--danger)">拒否</button>
        </div>`;

      card.querySelector('.accept-btn').addEventListener('click', async () => {
        card.querySelectorAll('button').forEach(b => b.disabled = true);
        try {
          await acceptInvite(item.key, item);
          showToast(`、E{item.groupName}」に参加しました`);
          card.remove();
          if (!body.querySelector('.invite-card'))
            body.innerHTML = '<div class="empty-state"><div class="empty-icon">&#128140;</div>招征E�Eありません</div>';
        } catch (e) {
          showToast('エラー: ' + e.message);
          card.querySelectorAll('button').forEach(b => b.disabled = false);
        }
      });

      card.querySelector('.reject-btn').addEventListener('click', async () => {
        try {
          await rejectInvite(item.key);
          card.remove();
          if (!body.querySelector('.invite-card'))
            body.innerHTML = '<div class="empty-state"><div class="empty-icon">&#128140;</div>招征E�Eありません</div>';
        } catch (e) { showToast('エラー: ' + e.message); }
      });

      body.appendChild(card);
    });
  }

  // ── グループ設定モーダル ──
  async function openGroupSettingsModal(groupCode, groupName, adminCode) {
    const modal = document.getElementById('group-settings-modal');
    const title = document.getElementById('gsettings-title');
    const renameSection = document.getElementById('gsettings-rename-section');
    const inviteSection = document.getElementById('gsettings-invite-section');
    const memberList = document.getElementById('gsettings-member-list');
    const leaveBtn = document.getElementById('gsettings-leave-btn');
    const deleteBtn = document.getElementById('gsettings-delete-btn');
    const errorEl = document.getElementById('gsettings-error');
    const newNameIn = document.getElementById('gsettings-newname');
    const inviteCodeIn = document.getElementById('gsettings-invite-code');

    const isAdmin = adminCode === me.code;
    title.textContent = '\u2699\uFE0F ' + groupName;
    errorEl.textContent = '';
    newNameIn.value = '';
    inviteCodeIn.value = '';

    renameSection.style.display = isAdmin ? '' : 'none';
    inviteSection.style.display = isAdmin ? '' : 'none';
    leaveBtn.style.display = isAdmin ? 'none' : '';
    deleteBtn.style.display = isAdmin ? '' : 'none';

    modal.classList.remove('hidden');

    memberList.innerHTML = '<div class="loading"><div class="spinner"></div>読み込み中...</div>';
    const membersSnap = await get(ref(db, `groups/${groupCode}/members`));
    memberList.innerHTML = '';

    if (membersSnap.exists()) {
      membersSnap.forEach(m => {
        const d = m.val();
        const isAdminMember = m.key === adminCode;
        const canModerate = isAdmin && !isAdminMember;
        const item = document.createElement('div');
        item.className = 'member-item';
        item.dataset.memberCode = m.key;
        item.innerHTML = `
          <div class="av-sm">${esc((d.nickname||'?')[0].toUpperCase())}</div>
          <div class="member-info">
            <div class="member-name">${esc(d.nickname || m.key)}</div>
            <div class="member-code">${esc(m.key)}</div>
          </div>
          ${isAdminMember ? '<span class="member-admin-tag">管琁E��E/span>' : ''}
          ${canModerate ? `
            <button class="member-kick-btn" data-code="${esc(m.key)}" data-nick="${esc(d.nickname||m.key)}">KICK</button>
            <button class="member-ban-btn" data-code="${esc(m.key)}" data-nick="${esc(d.nickname||m.key)}">BAN</button>
          ` : ''}`;

        if (canModerate) {
          const REQUIRED = 5;
          function setupMultiClick(btn, onConfirm) {
            let count = 0;
            const reset = () => {
              count = 0;
              btn.dataset.clicks = '0';
              btn.style.opacity = '';
              btn.textContent = btn.dataset.label;
            };
            btn.dataset.label = btn.textContent;
            btn.dataset.clicks = '0';
            btn.addEventListener('click', async e => {
              e.stopPropagation();
              count++;
              btn.dataset.clicks = count;
              if (count >= REQUIRED) {
                reset();
                await onConfirm();
              } else {
                btn.textContent = `${btn.dataset.label} ${count}/${REQUIRED}`;
                btn.style.opacity = String(0.5 + count * 0.1);
              }
            });
            btn.addEventListener('mouseleave', reset);
          }

          const kickBtn = item.querySelector('.member-kick-btn');
          const banBtn  = item.querySelector('.member-ban-btn');
          const nick = d.nickname || m.key;

          setupMultiClick(kickBtn, async () => {
            try {
              await kickMember(groupCode, m.key);
              item.remove();
              showToast(`${nick} をKICKしました`);
            } catch (e) { errorEl.textContent = 'エラー: ' + e.message; }
          });
          setupMultiClick(banBtn, async () => {
            try {
              await banMember(groupCode, m.key);
              item.remove();
              showToast(`${nick} をBANしました`);
            } catch (e) { errorEl.textContent = 'エラー: ' + e.message; }
          });

          // パネル外クリチE��で両ボタンリセチE��
          const outsideReset = e => {
            if (!kickBtn.contains(e.target)) { kickBtn.dispatchEvent(new Event('mouseleave')); }
            if (!banBtn.contains(e.target))  { banBtn.dispatchEvent(new Event('mouseleave')); }
          };
          document.addEventListener('click', outsideReset);
        }

        memberList.appendChild(item);
      });
    }

    // ── BAN/KICKリスト読み込み ──
    const bannedSection = document.getElementById('gsettings-banned-section');
    const bannedList = document.getElementById('gsettings-banned-list');
    bannedSection.style.display = 'none';
    bannedList.innerHTML = '';

    if (isAdmin) {
      const [bansSnap, kicksSnap] = await Promise.all([
        get(ref(db, `groups/${groupCode}/bans`)),
        get(ref(db, `groups/${groupCode}/kicks`))
      ]);

      const punished = [];
      if (bansSnap.exists()) {
        bansSnap.forEach(c => punished.push({ code: c.key, kind: 'ban', nick: c.val().nickname || c.key, ts: c.val().bannedAt || 0 }));
      }
      if (kicksSnap.exists()) {
        kicksSnap.forEach(c => punished.push({ code: c.key, kind: 'kick', nick: c.val().nickname || c.key, ts: c.val().kickedAt || 0 }));
      }

      if (punished.length > 0) {
        bannedSection.style.display = '';
        punished.sort((a, b) => (b.ts || 0) - (a.ts || 0));

        punished.forEach(u => {
          const item = document.createElement('div');
          item.className = 'banned-item';
          item.dataset.code = u.code;

          const avSm = document.createElement('div');
          avSm.className = 'av-sm';
          avSm.textContent = u.nick[0].toUpperCase();

          const info = document.createElement('div');
          info.className = 'member-info';
          info.innerHTML = `<div class="member-name">${esc(u.nick)}</div><div class="member-code">${esc(u.code)}</div>`;

          const tag = document.createElement('span');
          tag.className = `banned-tag ${u.kind}`;
          tag.textContent = u.kind === 'ban' ? 'BAN' : 'KICK';

          const restoreBtn = document.createElement('button');
          restoreBtn.className = 'restore-btn';
          restoreBtn.textContent = '元に戻す';

          const optionsEl = document.createElement('div');
          optionsEl.className = 'restore-options';
          optionsEl.style.display = 'none';

          const forceBtn = document.createElement('button');
          forceBtn.className = 'restore-opt-btn force';
          forceBtn.textContent = '強制参加';

          const inviteBtn = document.createElement('button');
          inviteBtn.className = 'restore-opt-btn invite';
          inviteBtn.textContent = '招征E��送る';

          const cancelBtn = document.createElement('button');
          cancelBtn.className = 'restore-opt-btn cancel';
          cancelBtn.textContent = 'キャンセル';

          optionsEl.append(forceBtn, inviteBtn, cancelBtn);

          restoreBtn.addEventListener('click', () => {
            optionsEl.style.display = optionsEl.style.display === 'none' ? '' : 'none';
          });
          cancelBtn.addEventListener('click', () => { optionsEl.style.display = 'none'; });

          const doRestore = async (type) => {
            forceBtn.disabled = inviteBtn.disabled = true;
            try {
              await restoreMember(groupCode, u.code, u.nick, type);
              item.remove();
              if (!bannedList.querySelector('.banned-item')) bannedSection.style.display = 'none';
              showToast(type === 'force' ? `${u.nick} を強制参加させました` : `${u.nick} に招征E��送りました`);
            } catch (e) {
              errorEl.textContent = 'エラー: ' + e.message;
              forceBtn.disabled = inviteBtn.disabled = false;
            }
          };
          forceBtn.addEventListener('click', () => doRestore('force'));
          inviteBtn.addEventListener('click', () => doRestore('invite'));

          const right = document.createElement('div');
          right.style.cssText = 'display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0';
          right.append(restoreBtn, optionsEl);

          item.append(avSm, info, tag, right);
          bannedList.appendChild(item);
        });
      }
    }

    document.getElementById('gsettings-rename-btn').onclick = async () => {
      const newName = newNameIn.value.trim();
      if (!newName) { errorEl.textContent = 'グループ名を�E力してください'; return; }
      const btn = document.getElementById('gsettings-rename-btn');
      btn.disabled = true;
      try {
        await renameGroup(groupCode, newName);
        showToast('グループ名を変更しました');
        title.textContent = '\u2699\uFE0F ' + newName;
        newNameIn.value = '';
        errorEl.textContent = '';
        partnerNameEl.textContent = newName;
        const gsBtn = document.getElementById('group-settings-btn');
        gsBtn.dataset.groupName = newName;
        if (allGroups[groupCode]) allGroups[groupCode].name = newName;
        renderConvList();
      } catch (e) { errorEl.textContent = 'エラー: ' + e.message; }
      finally { btn.disabled = false; }
    };

    document.getElementById('gsettings-invite-btn').onclick = async () => {
      const targetCode = inviteCodeIn.value.trim();
      if (!targetCode) { errorEl.textContent = 'コードを入力してください'; return; }
      const btn = document.getElementById('gsettings-invite-btn');
      btn.disabled = true;
      try {
        await inviteToGroup(groupCode, targetCode);
        showToast('招征E��送りました');
        inviteCodeIn.value = '';
        errorEl.textContent = '';
      } catch (e) { errorEl.textContent = 'エラー: ' + e.message; }
      finally { btn.disabled = false; }
    };

    leaveBtn.onclick = async () => {
      if (!confirm(`、E{groupName}」を退出しますか�E�`)) return;
      try {
        await leaveGroup(groupCode);
        modal.classList.add('hidden');
        showToast('グループを退出しました');
        if (currentGroupCode === groupCode) {
          currentGroupCode = null; currentIsGroup = false;
          noChatEl.style.display = 'flex'; activeChatEl.style.display = 'none';
        }
      } catch (e) { errorEl.textContent = 'エラー: ' + e.message; }
    };

    deleteBtn.onclick = async () => {
      if (!confirm(`、E{groupName}」を削除しますか�E�\nこ�E操作�E允E��戻せません。`)) return;
      try {
        await deleteGroup(groupCode);
        modal.classList.add('hidden');
        showToast('グループを削除しました');
        if (currentGroupCode === groupCode) {
          currentGroupCode = null; currentIsGroup = false;
          noChatEl.style.display = 'flex'; activeChatEl.style.display = 'none';
        }
      } catch (e) { errorEl.textContent = 'エラー: ' + e.message; }
    };
  }

  // ── グループ作�EモーダルのイベンチE──
  document.getElementById('group-create-btn').addEventListener('click', () => {
    document.getElementById('gname-input').value = '';
    document.getElementById('gcode-input').value = '';
    document.getElementById('group-create-error').textContent = '';
    document.getElementById('group-create-modal').classList.remove('hidden');
  });
  document.getElementById('group-create-close').addEventListener('click', () => {
    document.getElementById('group-create-modal').classList.add('hidden');
  });
  document.getElementById('group-create-submit').addEventListener('click', async () => {
    const name = document.getElementById('gname-input').value.trim();
    const code = document.getElementById('gcode-input').value.trim();
    const errEl = document.getElementById('group-create-error');
    errEl.textContent = '';

    if (!name) { errEl.textContent = 'グループ名を�E力してください'; return; }
    if (!code) { errEl.textContent = 'グループコードを入力してください'; return; }
    if (!/^[a-zA-Z0-9_\-]+$/.test(code)) {
      errEl.textContent = 'コードは半角英数字・_・- のみ使えます'; return;
    }

    const submitBtn = document.getElementById('group-create-submit');
    submitBtn.disabled = true; submitBtn.textContent = '作�E中...';
    try {
      await createGroup(name, code);
      document.getElementById('group-create-modal').classList.add('hidden');
      showToast(`、E{name}」を作�Eしました`);
      openGroupChat({ code, name, adminCode: me.code });
    } catch (e) { errEl.textContent = 'エラー: ' + e.message; }
    finally { submitBtn.disabled = false; submitBtn.textContent = '作�E'; }
  });

  // ── 招征E��覧モーダルのイベンチE──
  document.getElementById('invite-check-btn').addEventListener('click', openInviteListModal);
  document.getElementById('invite-list-close').addEventListener('click', () => {
    document.getElementById('invite-list-modal').classList.add('hidden');
  });

  // ── グループ設定�EタンのイベンチE──
  // ============================================================
  // ☁E�E☁Eグループ通話機�E ☁E�E☁E  // ============================================================

  function listenForGroupCallNotifications() {
    if (gcallNotifUnsub) gcallNotifUnsub();
    gcallNotifUnsub = onValue(ref(db, `userGroupCallNotifs/${me.code}`), snap => {
      if (!snap.exists() || !snap.val()) {
        document.getElementById('incoming-group-call').classList.add('hidden');
        return;
      }
      const now = Date.now();
      const entries = [];
      snap.forEach(c => {
        const v = c.val();
        if (v && (!v.ts || (now - v.ts) <= 1000)) entries.push({ groupCode: c.key, ...v });
      });
      if (!entries.length) { document.getElementById('incoming-group-call').classList.add('hidden'); return; }
      if (groupCallLocalStream) return;
      const n = entries[0];
      document.getElementById('inc-gcall-name').textContent = n.groupName || 'グループ';
      document.getElementById('inc-gcall-type').textContent = n.type === 'video' ? '🎥 グループビデオ通話' : '📞 グループ音声通話';
      const el = document.getElementById('incoming-group-call');
      el.dataset.groupCode = n.groupCode;
      el.dataset.callType = n.type || 'voice';
      el.classList.remove('hidden');
    });
  }

  async function startGroupCall(groupCode, groupName, callType) {
    if (groupCallLocalStream) { showToast('すでに通話中です'); return; }
    let stream;
    try {
      stream = await getMediaStreamSafe(
        callType === 'video' ? { audio: true, video: { facingMode: 'user' } } : { audio: true, video: false }
      );
    } catch (e) { showMediaDeviceError(e); return; }

    groupCallLocalStream = stream;
    currentGroupCallCode = groupCode;
    groupCallType = callType;
    groupCallMicMuted = groupCallCamMuted = false;

    try {
      const membersSnap = await get(ref(db, `groups/${groupCode}/members`));
      const notifUpdates = {};
      if (membersSnap.exists()) {
        membersSnap.forEach(m => {
          if (m.key !== me.code) {
            notifUpdates[`userGroupCallNotifs/${m.key}/${groupCode}`] = {
              groupName, type: callType, startedBy: me.code, startedByNickname: me.nickname, ts: serverTimestamp()
            };
          }
        });
      }
      await Promise.all([
        update(ref(db, `groupCalls/${groupCode}`), {
          status: 'active', type: callType, startedBy: me.code,
          startedByNickname: me.nickname, startedAt: serverTimestamp()
        }),
        update(ref(db, `groupCalls/${groupCode}/participants/${me.code}`), {
          nickname: me.nickname, joinedAt: serverTimestamp(), active: true
        }),
        Object.keys(notifUpdates).length ? update(ref(db), notifUpdates) : Promise.resolve()
      ]);
    } catch (e) {
      stream.getTracks().forEach(t => t.stop());
      groupCallLocalStream = null; currentGroupCallCode = null;
      showToast('通話の開始に失敗しました'); return;
    }

    showGroupCallOverlayUI(groupName, callType);
    addLocalGcallTile();
    listenForGcallPeers(groupCode);
    startGcallTimer();
    const endUnsub = onValue(ref(db, `groupCalls/${groupCode}/status`), snap => {
      if (snap.val() === 'ended') cleanupGroupCall();
    });
    groupCallSignalingUnsubs.push(endUnsub);
  }

  async function joinGroupCall(groupCode, callType) {
    if (groupCallLocalStream) { showToast('すでに通話中です'); return; }
    await remove(ref(db, `userGroupCallNotifs/${me.code}/${groupCode}`)).catch(() => {});
    document.getElementById('incoming-group-call').classList.add('hidden');

    let stream;
    try {
      stream = await getMediaStreamSafe(
        callType === 'video' ? { audio: true, video: { facingMode: 'user' } } : { audio: true, video: false }
      );
    } catch (e) { showMediaDeviceError(e); return; }

    groupCallLocalStream = stream;
    currentGroupCallCode = groupCode;
    groupCallType = callType;
    groupCallMicMuted = groupCallCamMuted = false;

    const groupSnap = await get(ref(db, `groups/${groupCode}`));
    const groupName = groupSnap.exists() ? groupSnap.val().name : 'グループ';

    const participantsSnap = await get(ref(db, `groupCalls/${groupCode}/participants`));
    const existingPeers = [];
    if (participantsSnap.exists()) {
      participantsSnap.forEach(c => {
        if (c.key !== me.code && c.val().active) existingPeers.push({ code: c.key, nickname: c.val().nickname });
      });
    }
    await update(ref(db, `groupCalls/${groupCode}/participants/${me.code}`), {
      nickname: me.nickname, joinedAt: serverTimestamp(), active: true
    });

    showGroupCallOverlayUI(groupName, callType);
    addLocalGcallTile();
    for (const peer of existingPeers) await createGcallOffer(groupCode, peer.code, peer.nickname);
    listenForGcallPeers(groupCode);
    startGcallTimer();

    const endUnsub = onValue(ref(db, `groupCalls/${groupCode}/status`), snap => {
      if (snap.val() === 'ended') cleanupGroupCall();
    });
    groupCallSignalingUnsubs.push(endUnsub);
  }

  async function createGcallOffer(groupCode, peerCode, peerNickname) {
    if (groupCallPeers[peerCode]) return;
    const peerKey = `${me.code}__${peerCode}`;
    const pc = new RTCPeerConnection(RTC_CONFIG);
    groupCallPeers[peerCode] = pc;
    groupCallLocalStream.getTracks().forEach(t => pc.addTrack(t, groupCallLocalStream));
    pc.ontrack = e => { if (e.streams[0]) addRemoteGcallTile(peerCode, peerNickname, e.streams[0]); };
    pc.onicecandidate = e => {
      if (e.candidate) push(ref(db, `gcSignal/${groupCode}/${peerKey}/ice_o`), e.candidate.toJSON());
    };
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await set(ref(db, `gcSignal/${groupCode}/${peerKey}`), {
      joiner: me.code, existing: peerCode, offer: { sdp: offer.sdp, type: offer.type }
    });
    const aUnsub = onValue(ref(db, `gcSignal/${groupCode}/${peerKey}/answer`), async snap => {
      if (!snap.exists() || !pc || pc.signalingState !== 'have-local-offer') return;
      try { await pc.setRemoteDescription(new RTCSessionDescription(snap.val())); } catch {}
    });
    const iUnsub = onChildAdded(ref(db, `gcSignal/${groupCode}/${peerKey}/ice_a`), c => {
      if (!pc) return;
      pc.addIceCandidate(new RTCIceCandidate(c.val())).catch(() => {});
    });
    groupCallSignalingUnsubs.push(aUnsub, iUnsub);
  }

  function listenForGcallPeers(groupCode) {
    const unsub = onValue(ref(db, `gcSignal/${groupCode}`), async snap => {
      if (!snap.exists() || !groupCallLocalStream) return;
      for (const [peerKey, data] of Object.entries(snap.val() || {})) {
        if (!data?.offer || data.existing !== me.code || groupCallPeers[data.joiner]) continue;
        const joinerCode = data.joiner;
        const uSnap = await get(ref(db, `users/${joinerCode}`));
        const nick = uSnap.exists() ? uSnap.val().nickname : joinerCode;
        const pc = new RTCPeerConnection(RTC_CONFIG);
        groupCallPeers[joinerCode] = pc;
        groupCallLocalStream.getTracks().forEach(t => pc.addTrack(t, groupCallLocalStream));
        pc.ontrack = e => { if (e.streams[0]) addRemoteGcallTile(joinerCode, nick, e.streams[0]); };
        pc.onicecandidate = e => {
          if (e.candidate) push(ref(db, `gcSignal/${groupCode}/${peerKey}/ice_a`), e.candidate.toJSON());
        };
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await update(ref(db, `gcSignal/${groupCode}/${peerKey}`), { answer: { sdp: answer.sdp, type: answer.type } });
        } catch (e) { console.error('gcall answer', e); }
        const iUnsub = onChildAdded(ref(db, `gcSignal/${groupCode}/${peerKey}/ice_o`), c => {
          if (!pc) return;
          pc.addIceCandidate(new RTCIceCandidate(c.val())).catch(() => {});
        });
        groupCallSignalingUnsubs.push(iUnsub);
      }
    });
    groupCallSignalingUnsubs.push(unsub);
  }

  function showGroupCallOverlayUI(groupName, callType) {
    document.getElementById('gcall-title').textContent = '\uD83D\uDC65 ' + groupName;
    document.getElementById('gcall-cam-btn').style.display = callType === 'video' ? '' : 'none';
    document.getElementById('gcall-screen-btn').style.display = callType === 'video' ? '' : 'none';
    document.getElementById('gcall-screen-btn').classList.remove('active');
    document.getElementById('gcall-mic-btn').textContent = '\uD83C\uDFA4';
    document.getElementById('gcall-cam-btn').textContent = '\uD83D\uDCF7';
    document.getElementById('gcall-mic-btn').classList.remove('muted');
    document.getElementById('gcall-cam-btn').classList.remove('muted');
    document.getElementById('group-call-overlay').classList.remove('hidden');
  }

  function addLocalGcallTile() {
    const grid = document.getElementById('gcall-grid');
    const tile = document.createElement('div');
    tile.className = 'gcall-tile'; tile.id = 'gcall-tile-local';
    if (groupCallType === 'video') {
      const v = document.createElement('video');
      v.autoplay = true; v.muted = true; v.playsInline = true; v.srcObject = groupCallLocalStream;
      tile.appendChild(v);
    } else {
      const av = document.createElement('div'); av.className = 'gcall-tile-av';
      av.style.overflow = 'hidden';
      applyAvatar(av, avatarCache[me.code] || null, me.nickname[0].toUpperCase());
      loadAvatar(me.code).then(url => applyAvatar(av, url, me.nickname[0].toUpperCase()));
      tile.appendChild(av);
    }
    const n = document.createElement('div'); n.className = 'gcall-tile-name';
    n.textContent = me.nickname + '\uff08\u3042\u306a\u305f\uff09'; tile.appendChild(n);
    grid.appendChild(tile); updateGcallGrid();
  }

  function addRemoteGcallTile(peerCode, peerNickname, stream) {
    document.getElementById('gcall-tile-' + peerCode)?.remove();
    const grid = document.getElementById('gcall-grid');
    const tile = document.createElement('div');
    tile.className = 'gcall-tile'; tile.id = 'gcall-tile-' + peerCode;
    if (groupCallType === 'video') {
      const v = document.createElement('video');
      v.autoplay = true; v.playsInline = true; v.srcObject = stream; tile.appendChild(v);
    } else {
      const a = document.createElement('audio');
      a.autoplay = true; a.className = 'gcall-audio'; a.srcObject = stream; document.body.appendChild(a);
      const av = document.createElement('div'); av.className = 'gcall-tile-av';
      av.style.overflow = 'hidden';
      applyAvatar(av, avatarCache[peerCode] || null, (peerNickname || '?')[0].toUpperCase());
      loadAvatar(peerCode).then(url => applyAvatar(av, url, (peerNickname || '?')[0].toUpperCase()));
      tile.appendChild(av);
    }
    const n = document.createElement('div'); n.className = 'gcall-tile-name';
    n.textContent = peerNickname || peerCode; tile.appendChild(n);
    grid.appendChild(tile); updateGcallGrid();
  }

  function updateGcallGrid() {
    const grid = document.getElementById('gcall-grid');
    const c = grid.children.length;
    grid.className = 'gcall-grid c' + Math.min(Math.max(c, 1), 6);
  }

  function startGcallTimer() {
    groupCallTimerSecs = 0;
    if (groupCallTimerInterval) clearInterval(groupCallTimerInterval);
    groupCallTimerInterval = setInterval(() => {
      groupCallTimerSecs++;
      const m = String(Math.floor(groupCallTimerSecs / 60)).padStart(2, '0');
      const s = String(groupCallTimerSecs % 60).padStart(2, '0');
      document.getElementById('gcall-timer').textContent = `${m}:${s}`;
    }, 1000);
  }

  async function leaveGroupCall() {
    if (!currentGroupCallCode) return;
    const gc = currentGroupCallCode;
    try {
      await update(ref(db, `groupCalls/${gc}/participants/${me.code}`), { active: false });
      const snap = await get(ref(db, `groupCalls/${gc}/participants`));
      let active = 0;
      if (snap.exists()) snap.forEach(c => { if (c.val().active) active++; });
      if (active === 0) {
        await update(ref(db, `groupCalls/${gc}`), { status: 'ended' });
        const mSnap = await get(ref(db, `groups/${gc}/members`));
        if (mSnap.exists()) {
          const u = {};
          mSnap.forEach(m => { u[`userGroupCallNotifs/${m.key}/${gc}`] = null; });
          await update(ref(db), u);
        }
      }
    } catch {}
    cleanupGroupCall();
  }

  function stopGcallComposite() {
    if (gcallCompositeInterval) { clearInterval(gcallCompositeInterval); gcallCompositeInterval = null; }
    if (gcallCompositeStream) { gcallCompositeStream.getTracks().forEach(t => t.stop()); gcallCompositeStream = null; }
    gcallCompositeCanvas = null;
  }

  function startGcallComposite(screenStream) {
    gcallCompositeCanvas = document.createElement('canvas');
    gcallCompositeCanvas.width = 1280; gcallCompositeCanvas.height = 720;
    const ctx = gcallCompositeCanvas.getContext('2d');

    const screenVid = document.createElement('video');
    screenVid.srcObject = screenStream; screenVid.autoplay = true; screenVid.muted = true;
    const camVid = document.createElement('video');
    camVid.srcObject = groupCallLocalStream; camVid.autoplay = true; camVid.muted = true;

    gcallCompositeInterval = setInterval(() => {
      if (screenVid.readyState >= 2) {
        ctx.drawImage(screenVid, 0, 0, 1280, 720);
        if (!groupCallCamMuted && camVid.readyState >= 2) {
          ctx.drawImage(camVid, 1280 - 328, 720 - 192, 320, 180);
        }
      }
    }, 22);

    gcallCompositeStream = gcallCompositeCanvas.captureStream(45);
    return gcallCompositeStream;
  }

  function cleanupGroupCall() {
    groupCallSignalingUnsubs.forEach(u => u()); groupCallSignalingUnsubs = [];
    Object.values(groupCallPeers).forEach(pc => { try { pc.close(); } catch {} }); groupCallPeers = {};
    stopGcallComposite();
    if (groupCallScreenStream) { groupCallScreenStream.getTracks().forEach(t => t.stop()); groupCallScreenStream = null; }
    if (groupCallLocalStream) { groupCallLocalStream.getTracks().forEach(t => t.stop()); groupCallLocalStream = null; }
    document.querySelectorAll('.gcall-audio').forEach(a => a.remove());
    if (groupCallTimerInterval) { clearInterval(groupCallTimerInterval); groupCallTimerInterval = null; }
    document.getElementById('gcall-grid').innerHTML = '';
    document.getElementById('group-call-overlay').classList.add('hidden');
    document.getElementById('gcall-timer').textContent = '00:00';
    currentGroupCallCode = null; groupCallType = null;
    groupCallMicMuted = groupCallCamMuted = false; groupCallTimerSecs = 0;
  }

  // ── グループ通話ボタン�E�ピチE��ー表示�E�──
  const callPicker = document.getElementById('call-picker');
  document.getElementById('group-call-btn').addEventListener('click', (e) => {
    if (!currentGroupCode) return;
    e.stopPropagation();
    callPicker.classList.toggle('hidden');
  });
  document.getElementById('picker-voice').addEventListener('click', () => {
    callPicker.classList.add('hidden');
    const groupName = document.getElementById('group-settings-btn').dataset.groupName || 'グループ';
    startGroupCall(currentGroupCode, groupName, 'voice');
  });
  document.getElementById('picker-video').addEventListener('click', () => {
    callPicker.classList.add('hidden');
    const groupName = document.getElementById('group-settings-btn').dataset.groupName || 'グループ';
    startGroupCall(currentGroupCode, groupName, 'video');
  });
  document.addEventListener('click', () => {
    callPicker.classList.add('hidden');
    document.getElementById('stamp-picker').classList.add('hidden');
  });

  // ── スタンチE──
  const stampPicker = document.getElementById('stamp-picker');
  const stampBtn = document.getElementById('stamp-btn');

  stampBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (stampPicker.classList.contains('hidden')) {
      const wrap = document.getElementById('input-wrap');
      const r = wrap.getBoundingClientRect();
      stampPicker.style.bottom = (window.innerHeight - r.top + 4) + 'px';
      stampPicker.style.left   = r.left + 'px';
      stampPicker.style.right  = (window.innerWidth - r.right) + 'px';
    }
    stampPicker.classList.toggle('hidden');
  });
  stampPicker.addEventListener('click', e => e.stopPropagation());

  async function sendStamp(stampFile) {
    stampPicker.classList.add('hidden');
    if (!currentChatId && !currentGroupCode) return;
    if (currentIsGroup) {
      if (!currentGroupCode) return;
      await push(ref(db, `groupChats/${currentGroupCode}/messages`), {
        from: me.code, fromNickname: me.nickname,
        type: 'stamp', stampFile, timestamp: serverTimestamp()
      });
      const ts = Date.now();
      await update(ref(db, `userGroups/${me.code}/${currentGroupCode}`), {
        lastMessage: 'スタンプ', lastTimestamp: ts
      });
      const membersSnap = await get(ref(db, `groups/${currentGroupCode}/members`));
      if (membersSnap.exists()) {
        const updates = {};
        membersSnap.forEach(m => {
          if (m.key !== me.code) {
            updates[`userGroups/${m.key}/${currentGroupCode}/lastMessage`] = 'スタンプ';
            updates[`userGroups/${m.key}/${currentGroupCode}/lastTimestamp`] = ts;
          }
        });
        if (Object.keys(updates).length) await update(ref(db), updates).catch(() => {});
      }
    } else {
      if (!currentChatId) return;
      const chatId = currentChatId;
      const partner = currentPartner;
      const ts = Date.now();
      await push(ref(db, `chats/${chatId}/messages`), {
        from: me.code, type: 'stamp', stampFile, timestamp: serverTimestamp(), read: false
      });
      await update(ref(db, `userChats/${me.code}/${chatId}`), {
        partnerCode: partner.code, partnerNickname: partner.nickname,
        lastMessage: 'スタンプ', lastTimestamp: ts
      });
      const ps = await get(ref(db, `userChats/${partner.code}/${chatId}`));
      const prev = ps.exists() ? (ps.val().unread || 0) : 0;
      await update(ref(db, `userChats/${partner.code}/${chatId}`), {
        partnerCode: me.code, partnerNickname: me.nickname,
        lastMessage: 'スタンプ', lastTimestamp: ts, unread: prev + 1
      });
    }
  }

  fetch('stamps/stamps.json')
    .then(r => r.json())
    .then(files => {
      const grid = document.getElementById('stamp-grid');
      files.forEach(file => {
        const img = document.createElement('img');
        img.className = 'stamp-item';
        img.src = `stamps/${file}`;
        img.title = file.replace(/\.[^.]+$/, '');
        img.addEventListener('click', () => sendStamp(file));
        grid.appendChild(img);
      });
    })
    .catch(() => {});

  document.getElementById('accept-gcall-btn').addEventListener('click', async () => {
    const el = document.getElementById('incoming-group-call');
    const gc = el.dataset.groupCode;
    const ct = el.dataset.callType || 'voice';
    el.classList.add('hidden');
    if (gc) await joinGroupCall(gc, ct);
  });

  document.getElementById('reject-gcall-btn').addEventListener('click', async () => {
    const el = document.getElementById('incoming-group-call');
    const gc = el.dataset.groupCode;
    el.classList.add('hidden');
    if (gc) await remove(ref(db, `userGroupCallNotifs/${me.code}/${gc}`)).catch(() => {});
  });

  document.getElementById('gcall-end-btn').addEventListener('click', () => leaveGroupCall());

  document.getElementById('gcall-mic-btn').addEventListener('click', () => {
    if (!groupCallLocalStream) return;
    groupCallMicMuted = !groupCallMicMuted;
    groupCallLocalStream.getAudioTracks().forEach(t => t.enabled = !groupCallMicMuted);
    const btn = document.getElementById('gcall-mic-btn');
    btn.classList.toggle('muted', groupCallMicMuted);
    btn.textContent = groupCallMicMuted ? '\uD83D\uDD07' : '\uD83C\uDFA4';
  });

  document.getElementById('gcall-cam-btn').addEventListener('click', () => {
    if (!groupCallLocalStream) return;
    groupCallCamMuted = !groupCallCamMuted;
    groupCallLocalStream.getVideoTracks().forEach(t => t.enabled = !groupCallCamMuted);
    const btn = document.getElementById('gcall-cam-btn');
    btn.classList.toggle('muted', groupCallCamMuted);
    btn.textContent = groupCallCamMuted ? '\uD83D\uDEAB' : '\uD83D\uDCF7';
  });

  document.getElementById('gcall-screen-btn').addEventListener('click', async () => {
    if (!groupCallLocalStream) return;
    const btn = document.getElementById('gcall-screen-btn');
    if (groupCallScreenStream) {
      groupCallScreenStream.getTracks().forEach(t => t.stop());
      groupCallScreenStream = null;
      stopGcallComposite();
      const camTrack = groupCallLocalStream.getVideoTracks()[0];
      if (camTrack) {
        Object.values(groupCallPeers).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(camTrack).catch(() => {});
        });
      }
      const localTile = document.querySelector('#gcall-tile-local video');
      if (localTile) localTile.srcObject = groupCallLocalStream;
      btn.classList.remove('active');
      btn.textContent = '\uD83D\uDDA5\uFE0F';
    } else {
      try {
        const s = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        groupCallScreenStream = s;
        const compositeStream = startGcallComposite(s);
        const compositeTrack = compositeStream.getVideoTracks()[0];
        Object.values(groupCallPeers).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(compositeTrack).catch(() => {});
        });
        const localTile = document.querySelector('#gcall-tile-local video');
        if (localTile) localTile.srcObject = compositeStream;
        btn.classList.add('active');
        btn.textContent = '\uD83D\uDED1';
        s.getVideoTracks()[0].addEventListener('ended', () => {
          if (!groupCallScreenStream) return;
          groupCallScreenStream = null;
          stopGcallComposite();
          const cam = groupCallLocalStream?.getVideoTracks()[0];
          if (cam) {
            Object.values(groupCallPeers).forEach(pc => {
              const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
              if (sender) sender.replaceTrack(cam).catch(() => {});
            });
          }
          const tile = document.querySelector('#gcall-tile-local video');
          if (tile) tile.srcObject = groupCallLocalStream;
          btn.classList.remove('active');
          btn.textContent = '\uD83D\uDDA5\uFE0F';
        });
      } catch { /* \u30E6\u30FC\u30B6\u30FC\u304C\u30AD\u30E3\u30F3\u30BB\u30EB */ }
    }
  });

  document.getElementById('group-settings-btn').addEventListener('click', () => {
    const btn = document.getElementById('group-settings-btn');
    openGroupSettingsModal(btn.dataset.groupCode, btn.dataset.groupName, btn.dataset.adminCode);
  });
  document.getElementById('group-settings-close').addEventListener('click', () => {
    document.getElementById('group-settings-modal').classList.add('hidden');
  });

  // ============================================================
  // ☁E�E☁EElectron チE��クトップ通知ブリチE�� ☁E�E☁E  // ============================================================
  if (window.electronBridge) {
    // DM 新着メチE��ージ
    window.addEventListener('ms:newmessage', e => {
      window.electronBridge.notify(
        e.detail.from || 'VS Message',
        e.detail.text || '新しいメッセージ'
      );
    });
    // グループ新着メチE��ージ
    window.addEventListener('ms:newgroupmessage', e => {
      window.electronBridge.notify(
        e.detail.groupName || 'グループ',
        e.detail.text || '新しいメッセージ'
      );
    });
    // 着信
    window.addEventListener('ms:incomingcall', e => {
      const type = e.detail.callType === 'video' ? 'ビデオ' : '音声';
      window.electronBridge.notify('📞 着信', `${e.detail.from} から${type}通話`);
    });
  }

