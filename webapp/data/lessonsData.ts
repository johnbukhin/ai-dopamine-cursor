export interface LessonOption {
  answer: string;
  responseCard: string;
}

export interface LessonSubsection {
  heading: string;
  body: string;
}

export interface LessonSection {
  // 'intro'    — opening section of a lesson (title + body + bullets + Start CTA)
  // 'content'  — main educational content (title + body, may include subsections)
  // 'question' — self-discovery Yes/No question with response cards
  // 'quote'    — standalone affirmation/quote screen
  // 'proTip'   — Pro Tip callout
  // 'summary'  — recap section at the end of a lesson (bullets + closing line + Complete CTA)
  // 'complete' — session complete screen + 5-star rating
  type: 'intro' | 'content' | 'question' | 'quote' | 'proTip' | 'summary' | 'complete';
  title?: string;
  body?: string;
  bullets?: string[];
  subsections?: LessonSubsection[];
  question?: string;
  options?: LessonOption[];
  quote?: string;
  quoteFollowUp?: string;
  closing?: string;
  cta?: string;
}

export interface Lesson {
  lessonNumber: number; // 0 = welcome lesson, 1-28 = day lessons
  day?: number;         // 1-28 for day lessons; undefined for welcome
  title: string;
  duration: string;     // e.g. "3 min" or "7-9 min"
  sections: LessonSection[];
}

