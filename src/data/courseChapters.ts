// Chapter level theme colors
export const levelColors: Record<"Beginner" | "Intermediate" | "Advanced", string> = {
  Beginner: "from-green-500 to-emerald-600",
  Intermediate: "from-yellow-500 to-orange-600", 
  Advanced: "from-red-500 to-rose-600",
};

export const levelIcons: Record<"Beginner" | "Intermediate" | "Advanced", string> = {
  Beginner: "🌱",
  Intermediate: "🚀", 
  Advanced: "🎯",
};

export type ChapterLevel = "Beginner" | "Intermediate" | "Advanced";

// Complete 30-day course chapters
export const chapters = [
  // Beginner Level (Days 1-10)
  {
    number: 1,
    level: "Beginner" as ChapterLevel,
    title: "Why Financial Education Matters More Than Ever",
    description: "Why schools don't teach money, the cost of financial ignorance, and mindset differences between employees, entrepreneurs, and investors.",
    readTime: "15 min",
    content: `# Why Financial Education Matters More Than Ever

## Why Schools Don't Teach Money

You've spent years in school solving quadratic equations, memorizing dates of battles, and writing essays on Shakespeare. But no one taught you how to file taxes, invest in stocks, or even build a basic budget. The education system, built in the industrial era, was designed to create obedient workers — not financially free individuals.

Robert Kiyosaki, in Rich Dad Poor Dad, puts it bluntly: schools prepare you to work for money, but not for your money to work for you. The real world runs on money, yet most people stumble through it financially blindfolded.

## 💰 The Cost of Financial Ignorance

Financial ignorance is expensive. Here's how:

- People fall into debt traps by swiping credit cards mindlessly.
- Young professionals burn through salaries without saving or investing.
- Families live paycheck to paycheck, even with decent incomes.
- Many buy liabilities (cars, gadgets) thinking they're assets.
- Retirement becomes a fear instead of a plan.

Money is the most powerful tool in modern life. Not knowing how it works is like driving blindfolded — you might move, but you'll crash eventually.

According to The Barefoot Investor, a simple roadmap to budgeting, emergency funds, and financial automation can transform your life — yet most people never get around to learning it.

## 🧠 The Mindset Shift: Rich Dad vs Poor Dad

In Rich Dad Poor Dad, Kiyosaki contrasts two father figures:

**Poor Dad:** Educated, hard-working, risk-averse, believes in job security.
**Rich Dad:** Entrepreneur, investor, financially literate, believes in ownership.

Key takeaways:
- The rich buy assets. The poor and middle class buy liabilities, thinking they're assets.
- Working for a paycheck is the beginning. Making your money work for you is the goal.
- Mindset > Money. Without the right mindset, even a big salary won't save you.

This isn't about income levels. It's about financial IQ.

## 👥 Employee vs Entrepreneur vs Investor

You're not locked into one role. Over time, your goal should be to transition from employee to entrepreneur and investor, or blend them strategically. It's about leverage. As you gain financial skills, you move from working in the system to working on the system.

## 🔁 Real-Life Illustration

Let's say two friends, Raj and Aman, both earn ₹50,000 per month.

**Raj** buys a car on EMI, parties on weekends, and has no savings. He believes, "I deserve it. I work hard."

**Aman** sets up a budget, invests ₹15,000/month into mutual funds, starts a side hustle, and reads financial books.

After 5 years:
- Raj is stuck in the same job, dreading bills.
- Aman has investments compounding quietly, income from his side hustle, and the option to quit his job if he wants.

What made the difference? Not income. Mindset. Education. Action.`,
    takeaways: [
      "Schools won't teach you money. That's your job now.",
      "Financial education isn't optional — it's survival.",
      "You must understand the difference between assets and liabilities.",
      "Changing your money mindset changes your life.",
      "You don't need to be rich to start. You need to start to get rich."
    ],
  },
  {
    number: 2,
    level: "Beginner" as ChapterLevel,
    title: "The Psychology Behind Money",
    description: "Understanding emotions like fear and greed in financial decisions, and why patience trumps intelligence in money matters.",
    readTime: "12 min",
    content: `# The Psychology Behind Money

## 🧠 Why Doing Well with Money Isn't About IQ

Morgan Housel opens The Psychology of Money with a powerful truth: "Doing well with money has little to do with how smart you are and a lot to do with how you behave."

Think about it—some of the world's smartest people have gone bankrupt. And many average folks have quietly built wealth by being consistent, disciplined, and patient.

It's not about your income. It's not about your math skills. It's about emotions. behavior. mindset.

## 😰 Fear, Greed, and Envy: The Silent Traps

### ❌ Fear
You hesitate to invest because you're scared of losing money. Maybe you saw a relative lose it all in the stock market. But fear often stops people from taking even safe, sensible steps like putting money into a mutual fund or buying health insurance.

"Risk is what's left over when you think you've thought of everything." – Carl Richards

### 💰 Greed
People chase "get rich quick" schemes. Crypto scams. Penny stocks. Unverified tips. Greed clouds logic and whispers, "Double your money in 1 month!"

Result? Pain. Loss. Regret.

### 😤 Envy
You scroll through Instagram and see a 24-year-old with a new car, fancy clothes, and luxury trips. You start to feel behind.

But as Housel says, "The fastest way to ruin your own happiness is to compare your financial journey to someone else's."

What you see online is often debt disguised as lifestyle.

## 🕰️ Patience: The Real Money Superpower

We live in the age of 1-minute reels, 10-minute deliveries, and same-day gratification. But money works on a very different principle:

**Wealth is what you don't see.**

When you save money, invest steadily, and let compounding do its work—you won't see results overnight. But wait 5–10 years, and the curve bends exponentially.

Imagine this:
- ₹10,000/month invested at 12% returns
- For 10 years = ₹23 lakh
- For 20 years = ₹75 lakh
- For 30 years = ₹2.9 crore

Same monthly habit. Different results. The difference? Time.

## 🛡️ How to Build a Calm, Long-Term Mindset

- Stop checking your portfolio every day. Watching your investments is like watching paint dry — but in panic mode.
- Don't chase hot trends. FOMO (fear of missing out) is a wealth killer. If everyone's buying it, it's probably too late.
- Play your own game. Your goals are different. Your risks, needs, and timeline are unique. Don't let someone else's lifestyle dictate your choices.
- Stay humble and curious. As Housel writes, "Financial success is not a hard science. It's a soft skill, where how you behave is more important than what you know."`,
    takeaways: [
      "Money decisions are emotional, not rational. Master your behavior first.",
      "Avoid the 3 emotional traps: fear, greed, and envy.",
      "Patience and consistency are the ultimate power moves.",
      "Don't compare. Don't rush. Play the long game.",
      "Being wealthy is not about having a lot of money. It's about having control over your time and peace of mind."
    ],
  },
  {
    number: 3,
    level: "Beginner" as ChapterLevel,
    title: "Income vs Expenses, Assets vs Liabilities",
    description: "Understanding the fundamental difference between assets and liabilities, and how this knowledge creates wealth.",
    readTime: "18 min",
    content: `# Income vs Expenses, Assets vs Liabilities

## (The Rich Think Differently)

Most people think: "If I earn more money, I'll become rich." But Robert Kiyosaki (in Rich Dad Poor Dad) says: "It's not how much money you make. It's how much money you keep."

Let's break down the basic flow of money and how you can control it — even on a small salary.

## 🧾 The Money Flow: Income → Expenses

Here's the typical pattern for most people:
- You earn money (salary, freelance, business).
- You spend money (rent, food, clothes, Netflix, EMI).
- There's little left to save or invest.

They're stuck in what's called the "rat race."

But the rich? They operate on a different formula.

## 📊 The Rich Person's Formula

Rich people don't just work for money. They make money work for them.

Here's the secret:
- ✅ Buy assets that bring in money 
- ❌ Avoid liabilities that suck money out

## 🔍 What is an Asset?

An asset puts money into your pocket.

Examples:
- 🏠 A rental property that gives monthly rent
- 📈 Stocks or mutual funds that grow and pay dividends
- 📚 A course that improves your skills and gets you better income
- 💻 A side-hustle like a blog, YouTube channel, or online store

## 🔍 What is a Liability?

A liability takes money out of your pocket.

Examples:
- 🚗 A car on EMI that loses value every year
- 🏠 A house bought on a big loan with no rental income
- 📱 A new iPhone bought on credit
- 👟 Expensive shoes or clothes that impress others but do nothing for your bank balance

"Poor people buy liabilities thinking they are assets." — Robert Kiyosaki

## 💥 The Income Trap: Lifestyle Inflation

Let's say:
- You earn ₹30,000/month → spend ₹29,000
- You get a raise to ₹50,000 → you now spend ₹49,000

New clothes, new gadgets, eating out more. That's lifestyle inflation.

But the rich do something different:
Every time their income increases, they don't just upgrade lifestyle — they upgrade their assets.

## 🧠 How to Think Like the Rich (Even If You're Broke)

- **Track your expenses** Use apps like RupeeDiary, Walnut, or a simple Google Sheet.
- **Start buying assets early** Even ₹500 SIP/month in a mutual fund is a start. Tiny steps grow big.
- **Delay gratification** Ask yourself before every purchase: "Is this adding to my wealth or subtracting from it?"
- **Invest in learning** Courses, books, and skills are the best assets — especially if you're under 25.

## 🧮 Real-Life Example: Two Friends

Let's say:
- **Aman** earns ₹40K/month. He buys gadgets, eats out, and pays EMI on a bike. Net savings? ₹0.
- **Ravi** earns the same ₹40K. He saves ₹5K, invests ₹3K in SIPs, and builds a YouTube channel for extra income.

In 3 years, Aman is stuck. Ravi is earning from multiple sources. That's the power of thinking in assets.`,
    takeaways: [
      "Always ask: Does this put money in my pocket or take it out?",
      "Focus on acquiring real assets, not fake ones",
      "Your home is not an asset if you live in it",
      "Wealth is built by owning assets, not increasing income alone"
    ],
  },
  {
    number: 4,
    level: "Beginner" as ChapterLevel,
    title: "Budgeting and Expense Tracking",
    description: "Your money's story told honestly - where does your money actually go?",
    readTime: "14 min",
    content: `# Budgeting and Expense Tracking

## (Your Money's Story – Told Honestly)

You work hard. You earn money. But at the end of the month you're like:
"Bhai paisa gaya kahaan?" 🤔

You don't need to be a CA or finance geek. You just need one habit: Tracking where your money goes.

## 💡 Why Budgeting Matters

Imagine trying to lose weight without knowing how much you eat. Same way, trying to save without knowing how much you spend? That's financial blindness.

"What gets measured, gets managed." – Peter Drucker

## 🧠 Budget = A Plan for Your Money

It's not a restriction. It's direction. You decide where your money goes — instead of wondering where it went.

## 🛣️ The 50:30:20 Rule (Desi Edition)

This is a simple beginner-friendly budgeting rule:

- **50% Needs:** Rent, food, transport, utilities
- **30% Wants:** Entertainment, dining out, shopping
- **20% Savings:** Emergency fund, investments, goals

You can tweak it based on your goals. Even 10% savings is better than 0%.

## 📱 Apps That Make Tracking Easy (Indian-Friendly)

- **Walnut** – Auto reads SMS, categorizes expenses
- **Money Manager** – Clean UI, good analytics
- **Notion / Google Sheets** – For nerds who love control

## 🍟 Real-Life Example: ₹30,000 Monthly Income (College Student/Fresher)

- **Needs (₹15,000):** Rent ₹8K, Food ₹4K, Transport ₹2K, Phone ₹1K
- **Wants (₹9,000):** Movies, chai, clothes, random stuff
- **Savings (₹6,000):** Emergency fund ₹3K, SIP ₹3K

Even on ₹30,000/month, you can save. The secret is clarity.

## 🧾 Pro Tip: Track Every Expense (Yes, Even That ₹20 Chai)

Don't guess. Write it down.

Try this challenge:
For the next 7 days, write down every rupee you spend — from ₹10 biscuit to ₹1000 dinner.

You'll be shocked where the leaks are.

## 🚨 Warning: Budget Killers

Avoid these traps:
- 💳 Swiping credit card for things you don't need
- 🛍️ Shopping to "feel better"
- 🍽️ Ordering food every day just because it's easy
- 🧾 Not tracking "small" spends — they pile up

"It's not the ₹1000 you lose once. It's the ₹100 you lose 10 times that kills your savings."

## ✅ Build a Habit, Not a Hack

Set 10 minutes every Sunday:
- Open your app or notebook
- Note your spendings
- Adjust budget if needed
- Make money tracking part of your self-care routine.

## 🧘‍♂️ Final Words: Don't Just Budget. Understand Your Pattern.

You'll start to notice:
- Where you overspend
- What you truly value
- And what you can cut without pain

That's when you stop being broke and start being aware.`,
    takeaways: [
      "Track where your money goes - awareness is the first step",
      "Use the 50/30/20 rule as a starting point",
      "Small expenses add up - track everything for a week",
      "Build a habit of weekly money check-ins"
    ],
  },
  {
    number: 5,
    level: "Beginner" as ChapterLevel,
    title: "Emergency Fund",
    description: "Your financial backup for life's unexpected moments - because emergencies don't give warnings.",
    readTime: "16 min",
    content: `# Emergency Fund

## (Aapda ke samay ka asli yaar – Your Financial Backup)

Picture this: You lose your job. Your bike gets stolen. Your phone falls into a bucket of water. Now what?

If you have no backup, you're forced to:
- Swipe a credit card 💳
- Ask family/friends 😓
- Take a loan at high interest 😩

But if you had an emergency fund? You'd just say, "Chill, I got this."

## 🤔 What Exactly is an Emergency Fund?

It's a stash of money you keep aside for:
- Job loss
- Medical emergencies
- Family emergencies
- Urgent travel
- Big unexpected expenses

This is not money for shopping, trips, or festivals. Emergency fund = Only break in case of fire.

## 🧮 How Much Should You Save?

The simple formula:
💰 **3 to 6 months of your basic living expenses.**

Example:
- Rent: ₹10,000
- Food: ₹4,000
- Transport: ₹2,000
- Phone + Utilities: ₹1,000
- Total = ₹17,000/month
- **Emergency Fund = ₹51,000 to ₹1,00,000**

If you're a student, you can start with even ₹10,000 to ₹20,000.

## 🏦 Where to Keep It?

Not in your piggy bank. Not in risky stocks. Not in cash under your mattress.

**Best places:**
- High-interest Savings Account (with instant access)
- Liquid Mutual Funds (for those who are comfortable)
- Fixed Deposit (short-term) – if you want discipline

Don't invest it in crypto, stocks, or real estate. Liquidity is the key.

## 🧘‍♀️ Why This Brings Mental Peace

Money in the bank = Less anxiety.

You walk into life's storms with confidence because:
- You won't panic
- You won't depend on others
- You stay in control

It's not about being rich. It's about being ready.

## 🎯 Step-by-Step: How to Start Your Emergency Fund

1. **Set a Goal** – Calculate your monthly survival cost
2. **Open a separate account** – Don't mix with spending money
3. **Start Saving Monthly** – Even ₹1,000/month adds up
4. **Automate It** – SIP into a liquid fund or savings account
5. **Don't Touch It** – It's not your travel or Diwali shopping fund

## 🔥 Real Talk: Why Most People Don't Do This

- "Mere paas toh already kam paisa hai."
- "Emergency toh kabhi aayegi bhi ya nahi."
- "I'll start from next month." (Spoiler: You won't)

But emergencies don't give warning. Start now, not when the crisis hits.

## 💬 What Successful People Say

"The emergency fund is like a life jacket. You hope you don't need it, but it saves you from drowning." – Ramit Sethi

"Having an emergency fund isn't boring. Being broke in an emergency is." – Everyone who's ever faced a crisis`,
    takeaways: [
      "Build 3-6 months of expenses as emergency backup",
      "Keep it liquid and easily accessible",
      "Start with small amounts - even ₹1,000/month helps",
      "Mental peace is the biggest benefit of emergency funds"
    ],
  },
  {
    number: 6,
    level: "Beginner" as ChapterLevel,
    title: "Goal-Based Saving",
    description: "Save money with purpose - turn your dreams into actionable financial plans.",
    readTime: "14 min",
    content: `# Goal-Based Saving

## (Apne sapno ke liye paisa banana – The Smart Way to Save for What You Love)

Ever thought:
- "Ek din iPhone lunga…"
- "Yaar, Goa trip toh banti hai."
- "Mujhe apna startup fund karna hai."

Now here's the problem: People only wish. They don't plan.

What if I told you saving money doesn't mean giving up fun… It means planning fun like a boss.

## 🤔 What is Goal-Based Saving?

It's when you save money with a specific goal in mind.

Instead of:
"Main kuch paisa bacha lunga…"

You say:
"Main next April tak ₹80,000 bachaunga for that iPhone 15."

That shift in mindset changes everything.

## 📊 Step 1: Define Your Dream Goals

Ask yourself: What do I want in the next 1 to 3 years?

### 🎁 Material Goals:
- iPhone 15: ₹80,000
- PS5: ₹45,000
- Bike upgrade: ₹1,20,000

### 🌍 Experience Goals:
- Goa Trip: ₹15,000
- International Trip: ₹1,50,000
- Music Concert: ₹8,000

### 💼 Growth Goals:
- Online course: ₹5,000
- Laptop upgrade: ₹70,000
- Business startup: ₹50,000+

Write it down. Don't keep it in your head.

## 🧮 Step 2: Break It Into Monthly Savings

Let's say you want to buy an iPhone worth ₹80,000 in 10 months.

₹80,000 ÷ 10 = ₹8,000/month

Don't say, "Mere paas itna nahi bachta." Instead say, "How can I create/save ₹8,000/month?"

Maybe by:
- Cutting food delivery apps
- Freelancing part-time
- Selling unused stuff
- Reducing impulsive spending

## 🏦 Step 3: Create Separate "Saving Buckets"

Open dedicated savings accounts for each goal. Or use goal-based saving features from apps like:
- ✅ Fi Money 
- ✅ Jupiter 
- ✅ NiyoX 
- ✅ ETMONEY 
- ✅ Groww (with Liquid Funds)

Each goal has its own "virtual envelope." No confusion. No mixing. Only clarity.

## ⚙️ Step 4: Automate It

Make your bank/app automatically save every month.

"Set it and forget it." That's the power of automation.

Every month:
- ₹3,000 to iPhone fund
- ₹1,500 to travel fund
- ₹1,000 to course fund

You won't even miss the money after a while.

## 🤯 The Power of Starting Small

Even ₹500/month becomes ₹6,000 in a year.

That's:
- A budget trip
- New headphones
- Course + Certification

Small amounts saved consistently beat big amounts saved once.

## 💬 Real Talk: What Most People Do

- Wait for "bonus" or "extra money" to save
- Spend everything first, save whatever is left (usually ₹0)
- Say "goal toh hai, but dekhte hai"
- Blame inflation, income, economy, parents…

Don't do that. Take control. Be intentional.`,
    takeaways: [
      "Define specific goals with clear timelines and amounts",
      "Break big goals into manageable monthly savings",
      "Use separate accounts or buckets for each goal",
      "Automate your savings to remove temptation"
    ],
  },
  {
    number: 7,
    level: "Beginner" as ChapterLevel,
    title: "The Psychology of Spending",
    description: "How brands hack your brain to make you spend, and how to fight back with conscious spending habits.",
    readTime: "16 min",
    content: `# The Psychology of Spending

## (Tum kharidne nahi aaye the… par tumse kharidwa liya gaya!)

Ever opened Amazon for one thing and ended up buying 7?
Ever said, "Bas ek T-shirt" and 4 reels later you've spent ₹2,499?

Congratulations. You've been played. This chapter is about how brands hack your brain… and how to fight back.

## 🎯 Why This Matters

It's not about spending less. It's about spending smart and consciously.

Because if you don't know how your brain works… Instagram, Myntra, and Zomato will use it against you.

## 🧠 The Psychology Hacks Brands Use

### 1. Scarcity FOMO
"Only 2 left in stock!" "Hurry! 60% off for the next 2 hours!"

Truth? They've got warehouses full. But your brain thinks: Buy now or regret forever.

🧠 **Hack:** If something is limited, pause for 24 hours. Chances are, you won't even want it tomorrow.

### 2. Anchoring Bias
"MRP: ₹2,999 — Now only ₹1,199!"

They set a fake high price to make ₹1,199 look like a steal.

🧠 **Hack:** Ask: Would I still buy this if there was no "discount"? If not, skip it.

### 3. Social Proof
"5,239 people bought this in the last 24 hours" "As seen on Shark Tank" "Everyone on Instagram has it"

Your brain says: If everyone has it, I should too.

🧠 **Hack:** You're not "everyone." Buy only what aligns with your goals.

### 4. Personalized Ads (Creepy Smart)
You talk about running shoes. Suddenly, every ad is Nike, Adidas, Puma.

They study your:
- Search history
- Watch time
- Location
- Micro-expressions 😳

🧠 **Hack:** Use tools like:
- Ad blockers
- Incognito mode
- Pause social shopping accounts

### 5. Guilt-Free Pricing
"Just ₹399/month" sounds better than ₹4,788/year.

Break it down. It's psychology. Monthly = Feels small, Yearly = Feels big

🧠 **Hack:** Always calculate the real annual cost.

Netflix: ₹649/month = ₹7,788/year
Do you even watch that much?

## 💸 The 24-Hour Rule That Saves Thousands

**Rule:** Wait 24 hours before any non-essential purchase.

That's it. Just wait.

"Impulse fades. Clarity stays."

## 🧠 3 Questions Before You Buy Anything

1. Do I really need this?
2. Can I afford it without breaking my goal savings?
3. Will I still want this in 1 week?

If "no" to any — skip it. Use the money to fund a real goal.

## 💡 Bonus Tip: The "Spending Journal"

Track every spend (₹100 or more) for 7 days.

Write:
- What did I buy?
- Why did I buy it?
- How did I feel after?

You'll be shocked how much is "boredom" or "impulse."`,
    takeaways: [
      "Brands use psychological tricks to make you spend impulsively",
      "Use the 24-hour rule before any non-essential purchase",
      "Calculate annual costs, not just monthly prices",
      "Track your spending patterns to identify triggers"
    ],
  },
  {
    number: 8,
    level: "Beginner" as ChapterLevel,
    title: "The Budget That Lets You Still Eat Out",
    description: "Ramit Sethi's Conscious Spending Plan - spend guilt-free on what you love while building wealth.",
    readTime: "18 min",
    content: `# The Budget That Lets You Still Eat Out

## (Yes, you can have that Zomato biryani guilt-free!)

Budgets don't mean giving up your fun. They mean giving your money a job.

Instead of saying "No" to everything, we'll say:
"I'll guiltlessly spend ₹X on things I love. And automate the rest."

That's the power of the Conscious Spending Plan — not "budgeting," but value-based spending.

## 🧠 Budgeting = Freedom, Not Punishment

**Traditional budget:**
"No coffee. No eating out. No fun."

**Ramit Sethi's method:**
"Spend extravagantly on what you love. Cut mercilessly on what you don't."

So if you love:
- Gadgets → Budget for them.
- Weekend chai pe charcha → Keep it.
- Random ₹300 makeup haul you never use? → Cut it.

## 📊 The 4 Buckets of Conscious Spending

Let's break your income (after tax) into 4 clear categories:

### 1. Fixed Costs (50-60%)
- Rent, utilities, groceries, EMIs
- Non-negotiable survival stuff

### 2. Investments (20%)
- SIPs, emergency fund, retirement
- Pay yourself first, always

### 3. Savings Goals (5-10%)
- Vacation fund, gadget fund, course fund
- Dreams with deadlines

### 4. Guilt-Free Spending (20-25%)
- Movies, food, clothes, random fun
- No questions asked, no guilt

You earn ₹30,000/month? You get ~₹6,000–₹10,000 just for guilt-free fun. Guilt-free. No overthinking. No regrets.

## 🔁 Automate It All

**Step 1:** Salary comes in
**Step 2:**
- SIPs auto-debit on 2nd
- Fixed bills go on 3rd
- Savings auto-transfer on 4th
- Whatever's left = your fun money 💃

You never have to manually budget again.

Automation = Discipline without willpower

## 🧠 Why This Works

Because:
- You never feel broke
- You know your splurges are planned
- You avoid debt traps
- You grow rich quietly in the background

## 📱 Apps That Help (India Edition)

- **Jupiter / Fi / Cred** – Tracks spending by category
- **ET Money / Groww / Zerodha** – For SIPs and investments
- **Walnut / YNAB (advanced)** – For serious budget nerds

## 🧮 Sample Budget: A 24-Year-Old in Mumbai, Salary ₹40,000/month

- **Fixed Costs (₹20,000):** Rent ₹12K, food ₹5K, transport ₹2K, phone ₹1K
- **Investments (₹8,000):** SIP ₹5K, Emergency fund ₹3K
- **Savings Goals (₹4,000):** Trip fund ₹2K, gadget fund ₹2K
- **Guilt-Free (₹8,000):** Movies, dinner, shopping, whatever

## 💥 Pro Tip: Increase Your Income, Don't Just Cut Costs

Budgeting is good. But the real freedom comes from earning more.
- Freelance gigs
- Selling digital products
- Skill monetization (We'll cover this in Chapter 26.)`,
    takeaways: [
      "Focus on conscious spending, not restrictive budgeting",
      "Automate your savings and fixed expenses",
      "Spend guilt-free on things you truly value",
      "The best system is the one you'll actually follow"
    ],
  },
  {
    number: 9,
    level: "Beginner" as ChapterLevel,
    title: "Creating a Personal Financial Plan",
    description: "Build a roadmap for your financial future by aligning your money with your values and goals.",
    readTime: "20 min",
    content: `# Creating a Personal Financial Plan

## (aka: Why are you even saving, bro?)

Most people save without knowing why. They just say:
"I should be saving… because it's what adults do, right?"

Wrong approach.

Let's fix that today.

## 💭 Ask Yourself: Why Do I Want Money?

Money isn't the goal. Money is a tool to live your best life.

So before you set up SIPs or invest in mutual funds, ask:
"What does my Rich Life look like?"

It could mean:
- Living in a clean, calm 1BHK that's all yours
- Traveling to Goa 3x a year
- Upgrading to an iPhone guilt-free
- Taking care of your parents without hesitation
- Starting a side business with zero loan stress

That's your why. That's your financial North Star.

## 🗺️ Define 3 Short-Term & 3 Long-Term Goals

### Short-Term Goals (0–3 years):
- Build ₹1 lakh emergency fund
- Buy a used scooty
- Solo trip to Himachal next summer

### Long-Term Goals (5+ years):
- Save ₹15–20 lakh for a house downpayment
- Start your own cafe/bookstore
- Have ₹1 crore invested by age 40

You don't need to know everything right now — just be clear on:
- What do I want? 
- When do I want it? 
- What will it take to get there?

## 🧮 Reverse Engineer Your Goals

Example:
- **Goal:** Goa Trip in May 
- **Cost:** ₹30,000 
- **Time:** 10 months 
- **Save:** ₹3,000/month

Boom. That's a plan.

Do this for every goal.

It makes your savings feel exciting, not boring.

## 📋 Build Your Personal Financial Plan (Template)

Here's a simple version. Fill it like a friend is asking:

**Name:** Priyankshu (insert yours)
**Monthly income (after tax):** ₹45,000
**Fixed costs:** ₹25,000
**Investments:** ₹7,000
**Savings goals:** ₹5,000
**Fun budget:** ₹8,000

### Top 3 Short-Term Goals:
1. Emergency fund – ₹1,00,000 by Dec 2025
2. Buy MacBook – ₹1,20,000 by July 2026
3. Trip to Bali – ₹90,000 by Feb 2026

### Top 3 Long-Term Goals:
1. House downpayment – ₹20L by 2030
2. FIRE (financial independence) – ₹3Cr corpus by 2045
3. Start coffee brand – ₹10L seed money by 2029

## 🧠 Bonus: Align Goals With Values

Values = what's most important to you.

Examples:
- **Family:** Save for their health, weddings, security
- **Freedom:** Build emergency funds & investments early
- **Experiences:** Travel, concerts, food splurges
- **Peace of mind:** Pay off EMIs faster, no debt

When goals align with values, you won't quit on them.

## ⚙️ Tools That Help (India Edition)

- **Goal Planning:** ET Money, INDmoney, Kuvera
- **Custom Trackers:** Google Sheets + reminders
- **Vision Boards:** Pinterest, Notion, even a printed A4 stuck near your bed

## 💥 Pro Tip: You'll Never "Feel Ready" — Start Anyway

Most people wait:
- "I'll start planning when I earn more."
- "I'll think about saving after this one trip."

Don't do that.

Plan first. Spend second.`,
    takeaways: [
      "Define your 'Rich Life' vision before setting financial goals",
      "Break down big goals into monthly action steps",
      "Align your money goals with your personal values",
      "Start planning now, don't wait for perfect conditions"
    ],
  },
  {
    number: 10,
    level: "Beginner" as ChapterLevel,
    title: "The 85% Solution",
    description: "Stop waiting to be a finance expert before you start - perfect is the enemy of progress.",
    readTime: "15 min",
    content: `# The 85% Solution

## (aka: Stop Waiting to Be a Finance Expert Before You Start)

You don't need to be a CA or finance bro to manage your money. In fact, trying to be perfect with money often leads to…

**Doing Nothing.**

Let's fix that.

## 🤯 Most People Wait for "Perfect Timing"

You might've told yourself:
- "I'll start budgeting when I earn more."
- "I'll invest when I learn everything about mutual funds."
- "I'll save when I'm out of debt."

Result? You keep reading, scrolling, researching — and never actually do anything.

This is called **analysis paralysis**. And it's a killer of financial progress.

## 💡 The 85% Rule: Just Start. Improve Later.

If you understand 85% of something — **START**. Even if you're not 100% confident.

Examples:
- Don't wait to understand every type of SIP. Start with one ₹1,000/month SIP in a large-cap fund.
- Don't wait to learn 20 budgeting methods. Just use the 50/30/20 rule.
- Don't wait to be debt-free to build an emergency fund. Start both together — even ₹500 at a time.

Money rewards action. Not perfection.

## 📈 You Learn More By Doing

Let's say you start investing ₹2,000/month in a mutual fund. After 3 months, you realize:
"Okay, this is working. Maybe I can switch to a better fund."

That's real-world learning.

You won't learn that much just by watching YouTube videos.

**Start → Learn → Improve.**

## 🧘‍♂️ Accept You'll Make Mistakes

You will:
- Miss a due date
- Pick a bad fund
- Overspend on Zomato
- Buy that random ₹2,999 Instagram gadget you never use

It's okay.

Your money journey isn't ruined.

Just get back on track.

## 📊 Perfect vs. Done — Quick Examples

| Perfect | Done |
|---------|------|
| Research 50 mutual funds | Pick any top-rated large cap fund |
| Build complex Excel budget | Use 50/30/20 rule |
| Wait for salary hike to save | Start with ₹500/month |
| Read 10 books before investing | Read 1 book, start investing |

## ✨ The Magic of Small Wins

You build financial confidence by:
- Finishing your first month of budgeting
- Hitting ₹5,000 in your emergency fund
- Getting your first ₹100 profit in mutual funds

Tiny wins → Big momentum.

## 💪 Done Is Safe. Done Is Peaceful. Done Is Powerful.

It's okay if:
- Your app is buggy but works
- Your SIP is small but consistent
- Your insurance isn't the cheapest, but gives peace of mind

That's real-life finance.

## 📌 Action Plan: What Can You Start at 85% Today?

Pick ONE:
- Start a ₹500/week emergency fund
- Automate a ₹1,000/month SIP
- Install a free budgeting app
- Cancel a useless subscription
- Get health insurance — even a starter plan

Don't overthink. Just start.`,
    takeaways: [
      "Perfect is the enemy of progress - start at 85% knowledge",
      "You learn more by doing than by researching endlessly",
      "Small consistent actions beat perfect plans never executed",
      "Financial confidence builds through small wins, not perfection"
    ],
  },
  // Intermediate Level (Days 11-20)
  {
    number: 11,
    level: "Intermediate" as ChapterLevel,
    title: "Introduction to Investing",
    description: "Why saving alone isn't enough, understanding the difference between saving, investing, and speculating.",
    readTime: "20 min",
    content: `# Introduction to Investing

Saving money is important, but it's not enough to build real wealth. With inflation eroding purchasing power, your money sitting in a savings account is actually losing value over time.

## Why Saving Alone Fails

### Inflation Enemy
- Average inflation: 6-7% per year
- Savings account interest: 3-4%
- Real return: -3% (losing purchasing power)

### Opportunity Cost
- Money not invested doesn't compound
- Missing years of growth can't be recovered
- Time is your biggest advantage

## Three Money Activities

### Saving
- **Purpose:** Safety and liquidity
- **Returns:** 3-6% per year
- **Risk:** Very low
- **Timeline:** Emergency fund, short-term goals

### Investing
- **Purpose:** Building wealth over time
- **Returns:** 10-15% per year (long-term average)
- **Risk:** Moderate, managed through diversification
- **Timeline:** 5+ years

### Speculating
- **Purpose:** Quick profits
- **Returns:** Highly variable (-100% to +1000%)
- **Risk:** Very high
- **Timeline:** Days to months

Coming up in the next chapters, we'll dive deep into the world of investing and help you build a portfolio that works for your goals and timeline.`,
    takeaways: [
      "Saving alone loses to inflation over time",
      "Investing is essential for building long-term wealth",
      "Start small and build knowledge gradually",
      "Time and compound interest are your best friends"
    ],
  },
  {
    number: 12,
    level: "Intermediate" as ChapterLevel,
    title: "The Magic of Compounding",
    description: "How compound interest works in your favor and why Einstein called it the 8th wonder of the world.",
    readTime: "18 min",
    content: `# The Magic of Compounding

Albert Einstein allegedly called compound interest "the eighth wonder of the world." Whether he said it or not, the sentiment is true - compounding is the most powerful force in building wealth.

## How Compound Interest Works

Compound interest means earning interest on your interest. It's like a snowball rolling downhill - it starts small but grows exponentially.

### Simple vs Compound Interest Example

**₹1,00,000 invested at 10% for 10 years:**

**Simple Interest:**
- Year 1: ₹1,00,000 + ₹10,000 = ₹1,10,000
- Year 2: ₹1,10,000 + ₹10,000 = ₹1,20,000
- Year 10: ₹2,00,000

**Compound Interest:**
- Year 1: ₹1,00,000 × 1.10 = ₹1,10,000
- Year 2: ₹1,10,000 × 1.10 = ₹1,21,000
- Year 10: ₹2,59,374

The difference? ₹59,374 - just from compounding!

## The Power of Time

The earlier you start, the more powerful compounding becomes. Let's see two friends:

**Raj starts at 25:**
- Invests ₹5,000/month for 10 years (₹6 lakh total)
- Stops at 35, lets it compound till 60
- Final amount at 12% return: ₹1.37 crore

**Amit starts at 35:**
- Invests ₹5,000/month for 25 years (₹15 lakh total)
- Final amount at 60: ₹1.32 crore

Raj invested ₹9 lakh less but ended up with more money. That's the power of starting early.

The key insight: Time in the market beats timing the market.`,
    takeaways: [
      "Compound interest is earning interest on your interest",
      "Starting early gives you a massive advantage",
      "Time is more important than the amount invested",
      "Consistency and patience are your best friends"
    ],
  },
  {
    number: 13,
    level: "Intermediate" as ChapterLevel,
    title: "Stock Market Basics",
    description: "Understanding stocks, mutual funds, ETFs, and the fundamentals of market investing.",
    readTime: "22 min",
    content: `# Stock Market Basics

The stock market might seem scary, but it's actually quite simple once you understand the basics. Let's break it down.

## What Are Stocks?

When you buy a stock, you're buying a tiny piece of ownership in a company. If the company does well, your stock value goes up. If it struggles, your stock value goes down.

### Example:
- You buy 10 shares of Reliance at ₹2,000 each
- Total investment: ₹20,000
- If Reliance stock goes to ₹2,200, your investment is worth ₹22,000
- You made ₹2,000 profit (10% return)

## Key Market Terms

### Market Indices
- **Nifty 50:** Top 50 companies in India
- **Sensex:** Top 30 companies on BSE
- These indices show overall market performance

### Bull vs Bear Markets
- **Bull Market:** Prices going up, optimism high
- **Bear Market:** Prices going down, pessimism high
- Markets cycle between these phases

## Types of Investment Vehicles

### 1. Individual Stocks
- Direct ownership in companies
- Higher risk, higher potential reward
- Requires research and monitoring

### 2. Mutual Funds
- Pool money from many investors
- Professional fund manager invests for you
- Diversification reduces risk
- Perfect for beginners

### 3. ETFs (Exchange Traded Funds)
- Like mutual funds but trade like stocks
- Usually track an index (like Nifty 50)
- Lower fees than mutual funds
- Good for passive investing

## How to Start

1. **Open a Demat Account** - Zerodha, Upstox, Angel One
2. **Start with SIPs** - Systematic Investment Plans in mutual funds
3. **Learn gradually** - Don't put all money at once
4. **Stay consistent** - Market timing is nearly impossible

Remember: The stock market is not gambling if you invest systematically with a long-term view.`,
    takeaways: [
      "Stocks represent ownership in companies",
      "Mutual funds offer diversification for beginners",
      "Markets cycle between bull and bear phases",
      "Start with SIPs and learn gradually"
    ],
  },
  {
    number: 14,
    level: "Intermediate" as ChapterLevel,
    title: "Passive Investing with Index Funds",
    description: "The simple, effective strategy that beats most active funds over the long term.",
    readTime: "20 min",
    content: `# Passive Investing with Index Funds

John Bogle, founder of Vanguard, revolutionized investing with a simple idea: instead of trying to beat the market, just buy the whole market. This is called passive investing.

## What Are Index Funds?

Index funds simply track a market index like Nifty 50 or Sensex. If Nifty goes up 10%, your index fund goes up 10%. If it goes down 5%, your fund goes down 5%.

### Benefits of Index Funds:
- **Low costs:** Expense ratios as low as 0.1-0.5%
- **Diversification:** You own pieces of 50-500 companies
- **Simplicity:** No need to research fund managers
- **Consistency:** Matches market returns over time

## Why Index Funds Beat Active Funds

Studies show that 80-90% of actively managed funds fail to beat the index over 10+ years. Why?

1. **High fees eat returns** - Active funds charge 1-2.5% annually
2. **Manager risk** - What if your star manager leaves?
3. **Market efficiency** - Hard to consistently find undervalued stocks

## SIP Strategy with Index Funds

**Systematic Investment Plan (SIP)** is perfect for index fund investing:

- Invest fixed amount monthly (₹1,000, ₹5,000, ₹10,000)
- Rupee cost averaging smooths out volatility
- Removes emotion from investing
- Builds discipline

### Example SIP Journey:
- ₹5,000/month SIP in Nifty 50 Index Fund
- 15% average annual return
- After 20 years: ₹61 lakh invested becomes ₹3.04 crore

## Popular Index Funds in India

1. **UTI Nifty 50 Index Fund**
2. **ICICI Prudential Nifty 50 Index Fund**
3. **SBI Nifty 50 Index Fund**
4. **Motilal Oswal Nifty 500 Fund**

Look for funds with lowest expense ratios and good tracking accuracy.

The beauty of index investing: It's boring, and that's exactly why it works.`,
    takeaways: [
      "Index funds track market indices like Nifty 50",
      "They beat 80-90% of active funds over long term",
      "Low costs and simplicity are key advantages",
      "SIP investing removes emotion and builds discipline"
    ],
  },
  {
    number: 15,
    level: "Intermediate" as ChapterLevel,
    title: "Active Investing vs Value Investing",
    description: "Understanding different investment philosophies and when to use each approach.",
    readTime: "25 min",
    content: `# Active Investing vs Value Investing

While passive investing works for most people, some investors prefer active strategies. Let's explore the main approaches.

## Active Investing

Active investing means trying to beat the market through:
- Stock picking
- Market timing
- Sector rotation
- Technical analysis

### Challenges:
- Requires significant time and research
- Higher transaction costs
- Emotional decision making
- Most active investors underperform the market

## Value Investing

Value investing, popularized by Benjamin Graham and Warren Buffett, focuses on buying undervalued companies.

### Key Principles:
1. **Intrinsic Value** - What is the company really worth?
2. **Margin of Safety** - Buy below intrinsic value
3. **Long-term Perspective** - Hold for years, not months
4. **Quality Companies** - Strong fundamentals matter

### Value Investing Metrics:
- **P/E Ratio:** Price to Earnings
- **P/B Ratio:** Price to Book Value
- **Debt to Equity:** Financial health
- **ROE:** Return on Equity

## Growth Investing

Growth investors focus on companies with high growth potential:
- Revenue growing 15-20%+ annually
- Expanding market share
- Innovative products/services
- Strong management team

Examples: Technology companies, emerging market leaders

## Peter Lynch's Approach

Peter Lynch managed Fidelity Magellan Fund and achieved 29% annual returns for 13 years. His philosophy:

### "Buy What You Know"
- Invest in companies whose products you use
- If you love a restaurant chain, research their stock
- Local knowledge can be an advantage

### Categories of Stocks:
1. **Slow Growers** - Mature, stable companies
2. **Stalwarts** - Steady 10-12% growers
3. **Fast Growers** - 20-25% growth potential
4. **Cyclicals** - Tied to economic cycles
5. **Turnarounds** - Companies recovering from problems
6. **Asset Plays** - Undervalued assets

## Which Approach for You?

### Choose Passive/Index Investing If:
- You have limited time for research
- You want simplicity and low costs
- You believe markets are efficient
- You want to match market returns

### Consider Active Investing If:
- You enjoy research and analysis
- You have time to monitor investments
- You can control emotions
- You understand the risks

Remember: Even Warren Buffett recommends index funds for most investors. The key is knowing your own capabilities and limitations.`,
    takeaways: [
      "Active investing requires significant time and skill",
      "Value investing focuses on buying undervalued quality companies",
      "Growth investing targets high-growth potential companies",
      "Most investors are better served by passive index investing"
    ],
  },
  // Continue with remaining chapters (16-30) - adding basic structure for now
  {
    number: 16,
    level: "Intermediate" as ChapterLevel,
    title: "Evaluating Stocks like a Pro",
    description: "Learn to read financial statements and analyze companies like Warren Buffett.",
    readTime: "25 min",
    content: `# Evaluating Stocks like a Pro

Coming soon - detailed content on financial statement analysis, ratio analysis, and fundamental research techniques.`,
    takeaways: [
      "Learn to read annual reports and financial statements",
      "Focus on cash flow, not just profits",
      "Understand the business model and competitive advantages",
      "Use multiple valuation methods"
    ],
  },
  {
    number: 17,
    level: "Intermediate" as ChapterLevel,
    title: "Building a Diversified Portfolio",
    description: "Asset allocation strategies for different risk profiles and life stages.",
    readTime: "22 min",
    content: `# Building a Diversified Portfolio

Coming soon - detailed content on asset allocation, portfolio construction, and rebalancing strategies.`,
    takeaways: [
      "Diversification reduces risk without sacrificing returns",
      "Asset allocation is more important than stock selection",
      "Rebalance periodically to maintain target allocation",
      "Consider your age, goals, and risk tolerance"
    ],
  },
  {
    number: 18,
    level: "Intermediate" as ChapterLevel,
    title: "Real Estate and Gold",
    description: "Understanding traditional Indian investments and their role in modern portfolios.",
    readTime: "20 min",
    content: `# Real Estate and Gold

Coming soon - detailed content on real estate investing, gold as an asset class, and REITs.`,
    takeaways: [
      "Real estate requires significant capital and research",
      "Gold acts as an inflation hedge and portfolio diversifier",
      "REITs provide real estate exposure without large capital",
      "Consider liquidity needs before investing"
    ],
  },
  {
    number: 19,
    level: "Intermediate" as ChapterLevel,
    title: "Crypto – Gamble or Opportunity?",
    description: "Understanding cryptocurrency, blockchain, and how to approach this volatile asset class.",
    readTime: "18 min",
    content: `# Crypto – Gamble or Opportunity?

Coming soon - detailed content on cryptocurrency basics, blockchain technology, and risk management.`,
    takeaways: [
      "Cryptocurrency is highly volatile and speculative",
      "Only invest what you can afford to lose completely",
      "Understand the technology before investing",
      "Treat crypto as a small portfolio allocation"
    ],
  },
  {
    number: 20,
    level: "Intermediate" as ChapterLevel,
    title: "Behavioral Biases in Investing",
    description: "How psychology affects investment decisions and strategies to overcome emotional investing.",
    readTime: "20 min",
    content: `# Behavioral Biases in Investing

Coming soon - detailed content on common investment biases and how to overcome them.`,
    takeaways: [
      "Emotions are the biggest enemy of good investing",
      "Common biases include overconfidence and herd mentality",
      "Systems and rules help overcome emotional decisions",
      "Regular review and rebalancing maintain discipline"
    ],
  },
  // Advanced Level (Days 21-30)
  {
    number: 21,
    level: "Advanced" as ChapterLevel,
    title: "Financial Statement Analysis",
    description: "Deep dive into balance sheets, P&L statements, and cash flows to understand company fundamentals.",
    readTime: "30 min",
    content: `# Financial Statement Analysis

Coming soon - comprehensive guide to analyzing financial statements like a professional investor.`,
    takeaways: [
      "Master the three core financial statements",
      "Focus on cash flow, not just reported profits",
      "Look for consistent, high-quality earnings",
      "Always consider industry context and competitive position"
    ],
  },
  {
    number: 22,
    level: "Advanced" as ChapterLevel,
    title: "Understanding Market Cycles",
    description: "How markets move in cycles and why timing the market is nearly impossible.",
    readTime: "25 min",
    content: `# Understanding Market Cycles

Coming soon - detailed analysis of market cycles, bubbles, and crashes.`,
    takeaways: [
      "Markets are cyclical but unpredictable in timing",
      "Bubbles and crashes are part of market history",
      "Dollar-cost averaging smooths out volatility",
      "Stay invested through complete market cycles"
    ],
  },
  {
    number: 23,
    level: "Advanced" as ChapterLevel,
    title: "Long-Term Wealth Planning",
    description: "Retirement planning, estate planning, and building generational wealth.",
    readTime: "25 min",
    content: `# Long-Term Wealth Planning

Coming soon - comprehensive retirement and estate planning strategies.`,
    takeaways: [
      "Start retirement planning early to leverage compounding",
      "Diversify across multiple retirement accounts",
      "Estate planning protects your family's future",
      "Regular review and adjustment is essential"
    ],
  },
  {
    number: 24,
    level: "Advanced" as ChapterLevel,
    title: "Taxation Demystified",
    description: "Understanding tax implications of different investments and tax optimization strategies.",
    readTime: "22 min",
    content: `# Taxation Demystified

Coming soon - comprehensive guide to investment taxation in India.`,
    takeaways: [
      "Understand tax implications before investing",
      "Long-term capital gains are taxed favorably",
      "Tax-saving investments have lock-in periods",
      "Professional advice may be worth the cost"
    ],
  },
  {
    number: 25,
    level: "Advanced" as ChapterLevel,
    title: "Estate Planning and Legacy",
    description: "Protecting your wealth and creating a lasting legacy for future generations.",
    readTime: "20 min",
    content: `# Estate Planning and Legacy

Coming soon - detailed guide to wills, trusts, and wealth transfer strategies.`,
    takeaways: [
      "Everyone needs a will, regardless of wealth level",
      "Trusts can provide tax benefits and control",
      "Regular updates reflect life changes",
      "Professional legal advice is recommended"
    ],
  },
  {
    number: 26,
    level: "Advanced" as ChapterLevel,
    title: "Multiple Income Streams",
    description: "Building diverse income sources beyond your primary job for financial security.",
    readTime: "25 min",
    content: `# Multiple Income Streams

Coming soon - strategies for building passive and active income streams.`,
    takeaways: [
      "Multiple income streams provide financial security",
      "Start with skills you already have",
      "Passive income requires upfront investment",
      "Scale gradually while maintaining quality"
    ],
  },
  {
    number: 27,
    level: "Advanced" as ChapterLevel,
    title: "Advanced Risk Management",
    description: "Sophisticated strategies for managing financial and investment risks.",
    readTime: "22 min",
    content: `# Advanced Risk Management

Coming soon - comprehensive risk management strategies for advanced investors.`,
    takeaways: [
      "Risk management is more important than returns",
      "Diversification is the only free lunch in investing",
      "Regular rebalancing maintains risk levels",
      "Insurance is a crucial part of risk management"
    ],
  },
  {
    number: 28,
    level: "Advanced" as ChapterLevel,
    title: "Decision-Making Models",
    description: "Mental models and frameworks for making better financial decisions.",
    readTime: "20 min",
    content: `# Decision-Making Models

Coming soon - Charlie Munger's mental models applied to finance.`,
    takeaways: [
      "Mental models improve decision-making quality",
      "Inversion helps avoid major mistakes",
      "Checklists prevent emotional decisions",
      "Continuous learning is essential"
    ],
  },
  {
    number: 29,
    level: "Advanced" as ChapterLevel,
    title: "Financial Discipline and Minimalism",
    description: "Advanced mindset strategies for maintaining financial discipline long-term.",
    readTime: "18 min",
    content: `# Financial Discipline and Minimalism

Coming soon - advanced strategies for maintaining financial discipline.`,
    takeaways: [
      "Discipline is more important than intelligence",
      "Minimalism can boost savings rates",
      "Avoid lifestyle inflation at all costs",
      "Focus on experiences over possessions"
    ],
  },
  {
    number: 30,
    level: "Advanced" as ChapterLevel,
    title: "Your Master Plan for Financial Freedom",
    description: "Putting it all together - your complete roadmap to financial independence.",
    readTime: "30 min",
    content: `# Your Master Plan for Financial Freedom

Coming soon - comprehensive action plan for achieving financial independence.`,
    takeaways: [
      "Financial freedom is achievable with the right plan",
      "Consistency matters more than perfection",
      "Regular review and adjustment is crucial",
      "Start today, not tomorrow"
    ],
  }
];
