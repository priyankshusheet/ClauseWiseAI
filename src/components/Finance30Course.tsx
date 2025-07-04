
import React, { useState } from "react";
import { BookOpen, ChevronRight, Clock, Users, ArrowLeft, ArrowRight, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Chapter level theme colors
const levelColors: Record<"Beginner" | "Intermediate" | "Advanced", string> = {
  Beginner: "from-green-500 to-emerald-600",
  Intermediate: "from-yellow-500 to-orange-600", 
  Advanced: "from-red-500 to-rose-600",
};

const levelIcons: Record<"Beginner" | "Intermediate" | "Advanced", string> = {
  Beginner: "🌱",
  Intermediate: "🚀", 
  Advanced: "🎯",
};

type ChapterLevel = "Beginner" | "Intermediate" | "Advanced";

// Complete 30-day course chapters
const chapters = [
  // Beginner Level (Days 1-10)
  {
    number: 1,
    level: "Beginner" as ChapterLevel,
    title: "Why Financial Education Matters More Than Ever",
    description: "Why schools don't teach money, the cost of financial ignorance, and mindset differences between employees, entrepreneurs, and investors.",
    readTime: "15 min",
    content: `# Why Financial Education Matters More Than Ever

Money is one of life's most important skills, yet most schools do not teach it. "Rich Dad Poor Dad" and "The Barefoot Investor" stress that the lack of financial literacy keeps people trapped in cycles of debt, missed opportunities, or dependency.

## Why Schools Don't Teach Money

The traditional education system was designed to create employees, not entrepreneurs or investors. Schools teach us to work for money, but not how to make money work for us. This creates a fundamental gap in our understanding of wealth building.

## The Cost of Financial Ignorance

Not knowing how to manage money often leads to:
- Poor financial decisions and overborrowing
- Under-saving for the future
- Emotional spending without purpose
- Missing investment opportunities
- Dependency on others for financial security

Financial education empowers you to avoid these mistakes, build assets, and seize opportunities that others miss.

## Three Money Mindsets

Understanding these perspectives expands your financial options:

### Employee Mindset
- Seeks stability and regular paycheck
- Trades time for money
- Focuses on job security
- Limited income potential

### Entrepreneur Mindset  
- Builds systems and businesses
- Creates value for others
- Takes calculated risks
- Unlimited income potential

### Investor Mindset
- Makes money work for them
- Focuses on cash flow and assets
- Thinks long-term
- Builds passive income streams

Most people internalize only one perspective, but understanding all three opens new possibilities for wealth creation.`,
    takeaways: [
      "Recognize the impact of financial education on your future",
      "Consider your own mindset about money and career",
      "Start thinking like an entrepreneur and investor, not just an employee",
      "Understand that financial literacy is a learnable skill"
    ],
  },
  {
    number: 2,
    level: "Beginner" as ChapterLevel,
    title: "The Psychology Behind Money",
    description: "Understanding emotions like fear and greed in financial decisions, and why patience trumps intelligence in money matters.",
    readTime: "12 min",
    content: `# The Psychology Behind Money

Morgan Housel's "The Psychology of Money" teaches us that most financial decisions are emotional, not rational. Understanding your psychology is more important than understanding complex financial formulas.

## Emotions Drive Financial Decisions

### Fear
- Fear of loss prevents us from investing
- Fear of missing out leads to poor timing
- Fear of failure stops us from taking calculated risks

### Greed
- Greed makes us chase hot investments
- Creates unrealistic expectations
- Leads to overconfidence and poor decisions

### Envy
- Comparing ourselves to others' financial success
- Social media amplifies financial envy
- Prevents us from focusing on our own journey

## Why Behavior Beats Intelligence

Doing well with money has little to do with how smart you are and a lot to do with how you behave. A genius who loses control of their emotions can be a financial disaster, while an ordinary person with good habits can build substantial wealth.

## Building Financial Patience

The market rewards those who wait and penalizes those who panic. Cultivate patience through:

### Automatic Systems
- Set up automatic investments
- Use systematic investment plans (SIPs)
- Remove emotion from the equation

### Long-term Goals
- Focus on 10-20 year horizons
- Ignore daily market noise
- Remember that time in market beats timing the market

### Learning from Triggers
- Identify your emotional spending patterns
- Create cooling-off periods for big decisions
- Develop awareness of your biases`,
    takeaways: [
      "Recognize your emotional habits around money",
      "Practice patience, especially during market swings", 
      "Remember: Long-term thinking builds wealth",
      "Behavior is more important than intelligence in finance"
    ],
  },
  {
    number: 3,
    level: "Beginner" as ChapterLevel,
    title: "Income vs Expenses, Assets vs Liabilities",
    description: "Understanding the fundamental difference between assets and liabilities, and how this knowledge creates wealth.",
    readTime: "18 min",
    content: `# Income vs Expenses, Assets vs Liabilities

Robert Kiyosaki's "Rich Dad Poor Dad" teaches the most important financial lesson: the difference between assets and liabilities. This simple concept separates the wealthy from everyone else.

## The Golden Rule

**Assets put money in your pocket. Liabilities take money out of your pocket.**

It's that simple. Everything you own falls into one of these categories.

## Real Assets Examples

### Financial Assets
- Stocks that pay dividends
- Bonds that pay interest
- Rental properties with positive cash flow
- Business investments that generate income

### Business Assets
- A business you own but don't actively work in
- Intellectual property (books, courses, patents)
- Royalties from creative work
- Franchise investments

## Common "Fake" Assets (Actually Liabilities)

### Your Primary Home
- Requires mortgage payments, taxes, maintenance
- Doesn't generate income
- Appreciation isn't guaranteed
- Ties up your capital

### Expensive Cars
- Depreciate rapidly
- Require insurance, fuel, maintenance
- Don't generate income
- Often bought with loans

### Luxury Items
- Designer clothes, watches, gadgets
- Depreciate or become worthless
- Don't generate cash flow
- Often purchased to impress others

## The Wealth Formula

**Wealth = Assets - Liabilities**

The wealthy focus on acquiring assets. The middle class focuses on reducing liabilities. The poor focus on increasing income without building assets.

## Real-Life Case Study

**Person A (Employee Mindset):**
- Income: ₹50,000/month
- Buys expensive car on EMI: ₹15,000/month
- Home loan EMI: ₹20,000/month
- Lifestyle expenses: ₹12,000/month
- Savings: ₹3,000/month

**Person B (Asset Builder):**
- Income: ₹50,000/month
- Lives modestly: ₹25,000/month
- Invests in mutual funds: ₹15,000/month
- Emergency fund: ₹5,000/month
- Skill development: ₹5,000/month

After 10 years, Person B will be significantly wealthier despite the same income.

## Wealth vs Income

Remember: Wealth is not about how much you make, it's about how much you keep and how much that money works for you.`,
    takeaways: [
      "Always ask: Does this put money in my pocket or take it out?",
      "Focus on acquiring real assets, not fake ones",
      "Your home is not an asset if you live in it",
      "Wealth is built by owning assets, not increasing income alone"
    ],
  },
  // Continue with remaining chapters...
  {
    number: 4,
    level: "Beginner" as ChapterLevel,
    title: "Saving Money Like the Millionaire Next Door",
    description: "Habits of frugal millionaires and how to live below your means without sacrificing happiness.",
    readTime: "14 min",
    content: `# Saving Money Like the Millionaire Next Door

Thomas Stanley's research in "The Millionaire Next Door" reveals surprising truths about wealthy people. Most millionaires don't look like what you'd expect.

## The Millionaire Profile

### What They Drive
- Used cars, often Toyota or Honda
- Keep cars for 8-10 years
- Buy based on reliability, not status

### Where They Live
- Modest neighborhoods
- Houses below their means
- Focus on functionality over show

### What They Wear
- Simple, practical clothing
- Shop at discount stores
- Quality over brand names

## Frugal Millionaire Habits

### 1. Budget Every Month
- Track every expense
- Know where money goes
- Plan before spending

### 2. Buy Used When Possible
- Cars lose 20% value when driven off lot
- Furniture, electronics, books
- Let others pay the depreciation cost

### 3. Cook at Home
- Restaurant meals cost 3-4x more
- Meal planning saves money and time
- Cooking is a valuable life skill

### 4. Avoid Lifestyle Inflation
- Don't increase spending with income
- Live on yesterday's income
- Save pay raises and bonuses

### 5. DIY When Practical
- Learn basic home repairs
- Change your own oil
- Do your own lawn care

## Living Below Your Means

This doesn't mean living miserably. It means:

### Conscious Spending
- Spend on what matters to you
- Cut ruthlessly on what doesn't
- Distinguish between wants and needs

### Value-Based Decisions
- Buy quality items that last
- Consider cost per use
- Invest in experiences over things

### The 50/30/20 Rule
- 50% needs (housing, food, utilities)
- 30% wants (entertainment, hobbies)
- 20% savings and investments

## Case Studies

**Sarah the Teacher:**
- Income: ₹40,000/month
- Lives in small apartment: ₹12,000 rent
- Cooks meals, rarely eats out
- Bikes to work, no car payment
- Saves ₹15,000/month
- Net worth after 15 years: ₹50 lakhs

**Raj the Engineer:**
- Income: ₹80,000/month
- Lives in expensive flat: ₹35,000 EMI
- Eats out frequently
- New car every 3 years
- Saves ₹5,000/month
- Net worth after 15 years: ₹15 lakhs

The teacher becomes wealthier than the engineer by living below her means.`,
    takeaways: [
      "Millionaires often live modestly and drive used cars",
      "Living below your means is the foundation of wealth",
      "Small daily savings compound into large amounts",
      "Focus on value and utility, not status and appearance"
    ],
  },
  {
    number: 5,
    level: "Beginner" as ChapterLevel,
    title: "Budgeting with Purpose",
    description: "Ramit Sethi's Conscious Spending Plan and systematic approaches to budgeting that actually work.",
    readTime: "16 min",
    content: `# Budgeting with Purpose

Most budgets fail because they focus on restriction instead of intention. Ramit Sethi's "Conscious Spending Plan" from "I Will Teach You To Be Rich" offers a better approach.

## Why Traditional Budgets Fail

### Too Restrictive
- Cut everything equally
- No room for enjoyment
- Ignore personal values
- Create guilt around spending

### Too Complicated
- Track every rupee
- Multiple categories
- Time-consuming maintenance
- Easy to abandon

## The Conscious Spending Plan

Instead of budgeting, create a spending plan based on your values.

### Step 1: Calculate Your Income
- After-tax monthly income
- Include bonuses and side income
- Be conservative in estimates

### Step 2: Fixed Costs (50-60%)
**Non-negotiable expenses:**
- Rent/EMI
- Utilities
- Insurance
- Minimum debt payments
- Basic groceries
- Transportation

### Step 3: Savings Goals (20%)
**Pay yourself first:**
- Emergency fund
- Retirement investing
- Goal-specific savings
- This is non-negotiable

### Step 4: Guilt-Free Spending (20-30%)
**Spend on what you love:**
- Hobbies
- Entertainment
- Travel
- Dining out
- Shopping

## Implementation System

### Automate Everything
- Auto-transfer to savings
- Auto-pay fixed bills
- Use separate accounts for each category
- Remove friction from good habits

### Monthly Money Date
- Review last month's spending
- Adjust upcoming month's plan
- Celebrate wins
- Address problems

### Quarterly Deep Dive
- Analyze spending patterns
- Adjust percentages if needed
- Review and update goals
- Plan for upcoming expenses

## Sample Budget Templates

### ₹50,000/month Income
- Fixed Costs: ₹25,000 (50%)
- Savings: ₹10,000 (20%)
- Guilt-free: ₹15,000 (30%)

### ₹1,00,000/month Income
- Fixed Costs: ₹50,000 (50%)
- Savings: ₹25,000 (25%)
- Guilt-free: ₹25,000 (25%)

## Advanced Tips

### Percentage-Based Thinking
- Think in percentages, not absolute amounts
- Scales with income changes
- Easy to adjust and maintain

### Values-Based Spending
- Identify your top 3 spending priorities
- Spend generously on these
- Cut ruthlessly on everything else

### The Anti-Budget
- Automate savings first
- Pay fixed costs second
- Spend whatever's left guilt-free
- Simplest system that works

Remember: The best budget is the one you'll actually use. Start simple and improve over time.`,
    takeaways: [
      "Focus on conscious spending, not restrictive budgeting",
      "Automate your savings and fixed expenses",
      "Spend guilt-free on things you truly value",
      "The best system is the one you'll actually follow"
    ],
  },
  // Add more chapters for intermediate and advanced levels
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

## Investment Basics

### The Risk-Return Relationship
Higher potential returns come with higher risk. The key is finding the right balance for your goals and timeline.

**Conservative Portfolio Example:**
- 30% Stocks
- 50% Bonds
- 20% Cash/FD
- Expected return: 8-10%

**Balanced Portfolio Example:**
- 60% Stocks
- 30% Bonds
- 10% Cash/FD
- Expected return: 10-12%

**Aggressive Portfolio Example:**
- 80% Stocks
- 15% Bonds
- 5% Cash/FD
- Expected return: 12-15%

### Asset Classes Overview

**Stocks (Equities)**
- Ownership in companies
- Highest long-term returns
- Most volatile short-term

**Bonds (Debt)**
- Loans to companies/government
- Steady income
- Lower returns than stocks

**Real Estate**
- Property investments
- Inflation hedge
- Requires significant capital

**Gold**
- Store of value
- Inflation hedge
- No income generation

**Cash/Fixed Deposits**
- Safety and liquidity
- Lowest returns
- Essential for emergencies

## Getting Started

### Step 1: Build Emergency Fund
- 6 months of expenses
- Keep in savings account or liquid fund
- Don't invest emergency money

### Step 2: Clear High-Interest Debt
- Credit card debt (18-24% interest)
- Personal loans
- Pay these before investing

### Step 3: Start Small
- Begin with ₹1,000-5,000/month
- Use systematic investment plans (SIPs)
- Learn while you invest

### Step 4: Educate Yourself
- Read investment books
- Understand what you're buying
- Don't follow tips blindly

Remember: Investing is not gambling. It's about buying productive assets and letting time work in your favor.`,
    takeaways: [
      "Saving alone loses to inflation over time",
      "Investing is essential for building long-term wealth",
      "Start small and build knowledge gradually",
      "Time and compound interest are your best friends"
    ],
  },
  {
    number: 21,
    level: "Advanced" as ChapterLevel,
    title: "Financial Statement Analysis",
    description: "Deep dive into balance sheets, P&L statements, and cash flows to understand company fundamentals.",
    readTime: "25 min",
    content: `# Financial Statement Analysis

Understanding financial statements is crucial for making informed investment decisions. This chapter teaches you to read the three main financial statements like Warren Buffett and other successful investors.

## The Three Core Statements

### 1. Income Statement (P&L)
Shows company's profitability over a period (quarterly/yearly).

**Key Components:**
- Revenue (Top Line)
- Cost of Goods Sold (COGS)
- Gross Profit
- Operating Expenses
- Operating Profit (EBIT)
- Interest and Taxes
- Net Profit (Bottom Line)

### 2. Balance Sheet
Shows company's financial position at a specific point in time.

**Assets = Liabilities + Equity**

**Current Assets:**
- Cash and cash equivalents
- Accounts receivable
- Inventory
- Short-term investments

**Non-Current Assets:**
- Property, plant, equipment
- Intangible assets
- Long-term investments

**Liabilities:**
- Current liabilities (due within 1 year)
- Long-term debt
- Other obligations

### 3. Cash Flow Statement
Shows actual cash movements in three categories:

**Operating Cash Flow:**
- Cash from business operations
- Most important for sustainability

**Investing Cash Flow:**
- Capital expenditures
- Asset purchases/sales
- Acquisitions

**Financing Cash Flow:**
- Debt issued/repaid
- Dividend payments
- Share buybacks

## Key Financial Ratios

### Profitability Ratios

**Gross Profit Margin = Gross Profit / Revenue**
- Measures pricing power
- Higher is generally better
- Compare within industry

**Net Profit Margin = Net Profit / Revenue**
- Overall profitability
- Shows management efficiency
- Industry context matters

**Return on Equity (ROE) = Net Income / Shareholders' Equity**
- Buffett's favorite ratio
- 15%+ is excellent
- Shows management effectiveness

### Efficiency Ratios

**Asset Turnover = Revenue / Total Assets**
- How efficiently assets generate revenue
- Higher indicates better asset utilization

**Inventory Turnover = COGS / Average Inventory**
- How quickly inventory is sold
- Higher is generally better

### Financial Health Ratios

**Current Ratio = Current Assets / Current Liabilities**
- Short-term liquidity
- 1.5-2.5 is typically healthy

**Debt-to-Equity = Total Debt / Total Equity**
- Financial leverage
- Lower is generally safer
- Industry comparison crucial

**Interest Coverage = EBIT / Interest Expense**
- Ability to pay interest
- 3x or higher is comfortable

## Red Flags to Watch For

### Revenue Quality Issues
- Declining revenues over multiple quarters
- Revenue growing faster than industry
- High accounts receivable relative to sales

### Profit Manipulation
- Net income growing much faster than cash flow
- Frequent one-time charges
- Changing accounting methods

### Balance Sheet Concerns
- High debt levels
- Declining cash positions
- Goodwill impairments

## Buffett's Analysis Framework

### 1. Understand the Business
- Simple business model
- Products you can understand
- Strong competitive advantages (moats)

### 2. Capable Management
- High ROE consistently
- Rational capital allocation
- Honest communication

### 3. Financial Characteristics
- Consistent earnings growth
- High profit margins
- Strong cash generation
- Low debt levels

### 4. Purchase Price
- Intrinsic value calculation
- Margin of safety
- Long-term perspective

## Practical Analysis Steps

### Step 1: Get the Data
- Company annual reports
- Quarterly results
- Investor presentations
- Industry reports

### Step 2: Historical Analysis
- 5-10 year trends
- Compare to competitors
- Identify patterns

### Step 3: Calculate Key Ratios
- Use consistent time periods
- Industry benchmarking
- Trend analysis

### Step 4: Quality Assessment
- Revenue growth sustainability
- Profit margin trends
- Cash flow consistency

### Step 5: Valuation
- Multiple approaches (P/E, DCF, etc.)
- Conservative assumptions
- Margin of safety

Remember: Financial analysis is both art and science. Numbers tell a story, but context and judgment are equally important.`,
    takeaways: [
      "Master the three core financial statements",
      "Focus on cash flow, not just reported profits",
      "Look for consistent, high-quality earnings",
      "Always consider industry context and competitive position"
    ],
  }
];