export const lessonsData: Lesson[] = [
  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 0 — Welcome Session
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 0,
    title: 'Welcome to Mind Compass',
    duration: '5 min',
    sections: [
      {
        type: 'intro',
        title: "You're already different",
        body: `Most people who struggle with porn never do what you just did.

They stay stuck — cycling between shame and the same habit — for years, sometimes decades. They tell themselves they'll handle it later. Later never comes.

You decided to handle it now.

That decision alone puts you in a different category. And over the next 28 days, we're going to make that difference real.`,
        cta: "See what's ahead",
      },
      {
        type: 'content',
        title: '28 days. A completely different life.',
        body: `Here's what people consistently report after completing this plan:

**Sharper focus.** Without the dopamine fog, your ability to concentrate and finish things returns — sometimes dramatically.

**Natural confidence.** Not the kind you perform. The kind that comes from keeping promises to yourself.

**Better sleep.** The overstimulation that disrupted your rest quietly disappears.

**Real intimacy.** Whether you're in a relationship or not, the capacity for genuine connection deepens.

**Time reclaimed.** Hours every week — given back to the life you actually want to be living.

None of this requires perfection. It requires showing up.`,
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Why this actually works',
        body: `Most people try to quit with willpower alone. It doesn't work — not because they're weak, but because willpower is the wrong tool.\n\nThis plan uses three approaches with real evidence behind them:`,
        subsections: [
          {
            heading: 'Environment design',
            body: "Your surroundings shape your behavior more than your intentions. We'll restructure your digital and physical environment so the default choice is the healthy one.",
          },
          {
            heading: 'Urge surfing',
            body: "Neuroscience shows urges peak and pass in 10–20 minutes if you don't feed them. We'll train you to let them move through instead of obeying them.",
          },
          {
            heading: 'Identity shift',
            body: "Lasting change follows a new self-image, not just new rules. We'll work on who you're becoming — not just what you're stopping.",
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'quote',
        quote: "You don't rise to the level of your goals. You fall to the level of your systems.",
        quoteFollowUp: "— James Clear, Atomic Habits. That's exactly why we built this plan the way we did.",
      },
      {
        type: 'content',
        title: 'People like you have done this',
        body: `Here's what typically happens across 28 days:

**By Day 7**, most users report a noticeable reduction in urge frequency. The environment changes alone make a measurable difference.

**By Day 14**, the identity work begins to land. Users describe feeling "like a different person is making decisions."

**By Day 28**, the majority report that what once felt compulsive now feels like a choice — and usually, one they don't want to make.

This isn't a miracle. It's what happens when the right system meets consistent effort.`,
        cta: 'Continue',
      },
      {
        type: 'proTip',
        title: 'The one thing that predicts success',
        body: `It's not motivation. It's not a perfect streak.

It's **showing up on the bad days**.

Users who complete this plan aren't the ones who never slipped — they're the ones who came back the next day anyway. A rough day followed by a return is recovery. Disappearing after a rough day is the only way to fail.

When things get hard, open the app. That's the whole rule.`,
        cta: 'Continue',
      },
      {
        type: 'question',
        question: "What matters most to you about making this change?",
        options: [
          {
            answer: 'I want my confidence back',
            responseCard: `Confidence is one of the first things porn quietly erodes — and one of the first things that comes back when you reclaim your attention. The plan is designed to rebuild it from the inside out.`,
          },
          {
            answer: 'I want better relationships',
            responseCard: `Porn reshapes how the brain responds to real intimacy. Rewiring that takes time — but it's one of the most commonly reported transformations by Day 28. You're in the right place.`,
          },
          {
            answer: 'I want to stop feeling ashamed',
            responseCard: `Shame keeps the cycle alive more than almost anything else. One of this plan's core goals is replacing shame with self-understanding — and eventually, self-respect. That work starts today.`,
          },
          {
            answer: 'I want to reclaim my time and focus',
            responseCard: `The average user in active addiction reports losing 10+ hours a week to the habit and its aftermath. That time and mental bandwidth comes back. It's one of the most concrete, measurable wins in the plan.`,
          },
        ],
        cta: 'Start Day 1 →',
      },
      {
        type: 'summary',
        title: 'Your 28-day roadmap',
        bullets: [
          '**Week 1 — Environment & triggers.** Clean your environment, map what sets off urges, and add friction so automatic behavior becomes a conscious choice.',
          "**Week 2 — Urges & identity.** Learn to surf urges instead of obeying them, and start building the identity of someone who simply doesn't need this anymore.",
          '**Week 3 — Habits & relationships.** Replace what porn was doing for you with things that actually work: movement, connection, purpose, sleep.',
          "**Week 4 — Integration & freedom.** Lock in what you've built, prepare for the long run, and step into a version of yourself you recognize.",
        ],
        closing: "Every day builds on the last. You don't have to see the whole path — just the next step.",
        cta: 'Continue',
      },
      {
        type: 'complete',
        title: 'Your journey starts now.',
        body: `You've taken the first step. Day 1 is ready when you are.`,
        closing: 'How are you feeling about starting?',
        cta: "Let's go",
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 1 — Clean Slate (Day 1)
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 1,
    day: 1,
    title: 'Clean Slate',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Clean Slate',
        body: `Welcome to your first lesson. We’re glad you’re here.

Today, we’ll introduce you to the most important concept in behavior change — and the reason most people fail to quit porn even when they want to badly.

We will cover:`,
        bullets: [
          'why willpower alone almost never works',
          'how your environment quietly drives compulsive behavior',
          'what “removing cues” actually does to your brain',
          'why “one last look” reinforces the very loop you’re trying to break',
          'how to redesign your space, your devices, and your defaults',
        ],
        closing: `By the end of this lesson, you’ll understand why you’ve slipped before — and why this time, with the right system, you don’t have to.

Let’s get into it, shall we?`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'Why willpower alone almost never works',
        body: `If you’ve tried to quit porn before, you’ve probably felt this pattern: a wave of motivation, a few clean days, then an ordinary moment — bored on the couch, restless at midnight, stressed after work — and suddenly your hand is already on the phone. Not because you decided to, but because the moment decided for you.

That isn’t a character flaw. That’s how brains work.

Willpower is a limited resource. It drains across the day from work, decisions, frustration, and unmet needs. By 10 p.m., the version of you trying to make a “smart choice” is not the same person who set the goal in the morning. And that’s the version your brain bargains with.

> The mistake most people make is trying to out-will their environment. The brain wins almost every time.

The good news is that you don’t have to “be stronger.” You have to be smarter — and the smartest thing is to stop relying on willpower in the moments you don’t have it.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Have you tried to quit through willpower alone before, only to slip in a “small” moment?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the experience of nearly everyone who has tried this. Those slips weren’t proof you’re weak — they were proof your system was missing. We’re fixing the system today.`,
          },
          {
            answer: 'No',
            responseCard: `You’re starting from a clear-headed place, which is a real advantage. Even so, today’s lesson will help you build the kind of system that protects you when motivation drops — and it always drops eventually.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Your environment is doing half the work',
        body: `Compulsive behavior isn’t random. It runs on a loop that behavior scientists call the **cue → routine → reward** cycle.

A cue is anything that triggers the urge: a notification, a closed door, a certain time of night, a specific app icon, a feeling like loneliness or boredom. Your brain has practiced linking these cues to porn for months or years. By now, the link is almost automatic — you don’t “decide” to open a tab, you find yourself opening it.

This is why removing cues is the single most powerful move you can make on Day 1. You’re not just blocking websites. You’re cutting the wires that fire the loop.

When the cue disappears, the loop has nowhere to start.`,
      },
      {
        type: 'content',
        title: 'The three layers of access',
        body: `To clean the slate properly, you have to think in three layers — not just one. Most people block the obvious sites and miss the rest.`,
        subsections: [
          {
            heading: 'Devices',
            body: `Your phone, laptop, and tablet are slot machines engineered to keep you engaged. Blockers, grayscale, removed apps, and signed-out browsers all reduce your brain’s reward expectation. A plain device is a less interesting device — and a less interesting device generates fewer urges.`,
          },
          {
            heading: 'Prompts',
            body: `Saved searches, autofill suggestions, recommendation algorithms, suggestive feeds, and “explore” pages are silent invitations. Even when you don’t act on them, they keep the cue pathway warm. Killing personalized recommendations and clearing history removes background pressure you’ve stopped noticing.`,
          },
          {
            heading: 'Opportunities',
            body: `Where do you usually slip? Bedroom at midnight. Bathroom with the door closed. Couch alone after a stressful day. These aren’t just locations — they’re contexts your brain has trained on. Changing the rules around them (no phone in bed, laptop only in shared spaces) breaks the link between place and behavior.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Right now, are there devices, apps, or saved tabs within easy reach that have led you to porn before?',
        options: [
          {
            answer: 'Yes',
            responseCard: `Notice that without judgment — it’s literally the work of Day 1. By the end of today, those access points should be harder to reach, not easier. Make the changes physical and irreversible.`,
          },
          {
            answer: 'No',
            responseCard: `That’s a strong starting position. Use today to make sure no quiet loopholes remain — secondary browsers, old bookmarks, hidden folders. Compulsion is creative; pre-empt it.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Why “one last look” makes it worse',
        body: `This is the trap nearly everyone hits at least once: the urge to take one final scroll before the boundaries go up. To “say goodbye.” To “see if you can handle it.”

Here’s why that’s the worst possible move on Day 1.

Every exposure to a cue strengthens the neural pathway between cue and craving. Your brain doesn’t know that this is “the last time.” It only knows you practiced the loop again. So the very act of “one last look” makes the next 28 days harder — not easier.

> A clean slate works because it interrupts a pattern. The interruption only counts if it’s complete.

That’s why today’s work is symbolic as well as practical. Deleting files, blocking sites, and changing your phone settings isn’t just hygiene — it’s a message you send your brain: *the door is closed now.*`,
      },
      {
        type: 'content',
        title: 'What “clean slate” actually means',
        body: `The Day 1 protocol asks you to be ruthless on purpose. Not because you have to be perfect, but because Day 1 is the moment your future self has the most leverage over your present self.

You’re using today’s motivation to build a system that protects you on the days your motivation is gone.

This is also why we ask you to write your “Why” today and read it again later. When the urges come — and they will — your brain will conveniently forget what you actually wanted. A written “Why,” kept somewhere visible, is a way to talk to yourself across time.`,
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'It’s not deprivation — it’s redesign',
        body: `A common fear at this stage is: *“If I take all this away, my life will feel empty.”*

That fear is real, but it’s misreading the situation.

What you’re removing was never giving you what you actually wanted. Porn promised intimacy and delivered isolation. It promised relief and delivered restlessness. It promised novelty and slowly numbed you to it. The empty feeling people fear at the start of recovery isn’t caused by quitting — it’s the absence of the loud noise that was masking it.

> You’re not subtracting from your life. You’re making room for what porn has been crowding out.

In the next 28 days you’ll fill that room with movement, sleep, attention, real connection, and the kind of confidence that doesn’t depend on hiding anything. None of that has to be perfect. It just has to start.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Are you willing to make a few things in your environment uncomfortable on purpose for the next four weeks?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the mindset that wins. Remember: the discomfort is not punishment — it’s the friction that protects you on the days willpower drops.`,
          },
          {
            answer: 'No',
            responseCard: `That’s honest. Notice the hesitation: it usually means part of you wants to keep an exit door open. You don’t have to remove everything today, but pick one thing you’ve been protecting and remove it anyway. Trust the process.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'How Mind Compass can help',
        body: `Here’s the good news: rebuilding your relationship with porn is more achievable than you might think — when you stop relying on willpower and start relying on a system.

Using the principles of cognitive-behavioral therapy (CBT), Mind Compass helps you redesign your environment, retrain your responses to urges, and rebuild the daily routines that make recovery feel sustainable instead of punishing.

In the upcoming lessons, we’ll go deeper into the specific traps that keep most people stuck — trigger mapping, urge surfing, identity shifts, relapse prevention, and more — and you’ll have a concrete morning and evening protocol every single day.

You won’t be doing this on willpower. You’ll be doing it on a structure that holds you up when you need it most.`,
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 1:`,
        bullets: [
          'Willpower alone almost always fails, because it drains exactly when you need it most.',
          'Compulsive behavior runs on a cue → routine → reward loop, and removing cues is the single highest-leverage move you can make on Day 1.',
          'A real “clean slate” works on three layers: devices, prompts, and opportunities.',
          '“One last look” strengthens the very loop you’re trying to break — a clean slate has to be complete to count.',
          'You’re not depriving yourself; you’re making room for what porn has been crowding out.',
        ],
        closing: `Well done — you’ve taken the first real step. Now let’s move from understanding to action: the Day 1 protocol is waiting, and Mind Compass will be with you every day from here.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 2 — Trigger Map (Day 2)
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 2,
    day: 2,
    title: 'Trigger Map',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Trigger Map',
        body: `Welcome to Lesson 2. Day 2 is where most people make the most important shift in their recovery — from feeling “ambushed” by urges to seeing them coming.

Today, we’ll cover:`,
        bullets: [
          'why urges feel random but almost never are',
          'the four categories every trigger falls into',
          'the earliest warning signs your brain throws before an urge',
          'why decisions made *after* an urge starts almost always lose',
          'the if–then rule that pre-decides for you',
        ],
        closing: `By the end of this lesson, urges will start to feel less like emergencies and more like predictable patterns — and predictable patterns are the kind of thing you can actually beat.

Let’s map them out.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'Urges aren’t random',
        body: `It’s easy to feel like urges hit out of nowhere. One second you’re fine, the next your brain is fully on a different topic, and you can’t quite explain how you got there. That experience is real, but the “out of nowhere” part is an illusion.

Your brain is a prediction machine. It learns by association, and over time it builds invisible links between specific situations and specific responses. A specific time of night, a specific posture on the couch, a specific feeling in your chest — your brain knows what usually comes next, even if you don’t consciously notice.

> Urges feel random because the cue is invisible to you, not because there is no cue.

Day 1 cleaned the obvious doors. Day 2 is about finding the doors you didn’t know existed.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Looking back over the past month, do you notice that your urges tend to hit in similar situations again and again?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s not a coincidence — that’s a pattern. Patterns are excellent news, because anything you can predict, you can plan for. Today we turn that pattern into a map.`,
          },
          {
            answer: 'No',
            responseCard: `That’s worth examining more carefully. Sometimes the pattern is hidden in the smaller details — what you ate, how you slept, who you saw, what time it was. By the end of today, you’ll have a clearer picture than you expected.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The four categories of every trigger',
        body: `Almost every trigger you have falls into one of four categories. The reason this matters is simple: a trigger you can name is a trigger you can plan around. A trigger you can’t name is a trigger that will keep ambushing you.`,
        subsections: [
          {
            heading: 'Time',
            body: `Specific hours of the day are loaded for you — late night, the dead zone after lunch, the first hour after waking. Your brain has practiced certain behaviors at those times, and the clock alone can pull the trigger. Be specific: not “late night,” but “after 11:30 in bed.”`,
          },
          {
            heading: 'Location',
            body: `Bed. Bathroom. Couch. Home office with the door closed. These are not neutral places anymore — they’re contexts your brain has trained on. The same person who easily resists at the gym can fall apart in the same body twenty minutes later in bed.`,
          },
          {
            heading: 'Device',
            body: `Phone unlocked at the home screen. Laptop with the wrong tab open. Tablet picked up out of habit. Devices aren’t triggers because they’re evil — they’re triggers because they’ve been the delivery system for thousands of small reward loops.`,
          },
          {
            heading: 'Emotion',
            body: `This is the trickiest category, because the trigger isn’t the feeling itself — it’s the discomfort of the feeling. Boredom, loneliness, stress, rejection, even mild anxiety. Porn was, among other things, a way to *not feel that*. Until you name the emotion, you’ll keep treating it as an urge instead of as a feeling.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'In the past week, has an urge hit you in a moment you didn’t see coming at all?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That ambush is exactly what mapping prevents. Once you write down the time, the location, the device, and the feeling that came right before, that specific ambush will lose most of its power.`,
          },
          {
            answer: 'No',
            responseCard: `You may be more aware of your patterns than most. Use that awareness to tighten one specific time-and-place rule today, before week 2 catches you off guard.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Why decisions made during an urge almost always lose',
        body: `Here’s a fact about your brain that nobody learns in school: the version of you trying to make a smart choice while triggered is not the same version of you that made the goal. Once an urge is active, your brain shifts into a mode that prioritizes short-term reward and discounts long-term consequences. That shift isn’t a moral failure. It’s neurochemistry.

That’s why “I’ll just decide in the moment” almost always ends the same way. The moment is rigged.

> The decision you have to win isn’t the one during the urge. It’s the one *before* it.

This is the principle behind almost every behavioral-change tool that actually works. You decide while calm. You execute while triggered. You don’t debate while triggered, because debate is exactly the trap.`,
      },
      {
        type: 'content',
        title: 'The if–then rule',
        body: `The simplest version of this principle is the if–then plan. You write a single sentence in this exact shape:

> *If [specific trigger], then [specific action].*

For example: *If I’m in bed with my phone after 11 p.m., then I put it on the charger in another room and read for ten minutes.* Or: *If I feel restless after work, then I take a fifteen-minute walk before opening any app.*

If–then plans work because they remove decision-making from the danger zone. Your brain doesn’t have to “decide” anymore — it just has to execute the plan you already wrote when you were thinking clearly.

The plans you’ve written today are not optional rules. They’re the script your future self gets to follow when the moment is loud and you’re tired.`,
        cta: 'Continue',
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Most of the time when an urge starts, are you trying to decide what to do *while* it’s happening?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the most common version of this trap, and it’s why slips feel so confusing afterward. From now on, the goal is simple: pre-decide everything you can. Today’s if–then plan is the first one.`,
          },
          {
            answer: 'No',
            responseCard: `That’s rare and worth protecting. Use today to formalize what you’ve been doing instinctively — written if–then plans hold even when your instinct is tired.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 2:`,
        bullets: [
          'Urges feel random because the cue is invisible to you, not because there is no cue.',
          'Almost every trigger falls into four categories: time, location, device, and emotion.',
          'Naming a trigger is the first step to defusing it; ambushes happen where naming hasn’t.',
          'A brain in the middle of an urge prioritizes short-term reward — decisions made there almost always lose.',
          'The if–then plan moves the decision out of the danger zone and into the calm zone where you can win.',
        ],
        closing: `You’ve just taken your urges from “mysterious” to “mapped.” That alone is one of the biggest shifts in the whole 28 days. Now let’s get the Day 2 protocol into action.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 3 — Friction Wins (Day 3)
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 3,
    day: 3,
    title: 'Friction Wins',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Friction Wins',
        body: `Welcome to Lesson 3. By now you’ve removed the obvious cues and started mapping your triggers. Today, we add the most underrated tool in behavior change: **friction**.

Today, we’ll cover:`,
        bullets: [
          'why “easy” almost always beats “intended”',
          'the 30-second rule and why small friction can break a big habit',
          'the three places to design friction into your life',
          'why your phone was designed against you',
          'how to flip the architecture in your favor',
        ],
        closing: `By the end of this lesson, you’ll see your environment differently — not as a neutral background, but as the silent referee deciding most of your choices for you.

Let’s redesign the field.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'The path of least resistance always wins',
        body: `Imagine two versions of your evening. In version A, your phone is in your hand, unlocked, with one tap separating you from a feed that has triggered you before. In version B, your phone is in the kitchen, plugged in, screen down, with a passcode you have to walk to enter.

The you in both versions is exactly the same person. The same values, the same goals, the same Day 1 promise. But the choices those two evenings produce are not the same — not even close.

> You don’t rise to the level of your willpower. You sink to the level of your environment.

Effort matters. Values matter. Identity matters. But almost every study of behavior change comes back to the same boring truth: the path of least resistance wins more often than the path of most intention. Day 3 is about respecting that.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Have you ever opened an app or a tab without consciously deciding to — like your hand was a few seconds ahead of your mind?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That moment of “my hand was ahead of me” is autopilot. It’s not a discipline problem — it’s a design problem. The good news is, design is something you control.`,
          },
          {
            answer: 'No',
            responseCard: `That’s a sign your awareness is already strong. Today’s job is to lock that in by making sure your environment doesn’t quietly drift back into autopilot when you’re distracted.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The 30-second rule',
        body: `There’s a simple principle in behavior design: a small amount of friction at the right moment can change a behavior more reliably than a large amount of motivation later. Researchers sometimes call it the 30-second rule.

If a behavior takes more than about thirty seconds of effort to start, you’ll do it less. If it takes less than thirty seconds, you’ll do it more — sometimes without even meaning to. That’s why social apps are designed to open in one tap, why notifications jump to the front of your screen, and why the “explore” page loads before you ask for it.

> Thirty seconds of friction is enough to interrupt an urge before it becomes an action.

Most of recovery is just stretching that thirty seconds in the right places. A blocker. A passcode. A phone parking spot. A sign-out. A different room. None of these are dramatic. All of them work.`,
      },
      {
        type: 'content',
        title: 'Friction in three places',
        body: `To redesign your day, look at three layers — the same three layers you started touching on Day 1, but now from the angle of *making things harder on purpose*.`,
        subsections: [
          {
            heading: 'Physical friction',
            body: `Where things live shapes what you do. A phone in your pocket is a different phone than a phone in another room. A laptop on the bed is a different laptop than a laptop in a shared space. Move the object, change the behavior.`,
          },
          {
            heading: 'Digital friction',
            body: `Sign out. Delete. Disable autocomplete. Turn off recommendations. Use grayscale. Remove apps from your home screen. Each one of these adds two to fifteen seconds of friction. Stack five of them and the path to a slip starts costing more than it’s worth.`,
          },
          {
            heading: 'Social friction',
            body: `Tell someone you trust. Share a blocker password. Use accountability software. Make a promise out loud to a person, not just to yourself. Privacy is the favorite environment of compulsive behavior — visibility is its kryptonite.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'If you trace your typical slip pattern, are most of the steps inside that pattern less than 30 seconds long?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s why willpower keeps losing to it. The slip pattern was engineered to be fast. Today’s job is to insert friction in even one of those steps — and watch the pattern start to break.`,
          },
          {
            answer: 'No',
            responseCard: `That’s already a sign of good design on your part. Use today to find the *one* fast step that’s left and slow it down — small leaks become big leaks under stress.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Defaults are stronger than decisions',
        body: `There’s a quiet rule of behavior almost nobody talks about: whatever is the default option is the option that gets chosen most. Not because people are lazy — because choosing takes energy, and energy is finite.

If your default is “phone in bed,” you will pick up the phone in bed most nights, no matter what you decided last week. If your default is “phone in the kitchen,” you’ll go to the kitchen for it most nights, no matter how tired you are.

Defaults beat decisions because defaults don’t require a decision.

> If you want to change a behavior, change the default. Then the decision takes care of itself.

This is the deepest reason Day 3 matters. You’re not just removing a few things. You’re editing the defaults of your day so that the easy choice is also the healthy choice.`,
      },
      {
        type: 'content',
        title: 'Your environment as a second brain',
        body: `Once you start designing this way, something shifts. You stop seeing your environment as a passive room and start seeing it as a system that thinks for you when you’re tired. A clean phone, a clean desk, a parking spot for devices, a calm bedroom, a shared workspace — these aren’t aesthetic choices anymore. They’re relapse prevention.

The version of you that designed today’s environment is the version that gets to keep showing up tomorrow, even when motivation is gone.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Right now, is your environment designed for the version of you you’re becoming, or for the version you’re leaving behind?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the right answer to be working toward. Use today to find one last corner of your environment that’s still loyal to the old version — and edit it.`,
          },
          {
            answer: 'No',
            responseCard: `That’s a useful thing to admit honestly. Don’t try to redesign everything today. Pick one room or one device and align it with who you’re becoming. The rest can follow.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 3:`,
        bullets: [
          'The path of least resistance almost always wins, no matter how strong your intention is.',
          'The 30-second rule: a small amount of friction at the right moment can break a habit more reliably than a large amount of motivation later.',
          'Friction lives in three layers: physical, digital, and social — design all three.',
          'Defaults beat decisions, because defaults don’t require a decision.',
          'Your environment is a second brain. The version of you that designs it well gets to keep showing up tomorrow.',
        ],
        closing: `You’ve just learned how to make recovery easier without using more willpower. That’s a quiet superpower, and you’ll feel its effects all month. Now let’s get into the Day 3 protocol.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 4 — Urge Surfing (Day 4)
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 4,
    day: 4,
    title: 'Urge Surfing',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Urge Surfing',
        body: `Welcome to Lesson 4. So far you’ve removed cues, mapped triggers, and added friction. Today we work on the moment those tools weren’t enough — the moment an urge is already here, in your body, asking for attention.

Today, we’ll cover:`,
        bullets: [
          'what an urge actually is, biologically',
          'why urges feel like emergencies (and why they aren’t)',
          'the wave shape every urge follows',
          'why fighting urges almost always feeds them',
          'the practice of urge surfing — your most important skill for the rest of recovery',
        ],
        closing: `By the end of this lesson, urges won’t feel like enemies you have to defeat. They’ll feel like waves you’ve learned to ride.

Let’s get into it.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'An urge is not an emergency',
        body: `When an urge hits hard, it feels like an emergency. The body tightens, the mind narrows, attention pulls sharply toward one thing, and a quiet voice inside insists: *this won’t go away unless I act.*

That voice is wrong, but it’s not lying. It’s repeating a story your brain has told itself for years — that the only way to make this feeling stop is to give in to it.

> An urge is a feeling, not a command. It feels like an emergency because it learned to.

Here’s the truth your nervous system hasn’t been told yet: every single urge you’ve ever had has ended. Not because you acted on it, but because urges, like every other state in the body, are temporary. They rise, they peak, and they fall. Always.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'When an urge hits, do you usually feel like it will only get stronger and stronger until you act on it?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That belief is the single biggest reason urges win. The truth is the opposite — urges peak and fall on their own. Today’s skill is about proving that to your nervous system, not just your mind.`,
          },
          {
            answer: 'No',
            responseCard: `That’s a useful starting belief — keep it. The skill today gives you a concrete way to act on what you already half-know: that urges pass.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The shape of an urge',
        body: `Every urge follows roughly the same shape. It rises, it peaks, and it falls. The peak rarely lasts longer than five to twenty minutes. After the peak, the intensity drops on its own — even if you do nothing.

This shape is sometimes called a craving wave. It’s the same shape researchers see in studies of every kind of compulsive behavior, and it’s the shape your urges follow too, whether or not you’ve noticed.

The reason most people never see the wave is simple: they almost never let it run. They act before the peak. Acting feels like relief, but it’s not — it’s reinforcement. Every time you act on a peak, you teach your brain: *this peak is unbearable, and only action can stop it.* The next wave rises a little faster the next time.

> If you ride one wave to the end without acting, your brain learns something it has never learned before: that the wave was survivable.

That single learning experience is more powerful than weeks of willpower. It’s the foundation of everything else.`,
      },
      {
        type: 'content',
        title: 'Why fighting urges feeds them',
        body: `Here’s the second piece of bad news your brain has been operating on for years: trying to suppress an urge usually makes it stronger, not weaker.

This is sometimes called the white-bear effect. Try not to think of a white bear for the next ten seconds, and you’ll find yourself thinking about little else. The same principle applies to urges. The harder you grit your teeth and tell yourself *don’t think about it, don’t think about it*, the more bandwidth the urge gets, and the more your brain treats it as important.

Suppression isn’t a strategy. It’s an accelerant.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Have you ever tried to “fight” an urge by clenching your jaw and telling yourself no — and felt it get even louder?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That experience makes total sense once you know how the brain works. Today’s skill replaces fighting with riding — same urge, completely different relationship to it.`,
          },
          {
            answer: 'No',
            responseCard: `That’s a rare and useful starting point. Today’s skill will give you a name and a structure for what you’ve already been doing intuitively — which means you can teach it to yourself faster.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The urge surfing skill',
        body: `Urge surfing has three steps. They’re simple, and they get easier with practice.`,
        subsections: [
          {
            heading: '1. Notice',
            body: `The moment you feel the wave start to rise, pause and notice it on purpose. Where is it in your body? Tightness in the chest? Heat in the face? Pressure in the head? Restlessness in the legs? Just notice. Don’t judge it, don’t fight it, don’t name it as “bad.” It’s a sensation. That’s all.`,
          },
          {
            heading: '2. Name',
            body: `Out loud or in your head, name the experience. *“I’m having an urge.”* *“This is restlessness.”* *“This is loneliness asking to be soothed.”* Naming creates a small but real distance between you and the wave. You stop being the wave; you become the person watching it.`,
          },
          {
            heading: '3. Breathe',
            body: `Slow your breathing slightly. Lengthen the exhale. Let your body know that no action is required. The urge will keep doing what waves do — rise, peak, fall — and you’re going to let it, without giving it the reward of obedience.`,
          },
        ],
      },
      {
        type: 'content',
        title: 'The 10-minute delay rule',
        body: `The simplest practical version of urge surfing is the ten-minute delay. When an urge hits, you make one promise: *I won’t act on this for the next ten minutes.* During those ten minutes, you change rooms, drink water, do twenty squats, splash cold water on your face. You let your body do something physical and useful while the wave rolls through.

Almost no urge survives the full ten minutes once you change state. Most soften noticeably in the first few.

> The skill isn’t in defeating the urge. The skill is in outlasting it.`,
        cta: 'Continue',
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Are you willing to spend ten uncomfortable minutes today to avoid a slip you don’t actually want?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the entire game. Ten minutes of discomfort, traded for a pattern that gets quieter every week. Practice the skill once today even if you don’t feel triggered — it’s a rep, and reps are how this becomes automatic.`,
          },
          {
            answer: 'No',
            responseCard: `That hesitation is honest, and it’s worth examining. Often it means part of you still believes the urge is bigger than it actually is. Today’s practice is the cheapest way to find out it isn’t.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 4:`,
        bullets: [
          'An urge is a feeling, not a command — it feels like an emergency because it learned to.',
          'Every urge follows a wave: it rises, peaks, and falls. The peak is rarely longer than 5–20 minutes.',
          'Acting on the peak teaches your brain that the peak is unbearable; *not* acting teaches it the opposite.',
          'Fighting urges through suppression usually makes them louder; riding them shrinks them.',
          'Urge surfing is three steps — notice, name, breathe — and the simplest practical tool is the 10-minute delay.',
        ],
        closing: `You’ve just learned the most important in-the-moment skill in your entire 28 days. Practice it once today even when calm — that’s how it becomes automatic when it matters.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 5 — Values Anchor (Day 5)
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 5,
    day: 5,
    title: 'Values Anchor',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Values Anchor',
        body: `Welcome to Lesson 5. You’ve done four days of practical work — environment, triggers, friction, urge surfing. Today we go a layer deeper. We talk about the engine that quietly powers most relapses: **shame**. And we replace it with something stronger: **values**.

Today, we’ll cover:`,
        bullets: [
          'why shame fuels relapse instead of preventing it',
          'the difference between rules and values, and why values win in the long run',
          'what identity-based change actually means',
          'the question that beats every other motivation hack',
          'why the brain doesn’t accept absence — and what to put in its place',
        ],
        closing: `By the end of this lesson, you’ll have a way to motivate yourself that doesn’t crash the moment you slip — and that’s the kind of motivation that lasts the whole month.

Let’s anchor.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'Shame is a trap',
        body: `Most people who struggle with porn try to use shame as a motivator. The logic feels sound: *if I feel bad enough about it, I’ll stop.* So we beat ourselves up after every slip, hoping the pain will be the lesson.

It doesn’t work that way. In fact, it does the opposite.

Shame triggers a predictable cycle: shame → secrecy → isolation → discomfort → relapse → more shame. Each loop tightens the grip a little, because shame doesn’t just feel bad — it makes you hide. And the favorite environment of compulsive behavior is hiding.

> Shame doesn’t prevent the next slip. It pre-orders it.

That’s why this lesson matters now, on Day 5. You’re going to need a way to motivate yourself that survives an imperfect week — and shame is not it.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Looking back, have you ever slipped *more* in the days right after a slip — partly because of the shame from the first one?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the shame spiral, and almost everyone who has tried to quit knows it firsthand. The work today is about exiting that spiral the moment it starts, not waiting until it gets loud.`,
          },
          {
            answer: 'No',
            responseCard: `That’s a healthier relationship with setbacks than most people have. Today’s lesson will give you the language for what’s already protecting you, so you can lean on it more deliberately.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Rules vs values',
        body: `A rule tells you what to avoid. A value tells you what direction to walk in. Both can be useful, but they work in very different ways under stress.

Rules are brittle. The moment you break one — even a small one — the whole structure feels broken, and your brain can use that as permission to abandon the rest. *“I already messed up today, so what does it matter.”* Almost every binge starts with a single broken rule.

Values are flexible without being soft. A value isn’t a line you crossed; it’s a direction you’re walking in. If you take a step in the wrong direction, you don’t throw out the whole compass — you just turn around and walk again.

> Rules say: *don’t step here.* Values say: *keep walking that way.*

You need both, but the long-term motivation has to come from values. Otherwise, every imperfect day becomes a reason to quit the whole project.`,
      },
      {
        type: 'content',
        title: 'From “I should” to “I’m becoming”',
        body: `There’s a small but powerful shift that almost everyone in long-term recovery eventually makes. It’s the shift from *I should stop doing this* to *I’m becoming someone who doesn’t need this anymore.*

The first sentence is rule-shaped. It’s about restriction, prohibition, willpower. It produces a tense kind of motivation that runs out exactly when you need it most.

The second sentence is identity-shaped. It’s about direction, growth, self-respect. It produces a quieter, more durable motivation, because every action becomes a tiny piece of evidence about who you are. *I went on the walk because I’m someone who takes care of myself. I left the phone in the kitchen because I’m someone who protects my attention.*

This is the kind of motivation that survives a hard week.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'When you imagine the version of you a year into recovery — calmer, clearer, more present — does that person feel real to you?',
        options: [
          {
            answer: 'Yes',
            responseCard: `Hold on to that image. The clearer that future you feels, the easier today’s decisions become — because you’re not just making choices, you’re proving something about who you already are.`,
          },
          {
            answer: 'No',
            responseCard: `That’s honest, and it’s common at this stage. The good news is you don’t need to fully see that person yet — you just need to keep taking small actions in their direction. The image gets clearer the more you walk toward it.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Replacement, not deletion',
        body: `Here’s a fact about brains that almost no one teaches: your brain doesn’t accept absence. It doesn’t respond well to *“stop doing this thing.”* It needs a substitute. Otherwise, the gap gets filled by whatever is most automatic — and what’s most automatic, for now, is the old loop.

This is why so many people try to quit by sheer subtraction and find themselves back where they started a few weeks later. They removed the behavior but didn’t replace the function. The brain still needed comfort, distraction, reward, regulation — and porn was, however badly, performing those functions.

> The question isn’t just *what am I removing?* The question is *what am I building in its place?*

This is what replacement rituals are for. A small, repeatable action that takes the place of the old loop, every time the cue hits. Lonely at night → shower, tea, message a friend. Restless after work → walk, music, stretch. Bored on the couch → book, push-ups, cook something.

The replacement ritual doesn’t need to be exciting. It needs to be reliable. Reliability is what teaches the brain that the function will be met without the old behavior.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Have you been mostly trying to delete porn from your life without yet replacing it with something concrete?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That explains a lot of the difficulty. Today’s job is to choose one specific replacement ritual for one specific trigger and use it on purpose. Even one is enough to shift the pattern.`,
          },
          {
            answer: 'No',
            responseCard: `You’re ahead of most people on this point. Use today to make the replacement more deliberate — written down, easy to start, and tied to a specific trigger. That’s how it becomes automatic.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 5:`,
        bullets: [
          'Shame fuels the relapse cycle (shame → secrecy → isolation → relapse → more shame); it doesn’t prevent it.',
          'Rules tell you what to avoid; values tell you what direction to walk in. Long-term motivation has to come from values.',
          'The shift from *“I should stop”* to *“I’m becoming”* is identity-based change, and it survives the hard weeks.',
          'Your brain doesn’t accept absence — every removed behavior needs a replacement ritual that meets the same function.',
          'Recovery is less about subtraction and more about who you’re becoming.',
        ],
        closing: `You’ve just anchored the emotional engine that makes the rest of this program durable. Now let’s get the Day 5 protocol going.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 6 — Energy Upgrade (Day 6)
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 6,
    day: 6,
    title: 'Energy Upgrade',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Energy Upgrade',
        body: `Welcome to Lesson 6. So far you’ve done a lot of work above the neck — environment design, triggers, urges, values, identity. Today we go below the neck. We look at your body, because your body is doing more of the work in your recovery than you probably realize.

Today, we’ll cover:`,
        bullets: [
          'why your body votes before your mind does',
          'how sleep, movement, and food quietly drive impulse control',
          'the HALT framework — four states that almost guarantee a slip',
          'why “I’ll deal with it tomorrow” often means “a different version of me will deal with it”',
          'the small body habits that change a whole day',
        ],
        closing: `By the end of this lesson, you’ll see the simple physical levers that make every other tool in this app work better — and notice the ones you’ve been overlooking.

Let’s upgrade.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'Your body votes first',
        body: `There’s a quiet truth about self-control most people miss: it isn’t mostly mental. It’s biological. The same person who can easily walk past a trigger after eight hours of sleep, a real meal, and a walk outside is a different person — neurochemically — after a bad night, skipped lunch, and four hours of screens.

Your prefrontal cortex, the part of your brain that handles long-term thinking and impulse control, isn’t a fixed resource. It runs on glucose, oxygen, sleep, and movement. Starve it, and it goes offline. Feed it, and it gets stronger.

> Most slips are blamed on willpower. Most slips are actually a body that didn’t get what it needed.

That’s why nobody can out-discipline a tired, hungry, isolated body for very long. And it’s why the small physical habits in this Plan aren’t a side dish — they’re the foundation under everything else.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Looking back at past slips, have most of them happened on days you were tired, hungry, stressed, or skipping movement?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s not a coincidence — that’s your body voting. Today’s job is to notice that vote earlier, and to give your body what it actually needs before the urge starts looking for a substitute.`,
          },
          {
            answer: 'No',
            responseCard: `That’s useful self-awareness. Even so, most people underestimate the body’s vote — use today to look one level deeper at the small physical states (poor sleep, low blood sugar, screen overload) that quietly add up.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The HALT framework',
        body: `There’s a tool used in recovery work that’s almost too simple to take seriously, until you start using it. It’s called HALT — short for **Hungry, Angry, Lonely, Tired**. Whenever an urge hits, the first move is to ask yourself which of those four you actually are.`,
        subsections: [
          {
            heading: 'Hungry',
            body: `Low blood sugar makes you impulsive, restless, and bad at long-term thinking. Often what feels like an urge for porn is, partially, an urge to escape the discomfort of being under-fueled. Eating something steady — protein, fiber, water — can dissolve a surprising number of urges before they peak.`,
          },
          {
            heading: 'Angry',
            body: `Anger isn’t just an emotion; it’s a high-arousal state that primes the body for action. If you don’t channel it physically (movement, conversation, writing), it tends to find its own outlet — and porn has historically been one of those outlets.`,
          },
          {
            heading: 'Lonely',
            body: `Loneliness is the trigger most people underestimate, because it doesn’t announce itself loudly. It feels like restlessness, or “there’s nothing to do.” Real connection — even one short message, one phone call — often takes the urge out at the knees in a way no app can.`,
          },
          {
            heading: 'Tired',
            body: `Sleep deprivation is, biologically, one of the fastest ways to destroy your impulse control. A brain that hasn’t slept loses access to its braking system. Most late-night slips are not about porn at all — they’re about a tired brain trying anything to feel awake.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Are you carrying a sleep deficit right now that you’ve quietly stopped noticing?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s one of the most common — and most invisible — drivers of slips. Sleep is not optional in recovery; it’s a foundation. Today’s evening protocol is your chance to start repaying that debt.`,
          },
          {
            answer: 'No',
            responseCard: `That’s a real strength, and protecting it matters more than you might think. Use today to lock the bedtime routine in place — week 2 and 3 are when most people quietly let it slip.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The exercise lever',
        body: `Movement is one of the most underrated tools in recovery, and it has nothing to do with looking good. Exercise — even a twenty-minute walk — does a few things at once that directly affect urges.

It reduces craving intensity. It releases dopamine through a clean channel, which calms the brain’s “hunting” mode. It improves sleep pressure later that night. It pulls you out of the contexts where you usually slip and into a different physical state. It gives you a small, immediate dose of self-respect, which beats a hundred motivational quotes.

> Exercise isn’t just a side habit. It’s a relapse-prevention tool that works through your body instead of your willpower.

You don’t need to become an athlete. You need to move enough, often enough, that your nervous system has somewhere to put its energy other than into urges.`,
      },
      {
        type: 'content',
        title: 'Stabilization beats heroics',
        body: `A common mistake at this stage is to try to fix everything at once. Wake up at 5. Cold showers. Two-hour gym sessions. No carbs. The all-in approach feels impressive for about five days, then collapses — and the collapse usually drags the porn-recovery work down with it.

The body responds better to small, boring consistency than to dramatic interventions. A real meal. Twenty minutes of movement. Water. A consistent bedtime. A short walk after dinner. None of this is glamorous. All of it works.

> Stabilization is what turns occasional clean days into a clean baseline.

The Plan’s morning and evening protocols are designed around exactly this principle. Don’t skip the simple ones because they look small — the simple ones are often what does the heaviest work.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Are you trying to win the discipline game with porn while quietly losing the basics — sleep, food, movement?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the most common pattern, and it’s the reason so many “strong starts” fade by week 3. Today’s job is to fix the basics first. The discipline game gets dramatically easier when the body is on your side.`,
          },
          {
            answer: 'No',
            responseCard: `That’s a strong base to build the rest of recovery on. Use today to formalize the basics — sleep window, daily movement, real meals — so they survive the harder weeks ahead.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 6:`,
        bullets: [
          'Self-control isn’t mostly mental — it’s biological. Your body votes before your mind does.',
          'HALT (Hungry, Angry, Lonely, Tired) is the fastest filter to apply when an urge hits.',
          'Sleep is not a side habit — it directly determines how much impulse control you have the next day.',
          'Exercise is a relapse-prevention tool that works through your body, not your willpower.',
          'Small, boring stabilization beats dramatic heroics every time. The basics are the system.',
        ],
        closing: `You’ve just upgraded the foundation under every other tool you’ve learned this week. Now let’s get the Day 6 protocol moving — and tomorrow we look back at the whole first week together.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 7 — Week One Review (Day 7) — MILESTONE
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 7,
    day: 7,
    title: 'Week One Review',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Week One Review',
        body: `Welcome to Lesson 7 — the end of your first week. Take a breath here. Most people who try to quit porn never make it to Day 7 with a real system in place, and you have.

Today is not just another lesson. It’s a checkpoint. We look back at what worked, we name what almost broke you, and we upgrade the system before week 2 begins.

Today, we’ll cover:`,
        bullets: [
          'why the Day 7 review matters more than the week itself',
          'the difference between “feeling better” and “being safer”',
          'the testing trap — the most common Day 7 slip',
          'the three lessons almost everyone learns in week 1',
          'how to enter week 2 stronger, not lazier',
        ],
        closing: `By the end of this lesson, you’ll have a sharper system going into the second week than the one you started with.

Let’s look back so we can move forward.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'Week one is data, not a verdict',
        body: `A lot of people end week 1 with the same thought: *“Did I do well enough?”* That’s the wrong question. It treats the week like a final exam. It’s not.

Week 1 is data. Every clean day, every close call, every craving that came and went — all of it is information about how your specific system reacts under your specific conditions. The point of looking back isn’t to give yourself a grade. It’s to tighten the screws.

> A good week-1 review doesn’t ask *“how did I do?”* It asks *“what did I just learn that I can use?”*

The honest answer to that question is what shapes the next 21 days. Skip it, and you’ll repeat week 1 mistakes in week 2. Do it well, and week 2 starts at a higher baseline.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Now that things feel a little easier, have you started to feel a small temptation to “test” yourself — just a peek, just a feed, just to see?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That impulse is so common it’s almost a clinical sign that you’re at Day 7. Naming it is the first defense — that small voice does not have your best interest in mind. We’ll dismantle it next.`,
          },
          {
            answer: 'No',
            responseCard: `That’s great awareness. Hold it carefully — the testing impulse is sneaky and often shows up later in the week, dressed up as something innocent. Stay alert through week 2.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The testing trap',
        body: `Around the end of week 1, your brain pulls a quiet trick. It says: *“See, you’ve got this. Maybe one peek won’t matter. Just to confirm you’re in control.”*

This is the testing trap. It is, statistically, the single most common path to a Day 7 or Day 8 relapse. It’s also the most preventable, once you understand what’s actually happening.

Every exposure to a cue — even a tiny one, even an “innocent” one — strengthens the neural pathway between cue and craving. Your brain doesn’t register “I’m testing.” It registers “we did the loop again.” One look, one search, one feed scroll, and you’ve handed back a piece of the progress you spent a week earning.

> Testing isn’t a sign of strength. It’s the addiction asking permission in a calmer voice.

The rule for week 2 is simple and non-negotiable: no testing. Not because you’re fragile, but because you’re smart enough not to fight a battle you don’t need to fight.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Has a quiet voice in the past day or two said something like *“you’ve got this — maybe one peek wouldn’t hurt”*?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That voice is exactly what we just named. Don’t debate it — *“not today, I’m building something bigger”* — and move your body. Repetition is what turns refusal into reflex.`,
          },
          {
            answer: 'No',
            responseCard: `That’s a healthy sign. Even so, write your no-testing rule down today and keep it visible. The voice often shows up when you’re tired or stressed, not when you’re calm — and tired-you needs the rule pre-written.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'From defense to redesign',
        body: `Week 1 is mostly defensive — you remove cues, build friction, add boundaries, and hold the line. Week 2 is where the work shifts. The boundaries stay, but you start adding *positive structure* on top of them: routines, replacement rituals, social rhythms, real rewards.

The difference matters. A defense that holds for a week is admirable. A life that doesn’t need that defense in the first place is the actual goal. Week 2 starts moving you toward that life.

> Week 1: make relapse hard. Week 2: make recovery easy.

This is also when the keystone habits from Day 6 start to compound. Sleep gets steadier. Movement gets routine. Connection becomes a default, not an effort. The system carries more of the weight, and you carry less.`,
      },
      {
        type: 'content',
        title: 'Three lessons almost everyone learns in week 1',
        body: `If you look at thousands of people who have made it through this week, three lessons come up over and over. See if any of them match your week.`,
        subsections: [
          {
            heading: '1. Willpower wasn’t the missing piece',
            body: `You almost certainly proved this to yourself. The days you held the line weren’t the days you were “strongest” — they were the days your environment didn’t give the urge a chance to start. The system did the heavy lifting.`,
          },
          {
            heading: '2. Slips and close calls are pattern data, not character flaws',
            body: `Whatever almost broke you this week is information. The trigger is now visible. The time is known. The state of your body and mind is logged. You don’t face it next week as a mystery anymore — you face it as a problem you can pre-decide.`,
          },
          {
            heading: '3. The boring habits matter more than they look',
            body: `Sleep, food, movement, connection. The reason these keep showing up in every lesson isn’t that we’re padding the content. It’s that they quietly determine almost everything. The people who make it through 28 days are almost always the people who took the boring habits seriously.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'How Mind Compass can help',
        body: `Week 1 was foundation. Week 2, 3, and 4 each add a different layer — and Mind Compass is built so each layer locks into the last.

In the next three weeks, we’ll go deeper into the work that prevents long-term relapse: emotional honesty, identity rebuilding, sexual reset, attention training, repair of trust, and a real plan for the months *after* Day 28. Every day will keep the same shape — a short lesson, a structured morning protocol, an evening protocol, and a simple way to log what you’re learning.

You don’t have to remember any of this. The Plan does that for you. Your job is just to show up.`,
        cta: 'Continue',
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Are you willing to enter week 2 by upgrading one weak boundary tonight, instead of celebrating by loosening one?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the answer that keeps people in recovery on Day 30, 60, and 90. Pick the weakest link in your system tonight and tighten it before bed. That’s how week 2 starts strong.`,
          },
          {
            answer: 'No',
            responseCard: `That hesitation is honest, and it often comes from feeling like you’ve “earned a break.” Earning a break is real — just make sure the break itself isn’t the very thing that started your old cycle. Choose a clean reward instead.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 7:`,
        bullets: [
          'Week 1 is data, not a verdict — the point of the review is to upgrade the system, not grade yourself.',
          'The testing trap (“just one peek to confirm I’m in control”) is the most common Day 7–8 relapse path. The rule is simple: no testing.',
          'Week 1 is defense; week 2 is redesign. You stop just blocking the bad and start building the good.',
          'Three lessons almost everyone learns: willpower wasn’t the missing piece, slips are data not character, the boring habits matter most.',
          'Celebrate progress by tightening boundaries, not loosening them — that’s what makes the next three weeks possible.',
        ],
        closing: `Congratulations on reaching the end of your first week. You’ve done real work, you’ve learned a lot about your own patterns, and you’re entering week 2 with a system that gets stronger each day. Let’s keep going.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 8 — If–Then Armour (Day 8)
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 8,
    day: 8,
    title: 'If–Then Armour',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'If–Then Armour',
        body: `Welcome to Lesson 8 — the first lesson of week 2. Last week, you learned what an if–then plan is and used a couple of them. This week, we go all in on the technique that has more research behind it than almost any other behavior-change tool.

Today, we’ll cover:`,
        bullets: [
          'why specificity is the single biggest predictor of whether a plan works',
          'how if–then planning actually rewires your brain’s response under stress',
          'the three traits of a plan that holds up when you’re tired',
          'why rehearsing your plan once is more powerful than reading it ten times',
          'how to add accountability without humiliation',
        ],
        closing: `By the end of this lesson, your if–then plans won’t just be notes. They’ll be the armour your brain runs on automatically when an urge shows up.

Let’s build them.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'Why if–then plans are so much stronger than goals',
        body: `Most people quit porn the same way they start diets: with a goal. *“This time I’ll really stop.”* The problem is that a goal is just a wish until it meets a moment. And in the moment, your brain isn’t reading goals — it’s running scripts.

If–then planning is a tool that turns a goal into a script. It gives your brain one specific cue (*if X happens*) and one specific response (*then I do Y*), in advance, while you’re calm. Decades of research on a technique called *implementation intentions* show that this small framing change can roughly double the chance you actually follow through.

> Goals are intentions. If–then plans are reflexes-in-training.

This is why week 2 starts here. The version of you who shows up at 11 p.m. on Day 12 will not be in a state to invent a smart strategy. Today’s lesson is about handing that version a written reflex they can run instead.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'In the past, when you tried to quit, did most of your “strategy” live in your head as a vague intention rather than as a written, specific plan?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the most common version of this. A vague intention is easy to bargain with — a written if–then plan is harder to negotiate around. Today’s job is to make at least one of yours specific enough to execute on autopilot.`,
          },
          {
            answer: 'No',
            responseCard: `That’s ahead of where most people start. Use today to upgrade the plans you already have — make them more specific, more visible, and rehearsed at least once when calm.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'What makes an if–then plan actually work',
        body: `Not all if–then plans are equal. The ones that hold up under real urges share three traits.`,
        subsections: [
          {
            heading: 'Specific',
            body: `“If I’m on my phone, then I’ll be careful” isn’t a plan — it’s a hope. A real plan names a specific cue: a place, a time, a feeling, a gesture. *If I’m in bed with my phone after 11 p.m.* The more specific the cue, the more reliably your brain recognises it when it actually shows up.`,
          },
          {
            heading: 'Physical',
            body: `Every if–then plan should produce an *action*, not a thought. Standing up. Changing rooms. Putting the phone on the charger. Splashing water on the face. Movement breaks the trance state that urges live inside. A plan that ends in “then I’ll think about it differently” almost always loses.`,
          },
          {
            heading: 'Pre-rehearsed',
            body: `This is the part most people skip — and it’s the part that makes the difference. Once you’ve written a plan, run through it once on purpose, when calm. Stand up, walk to the kitchen, plug in the phone. The first execution while triggered is much harder if the muscle memory doesn’t exist yet.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'If you look at the if–then plans you’ve already written, are most of them specific, physical, and rehearsed at least once?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the version that wins. Today’s job is to write one new plan to your weakest moment — and rehearse it once before the day is over.`,
          },
          {
            answer: 'No',
            responseCard: `That’s normal at this stage. Pick the plan that matters most to you and upgrade it on all three traits today. One excellent plan beats five vague ones every time.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Why rehearsal matters more than memorising',
        body: `There’s a quiet truth about behavior under stress: your brain doesn’t have time to read a note. It has time to do whatever you’ve done before in similar situations. Rehearsal — even one quiet, calm walkthrough — builds a thin layer of motor memory that makes the right action feel familiar instead of foreign.

This is why athletes don’t just plan plays. They run them. It’s why pilots don’t just read manuals. They drill. The principle is the same here: a single rehearsal is worth more than ten silent re-reads.

> The version of you who is triggered will not invent a new plan. They will only run an old one. Today is when you give them a better one to run.

You don’t need to spend an hour on this. Sixty seconds of intentional walkthrough — phone in hand, walk to the kitchen, put it down, walk away — is enough to start carving the path.`,
      },
      {
        type: 'content',
        title: 'Adding accountability without humiliation',
        body: `There’s one more layer that makes if–then plans much harder to bargain with: someone else knowing about them.

You don’t need to confess everything to feel this effect. A shared blocker password. A friend who knows you’re working on this. A simple agreement that you’ll text someone if you’re struggling, with no expectation that they fix it. These small layers of visibility do something the addiction can’t handle: they take secrecy off the table as a coping option.

Accountability isn’t about punishment, and it isn’t about anyone watching you fail. It’s about removing the silence that compulsive behavior depends on.

> The addiction wants a private room. Accountability turns the lights on without judgement.

If accountability feels uncomfortable, that discomfort is data. It usually means it’s working in the right direction.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Right now, is there a single other person in your life who knows you’re actively working on quitting porn?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s a real protective layer. Today’s task is to formalise it slightly — even a brief conversation about how you want to be supported turns vague support into useful structure.`,
          },
          {
            answer: 'No',
            responseCard: `That’s honest, and it’s common. You don’t have to confess everything — even one trusted person, one shared blocker password, or one accountability tool can break the silence the addiction depends on. Pick the smallest version you can do today.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 8:`,
        bullets: [
          'Goals are intentions; if–then plans are reflexes-in-training. The research behind implementation intentions is strong for a reason.',
          'The plans that work share three traits: specific cue, physical action, pre-rehearsed at least once.',
          'Your brain under stress runs old scripts — your job today is to give it a new one to run.',
          'A single rehearsal is more powerful than ten silent re-reads. Walk through one plan today on purpose.',
          'Accountability isn’t about punishment; it removes the silence that compulsive behavior depends on.',
        ],
        closing: `You’ve just upgraded the most important in-the-moment skill of your week 2. Now let’s get the Day 8 protocol going.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 9 — Boredom Strategy (Day 9)
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 9,
    day: 9,
    title: 'Boredom Strategy',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Boredom Strategy',
        body: `Welcome to Lesson 9. By now, your environment is cleaner, your triggers are mapped, and your urges are more predictable. So why does Day 9 sometimes feel restless and a little flat? The answer is one of the most underestimated forces in recovery: **boredom**.

Today, we’ll cover:`,
        bullets: [
          'why boredom is a much bigger relapse driver than people realise',
          'what boredom actually is, neurochemically — and why it feels like craving',
          'the “boredom menu” that turns idle time into a planned response',
          'why empty time is not neutral',
          'how to reclaim attention without replacing porn with another compulsive feed',
        ],
        closing: `By the end of this lesson, you’ll see boredom not as a problem to escape but as a signal you’ve learned to use.

Let’s get into it.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'Boredom is louder than people think',
        body: `Ask anyone who has tried to quit porn what triggered their last slip, and the most common honest answer isn’t stress, lust, or sadness. It’s boredom. *I had nothing to do. I was just sitting there. My hand reached for the phone before I noticed.*

Boredom is loud because, biologically, it’s a state of low stimulation in a brain that has spent years being over-stimulated. Porn, scrolling, short videos, gambling apps, junk food — they all train the brain to expect a steady drip of novelty. Take that drip away, and the silence feels uncomfortable, almost itchy. The brain does what it has been trained to do: it goes hunting for the missing dopamine.

> Boredom isn’t emptiness. It’s a tuned-up brain looking for a hit it’s used to getting.

That’s why the first week or two of recovery often feels strangely flat. You haven’t lost your capacity for joy — you’ve withdrawn from the artificial intensity that was crowding it out. Day 9 is about navigating this part on purpose.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Looking back, has “I was just bored” been part of the lead-up to a slip more often than “I was really stressed” or “I was really sad”?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That tracks for almost everyone, even though stress and sadness get more attention. Boredom is sneaky because it doesn’t feel dramatic — but it’s the most common doorway. Today’s lesson hands you a way to walk past it.`,
          },
          {
            answer: 'No',
            responseCard: `You may have a different dominant trigger, which is useful information. Even so, week 2 and 3 are where boredom often becomes the new top trigger as the dramatic ones quiet down. Stay alert.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Empty time is not neutral',
        body: `There’s a quiet rule of recovery: idle time is not neutral. Whatever fills the gap depends entirely on what’s been most automatic for you. For a year or more, what’s been most automatic is porn (and the scrolling that leads to it). So when an unplanned hour shows up — between meetings, after dinner, before bed — your brain reaches for the script it has practiced.

This isn’t a willpower failure. It’s default behavior. And as Lesson 3 covered, defaults beat decisions.

> Recovery isn’t just about removing what you don’t want. It’s about deciding, in advance, what fills the gap.

This is why people who recover for the long term tend to look more “scheduled” than they used to. Not rigid — just more intentional with the moments that used to be empty. Empty plus phone plus tiredness is a relapse recipe. Empty plus a planned alternative is just an evening.`,
      },
      {
        type: 'content',
        title: 'The boredom menu',
        body: `The simplest practical tool here is something called a *boredom menu* — a short, written list of fast alternatives you can do the moment boredom hits, before your hand reaches for the phone. The list lives somewhere visible (notes app, fridge, lock-screen reminder) so you don’t have to think about it. You just pick one.

A good boredom menu has three traits:`,
        subsections: [
          {
            heading: 'Easy to start',
            body: `If the alternative requires twenty minutes of setup, you’ll skip it under restlessness. Push-ups, water, stairs, music, a five-minute walk — these all start in seconds. Start small. You can always escalate.`,
          },
          {
            heading: 'Pleasurable enough to compete',
            body: `If every option on your list feels like punishment, your brain will go back to the old loop. Cooking something you like, calling a friend, a hobby you’ve neglected, a satisfying physical task — these compete because they actually feel good.`,
          },
          {
            heading: 'Varied',
            body: `Ten options on the menu mean you don’t get tired of the same response. Variety also gives you something to match to the moment — sometimes you need movement, sometimes connection, sometimes something for your hands.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Right now, do you have a written, visible list of fast alternatives you can do the moment boredom hits?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That puts you ahead of most people. Today’s job is to upgrade it: add at least three more options, make sure they’re fast to start, and put the list somewhere you’ll actually see when restless.`,
          },
          {
            answer: 'No',
            responseCard: `Today’s the day to write one. Ten options, easy to start, and pleasurable enough to compete with the old default. The list itself takes ten minutes — and saves you many slips.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Reclaim attention, don’t just refill it',
        body: `One trap in recovery is replacing porn with another compulsive feed — endless scrolling, short-video apps, news doom-loops. The behavior is different but the underlying pattern is identical: the brain still gets a steady drip of novelty, attention still stays fragmented, and the dopamine baseline never resets.

If you swap one infinite feed for another, the brain doesn’t learn that calm satisfaction is possible. It just learns to be addicted to a slightly different shape.

> The goal isn’t to fill the boredom faster. It’s to teach your brain that calm is safe and even pleasant.

That’s why your boredom menu should lean toward single-task, finishable activities — not infinite ones. Cook a meal. Go for a walk. Read ten pages of a real book. Stretch. Tidy a room. Practise something. Each of these has a beginning and an end, and each gives your nervous system the experience of rising and settling without an external feed pulling on it.

This is also where Day 6’s sleep, food, and movement work compounds. A regulated body tolerates boredom much better than a depleted one.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'If you removed porn but spent most of your free time scrolling something else, would you feel that you’re really recovering — or just shifting the same pattern sideways?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That honesty is exactly what week 2 needs. Recovery isn’t just about porn — it’s about reclaiming the attention that porn was eating. Pick one infinite feed today and put a real boundary on it.`,
          },
          {
            answer: 'No',
            responseCard: `That’s a useful hesitation to sit with. Even if it isn’t a full “sideways shift,” a piece of it usually is. Look at where your phone goes when porn is off the menu, and decide if that pattern is helping or quietly hurting your reset.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 9:`,
        bullets: [
          'Boredom is louder than people think — for most, it’s a more common relapse driver than stress or sadness.',
          'Boredom isn’t emptiness; it’s an over-stimulated brain looking for the dopamine drip it’s used to.',
          'Empty time is not neutral. Whatever was most automatic before recovery is what fills the gap by default.',
          'A written boredom menu — easy to start, pleasurable enough to compete, varied — is one of the highest-leverage tools at this stage.',
          'Don’t just refill attention with another feed; reclaim it with finishable, single-task activities that let calm feel safe again.',
        ],
        closing: `You’ve just turned one of the sneakiest triggers in recovery into a planned response. Now let’s get the Day 9 protocol going.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 10 — Stress Detox (Day 10)
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 10,
    day: 10,
    title: 'Stress Detox',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Stress Detox',
        body: `Welcome to Lesson 10. We’ve handled environment, triggers, urges, identity, energy, and boredom. Today we tackle the trigger that sits underneath a huge percentage of slips — and that almost everyone underestimates: **stress**.

Today, we’ll cover:`,
        bullets: [
          'why stress is a top relapse driver, even when nothing dramatic is happening',
          'how chronic, low-grade stress builds up silently and ambushes you later',
          'the “after-stress rule” that breaks the link between stress and porn',
          'the difference between real regulation and fake relief',
          'why your sleep and your stress response are the same project',
        ],
        closing: `By the end of this lesson, you’ll have a clearer set of tools for calming your nervous system that don’t cost you tomorrow.

Let’s get into it.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'Stress is fuel for relapse',
        body: `Most people think of stress as a single big event — a fight, a deadline, a piece of bad news. But the kind of stress that drives most slips is much quieter than that. It’s the steady low hum of unfinished tasks, unread messages, slightly bad sleep, the wrong amount of caffeine, a small disappointment, a small conflict, three things on the calendar you’re dreading. None of it is dramatic. All of it accumulates.

This is sometimes called *allostatic load* — the wear-and-tear of staying slightly activated for too long. By the time evening hits, your nervous system has been carrying that weight all day, and it desperately wants relief.

Porn was, among other things, an off switch. A fast, reliable way to flood the system with enough sensation to override the noise. It worked, in the short term. The cost — fragmented attention, shame, restless sleep, more stress the next day — was hidden inside the relief.

> Stress isn’t the cause of porn use. Unprocessed stress *plus* a fast, available off switch is.

Today is about removing the off-switch and replacing it with regulation that doesn’t leave a hangover.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Looking back at the past few weeks, were most of your hardest moments preceded by something stressful — even something small?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That pattern is one of the strongest signals in recovery. The work today is about catching stress earlier and meeting it with a real tool, instead of letting it build until porn looks like the only way out.`,
          },
          {
            answer: 'No',
            responseCard: `That’s useful self-awareness. Even so, low-grade stress is the most underestimated driver — it doesn’t announce itself loudly. Watch for it as you move through this week, especially in the evenings.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The after-stress rule',
        body: `There’s a simple rule that almost no one teaches and that prevents an enormous number of slips: *after a stressful moment, you do a 2-minute reset before touching your phone.*

That’s it. Two minutes between the spike and the device. The reset can be slow breathing, walking outside, washing your face, drinking water, stretching — anything that gives your nervous system a clean signal that it’s safe to come down. Two minutes is enough to break the autopilot that links *stress → escape → phone → trigger*.

> Stress plus phone, with no gap in between, is a relapse recipe. Stress plus a 2-minute reset, then phone, is just a hard moment handled.

This is the kind of rule that sounds too small to matter. It isn’t. It’s exactly the kind of rule that compounds across a year.`,
      },
      {
        type: 'content',
        title: 'Real regulation vs fake relief',
        body: `There’s an important distinction here. Real regulation calms your nervous system in a way that lasts. Fake relief gives you a quick state-shift now and a worse baseline later. They feel similar in the moment, but they shape completely different lives.

Real regulation tools share three traits: they’re **slow**, they’re **physical**, and they leave you **clearer afterward, not foggier**.

Slow breathing is real regulation. Doom-scrolling isn’t. A walk outside is real. Sugar binges aren’t. Talking to a friend is real. Checking notifications obsessively isn’t. Cold water on your face is real. Half an hour on social media isn’t.

> Anything that feels like “relief” but leaves you more depleted the next morning was probably part of the addiction, not part of the recovery.

You don’t need a long list of regulation tools. You need one or two that you actually do, repeatedly, when stress hits.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'When stress hits, do you usually reach for something that calms you down (breath, walk, water, conversation) or something that distracts you (phone, scroll, snack, screen)?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s a real foundation. Today’s job is to formalise it: name your one go-to regulation tool and commit to using it twice today, even when stress feels small.`,
          },
          {
            answer: 'No',
            responseCard: `That’s honest and very common. The good news is, the upgrade is small — pick one slow, physical regulation tool and use it once today on purpose. One rep is enough to start changing the default.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Sleep and stress are the same project',
        body: `If your sleep is short or fragmented, your stress response is louder by default. A tired nervous system reacts to small things as if they were big things. That’s why bad sleep nights so often turn into hard urge nights — your body is already in a low-grade alarm state, and porn is a familiar way to silence the alarm.

> Sleep is not a separate topic from stress. They share the same nervous system, and they win or lose together.

That’s why Day 6’s work shows up again here. Protect sleep aggressively, and stress regulation gets dramatically easier. Skip sleep, and even the best regulation tools struggle to keep up. The Plan’s evening protocols are designed to set up *both* — that’s not an accident.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Are you treating sleep and stress as separate problems, instead of as one nervous system that needs both?',
        options: [
          {
            answer: 'Yes',
            responseCard: `Most people are. Today’s shift is small but powerful — when you protect sleep, you’re also protecting tomorrow’s stress response. That’s two problems handled by one habit.`,
          },
          {
            answer: 'No',
            responseCard: `That’s a more advanced view than most people start with. Use today to lock in the bedtime routine that makes both projects easier — strong sleep is the cheapest stress-reduction tool you have.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 10:`,
        bullets: [
          'Most slips aren’t triggered by big stress events — they’re triggered by accumulated low-grade stress with no off switch.',
          'The after-stress rule: 2 minutes of reset between a stressful moment and your phone breaks the autopilot link to porn.',
          'Real regulation is slow, physical, and leaves you clearer afterward; fake relief gives you a quick state-shift and a worse baseline.',
          'One or two regulation tools you actually use beats ten you read about and never practise.',
          'Sleep and stress are the same nervous system. Protecting one protects the other.',
        ],
        closing: `You’ve just added an underrated relapse-prevention tool that will quietly carry you through the next three weeks. Now let’s get the Day 10 protocol going.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 11 — Identity Shift (Day 11)
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 11,
    day: 11,
    title: 'Identity Shift',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Identity Shift',
        body: `Welcome to Lesson 11. On Day 5 you started touching identity through the lens of values. Today we go deeper into what is, for most people, the most quietly transformative concept in long-term recovery: **identity-based change**.

Today, we’ll cover:`,
        bullets: [
          'the difference between behavior change and identity change',
          'why “proof actions” reshape self-image faster than affirmations do',
          'the identity statement that beats motivational quotes',
          'how the inputs you allow into your day shape your beliefs about yourself',
          'why streak-counting can quietly become a trap',
        ],
        closing: `By the end of this lesson, you’ll have a clearer answer to the most important question in recovery: not *what am I trying to stop*, but *who am I becoming*.

Let’s shift.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'Behavior change vs identity change',
        body: `There are two ways to change a behavior, and they look almost identical from the outside but feel completely different on the inside.

The first is *behavior-based*: I am someone who does X, but I am trying not to do X. Every time you don’t do X, it costs effort, and every time you do X, it confirms who you really are underneath. This kind of change is exhausting because the “real you” is still on the wrong side of the line.

The second is *identity-based*: I am becoming someone who doesn’t need X. Every time you don’t do X, it confirms who you’re becoming, and every time you slip, it’s a behavior that doesn’t fit who you are — not proof that you’re a fraud. This kind of change is much more durable because the “real you” has switched sides.

> The deepest question in recovery isn’t *how do I stop?* It’s *who am I becoming?*

The answer to the second question is what carries you through Day 60, Day 100, and Day 365 — long after the novelty of Day 1 has worn off.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Right now, when you think about porn, does it feel more like *something you do* or more like *something you used to do*?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That shift, even if it’s only partial, is identity in motion. Today’s job is to feed it on purpose with proof actions that confirm the new direction.`,
          },
          {
            answer: 'No',
            responseCard: `That’s honest, and it’s where most people on Day 11 actually are. The good news is, identity isn’t something you wait for — it’s something you build, one proof action at a time. Today is the day to start.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Proof actions reshape identity faster than affirmations',
        body: `There’s a quiet truth about self-image: your brain trusts what you do far more than what you tell it. Affirmations alone — “I am disciplined, I am clean, I am strong” — rarely move the needle if your daily actions don’t back them up. Your brain notices.

What does move the needle is a *proof action*. A small, completed act that fits the identity you’re moving toward. Going on the planned walk. Leaving the phone in the kitchen. Doing the deep work block. Sending the honest message. Each one is a tiny, undeniable piece of evidence: *I am the kind of person who does this.*

> Stack enough proof actions, and the identity stops being a story you’re trying to believe and starts being a fact you’re used to.

This is why Day 11’s morning protocol asks you to choose one proof action and complete it. Not five. Not ten. One. Done. The point is to build the habit of providing your brain with evidence on purpose.`,
      },
      {
        type: 'content',
        title: 'The identity statement',
        body: `A lot of recovery advice gets stuck at the level of avoidance: don’t look, don’t scroll, don’t test. Avoidance is necessary, but it doesn’t build a self-image. You can’t add up a thousand “don’ts” into a person.

This is where a short, written *identity statement* helps. Something like: *I’m someone who protects my attention and the people I care about.* Or: *I’m someone who keeps promises to myself.* Read it out loud at the start of the day, and let your actions confirm it before evening.

The statement isn’t a wish. It’s a description of the version of you that today’s choices will produce. The more specific and personal you make it, the better.`,
      },
      {
        type: 'content',
        title: 'Inputs shape beliefs',
        body: `There’s a subtle layer most people miss: the inputs you allow into your day silently shape what your brain believes about itself.

If your feed is full of content that treats porn as funny, normal, or harmless, your brain absorbs that frame, even if you’d argue against it consciously. If the people, accounts, and communities you spend time with constantly sexualise everything, that becomes part of your background mental environment. The identity you’re trying to build has to swim against that current every day.

> Curate your inputs like your identity depends on them — because it does.

You don’t have to scrub everything overnight. You just have to notice that *what you consume becomes part of who you are*, and start nudging it in the direction of the version of you you’re becoming.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'If a stranger looked only at your feeds, communities, and entertainment for a week, would they conclude you’re becoming the version of you you actually want to be?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s strong alignment, and it’s rare. Today’s job is to find the *one* remaining input that doesn’t fit and edit it out. Identity holds when the inputs hold.`,
          },
          {
            answer: 'No',
            responseCard: `That answer is more honest than most people will ever give. You don’t have to fix all your inputs today. Pick the loudest one that contradicts who you’re becoming, and remove it. The rest can follow.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The streak trap',
        body: `There’s one more pattern worth naming on Day 11, because it quietly undoes a lot of week-2 progress: the streak trap.

Streaks can be useful — they create momentum and a small feedback loop. But when streak-counting becomes the *whole* identity, two failure modes appear. First, every almost-slip becomes a high-stakes moment that triggers more anxiety and, paradoxically, more risk. Second, when a slip eventually happens (and for many people one will, somewhere along the way), the streak resets to zero — and the identity built on the streak collapses with it.

A streak is one piece of evidence. It’s not the whole self.

> Track who you’re becoming, not just how many days you’ve been clean.

If you slip, you don’t become a different person — you make a behavior that doesn’t fit who you are, and you return to the path. That’s what identity-based change looks like under pressure.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Are you currently treating your streak as a number to protect, or as one piece of evidence about who you’re becoming?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That answer matters because it determines what happens after a slip. If a streak is the whole identity, a slip ends you. If a streak is one piece of evidence, a slip is just data — and you continue. Choose the second frame on purpose today.`,
          },
          {
            answer: 'No',
            responseCard: `That’s the more durable frame. Hold it carefully — under stress, the streak-as-everything trap can creep back in. Stay anchored to the identity, not the count.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 11:`,
        bullets: [
          'Behavior change costs effort because the “real you” is still on the wrong side; identity change is durable because the “real you” has switched sides.',
          'Proof actions — small completed acts that fit who you’re becoming — reshape self-image faster than affirmations.',
          'A short, written identity statement gives your day a direction that beats motivational quotes.',
          'Inputs shape beliefs — what you consume becomes part of who you are. Curate accordingly.',
          'The streak trap: track who you’re becoming, not just how many days you’ve been clean. Identity survives slips; pure streak-counting often doesn’t.',
        ],
        closing: `You’ve just installed the deepest motivation engine in the whole 28 days. Now let’s get the Day 11 protocol going.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 12 — Cue Clean-Up (Day 12)
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 12,
    day: 12,
    title: 'Cue Clean-Up',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Cue Clean-Up',
        body: `Welcome to Lesson 12. Day 1 cleaned the obvious cues. Today we go after the ones that hide in plain sight — the cues most people don’t even register as cues, and that quietly keep the old pathway warm.

Today, we’ll cover:`,
        bullets: [
          'the difference between obvious cues and subtle cues',
          'why subtle cues are often more dangerous than the obvious ones',
          'the “escalation chain” your brain runs without permission',
          'why “it’s not porn, so it’s fine” is a trap',
          'the four-week clean-content rule',
        ],
        closing: `By the end of this lesson, you’ll see your daily inputs through a new lens — and notice the small, harmless-seeming things that have been doing more damage than you thought.

Let’s clean up.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'Obvious cues vs subtle cues',
        body: `Obvious cues are the ones everyone knows about: explicit content, certain sites, certain searches. Day 1 handled most of those, and you’ve probably been holding the line on them for almost two weeks.

Subtle cues are different. They’re the inputs your brain associates with porn at a sub-threshold level — content that is suggestive but not explicit, accounts that drip-feed sexualised images into a feed of normal stuff, “explore” pages that use your viewing patterns against you, certain music videos, certain comment sections, certain corners of the internet that always seem to drift toward the same thing.

Most people on Day 12 still consume a lot of these. And most of them don’t see it as a problem, because none of it crosses the explicit line.

That’s exactly what makes them dangerous.

> Subtle cues are dangerous precisely because they feel harmless.

A brain that has spent years linking porn to certain images and patterns doesn’t need full nudity to fire the loop. A suggestive thumbnail, a certain camera angle, a certain caption — the link is already trained. Today’s job is to start treating subtle cues with the same seriousness you give the obvious ones.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Looking honestly at the past two weeks, have you stayed on suggestive feeds or accounts that were never quite porn but that always made you feel slightly stirred or restless?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s honest, and almost universal. Those slightly-stirred-but-not-quite feelings are exactly the cue staying warm. The move today is to remove just one of those subtle cues — one specific account, one specific feed.`,
          },
          {
            answer: 'No',
            responseCard: `That puts you ahead of most people. Use today to do a final audit anyway — subtle cues hide best in feeds you barely notice. Better to find the last one now than have it ambush you in week 3.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The escalation chain',
        body: `There’s a pattern most people in recovery eventually recognise, and it has a name: the *escalation chain*. It looks something like this:

A normal scroll → a slightly suggestive image → a click into a related account → a few minutes of soft content → a search → a slip.

The chain is rarely intentional. It’s a sequence of tiny, almost-invisible steps, each of which feels harmless on its own. The only reason it works is that the brain has practiced it before. Each step releases a small pulse of dopamine, and each small pulse makes the next step feel slightly more reasonable.

> Most relapses don’t start with porn. They start with content that wasn’t porn but lived next to it.

The way to break an escalation chain isn’t at the bottom (when you’re already searching). It’s at the top — at the “normal scroll” that your brain has secretly been using as a launchpad.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'If you trace your last few hardest moments, did they almost always start with a scroll or feed that wasn’t explicitly about porn?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the escalation chain in action, and now you can see it. Take five minutes today to remove or restrict the *first* link in that chain — the “innocent” feed at the top — not just the dramatic last step.`,
          },
          {
            answer: 'No',
            responseCard: `That’s either strong design on your part or a sign the chain hides better than you think. Spend a few minutes today honestly tracing your worst recent moment backward to its very first step. The first step is where the leverage is.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: '“It’s not porn, so it’s fine”',
        body: `There’s a sentence almost everyone says to themselves at this stage, and it’s worth dismantling: *“It’s not porn, so it’s fine.”*

The line of argument feels reasonable. You’re not breaking the explicit boundary. You haven’t crossed into the obvious red zone. Surely a little bit of suggestive content, a little bit of feed-drift, a little bit of “just looking,” is harmless.

The problem is that your brain isn’t scoring this on a moral scale. It’s scoring it on a *conditioning* scale. Every time you let your attention drift back into the same kind of content that used to lead to porn, you’re practising the same pattern, just with the volume turned down a notch. The pathway stays warm. The next slip starts closer.

> The question isn’t *“Is this porn?”* The question is *“Is this keeping the pathway warm?”*

That’s a much harder honest answer, and it’s the one Day 12 is built around.`,
      },
      {
        type: 'content',
        title: 'The four-week clean-content rule',
        body: `For the next two weeks (and ideally the rest of the program), the cleanest thing you can do for your nervous system is a temporary rule: *no suggestive feeds, no “explore” pages, no image-heavy infinite scrolls, no late-night content drift.*

This isn’t about purity. It isn’t about being prudish. It’s about giving your brain a clean enough signal for long enough that the conditioned pathway between “normal scroll” and “porn” starts to actually weaken.

Two to four weeks of clean inputs is what most people need to feel a real shift in baseline craving. Less than that, and the pathway stays primed. More than that, and you’ll start noticing how much quieter your mind feels — and how much less the old triggers pull on you.

> Temporary intensity is the price of long-term freedom.

If a particular feed or platform makes the rule impossible, that’s information. It probably means that platform was doing more conditioning work than you wanted to admit. Edit accordingly.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Are you willing to commit to two full weeks of clean inputs — no suggestive feeds, no explore pages, no late-night image-scrolling — to give the conditioning a real chance to weaken?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the commitment that produces a noticeable baseline shift. Two weeks isn’t forever — it’s long enough for the pathway to actually start cooling. Lock the rule in today.`,
          },
          {
            answer: 'No',
            responseCard: `That hesitation is honest, and it usually means part of you is protecting the loophole. Notice that without judgement. Then ask: what would it cost you to try the clean two weeks anyway, just as an experiment?`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 12:`,
        bullets: [
          'Obvious cues are easy to remove; subtle cues hide in plain sight and are often more dangerous.',
          'The escalation chain explains why most relapses start with content that *wasn’t* porn but lived next to it.',
          '“It’s not porn, so it’s fine” is the wrong scoring system — your brain scores on conditioning, not morality.',
          'The right question is *“is this keeping the pathway warm?”*',
          'A two- to four-week clean-content rule gives the conditioning a real chance to weaken — temporary intensity for long-term freedom.',
        ],
        closing: `You’ve just upgraded your awareness of the most underrated category of triggers in recovery. Now let’s get the Day 12 protocol going.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 13 — Connection Day (Day 13)
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 13,
    day: 13,
    title: 'Connection Day',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Connection Day',
        body: `Welcome to Lesson 13. So far, almost everything in this Plan has been internal — environment, thoughts, urges, identity, attention. Today we look at the most underestimated relapse-prevention tool in your whole month: **other people**.

Today, we’ll cover:`,
        bullets: [
          'why isolation is the favorite environment of compulsive behavior',
          'how loneliness silently triggers urges that don’t feel like loneliness',
          'the difference between accountability and exposure',
          'why emotional intimacy quietly competes with porn in a way nothing else does',
          'how to add connection without making it feel like a project',
        ],
        closing: `By the end of this lesson, you’ll see other people not as a distraction from recovery but as one of its strongest foundations.

Let’s connect.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'Isolation is the favorite environment of compulsion',
        body: `Compulsive behavior almost always grows in private. Not just secret physically — secret emotionally too. The pattern is simple and consistent: the more isolated you feel, the louder urges get, and the more likely you are to act on them. The more connected you feel, the quieter urges get, and the easier it is to ride one out.

This isn’t a moral observation. It’s a nervous-system one. Humans are wired to regulate emotional states partly through other humans. A short conversation, a hug, a presence in the room — these all directly calm the parts of your brain responsible for restlessness and craving.

> Porn thrives in silence. Connection turns the lights on.

That’s why almost every long-term recovery story includes other people — friends, partners, therapists, support groups, accountability buddies. Not because anyone needs to *fix* anyone, but because compulsion has a much harder time hiding in a life that has witnesses.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Looking back at your hardest recent moments, were most of them in some way private or isolated — even when you weren’t literally alone?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That tracks for almost everyone, and it’s a clue to where your work goes next. Today’s job is one small connection deposit — a message, a call, an honest sentence to one person. Just one.`,
          },
          {
            answer: 'No',
            responseCard: `That awareness is rare. Hold it carefully — even people with strong social lives can be emotionally isolated in the parts of life that matter most. Use today to deepen connection in the area that recovery touches.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Loneliness disguises itself',
        body: `One of the trickiest things about loneliness as a trigger is that it doesn’t usually feel like loneliness. It feels like restlessness. It feels like *“I’m bored.”* It feels like *“there’s nothing to do.”* It feels like an itchy energy looking for a screen to land on.

That’s why the urge often arrives looking like a porn urge when it’s actually a *connection urge* in disguise. Your brain learned to translate “I need to feel less alone” into “I need to feel something intense,” and porn was the fastest way to deliver intensity. The real need was never the porn. It was the contact.

> A surprising number of porn urges are really connection urges that learned to wear a different mask.

That’s why the practical tool for loneliness isn’t just “distract yourself” — it’s *“contact someone, even briefly.”* A two-line text. A short call. A walk with a friend. The brain calms in a way that no app can replicate, because the underlying need is finally being met.`,
      },
      {
        type: 'content',
        title: 'Accountability vs exposure',
        body: `Accountability has a bad reputation, partly because people confuse it with exposure. They’re not the same thing.

*Exposure* is what shame uses: telling everyone everything, dramatically, before you’re ready, and hoping it makes you accountable through humiliation. Exposure doesn’t work in the long run because it usually produces a backlash — more shame, more secrecy, and eventually, more relapse.

*Accountability* is much smaller and quieter. It’s one trusted person knowing you’re working on this. It’s a shared blocker password. It’s a simple agreement that you can text someone if you’re struggling, and they don’t have to fix you — they just have to acknowledge it. It’s a sentence like *“I’m doing this 28-day Plan, and I might want to check in with you every so often.”*

> Accountability isn’t about anyone watching you fail. It’s about removing the silence that compulsion depends on.

You don’t need many people in this layer. One reliable person is enough to take secrecy off the table as a coping option — and once secrecy is off the table, the addiction loses one of its biggest tools.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Right now, is there at least one person in your life who knows you’re actively working on this, even if they don’t know all the details?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s a real protective layer. Use today to keep it lightly active — a check-in message, a short conversation, anything that keeps the silence from rebuilding.`,
          },
          {
            answer: 'No',
            responseCard: `That’s honest. You don’t need to confess everything — even one trusted person knowing the broad strokes shifts the dynamic. Pick the safest possible person and tell them just enough to take secrecy off the table.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Intimacy first, performance second',
        body: `For people in committed relationships, there’s a layer worth naming directly: porn often replaces emotional intimacy, not just physical intimacy. The behavior trains the brain to treat sex as a private, performance-driven event — separated from connection, conversation, or vulnerability.

Recovery, then, isn’t just about removing porn. It’s about rebuilding sex *with* connection rather than as a substitute for it. That looks like time, attention, conversation, presence, affection — long before performance is the topic. Most couples find that the intimacy itself feels different once that order changes.

For people who are single, the equivalent is rebuilding a relationship with self-respect. Grooming, fitness, learning, doing things alone that you’re proud of. Porn often quietly stands in for confidence, and confidence has to be rebuilt directly, not borrowed from a screen.

> Connection — to yourself, to others, to people you love — quietly competes with porn in a way nothing else does.

This is the layer that makes long-term recovery feel like a richer life, not just a deprived one.`,
      },
      {
        type: 'content',
        title: 'Connection without making it a project',
        body: `A common mistake at this stage is treating connection like a task to optimise. People schedule “connection time” the way they schedule meetings, and it ends up feeling brittle and performative.

Connection is more reliable when it’s small, frequent, and casual. A short text in the morning. A coffee with a friend, no agenda. Five minutes of phone-down attention with the people you live with. A walk with someone instead of alone. A real conversation instead of a checked-in one.

It doesn’t have to be deep. It just has to be present.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'In the past week, have you had at least one interaction with another person where your phone was completely out of sight and you were genuinely paying attention?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That kind of presence is rarer than people realise, and it’s a real protective factor. Try this today: schedule one more — small, casual, phone away.`,
          },
          {
            answer: 'No',
            responseCard: `That answer is more honest than most people give. The fix isn’t dramatic — pick one short interaction today, put the phone in another room, and be fully there. One real conversation is worth more than a week of distracted ones.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 13:`,
        bullets: [
          'Compulsive behavior thrives in isolation and weakens in connection — that’s a nervous-system fact, not a mood.',
          'Loneliness disguises itself as restlessness or boredom; many urges are really connection urges in a different mask.',
          'Accountability is small and quiet; it’s not the same as exposure, and it doesn’t require humiliation to work.',
          'For partners: emotional intimacy quietly competes with porn in a way nothing else does. For singles: confidence has to be rebuilt directly, not borrowed.',
          'Connection is most reliable when it’s small, frequent, and casual — phone-down presence beats scheduled depth.',
        ],
        closing: `You’ve just added a quiet but powerful layer to the system you’ve been building. Now let’s get the Day 13 protocol going — and tomorrow, we hit the two-week wall together.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 14 — Two-Week Wall (Day 14) — MILESTONE
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 14,
    day: 14,
    title: 'Two-Week Wall',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Two-Week Wall',
        body: `Welcome to Lesson 14. You’ve just completed two full weeks of recovery. That’s a real accomplishment — and it also puts you on a specific, predictable, tricky day in the process.

Around the two-week mark, almost everyone hits a version of the same psychological pattern. It has a name: the **two-week wall**. Today, we’ll dismantle it together.

Today, we’ll cover:`,
        bullets: [
          'why the two-week wall is a real, recurring pattern — not a personal failure',
          'the “bargaining scripts” your brain runs around now, almost word for word',
          'why progress can feel like permission (and why it isn’t)',
          'the no-testing rule, deeper this time',
          'how to enter week 3 by doubling down, not by loosening up',
        ],
        closing: `By the end of this lesson, you’ll see what’s coming clearly enough to walk through it instead of into it.

Let’s hit the wall on purpose.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'Why the two-week wall is real',
        body: `Almost every person who has tried to break a compulsive behavior — porn, alcohol, sugar, smoking, doom-scrolling — describes some version of the same thing around the 10-to-14-day mark. The dramatic urges quiet down. The early motivation fades. Life starts to feel a little flat. And a quiet voice shows up, saying: *“See? You’ve got this. Maybe you’ve been overdoing it. Maybe one little exception wouldn’t hurt.”*

That voice isn’t wisdom. It’s the addiction in a calmer outfit.

> The two-week wall is the moment your brain stops fighting you head-on and starts negotiating.

The reason this is so consistent is biological. The first two weeks burn through the most acute reward expectation, and your brain’s dopamine baseline starts to actually shift. The shift feels like “flatness” because the brain is recalibrating to a quieter normal. To a brain that’s used to high stimulation, “quiet” feels like “missing something.”

This is also why the two-week wall is so frequently the moment people slip — and the slip almost always starts with a bargain.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Have you noticed a small voice in the past day or two suggesting that maybe you’ve been overdoing this — and you could probably handle a little exception?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That voice is exactly what we just named. Hearing it isn’t a problem. Believing it is. Today’s lesson hands you a clean answer the next time it shows up.`,
          },
          {
            answer: 'No',
            responseCard: `That’s either great awareness or a sign the bargain hasn’t hit yet. Either way, plan for it. The bargain often shows up later in the week, dressed up as something reasonable. You’ll be ready.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The bargaining scripts',
        body: `The voice on the two-week wall doesn’t use one line. It uses a small library of them, and they’re recognisable. See if any of these sound familiar:

- *“I’ve done so well — I’ve earned a small reward.”*
- *“Just to confirm I’m really in control.”*
- *“It’s not even porn — it’s just a feed.”*
- *“If I can get through tonight, I’ll be fine for the rest of the program.”*
- *“This is the last time, and then I’m back on track.”*

These aren’t random thoughts. They’re scripts. Your brain has used them many times in the past, in multiple compulsive contexts, and it’s using them now because they work — they’ve led to slips before.

> Bargaining isn’t a sign that the wall is winning. It’s a sign that the wall is *predictable*.

The simplest defense isn’t a long debate. It’s recognising the script and refusing to engage with it on its own terms. *That’s a thought, not a command. Not today, I’m building something bigger.* Then you move your body and change rooms.`,
      },
      {
        type: 'content',
        title: 'Why progress can feel like permission',
        body: `There’s a particular trap that the two-week wall uses against high-achievers and disciplined people, and it’s worth naming: progress can feel like permission.

The logic feels reasonable. You’ve worked hard. You’ve been consistent. The system is in place. Surely you’ve earned a small loosening, a small reward, a small experiment. And surely the discipline you’ve built will protect you if it goes sideways.

The problem is that recovery isn’t a discipline competition. It’s a conditioning project. Conditioning doesn’t care how hard you’ve worked. It only cares how recently you’ve practised the pathway. One “small exception” practised on Day 14 puts you closer to a slip on Day 15 than you were on Day 13 — even if you feel stronger.

> Progress is proof your system works. It’s not a coupon to spend on a test.

The version of the reward that actually works is the one that *strengthens* the system: a clean celebration, a values-aligned treat, an investment in something that builds you up. That’s what tomorrow is for.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Are you tempted to celebrate two weeks by loosening one boundary, instead of by tightening one?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the trap in real time. Today’s job is to flip it: pick the weakest boundary and make it stronger tonight, and choose a clean reward that doesn’t put the conditioning at risk.`,
          },
          {
            answer: 'No',
            responseCard: `That’s the answer that gets people to Day 60. Use today to reinforce the boundary that has worked best so far — that’s how week 3 starts at a higher baseline.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The no-testing rule, deeper',
        body: `You met the no-testing rule on Day 7. On Day 14, it matters even more.

By now, your brain has more evidence that you can hold the line, which means the bargain is more sophisticated. *Just one feed. Just one search. Just one curious peek.* Your brain frames it as gathering data, as confirming control, as a reasonable experiment.

It isn’t. Every exposure to a cue strengthens the conditioned pathway, full stop. The brain doesn’t register “this is a test.” It registers “we did the loop again.” Two weeks of work can be undone — not all of it, but a meaningful chunk of it — by ten minutes of testing on Day 14.

> The no-testing rule isn’t about being fragile. It’s about not handing back progress you fought for.

For the next two weeks, treat this rule the same way you’d treat a wound that’s healing. You don’t poke at it to “see how it’s doing.” You leave it alone, you protect it, and it heals faster.`,
      },
      {
        type: 'content',
        title: 'How Mind Compass can help',
        body: `Two weeks in, the work shifts again. Week 3 starts focusing on natural reward, sexual reset, thought training, environment proofing, and emotional honesty — all the layers that turn early progress into long-term stability. Mind Compass keeps each layer in the same shape: a short lesson, a structured morning protocol, an evening protocol, a way to log what you’re learning.

The Plan does the remembering for you. Your job is just to keep showing up, especially today, when the wall is asking the loudest questions.

You’ve made it further than most people who try this ever do. The remaining two weeks aren’t harder than the first two — they’re different. We’ll walk you through each step.`,
        cta: 'Continue',
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Are you willing to enter week 3 by treating today’s milestone as proof your system works — and reinforcing that system tonight?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s exactly the response that walks straight through the wall. Pick one boundary tonight to upgrade, choose a clean reward to enjoy, and treat tomorrow as the first day of week 3, not the first day of complacency.`,
          },
          {
            answer: 'No',
            responseCard: `That hesitation is honest, and it’s the wall talking. You don’t have to feel certain to act anyway. Choose one tightening action and one clean reward, and let the actions argue back against the doubt.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 14:`,
        bullets: [
          'The two-week wall is a real, predictable pattern — not a personal failure or a sign of weakness.',
          'Around now, your brain stops fighting you head-on and starts negotiating with familiar bargaining scripts.',
          'Progress can feel like permission. It isn’t. Recovery is a conditioning project, not a discipline contest.',
          'The no-testing rule matters even more on Day 14 than on Day 7 — “gathering data” is the bargain dressed up as reason.',
          'Celebrate two weeks by tightening one boundary and choosing a clean reward that strengthens the system, not by loosening one.',
        ],
        closing: `You’ve just walked through the most predictable wall in the entire 28 days with your eyes open. That alone puts you ahead of most people. Now let’s get the Day 14 protocol going and step into week 3.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 15 — Natural Reward Rebuild (Day 15)
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 15,
    day: 15,
    title: 'Natural Reward Rebuild',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Natural Reward Rebuild',
        body: `Welcome to Lesson 15 — the first day of week 3. By now, you’ve probably noticed something strange: ordinary life feels a little quieter than it used to. Maybe even flat. That’s not a bug — it’s a sign your reward system is finally recalibrating.

Today, we’ll cover:`,
        bullets: [
          'what your dopamine baseline actually is and why porn distorted it',
          'the concept of *supernormal stimuli* — and why nothing in nature was built to compete with them',
          'how to rebuild a brain that finds real life pleasurable again',
          'why “chasing a replacement high” backfires',
          'the patient practice of natural reward',
        ],
        closing: `By the end of this lesson, you’ll see the “flatness” of week 3 not as a loss but as the early stage of getting your real reward system back.

Let’s rebuild it.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'Why life feels quieter right now',
        body: `If you’ve been clean for two weeks, your brain has started doing something it hasn’t had a chance to do in a long time: recalibrating. The dopamine spikes that porn produced were not normal background noise — they were huge, repeated, on-demand surges. Your brain learned to expect them, and it adjusted by lowering its baseline sensitivity to everything else.

That’s why ordinary pleasures — a meal, a walk, a song you used to love — can feel quieter than you remember. Your brain isn’t broken. It’s reading normal-volume signals against a background it had set to “loud.”

> Week 3 flatness isn’t the absence of joy. It’s the absence of the artificial intensity that was crowding it out.

The good news is that this flatness is temporary, and it’s an excellent sign. It means the recalibration is actually happening. The bad news is that this is exactly the moment when many people give up — because the reward they were promised by recovery hasn’t shown up *yet*, and the old loop still feels like it could deliver intensity faster.

Today is about understanding what’s happening, and feeding the recalibration on purpose.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'In the past few days, has ordinary life — food, music, a walk, a conversation — felt slightly less satisfying than it should?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s your dopamine baseline resetting in real time. It’s uncomfortable, but it’s actually the most encouraging sign of the week. Today’s job is to keep feeding small, real rewards and let the recalibration finish its work.`,
          },
          {
            answer: 'No',
            responseCard: `That’s either strong baseline already or a sign you’re reading life through a different lens than most people on Day 15. Either way, today’s job is the same: protect the small, natural rewards that keep the system stable.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Supernormal stimuli',
        body: `There’s a concept from biology that explains why porn is so hard to “simply choose against,” and it has a name: *supernormal stimuli*.

A supernormal stimulus is something engineered to exceed any natural version of a reward. Junk food is engineered to exceed natural food, social media is engineered to exceed natural connection, and porn is engineered to exceed natural arousal. They all hijack systems that evolved for something quieter and rarer.

Your brain wasn’t built to compete with this kind of input. It was built for a world where rewarding things were finite, slow, and tied to real effort. When you give it on-demand intensity, the natural rewards start to look small by comparison — not because they shrank, but because the comparison shifted.

> Porn isn’t losing to your willpower because you’re weak. It’s winning by design.

That’s why you can’t out-discipline a supernormal stimulus indefinitely. You have to *remove the comparison* long enough that natural rewards start feeling normal-sized again. That’s exactly what these 28 days are doing.`,
      },
      {
        type: 'content',
        title: 'Rebuilding the reward system',
        body: `Recalibration happens through repeated exposure to small, real, completed rewards. Not heroic ones. Not dramatic ones. Just consistent ones, often enough that your brain re-learns what “rewarding” feels like at a normal volume.

Three categories help:`,
        subsections: [
          {
            heading: 'Sensory rewards',
            body: `A real meal eaten slowly. Sunlight on your face. Music with no other input. A hot shower. A walk somewhere you find beautiful. These work because they engage the same systems porn was hijacking — but at the natural volume your brain was built for.`,
          },
          {
            heading: 'Mastery rewards',
            body: `Finishing something you’re proud of. Practising a skill. Learning ten new words. Completing a workout. Building or making anything. These work because they trigger reward through *competence*, which is one of the most stable and long-lasting reward sources humans have.`,
          },
          {
            heading: 'Connection rewards',
            body: `A real conversation, with the phone away. Helping someone. Being helped by someone. Time with people who know you. These work because connection releases its own quiet, sustained reward — one that doesn’t crash and that compounds over time.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Right now, are you giving your brain at least one *real, completed* reward every day — sensory, mastery, or connection?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the practice. Today’s job is to make it deliberate — pick one reward, schedule it, do it without multitasking, and let your brain actually register it.`,
          },
          {
            answer: 'No',
            responseCard: `That gap is part of why week 3 can feel flat. The fix isn’t dramatic. Pick one small reward today — sensory, mastery, or connection — and do it without the phone in the way. One real reward beats five distracted ones.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Why “chasing a replacement high” backfires',
        body: `A common mistake at this stage is trying to fill the dopamine gap with a different kind of intensity — extreme workouts, sugar binges, high-stimulation videos, gambling apps, even shopping sprees. The behavior is different, but the underlying pattern is identical: your brain is still chasing the supernormal hit, just from a new source.

The replacement high feels like recovery for a few days, then it crashes — usually right around the moment you stop the new behavior. And the crash often becomes the trigger for an old slip.

> Replacing one supernormal stimulus with another keeps the baseline broken. Only patient, normal-volume rewards reset it.

This doesn’t mean you can’t enjoy intense things. It means that during these specific weeks, the goal is calibration, not chasing. Quiet wins.`,
      },
      {
        type: 'content',
        title: 'The patience problem',
        body: `The hardest part of this lesson is the timing. The supernormal hit is *fast*. The natural rewards are *slow*. In the gap between them — which lasts roughly two to six weeks for most people — your brain will keep insisting that the slow rewards aren’t enough.

That insistence is the recalibration talking, not the truth. If you keep feeding small, real rewards through the gap, the baseline shifts and natural rewards start to feel substantial again. If you give in to the insistence, the baseline stays broken and the cycle restarts.

> The gap is where the work actually happens. Almost everyone who gives up on recovery, gives up in the gap.

Knowing the gap is real makes it much easier to walk through. You’re not failing. You’re recalibrating. Show up for the boring rewards. The volume comes back.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Are you willing to keep feeding small, real, normal-volume rewards for the next two weeks, even if your brain insists they’re not enough?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the patience that produces the recalibration. Pick one small reward today and protect it. Pick the same one tomorrow. The volume returns through repetition.`,
          },
          {
            answer: 'No',
            responseCard: `That hesitation is honest, and it’s the gap talking. You don’t have to feel certain to act anyway. Commit to *one* reward today, and let the experience itself answer the doubt.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 15:`,
        bullets: [
          'The “flatness” of week 3 isn’t loss; it’s your dopamine baseline recalibrating from supernormal to normal.',
          '*Supernormal stimuli* like porn are engineered to exceed any natural reward — your brain isn’t losing on willpower, it’s losing by design.',
          'Real recalibration happens through repeated, small, completed rewards in three categories: sensory, mastery, connection.',
          'Chasing a replacement high keeps the baseline broken. Only normal-volume rewards reset it.',
          'The gap between giving up the supernormal hit and feeling the natural rewards is where almost everyone quits — and where the actual work happens.',
        ],
        closing: `You’ve just installed the most important week-3 mindset shift. Now let’s get the Day 15 protocol going.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 16 — Sexual Reset (Day 16)
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 16,
    day: 16,
    title: 'Sexual Reset',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Sexual Reset',
        body: `Welcome to Lesson 16. We need to talk about something most apps and recovery programs awkwardly avoid: how porn rewires sexual response itself, and what it actually takes to reset it. Today is about that — directly, calmly, and without shame.

Today, we’ll cover:`,
        bullets: [
          'how porn-conditioned arousal differs from natural arousal',
          'why libido can swing in unpredictable ways during recovery',
          'the role of imagination vs visual triggers',
          'the “clean boundary” for the next two weeks — and why it matters',
          'how to handle sexual energy spikes without reactivating the loop',
        ],
        closing: `By the end of this lesson, you’ll have a clearer, healthier relationship with your own sexual response — one that isn’t held hostage by a screen.

Let’s reset.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'What porn does to sexual response',
        body: `Sexuality is biological, but it’s also deeply *trained*. Whatever you repeatedly pair with arousal, your brain learns to associate with arousal. Porn pairs arousal with very specific things: high novelty, fast escalation, certain visual patterns, certain camera angles, certain narratives, and the absence of a real partner.

Over time, this trains the brain to expect those exact conditions in order to fire arousal. Real sex, real intimacy, real partners — none of which match the trained conditions — start to feel less stimulating. This pattern, sometimes called *porn-conditioned arousal*, is one of the quieter costs almost no one talks about openly.

> Your sexual response isn’t broken. It’s been trained on the wrong thing.

The good news is that the same neuroplasticity that built this pattern can also rebuild it. Sexual response is one of the most adaptable systems in the brain. Two to six weeks of clean input is often enough for noticeable shifts.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Have you ever noticed that real intimacy or real situations felt less stimulating than the patterns you were used to seeing on a screen?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That experience is one of the most common (and least-talked-about) signs of porn-conditioned arousal. It isn’t permanent — it’s a trained pattern that responds to clean input over time. Today’s lesson is about giving that reset a real chance.`,
          },
          {
            answer: 'No',
            responseCard: `That’s either a sign of less conditioning to begin with or a stronger natural baseline. Either way, the work today still matters — clean inputs and clean boundaries protect what you have.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Why libido swings in recovery',
        body: `A lot of people in early recovery panic about libido. Sometimes it spikes — feeling much higher than usual, with frequent urges and restlessness. Sometimes it drops — feeling lower than usual, with less interest than expected. Sometimes it does both, in unpredictable patterns, on different days.

This variability is normal. Your brain is recalibrating after years of artificial input, and it doesn’t do that in a clean straight line. The spikes are not a sign that you “need” porn. The dips are not a sign that something is permanently wrong. Both are part of the same recalibration.

> Libido swings during recovery aren’t a problem to fix. They’re a system stabilising.

The mistake most people make is using either swing as evidence to abandon the reset. *“I’m too aroused, I can’t handle this”* and *“I’m not aroused at all, this is broken”* are two versions of the same trap. Holding the boundary through both swings is what produces the actual reset.`,
      },
      {
        type: 'content',
        title: 'Imagination vs visual triggers',
        body: `Here’s a piece of this people rarely admit out loud: it isn’t just visual content that keeps the conditioned pattern alive. Your *imagination* can do the same thing.

Vivid sexual fantasy, especially the kind that mirrors porn scenarios, fires many of the same neural pathways as the actual content. So can edging — repeatedly approaching the edge of arousal without release. So can re-watching old scenes in your head. So does “mental rehearsal” of past porn experiences.

This isn’t about thought-policing or shame. Sexual thoughts are normal and healthy, and trying to suppress them just makes them louder (the white-bear effect from Lesson 4). The point is more practical: there’s a difference between *having a sexual thought* and *deliberately extending or escalating one* in a way that matches the old pattern.

> Recovery isn’t about not having sexual thoughts. It’s about not feeding the conditioned pattern with deliberate ones.

When a sexual thought shows up, the urge surfing skill from Lesson 4 still applies: notice, name, breathe, and move on. You don’t have to fight the thought. You just don’t have to host it.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'In the past two weeks, have you sometimes used vivid fantasy or mental replay as a substitute for actually watching porn?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s honest, and it’s really common. Notice it without judgement. The pattern itself is keeping the pathway warm — and the same urge surfing skill works on it. Notice, name, breathe, move on.`,
          },
          {
            answer: 'No',
            responseCard: `That’s a strong place to be on Day 16. Hold it carefully — fantasy can creep in quietly, especially around the two-week mark. Stay anchored to the urge surfing skill if it does.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The clean boundary',
        body: `For the next two weeks (and ideally the rest of the program), the cleanest version of the reset comes from one simple boundary: *no porn, no edging, no sexualised scrolling, no “testing,” no deliberate fantasy escalation.*

This isn’t a moral rule. It’s a practical one. The reset works through *clean input* — a long enough stretch of unmixed signals for the brain to actually retrain. Even small inputs (a feed, a peek, a five-minute fantasy) keep the conditioned pathway warm and reset the clock.

> The reset compounds with consistency and breaks with exceptions. There’s no neutral middle.

This is also where Day 12’s clean-content rule earns its keep. Both rules share the same logic: temporary intensity for long-term freedom.`,
      },
      {
        type: 'content',
        title: 'Handling sexual energy spikes',
        body: `The hardest part of the reset is what to do when sexual energy spikes — naturally and unavoidably — and the old pattern is the obvious release valve. Here’s the practical framework:

When arousal rises, you change *state*, not *thoughts*. You take a shower (a real one, not a fantasy one). You go for a brisk walk. You do twenty squats. You splash cold water on your face. You leave the room. You contact a real person (not for the energy, just for the presence).

The point isn’t to suppress the energy. It’s to redirect it physically. Over time, your nervous system learns *“energy = action,”* not *“energy = porn.”* That association is what makes the reset stick.

> When sexual energy rises, change your state — not your thoughts. The body is faster than the mind.

For people in committed relationships, real intimacy with a partner is also part of the reset, with one important caveat: when intimacy is led by emotional connection rather than by trying to “use” the partner as a porn substitute, both partners notice the difference. The reset isn’t about removing sex. It’s about putting it back in the right context.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'When sexual energy spikes, do you usually try to *think* your way through it, or do you change *state* (movement, shower, walk, contact)?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s a strong practice, and it’s the one that produces the reset. Today’s job is to use it deliberately at least once, even if energy is mild — reps build the new association.`,
          },
          {
            answer: 'No',
            responseCard: `That’s honest, and it’s where most people start. Today’s shift is small but powerful: when arousal rises, the *first* move is physical, not mental. Try it once today. The body is faster than the mind.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 16:`,
        bullets: [
          'Porn-conditioned arousal is a *trained* pattern — your sexual response isn’t broken, it’s been pointed at the wrong things.',
          'Libido swings in early recovery are normal — your brain is recalibrating, and both spikes and dips are part of the same reset.',
          'Imagination and edging keep the conditioned pathway warm; recovery isn’t about not having sexual thoughts, it’s about not feeding deliberate ones.',
          'The clean boundary — no porn, no edging, no sexualised scrolling, no testing, no fantasy escalation — is the practical foundation of the reset.',
          'When sexual energy rises, change *state* (movement, shower, walk), not *thoughts*. The body is faster than the mind.',
        ],
        closing: `You’ve just walked into a topic most programs avoid — and you walked through it cleanly. Now let’s get the Day 16 protocol going.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 17 — Thought Training (Day 17)
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 17,
    day: 17,
    title: 'Thought Training',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Thought Training',
        body: `Welcome to Lesson 17. By now, you’ve probably noticed something: the longer you stay clean, the louder some of your sexual thoughts can get — at least temporarily. That isn’t failure. That’s your brain noticing you stopped feeding the loop, and protesting. Today we work on the skill that defangs those thoughts: **thought training**.

Today, we’ll cover:`,
        bullets: [
          'why intrusive sexual thoughts often get louder *before* they get quieter',
          'the difference between *having* a thought and *believing* a thought',
          'the ACT-style skill of *defusion*',
          'how to write a “response script” for your most common hook thought',
          'why focus blocks are also thought training in disguise',
        ],
        closing: `By the end of this lesson, your thoughts won’t feel like commands you have to obey or wrestle. They’ll feel like mental events you can notice, label, and let pass.

Let’s train them.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'Why thoughts can get louder before they get quieter',
        body: `There’s a paradox in week 3 that catches many people off guard: the longer you go without porn, the more vividly some sexual thoughts can appear. Old scenes can pop up unbidden. Fantasies can feel sharper. Random images can flash through your mind in moments you didn’t expect.

That isn’t evidence that recovery isn’t working. It’s evidence that your brain is *noticing* the absence and trying — automatically, without your permission — to recreate the missing input internally.

> Thoughts don’t disappear because you stop feeding them. They get louder for a while, then they get quieter.

This is a normal phase, and for most people it peaks across the second and third weeks of the program. People who don’t know this often assume the increase in thoughts means the reset isn’t working, and they slip — feeding the very pattern that was about to weaken. People who know this can ride through it.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'In the past week, have intrusive sexual thoughts or images appeared more vividly than they did during week 1, even though you’ve been doing the work?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s a textbook week-3 pattern — and a sign your brain is genuinely recalibrating, not failing. The skill in this lesson is exactly what gets you through that phase without acting.`,
          },
          {
            answer: 'No',
            responseCard: `That’s either a quieter recalibration or earlier defusion already in place. Either way, today’s skill is worth installing. Thoughts can spike at any time, and the response is the same.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Having a thought vs believing a thought',
        body: `Here’s the most important distinction in this entire lesson: there’s a difference between *having* a thought and *believing* it.

You don’t choose what thoughts appear. They surface based on cues, mood, hormones, context, and a thousand things you don’t control. What you do choose is what you do with them — and whether you treat them as commands, as truth, or simply as mental events passing through.

> Thoughts are weather. You don’t have to argue with the weather. You also don’t have to obey it.

This single shift — *I’m having the thought that I want porn*, instead of *I want porn* — sounds small. It changes everything. It moves you from being inside the thought to being the person watching it. From there, you have options. From inside the thought, you don’t.`,
      },
      {
        type: 'content',
        title: 'Defusion: the skill of standing outside a thought',
        body: `In a therapy approach called Acceptance and Commitment Therapy (ACT), the technical name for this skill is *cognitive defusion*. The mechanics are simple, and they work even when you’re not in a therapy session.

When a hook thought shows up — *“just one peek,” “you’ve earned this,” “maybe today is different”* — you respond with one of these formats:

- *“I’m having the thought that ____.”*
- *“My brain is offering me ____ right now.”*
- *“There’s the addiction script again, on schedule.”*

You don’t argue. You don’t suppress. You just create a small layer of distance between the thinker and the thought. That distance is enough to give you back your choice.

> You don’t have to win the debate. You just have to stop having it.

Defusion is a skill, which means it gets stronger with reps. Practising it once a day on small thoughts — *“I’m having the thought that I should check my phone”* — builds the muscle for the larger ones.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'When a hook thought hits, do you usually argue with it, suppress it, or do you let it pass without engaging?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the right move, and it’s rarer than you’d think. Today’s job is to formalise it: write your most common hook thought, write your defusion phrase, and use it once today on a small thought.`,
          },
          {
            answer: 'No',
            responseCard: `That’s honest, and it’s where most people start. Arguing with a hook thought is like arguing with weather — you can’t win, and you wear yourself out. The shift today is small but powerful: notice, name, let pass.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The hook thought + response script',
        body: `The most practical way to use defusion is to identify your *one* most common hook thought and pre-write your response. Just like the if–then plans from Lesson 8, this works because it removes decision-making from the danger zone.

A hook thought is the thought your brain reliably uses to start the slip pattern. It’s not the same for everyone. Common ones include:

- *“Just one peek to see how I’m doing.”*
- *“I’ve earned a little reward.”*
- *“I’m too tired to fight this tonight.”*
- *“No one will know.”*
- *“This is the last time.”*

Write yours down. Then write the response. The response should be short, identity-anchored, and pivot to action. Something like:

- *“That’s a thought, not a command. Not today. I’m building something bigger.”* — then stand up, change rooms, do twenty squats.

Keep both visible — phone lock-screen, sticky note near your bed, somewhere your tired-self will see them. The response isn’t supposed to be eloquent. It’s supposed to be *available* when you need it.`,
      },
      {
        type: 'content',
        title: 'Focus blocks are also thought training',
        body: `Here’s a piece of this most people miss: every time you sit down and complete a focused work block — phone away, single task, real attention — you’re also training your thought response system.

Why? Because focus is the practice of *not following* every thought that surfaces. When you’re deep in work, dozens of unrelated thoughts pop up: *I should check messages, I’m thirsty, I wonder what time it is, I want to switch tasks*. Most of them you let pass. That same skill is what defuses sexual hook thoughts in the moment.

> Every focused work block strengthens the muscle that ignores hook thoughts.

This is why Day 17’s morning protocol asks for an early 25-minute focus block. It isn’t productivity hygiene (or only partly). It’s thought training in a different shape.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'In the past week, have you completed at least one fully focused 25-minute block — phone away, single task, no switching?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the muscle in motion. Today’s job is to keep going — one focus block, deliberately. Each one trains the same response system that handles hook thoughts.`,
          },
          {
            answer: 'No',
            responseCard: `That’s a useful gap to fix today. Start small — one 25-minute block, phone in another room, one task. Finish it. The completion itself is the rep.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 17:`,
        bullets: [
          'Intrusive thoughts often get *louder* in week 3 before they get quieter — that’s recalibration, not failure.',
          'There’s a real difference between *having* a thought and *believing* it. Thoughts are weather, not commands.',
          'Defusion (an ACT-style skill) is the practice of noticing thoughts as mental events without obeying or suppressing them.',
          'The most useful version is identifying your most common hook thought and pre-writing a short response that pivots to physical action.',
          'Focused work blocks are also thought training — they build the same muscle that ignores hook thoughts in the moment.',
        ],
        closing: `You’ve just locked in one of the most durable in-the-moment skills you’ll carry past Day 28. Now let’s get the Day 17 protocol going.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 18 — Environment Proofing (Day 18)
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 18,
    day: 18,
    title: 'Environment Proofing',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Environment Proofing',
        body: `Welcome to Lesson 18. By now, your system has been holding for almost three weeks. Things probably feel more stable than they did at the start. That stability is real — and it’s also exactly the moment when most people quietly let their guard down. Today we add layers, on purpose, against the version of you that will show up on your worst day.

Today, we’ll cover:`,
        bullets: [
          'why “feeling strong” is the most underrated risk factor in week 3',
          'the swiss-cheese model of relapse prevention',
          'the three categories of layers that actually work',
          'the “relapse cost note” that interrupts the trance',
          'why public friction protects you better than private willpower',
        ],
        closing: `By the end of this lesson, your environment will be designed not for the version of you that exists right now, but for the version that will exist on your hardest day.

Let’s proof it.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'Feeling strong is a risk factor',
        body: `There’s a counterintuitive truth about week 3: the moment you feel most confident is often the moment your environment quietly degrades. The blockers stop getting upgraded. The phone starts drifting back into the bedroom. The “temporary” loophole starts feeling permanent. You stop checking, because you don’t need to — you’re feeling strong.

That feeling is real. It’s also a trap.

> The version of you that built today’s system is not the same version of you that will show up on your worst day. Build for that version, not this one.

Recovery long-term isn’t about being “strong enough” every day. It’s about building a system that holds when you’re tired, sick, stressed, lonely, traveling, or having one of those weeks when nothing seems to go right. Day 18 is about adding redundancy now, while you’re calm, so the system carries you when you can’t carry yourself.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'In the past week, have you started feeling like you don’t need some of your boundaries quite as much anymore?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That feeling is data — it almost always shows up right before complacency. Today’s job is the opposite: pick the boundary you trust most and *add a layer* to it before bed.`,
          },
          {
            answer: 'No',
            responseCard: `That’s healthy awareness. Hold it carefully — week 3 confidence has a way of creeping in quietly. Use today to add one more layer anyway. You’ll be glad you did on a future hard day.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The swiss-cheese model',
        body: `There’s a model from safety engineering called the *swiss-cheese model*. The idea is simple: every individual layer of protection has holes in it. Blockers fail. Apps reinstall. Passwords get remembered. Plans get skipped. Any single layer, on its own, is unreliable.

But when you stack multiple layers — each with different holes — the chance of all of them failing in the same moment drops dramatically. The blocker can fail, but the public-space rule holds. The blocker and the public-space rule can both fail, but the accountability password holds. Each layer covers another layer’s gaps.

> One layer of protection is unreliable. Three layers, with different failure modes, are almost bulletproof.

This is the architecture of long-term recovery. Not heroic willpower in the moment, but multiple, low-effort layers running in the background that catch you when one of them slips.`,
      },
      {
        type: 'content',
        title: 'The three categories of layers',
        body: `A well-proofed environment has at least one item in each of three categories. Most people in week 3 still only have one or two.`,
        subsections: [
          {
            heading: 'Digital layers',
            body: `Blockers, DNS filters, restricted app installs, accountability software, signed-out browsers, removed social apps, disabled autocomplete. These are the layers most people start with, and the layers that work least well in isolation.`,
          },
          {
            heading: 'Physical layers',
            body: `Where your devices live. Where you’re allowed to use them. Where the doors stay open. Where you sleep relative to your phone. These layers are quieter than digital ones but often more powerful — physical context is one of the strongest behavioral cues there is.`,
          },
          {
            heading: 'Social layers',
            body: `One trusted person who knows. A shared blocker password. An accountability buddy. A simple weekly check-in. These are the layers most people skip — and the layers most likely to catch you on the day every other layer fails.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Right now, do you have at least one active layer in *each* of the three categories — digital, physical, and social?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the architecture that holds long-term. The move today is to find your weakest layer and strengthen it — even small upgrades compound.`,
          },
          {
            answer: 'No',
            responseCard: `That’s honest, and it’s the most common gap on Day 18. Pick the missing category that’s easiest for you to add today, even at its smallest version. One layer in each category beats five layers stacked in one.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The relapse cost note',
        body: `There’s a simple, almost embarrassing tool that interrupts more slips than people expect, and it costs nothing: a written note placed at the exact location where you usually slip.

The note should say something short and direct in your own voice. Something like: *“This costs me sleep, self-respect, and the version of me I’m becoming.”* Or: *“Tomorrow’s me will not thank me for this.”* Or: *“The reset took two weeks. The slip takes ten minutes.”*

The point isn’t to motivate yourself — it’s to *interrupt the trance*. Compulsive behavior thrives on a narrow, narrowed-attention state where consequences temporarily disappear from the brain. A visible note, exactly where you usually slip, pulls those consequences back into view at the worst possible moment for the addiction.

> A small note in the right place is louder than an hour of motivation in the wrong one.

It feels silly to do. That’s fine. Do it anyway.`,
      },
      {
        type: 'content',
        title: 'Public friction is better than private willpower',
        body: `There’s one more environment principle worth naming directly: anything that brings your behavior into the *public* eye, even slightly, makes the slip pattern much harder to execute.

Public doesn’t mean broadcast. It means *not perfectly private*. Laptops in shared spaces. Doors that stay slightly open. Devices in the kitchen, not the bedroom. A blocker password held by someone else. A weekly check-in with a friend.

Compulsive behavior depends on the *bubble* — the brief window when you’re alone, distracted, and the consequences feel invisible. Public friction is what pops the bubble.

> Public friction protects you better than private willpower ever can.

You don’t have to make everything public. You just have to remove enough of the bubble that the trance state can’t fully form.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'In your worst recent moment, were you alone, in a private space, with full privacy from everyone in your life?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That tracks for almost everyone. The bubble is where the slip pattern lives. Try this today: add one piece of public friction — a door, a location, a witness, a password — to that exact context.`,
          },
          {
            answer: 'No',
            responseCard: `That’s either strong design already or a sign your slip pattern is more emotional than environmental. Either way, public friction adds another layer the bubble can’t easily reform around. Add one today.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 18:`,
        bullets: [
          'Feeling strong is a risk factor — your environment should be designed for the version of you on your worst day, not your best.',
          'The swiss-cheese model: any single layer of protection has holes; multiple layers with different failure modes are nearly bulletproof.',
          'Three categories of layers: digital, physical, social. Most people skip the social one — and that’s often the layer that catches you when others fail.',
          'A written “relapse cost note” at the exact slip location interrupts the trance state in a way no motivational quote can.',
          'Public friction protects you better than private willpower. The slip pattern depends on the bubble; remove enough of the bubble and it can’t form.',
        ],
        closing: `You’ve just future-proofed your system in a way most people never do. Now let’s get the Day 18 protocol going.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 19 — Emotional Honesty (Day 19)
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 19,
    day: 19,
    title: 'Emotional Honesty',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Emotional Honesty',
        body: `Welcome to Lesson 19. So far, we’ve handled environment, urges, identity, attention, and even sexual response. Today we go to the layer underneath all of it — the layer that quietly powers most slips and that almost no one wants to examine: **emotion**.

Today, we’ll cover:`,
        bullets: [
          'why most urges are more emotional than sexual',
          'how unfelt emotions become urges that don’t feel like emotions',
          'the simple sentence that defuses emotional spirals',
          'the avoidance → stress → urge cycle',
          'how to meet a real need directly instead of medicating it',
        ],
        closing: `By the end of this lesson, you’ll have a way to read your own urges as messages — not enemies — and respond to them at the level they’re actually coming from.

Let’s get honest.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'Most urges are emotional, not sexual',
        body: `Here’s a truth that takes most people a few weeks to fully accept: a huge percentage of porn urges aren’t really about porn, and aren’t really about sex. They’re about a feeling you don’t want to feel, and porn was the fastest way you knew to make the feeling stop.

The pattern is consistent. Boredom, loneliness, restlessness, low-grade anxiety, mild sadness, frustration after work, feeling small after a hard interaction, feeling unseen, feeling tired in a way you can’t fix. None of these are dramatic. All of them are uncomfortable. And porn was, for years, a reliable off switch for that discomfort.

> Most urges aren’t about wanting porn. They’re about not wanting a feeling.

This is the hidden engine of most slips. You don’t recognise the emotion as it shows up — you only recognise the urge. The urge looks like a sexual problem, so you try to solve it sexually. But the original signal was emotional, and the sexual “solution” never resolves it. So the cycle continues.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'In your most recent hard moment, if you trace it back honestly, was there a feeling — even a small one — that showed up *before* the urge did?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the pattern almost no one teaches but almost everyone lives. Naming the feeling is the first move that breaks the cycle. Today’s tool is exactly that.`,
          },
          {
            answer: 'No',
            responseCard: `That’s either a sign of a more directly biological trigger (which exists) or a sign the emotion is hiding well. Spend time today retracing one hard moment — the feeling is usually there, just quiet.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Unfelt emotions become urges',
        body: `There’s a quiet rule of nervous systems: emotions that aren’t allowed to be felt don’t disappear. They get rerouted. They show up as restlessness, irritability, tightness in the chest, a vague need to “do something,” a craving that doesn’t feel like the original feeling at all.

Porn happens to be one of the most efficient reroutes available. It’s fast, it’s available, and it shifts the nervous system into a different state quickly. That’s why it works as a coping tool — and why the coping pattern is so hard to drop.

> Porn was, among other things, an emotional translator. It turned “I feel ___” into “I want ___.”

The work today is to translate it back. To take the urge you’re feeling and ask, *what is this actually about?* Not as a debate, not as an interrogation — as a quiet check-in.`,
      },
      {
        type: 'content',
        title: 'The check-in sentence',
        body: `Here’s the simplest tool for this, and it sounds too easy until you use it:

> *I feel ___ because ___, and I need ___.*

You write it down (or say it in your head) when an urge hits. You fill in the three blanks honestly. The first blank is the feeling. The second is the trigger. The third is the actual need underneath.

For example: *I feel restless because I’ve been sitting alone for two hours, and I need movement and contact.* Or: *I feel small because of what my boss said, and I need to do something I’m proud of.* Or: *I feel sad because I’m disappointed about today, and I need to let myself feel sad for a few minutes instead of escaping it.*

Once the sentence is filled in, the urge gets quieter — sometimes dramatically. Not because you “solved” the emotion, but because you *acknowledged* it. Acknowledgment alone changes the nervous system’s response.

> The urge usually shrinks the moment the underlying feeling gets named.

You don’t need to act on the third blank perfectly. Just naming the need is often enough to take the pressure off the urge. Acting on it is the bonus round.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'When an urge hits, do you usually fight the urge directly, or do you check what feeling and need are underneath it?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s a real skill, and it’s rarer than people think. Today’s job is to formalise it — use the *I feel ___ because ___ and I need ___* sentence at least once today, even if no urge has hit. Reps build the muscle.`,
          },
          {
            answer: 'No',
            responseCard: `That’s honest, and it’s where most people start. Today’s shift is small but powerful: when an urge hits, the *first* move is the check-in sentence, not the fight. Try it once today on something small.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The avoidance → stress → urge cycle',
        body: `There’s one specific pattern worth naming because it powers a huge number of week-3 slips: the *avoidance → stress → urge* cycle.

It works like this. You avoid a task you don’t want to do. The avoidance creates background stress, because the unfinished task doesn’t actually disappear from your brain — it just shifts to the back. The background stress accumulates. Eventually, the stress drives an urge for relief. Porn was the fastest relief on offer, so the urge points there.

Most people in this loop assume the problem is the urge. The actual problem is the avoidance.

> A surprising number of urges are stress signals from a task you’ve been avoiding.

The fix isn’t dramatic. You start the avoided task — even for ten minutes. Avoidance shrinks the moment you take any action. The stress drops. The urge often disappears entirely, because its real driver was upstream of itself.

This is also why Day 19’s morning protocol asks for one small avoidance break — a ten-minute action on something you’ve been dodging. The point isn’t productivity. It’s closing the loop that fuels urges.`,
      },
      {
        type: 'content',
        title: 'Meeting the real need directly',
        body: `There’s one final piece. When the check-in sentence reveals a real need — comfort, connection, competence, rest, expression — the most effective move is to *meet it directly*, with the cleanest version of the response.

Need comfort? Warm shower, tea, a good meal, a calm room. Need connection? A short message, a phone call, sitting with someone. Need competence? Finish a small task, do a hard workout, learn something. Need rest? Take a real nap or go to bed early. Need expression? Write, talk it out, move your body, make something.

Each of these meets the underlying need at the layer it’s actually living. Porn promised to meet all of them and delivered none. Today you build the real version, one need at a time.

> The urge weakens when the real need underneath it gets met. That’s how this gets easier with time.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'In the past week, have you often felt a need (rest, comfort, connection) but reached for your phone or a screen instead of meeting it directly?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the most common version of this. Today’s job is to break the substitution once — feel the need, name it, meet it directly. Just one rep.`,
          },
          {
            answer: 'No',
            responseCard: `That’s a strong base of self-awareness. Use today to upgrade it — pick the one need you’ve been quietly under-feeding (often rest or connection) and feed it deliberately.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 19:`,
        bullets: [
          'Most urges aren’t really about porn — they’re about an emotion you don’t want to feel, and porn was the fastest off-switch you knew.',
          'Unfelt emotions become urges that don’t feel like emotions; the work is translating the urge back into the original signal.',
          'The check-in sentence — *“I feel ___ because ___ and I need ___”* — defuses the urge by acknowledging the feeling underneath.',
          'The avoidance → stress → urge cycle powers many slips; closing the loop on one avoided task often dissolves the urge it was generating.',
          'Meeting a real need directly (rest, comfort, connection, competence, expression) is what makes recovery get easier with time, not harder.',
        ],
        closing: `You’ve just learned a skill that quietly defuses more urges than any single tool in this program. Now let’s get the Day 19 protocol going.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 20 — Social Media Fast (Day 20)
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 20,
    day: 20,
    title: 'Social Media Fast',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Social Media Fast',
        body: `Welcome to Lesson 20. There’s a topic that overlaps with porn recovery in a way most apps avoid: the role of *social media* in keeping the same dopamine pattern alive. Today we look at that overlap honestly — and run a short, focused fast that resets more than just porn.

Today, we’ll cover:`,
        bullets: [
          'the attention economy and what it actually does to your brain',
          'how micro-checking trains the same restlessness that drives urges',
          'the hidden similarity between porn loops and infinite-scroll loops',
          'the “purpose-only” phone use rule',
          'what a 24-hour fast actually accomplishes, and why it matters now',
        ],
        closing: `By the end of this lesson, you’ll see your phone not as a neutral tool but as a system competing with your recovery — and you’ll have a way to put it back in its place.

Let’s reset.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'The attention economy is not your friend',
        body: `Almost every major app on your phone is designed by full-time teams whose job is to maximise the time you spend inside it. They’re very good at this. The recommendations, the autoplay, the notifications, the endless feed, the haptic feedback — none of it is accidental. All of it is engineered to override the part of your brain that decides when to stop.

This isn’t a conspiracy theory; it’s a business model. The economic value of an app, for the company that runs it, is roughly proportional to how much of your attention it can capture. Your attention is what they sell.

> Your phone isn’t a tool you use. It’s a system competing with your recovery for the same finite attention.

That’s a heavy frame, but it’s the honest one. And once you see it that way, the role of a social media fast in week 3 stops feeling extreme and starts feeling obvious.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'In the past week, have you opened an app, immediately closed it, then opened it again within sixty seconds — not because something changed, but because your hand did it?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That micro-checking is the attention economy in action. It isn’t a willpower problem — it’s a reflex the apps trained into your brain. Today’s fast is a chance to interrupt the reflex long enough to feel where it actually lives.`,
          },
          {
            answer: 'No',
            responseCard: `That’s either strong design on your part or a quieter relationship with your phone than most people. Either way, today’s lesson is worth doing — even strong baselines drift.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Why micro-checking trains the same restlessness as porn',
        body: `Here’s the part most people don’t see. The same neural pattern that powers porn use also powers infinite-scroll behavior. Both rely on intermittent reward — sometimes the next swipe gives you something interesting, sometimes it doesn’t. That intermittent pattern is one of the most reinforcing schedules in psychology, more reinforcing than predictable rewards. It’s also exactly why slot machines are so addictive.

When you micro-check apps all day, you’re training your brain to expect that pattern. The result is a baseline of low-grade restlessness — the itchy, slightly-bored, looking-for-something feeling that you’ve probably noticed gets worse the more you scroll, not better.

> Porn loops and infinite-scroll loops share the same engine. Resetting one without the other only does half the work.

This is why people who quit porn but stay on heavy social media often plateau. The conditioning is still happening — just on a slightly different surface. The restlessness keeps the cycle warm and makes urges easier to fall back into.`,
      },
      {
        type: 'content',
        title: 'The 24-hour fast',
        body: `The simplest practical reset for this is a 24-hour fast from your highest-trigger platforms. Not from your phone entirely (you still need to function), but from the specific apps and feeds that have been training the restlessness.

The mechanics are simple. Pick the platforms. Sign out, or remove them from your home screen, or delete them outright for a day. Make a written commitment: *“Not today.”* Use the saved attention deliberately.

Two things happen during a 24-hour fast that don’t happen any other way:`,
        subsections: [
          {
            heading: 'You feel the reach',
            body: `You’ll catch your hand reaching for the missing app dozens of times. That’s data. Each reach shows you exactly how automatic the pattern had become — and how often you were running it without noticing.`,
          },
          {
            heading: 'You feel the silence',
            body: `By the end of the day, your brain will start to feel quieter than usual. That’s your dopamine baseline starting to settle, just like during the porn fast. The silence is the recovery, not the boredom.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Are you willing to put your highest-trigger social platform down for the next 24 hours, just to see what your brain does without it?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the mindset that produces the reset. The first few hours are the loudest — your hand will reach for the missing app many times. Notice it without judgement, and use the saved attention deliberately.`,
          },
          {
            answer: 'No',
            responseCard: `That hesitation is honest, and it’s often the loudest signal that the platform has more grip than you’d like to admit. Notice that without judgement. Then ask: *what would 24 hours actually cost me?*`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Purpose-only phone use',
        body: `Beyond the fast itself, there’s a more sustainable version of this same idea: *purpose-only* phone use. The rule is simple — your phone is for messages, calls, navigation, and specific tasks. It is not for endless feeds, “just checking,” or filling in the gaps between things.

The practical version usually looks like:

- Check messages at two or three set times a day, not whenever the impulse hits.
- Remove infinite-feed apps from the home screen.
- Use the phone for *finishable* tasks — look something up, send a message, navigate somewhere — not for browsing.
- Park the phone outside the room when you don’t need it.

This isn’t about being anti-phone. It’s about putting the phone back in its actual role — a tool you use, not a system that uses you.

> Purpose-only phone use is what micro-checking can’t survive in.`,
      },
      {
        type: 'content',
        title: 'What this has to do with porn',
        body: `Here’s the bottom line: every infinite-scroll session you replace with finishable activity is a small reset of the same baseline that keeps porn cravings warm. Every micro-check you skip is a small reps in not following every impulse. Every quiet hour without a screen is a tiny dose of dopamine recalibration.

Recovery from porn isn’t a separate project from recovery of your attention. They’re the same project. Quiet attention is what makes urges easier to ride, easier to notice early, and easier to let pass.

> Reclaim attention, and porn becomes much smaller without effort.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'If you spent the next two weeks with “purpose-only” phone use, do you think your urges would get noticeably quieter?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the right intuition. Today’s job is one rep — start the 24-hour fast on your highest-trigger platform, and use the saved attention on something real.`,
          },
          {
            answer: 'No',
            responseCard: `That’s honest. The connection between scroll patterns and porn patterns is hidden well — and most people don’t feel it until they do the fast and notice the difference. Try the experiment anyway. The data will be useful either way.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 20:`,
        bullets: [
          'The attention economy is engineered to override the part of your brain that decides when to stop — your phone is a system competing with your recovery.',
          'Micro-checking trains the same intermittent-reward pattern that powers porn loops; resetting one without the other only does half the work.',
          'A 24-hour fast from your highest-trigger platform reveals how automatic the pattern had become — and what your brain feels like underneath it.',
          'Purpose-only phone use is the sustainable version: messages, calls, navigation, finishable tasks. Not feeds.',
          'Reclaiming attention quietly weakens porn cravings without direct effort. The two projects are the same project.',
        ],
        closing: `You’ve just expanded your recovery from porn into recovery of attention itself. Now let’s get the Day 20 protocol going — and tomorrow, we hit your three-week milestone together.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 21 — Three-Week Stability (Day 21) — MILESTONE
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 21,
    day: 21,
    title: 'Three-Week Stability',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Three-Week Stability',
        body: `Welcome to Lesson 21. You’ve just finished three full weeks. That’s further than most people who attempt this ever get — and it puts you in a different category of recovery from where you started. Today, we look at what’s changed, what’s still fragile, and how to make the next phase carry on its own momentum.

Today, we’ll cover:`,
        bullets: [
          'what “stability” actually means biologically at three weeks',
          'the keystone habits that quietly compound at this stage',
          'the “dip pattern” that derails most people in week 4 — and how to spot it early',
          'why occasional spikes don’t reset progress',
          'how to enter week 4 with a system, not just willpower',
        ],
        closing: `By the end of this lesson, you’ll have a clearer picture of what you’ve actually built — and what to protect most carefully in the final week.

Let’s look at where you are.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'What stability looks like at three weeks',
        body: `Three weeks of clean input is enough for several real shifts in your brain. The dopamine baseline has started recalibrating in measurable ways. Sleep is usually steadier. Mornings tend to be clearer. The frequency and intensity of urges have dropped for most people. The “noise” around sexuality has quieted. Focus blocks last longer.

This is what people sometimes call the *quiet zone*. It’s not the absence of difficulty — it’s the absence of constant urgency. The system is doing more of the work, and you’re doing less.

> At three weeks, your nervous system stops *fighting* recovery and starts *living* it. That shift is real.

The catch is that this stability is built on the system you’ve been running — the boundaries, the routines, the keystone habits — not on “feeling stronger.” The moment the system loosens, the stability quietly degrades. Almost no one notices the degradation until something breaks.

Today is about understanding what’s carrying you, so you can protect it carefully through week 4.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Compared to Day 1, are urges, restlessness, and the “noise” around sexuality noticeably quieter for you right now?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the recalibration showing up. Notice it without confusing it for being “done.” The quiet is built on the system; protect the system and the quiet stays.`,
          },
          {
            answer: 'No',
            responseCard: `That’s honest, and it’s common — recalibration isn’t a clean line, and some people experience the shift later. Today’s lesson still applies. Stability is mostly about the system, not the feeling.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The keystone habits that compound',
        body: `A *keystone habit* is one that quietly improves several other parts of your life at once. By Day 21, you’ve probably noticed which keystones are doing the heavy lifting in your recovery. The most common ones, across thousands of people who have done this work, are:`,
        subsections: [
          {
            heading: 'Sleep on a consistent schedule',
            body: `A reliable bedtime and wake time changes almost everything downstream — impulse control, mood, energy, urge intensity. Almost no other habit gives more return for less effort.`,
          },
          {
            heading: 'Daily movement, even small',
            body: `A walk, a workout, stairs, anything physical. Movement reduces craving intensity, gives the nervous system somewhere to put its energy, and quietly improves sleep that night. The minimum version (twenty minutes) does most of the work.`,
          },
          {
            heading: 'One focus block per day',
            body: `A single, completed, phone-away work block. Builds attention, reduces avoidance stress, and trains the same response system that handles hook thoughts. The compound effects across a month are large.`,
          },
          {
            heading: 'Phone parking + screens-off bedtime',
            body: `These two together protect attention, sleep, and nighttime urge windows simultaneously. This is the highest-leverage environmental rule in your whole system.`,
          },
          {
            heading: 'One real human interaction per day',
            body: `A real conversation, a phone-down moment, a call, a check-in. Connection regulates the nervous system in a way no app can, and it’s the most underrated relapse-prevention tool in week 3.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Looking honestly at the last few days, are *all* of your keystone habits running — sleep, movement, focus block, phone parking, real interaction?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the system carrying you. Your job in week 4 is to protect every keystone, especially through the disruptions that will appear. Don’t let any of them quietly lapse.`,
          },
          {
            answer: 'No',
            responseCard: `That’s the most useful gap to find right now. Pick the one keystone you’ve been inconsistent with and protect it fiercely this week. Inconsistency in one keystone usually leaks into the others.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The dip pattern',
        body: `There’s one pattern in week 4 that derails more people than the two-week wall did, and it has a recognisable shape. It usually goes:

*Stress → fatigue → isolation → scrolling → relapse.*

Each step looks small on its own. Stress isn’t unusual. Fatigue happens to everyone. Isolation can sneak in for a single evening. Scrolling feels harmless. The slip is what feels dramatic — but the slip is just the last step of a chain that was visible much earlier, if you knew what to look for.

> The slip isn’t the dip. The dip is everything that happens *before* the slip.

This is why Day 21’s morning protocol asks you to identify your personal dip pattern in writing. Not in general — your *specific* one. Where does fatigue usually start? What does early isolation look like for you? Which scrolling habit usually shows up as a precursor? When you can name the early steps, you can intervene at the top of the chain instead of the bottom.

A movement, a contact, an early sleep — any one of these, applied early, breaks the chain before it reaches the slip step.`,
      },
      {
        type: 'content',
        title: 'Occasional spikes are not resets',
        body: `Here’s a reassurance that matters now, because almost everyone needs it at this stage: occasional urge spikes do not reset your progress.

Recalibration isn’t linear. There will be days, even in week 3 and 4, when an urge feels suddenly louder than it has in two weeks. There will be moments when bargaining scripts come back, even though you thought they were gone. There will be flashes of old patterns showing up out of nowhere.

None of this means you’re “back to zero.” It means you’re a real human being recovering from a real conditioning pattern, and recovery doesn’t do clean lines.

> A spike isn’t a setback. It’s a normal feature of the recalibration.

The trained skill at this point is the same as it was on Day 4: *notice, name, breathe, ride it through.* The wave still rises and falls. You’ve built the muscle. Use it.`,
      },
      {
        type: 'content',
        title: 'How Mind Compass can help',
        body: `Three weeks in, the work shifts again. Week 4 isn’t about adding more — it’s about consolidating what you’ve built and designing the system that survives Day 28 and continues. The remaining lessons cover relapse prevention plans for risky days, focus reclamation, trust repair, and how to design the months *after* the program ends.

Mind Compass keeps the same shape across week 4 — short lesson, structured morning protocol, evening protocol, simple log. The Plan does the remembering for you. Your job is just to keep showing up, especially in the last seven days when complacency is the loudest threat.

You’re closer than you’ve ever been to a real, durable shift in your relationship with porn. Don’t let week 4 feel like a victory lap. Let it feel like the foundation it actually is.`,
        cta: 'Continue',
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Are you willing to enter week 4 by treating today’s milestone as a foundation to protect, instead of a finish line to coast toward?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s exactly the mindset that turns 28 days into a long-term shift. Pick the keystone habit most likely to slip in week 4 and protect it deliberately tonight.`,
          },
          {
            answer: 'No',
            responseCard: `That hesitation is honest, and it’s the coast urge talking. You don’t have to feel motivated to keep showing up — the system carries you, not the feeling. Pick one habit to protect this week and let action argue back against the doubt.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 21:`,
        bullets: [
          'At three weeks, the system stops *fighting* recovery and starts *living* it — but the stability is built on your habits, not on “feeling strong.”',
          'Five keystone habits compound at this stage: sleep schedule, daily movement, focus block, phone parking + screens-off bedtime, one real human interaction per day.',
          'The dip pattern (stress → fatigue → isolation → scrolling → relapse) is responsible for more week-4 slips than dramatic urges. Name your personal version of it.',
          'Occasional urge spikes are not setbacks — they’re a normal feature of recalibration. The skill is the same: notice, name, breathe, ride it through.',
          'Week 4 is consolidation, not a victory lap. The system that protects you on Day 28 is the same one that protects you on Day 60.',
        ],
        closing: `You’ve just hit the most stable point of your entire 28 days, and you’ve named what could quietly undo it. Now let’s get the Day 21 protocol going and step into the final week.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 22 — Relapse Prevention (Day 22)
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 22,
    day: 22,
    title: 'Relapse Prevention',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Relapse Prevention',
        body: `Welcome to Lesson 22 — the first day of the final week. Today’s topic is the one most recovery programs awkwardly avoid talking about directly: **relapse**. Not because we expect one — but because pretending it can’t happen is the single best way to make sure it does.

Today, we’ll cover:`,
        bullets: [
          'why planning for relapse is maturity, not pessimism',
          'the difference between a *lapse* and a *relapse* — and why it matters more than you think',
          'the “abstinence violation effect” that turns one slip into a binge',
          'how to build a written *lapse protocol* that protects your progress',
          'why fast recovery from a slip beats perfect avoidance of one',
        ],
        closing: `By the end of this lesson, you’ll have a written plan for the worst-case day — and that plan alone makes the worst-case day far less likely.

Let’s build it.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'Planning for relapse is maturity, not pessimism',
        body: `There’s a quiet rule in recovery work that surprises most people the first time they hear it: people who plan for the possibility of a slip are *less* likely to slip than people who don’t.

The reason isn’t mysterious. A plan for the worst-case day removes the panic, the shame spiral, and the “what now” paralysis that turn a small slip into a long binge. The plan reframes a slip from a moral failure into a problem with a known response — like changing a flat tire instead of standing in the rain trying to figure out what just happened.

> Planning for relapse isn’t inviting it. It’s removing its biggest weapon.

The biggest weapon a slip has is what comes *after* it — the shame, the secrecy, the “I’ve already messed up so what does it matter” logic that turns ten minutes of failure into ten days. Today’s job is to take that weapon away in advance.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'If you slipped today, do you have a clear, written, specific plan for what you would do in the next sixty minutes?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That puts you ahead of almost everyone in recovery. What to do today: read it once, refine the wording slightly if needed, and keep it visible. The plan only works if you can find it.`,
          },
          {
            answer: 'No',
            responseCard: `That’s the gap most people don’t close until *after* their first slip. Today’s lesson hands you the framework to close it now, while you’re calm and have the time to think clearly.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Lapse vs relapse',
        body: `Here’s a distinction that matters more than people realise. A *lapse* is a single slip — one isolated event after a period of recovery. A *relapse* is a return to the old pattern: multiple slips, increasing frequency, and the feeling that the recovery “didn’t take.”

These are not the same thing. A lapse, handled fast and cleanly, can stay a lapse — a single data point in a much longer recovery. A lapse, handled badly (with shame, secrecy, and abandoning the system), almost always becomes a relapse.

> The difference between a lapse and a relapse isn’t the slip. It’s what happens in the next twenty-four hours.

This is the entire game in week 4 and beyond. You don’t have to be perfect. You have to be *fast at recovering* if something happens. That’s the actual skill.`,
      },
      {
        type: 'content',
        title: 'The abstinence violation effect',
        body: `There’s a specific psychological pattern that turns a lapse into a relapse, and it has a name: the *abstinence violation effect*. It works like this.

You slip once. The brain immediately runs a familiar script: *“Well, I’ve already broken the streak. I’ve already failed. I might as well go all in tonight, and start fresh tomorrow.”* The logic feels reasonable in the moment. It is, in fact, the addiction’s most reliable trick — turning a single slip into hours or days of compounding ones.

The reason this script is so effective is that it *feels true*. After one slip, the difference between “one” and “many” feels small, and the difference between “today” and “tomorrow” feels huge. Both feelings are wrong. The opposite is true: the difference between one and many is enormous (in conditioning terms), and the difference between today and tomorrow is mostly zero.

> A slip is a slip. A binge is a decision made *after* the slip, in the most vulnerable moment of recovery.

The lapse protocol is what protects you from that decision.`,
      },
      {
        type: 'content',
        title: 'The lapse protocol',
        body: `A lapse protocol is a short, written, pre-decided plan for the first sixty minutes after a slip. Three parts. Specific. Visible.`,
        subsections: [
          {
            heading: '1. Tell someone within 24 hours',
            body: `This is the single most powerful step. Not to confess dramatically. Not to be punished. Just to break the silence. A short message: *“I had a slip. I’m back on the plan.”* That’s it. The act of telling defuses the shame loop and removes secrecy as a coping option.`,
          },
          {
            heading: '2. Tighten the system, don’t loosen it',
            body: `After a slip, the temptation is to throw out the whole plan because it “didn’t work.” The opposite is the right move. Within an hour, you tighten one boundary — stronger blocker, removed app, password change, earlier bedtime. The slip is data: it shows you exactly which layer was thinnest. You strengthen that layer immediately.`,
          },
          {
            heading: '3. Restart in the next minute, not the next week',
            body: `The most dangerous sentence after a slip is *“I’ll start fresh on Monday.”* That sentence is what creates the binge. The protocol is the opposite: you restart now. The next minute. The next decision. Not in a week, not tomorrow, not after one more episode. *Now.*`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Right now, do you have a written, three-part lapse protocol — tell someone, tighten the system, restart immediately — that you could execute today if you needed to?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the version of recovery that survives the long term. Use today to refine it: make sure each step is specific (which person, which boundary, which minute), and keep the protocol visible.`,
          },
          {
            answer: 'No',
            responseCard: `Today is the day to write one. Three lines, three steps. Pick the person. Pick the boundary you’d tighten. Pick the action you’d restart with. The protocol takes ten minutes to write and protects you for years.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Why fast recovery beats perfect avoidance',
        body: `There’s a piece of recovery wisdom that people who have done this for years almost universally arrive at: *the goal isn’t never slipping. The goal is recovering fast when something happens.*

Perfect avoidance, indefinitely, isn’t how human nervous systems work. Lives have hard weeks. Routines get disrupted. Something unexpected happens. Even with a strong system, even with everything we’ve built across these 28 days, statistically some people in any recovery program will have a lapse somewhere along the way.

What separates long-term recovery from short-term streaks isn’t the absence of slips. It’s how quickly you re-stabilize when one happens.

> Fast recovery isn’t a permission slip to slip. It’s the most realistic plan for staying clean across years, not weeks.

The protocol you wrote today isn’t pessimism. It’s the strongest possible signal to your brain that you’re *not* going to be defeated by a single bad sixty minutes. That signal alone makes the bad sixty minutes much less likely to happen.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Are you willing to treat “fast recovery from any slip” as a real skill — not as failure, and not as an excuse — and practise it on paper today?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That answer is what separates short-term streaks from long-term recovery. Write the protocol today. You may never need it. If you do, you’ll be glad it’s ready.`,
          },
          {
            answer: 'No',
            responseCard: `That hesitation is honest, and it usually comes from a place of *“I don’t want to even think about it.”* That avoidance is exactly what the abstinence violation effect feeds on. Write the protocol anyway. It’s an investment, not an invitation.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 22:`,
        bullets: [
          'Planning for relapse is maturity, not pessimism — people who plan for slips are *less* likely to slip.',
          'A *lapse* (one isolated slip) and a *relapse* (a return to the old pattern) are not the same thing — and the difference is mostly about what happens in the next 24 hours.',
          'The abstinence violation effect (“I’ve already broken the streak, might as well go all in”) is what turns a lapse into a relapse. The lapse protocol disarms it.',
          'The protocol has three parts: tell someone within 24 hours, tighten the system instead of loosening it, restart in the next minute.',
          'The goal of long-term recovery isn’t never slipping. It’s recovering fast when something happens.',
        ],
        closing: `You’ve just built the safety net that long-term recovery actually rests on. Now let’s get the Day 22 protocol going.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 23 — Reclaim Focus (Day 23)
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 23,
    day: 23,
    title: 'Reclaim Focus',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Reclaim Focus',
        body: `Welcome to Lesson 23. We’re going to talk about something that looks like a productivity topic but is actually deep relapse-prevention work: **focus**. By Day 23, you’ve probably noticed that porn was, among other things, a way to *not do* the hard things in front of you. Today we work on reclaiming the attention that porn was eating.

Today, we’ll cover:`,
        bullets: [
          'why porn was partly an avoidance tool, not just a sexual one',
          'what *attention residue* is — and how it quietly drives urges',
          'the deep work block as relapse prevention',
          'the “first tiny step” principle that breaks avoidance',
          'why focus is the most underrated long-term protection you have',
        ],
        closing: `By the end of this lesson, you’ll see focus not as productivity hygiene but as one of the most reliable defenses you can build into your week.

Let’s reclaim it.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'Porn was partly an avoidance tool',
        body: `Here’s a piece of recovery work that lands differently for almost everyone, because it’s rarely said out loud: a meaningful chunk of porn use was probably *not really about sex*. It was about not doing something else.

The deadline you didn’t want to start. The hard conversation you were dodging. The task that felt overwhelming. The decision you’d been postponing. The work that required real concentration. Porn was a fast, reliable way to make all of those things temporarily disappear from your attention. The relief wasn’t sexual — it was *avoidant*.

> Porn was, among other things, the most efficient way to not feel the discomfort of an unfinished task.

That’s why focus and porn recovery are linked at a level deeper than most people realise. Every avoided task generates background stress. Background stress generates urges. Urges point at the fastest available off-switch. For years, porn was the off-switch. Today’s lesson is about removing the demand that creates the urge in the first place.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Looking honestly at past slips, were many of them happening in moments when you were avoiding a task you didn’t want to start?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That pattern is one of the strongest connections between focus work and porn recovery. The fix isn’t dramatic. Today’s job is to start *one* avoided task today — even ten minutes — and watch what happens to the urge that was hiding behind it.`,
          },
          {
            answer: 'No',
            responseCard: `That’s either strong baseline focus or a different driver pattern entirely (which exists). Either way, today’s skill still applies — focus is one of the most reliable long-term protections you can build, regardless of your trigger profile.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Attention residue',
        body: `There’s a specific thing that happens to your brain when you keep switching tasks, and it has a name: *attention residue*. Every time you bounce between things — checking notifications, switching tabs, glancing at the phone, jumping between apps — a piece of your attention stays stuck on the previous activity. By the time you’ve done this fifty times in a morning, you’re running with very little of your attention actually available for what’s in front of you.

Attention residue feels like restlessness. It feels like *“I can’t settle.”* It feels like the itch that drives you to your phone in the first place. And — here’s the recovery angle — it feels remarkably similar to a low-grade urge.

> A scattered attention system feels almost identical, neurologically, to a system that’s craving something.

This is why people who reclaim focus often notice their urges quietly drop — not because they’re working harder on porn recovery, but because the *background restlessness* that was dressing up as urges has finally settled.`,
      },
      {
        type: 'content',
        title: 'The deep work block as relapse prevention',
        body: `The simplest practical tool here is what people often call a *deep work block*: a single, contained, fully-focused stretch of time on one task, with no switching, no phone, no interruptions. Twenty-five to forty-five minutes is enough. Done daily, it’s one of the highest-leverage habits in recovery.

Here’s why it works at the recovery layer, not just the productivity layer:`,
        subsections: [
          {
            heading: 'Trains the “not following every thought” muscle',
            body: `Focus is the practice of letting non-essential thoughts pass without acting on them. That’s the same muscle that defuses hook thoughts (Lesson 17) and rides out urge waves (Lesson 4). Each focus block is a rep in the same skill.`,
          },
          {
            heading: 'Reduces the avoidance stress that fuels urges',
            body: `A finished task doesn’t generate background stress. Avoidance does. One completed deep work block per day reduces the inventory of avoided things — and reduces the stress that turns into urges later in the day.`,
          },
          {
            heading: 'Builds self-trust through completion',
            body: `Each finished block becomes a tiny piece of evidence: *I am the kind of person who starts and finishes things.* Self-trust is one of the most stabilising forces in long-term recovery. It builds through completion, not through promises.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'In the past three days, have you completed at least one fully focused 25-minute block — phone away, single task, finished cleanly?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the muscle in motion. Today’s job is to do it again on purpose. Reps build the habit, and the habit quietly compounds against urges all month.`,
          },
          {
            answer: 'No',
            responseCard: `That’s the most useful gap to fix today. Pick one task that fits in 25 minutes, put the phone in another room, and finish it. The completion itself is the rep — even one block produces a noticeable shift.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The first tiny step principle',
        body: `Avoidance almost never breaks because of motivation. It breaks because of *starting*. The cleanest version of this is sometimes called the *first tiny step* principle: shrink the avoided task to the smallest possible first action, then do that action, then stop and decide if you want to continue.

Don’t tell yourself *“I’ll write the report.”* Tell yourself *“I’ll open the document and write the title.”* Don’t tell yourself *“I’ll work out for an hour.”* Tell yourself *“I’ll put on my workout clothes and walk to the gym.”* Don’t tell yourself *“I’ll have the hard conversation.”* Tell yourself *“I’ll send the message asking for fifteen minutes.”*

> Almost every avoided task can be broken into a first action that takes less than two minutes. Two minutes is what makes avoidance break.

Once the first tiny step is done, momentum usually carries you further than you expected. And even if it doesn’t — even if you stop after the first step — you’ve still drained the avoidance stress that was generating urges. The reason this works isn’t willpower. It’s the simple math of friction (Lesson 3) applied in reverse.`,
      },
      {
        type: 'content',
        title: 'Why focus is long-term protection',
        body: `Here’s the bigger picture, the one that matters past Day 28: every habit of focus you build is a habit of *not following every impulse that arises in your nervous system*. That’s the underlying skill of long-term recovery, dressed up in different clothes.

Focused attention. Defused thoughts. Ridden urge waves. Started avoided tasks. Phone-down conversations. Real meals eaten slowly. Each of these is the same muscle, used in a different context. By Day 28, you’ve built that muscle in five or six different ways without necessarily noticing.

> Long-term recovery isn’t one big skill. It’s the same small skill, practiced daily, in many different shapes.

Focus is one of the most reliable shapes that skill can take, because it shows up every single day in your work, your study, your hobbies, your conversations. Every time you protect it, you’re also protecting your recovery.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Are you willing to treat one focus block per day as a long-term recovery habit — not a productivity habit — for the next month?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the frame that makes focus stick. The next month is enough time to feel the compounding effect — quieter attention, fewer ambushed urges, and the kind of self-trust that doesn’t crash on bad weeks.`,
          },
          {
            answer: 'No',
            responseCard: `That hesitation is honest, and it usually means focus has been treated as optional. Try the experiment for a week — one block, every day, no excuses. The payoff often surprises people.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 23:`,
        bullets: [
          'Porn was, in part, an avoidance tool — every avoided task generates background stress, and stress drives urges.',
          '*Attention residue* — the fragments of attention left behind by task-switching — feels remarkably similar to a low-grade urge.',
          'The deep work block is relapse prevention: it trains the “not following every thought” muscle, drains avoidance stress, and builds self-trust through completion.',
          'The *first tiny step* principle breaks avoidance by shrinking the task to a two-minute action that’s impossible to refuse.',
          'Focus is the same skill as urge surfing, defusion, and emotional regulation — practiced in a different context. Every focus block protects your recovery.',
        ],
        closing: `You’ve just expanded your recovery from something you defend to something you *build with your daily attention*. Now let’s get the Day 23 protocol going.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 24 — Repair Trust (Day 24)
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 24,
    day: 24,
    title: 'Repair Trust',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Repair Trust',
        body: `Welcome to Lesson 24. By now, you may be feeling something complicated — pride about how far you’ve come, mixed with quiet regret about time, energy, attention, or relationships that were affected along the way. That mix is normal. Today we look at how to repair what can be repaired — without overdoing it, without burning out, and without falling into the dramatic-confession trap.

Today, we’ll cover:`,
        bullets: [
          'why trust is rebuilt through *consistency*, not confessions',
          'the difference between repair and self-punishment',
          'the role of *presence* in rebuilding what porn quietly damaged',
          'the integrity of small actions vs the drama of big ones',
          'when (and how) disclosure is appropriate — and when it isn’t',
        ],
        closing: `By the end of this lesson, you’ll have a clearer sense of how to invest in the relationships porn quietly affected, in a way that actually rebuilds them.

Let’s repair.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'Trust is rebuilt through consistency',
        body: `There’s an instinct that shows up around now in almost everyone’s recovery: the urge to *fix everything at once*. Have the dramatic conversation. Make the big confession. Promise the world. Burn through the regret in one emotional burst and feel finally clean.

That instinct is understandable. It almost never works.

Trust — with yourself, with a partner, with friends, with your own integrity — isn’t rebuilt through dramatic single events. It’s rebuilt through small, repeated, undeniable evidence that you’re a different person now. Showing up when you said you would. Being present without your phone. Following through on small commitments. Telling the truth about little things.

> Trust isn’t rebuilt by big confessions. It’s rebuilt by small consistency over time.

This is true for relationships with other people. It’s also, quietly, true for the relationship you’re rebuilding with yourself. Every kept small promise is a piece of evidence that the new version of you can be relied on. Stack enough of them, and the regret stops being a wound and starts being a memory.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'In the past week, have you been more focused on repairing trust through *one big action* (a confession, a grand gesture, a dramatic change) than through *many small consistent ones*?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That instinct is honest, and it’s one of the most common traps at this stage. The big-action approach almost always burns out. Today’s job is to pick one small, repeatable action and start doing it consistently — that’s where actual repair lives.`,
          },
          {
            answer: 'No',
            responseCard: `That’s a more sustainable approach than most people start with. Use today to identify the *one* small repeatable action that matters most — and protect it for the next month, not just the next week.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Repair vs self-punishment',
        body: `There’s a subtle distinction that catches people in week 4: the difference between *repairing* and *punishing yourself*.

Repair is forward-looking. It says: *“I’m investing in the relationship/value/version of myself that was affected, with concrete actions, going forward.”* Repair feels like work, but it doesn’t feel like suffering.

Self-punishment is backward-looking. It says: *“I deserve to feel bad for what I did, and I’ll keep feeling bad until enough time has passed.”* Self-punishment feels heavy, dramatic, and noble — but it doesn’t actually rebuild anything. It just generates shame. And as Lesson 5 covered, shame fuels the very loop you’re trying to leave behind.

> Repair builds. Self-punishment performs. Only one of them produces a different future.

If your “repair work” is heavy, dramatic, and constantly re-opening old wounds — without producing any visible change — it’s probably self-punishment in disguise. The fix is to swap one heavy backward-looking action for one small forward-looking one.`,
      },
      {
        type: 'content',
        title: 'The role of presence',
        body: `A piece of repair almost no one talks about is *presence*. Porn quietly trains the brain to be elsewhere — fragmented attention, half-listening, the phone in your hand even when someone is talking to you. Years of this leave a quiet damage to relationships that has nothing to do with the porn itself.

The repair, often, is just being there. Phone away during dinner. Eye contact during conversations. Not checking notifications mid-talk. Listening without already preparing your response. Being where you actually are, with the people you’re actually with.

> Most relationship damage from porn isn’t about porn. It’s about the absence that came with it. The repair, then, is presence.

This is the kind of repair that doesn’t require any conversation, any disclosure, any confession. It just requires showing up. The other person almost always notices, even if they can’t name what’s different.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'In the past week, have you had at least one full conversation with someone you care about where you were genuinely present — phone away, listening fully, not multitasking?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s a real piece of repair, and it’s rarer than people think. Today’s job is to do it again on purpose — same person or someone else, phone in another room, attention undivided.`,
          },
          {
            answer: 'No',
            responseCard: `That gap is one of the quietest costs of porn — and one of the easiest to start fixing today. Pick one short conversation today, put the phone in another room, and be fully there. One real conversation is worth more than five distracted ones.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The integrity of small actions',
        body: `Most repair doesn’t happen in big moments. It happens in tiny ones almost no one notices except you.

Doing the dishes when you said you would. Showing up on time. Sending the message you said you’d send. Telling the truth about something small. Following through on a commitment to yourself that no one else would even know about. Keeping the boundary even when no one is watching.

This kind of integrity is invisible from the outside. From the inside, it’s the foundation everything else rests on. Each small kept promise is a deposit in the account you’re rebuilding with yourself — and indirectly, with the people who depend on you.

> Integrity in small actions, repeated over time, is what trust actually is.

This is why Day 24’s morning protocol asks for one small relationship investment, not a grand gesture. The small one is what counts. The grand one is what burns out.`,
      },
      {
        type: 'content',
        title: 'When (and when not) to disclose',
        body: `There’s a question many people in recovery wrestle with at this stage, and it deserves a direct answer: *should I tell my partner?*

The honest answer is: *it depends, and there is no universal right answer.* Disclosure can repair when it’s done thoughtfully, at the right time, in the right way, in a relationship that can actually hold it. Disclosure can damage when it’s done in a wave of guilt, dumped on someone who didn’t ask, or used to *feel better* at the expense of someone else’s peace.

A few honest tests can help:

- *Whose pain am I trying to relieve — mine, or theirs?* If it’s mine, that’s a sign to wait or to find a different outlet.
- *Is the relationship currently strong enough to hold this conversation?* If not, the disclosure may damage more than it repairs.
- *Have I actually changed yet, or am I disclosing in the middle of the change?* Disclosure usually lands better with at least some real evidence of change behind it.

If you’re not sure, talking to a therapist or a trusted, neutral person before talking to a partner is almost always wise. This is one of the few areas in recovery where “act fast” is usually the wrong instinct.

> Disclosure can be part of repair. It can also be a way of making someone else carry your shame. The intent and the timing matter.

For everyone — partnered or not — there’s a smaller, parallel version of disclosure: *honesty about feelings, needs, and boundaries in your everyday relationships.* That kind of honesty is almost always repair work. Practise it freely.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'If you’re considering a disclosure to anyone in your life, would the conversation primarily relieve *their* pain or *yours*?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s exactly the right question to be sitting with. Take your time, find a neutral person to think it through with, and let the conversation be slow and considered. Repair conversations are almost never time-sensitive.`,
          },
          {
            answer: 'No',
            responseCard: `That’s honest. If the answer is “mostly mine,” the disclosure may be self-punishment dressed as repair. Find a different outlet for the guilt — therapy, journaling, a trusted neutral person — and let the relationship-level conversation come later, if at all.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 24:`,
        bullets: [
          'Trust is rebuilt through *small consistency over time*, not through dramatic confessions or grand gestures.',
          'Repair is forward-looking and produces change; self-punishment is backward-looking and produces only shame. Tell them apart.',
          'Most relationship damage from porn isn’t the porn itself — it’s the *absence* that came with it. The repair is presence.',
          'Integrity in small, almost-invisible actions is what trust actually is. Each small kept promise is a deposit.',
          'Disclosure can be repair *or* it can be self-punishment dressed up — the intent and timing matter, and there’s no universal right answer.',
        ],
        closing: `You’ve just done some of the most personal and important work of the entire 28 days. Now let’s get the Day 24 protocol going.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 25 — Next Phase Design (Day 25)
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 25,
    day: 25,
    title: 'Next Phase Design',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Next Phase Design',
        body: `Welcome to Lesson 25. With four days left, the next big question shifts. Up until now, the question was: *how do I get through these 28 days?* Starting today, the question becomes: *how do I build a life on the other side of them?*

Today, we’ll cover:`,
        bullets: [
          'why the “Day 28 finish line” is the wrong frame',
          'the difference between rules you keep for the next month and rules you keep forever',
          'the *minimum effective dose* version of every habit (for bad days)',
          'how to design for *disruption days* in advance',
          'the 60-day vision exercise that anchors what comes next',
        ],
        closing: `By the end of this lesson, you’ll have the skeleton of a plan that survives Day 28 and continues — not as another sprint, but as a sustainable phase.

Let’s design it.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'Why “Day 28 finish line” is the wrong frame',
        body: `There’s a quiet trap in most 28-day programs, and it’s baked into the structure: people start treating Day 28 as a finish line. They count down. They imagine the celebration. They subtly drop their guard in the final week. And then, around Day 30 or 35, the whole system quietly comes apart — not because it stopped working, but because they stopped running it.

That pattern is so reliable that it deserves naming directly: *the post-program collapse.*

> Day 28 isn’t a finish line. It’s a foundation. The system that protected you across 28 days is the same system that needs to keep running on Day 60, 90, and 200.

The shift today is small but important. You stop seeing the program as a sprint and start seeing it as the first month of a longer phase. The structure stays. Some of the intensity drops. The keystone habits keep going. The boundaries keep holding. The system carries you forward.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Right now, are you mentally treating Day 28 as the end of the work, or as the end of the *first phase* of a longer practice?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That mental shift is half the battle for long-term recovery. Today’s job is to make it concrete: write down which habits and boundaries continue past Day 28, and how often you’ll check in on them.`,
          },
          {
            answer: 'No',
            responseCard: `That’s the right frame, and it’s rarer than you might think on Day 25. Hold it carefully. Today’s lesson gives you the tools to build the *specific* plan for the next 60 days — vague intent at this stage is the most common source of the post-program collapse.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Temporary rules vs permanent rules',
        body: `A useful exercise on Day 25 is to look at all the rules and boundaries you’ve been following and sort them into two categories: *temporary intensity* and *permanent rules*.`,
        subsections: [
          {
            heading: 'Temporary intensity (for the recovery period)',
            body: `Some of what you’ve been doing is meant to be more strict than your long-term life will require. The 24-hour social media fast. The two-week clean-content rule. The complete avoidance of any sexualised content. The ruthless removal of borderline accounts. These were intensities chosen for the *reset*, not for the long term. After the reset finishes, you can renegotiate them.`,
          },
          {
            heading: 'Permanent rules (forever, or near-forever)',
            body: `Some of what you’ve been doing should never go away. No phone in bed. No porn. No edging. Blockers stay on. Bedtime stays consistent. These are the rules that protect the conditioning permanently. Loosening them is what brings the old pattern back.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The minimum effective dose',
        body: `Real life has bad weeks. Travel disrupts your routine. You get sick. You have a stressful project. You stay somewhere that isn’t your normal environment. These are exactly the moments most people’s recovery quietly degrades — not because they slip, but because the keystone habits they were depending on stop happening.

This is why writing the *minimum effective dose* version of each keystone habit matters now, before you’re tired and improvising.

A minimum version is the smallest, simplest, easiest-to-execute version of each habit that still counts. The minimum version of *exercise* might be a ten-minute walk. The minimum version of *focus block* might be one fifteen-minute block. The minimum version of *connection* might be one short message to one person. The minimum version of *bedtime routine* might be just *phone in another room*.

> The minimum version isn’t failure. It’s what keeps the system alive on the days the full version isn’t possible.

When you have a minimum version of every keystone written down, hard weeks become survivable. The recovery doesn’t collapse — it scales down for a few days and scales back up when life stabilises.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Right now, do you have a written *minimum version* of each keystone habit (sleep, movement, focus, phone parking, connection) that you could fall back on during a hard week?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the version of recovery that survives long-term. Try this today: test the minimum versions — pick one and run it deliberately, even though today isn’t a hard day. Practising the minimum makes the minimum reliable.`,
          },
          {
            answer: 'No',
            responseCard: `Today is the day to write them. Five minimum versions, one per keystone, each small enough to do on your worst week. The minimum is what keeps the system alive when life gets messy.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Designing for disruption days',
        body: `A *disruption day* is any day where your normal structure breaks: travel, sickness, an emergency, a visit, an unexpected work crisis. These are the highest-risk days in long-term recovery, because they remove the structure that has been carrying you. A pre-written disruption day plan turns them from threats into manageable variations.

A good disruption day plan has four elements, in this order:

1. **Phone out of bed**, regardless of what else changes.
2. **Ten minutes of movement**, even if travel makes anything more impossible.
3. **One short contact with someone you trust** — a message, a call.
4. **Earlier sleep than feels necessary**, because tired-you is the version most likely to slip.

That’s it. Four short steps, executable anywhere, designed to keep the floor under your feet on the days the rest of the system can’t fully run.

> You don’t need a perfect day to stay in recovery. You need a minimum that you actually execute.

This plan won’t feel important right now, sitting in week 4 with the program structure carrying you. It will feel essential the first time you’re in a hotel room, jet-lagged, alone, and tempted to “just check.”`,
      },
      {
        type: 'content',
        title: 'The 60-day vision',
        body: `The final piece of next-phase design is the most personal: a *60-day vision* of who you want to be on Day 88 — sixty days past the end of the program.

Don’t make it abstract. Make it specific. Where does your phone live at night? What does your morning look like? Who are you spending time with? What are your evenings filled with? How do you handle a hard week when one happens? What is one project or growth area you’re actively working on?

The clearer that future feels in your mind, the easier today’s decisions become, because you’re no longer just following rules — you’re walking toward a person you can already see.

> A vivid 60-day vision is one of the most underrated long-term protections you can build.

You don’t need to write a novel. A page or two is enough. The point isn’t the document. The point is the *direction* it sets.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Right now, can you describe — concretely, not abstractly — who you want to be 60 days from now and how you want your weeks to look?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That clarity is one of the most reliable long-term protections you can have. Take fifteen minutes today to write it down in one page, then read it once a week for the next two months. Vision plus repetition becomes direction.`,
          },
          {
            answer: 'No',
            responseCard: `Today is the day to draft it. One page, specific, written in present tense. *“I sleep at the same time every night. My phone lives in the kitchen. I’m doing X every morning. I have two close friendships I’m investing in.”* The clearer the picture, the less the old pattern can compete.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 25:`,
        bullets: [
          'Day 28 isn’t a finish line; it’s the foundation of a longer phase. The post-program collapse is real, and it’s mostly preventable.',
          'Sort your rules into *temporary intensity* and *permanent rules*. Some loosen after the reset; others must never loosen.',
          'Write the *minimum effective dose* of every keystone habit. The minimum is what keeps the system alive on bad weeks.',
          'Design a *disruption day plan* in advance — four short steps for travel, sickness, or emergencies.',
          'Build a vivid 60-day vision. Vision plus repetition becomes direction, and direction is what protects you long after motivation fades.',
        ],
        closing: `You’ve just designed the next phase of your recovery — the part most programs never teach you to plan for. Now let’s get the Day 25 protocol going.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 26 — Discomfort Training (Day 26)
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 26,
    day: 26,
    title: 'Discomfort Training',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Discomfort Training',
        body: `Welcome to Lesson 26. With three days left in the program, today’s topic is one of the most counterintuitive — and one of the most protective long-term: choosing **discomfort on purpose**.

Today, we’ll cover:`,
        bullets: [
          'why a comfort-only life is fragile against urges',
          'the science of voluntary discomfort and why it builds tolerance',
          'the difference between *earned* dopamine and *fast* dopamine',
          'the “pair discomfort with pride” loop',
          'how small avoidance breaks compound into a much stronger nervous system',
        ],
        closing: `By the end of this lesson, you’ll see discomfort not as the enemy of recovery but as one of its most reliable allies.

Let’s train it.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'A comfort-only life is fragile',
        body: `There’s a counterintuitive pattern that shows up in long-term recovery: the people whose lives are designed entirely around *removing all discomfort* tend to be more vulnerable to relapse, not less. The reason is simple, and it’s worth saying out loud.

Porn was, in part, a way to escape discomfort. Stress, boredom, frustration, restlessness, sadness, awkward feelings — porn made them temporarily go away. If your life is then structured to avoid all discomfort, the moment any unavoidable discomfort *does* appear, you have nothing in your body that knows how to sit with it. The old escape pattern is the only response your nervous system knows.

> A comfort-only life is brittle against urges, because urges show up the moment any discomfort does.

That’s why the practice of voluntary discomfort matters. It’s not about suffering for the sake of suffering. It’s about teaching your body, in small, controlled doses, that discomfort is survivable — that you can be uncomfortable for a few minutes and still be okay, and that you don’t have to obey every signal that asks for an off-switch.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Looking honestly at your past month, do most of your slips happen in moments where you were *avoiding* something uncomfortable rather than directly seeking porn?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That pattern is the engine behind a huge percentage of slips. The fix isn’t to remove the discomfort. It’s to train your body to sit with it. Today’s small practice is exactly that.`,
          },
          {
            answer: 'No',
            responseCard: `That’s either a different driver pattern or a stronger discomfort tolerance already in place. Either way, today’s skill still applies — voluntary discomfort builds the nervous system that survives a hard year, not just a hard day.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The science of voluntary discomfort',
        body: `There’s a real biological reason that small, voluntary discomfort works. Every time you do something uncomfortable on purpose — and complete it — your nervous system gets a piece of evidence that discomfort is *survivable*. Over enough reps, the discomfort tolerance window expands. Things that used to feel unbearable start to feel manageable. Things that felt manageable start to feel easy.

This is the same neuroplasticity that built the porn pattern, just used in the opposite direction. The same brain that learned “discomfort = escape via porn” can learn “discomfort = survivable, no escape needed.”

> Discomfort tolerance, like any other tolerance, expands with practice. Or shrinks without it.

What counts as voluntary discomfort doesn’t have to be dramatic. A cold finish to a shower. A hard set at the gym. A difficult conversation you’d been avoiding. A 25-minute focus block on a task you don’t want to do. A walk in weather you’d rather skip. A stretch beyond your normal range. Each of these is a rep. Each rep slightly expands your tolerance.`,
      },
      {
        type: 'content',
        title: 'Earned vs fast dopamine',
        body: `There’s a useful distinction at this stage between two kinds of dopamine, and once you can feel the difference, your relationship with reward changes.

*Fast dopamine* is what porn, scrolling, sugar, and most modern apps deliver. It’s instant, it requires no effort, and it crashes immediately afterward. It also retrains the brain to expect more fast dopamine — which is exactly the conditioning these 28 days have been trying to undo.

*Earned dopamine* is what comes after voluntary discomfort. The hot shower after the cold finish. The clarity after the focus block. The pride after the difficult conversation. The energy after the walk you didn’t want to take. It’s slower, it’s subtler, and crucially — *it doesn’t crash*.

> Earned dopamine is the reward channel porn was hijacking. Re-opening it makes recovery feel like a richer life, not a deprived one.

That’s why this kind of dopamine matters at this point in the program. It’s not just about being “tougher.” It’s about giving your brain a clean reward source that doesn’t depend on the loop you’re leaving behind.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'In the past week, have you done at least one thing on purpose that was uncomfortable in the moment — and felt quietly proud afterward?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That’s the loop in motion. Today’s job is to do one more — small, controlled, completable — and let yourself notice the pride afterward. Pride is the dopamine channel that doesn’t crash.`,
          },
          {
            answer: 'No',
            responseCard: `That gap is part of what keeps recovery feeling like deprivation instead of growth. Pick one small voluntary discomfort today — a cold shower finish, a hard set, a focus block, a difficult message — and complete it. The pride afterward is the proof.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The pair-discomfort-with-pride loop',
        body: `There’s a small ritual that makes voluntary discomfort much more effective, and it costs nothing: *after each completed discomfort, pause for thirty seconds and notice the pride*. Don’t move on immediately. Don’t check your phone. Just stand there for half a minute and let your body register the feeling.

This sounds almost too simple to matter. It isn’t.

Pride is the brain’s clean reward signal. When you pair a difficult action with a deliberate moment of recognising the pride, your brain starts to associate discomfort with reward — instead of associating discomfort with escape. Over time, this rewiring is what changes your relationship to hard things in general.

> Discomfort + completion + acknowledgment = the cleanest dopamine channel humans have.

Skip the acknowledgment, and the rep is half as effective. Include it, and the rep starts compounding. This is one of the fastest ways to rebuild the reward system that porn hollowed out.`,
      },
      {
        type: 'content',
        title: 'Small avoidance breaks compound',
        body: `The other version of voluntary discomfort that compounds quietly is the *avoidance break* — taking ten minutes to do something you’ve been dodging. We touched on this in Lesson 19 and Lesson 23. By Day 26, it’s worth treating it as a daily practice.

One small avoided thing, attacked daily, drains the background stress that fuels urges. It also stacks self-trust: each completed avoidance break is a piece of evidence that you’re someone who *starts* things, not someone who endlessly intends to. That self-trust is one of the most stabilising forces in long-term recovery.

> Recovery isn’t about heroic feats. It’s about repeated small starts that prove you can be relied on — by yourself.

The cumulative effect of one small avoidance break per day, across a year, is a different person. That person is what you’re becoming.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Are you willing to add one small voluntary discomfort and one small avoidance break to most of your days, for the next month?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That commitment changes the texture of recovery from “avoiding the bad” to “building the good.” Pick the smallest possible version of each today, and start the rep count. Reps make the practice real.`,
          },
          {
            answer: 'No',
            responseCard: `That hesitation is honest. Notice it without judgement — usually it means part of you is still hoping recovery can happen without any deliberate discomfort. It can’t, long-term. Try one rep today and let the experience answer the doubt.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 26:`,
        bullets: [
          'A comfort-only life is fragile against urges, because urges show up the moment any discomfort does.',
          'Voluntary discomfort, in small doses, expands the tolerance window and trains the nervous system that discomfort is survivable.',
          '*Earned* dopamine (after voluntary discomfort) is the clean reward channel porn was hijacking — re-opening it makes recovery feel like growth, not deprivation.',
          'Pair every completed discomfort with thirty seconds of pride. This pairing is what rewires the reward system fastest.',
          'Small avoidance breaks, attacked daily, drain background stress and stack self-trust. The cumulative effect across a year is a different person.',
        ],
        closing: `You’ve just picked up a skill that compounds quietly across years, not just weeks. Now let’s get the Day 26 protocol going.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 27 — Final Audit (Day 27)
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 27,
    day: 27,
    title: 'Final Audit',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Final Audit',
        body: `Welcome to Lesson 27 — the second-to-last day of the program. Today’s job is unglamorous and important: closing the last loopholes before Day 28 ends, and writing the rules that will carry you into the months that follow.

Today, we’ll cover:`,
        bullets: [
          'the “almost done” trap — why Day 27 has its own specific risk profile',
          'the soft triggers most people quietly let drift back in',
          'the *personal rules of recovery* document that survives Day 28',
          'why a clean celebration matters more than the celebration itself',
          'the final environment audit, top to bottom',
        ],
        closing: `By the end of this lesson, you’ll have closed your remaining loopholes and written the rules that protect you in the months ahead.

Let’s audit.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'The “almost done” trap',
        body: `There’s a specific risk pattern that shows up around Day 27, and it has its own shape. People feel the end of the program coming. The motivation lifts slightly. There’s a quiet sense of *“the hard part is over.”* And in that lift, the brain offers one last bargain: *“just a small reward to celebrate. You’ve earned it.”*

This is the *almost done* trap. It’s closely related to the two-week wall’s bargaining script, but it has an additional twist — the proximity of the finish line makes the “small exception” feel almost reasonable, because the program is about to end anyway.

> The almost-done trap is the last big test of the program. It uses the finish line itself as bait.

The defense is simple, and it’s the same defense that worked on Day 7 and Day 14: *no testing, no exceptions, no “small celebrations” that look like the old pattern.* The reset doesn’t end on Day 27. It ends — and continues — well past Day 28.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'In the past day or two, have you noticed any thought along the lines of *“the program is almost done — maybe a small exception wouldn’t hurt”*?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That voice is exactly the almost-done trap. Hearing it isn’t a problem. Believing it is. Today’s lesson is the answer — close the loopholes, write the rules, plan a clean celebration.`,
          },
          {
            answer: 'No',
            responseCard: `That’s great awareness. Hold it carefully — the trap often shows up in the last 48 hours, not earlier. Stay alert through Day 28 itself, when the temptation is strongest.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The soft triggers that drift back in',
        body: `By Day 27, your environment is probably much cleaner than it was on Day 1. But there’s a specific category of triggers that tends to drift back in across week 4, often without you noticing: the *soft triggers* you removed in Lesson 12.

A suggestive account quietly re-followed. An app reinstalled “just for one thing.” A late-night scroll that crept back into the evening routine. A platform you said you’d stay off, that you opened for a “quick check.” Each of these is small. None of them feels like a slip. All of them keep the conditioned pathway warmer than it needs to be.

> The almost-done energy is exactly what soft triggers use to creep back in. Today’s audit is your chance to find them.

A real audit isn’t a quick mental scan. It’s an honest, ten-minute walk through your phone, your accounts, your installed apps, your “explore” pages, and your bedtime habits. Anything that wasn’t there on Day 12 should be there for a reason — or it should go.`,
      },
      {
        type: 'content',
        title: 'The personal rules of recovery document',
        body: `The most important written artefact you can produce in week 4 is also the simplest: a *personal rules of recovery* document. Eight to ten short lines, in your own voice, that capture the rules that have actually worked for *you* across these 28 days.

Examples (yours will be specific to your patterns):

- *No phone in bed, ever.*
- *No explore feeds, no infinite scroll apps on the home screen.*
- *Urge = move. Not debate, move.*
- *Tell someone within 24 hours if I’m struggling.*
- *No porn, no edging, no testing — full stop.*
- *Bedtime by 11. Phone in the kitchen.*
- *One focus block per day, minimum.*
- *Movement most days, even 20 minutes.*

The rules should be specific, behavioural, and non-negotiable. They’re not aspirations — they’re your operating system going forward. Write them down. Read them once a week. Live by them.

> The rules document is what your future self will thank your present self for, when the next hard week comes.

It’s not supposed to be elegant. It’s supposed to be *yours* — short enough to read in thirty seconds, specific enough to act on without thinking.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Right now, do you have a written list of 8–10 specific personal recovery rules that you intend to keep past Day 28?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That puts you ahead of almost everyone who finishes a recovery program. Today’s job is to read it once, refine the wording, and decide where it lives — phone notes, a sticky note, a wall card. It only works if you can find it.`,
          },
          {
            answer: 'No',
            responseCard: `Today is the day to write it. Eight to ten short lines, behavioural and specific, in your own voice. Ten minutes of writing protects you for years. Don’t skip this one.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'Why clean celebration matters',
        body: `There’s a pattern in week 4 that has cost a lot of people their progress, and it’s worth naming directly: the celebration that quietly becomes a relapse.

The logic feels reasonable. *I’ve worked hard. I’ve earned a real reward. Let me have a celebration.* The trap is that the celebration drifts toward the old reward source — a risky scroll “to see how I’m doing,” a content drift, a “small experiment.” The celebration becomes the slip, and the program ends with the very thing it was trying to undo.

> A clean celebration is one that *strengthens* the system, not one that tests it.

A clean celebration is non-trigger, non-secret, and aligned with your values. A meal you genuinely enjoy. An experience you’ve been wanting. Time with people you care about. A piece of equipment for a hobby. A trip somewhere. A new book. Whatever specifically lights you up — as long as it doesn’t require any of the old patterns to enjoy.

Plan it now, before Day 28, so you don’t improvise on the day. Improvised celebration is what drifts. Planned celebration is what holds.`,
      },
      {
        type: 'content',
        title: 'The final environment audit',
        body: `Day 27 is also the right day for a top-to-bottom environment audit, the same way you would for any system you actually depend on. Walk through the layers one by one:`,
        subsections: [
          {
            heading: 'Devices',
            body: `Every device, every browser, every app store. Anything new, anything reinstalled, anything you’ve been quietly tolerating. Remove or restrict what shouldn’t be there.`,
          },
          {
            heading: 'Accounts and feeds',
            body: `Every social account, every subscription, every following list. Anything suggestive, anything image-heavy, anything that made the “almost-done” voice louder this week. Unfollow, block, or delete.`,
          },
          {
            heading: 'Physical layers',
            body: `Where the phone sleeps. Where the laptop lives. Which doors stay open. Where you keep the relapse cost note from Lesson 18. Re-check each one.`,
          },
          {
            heading: 'Social layers',
            body: `The trusted person who knows. The accountability check-in cadence. The blocker password held by someone else. Make sure each layer is still active going into Day 28.`,
          },
          {
            heading: 'Rules',
            body: `The personal rules of recovery document, written, visible, and dated.`,
          },
        ],
        closing: `When all five layers are clean, you’ve built the strongest version of the system you’ve had since Day 1. That version is what crosses the Day 28 line and keeps running.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Are you willing to spend twenty deliberate minutes today doing a full environment audit — devices, accounts, physical setup, social layers, written rules?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That twenty minutes is one of the highest-leverage time investments in the entire 28 days. Don’t skip any layer. By the time you’re done, you’ll be carrying the strongest version of the system into the final day.`,
          },
          {
            answer: 'No',
            responseCard: `That hesitation is usually the almost-done trap talking. Notice it without judgement. Then do the audit anyway. Twenty minutes today protects you for the next year.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 27:`,
        bullets: [
          'The *almost-done trap* uses the finish line itself as bait — the defense is the same as the two-week wall: no testing, no exceptions.',
          'Soft triggers tend to drift back in across week 4; today’s job is to find and remove the ones that have crept in since Lesson 12.',
          'The *personal rules of recovery* document — eight to ten specific, behavioural, non-negotiable lines — is the single most important written artefact of week 4.',
          'A clean celebration *strengthens* the system, not tests it. Plan it in advance so you don’t improvise on Day 28.',
          'A full environment audit across five layers (devices, accounts, physical, social, rules) gives you the strongest version of the system going into Day 28.',
        ],
        closing: `You’ve just done the unglamorous, essential work that separates short streaks from long-term recovery. Now let’s get the Day 27 protocol going — and tomorrow, we close the program together.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing the session. You are one step further on your journey.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LESSON 28 — Finish and Continue (Day 28) — FINAL MILESTONE
  // ───────────────────────────────────────────────────────────────────────────
  {
    lessonNumber: 28,
    day: 28,
    title: 'Finish and Continue',
    duration: '7-9 min',
    sections: [
      {
        type: 'intro',
        title: 'Finish and Continue',
        body: `Welcome to Lesson 28 — the final lesson of the program.

Take a real breath here. You’ve just done something that almost no one who tries to quit porn ever finishes: a full 28 days of structured, daily, evidence-based work. That’s not a small thing. That’s a foundation.

Today is not really a finish line. It’s a *handoff* — from the program to the version of you who keeps going on Day 29, Day 60, and Day 200. Today’s lesson is about making that handoff clean.

We’ll cover:`,
        bullets: [
          'what 28 days actually changed about you, biologically and identity-wise',
          'the “letter to your Day-1 self” exercise that consolidates the gains',
          'the difference between *escape goals* and *ascent goals* for the next phase',
          'the next milestone date, and how to celebrate it cleanly when you reach it',
          'how Mind Compass continues to support you past Day 28',
        ],
        closing: `By the end of this lesson, you’ll have a clear picture of what you’ve built — and a written plan for what you’ll build with it next.

Let’s finish.`,
        cta: 'Start session',
      },
      {
        type: 'content',
        title: 'What 28 days actually changed',
        body: `It’s easy to underestimate what just happened. From the inside, recovery often feels less dramatic than it actually is. The day-to-day shifts are subtle. The big internal changes happen quietly. So before we plan what comes next, it’s worth taking a minute to look honestly at what shifted.

Across these 28 days, your dopamine baseline started recalibrating. Your sleep is most likely steadier. Your attention is most likely longer. The frequency and intensity of urges have probably dropped significantly. You’ve learned several in-the-moment skills (urge surfing, defusion, if–then planning, the check-in sentence, state-change responses) that didn’t exist in your toolkit on Day 1. You’ve identified your own personal trigger map, your own dip pattern, and your own keystone habits. You’ve built a system, not just a streak.

> You are not the same person who started this program. The proof is the system you’re now operating from.

Notice that some of the changes are not yet visible. Some will only become obvious in the months ahead — when you handle a hard week without slipping, when you have a real conversation without checking your phone, when an old trigger fires and you ride it out without even noticing. The compounding hasn’t finished yet. It’s just begun.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Looking at the version of you on Day 1 and the version of you today, has something quietly but really changed about your relationship with porn — and with yourself?',
        options: [
          {
            answer: 'Yes',
            responseCard: `Hold on to that knowledge. Whatever happens in the months ahead, today’s shift is real and real things compound. Your job from here is just to keep showing up.`,
          },
          {
            answer: 'No',
            responseCard: `That answer is honest, and it’s more common than people admit. Sometimes the change is real but quiet, and only becomes visible later. Trust the system you built. The proof shows up over the next few months, not in the next 24 hours.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The letter to your Day-1 self',
        body: `There’s a single exercise that consolidates the gains of the program more than any other, and it’s simple: *write a letter to the version of yourself who started Day 1*.

Tell that version what was harder than expected. Tell it what was easier than expected. Tell it which lesson actually mattered most. Tell it which protocol turned out to be the unsung hero. Tell it what you learned that you didn’t know on Day 1. Tell it what you wish someone had told you on the morning of the first lesson.

Don’t make it eloquent. Make it true.

> The letter is for *you* — not for an audience. Future-you will read it on a hard day and remember what you proved.

This isn’t sentimental. It’s practical. The hardest moments in long-term recovery are the moments when you forget what you’ve done. The letter is how you talk to yourself across time. Keep it somewhere you can find it when you need it.`,
      },
      {
        type: 'content',
        title: 'Escape goals vs ascent goals',
        body: `Now we look forward. Almost everyone in recovery makes one specific mistake when planning the next phase: they keep framing every goal as something they’re *escaping from*. *I want to not slip. I want to not fall back into old patterns. I want to not waste my time.* These are *escape goals*.

Escape goals are useful in the early weeks. They get tired fast.

The shift that protects you long-term is to *ascent goals* — goals that pull you toward something rather than push you away from something. *I want to build this skill. I want to deepen this relationship. I want to ship this project. I want to be in better shape. I want to learn this thing. I want to grow into this version of me.*

> Recovery sustained by escape goals tends to fade. Recovery sustained by ascent goals keeps building.

The reason ascent goals work is that they replace the *function* porn was serving. Porn promised novelty, intensity, reward, and the feeling of moving toward something. An ascent goal — a real one, well-chosen — meets those needs cleanly. The old loop has less to compete with.`,
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Looking at your goals for the next month, are most of them about *not* doing the old thing — or about *building* a new thing?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That awareness is what shifts long-term recovery into long-term growth. Today’s job is to pick *one* ascent goal — fitness, skill, relationship, project — and define the first small step. Start it today, even if it’s only ten minutes.`,
          },
          {
            answer: 'No',
            responseCard: `That’s common at this stage, and it’s an upgrade waiting to happen. Today’s shift is to swap one of your “not” goals for an *ascent* goal — something you’re actively building toward, with a first step you can take today.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'content',
        title: 'The next milestone',
        body: `The post-program risk we covered on Day 25 — the structureless drift — is mostly prevented by one simple thing: *naming the next milestone before Day 28 ends*.

Pick a date. Day 45 is good. Day 60 is better. Day 90 is the next big psychological one for many people. Whatever you pick, it needs to be specific, on the calendar, and tied to a clean reward you’ll give yourself when you reach it.

Define what success means there, in terms you can measure. Porn-free days, bedtime consistency, completed focus blocks, social rhythm, ascent goal progress — pick one or two simple metrics. Vague goals don’t protect; specific ones do.

Then, just as importantly, plan the *clean* celebration for that milestone, in writing, today. Don’t leave it to the day itself. The same celebration trap that almost ambushed you on Day 27 will be waiting on Day 60 too — and the only protection is a pre-written plan that doesn’t involve any of the old patterns.

> Each pre-planned milestone, with a clean reward, is another piece of structure that carries you forward through the next phase.

You can stack milestones across the year. Day 60. Day 100. Day 200. Day 365. Each one is a small ritual. Each one keeps the system from quietly drifting.`,
      },
      {
        type: 'content',
        title: 'How Mind Compass continues to help',
        body: `Mind Compass was built for this part too — not just for the 28 days, but for the months and years that follow. Past today, the app continues to support you in the layer that matters most long-term: **structure that survives without dramatic motivation**.

You can keep your morning and evening protocols running in a lighter version. You can revisit any lesson when its specific topic is what your week needs (the urge surfing skill on a hard day, the values anchor on a low day, the lapse protocol if it ever becomes relevant). You can use the same logging structure to keep noticing patterns. The Plan stays the steady backdrop while you live the actual life it was helping you build.

> Mind Compass’s job past Day 28 isn’t to do the work for you. It’s to be the system you fall back on when life gets messy.

You don’t have to remember any of this when you need it. The app does that for you. You just have to keep showing up — even on the days you don’t feel like it, especially on those days. That’s how the next year of your life gets built.

You started this program looking for a different relationship with porn. You leave it with something larger: a clearer relationship with your attention, your body, your emotions, your values, and the version of you you’ve been quietly becoming all month. That version is ready for the next phase. Trust the system. Keep going.`,
        cta: 'Continue',
      },
      {
        type: 'question',
        title: 'Self-discovery question',
        question: 'Are you willing to step into Day 29 not as a person who finished a program, but as a person who is now running their own system — and intends to keep running it?',
        options: [
          {
            answer: 'Yes',
            responseCard: `That answer is the actual finish line. Pick your next milestone date. Define what success looks like there. Plan the clean celebration. And then, tomorrow, just keep going. That’s what long-term recovery looks like — boring, steady, and quietly powerful.`,
          },
          {
            answer: 'No',
            responseCard: `That hesitation is honest, and it’s the most common feeling on Day 28. You don’t have to feel ready to act anyway. Pick the date. Write the milestone. Trust the system. The readiness comes from continuing, not from waiting for it to arrive.`,
          },
        ],
        cta: 'Continue',
      },
      {
        type: 'summary',
        title: 'Summary',
        body: `Here’s a quick recap of what you learned in Lesson 28:`,
        bullets: [
          '28 days has produced real changes — biological recalibration, in-the-moment skills, a written system, and a different version of you. The compounding hasn’t finished; it’s just begun.',
          'Writing a letter to your Day-1 self consolidates the gains and gives future-you something to read on hard days.',
          '*Escape goals* (avoiding the old) tend to fade; *ascent goals* (building toward something) keep recovery sustained long-term.',
          'A specific next milestone — Day 45, 60, or 90 — with a written, clean celebration plan, prevents the post-program drift.',
          'Mind Compass continues to support you past Day 28 as the system you fall back on when life gets messy. The work doesn’t end; it just shifts shape.',
        ],
        closing: `You’ve done what most people who try this never do. You finished the program with a real system, a clearer identity, and a plan for the next phase. We are genuinely proud of you. Now keep going — Day 29 is just one more rep, and so is each day after.`,
        cta: 'Complete session',
      },
      {
        type: 'complete',
        title: 'Session complete!',
        body: `Great job completing your final session. You are no longer just one step further — you’ve built the whole foundation.`,
        closing: 'Please rate your experience',
        cta: 'Continue',
      },
    ],
  },
];
