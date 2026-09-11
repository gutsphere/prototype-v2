(() => {
      const root = document.getElementById('gutsphere-care-screen');
      const phone = root.querySelector('.gcs-phone');
      const main = root.querySelector('[data-main]');
      const views = [...root.querySelectorAll('[data-view]')];
      const flow = root.querySelector('[data-flow-content]');
      const homeLeft = root.querySelector('[data-home-left]');
      const back = root.querySelector('[data-back]');
      const headerTitle = root.querySelector('[data-header-title]');
      const headerSubtitle = root.querySelector('[data-header-subtitle]');
      const toastBox = root.querySelector('[data-toast-box]');
      let currentView = 'home';
      let flowReturn = 'home';
      let toastTimer;
      let selfCareInPlan = false;
      let selfCarePaused = false;
      let selfCareMinutes = '10 minutes';
      let selfCareKey = 'timing';
      let visitStep = 1;
      let visitReady = false;
      let visitContextState = [true,true,true];
      let visitQuestionState = [true,true,false];
      let careRecorded = '';
      let carePaused = false;
      let adherenceChoice = '';
      let barrierChoice = '';
      let selectedMoment = '';
      let selectedMomentItemId = '';
      let supportIndex = 0;
      let selfCatalogueIndex = 0;
      let clinicalTab = 'visit';
      let carePlanIndex = 0;
      let medicationRecorded = false;
      let treatmentRecorded = false;
      let treatmentAdherenceChoice = '';
      let treatmentBarrierChoice = '';
      let selectedCareItemType = '';

      const titles = {
        home:['Care','Support for where you are now'],
        selfcare:['Self-care','Choose one useful next step'],
        visit:['Clinical navigation','Visits, tests & procedures'],
        careplan:['Support your care plan','Between visits and reviews']
      };

      const selfCareRoutines = {
        timing:{title:'Try a morning bowel window',lead:'On 5 of your last 7 recorded days, an urge appeared after breakfast. Your goal is to strain less.',fit:'Breakfast is already a repeated cue in your entries.',steps:['Finish breakfast','Up to 10 minutes','Avoid forcing'],details:[['Use your breakfast cue','Sit within 30 minutes after breakfast.'],['Keep it unhurried','with your feet supported and without forcing.'],['Notice only what matters','Straining and whether you felt fully emptied.']],minutes:'10 minutes',adapt:['5 minutes','10 minutes','Choose each day']},
        relax:{title:'Use less effort before a bowel movement',lead:'Review a brief guided relaxation that creates a calmer start without changing your clinical care.',fit:'Straining appears often in your entries, even on days when stool was soft.',steps:['Settle your posture','5 gentle minutes','Notice effort'],details:[['Settle your posture','Support your feet and let your shoulders soften.'],['Breathe gently','of comfortable breathing without holding or forcing.'],['Notice only what matters','Record straining and whether the effort felt different.']],minutes:'5 minutes',adapt:['3 minutes','5 minutes','8 minutes']},
        comfort:{title:'Respond to afternoon bloating',lead:'Review a short, gentle comfort routine for the time bloating appears most often.',fit:'Bloating was recorded most often after your afternoon meal.',steps:['After the meal','8-minute gentle walk','Notice bloating'],details:[['Use your afternoon cue','Begin when you feel comfortable after the meal.'],['Keep it gentle','at an easy walking pace.'],['Notice only what matters','Record whether bloating felt lower, similar, or higher.']],minutes:'8 minutes',adapt:['5 minutes','8 minutes','12 minutes']}
      };

      let supportItems = [
        {id:'visit',category:'Visit preparation',state:'Active',time:'5 days',icon:'calendar',title:'GI visit in 5 days',copy:'Your bowel pattern and treatments are gathered. Review 2 questions before September 8.',meta:'Dr. Rao<br>10:30 AM',action:'Continue preparation',open:'visit-prep',view:'visit'},
        {id:'self-timing',category:'Self-care',state:'Saved for me',time:'7-day trial',icon:'sprout',title:'Morning bowel routine',copy:'A routine matched to your after-breakfast pattern is waiting for your review.',meta:'Saved only<br>Not started',action:'Review routine',open:'selfcare-review',view:'selfcare'},
        {id:'medication',category:'Medication adherence',state:'Due today',time:'Today',icon:'pill',title:'PEG 3350',copy:'Once daily, recorded from Dr. Rao’s instructions and confirmed August 18.',meta:'Clinical plan<br>unchanged',action:'Record what happened',open:'care-checkin',view:'careplan'},
        {id:'treatment',category:'Treatment-plan adherence',state:'This evening',time:'5 minutes',icon:'person-standing',title:'Pelvic floor home practice',copy:'Recorded from Maya Chen, PT, and confirmed August 22.',meta:'Care plan<br>instruction',action:'Record what happened',open:'treatment-checkin',view:'careplan'}
      ];

      const selfCatalogue = [
        {id:'foot-support',category:'Position & straining',icon:'armchair',title:'Foot support setup',copy:'Review a simple setup for foot position during a bowel attempt.',detail:'Keep your feet supported and your position comfortable. Avoid forcing or staying seated for a prolonged attempt.',observe:'Notice effort and whether you felt fully emptied.',saved:false},
        {id:'guided-breathing',category:'Relaxation',icon:'wind',title:'Guided breathing before a bowel attempt',copy:'A brief guided exercise designed to make the start feel less rushed.',detail:'Use comfortable breathing without holding your breath or forcing.',observe:'Notice tension and straining.',saved:false},
        {id:'breakfast-routine',category:'Food & fluid routines',icon:'coffee',title:'Regular breakfast cue',copy:'Use a breakfast you already tolerate as a consistent morning cue.',detail:'This organizes timing around an existing meal. It does not prescribe a food or diet.',observe:'Notice whether an urge appears after breakfast.',saved:false},
        {id:'post-meal-walk',category:'Movement',icon:'footprints',title:'Short walk after lunch',copy:'Review a gentle movement routine for the afternoon.',detail:'Use only a pace and duration already suitable for you.',observe:'Notice bloating and bowel urge.',saved:false},
        {id:'one-change-trial',category:'Focused trials',icon:'flask-conical',title:'Try one clear change',copy:'Choose one variable, a short review window, and the evidence you will record.',detail:'Keep other planned routines stable so the result is easier to interpret.',observe:'Compare the selected outcome before and after the trial.',saved:false}
      ];

      const clinicalCatalogue = {
        visit:[
          {id:'gi-appointment',type:'visit',category:'Visit preparation',icon:'messages-square',title:'Prepare for a GI appointment',copy:'Gather symptoms, treatments, results, and the questions you want to raise.',detail:'Build a person-reviewed brief from Track and Journey.'}
        ],
        test:[
          {id:'anorectal-manometry',type:'test',category:'Tests',icon:'scan-line',title:'Anorectal manometry',copy:'Measures rectal sensation and how the muscles work together during a bowel movement.',detail:'Opening this card does not mean you need this test.',saved:false,planned:false},
          {id:'balloon-expulsion',type:'test',category:'Tests',icon:'circle-dot',title:'Balloon expulsion test',copy:'Checks how easily a small water-filled balloon can be pushed out during the test.',detail:'Opening this card does not mean you need this test.',saved:false,planned:false},
          {id:'colonic-transit',type:'test',category:'Tests',icon:'route',title:'Colonic transit test',copy:'Shows how markers or a capsule move through the colon over time.',detail:'Opening this card does not mean you need this test.',saved:false,planned:false},
          {id:'defecography',type:'test',category:'Tests',icon:'scan',title:'Defecography',copy:'Uses imaging to record the rectum and pelvic floor during emptying.',detail:'Opening this card does not mean you need this test.',saved:false,planned:false}
        ],
        procedure:[
          {id:'colonoscopy',type:'procedure',category:'Procedures',icon:'clipboard-list',title:'Colonoscopy',copy:'Keep bowel-prep instructions, medication questions, timing, and results together.',detail:'Opening this card does not mean you need this procedure.',saved:false,planned:false},
          {id:'flexible-sigmoidoscopy',type:'procedure',category:'Procedures',icon:'file-search-2',title:'Flexible sigmoidoscopy',copy:'Keep preparation instructions, timing, questions, and results together.',detail:'Opening this card does not mean you need this procedure.',saved:false,planned:false}
        ]
      };

      const allClinicalItems = () => Object.values(clinicalCatalogue).flat();
      const findClinicalItem = id => allClinicalItems().find(item=>item.id===id);

      const supportHost = () => root.querySelector('[data-support-carousel]') || root.querySelector('[data-support-slide]');
      const supportCount = () => root.querySelector('[data-support-count]');
      const supportDots = () => root.querySelector('[data-support-dots]');
      const selfCatalogHost = () => root.querySelector('[data-self-catalog-card]');
      const carePlanHost = () => root.querySelector('[data-careplan-card]');

      function bindPeekCarousel(carousel, dotsEl, itemSelector, onIndex){
        if(!carousel || carousel.dataset.peekBound==='true') return;
        carousel.dataset.peekBound='true';
        let queued=false;
        const update=()=>{
          queued=false;
          const items=[...carousel.querySelectorAll(itemSelector)];
          const marks=[...(dotsEl?.querySelectorAll('.gcs-dot')||[])];
          if(!items.length) return;
          const left=carousel.getBoundingClientRect().left;
          const nearest=items.reduce((best,item,index)=>{
            const distance=Math.abs(item.getBoundingClientRect().left-left);
            return distance<best.distance?{index,distance}:best;
          },{index:0,distance:Infinity});
          marks.forEach((mark,index)=>mark.setAttribute('aria-current',String(index===nearest.index)));
          onIndex?.(nearest.index, items.length);
        };
        carousel.addEventListener('scroll',()=>{
          if(queued) return;
          queued=true;
          requestAnimationFrame(update);
        },{passive:true});
        carousel._peekUpdate=update;
        update();
      }

      function scrollPeekTo(carousel, itemSelector, index, behavior='smooth'){
        if(!carousel) return;
        const item=carousel.querySelectorAll(itemSelector)[index];
        if(!item) return;
        const padding=parseFloat(getComputedStyle(carousel).paddingLeft)||0;
        carousel.scrollTo({left:Math.max(0, item.offsetLeft-padding), behavior});
      }

      function restorePeek(carousel, itemSelector, index){
        requestAnimationFrame(()=>{
          scrollPeekTo(carousel, itemSelector, index, 'auto');
          carousel?._peekUpdate?.();
        });
      }

      function syncSwipeCue(carousel, count){
        const cue=carousel?.nextElementSibling?.querySelector('.gcs-swipe-cue');
        if(cue) cue.hidden=count<2;
      }

      function supportCardHtml(item){
        const extra=item.id==='visit'?`<button class="gcs-text-action" type="button" data-gsp-open="visit">Open full visit prep<i data-lucide="chevron-right" aria-hidden="true"></i></button>`:'';
        return `<article class="gcs-priority"><div class="gcs-priority-top"><span class="gcs-eyebrow">${item.category} · ${item.state}</span><span class="gcs-time"><i data-lucide="${item.icon}" aria-hidden="true"></i>${item.time}</span></div><h3>${item.title}</h3><p>${item.copy}</p><div class="gcs-priority-foot"><button class="gcs-primary" type="button" data-support-open="${item.open}" data-support-view="${item.view}" ${item.key?`data-support-key="${item.key}"`:''}>${item.action}<i data-lucide="arrow-right" aria-hidden="true"></i></button><span class="gcs-quiet-meta">${item.meta}</span></div>${extra}</article>`;
      }

      function renderSupportSlide(){
        const host=supportHost();
        if(!supportItems.length){
          supportIndex=0;
          supportCount().textContent='0 selected';
          supportDots().innerHTML='';
          host.innerHTML='<article class="gcs-priority"><div class="gcs-priority-top"><span class="gcs-eyebrow">Immediate support</span></div><h3>Nothing is waiting</h3><p>Browse a Care section and mark something as for you. Saving it will not start it.</p><div class="gcs-priority-foot"><button class="gcs-primary" type="button" data-view-target="selfcare">Browse self-care<i data-lucide="arrow-right" aria-hidden="true"></i></button></div></article>';
          syncSwipeCue(host, 0);
          icons();
          return;
        }
        supportIndex=((supportIndex%supportItems.length)+supportItems.length)%supportItems.length;
        supportCount().textContent=`${supportIndex+1} of ${supportItems.length}`;
        host.innerHTML=supportItems.map(supportCardHtml).join('');
        supportDots().innerHTML=supportItems.map((_,index)=>`<button class="gcs-dot" type="button" data-support-dot="${index}" aria-label="Show support card ${index+1}" aria-current="${index===supportIndex}"></button>`).join('');
        syncSwipeCue(host, supportItems.length);
        restorePeek(host, '.gcs-priority', supportIndex);
        icons();
      }

      function addOrUpdateSupport(item){
        const index=supportItems.findIndex(entry=>entry.id===item.id);
        if(index>=0) supportItems[index]={...supportItems[index],...item}; else { supportItems.push(item); supportIndex=supportItems.length-1; }
        renderSupportSlide();
      }

      function removeSupport(id){
        supportItems=supportItems.filter(item=>item.id!==id);
        if(supportIndex>=supportItems.length) supportIndex=Math.max(0,supportItems.length-1);
        renderSupportSlide();
      }

      function renderSelfCatalogue(){
        const host=selfCatalogHost();
        selfCatalogueIndex=((selfCatalogueIndex%selfCatalogue.length)+selfCatalogue.length)%selfCatalogue.length;
        root.querySelector('[data-self-catalog-count]').textContent=`${selfCatalogueIndex+1} of ${selfCatalogue.length}`;
        host.innerHTML=selfCatalogue.map(item=>`<article class="gcs-catalog-card"><div class="gcs-catalog-kicker"><span>${item.category}</span><i data-lucide="${item.icon}" aria-hidden="true"></i></div><h4>${item.title}</h4><p>${item.copy}</p><div class="gcs-catalog-actions"><button class="gcs-for-me" type="button" data-save-self-item="${item.id}" aria-pressed="${item.saved}"><i data-lucide="${item.saved?'check':'bookmark'}" aria-hidden="true"></i>${item.saved?'Saved for me':'This is for me'}</button><button class="gcs-text-action" type="button" data-review-self-item="${item.id}">Review</button></div></article>`).join('');
        root.querySelector('[data-self-catalog-dots]').innerHTML=selfCatalogue.map((_,index)=>`<button class="gcs-dot" type="button" data-self-catalog-dot="${index}" aria-label="Show self-care item ${index+1}" aria-current="${index===selfCatalogueIndex}"></button>`).join('');
        syncSwipeCue(host, selfCatalogue.length);
        restorePeek(host, '.gcs-catalog-card', selfCatalogueIndex);
        icons();
      }

      function saveSelfCatalogueItem(id){
        const item=selfCatalogue.find(entry=>entry.id===id);
        item.saved=!item.saved;
        if(item.saved){
          addOrUpdateSupport({id:`self-${item.id}`,key:item.id,category:'Self-care',state:'Saved for me',time:'Review',icon:item.icon,title:item.title,copy:item.copy,meta:'Saved only<br>Not started',action:'Review',open:'self-catalog-detail',view:'selfcare'});
        } else removeSupport(`self-${item.id}`);
        updateSelfCareStatus();
        renderSelfCatalogue();
        showToast(item.saved?'Added to Immediate support. Nothing has started yet.':'Removed from Immediate support');
      }

      function renderSelfCatalogueDetail(id){
        const item=selfCatalogue.find(entry=>entry.id===id);
        openFlow('Review self-care',`<div class="gcs-step-label">${item.category}</div><h2>${item.title}</h2><p class="gcs-flow-intro">${item.copy}</p><div class="gcs-flow-box"><h3>What this involves</h3><p>${item.detail}</p></div><div class="gcs-summary-block"><strong>What you could notice</strong><p>${item.observe}</p></div><div class="gcs-disclosure"><button type="button" data-disclosure="catalog-safety" aria-expanded="false">Safety and evidence<i data-lucide="chevron-right" aria-hidden="true"></i></button><div class="gcs-disclosure-body" data-disclosure-body="catalog-safety" hidden>Review the evidence basis, suitability rules, and reasons to pause before adding this to a Plan.</div></div><div class="gcs-flow-actions"><button class="gcs-secondary" type="button" data-save-self-item="${item.id}" aria-pressed="${item.saved}">${item.saved?'Remove from Immediate support':'This is for me'}</button><button class="gcs-primary" type="button" data-toast="A Plan review would open next">Review for Plan</button></div>`, 'selfcare');
      }

      function renderClinicalCatalogue(){
        const items=clinicalCatalogue[clinicalTab];
        root.querySelectorAll('[data-clinical-tab]').forEach(button=>button.setAttribute('aria-selected',String(button.dataset.clinicalTab===clinicalTab)));
        root.querySelector('[data-clinical-catalog-card]').setAttribute('aria-labelledby',`gcs-clinical-tab-${clinicalTab}`);
        root.querySelector('[data-clinical-catalog-count]').textContent=clinicalTab==='visit'?'1 visit':`${items.length} ${clinicalTab}${items.length===1?'':'s'}`;
        if(clinicalTab==='visit'){
          const item=items[0];
          root.querySelector('[data-clinical-catalog-card]').innerHTML=`<article class="gcs-catalog-card"><div class="gcs-catalog-kicker"><span>${item.category}</span><i data-lucide="${item.icon}" aria-hidden="true"></i></div><h4>${item.title}</h4><p>${item.copy}</p><div class="gcs-catalog-actions"><button class="gcs-for-me" type="button" data-open-flow="add-moment"><i data-lucide="calendar-plus" aria-hidden="true"></i>Add a visit</button><button class="gcs-text-action" type="button" data-open-flow="visit-prep">Open current prep</button></div></article>`;
        } else {
          root.querySelector('[data-clinical-catalog-card]').innerHTML=`<div class="gcs-clinical-list" role="list" aria-label="${clinicalTab==='test'?'Supported tests':'Supported procedures'}">${items.map(item=>{ const stateAction=item.planned?`<span class="gcs-chip is-green"><i data-lucide="check" aria-hidden="true"></i>Planned</span>`:`<button class="gcs-for-me" type="button" data-save-clinical="${item.id}" aria-pressed="${item.saved}"><i data-lucide="${item.saved?'check':'bookmark'}" aria-hidden="true"></i>${item.saved?'Saved for me':'This is for me'}</button>`; return `<article class="gcs-catalog-card" role="listitem"><div class="gcs-catalog-kicker"><span>${item.category}</span><i data-lucide="${item.icon}" aria-hidden="true"></i></div><h4>${item.title}</h4><p>${item.copy}</p><div class="gcs-catalog-actions">${stateAction}<button class="gcs-text-action" type="button" data-understand-clinical="${item.id}">${item.planned?'Review preparation':'Understand'}</button></div></article>`; }).join('')}</div>`;
        }
        icons();
      }

      function saveClinicalItem(id){
        const item=findClinicalItem(id);
        if(!item) return;
        item.saved=!item.saved;
        if(item.saved){
          addOrUpdateSupport({id:`clinical-${item.id}`,key:item.id,category:item.category,state:item.planned?'Planned':'Saved for me',time:item.planned?'Preparation':'Review',icon:item.icon,title:item.title,copy:item.detail,meta:item.planned?'Recorded care<br>Instructions preserved':'Saved only<br>Not planned',action:item.planned?'Review preparation':'Review',open:'clinical-detail',view:'visit'});
        } else removeSupport(`clinical-${item.id}`);
        updateClinicalStatus();
        renderClinicalCatalogue();
        showToast(item.saved?'Added to Immediate support. Nothing has started yet.':'Removed from Immediate support');
      }

      function renderClinicalDetail(id){
        const item=findClinicalItem(id);
        if(!item) return;
        openFlow(item.category,`<div class="gcs-step-label">Useful to understand</div><h2>${item.title}</h2><p class="gcs-flow-intro">${item.copy}</p><div class="gcs-callout"><span class="gcs-callout-label">Important boundary</span><strong>${item.detail}</strong></div><div class="gcs-flow-box"><h3>If this is already planned</h3><p>Confirm the date and the clinician or organization before preparation support begins.</p></div><div class="gcs-flow-actions"><button class="gcs-secondary" type="button" data-save-clinical="${item.id}">${item.saved?'Remove from Immediate support':'This is for me'}</button><button class="gcs-primary" type="button" data-confirm-clinical="${item.id}">${item.planned?'Update planned details':'I have this planned'}</button></div><button class="gcs-plain-link" type="button" data-toast="A result can be added from Track">Save a result</button>`, 'visit');
      }

      function renderConfirmClinical(id){
        const item=findClinicalItem(id);
        if(!item) return;
        openFlow('Confirm planned care',`<div class="gcs-step-label">Before preparation begins</div><h2>Confirm your ${item.type}</h2><p class="gcs-flow-intro">Gutsphere is recording care you already have. It is not choosing this ${item.type}.</p><div class="gcs-source-block"><span>Selected item</span><strong>${item.title}</strong><p>The original instructions remain authoritative.</p></div><label class="gcs-field-label" for="gcs-clinical-source">Clinician or organization</label><input id="gcs-clinical-source" class="gcs-input" placeholder="Who planned this?"><label class="gcs-field-label" for="gcs-clinical-date">Planned date</label><input id="gcs-clinical-date" class="gcs-input" type="date"><div class="gcs-flow-actions"><button class="gcs-primary" type="button" data-save-planned="${item.id}">Confirm and add preparation</button></div>`, 'visit');
      }

      function renderCarePlanCard(){
        const host=carePlanHost();
        carePlanIndex=((carePlanIndex%2)+2)%2;
        const chip=carePaused?'Support paused':medicationRecorded?'Recorded today':'Medication adherence';
        const chipIcon=carePaused?'pause':medicationRecorded?'check':'pill';
        const review=carePaused?'Plan unchanged':medicationRecorded?'Review in 4 days':'Due today';
        const action=carePaused?'Resume support':medicationRecorded?'Record another update':'Record what happened';
        const medication=`<article class="gcs-focus-card"><div class="gcs-focus-meta"><span class="gcs-chip is-green" data-careplan-chip><i data-lucide="${chipIcon}" aria-hidden="true"></i>${chip}</span><span class="gcs-time" data-careplan-review><i data-lucide="calendar" aria-hidden="true"></i>${review}</span></div><h3>PEG 3350</h3><p class="gcs-source">Once daily · Recorded from Dr. Rao’s instructions · Confirmed August 18</p><div class="gcs-callout is-green"><span class="gcs-callout-label">Recorded goal</span><strong>Easier bowel movements with less straining.</strong></div><div class="gcs-loop" aria-label="Medication support loop"><span class="gcs-loop-step"><span class="gcs-loop-icon"><i data-lucide="clipboard-check" aria-hidden="true"></i></span><b>Instructions</b></span><span class="gcs-loop-line"></span><span class="gcs-loop-step is-current"><span class="gcs-loop-icon"><i data-lucide="check-circle-2" aria-hidden="true"></i></span><b>Follow-through</b></span><span class="gcs-loop-line"></span><span class="gcs-loop-step"><span class="gcs-loop-icon"><i data-lucide="activity" aria-hidden="true"></i></span><b>Response</b></span></div><div class="gcs-observation"><span>Last 14 days</span><p>Recorded as followed on 9 days. Three days have no entry.</p></div><div class="gcs-card-actions"><button class="gcs-primary" type="button" data-open-flow="care-checkin"><span data-careplan-action>${action}</span><i data-lucide="arrow-right" aria-hidden="true"></i></button><button class="gcs-text-action" type="button" data-open-flow="manage-care">View recorded instructions</button></div></article>`;
        const treatment=`<article class="gcs-focus-card"><div class="gcs-focus-meta"><span class="gcs-chip is-green"><i data-lucide="person-standing" aria-hidden="true"></i>${treatmentRecorded?'Recorded today':'Treatment-plan adherence'}</span><span class="gcs-time"><i data-lucide="clock-3" aria-hidden="true"></i>This evening</span></div><h3>Pelvic floor home practice</h3><p class="gcs-source">5 minutes before a bowel attempt · Recorded from Maya Chen, PT · Confirmed August 22</p><div class="gcs-callout is-green"><span class="gcs-callout-label">Recorded plan</span><strong>Practice relaxed coordination without forcing.</strong></div><div class="gcs-loop" aria-label="Treatment-plan support loop"><span class="gcs-loop-step"><span class="gcs-loop-icon"><i data-lucide="clipboard-check" aria-hidden="true"></i></span><b>Instructions</b></span><span class="gcs-loop-line"></span><span class="gcs-loop-step is-current"><span class="gcs-loop-icon"><i data-lucide="check-circle-2" aria-hidden="true"></i></span><b>Follow-through</b></span><span class="gcs-loop-line"></span><span class="gcs-loop-step"><span class="gcs-loop-icon"><i data-lucide="message-circle" aria-hidden="true"></i></span><b>Review</b></span></div><div class="gcs-observation"><span>Current record</span><p>Practice recorded on 3 of 4 planned days. One day has no entry.</p></div><div class="gcs-card-actions"><button class="gcs-primary" type="button" data-open-flow="treatment-checkin">${treatmentRecorded?'Record another update':'Record what happened'}<i data-lucide="arrow-right" aria-hidden="true"></i></button><button class="gcs-text-action" type="button" data-toast="Recorded therapist instructions would open">View recorded instructions</button></div></article>`;
        host.innerHTML=medication+treatment;
        root.querySelector('[data-care-card-count]').textContent=`${carePlanIndex+1} of 2`;
        root.querySelector('[data-care-card-dots]').innerHTML=[0,1].map(index=>`<button class="gcs-dot" type="button" data-care-card-dot="${index}" aria-label="Show care-plan action ${index+1}" aria-current="${index===carePlanIndex}"></button>`).join('');
        syncSwipeCue(host, 2);
        restorePeek(host, '.gcs-focus-card', carePlanIndex);
        icons();
      }

      function renderTreatmentCheckin(){
        openFlow('Treatment follow-through',`<div class="gcs-source-block"><span>From your recorded treatment plan</span><strong>Pelvic floor home practice · Maya Chen, PT</strong><p>Confirmed August 22. Follow the therapist’s recorded instructions.</p></div><h2>What happened with today’s practice?</h2><p class="gcs-flow-intro">This records follow-through. It does not change the treatment plan.</p><div class="gcs-choice-grid is-three"><button class="gcs-choice" type="button" data-treatment-adherence="Followed as recorded" aria-pressed="false">Followed as recorded</button><button class="gcs-choice" type="button" data-treatment-adherence="Partly followed" aria-pressed="false">Partly followed</button><button class="gcs-choice" type="button" data-treatment-adherence="Couldn’t follow" aria-pressed="false">Couldn’t follow</button><button class="gcs-choice" type="button" data-remind-treatment>Remind me later</button></div><div data-treatment-barrier-box hidden><label class="gcs-field-label">What got in the way?</label><div class="gcs-choice-grid">${['Instructions unclear','Timing did not work','Privacy or space','Access or cost','Forgot','Something else'].map(value=>`<button class="gcs-choice" type="button" data-treatment-barrier="${value}" aria-pressed="false">${value}</button>`).join('')}</div></div><div class="gcs-flow-actions"><button class="gcs-primary" type="button" data-save-treatment disabled>Save to Track</button></div>`, 'careplan');
      }

      function renderCareBarriers(){
        openFlow('Questions and barriers',`<div class="gcs-step-label">Carry the hard parts forward</div><h2>What should your care team know?</h2><p class="gcs-flow-intro">Keep barriers and questions attached to the care item they came from.</p><div class="gcs-flow-box"><h3>Pelvic floor home practice</h3><p>Timing did not work on one planned day.</p></div><div class="gcs-summary-block"><strong>Question saved for your next visit</strong><p>If straining stays similar, what should we review about the current plan?</p></div><div class="gcs-flow-actions"><button class="gcs-secondary" type="button" data-toast="A new question field would open">Add a question</button><button class="gcs-primary" type="button" data-save-followup>Prepare for next visit</button></div>`, 'careplan');
      }

      function renderAddCareItem(){
        selectedCareItemType='';
        openFlow('Add recorded care',`<div class="gcs-step-label">Existing clinician-directed care</div><h2>What are you adding?</h2><p class="gcs-flow-intro">This records care you already have. It does not start or change treatment.</p><div class="gcs-choice-grid is-three"><button class="gcs-choice" type="button" data-new-care-type="Medication" aria-pressed="false">Medication</button><button class="gcs-choice" type="button" data-new-care-type="Treatment-plan action" aria-pressed="false">Treatment-plan action</button><button class="gcs-choice" type="button" data-new-care-type="Preparation instructions" aria-pressed="false">Preparation instructions</button></div><div data-new-care-fields hidden><label class="gcs-field-label" for="gcs-new-care-name">Recorded instruction</label><input id="gcs-new-care-name" class="gcs-input" placeholder="What did your care team ask you to do?"><label class="gcs-field-label" for="gcs-new-care-source">Clinician or source</label><input id="gcs-new-care-source" class="gcs-input" placeholder="Who provided the instruction?"><label class="gcs-field-label" for="gcs-new-care-date">Confirmed date</label><input id="gcs-new-care-date" class="gcs-input" type="date"><div class="gcs-flow-actions"><button class="gcs-primary" type="button" data-save-new-care>Confirm and add</button></div></div>`, 'careplan');
      }

      const currentRoutine = () => selfCareRoutines[selfCareKey];

      function updateSelfCareStatus(){
        const saved=selfCatalogue.filter(item=>item.saved).length;
        const text=selfCarePaused?`1 paused${saved?` · ${saved} saved`:''}`:selfCareInPlan?`1 in Plan${saved?` · ${saved} saved`:''}`:`${1+saved} for you · 1 ready to review`;
        root.querySelector('[data-selfcare-status]').textContent=text;
      }

      function updateClinicalStatus(){
        const careItems=[...clinicalCatalogue.test,...clinicalCatalogue.procedure];
        const saved=careItems.filter(item=>item.saved&&!item.planned).length;
        const planned=careItems.filter(item=>item.planned).length;
        root.querySelector('[data-visit-status]').textContent=visitReady?'Visit brief ready':planned?`1 visit · ${planned} planned care item${planned===1?'':'s'}`:saved?`1 visit · ${saved} saved care item${saved===1?'':'s'}`:'1 visit · 2 questions left';
      }

      function setSelfCareRoutine(key){
        selfCareKey=key;
        selfCareMinutes=currentRoutine().minutes;
        root.querySelector('[data-selfcare-title]').textContent=currentRoutine().title;
        root.querySelector('[data-selfcare-lead]').textContent=currentRoutine().lead;
        root.querySelector('[data-selfcare-fit]').textContent=currentRoutine().fit;
        root.querySelectorAll('[data-selfcare-step]').forEach((node,index)=>node.textContent=currentRoutine().steps[index]);
      }

      const icons = () => { if(globalThis.lucide) globalThis.lucide.createIcons({attrs:{'stroke-width':1.5,'aria-hidden':'true'}}); };
      const showToast = message => { clearTimeout(toastTimer); toastBox.textContent=message; toastBox.classList.add('is-visible'); toastTimer=setTimeout(()=>toastBox.classList.remove('is-visible'),1900); };
      const progress = step => `<div class="gcs-progress" aria-label="Step ${step} of 3">${[1,2,3].map(n=>`<span class="${n<=step?'is-on':''}"></span>`).join('')}</div>`;

      function showView(name){
        currentView = name;
        views.forEach(view => view.hidden = view.dataset.view!==name);
        const info = name==='flow' ? [headerTitle.dataset.flowTitle || 'Care','One thing at a time'] : titles[name];
        headerTitle.textContent = info[0];
        headerSubtitle.textContent = info[1];
        homeLeft.hidden = name!=='home';
        back.hidden = name==='home';
        main.scrollTop = 0;
        document.getElementById('app')?.dispatchEvent(new CustomEvent('gsp:chrome-change'));
        phone.scrollIntoView({behavior:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
        icons();
        requestAnimationFrame(() => {
          if(name==='home') restorePeek(supportHost(), '.gcs-priority', supportIndex);
          if(name==='selfcare') restorePeek(selfCatalogHost(), '.gcs-catalog-card', selfCatalogueIndex);
          if(name==='careplan') restorePeek(carePlanHost(), '.gcs-focus-card', carePlanIndex);
        });
      }

      function openFlow(title,html,returnView){
        flowReturn = returnView;
        headerTitle.dataset.flowTitle = title;
        flow.innerHTML = html;
        showView('flow');
      }

      function success(title,copy,doneView){
        openFlow('Saved',`<div class="gcs-success"><span class="gcs-success-icon"><i data-lucide="check" aria-hidden="true"></i></span><h2>${title}</h2><p>${copy}</p><div class="gcs-flow-actions"><button class="gcs-primary" type="button" data-done-view="${doneView}">Done</button></div></div>`,doneView);
      }

      function renderSelfCareReview(){
        const routine=currentRoutine();
        openFlow('Review routine',`${progress(1)}<div class="gcs-step-label">Before adding to Plan</div><h2>${routine.title}</h2><p class="gcs-flow-intro">A short, time-bounded routine built around the evidence you chose to record.</p><div class="gcs-flow-box"><h3>What you would do</h3><div class="gcs-numbered">${routine.details.map((detail,index)=>`<div class="gcs-numbered-row"><span class="gcs-number">${index+1}</span><div><b>${detail[0]}</b><span>${index===1?`${selfCareMinutes==='Choose each day'?'Choose a realistic window each day':selfCareMinutes} ${detail[1]}`:detail[1]}</span></div></div>`).join('')}</div></div><div class="gcs-disclosure"><button type="button" data-disclosure="self-fit" aria-expanded="false">Why this may fit<i data-lucide="chevron-right" aria-hidden="true"></i></button><div class="gcs-disclosure-body" data-disclosure-body="self-fit" hidden>${routine.fit} This is a focused trial, not a promise of improvement.</div></div><div class="gcs-disclosure"><button type="button" data-disclosure="self-safety" aria-expanded="false">Safety &amp; evidence<i data-lucide="chevron-right" aria-hidden="true"></i></button><div class="gcs-disclosure-body" data-disclosure-body="self-safety" hidden>Your recorded clinical instructions stay in control. Gutsphere would show any approved suitability, pause, or care-routing rules that apply before activation.</div></div><div class="gcs-flow-actions"><button class="gcs-secondary" type="button" data-open-flow="adapt-routine">Adapt</button><button class="gcs-primary" type="button" data-add-selfcare>Add to Plan</button></div>`, 'selfcare');
      }

      function renderAdaptRoutine(){
        openFlow('Adapt routine',`${progress(2)}<div class="gcs-step-label">Match it to your day</div><h2>How much time feels realistic?</h2><p class="gcs-flow-intro">This changes Gutsphere’s routine support, not any clinician instructions.</p><div class="gcs-choice-grid is-three">${currentRoutine().adapt.map(value=>`<button class="gcs-choice" type="button" data-duration="${value}" aria-pressed="${selfCareMinutes===value}">${value}</button>`).join('')}</div><div class="gcs-flow-actions"><button class="gcs-secondary" type="button" data-open-flow="${selfCareInPlan?'manage-selfcare':'selfcare-review'}">Back</button><button class="gcs-primary" type="button" data-save-adaptation>${selfCareInPlan?'Save change':'Use this version'}</button></div>`, 'selfcare');
      }

      function renderSelfCareOptions(){
        openFlow('Other self-care',`<div class="gcs-step-label">One option at a time</div><h2>What would feel more useful?</h2><p class="gcs-flow-intro">Choose a different direction. Nothing is added until you review it.</p><div class="gcs-choice-grid is-three"><button class="gcs-choice" type="button" data-option-choice="relax">Guided relaxation before a bowel movement</button><button class="gcs-choice" type="button" data-option-choice="comfort">A short comfort routine for bloating</button><button class="gcs-choice" type="button" data-option-choice="timing">Keep the morning timing option</button></div>`, 'selfcare');
      }

      function renderManageSelfCare(){
        openFlow('Manage routine',`<div class="gcs-source-block"><span>Owned by your Plan</span><strong>${currentRoutine().title} · ${selfCareMinutes}</strong><p>${selfCarePaused?'Gutsphere support is paused.':'The next check-in appears in Today.'}</p></div><h2>${selfCarePaused?'Routine support is paused':'What would you like to change?'}</h2><p class="gcs-flow-intro">These controls change this self-care routine in Gutsphere.</p><div class="gcs-choice-grid is-three">${selfCarePaused?'<button class="gcs-choice" type="button" data-resume-selfcare>Resume routine support</button>':'<button class="gcs-choice" type="button" data-open-flow="adapt-routine">Change the time needed</button><button class="gcs-choice" type="button" data-pause-selfcare>Pause routine support</button>'}<button class="gcs-choice" type="button" data-remove-selfcare>Remove from Plan</button></div>`, 'selfcare');
      }

      function showSelfCareAdded(){
        openFlow('Added to Plan',`<div class="gcs-success"><span class="gcs-success-icon"><i data-lucide="check" aria-hidden="true"></i></span><h2>Added to your Plan</h2><p>${currentRoutine().title} is ready. Your first check-in will appear in Today.</p><div class="gcs-flow-actions"><button class="gcs-secondary" type="button" data-open-flow="manage-selfcare">Manage routine</button><button class="gcs-primary" type="button" data-toast="Your Plan opens from Today or Journey">View in Plan</button></div></div>`, 'selfcare');
      }

      function renderVisitPrep(step=visitStep){
        visitStep = step;
        if(step===1){
          openFlow('Prepare your visit',`${progress(1)}<div class="gcs-step-label">Step 1 of 3</div><h2>What belongs in your context?</h2><p class="gcs-flow-intro">Gutsphere gathered these from Track and Journey. You choose what appears.</p><div class="gcs-flow-box"><div class="gcs-check-list"><label class="gcs-check-row"><input type="checkbox" data-visit-context="0" ${visitContextState[0]?'checked':''}><span>Soft stool with continued straining and incomplete emptying</span></label><label class="gcs-check-row"><input type="checkbox" data-visit-context="1" ${visitContextState[1]?'checked':''}><span>Self-care and treatments tried, with the response recorded</span></label><label class="gcs-check-row"><input type="checkbox" data-visit-context="2" ${visitContextState[2]?'checked':''}><span>Current medicines, supplements, and saved test results</span></label></div></div><div class="gcs-flow-actions"><button class="gcs-primary" type="button" data-visit-next="2">Next: Questions</button></div>`, 'visit');
        } else if(step===2){
          openFlow('Prepare your visit',`${progress(2)}<div class="gcs-step-label">Step 2 of 3</div><h2>Which questions do you want to raise?</h2><p class="gcs-flow-intro">Your saved questions appear first. Suggestions stay optional.</p><div class="gcs-flow-box"><div class="gcs-question-card"><label><input type="checkbox" data-visit-question="0" ${visitQuestionState[0]?'checked':''}><span>Why does straining continue even when stool is soft?</span></label></div><div class="gcs-question-card"><label><input type="checkbox" data-visit-question="1" ${visitQuestionState[1]?'checked':''}><span>What should I watch while following my current care plan?</span></label></div><div class="gcs-question-card"><label><input type="checkbox" data-visit-question="2" ${visitQuestionState[2]?'checked':''}><span>Would any further evaluation be useful to discuss?</span></label><small>Question you may want to raise · Not a test recommendation</small></div></div><div class="gcs-flow-actions"><button class="gcs-secondary" type="button" data-visit-next="1">Back</button><button class="gcs-primary" type="button" data-visit-next="3">Review brief</button></div>`, 'visit');
        } else {
          const selected = visitQuestionState.filter(Boolean).length;
          const selectedLabel = `${selected} saved question${selected===1?'':'s'}`;
          const contextLabels=['Current pattern','Care tried and response','Medicines and test records'].filter((label,index)=>visitContextState[index]);
          const includedLabel=`${contextLabels.length?contextLabels.join(' · '):'No context sections selected'} · ${selectedLabel}`;
          if(visitReady){
            openFlow('Review visit brief',`${progress(3)}<div class="gcs-step-label">Ready for your review</div><h2>Your visit brief is ready</h2><p class="gcs-flow-intro">Review it once more, then choose what happens next.</p><div class="gcs-summary-block"><strong>Main concern</strong><p>Continued straining and incomplete emptying even when stool is soft.</p></div><div class="gcs-flow-box"><h3>Included</h3><p>${includedLabel}</p></div><div class="gcs-callout"><span class="gcs-callout-label">You stay in control</span><strong>Nothing is shared until you choose.</strong></div><div class="gcs-flow-actions"><button class="gcs-secondary" type="button" data-edit-visit-questions>Edit</button><button class="gcs-primary" type="button" data-share-brief>Share or export</button></div>`, 'visit');
            return;
          }
          openFlow('Review visit brief',`${progress(3)}<div class="gcs-step-label">Step 3 of 3</div><h2>Your visit brief</h2><p class="gcs-flow-intro">Nothing is shared until you review and choose.</p><div class="gcs-summary-block"><strong>Main concern</strong><p>Continued straining and incomplete emptying even when stool is soft.</p></div><div class="gcs-flow-box"><h3>Included</h3><p>${includedLabel}</p></div><div class="gcs-flow-actions"><button class="gcs-secondary" type="button" data-visit-next="2">Edit questions</button><button class="gcs-primary" type="button" data-visit-ready>Mark brief ready</button></div>`, 'visit');
        }
      }

      function renderShareBrief(){
        openFlow('Share or export',`<div class="gcs-step-label">You choose the destination</div><h2>How would you like to use your brief?</h2><p class="gcs-flow-intro">Gutsphere will not send anything automatically.</p><div class="gcs-choice-grid is-three"><button class="gcs-choice" type="button" data-share-choice="device">Open the device share sheet</button><button class="gcs-choice" type="button" data-share-choice="pdf">Save a PDF copy</button><button class="gcs-choice" type="button" data-open-flow="visit-prep">Review the brief again</button></div>`, 'visit');
      }

      function renderAddMoment(){
        selectedMoment='';
        selectedMomentItemId='';
        openFlow('Add care moment',`<div class="gcs-step-label">Visits, tests &amp; procedures</div><h2>What are you preparing for?</h2><p class="gcs-flow-intro">Choose the kind of care first. Tests and procedures come from the supported catalogue.</p><div class="gcs-choice-grid is-three"><button class="gcs-choice" type="button" data-moment-type="visit" aria-pressed="false">Visit</button><button class="gcs-choice" type="button" data-moment-type="test" aria-pressed="false">Test</button><button class="gcs-choice" type="button" data-moment-type="procedure" aria-pressed="false">Procedure</button></div><div data-moment-selection></div>`, 'visit');
      }

      function renderMomentSelection(){
        const host=flow.querySelector('[data-moment-selection]');
        if(!host) return;
        if(selectedMoment==='visit'){
          host.innerHTML=`<label class="gcs-field-label" for="gcs-moment-name">Visit name</label><input id="gcs-moment-name" class="gcs-input" placeholder="For example, GI follow-up"><label class="gcs-field-label" for="gcs-moment-source">Clinician or clinic</label><input id="gcs-moment-source" class="gcs-input" placeholder="Who is the visit with?"><label class="gcs-field-label" for="gcs-moment-date">Date</label><input id="gcs-moment-date" class="gcs-input" type="date"><p class="gcs-inline-error" role="alert" data-moment-error hidden></p><div class="gcs-flow-actions"><button class="gcs-primary" type="button" data-save-moment>Save visit</button></div>`;
        } else {
          const items=clinicalCatalogue[selectedMoment];
          const typeLabel=selectedMoment==='test'?'test':'procedure';
          host.innerHTML=`<fieldset class="gcs-select-group"><legend>Select a supported ${typeLabel}</legend><div class="gcs-select-list">${items.map(item=>`<label class="gcs-select-card" for="gcs-moment-item-${item.id}"><input id="gcs-moment-item-${item.id}" type="radio" name="gcs-moment-item" value="${item.id}" data-moment-item><span class="gcs-select-icon"><i data-lucide="${item.icon}" aria-hidden="true"></i></span><span class="gcs-select-copy"><strong>${item.title}</strong><span>${item.copy}</span></span></label>`).join('')}</div></fieldset><p class="gcs-boundary">Choose a ${typeLabel} your clinician has discussed, ordered, or scheduled. These are not suggestions.</p><div data-moment-plan-fields hidden><label class="gcs-field-label" for="gcs-moment-source">Clinician or organization</label><input id="gcs-moment-source" class="gcs-input" placeholder="Who planned this?"><label class="gcs-field-label" for="gcs-moment-date">Planned date</label><input id="gcs-moment-date" class="gcs-input" type="date"><p class="gcs-inline-error" role="alert" data-moment-error hidden></p><div class="gcs-flow-actions"><button class="gcs-primary" type="button" data-save-moment>Confirm and add preparation</button></div></div>`;
        }
        icons();
      }

      function renderCareCheckin(){
        if(carePaused){
          openFlow('Care-plan support',`<div class="gcs-success"><span class="gcs-success-icon"><i data-lucide="pause" aria-hidden="true"></i></span><h2>Gutsphere support is paused</h2><p>Your clinician’s instructions have not changed.</p><div class="gcs-flow-actions"><button class="gcs-primary" type="button" data-resume-care>Resume support</button></div></div>`, 'careplan');
          return;
        }
        openFlow('Record follow-through',`<div class="gcs-source-block"><span>From your recorded care plan</span><strong>PEG 3350 · Once daily · Dr. Rao</strong><p>Confirmed August 18. Follow the recorded label or clinician instructions.</p></div><h2>What happened with today’s plan?</h2><p class="gcs-flow-intro">This records what happened. It does not change your treatment.</p><div class="gcs-choice-grid is-three"><button class="gcs-choice" type="button" data-adherence="Followed as recorded" aria-pressed="false">Followed as recorded</button><button class="gcs-choice" type="button" data-adherence="Couldn’t follow" aria-pressed="false">Couldn’t follow</button><button class="gcs-choice" type="button" data-remind-care>Remind me later</button></div><div data-barrier-box hidden><label class="gcs-field-label">What made it difficult?</label><div class="gcs-choice-grid">${['Forgot','Instructions unclear','Access or cost','Schedule conflict','Chose not to','Something else'].map(value=>`<button class="gcs-choice" type="button" data-barrier="${value}" aria-pressed="false">${value}</button>`).join('')}</div></div><div class="gcs-flow-actions"><button class="gcs-primary" type="button" data-save-care disabled>Save to Track</button></div>`, 'careplan');
      }

      function renderCareResponse(){
        openFlow('Response so far',`<div class="gcs-step-label">Based on 14 days of entries</div><h2>More frequent. Straining similar.</h2><p class="gcs-flow-intro">Three days have no entries, so the picture is incomplete.</p><div class="gcs-flow-box"><div class="gcs-path"><div class="gcs-path-row is-done"><span class="gcs-path-node"><i data-lucide="calendar-check" aria-hidden="true"></i></span><span class="gcs-path-copy"><b>9 days with a bowel movement recorded</b><span>Previous 14 days: 5</span></span></div><div class="gcs-path-row is-current"><span class="gcs-path-node"><i data-lucide="activity" aria-hidden="true"></i></span><span class="gcs-path-copy"><b>Straining recorded about as often</b><span>No clear change in your entries</span></span></div><div class="gcs-path-row"><span class="gcs-path-node"><i data-lucide="circle-help" aria-hidden="true"></i></span><span class="gcs-path-copy"><b>What remains uncertain</b><span>Cause and whether treatment should change</span></span></div></div></div><div class="gcs-callout"><span class="gcs-callout-label">Keep the evidence honest</span><strong>This summarizes what you recorded. It does not establish cause or decide whether treatment should change.</strong></div><div class="gcs-flow-actions"><button class="gcs-secondary" type="button" data-prepare-followup>Prepare for follow-up</button><button class="gcs-primary" type="button" data-toast="Your evidence opens in Track">Review evidence</button></div>`, 'careplan');
      }

      function renderPrepareFollowup(){
        openFlow('Prepare for follow-up',`<div class="gcs-step-label">Built from your recorded response</div><h2>What do you want to ask?</h2><p class="gcs-flow-intro">Keep the observation and the uncertainty together.</p><div class="gcs-summary-block"><strong>Question to bring</strong><p>Bowel movements were recorded more often, but straining was similar. What should we review next?</p></div><div class="gcs-source-block"><span>Evidence included</span><strong>14 days of Track entries</strong><p>Three days have no entries. No cause or treatment change is inferred.</p></div><div class="gcs-flow-actions"><button class="gcs-secondary" type="button" data-open-flow="care-response">Back</button><button class="gcs-primary" type="button" data-save-followup>Save for your next visit</button></div>`, 'careplan');
      }

      function renderManageCare(){
        openFlow('Manage support',`<div class="gcs-step-label">Gutsphere controls</div><h2>What would you like to change?</h2><p class="gcs-flow-intro">These controls change app support. They do not change your clinician’s plan.</p><div class="gcs-choice-grid is-three"><button class="gcs-choice" type="button" data-edit-recorded>Edit what I recorded</button><button class="gcs-choice" type="button" data-updated-instructions>Record updated clinician instructions</button><button class="gcs-choice" type="button" data-pause-care>Pause Gutsphere support</button></div>`, 'careplan');
      }

      function renderPauseConfirm(){
        openFlow('Pause support',`<div class="gcs-success"><span class="gcs-success-icon" style="background:var(--gcs-gold-soft);color:var(--gcs-gold)"><i data-lucide="pause" aria-hidden="true"></i></span><h2>Pause Gutsphere support?</h2><p>This pauses reminders and check-ins in Gutsphere. It does not change your clinician’s instructions.</p><div class="gcs-flow-actions"><button class="gcs-secondary" type="button" data-open-flow="manage-care">Keep support on</button><button class="gcs-primary" type="button" data-confirm-pause>Pause support</button></div></div>`, 'careplan');
      }

      function renderEditRecorded(updated=false){
        openFlow(updated?'Updated instructions':'Correct recorded details',`<div class="gcs-source-block"><span>${updated?'New clinician version':'Current recorded version'}</span><strong>Source and confirmation are required</strong><p>${updated?'The previous version will remain in your history.':'Use this only to correct what was entered in Gutsphere.'}</p></div><label class="gcs-field-label" for="gcs-plan-name">Recorded instruction</label><textarea id="gcs-plan-name" class="gcs-textarea">PEG 3350, as recorded from clinician instructions</textarea><label class="gcs-field-label" for="gcs-plan-source">Clinician or source</label><input id="gcs-plan-source" class="gcs-input" value="Dr. Rao"><label class="gcs-field-label" for="gcs-plan-date">Confirmed date</label><input id="gcs-plan-date" class="gcs-input" type="date" value="2026-08-18"><div class="gcs-flow-actions"><button class="gcs-primary" type="button" data-save-recorded="${updated?'updated':'corrected'}">Confirm and save</button></div>`, 'careplan');
      }

      function handleOpenFlow(name){
        if(name==='selfcare-review'){ if(selfCareInPlan){ if(selfCarePaused) renderManageSelfCare(); else showToast('Your Plan opens from Today or Journey'); } else renderSelfCareReview(); }
        if(name==='adapt-routine') renderAdaptRoutine();
        if(name==='selfcare-options') renderSelfCareOptions();
        if(name==='manage-selfcare') renderManageSelfCare();
        if(name==='visit-prep') renderVisitPrep(visitReady?3:visitStep);
        if(name==='add-moment') renderAddMoment();
        if(name==='care-checkin') renderCareCheckin();
        if(name==='treatment-checkin') renderTreatmentCheckin();
        if(name==='care-response') renderCareResponse();
        if(name==='care-barriers') renderCareBarriers();
        if(name==='add-care-item') renderAddCareItem();
        if(name==='manage-care') renderManageCare();
      }

      root.addEventListener('change', event => {
        const field=event.target;
        if(field.matches('[data-visit-context]')) visitContextState[Number(field.dataset.visitContext)]=field.checked;
        if(field.matches('[data-visit-question]')) visitQuestionState[Number(field.dataset.visitQuestion)]=field.checked;
        if(field.matches('[data-moment-item]')){
          selectedMomentItemId=field.value;
          const fields=flow.querySelector('[data-moment-plan-fields]');
          if(fields) fields.hidden=false;
          const error=flow.querySelector('[data-moment-error]');
          if(error) error.hidden=true;
        }
      });

      root.addEventListener('click', event => {
        const button = event.target.closest('button');
        if(!button) return;
        if(button.dataset.toast){ showToast(button.dataset.toast); return; }
        if(button.dataset.destination){ showToast(`${button.dataset.destination} opens from the bottom navigation`); return; }
        if(button===homeLeft){ showToast('Profile opens here'); return; }
        if(button===back){ showView(currentView==='flow'?flowReturn:'home'); return; }
        if(button.dataset.supportDot!==undefined){ supportIndex=Number(button.dataset.supportDot); scrollPeekTo(supportHost(), '.gcs-priority', supportIndex); supportCount().textContent=`${supportIndex+1} of ${supportItems.length}`; return; }
        if(button.dataset.supportOpen){ const destination=button.dataset.supportView; showView(destination); if(button.dataset.supportOpen==='self-catalog-detail') renderSelfCatalogueDetail(button.dataset.supportKey); else if(button.dataset.supportOpen==='clinical-detail') renderClinicalDetail(button.dataset.supportKey); else { if(button.dataset.supportOpen==='care-checkin') carePlanIndex=0; if(button.dataset.supportOpen==='treatment-checkin') carePlanIndex=1; if(destination==='careplan') renderCarePlanCard(); handleOpenFlow(button.dataset.supportOpen); } return; }
        if(button.dataset.selfCatalogDot!==undefined){ selfCatalogueIndex=Number(button.dataset.selfCatalogDot); scrollPeekTo(selfCatalogHost(), '.gcs-catalog-card', selfCatalogueIndex); root.querySelector('[data-self-catalog-count]').textContent=`${selfCatalogueIndex+1} of ${selfCatalogue.length}`; return; }
        if(button.dataset.saveSelfItem){ saveSelfCatalogueItem(button.dataset.saveSelfItem); if(currentView==='flow') renderSelfCatalogueDetail(button.dataset.saveSelfItem); return; }
        if(button.dataset.reviewSelfItem){ renderSelfCatalogueDetail(button.dataset.reviewSelfItem); return; }
        if(button.dataset.clinicalTab){ clinicalTab=button.dataset.clinicalTab; renderClinicalCatalogue(); return; }
        if(button.dataset.saveClinical){ saveClinicalItem(button.dataset.saveClinical); if(currentView==='flow') renderClinicalDetail(button.dataset.saveClinical); return; }
        if(button.dataset.understandClinical){ renderClinicalDetail(button.dataset.understandClinical); return; }
        if(button.dataset.confirmClinical){ renderConfirmClinical(button.dataset.confirmClinical); return; }
        if(button.dataset.savePlanned){ const id=button.dataset.savePlanned; const item=findClinicalItem(id); const source=flow.querySelector('#gcs-clinical-source').value.trim(); const date=flow.querySelector('#gcs-clinical-date').value; if(!item) return; if(!source||!date){ showToast('Add the source and planned date first'); return; } item.saved=true; item.planned=true; clinicalTab=item.type; const shownDate=new Date(`${date}T00:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric'}); addOrUpdateSupport({id:`clinical-${item.id}`,key:item.id,category:item.category,state:'Planned',time:shownDate,icon:item.icon,title:item.title,copy:`Planned through ${source}. Preparation support can now use the recorded instructions.`,meta:'Confirmed by you<br>Instructions preserved',action:'Review preparation',open:'clinical-detail',view:'visit'}); updateClinicalStatus(); renderClinicalCatalogue(); success(`${item.title} added`,`The planned ${item.type} and its source are confirmed.`, 'visit'); return; }
        if(button.dataset.careCardDot!==undefined){ carePlanIndex=Number(button.dataset.careCardDot); scrollPeekTo(carePlanHost(), '.gcs-focus-card', carePlanIndex); root.querySelector('[data-care-card-count]').textContent=`${carePlanIndex+1} of 2`; return; }
        if(button.dataset.careLibrary){ carePlanIndex=button.dataset.careLibrary==='medication'?0:1; scrollPeekTo(carePlanHost(), '.gcs-focus-card', carePlanIndex); root.querySelector('[data-care-card-count]').textContent=`${carePlanIndex+1} of 2`; showToast(button.dataset.careLibrary==='medication'?'Medication support is shown above':'Treatment-plan support is shown above'); return; }
        if(button.dataset.viewTarget){ showView(button.dataset.viewTarget); return; }
        if(button.dataset.openFlow){ handleOpenFlow(button.dataset.openFlow); return; }
        if(button.dataset.disclosure){ const body=flow.querySelector(`[data-disclosure-body="${button.dataset.disclosure}"]`); const open=button.getAttribute('aria-expanded')==='true'; button.setAttribute('aria-expanded',String(!open)); body.hidden=open; return; }
        if(button.dataset.duration){ selfCareMinutes=button.dataset.duration; const durationLabel=selfCareKey==='timing'?(selfCareMinutes==='Choose each day'?'Choose time each day':`${selfCareMinutes} unhurried`):selfCareKey==='relax'?`${selfCareMinutes} gentle breathing`:`${selfCareMinutes} gentle walk`; root.querySelector('[data-selfcare-step="1"]').textContent=durationLabel; flow.querySelectorAll('[data-duration]').forEach(choice=>choice.setAttribute('aria-pressed',String(choice===button))); return; }
        if(button.hasAttribute('data-save-adaptation')){ if(selfCareInPlan){ success('Routine updated',`Your Plan now uses the ${selfCareMinutes.toLowerCase()} version.`, 'selfcare'); } else renderSelfCareReview(); return; }
        if(button.hasAttribute('data-add-selfcare')){ selfCareInPlan=true; selfCarePaused=false; updateSelfCareStatus(); root.querySelector('[data-selfcare-chip]').innerHTML='<i data-lucide="check" aria-hidden="true"></i>In your Plan'; root.querySelector('[data-selfcare-action]').textContent='View in Plan'; const secondary=root.querySelector('[data-selfcare-secondary]'); secondary.textContent='Manage routine'; secondary.dataset.openFlow='manage-selfcare'; addOrUpdateSupport({id:'self-timing',category:'Self-care',state:'In your Plan',time:'Tomorrow',icon:'sprout',title:currentRoutine().title,copy:'Your first Plan check-in will appear in Today.',meta:'Plan owns<br>this routine',action:'View in Plan',open:'selfcare-review',view:'selfcare'}); showSelfCareAdded(); return; }
        if(button.hasAttribute('data-pause-selfcare')){ selfCarePaused=true; updateSelfCareStatus(); root.querySelector('[data-selfcare-chip]').innerHTML='<i data-lucide="pause" aria-hidden="true"></i>Support paused'; root.querySelector('[data-selfcare-action]').textContent='Resume routine'; addOrUpdateSupport({id:'self-timing',state:'Support paused',time:'Paused',copy:'The routine stays in your Plan. Gutsphere prompts and check-ins are paused.',meta:'Plan unchanged<br>Resume anytime',action:'Manage routine'}); success('Routine support paused','The routine stays in your Plan. Gutsphere will pause its Today prompts and check-ins.', 'selfcare'); return; }
        if(button.hasAttribute('data-resume-selfcare')){ selfCarePaused=false; updateSelfCareStatus(); root.querySelector('[data-selfcare-chip]').innerHTML='<i data-lucide="check" aria-hidden="true"></i>In your Plan'; root.querySelector('[data-selfcare-action]').textContent='View in Plan'; addOrUpdateSupport({id:'self-timing',state:'In your Plan',time:'Tomorrow',copy:'Your next Plan check-in will appear in Today.',meta:'Plan owns<br>this routine',action:'View in Plan'}); success('Routine support resumed','The next prompt will appear in Today.', 'selfcare'); return; }
        if(button.hasAttribute('data-remove-selfcare')){ selfCareInPlan=false; selfCarePaused=false; updateSelfCareStatus(); root.querySelector('[data-selfcare-chip]').innerHTML='<i data-lucide="target" aria-hidden="true"></i>Matched to your Plan'; root.querySelector('[data-selfcare-action]').textContent='Review and add to Plan'; const secondary=root.querySelector('[data-selfcare-secondary]'); secondary.textContent='Not for me · See another option'; secondary.dataset.openFlow='selfcare-options'; addOrUpdateSupport({id:'self-timing',category:'Self-care',state:'Saved for me',time:'7-day trial',icon:'sprout',title:'Morning bowel routine',copy:'A routine matched to your after-breakfast pattern is waiting for your review.',meta:'Saved only<br>Not started',action:'Review routine',open:'selfcare-review',view:'selfcare'}); success('Removed from your Plan','The routine and its future prompts were removed. Your earlier evidence stays in Track and Journey.', 'selfcare'); return; }
        if(button.dataset.optionChoice){ setSelfCareRoutine(button.dataset.optionChoice); renderSelfCareReview(); return; }
        if(button.dataset.visitNext){ renderVisitPrep(Number(button.dataset.visitNext)); return; }
        if(button.hasAttribute('data-visit-ready')){ visitReady=true; updateClinicalStatus(); root.querySelector('[data-visit-action]').textContent='Review brief'; root.querySelector('[data-question-path]').classList.remove('is-current'); root.querySelector('[data-question-path]').classList.add('is-done'); root.querySelector('[data-question-path-title]').textContent='Questions reviewed'; root.querySelector('[data-question-path-copy]').textContent='Your choices are saved'; root.querySelector('[data-brief-path]').classList.add('is-current'); root.querySelector('[data-brief-path-title]').textContent='Brief ready to review'; addOrUpdateSupport({id:'visit',category:'Visit preparation',state:'Brief ready',time:'Sep 8',icon:'file-check-2',title:'Your visit brief is ready',copy:'Review it once more. Nothing is shared until you choose.',meta:'Dr. Rao<br>10:30 AM',action:'Review brief',open:'visit-prep',view:'visit'}); success('Your visit brief is ready','You can review, edit, and choose whether to share it.', 'visit'); return; }
        if(button.hasAttribute('data-edit-visit-questions')){ visitReady=false; updateClinicalStatus(); root.querySelector('[data-visit-action]').textContent='Continue preparation'; root.querySelector('[data-question-path]').classList.remove('is-done'); root.querySelector('[data-question-path]').classList.add('is-current'); root.querySelector('[data-question-path-title]').textContent='Review 2 questions'; root.querySelector('[data-question-path-copy]').textContent='Choose what you want to raise'; root.querySelector('[data-brief-path]').classList.remove('is-current'); root.querySelector('[data-brief-path-title]').textContent='Review your brief'; addOrUpdateSupport({id:'visit',category:'Visit preparation',state:'Active',time:'5 days',icon:'calendar',title:'GI visit in 5 days',copy:'Your bowel pattern and treatments are gathered. Review 2 questions before September 8.',meta:'Dr. Rao<br>10:30 AM',action:'Continue preparation',open:'visit-prep',view:'visit'}); renderVisitPrep(2); return; }
        if(button.hasAttribute('data-share-brief')){ renderShareBrief(); return; }
        if(button.dataset.shareChoice){ success(button.dataset.shareChoice==='pdf'?'PDF copy prepared':'Ready to share',button.dataset.shareChoice==='pdf'?'A reviewed copy of your visit brief is ready to save.':'Your device share sheet would open with the reviewed brief.', 'visit'); return; }
        if(button.dataset.momentType){ selectedMoment=button.dataset.momentType; selectedMomentItemId=''; flow.querySelectorAll('[data-moment-type]').forEach(choice=>choice.setAttribute('aria-pressed',String(choice===button))); renderMomentSelection(); return; }
        if(button.hasAttribute('data-save-moment')){
          const source=flow.querySelector('#gcs-moment-source')?.value.trim()||'';
          const date=flow.querySelector('#gcs-moment-date')?.value||'';
          const error=flow.querySelector('[data-moment-error]');
          if(selectedMoment==='visit'){
            const name=flow.querySelector('#gcs-moment-name')?.value.trim()||'';
            if(!name||!source||!date){ if(error){ error.textContent='Add the visit name, clinician or clinic, and date.'; error.hidden=false; } return; }
            success('Visit added',`${name} with ${source} is saved for ${new Date(`${date}T00:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric'})}.`, 'visit');
            return;
          }
          const item=findClinicalItem(selectedMomentItemId);
          if(!item||!source||!date){ if(error){ error.textContent=`Select a ${selectedMoment}, then add the source and planned date.`; error.hidden=false; } return; }
          item.saved=true;
          item.planned=true;
          clinicalTab=item.type;
          const shownDate=new Date(`${date}T00:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric'});
          addOrUpdateSupport({id:`clinical-${item.id}`,key:item.id,category:item.category,state:'Planned',time:shownDate,icon:item.icon,title:item.title,copy:`Planned through ${source}. Preparation support can now use the recorded instructions.`,meta:'Confirmed by you<br>Instructions preserved',action:'Review preparation',open:'clinical-detail',view:'visit'});
          updateClinicalStatus();
          renderClinicalCatalogue();
          success(`${item.title} added`,`The planned ${item.type} and its source are confirmed.`, 'visit');
          return;
        }
        if(button.dataset.adherence){ adherenceChoice=button.dataset.adherence; barrierChoice=''; flow.querySelectorAll('[data-adherence]').forEach(choice=>choice.setAttribute('aria-pressed',String(choice===button))); const barrierBox=flow.querySelector('[data-barrier-box]'); barrierBox.hidden=adherenceChoice!=="Couldn’t follow"; flow.querySelector('[data-save-care]').disabled=adherenceChoice==="Couldn’t follow"; return; }
        if(button.dataset.barrier){ barrierChoice=button.dataset.barrier; flow.querySelectorAll('[data-barrier]').forEach(choice=>choice.setAttribute('aria-pressed',String(choice===button))); flow.querySelector('[data-save-care]').disabled=false; return; }
        if(button.dataset.treatmentAdherence){ treatmentAdherenceChoice=button.dataset.treatmentAdherence; treatmentBarrierChoice=''; flow.querySelectorAll('[data-treatment-adherence]').forEach(choice=>choice.setAttribute('aria-pressed',String(choice===button))); const box=flow.querySelector('[data-treatment-barrier-box]'); box.hidden=treatmentAdherenceChoice==='Followed as recorded'; flow.querySelector('[data-save-treatment]').disabled=treatmentAdherenceChoice!=='Followed as recorded'; return; }
        if(button.dataset.treatmentBarrier){ treatmentBarrierChoice=button.dataset.treatmentBarrier; flow.querySelectorAll('[data-treatment-barrier]').forEach(choice=>choice.setAttribute('aria-pressed',String(choice===button))); flow.querySelector('[data-save-treatment]').disabled=false; return; }
        if(button.hasAttribute('data-save-treatment')){ treatmentRecorded=true; carePlanIndex=1; renderCarePlanCard(); root.querySelector('[data-careplan-status]').textContent='Medication and treatment recorded today'; const detail=treatmentBarrierChoice?`${treatmentAdherenceChoice}: ${treatmentBarrierChoice}`:treatmentAdherenceChoice; const clarification=treatmentBarrierChoice==='Instructions unclear'?' Keep following the recorded instructions and contact your therapist or care team if you are unsure.':''; addOrUpdateSupport({id:'treatment',category:'Treatment-plan adherence',state:'Recorded today',time:'Review',icon:'person-standing',title:'Pelvic floor home practice',copy:'Today’s follow-through is recorded. Carry any barrier into your next review.',meta:'Track updated<br>Plan unchanged',action:'Review response',open:'care-response',view:'careplan'}); success('Saved to Track',`${detail}. This is now part of your treatment-plan evidence.${clarification}`, 'careplan'); return; }
        if(button.hasAttribute('data-save-care')){ careRecorded=adherenceChoice; medicationRecorded=true; carePlanIndex=0; renderCarePlanCard(); root.querySelector('[data-careplan-status]').textContent='Medication recorded · treatment due later'; const detail=barrierChoice?`${adherenceChoice}: ${barrierChoice}`:adherenceChoice; const clarification=barrierChoice==='Instructions unclear'?' Follow the recorded label or contact your pharmacist or care team if you are unsure.':''; addOrUpdateSupport({id:'medication',category:'Medication adherence',state:'Recorded today',time:'Review in 4 days',icon:'pill',title:'PEG 3350',copy:'Today’s follow-through is recorded. Your 14-day response review remains available.',meta:'Track updated<br>Plan unchanged',action:'Review response',open:'care-response',view:'careplan'}); success('Saved to Track',`${detail}. This is now part of your care-plan evidence.${clarification}`, 'careplan'); return; }
        if(button.hasAttribute('data-remind-care')){ showView('careplan'); showToast('Gutsphere will remind you later today'); return; }
        if(button.hasAttribute('data-remind-treatment')){ showView('careplan'); showToast('Gutsphere will remind you this evening'); return; }
        if(button.hasAttribute('data-prepare-followup')){ renderPrepareFollowup(); return; }
        if(button.hasAttribute('data-save-followup')){ success('Saved for your next visit','The question is ready in visit preparation. You can edit it before sharing.', 'careplan'); return; }
        if(button.hasAttribute('data-pause-care')){ renderPauseConfirm(); return; }
        if(button.hasAttribute('data-confirm-pause')){ carePaused=true; carePlanIndex=0; renderCarePlanCard(); root.querySelector('[data-careplan-status]').textContent='Medication support paused · treatment active'; addOrUpdateSupport({id:'medication',category:'Medication adherence',state:'Support paused',time:'Paused',icon:'pause',title:'PEG 3350',copy:'Gutsphere reminders and check-ins are paused. The clinician’s plan has not changed.',meta:'Clinical plan<br>unchanged',action:'Resume support',open:'care-checkin',view:'careplan'}); success('Gutsphere support paused','Reminders and check-ins are paused. Your clinician’s instructions have not changed.', 'careplan'); return; }
        if(button.hasAttribute('data-resume-care')){ carePaused=false; carePlanIndex=0; renderCarePlanCard(); root.querySelector('[data-careplan-status]').textContent='1 medication · 1 treatment'; addOrUpdateSupport({id:'medication',category:'Medication adherence',state:medicationRecorded?'Recorded today':'Due today',time:medicationRecorded?'Review in 4 days':'Today',icon:'pill',title:'PEG 3350',copy:medicationRecorded?'Today’s follow-through is recorded. Your response review remains available.':'Once daily, recorded from Dr. Rao’s instructions and confirmed August 18.',meta:'Clinical plan<br>unchanged',action:medicationRecorded?'Review response':'Record what happened',open:medicationRecorded?'care-response':'care-checkin',view:'careplan'}); success('Support resumed','Gutsphere reminders and check-ins are active again.', 'careplan'); return; }
        if(button.dataset.newCareType){ selectedCareItemType=button.dataset.newCareType; flow.querySelectorAll('[data-new-care-type]').forEach(choice=>choice.setAttribute('aria-pressed',String(choice===button))); flow.querySelector('[data-new-care-fields]').hidden=false; return; }
        if(button.hasAttribute('data-save-new-care')){ const name=flow.querySelector('#gcs-new-care-name').value.trim(); const source=flow.querySelector('#gcs-new-care-source').value.trim(); const date=flow.querySelector('#gcs-new-care-date').value; if(!selectedCareItemType||!name||!source||!date){ showToast('Add the instruction, source, and confirmation date'); return; } success(`${selectedCareItemType} recorded`,`${name} was added with ${source} as the source. The earlier care record remains unchanged.`, 'careplan'); return; }
        if(button.hasAttribute('data-edit-recorded')){ renderEditRecorded(false); return; }
        if(button.hasAttribute('data-updated-instructions')){ renderEditRecorded(true); return; }
        if(button.dataset.saveRecorded){ success(button.dataset.saveRecorded==='updated'?'New version recorded':'Recorded details corrected',button.dataset.saveRecorded==='updated'?'The earlier version remains in your care history.':'Your clinician’s plan itself was not changed.', 'careplan'); return; }
        if(button.dataset.doneView){ showView(button.dataset.doneView); return; }
      });

      const tweakState={radius:26,softShadow:true};
      const applyTweak=()=>{ root.style.setProperty('--gcs-radius','var(--gs-radius-feature)'); root.querySelectorAll('.gcs-priority,.gcs-focus-card,.gcs-entry-card,.gcs-catalog-card,.gcs-library-row').forEach(card=>card.style.boxShadow='none'); };
      renderSupportSlide();
      renderSelfCatalogue();
      renderClinicalCatalogue();
      renderCarePlanCard();
      bindPeekCarousel(supportHost(), supportDots(), '.gcs-priority', (index, total)=>{
        supportIndex=index;
        if(supportItems.length) supportCount().textContent=`${index+1} of ${total}`;
      });
      bindPeekCarousel(selfCatalogHost(), root.querySelector('[data-self-catalog-dots]'), '.gcs-catalog-card', (index, total)=>{
        selfCatalogueIndex=index;
        const count=root.querySelector('[data-self-catalog-count]');
        if(count) count.textContent=`${index+1} of ${total}`;
      });
      bindPeekCarousel(carePlanHost(), root.querySelector('[data-care-card-dots]'), '.gcs-focus-card', (index)=>{
        carePlanIndex=index;
        const count=root.querySelector('[data-care-card-count]');
        if(count) count.textContent=`${index+1} of 2`;
      });
      applyTweak();
      if(globalThis.Tweak){ const tweak=new Tweak({container:phone,onChange:applyTweak}); tweak.addSlider(tweakState,'radius',{label:'Card radius',min:20,max:32,unit:'px',reference:'care.card-radius'}); tweak.addToggle(tweakState,'softShadow',{label:'Soft card depth',reference:'care.soft-shadow'}); }
      icons();
    })();
