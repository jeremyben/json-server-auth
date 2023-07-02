export function updatePost(postId, updatedTitle, updatedAuthor) {
    cy.request({
      method: "PUT",
      url: `/posts/${postId}`,
      body: {
        id: postId,
        title: updatedTitle,
        author: updatedAuthor,
      },
    }).then((response) => {
      expect(response.status).to.be.eq(200);
  
      cy.request(`/posts?id=${postId}`).then((response) => {
        console.log(response.body);
        expect(response.status).be.eq(200);
        expect(response.body[0].id).to.be.eq(postId);
        expect(response.body[0].title).to.be.eq(updatedTitle);
        expect(response.body[0].author).to.be.eq(updatedAuthor);
      });
    });
  }