export default {
  persona: {
    name: "Bimal",
    initials: "BM",
    fullName: "Bimal Maharjan",
    profileDesc: "Stable personal workspace",
    stage: "Diagnosis investigation",
    visitNote: "GI visit in 5 days",
    focus: "Constipation focus"
  },
  entries: {
    "bm-0810": {
      title: "Bowel movement",
      subtitle: "Type 4 · Moderate strain",
      meta: "Today, 8:10 AM · Bowel Movement",
      detail: "Did not feel fully emptied",
      pairs: [
        ["Stool type", "Type 4"],
        ["Strain", "Moderate"],
        ["Felt empty", "No"],
        ["Time", "8:10 AM"]
      ]
    },
    "care-0730": {
      title: "PEG 3350",
      subtitle: "Recorded as taken",
      meta: "Today, 7:30 AM · Medication & Supplements",
      detail: "Recorded as taken",
      pairs: [
        ["Medication", "PEG 3350"],
        ["Status", "Taken"],
        ["Time", "7:30 AM"]
      ]
    },
    "test-sep1": {
      title: "TSH result added",
      subtitle: "Report saved to your Journey",
      meta: "September 1 · Test Results",
      detail: "Report saved to your Journey",
      pairs: [
        ["Test", "TSH"],
        ["Status", "Recorded"],
        ["Date", "September 1"]
      ]
    }
  },
  visitPrep: {
    title: "GI visit in 5 days",
    subtitle: "Dr. Rao · 10:30 AM · September 8",
    mainConcern: "Why does straining continue even when stool is soft?",
    stepsDone: 1,
    stepsTotal: 3,
    checklist: [
      { label: "Symptoms and bowel pattern gathered", done: true },
      { label: "Current medicines and routines listed", done: true },
      { label: "Review 2 questions to raise", done: false },
      { label: "Review your visit brief", done: false }
    ],
    questions: [
      "Could further evaluation of emptying be appropriate?",
      "Should the current PEG dose stay the same while we study straining?"
    ],
    summaryNote: "3 patterns, current care, colonoscopy report, and TSH result are ready to review. Nothing is shared until you choose."
  },
  patterns: {
    "evacuation-vs-hard-stool": {
      title: "Difficult evacuation more than hard stool alone",
      subtitle: "Straining and incomplete emptying have continued on some soft-stool days.",
      confidence: 68,
      chipLabel: "Pattern match, not diagnosis",
      summary:
        "Your records resemble difficult evacuation more than hard stool alone. Soft stool days still included straining. Transit pattern and the role of pain have not been established.",
      factors: [
        ["Fits", "Persistent straining, incomplete emptying, and soft stool with strain."],
        ["Unclear", "Transit pattern and the role of pain have not been established."],
        ["Boundary", "This does not establish a condition or cause."]
      ],
      clarify: [
        "Keep recording stool type and straining separately",
        "Bring the repeated pattern to the next GI visit",
        "Ask whether emptying evaluation is appropriate"
      ]
    }
  },
  notifications: {
    action: [
      {
        title: "GI visit in 5 days",
        sub: "Review 2 questions before September 8.",
        time: "Now",
        route: "visit"
      },
      {
        title: "Record this morning’s bowel movement",
        sub: "Your Plan still needs today’s evidence.",
        time: "Morning",
        route: "today"
      }
    ],
    updates: [
      {
        title: "TSH result saved",
        sub: "Added to Journey tests and records.",
        time: "Sep 1",
        route: "journey"
      }
    ],
    inbox: [
      {
        title: "Plan is ready to review",
        sub: "Nothing starts until you approve it.",
        time: "Today",
        route: "plan"
      }
    ]
  }
};
