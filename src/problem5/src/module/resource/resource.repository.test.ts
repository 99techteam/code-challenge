/* TESTING STRATEGY:
  - This repository layer is designed to be unit-tested using Jest.
  - By mocking the 'prisma' client, we can verify that the query filters are 
    constructed correctly (e.g., 'contains' logic) without needing an active database connection.
  - Recommended test cases:
    1. findAll: Verify filter objects are correctly mapped to Prisma 'where' clauses.
    2. create/update/delete: Verify repository methods pass the correct payload to Prisma.
*/