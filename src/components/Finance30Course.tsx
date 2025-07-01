import React, { useState } from "react";
import { BookOpen } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

// Chapter level theme colors
const levelColors: Record<
  "Beginner" | "Intermediate" | "Advanced",
  string
> = {
  Beginner: "from-green-100 to-green-200 border-green-400",
  Intermediate: "from-yellow-100 to-yellow-200 border-yellow-400",
  Advanced: "from-red-100 to-red-200 border-red-400",
};

type ChapterLevel = "Beginner" | "Intermediate" | "Advanced";

// Chapters with numbers, levels, titles, and descriptions
const chapters = [
  {
    number: 1,
    level: "Beginner" as ChapterLevel,
    title: "Why Financial Education Matters More Than Ever",
    description:
      "Explore why money isn't taught in schools, the cost of financial ignorance, and how mindsets shape our wealth journey.",
    content: `
Money is one of life's most important skills, yet most schools do not teach it. "Rich Dad Poor Dad" and "The Barefoot Investor" stress that the lack of financial literacy keeps people trapped in cycles of debt, missed opportunities, or dependency. 

**The Cost of Financial Ignorance:** Not knowing how to manage money often leads to poor decisions—overborrowing, under-saving, or emotional spending. Financial education empowers you to avoid mistakes, build assets, and seize opportunities.

**Mindsets:** Are you behaving as:
- An *Employee* (seeking stability/regular paycheck)?
- An *Entrepreneur* (looking to build and grow)?
- An *Investor* (seeking to make your money work for you)?

Most people internalize only one perspective—but understanding all three expands your options.
    `,
    takeaways: [
      "Recognize the impact of financial education on your future.",
      "Consider your own mindset about money and career.",
      "Reflect: Are you open to acting like an entrepreneur or investor?",
    ],
  },
  {
    number: 2,
    level: "Beginner" as ChapterLevel,
    title: "The Psychology Behind Money",
    description:
      "Understand how emotions like fear and greed can distort money decisions, and why patience trumps intelligence.",
    content: `
Morgan Housel ("The Psychology of Money") teaches that most financial decisions are emotional, not rational. Fear and greed are common drivers. Doing well with money is more about how you behave than what you know—patience, self-control, and a long-term mindset beat IQ.

Understanding your biases—envy, impatience, fear—helps you act in your own best interests.

**Building Patience:** The market rewards those who wait and penalizes those who panic. Cultivate patience through habits (e.g., automatic investing), setting goals, and learning from your emotional triggers.
    `,
    takeaways: [
      "Recognize your emotional habits around money.",
      "Practice patience, especially during market swings.",
      "Remember: Long-term thinking builds wealth.",
    ],
  },
  {
    number: 3,
    level: "Beginner" as ChapterLevel,
    title: "Income vs Expenses, Assets vs Liabilities",
    description:
      "Learn the simplest formula for wealth: build assets, reduce liabilities. Real examples clarify what truly makes you 'rich.'",
    content: `
"Rich Dad Poor Dad" emphasizes the core difference between assets (things that put money in your pocket, like stocks, bonds, or rental homes) and liabilities (things that take money out, like car loans or credit card bills).

**Key Formula:** Wealth = Assets − Liabilities

Wealth isn't about luxury—it’s about freedom and choices. Rich people focus on acquiring assets, not just increasing their income.

**Real Examples:**
- Asset: A house you rent out for income.
- Liability: A car loan with ongoing payments.

Start tracking your net worth—list all assets and liabilities for a true picture.
    `,
    takeaways: [
      "Distinguish between assets and liabilities in your life.",
      "Track your net worth over time.",
      "Remember: Wealth means freedom, not just money.",
    ],
  },
  {
    number: 4,
    level: "Beginner" as ChapterLevel,
    title: "Saving Money Like the Millionaire Next Door",
    description:
      "Discover proven habits of frugal millionaires and learn how to live below your means without sacrificing your goals.",
    content: `
"The Millionaire Next Door" shows that most millionaires are ordinary people who mastered the habit of living below their means. They drive used cars, avoid debt, and prioritize savings.

**Key Strategies:**
- Pay yourself first—automatically move money to savings or investments before spending on wants.
- Avoid lifestyle inflation—don't increase spending every time income rises.
- Study case studies of real millionaires: they're regular people making smart choices.
    `,
    takeaways: [
      "Automate your savings.",
      "Avoid lifestyle inflation.",
      "Look at frugality as a strategy, not a sacrifice.",
    ],
  },
  {
    number: 5,
    level: "Beginner" as ChapterLevel,
    title: "Budgeting with Purpose",
    description:
      "Master practical budgeting using modern systems and templates, including the Conscious Spending Plan by Ramit Sethi.",
    content: `
Proper budgeting is not about restriction—it's about clarity and choice. "I Will Teach You To Be Rich" offers the *Conscious Spending Plan*:

- Allocate money to needs, savings/investments, and guilt-free fun (yes, fun!).
- Budget templates help you map out priorities.
- Modern apps can automate tracking, but the method matters most.

Focus less on penny-pinching and more on assigning every dollar a job that matches your values.
    `,
    takeaways: [
      "Try budgeting with the Conscious Spending Plan template.",
      "Automate your budget using apps or spreadsheets.",
      "Review and update your budget monthly.",
    ],
  },
  {
    number: 6,
    level: "Beginner" as ChapterLevel,
    title: "Creating a Personal Financial Plan",
    description:
      "Learn how to set big financial goals aligned with your life's vision and core values, and why systems beat motivation.",
    content: `
Goal setting gives your financial life purpose. Start by reflecting: what does money mean to you? Is it freedom, security, adventure, or legacy?

**Steps:**
1. Write down your money values.
2. Set clear, realistic goals (short and long-term).
3. Build systems—automatic savings, reminders, checkpoints—that work even when you lack motivation.

"Your Money or Your Life" insists that systems, not willpower, create lasting change.
    `,
    takeaways: [
      "Set at least one short-term and one long-term money goal.",
      "Write down your money values.",
      "Create an automatic system to move toward your goal.",
    ],
  },
  {
    number: 7,
    level: "Beginner" as ChapterLevel,
    title: "Understanding Banking and Credit",
    description:
      "Get to grips with accounts, cards, and credit scores—plus common debt traps and how to avoid them.",
    content: `
A healthy relationship with banks and credit can help or hurt your financial future.

- Know your account options (savings, checking/current, FDs, etc.) and pick the right ones.
- Learn how credit scores are built and why they matter.
- Avoid the most common debt traps: high-interest cards, hidden fees, borrowing for consumption.

Follow the golden rules: automate bill payments, pay credit cards in full, and use credit to build—not destroy—wealth.
    `,
    takeaways: [
      "Check your credit score this week.",
      "List your bank accounts and their purposes.",
      "Make a plan to pay down bad debt.",
    ],
  },
  {
    number: 8,
    level: "Beginner" as ChapterLevel,
    title: "Building an Emergency Fund",
    description:
      "Why everyone needs a rainy-day fund, how big it should be, and where you should keep it for peace of mind.",
    content: `
Life is unpredictable—medical issues, job loss, car trouble. An emergency fund cushions life's blows and reduces financial anxiety.

**How much?**
- Target 3–6 months’ expenses (more if self-employed or with dependents).

**Where?**
- In a liquid, easily accessible account, but not one tied to daily spending (to avoid temptation).

Having this fund brings emotional security and makes risk-taking (like investing or career moves) safer.
    `,
    takeaways: [
      "Open a separate emergency fund account.",
      "Set an automatic deposit, even if small.",
      "Celebrate every milestone toward your goal.",
    ],
  },
  {
    number: 9,
    level: "Beginner" as ChapterLevel,
    title: "Insurance Simplified",
    description:
      "Clear explanations of health, life, and auto insurance—including how not to overpay or under-insure.",
    content: `
Insurance is a financial safety net, not an investment.

- Health insurance is crucial for medical emergencies; pick plans with sufficient coverage for your needs (check exclusions).
- Term life insurance protects your dependents—avoid savings-linked or ULIP policies.
- Auto and accidental insurance shield against costly surprises.

Follow "The Barefoot Investor": Only insure what financially ruins you. Don’t pay for unnecessary extras.
    `,
    takeaways: [
      "Review your current insurance coverage.",
      "Identify gaps in your insurance portfolio.",
      "Buy only the insurance you truly need.",
    ],
  },
  {
    number: 10,
    level: "Beginner" as ChapterLevel,
    title: "Financial Tools and Budgeting Apps",
    description:
      "Set up your digital money toolkit—apps that automate, track, and simplify every part of your finances.",
    content: `
Embrace technology to simplify your financial management.

**Best Apps:**
- Expense trackers: Walnut, YNAB, Mint, or local banking apps.
- Investments: Zerodha, Groww, Robinhood (based on your region).
- Automation tools: Use standing instructions or auto-SIP to never miss investing.

Create your dashboard—keep all your numbers at your fingertips.
    `,
    takeaways: [
      "Download and set up at least one financial app.",
      "Automate your monthly savings/investments.",
      "Review your dashboard weekly.",
    ],
  },
  // Intermediate Level
  {
    number: 11,
    level: "Intermediate" as ChapterLevel,
    title: "Introduction to Investing",
    description:
      "Why just saving isn't enough—learn investing basics, risk, and building your first portfolio.",
    content: `
Saving is safe—but low interest rates and inflation mean you must also invest to grow wealth over time.

**Key Types:**
- Saving = preservation, no/little growth.
- Investing = take measured risks for returns above inflation.
- Speculating = high risk, hope for high reward (not recommended for most).

**Simple portfolio:** Start with a mutual fund or a balanced mix of stock/bond index funds.

Understand your risk tolerance before investing anywhere.
    `,
    takeaways: [
      "See if your money is losing value to inflation.",
      "Try a basic model portfolio (even if as an exercise).",
      "Reflect on your risk appetite.",
    ],
  },
  {
    number: 12,
    level: "Intermediate" as ChapterLevel,
    title: "The Magic of Compounding",
    description:
      "Experience the '8th wonder of the world'—see how small amounts, invested early, snowball thanks to compound interest.",
    content: `
Compounding is when your gains themselves earn more gains—works in savings, investments, and even debts (with interest against you).

**Examples:**
- Invest ₹5,000/month at 10% annual return for 25 years = ₹66 lakhs+
- Start early: A 25-year-old who invests ₹1 lakh/year until age 35 (then stops!) can end up richer at 60 than someone who saves the same starting age 35–60.

Patience and consistency are your greatest friends.
    `,
    takeaways: [
      "Use an online compound interest calculator.",
      "Commit to investing early—even if the amount is small.",
      "Let time multiply your money.",
    ],
  },
  {
    number: 13,
    level: "Intermediate" as ChapterLevel,
    title: "Stock Market Basics",
    description:
      "Grasp the fundamentals: stocks, mutual funds, ETFs, and bonds. Learn what market indices mean and cycles.",
    content: `
Stocks = ownership in companies. Mutual funds and ETFs let you invest in many stocks/bonds at once. Bonds are loans to companies or governments, with fixed or floating returns.

**Indices:** Market benchmarks like Nifty 50, Sensex, S&P 500.

**Cycles:** Bull market (up), bear market (down), sideways.

Diversification and a long-term view reduce risk.
    `,
    takeaways: [
      "Try tracking an index (e.g., Nifty 50).",
      "Understand which instrument matches your risk profile.",
      "Diversify instead of 'betting the farm' on one idea.",
    ],
  },
  {
    number: 14,
    level: "Intermediate" as ChapterLevel,
    title: "Passive Investing with Index Funds",
    description:
      "Learn why buying and holding index funds beats most active strategies—plus how to start SIPs and DCA.",
    content: `
"The Little Book of Common Sense Investing" (Bogle) and the 'Bogleheads' believe most people should stick to index funds—broad ownership, low fees, very reliable.

**Simple tactics:** Start a SIP (Systematic Investment Plan), invest the same amount every period (DCA: Dollar/rupee-Cost Averaging).

Passive investors statistically outperform most active funds in the long run.
    `,
    takeaways: [
      "Find and compare index fund options.",
      "Start a dummy SIP calculation for practice.",
      "Read about Bogle's philosophy.",
    ],
  },
  {
    number: 15,
    level: "Intermediate" as ChapterLevel,
    title: "Active Investing vs Value Investing",
    description:
      "Weigh the differences: growth, value, and active styles—understand legendary investor approaches.",
    content: `
Active investing: Trying to beat the market—stock picking, timing, trading.

Value investing: Finding underpriced quality companies and holding for the long term (Graham, Buffett).

Growth investing: Betting on future earnings and disruptive ideas (Peter Lynch, "One Up On Wall Street").

Most investors should keep active efforts small unless they're willing to study deeply.
    `,
    takeaways: [
      "Read about Graham vs Lynch's investing style.",
      "Examine your own tendency to chase returns.",
      "Remember: Outperforming the market is hard—even for pros.",
    ],
  },
  {
    number: 16,
    level: "Intermediate" as ChapterLevel,
    title: "Evaluating Stocks like a Pro",
    description:
      "How pros read financial statements, analyze companies, and look beyond numbers for investing signals.",
    content: `
Pro investors read financial statements: balance sheets, cash flow, income.

Key numbers: Revenue, profits, debt, free cash flow, PE ratio, ROE, etc.

But also study: Management quality, innovation, business narrative, and industry trends.

Don’t get lost in the numbers—stories and people matter, too.
    `,
    takeaways: [
      "Download and read a company's annual report.",
      "Look up core ratios online and what they mean.",
      "Practice writing a simple 'buy/sell' thesis—not just numbers.",
    ],
  },
  {
    number: 17,
    level: "Intermediate" as ChapterLevel,
    title: "Building a Diversified Portfolio",
    description:
      "Learn asset allocation between stocks, bonds, gold, and more—and why this is key to managing risk.",
    content: `
Diversifying means "don't put all your eggs in one basket." A good portfolio mixes multiple asset classes: stocks, bonds/debt, real estate, gold, REITs, cash, etc.

**Quiz:** What's your risk tolerance? Conservative (more bonds), aggressive (more stocks), or balanced?

Ideas from "A Random Walk Down Wall Street": Even the pros can't predict the future—so diversify broadly.
    `,
    takeaways: [
      "Sketch your target allocation today (percentages).",
      "Take a risk tolerance quiz online.",
      "Study the historical performance of different assets.",
    ],
  },
  {
    number: 18,
    level: "Intermediate" as ChapterLevel,
    title: "Real Estate and Gold",
    description:
      "Should you buy or rent? Is gold a real asset? Understand REITs, SGBs, and smart property moves.",
    content: `
Real estate is familiar, but illiquid and capital-intensive. Weigh rent-versus-buy math carefully.

Gold: Deeply valued in India and as a hedge, but not income-producing.

Other options:
- REITs (Real Estate Investment Trusts): Pooled, small-ticket exposure.
- SGBs (Sovereign Gold Bonds): Earn interest and gold price returns with no physical gold hassles.

Ask: Does the asset suit your goals, risk profile, and liquidity needs?
    `,
    takeaways: [
      "Compare rent-vs-buy in your city.",
      "Learn why gold is a hedge, not a growth asset.",
      "Try simulating REIT or SGB investments online.",
    ],
  },
  {
    number: 19,
    level: "Intermediate" as ChapterLevel,
    title: "Crypto – Gamble or Opportunity?",
    description:
      "Get the basics of crypto: what it really is, risks, and how to avoid scams—smart allocation is everything.",
    content: `
Cryptocurrencies like Bitcoin and Ethereum can be high risk/high reward. Blockchain may revolutionize some industries—but regulation, fraud, and price swings are real dangers.

**Smart Allocation:** If you want to try crypto:
- Treat it as "venture capital" in your portfolio—small stake, high risk.
- Never invest what you can't afford to lose.

Learn to spot signs of scams, hype, and regulatory grey zones.
    `,
    takeaways: [
      "Study Bitcoin, Ethereum, and blockchain basics.",
      "Never keep more than 1–5% portfolio in crypto.",
      "Check government advisories before investing.",
    ],
  },
  {
    number: 20,
    level: "Intermediate" as ChapterLevel,
    title: "Behavioral Biases in Investing",
    description:
      "Learn to spot the most common mental pitfalls—anchoring, overconfidence, herd thinking, and more.",
    content: `
"Thinking, Fast and Slow" by Daniel Kahneman teaches us that we're full of biases: anchoring (fixating on one piece of info), overconfidence, herd mentality, and loss aversion are the most dangerous for investors.

Learning to spot and check these can save you from costly mistakes.

Build checklists for big decisions and always pause before acting on 'hot tips'.
    `,
    takeaways: [
      "Read about Kahneman’s key concepts.",
      "Observe any biases in your own past decisions.",
      "Try making an investment checklist.",
    ],
  },
  // Advanced Level
  {
    number: 21,
    level: "Advanced" as ChapterLevel,
    title: "Financial Statement Analysis",
    description:
      "Deep dive into balance sheets, P&L, cash flows—with lessons from financial legends like Buffett.",
    content: `
True mastery: learn to read and interpret company financials like Warren Buffett.

**Statements to study:**
- Balance sheet: What do they own (assets) and owe (liabilities)?
- P&L: Are profits rising? Margins improving?
- Cash flow: Are they generating or burning cash?

Buffett focuses on intrinsic value, not just current price.

Practice: Download an annual report and analyze it yourself.
    `,
    takeaways: [
      "Download a real annual report and read the statements.",
      "Focus on understanding cash flow.",
      "Look up the term 'intrinsic value' and why it matters.",
    ],
  },
  {
    number: 22,
    level: "Advanced" as ChapterLevel,
    title: "Understanding Market Cycles",
    description:
      "Markets move in cycles—boom, bust, recovery. Why can't we time them, and how do we stay smart?",
    content: `
Markets move in unpredictable cycles—up (boom), down (bust), sideways (consolidation). The timing is impossible to predict.

"A Random Walk Down Wall Street" teaches that nobody can reliably time the market. Instead, have a plan that works regardless, and focus on your own goals rather than media noise.

Rebalance portfolios as needed; stay diversified!
    `,
    takeaways: [
      "Plot a recent boom-bust cycle (Sensex/Nifty/S&P 500 etc).",
      "Read about what causes cycles historically.",
      "Don’t act on fear/greed headlines.",
    ],
  },
  {
    number: 23,
    level: "Advanced" as ChapterLevel,
    title: "Long-Term Wealth Planning",
    description:
      "Retirement isn't accidental—build for it using EPF, NPS, PPF, and mutual funds. See compounding at work.",
    content: `
Long-term plans require long-term thinking. For retirement in India, understand instruments like EPF, NPS, PPF, and annuities. Calculate the future value of your savings using a retirement calculator.

Compounding across decades can turn small regular contributions into real wealth. Diversify between equity and debt, increase contributions with income, and start now.

Don’t wait for “the right time”—the best time is now.
    `,
    takeaways: [
      "Try an online retirement calculator.",
      "List the retirement accounts available to you.",
      "Set an investment increase reminder tied to salary raises.",
    ],
  },
  {
    number: 24,
    level: "Advanced" as ChapterLevel,
    title: "Taxation Demystified",
    description:
      "The basics of income tax, capital gains, and deductions—plus tips to legally reduce your tax bill.",
    content: `
Understanding taxes is essential for building, keeping, and growing wealth. In India, learn about income tax slabs, capital gains, Section 80C deductions (investments), and other tax-saving opportunities.

You can do taxes yourself using government portals, or hire a CA for complex situations.

Keep receipts, automate payments, and avoid last-minute stress.
    `,
    takeaways: [
      "Read about Section 80C and capital gains in your country.",
      "Start an Excel or Google Sheet for your income/expenses.",
      "Decide if you should get professional help or do DIY taxes.",
    ],
  },
  {
    number: 25,
    level: "Advanced" as ChapterLevel,
    title: "Estate Planning and Legacy",
    description:
      "Plan your legacy—why you need a will, how to create generational wealth, and what top investors teach.",
    content: `
Estate planning is about more than money: it's about family, values, and future security.

- Write a simple will to protect your loved ones.
- Consider gifting, trusts, or education funds to ensure generational benefits.
- Poor Charlie’s Almanack (Charlie Munger) champions simplicity in legacy planning.

Act early; avoid future legal or emotional mess.
    `,
    takeaways: [
      "Draft the basics of a will.",
      "Read about trusts and inheritance laws.",
      "Reflect on the family values you want to pass on.",
    ],
  },
  {
    number: 26,
    level: "Advanced" as ChapterLevel,
    title: "Multiple Income Streams",
    description:
      "Explore side hustles, entrepreneurship, investing, and consulting—case studies reveal time/skill trade-offs.",
    content: `
Building wealth rarely depends on one source of income.

Consider:
- Freelancing or part-time work,
- Creating a business,
- Investing,
- Consulting, or
- Monetizing a skill (teaching).

Real case studies show how entrepreneurs juggle time, money, and risk for better security and growth.
    `,
    takeaways: [
      "List possible side-income ideas that fit your skills.",
      "Read one freelancer or entrepreneur profile online.",
      "Brainstorm a plan to test a new income stream.",
    ],
  },
  {
    number: 27,
    level: "Advanced" as ChapterLevel,
    title: "Advanced Risk Management",
    description:
      "Go beyond basics: Diversify for emotional and financial resilience. Learn hedging and insurance tactics.",
    content: `
Ray Dalio and top investors don't just seek returns—they obsess over managing risk.

**Tactics:**
- Diversify fully.
- Use portfolio insurance techniques, like options for large portfolios.
- Hedge with assets that move independently (e.g., gold, bonds).

Emotional risk is as real as financial: don’t oversize bets or stake more than you can afford to lose.
    `,
    takeaways: [
      "List all major risks in your current investments.",
      "Research how diversification reduces risk.",
      "Read about Ray Dalio's 'All Weather' strategy.",
    ],
  },
  {
    number: 28,
    level: "Advanced" as ChapterLevel,
    title: "Decision-Making Models",
    description:
      "Use Munger's mental models and first-principles thinking to make better money choices. Simplicity wins.",
    content: `
Charlie Munger’s mental models (checklists, inversion, probabilistic thinking) help avoid big investing mistakes.

- Invert: Always ask "What could cause this to fail?" before making big moves.
- First Principles: Ask what has to be *true* for success—strip away myths.
- Simplicity: A clear, simple process is more powerful than a complex one.

Experiment using models in daily decisions.
    `,
    takeaways: [
      "Read a summary of Munger’s mental models.",
      "Try inverting a financial decision.",
      "Write your own investing decision checklist.",
    ],
  },
  {
    number: 29,
    level: "Advanced" as ChapterLevel,
    title: "Financial Discipline and Minimalism",
    description:
      "Master your desires. Avoid lifestyle creep and use minimalist principles for mental peace and freedom.",
    content: `
Discipline = sticking to your plan, regardless of temptation. Minimalism isn't deprivation—it's freedom from clutter and impulse.

"Your Money or Your Life" and "The Psychology of Money" teach: the less you want, the richer you become (by default). 

Revisit your goals, cut out non-essentials, and focus spending only on what truly matters.
    `,
    takeaways: [
      "Identify expenses to cut without loss of joy.",
      "Reflect on what gives you real fulfillment.",
      "Make minimalism a regular review (not a one-time purge).",
    ],
  },
  {
    number: 30,
    level: "Advanced" as ChapterLevel,
    title: "Your Master Plan for Financial Freedom",
    description:
      "Tie it all together. Create your 1–10 year roadmap, a money operating system, and vision board for your future.",
    content: `
By now you have seen the building blocks of wealth: mindset, intentional action, diversified investing, risk management, and discipline.

**Steps to build your 'Money OS':**
- Write your 1-year, 5-year, and 10-year goals.
- Review your financial dashboard monthly.
- Keep learning: bookmark books, follow honest finance voices, revisit your lessons.

Make your vision board, update it, and tell a friend—accountability increases results!
    `,
    takeaways: [
      "Create a vision board for finances.",
      "List your next steps for the coming year.",
      "Commit to a regular review rhythm.",
    ],
  },
];

