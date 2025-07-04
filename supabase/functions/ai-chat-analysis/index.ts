import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const COHERE_API_KEY = Deno.env.get('COHERE_API_KEY');
const API_ENDPOINT = 'https://api.cohere.com/v1/chat';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Comprehensive financial products database with detailed information
const financialKnowledge = {
  // --- CREDIT CARDS ---
  creditCards: {
    // Entry-Level
    "sbi simplysave": {
      company: "SBI Card",
      type: "Entry-Level",
      fullDetails: `SBI SimplySAVE Card

📋 Terms & Conditions
• Joining/Renewal Fee: ₹499 + GST; renewal fee waived from the 2nd year onwards if annual spends ≥ ₹1 lakh
• Interest Rate: 3.50% per month (~42% p.a.) on outstanding balances
• Late Payment Fee: Rs. 0–1,300 based on your due amount
• Fuel Surcharge Waiver: 1% waiver (Rs. 500–3,000 txn) up to ₹100 per statement cycle
• Reward Point Rate: 10 points per ₹150 on dining, movies, grocery, dept. store; 1 point/₹150 on others. 4 points = ₹1 value

✅ Benefits
• Welcome Bonus: 2,000 points (~₹500) on spends ≥ ₹2,000 within 60 days
• Accelerated Rewards: 10x reward points on day-to-day spends
• Fuel Savings: Waiver on petrol transactions
• Fee Waiver: Based on milestone spends
• FlexiPay & Balance Transfer: EMI conversions available
• Contactless & Global Use: Accepted worldwide

➕ Pros
• Simple and effective for everyday expenses
• Low barrier to entry with easy eligibility
• Milestone waiver makes annual fee negligible
• Fuel surcharge waiver adds value
• Basic EMIs and contactless convenience

➖ Cons
• High interest rates on carryover dues
• Limited to specific redemption catalog
• No premium perks (e.g., lounge access)
• Low reward on non-specified categories
• Late payment penalties can be steep`
    },
    "hdfc regalia": {
      company: "HDFC Bank",
      type: "Travel/Premium",
      fullDetails: `HDFC Regalia Credit Card (typical premium offering)

📋 Terms & Conditions
• Joining/Renewal Fee: ₹2,500 + GST; waived if ≥ ₹3 lakh annual spend
• Reward Rate: 4 pts per ₹150; milestone bonuses of 10,000 pts at ₹5 lakh and 5,000 additional at ₹8 lakh spend
• Foreign Currency Mark-up: 2% + GST
• Lounge Access Triggers: 2 domestic lounge visits per quarter if quarterly spends ≥ ₹1 lakh; 6 international lounge visits via Priority Pass
• Insurance Covers: Air accidental death ₹1 crore; overseas hospital ₹15 lakh; credit liability ₹9 lakh

✅ Benefits
• Travel Perks: Domestic and international lounge access, Priority Pass
• Dining Offers: 25% off at select partner restaurants, 1+1 buffet deals
• Milestone Rewards: Gift vouchers and bonus reward points based on spending
• Insurance Coverage: Comprehensive travel and liability protection
• Low Fx mark-up: 2% charge on foreign spends, competitive for premium cards

➕ Pros
• High reward rate with bonus on milestone spends
• Travel-lifestyle perks—lounges, discounts
• Robust insurance bundled in
• Fee waiver achievable with normal spend
• Easier to redeem via SmartBuy

➖ Cons
• Lounge access is conditional on spending thresholds
• FX markup still adds up on frequent travel
• Large spends needed to realize milestone benefits
• Some benefits are geofenced or clubbed with select merchants
• Quarterly controls may restrict casual users`
    },
    "axis ace": {
      company: "Axis Bank",
      type: "Rewards/Cashback",
      fullDetails: `Axis ACE Credit Card

📋 Terms & Conditions
• Joining/Renewal Fee: ₹499 + GST; first year fee waived with ₹10k spent within 45 days, and waived annually if yearly spends ≥ ₹2 lakh
• Finance Charge: 3.75% per month (~55.5% p.a.)
• Late Payment Fee: ₹500–1,200 depending on overdue amount
• Cashback Exclusions: No cashback on fuel, EMI/wallet/cash advance/rent/insurance/education/government services/financial payments
• Cashback Categories & Rates:
  - 5% on utility bills and recharge via Google Pay
  - 4% on food delivery via partner apps
  - 2% on all other eligible spends
• Lounge Access: 4 free domestic airport lounges per year with ₹50k spend in prior 3 months

✅ Benefits
• High cashback: Unlimited 5% on Google Pay utility/recharges, 4% on food delivery
• Lounge privileges: Up to 4 domestic lounge visits annually
• Fuel surcharge waiver: 1% waiver on ₹400–4,000 fuel transactions (GST extra)
• Dining offers: Up to 15–20% off at select restaurants via EazyDiner
• EMI conversion: Available for purchases ₹2,500+

➕ Pros
• Best-in-class cashback on everyday spends (utility, food, recharges)
• Fee waiver achievable with moderate spends
• Lounge access adds travel convenience
• Broad EMI and dining benefits

➖ Cons
• High interest (55% p.a.) on carry-over balances
• Stringent exclusions on cashback earn (rent, fuel TXNs, etc.)
• Forex markup ~3.5% on international transactions
• Some benefits (fee waiver, lounge) tied to fairly high spend thresholds`
    },
    "hdfc millennia": {
      company: "HDFC Bank",
      type: "Rewards",
      fullDetails: `HDFC Millennia Credit Card

📋 Terms & Conditions
• Joining/Renewal Fee: ₹1,000 + GST; renewal fee waived if annual spends ≥ ₹1 lakh
• Finance Charge: 3.75% per month (~45% p.a.)
• Late Payment Fee: ₹0–1,300 based on outstanding owed
• Cashback Caps & Policy:
  - 5% cashback on 10 partner merchants (Amazon, Flipkart, Zomato, etc.), capped at ₹1,000/month (~₹20k spend)
  - 1% cashback on other spends (including EMIs, wallet), capped ₹1,000/month
• Excludes fuel, rent, govt/educational spends
• Lounge Access: 8 domestic airport lounge visits per year
• Fuel Waiver: 1% waiver on fuel txns, capped ₹250/cycle
• Zero Liability: On lost card with prompt reporting

✅ Benefits
• High-value cashback: 5% on major online merchants, 1% on other spends
• Welcome points: ₹1,000 worth of cashpoints on activation
• Lifestyle perks: 20% off dining via Dineout + lounge access
• Fuel savings: 1% waiver on petrol purchases
• Fraud protection: Global zero liability if card lost/stolen

➕ Pros
• Excellent cashback on online shopping — up to ₹12k/year
• Welcome bonus covers first-year fee
• Low fee with achievable waiver
• Flexible redemption at 1 pt = ₹1
• Includes lounge access and good dining offers

➖ Cons
• Cashback caps limit high spenders
• Low 1% return on non-partner spends
• Strict exclusions — no fuel rent govt spends earn
• High interest on unpaid balance
• Some benefits contingent on SmartPay usage`
    },
    "axis my zone": {
      company: "Axis Bank",
      type: "Entry-Level",
      fullDetails: `Axis My Zone Credit Card

📋 Terms & Conditions
• Joining & Annual Fee: ₹500 + GST (can be waived via select channels)
• Fee Waiver: Lifetime free offers through select channels; lounge access conditional on ₹50k spends in prior 3 months
• Finance Charges: ~3.75%/month (~52.9–55.5% p.a.)
• Late Payment Fee: ₹0–1,200 depending on overdue amount
• Foreign Currency Markup: ~3.5%
• Reward Rate: 4 EDGE points per ₹200; points not earned on movies, fuel, insurance, wallets, etc.
• Fuel Surcharge Waiver: 1% waiver on ₹400–4,000 fuel spends, capped at ₹400/month

✅ Benefits
Entertainment & OTT:
• 100% 2nd ticket free (max ₹200/month) for District/Zomato app
• ₹120 off twice per month on Swiggy orders ≥ ₹500
• SonyLIV Premium subscription (₹1,499) in first year; renewal possible after ₹1.5 lakh spends

Lifestyle & Travel:
• Up to ₹1,000 off at AJIO (min ₹2,999)
• Dining discounts via EazyDiner (~15% up to ₹500)
• 1 complimentary domestic lounge access/quarter upon meeting spend criteria

Other:
• Fuel surcharge waiver, EMI conversions, secure EMV chip protection

➕ Pros
• Strong entertainment value for movie buffs and OTT users
• Meaningful discounts across Swiggy, AJIO, dining
• Lounge access adds travel utility
• EMV chip enhances transaction security

➖ Cons
• Limited rewards on non-eligible spends; many exclusions
• Foreign markup high at ~3.5%
• Spend thresholds needed to unlock some perks
• Heavy reliance on discount offers rather than fixed cashback`
    },
    "amazon pay icici": {
      company: "ICICI Bank",
      type: "Rewards/Co-branded",
      fullDetails: `Amazon Pay ICICI Credit Card

📋 Terms & Conditions
• Joining & Annual Fee: Nil
• Finance Charges: ~3.75%/month (~45% p.a.)
• Late Payment Fee: ₹0–1,200 based on overdue amount
• Cash Advance Fees: 2.5% or ₹300 minimum
• Foreign Currency Markup: ~3.5% (not ideal for international usage)

✅ Benefits
Cashback Rates:
• 5% on Amazon.in (Prime members); 3% (non-Prime)
• 2% on Amazon Pay partner spends (broad merchant base)
• 1% on all other spends (redeemed as Amazon Pay balance)

Welcome Offers:
• Approx. ₹1,700 equivalent cashback/bonuses (e.g., ₹150 on first bill, ₹200 on first purchase)
• 3 months complimentary EazyDiner Prime membership (~₹1,095)

Other Perks:
• Dining discounts via Culinary Treats (~15%)
• 1% fuel surcharge waiver on petrol spends
• No cap or expiry on cashback

➕ Pros
• High returns for Amazon loyalists, especially Prime users
• No fee, no expiry—easy and economical to maintain
• Simple cashback credited directly to Amazon Pay wallet
• Rewards extend to utilities and recharges (via Amazon Pay)

➖ Cons
• Minimal benefits outside Amazon ecosystem
• High forex markup deters international use
• Non-Prime earn rate lower (3% vs 5%)
• Cashback held if unusual spending pattern detected (according to some users)`
    },
    "axis flipkart": {
      company: "Axis Bank",
      type: "Co-branded",
      fullDetails: `Axis Flipkart Credit Card

📋 Terms & Conditions
• Joining Fee: ₹0 or ₹500 + GST depending on source; annual fee is waived with ₹2 lakh annual spend
• Cashback Rates:
  - 5% on Flipkart and Cleartrip
  - 4% on preferred merchants (Swiggy, Uber, PVR, CultFit)
  - 1% on all other eligible spends
• Spend Exclusions: No cashback on fuel, gift cards, EMI, wallet loads, utilities, government services, educational fees, rentals, cash advance, etc.
• Cashback Caps:
  - Past: Unlimited
  - Revised (from June 20 2025): ₹4,000/quarter each on Flipkart & Cleartrip
  - Myntra now earns 7.5% up to ₹4,000/quarter
• Lounge Access: 4 domestic lounge visits/year, conditional on ≥ ₹50k spend in last 3 months—but removed in June 2025 update
• Fees & Charges:
  - Late payment fee: ₹500–1,200 + ₹100 penalty for consecutive misses
  - 1% fee on wallet/fuel/gaming/education transactions above thresholds
• Forex markup: ~3.5%

✅ Benefits
• High cashback in e-commerce & lifestyle (overall ~5%, 4%, 1%)
• Quarterly caps still generous for heavy Flipkart/Cleartrip/Myntra users
• Welcome voucher (~₹600) on activation via Flipkart app
• Lounge access (now revoked) previously added travel value

➕ Pros
• Optimized for Flipkart & related apps—great ROI for frequent shoppers
• Significant cashback on Myntra with the 7.5% update
• Conditional lounge access was a plus—still valid until June 20, 2025
• Fee waiver makes it essentially zero-cost with moderate spend

➖ Cons
• Benefit cutbacks: lounge access gone and cashback caps introduced
• Strict exclusions—many transactions earning no cashback
• Complex fee structures on high wallet/fuel/gaming usage
• No perks for international use (high fees, no lounge)`
    },
    "hdfc moneyback plus": {
      company: "HDFC Bank",
      type: "Cashback",
      fullDetails: `HDFC MoneyBack+ Credit Card

📋 Terms & Conditions
• Joining/Renewal Fee: ₹500 + GST; renewal waived if spends ≥ ₹50k in last year
• Reward Structure:
  - 10x CashPoints (20 pts/₹150) on select partners (Amazon, BigBasket, Flipkart, Reliance Smart, Swiggy), capped 2,500 pts/month (~₹625 value)
  - 2 pts/₹150 on other spends (excl. fuel, rent, govt, wallet loads, EMI)
• Milestone Bonus: Earn ₹500 gift voucher each quarter on ≥ ₹50k spend (max ₹2,000/year)
• Fuel Waiver: 1% surcharge waiver (₹400–5,000 txn), max ₹250/cycle
• Reward Redemption: CashPoints = ₹0.25 each (100 pts = ₹25). Min redeemable: 2,000 pts for cashback (~₹500)
• Reward Caps/Exclusions: Online bonus capped monthly. No points on rent, govt, fuel, wallet/gift/voucher txns
• Fees & Charges: Interest ~3.75% p.m., late fees ₹100–1,300, forex 3.5%, cash advance 2.5% min ₹500
• Eligibility: Salaried/resident ≥ ₹20k net monthly or self-employed with ITR ≥ ₹6 LPA

✅ Benefits
• Outstanding rewards on e-commerce & food aggregator spends (10x up to ₹625/mo)
• Quarterly vouchers worth ₹500 up to ₹2k annually
• Fuel waiver and contactless feature included
• Fee waiver on renewal with moderate usage

➕ Pros
• Strong returns on shopping & dining
• Quarterly gifts make it feel like extra income
• Redeem points flexibly for cashback or travel
• Easy uptime fee waiver—spend ₹50k
• Contactless convenience is a plus

➖ Cons
• Monthly cap on bonus uses limits high spenders
• No rewards on EMI, wallets, payments like rent/govt
• Moderate interest and fees if you carry balances
• Reward point value low when not redeemed for cashback`
    },
    "hsbc cashback": {
      company: "HSBC Bank",
      type: "Cashback",
      fullDetails: `HSBC Cashback (Live+) Credit Card

📋 Terms & Conditions
• Joining & Annual Fee: ₹999; annual fee waived if annual spend ≥ ₹200,000
• Finance Charges: ~3.49% per month (~41.9% p.a.)
• Late Payment Fee: 100% of minimum due (₹250–1,200)
• Foreign Currency Markup: ~3.5%
• Welcome Bonus: ₹1,000 Amazon voucher on spending ₹10k in 30 days & ₹100 Amazon voucher for online application

✅ Benefits
• 10% cashback (capped ₹1,000/month) on dining, groceries, and food delivery
• 1.5% unlimited cashback on other eligible spends
• 4 domestic lounge visits/year (1 per quarter)
• Zero liability for unauthorized transactions reported promptly

➕ Pros
• Exceptional 10% cashback on key everyday categories
• Straightforward cashback credited within ~45 days
• Entry-level premium pricing; fee can be easily waived with ₹2 lakh spend
• Complimentary lounge visits add travel value

➖ Cons
• Cashback cap limits savings (~₹12,000/year)
• High finance and forex charges if carrying balances or traveling
• Cashback exclusions include wallets, fuel, rent, govt, etc.
• Limited benefits beyond dining and groceries; might not suit varied lifestyle needs`
    },
    "sbi elite": {
      company: "SBI Card",
      type: "Travel/Premium",
      fullDetails: `SBI Elite Credit Card

📋 Terms & Conditions
• Joining & Renewal Fee: ₹4,999 + GST; renewal waived if annual spend ≥ ₹1,000,000
• Finance Charges: ~3.50% per month (~42% p.a.)
• Late Payment Fee: ₹0–1,300 (based on overdue amount)
• Fuel Surcharge Waiver: 1% on ₹500–4,000; waives up to ₹250 per statement cycle
• Reward Rate:
  - 5× points on dining, departmental stores, grocery
  - 2 points per ₹100 on other spends (fuel excluded)
• Milestone Bonuses:
  - 10k points each at ₹300k & ₹400k annual spends
  - 15k at ₹500k & ₹800k; fee reversal at ₹10 lakh spend
• Welcome Gift: ₹5,000 e-voucher from lifestyle/travel brands
• Movie Benefit: Up to ₹6,000 per year (2 tickets/month, ₹250 off each) via BookMyShow
• Lounge Access:
  - 2 domestic visits per quarter
  - 6 international visits/year via Priority Pass
• Foreign Markup: Low, at 1.99%
• Insurance:
  - ₹1 Cr air accidental death cover
  - ₹1 L lost card liability; overseas hospital cover (~₹15 L)

✅ Benefits
• Rich lifestyle perks: lounge access, movie tickets, welcome vouchers
• Strong reward structure: 5× multipliers + milestone bonuses up to 50k points
• Complimentary Club Vistara Silver and hotel perks; golf benefits for MasterCard variants
• Low forex markup makes it travel-friendly
• Comprehensive insurance and concierge services

➕ Pros
• High value for frequent travelers and lifestyle spenders
• Rewards and privileges justify the premium fee if used well
• Lounge and travel benefits surpass many peers
• Low international fees and excellent insurance coverage

➖ Cons
• Requires huge spending (₹10 L) for fee waiver
• Substantial annual fee—better only for heavy users
• Reward points less valuable if not redeemed optimally
• Benefits like concierge and golf are niche, underutilized by many
• Insurance/exclusion clauses need careful reading`
    },
    "hdfc infinia": {
      company: "HDFC Bank",
      type: "Premium",
      fullDetails: `HDFC Infinia Credit Card (Invite-only, Super-Premium)

📋 Terms & Conditions
• Joining/Renewal Fee: ₹12,500 + GST; waived if annual spends ≥ ₹10 lakh; renewal bonus of 12,500 reward points (~₹12,500) upon renewal
• Reward Rate: 5 points/₹150 (~3.33% value); up to 10× (max 15,000 pts/month) on travel & shopping via SmartBuy
• Reward Validity: 3 years; lapses if card unused for 365 days
• Fuel Surcharge: 1% waiver (₹400–1 lakh), no points earned on fuel
• Foreign Markup Fee: 2% + GST (~2.36%), plus optional 1% cashback via Global Value program
• EMI & Cash Withdrawal: EMI conversion via Smart EMI; free cash withdrawals up to 40% of credit limit
• Insurance: ₹3 cr accident cover, ₹50 L overseas hospitalization, ₹9 L credit shield
• Lounge Access:
  - Unlimited domestic visits (₹2 nominal per visit for Visa)
  - Unlimited international Priority Pass access (& for add-ons; guests chargeable)
• Golf Benefit: Unlimited rounds/lessons at ~20 domestic & 140 international courses
• Concierge & Lifestyle: Club Marriott membership (1 yr), ITC benefits, dining discounts via Swiggy/SmartBuy

✅ Benefits
• High rewards on almost all spends; accelerated on SmartBuy
• True unlimited lounge access and golf privileges
• Strong insurance and low forex fees
• Lifestyle perks include hotel & dining benefits, concierge support

➕ Pros
• Exceptional reward value (~3.3% baseline)
• Enviable travel and lifestyle inclusions
• Annual fee effectively nullified with usage
• SMS-free EMI/cash withdrawal options

➖ Cons
• Invite-only; high income and credit score needed
• Exclusions on fuel, EMI, wallets reduce some earnings
• SmartBuy caps limit maximum bonus monthly
• International markup still at 2.36% plus GST`
    },
    "axis magnus": {
      company: "Axis Bank",
      type: "Premium",
      fullDetails: `Axis Magnus Credit Card (Premium)

📋 Terms & Conditions
• Joining/Renewal Fee: ₹12,500 + GST; fully refunded via vouchers (Luxe, Postcard Hotels, or Yatra) after first txn; waived if spend ≥ ₹25 lakh annually
• Reward Structure:
  - 12 EDGE pts/₹200 for spends up to ₹1.5 L in a month
  - 35 pts/₹200 on incremental spends
  - 60 pts/₹200 on Travel EDGE portal (capped)
• Spend Exclusions: No points on utilities, wallets, EMI, govt, insurance, fuel, gold, jewellery
• Foreign Markup Fee: 2% on international transactions
• Interest & Fees:
  - 3% extended credit interest rate
  - No cash withdrawal fees
• Fuel Surcharge Waiver: 1% (₹400–4,000 transactions), capped ₹400/month
• Lounge Access: Unlimited domestic & international (PP) access; domestic only if prior 3-month spend ≥ ₹50 k
• Welcome Benefit: Vouchers worth ₹12,500 after first transaction
• Insurance & Protection: Purchase cover ~₹2 L, credit shield ₹5 L, baggage protection, travel medical
• Concierge Services: 24/7 assistance for travel, dining, events (note: concierge withdrawn in April 2024)

✅ Benefits
• Strong reward structure with tier-based bonuses
• Vouchers offset the fee immediately
• Excellent lounge access perks
• Low forex fees and no withdrawal charges
• Dining and travel advantages included

➕ Pros
• Unlimited lounge access domestically and abroad
• High redemptive flexibility via EDGE points
• Fee effectively nullified with spend/vouchers
• Attractive offers on travel/dining
• Good protection benefits

➖ Cons
• High annual fee and spends required
• Many exclusions reduce earn potential
• Concierge service withdrawn
• Redemption caps apply
• Don't fully benefit unless high card usage

✅ Comparison: Infinia vs Magnus
Feature | HDFC Infinia | Axis Magnus
Annual Fee | ₹12.5 k (waivable with ₹10 L spend) | ₹12.5 k (fully rebated + waivable with ₹25 L spend)
Rewards Rate | ~3.33% baseline, up to 10× SmartBuy | Tiered: 12–35 EDGE pts; travel 60 pts/₹200
Lounge Access | Unlimited, domestic & Priority Pass | Unlimited with spend condition
Forex Fee | ~2–2.36% (+1% cashback option) | 2%
Key Extra Perks | Golf, concierge, Marriott, ITC deals | Vouchers, dining, shopping, travel concierge (until 2024)
Ideal For | High-net-worth, travel & lifestyle seekers | Heavy spenders valuing travel & rewards
Main Drawbacks | Invite-only; some reward caps | Concierge removed; earn exclusions`
    }
  },

  // --- MUTUAL FUNDS ---
  mutualFunds: {
    // Large Cap
    "nippon india large cap": {
      company: "Nippon MF",
      type: "Large Cap",
      expenseRatio: "1.25%",
      exitLoad: "1% if < 1 year",
      minInvestment: 100,
      features: [
        "Invests in large blue chip stocks"
      ],
      terms: [
        "SIP allowed; no entry load"
      ]
    },
    "axis bluechip": {
      company: "Axis MF",
      type: "Large Cap",
      expenseRatio: "1.60%",
      exitLoad: "1% < 1 year",
      minInvestment: 500,
      features: [
        "Top 100 Indian listed companies",
        "Long-term wealth creation"
      ]
    },
    "icici prudential bluechip": {
      company: "ICICI MF",
      type: "Large Cap",
      expenseRatio: "1.20%",
      exitLoad: "1%",
      minInvestment: 100,
      features: [
        "Invests in high market cap companies"
      ]
    },
    // Mid Cap
    "motilal oswal midcap": {
      company: "Motilal Oswal MF",
      type: "Mid Cap",
      expenseRatio: "1.51%",
      exitLoad: "1%",
      minInvestment: 500,
      features: [
        "Focus on mid cap growth"
      ]
    },
    "kotak emerging equity": {
      company: "Kotak MF",
      type: "Mid Cap",
      expenseRatio: "1.24%",
      exitLoad: "1%",
      minInvestment: 500,
      features: [
        "Diversification in mid cap stocks"
      ]
    },
    // Small Cap
    "sbi small cap": {
      company: "SBI MF",
      type: "Small Cap",
      expenseRatio: "1.27%",
      exitLoad: "1% <1yr",
      minInvestment: 500,
      features: [
        "Long term small cap pick"
      ]
    },
    "nippon india small cap": {
      company: "Nippon MF",
      type: "Small Cap",
      expenseRatio: "1.34%",
      exitLoad: "1%",
      minInvestment: 100,
      features: [
        "Best performer 5 year CAGR"
      ]
    },
    "quant small cap": {
      company: "Quant MF",
      type: "Small Cap",
      expenseRatio: "0.64%",
      exitLoad: "1%",
      minInvestment: 500,
      features: [
        "Active management"
      ]
    },
    // Flexi Cap
    "parag parikh flexi cap": {
      company: "PPFAS",
      type: "Flexi Cap",
      expenseRatio: "0.79%",
      exitLoad: "2% <1yr",
      minInvestment: 1000,
      features: [
        "International equity exposure"
      ]
    },
    "hdfc flexi cap": {
      company: "HDFC MF",
      type: "Flexi Cap",
      expenseRatio: "1.11%",
      exitLoad: "1%",
      minInvestment: 100,
      features: [
        "Market cap agnostic"
      ]
    },
    // ELSS (Tax Saving)
    "axis long term equity": {
      company: "Axis MF",
      type: "ELSS",
      expenseRatio: "1.68%",
      lockin: "3 yrs",
      minInvestment: 500,
      features: [
        "Tax benefit under sec 80C"
      ]
    },
    "quant elss": {
      company: "Quant MF",
      type: "ELSS",
      expenseRatio: "0.7%",
      lockin: "3 yrs",
      minInvestment: 500,
      features: [
        "Aggressive growth, tax benefit"
      ]
    },
    "mirae asset tax saver": {
      company: "Mirae Asset MF",
      type: "ELSS",
      expenseRatio: "0.91%",
      lockin: "3 yrs",
      minInvestment: 500,
      features: [
        "Balanced portfolio"
      ]
    },
    // Index Funds
    "hdfc nifty 50 index": {
      company: "HDFC MF",
      type: "Index",
      expenseRatio: "0.20%",
      exitLoad: "NIL",
      features: [
        "Tracks Nifty 50 performance"
      ]
    },
    "uti nifty next 50": {
      company: "UTI MF",
      type: "Index",
      expenseRatio: "0.29%",
      exitLoad: "0.25% <7d",
      features: [
        "Tracks Nifty Next 50"
      ]
    },
    "icici nifty 500": {
      company: "ICICI MF",
      type: "Index",
      expenseRatio: "0.27%",
      exitLoad: "0.25% <1m",
      features: [
        "Well-diversified"
      ]
    },
    // Debt
    "sbi magnum short term": {
      company: "SBI MF",
      type: "Debt",
      expenseRatio: "0.69%",
      exitLoad: "NIL",
      features: [
        "Short duration bonds"
      ]
    },
    "hdfc corporate bond": {
      company: "HDFC MF",
      type: "Debt",
      expenseRatio: "0.56%",
      exitLoad: "NIL",
      features: [
        "Corporate bonds investments"
      ]
    },
    // Hybrid
    "icici balanced advantage": {
      company: "ICICI MF",
      type: "Hybrid",
      expenseRatio: "1.06%",
      exitLoad: "1% <12m",
      features: [
        "Dynamic asset allocation"
      ]
    },
    "sbi equity hybrid": {
      company: "SBI MF",
      type: "Hybrid",
      expenseRatio: "0.96%",
      exitLoad: "1% <1yr",
      features: [
        "Equity + debt"
      ]
    }
    // ... add more top funds as needed
  },

  // --- HEALTH INSURANCE ---
  healthInsurance: {
    // Star Health
    "star family health optima": {
      company: "Star Health",
      type: "Family Floater",
      sumInsured: [300000, 500000, 1000000],
      premium: "₹6,500 - ₹14,000/year (family)",
      keyFeatures: [
        "Auto restoration of sum insured",
        "Pre & post hospitalization covered",
        "Road ambulance cover"
      ],
      terms: [
        "Waiting period: 30 days (illness), 2-4 years (PED)",
        "5 year renewability"
      ],
      exclusions: [
        "War, cosmetic treatments",
        "Donor expenses not covered"
      ]
    },
    "star comprehensive health": {
      company: "Star Health",
      type: "Individual/Family",
      sumInsured: [500000, 1000000, 2500000],
      premium: "₹7,000 - ₹22,000/year",
      keyFeatures: [
        "Maternity benefit",
        "No capping on room rent"
      ],
      terms: [
        "PED waiting: 3 years",
        "Day care covered"
      ]
    },
    // HDFC ERGO
    "optima restore": {
      company: "HDFC ERGO",
      type: "Family Floater",
      sumInsured: [300000, 500000, 1000000],
      premium: "₹7,500 - ₹18,000/year",
      keyFeatures: [
        "Restore benefit",
        "Critical illness cover"
      ],
      terms: [
        "24m waiting for pre-existing diseases"
      ]
    },
    "health suraksha": {
      company: "HDFC ERGO",
      type: "Individual",
      sumInsured: [200000, 500000, 1000000],
      premium: "₹6,000 - ₹15,000/year",
      keyFeatures: [
        "No room rent capping",
        "AYUSH cover"
      ]
    },
    // Niva Bupa
    "reassure 2.0": {
      company: "Niva Bupa",
      type: "Family Floater",
      sumInsured: [500000, 1000000, 2500000],
      premium: "₹7,500 - ₹17,000/year",
      keyFeatures: [
        "Reinstatement benefit",
        "No sub limits"
      ]
    },
    "health companion": {
      company: "Niva Bupa",
      type: "Individual/Family",
      sumInsured: [500000, 1000000],
      premium: "₹6,500 - ₹12,000/year",
      keyFeatures: [
        "Day care covered",
        "No room capping"
      ]
    },
    // Care Health
    "care advantage": {
      company: "Care Health",
      type: "Individual/Family",
      sumInsured: [300000, 1000000],
      premium: "₹7,000 - ₹15,000/year",
      keyFeatures: [
        "Cashless at 20K+ hospitals"
      ]
    },
    "care supreme": {
      company: "Care Health",
      type: "Individual/Family",
      sumInsured: [500000, 2000000],
      premium: "₹9,000 - ₹30,000/year",
      keyFeatures: [
        "500+ day care procedures",
        "Health checkup included"
      ]
    },
    // Tata AIG
    "medicare": {
      company: "Tata AIG",
      type: "Individual/Family",
      sumInsured: [200000, 1000000],
      premium: "₹6,000+",
      keyFeatures: [
        "Cover for alternative medicine",
        "Health check-up benefit"
      ]
    },
    "medicare premier": {
      company: "Tata AIG",
      type: "Premium",
      sumInsured: [500000, 3000000],
      premium: "₹10,000+",
      keyFeatures: [
        "Maternity cover",
        "No sub-limits"
      ]
    },
    // Aditya Birla
    "activ health platinum": {
      company: "Aditya Birla Health",
      type: "Premium",
      sumInsured: [500000, 2000000, 5000000],
      premium: "₹12,000+",
      keyFeatures: [
        "Healthy returns bonus",
        "Chronic management program"
      ]
    },
    // ICICI Lombard
    "complete health insurance": {
      company: "ICICI Lombard",
      type: "Family/Individual",
      sumInsured: [200000, 500000, 1000000],
      premium: "₹7,000+",
      keyFeatures: [
        "Sum insured recharge",
        "Wellness program"
      ]
    }
    // ... add more as needed
  },

  // --- LIFE INSURANCE ---
  lifeInsurance: {
    // Term Insurance
    "hdfc click2protect life": {
      company: "HDFC Life",
      type: "Term",
      sumAssured: "₹50L - ₹5Cr",
      premium: "Low",
      keyFeatures: [
        "Lump Sum or monthly pay"
      ],
      terms: [
        "Death due to any cause except suicide 1st year"
      ]
    },
    "max life smart secure": {
      company: "Max Life",
      type: "Term",
      sumAssured: "₹50L+",
      premium: "Affordable",
      keyFeatures: [
        "Accident benefit rider"
      ]
    },
    "icici iprotect smart": {
      company: "ICICI Prudential",
      type: "Term",
      sumAssured: "₹50L - ₹10Cr",
      premium: "Affordable",
      keyFeatures: [
        "Inbuilt terminal illness benefit"
      ]
    },
    // Whole Life
    "lic jeevan umang": {
      company: "LIC",
      type: "Whole Life",
      sumAssured: "₹2L+",
      premium: "Varies",
      keyFeatures: [
        "Lifelong cover with bonuses"
      ]
    },
    "tata aia whole life": {
      company: "Tata AIA",
      type: "Whole Life",
      sumAssured: "₹5L+",
      keyFeatures: [
        "Guaranteed payments till age 100"
      ]
    },
    // Endowment
    "lic jeevan labh": {
      company: "LIC",
      type: "Endowment",
      sumAssured: "₹2L+",
      keyFeatures: [
        "Guaranteed bonuses"
      ]
    },
    "hdfc sanchay plus": {
      company: "HDFC Life",
      type: "Endowment",
      sumAssured: "Flexible",
      keyFeatures: [
        "Guaranteed income on maturity"
      ]
    },
    // Money Back
    "lic new money back": {
      company: "LIC",
      type: "Money Back",
      sumAssured: "₹1L+",
      keyFeatures: [
        "Regular payouts"
      ]
    },
    "sbi life smart money back": {
      company: "SBI Life",
      type: "Money Back",
      sumAssured: "₹1L+",
      keyFeatures: [
        "Guaranteed money back at intervals"
      ]
    },
    // ULIPs (refer to ULIPs section for more)
    "hdfc click2wealth": {
      company: "HDFC Life",
      type: "ULIP",
      sumAssured: "Varies",
      keyFeatures: [
        "Low charges, flexible premium"
      ]
    },
    "icici pru signature": {
      company: "ICICI Prudential",
      type: "ULIP",
      sumAssured: "Varies",
      keyFeatures: [
        "Loyalty additions, high allocation"
      ]
    }
    // ... add more as needed
  },

  // --- LOANS ---
  loans: {
    // Home Loans
    "hdfc home loan": {
      company: "HDFC Ltd",
      type: "Home Loan",
      minAmount: 500000,
      maxAmount: 100000000,
      tenure: "1–30 years",
      interestRate: "8.5% - 9.5%",
      processingFee: "Up to 0.5%",
      terms: [
        "Floating/fixed options",
        "No prepayment penalty (individuals)"
      ]
    },
    "sbi home loan": {
      company: "SBI",
      type: "Home Loan",
      minAmount: 500000,
      maxAmount: 100000000,
      tenure: "1–30 years",
      interestRate: "8.5%",
      processingFee: "0.4% (Max ₹10K)",
      terms: [
        "Zero prepayment for floating loans"
      ]
    },
    "lic housing loan": {
      company: "LIC Housing",
      type: "Home Loan",
      terms: [
        "Low processing fee",
        "Flexible tenure"
      ]
    },
    "axis home loan": {
      company: "Axis Bank",
      type: "Home Loan",
      terms: [
        "Attractive floating rate"
      ]
    },
    // Personal Loans
    "hdfc personal loan": {
      company: "HDFC Bank",
      type: "Personal Loan",
      minAmount: 50000,
      maxAmount: 4000000,
      tenure: "12–60 months",
      interestRate: "10.5% - 21%",
      processingFee: "2.5%",
      terms: [
        "No part prepayment first 12 months",
        "Foreclosure charges: 4%"
      ]
    },
    "icici personal loan": {
      company: "ICICI Bank",
      type: "Personal Loan",
      terms: [
        "Quick disbursal",
        "Flexible tenure",
        "Processing fees extra"
      ]
    },
    "tata capital personal loan": {
      company: "Tata Capital",
      type: "Personal Loan",
      terms: [
        "Loan up to ₹25L",
        "Minimal documentation"
      ]
    },
    "bajaj finserv personal loan": {
      company: "Bajaj Finserv",
      type: "Personal Loan",
      terms: [
        "Loan up to ₹25L",
        "Fast approval"
      ]
    },
    // Education Loans
    "sbi global ed-vantage": {
      company: "SBI",
      type: "Education Loan",
      tenure: "Up to 15 yrs",
      interestRate: "8.5–10.5%",
      terms: [
        "For study abroad",
        "Tax benefits on interest"
      ]
    },
    "icici education loan": {
      company: "ICICI Bank",
      type: "Education Loan",
      terms: [
        "No collateral for small amounts"
      ]
    },
    "avanse education loan": {
      company: "Avanse",
      type: "Education Loan",
      terms: [
        "Quick digital process"
      ]
    },
    // Car Loans
    "hdfc car loan": {
      company: "HDFC Bank",
      type: "Car Loan",
      terms: [
        "100% on-road funding"
      ]
    },
    "sbi car loan": {
      company: "SBI",
      type: "Car Loan",
      terms: [
        "7–5 years tenure",
        "Affordable EMIs"
      ]
    },
    "axis auto loan": {
      company: "Axis Bank",
      type: "Car Loan",
      terms: [
        "Easy application"
      ]
    },
    // Gold Loans
    "muthoot gold loan": {
      company: "Muthoot Finance",
      type: "Gold Loan",
      terms: [
        "Up to 75% LTV",
        "Quick disbursal"
      ]
    },
    "manappuram gold loan": {
      company: "Manappuram",
      type: "Gold Loan",
      terms: [
        "Minimal paperwork"
      ]
    },
    "hdfc gold loan": {
      company: "HDFC Bank",
      type: "Gold Loan",
      terms: [
        "Attractive interest"
      ]
    },
    // Business Loans
    "lendingkart business loan": {
      company: "Lendingkart",
      type: "Business Loan",
      terms: [
        "Fast online approval"
      ]
    },
    "bajaj finserv business loan": {
      company: "Bajaj Finserv",
      type: "Business Loan",
      terms: [
        "Collateral free",
        "Flexible tenure"
      ]
    },
    "sbi business loan": {
      company: "SBI",
      type: "Business Loan",
      terms: [
        "Easy eligibility",
        "Minimal documentation"
      ]
    }
    // ... add more as needed
  },

  // --- ULIPs ---
  ulips: {
    "hdfc click 2 wealth": {
      company: "HDFC Life",
      lockin: 5,
      minPremium: 24000,
      fundChoices: ["Equity", "Debt", "Balanced"],
      charges: [
        "Premium allocation: 2%",
        "Policy admin: Rs. 60/month (first 5 yrs)"
      ],
      features: [
        "Loyalty additions after year 6",
        "Partial withdrawal allowed"
      ],
      terms: [
        "Returns market-linked",
        "Mortality & admin charges applicable"
      ]
    },
    "hdfc pro growth plus": {
      company: "HDFC Life",
      lockin: 5,
      fundChoices: ["Equity", "Balanced"],
      terms: [
        "Tax-free maturity benefit"
      ]
    },
    "icici prudential lifetime classic": {
      company: "ICICI Prudential",
      lockin: 5,
      minPremium: 30000,
      fundChoices: ["Equity", "Debt", "Balanced"],
      features: [
        "Loyalty additions",
        "Partial withdrawal after 5 years"
      ]
    },
    "icici pru signature": {
      company: "ICICI Prudential",
      lockin: 5,
      minPremium: 60000,
      fundChoices: ["Multi Cap", "Debt", "Hybrid"],
      features: [
        "High allocation, tax benefit"
      ]
    },
    "sbi ewealth insurance": {
      company: "SBI Life",
      lockin: 5,
      fundChoices: ["Growth", "Balanced"],
      features: [
        "Online only"
      ]
    },
    "sbi smart wealth assure": {
      company: "SBI Life",
      lockin: 5,
      features: [
        "Choice of fund allocation"
      ]
    },
    "bajaj future gain": {
      company: "Bajaj Allianz",
      lockin: 5,
      minPremium: 25000,
      fundChoices: ["Equity Growth", "Pure Stock"],
      features: [
        "Loyalty reward from year 6"
      ]
    },
    "bajaj goal assure": {
      company: "Bajaj Allianz",
      features: [
        "Return of mortality charge"
      ]
    },
    "max online savings plan": {
      company: "Max Life",
      lockin: 5,
      features: [
        "Multiple switches"
      ]
    },
    "max smart wealth plan": {
      company: "Max Life",
      lockin: 5,
      features: [
        "Comprehensive family cover"
      ]
    },
    "aditya birla wealth aspire": {
      company: "Aditya Birla Sun Life",
      features: [
        "Top-up premium allowed"
      ]
    },
    "tata aia fortune pro": {
      company: "Tata AIA",
      lockin: 5,
      features: [
        "Death & maturity benefit"
      ]
    },
    "tata aia wealth maxima": {
      company: "Tata AIA",
      features: [
        "0% premium allocation charge after Year 11"
      ]
    }
    // ... add more as needed
  }
};

