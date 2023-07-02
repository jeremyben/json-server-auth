let token;

export function createPostEntity(email, password, postId, title, author) {
  cy.request({
    method: "POST",
    url: "/register",
    body: {
      email: email,
      password: password,
    },
  }).then((response) => {
    expect(response.status).to.be.eq(201);
  });

  cy.request({
    method: "POST",
    url: "/login",
    body: {
      email: email,
      password: password,
    },
  }).then((response) => {
    expect(response.status).to.be.eq(200);

    token = response.body.accessToken;

    cy.request({
      method: "POST",
      url: "/posts",
      auth: {
        bearer: token,
      },
      body: {
        id: postId,
        title: title,
        author: author,
      },
    }).then((response) => {
      console.log(response);
      expect(response.status).be.eq(201);
    });

    cy.request({
      method: "GET",
      url: `/posts/${postId}`,
    }).then((response) => {
      expect(response.status).to.be.eq(200);
    });
  });
}