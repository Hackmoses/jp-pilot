"""Cross-check the page transcriptions with the printed 2010 key and arithmetic.

Paper: https://myexamcode.net/wp-content/uploads/2022/04/JAMB-MATHEMATICS-PAST-QUESTIONS.pdf
PDF pages 3 and 5 contain the questions. Page 10 contains the key.
"""

from itertools import permutations, product
from json import loads
from math import prod
from pathlib import Path


def determinant(rows):
    """Calculate a determinant from the signed sum over column permutations."""
    def sign(columns):
        inversions = sum(a > b for i, a in enumerate(columns) for b in columns[i + 1:])
        return (-1) ** inversions

    return sum(
        sign(columns) * prod(row[column] for row, column in zip(rows, columns))
        for columns in permutations(range(len(rows)))
    )


def check():
    key = {11: "a", 25: "a", 26: "d"}
    bank = loads(Path(__file__).with_name("questions-maths-jamb-figures.json").read_text())
    questions = {q["source"]["id"]: q for q in bank["questions"]}

    # P' ∩ Q' ∩ R' contains only points outside all three sets.
    target = {region for region in product((False, True), repeat=3) if not any(region)}
    keyed_region = {(True, False, False)}  # Page 3, choice A shades P only.
    assert key[11] == "a" and target != keyed_region
    assert 11 not in questions
    print("Q11 excluded: the keyed option A shades P only. The target is outside all three sets.")

    checks = {
        25: (r"\det{x,3;2,7}", lambda value: determinant([[value, 3], [2, 7]]) == 15),
        26: (r"\det{2,0,5;4,6,3;8,9,1}", lambda value: value == determinant([[2, 0, 5], [4, 6, 3], [8, 9, 1]])),
    }
    assert set(questions) == set(checks)
    for number, (notation, is_correct) in checks.items():
        question = questions[number]
        assert notation in question["stem"] and question["source"]["yearLabel"] == "2010"
        matching = [option["id"] for option in question["options"]
                    if is_correct(int(option["text"].replace("−", "-")))]
        assert matching == [key[number]] == [question["answerId"]]
        print(f"Q{number}: independent code check agrees with printed key {key[number].upper()}.")


if __name__ == "__main__":
    check()
