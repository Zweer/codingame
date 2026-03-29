#!/bin/bash

# Read the number of horses
read N

# Read the horse powers into an array
declare -a horses
for (( i=0; i<N; i++ )); do
    read horses[$i]
done

# Sort the array numerically
sorted_horses=($(printf "%s\n" "${horses[@]}" | sort -n))

# Initialize min_diff with a very large number
min_diff=10000000

# Loop through the sorted array and find the minimum difference
for (( i=0; i < N - 1; i++ )); do
    # Calculate the difference between two adjacent elements
    diff=$(( ${sorted_horses[i+1]} - ${sorted_horses[i]} ))

    # If this difference is smaller, update min_diff
    if [ "$diff" -lt "$min_diff" ]; then
        min_diff=$diff
    fi
done

# Print the final minimum difference
echo $min_diff
