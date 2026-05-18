For this problem i have created an ExpressJS server for coin management. I have added 5 API endpoints for CRUD operations.

### Endpoints [coins.ts](../../backend/src/routes/coins.ts)

- **`GET /api/coins`**: Fetches all coins. Supports filtering by `blockchain`, `search` string, and price ranges (`minPrice`, `maxPrice`).
- **`GET /api/coins/:id`**: Fetches a single coin by its ID.
- **`POST /api/coins`**: Creates a new coin. Expects `currency`, `blockchain`, `price`, `date`, and `iconFilename`.
- **`PUT /api/coins/:id`**: Updates an existing coin's details.
- **`DELETE /api/coins/:id`**: Removes a coin from the database.

The coins image need to have icon in folder frontend\public\icons\coins\
I wont be having a upload file form in order to avoid the complexity of file upload. We can add the icon in the folder and use the filename as the icon name.
I also created a coins page to interact with the API.
As you can check in the coin tab file
[CoinsPage.tsx](../../frontend/src/pages/CoinsPage.tsx)
