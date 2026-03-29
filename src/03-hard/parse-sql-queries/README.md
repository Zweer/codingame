# Parse SQL Queries

[:link: Puzzle on CodinGame](https://www.codingame.com/training/hard/parse-sql-queries)

**Level:** hard
**Topics:** Parsing, Data Types, SQL, DataBases, Tables

## Goal 

In this puzzle, instead of writing an SQL query, you will receive an SQL query and respond to it, acting as a simple database.  
  
Your inputs are a basic SQL table and a SELECT query command for each test case. Your program needs to parse these and output the correct query results.  
  
For simplicity there are no commands to manipulate tables and only one table to select from. Nothing more advanced than SELECT.  
  
Basic structure of query is as follows:  
SELECT columnName1, columnName2, columnName3 FROM tableName  
  
SELECT tells you which columns to keep from the input table for your output table. FROM specifies the name of the table. For this puzzle it won't matter, therefore simply keeping the relevant columns is enough for this query.  
  
SELECT \* will select all columns.  
  
Slightly more advanced query example:  
SELECT columnName1, columnName2 FROM tableName WHERE columnName3 \= value ORDER BY columnName2 DESC  
  
WHERE tells you what conditions must be met to display a row. The only condition you need to check for is if strings are equal (\=). There will only be a single condition, so no AND, no OR.  
  
ORDER BY gives the criteria for sorting the table rows. The sorting can be either ascending (ASC) or descending (DESC) on column values. All sorting is by numerical value rather than string value. Numbers can be integer or decimal.  
  
Image source: https://unsplash.com/photos/PkbZahEG2Ng 

Input

**Line 1:** A string containing the query you need to parse.  
**Line 2:** An integer rows for the number of table entries.  
**Line 3:** A string representing the header of the table, containing the column names separated by space.  
**Next rows lines:** A string representing the values for each column, separated by space.

Output

**Line 1:** A string representing the header of the output, containing the selected column names separated by space.  
**Following lines:** A string representing the values for each selected column, separated by space.

Constraints

2 ≤ initial number of columns ≤ 10  
2 ≤ initial number of rows ≤ 30  
  
If any of the values in a column is numeric, then they will all be numeric.

Example

Input

SELECT * FROM cats
3
Name Breed
McFur Peterbald
Squeeky Bambino
Greta Laperm

Output

Name Breed
McFur Peterbald
Squeeky Bambino
Greta Laperm
