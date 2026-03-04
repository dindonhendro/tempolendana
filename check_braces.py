
import sys

def find_imbalance(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    stack_braces = []
    stack_parens = []
    for i, line in enumerate(lines):
        for j, char in enumerate(line):
            if char == '{':
                stack_braces.append((i+1, j+1))
            elif char == '}':
                if not stack_braces:
                    print(f"Extra '}}' at line {i+1}, col {j+1}")
                    return
                stack_braces.pop()
            elif char == '(':
                stack_parens.append((i+1, j+1))
            elif char == ')':
                if not stack_parens:
                    print(f"Extra ')' at line {i+1}, col {j+1}")
                    return
                stack_parens.pop()
    
    if stack_braces:
        line, col = stack_braces[-1]
        print(f"Unclosed '{{' at line {line}, col {col}")
    if stack_parens:
        line, col = stack_parens[-1]
        print(f"Unclosed '(' at line {line}, col {col}")
    
    if not stack_braces and not stack_parens:
        print("All balanced")

if __name__ == "__main__":
    find_imbalance(sys.argv[1])
