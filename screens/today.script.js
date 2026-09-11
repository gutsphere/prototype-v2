(() => {
  const root = document.getElementById('gutsphere-today-carousel');
  if (!root || root.dataset.gspEnhanced === 'true') return;

  const phone = root.querySelector('.gtc-phone');
  const carousel = root.querySelector('.gtc-carousel');
  const cue = root.querySelector('.gtc-carousel-cue');
  const dots = root.querySelector('.gtc-dots');
  const swipeLabel = root.querySelector('.gtc-swipe');
  const periodButtons = [...root.querySelectorAll('.gtc-period')];
  const controls = [...root.querySelectorAll('.gtc-control')];
  const editDetails = controls.find((control) => !control.classList.contains('gtc-add'));
  const addDetails = controls.find((control) => control.classList.contains('gtc-add'));

  if (!phone || !carousel || !cue || !dots || !swipeLabel || !editDetails || !addDetails) return;
  root.dataset.gspEnhanced = 'true';

  const periodNames = ['Morning', 'Afternoon', 'Evening', 'Night'];
  const periodIcons = ['sunrise', 'sun', 'sunset', 'moon'];
  const paceLimits = { slow: 2, medium: 3, high: 4 };

  const state = {
    period: 0,
    pace: 'medium',
    index: [0, 0, 0, 0],
    addCounter: 0,
    items: [
      [
        {
          id: 'morning-bathroom-window',
          planned: true,
          kind: 'Plan action',
          icon: 'sunrise',
          tone: 'action',
          title: 'Begin 15–45 min after breakfast',
          copy: 'Use the footstool, relax your belly and pelvic floor, and avoid forcing.',
          source: 'Week 1 · Reduce straining',
          action: 'Start'
        },
        {
          id: 'morning-stool-straining',
          planned: true,
          kind: 'Evidence',
          icon: 'clipboard-list',
          tone: 'evidence',
          title: 'Record stool type and straining',
          copy: 'Choose the closest stool type and how much you strained. Two taps.',
          source: 'Compared with your Plan baseline',
          action: 'Record',
          capture: 'stool'
        },
        {
          id: 'morning-emptying',
          planned: true,
          kind: 'Evidence',
          icon: 'circle-help',
          tone: 'evidence',
          title: 'Did emptying feel complete?',
          copy: 'Choose yes, not sure, or no. This helps show whether difficult emptying continues.',
          source: 'Supports your care conversation',
          action: 'Answer',
          capture: 'emptying'
        },
        {
          id: 'morning-fiber-steady',
          planned: true,
          kind: 'Why this week',
          icon: 'info',
          tone: 'care',
          title: 'Keep fiber steady for now',
          copy: 'More fiber increased your bloating before. This week checks emptying without adding another change.',
          source: 'Based on your previous response',
          action: 'Read'
        }
      ],
      [
        {
          id: 'afternoon-walk',
          planned: true,
          kind: 'Relief routine',
          icon: 'footprints',
          tone: 'action',
          title: 'Take your planned walk after lunch',
          copy: 'Walk for 10 minutes at your comfortable pace. This is the routine you chose.',
          source: 'Self care · Added to your Plan',
          action: 'Start'
        },
        {
          id: 'afternoon-urge',
          planned: true,
          kind: 'Evidence',
          icon: 'clock-3',
          tone: 'evidence',
          title: 'Did you delay an urge?',
          copy: 'If an urge came today, record whether you went then or had to wait.',
          source: 'One tap · No notes needed',
          action: 'Answer',
          capture: 'urge'
        },
        {
          id: 'afternoon-pattern',
          planned: true,
          kind: 'Guidance',
          icon: 'scan-search',
          tone: 'evidence',
          title: 'See what today’s pattern means',
          copy: 'Soft stool with continued straining can be worth discussing as an emptying problem. It does not identify the cause.',
          source: 'Clinical boundary included',
          action: 'Read'
        },
        {
          id: 'afternoon-chat',
          planned: true,
          kind: 'GI Copilot',
          icon: 'messages-square',
          tone: 'care',
          title: 'Ask about fiber without more bloating',
          copy: 'Open Chat with your recent fiber response already included.',
          source: 'Your context travels with you',
          action: 'Ask',
          route: 'chat'
        }
      ],
      [
        {
          id: 'evening-peg',
          planned: true,
          kind: 'Medication adherence',
          icon: 'pill',
          tone: 'care',
          title: 'Take PEG at your usual 8 PM time',
          copy: 'Keep the dose and timing already set with your care team.',
          source: 'Current care · Dose unchanged',
          action: 'Confirm',
          capture: 'medication'
        },
        {
          id: 'evening-bloating',
          planned: true,
          kind: 'Evidence',
          icon: 'gauge',
          tone: 'evidence',
          title: 'Rate today’s bloating',
          copy: 'Choose 0 to 10. Use the same scale you used before this Plan.',
          source: 'Compared with your baseline',
          action: 'Record',
          capture: 'bloating'
        },
        {
          id: 'evening-care-question',
          planned: true,
          kind: 'Care preparation',
          icon: 'message-square-text',
          tone: 'care',
          title: 'Save your pelvic floor question',
          copy: 'Could pelvic floor coordination contribute to straining when my stool is not hard?',
          source: 'Ready for your care team',
          action: 'Save'
        },
        {
          id: 'evening-compare',
          planned: true,
          kind: 'Review',
          icon: 'git-compare-arrows',
          tone: 'evidence',
          title: 'Compare stool type with straining',
          copy: 'Look at the two together. Do not judge the Plan from one day.',
          source: 'Patterns matter more than one result',
          action: 'Review'
        }
      ],
      [
        {
          id: 'night-reminder',
          planned: true,
          kind: 'Plan preparation',
          icon: 'alarm-clock',
          tone: 'action',
          title: 'Set tomorrow’s breakfast reminder',
          copy: 'Your bathroom window will begin 15–45 minutes after breakfast.',
          source: 'Tomorrow · Week 1',
          action: 'Set'
        },
        {
          id: 'night-footstool',
          planned: true,
          kind: 'Plan preparation',
          icon: 'package-check',
          tone: 'care',
          title: 'Place the footstool where you need it',
          copy: 'One small setup now removes a decision tomorrow morning.',
          source: 'Ready before you wake',
          action: 'Done'
        },
        {
          id: 'night-relaxation',
          planned: true,
          kind: 'Guided support',
          icon: 'headphones',
          tone: 'evidence',
          title: 'Relax the body before sleep',
          copy: 'Follow a 4 minute guided relaxation for your belly and pelvic floor.',
          source: 'Self care · Optional support',
          action: 'Start'
        },
        {
          id: 'night-learn',
          planned: true,
          kind: 'Learn',
          icon: 'book-open',
          tone: 'evidence',
          title: 'Why soft stool can still be hard to pass',
          copy: 'Passing stool also depends on pelvic floor coordination, not only stool hardness.',
          source: 'Read time · 40 seconds',
          action: 'Read'
        }
      ]
    ]
  };

  const catalogue = [
    {
      key: 'self-care',
      title: 'Self care and relief',
      sub: 'Relief routines, movement, guided support',
      icon: 'heart-handshake',
      items: [
        { title: 'Constipation relief routine', copy: 'Warm drink, gentle movement, and bathroom setup.', icon: 'heart-pulse', kind: 'Relief routine', tone: 'action', action: 'Start' },
        { title: 'Guided belly relaxation', copy: 'A 4 minute guide for belly and pelvic floor tension.', icon: 'headphones', kind: 'Guided support', tone: 'evidence', action: 'Start' },
        { title: 'After-meal walk', copy: 'Walk for the duration and pace you choose.', icon: 'footprints', kind: 'Self care', tone: 'action', action: 'Start' }
      ]
    },
    {
      key: 'evidence',
      title: 'Evidence',
      sub: 'Choose from all 15 evidence types',
      icon: 'clipboard-list',
      items: [
        { title: 'Bowel Movement', copy: 'Record stool type, straining, and emptying.', icon: 'shapes', kind: 'Bowel evidence', tone: 'evidence', action: 'Record', capture: 'stool' },
        { title: 'Symptoms', copy: 'Record bloating, pain, nausea, blood, or another change.', icon: 'activity', kind: 'Symptom evidence', tone: 'evidence', action: 'Record', capture: 'symptoms' },
        { title: 'Menstrual / Hormonal', copy: 'Add cycle or hormonal context when it is relevant.', icon: 'calendar-heart', kind: 'Body evidence', tone: 'evidence', action: 'Record' },
        { title: 'Diet', copy: 'Record a meal or meaningful food change.', icon: 'utensils', kind: 'Food evidence', tone: 'evidence', action: 'Record', capture: 'food' },
        { title: 'Hydration', copy: 'Record a glass or your daily amount.', icon: 'glass-water', kind: 'Hydration evidence', tone: 'evidence', action: 'Record', capture: 'water' },
        { title: 'Fasting', copy: 'Record when a relevant fasting period began and ended.', icon: 'timer', kind: 'Intake evidence', tone: 'evidence', action: 'Record' },
        { title: 'Food Sensitivity & Allergy', copy: 'Keep a suspected sensitivity separate from a known allergy response.', icon: 'wheat-off', kind: 'Food evidence', tone: 'evidence', action: 'Record' },
        { title: 'Sleep', copy: 'Add sleep as context beside symptoms and routines.', icon: 'moon', kind: 'Daily context', tone: 'evidence', action: 'Record' },
        { title: 'Stress & Mood', copy: 'Add stress or mood when it helps place changes in context.', icon: 'brain', kind: 'Daily context', tone: 'evidence', action: 'Record' },
        { title: 'Movement', copy: 'Record planned movement or a meaningful activity change.', icon: 'footprints', kind: 'Daily context', tone: 'evidence', action: 'Record' },
        { title: 'Medication & Supplements', copy: 'Record what you took or missed and any effect you noticed.', icon: 'pill', kind: 'Care evidence', tone: 'evidence', action: 'Record' },
        { title: 'Treatment Adherence', copy: 'Record what part of a care protocol you followed, missed, or could not complete.', icon: 'list-checks', kind: 'Care evidence', tone: 'evidence', action: 'Record' },
        { title: 'Test Results', copy: 'Add a report with its date and source.', icon: 'file-check-2', kind: 'Clinical record', tone: 'evidence', action: 'Record' },
        { title: 'Biometrics & Demographics', copy: 'Add relevant background measures used for care context.', icon: 'ruler', kind: 'Care context', tone: 'evidence', action: 'Record' },
        { title: 'Notes', copy: 'Save something important that does not fit elsewhere.', icon: 'notebook-pen', kind: 'Context', tone: 'evidence', action: 'Record' }
      ]
    },
    {
      key: 'care',
      title: 'Current and clinical care',
      sub: 'Medicines, treatments, and protocols',
      icon: 'stethoscope',
      items: [
        { title: 'Medication adherence', copy: 'Confirm a medicine already in your care.', icon: 'pill', kind: 'Medication adherence', tone: 'care', action: 'Confirm', capture: 'medication' },
        { title: 'Follow a treatment plan', copy: 'Bring a clinician-directed step into today.', icon: 'stethoscope', kind: 'Treatment support', tone: 'care', action: 'Start' },
        { title: 'Continue an active protocol', copy: 'Continue the next step in an active protocol.', icon: 'list-checks', kind: 'Protocol step', tone: 'care', action: 'Start' }
      ]
    },
    {
      key: 'chat',
      title: 'GI Copilot',
      sub: 'Ask once with today’s context included',
      icon: 'message-circle',
      items: [
        { title: 'Ask about today', copy: 'Open Chat with this day and your recent evidence included.', icon: 'message-circle', kind: 'GI Copilot', tone: 'care', action: 'Ask', route: 'chat' },
        { title: 'Prepare a care question', copy: 'Turn what happened today into a focused question for your care team.', icon: 'message-square-text', kind: 'Care preparation', tone: 'care', action: 'Save' }
      ]
    }
  ];

  const enhancementStyles = document.createElement('style');
  enhancementStyles.textContent = `
    #gutsphere-today-carousel .gtc-dots span:first-child{width:6px;background:var(--gtc-line)}
    #gutsphere-today-carousel .gtc-dots span.is-current{width:18px;background:var(--gtc-coral)}
    #gutsphere-today-carousel .gtc-card-action:disabled{background:var(--gtc-green-soft);color:var(--gtc-green)}
    #gutsphere-today-carousel .gsp-source-button{padding:0;border:0;background:transparent;text-align:left;cursor:pointer}
    #gutsphere-today-carousel .gsp-source-button:focus-visible,
    .gsp-transient-layer .gsp-sheet-option:focus-visible,
    .gsp-transient-layer .gsp-choice:focus-visible{outline:3px solid color-mix(in srgb,var(--gtc-coral) 35%,transparent);outline-offset:2px}
    #gutsphere-today-carousel .gsp-catalog-option{border:0;cursor:pointer}
    #gutsphere-today-carousel .gsp-manage-option{border:0;cursor:pointer}
    #gutsphere-today-carousel .gsp-empty-card{justify-content:center;text-align:center}
  `;
  root.appendChild(enhancementStyles);

  const transientLayer = document.createElement('div');
  transientLayer.className = 'gtc-sheet-layer gsp-sheet-layer gsp-transient-layer';
  transientLayer.hidden = true;
  transientLayer.innerHTML = `
    <section class="gtc-sheet gsp-sheet" role="dialog" aria-modal="true" aria-labelledby="gsp-today-sheet-title">
      <div class="gsp-sheet-chrome">
        <div class="gtc-grabber"></div>
        <header class="gtc-sheet-head">
          <span></span>
          <h2 id="gsp-today-sheet-title">Today</h2>
          <button class="gtc-close" type="button" data-gsp-flow-close aria-label="Close"><i data-lucide="x"></i></button>
        </header>
      </div>
      <div class="gsp-sheet-scroll">
        <p class="gtc-sheet-copy" id="gsp-today-sheet-copy"></p>
        <div class="gsp-sheet-body" id="gsp-today-sheet-body"></div>
      </div>
    </section>`;
  (document.body || document.getElementById('app') || phone).appendChild(transientLayer);
  transientLayer.setAttribute('aria-hidden', 'true');

  const transientTitle = transientLayer.querySelector('#gsp-today-sheet-title');
  const transientCopy = transientLayer.querySelector('#gsp-today-sheet-copy');
  const transientBody = transientLayer.querySelector('#gsp-today-sheet-body');
  let returnFocus = null;
  let scrollFrame = 0;

  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const refreshIcons = () => {
    if (globalThis.lucide) {
      globalThis.lucide.createIcons({ attrs: { 'stroke-width': 1.5, 'aria-hidden': 'true' } });
    }
  };

  const dispatch = (name, detail) => {
    root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
  };

  const periodSlug = (period) => periodNames[period].toLowerCase();
  const itemEventDetail = (item, period, extra = {}) => ({
    itemId: item.id,
    title: item.title,
    kind: item.kind,
    period: periodSlug(period),
    source: item.source,
    sourceType: item.sourceType || (item.planned ? 'Plan' : 'Today'),
    sourceRoute: item.sourceRoute || (item.planned ? 'plan' : 'today'),
    ...extra
  });

  const visibleItems = (period) => {
    const items = state.items[period];
    const plannedLimit = paceLimits[state.pace];
    const planned = items.filter((item) => item.planned && !item.userControlled).slice(0, plannedLimit);
    const plannedIds = new Set(planned.map((item) => item.id));
    return items.filter((item) => plannedIds.has(item.id) || !item.planned || item.userControlled);
  };

  const findItem = (id) => {
    for (let period = 0; period < state.items.length; period += 1) {
      const itemIndex = state.items[period].findIndex((item) => item.id === id);
      if (itemIndex !== -1) return { item: state.items[period][itemIndex], period, itemIndex };
    }
    return null;
  };

  const toneClass = (item) => item.tone === 'evidence' ? 'is-evidence' : item.tone === 'care' ? 'is-care' : '';

  const itemMarkup = (item) => {
    const tone = toneClass(item);
    const planSource = item.source.includes('Week 1');
    const sourceTag = planSource
      ? `<button class="gtc-source gsp-source-button" type="button" data-gsp-open-plan data-route="plan" aria-label="Open Plan"><i data-lucide="shield-check"></i><span>${escapeHtml(item.source)}</span><i data-lucide="chevron-right"></i></button>`
      : `<div class="gtc-source"><i data-lucide="shield-check"></i><span>${escapeHtml(item.source)}</span></div>`;
    const completedLabel = item.completed ? 'Saved' : item.action;
    return `
      <article class="gtc-card" data-item-id="${escapeHtml(item.id)}">
        <div class="gtc-card-head">
          <span class="gtc-kind ${tone}"><i data-lucide="${escapeHtml(item.icon)}"></i>${escapeHtml(item.kind)}</span>
          <button class="gtc-more" type="button" data-gsp-item-menu aria-label="Change this item"><i data-lucide="ellipsis"></i></button>
        </div>
        <div class="gtc-visual ${tone}"><i data-lucide="${escapeHtml(item.icon)}"></i></div>
        <h2 class="gtc-title">${escapeHtml(item.title)}</h2>
        <p class="gtc-copy">${escapeHtml(item.copy)}</p>
        ${sourceTag}
        <button class="gtc-card-action" type="button" data-gsp-card-action ${item.route ? `data-route="${escapeHtml(item.route)}"` : ''} ${item.completed ? 'disabled' : ''}>${escapeHtml(completedLabel)}<i data-lucide="${item.completed ? 'check' : 'arrow-right'}"></i></button>
      </article>`;
  };

  const updateCue = () => {
    const items = visibleItems(state.period);
    const count = items.length;
    const index = count ? Math.max(0, Math.min(state.index[state.period], count - 1)) : 0;
    state.index[state.period] = index;
    dots.innerHTML = Array.from({ length: count }, (_, dotIndex) => `<span class="${dotIndex === index ? 'is-current' : ''}"></span>`).join('');
    dots.setAttribute('aria-label', count ? `Item ${index + 1} of ${count}` : 'No items');
    swipeLabel.innerHTML = count > 1
      ? `Swipe for the next item<i data-lucide="move-horizontal"></i>`
      : `One item for this time<i data-lucide="check"></i>`;
    cue.hidden = count === 0;
    refreshIcons();
  };

  const updatePeriodControls = () => {
    periodButtons.forEach((button, period) => {
      const count = visibleItems(period).length;
      button.dataset.period = String(period);
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', String(period === state.period));
      button.setAttribute('aria-controls', 'gsp-today-carousel');
      const countNode = button.querySelector('.gtc-period-count');
      if (countNode) countNode.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
    });
    const dayline = root.querySelector('.gtc-dayline');
    if (dayline) dayline.setAttribute('role', 'tablist');
  };

  const scrollToCurrent = (behavior = 'auto') => {
    const card = carousel.children[state.index[state.period]];
    if (!card) return;
    carousel.scrollTo({ left: Math.max(0, card.offsetLeft - 16), behavior });
  };

  const renderCarousel = () => {
    const items = visibleItems(state.period);
    state.index[state.period] = Math.max(0, Math.min(state.index[state.period], Math.max(0, items.length - 1)));
    carousel.id = 'gsp-today-carousel';
    carousel.setAttribute('aria-label', `${periodNames[state.period]} items, swipe horizontally`);
    carousel.innerHTML = items.length
      ? items.map(itemMarkup).join('')
      : `<article class="gtc-card gsp-empty-card"><div class="gtc-visual is-care"><i data-lucide="check"></i></div><h2 class="gtc-title">This part of your day is clear.</h2><p class="gtc-copy">Add something only if it would help.</p></article>`;
    updatePeriodControls();
    updateCue();
    refreshIcons();
    requestAnimationFrame(() => scrollToCurrent('auto'));
  };

  const setPeriod = (period) => {
    const target = Math.max(0, Math.min(3, Number(period)));
    if (target === state.period) return;
    state.period = target;
    renderCarousel();
    renderAddSheet();
    if (editDetails.open) renderEditSheet();
  };

  const closeTransient = () => {
    transientLayer.hidden = true;
    transientLayer.setAttribute('aria-hidden', 'true');
    transientBody.innerHTML = '';
    if (returnFocus && document.contains(returnFocus)) returnFocus.focus();
    returnFocus = null;
  };

  const openTransient = ({ title, copy = '', body, focusSource = document.activeElement }) => {
    editDetails.removeAttribute('open');
    addDetails.removeAttribute('open');
    returnFocus = focusSource instanceof HTMLElement ? focusSource : null;
    transientTitle.textContent = title;
    transientCopy.textContent = copy;
    transientCopy.hidden = !copy;
    transientBody.innerHTML = body;
    transientLayer.hidden = false;
    transientLayer.setAttribute('aria-hidden', 'false');
    refreshIcons();
    const closeButton = transientLayer.querySelector('[data-gsp-flow-close]');
    if (closeButton) closeButton.focus();
  };

  const resultSheet = (title, copy, buttonLabel = 'Done') => {
    transientTitle.textContent = title;
    transientCopy.hidden = true;
    transientBody.innerHTML = `
      <div class="gsp-flow-result"><i data-lucide="check-circle-2"></i><h3>${escapeHtml(title)}</h3><p>${escapeHtml(copy)}</p></div>
      <button class="gsp-flow-primary" type="button" data-gsp-flow-close>${escapeHtml(buttonLabel)}</button>`;
    refreshIcons();
  };

  const completeItem = (item, result) => {
    item.completed = true;
    item.result = result;
    renderCarousel({ preserveScroll: true });
    dispatch('gsp:today-item-completed', itemEventDetail(item, state.period, { result }));
    resultSheet('Saved for today', 'This will be carried into Track and your Plan review.');
  };

  const showQuestion = ({ title, copy = 'Choose the closest answer. No notes needed.', choices, onChoose }) => {
    transientTitle.textContent = title;
    transientCopy.textContent = copy;
    transientCopy.hidden = false;
    transientBody.innerHTML = choices.map((choice) => `
      <button class="gsp-choice" type="button" data-gsp-choice="${escapeHtml(choice)}">
        <span>${escapeHtml(choice)}</span><i data-lucide="chevron-right"></i>
      </button>`).join('');
    transientBody.querySelectorAll('[data-gsp-choice]').forEach((button) => {
      button.addEventListener('click', () => onChoose(button.dataset.gspChoice));
    });
    refreshIcons();
  };

  const startFlow = (item) => {
    openTransient({
      title: item.title,
      copy: item.copy,
      body: `
        <button class="gsp-flow-primary is-coral" type="button" data-gsp-start-complete>${item.id === 'morning-bathroom-window' ? 'I’m finished' : 'I’m done'}</button>
        <button class="gsp-flow-secondary" type="button" data-gsp-flow-close>Not now</button>`
    });
    transientBody.querySelector('[data-gsp-start-complete]').addEventListener('click', () => {
      completeItem(item, 'Completed');
    });
  };

  const recordFlow = (item) => {
    if (item.capture === 'bloating') {
      openTransient({
        title: 'How strong was the bloating?',
        copy: 'Use the same 0 to 10 scale as your baseline.',
        body: `
          <label class="gsp-range-wrap"><span class="gsp-range-value" data-gsp-range-value>5</span><input class="gsp-range" type="range" min="0" max="10" step="1" value="5" aria-label="Bloating from 0 to 10"></label>
          <button class="gsp-flow-primary" type="button" data-gsp-save-range>Save 5</button>
          <button class="gsp-flow-secondary" type="button" data-gsp-flow-close>Cancel</button>`
      });
      const range = transientBody.querySelector('.gsp-range');
      const value = transientBody.querySelector('[data-gsp-range-value]');
      const save = transientBody.querySelector('[data-gsp-save-range]');
      range.addEventListener('input', () => {
        value.textContent = range.value;
        save.textContent = `Save ${range.value}`;
      });
      save.addEventListener('click', () => completeItem(item, { bloating: Number(range.value) }));
      return;
    }
    const captures = {
      stool: {
        title: 'What was the closest stool type?',
        choices: ['Types 1–2', 'Types 3–4', 'Types 5–7', 'No bowel movement'],
        next: (stool) => showQuestion({
          title: 'How much did you strain?',
          choices: ['None', 'Some', 'A lot'],
          onChoose: (strain) => completeItem(item, { stool, strain })
        })
      },
      food: { title: 'Which meal are you recording?', choices: ['Breakfast', 'Lunch', 'Dinner', 'Snack'] },
      symptoms: { title: 'How do symptoms compare with usual?', choices: ['Better', 'About the same', 'Worse'] },
      water: { title: 'What would you like to record?', choices: ['One glass', 'Daily amount'] }
    };
    const capture = captures[item.capture] || { title: 'Record this now?', choices: ['Recorded'] };
    openTransient({ title: capture.title, copy: 'Choose the closest answer. No notes needed.', body: '' });
    showQuestion({
      title: capture.title,
      choices: capture.choices,
      onChoose: capture.next || ((answer) => completeItem(item, answer))
    });
  };

  const answerFlow = (item) => {
    const captures = {
      emptying: { title: 'Did emptying feel complete?', choices: ['Yes', 'Not sure', 'No'] },
      urge: { title: 'What happened when the urge came?', choices: ['Went right away', 'Had to wait', 'No urge today'] },
      medication: { title: 'Did you take it at the planned time?', choices: ['Yes', 'Not yet', 'Skipped today'] }
    };
    const capture = captures[item.capture] || { title: item.title, choices: ['Yes', 'Not sure', 'No'] };
    openTransient({ title: capture.title, copy: 'Choose the closest answer. No notes needed.', body: '' });
    showQuestion({
      title: capture.title,
      choices: capture.choices,
      onChoose: (answer) => {
        if (item.capture === 'medication' && answer === 'Not yet') {
          item.pending = true;
          dispatch('gsp:today-item-pending', itemEventDetail(item, state.period, { result: answer }));
          resultSheet('Still on your list', 'It has not been marked complete. You can return when you are ready.');
          return;
        }
        completeItem(item, answer);
      }
    });
  };

  const genericActionFlow = (item) => {
    if (item.route) {
      dispatch('gsp:route-request', { screen: item.route, context: { source: 'today', itemId: item.id, title: item.title } });
      return;
    }
    openTransient({
      title: item.title,
      copy: item.copy,
      body: `
        <button class="gsp-flow-primary" type="button" data-gsp-generic-complete>${escapeHtml(item.action === 'Read' ? 'Done reading' : item.action)}</button>
        <button class="gsp-flow-secondary" type="button" data-gsp-flow-close>Not now</button>`
    });
    transientBody.querySelector('[data-gsp-generic-complete]').addEventListener('click', () => completeItem(item, item.action));
  };

  const openCardAction = (item) => {
    if (item.action === 'Start') startFlow(item);
    else if (item.action === 'Record') recordFlow(item);
    else if (item.action === 'Answer' || item.action === 'Confirm') answerFlow(item);
    else genericActionFlow(item);
  };

  const editItemDetails = (item) => {
    const reminder = item.reminder === false ? 'Off' : 'On';
    openTransient({
      title: 'Update this item',
      copy: item.title,
      body: `
        <button class="gsp-choice ${reminder === 'On' ? 'is-selected' : ''}" type="button" data-gsp-reminder="on"><span>Reminder on</span><i data-lucide="bell"></i></button>
        <button class="gsp-choice ${reminder === 'Off' ? 'is-selected' : ''}" type="button" data-gsp-reminder="off"><span>No reminder</span><i data-lucide="bell-off"></i></button>
        <button class="gsp-flow-secondary" type="button" data-gsp-flow-close>Cancel</button>`
    });
    transientBody.querySelectorAll('[data-gsp-reminder]').forEach((button) => {
      button.addEventListener('click', () => {
        item.reminder = button.dataset.gspReminder === 'on';
        item.source = `${item.source.replace(/ · Reminder (on|off)$/i, '')} · Reminder ${item.reminder ? 'on' : 'off'}`;
        renderCarousel({ preserveScroll: true });
        resultSheet('Item updated', `Reminder ${item.reminder ? 'on' : 'off'}.`);
      });
    });
  };

  const moveItem = (item) => {
    const found = findItem(item.id);
    if (!found) return;
    openTransient({
      title: 'Move to another time',
      copy: item.title,
      body: periodNames.map((name, period) => `
        <button class="gsp-choice ${period === found.period ? 'is-selected' : ''}" type="button" data-gsp-move-period="${period}" ${period === found.period ? 'disabled' : ''}>
          <span>${name}</span><i data-lucide="${periodIcons[period]}"></i>
        </button>`).join('') + `<button class="gsp-flow-secondary" type="button" data-gsp-flow-close>Cancel</button>`
    });
    transientBody.querySelectorAll('[data-gsp-move-period]:not(:disabled)').forEach((button) => {
      button.addEventListener('click', () => {
        const target = Number(button.dataset.gspMovePeriod);
        state.items[found.period].splice(found.itemIndex, 1);
        item.userControlled = true;
        item.movedFrom = found.period;
        if (!item.source.includes('Moved by you')) item.source = `${item.source} · Moved by you`;
        state.items[target].push(item);
        state.period = target;
        state.index[target] = visibleItems(target).findIndex((candidate) => candidate.id === item.id);
        renderCarousel();
        dispatch('gsp:today-item-moved', itemEventDetail(item, target, { from: periodSlug(found.period), to: periodSlug(target) }));
        resultSheet(`Moved to ${periodNames[target].toLowerCase()}`, 'It remains visible even if you reduce today’s pace.', `View ${periodNames[target].toLowerCase()}`);
      });
    });
  };

  const removeItem = (item) => {
    openTransient({
      title: 'Remove from today?',
      copy: item.title,
      body: `
        <button class="gsp-flow-primary is-coral" type="button" data-gsp-confirm-remove>Remove from today</button>
        <button class="gsp-flow-secondary" type="button" data-gsp-flow-close>Keep it</button>`
    });
    transientBody.querySelector('[data-gsp-confirm-remove]').addEventListener('click', () => {
      const found = findItem(item.id);
      if (!found) return;
      state.items[found.period].splice(found.itemIndex, 1);
      state.index[found.period] = Math.max(0, state.index[found.period] - 1);
      renderCarousel();
      dispatch('gsp:today-item-removed', itemEventDetail(item, found.period));
      resultSheet('Removed from today', item.planned ? 'Your future Plan is unchanged.' : 'You can add it again at any time.');
    });
  };

  const openItemMenu = (item) => {
    openTransient({
      title: 'Change this item',
      copy: item.title,
      body: `
        <button class="gsp-sheet-option" type="button" data-gsp-edit-item><span class="gtc-path-icon"><i data-lucide="pencil"></i></span><span><strong>Update details</strong><small>Change its reminder for today</small></span><i data-lucide="chevron-right"></i></button>
        <button class="gsp-sheet-option" type="button" data-gsp-move-item><span class="gtc-path-icon"><i data-lucide="clock-3"></i></span><span><strong>Move to another time</strong><small>Morning, afternoon, evening, or night</small></span><i data-lucide="chevron-right"></i></button>
        <button class="gsp-sheet-option" type="button" data-gsp-remove-item><span class="gtc-path-icon"><i data-lucide="trash-2"></i></span><span><strong>Remove from today</strong><small>${item.planned ? 'Keep future Plan days unchanged' : 'You can add it again later'}</small></span><i data-lucide="chevron-right"></i></button>`
    });
    const editButton = transientBody.querySelector('[data-gsp-edit-item]');
    const moveButton = transientBody.querySelector('[data-gsp-move-item]');
    const removeButton = transientBody.querySelector('[data-gsp-remove-item]');
    if (editButton) editButton.addEventListener('click', (event) => {
      event.stopPropagation();
      editItemDetails(item);
    });
    if (moveButton) moveButton.addEventListener('click', (event) => {
      event.stopPropagation();
      moveItem(item);
    });
    if (removeButton) removeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      removeItem(item);
    });
  };

  const pathMarkup = ({ icon, title, sub, body }) => `
    <details class="gtc-path">
      <summary><span class="gtc-path-icon"><i data-lucide="${icon}"></i></span><span><strong>${title}</strong><small>${sub}</small></span><i data-lucide="chevron-right"></i></summary>
      ${body}
    </details>`;

  const renderEditSheet = () => {
    const heading = editDetails.querySelector('.gtc-sheet-head h2');
    const copy = editDetails.querySelector('.gtc-sheet-copy');
    const paths = editDetails.querySelector('.gtc-paths');
    if (!heading || !copy || !paths) return;
    heading.textContent = 'Edit today';
    copy.textContent = 'Change the load or manage what appears.';
    const paceBody = `<div class="gtc-pace"><p>Changes how many planned cards appear. It never changes medicine doses.</p><div class="gtc-pace-options">${['slow', 'medium', 'high'].map((pace) => `<label><input type="radio" name="gsp-today-pace" value="${pace}" ${pace === state.pace ? 'checked' : ''}>${pace[0].toUpperCase() + pace.slice(1)}</label>`).join('')}</div></div>`;
    const manageBody = `<div class="gtc-options">${visibleItems(state.period).map((item) => `<button class="gtc-option gsp-manage-option" type="button" data-gsp-manage-id="${escapeHtml(item.id)}"><i data-lucide="${escapeHtml(item.icon)}"></i><span>${escapeHtml(item.title)}</span><i data-lucide="ellipsis"></i></button>`).join('')}</div>`;
    const planBody = `<div class="gtc-options"><button class="gtc-option gsp-manage-option" type="button" data-gsp-open-plan><i data-lucide="route"></i><span>Open the full Plan</span><i data-lucide="chevron-right"></i></button></div>`;
    paths.innerHTML = [
      pathMarkup({ icon: 'gauge', title: 'Adjust today’s capacity', sub: 'Kept out of the main screen', body: paceBody }),
      pathMarkup({ icon: 'list-restart', title: `Manage ${periodNames[state.period].toLowerCase()}`, sub: 'Update, move, or remove items', body: manageBody }),
      pathMarkup({ icon: 'route', title: 'Update future Plan days', sub: 'Carry a change beyond today', body: planBody })
    ].join('');
    paths.querySelectorAll('input[name="gsp-today-pace"]').forEach((input) => {
      input.addEventListener('change', () => {
        state.pace = input.value;
        state.index = state.index.map(() => 0);
        renderCarousel();
        renderEditSheet();
        dispatch('gsp:today-pace-changed', { pace: state.pace, plannedCardsPerPeriod: paceLimits[state.pace] });
      });
    });
    paths.querySelectorAll('[data-gsp-manage-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const found = findItem(button.dataset.gspManageId);
        if (found) openItemMenu(found.item);
      });
    });
    refreshIcons();
  };

  const renderAddSheet = () => {
    const heading = addDetails.querySelector('.gtc-sheet-head h2');
    const copy = addDetails.querySelector('.gtc-sheet-copy');
    const paths = addDetails.querySelector('.gtc-paths');
    if (!heading || !copy || !paths) return;
    heading.textContent = 'Add to today';
    copy.textContent = 'Choose an item, then choose when it belongs.';
    paths.innerHTML = catalogue.map((group, groupIndex) => pathMarkup({
      icon: group.icon,
      title: group.title,
      sub: group.sub,
      body: `<div class="gtc-options">${group.items.map((item, itemIndex) => `<button class="gtc-option gsp-catalog-option" type="button" data-gsp-catalog="${groupIndex}:${itemIndex}"><i data-lucide="${item.icon}"></i><span>${escapeHtml(item.title)}</span><i data-lucide="plus"></i></button>`).join('')}</div>`
    })).join('');
    paths.querySelectorAll('[data-gsp-catalog]').forEach((button) => {
      button.addEventListener('click', () => {
        const [groupIndex, itemIndex] = button.dataset.gspCatalog.split(':').map(Number);
        chooseAddPeriod({
          ...catalogue[groupIndex].items[itemIndex],
          sourceType: catalogue[groupIndex].title,
          sourceRoute: catalogue[groupIndex].key === 'self-care' || catalogue[groupIndex].key === 'care' ? 'care' : catalogue[groupIndex].key === 'chat' ? 'chat' : 'track'
        });
      });
    });
    refreshIcons();
  };

  const chooseAddPeriod = (catalogueItem) => {
    let targetPeriod = state.period;
    const draw = () => {
      transientBody.innerHTML = `
        ${periodNames.map((name, period) => `<button class="gsp-choice ${period === targetPeriod ? 'is-selected' : ''}" type="button" data-gsp-add-period="${period}"><span>${name}</span><i data-lucide="${periodIcons[period]}"></i></button>`).join('')}
        <button class="gsp-flow-primary is-coral" type="button" data-gsp-confirm-add>Add to ${periodNames[targetPeriod].toLowerCase()}</button>
        <button class="gsp-flow-secondary" type="button" data-gsp-flow-close>Cancel</button>`;
      transientBody.querySelectorAll('[data-gsp-add-period]').forEach((button) => {
        button.addEventListener('click', () => {
          targetPeriod = Number(button.dataset.gspAddPeriod);
          draw();
        });
      });
      transientBody.querySelector('[data-gsp-confirm-add]').addEventListener('click', () => {
        state.addCounter += 1;
        const item = {
          ...catalogueItem,
          id: `today-added-${state.addCounter}`,
          planned: false,
          userControlled: true,
          source: `${catalogueItem.sourceType} · Added by you`
        };
        state.items[targetPeriod].push(item);
        state.period = targetPeriod;
        state.index[targetPeriod] = visibleItems(targetPeriod).findIndex((candidate) => candidate.id === item.id);
        renderCarousel();
        dispatch('gsp:today-item-added', itemEventDetail(item, targetPeriod));
        resultSheet(`Added to ${periodNames[targetPeriod].toLowerCase()}`, 'It stays visible even if you reduce today’s pace.', `View ${periodNames[targetPeriod].toLowerCase()}`);
      });
      refreshIcons();
    };
    openTransient({ title: catalogueItem.title, copy: 'When should this appear?', body: '' });
    draw();
  };

  periodButtons.forEach((button, period) => {
    button.dataset.period = String(period);
    button.addEventListener('click', () => setPeriod(period));
  });

  carousel.addEventListener('scroll', () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => {
      const cards = [...carousel.querySelectorAll('.gtc-card[data-item-id]')];
      if (!cards.length) return;
      const focusPoint = carousel.scrollLeft + carousel.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Infinity;
      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - focusPoint);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      if (closestIndex !== state.index[state.period]) {
        state.index[state.period] = closestIndex;
        updateCue();
      }
    });
  }, { passive: true });

  carousel.addEventListener('click', (event) => {
    const card = event.target.closest('.gtc-card[data-item-id]');
    if (!card) return;
    const found = findItem(card.dataset.itemId);
    if (!found) return;
    if (event.target.closest('[data-gsp-item-menu]')) {
      event.preventDefault();
      event.stopPropagation();
      openItemMenu(found.item);
    }
    else if (event.target.closest('[data-gsp-card-action]')) openCardAction(found.item);
  });

  root.addEventListener('click', (event) => {
    const plan = event.target.closest('[data-gsp-open-plan]');
    if (plan) dispatch('gsp:route-request', { screen: 'plan', context: { source: 'today' } });
  });

  transientLayer.addEventListener('click', (event) => {
    if (event.target === transientLayer || event.target.closest('[data-gsp-flow-close]')) {
      closeTransient();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !transientLayer.hidden) {
      event.preventDefault();
      closeTransient();
    }
  });

  window.addEventListener('hashchange', () => {
    if (!transientLayer.hidden) closeTransient();
  });

  editDetails.addEventListener('toggle', () => {
    if (editDetails.open) renderEditSheet();
  });
  addDetails.addEventListener('toggle', () => {
    if (addDetails.open) renderAddSheet();
  });
  [editDetails, addDetails].forEach((details) => {
    const layer = details.querySelector('.gtc-sheet-layer');
    layer?.addEventListener('click', (event) => {
      if (event.target === layer) details.removeAttribute('open');
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (editDetails.open) editDetails.removeAttribute('open');
    if (addDetails.open) addDetails.removeAttribute('open');
  });

  const navButtons = [...root.querySelectorAll('.gtc-nav button')];
  navButtons.forEach((button) => {
    const screen = button.textContent.trim().toLowerCase();
    button.dataset.route = screen;
    button.addEventListener('click', (event) => {
      if (!event.defaultPrevented) dispatch('gsp:route-request', { screen, context: { source: 'bottom-navigation' } });
    });
  });

  const headerButtons = [...root.querySelectorAll('.gtc-header button')];
  const profileButton = headerButtons.find((button) => button.getAttribute('aria-label') === 'Open profile');
  const notificationButton = headerButtons.find((button) => button.getAttribute('aria-label') === 'Notifications');
  if (profileButton) profileButton.dataset.route = 'profile';
  if (notificationButton) notificationButton.dataset.route = 'notifications';

  const normalizeName = (value) => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');
  const externalAliases = new Map([
    ['food', 'diet'],
    ['water', 'hydration'],
    ['bowel', 'bowel movement'],
    ['bowel movements', 'bowel movement'],
    ['medication', 'medication supplements'],
    ['medications supplements', 'medication supplements']
  ]);
  const resolvePeriod = (period) => {
    if (Number.isInteger(period) && period >= 0 && period <= 3) return period;
    const normalized = normalizeName(period);
    const index = periodNames.findIndex((name) => normalizeName(name) === normalized);
    return index === -1 ? 0 : index;
  };
  const addExternalItem = (period, name) => {
    const requested = externalAliases.get(normalizeName(name)) || normalizeName(name);
    let match = null;
    let group = null;
    for (const candidateGroup of catalogue) {
      const candidate = candidateGroup.items.find((item) => normalizeName(item.title) === requested);
      if (candidate) {
        match = candidate;
        group = candidateGroup;
        break;
      }
    }
    if (!match || !group) {
      return {
        ok: false,
        error: 'unknown-item',
        requested: name,
        available: catalogue.flatMap((candidateGroup) => candidateGroup.items.map((item) => item.title))
      };
    }
    const targetPeriod = resolvePeriod(period);
    state.addCounter += 1;
    const item = {
      ...match,
      id: `today-added-${state.addCounter}`,
      planned: false,
      userControlled: true,
      sourceType: group.title,
      sourceRoute: 'track',
      source: `${group.title} · Added from Track`
    };
    state.items[targetPeriod].push(item);
    state.period = targetPeriod;
    state.index[targetPeriod] = visibleItems(targetPeriod).findIndex((candidate) => candidate.id === item.id);
    renderCarousel();
    const detail = itemEventDetail(item, targetPeriod, { origin: 'track' });
    dispatch('gsp:today-item-added', detail);
    return { ok: true, ...detail };
  };

  globalThis.GutsphereToday = {
    ...(globalThis.GutsphereToday || {}),
    addItem: addExternalItem
  };

  renderAddSheet();
  renderCarousel();
})();
