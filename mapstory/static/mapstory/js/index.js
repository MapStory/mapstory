$(function() {
    var isMobile = Modernizr.mq('only all and (max-width: 1024px)');

    if (!isMobile) {
        $(window).stellar({
            horizontalScrolling: false,
            responsive: true/*,
             scrollProperty: 'scroll',
             parallaxElements: false,
             horizontalScrolling: false,
             horizontalOffset: 0,
             verticalOffset: 0*/
        });
    }

    var $container = $('.isotopeWrapper');
    var $resize = $('.isotopeWrapper').attr('id');
    // initialize isotope

    $container.isotope({
        itemSelector: '.isotopeItem',
        resizable: false, // disable normal resizing
        masonry: {
            columnWidth: $container.width() / $resize
        }
    });
    var rightHeight = $('#works').height();
    $('#filter a').click(function() {

        $('#works').height(rightHeight);
        $('#filter a').removeClass('current');

        $(this).addClass('current');
        var selector = $(this).attr('data-filter');
        $container.isotope({
            filter: selector,
            animationOptions: {
                duration: 1000,
                easing: 'easeOutQuart',
                queue: false
            }
        });
        return false;
    });
});