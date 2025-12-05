import random

class QuestionBank:
    def __init__(self):
        self.questions = {
            # --- Programming Basics ---
            "prog_c1": [ # Variables
                {
                    "id": "q_prog_c1_1",
                    "question": "Which of the following is the correct way to declare a variable and assign an integer value in Python?",
                    "options": ["int x = 10;", "x = 10", "x := 10", "declare x as int = 10"],
                    "correct_answer": "x = 10",
                    "type": "multiple_choice"
                },
                {
                    "id": "q_prog_c1_2",
                    "question": "What is the output of `print(type(3.14))`?",
                    "options": ["<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'double'>"],
                    "correct_answer": "<class 'float'>",
                    "type": "multiple_choice"
                }
            ],
            "prog_c2": [ # Conditionals
                {
                    "id": "q_prog_c2_1",
                    "question": "Which keyword is used for 'else if' in Python?",
                    "options": ["elseif", "else if", "elif", "elsif"],
                    "correct_answer": "elif",
                    "type": "multiple_choice"
                }
            ],
            "prog_c3": [ # Loops
                {
                    "id": "q_prog_c3_1",
                    "question": "Which loop is best used when the number of iterations is known?",
                    "options": ["while loop", "for loop", "do-while loop", "until loop"],
                    "correct_answer": "for loop",
                    "type": "multiple_choice"
                },
                {
                    "id": "q_prog_c3_2",
                    "question": "How do you stop a loop prematurely?",
                    "options": ["stop", "exit", "break", "continue"],
                    "correct_answer": "break",
                    "type": "multiple_choice"
                }
            ],
            "prog_c4": [ # Functions
                {
                    "id": "q_prog_c4_1",
                    "question": "What keyword is used to define a function in Python?",
                    "options": ["func", "def", "function", "define"],
                    "correct_answer": "def",
                    "type": "multiple_choice"
                },
                {
                    "id": "q_prog_c4_2",
                    "question": "What does a function return by default if no return statement is specified?",
                    "options": ["0", "False", "None", "undefined"],
                    "correct_answer": "None",
                    "type": "multiple_choice"
                }
            ],
            "prog_c5": [ # Lists
                {
                    "id": "q_prog_c5_1",
                    "question": "How do you access the first element of a list named 'my_list'?",
                    "options": ["my_list[1]", "my_list(0)", "my_list[0]", "my_list.first()"],
                    "correct_answer": "my_list[0]",
                    "type": "multiple_choice"
                },
                {
                    "id": "q_prog_c5_2",
                    "question": "Which method adds an element to the end of a list?",
                    "options": ["add()", "append()", "insert()", "push()"],
                    "correct_answer": "append()",
                    "type": "multiple_choice"
                }
            ],
            "prog_c6": [ # OOP
                {
                    "id": "q_prog_c6_1",
                    "question": "What is the first parameter of a class method in Python usually named?",
                    "options": ["this", "self", "me", "instance"],
                    "correct_answer": "self",
                    "type": "multiple_choice"
                }
            ],
            "recursion": [
                {
                    "id": "q_rec_1",
                    "question": "What is a base case in recursion?",
                    "options": ["The most complex case", "The condition to stop recursion", "The initial call", "The error state"],
                    "correct_answer": "The condition to stop recursion",
                    "type": "multiple_choice"
                }
            ],
            "sorting_algos": [
                {
                    "id": "q_sort_1",
                    "question": "What is the average time complexity of Merge Sort?",
                    "options": ["O(n)", "O(n^2)", "O(n log n)", "O(log n)"],
                    "correct_answer": "O(n log n)",
                    "type": "multiple_choice"
                }
            ],
            "dictionaries": [
                {
                    "id": "q_dict_1",
                    "question": "How do you access the value associated with key 'k' in dictionary 'd'?",
                    "options": ["d.get('k')", "d['k']", "d.value('k')", "Both A and B"],
                    "correct_answer": "Both A and B",
                    "type": "multiple_choice"
                }
            ],
            
            # --- Mathematics Basics ---
            "math_c1": [ # Arithmetic
                {
                    "id": "q_math_c1_1",
                    "question": "What is 15% of 200?",
                    "options": ["20", "25", "30", "35"],
                    "correct_answer": "30",
                    "type": "multiple_choice"
                }
            ],
            "math_c2": [ # Algebra
                {
                    "id": "q_math_c2_1",
                    "question": "Solve for x: 2x + 5 = 15",
                    "options": ["5", "10", "2.5", "7.5"],
                    "correct_answer": "5",
                    "type": "multiple_choice"
                }
            ],
            "math_c3": [ # Geometry
                {
                    "id": "q_math_c3_1",
                    "question": "What is the area of a circle with radius 3?",
                    "options": ["9π", "6π", "3π", "1.5π"],
                    "correct_answer": "9π",
                    "type": "multiple_choice"
                }
            ],
            
            # --- Data Science ---
            "python_basics": [ # DS Python
                {
                    "id": "q_ds_py_1",
                    "question": "Which Python library is commonly used for numerical computations?",
                    "options": ["Matplotlib", "Scikit-learn", "NumPy", "Pandas"],
                    "correct_answer": "NumPy",
                    "type": "multiple_choice"
                }
            ],
            "data_cleaning": [
                {
                    "id": "q_ds_clean_1",
                    "question": "What is the primary goal of data cleaning?",
                    "options": ["Create new features", "Improve accuracy and consistency", "Visualize patterns", "Train models"],
                    "correct_answer": "Improve accuracy and consistency",
                    "type": "multiple_choice"
                }
            ],
            "eda": [ # Exploratory Data Analysis
                {
                    "id": "q_ds_eda_1",
                    "question": "Which plot is best for showing the distribution of a single variable?",
                    "options": ["Scatter plot", "Histogram", "Line chart", "Heatmap"],
                    "correct_answer": "Histogram",
                    "type": "multiple_choice"
                }
            ],
            "ml_basics": [ # Machine Learning
                {
                    "id": "q_ds_ml_1",
                    "question": "Which of these is a Supervised Learning algorithm?",
                    "options": ["K-Means Clustering", "Linear Regression", "PCA", "Apriori"],
                    "correct_answer": "Linear Regression",
                    "type": "multiple_choice"
                }
            ]
        }

    def get_question(self, concept_id):
        """Returns a random question for the given concept."""
        questions = self.questions.get(concept_id, [])
        if not questions:
            # Fallback generic question if no specific ones exist
            return {
                "id": f"q_generic_{random.randint(1000,9999)}",
                "question": f"Practice question for {concept_id}. What is the core concept?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": "Option A",
                "type": "multiple_choice"
            }
        return random.choice(questions)
