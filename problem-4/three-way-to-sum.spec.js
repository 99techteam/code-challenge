const assert = require('assert');

const {
    sum_to_n_with_loop,
    sum_to_n_with_math,
    sum_to_n_with_recursion
} = require('./three-way-to-sum.js');

describe('Sum to N Functions', () => {
    describe('sum_to_n_with_loop', () => {
        describe('when n = 0', () => {
            it('should return 0', () => {
                assert.strictEqual(sum_to_n_with_loop(0), 0);
            });
        });

        describe('when n = 1', () => {
            it('should return 1', () => {
                assert.strictEqual(sum_to_n_with_loop(1), 1);
            });
        });

        describe('when n = 2', () => {
            it('should return 3', () => {
                assert.strictEqual(sum_to_n_with_loop(2), 3);
            });
        });

        describe('when n = 3', () => {
            it('should return 6', () => {
                assert.strictEqual(sum_to_n_with_loop(3), 6);
            });
        });

        describe('when n = 4', () => {
            it('should return 10', () => {
                assert.strictEqual(sum_to_n_with_loop(4), 10);
            });
        });

        describe('when n = 5', () => {
            it('should return 15', () => {
                assert.strictEqual(sum_to_n_with_loop(5), 15);
            });
        });

        describe('when n = 10', () => {
            it('should return 55', () => {
                assert.strictEqual(sum_to_n_with_loop(10), 55);
            });
        });
    });

    describe('sum_to_n_with_math', () => {
        describe('when n = 0', () => {
            it('should return 0', () => {
                assert.strictEqual(sum_to_n_with_math(0), 0);
            });
        });

        describe('when n = 1', () => {
            it('should return 1', () => {
                assert.strictEqual(sum_to_n_with_math(1), 1);
            });
        });

        describe('when n = 2', () => {
            it('should return 3', () => {
                assert.strictEqual(sum_to_n_with_math(2), 3);
            });
        });

        describe('when n = 3', () => {
            it('should return 6', () => {
                assert.strictEqual(sum_to_n_with_math(3), 6);
            });
        });

        describe('when n = 4', () => {
            it('should return 10', () => {
                assert.strictEqual(sum_to_n_with_math(4), 10);
            });
        });

        describe('when n = 5', () => {
            it('should return 15', () => {
                assert.strictEqual(sum_to_n_with_math(5), 15);
            });
        });

        describe('when n = 10', () => {
            it('should return 55', () => {
                assert.strictEqual(sum_to_n_with_math(10), 55);
            });
        });
    });

    describe('sum_to_n_with_recursion', () => {
        describe('when n = 0', () => {
            it('should return 0', () => {
                assert.strictEqual(sum_to_n_with_recursion(0), 0);
            });
        });

        describe('when n = 1', () => {
            it('should return 1', () => {
                assert.strictEqual(sum_to_n_with_recursion(1), 1);
            });
        });

        describe('when n = 2', () => {
            it('should return 3', () => {
                assert.strictEqual(sum_to_n_with_recursion(2), 3);
            });
        });

        describe('when n = 3', () => {
            it('should return 6', () => {
                assert.strictEqual(sum_to_n_with_recursion(3), 6);
            });
        });

        describe('when n = 4', () => {
            it('should return 10', () => {
                assert.strictEqual(sum_to_n_with_recursion(4), 10);
            });
        });

        describe('when n = 5', () => {
            it('should return 15', () => {
                assert.strictEqual(sum_to_n_with_recursion(5), 15);
            });
        });

        describe('when n = 10', () => {
            it('should return 55', () => {
                assert.strictEqual(sum_to_n_with_recursion(10), 55);
            });
        });
    });

    describe('Cross-function validation', () => {
        describe('when n = 5', () => {
            it('all functions should return the same result', () => {
                const n = 5;
                const loopResult = sum_to_n_with_loop(n);
                const mathResult = sum_to_n_with_math(n);
                const recursionResult = sum_to_n_with_recursion(n);

                assert.strictEqual(loopResult, mathResult);
                assert.strictEqual(mathResult, recursionResult);
                assert.strictEqual(loopResult, recursionResult);
            });
        });

        describe('when n = 10', () => {
            it('all functions should return the same result', () => {
                const n = 10;
                const loopResult = sum_to_n_with_loop(n);
                const mathResult = sum_to_n_with_math(n);
                const recursionResult = sum_to_n_with_recursion(n);

                assert.strictEqual(loopResult, mathResult);
                assert.strictEqual(mathResult, recursionResult);
                assert.strictEqual(loopResult, recursionResult);
            });
        });

        describe('when n = 100', () => {
            it('all functions should return the same result', () => {
                const n = 100;
                const loopResult = sum_to_n_with_loop(n);
                const mathResult = sum_to_n_with_math(n);
                const recursionResult = sum_to_n_with_recursion(n);

                assert.strictEqual(loopResult, mathResult);
                assert.strictEqual(mathResult, recursionResult);
                assert.strictEqual(loopResult, recursionResult);
            });
        });
    });

    describe('Edge cases', () => {
        describe('when n = -1', () => {
            it('should handle negative numbers gracefully', () => {
                try {
                    sum_to_n_with_loop(-1);
                    sum_to_n_with_math(-1);
                    sum_to_n_with_recursion(-1);
                } catch (error) {
                    assert.ok(error instanceof Error);
                }
            });
        });

        describe('when n = 3.5', () => {
            it('should handle decimal numbers', () => {
                try {
                    sum_to_n_with_loop(3.5);
                    sum_to_n_with_math(3.5);
                    sum_to_n_with_recursion(3.5);
                } catch (error) {
                    assert.ok(error instanceof Error);
                }
            });
        });
    });
});
