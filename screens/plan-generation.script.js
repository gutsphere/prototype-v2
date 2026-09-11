(() => {
      const root=document.getElementById('gutsphere-plan-generation');
      const card=root.querySelector('#gpg-card');
      const visual=root.querySelector('#gpg-visual');
      const label=root.querySelector('#gpg-label');
      const title=root.querySelector('#gpg-title');
      const copy=root.querySelector('#gpg-copy');
      const detail=root.querySelector('#gpg-detail');
      const bottom=root.querySelector('#gpg-bottom');
      const bars=[...root.querySelectorAll('.gpg-progress-step')];
      let timers=[];

      const stages=[
        {label:'Starting with you',title:'Your goal sets the direction.',copy:'You want less straining without more bloating. Your history, current care, and daily life shape what comes next.',visual:'<div class="gpg-input-demo"><div class="gpg-mini-stack"><div class="gpg-mini-row"><i data-lucide="target" aria-hidden="true"></i>Goal</div><div class="gpg-mini-row"><i data-lucide="history" aria-hidden="true"></i>Past response</div><div class="gpg-mini-row"><i data-lucide="clock-3" aria-hidden="true"></i>Daily life</div></div><div class="gpg-mini-arrow"><i data-lucide="arrow-right" aria-hidden="true"></i></div><div class="gpg-output-card"><span>Your objective</span><strong>Less straining, without more bloating</strong></div></div>',detail:'<div class="gpg-detail-line"><i data-lucide="check" aria-hidden="true"></i><span>Your priorities stay at the center.</span></div>'},
        {label:'Bringing care together',title:'Eight perspectives become one clear direction.',copy:'Instead of handing you separate opinions, we connect what each area means for your goal, current care, and daily life.',visual:'<div class="gpg-carry"><i data-lucide="check" aria-hidden="true"></i>Your objective stays central</div><div class="gpg-synthesis-demo"><div class="gpg-synthesis-view"><i data-lucide="activity" aria-hidden="true"></i>Digestive care</div><div class="gpg-synthesis-view"><i data-lucide="apple" aria-hidden="true"></i>Nutrition</div><div class="gpg-synthesis-view"><i data-lucide="heart-pulse" aria-hidden="true"></i>Pelvic health</div><div class="gpg-synthesis-view"><i data-lucide="pill" aria-hidden="true"></i>Medicines</div><div class="gpg-synthesis-view gpg-synthesis-core"><i data-lucide="user-round" aria-hidden="true"></i>You<small>one coordinated view</small></div><div class="gpg-synthesis-view"><i data-lucide="stethoscope" aria-hidden="true"></i>Primary care</div><div class="gpg-synthesis-view"><i data-lucide="brain" aria-hidden="true"></i>Mental well-being</div><div class="gpg-synthesis-view"><i data-lucide="moon" aria-hidden="true"></i>Sleep</div><div class="gpg-synthesis-view"><i data-lucide="footprints" aria-hidden="true"></i>Movement</div></div>',detail:'<div class="gpg-detail-line"><i data-lucide="git-merge" aria-hidden="true"></i><span>We align advice, flag conflicts, and decide what matters first.</span></div>'},
        {label:'Building on those perspectives',title:'Each option is checked for you.',copy:'Evidence, likely benefit, effort, risk, and fit with your current care are considered together.',visual:'<div class="gpg-carry"><i data-lucide="check" aria-hidden="true"></i>Objective + perspectives</div><div class="gpg-check-demo"><div class="gpg-check-step"><i data-lucide="microscope" aria-hidden="true"></i><span>Evidence</span></div><div class="gpg-check-step"><i data-lucide="user-check" aria-hidden="true"></i><span>Fit for you</span></div><div class="gpg-check-step"><i data-lucide="shield-check" aria-hidden="true"></i><span>Safety boundary</span></div></div>',detail:'<div class="gpg-detail-line"><i data-lucide="check" aria-hidden="true"></i><span>Only what passes the checks moves forward.</span></div>'},
        {label:'Building on what fits',title:'Your six-week path takes shape.',copy:'Three two-week milestones turn a long problem into a clear next step.',visual:'<div class="gpg-carry"><i data-lucide="check" aria-hidden="true"></i>Relevant options selected</div><div class="gpg-six-week-demo"><div class="gpg-milestone"><b>MILESTONE 1</b><strong>Begin</strong><div class="gpg-week-pair"><span>W1</span><span>W2</span></div></div><div class="gpg-milestone"><b>MILESTONE 2</b><strong>Learn</strong><div class="gpg-week-pair"><span>W3</span><span>W4</span></div></div><div class="gpg-milestone"><b>MILESTONE 3</b><strong>Confirm</strong><div class="gpg-week-pair"><span>W5</span><span>W6</span></div></div></div>',detail:'<div class="gpg-detail-line"><i data-lucide="repeat-2" aria-hidden="true"></i><span>Days feed weeks. Weeks shape each milestone.</span></div>'},
        {label:'Ready for your approval',title:'Your Plan is ready to review.',copy:'Check the objective, pace, timing, and actions. You can change anything before you start.',visual:'<div class="gpg-carry"><i data-lucide="check" aria-hidden="true"></i>Six-week Plan assembled</div><div class="gpg-ready-demo"><div class="gpg-ready-check"><i data-lucide="check" aria-hidden="true"></i></div><div class="gpg-ready-summary"><div class="gpg-ready-line"><span>Objective</span><strong>Set</strong></div><div class="gpg-ready-line"><span>3 milestones</span><strong>Ready</strong></div><div class="gpg-ready-line"><span>First action</span><strong>Today</strong></div></div></div>',detail:'<button class="gpg-ready-button" type="button">Review my Plan</button><p class="gpg-approval-note">Nothing starts until you approve it.</p>'}
      ];

      const show=(index) => {
        card.classList.add('is-changing');
        timers.push(setTimeout(() => {
          const stage=stages[index];
          label.textContent=stage.label;
          title.textContent=stage.title;
          copy.textContent=stage.copy;
          detail.innerHTML=stage.detail;
          visual.innerHTML=stage.visual;
          bars.forEach((bar,i)=>bar.classList.toggle('is-complete',i<=index));
          bottom.innerHTML=index===4?'<button class="gpg-replay" id="gpg-replay" type="button">Preview generation again</button>':'Nothing starts until you review and approve it.';
          if(globalThis.lucide) globalThis.lucide.createIcons({attrs:{'stroke-width':1.5,'aria-hidden':'true'}});
          card.classList.remove('is-changing');
          if(index===4) {
            root.querySelector('#gpg-replay').addEventListener('click',play);
          }
        },190));
      };

      const play=() => {
        timers.forEach(clearTimeout);timers=[];
        show(0);
        const stageDurations=[2300,3800,2500,2700];
        let elapsed=0;
        for(let i=1;i<stages.length;i++) {
          elapsed+=stageDurations[i-1];
          timers.push(setTimeout(()=>show(i),elapsed));
        }
      };
      play();
    })();
