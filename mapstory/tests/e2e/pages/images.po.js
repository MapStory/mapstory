require("../tools/waitReady.js");

function ImagesPage() {
  this.navbar = element(By.css(".navigation"));
  this.loginModal = element(By.id("loginModal"));
};

module.exports = new ImagesPage();