// Improved search function with better precision and context awareness
const searchKnowledge = (query: string, conversationHistory: string[] = []) => {
  const lowerQuery = query.toLowerCase();
  const results = [];
  
  // Extract specific product mentions from query
  const specificProducts = [];
  if (lowerQuery.includes('flipkart axis') || lowerQuery.includes('axis flipkart')) {
    specificProducts.push('axis flipkart');
  }
  if (lowerQuery.includes('amazon pay icici') || lowerQuery.includes('icici amazon')) {
    specificProducts.push('amazon pay icici');
  }
  
  // Helper function to calculate relevance score with context awareness
  const calculateRelevance = (itemName: string, company: string, type: string, query: string) => {
    let score = 0;
    const queryWords = query.split(' ').filter(word => word.length > 2);
    
    // Exact product match gets highest priority
    if (specificProducts.length > 0) {
      const exactMatch = specificProducts.some(product => itemName.includes(product) || product.includes(itemName));
      if (exactMatch) score += 200;
      else if (specificProducts.some(product => company.toLowerCase().includes(product.split(' ')[0]))) {
        score += 10; // Lower score for same company but different product
      }
    }
    
    // Exact name match
    if (itemName === query) score += 150;
    
    // Partial name matches with priority
    queryWords.forEach(word => {
      if (itemName.includes(word)) score += 60;
      if (company.toLowerCase().includes(word)) score += 40;
      if (type.toLowerCase().includes(word)) score += 25;
    });
    
    // Context from conversation history
    if (conversationHistory.length > 0) {
      const lastMessage = conversationHistory[conversationHistory.length - 1]?.toLowerCase() || '';
      queryWords.forEach(word => {
        if (lastMessage.includes(word) && itemName.includes(word)) {
          score += 30; // Boost for contextual relevance
        }
      });
    }
    
    return score;
  };

  // Search with improved relevance and context
  for (const [cardName, details] of Object.entries(financialKnowledge.creditCards)) {
    const relevance = calculateRelevance(
      cardName, 
      details.company || '', 
      details.type || '', 
      lowerQuery
    );
    
    if (relevance > 0) {
      results.push({
        relevance,
        type: 'Credit Card',
        content: details.fullDetails || `${details.company} "${cardName}"\nType: ${details.type}\nFeatures: ${details.features ? details.features.join(', ') : details.benefits?.join(', ') ?? ""}`
      });
    }
  }

  // Search other categories with similar improvements
  for (const [mfName, info] of Object.entries(financialKnowledge.mutualFunds ?? {})) {
    const relevance = calculateRelevance(mfName, info.company || '', info.type || '', lowerQuery);
    if (relevance > 0) {
      results.push({
        relevance,
        type: 'Mutual Fund',
        content: `${info.company} "${mfName}" [${info.type}]\nExpense Ratio: ${info.expenseRatio}, Exit Load: ${info.exitLoad}, Min Investment: ₹${info.minInvestment}\nFeatures: ${(info.features ?? []).join(", ")}`
      });
    }
  }

  // Sort by relevance and return top results
  return results
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, specificProducts.length > 0 ? 2 : 3)
    .map(result => `${result.type}: ${result.content}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, hasDocument, fileName, conversationHistory = [] } = await req.json();
    
    console.log('Processing message:', message);
    console.log('Has document:', hasDocument);
    console.log('Conversation history length:', conversationHistory.length);
    
    // Search local knowledge base with improved precision and context
    const knowledgeResults = searchKnowledge(message, conversationHistory);
    let knowledgeContext = '';
    
    if (knowledgeResults.length > 0) {
      knowledgeContext = `\n\nRelevant information from knowledge base:\n${knowledgeResults.join('\n\n')}`;
    }

    // Build conversation context
    let conversationContext = '';
    if (conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-4); // Last 4 messages for context
      conversationContext = `\n\nRecent conversation context:\n${recentHistory.join('\n')}`;
    }

    const systemPrompt = `You are ClauseWise, a financial document analysis expert and AI assistant. You help users understand credit cards, insurance policies, mutual funds, loans, ULIPs, life insurance, and their terms and conditions.

Key responsibilities:
- Provide accurate information about financial products
- Explain complex terms in simple language
- Identify hidden fees, exclusions, and penalty clauses
- Maintain conversation context and remember previous questions
- Focus on the specific products mentioned by the user
- Never give investment advice, only factual explanations

IMPORTANT: 
- If user asks about a specific product (like "Flipkart Axis card"), focus ONLY on that product
- Don't mention other products from the same company unless directly relevant
- Remember the conversation flow and build upon previous responses
- Be concise but comprehensive

Current conversation context: Remember what was discussed before and build upon it.
${conversationContext}${knowledgeContext}`;

    const userPrompt = hasDocument 
      ? `User uploaded document: "${fileName}". Based on the document and conversation context, please answer: ${message}` 
      : message;

    // Try Cohere API call
    if (COHERE_API_KEY) {
      try {
        console.log('Making Cohere API call...');
        const response = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${COHERE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'command-r-plus',
            message: userPrompt,
            preamble: systemPrompt,
            temperature: 0.3,
            max_tokens: 1000,
            conversation_id: hasDocument ? `doc_${fileName}` : 'general_chat'
          }),
        });

        console.log('Cohere API response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          const aiResponse = data.text;
          
          console.log('Cohere API response received');
          
          if (aiResponse) {
            return new Response(JSON.stringify({ response: aiResponse }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        } else {
          const errorText = await response.text();
          console.error('Cohere API error response:', errorText);
        }
      } catch (apiError) {
        console.error('Cohere API call failed:', apiError);
      }
    }

    // Enhanced fallback response with knowledge base
    let fallbackResponse = "I'm ClauseWise, your financial document analysis assistant.\n";
    if (knowledgeResults.length > 0) {
      fallbackResponse += `Here's what I found about your query:\n\n${knowledgeResults.join('\n\n')}\n\n`;
    }
    
    if (hasDocument) {
      fallbackResponse += `Regarding your uploaded document "${fileName}":\n• Look for automatic renewal clauses\n• Check for hidden fees and charges\n• Review cancellation policies\n• Watch for penalty terms\n• Note coverage limitations\n\nWould you like me to explain any specific clause or term?`;
    } else {
      fallbackResponse += `I can help you understand:\n• Credit card terms and conditions\n• Insurance policy details\n• Mutual fund information\n• Loan agreements\n• Hidden clauses and risks\n\nFeel free to ask about specific products or upload documents for analysis.`;
    }
    
    return new Response(JSON.stringify({ response: fallbackResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ 
      response: "I'm experiencing technical difficulties. Please try again shortly."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
