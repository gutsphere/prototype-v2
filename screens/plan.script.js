(() => {
      const root=document.getElementById('gutsphere-plan-roadmap');
      const overlay=root.querySelector('#gpm-overlay');
      const kicker=root.querySelector('#gpm-sheet-kicker');
      const title=root.querySelector('#gpm-sheet-title');
      const body=root.querySelector('#gpm-sheet-body');
      const startButton=root.querySelector('#gpm-start');
      const startMarker=root.querySelector('#gpm-start-marker');
      const objectiveTitle=root.querySelector('#gpm-objective');
      const nodes=[...root.querySelectorAll('[data-week]')];
      const state={objective:'Less straining, without more bloating.',pace:'Balanced',selectedWeek:1,currentWeek:1,activeItemId:null,replaceItemId:null};
      const weeks=[
        {milestone:'Milestone 1 · Build a clear baseline',title:'Begin after breakfast',evidence:'Start 15 to 45 minutes after breakfast. Put your feet on a small stool, relax, and avoid forcing. Then record straining and whether you felt fully emptied.',items:[{id:'w1-window',source:'Self care',sourceKey:'self',icon:'sunrise',title:'Bathroom attempt 15–45 min after breakfast',time:'Morning',days:'5 days'}]},
        {milestone:'Milestone 1 · Build a clear baseline',title:'Repeat without another change',evidence:'Keep breakfast, current medicines, and the bathroom routine steady. This helps show whether the routine changed straining or bloating.',items:[{id:'w2-repeat',source:'Plan experiment',sourceKey:'review',icon:'repeat-2',title:'Repeat the same morning routine',time:'Morning',days:'5 days'}]},
        {milestone:'Milestone 2 · Test one practical change',title:'Check stool form and emptying',evidence:'After the next three bowel movements, choose the stool type and record whether you still felt blocked or not fully emptied.',items:[{id:'w3-pattern',source:'Evidence check',sourceKey:'review',icon:'clipboard-list',title:'Record stool type and incomplete emptying',time:'After bathroom',days:'3 times'}]},
        {milestone:'Milestone 2 · Test one practical change',title:'Prepare a pelvic floor care question',evidence:'Continued straining with stool that is not hard can be a reason to ask about pelvic floor evaluation. This pattern does not diagnose the cause.',items:[{id:'w4-question',source:'Clinical care',sourceKey:'care',icon:'message-square-text',title:'Ask if pelvic floor coordination should be checked',time:'Before your visit',days:'Once'}]},
        {milestone:'Milestone 3 · Review and carry it forward',title:'Keep only the step that helped',evidence:'Continue the after-breakfast routine only if repeated days show less straining without more bloating. Keep current medicines unchanged unless your care team changes them.',items:[{id:'w5-keep',source:'Plan review',sourceKey:'review',icon:'list-checks',title:'Continue the helpful routine',time:'Morning',days:'Based on response'}]},
        {milestone:'Milestone 3 · Review and carry it forward',title:'Compare straining and bloating',evidence:'Compare the same measures used at the start: days with straining, bloating from 0 to 10, and the feeling of incomplete emptying.',items:[{id:'w6-measure',source:'Plan review',sourceKey:'review',icon:'clipboard-check',title:'Repeat your starting measures',time:'End of week',days:'Once'}]}
      ];
      const sources={
        self:{label:'Self care',icon:'leaf',description:'Choose a constipation routine.',note:'Add one at a time so its effect is easier to understand.',items:[{icon:'sunrise',title:'Bathroom attempt 15–45 min after breakfast',time:'Morning',days:'5 days'},{icon:'footprints',title:'Use a footstool and relaxed posture',time:'During bathroom attempt',days:'5 days'},{icon:'door-open',title:'Respond to the urge without delaying',time:'When the urge appears',days:'As needed'}]},
        care:{label:'Care',icon:'stethoscope',description:'Add a constipation care step.',note:'Only add medicine or treatment already chosen with your care team. Gutsphere does not prescribe or change it.',items:[{subsource:'Care complement',icon:'pill',title:'Add your current constipation medicine schedule',time:'Your set time',days:'As directed'},{subsource:'Clinical care',icon:'message-square-text',title:'Prepare a pelvic floor evaluation question',time:'Before your visit',days:'Once'},{subsource:'Clinical care',icon:'clipboard-list',title:'Prepare a medication review question',time:'Before your visit',days:'Once'}]},
        chat:{label:'Specialist chat',icon:'messages-square',description:'Ask about a specific constipation question.',note:'Guidance only. It does not diagnose or replace your care team.',items:[{icon:'message-circle',title:'Ask why straining may persist',time:'Anytime',days:'Once'},{icon:'apple',title:'Ask about fiber without more bloating',time:'Anytime',days:'Once'},{icon:'activity',title:'Ask about difficult emptying',time:'Anytime',days:'Once'}]}
      };

      const refreshIcons=()=>{ if(globalThis.lucide) globalThis.lucide.createIcons({attrs:{'stroke-width':1.5,'aria-hidden':'true'}}); };
      const escapeText=value=>String(value).replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[character]));
      const closeSheet=()=>{overlay.classList.remove('is-open');overlay.setAttribute('aria-hidden','true');};
      const openSheet=()=>{overlay.classList.add('is-open');overlay.setAttribute('aria-hidden','false');refreshIcons();};
      const setSheet=(kickerText,titleText,markup)=>{kicker.textContent=kickerText;title.textContent=titleText;body.innerHTML=markup;openSheet();};
      const backButton=(label='Back')=>`<button class="gpm-text-button" type="button" data-back>${label}</button>`;

      const showWeek=(index)=>{
        state.selectedWeek=index;
        const week=weeks[index];
        const first=week.items[0];
        const actionMarkup=first?`<div class="gpm-sheet-action"><div class="gpm-sheet-action-label">First thing to do</div><p>${escapeText(first.title)}</p><div class="gpm-sheet-meta"><span><i data-lucide="clock-3" aria-hidden="true"></i>${escapeText(first.time)}</span><span><i data-lucide="calendar-check" aria-hidden="true"></i>${escapeText(first.days)}</span></div></div>`:`<div class="gpm-sheet-action"><div class="gpm-sheet-action-label">Nothing scheduled</div><p>Add what would help this week.</p></div>`;
        setSheet(`Week ${index+1} · ${week.milestone}`,week.title,`${actionMarkup}<p class="gpm-evidence"><i data-lucide="line-chart" aria-hidden="true"></i><span>${week.evidence}</span></p><div class="gpm-sheet-actions"><button class="gpm-main-button" type="button" data-manage>Manage this week${week.items.length?` · ${week.items.length}`:''}</button><button class="gpm-text-button" type="button" data-edit-plan>Edit whole Plan</button>${backButton('Back to Plan')}</div>`);
        body.querySelector('[data-manage]').addEventListener('click',showWeekEditor);
        body.querySelector('[data-edit-plan]').addEventListener('click',showEdit);
        body.querySelector('[data-back]').addEventListener('click',closeSheet);
      };

      const showWeekEditor=()=>{
        const week=weeks[state.selectedWeek];
        const items=week.items.length?week.items.map(item=>`<div class="gpm-plan-item"><span class="gpm-item-icon"><i data-lucide="${item.icon}" aria-hidden="true"></i></span><span class="gpm-item-copy"><span class="gpm-item-source">${escapeText(item.source)}</span><strong>${escapeText(item.title)}</strong><small>${escapeText(item.time)} · ${escapeText(item.days)}</small></span><button class="gpm-more-button" type="button" aria-label="Change or remove ${escapeText(item.title)}" data-item="${item.id}"><i data-lucide="more-horizontal" aria-hidden="true"></i></button></div>`).join(''):'<p class="gpm-confirm-copy">Nothing is planned for this week yet.</p>';
        setSheet(`Week ${state.selectedWeek+1} controls`,'What belongs in this week?',`<div class="gpm-item-list">${items}</div><button class="gpm-add-button" type="button" data-add><i data-lucide="plus" aria-hidden="true"></i>Add to this week</button><div class="gpm-sheet-actions"><button class="gpm-main-button" type="button" data-week-view>View this week</button>${backButton('Back to Plan')}</div>`);
        body.querySelectorAll('[data-item]').forEach(button=>button.addEventListener('click',()=>showItemControls(button.dataset.item)));
        body.querySelector('[data-add]').addEventListener('click',()=>{state.replaceItemId=null;showSourcePicker();});
        body.querySelector('[data-week-view]').addEventListener('click',()=>showWeek(state.selectedWeek));
        body.querySelector('[data-back]').addEventListener('click',closeSheet);
      };

      const showItemControls=itemId=>{
        const item=weeks[state.selectedWeek].items.find(entry=>entry.id===itemId);
        if(!item)return;
        state.activeItemId=itemId;
        setSheet(`Week ${state.selectedWeek+1} · ${item.source}`,item.title,`<div class="gpm-control-list"><button class="gpm-control-button" type="button" data-control="timing"><span>Change timing</span><i data-lucide="clock-3" aria-hidden="true"></i></button><button class="gpm-control-button" type="button" data-control="replace"><span>Choose something else</span><i data-lucide="repeat-2" aria-hidden="true"></i></button><button class="gpm-control-button gpm-remove" type="button" data-control="remove"><span>Remove from Plan</span><i data-lucide="trash-2" aria-hidden="true"></i></button></div><div class="gpm-sheet-actions">${backButton('Back to week')}</div>`);
        body.querySelector('[data-control="timing"]').addEventListener('click',showTiming);
        body.querySelector('[data-control="replace"]').addEventListener('click',()=>{state.replaceItemId=itemId;showSourcePicker();});
        body.querySelector('[data-control="remove"]').addEventListener('click',showRemoveConfirm);
        body.querySelector('[data-back]').addEventListener('click',showWeekEditor);
      };

      const showTiming=()=>{
        const item=weeks[state.selectedWeek].items.find(entry=>entry.id===state.activeItemId);
        if(!item)return;
        const options=['Morning','Afternoon','Evening','Night'];
        setSheet(`Week ${state.selectedWeek+1}`,'When should this appear?',`<p class="gpm-section-note">${escapeText(item.title)}</p><div class="gpm-choice-list">${options.map(option=>`<button class="gpm-choice" type="button" aria-pressed="${item.time===option}" data-time="${option}"><span>${option}</span><i data-lucide="check" aria-hidden="true"></i></button>`).join('')}</div><div class="gpm-sheet-actions"><button class="gpm-main-button" type="button" data-save-time>Save timing</button>${backButton('Back')}</div>`);
        body.querySelectorAll('[data-time]').forEach(button=>button.addEventListener('click',()=>{body.querySelectorAll('[data-time]').forEach(choice=>choice.setAttribute('aria-pressed','false'));button.setAttribute('aria-pressed','true');}));
        body.querySelector('[data-save-time]').addEventListener('click',()=>{const selected=body.querySelector('[data-time][aria-pressed="true"]');if(selected)item.time=selected.dataset.time;showWeekEditor();});
        body.querySelector('[data-back]').addEventListener('click',()=>showItemControls(state.activeItemId));
      };

      const showRemoveConfirm=()=>{
        const week=weeks[state.selectedWeek];
        const item=week.items.find(entry=>entry.id===state.activeItemId);
        if(!item)return;
        setSheet(`Week ${state.selectedWeek+1}`,'Remove this from your Plan?',`<p class="gpm-confirm-copy">${escapeText(item.title)} will be removed from this week. Nothing else will change.</p><div class="gpm-sheet-actions"><button class="gpm-control-button gpm-remove" type="button" data-confirm-remove><span>Remove from Plan</span><i data-lucide="trash-2" aria-hidden="true"></i></button><button class="gpm-main-button" type="button" data-keep>Keep it</button></div>`);
        body.querySelector('[data-confirm-remove]').addEventListener('click',()=>{week.items=week.items.filter(entry=>entry.id!==state.activeItemId);state.activeItemId=null;showWeekEditor();});
        body.querySelector('[data-keep]').addEventListener('click',()=>showItemControls(state.activeItemId));
      };

      const showSourcePicker=()=>{
        setSheet(`Add to Week ${state.selectedWeek+1}`,state.replaceItemId?'Choose a replacement':'Where should it come from?',`<div class="gpm-source-list">${Object.entries(sources).map(([key,source])=>`<button class="gpm-source-choice" type="button" data-source="${key}"><span class="gpm-source-icon"><i data-lucide="${source.icon}" aria-hidden="true"></i></span><span class="gpm-source-copy"><strong>${source.label}</strong><span>${source.description}</span></span><i data-lucide="chevron-right" aria-hidden="true"></i></button>`).join('')}</div><div class="gpm-sheet-actions">${backButton('Back to week')}</div>`);
        body.querySelectorAll('[data-source]').forEach(button=>button.addEventListener('click',()=>showCatalog(button.dataset.source)));
        body.querySelector('[data-back]').addEventListener('click',showWeekEditor);
      };

      const showCatalog=sourceKey=>{
        const source=sources[sourceKey];
        setSheet(source.label,'Choose one thing',`<div class="gpm-source-list">${source.items.map((item,index)=>`<button class="gpm-source-choice" type="button" data-catalog-item="${index}"><span class="gpm-source-icon"><i data-lucide="${item.icon}" aria-hidden="true"></i></span><span class="gpm-source-copy"><strong>${item.title}</strong><span>${item.time} · ${item.days}</span></span><i data-lucide="plus" aria-hidden="true"></i></button>`).join('')}</div><p class="gpm-section-note">${source.note}</p><div class="gpm-sheet-actions">${backButton('Choose another section')}</div>`);
        body.querySelectorAll('[data-catalog-item]').forEach(button=>button.addEventListener('click',()=>addOrReplaceItem(sourceKey,Number(button.dataset.catalogItem))));
        body.querySelector('[data-back]').addEventListener('click',showSourcePicker);
      };

      const addOrReplaceItem=(sourceKey,index)=>{
        const source=sources[sourceKey];
        const chosen=source.items[index];
        const item={id:`item-${Date.now()}`,source:chosen.subsource||source.label,sourceKey,icon:chosen.icon,title:chosen.title,time:chosen.time,days:chosen.days};
        const week=weeks[state.selectedWeek];
        if(state.replaceItemId){const replaceIndex=week.items.findIndex(entry=>entry.id===state.replaceItemId);if(replaceIndex>=0)week.items.splice(replaceIndex,1,item);}
        else week.items.push(item);
        state.replaceItemId=null;
        showWeekEditor();
      };

      const showEdit=()=>{
        setSheet('Plan controls','What would you like to change?','<div class="gpm-edit-list"><button class="gpm-edit-choice" type="button" data-setting="objective"><span>Objective and measures</span><i data-lucide="chevron-right" aria-hidden="true"></i></button><button class="gpm-edit-choice" type="button" data-setting="pace"><span>Weekly pace</span><i data-lucide="chevron-right" aria-hidden="true"></i></button><button class="gpm-edit-choice" type="button" data-setting="actions"><span>Actions and timing</span><i data-lucide="chevron-right" aria-hidden="true"></i></button></div><div class="gpm-sheet-actions"><button class="gpm-main-button" type="button" data-return>Back to Plan</button></div>');
        body.querySelector('[data-setting="objective"]').addEventListener('click',showObjective);
        body.querySelector('[data-setting="pace"]').addEventListener('click',showPace);
        body.querySelector('[data-setting="actions"]').addEventListener('click',showWeekEditor);
        body.querySelector('[data-return]').addEventListener('click',closeSheet);
      };

      const showObjective=()=>{
        setSheet('Plan objective','What should this Plan help with?',`<p class="gpm-section-note">Keep it specific enough to compare before and after.</p><textarea class="gpm-textarea" id="gpm-objective-input" aria-label="Plan objective">${escapeText(state.objective)}</textarea><div class="gpm-sheet-actions"><button class="gpm-main-button" type="button" data-save-objective>Save objective</button>${backButton('Back')}</div>`);
        body.querySelector('[data-save-objective]').addEventListener('click',()=>{const value=root.querySelector('#gpm-objective-input').value.trim();if(value){state.objective=value;objectiveTitle.textContent=value;}showEdit();});
        body.querySelector('[data-back]').addEventListener('click',showEdit);
      };

      const showPace=()=>{
        const choices=[['Light','3 action days each week'],['Balanced','5 action days each week'],['Every day','7 action days each week']];
        setSheet('Weekly pace','How full should each week feel?',`<div class="gpm-choice-list">${choices.map(([value,label])=>`<button class="gpm-choice" type="button" aria-pressed="${state.pace===value}" data-pace="${value}"><span>${value} · ${label}</span><i data-lucide="check" aria-hidden="true"></i></button>`).join('')}</div><p class="gpm-section-note">The Plan stays six weeks. This changes how often routine actions appear.</p><div class="gpm-sheet-actions"><button class="gpm-main-button" type="button" data-save-pace>Save pace</button>${backButton('Back')}</div>`);
        body.querySelectorAll('[data-pace]').forEach(button=>button.addEventListener('click',()=>{body.querySelectorAll('[data-pace]').forEach(choice=>choice.setAttribute('aria-pressed','false'));button.setAttribute('aria-pressed','true');}));
        body.querySelector('[data-save-pace]').addEventListener('click',()=>{const selected=body.querySelector('[data-pace][aria-pressed="true"]');if(selected){state.pace=selected.dataset.pace;const days=state.pace==='Light'?'3 days':state.pace==='Every day'?'7 days':'5 days';weeks.forEach(week=>week.items.forEach(item=>{if(item.sourceKey==='self')item.days=days;}));}showEdit();});
        body.querySelector('[data-back]').addEventListener('click',showEdit);
      };

      const showStart=()=>{
        setSheet('Ready for your approval','Start this six-week Plan?','<div class="gpm-ready-list"><div class="gpm-ready-row"><i data-lucide="target" aria-hidden="true"></i>Starting point saved</div><div class="gpm-ready-row"><i data-lucide="calendar-check" aria-hidden="true"></i>First week ready</div><div class="gpm-ready-row"><i data-lucide="shield-check" aria-hidden="true"></i>Current care left in place</div></div><div class="gpm-sheet-actions"><button class="gpm-main-button" type="button" data-confirm-start>Start my Plan</button><button class="gpm-secondary-button" type="button" data-edit-plan><i data-lucide="sliders-horizontal" aria-hidden="true"></i>Edit before starting</button><button class="gpm-text-button" type="button" data-return>Back to Plan</button></div>');
        body.querySelector('[data-return]').addEventListener('click',closeSheet);
        body.querySelector('[data-edit-plan]').addEventListener('click',showEdit);
        body.querySelector('[data-confirm-start]').addEventListener('click',()=>{
          closeSheet();
          startButton.disabled=true;
          startButton.innerHTML='Plan started <i data-lucide="check" aria-hidden="true"></i>';
          if(startMarker) startMarker.textContent='Started today';
          refreshIcons();
        });
      };

      nodes.forEach(node=>node.addEventListener('click',()=>showWeek(Number(node.dataset.week))));
      root.querySelector('#gpm-edit-bottom').addEventListener('click',showEdit);
      root.querySelector('#gpm-close').addEventListener('click',closeSheet);
      startButton.addEventListener('click',showStart);
      overlay.addEventListener('click',event=>{if(event.target===overlay)closeSheet();});
      refreshIcons();
    })();
