export interface PlanDay {
  day: number;
  title: string;
  subtitle: string;
  description?: string;
  task?: string;
  morningProtocol?: { main: string; details: string }[];
  tipOfTheDay?: string | { mistake: string; practice: string; };
  eveningProtocol?: { main: string; details: string }[];
  whatToExpectToday?: string[];
}

export const planData: PlanDay[] = [
  { 
    day: 1, 
    title: 'Clean Slate', 
    subtitle: 'Lock down access and commit fully',
    whatToExpectToday: ['You may feel a surge of motivation, but don’t rely on that feeling alone.', 'Later, urges can appear simply because your brain expects the old routine.', 'Mild irritability or restlessness is normal and temporary.'],
    morningProtocol: [
      { main: 'Install website/app blockers on ALL devices (phone, computer, tablet).', details: 'Block porn sites, erotic subreddits, “explore” feeds, and any search terms you typically use. Be ruthless. You’re removing cues that activate automatic behaviour loops.' },
      { main: 'Delete porn files, bookmarks, saved tabs, and “hidden stashes.”', details: 'Do not do “one last look,” because that re-strengthens the pathway you’re trying to weaken. This purge is both practical and symbolic: you’re cutting escape routes. Make it irreversible today.' },
      { main: 'Change your phone settings to reduce stimulation: enable grayscale, remove social apps from the home screen, and turn off notifications that lead to rabbit holes.', details: 'This makes impulsive browsing less rewarding and less automatic. Keep your browser signed out of anything risky. Your device becomes a tool, not a slot machine.' },
      { main: 'Reflection.', details: 'Write your “Why” and your boundaries for the next 28 days. Include what porn has cost you, and what you want back (focus, confidence, intimacy, self-respect). Finish with one sentence: “I am the kind of person who ____.” Keep it simple and strong.' },
    ],
    tipOfTheDay: {
      mistake: 'trying to quit with “willpower” while leaving easy access and private loopholes.',
      practice: 'lock down the environment first so discipline feels lighter and urges have fewer doors to enter.'
    },
    eveningProtocol: [
      { main: 'No screens for 60 minutes before bed.', details: 'Put your phone in another room and shut down the laptop completely. Evening device use (especially in bed) is linked with worse sleep, and poor sleep makes impulse control weaker. Replace the hour with a simple routine: shower, stretch, and a physical book.' },
      { main: 'Create a hard “bed = sleep only” rule.', details: 'If you feel an urge, get out of bed immediately and change locations for 10 minutes. This interrupts the context cue that often triggers relapse. Keep lights low and actions simple. You are training “urge = move,” not “urge = scroll.”' },
      { main: 'Do a 5-minute calming reset (slow breathing or body scan).', details: 'You’re not trying to delete urges; you’re practising staying present without acting. This is a core relapse-prevention skill used in mindfulness-based approaches. Let discomfort rise and fall without feeding it.' },
      { main: 'Reflection.', details: 'Journal: What were my top triggers today, and how did I respond? What boundary did I enforce, and what did that prove? What is one adjustment I’ll make tomorrow?' },
    ],
  },
  {
    day: 2,
    title: 'Trigger Map',
    subtitle: 'Identify cues and predict danger',
    whatToExpectToday: ['You’ll start noticing that urges arrive in patterns, not randomly.', 'You may feel surprised by how often boredom, stress, or fatigue is the real driver.', 'Awareness can feel uncomfortable, but it’s a major upgrade.'],
    morningProtocol: [
      { main: 'Write your top triggers in four categories: time, location, device, and emotion.', details: 'Be specific (e.g., “00:30 in bed with phone,” not “late night”). This turns a vague enemy into a visible map. The goal is prediction, not perfection.' },
      { main: 'Pick your single most dangerous “red zone” and make it physically harder today.', details: 'Examples: phone cannot enter the bedroom, laptop stays in a public space, bathroom door stays slightly open during phone use. You’re breaking the cue-context link that fuels automatic behaviour. Make the rule simple enough to follow when tired.' },
      { main: 'Create your first “if–then” plan: If I feel an urge, then I delay 10 minutes and change rooms immediately.', details: 'This prevents the classic mistake of making decisions while already aroused. Decide your 10-minute activity now (water + walk + push-ups, or a short call). Write it where you can see it.' },
      { main: 'Reflection.', details: 'Journal: Which trigger has trapped me most often, and why does it work? What is my earliest warning sign (sleepy scrolling, fantasy, “just checking”)? What rule will protect me today?' },
    ],
    tipOfTheDay: {
      mistake: 'treating urges as mysterious and then getting “ambushed” in the same places.',
      practice: 'treat urges as predictable patterns and build rules that fire automatically in those contexts.'
    },
    eveningProtocol: [
      { main: 'Do a quick “data capture” from today: time, trigger, intensity (1–10), response, result.', details: 'This turns recovery into learning instead of self-judgement. You are building a personal manual for your brain. Keep it short and factual.' },
      { main: 'Pre-protect tomorrow’s riskiest hour.', details: 'Schedule something that changes your state and location (walk, gym, errands, meet someone, early sleep). Don’t leave that time empty and hope you’ll behave. Your calendar is part of your blocker system.' },
      { main: 'Do a 5-minute urge-surfing practice even if you’re calm.', details: 'Notice sensations, label thoughts (“bargaining,” “fantasy,” “restlessness”), and return to breath. This strengthens your ability to feel urges without obeying them. It’s training, not therapy talk.' },
      { main: 'Reflection.', details: 'Journal: What time of day was most dangerous, and what did I do that helped? What did I do that made it worse (scrolling, isolation, fatigue)? What is one boundary I’ll tighten tomorrow?' },
    ],
  },
  {
    day: 3,
    title: 'Friction Wins',
    subtitle: 'Make relapse inconvenient by design',
    whatToExpectToday: ['You may catch yourself opening apps or tabs automatically.', 'That “autopilot” feeling is exactly what you’re here to dismantle.', 'Every interruption is a small rewiring moment.'],
    morningProtocol: [
      { main: 'Add friction to your most common relapse pathway.', details: 'Log out of risky platforms, delete short-form video apps for four weeks, and disable your browser’s autocomplete for triggering terms. If possible, use a separate user account on your computer with restricted permissions. Make “getting to porn” slow and annoying.' },
      { main: 'Create a “phone parking spot” at home and use it during work blocks.', details: 'When you’re not intentionally using the phone, it lives there. This reduces mindless checking that often escalates into risky browsing. You’re turning the phone from a reflex into a choice. Keep it out of reach, not just face-down.' },
      { main: 'Build a 15-minute “morning momentum” routine: water, wash face, 2 minutes of movement, and a quick plan for the day.', details: 'The first hour sets your brain’s tone and reduces later impulsivity. Consistency matters more than intensity. Start small and repeatable.' },
      { main: 'Reflection.', details: 'Journal: What is my usual “first domino” (scrolling, boredom, stress)? What friction did I add today to stop that domino? What will my future self thank me for tonight?' },
    ],
    tipOfTheDay: {
      mistake: 'trying to “be stronger” while your environment stays designed for relapse.',
      practice: 'make the healthy choice the easiest choice and the relapse choice the hardest choice.'
    },
    eveningProtocol: [
      { main: 'Set a fixed shutdown ritual: lights lower, devices off, and tomorrow’s top three tasks written on paper.', details: 'This prevents late-night drifting, which is a common relapse pathway. Keep the ritual identical each night so it becomes a habit. Habits protect you when motivation drops.' },
      { main: 'If you get an urge, use the “stand up rule.”', details: 'Stand up immediately, breathe once slowly, and move to a different room. Sitting is where bargaining thrives; movement breaks the loop. Your goal is to interrupt escalation early, not “win a debate.”' },
      { main: 'Do a short “attention reset” before sleep: read 10 pages of a physical book, or listen to calm audio with the phone out of reach.', details: 'This trains your brain away from constant novelty. It also supports sleep quality, which supports self-control tomorrow. Keep it simple and repeatable.' },
      { main: 'Reflection.', details: 'Journal: Where did autopilot try to take over today? What interruption worked best? What will I do the moment I notice autopilot tomorrow?' },
    ],
  },
  {
    day: 4,
    title: 'Urge Surfing',
    subtitle: 'Learn to ride the wave',
    whatToExpectToday: ['Urges may feel urgent, but they rise and fall like waves.', 'You might feel restless when you don’t “complete the loop.”', 'That discomfort is training, not danger.'],
    morningProtocol: [
      { main: 'Practise urge surfing for 5 minutes even if you don’t feel triggered.', details: 'Notice sensations and name them: heat, tension, pressure, tingling, restlessness. This rehearses the skill before you need it. Your job is to observe, not to fight.' },
      { main: 'Create a simple rule: “Urge = delay 10 minutes before any decision.”', details: 'During the delay, you change location and do a physical reset (water + brisk movement). Delaying breaks the idea that the urge is an emergency. You’re teaching your brain that urges are survivable.' },
      { main: 'Choose a “state change” tool you can do anywhere: 20 squats, stairs, cold splash on face, or a fast walk.', details: 'Do it once today on purpose so it becomes familiar. Physical state shifts reduce escalation and create separation from the cue. Keep it short and decisive.' },
      { main: 'Reflection.', details: 'Journal: What does an urge feel like in my body, and what thought tries to hook me? What helped the urge fade today (movement, distance, breath)? What will I do within 30 seconds next time?' },
    ],
    tipOfTheDay: {
      mistake: 'trying to “white-knuckle” an urge while staying in the same place with the same device.',
      practice: 'change your state and location first, then let the urge pass without feeding it.'
    },
    eveningProtocol: [
      { main: 'Remove evening “drift time” by scheduling one small, concrete activity after dinner (walk, tidy, prep lunch, shower).', details: 'Drift is where urges quietly grow. Structure is not punishment; it’s protection. Keep the activity easy enough to actually do.' },
      { main: 'Practise defusion: when a thought says “just once,” respond “that’s a thought, not a command.”', details: 'Then return to an action (make tea, stretch, read). Defusion reduces the power of intrusive images by removing your obedience. This is an ACT-style micro-skill.' },
      { main: 'Lock your bedtime routine: same time, same steps, phone away.', details: 'Sleep supports inhibition, and sleep loss increases impulsive responding. You’re not just avoiding porn; you’re building tomorrow’s brain. Treat bedtime as recovery work.' },
      { main: 'Reflection.', details: 'Journal: When did I practise urge surfing today, and what happened to the urge? What thought was loudest, and how did I answer it? What will I repeat tomorrow?' },
    ],
  },
  {
    day: 5,
    title: 'Values Anchor',
    subtitle: 'Replace shame with direction',
    whatToExpectToday: ['Shame thoughts may appear, especially if you’ve relapsed before.', 'Shame often pushes secrecy, and secrecy fuels compulsive loops.', 'Today you shift from self-hate to self-leadership.'],
    morningProtocol: [
      { main: 'Write three values porn steals from you (focus, intimacy, confidence) and three values you’re rebuilding.', details: 'Make them personal and concrete, not abstract. Values give you direction when motivation drops. This is a key mechanism in ACT-style change.' },
      { main: 'Schedule one values-based action today that takes 30–60 minutes (training, learning, building, helping someone).', details: 'Put it on your calendar, not your wish list. Porn thrives in empty time and emotional drift. A planned value action creates healthy reward and identity.' },
      { main: 'Create a “replacement ritual” for a common trigger.', details: 'Example: If lonely at night, then I shower, make tea, and message a friend. Keep the ritual identical each time so it becomes automatic. You are building a new loop, not just deleting the old one. Make it easy to start.' },
      { main: 'Reflection.', details: 'Journal: What kind of person am I becoming by quitting? What would I do today if I truly respected myself? What small action would prove that respect?' },
    ],
    tipOfTheDay: {
      mistake: 'using shame as motivation and then collapsing into secrecy.',
      practice: 'use values as fuel and choose small acts that make you proud today.'
    },
    eveningProtocol: [
      { main: 'Do a “connection deposit” today, even small.', details: 'Send one honest message, make one call, or spend 15 minutes present with someone. Connection reduces isolation, which is a high-risk state for compulsive behaviours. Keep it safe and realistic. You are building a life porn can’t compete with.' },
      { main: 'Remove one hidden trigger you’ve been tolerating (a suggestive account, a saved search, a specific app).', details: 'Don’t negotiate with “maybe I can handle it.” Your brain has learned patterns; you’re unlearning them. Act like a system designer, not a gambler.' },
      { main: 'Do a calming wind-down that is not screen-based.', details: 'If stress is high, use slow breathing or progressive muscle relaxation. This turns “I need relief” into a healthy skill instead of a porn loop. Keep it short and repeatable so you actually do it.' },
      { main: 'Reflection.', details: 'Journal: Where did shame show up today, and what did I do instead of obeying it? What value did I act on, even slightly? What will I do tomorrow when shame tries again?' },
    ],
  },
  {
    day: 6,
    title: 'Energy Upgrade',
    subtitle: 'Stabilize your body to stabilize urges',
    whatToExpectToday: ['You may feel low energy or flat mood as stimulation drops.', 'That doesn’t mean you’re broken; it means you’re adjusting.', 'Movement and basic routines make urges less intense and less frequent over time.'],
    morningProtocol: [
      { main: 'Do 20–30 minutes of movement today (walk, gym, or bodyweight).', details: 'Keep it realistic, not heroic, because consistency is the goal. Exercise can reduce craving intensity in addiction research and also improves sleep pressure. Treat movement as a daily stabiliser. Do it early if possible.' },
      { main: 'Eat a steady breakfast (protein + fibre) and hydrate.', details: 'Blood sugar crashes and dehydration can make you more impulsive and irritable. You’re reducing the number of “weak moments” your day contains. Simple nutrition is relapse prevention. Keep it easy.' },
      { main: 'Schedule a mid-day reset: 10 minutes outside, water, and a short walk.', details: 'This prevents afternoon fatigue from turning into scrolling and escalation. You are practising state management before you’re triggered. Small resets keep your brain out of extremes. Put it in your calendar.' },
      { main: 'Reflection.', details: 'Journal: How did my urges change after movement and food? What time of day is my energy lowest, and what will I do then? What is one body-based habit I will keep all week?' },
    ],
    tipOfTheDay: {
      mistake: 'waiting to feel motivated before you move your body.',
      practice: 'treat exercise like medicine you take regardless of mood, and let mood follow action.'
    },
    eveningProtocol: [
      { main: 'Take a short post-dinner walk or do light stretching.', details: 'This lowers stress, reduces restlessness, and helps transition your brain into a calmer state. Evening calm reduces late-night browsing risk. Keep it gentle, not intense. Your goal is steady regulation.' },
      { main: 'Prepare tomorrow’s morning: clothing, water bottle, and the first task written down.', details: 'Morning confusion leads to phone grabbing, and phone grabbing leads to triggers. You’re removing friction from good habits. Make tomorrow easy for your future self. This is how you win repeatedly.' },
      { main: 'Commit to a strict screens-off time and follow it.', details: 'Sleep loss increases impulsive responses and weakens inhibition. You’re building a stronger brain by protecting sleep. Keep the phone out of bed permanently. Make it a non-negotiable.' },
      { main: 'Reflection.', details: 'Journal: What decision today improved my energy most? What decision drained my energy most? What will I repeat tomorrow to stay stable?' },
    ],
  },
  {
    day: 7,
    title: 'Week One Review',
    subtitle: 'Learn patterns and tighten your system',
    whatToExpectToday: ['You may feel proud and also tempted to “test” yourself.', 'Testing is a classic relapse doorway because it re-exposes you to cues.', 'Today is about learning and upgrading, not taking risks.'],
    morningProtocol: [
      { main: 'Review your week: list your top 3 triggers and your top 3 best responses.', details: 'This turns one week into a personal playbook. Don’t judge; just learn. Your goal is to improve the system, not punish the person. Keep it real.' },
      { main: 'Strengthen one weak boundary today.', details: 'Examples: tighten blocker settings, add an accountability password, remove one more high-trigger app, or change where devices live at night. Small upgrades compound because you face the same triggers repeatedly. Think like an engineer. Make relapse harder than recovery.' },
      { main: 'Plan one healthy reward for today that aligns with your values (coffee out, a meal, a new book, a gym session).', details: 'Your brain needs reward, but you choose the source. Celebrate progress without flirting with triggers. The reward should leave you proud, not overstimulated. Make it simple.' },
      { main: 'Reflection.', details: 'Journal: What worked best this week, and why? What almost broke me, and what would have saved me? What is my single most important rule for week two?' },
    ],
    tipOfTheDay: {
      mistake: 'celebrating progress by browsing risky content “just to see.”',
      practice: 'celebrate by strengthening boundaries and choosing a reward that builds your life.'
    },
    eveningProtocol: [
      { main: 'Do a full digital audit: screen time, new apps, new follows, and any “leaks.”', details: 'Remove anything that increases sexualised input or late-night scrolling. The point is not purity; it’s reducing cue exposure. If you hesitate, remove it anyway for these four weeks. You can always rebuild intentionally later.' },
      { main: 'Plan week two’s high-risk moments in advance.', details: 'Write the times you’re alone, tired, or stressed, and assign an activity to each. Empty time is not neutral; it is risk. Your calendar becomes your guardrail. Be practical and honest. Then follow the plan.' },
      { main: 'Practise a 3-minute reset: breathe slowly, recall your “Why,” and visualise waking up tomorrow proud.', details: 'This rehearsal builds automaticity for future cravings. Small nightly reps build emotional resilience. Keep it simple and consistent. You are training your nervous system.' },
      { main: 'Reflection.', details: 'Journal: What is my biggest lesson from week one? What boundary must remain non-negotiable? What will I do immediately if week two feels harder?' },
    ],
  },
  {
    day: 8,
    title: 'If–Then Armour',
    subtitle: 'Automate your response to triggers',
    whatToExpectToday: ['Your brain loves automatic patterns, so build protection that runs automatically too.', 'You may resist planning because it feels restrictive.', 'That resistance is usually the old habit protecting itself.'],
    morningProtocol: [
      { main: 'Write five if–then plans for your biggest triggers.', details: 'Example: If I’m in bed with my phone, then I place it on the charger in another room and read. Keep each plan short, physical, and specific. If–then planning has strong evidence for improving goal follow-through. You’re removing decision-making from the danger zone.' },
      { main: 'Put your strongest plan somewhere visible (paper near bed, sticky note on laptop, lock-screen note).', details: 'Visibility matters because triggers narrow attention. You want the plan to “hit you in the face” when you’re vulnerable. This is not cheesy; it’s behavioural design. Make it obvious. Make it unavoidable.' },
      { main: 'Rehearse one if–then plan once today when calm.', details: 'Literally act it out: stand up, move rooms, do the reset. Rehearsal increases the chance you’ll behave correctly under stress. You are training your motor pattern, not just your intention. Keep it fast. Then move on.' },
      { main: 'Reflection.', details: 'Journal: Which trigger needs the strongest if–then rule? What is my most reliable reset action? What sentence will I tell myself when bargaining starts?' },
    ],
    tipOfTheDay: {
      mistake: 'waiting to decide what to do while you’re already triggered.',
      practice: 'decide in advance with if–then plans so you execute instead of debate.'
    },
    eveningProtocol: [
      { main: 'Attach an if–then plan to tonight’s riskiest time.', details: 'Example: If I feel lonely after 22:00, then I shower, make tea, and message someone. Keep it simple enough to do when tired. Then follow it exactly, even if you don’t “feel like it.” Repetition is how it becomes automatic.' },
      { main: 'Add an accountability layer if possible (shared blocker password, accountability software, or a device rule with someone).', details: 'Accountability reduces secret loopholes, which are the fuel of relapse. It also reduces the need for constant self-control. Keep it respectful and supportive, not punitive. Choose one method and commit.' },
      { main: 'Do a 5-minute defusion practice: observe thoughts without obeying them.', details: 'Say, “I’m having the thought that…” and let it pass. This reduces the stickiness of sexual imagery and urges. It is not about suppressing thoughts; it is about not acting on them. Practise now so it’s available later.' },
      { main: 'Reflection.', details: 'Journal: Which if–then plan did I use today, and did it work? Where did I hesitate, and what would help next time? What will I rehearse tomorrow?' },
    ],
  },
  {
    day: 9,
    title: 'Boredom Strategy',
    subtitle: 'Replace empty time with intention',
    whatToExpectToday: ['Boredom can feel like craving because your brain wants stimulation.', 'You may feel restless or “itchy,” especially during downtime.', 'Today you turn boredom into structure instead of scrolling.'],
    morningProtocol: [
      { main: 'Create a “boredom menu” of 10 fast alternatives (walk, push-ups, tidy, shower, music, cooking, learning, calling someone).', details: 'The menu prevents the common trap of reaching for your phone first. Keep the options easy and quick. Put the list where you’ll see it. You are preloading alternatives.' },
      { main: 'Schedule two leisure blocks today (even 20 minutes each).', details: 'Unplanned leisure becomes scrolling, and scrolling often escalates. Planned leisure stays healthy because it has a beginning and an end. Choose low-trigger activities that leave you calmer. Treat this as training, not restriction.' },
      { main: 'Remove one boredom trap location.', details: 'Example: no lying in bed during the day, no laptop on the sofa, or no bathroom scrolling. Boredom plus comfort plus privacy is a common relapse recipe. You’re redesigning the context cues that drive habit loops. Keep the rule clear and physical.' },
      { main: 'Reflection.', details: 'Journal: When I say “I’m bored,” what do I usually mean (lonely, stressed, tired)? Which menu option will I use first today? What time of day needs the most structure?' },
    ],
    tipOfTheDay: {
      mistake: 'trying to “out-discipline” boredom until you snap.',
      practice: 'prepare attractive alternatives in advance and use them fast, before escalation begins.'
    },
    eveningProtocol: [
      { main: 'Do one 20–30 minute “single-task” activity tonight with no phone nearby.', details: 'This trains your attention away from novelty seeking. It also reduces the background anxiety that can trigger urges. Pick something simple: cooking, organising, reading, or a hobby. The point is presence, not performance.' },
      { main: 'If you feel the urge to scroll, use the boredom menu immediately.', details: 'Do not negotiate, and do not “check one thing” first. Your first action determines your direction. Choose movement or contact, not content. You’re practising speed and decisiveness. It gets easier with reps.' },
      { main: 'Protect bedtime with a strict cut-off.', details: 'Bedtime is not the time to gamble with your self-control. Screens in bed are associated with worse sleep, and poor sleep worsens impulse control. This is why your environment rules matter most at night. Put the phone away early. Follow your routine.' },
      { main: 'Reflection.', details: 'Journal: What did I do with boredom today, and how did it affect cravings? What activity felt surprisingly satisfying? What will I make easier tomorrow?' },
    ],
  },
  {
    day: 10,
    title: 'Stress Detox',
    subtitle: 'Build a real calm-down pathway',
    whatToExpectToday: ['Stress is a major driver of compulsive coping behaviours.', 'You may notice urges spike after pressure, conflict, or disappointment.', 'Today you practise relief that doesn’t cost you tomorrow.'],
    morningProtocol: [
      { main: 'Choose one stress tool and commit to using it twice today.', details: 'Options: slow breathing, progressive muscle relaxation, or a 10-minute walk outside. Practise it once when calm so it’s available when stressed. The goal is a reliable “off switch” that doesn’t involve porn. Keep it simple and repeatable.' },
      { main: 'Identify your top daily stressor and reduce it by one notch.', details: 'That might mean a shorter to-do list, a boundary with messages, or cleaning one clutter zone. Stress hygiene matters because depletion weakens control later. You’re not removing stress forever; you’re reducing overload. One small change counts. Do it today.' },
      { main: 'Create an “after-stress rule”: after a stressful moment, you do a 2-minute reset before touching your phone.', details: 'Stress plus phone often equals escape behaviour. This rule forces a pause so you can choose. Put a reminder note on your desk or phone. Use it today at least once.' },
      { main: 'Reflection.', details: 'Journal: What stressor triggers me most, and what do I usually do to escape it? What is my new after-stress rule? How will I reward myself today in a healthy way?' },
    ],
    tipOfTheDay: {
      mistake: 'treating porn as “stress relief” and ignoring the long-term cost.',
      practice: 'practise real regulation tools that calm you down and leave you proud afterwards.'
    },
    eveningProtocol: [
      { main: 'Do a 10-minute decompression ritual immediately after work or dinner.', details: 'Change clothes, wash face, walk, or stretch—anything that signals “I’m safe now.” This prevents stress from leaking into late-night compulsive urges. Make it the same every day so it becomes automatic. Your nervous system learns through repetition.' },
      { main: 'Avoid stress-content at night (doomscrolling, arguments, intense videos).', details: 'High arousal content increases restlessness and delays sleep. Poor sleep lowers inhibition and increases impulsive responding. Choose calm inputs so your brain can settle. You’re building tomorrow’s stability tonight.' },
      { main: 'Do 5 minutes of breathing or muscle relaxation before bed.', details: 'This is not “woo”; it’s nervous-system hygiene. The calmer your baseline, the weaker the craving spikes. Even if you feel fine, practise anyway for training. Make it easy: set a timer and do it. Then sleep.' },
      { main: 'Reflection.', details: 'Journal: What stressed me today, and what did I do instead of escaping into porn? What helped the most? What will I do differently when stress hits tomorrow?' },
    ],
  },
  {
    day: 11,
    title: 'Identity Shift',
    subtitle: 'Become the person who quits',
    whatToExpectToday: ['You may notice old identity thoughts like “I always relapse.”', 'Those thoughts are not facts; they’re learned narratives.', 'Today you build identity through proof, not promises.'],
    morningProtocol: [
      { main: 'Write an identity statement and read it out loud: “I’m someone who protects my attention and relationships.”', details: 'Keep it short, positive, and action-based. Identity statements matter because they guide choices under stress. You’re giving your brain a new default story. Then prove it with one action today.' },
      { main: 'Choose one “proof action” that reinforces your identity—workout, deep work, honest conversation, or service to someone.', details: 'Make it measurable and complete it today. Small wins change self-image faster than big plans. This is how confidence becomes real. Pick one thing and finish it.' },
      { main: 'Remove identity triggers that normalise porn-as-default.', details: 'That includes memes, communities, or entertainment that pushes sexualised content constantly. Inputs shape beliefs, and beliefs shape behaviour. Your feed is not neutral; it trains you. Curate it like your future depends on it—because it does.' },
      { main: 'Reflection.', details: 'Journal: What did I do today that proves I’m changing? What identity thought tried to pull me back? What will I do tomorrow to keep proving the new story?' },
    ],
    tipOfTheDay: {
      mistake: 'obsessing over streaks while ignoring who you’re becoming daily.',
      practice: 'stack small proof actions that make “I’m disciplined” feel true in your bones.'
    },
    eveningProtocol: [
      { main: 'Plan tomorrow’s first hour and make it phone-free.', details: 'The first hour is where identity is chosen: drift or direction. A planned start reduces later stress and impulsivity. Prepare your workspace and your first task. Keep it simple and realistic. Then follow it.' },
      { main: 'Practise gratitude or “wins review” for 3 minutes.', details: 'Your brain needs recognition of progress to stay motivated. This also reduces the “I deserve porn” bargaining loop by giving you clean reward. List three wins, even small. The point is consistency. Then move on.' },
      { main: 'Repeat the screens-off rule and protect bedtime.', details: 'Sleep strengthens self-control, and sleep deprivation weakens inhibition. You’re building tomorrow’s discipline tonight. Put devices away and keep the room calm. The rule is simple: bed is for sleep, not browsing. Do it.' },
      { main: 'Reflection.', details: 'Journal: What kind of person showed up today? What did I do when I didn’t feel like it? What will I do tomorrow that my future self will respect?' },
    ],
  },
  {
    day: 12,
    title: 'Cue Clean-Up',
    subtitle: 'Remove subtle triggers you ignore',
    whatToExpectToday: ['Subtle cues can be more dangerous than obvious ones because they feel harmless.', 'You may notice “soft” browsing that slowly escalates.', 'Today you cut the chain earlier.'],
    morningProtocol: [
      { main: 'Audit your follows, subscriptions, and recommendations.', details: 'Unfollow accounts that sexualise your feed or push you into “thirst content.” Turn off personalised recommendations where possible. Subtle cues build craving and attention bias over time. Today you remove the spark, not just the fire.' },
      { main: 'Create a “clean content rule” for four weeks.', details: 'Example: no explore pages, no anonymous browsing, no image-heavy feeds, no suggestive reels. This is temporary intensity for long-term freedom. You are not weak; you are conditioned, and you’re unconditioning. Make the rule clear and follow it.' },
      { main: 'Replace one high-risk app with one low-risk tool.', details: 'Example: swap social feeds for a reading app, language practice, or a music playlist with no visuals. This prevents the “empty phone” rebound where you reinstall triggers. You’re not just removing; you’re redirecting. Make the replacement easy to access. Use it once today.' },
      { main: 'Reflection.', details: 'Journal: What subtle cue has hooked me most often? What is my earliest escalation step (a search, a scroll, a fantasy)? What is my new rule for stopping earlier?' },
    ],
    tipOfTheDay: {
      mistake: 'telling yourself “I can handle this content” because it isn’t porn.',
      practice: 'respect your conditioning and cut cues early, before your brain is flooded.'
    },
    eveningProtocol: [
      { main: 'Turn your devices into boring tools at night.', details: 'Keep entertainment apps off your home screen and remove visual triggers. If possible, use “focus mode” in the evening. Reduced stimulation makes sleep easier and urges weaker. You’re not depriving yourself; you’re detoxing your attention. Keep it for four weeks.' },
      { main: 'Prepare a “night kit” (book, journal, pen, tea) so you don’t default to screens.', details: 'If your hands are busy and your environment is calm, urges have less room to grow. Make the kit visible and ready. This turns willpower into a simple routine. Do it tonight.' },
      { main: 'Practise a 2-minute pause when you feel a pull.', details: 'Name the pull (“boredom,” “loneliness,” “stress”) and choose one action from your menu. Naming reduces the fog and returns choice. This is basic relapse-prevention skill: observe, don’t obey. Short reps count. Use it once tonight.' },
      { main: 'Reflection.', details: 'Journal: What cue did I remove today that matters most? When I felt pulled, what did I do within the first minute? What will I keep removing tomorrow?' },
    ],
  },
  {
    day: 13,
    title: 'Connection Day',
    subtitle: 'Replace secrecy with healthy contact',
    whatToExpectToday: ['Loneliness can intensify urges even if your day is busy.', 'Reaching out may feel uncomfortable if you’re used to coping privately.', 'Today you practise connection as protection.'],
    morningProtocol: [
      { main: 'Choose one person and initiate connection today.', details: 'It can be small: a message, a short call, or a coffee. The goal is to break isolation, not to overshare. Connection reduces the emotional conditions that often trigger compulsive coping. Keep it simple and real. Do it before evening if you can.' },
      { main: 'Plan one social activity for this week and put it in the calendar.', details: 'Recovery is easier when you have planned human contact. Unplanned evenings are high risk for many people. This is not about dependence; it’s about building a life porn can’t replace. Choose something healthy and practical. Then commit.' },
      { main: 'Set a rule: “If I feel a strong urge, I tell someone within 24 hours.”', details: 'This destroys the secrecy loop. Choose someone safe or use a support forum with strong boundaries, but keep it honest. Accountability replaces shame with clarity. Make it a written agreement with yourself.' },
      { main: 'Reflection.', details: 'Journal: How has secrecy fed my porn cycle? What kind of support do I actually need (encouragement, structure, companionship)? Who is safe enough to be part of my recovery?' },
    ],
    tipOfTheDay: {
      mistake: 'trying to recover alone while staying isolated in the same patterns.',
      practice: 'add healthy connection so urges don’t have silence and secrecy to grow in.'
    },
    eveningProtocol: [
      { main: 'Make one “connection deposit” tonight: message someone, respond to someone, or spend intentional time with family/partner.', details: 'Keep the phone away during the interaction if possible. Presence strengthens connection and reduces craving triggers. You’re training your brain to seek humans, not pixels. Small moments count. Do it.' },
      { main: 'If you’re partnered, plan intimacy that is emotional-first (talk, affection, closeness) rather than performance-first.', details: 'If you’re single, plan a self-respect routine (grooming, fitness, learning) that strengthens confidence. Porn often replaces these deeper needs with instant sensation. Tonight you build the deeper need directly. Keep it gentle. Be consistent.' },
      { main: 'Use a brief body scan to release tension before bed.', details: 'Many people carry stress into bedtime and then seek escape. A body scan helps you notice and settle. This supports sleep, and sleep supports tomorrow’s self-control. Keep it short: 3–5 minutes. Then sleep.' },
      { main: 'Reflection.', details: 'Journal: How did connection affect my cravings today? When I wanted to isolate, what did I do instead? What relationship action will I repeat tomorrow?' },
    ],
  },
  {
    day: 14,
    title: 'Two-Week Wall',
    subtitle: 'Expect bargaining and stay steady',
    whatToExpectToday: ['Around this time, many people experience “bargaining thoughts” like “I’ve earned a peek.”', 'Those thoughts are cue-driven scripts, not wisdom.', 'Today you reinforce structure and keep going.'],
    morningProtocol: [
      { main: 'Re-read your day 1 “Why” and rewrite it stronger.', details: 'Add a concrete image of your future if you stay consistent for 90 days (how you feel, how you act, what improves). Bargaining happens when your “Why” is vague. Make it vivid and real. This anchors you when cravings spike. Do it now.' },
      { main: 'Identify your most dangerous time window and schedule a competing plan there.', details: 'This must change your location or your state (movement, public place, meeting someone). Don’t leave risk windows empty and “hope.” Planning is not weakness; it’s strategy. Choose one action and put it in your calendar. Then treat it as fixed.' },
      { main: 'Reinforce your no-testing rule: no porn, no edging, no “checking thumbnails,” no sexualised feeds.', details: 'Testing reactivates cue networks and increases relapse risk. Your brain doesn’t interpret “testing” as neutral; it interprets it as training. Keep the boundary clean for these four weeks. Protect the progress you earned.' },
      { main: 'Reflection.', details: 'Journal: What bargaining thoughts show up for me, and what do they promise? What is the real need underneath (rest, reward, connection)? What is my healthy response when bargaining appears?' },
    ],
    tipOfTheDay: {
      mistake: 'interpreting progress as permission to loosen boundaries.',
      practice: 'treat progress as proof your system works—and double down on it.'
    },
    eveningProtocol: [
      { main: 'Do a week-two systems audit: blockers, phone rules, bedtime routine, and social support.', details: 'Fix one weak link tonight, not “sometime.” Systems fail through small leaks, not big decisions. Think: what would make relapse 50% harder? Do that. Keep it practical.' },
      { main: 'Practise “not today” defusion.', details: 'When an urge says “just once,” answer: “Not today, I’m building something bigger.” Then move your body and change rooms. This interrupts escalation and reinforces identity. You are training refusal as a skill, not a mood. Repeat it once tonight, even if urges are mild. Repetition builds reflex.' },
      { main: 'Protect sleep aggressively.', details: 'Evening screens can delay sleep timing, and sleep deprivation weakens inhibition. A tired brain bargains more and resists less. Put your phone away early and make your room dark and cool. Sleep is not optional in recovery; it’s a foundation. Treat it that way.' },
      { main: 'Reflection.', details: 'Journal: What did I do today that protected my progress? Where did I flirt with risk, even subtly? What will I do immediately if tomorrow feels harder?' },
    ],
  },
  {
    day: 15,
    title: 'Natural Reward Rebuild',
    subtitle: 'Teach your brain real pleasure again',
    whatToExpectToday: ['Ordinary life may feel less exciting without high-stimulation content.', 'That doesn’t mean life is empty; it means your reward expectations are recalibrating.', 'Today you feed your brain steady, healthy rewards.'],
    morningProtocol: [
      { main: 'Choose one natural reward activity for today and schedule it.', details: 'Examples: sunlight walk, strength training, cooking, music practice, creative work, or learning. Do it without multitasking so your brain actually registers the reward. Consistent healthy rewards reduce the pull toward artificial ones. Keep it simple and enjoyable. Then do it.' },
      { main: 'Add one small novelty that is not sexual.', details: 'Novelty can be a new route, a new recipe, a new skill video, or a new gym exercise. Porn hijacks novelty; you can reclaim novelty. The goal is not “a high,” but healthy engagement. Keep it modest and repeatable. Build a life that feels alive without porn.' },
      { main: 'Reduce constant dopamine hits by limiting micro-checking.', details: 'Set two fixed times to check messages and avoid open-ended browsing. Micro-checking trains restlessness and makes urges more likely. You’re rebuilding attention, not just avoiding porn. Make the rule doable, not perfect. Start today.' },
      { main: 'Reflection.', details: 'Journal: What felt genuinely satisfying today, even slightly? What do I miss about porn—sensation, novelty, escape, comfort? What healthy activities can meet those needs over time?' },
    ],
    tipOfTheDay: {
      mistake: 'chasing an instant replacement “high” and getting discouraged when normal life feels quieter.',
      practice: 'cultivate real pleasure patiently through repeated healthy rewards that build you up.'
    },
    eveningProtocol: [
      { main: 'Do one low-stimulation pleasure activity tonight (book, calm music, cooking, hobby).', details: 'Keep the phone out of reach to protect attention. Porn trains high stimulation; you’re training calm satisfaction. This makes sleep easier and cravings weaker. Keep it consistent and easy. Your brain learns through repetition.' },
      { main: 'Plan tomorrow’s reward activity now.', details: 'If it isn’t scheduled, it often doesn’t happen. A planned reward reduces the “I deserve porn” bargaining loop. Choose something you genuinely like. Keep it aligned with your values. Put it on the calendar. Then protect it.' },
      { main: 'Keep bedtime clean: no erotic content, no scrolling, no “just checking.”', details: 'Evening cues reactivate craving networks. You’re not fragile; you’re conditioned, and you’re choosing recovery. Put devices away and commit to a calm finish. Your future self will thank you. Sleep.' },
      { main: 'Reflection.', details: 'Journal: How did my mood shift when I chose natural reward over screens? What did I do today that I didn’t believe I could do? What will I keep doing for the next week?' },
    ],
  },
  {
    day: 16,
    title: 'Sexual Reset',
    subtitle: 'Reduce porn-conditioned arousal patterns',
    whatToExpectToday: ['You may notice shifts in libido—higher, lower, or inconsistent.', 'That variability is common during behaviour change.', 'Today you set clean boundaries that prevent “re-conditioning.”'],
    morningProtocol: [
      { main: 'Define your clean boundary for four weeks: no pornography, no “soft porn,” no edging, no sexualised scrolling, no “testing.”', details: 'Testing keeps the cue pathway alive. Clean boundaries create clean data and faster stabilisation. Write your boundary in one sentence. Then follow it today.' },
      { main: 'If partnered, plan one intimacy-building action that is not performance-focused (talk, affection, a date, cuddling).', details: 'If single, plan one confidence-building action (fitness, grooming, learning, social time). Porn divorces sexuality from real connection and self-respect. Today you rebuild the foundation beneath sexuality. Make it kind and steady, not pressured. Do it.' },
      { main: 'Prepare a strategy for sexual energy spikes.', details: 'If arousal rises, you do movement, a shower, or a brisk walk—no phone, no searching, no fantasy feeding. You’re training “energy = action” instead of “energy = porn.” Keep your response physical and immediate. This prevents escalation and strengthens control. Practise once today even if urges are mild.' },
      { main: 'Reflection.', details: 'Journal: What do I want sexuality to mean in my real life? What triggers sexual craving most—loneliness, boredom, stress, imagery? What will I do in the first 60 seconds when arousal spikes?' },
    ],
    tipOfTheDay: {
      mistake: '“checking” your arousal by searching risky content and calling it progress.',
      practice: 'let your brain re-associate arousal with real life and self-control, not screens.'
    },
    eveningProtocol: [
      { main: 'Avoid sexualised media in the evening, even if it isn’t explicit porn.', details: 'Evening cues are powerful because fatigue lowers control. Keep your inputs clean so you don’t light the fuse. If a show or feed triggers you, stop it and switch to something neutral. This is not overreacting; it’s protecting sleep and stability. Choose calm entertainment or none.' },
      { main: 'If sexual energy rises at night, change state fast.', details: 'Take a shower, do light movement, or do slow breathing—anything that shifts arousal down. Do not sit and “think about it,” because rumination feeds escalation. You’re building a new reflex: redirect, don’t indulge. Keep it practical. Then return to your routine.' },
      { main: 'Keep your phone out of the bedroom and commit to a calm shutdown.', details: 'Screens in bed are linked with worse sleep outcomes, and sleep loss increases impulsive behaviour. Protect your brain’s braking system. Make the room dark, cool, and simple. Your job is to set yourself up to win tomorrow. Sleep is a strategic choice. Make it.' },
      { main: 'Reflection.', details: 'Journal: How did I handle sexual energy today without porn? What triggered me, and what protected me? What will I repeat tomorrow?' },
    ],
  },
  {
    day: 17,
    title: 'Thought Training',
    subtitle: 'Stop believing every thought',
    whatToExpectToday: ['Intrusive sexual thoughts may appear more vividly when you stop feeding them.', 'That does not mean you’re failing; it means you’re noticing.', 'Today you practise defusion and redirection repeatedly.'],
    morningProtocol: [
      { main: 'Practise defusion for 3 minutes: “I’m having the thought that…”', details: 'Say it out loud if you can. This creates distance between you and the thought. Thoughts are mental events, not commands. Defusion is a core ACT skill for compulsive patterns. Practise it even when calm to build the habit.' },
      { main: 'Identify your most common “hook thought” and write a response.', details: 'Example: Hook—“Just one peek”; Response—“That’s the addiction talking, not my values.” Keep it short and repeatable. Your brain needs a script under pressure. Write it on paper and keep it visible. Use it today at least once.' },
      { main: 'Do an early 25-minute focus block with phone away.', details: 'Idle, wandering attention is where fantasies grow. Focus trains your brain to stay directed. This also builds self-trust, which reduces shame triggers. Start with one block and finish it. Then take a break. Keep it manageable.' },
      { main: 'Reflection.', details: 'Journal: What thought hooks me most, and what does it promise? What is my best response script? What will I do physically when the thought hits (stand, move, reset)?' },
    ],
    tipOfTheDay: {
      mistake: 'arguing with thoughts until you’re exhausted and then giving in.',
      practice: 'label the thought, use your script, and pivot to a pre-planned action fast.'
    },
    eveningProtocol: [
      { main: 'Do a 10-minute “mind dump” before your screens-off time.', details: 'Write every worry, task, and emotion on paper. This prevents bedtime rumination, which often leads to phone grabbing. Your nervous system settles when it feels “captured.” Keep it messy and honest. Then close the notebook and move on.' },
      { main: 'Repeat your nightly rule: no phone in bed, no exceptions.', details: 'Your brain learns through consistency, not intention. If you feel an urge, you stand up and change rooms for 10 minutes. You are teaching a new pattern at the exact moment old patterns usually win. Make the rule sacred. Follow it tonight.' },
      { main: 'Do a 5-minute calming practice (breath or body scan) and let thoughts come and go.', details: 'You’re training “I can feel this and still choose.” This is exactly what relapse-prevention mindfulness targets. Keep the practice short and daily. Then sleep. Remember: tomorrow’s discipline is built tonight.' },
      { main: 'Reflection.', details: 'Journal: What thought did I not follow today, and what did that prove? Where did I hesitate, and what would help next time? What is my one non-negotiable rule for tomorrow?' },
    ],
  },
  {
    day: 18,
    title: 'Environment Proofing',
    subtitle: 'Add layers of protection and accountability',
    whatToExpectToday: ['Confidence may rise, and that can create complacency risk.', 'Strong systems protect you even when you’re tired, stressed, or lonely.', 'Today you add layers so one weak moment doesn’t become a slip.'],
    morningProtocol: [
      { main: 'Add one new barrier today.', details: 'Examples: stronger blocker settings, a DNS filter, an accountability password held by someone else, or restricting app installs. Layers matter because urges are temporary but access can be instant. You’re reducing “one-click relapse.” Make the barrier real, not symbolic. Do it today. Then test that it works.' },
      { main: 'Create a “public friction” rule: laptops stay in shared spaces, doors remain open during device use, or screens face outward.', details: 'Compulsion thrives in secrecy and privacy. Public friction reduces escalation because it disrupts the fantasy bubble. This is not about shame; it’s about safety. Choose the rule that fits your life. Apply it today.' },
      { main: 'Write a “relapse cost” note you will see at the exact moment you usually slip.', details: 'Keep it short: “This costs me sleep, self-respect, and real intimacy.” The goal is to interrupt the trance. Your brain forgets consequences when chasing cues. A visible reminder restores perspective. Place it now and keep it for the full four weeks.' },
      { main: 'Reflection.', details: 'Journal: What layer of protection will save me on my worst day? Where do I still have privacy loopholes? How will I close them this week?' },
    ],
    tipOfTheDay: {
      mistake: 'trusting “I feel strong now” and leaving relapse paths open.',
      practice: 'build layers so your system protects you even when you’re not at your best.'
    },
    eveningProtocol: [
      { main: 'Pre-plan tomorrow’s highest-risk window.', details: 'If you’re alone, schedule being elsewhere or being with someone. If you’re tired, schedule earlier sleep. Risk is predictable, so prevention should be scheduled. Don’t treat risk windows like blank space. Give them structure. Then follow the plan.' },
      { main: 'Fill your evening with “hands-busy” actions: stretch, tidy, shower, prep food, or journal.', details: 'Idle hands + idle mind + phone is a common relapse chain. You’re not trying to be busy; you’re trying to be safe. Choose one simple activity and complete it. Then transition to your bedtime routine. Keep it calm. Keep it consistent.' },
      { main: 'Do a 3-minute reset: breathe slowly and reaffirm your identity statement.', details: 'This strengthens your values-based direction and reduces bargaining. You are practising the skill of choosing under mild pressure. Small repetitions build strong reflexes. Keep it short, daily, and real. Then sleep.' },
      { main: 'Reflection.', details: 'Journal: How did I make relapse harder today? When did I feel most vulnerable, and what helped? What boundary will I keep forever?' },
    ],
  },
  {
    day: 19,
    title: 'Emotional Honesty',
    subtitle: 'Name the feeling under the urge',
    whatToExpectToday: ['Many urges are more emotional than sexual.', 'You may notice a feeling first—stress, sadness, rejection—and porn is the shortcut.', 'Today you practise meeting the real need directly.'],
    morningProtocol: [
      { main: 'Do a quick emotional check-in: “I feel ___ because ___ and I need ___.”', details: 'Keep it simple and honest. This reduces the fog that drives impulsive coping. When you name the emotion, you regain choice. Write it down so it’s real. Then choose one healthy way to meet that need.' },
      { main: 'Plan one action that directly meets your real need.', details: 'If you need comfort: warm shower and tea. If you need connection: message someone. If you need competence: finish a small task. Porn promises all of these and delivers none. Today you build the real version. Schedule the action now and do it.' },
      { main: 'Do one small “avoidance break”: a task you’ve been dodging for 10 minutes.', details: 'Avoidance fuels stress, and stress fuels urges. Finishing small tasks builds self-respect and reduces the need to escape. Keep the task small enough to complete. Start now, not later. Then stop at 10–15 minutes even if you could do more. You’re building consistency.' },
      { main: 'Reflection.', details: 'Journal: What emotion do I most often medicate with porn? What healthy action can meet that emotion directly? What will I do the next time that emotion appears?' },
    ],
    tipOfTheDay: {
      mistake: 'fighting cravings while ignoring the pain underneath them.',
      practice: 'name the emotion, meet the real need, and let the urge shrink naturally.'
    },
    eveningProtocol: [
      { main: 'Do a 10-minute emotional release: free-writing, a voice note to yourself, or a calm talk with someone.', details: 'This prevents emotions from building pressure at night. Your goal is expression, not perfection. Keep it honest and private if needed. Then close the notebook and move on. Emotional processing is relapse prevention.' },
      { main: 'Choose one soothing, non-screen activity tonight.', details: 'Comfort is allowed; it just needs to be clean. If you’re tempted, choose the comforting activity before the phone. Your order matters: comfort first, not triggers first. Keep it simple: shower, tea, stretching, reading. Do it now. Then breathe.' },
      { main: 'Reinforce your emergency script: if the urge spikes, you change rooms, drink water, and do 2 minutes of movement.', details: 'You don’t negotiate while triggered. You execute. This is how you survive high-intensity moments cleanly. Keep the script written and visible. Use it tonight if needed. Then return to calm.' },
      { main: 'Reflection.', details: 'Journal: What did I really need today, and did I give it to myself? When did I feel most vulnerable, and what helped? What will I do tomorrow to reduce vulnerability?' },
    ],
  },
  {
    day: 20,
    title: 'Social Media Fast',
    subtitle: 'Lower stimulation and regain control',
    whatToExpectToday: ['Reduced stimulation may feel boring at first.', 'Your brain might reach for the phone automatically.', 'That discomfort is the habit weakening, not you failing.'],
    morningProtocol: [
      { main: 'Take a 24-hour break from your highest-trigger platforms.', details: 'Remove them or log out, and commit in writing: “Not today.” This reduces cue exposure and attention hijacking. It also makes your day calmer and more predictable. You’re giving your brain breathing room. Use that space intentionally.' },
      { main: 'Set “purpose-only” phone use: messages and calls are allowed, endless feeds are not.', details: 'Decide two times to check messages and keep the phone away otherwise. Purpose-only use reduces impulsive spirals. This is behavioural design, not moralising. Write the rule and follow it today. Your goal is clarity.' },
      { main: 'Fill the gap with two planned activities: one movement, one skill/hobby.', details: 'Without replacements, you’ll rebound into scrolling. With replacements, you build new reward loops. Choose activities you can complete today. Start with the easiest version. Then show up.' },
      { main: 'Reflection.', details: 'Journal: What did I reach for when social media wasn’t there? What emotion did I feel underneath (restless, lonely, anxious)? What will I keep even after this fast ends?' },
    ],
    tipOfTheDay: {
      mistake: 'swapping porn for endless scrolling and calling it recovery.',
      practice: 'reduce high-stimulation inputs so your attention calms down and urges lose fuel.'
    },
    eveningProtocol: [
      { main: 'Replace idle evening time with a structured block: cook, tidy, read, plan, or hobby.', details: 'The goal is not productivity; it’s preventing drift. Drift plus phone plus fatigue is high risk. Choose one activity and do it for 30 minutes. Then transition into your bedtime routine. Keep it calm. Keep it consistent.' },
      { main: 'Do a short movement reset (walk or stretching) to help your nervous system settle.', details: 'Reduced stimulation can feel like agitation before it feels like peace. Movement helps your body process that agitation safely. Keep it gentle and short. Then breathe. You are teaching your body that calm is safe.' },
      { main: 'Protect sleep: no screens in bed and a stable bedtime.', details: 'Evening device use can delay sleep timing and worsen sleep, and sleep loss reduces inhibition. Tonight you choose strong recovery. Put devices away early and make the room dark. Sleep is your biggest multiplier. Take it seriously.' },
      { main: 'Reflection.', details: 'Journal: What changed in my mind when high stimulation dropped today? When did I feel tempted, and what did I do instead? What will I repeat tomorrow?' },
    ],
  },
  {
    day: 21,
    title: 'Three-Week Stability',
    subtitle: 'Reinforce routines and prepare for dips',
    whatToExpectToday: ['You may feel more stable, but occasional spikes can still occur.', 'You might also experience a motivation dip.', 'Your system should carry you through dips, not your feelings.'],
    morningProtocol: [
      { main: 'Review your keystone routines: wake time, movement, meals, focus block, and screens-off time.', details: 'Identify the one you’ve been inconsistent with. Inconsistency is where relapse sneaks in. Choose one routine to protect fiercely this week. Make it simple and doable. Commit in writing. Then follow it today.' },
      { main: 'Identify your “dip pattern.”', details: 'For many people it is: stress → fatigue → isolation → scrolling → relapse. Write your personal chain. Then break the chain early by scheduling a reset (movement and contact) today. This is relapse prevention by design. Your goal is to prevent the slide, not fight at the bottom. Act early. Act small.' },
      { main: 'Add one deliberate healthy reward today.', details: 'Stability requires reward, but you choose the source. Pick something you can enjoy without triggers. Reward is not weakness; it’s fuel. Keep it aligned with your values. Schedule it. Then do it guilt-free.' },
      { main: 'Reflection.', details: 'Journal: What does stability look like for me now? What warning signs show I’m starting to slide? What will I do within the first hour of noticing those signs?' },
    ],
    tipOfTheDay: {
      mistake: 'panicking when cravings appear and assuming you’re “back to zero.”',
      practice: 'expect occasional spikes and respond with your trained script calmly and fast.'
    },
    eveningProtocol: [
      { main: 'Plan a values-aligned reward for this weekend (experience, social time, fitness, learning).', details: 'Don’t choose the reward impulsively; choose it intentionally. A planned reward reduces bargaining thoughts. It also strengthens the identity that you can enjoy life cleanly. Put it on the calendar. Then protect it.' },
      { main: 'Do a brief mindfulness check: notice how your baseline has changed since day 1.', details: 'This reinforces progress and reduces shame. It also trains awareness of cravings without acting. Keep it short: 3 minutes. You’re building long-term skills, not chasing a perfect mood. Then breathe and move on.' },
      { main: 'Keep sleep strict.', details: 'Sleep deprivation reduces inhibitory control and increases impulsive responding. Your recovery is not only about porn; it is about strengthening your brain’s brakes. Put devices away, lower lights, and keep bedtime stable. The rule is simple: night is for restoring, not for gambling. Follow the rule. Sleep.' },
      { main: 'Reflection.', details: 'Journal: What is the biggest difference between week one and week three? What still worries me, and what is my plan for it? What will I do tomorrow to stay steady?' },
    ],
  },
  {
    day: 22,
    title: 'Relapse Prevention',
    subtitle: 'Build a plan for risky days',
    whatToExpectToday: ['Planning for relapse risk is not pessimism; it’s maturity.', 'You might feel anxious about “what if I slip.”', 'A clear plan reduces fear and increases control.'],
    morningProtocol: [
      { main: 'Write your top 3 relapse scenarios and the first 3 steps you take in each.', details: 'Example: “Late night alone → phone outside room → shower → call someone.” Plans work because they remove decision-making under pressure. Keep the steps physical and specific. Write them on one page. Read them once today. This is your safety manual.' },
      { main: 'Create a “lapse protocol” for worst-case.', details: 'If you slip, you tell someone within 24 hours, tighten blockers, and restart the next minute—not next week. This prevents the binge-after-slip pattern. Your goal is fast recovery, not perfection. Write the protocol clearly. Promise yourself you will follow it. It turns failure into data and momentum.' },
      { main: 'Set one boundary around fatigue or substances if they raise your risk.', details: 'Examples: no alcohol alone, earlier bedtime, or no scrolling when tired. Risky states produce risky choices. Protect yourself when your brain is weaker. This is not weakness; it’s strategy. Choose one boundary that matters most. Apply it today.' },
      { main: 'Reflection.', details: 'Journal: What are my earliest warning signs before a slip? What is my exact lapse protocol in one paragraph? Who will I contact if I’m struggling?' },
    ],
    tipOfTheDay: {
      mistake: 'treating a lapse as proof you’re hopeless and then bingeing.',
      practice: 'treat a lapse as data, activate your reset plan immediately, and continue with pride.'
    },
    eveningProtocol: [
      { main: 'Rehearse your lapse protocol on paper tonight.', details: 'Literally write: “If I slip, I will do X, Y, Z.” Rehearsal increases follow-through under stress. You’re building a reflex for recovery. Keep it short and clear. Then put it somewhere visible. You’re not inviting failure; you’re preparing for reality.' },
      { main: 'Protect sleep and reduce risk inputs tonight.', details: 'High arousal content and late screens increase restlessness and can worsen sleep. Sleep loss weakens inhibitory control. Your bedtime routine is your first relapse-prevention tool. Keep it calm and consistent. Put devices away early. Follow your routine. Sleep.' },
      { main: 'If cravings spike tonight, use the “three-step reset”: change room, drink water, do 2 minutes of movement.', details: 'Do not sit and negotiate. Your body can carry you through a craving peak if you move and breathe. You’re training your emergency response. Use it fast. Then return to calm.' },
      { main: 'Reflection.', details: 'Journal: What would “fast recovery” look like for me after a slip? What triggers am I currently underestimating? What will I do tomorrow to strengthen my weakest area?' },
    ],
  },
  {
    day: 23,
    title: 'Reclaim Focus',
    subtitle: 'Train attention as your strength',
    whatToExpectToday: ['You may notice that porn was partly an avoidance tool for hard tasks.', 'As you build focus, your confidence rises.', 'Today you practise attention control as relapse prevention.'],
    morningProtocol: [
      { main: 'Do a 25-minute deep work block early with phone away.', details: 'Make the task small and clear so you can start. Starting is the hardest part; finishing builds momentum. Focused work reduces the mental wandering that feeds fantasy loops. Keep it imperfect but complete. One finished block beats ten planned blocks.' },
      { main: 'Take a genuine break after the block: move, water, sunlight, short walk.', details: 'Do not use the break to scroll. Scrolling breaks often escalate into triggers. Real breaks refill your brain; screen breaks drain it. Keep the break short and real. Then return to the day.' },
      { main: 'Reduce multitasking for the first hour of the day.', details: 'One thing at a time trains your brain to tolerate “not constant novelty.” This lowers the craving for high-stimulation content later. It also reduces stress because you feel more controlled. Choose one task and finish a small piece of it. Then move to the next. Keep it simple.' },
      { main: 'Reflection.', details: 'Journal: What task do I avoid most, and how does avoidance trigger porn urges? What did focus feel like today? What will I do tomorrow to start faster?' },
    ],
    tipOfTheDay: {
      mistake: 'using stress or workload as an excuse to “reward” yourself with porn later.',
      practice: 'build focus gently and consistently so stress doesn’t push you into escape.'
    },
    eveningProtocol: [
      { main: 'Choose tomorrow’s top task and write the first tiny step.', details: 'Tiny steps reduce avoidance. Avoidance creates stress, and stress triggers relapse. You’re building an anti-avoidance lifestyle. Keep the first step so small you can’t refuse. Put it on paper. Then you’re done.' },
      { main: 'Do a 10-minute environment reset: tidy your workspace and set out what you need for tomorrow.', details: 'A clean environment reduces friction for focus. It also reduces late-night drifting because your space feels “complete.” Don’t aim for perfect; aim for ready. Do it quickly. Then stop.' },
      { main: 'Keep the evening low-stimulation and protect sleep.', details: 'High stimulation at night fuels restlessness. Poor sleep weakens inhibitory control and increases impulsive responses. Put your phone away early and follow the same wind-down steps. Sleep is how your brain consolidates learning. You’re training long-term change. Do it tonight.' },
      { main: 'Reflection.', details: 'Journal: What did I accomplish today without escaping? Where did I feel tempted to avoid life? What will I do tomorrow when avoidance appears?' },
    ],
  },
  {
    day: 24,
    title: 'Repair Trust',
    subtitle: 'Invest in presence and relationships',
    whatToExpectToday: ['You may feel regret about time or energy lost.', 'Repair is built through consistent presence, not dramatic confessions.', 'Today you practise small, steady integrity.'],
    morningProtocol: [
      { main: 'Choose one relationship investment today: quality conversation, helping someone, or showing up reliably.', details: 'Keep it specific and doable. Compulsive habits often erode trust through inconsistency and secrecy. Today you build trust by being present. One action counts. Do it before evening if possible.' },
      { main: 'Practise “phone away presence” for one interaction.', details: 'Put the phone out of sight and give full attention. This rebuilds your ability to connect without stimulation. It also reduces the drift that triggers cravings. Presence is a skill, and skills improve with reps. Keep it brief if needed. Just do it.' },
      { main: 'If disclosure is relevant and safe, plan a thoughtful way to talk—without dumping shame onto someone.', details: 'If disclosure isn’t appropriate, practise honesty in smaller ways (feelings, boundaries, needs). Porn thrives in secrecy; recovery thrives in clarity. Today you move one step toward clarity. Keep it gentle and responsible. Choose what fits your situation.' },
      { main: 'Reflection.', details: 'Journal: How has porn affected my relationships and presence? What does “integrity” look like today in one action? What relationship will I prioritise this week?' },
    ],
    tipOfTheDay: {
      mistake: 'trying to “fix everything” in one emotional burst and then burning out.',
      practice: 'rebuild trust through small daily integrity that keeps compounding.'
    },
    eveningProtocol: [
      { main: 'Plan one social moment in the next 48 hours.', details: 'Loneliness is a predictable risk state. Social planning is relapse prevention, not weakness. Make it simple: a walk, coffee, call, gym partner. Put it on the calendar now. Then commit to showing up.' },
      { main: 'If partnered, choose emotional-first intimacy tonight (talk, affection, closeness).', details: 'If single, choose a self-care routine that strengthens confidence. Porn is often a substitute for these deeper needs. Tonight you meet the need directly and cleanly. Keep it calm and real. Treat yourself with respect. यह’s a foundation, not a performance.' },
      { main: 'Protect sleep and keep devices out of bed.', details: 'Sleep is the strongest daily multiplier of self-control. Evening device use can delay sleep and worsen sleep quality. When you sleep well, you make better choices tomorrow. Put the charger outside the bedroom if possible. Follow your routine and sleep.' },
      { main: 'Reflection.', details: 'Journal: What did I do today that rebuilt trust? Where did I feel disconnected, and what helped? What will I do tomorrow to show up stronger?' },
    ],
  },
  {
    day: 25,
    title: 'Next Phase Design',
    subtitle: 'Build your plan beyond four weeks',
    whatToExpectToday: ['You may worry about maintaining progress after day 28.', 'That worry is normal and useful because it pushes planning.', 'Today you design a system that survives real life.'],
    morningProtocol: [
      { main: 'Write a 60-day vision for your life without porn.', details: 'Include routines, relationships, energy, and how you spend evenings. The clearer the vision, the less power cravings have. This is direction, not fantasy. Make it practical and specific. Then choose one step you can start today.' },
      { main: 'Choose three keystone habits to maintain for the next 60 days (sleep schedule, exercise, focus block, social connection).', details: 'Keystone habits stabilise mood and reduce vulnerability. Keep them small enough to be realistic. Write the “minimum version” of each habit, so you can still succeed on bad days. This prevents all-or-nothing thinking. Commit for 60 days.' },
      { main: 'Decide your long-term digital boundaries.', details: 'Example: phone out of bedroom permanently, blockers stay on, no erotic browsing, strict social media rules. Boundaries are not punishment; they are protection. Your brain learns through repeated environment cues. If you want a different life, keep different cues. Write your rules clearly. Then keep them.' },
      { main: 'Reflection.', details: 'Journal: What do I fear most about long-term change? What rules will I keep permanently, and why? What is my next milestone date and how will I celebrate it cleanly?' },
    ],
    tipOfTheDay: {
      mistake: 'treating day 28 like the finish line and dropping structure.',
      practice: 'treat day 28 as the foundation and carry your system forward with pride.'
    },
    eveningProtocol: [
      { main: 'Build a weekly template for the next month: workouts, social time, hobbies, rest, and a consistent bedtime.', details: 'Empty weeks create empty evenings, and empty evenings create risk. A template reduces decision fatigue. Keep it flexible but structured. Put it in your calendar. Then follow it.' },
      { main: 'Plan for “disruption days” (travel, sickness, setbacks).', details: 'These are classic relapse moments because routines break. Write a minimum plan: phone out of bed, 10 minutes movement, a call to someone, early sleep. Minimum plans keep you safe when life is messy. You’re designing resilience, not perfection. Do it tonight on paper. Then keep it.' },
      { main: 'Keep your night calm and consistent.', details: 'Consistency is what turns good choices into habits. Devices away, lights low, routine on autopilot. The calmer your nights, the weaker your late cravings. Protect sleep and protect your future. You don’t have to “feel ready.” You just do it. Then sleep.' },
      { main: 'Reflection.', details: 'Journal: What system will protect me long-term? What part of my environment still needs redesign? What will I do tomorrow to strengthen my next phase?' },
    ],
  },
  {
    day: 26,
    title: 'Discomfort Training',
    subtitle: 'Build resilience on purpose',
    whatToExpectToday: ['Confidence grows when you practise discomfort intentionally.', 'You may notice that porn was a way to escape stress, boredom, or challenge.', 'Today you build the skill of staying steady under discomfort.'],
    morningProtocol: [
      { main: 'Choose one controlled discomfort practice today.', details: 'Examples: a cold shower finish, a challenging workout set, or a difficult conversation. The goal is not suffering; it’s training. Doing hard things voluntarily increases self-trust. You’re teaching your brain: “I can handle discomfort without escaping.” Keep it safe and reasonable. Do it once today and acknowledge the win.' },
      { main: 'Pair discomfort with pride.', details: 'After the discomfort practice, pause for 30 seconds and notice the feeling of strength. This makes the “reward” of discipline more real. Porn trains instant reward; you’re training earned reward. Pride is a clean dopamine source. Let yourself feel it. Then continue your day.' },
      { main: 'Identify one avoidance pattern and take a small step toward it today.', details: 'Avoidance fuels stress, and stress fuels cravings. Small steps reduce the pressure that drives relapse. Choose a step you can complete in 10 minutes. Start now, not later. Finish it, then stop. This is practice.' },
      { main: 'Reflection.', details: 'Journal: What discomfort do I usually escape with porn? What did I do today instead? What does this prove about my strength?' },
    ],
    tipOfTheDay: {
      mistake: 'building a life with zero discomfort and then relapsing the moment stress appears.',
      practice: 'train discomfort tolerance so cravings don’t get to decide for you.'
    },
    eveningProtocol: [
      { main: 'Review where you chose the harder right over the easier wrong today.', details: 'This builds identity and strengthens the brain’s “self-trust circuit.” Your brain needs evidence, not motivational speeches. Keep the review factual. Name three moments, even small. Then give yourself credit. Progress is built here.' },
      { main: 'Keep your evening simple and low-stimulation.', details: 'When you push yourself, you might feel more vulnerable later. A calm night prevents rebound coping. Choose easy comfort: shower, tea, reading. Phone stays away. Follow routine without negotiation. Sleep early if you need it.' },
      { main: 'Rehearse tomorrow’s hardest moment in your mind for 60 seconds.', details: 'Visualise the trigger, then visualise you executing the plan (stand, move, reset). Mental rehearsal improves action under pressure. Keep it short and specific. This is how you build reflexes. Then stop thinking and sleep.' },
      { main: 'Reflection.', details: 'Journal: Where did I grow today? Where am I still avoiding discomfort? What will I do tomorrow that strengthens my resilience?' },
    ],
  },
  {
    day: 27,
    title: 'Final Audit',
    subtitle: 'Close loopholes and reinforce identity',
    whatToExpectToday: ['Your brain may offer a “final reward” fantasy as the month ends.', 'Excitement can accidentally loosen discipline.', 'Today you tighten your system and prepare to continue.'],
    morningProtocol: [
      { main: 'Audit all devices again: blockers, app installs, hidden browsers, saved logins, and alternative access routes.', details: 'Remove anything new that could become a loophole. Loopholes are where relapse hides. Don’t debate; delete. Treat this like locking doors at night: basic safety. Finish the audit today.' },
      { main: 'Audit your “soft triggers” too.', details: 'That includes suggestive accounts, image-heavy feeds, and late-night scrolling habits that replaced porn. Substitution can keep the same stimulation addiction alive. Your goal is calm attention, not a new compulsive feed. Remove one soft trigger today. Replace it with a low-stimulation habit. Do it now.' },
      { main: 'Write your personal “rules of recovery” in 8–10 short lines.', details: 'Example: “No phone in bed,” “No explore feed,” “Urge = move,” “Tell someone within 24h if struggling.” Rules protect your future self when emotions spike. Keep rules specific and behavioural. Make them realistic and non-negotiable. Put them where you will see them. Then live them.' },
      { main: 'Reflection.', details: 'Journal: Which rule is most protective for me? Which rule do I resist most, and why? What commitment am I making for the next 60 days?' },
    ],
    tipOfTheDay: {
      mistake: 'celebrating by giving yourself risky freedom and assuming you’re “cured.”',
      practice: 'celebrate by locking in the rules and habits that made you win.'
    },
    eveningProtocol: [
      { main: 'Plan a clean celebration for tomorrow that aligns with your values.', details: 'The celebration should be non-trigger, non-secret, and genuinely rewarding. Planning prevents impulsive celebration that drifts into risky content. Choose something you can look back on with pride. Put it in the calendar. Then protect it.' },
      { main: 'Keep tonight extremely safe: no drifting, no late screens, no risky browsing.', details: 'Today is not the day to test yourself. Your brain is vulnerable to “one last time” thinking. Protect your progress like it matters—because it does. Choose a calm routine and follow it. Sleep early if you can.' },
      { main: 'Do a brief urge-surf rehearsal if you feel any restlessness.', details: 'Notice the urge, label it, breathe, and let it pass without action. This keeps your skill sharp. Skills are what carry you long-term, not motivation. Keep it short and simple. Then release the day. Sleep.' },
      { main: 'Reflection.', details: 'Journal: What is the biggest change I’ve noticed since day 1? What do I need to protect most in the next phase? What will I do if cravings spike next week?' },
    ],
  },
  {
    day: 28,
    title: 'Finish and Continue',
    subtitle: 'Consolidate gains and set new milestones',
    whatToExpectToday: ['You may feel proud, emotional, or surprisingly normal.', 'You might also feel a pull to “test” yourself again.', 'Today you turn this month into a long-term identity and system.'],
    morningProtocol: [
      { main: 'Write a day-28 summary: what worked, what didn’t, and what you will keep.', details: 'Be specific about triggers and solutions. This turns experience into strategy. Your future self will forget details; write them now. Make it practical, not poetic. Then choose your top three rules to keep.' },
      { main: 'Set your next milestone (day 45 or day 60) and define what “success” means there.', details: 'Choose one metric: porn-free days, bedtime consistency, reduced scrolling, improved focus, stronger relationships. Goals create direction, and direction reduces craving power. Keep the milestone realistic and motivating. Put it on your calendar. Plan a clean reward for that milestone.' },
      { main: 'Choose one growth goal for the next month that builds your life (fitness, skill, dating, relationships, career, creativity).', details: 'Porn often replaced growth with escape. Today you replace escape with ascent. Pick one goal and define the first small step. Start today, even if it’s 10 minutes. Progress builds momentum. Momentum protects you.' },
      { main: 'Reflection.', details: 'Journal: Write a letter to your day-1 self about what you learned and proved. What was harder than expected, and what was easier? What promise are you making to yourself for the next phase?' },
    ],
    tipOfTheDay: {
      mistake: 'assuming the struggle is over and dropping structure immediately.',
      practice: 'keep your system and identity strong so freedom becomes your default, not a temporary streak.'
    },
    eveningProtocol: [
      { main: 'Celebrate cleanly and intentionally.', details: 'Choose a reward that doesn’t trigger you and doesn’t require secrecy. Make it something you can share or remember proudly. This trains your brain: “I can reward myself without porn.” Enjoy it fully, then move on. Celebration is part of identity-building.' },
      { main: 'Schedule your next week tonight: workouts, social time, focus blocks, and strict bedtime.', details: 'The week after a milestone is high risk because structure can loosen. Your calendar is your continued protection. Keep it simple and realistic. Write it down and commit. This is how progress continues.' },
      { main: 'Keep your relapse-prevention plan visible and ready.', details: 'You don’t need it every day, but you need it on the day you least expect. Keep your phone rules, blockers, and if–then plans active. Strong systems prevent “one bad night” from becoming a new cycle. Put devices away early tonight. Sleep. Wake up proud.' },
      { main: 'Reflection.', details: 'Journal: What am I proud of, specifically? What is the biggest threat to my next phase, and what is my plan for it? What kind of person am I choosing to be from tomorrow onward?' },
    ],
  },
];