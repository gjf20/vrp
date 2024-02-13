# vrp
Vehicle Routing Problem

# Usage
Using vanilla npm with node at v18.15.0

## One file at a time
```
npm i
npm run compile
npm run solution {path_to_problem}
```

## Using Python script
```
cd {repo_root}
python3 {path_to_evaluateShared.py} --cmd "node --experimental-specifier-resolution=node --no-warnings ./dist/main.js" --problemDir {path_to_training_problems}
```


# Sources

[1]     “IEOR 151 -Lecture 18 Savings Algorithm.” Accessed: Feb. 12, 2024. [Online]. Available: https://aswani.ieor.berkeley.edu/teaching/FA15/151/lecture_notes/ieor151_lec18.pdf

[2]     AMAN, “Get the Last Element of an Array Using JavaScript,” Scaler Topics, Dec. 07, 2022. https://www.scaler.com/topics/javascript-get-last-element-of-array/ (accessed Feb. 13, 2024).


