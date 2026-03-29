# 🃏 FreeCell 🃏

[:link: Puzzle on CodinGame](https://www.codingame.com/training/hard/freecell)

**Level:** hard
**Topics:** Patience, Cards

# Royale-les-Eaux, 1953

“So you're back in one piece”, observed Le Chiffre patronisingly. “You are not equipped, my dear boy, to play baccarat with the grown-ups, and it is very foolish of—”

“I thought the game was Texas Hold'em”, interrupted 007.

“The capitalist Multi-Player? How delightfully naive”, goaded Le Chiffre. “Just exactly where do you think you are, my dear boy? No, tonight you play FreeCell, or the bitch dies.”

“FreeCell? That doesn't make any sense! The game doesn't even exist yet!”

“You can expect nothing else from playing Solo games. The contribution moderators wanted a story, so here's yours. I only work here, ok? Now play and win, or else… Смерть шпиону!”

# FreeCell 

The aim of this patience game is to move an entire 52-card standard deck from the cascades to the foundations. 

# Rules 

The playing area is divided in three zones: 
* the cascades: 8 columns of zero or more cards
* the foundations: 4 stacks of zero or more cards, one stack per suit, ordered from aces upwards
* the cells: 4 slots of zero or one card

 Game actions consist exclusively of moving a card from a place to another. Each zone has specific constraints as to what cards can move from and to it. 

**The cascades.** Only the bottommost card of a cascade is available for moving. Moving it _away_ is never restricted. To move a card _to_ a cascade, either the cascade must be empty, or the added card must be ranked _one beneath_ the cascade's bottommost card, and of _opposite color_. 

**The foundations.** Cards there are stacked, with only the topmost one being visible. Moving a card _away_ from a foundation is never possible. To move a card _to_ a foundation, it must be ranked one above the current topmost card, and of matching suit. If a foundation is empty, an ace may be placed there. 

**The cells.** Only a single card may be in a cell at any given time. There is no other restriction as to which card may move in and out of it. 

  
The game features **autoplay**: available cards that are candidates for foundations will automatically be played there after every move. 

Victory Condition

All cards are in the foundations.

Defeat Condition

You have no possible move left.

# Noob Rules 

A **card** is a piece of two-sided [B8](https://en.wikipedia.org/wiki/ISO%5F216) laminated paper. A group of cards is called a **deck**. One side of the card is called the **front** and displays the card's attributes, that are pairwise distinct within a deck. (The other side is called the _back_ and shows a motif intended for decoration that is shared by all cards in the deck; but it is not involved in this game.) A card has two _attributes_. The first attribute is the card's **suit**: a symbol among ♣ “clubs” ♦ “diamonds” ♥ “hearts” and ♠ “spades”. Spaces and clubs have the **color black ♠♣**. Hearts and diamonds have the **color red ♥♦**. The second attribute is the card's **rank**: an integer between 1 and 13. Ranks 1 to 10 display their attributes as **pips**: their suit's symbol, one for each of their rank's index, laid out symetrically. Ranks 11 to 13 display as a **face**, one for each rank×suit combination. Rank 1 is abbreviated as an “A” for “ace”; ranks 11 to 13 as “J”, “Q”, “K” for “jack”, “queen”, “king” respectively. 

The standard deck thus comprises 4 suits × 13 ranks = 52 cards. 

# Expert Rules 

A sequence of stacked, descending-rank, alternating-color cards is called a _tableau_. Tableaux form organically at the bottom of cascades throughout normal game course. If enough free cells and/or empty cascades are available, you may move a tableau as a unit, by making use of free space as temporary storage. This is known as a **supermove**. The game will automatically recognize them as moves and use them when appropriate. 

# Example 

You may solve the first test case with the following move sequence: 26, 76, 72, 72, 5a, 27, 57, 67, 1b, 61, 41, 4h, 4h, 41, 45, 34, 3c, 6d, 5b. 

# Game Protocol 

This is a turn-based game. At each turn you must read the provided input, and provide your move on the standard output. 

Input

Line 1: foundationCountPlusOne, the number of foundations with more than zero cards plus one   
Line 2:8 space-separated integers cascadeCountPlusOnei: the number of cards per cascade plus one   
Line 3: Foundations:, then foundationCountPlusOne\-1 words representing the foundations' levels.   
Line 4:the cells' contents, a sole dash \- for empty cells   
Lines 5 to 12:a colon :, then cascadeCountPlusOnei\-1space-separated integers representing the cascades' contents, one line per cascade; cards reported deepest to topmost (_i.e._, downwards as displayed in the game viewer)   
Line 13: M, the number of possible moves   
Line 14: M space-separated words: the possible moves   

  
Cards in cells or cascades are represented as a two-character word: one among A23456789TJQK for the card's rank, one among CDHS for the card's suit.  
The foundations' levels are represented as 3-character words: one character to represent the suit; one sole dash character \-; one character to represent the rank of the highest card in that foundation. 

  
If you're stuck, lines 3 to 12 are valid input to [fc-solve](https://fc-solve.shlomifish.org/). 

Output

A single line containing one or more space-separated moves in [standard notation](https://freecellgamesolutions.com/notation.html): each move is a two-character word, with: 
* digits 1 through 8 representing the cascades
* letters a through d representing the cells
* letter h (for home) representing the foundations

Constraints

Try to win before reaching the turn or time limit. 

# Credits and meta 

* Making of the backend
* Making of the visuals
* The playing cards are derived from [the SVG set by Dmitry Fomin on WikiMedia Commons](https://commons.wikimedia.org/w/index.php?title=File:English%5Fpattern%5Fplaying%5Fcards%5Fdeck.svg&oldid=509578585), CC0 1.0\.
* The cover story background is derived from [Simon Tunbridge's photograph](https://flic.kr/p/dBYKxw), CC BY-NC-SA 2.0\.
