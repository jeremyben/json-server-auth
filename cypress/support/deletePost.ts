export function deletePost(postId) {
    cy.request({
      method: "DELETE",
      url: `/posts/${postId}`,
    }).then((response) => {
      expect(response.status).to.be.eq(200);
    });
  
    cy.request(`/posts?id=${postId}`).then((response) => {
      console.log(response);
      expect(response.status).to.be.eq(200);
      expect(response.body.length).to.be.eq(0);
    });
  }