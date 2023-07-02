let token;

export function createPost(postId, title, author, email, password) {
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
      url: "/664/posts",
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

    cy.request(`/posts?id=${postId}`)
      .then((response) => {
        expect(response.status).be.eq(200);
      })
      .then((response) => {
        expect(response.body[0].id).to.be.eq(postId);
      });
  });
}