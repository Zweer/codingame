# Survey Prediction

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/survey-prediction)

**Level:** easy
**Topics:** Machine learning

## Goal 

Your manager has given you a file containing survey answers of what genre of music people of different genders and ages like, but for some reason some people answered without specifying the genre, so you need to predict what genres they like based on other people's answers. Unfortunately, you cannot do this without the help of coding. Assuming that the answers given on the survey are a 100% correct, you are to create a program that takes the survey answers and predicts the genres of each person given their age and their gender.  
  
For example, "males aged 20-27 like rock" means that a male that is 23 years old would like rock. Similarly, "females aged 20-27 like hip hop" means that a 23-year-old female would like hip hop.  
  
Survey answers are the ones that have an age, gender and a genre. the data you need to predict the genres for have an age and a gender only.  
  
If you can't specify what genre they like (e.g. the given age/gender is not included in the survey answers), simply print None. 

Input

**Line 1:** An integer n for the amount of survey answers plus the missing  
**Next n lines:** Survey answers and answers with missing genres

Output

Genre each person which didn't answer likes

Constraints

2 < n ≤ 20

Example

Input

3
23 female hip-hop
30 female hip-hop
24 female

Output

hip-hop
