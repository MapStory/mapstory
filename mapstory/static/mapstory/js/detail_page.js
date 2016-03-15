function toggle_visibility(id) {
   var e = document.getElementById(id);
   if(e.style.display == 'block')
      e.style.display = 'none';
   else
      e.style.display = 'block';
}

// For some reason it gets it all as a string, so parse for the ' and grab the content in between them
keyword_list = keyword_list.split('\'');
tags = [];
// Grab every odd numbered index - hack to grab the keywords only
for (var i = 1; i < keyword_list.length; i += 2) {
  tags.push(keyword_list[i]);
}

// Manually set the value field
var value = $('#tokenfield-tags').val(tags);
// Only initialize the tokenfield once the values are set
if (value) {
  $('#tokenfield-tags').tokenfield({
    limit: 5
  });
  $('#tokenfield-tags').tokenfield('readonly');
}
// If a label is clicked, do a manual redirect to the explore page with the value of the token as the keyword search filter
$('.token-label').click(function(e) {
  var tag = $(e.target).text();
  // TODO: Modify search.js to handle this correctly
  window.location.href = '/search/?limit=100&offset=0&keywords__slug__in=' + tag;
});