const EBookReader: React.FC<{ chapter: any; onClose: () => void }> = ({ chapter, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  // Split content into pages (roughly 800 characters per page for readability)
  const createPages = (content: string) => {
    const sections = content.split('\n\n');
    const pages: string[] = [];
    let currentPageContent = '';
    
    sections.forEach(section => {
      if (currentPageContent.length + section.length > 800 && currentPageContent.length > 0) {
        pages.push(currentPageContent.trim());
        currentPageContent = section + '\n\n';
      } else {
        currentPageContent += section + '\n\n';
      }
    });
    
    if (currentPageContent.trim()) {
      pages.push(currentPageContent.trim());
    }
    
    // Add takeaways as final page
    if (chapter.takeaways) {
      pages.push(`## Key Takeaways\n\n${chapter.takeaways.map((point: string, idx: number) => `${idx + 1}. ${point}`).join('\n\n')}`);
    }
    
    return pages;
  };

  const pages = createPages(chapter.content);

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setIsFlipping(false);
      }, 300);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setIsFlipping(false);
      }, 300);
    }
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-2xl font-bold mb-4 text-gray-900">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-xl font-semibold mb-3 text-gray-800 mt-6">{line.substring(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-lg font-medium mb-2 text-gray-700 mt-4">{line.substring(4)}</h3>;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={idx} className="font-semibold mb-2 text-gray-800">{line.slice(2, -2)}</p>;
      } else if (line.startsWith('- ')) {
        return <li key={idx} className="ml-4 mb-1 text-gray-700">{line.substring(2)}</li>;
      } else if (line.trim()) {
        return <p key={idx} className="mb-3 text-gray-700 leading-relaxed">{line}</p>;
      }
      return <br key={idx} />;
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${levelColors[chapter.level]} flex items-center justify-center text-white font-bold`}>
              {chapter.number}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{chapter.title}</h2>
              <p className="text-sm text-gray-500">{levelIcons[chapter.level]} {chapter.level} • Day {chapter.number}</p>
            </div>
          </div>
          <Button variant="outline" onClick={onClose}>
            <Home className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>

        {/* Book Content */}
        <div className="flex-1 flex">
          {/* Left Page */}
          <div className={`w-1/2 p-8 border-r border-gray-200 transition-all duration-300 ${isFlipping ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="h-full overflow-y-auto prose prose-sm max-w-none">
              {formatContent(pages[currentPage] || '')}
            </div>
          </div>

          {/* Right Page */}
          <div className={`w-1/2 p-8 transition-all duration-300 ${isFlipping ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="h-full overflow-y-auto prose prose-sm max-w-none">
              {currentPage + 1 < pages.length ? formatContent(pages[currentPage + 1]) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>End of Chapter</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevPage}
            disabled={currentPage === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Page {Math.floor(currentPage / 2) + 1} of {Math.ceil(pages.length / 2)}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: Math.ceil(pages.length / 2) }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    Math.floor(currentPage / 2) === idx ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={nextPage}
            disabled={currentPage >= pages.length - 1}
            className="flex items-center gap-2"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const Finance30Course: React.FC = () => {
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<ChapterLevel | "All">("All");

  const filteredChapters = selectedLevel === "All" 
    ? chapters 
    : chapters.filter(ch => ch.level === selectedLevel);

  const levelStats = {
    Beginner: chapters.filter(ch => ch.level === "Beginner").length,
    Intermediate: chapters.filter(ch => ch.level === "Intermediate").length,
    Advanced: chapters.filter(ch => ch.level === "Advanced").length,
  };

  if (selectedChapter !== null) {
    const chapter = chapters.find(ch => ch.number === selectedChapter);
    if (!chapter) return null;

    return <EBookReader chapter={chapter} onClose={() => setSelectedChapter(null)} />;
  }

  return (
    <section className="max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            30-Day Finance Mastery
          </h2>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Transform your financial future with our comprehensive course based on proven strategies from the world's best finance books
        </p>
      </div>

      {/* Level Filter */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <Button
          variant={selectedLevel === "All" ? "default" : "outline"}
          onClick={() => setSelectedLevel("All")}
          className="flex items-center gap-2"
        >
          <Users className="w-4 h-4" />
          All Levels ({chapters.length})
        </Button>
        {(["Beginner", "Intermediate", "Advanced"] as ChapterLevel[]).map((level) => (
          <Button
            key={level}
            variant={selectedLevel === level ? "default" : "outline"}
            onClick={() => setSelectedLevel(level)}
            className={`flex items-center gap-2 ${
              selectedLevel === level 
                ? `bg-gradient-to-r ${levelColors[level]} text-white border-0` 
                : ""
            }`}
          >
            <span>{levelIcons[level]}</span>
            {level} ({levelStats[level]})
          </Button>
        ))}
      </div>

      {/* Chapter Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChapters.map((chapter) => (
          <Card
            key={chapter.number}
            className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4"
            style={{
              borderLeftColor: chapter.level === "Beginner" ? "#10b981" : 
                              chapter.level === "Intermediate" ? "#f59e0b" : "#ef4444"
            }}
            onClick={() => setSelectedChapter(chapter.number)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${levelColors[chapter.level]} flex items-center justify-center text-white font-bold text-sm`}>
                  {chapter.number}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-1 rounded-full text-white text-xs font-medium bg-gradient-to-r ${levelColors[chapter.level]}`}>
                    {levelIcons[chapter.level]} {chapter.level}
                  </span>
                  <span className="text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {chapter.readTime}
                  </span>
                </div>
                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                  {chapter.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm leading-relaxed">
                {chapter.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-blue-600 text-sm font-medium group-hover:underline">
                  Start Reading →
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Course Stats */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Course Overview</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{levelStats.Beginner}</div>
              <div className="text-gray-600">Beginner Chapters</div>
              <div className="text-sm text-gray-500 mt-1">Days 1-10</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{levelStats.Intermediate}</div>
              <div className="text-gray-600">Intermediate Chapters</div>
              <div className="text-sm text-gray-500 mt-1">Days 11-20</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{levelStats.Advanced}</div>
              <div className="text-gray-600">Advanced Chapters</div>
              <div className="text-sm text-gray-500 mt-1">Days 21-30</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Finance30Course;
