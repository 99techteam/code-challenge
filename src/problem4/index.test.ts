import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from "./index";

const cases = [-1, 0, 1, 5, 100];
const expected = [0, 0, 1, 15, 5050];

describe("sum_to_a implementations", () => {
    cases.forEach((n, idx) => {
        it(`sum_to_n_a(${n}) should return ${expected[idx]}`, () => {
            expect(sum_to_n_a(n)).toBe(expected[idx]);
        });
    });
});

describe("sum_to_b implementations", () => {
    cases.forEach((n, idx) => {
        it(`sum_to_n_b(${n}) should return ${expected[idx]}`, () => {
            expect(sum_to_n_b(n)).toBe(expected[idx]);
        });
    });
});

describe("sum_to_c implementations", () => {
    cases.forEach((n, idx) => {
        it(`sum_to_n_c(${n}) should return ${expected[idx]}`, () => {
            expect(sum_to_n_c(n)).toBe(expected[idx]);
        });
    });
});
