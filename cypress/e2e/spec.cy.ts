import { faker } from "@faker-js/faker";
import { createPost } from "../support/createPost";
import { updatePost } from "../support/updatePost";
import { deletePost } from "../support/deletePost";
import { createPostEntity } from "../support/createPostEntity";

describe("api testing on json-server", () => {
  let email = faker.internet.email();
  let password = faker.internet.password();
  let postId = faker.number.int();
  let title = faker.animal.type();
  let author = faker.internet.userName();

  it("Get all posts", () => {
    cy.log("Getting all posts");

    cy.request("/posts").then((response) => {
      expect(response.status).be.eq(200);
      expect(
        response.allRequestResponses[0]["Response Headers"]["content-type"]
      ).to.be.eq("application/json; charset=utf-8");
    });
  });

  it("Get 10 first posts", () => {
    cy.request("/posts?_limit=10").then((response) => {
      cy.log("Getting first 10 posts");

      expect(response.status).be.eq(200);
      expect(response.body.length).to.be.eq(10);
    });
  });

  it("Get posts with id = 55 and id = 60", () => {
    cy.log("Getting posts with id = 55 and id = 60");
    cy.request("GET", "/posts?id=55&id=60").then((response) => {
      expect(response.status).be.eq(200);
    });
  });

  it("Create a post", () => {
    cy.log("Creating a post with Status Code 401");

    cy.request({
      method: "POST",
      url: "/664/posts",
      failOnStatusCode: false,
      body: {
        id: postId,
        title: title,
        author: author,
      },
    }).then((response) => {
      expect(response.status).be.eq(401);
    });
  });

  it("Create post with adding access token in header.", () => {
    createPost(postId, title, author, email, password);
  });

  it("Create post entity and verify that the entity is created", () => {
    let email = faker.internet.email();
    let password = faker.internet.password();
    let postId = faker.number.int();
    let title = faker.animal.type();
    let author = faker.internet.userName();
    cy.log("Creating post entity and verify that the entity is created");
    createPostEntity(email, password, postId, title, author);
  });

  it("Update non-existing entity", () => {
    cy.log("Updating post entity and verify that the entity is updated");

    cy.request({
      method: "PUT",
      url: "/posts",
      failOnStatusCode: false,
      body: {
        id: postId,
        title: title,
        author: author,
      },
    }).then((response) => {
      expect(response.status).to.be.eq(404);
    });
  });

  it("Create post entity and update the created entity", () => {
    let email = faker.internet.email();
    let password = faker.internet.password();
    let postId = faker.number.int();
    let title = faker.animal.type();
    let author = faker.internet.userName();
    let updatedTitle = faker.animal.type();
    let updatedAuthor = faker.internet.userName();

    cy.log("creating and updating post entity");

    createPostEntity(email, password, postId, title, author);
    updatePost(postId, updatedTitle, updatedAuthor);
  });

  it("Delete non-existing post entity", () => {
    cy.log("deleting non-existing post entity");
    cy.request({
      method: "DELETE",
      url: `/posts`,
      failOnStatusCode: false,
      body: {
        id: postId,
        title: title,
        author: author,
      },
    }).then((response) => {
      expect(response.status).to.be.eq(404);
    });
  });

  it("Create post entity, update the created entity, and delete the entity", () => {
    let email = faker.internet.email();
    let password = faker.internet.password();
    let postId = faker.number.int();
    let title = faker.animal.type();
    let updatedTitle = faker.animal.type();
    let author = faker.internet.userName();
    let updatedAuthor = faker.internet.userName();
    cy.log(
      "Create post entity, update the created entity, and delete the entity"
    );
    createPostEntity(email, password, postId, title, author);
    updatePost(postId, updatedTitle, updatedAuthor);
    deletePost(postId);
  });
});