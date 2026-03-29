# Cooking passion

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/cooking-passion)

**Level:** medium
**Topics:** Modular calculus, String manipulation, Arithmetic

## Goal 

You love cooking. Therefore, you often go to the shop to buy ingredients for your recipes. Sometimes, you can't, so you ask your dog to go. But he can't read numbers, so he doesn't buy the quantities you need. Given the recipe and the list of ingredients your dog bought, with their respective quantities, find how many times you can cook this meal before you run out of an ingredient.  
  
Output the first ingredient that will be running out, how many times you can cook, and how much of each ingredient you will have left. 

Input

**Line 1**: Two space-separated integers num\_recipe and num\_ingredients, respectively the number of lines of the recipe and the number of ingredients your dog bought  
**Next num\_recipe lines**: A line of the recipe, either of the following:  
• an ingredient: beginning with \-, then its quantity and its name, all separated with a space, or  
• a line to ignore: not beginning with \-  
**Next num\_ingredients lines**: An ingredient your dog bought: the ingredient's name and its quantity, separated with a space  
  
Each quantity is either an integer in grams (g) / centiliters (cl) or a float in kilograms (kg) (1000g = 1.0kg) / liters (L) (100cl = 1.0L)

Output

**Line 1**: limiting\_ingredient The ingredient that will run out first  
**Line 2**: num\_cooking How many times you can cook the meal before you run out of limiting\_ingredient  
**Next (num\_ingredients \- 1) lines**: An ingredient, then a space, followed by the quantity remaining, expressed as an integer in g or cl if it is <1kg or <1L, otherwise a float in kg or L shown to at least 1 decimal place.  
Ingredients must be **ordered by quantity**, in ascending order, beginning with **solid ingredients** (in g/kg). **Don't output the limiting\_ingredient.**

Constraints

1 < num\_ingredients ⩽ num\_recipe < 50  
0 < length of a line < 500  
There is only one limiting\_ingredient, and it is always a solid ingredient.  
The quantity of limiting\_ingredient in grams is a multiple of the quantity needed in the recipe, therefore num\_cooking is an integer.

Example

Input

5 3
- 100g Butter
- 500g Flour
- 500g Sugar
Mix it all together
Eat it !
Butter 400g
Flour 1000g
Sugar 1500g

Output

Flour
2
Butter 200g
Sugar 500g
