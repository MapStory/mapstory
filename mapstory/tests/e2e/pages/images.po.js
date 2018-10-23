

import "../tools/waitReady";

class ImagesPage {
  constructor() {
    this.navbar = element(By.css(".navigation"));
    this.loginModal = element(By.id("loginModal"));
  }
}

export default new ImagesPage();
