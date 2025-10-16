import { average } from "../utils/average";

test("average on normal list", () => {
  expect(average([2, 4, 6])).toBe(4);
});

test("average on empty throws", () => {
  expect(() => average([])).toThrow();
});

