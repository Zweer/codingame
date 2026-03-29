# Erdős Number

[:link: Puzzle on CodinGame](https://www.codingame.com/training/hard/erdos-number)

**Level:** hard

## Goal 

Le nombre d'Erdős décrit la « distance de collaboration » minimale entre le scientifique Paul Erdős et une autre personne, mesurée par publication conjointe. Ce mathématicien hongrois est l'auteur le plus prolifique de son domaine puisqu'il rédigea dans sa vie plus de 1 500 articles.  
  
Si une personne a un nombre d'Erdős qui vaut 1, cela signifie qu'elle a écrit un article de recherche avec Erdős ; un nombre d'Erdős égal à 2 signifie qu'elle a cosigné un article avec un collaborateur direct d'Erdős mais pas avec Erdős lui-même, etc.  
  
Si une personne n'est pas collaborateur direct ou indirect d'Erdős, son nombre d'Erdős est infini.  
  
À partir d'une liste de publications et de leurs auteurs, vous devez donner le nombre d'Erdős du scientifique reçu en entrée. Si ce nombre n'est pas nul ou infini, vous devez lister dans l'ordre le titre des articles permettant cette liaison.  
  
/////////////////////////////////////////////////////////////////////////////////////////////////  
  
The Erdős number describes the minimum "collaborative distance" between the scientist Paul Erdős and another person, as measured by co-authored publications. The Hungarian mathematician is the most prolific author of his field since he wrote more than 1500 papers in his lifetime.  
  
If a person has an Erdős number of 1, it means that he has written a research paper with Erdős; a Erdős number equal to 2 means that he co-authored an article with a direct collaborator of Erdős but not with Erdős himself, etc.  
  
If a person is not a direct or indirect collaborator with Erdős, their Erdős number is infinite.  
  
From a list of publications and their authors, you need to give the Erdős number of the scientist given in the input. If this number is not zero or infinity, you must output the list of ordered article titles (from the scientist's paper to the paper written by Erdős). 

Input

**Ligne 1 :** Une chaîne de caractères pour le nom du scientifque scientist dont on souhaite connaître le nombre d'Erdős .  
**Ligne 2 :** Un entier N pour le nombre de publications (la liste en contenant au moins une de Paul Erdős et une du scientifique).  
**N prochaines lignes :** Le titre title de chaque publication entre ".  
**N prochaines lignes :** Les auteurs authors des publications associées, séparés par des espaces.  
  
/////////////////////////////////////////////////////////////////////////////////////////////////  
  
**Line 1:** A string for the name of the scientist whose Erdős number is requested.  
**Line 2:** An int N for the number of publications (the list contains at least one paper from Paul Erdős and one from the scientist).  
**Next N lines:** The title of each publications between ".  
**Next N lines:** The authors of the corresponding publication, separated by spaces.

Output

**Ligne 1 :** Le nombre d'Erdős e du scientifique demandé ou bien infinite.  
**e prochaines lignes :** Les titres des publications, à partir de celle du scientifique demandé jusqu'à celle de Paul Erdős.  
  
/////////////////////////////////////////////////////////////////////////////////////////////////  
  
**Line 1:** The Erdős number e of the requested scientist or infinite.  
**Next e lines:** The titles of publications, from the one that the scientist published to the one published by Paul Erdős.

Constraints

1 ≤ N ≤ 100

Example

Input

Einstein
2
"On linear independence of sequences in a Banach space"
"The influence of the expansion of space on the gravitation fields surrounding the individual stars"
Erdős Straus
Straus Einstein

Output

2
"The influence of the expansion of space on the gravitation fields surrounding the individual stars"
"On linear independence of sequences in a Banach space"
