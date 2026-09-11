(() => {
  const root = document.getElementById('gcf-root');
  const view = root.querySelector('#gcf-view');
  const title = root.querySelector('#gcf-title');
  const subtitle = root.querySelector('#gcf-subtitle');
  const leading = root.querySelector('#gcf-leading');
  const more = root.querySelector('#gcf-more');
  const composer = root.querySelector('#gcf-composer-wrap');
  const input = root.querySelector('#gcf-input');
  const send = root.querySelector('#gcf-send');
  const attach = root.querySelector('#gcf-attach');
  const overlay = root.querySelector('#gcf-overlay');
  const sheet = root.querySelector('#gcf-sheet');
  const toast = root.querySelector('#gcf-toast');
  const toastCopy = root.querySelector('#gcf-toast-copy');
  let toastTimer;
  let timers = [];
  let previousFocus = null;
  let detailPage = 0;
  let actionAdded = false;
  let actionSettings = { start: 'Today', duration: '4 days', includeCurrentCare: true };
  const contextState = { evidence: true, plan: true, care: true, records: true };
  let currentQuestion = '';

  const design = { radius: 24, density: 'airy', animateSynthesis: true, scenario: 'pattern' };

  const scenarios = {
    pattern: {
      kicker: 'New evidence to understand',
      homeTitle: 'Soft stool. Still straining.',
      homeCopy: 'Your recent entries show softer stool with continued straining. What might that tell us?',
      question: 'My stool is softer, but I still need to strain. What does that tell us?',
      lenses: [
        { short: 'GI', name: 'Gastroenterology', icon: 'stethoscope', reason: 'The symptom response and its clinical limits', copy: 'Your records show that stool consistency changed while straining continued. Gastroenterology can interpret that response with your history and examination, then decide whether any assessment is appropriate.' },
        { short: 'PF', name: 'Pelvic floor', icon: 'activity', reason: 'Difficulty emptying soft stool', copy: 'Soft stool with continued straining can occur when the muscles used for emptying do not coordinate as expected. This pattern alone cannot show that is happening. A clinician can decide whether an assessment is appropriate.' },
        { short: 'NT', name: 'Nutrition', icon: 'apple', reason: 'What more stool softening may and may not change', copy: 'Because the stool is already soft, simply adding more stool-softening foods or supplements may not address the recorded difficulty. Any change should fit your current care and tolerance.' }
      ],
      answer: '<strong>Softening the stool helped one part of the problem. It did not remove the straining.</strong> You strained on four of five soft stool days, so stool consistency may not be the whole picture. This still does not tell us why.',
      origin: '3 perspectives + your recent evidence',
      next: 'Track straining and incomplete emptying for four more days.',
      nextWhy: 'This can show whether the pattern repeats while stool remains soft.',
      action: 'Review and add'
    },
    insufficient: {
      kicker: 'A question needs more evidence',
      homeTitle: 'Why does bloating change so much?',
      homeCopy: 'There are only two recent entries. GI Copilot can explain what is known and ask for the smallest useful evidence.',
      question: 'Why does my bloating change so much from day to day?',
      lenses: [
        { short: 'GI', name: 'Gastroenterology', icon: 'stethoscope', reason: 'Which symptom details could change the interpretation', copy: 'Timing around bowel movements and other symptoms could matter. Two entries cannot show a reliable pattern or explain why the bloating changes.' },
        { short: 'NT', name: 'Nutrition', icon: 'apple', reason: 'Whether the changes cluster around meals', copy: 'Meal timing, portion size, or particular foods may be relevant, but the current entries do not contain enough timing to tell whether any of those patterns apply.' },
        { short: 'GP', name: 'GI psychology', icon: 'brain', reason: 'Whether symptoms move with stress or context', copy: 'Stress can affect digestive symptoms for some people, but two entries cannot show whether that relationship applies to you. Recording timing is more useful than assuming it does.' }
      ],
      answer: '<strong>I do not know yet.</strong> Two entries are not enough to tell whether the bloating follows meals, bowel movements, stress, or something else. A small evidence window would be more useful than guessing.',
      origin: '3 perspectives + 2 recent entries',
      next: 'Record bloating timing and intensity for four days.',
      nextWhy: 'This may show whether it clusters around meals, bowel movements, or time of day.',
      action: 'Review and add'
    },
    visit: {
      kicker: 'GI visit in 6 days',
      homeTitle: 'Carry the useful parts with you.',
      homeCopy: 'Bring together what you tried, what changed, and what still needs an answer.',
      question: 'Help me prepare for my upcoming gastroenterology visit.',
      lenses: [
        { short: 'GI', name: 'Gastroenterology', icon: 'stethoscope', reason: 'The unresolved clinical question', copy: 'Lead with the persistent straining despite softer stool, then show what changed after each thing you tried. Your clinician can decide whether an examination, test, referral, or treatment discussion is appropriate.' },
        { short: 'CC', name: 'Clinical care', icon: 'clipboard-list', reason: 'Making the visit history usable', copy: 'A short chronology of what changed, what did not, and what remains uncertain is more useful in the visit than replaying every daily entry.' },
        { short: 'RX', name: 'Pharmacy', icon: 'pill', reason: 'Medication details that affect the visit', copy: 'Bring the exact medication names, doses, timing, response, and side effects. The brief organizes them without suggesting that you stop or change treatment on your own.' }
      ],
      answer: '<strong>The useful story is that stool consistency improved while straining and incomplete emptying continued.</strong> Bring that pattern together with what you tried, your current medications, and the questions that remain unresolved.',
      origin: '3 perspectives + your care history',
      next: 'Build a one page brief for your GI visit.',
      nextWhy: 'Keep the response pattern, current care, and two important questions at the top.',
      action: 'Review brief'
    },
    safety: {
      kicker: 'Safety comes first',
      homeTitle: 'I noticed blood today.',
      homeCopy: 'This example shows how Chat pauses before giving a normal answer.',
      question: 'I noticed blood when I tried to have a bowel movement today.'
    }
  };

  const detailPages = [
    { icon: 'chart-no-axes-column-increasing', title: 'What your evidence shows', copy: 'The answer used the recent 14-day window because it contains the relevant stool consistency and straining entries.', type: 'evidence' },
    { icon: 'users', title: 'Where the perspectives agree', copy: 'Only perspectives that could change the answer were included.', type: 'agreement' },
    { icon: 'circle-help', title: 'What remains unclear', copy: 'The evidence cannot show why the straining is happening. It does not establish a pelvic floor problem or determine whether a test is needed.', type: 'limits' }
  ];

  const updatedDetailPages = [
    { icon: 'history', title: 'Before the evidence window', copy: 'Straining appeared on four of five days when stool was soft.', type: 'before' },
    { icon: 'calendar-plus', title: 'What the four new days added', copy: 'The same combination appeared on three of four additional days.', type: 'new' },
    { icon: 'sparkles', title: 'What changed in the answer', copy: 'The repeated pattern makes stool hardness a less complete explanation. It still does not establish the cause.', type: 'change' }
  ];

  function icons() {
    if (globalThis.lucide) globalThis.lucide.createIcons({ attrs: { 'stroke-width': 1.5, 'aria-hidden': 'true' } });
  }

  function safe(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  }

  function applyDesign() {
    root.style.setProperty('--gcf-radius', 'var(--gs-radius-feature)');
    root.style.setProperty('--gcf-gap', 'var(--gs-space-5)');
  }

  function selectedContextSummary() {
    const selected = [];
    if (contextState.evidence) selected.push('14 days');
    if (contextState.plan) selected.push('Week 3 Plan');
    if (contextState.care) selected.push('Current care');
    if (contextState.records) selected.push('Visit records');
    return selected.length ? selected.join(' · ') : 'No records selected';
  }

  function answerFor(item) {
    if (!contextState.evidence && design.scenario === 'pattern') {
      return '<strong>I can explain the possibilities, but I cannot interpret whether this is your pattern without your recent entries.</strong> Re-enable evidence for this chat or ask a general question.';
    }
    if (!contextState.evidence && design.scenario === 'insufficient') {
      return '<strong>I do not have personal evidence to compare yet.</strong> I can answer generally, or you can add a short evidence window before asking for a personal synthesis.';
    }
    if (design.scenario === 'visit' && !contextState.evidence) {
      return '<strong>I can organize the visit, but your recent symptom response is not included.</strong> Add it before finalizing the brief if you want the clinician to see what changed.';
    }
    if (design.scenario === 'visit' && !contextState.care) {
      return '<strong>Your symptom story is available, but current medications and treatment are not included.</strong> Add them before finalizing the brief, or continue without them.';
    }
    return item.answer;
  }

  function originFor(item) {
    const used = [];
    if (contextState.evidence) used.push('recent evidence');
    if (contextState.plan) used.push('Plan');
    if (contextState.care) used.push('current care');
    if (contextState.records) used.push('visit records');
    return `${item.lenses.length} perspectives + ${used.length ? used.join(', ') : 'general knowledge only'}`;
  }

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    toastCopy.textContent = message;
    toast.hidden = false;
    icons();
    toastTimer = setTimeout(() => { toast.hidden = true; }, 2100);
  }

  function closeSheet() {
    overlay.hidden = true;
    [...root.querySelector('.gcf-phone').children].forEach((node) => { node.inert = false; });
    sheet.innerHTML = '';
    if (previousFocus && previousFocus.isConnected) previousFocus.focus();
    previousFocus = null;
  }

  function openSheet(markup) {
    if (overlay.hidden) previousFocus = document.activeElement;
    sheet.innerHTML = markup;
    overlay.hidden = false;
    [...root.querySelector('.gcf-phone').children].forEach((node) => { if (node !== overlay && node !== toast) node.inert = true; });
    sheet.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', closeSheet));
    icons();
    const close = sheet.querySelector('[data-close]');
    if (close) close.focus();
  }

  function notifyChrome() {
    document.getElementById('app')?.dispatchEvent(new CustomEvent('gsp:chrome-change'));
  }

  function emitHost(name, detail) {
    root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
  }

  function setHomeChrome() {
    root.dataset.chatView = 'home';
    view.scrollTop = 0;
    title.textContent = 'Chat';
    subtitle.textContent = 'Your GI Copilot';
    composer.hidden = false;
    input.placeholder = 'Ask about your digestive care';
    leading.className = 'gcf-profile';
    leading.textContent = 'BM';
    leading.setAttribute('aria-label', 'Open profile');
    leading.setAttribute('data-gsp-open', 'profile');
    leading.onclick = null;
    more.hidden = false;
    more.innerHTML = '<i data-lucide="bell" aria-hidden="true"></i>';
    more.setAttribute('aria-label', 'Notifications');
    more.setAttribute('data-gsp-open', 'notifications');
    syncComposer();
    notifyChrome();
  }

  function setBackChrome(screenTitle, screenSubtitle, handler) {
    root.dataset.chatView = 'detail';
    view.scrollTop = 0;
    title.textContent = screenTitle;
    subtitle.textContent = screenSubtitle;
    leading.className = 'gcf-round';
    leading.innerHTML = '<i data-lucide="arrow-left" aria-hidden="true"></i>';
    leading.setAttribute('aria-label', 'Back');
    leading.removeAttribute('data-gsp-open');
    leading.onclick = handler;
    more.hidden = false;
    more.innerHTML = '<i data-lucide="sliders-horizontal" aria-hidden="true"></i>';
    more.setAttribute('aria-label', 'Context for this chat');
    more.removeAttribute('data-gsp-open');
    notifyChrome();
  }

  function renderHome() {
    clearTimers();
    actionAdded = false;
    setHomeChrome();
    const item = scenarios[design.scenario];
    const previews = {
      pattern: '<div class="gcf-signal-cell"><strong>5 days</strong><span>Soft stool</span></div><div class="gcf-signal-cell"><strong>4 of 5</strong><span>Still straining</span></div>',
      insufficient: '<div class="gcf-signal-cell"><strong>2 entries</strong><span>Bloating recorded</span></div><div class="gcf-signal-cell"><strong>Not yet</strong><span>A clear pattern</span></div>',
      visit: '<div class="gcf-signal-cell"><strong>6 days</strong><span>Until your GI visit</span></div><div class="gcf-signal-cell"><strong>2 questions</strong><span>Saved for the visit</span></div>',
      safety: '<span class="gcf-signal-notice"><i data-lucide="shield-alert" aria-hidden="true"></i><span>Check whether you need medical attention.</span></span>'
    };
    const preview = contextState.evidence || design.scenario === 'safety'
      ? previews[design.scenario]
      : '<span class="gcf-signal-notice"><i data-lucide="file-minus" aria-hidden="true"></i><span>Recent evidence is not included in this chat.</span></span>';
    view.innerHTML = `
      <main class="gcf-home">
        <button class="gcf-context" id="gcf-context" type="button" aria-haspopup="dialog"><span class="gcf-context-mark"><i data-lucide="layers" aria-hidden="true"></i></span><span class="gcf-context-copy"><span class="gcf-context-title">Context for this chat</span><span class="gcf-context-meta">${safe(selectedContextSummary())}</span></span><i data-lucide="sliders-horizontal" aria-hidden="true"></i></button>
        <article class="gcf-prompt" aria-labelledby="gcf-prompt-title">
          <div class="gcf-prompt-top"><span class="gcf-kicker">${item.kicker}</span><div class="gcf-signal-preview">${preview}</div><h2 id="gcf-prompt-title">${item.homeTitle}</h2><p>${item.homeCopy}</p></div>
          <div class="gcf-prompt-bottom"><button class="gcf-primary" id="gcf-start" type="button">${design.scenario === 'safety' ? 'Check this first' : design.scenario === 'visit' ? 'Prepare for my visit' : 'Help me understand'}<i data-lucide="arrow-right" aria-hidden="true"></i></button></div>
        </article>
        <div class="gcf-home-tools"><button class="gcf-secondary" id="gcf-more-examples" type="button" aria-haspopup="dialog"><i data-lucide="message-circle" aria-hidden="true"></i>Other questions</button><button class="gcf-secondary" id="gcf-open-recent" type="button" aria-haspopup="dialog"><i data-lucide="history" aria-hidden="true"></i>Continue<span class="gcf-count" aria-label="1 question with new evidence">1</span></button></div>
      </main>`;
    view.querySelector('#gcf-context').addEventListener('click', openContext);
    view.querySelector('#gcf-start').addEventListener('click', () => startQuestion(design.scenario));
    view.querySelector('#gcf-more-examples').addEventListener('click', openExamples);
    view.querySelector('#gcf-open-recent').addEventListener('click', openRecent);
    icons();
  }

  function openRecent() {
    openSheet(`<div class="gcf-handle" aria-hidden="true"></div><div class="gcf-sheet-head"><div><h2 id="gcf-sheet-title">Continue a question</h2><p class="gcf-sheet-copy">Your earlier answer, with new evidence.</p></div><button class="gcf-round" data-close type="button" aria-label="Close"><i data-lucide="x" aria-hidden="true"></i></button></div><div class="gcf-sheet-list"><button class="gcf-open-thread" id="gcf-return-thread" type="button"><span class="gcf-thread-mark"><i data-lucide="history" aria-hidden="true"></i></span><span><span class="gcf-thread-title">Continued straining with soft stool</span><span class="gcf-thread-meta">4 new days ready to review</span></span><i data-lucide="chevron-right" aria-hidden="true"></i></button></div>`);
    sheet.querySelector('#gcf-return-thread').addEventListener('click', () => { closeSheet(); renderReturnReview(); });
  }

  function openExamples() {
    const questionChoices = [
      ['pattern', 'activity', 'Soft stool, but still straining', 'Understand a repeated response.'],
      ['insufficient', 'message-circle', 'Why does my bloating change?', 'Work out what evidence is missing.'],
      ['visit', 'clipboard-list', 'Prepare for my GI visit', 'Bring together what changed and what to ask.'],
      ['safety', 'shield-alert', 'I noticed blood today', 'Check what to do next.']
    ];
    const choices = questionChoices.map(([key, icon, label, copy]) => `<button class="gcf-lens-choice" data-scenario="${key}" type="button"><span class="gcf-lens-choice-mark"><i data-lucide="${icon}" aria-hidden="true"></i></span><span><span class="gcf-lens-choice-name">${label}</span><span class="gcf-lens-choice-reason">${copy}</span></span><i data-lucide="chevron-right" aria-hidden="true"></i></button>`).join('');
    openSheet(`<div class="gcf-handle" aria-hidden="true"></div><div class="gcf-sheet-head"><h2 id="gcf-sheet-title">Other questions</h2><button class="gcf-round" data-close type="button" aria-label="Close"><i data-lucide="x" aria-hidden="true"></i></button></div><div class="gcf-sheet-list">${choices}</div>`);
    sheet.querySelectorAll('[data-scenario]').forEach((button) => button.addEventListener('click', () => {
      closeSheet();
      startQuestion(button.dataset.scenario);
    }));
  }

  function startQuestion(key) {
    design.scenario = key;
    const item = scenarios[key];
    currentQuestion = item.question;
    actionAdded = false;
    actionSettings = key === 'visit'
      ? { start: 'Now', duration: 'Before the visit', includeCurrentCare: true }
      : { start: 'Today', duration: '4 days', includeCurrentCare: true };
    if (key === 'safety') renderSafety(item.question);
    else renderGenerating(item);
  }

  function openContext() {
    const refreshItem = view.querySelector('#gcf-origin') ? scenarios[design.scenario] : null;
    openSheet(`
      <div class="gcf-handle" aria-hidden="true"></div><div class="gcf-sheet-head"><div><h2 id="gcf-sheet-title">Context for this chat</h2><p class="gcf-sheet-copy">You decide what GI Copilot can use.</p></div><button class="gcf-round" data-close type="button" aria-label="Close"><i data-lucide="x" aria-hidden="true"></i></button></div>
      <div class="gcf-sheet-list"><label class="gcf-choice"><input data-context="evidence" type="checkbox"${contextState.evidence ? ' checked' : ''}><span class="gcf-choice-copy"><span class="gcf-choice-title">Last 14 days of evidence</span><span class="gcf-choice-meta">Bowel movements, symptoms, food and routines</span></span></label><label class="gcf-choice"><input data-context="plan" type="checkbox"${contextState.plan ? ' checked' : ''}><span class="gcf-choice-copy"><span class="gcf-choice-title">Current six-week Plan</span><span class="gcf-choice-meta">Week 3, milestone 2</span></span></label><label class="gcf-choice"><input data-context="care" type="checkbox"${contextState.care ? ' checked' : ''}><span class="gcf-choice-copy"><span class="gcf-choice-title">Current care</span><span class="gcf-choice-meta">Medications and clinician instructions</span></span></label><label class="gcf-choice"><input data-context="records" type="checkbox"${contextState.records ? ' checked' : ''}><span class="gcf-choice-copy"><span class="gcf-choice-title">Visits and test records</span><span class="gcf-choice-meta">Only when relevant</span></span></label></div>
      <button class="gcf-primary" id="gcf-save-context" type="button">Use selected context</button>`);
    sheet.querySelector('#gcf-save-context').addEventListener('click', () => {
      sheet.querySelectorAll('[data-context]').forEach((checkbox) => { contextState[checkbox.dataset.context] = checkbox.checked; });
      closeSheet();
      if (refreshItem) {
        renderAnswer(refreshItem);
        showToast('Answer updated with your selected context');
        return;
      }
      if (root.dataset.chatView === 'home') renderHome();
      showToast('Chat context updated');
    });
  }

  function renderGenerating(item, next = 'answer') {
    clearTimers();
    setBackChrome('Building your answer', 'GI Copilot', renderHome);
    composer.hidden = true;
    const nodes = item.lenses.map((lens, index) => `<div class="gcf-lens-node" data-node="${index}"><span><i data-lucide="${lens.icon}" aria-hidden="true"></i></span><span>${lens.name}</span></div>`).join('');
    view.innerHTML = `
      <main class="gcf-generating"><div class="gcf-question">${safe(currentQuestion)}</div><section><h1>Bringing the useful parts together</h1><p class="gcf-generating-note">Only perspectives that could change the answer are included.</p></section><div class="gcf-converge"><div class="gcf-lens-row">${nodes}</div><div class="gcf-flow-line" aria-hidden="true"></div><div class="gcf-answer-node"><i data-lucide="sparkles" aria-hidden="true"></i>One answer</div><div class="gcf-stage" id="gcf-stage">Checking for urgent concerns</div><div class="gcf-progress"><div class="gcf-progress-fill" id="gcf-progress"></div></div></div></main>`;
    icons();
    const finish = () => next === 'updated' ? renderUpdatedAnswer() : renderAnswer(item);
    if (!design.animateSynthesis || matchMedia('(prefers-reduced-motion: reduce)').matches) { timers.push(setTimeout(finish, 300)); return; }
    const stages = [
      { at: 320, node: 0, label: 'Reading the relevant personal context', width: '35%' },
      { at: 700, node: 1, label: 'Selecting perspectives that add something', width: '59%' },
      { at: 1080, node: 2, label: 'Checking agreement, differences, and limits', width: '83%' },
      { at: 1460, node: 2, label: 'Preparing one useful next step', width: '100%' }
    ];
    stages.forEach((stage) => timers.push(setTimeout(() => {
      const node = view.querySelector(`[data-node="${stage.node}"]`);
      const stageCopy = view.querySelector('#gcf-stage');
      const progress = view.querySelector('#gcf-progress');
      if (node) node.classList.add('is-on');
      if (stageCopy) stageCopy.textContent = stage.label;
      if (progress) progress.style.width = stage.width;
    }, stage.at)));
    timers.push(setTimeout(finish, 1810));
  }

  function renderAnswer(item) {
    clearTimers();
    setBackChrome('Chat', 'Your GI Copilot', renderHome);
    root.dataset.chatView = 'answer';
    composer.hidden = false;
    input.placeholder = 'Ask a follow-up';
    syncComposer();
    const answerCopy = answerFor(item);
    const originCopy = originFor(item);
    const action = actionAdded
      ? `<div class="gcf-receipt"><span><i data-lucide="check-circle-2" aria-hidden="true"></i>${design.scenario === 'visit' ? 'Visit brief added to Care' : `Added to Track for ${actionSettings.duration.toLowerCase()}`}</span><span><button id="gcf-view-destination" type="button">View</button><button id="gcf-undo" type="button">Undo</button></span></div>`
      : `<section class="gcf-next"><div class="gcf-next-label">Next step</div><h2>${item.next}</h2><p>${item.nextWhy}</p><div class="gcf-action-row"><button class="gcf-primary" id="gcf-review-action" type="button">${item.action}<i data-lucide="arrow-right" aria-hidden="true"></i></button></div></section>`;
    view.innerHTML = `<main class="gcf-thread"><div class="gcf-question"><span class="gcf-question-label">You asked</span>${safe(currentQuestion)}</div><article class="gcf-answer-card"><section class="gcf-response"><div class="gcf-author"><span class="gcf-author-mark"><i data-lucide="message-circle" aria-hidden="true"></i></span><span class="gcf-author-name">GI Copilot</span></div><p class="gcf-answer">${answerCopy}</p></section><button class="gcf-origin" id="gcf-origin" type="button"><span class="gcf-origin-left"><i data-lucide="layers" aria-hidden="true"></i><span class="gcf-origin-copy"><span class="gcf-origin-title">Evidence &amp; perspectives</span><span class="gcf-origin-meta">${originCopy}</span></span></span><i data-lucide="chevron-right" aria-hidden="true"></i></button>${action}</article></main>`;
    view.querySelector('#gcf-origin').addEventListener('click', () => { detailPage = 0; renderDetail(item, () => renderAnswer(item)); });
    const review = view.querySelector('#gcf-review-action');
    if (review) review.addEventListener('click', () => openActionReview(item));
    const undo = view.querySelector('#gcf-undo');
    const destination = view.querySelector('#gcf-view-destination');
    if (undo) undo.addEventListener('click', () => { actionAdded = false; renderAnswer(item); showToast('Action removed'); });
    if (destination) destination.addEventListener('click', () => {
      const isVisit = design.scenario === 'visit';
      emitHost('gutsphere:chat-route-request', { screen: isVisit ? 'care' : 'track', careTarget: isVisit ? 'visit' : null, source: 'approved-chat-action' });
      emitHost('gsp:route-request', { screen: isVisit ? 'care' : 'track', careTarget: isVisit ? 'visit' : null });
    });
    icons();
  }

  function openDestinationPreview() {
    const isVisit = design.scenario === 'visit';
    const rows = isVisit
      ? `<div class="gcf-summary-row"><span class="gcf-summary-label">Care</span><span>GI visit preparation</span></div><div class="gcf-summary-row"><span class="gcf-summary-label">Ready</span><span>Before the visit in 6 days</span></div><div class="gcf-summary-row"><span class="gcf-summary-label">Includes</span><span>Symptom response, things tried, ${actionSettings.includeCurrentCare ? 'current care, ' : ''}and saved questions</span></div>`
      : `<div class="gcf-summary-row"><span class="gcf-summary-label">Track</span><span>${design.scenario === 'insufficient' ? 'Bloating timing and intensity' : 'Straining and incomplete emptying'}</span></div><div class="gcf-summary-row"><span class="gcf-summary-label">Start</span><span>${actionSettings.start}</span></div><div class="gcf-summary-row"><span class="gcf-summary-label">Review</span><span>After ${actionSettings.duration.toLowerCase()}</span></div>`;
    openSheet(`<div class="gcf-handle" aria-hidden="true"></div><div class="gcf-sheet-head"><div><h2 id="gcf-sheet-title">${isVisit ? 'Visit brief in Care' : 'Evidence window in Track'}</h2><p class="gcf-sheet-copy">The approved action now has a clear destination.</p></div><button class="gcf-round" data-close type="button" aria-label="Close"><i data-lucide="x" aria-hidden="true"></i></button></div><div class="gcf-sheet-list">${rows}</div><button class="gcf-primary" data-close type="button">Back to chat</button>`);
  }

  function renderDetail(item, returnHandler = () => renderAnswer(item), mode = 'standard') {
    const pages = mode === 'updated' ? updatedDetailPages : detailPages;
    const page = pages[detailPage];
    setBackChrome(mode === 'updated' ? 'What changed' : 'Inside this answer', `${detailPage + 1} of ${pages.length}`, returnHandler);
    composer.hidden = true;
    more.hidden = true;
    const dots = pages.map((_, index) => `<span class="${index === detailPage ? 'is-on' : ''}"></span>`).join('');
    let extra = '';
    let pageCopy = page.copy;
    if (mode === 'updated' && page.type === 'before') {
      extra = `<div class="gcf-evidence-list"><div class="gcf-evidence-row"><span><span class="gcf-evidence-name">Soft stool days</span><span class="gcf-evidence-meta">Initial 14-day window</span></span><span class="gcf-evidence-value">5</span></div><div class="gcf-evidence-row"><span><span class="gcf-evidence-name">Also included straining</span><span class="gcf-evidence-meta">Same bowel movements</span></span><span class="gcf-evidence-value">4 of 5</span></div></div>`;
    }
    if (mode === 'updated' && page.type === 'new') {
      extra = `<div class="gcf-evidence-list"><div class="gcf-evidence-row"><span><span class="gcf-evidence-name">New soft stool days</span><span class="gcf-evidence-meta">Four-day evidence window</span></span><span class="gcf-evidence-value">4</span></div><div class="gcf-evidence-row"><span><span class="gcf-evidence-name">Also included straining</span><span class="gcf-evidence-meta">New observations</span></span><span class="gcf-evidence-value">3 of 4</span></div></div>`;
    }
    if (mode === 'updated' && page.type === 'change') {
      extra = `<p class="gcf-agreement">The confidence in a repeated response pattern increased. The app still stops before claiming why it happened.</p>`;
    }
    if (mode === 'standard' && page.type === 'evidence') {
      if (!contextState.evidence) {
        pageCopy = 'You excluded recent personal evidence from this chat, so the answer does not interpret a personal pattern.';
        extra = `<div class="gcf-evidence-list"><div class="gcf-evidence-row"><span><span class="gcf-evidence-name">Personal evidence excluded</span><span class="gcf-evidence-meta">${selectedContextSummary()}</span></span><span class="gcf-evidence-value">By you</span></div></div>`;
      } else {
        if (design.scenario === 'insufficient') pageCopy = 'Only two recent entries were available. The missing timing is why the answer stops short of an explanation.';
        if (design.scenario === 'visit') pageCopy = 'The brief uses the parts of your record that can make the clinical conversation more useful.';
        extra = design.scenario === 'insufficient'
          ? `<div class="gcf-evidence-list"><div class="gcf-evidence-row"><span><span class="gcf-evidence-name">Bloating entries</span><span class="gcf-evidence-meta">Last 14 days</span></span><span class="gcf-evidence-value">2</span></div><div class="gcf-evidence-row"><span><span class="gcf-evidence-name">Timing recorded</span><span class="gcf-evidence-meta">Meal or bowel movement</span></span><span class="gcf-evidence-value">Missing</span></div></div>`
          : design.scenario === 'visit'
            ? `<div class="gcf-evidence-list"><div class="gcf-evidence-row"><span><span class="gcf-evidence-name">Symptom summary</span><span class="gcf-evidence-meta">Last 14 days</span></span><span class="gcf-evidence-value">Ready</span></div><div class="gcf-evidence-row"><span><span class="gcf-evidence-name">Things tried</span><span class="gcf-evidence-meta">Current and past Plans</span></span><span class="gcf-evidence-value">6</span></div><div class="gcf-evidence-row"><span><span class="gcf-evidence-name">Current medications</span><span class="gcf-evidence-meta">Care record</span></span><span class="gcf-evidence-value">3</span></div></div><button class="gcf-quiet gcf-detail-action" id="gcf-see-all-evidence" type="button">See all 4</button>`
            : `<div class="gcf-evidence-list"><div class="gcf-evidence-row"><span><span class="gcf-evidence-name">Soft stool</span><span class="gcf-evidence-meta">Last 14 days</span></span><span class="gcf-evidence-value">5 days</span></div><div class="gcf-evidence-row"><span><span class="gcf-evidence-name">Straining with soft stool</span><span class="gcf-evidence-meta">Same bowel movements</span></span><span class="gcf-evidence-value">4 of 5</span></div><div class="gcf-evidence-row"><span><span class="gcf-evidence-name">Incomplete emptying</span><span class="gcf-evidence-meta">Same period</span></span><span class="gcf-evidence-value">3 days</span></div></div>`;
      }
    }
    if (mode === 'standard' && page.type === 'agreement') {
      const symbols = item.lenses.map((lens) => `<span>${lens.short}</span>`).join('');
      const agreement = design.scenario === 'insufficient' ? 'There is not enough evidence to prefer one explanation yet.' : design.scenario === 'visit' ? 'The visit needs the response pattern and unresolved questions, not every daily entry.' : 'Stool softness improved. It does not fully explain the continued straining.';
      extra = `<div class="gcf-perspective-symbols" aria-label="Perspectives considered">${symbols}</div><p class="gcf-agreement">${agreement}</p><button class="gcf-secondary gcf-detail-action" id="gcf-explore-lens" type="button">Explore one perspective</button>`;
    }
    if (mode === 'standard' && page.type === 'limits') {
      if (design.scenario === 'insufficient') pageCopy = 'The current evidence cannot distinguish between meal timing, bowel patterns, stress, or another contributor. The honest answer is still “I do not know yet.”';
      if (design.scenario === 'visit') pageCopy = 'GI Copilot can organize the visit, but it cannot decide which test, referral, or treatment is appropriate.';
      extra = `<button class="gcf-secondary gcf-detail-action" id="gcf-open-sources" type="button"><i data-lucide="book-open" aria-hidden="true"></i>Sources and limits</button>`;
    }
    view.innerHTML = `<main class="gcf-detail"><div class="gcf-detail-top"><span class="gcf-step-count">${detailPage + 1} of ${pages.length}</span><span class="gcf-progress-dots" aria-hidden="true">${dots}</span></div><section class="gcf-detail-body"><span class="gcf-detail-icon"><i data-lucide="${page.icon}" aria-hidden="true"></i></span><h1>${page.title}</h1><p class="gcf-detail-copy">${pageCopy}</p>${extra}</section><div class="gcf-detail-nav"><button class="gcf-quiet" id="gcf-detail-back" type="button">${detailPage === 0 ? 'Answer' : 'Back'}</button><button class="gcf-primary" id="gcf-detail-next" type="button">${detailPage === pages.length - 1 ? 'Done' : 'Next'} <i data-lucide="arrow-right" aria-hidden="true"></i></button></div></main>`;
    view.querySelector('#gcf-detail-back').addEventListener('click', () => { if (detailPage === 0) returnHandler(); else { detailPage -= 1; renderDetail(item, returnHandler, mode); } });
    view.querySelector('#gcf-detail-next').addEventListener('click', () => { if (detailPage === pages.length - 1) returnHandler(); else { detailPage += 1; renderDetail(item, returnHandler, mode); } });
    const explore = view.querySelector('#gcf-explore-lens');
    const sources = view.querySelector('#gcf-open-sources');
    const seeAll = view.querySelector('#gcf-see-all-evidence');
    if (explore) explore.addEventListener('click', () => openLensPicker(item, returnHandler));
    if (sources) sources.addEventListener('click', () => openSources(item));
    if (seeAll) seeAll.addEventListener('click', openVisitEvidence);
    icons();
  }

  function openVisitEvidence() {
    openSheet(`<div class="gcf-handle" aria-hidden="true"></div><div class="gcf-sheet-head"><div><h2 id="gcf-sheet-title">Visit brief inputs</h2><p class="gcf-sheet-copy">Four useful groups, not every daily entry.</p></div><button class="gcf-round" data-close type="button" aria-label="Close"><i data-lucide="x" aria-hidden="true"></i></button></div><div class="gcf-sheet-list"><div class="gcf-summary-row"><span class="gcf-summary-label">Symptoms</span><span>Last 14-day summary</span></div><div class="gcf-summary-row"><span class="gcf-summary-label">Tried</span><span>6 current and past Plan actions</span></div><div class="gcf-summary-row"><span class="gcf-summary-label">Care</span><span>3 current medications</span></div><div class="gcf-summary-row"><span class="gcf-summary-label">Questions</span><span>2 saved for this visit</span></div></div>`);
  }

  function openLensPicker(item, returnHandler) {
    const choices = item.lenses.map((lens, index) => `<button class="gcf-lens-choice" data-lens="${index}" type="button"><span class="gcf-lens-choice-mark"><i data-lucide="${lens.icon}" aria-hidden="true"></i></span><span><span class="gcf-lens-choice-name">${lens.name}</span><span class="gcf-lens-choice-reason">${lens.reason}</span></span><i data-lucide="chevron-right" aria-hidden="true"></i></button>`).join('');
    openSheet(`<div class="gcf-handle" aria-hidden="true"></div><div class="gcf-sheet-head"><div><h2 id="gcf-sheet-title">Individual perspectives</h2><p class="gcf-sheet-copy">Each stays inside the same answer.</p></div><button class="gcf-round" data-close type="button" aria-label="Close"><i data-lucide="x" aria-hidden="true"></i></button></div><div class="gcf-sheet-list">${choices}</div>`);
    sheet.querySelectorAll('[data-lens]').forEach((button) => button.addEventListener('click', () => {
      const lens = item.lenses[Number(button.dataset.lens)];
      closeSheet();
      renderLens(item, lens, returnHandler);
    }));
  }

  function renderLens(item, lens, returnHandler) {
    setBackChrome(`${lens.name} perspective`, 'Inside the same answer', () => renderDetail(item, returnHandler));
    composer.hidden = true;
    more.hidden = true;
    view.innerHTML = `<main class="gcf-lens"><span class="gcf-lens-label">Selected because it could change the answer</span><h1>${lens.name} perspective</h1><p class="gcf-lens-copy">${lens.copy}</p><div class="gcf-lens-limit"><strong>What this cannot establish:</strong> This perspective cannot diagnose the cause or decide whether a test or treatment is needed.</div><button class="gcf-primary" id="gcf-back-synthesis" type="button">Back to the synthesis</button></main>`;
    view.querySelector('#gcf-back-synthesis').addEventListener('click', () => renderDetail(item, returnHandler));
    icons();
  }

  function openSources(item) {
    const personal = !contextState.evidence
      ? 'Recent personal evidence excluded by you'
      : design.scenario === 'visit'
      ? selectedContextSummary()
      : design.scenario === 'insufficient'
        ? 'Two bloating entries · last 14 days'
        : 'Bowel movement entries · last 14 days';
    openSheet(`<div class="gcf-handle" aria-hidden="true"></div><div class="gcf-sheet-head"><div><h2 id="gcf-sheet-title">Sources and limits</h2><p class="gcf-sheet-copy">Personal evidence and clinical knowledge stay separate.</p></div><button class="gcf-round" data-close type="button" aria-label="Close"><i data-lucide="x" aria-hidden="true"></i></button></div><div class="gcf-sheet-list"><div class="gcf-summary-row"><span class="gcf-summary-label">Personal</span><span>${personal}</span></div><a class="gcf-source-link" href="https://doi.org/10.1053/j.gastro.2023.03.214" target="_blank" rel="noreferrer"><span><span class="gcf-source-title">AGA–ACG guideline: pharmacological management of chronic idiopathic constipation</span><span class="gcf-source-meta">2023 · Clinical practice guideline</span></span><i data-lucide="external-link" aria-hidden="true"></i></a><a class="gcf-source-link" href="https://www.cghjournal.org/article/S1542-3565%2825%2900856-0/fulltext" target="_blank" rel="noreferrer"><span><span class="gcf-source-title">AGA update: evaluation and management of refractory constipation</span><span class="gcf-source-meta">2026 · Expert review · Escalation scope</span></span><i data-lucide="external-link" aria-hidden="true"></i></a><div class="gcf-summary-row"><span class="gcf-summary-label">Limit</span><span>Cannot diagnose or decide whether a test or treatment is needed</span></div></div>`);
  }

  function openActionReview(item) {
    const isVisit = design.scenario === 'visit';
    const evidence = isVisit
      ? `Symptoms, things tried, ${actionSettings.includeCurrentCare ? 'current care, and ' : ''}saved questions`
      : design.scenario === 'insufficient' ? 'Bloating timing and intensity' : 'Straining and incomplete emptying';
    const timing = isVisit
      ? `${actionSettings.start}; ready before the visit in 6 days`
      : `${actionSettings.start}; ${design.scenario === 'insufficient' ? 'when bloating occurs' : 'after a bowel movement'}, for ${actionSettings.duration.toLowerCase()}`;
    const reason = isVisit ? 'Carry the useful evidence into the clinical visit' : item.nextWhy;
    openSheet(`<div class="gcf-handle" aria-hidden="true"></div><div class="gcf-sheet-head"><div><h2 id="gcf-sheet-title">Review before adding</h2><p class="gcf-sheet-copy">Nothing changes until you confirm.</p></div><button class="gcf-round" data-close type="button" aria-label="Close"><i data-lucide="x" aria-hidden="true"></i></button></div><div class="gcf-sheet-list"><div class="gcf-summary-row"><span class="gcf-summary-label">Add to</span><span>${isVisit ? 'Care · Visit preparation' : 'Track'}</span></div><div class="gcf-summary-row"><span class="gcf-summary-label">Include</span><span>${evidence}</span></div><div class="gcf-summary-row"><span class="gcf-summary-label">When</span><span>${timing}</span></div><div class="gcf-summary-row"><span class="gcf-summary-label">Why</span><span>${reason}</span></div></div><div class="gcf-sheet-actions"><button class="gcf-secondary" id="gcf-edit-action" type="button">Edit</button><button class="gcf-primary" id="gcf-confirm-action" type="button">Confirm</button></div>`);
    sheet.querySelector('#gcf-edit-action').addEventListener('click', () => openActionEdit(item));
    sheet.querySelector('#gcf-confirm-action').addEventListener('click', () => {
      actionAdded = true;
      closeSheet();
      renderAnswer(item);
      emitHost('gutsphere:chat-action-confirmed', { destination: isVisit ? 'care' : 'track', careTarget: isVisit ? 'visit-preparation' : null });
      showToast(isVisit ? 'Visit brief added to Care' : 'Added to Track');
    });
  }

  function openActionEdit(item) {
    const isVisit = design.scenario === 'visit';
    const startOptions = isVisit
      ? `<option${actionSettings.start === 'Now' ? ' selected' : ''}>Now</option><option${actionSettings.start === '2 days before the visit' ? ' selected' : ''}>2 days before the visit</option>`
      : `<option${actionSettings.start === 'Today' ? ' selected' : ''}>Today</option><option${actionSettings.start === 'Tomorrow' ? ' selected' : ''}>Tomorrow</option>`;
    const secondField = isVisit
      ? `<label class="gcf-check"><input id="gcf-care-toggle" type="checkbox"${actionSettings.includeCurrentCare ? ' checked' : ''}><span>Include current medications and treatment</span></label>`
      : `<label class="gcf-field-label">Evidence window<select class="gcf-select" id="gcf-duration"><option${actionSettings.duration === '4 days' ? ' selected' : ''}>4 days</option><option${actionSettings.duration === '7 days' ? ' selected' : ''}>7 days</option></select></label>`;
    openSheet(`<div class="gcf-handle" aria-hidden="true"></div><div class="gcf-sheet-head"><div><h2 id="gcf-sheet-title">Edit this action</h2><p class="gcf-sheet-copy">Change the pace or what is carried forward.</p></div><button class="gcf-round" data-close type="button" aria-label="Close"><i data-lucide="x" aria-hidden="true"></i></button></div><div class="gcf-field-grid"><label class="gcf-field-label">${isVisit ? 'Prepare' : 'Start'}<select class="gcf-select" id="gcf-start-choice">${startOptions}</select></label>${secondField}</div><div class="gcf-sheet-actions"><button class="gcf-secondary" id="gcf-edit-back" type="button">Back</button><button class="gcf-primary" id="gcf-save-edit" type="button">Save changes</button></div>`);
    sheet.querySelector('#gcf-edit-back').addEventListener('click', () => openActionReview(item));
    sheet.querySelector('#gcf-save-edit').addEventListener('click', () => {
      actionSettings.start = sheet.querySelector('#gcf-start-choice').value;
      if (isVisit) actionSettings.includeCurrentCare = sheet.querySelector('#gcf-care-toggle').checked;
      else actionSettings.duration = sheet.querySelector('#gcf-duration').value;
      openActionReview(item);
    });
  }

  function renderSafety(question) {
    clearTimers();
    setBackChrome('Safety check', 'Before a normal answer', renderHome);
    composer.hidden = true;
    more.hidden = true;
    view.innerHTML = `<main class="gcf-safety"><div class="gcf-question">${safe(question)}</div><span class="gcf-safety-icon"><i data-lucide="shield-alert" aria-hidden="true"></i></span><h1>Let’s check this first.</h1><p class="gcf-safety-copy">Blood, severe or constant pain, vomiting, sudden worsening, or being unable to pass gas can need prompt medical attention. GI Copilot pauses the normal answer until safety is clear.</p><div class="gcf-safety-actions"><button class="gcf-primary" id="gcf-medical-help" type="button">See urgent care options</button><button class="gcf-secondary" id="gcf-contact-clinician" type="button">Contact a clinician</button><button class="gcf-quiet" id="gcf-edit-warning" type="button">Edit my message</button></div></main>`;
    view.querySelector('#gcf-medical-help').addEventListener('click', openUrgentOptions);
    view.querySelector('#gcf-contact-clinician').addEventListener('click', () => openClinicianOptions(question));
    view.querySelector('#gcf-edit-warning').addEventListener('click', () => {
      renderHome();
      input.value = question;
      syncComposer();
      input.focus();
    });
    icons();
  }

  function openUrgentOptions() {
    openSheet(`<div class="gcf-handle" aria-hidden="true"></div><div class="gcf-sheet-head"><div><h2 id="gcf-sheet-title">Choose the safest next step</h2><p class="gcf-sheet-copy">This screen does not replace medical assessment.</p></div><button class="gcf-round" data-close type="button" aria-label="Close"><i data-lucide="x" aria-hidden="true"></i></button></div><div class="gcf-sheet-list"><div class="gcf-summary-row"><span class="gcf-summary-label">Emergency</span><span>Call your local emergency number if symptoms are severe, rapidly worsening, or you feel faint or unsafe.</span></div><div class="gcf-summary-row"><span class="gcf-summary-label">Prompt care</span><span>Use urgent care or contact a clinician for medical advice when prompt assessment may be needed.</span></div></div><button class="gcf-primary" data-close type="button">I understand</button>`);
  }

  function openClinicianOptions(question) {
    openSheet(`<div class="gcf-handle" aria-hidden="true"></div><div class="gcf-sheet-head"><div><h2 id="gcf-sheet-title">Contact a clinician</h2><p class="gcf-sheet-copy">Carry the original message without rewriting it.</p></div><button class="gcf-round" data-close type="button" aria-label="Close"><i data-lucide="x" aria-hidden="true"></i></button></div><div class="gcf-question">${safe(question)}</div><div class="gcf-sheet-list"><button class="gcf-lens-choice" id="gcf-open-gi-contact" type="button"><span class="gcf-lens-choice-mark"><i data-lucide="stethoscope" aria-hidden="true"></i></span><span><span class="gcf-lens-choice-name">Gastroenterology clinic</span><span class="gcf-lens-choice-reason">Call from your Care contacts</span></span><i data-lucide="chevron-right" aria-hidden="true"></i></button><button class="gcf-lens-choice" id="gcf-open-primary-contact" type="button"><span class="gcf-lens-choice-mark"><i data-lucide="message-square-text" aria-hidden="true"></i></span><span><span class="gcf-lens-choice-name">Primary care</span><span class="gcf-lens-choice-reason">Prepare a secure message</span></span><i data-lucide="chevron-right" aria-hidden="true"></i></button></div>`);
    sheet.querySelector('#gcf-open-gi-contact').addEventListener('click', () => { closeSheet(); showToast('Opening GI clinic contact'); });
    sheet.querySelector('#gcf-open-primary-contact').addEventListener('click', () => { closeSheet(); showToast('Message ready in Care'); });
  }

  function renderReturnReview() {
    clearTimers();
    design.scenario = 'pattern';
    currentQuestion = scenarios.pattern.question;
    setBackChrome('Ready to review', '4 new days', renderHome);
    composer.hidden = true;
    more.hidden = true;
    view.innerHTML = `<main class="gcf-return"><span class="gcf-review-banner"><i data-lucide="clock-3" aria-hidden="true"></i>Evidence window complete</span><h1>Did straining continue while stool stayed soft?</h1><p class="gcf-return-copy">You added four days of evidence after asking this question. The result is ready to compare with the first answer.</p><div class="gcf-return-signal"><div class="gcf-signal-number">3 of 4</div><div class="gcf-signal-copy">soft stool days still included straining</div></div><button class="gcf-primary" id="gcf-update-answer" type="button">Update my answer <i data-lucide="arrow-right" aria-hidden="true"></i></button></main>`;
    view.querySelector('#gcf-update-answer').addEventListener('click', () => renderGenerating(scenarios.pattern, 'updated'));
    icons();
  }

  function renderUpdatedAnswer() {
    clearTimers();
    setBackChrome('Chat', 'Updated with 4 new days', renderHome);
    root.dataset.chatView = 'answer';
    composer.hidden = false;
    input.placeholder = 'Ask a follow-up';
    syncComposer();
    view.innerHTML = `<main class="gcf-thread"><article class="gcf-answer-card"><section class="gcf-response"><div class="gcf-author"><span class="gcf-author-mark"><i data-lucide="message-circle" aria-hidden="true"></i></span><span><span class="gcf-author-name">GI Copilot</span><span class="gcf-author-note">Updated answer</span></span></div><p class="gcf-answer"><strong>Straining continued on three of four days when stool remained soft.</strong> The repeated pattern makes stool hardness a less complete explanation for the difficulty you recorded. It still does not establish the cause.</p></section><button class="gcf-origin" id="gcf-updated-origin" type="button"><span class="gcf-origin-left"><i data-lucide="history" aria-hidden="true"></i><span class="gcf-origin-copy"><span class="gcf-origin-title">What changed in the answer</span><span class="gcf-origin-meta">4 new days + earlier evidence</span></span></span><i data-lucide="chevron-right" aria-hidden="true"></i></button><section class="gcf-next"><div class="gcf-next-label">Carry it forward</div><h2>Save the repeated pattern and a question for your GI visit.</h2><p>Your clinician can decide whether further assessment is appropriate.</p><div class="gcf-action-row"><button class="gcf-primary" id="gcf-save-learning" type="button">Review and save<i data-lucide="arrow-right" aria-hidden="true"></i></button></div></section></article></main>`;
    view.querySelector('#gcf-updated-origin').addEventListener('click', () => { detailPage = 0; renderDetail(scenarios.pattern, renderUpdatedAnswer, 'updated'); });
    view.querySelector('#gcf-save-learning').addEventListener('click', openLearningReview);
    icons();
  }

  function openLearningReview() {
    openSheet(`<div class="gcf-handle" aria-hidden="true"></div><div class="gcf-sheet-head"><div><h2 id="gcf-sheet-title">Review before saving</h2><p class="gcf-sheet-copy">Carry the learning forward without turning it into a diagnosis.</p></div><button class="gcf-round" data-close type="button" aria-label="Close"><i data-lucide="x" aria-hidden="true"></i></button></div><div class="gcf-sheet-list"><div class="gcf-summary-row"><span class="gcf-summary-label">Journey</span><span>Repeated straining while stool remained soft</span></div><div class="gcf-summary-row"><span class="gcf-summary-label">Visit prep</span><span>Ask whether emptying difficulty should be assessed</span></div><div class="gcf-summary-row"><span class="gcf-summary-label">Status</span><span>Possible pattern, not a diagnosis</span></div></div><div class="gcf-sheet-actions"><button class="gcf-secondary" data-close type="button">Cancel</button><button class="gcf-primary" id="gcf-confirm-learning" type="button">Confirm</button></div>`);
    sheet.querySelector('#gcf-confirm-learning').addEventListener('click', () => {
      closeSheet();
      emitHost('gutsphere:chat-learning-confirmed', { destinations: ['journey', 'visit-preparation'], status: 'possible-pattern-not-diagnosis' });
      showToast('Saved to Journey and visit preparation');
    });
  }

  function renderQuestionBoundary(question) {
    clearTimers();
    setBackChrome('Your question', 'GI Copilot', renderHome);
    composer.hidden = true;
    more.hidden = true;
    view.innerHTML = `<main class="gcf-thread"><div class="gcf-question"><span class="gcf-question-label">You asked</span>${safe(question)}</div><article class="gcf-answer-card"><section class="gcf-response"><div class="gcf-author"><span class="gcf-author-mark">GI</span><span><span class="gcf-author-name">GI Copilot</span><span class="gcf-author-note">Scope check</span></span></div><p class="gcf-answer"><strong>I could not connect this message to a digestive-care question yet.</strong> I can use your Plan, evidence, symptoms, treatments, and clinical visits when the question is about your digestive care.</p></section><section class="gcf-next"><div class="gcf-next-label">Next</div><h2>Edit the question or add the record it refers to.</h2><div class="gcf-action-row"><button class="gcf-primary" id="gcf-edit-question" type="button">Edit question</button><button class="gcf-secondary" id="gcf-add-context" type="button">Add context</button></div></section></article></main>`;
    view.querySelector('#gcf-edit-question').addEventListener('click', () => {
      renderHome();
      input.value = question;
      syncComposer();
      input.focus();
    });
    view.querySelector('#gcf-add-context').addEventListener('click', openContext);
    icons();
  }

  function submitQuestion() {
    const value = input.value.trim();
    if (!value) { input.focus(); return; }
    input.value = '';
    syncComposer();
    currentQuestion = value;
    actionAdded = false;
    if (/blood|vomit|vomiting|severe pain|constant pain|sudden worsening|unable to pass gas|cannot pass gas|can't pass gas|faint/i.test(value)) { design.scenario = 'safety'; renderSafety(value); return; }
    if (/visit|appointment|clinician|doctor/i.test(value)) design.scenario = 'visit';
    else if (/bloat|distend|gas/i.test(value)) design.scenario = 'insufficient';
    else if (/stool|strain|constipat|empty|bowel/i.test(value)) design.scenario = 'pattern';
    else { renderQuestionBoundary(value); return; }
    actionSettings = design.scenario === 'visit'
      ? { start: 'Now', duration: 'Before the visit', includeCurrentCare: true }
      : { start: 'Today', duration: '4 days', includeCurrentCare: true };
    renderGenerating(scenarios[design.scenario]);
  }

  function syncComposer() {
    send.disabled = !input.value.trim();
    input.style.height = '44px';
    const route = root.closest('[data-gsp-route]');
    if (!composer.hidden && route && route.hidden === false) {
      input.style.height = `${Math.min(120, Math.max(44, input.scrollHeight))}px`;
    }
  }

  more.addEventListener('click', () => {
    if (more.hasAttribute('data-gsp-open')) return;
    if (root.dataset.chatView === 'home') showToast('No new notifications');
    else openContext();
  });
  input.addEventListener('input', () => {
    if (composer.hidden) renderHome();
    syncComposer();
  });
  input.addEventListener('focus', syncComposer);
  overlay.addEventListener('click', (event) => { if (event.target === overlay) closeSheet(); });
  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !overlay.hidden) closeSheet();
    if (event.key === 'Tab' && !overlay.hidden) {
      const focusable = [...sheet.querySelectorAll('button, a, input, select, textarea')].filter((element) => !element.disabled && element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  attach.addEventListener('click', openContext);
  send.addEventListener('click', submitQuestion);
  input.addEventListener('keydown', (event) => { if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); submitQuestion(); } });
  root.querySelectorAll('.gcf-nav:not(.is-active)').forEach((button) => button.addEventListener('click', () => {
    const screen = button.textContent.trim().toLowerCase();
    emitHost('gutsphere:chat-route-request', { screen, source: 'bottom-navigation' });
    emitHost('gsp:route-request', { screen });
  }));

  applyDesign();
  renderHome();

  window.GutsphereChat = Object.freeze({
    root,
    focusComposer() {
      root.querySelector('#gcf-input')?.focus();
    },
    setQuestion(question) {
      const field = root.querySelector('#gcf-input');
      if (!field) return;
      field.value = String(question || '');
      field.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  if (globalThis.Tweak) {
    const tweak = new Tweak({ container: root, onChange: () => { applyDesign(); renderHome(); } });
    tweak.addSelect(design, 'scenario', { label: 'Starting example', options: [{ label: 'Repeated pattern', value: 'pattern' }, { label: 'Not enough evidence', value: 'insufficient' }, { label: 'Visit preparation', value: 'visit' }, { label: 'Safety interruption', value: 'safety' }], reference: 'chat.scenario' });
    tweak.addToggle(design, 'animateSynthesis', { label: 'Show synthesis sequence', reference: 'chat.synthesis' });
    tweak.addSelect(design, 'density', { label: 'Spacing', options: [{ label: 'Airy', value: 'airy' }, { label: 'Compact', value: 'compact' }], reference: 'chat.density' });
    tweak.addSlider(design, 'radius', { label: 'Corners', min: 16, max: 30, unit: 'px', reference: '--gcf-radius' });
  }
})();
