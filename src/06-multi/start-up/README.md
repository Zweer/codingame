# Start-up!

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/start-up)

**Level:** multi
**Topics:** Optimization

# Goal

You have been chosen to lead a start-up that sells a software. The goal is to get the most market share before the time runs out, but beware the competition may be tough! 

Source code is accessible [here](https://github.com/mchabeaudy/software-sales-game).

# Rules

During the competition 4 start-ups will try to get the most market share.  
To sell your software you will have to recruit employees and give them orders.  
The game stands for 100 turns unless a start-up reaches 80% market share and wins.  
  
  
**Chronology**  
  
Each turn following actions are performed:  
1. Recruitment : increasing or decreasing employees
2. Pay : Your cash increases and all employees receive their pay (including new ones)
3. Development: new features are developed (and new bugs appear)
4. Sales : sellers sell your software, increasing your market share
  
**Recruitment**  
  
Your can recruit different types of employees: Developers, developing new features and maintaining for your software, Sellers, selling your software increasing your market share and Managers, managing other employees so that they perform their task correctly.  
There are limitations, each turn you can:  
* Recruit or fire maximum 1 manager
* Recruit devs and sellers knowing that devsToRecruit + sellersToRecruit ≤ 2 × totalManagersOfYourStartUp
* Your total employees count must stay under 10 × totalManagersOfYourStartUp. Where employees count is your total number of developers and sellers
Beware! If you have more than 4 employees (dev of seller) for 1 manager it will be hard to control your employees (see advanced rule)  
  
**Pay**  
  
Each turn, first your cash increases proportionally to your market share, your income will be given in input. Second, employees don't work for free, you will have to pay them:  
* Developers : $10 for each
* Sellers : $10 for each
* Managers : $20 for each
Beware! If you don't have enough cash, your employees will be fired one by one until you have enough money to pay them, starting by developers, then sellers, then managers.  
  
**Development**  
  
During this phase you will have to choose wisely the proportion of developers assigned to development and maintenance.  
features increase by the number of developers affected to development  
bugs count decrease by the number of developers affected to maintenance **and** tests increase by the same number  
  
New bugs appear! Indeed, for the next 9 rounds after a feature has been developed it has a chance to produce a bug (formula in advanced rules)  
  
Note: tests will always increase by the number of developers affected to maintenance, event if there is no bug.  
  
**Sales**  
  
First of all, you have to know that your start-up has a reputation (formula in advanced rules). The higher is your reputation, the easier it will be for you to sell.  
Market is always growing, each turn all start-ups have their market share reduced to 95% of their initial value to represent arrival of new clients.  
Also you can sell your software only if you have **at least 10 features**.  
  
**Phase 1 - Unfilled market:**  
Your unfilledMarketScore is calculated (formula in advanced rules) then your market share will increase by:  
availableUnfilledMarket × unfilledMarkerScore / totalUnfilledMarketScore  
Where availableUnfilledMarket is the minimum between 3% × playerCount and the remaining unfilled market  
The part of market share acquired this way is protected during this turn from competitive market (it cannot be stolen by competitors for this turn).  
  
**Phase 2 - Competitive market**  
Your competitiveMarketScore is calculated (formula in advanced rules). Then all start-ups will fight in a random order as following:  
If reputation of start-up A is equal or greater than reputation of start-up B then start-up A will steal market share from start-up B calculated by:  
stolenMarketShare = minimum between 0.8% and 0.4% × competitiveMarketScoreA / competitiveMarketScoreB  
  
**Optional rule**  
Instead of fighting everyone you can decide to focus on only one competitor in this case stolenMarket will be calculated by (if your reputation is equal or greater):  
stolenMarketShare = minimum between competitorsCount × 0.8% and competitorsCount × 0.4% × competitiveMarkerScoreA / competitiveMarkerScoreB  
  
**Initial conditions**  
* cash = 1500
* managers = 1
* devs = 0
* sellers = 0

Victory conditions

* You reach 80% market share.
* You have the most market share after 100 turns.

Lose conditions

* Your program input not well formatted.
* Your program input is invalid.
* An other start-up reaches 80% market share.
* Your program doesn't provide an input.

# Advanced rules

To work well, ratio between employees and managers should be 1 manager per 4 employees.  
Employees outside this ratio may change their affectation by:  
* doing the action you intend to - 25% chance
* doing a different action - 25% chance (devs will switch from features to maintenance, sellers from unfilled market to competitive market)
* doing nothing - 50% chance
  
**Formulas**  
Pbug(turn) = e^(-0.3 × turn) × max(0, 1 - 0.25 \* tests / features)  
Note : If you have 4 times more tests than features you can't have bugs anymore.  
e^(-0.3 × t) values:  
* t = 1 : 0.740
* t = 2 : 0.549
* t = 3 : 0.407
* t = 4 : 0.301
* t = 5 : 0.223
* t = 6 : 0.165
* t = 7 : 0.122
* t = 8 : 0.091
* t = 9 : 0.067
  
reputation = max(1, 100 × features / max(1, (existingBugs × 3 + fixedBugs)))  
Where existingBugs is remaining unfixed bugs in your application and fixedBugs is total bugs count you have already fixed (Yes, even fixed a bug will damage you reputation forever).  
Maximum value of reputation is capped at 2000  
**If you fix bugs when your market share is equal to 0 it will not affect your reputation (No harm seen, no harm done!)**  
  
unfilledMarketScore = unfilledMarketSellers × reputation × features  
Where unfilledMarketSellers is the count of sellers you affected to unfilled market (unfilledMarketSellers = sellers - competitiveSellers).  
  
competitiveMarketScore = competitiveMarketSellers × reputation × features  
Where competitiveMarketSellers is the count of sellers you affected to competitive market.  
  
income \= marketShare × (1 / 0.95)^gameTurn  
Where marketShare is your market share in thousandths and gameTurn is the game turn  
  
# Note

Developers and sellers work as soon as they are recruited. Managers start to work next turn after they are recruited.  

# Game input

Input for a turn

Line 1 :  11 integers id, playerCount, turn, income, cash, devs, sellers, managers, features, tests and bugs where:

* id : your startUp id
* playerCount : number of players
* turn : number of turn since the beginning
* income : your income for this turn
* cash : cash of your start-up
* devs : developers employees of your start-up
* sellers : sellers employees of your start-up
* managers : managers employees of your start-up
* features : features developed in your software
* tests : tests developed in your software
* bugs : bugs in your software

playerCount following lines :  one line for each player. First line is for player 0, next one for player 1, etc. Each line contains 3 integers startUpId start-up id, marketShare start-up market share in thousandths and reputation start-up reputation 

Output for a turn

One line containing 5 or 6 integers separated by space devsToHire, sellersToHire, managersToHire, maintenanceDevs, competitiveSellers and targetId which is optional

Constraints for output values:

* \-1 ≤ managersToHire ≤ 1
* |devsToHire| + |sellersToHire| ≤ 2 × managers where |n| means absolute value of n
* 0 ≤ maintenanceDevs ≤ devs \+ devsToHire
* 0 ≤ competitiveSellers ≤ sellers \+ sellersToHire
* devs \+ devsToHire \+ sales \+ salesToHire ≤ 10 × managers
devsToHire: number of developers you want to hire for next round, it can be negative.  
sellersToHire: number of sellers you want to hire for next round, it can be negative.  
managersToHire: number of managers you want to hire for next round, it can be negative.  
maintenanceDevs: number of your developers affected to fix bugs **and** increase tests.  
Beware tests number can be increased only if a feature already exists or has been developed during the turn.  
competitiveSellers: sellers that will try to steal market share from competitors.  
targetId must be a startUp id (different from your id). This output is optional.
