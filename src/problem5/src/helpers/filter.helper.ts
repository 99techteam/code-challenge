export const buildWhere = <TWhere extends Record<string, unknown>>(
  filters: Record<string, TWhere>
): TWhere => {
  let where = {} as TWhere;

  Object.values(filters).forEach((fragment) => {
    where = {
      ...where,
      ...fragment,
    };
  });

  return where;
};
