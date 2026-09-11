(() => {
      const root = document.getElementById('gutsphere-track-screen');
      const phone = root.querySelector('.gts-phone');
      const layer = root.querySelector('[data-sheet-layer]');
      const sheetContent = root.querySelector('[data-sheet-content]');
      const recentList = root.querySelector('[data-recent-list]');
      const planCarousel = root.querySelector('.gts-plan-carousel');
      const planCards = [...planCarousel.querySelectorAll('.gts-primary-card')];
      const planControls = root.querySelector('[data-plan-controls]');
      const planDots = [...planControls.querySelectorAll('.gts-dots span')];
      const planCount = planControls.querySelector('[data-plan-count]');
      const planPrev = planControls.querySelector('[data-plan-carousel="prev"]');
      const planNext = planControls.querySelector('[data-plan-carousel="next"]');
      const toastBox = root.querySelector('[data-toast-box]');
      let planIndex = 0;
      let pendingPlanAdvance = null;
      let lastTrigger = null;
      let activeTracker = '';
      let activeEditId = '';
      let sheetOrigin = 'main';
      let toastTimer;
      const entryStore = [...recentList.querySelectorAll('.gts-entry')].map(entry => ({
        id:entry.dataset.entryId,
        name:entry.querySelector('.gts-entry-meta').textContent.split(' · ').pop(),
        meta:entry.querySelector('.gts-entry-meta').textContent,
        summary:entry.querySelector('strong').textContent,
        detail:entry.querySelector('p').textContent
      }));
      const bm = { step: 1, stool: '', strain: '', empty: '' };
      const quickForms = {
        'Symptoms': { icon:'activity', question:'What changed?', copy:'Choose the closest symptom, then add the detail that matters.', options:['Bloating','Abdominal pain','Rectal discomfort','Nausea','Other'], label:'Add a short note', placeholder:'When it happened or what felt different' },
        'Treatment Adherence': { icon:'list-checks', question:'How did today’s care go?', copy:'Record what happened. This does not change clinician-directed care.', options:['Followed','Missed','Changed','Could not complete'], label:'Add context', placeholder:'What made it easier or harder?' },
        'Diet': { icon:'utensils', question:'What would you like to save?', copy:'Add a meal or meaningful food change when it may help answer your Plan.', options:['Meal','Snack','Drink','Food change'], label:'Food or meal', placeholder:'For example, breakfast with kiwi' }
      };
      const trackerGroups = [
        { name:'Body signals', icon:'activity', items:['Bowel Movement','Symptoms','Menstrual / Hormonal'] },
        { name:'Food and intake', icon:'utensils', items:['Diet','Hydration','Fasting','Food Sensitivity & Allergy'] },
        { name:'Daily context', icon:'sun', items:['Sleep','Stress & Mood','Movement'] },
        { name:'Care followed', icon:'heart-handshake', items:['Medication & Supplements','Treatment Adherence'] },
        { name:'Records and context', icon:'folder-heart', items:['Test Results','Biometrics & Demographics','Notes'] }
      ];
      const trackerInfo = {
        'Bowel Movement':['shapes','Stool type, straining, and whether you felt fully emptied.'],
        'Symptoms':['activity','Bloating, pain, nausea, blood, or another change.'],
        'Diet':['utensils','A meal or meaningful food change.'],
        'Hydration':['glass-water','Fluids when hydration is part of your Plan or question.'],
        'Sleep':['moon','Sleep as context beside symptoms and routines.'],
        'Stress & Mood':['brain','Stress or mood when it helps place changes in context.'],
        'Movement':['footprints','Planned movement or a meaningful activity change.'],
        'Medication & Supplements':['pill','What you took or missed, plus any effect you noticed.'],
        'Fasting':['timer','When a relevant fasting period began and ended.'],
        'Notes':['notebook-pen','Something important that does not fit elsewhere.'],
        'Menstrual / Hormonal':['calendar-heart','Cycle or hormonal context when it is relevant.'],
        'Food Sensitivity & Allergy':['wheat-off','A suspected sensitivity or known allergy response, kept separate.'],
        'Biometrics & Demographics':['ruler','Relevant background measures used for care context.'],
        'Treatment Adherence':['list-checks','What part of a care protocol you followed, missed, or could not complete.'],
        'Test Results':['file-check-2','A report with its date and source.']
      };

      const icons = () => { if (globalThis.lucide) globalThis.lucide.createIcons({ attrs:{ 'stroke-width': 1.5, 'aria-hidden': 'true' } }); };
      const head = (title, back = '') => `<header class="gts-sheet-head">${back ? `<button class="gts-back" type="button" aria-label="Go back" data-sheet-back="${back}"><i data-lucide="arrow-left" aria-hidden="true"></i></button>` : '<span></span>'}<h2 id="gts-sheet-title">${title}</h2><button class="gts-close" type="button" aria-label="Close"><i data-lucide="x" aria-hidden="true"></i></button></header>`;
      const showToast = (message) => { clearTimeout(toastTimer); toastBox.textContent = message; toastBox.classList.add('is-visible'); toastTimer = setTimeout(() => toastBox.classList.remove('is-visible'), 1800); };
      const openLayer = (trigger) => {
        if (layer.hidden && trigger) lastTrigger = trigger;
        layer.hidden = false;
        layer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => layer.querySelector('.gts-close')?.focus());
      };
      const closeLayer = () => {
        layer.hidden = true;
        layer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        sheetContent.innerHTML = '';
        if(pendingPlanAdvance!==null){
          const next = pendingPlanAdvance;
          pendingPlanAdvance = null;
          planCarouselTo(next);
          requestAnimationFrame(() => planCards[next].querySelector('.gts-main-cta')?.focus({preventScroll:true}));
        } else lastTrigger?.focus();
      };
      const render = (html) => { sheetContent.innerHTML = html; icons(); };
      root.appendChild(layer);
      layer.setAttribute('aria-hidden', 'true');

      function renderPicker(trigger){
        sheetOrigin = 'main';
        const groups = trackerGroups.map((group, index) => `<details class="gts-group" name="gts-evidence-groups" ${index===0?'open':''}><summary><span class="gts-group-icon"><i data-lucide="${group.icon}" aria-hidden="true"></i></span><span><strong>${group.name}</strong><small>${group.items.length} evidence types</small></span><i data-lucide="chevron-right" aria-hidden="true"></i></summary><div class="gts-tracker-list">${group.items.map(item => `<button class="gts-tracker-button" type="button" data-tracker="${item}"><i data-lucide="${trackerInfo[item][0]}" aria-hidden="true"></i><span>${item}</span><i data-lucide="chevron-right" aria-hidden="true"></i></button>`).join('')}</div></details>`).join('');
        render(`${head('All evidence')}<p class="gts-sheet-intro">Choose from 15 evidence types. Add only what helps answer a Plan or care question.</p><div class="gts-group-list">${groups}</div>`);
        openLayer(trigger);
      }

      function renderBowel(step = 1, trigger, origin = sheetOrigin){
        sheetOrigin = origin;
        bm.step = step;
        const stoolChoices = [
          ['1','Separate hard lumps'],['2','Lumpy and sausage-like'],['3','Sausage with cracks'],['4','Smooth and soft'],['5','Soft blobs'],['6','Mushy pieces'],['7','Watery']
        ];
        const progress = [1,2,3].map(n => `<span class="${n<=step?'is-done':''}"></span>`).join('');
        let body = '';
        if(step===1){
          body = `<div class="gts-step-meta">Step 1 of 3</div><h3 class="gts-question">What did the stool look like?</h3><p class="gts-question-copy">Choose the closest Bristol stool type.</p><div class="gts-choice-grid">${stoolChoices.map(([value,label]) => `<button class="gts-choice" type="button" data-bm-field="stool" data-bm-value="${value}" aria-pressed="${bm.stool===value}"><span class="gts-choice-number">${value}</span><span><b>Type ${value}</b><small>${label}</small></span></button>`).join('')}</div><div class="gts-sheet-actions"><button class="gts-sheet-primary" type="button" data-bm-next="2" ${bm.stool?'':'disabled'}>Next</button></div>`;
        } else if(step===2){
          body = `<div class="gts-step-meta">Step 2 of 3</div><h3 class="gts-question">How much did you strain?</h3><p class="gts-question-copy">Choose the closest answer.</p><div class="gts-choice-grid is-four">${['None','A little','Moderate','A lot'].map(value => `<button class="gts-choice" type="button" data-bm-field="strain" data-bm-value="${value}" aria-pressed="${bm.strain===value}"><span><b>${value}</b></span></button>`).join('')}</div><div class="gts-sheet-actions"><button class="gts-sheet-secondary" type="button" data-bm-next="1">Back</button><button class="gts-sheet-primary" type="button" data-bm-next="3" ${bm.strain?'':'disabled'}>Next</button></div>`;
        } else {
          body = `<div class="gts-step-meta">Step 3 of 3</div><h3 class="gts-question">Did you feel fully emptied afterward?</h3><p class="gts-question-copy">Choose yes, not sure, or no.</p><div class="gts-choice-grid is-three">${[['Yes','Yes'],['Not sure','Not sure'],['No','No']].map(([value,label]) => `<button class="gts-choice" type="button" data-bm-field="empty" data-bm-value="${value}" aria-pressed="${bm.empty===value}"><span class="gts-choice-number"><i data-lucide="${value==='Yes'?'check':value==='No'?'x':'circle-help'}" aria-hidden="true"></i></span><span><b>${label}</b></span></button>`).join('')}</div><div class="gts-sheet-actions"><button class="gts-sheet-secondary" type="button" data-bm-next="2">Back</button><button class="gts-sheet-primary" type="button" data-save-bm ${bm.empty?'':'disabled'}>Save bowel movement</button></div>`;
        }
        render(`${head('Bowel Movement', sheetOrigin==='picker' ? 'picker' : '')}<div class="gts-step-line">${progress}</div>${body}`);
        openLayer(trigger);
      }

      function renderNoBm(trigger){
        render(`${head('No bowel movement today?')}<p class="gts-sheet-intro">This records today without asking the bowel movement questions.</p><div class="gts-success-icon" style="margin-top:8px;background:var(--gts-blue-soft);color:var(--gts-blue)"><i data-lucide="calendar-minus" aria-hidden="true"></i></div><div class="gts-sheet-actions"><button class="gts-sheet-secondary" type="button" data-close-sheet>Cancel</button><button class="gts-sheet-primary" type="button" data-save-no-bm>Record no bowel movement</button></div>`);
        openLayer(trigger);
      }

      function renderTrackerForm(name, trigger, origin = 'main'){
        activeTracker = name;
        sheetOrigin = origin;
        if(name==='Bowel Movement'){ renderBowel(1, trigger, origin); return; }
        const quick = quickForms[name];
        if(quick){
          const options = quick.options.map(value => `<button class="gts-choice" type="button" data-form-choice="${value}" aria-pressed="false"><span class="gts-choice-number"><i data-lucide="${quick.icon}" aria-hidden="true"></i></span><span><b>${value}</b></span></button>`).join('');
          render(`${head(name,origin==='picker'?'picker':'')}<div class="gts-step-meta">Record now</div><h3 class="gts-question">${quick.question}</h3><p class="gts-question-copy">${quick.copy}</p><div class="gts-choice-grid">${options}</div><label class="gts-form-label" for="gts-quick-note">${quick.label}</label><textarea id="gts-quick-note" class="gts-textarea" placeholder="${quick.placeholder}"></textarea><div class="gts-sheet-actions"><button class="gts-sheet-link" type="button" data-schedule="${name}">Add to Today instead</button><button class="gts-sheet-primary" type="button" data-save-tracker="${name}" disabled>Save</button></div>`);
          openLayer(trigger);
          return;
        }
        const info = trackerInfo[name];
        const special = name==='Test Results' ? `<label class="gts-form-label" for="gts-generic-input">Test or report name</label><input id="gts-generic-input" class="gts-input" data-required-entry placeholder="For example, TSH result"><label class="gts-form-label" for="gts-generic-date">Date</label><input id="gts-generic-date" class="gts-input" type="date">` : name==='Notes' ? `<label class="gts-form-label" for="gts-generic-note">What would you like to remember?</label><textarea id="gts-generic-note" class="gts-textarea" data-required-entry placeholder="Add a short note"></textarea>` : `<label class="gts-form-label" for="gts-generic-input">What happened?</label><input id="gts-generic-input" class="gts-input" data-required-entry placeholder="Add the detail that matters">`;
        render(`${head(name,origin==='picker'?'picker':'')}<div class="gts-success-icon" style="margin-top:4px;background:var(--gts-blue-soft);color:var(--gts-blue)"><i data-lucide="${info[0]}" aria-hidden="true"></i></div><p class="gts-sheet-intro">${info[1]}</p>${special}<p class="gts-form-note">You can edit or remove this later.</p><div class="gts-sheet-actions"><button class="gts-sheet-link" type="button" data-schedule="${name}">Add to Today instead</button><button class="gts-sheet-primary" type="button" data-save-tracker="${name}" disabled>Save</button></div>`);
        openLayer(trigger);
      }

      function renderSchedule(name){
        activeTracker = name;
        render(`${head('Add to Today','tracker')}<div class="gts-step-meta">${name}</div><h3 class="gts-question">When should this appear?</h3><p class="gts-question-copy">Choose one part of your day. You can move or remove it later.</p><div class="gts-schedule-grid">${[['Morning','sunrise'],['Afternoon','sun'],['Evening','sunset'],['Night','moon']].map(([label,icon]) => `<button class="gts-schedule-option" type="button" data-time="${label}" aria-pressed="false"><i data-lucide="${icon}" aria-hidden="true"></i>${label}</button>`).join('')}</div><div class="gts-sheet-actions"><button class="gts-sheet-primary" type="button" data-confirm-schedule disabled>Add to Today</button></div>`);
      }

      function renderSuccess(title, copy, summary=''){
        render(`${head('Saved')}<div class="gts-success"><span class="gts-success-icon"><i data-lucide="check" aria-hidden="true"></i></span><h3>${title}</h3><p>${copy}</p>${summary?`<div class="gts-success-summary">${summary}</div>`:''}<div class="gts-sheet-actions"><button class="gts-sheet-primary" type="button" data-close-sheet>Done</button></div></div>`);
      }

      const escapeMarkup = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

      function addRecent(name, summary, detail, icon='circle-check'){
        const id = `new-${Date.now()}`;
        const record = { id, name, meta:`Now · ${name}`, summary, detail, icon };
        entryStore.unshift(record);
        const entry = document.createElement('article');
        entry.className = 'gts-entry';
        entry.dataset.entryId = id;
        entry.innerHTML = `<span class="gts-entry-icon"><i data-lucide="${icon}" aria-hidden="true"></i></span><div><span class="gts-entry-meta">${escapeMarkup(record.meta)}</span><strong>${escapeMarkup(summary)}</strong><p>${escapeMarkup(detail)}</p></div><button class="gts-edit" type="button" data-edit="${id}">Edit</button>`;
        recentList.prepend(entry);
        while(recentList.children.length>3) recentList.lastElementChild.remove();
        icons();
        return id;
      }

      function markPlanRecorded(name,id){
        const card = planCards.find(item => item.dataset.planTracker===name);
        if(!card) return;
        const alreadyRecorded = card.classList.contains('is-recorded');
        const index = planCards.indexOf(card);
        card.classList.add('is-recorded');
        card.dataset.planEntryId = id;
        card.querySelector('[data-plan-status]').textContent = 'Recorded today';
        card.querySelector('[data-plan-action-label]').textContent = 'Record again';
        const editButton = card.querySelector('[data-plan-edit], .gts-secondary-cta');
        editButton.hidden = false;
        editButton.removeAttribute('data-open');
        editButton.setAttribute('data-plan-edit','');
        editButton.dataset.edit = id;
        editButton.textContent = 'Edit latest';
        if(!alreadyRecorded && index<planCards.length-1) pendingPlanAdvance = index+1;
      }

      function resetPlanCard(name){
        const card = planCards.find(item => item.dataset.planTracker===name);
        if(!card) return;
        const defaultActions = { 'Bowel Movement':'Record bowel movement', 'Treatment Adherence':'Record today’s care', 'Symptoms':'Record symptom' };
        card.classList.remove('is-recorded');
        delete card.dataset.planEntryId;
        card.querySelector('[data-plan-status]').textContent = 'Plan evidence';
        card.querySelector('[data-plan-action-label]').textContent = defaultActions[name];
        const editButton = card.querySelector('[data-plan-edit], .gts-secondary-cta');
        editButton.removeAttribute('data-edit');
        if(name==='Bowel Movement'){
          editButton.removeAttribute('data-plan-edit');
          editButton.dataset.open = 'no-bm';
          editButton.textContent = 'No bowel movement today';
        } else editButton.hidden = true;
      }

      function renderEdit(id, trigger){
        activeEditId = id;
        const record = entryStore.find(item => item.id===id);
        if(!record) return;
        render(`${head('Edit evidence')}<p class="gts-sheet-intro">${escapeMarkup(record.meta)}</p><label class="gts-form-label" for="gts-edit-summary">Summary</label><input id="gts-edit-summary" class="gts-input" value="${escapeMarkup(record.summary)}"><label class="gts-form-label" for="gts-edit-detail">Detail</label><textarea id="gts-edit-detail" class="gts-textarea">${escapeMarkup(record.detail)}</textarea><div class="gts-sheet-actions"><button class="gts-sheet-primary" type="button" data-save-edit>Save changes</button><button class="gts-delete" type="button" data-delete-entry>Delete entry</button></div>`);
        openLayer(trigger);
      }

      function renderDeleteConfirm(){
        render(`${head('Delete this entry?','edit')}<p class="gts-sheet-intro">This removes it from your evidence history.</p><div class="gts-success-icon" style="margin-top:6px;background:var(--gts-blush);color:var(--gs-color-critical)"><i data-lucide="trash-2" aria-hidden="true"></i></div><div class="gts-sheet-actions"><button class="gts-sheet-secondary" type="button" data-sheet-back="edit">Keep entry</button><button class="gts-sheet-primary" style="background:var(--gs-color-critical)" type="button" data-confirm-delete>Delete entry</button></div>`);
      }

      function renderHistory(trigger){
        const rows = entryStore.map(record => `<div class="gts-history-item"><b>${escapeMarkup(record.meta)}</b><span>${escapeMarkup(record.summary)} · ${escapeMarkup(record.detail)}</span></div>`).join('');
        render(`${head('Evidence history')}<p class="gts-sheet-intro">Recent entries stay editable. Journey carries their meaning forward.</p><div class="gts-history-list">${rows}</div>`);
        openLayer(trigger);
      }

      function updatePlanPosition(){
        planCount.textContent = `${planIndex+1} of ${planCards.length}`;
        planDots.forEach((dot,i) => dot.classList.toggle('is-active',i===planIndex));
        planPrev.disabled = planIndex===0;
        planNext.disabled = planIndex===planCards.length-1;
      }

      function planCarouselTo(next){
        planIndex = Math.max(0,Math.min(planCards.length-1,next));
        const behavior = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
        planCards[planIndex].scrollIntoView({ behavior, block:'nearest', inline:'start' });
        updatePlanPosition();
      }

      const onUiClick = (event) => {
        const button = event.target.closest('button');
        if(!button) return;
        if(button.classList.contains('gts-close') || button.hasAttribute('data-close-sheet')){ closeLayer(); return; }
        if(button.dataset.toast){ showToast(button.dataset.toast); return; }
        if(button.dataset.destination){ showToast(`${button.dataset.destination} opens from this tab`); return; }
        if(button.dataset.open==='picker'){ renderPicker(button); return; }
        if(button.dataset.open==='bowel'){ bm.step=1; bm.stool=''; bm.strain=''; bm.empty=''; renderBowel(1,button,'main'); return; }
        if(button.dataset.open==='no-bm'){ renderNoBm(button); return; }
        if(button.dataset.open==='history'){ renderHistory(button); return; }
        if(button.dataset.planCarousel){ planCarouselTo(planIndex+(button.dataset.planCarousel==='next'?1:-1)); return; }
        if(button.dataset.tracker){ renderTrackerForm(button.dataset.tracker,button,layer.hidden?'main':'picker'); return; }
        if(button.dataset.bmField){ bm[button.dataset.bmField]=button.dataset.bmValue; renderBowel(bm.step); return; }
        if(button.dataset.bmNext){ renderBowel(Number(button.dataset.bmNext)); return; }
        if(button.hasAttribute('data-save-bm')){ const emptyLabel=bm.empty==='No'?'Did not feel fully emptied':bm.empty==='Yes'?'Felt fully emptied':'Not sure about emptying'; const id=addRecent('Bowel Movement',`Type ${bm.stool} · ${bm.strain} strain`,emptyLabel,'shapes'); markPlanRecorded('Bowel Movement',id); renderSuccess('Bowel movement saved','It can now be compared with other entries in your current Plan.',`Type ${bm.stool} · ${bm.strain} strain · ${emptyLabel}`); return; }
        if(button.hasAttribute('data-save-no-bm')){ const id=addRecent('Bowel Movement','No bowel movement today','Recorded for today','calendar-minus'); markPlanRecorded('Bowel Movement',id); renderSuccess('Saved','Today is marked as no bowel movement.'); return; }
        if(button.dataset.formChoice){ sheetContent.querySelectorAll('[data-form-choice]').forEach(choice => choice.setAttribute('aria-pressed',String(choice===button))); sheetContent.querySelector('[data-save-tracker]').disabled=false; return; }
        if(button.dataset.schedule){ renderSchedule(button.dataset.schedule); icons(); return; }
        if(button.dataset.time){ sheetContent.querySelectorAll('[data-time]').forEach(choice => choice.setAttribute('aria-pressed',String(choice===button))); sheetContent.querySelector('[data-confirm-schedule]').disabled=false; return; }
        if(button.hasAttribute('data-confirm-schedule')){ const chosen=sheetContent.querySelector('[data-time][aria-pressed="true"]')?.dataset.time || 'Today'; renderSuccess('Added to Today',`${activeTracker} will appear in ${chosen.toLowerCase()}.`); return; }
        if(button.dataset.saveTracker){ const selected=sheetContent.querySelector('[data-form-choice][aria-pressed="true"]')?.dataset.formChoice; const typed=sheetContent.querySelector('[data-required-entry]')?.value.trim(); const summary=selected || typed || 'Entry added'; const id=addRecent(button.dataset.saveTracker,summary,'Added just now',trackerInfo[button.dataset.saveTracker][0]); markPlanRecorded(button.dataset.saveTracker,id); renderSuccess(`${button.dataset.saveTracker} saved`,'This entry is now part of your evidence history.',summary); return; }
        if(button.dataset.edit){ renderEdit(button.dataset.edit,button); return; }
        if(button.hasAttribute('data-save-edit')){ const summary=sheetContent.querySelector('#gts-edit-summary').value; const detail=sheetContent.querySelector('#gts-edit-detail').value; const record=entryStore.find(item=>item.id===activeEditId); if(record){ record.summary=summary; record.detail=detail; } const entry=recentList.querySelector(`[data-entry-id="${activeEditId}"]`); if(entry){ entry.querySelector('strong').textContent=summary; entry.querySelector('p').textContent=detail; } renderSuccess('Changes saved','The corrected entry will be used from now on.'); return; }
        if(button.hasAttribute('data-delete-entry')){ renderDeleteConfirm(); icons(); return; }
        if(button.hasAttribute('data-confirm-delete')){ const index=entryStore.findIndex(item=>item.id===activeEditId); const removed=index>=0?entryStore.splice(index,1)[0]:null; recentList.querySelector(`[data-entry-id="${activeEditId}"]`)?.remove(); if(removed){ const card=planCards.find(item=>item.dataset.planTracker===removed.name && item.dataset.planEntryId===activeEditId); if(card) resetPlanCard(removed.name); } renderSuccess('Entry deleted','It was removed from your evidence history.'); return; }
        if(button.dataset.sheetBack==='picker'){ renderPicker(); return; }
        if(button.dataset.sheetBack==='tracker'){ renderTrackerForm(activeTracker,null,sheetOrigin); return; }
        if(button.dataset.sheetBack==='edit'){ renderEdit(activeEditId); return; }
      };

      root.addEventListener('click', onUiClick);

      const onUiInput = (event) => {
        if(!event.target.matches('[data-required-entry]')) return;
        const save = sheetContent.querySelector('[data-save-tracker]');
        if(save) save.disabled = !event.target.value.trim();
      };
      root.addEventListener('input', onUiInput);
      layer.addEventListener('click', event => { if(event.target===layer) closeLayer(); });
      document.addEventListener('keydown', event => { if(event.key==='Escape' && !layer.hidden) closeLayer(); });
      window.addEventListener('hashchange', () => { if (!layer.hidden) closeLayer(); });
      planCarousel.addEventListener('scroll', () => {
        const left = planCarousel.getBoundingClientRect().left;
        const nearest = planCards.reduce((best,card,index) => Math.abs(card.getBoundingClientRect().left-left)<best.distance?{index,distance:Math.abs(card.getBoundingClientRect().left-left)}:best,{index:0,distance:Infinity});
        if(nearest.index!==planIndex){ planIndex=nearest.index; updatePlanPosition(); }
      }, { passive:true });

      const tweakState = { cardRadius:28, planPeek:38 };
      const applyTweak = () => { root.style.setProperty('--gts-card-radius','var(--gs-radius-feature)'); planCards.forEach(card => card.style.flexBasis=`calc(100% - ${tweakState.planPeek}px)`); };
      applyTweak();
      updatePlanPosition();
      if(globalThis.Tweak){ const tweak=new Tweak({container:phone,onChange:applyTweak}); tweak.addSlider(tweakState,'cardRadius',{label:'Primary card radius',min:20,max:34,unit:'px',reference:'track.primary-radius'}); tweak.addSlider(tweakState,'planPeek',{label:'Next Plan card peek',min:28,max:54,unit:'px',reference:'track.plan-peek'}); }
      icons();
    })();
