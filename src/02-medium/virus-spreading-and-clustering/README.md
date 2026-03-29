# Virus spreading and clustering

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/virus-spreading-and-clustering)

**Level:** medium
**Topics:** Clustering, Connected components

## Goal 

Given a population size n\_people, with its members indexed from 0 to n\_people \- 1, calculate the size of every outbreak/cluster within the population.  
  
Imagine that each member of a population is one person. Now consider that one member of the population becomes "infected" by a virus. Provided a set of connections (e.g. "member A is linked to member B"), the subset of members of the population infected by the virus can be simulated (we will assume that transmission is guaranteed to occur between linked members). This subset is effectively like an "outbreak" of a virus.  
  
Your job is to assess these subsets, or **clusters** and provide the breakdown of the distribution of cluster sizes in the given population.  
  
All links are two-way (reciprocal), there are no one-way links.  
  
Every member of the population belongs to a cluster even if its size is of 1 (a cluster with only one member). 

Input

**Line 1**: the number n\_people of elements in the structure  
**Line 2**: the number n\_links of existing relations between elements in the structure   
**n\_links next lines**: two space-separated integers i and j for two elements linked

Output

**A number of lines**: The distribution of clusters in descending order by cluster size. Each line contains two integers, cluster size and cluster count for this cluster size, separated by a space.

Constraints

5 <= n\_people <= 500  
n\_links < 800

Example

Input

5
2
4 0
0 2

Output

3 1
1 2