export const Finance30Course: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("0");

  return (
    <section
      id="learn"
      className="max-w-4xl mx-auto py-12 px-2 md:px-4"
    >
      <div className="flex items-center space-x-3 mb-8">
        <BookOpen className="w-8 h-8 text-blue-600" />
        <h2 className="text-3xl font-bold">30-Day Finance Course</h2>
      </div>
      <p className="mb-8 text-lg">
        Learn fundamental and advanced financial principles step by step. This 30-day learning path draws on classic books including <b>Rich Dad Poor Dad</b>, <b>Think and Grow Rich</b>, <b>The Intelligent Investor</b>, and <b>The Psychology of Money</b>.
      </p>
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        orientation="vertical"
        className="flex flex-col md:flex-row w-full gap-4"
      >
        {/* Sidebar Navigation */}
        <TabsList className="flex flex-row md:flex-col md:min-w-72 space-x-2 md:space-x-0 md:space-y-3 bg-transparent px-0">
          {chapters.map((ch, i) => {
            const levelColor = levelColors[ch.level];
            return (
              <TabsTrigger
                key={ch.number}
                value={i.toString()}
                className={`w-full flex-col items-start px-5 py-2 rounded-lg border-l-4 bg-gradient-to-br ${levelColor} text-left whitespace-normal shadow-sm focus:outline-none ring-0`}
                style={{
                  minHeight: "4.2rem",
                  alignItems: "flex-start",
                  display: "flex",
                  gap: "0.4rem",
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-white/80 p-1 border border-gray-200 text-gray-700 flex items-center justify-center mr-2 shadow">
                    <BookOpen size={18} className={
                      ch.level === "Beginner"
                        ? "text-green-600"
                        : ch.level === "Intermediate"
                        ? "text-yellow-600"
                        : "text-red-600"
                    } />
                  </div>
                  <span
                    className={`font-semibold text-sm uppercase tracking-wider ${
                      ch.level === "Beginner"
                        ? "text-green-700"
                        : ch.level === "Intermediate"
                        ? "text-yellow-800"
                        : "text-red-700"
                    }`}
                  >
                    {ch.level} · Day {ch.number}
                  </span>
                </div>
                <span className="font-bold text-base">{ch.title}</span>
                <span className="text-xs text-gray-600 mt-1">{ch.description}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Chapter Main Content */}
        <div className="flex-1">
          {chapters.map((ch, i) => (
            <TabsContent key={i} value={i.toString()} className="w-full">
              <Card>
                <CardHeader>
                  <CardTitle className={`text-2xl mb-2`}>
                    <span className="font-semibold mr-2">Day {ch.number}.</span>
                    <span>{ch.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-blue max-w-none mb-6 whitespace-pre-line">
                    {ch.content.trim()}
                  </div>
                  <h4 className="font-semibold mt-8 mb-2">Takeaways</h4>
                  <ul className="list-disc ml-6 space-y-1">
                    {ch.takeaways.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </section>
  );
};

export default Finance30Course;

