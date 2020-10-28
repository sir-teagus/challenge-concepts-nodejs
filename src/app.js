const express = require("express");
const cors = require("cors");

const { v4: uuid, validate: isUuid, v4 } = require("uuid");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function validateRepositoryId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ error: "Invalid repository ID." });
  }

  return next();
}

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs, likes } = request.body;

  const repository = { id: v4(), title, url, techs, likes };

  if (!isUuid(repository.id) || repository.likes != 0) {
    return response.status(400).json({ error: "Invalid data entry." });
  }

  repositories.push(repository);

  return response.json({ repository });
});

app.put("/repositories/:id", validateRepositoryId, (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repositoryIndex = repositories.findIndex(
    (repository) => repository.id == id
  );

  if (repositoryIndex < 0) {
    return response.status(400).json({ error: "ID not found." });
  }

  const repository = {
    id,
    title,
    url,
    techs,
    likes: repositories[repositoryIndex].likes,
  };

  repositories[repositoryIndex] = repository;

  return response.json({ repository });
});

app.delete("/repositories/:id", validateRepositoryId, (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(
    (repository) => repository.id == id
  );

  if (repositoryIndex < 0) {
    return response.status(400).json({ error: "ID not found." });
  }

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post(
  "/repositories/:id/like",
  validateRepositoryId,
  (request, response) => {
    const { id } = request.params;

    const repositoryIndex = repositories.findIndex(
      (repository) => repository.id == id
    );

    if (repositoryIndex < 0) {
      return response.status(400).json({ error: "ID not found." });
    }

    const repository = repositories[repositoryIndex];

    repository.likes++;

    return response.json(repository);
  }
);

module.exports = app;
