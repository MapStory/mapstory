Feature('Basic Main page');

Scenario('Title is MapStory', (I) => {
  I.amOnPage('/');
  I.seeInTitle('MapStory');
});
