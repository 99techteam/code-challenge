const skipPage = ({
  page = 1,
  limit = 10,
}: {
  page: number;
  limit: number;
}): number => (+page - 1) * +limit;

export { skipPage };
