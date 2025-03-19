export function getAllTodosQuery(): string {
  return `
    SELECT 
      * 
    FROM 
      todo
    `;
}

export function getTodoByIdQuery(): string {
  return `
    SELECT 
      * 
    FROM 
      todo 
    WHERE 
      id = $1;
    `;
}

export function createTodoQuery(): string {
  return `
    INSERT INTO todo (id, title, status, description)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
}

export function updateTodoQuery(): string {
  return `
    UPDATE todo
    SET title = COALESCE($1, title),
        status = COALESCE($2, status),
        description = COALESCE($3, description)
    WHERE id = $4
    RETURNING *;
  `;
}

export function deleteTodoQuery(): string {
  return "DELETE FROM todo WHERE id = $1 RETURNING id;";
}
