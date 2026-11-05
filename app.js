(function () {
  'use strict';

  const STORAGE_KEY = 'taichou-memo-v1';

  const els = {
    date: document.getElementById('date'),
    temp: document.getElementById('temp'),
    medTaken: document.getElementById('medTaken'),
    medName: document.getElementById('medName'),
    weight: document.getElementById('weight'),
    bpSys: document.getElementById('bpSys'),
    bpDia: document.getElementById('bpDia'),
    saveBtn: document.getElementById('saveBtn'),
    saveHint: document.getElementById('saveHint'),
    recordList: document.getElementById('recordList'),
    emptyState: document.getElementById('emptyState'),
    toast: document.getElementById('toast'),
    tabs: Array.from(document.querySelectorAll('.tab')),
    panelInput: document.getElementById('panel-input'),
    panelList: document.getElementById('panel-list'),
  };

  function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function loadAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const data = JSON.parse(raw);
      return data && typeof data === 'object' ? data : {};
    } catch (e) {
      return {};
    }
  }

  function saveAll(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function latestRecord(data) {
    const keys = Object.keys(data).sort();
    if (!keys.length) return null;
    return data[keys[keys.length - 1]];
  }

  function emptyForm() {
    return {
      temp: '',
      medTaken: false,
      medName: '',
      weight: '',
      bpSys: '',
      bpDia: '',
    };
  }

  function fillForm(rec) {
    const r = rec || emptyForm();
    els.temp.value = r.temp != null && r.temp !== '' ? r.temp : '';
    els.medTaken.checked = !!r.medTaken;
    els.medName.value = r.medName || '';
    els.weight.value = r.weight != null && r.weight !== '' ? r.weight : '';
    els.bpSys.value = r.bpSys != null && r.bpSys !== '' ? r.bpSys : '';
    els.bpDia.value = r.bpDia != null && r.bpDia !== '' ? r.bpDia : '';
  }

  function readForm() {
    return {
      temp: els.temp.value === '' ? '' : Number(els.temp.value),
      medTaken: els.medTaken.checked,
      medName: els.medName.value.trim(),
      weight: els.weight.value === '' ? '' : Number(els.weight.value),
      bpSys: els.bpSys.value === '' ? '' : Number(els.bpSys.value),
      bpDia: els.bpDia.value === '' ? '' : Number(els.bpDia.value),
      updatedAt: new Date().toISOString(),
    };
  }

  function formatDateJP(iso) {
    const parts = iso.split('-');
    if (parts.length !== 3) return iso;
    return parts[0] + '年' + Number(parts[1]) + '月' + Number(parts[2]) + '日';
  }

  function summarize(rec) {
    const bits = [];
    if (rec.temp !== '' && rec.temp != null) bits.push('体温 ' + rec.temp + '℃');
    if (rec.medTaken) {
      bits.push(rec.medName ? '薬：飲んだ（' + rec.medName + '）' : '薬：飲んだ');
    } else if (rec.medName) {
      bits.push('薬：' + rec.medName + '（未服用）');
    } else {
      bits.push('薬：—');
    }
    if (rec.weight !== '' && rec.weight != null) bits.push('体重 ' + rec.weight + 'kg');
    if ((rec.bpSys !== '' && rec.bpSys != null) || (rec.bpDia !== '' && rec.bpDia != null)) {
      bits.push('血圧 ' + (rec.bpSys === '' || rec.bpSys == null ? '—' : rec.bpSys) + '/' + (rec.bpDia === '' || rec.bpDia == null ? '—' : rec.bpDia));
    }
    return bits.join(' ／ ');
  }

  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      els.toast.hidden = true;
    }, 1800);
  }

  function switchTab(name) {
    els.tabs.forEach(function (tab) {
      const on = tab.dataset.tab === name;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    const inputOn = name === 'input';
    els.panelInput.classList.toggle('is-active', inputOn);
    els.panelList.classList.toggle('is-active', !inputOn);
    els.panelInput.hidden = !inputOn;
    els.panelList.hidden = inputOn;
    if (!inputOn) renderList();
  }

  function renderList() {
    const data = loadAll();
    const keys = Object.keys(data).sort().reverse();
    els.recordList.innerHTML = '';
    els.emptyState.hidden = keys.length > 0;
    keys.forEach(function (date) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'record-item';
      btn.innerHTML = '<div class="record-date">' + formatDateJP(date) + '</div><div class="record-summary">' + summarize(data[date]) + '</div>';
      btn.addEventListener('click', function () {
        els.date.value = date;
        fillForm(data[date]);
        switchTab('input');
        showToast(formatDateJP(date) + ' を開きました');
      });
      li.appendChild(btn);
      els.recordList.appendChild(li);
    });
  }

  function loadForSelectedDate() {
    const data = loadAll();
    const date = els.date.value || todayISO();
    els.date.value = date;
    if (data[date]) {
      fillForm(data[date]);
      els.saveHint.hidden = false;
      els.saveHint.textContent = 'この日の記録があります。保存すると上書きされます。';
    } else {
      const latest = latestRecord(data);
      fillForm(latest || emptyForm());
      els.saveHint.hidden = true;
    }
  }

  function onSave() {
    const date = els.date.value || todayISO();
    els.date.value = date;
    const data = loadAll();
    data[date] = readForm();
    saveAll(data);
    els.saveHint.hidden = false;
    els.saveHint.textContent = '保存しました（同じ日に再度保存すると上書きされます）。';
    showToast('保存しました');
  }

  function init() {
    els.date.value = todayISO();
    loadForSelectedDate();

    els.tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        switchTab(tab.dataset.tab);
      });
    });
    els.date.addEventListener('change', loadForSelectedDate);
    els.saveBtn.addEventListener('click', onSave);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(function () {});
    }
  }

  init();
})();
