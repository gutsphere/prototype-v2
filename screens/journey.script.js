(() => {
      const root = document.getElementById('gutsphere-journey-synthesis-interactions');
      const cards = [...root.querySelectorAll('.gjx-insight-card')];
      const state = { insightPeek: 30, chapterGap: 15 };
      const render = () => {
        cards.forEach((card) => card.style.flexBasis = `calc(100% - ${state.insightPeek}px)`);
        root.querySelectorAll('.gjx-chapter + .gjx-chapter').forEach((chapter) => chapter.style.marginTop = `${state.chapterGap}px`);
      };
      render();
      if (globalThis.Tweak) {
        const tweak = new Tweak({ container: root, onChange: render });
        tweak.addSlider(state, 'insightPeek', { label: 'Next synthesis card peek', min: 20, max: 62, unit: 'px', reference: 'journey.synthesis-peek' });
        tweak.addSlider(state, 'chapterGap', { label: 'Chapter spacing', min: 10, max: 26, unit: 'px', reference: 'journey.chapter-gap' });
      }
    })();
