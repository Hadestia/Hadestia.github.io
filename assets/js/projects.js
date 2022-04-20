/*** Project controller with jQuery ***/

const addFilters = (name, data) => {
    let filter = '<li data-filter=".filter-' + data +'">' + name + '</li>';
    $('#portfolio-flters').append(filter);
}

const addProject = (obj) => {
    if (!obj) {
        console.log('Unable to retrieve a nil object');
    } else {
        let project = '';
        let alt = obj.alt || '';
        let section = obj.section;
        let forward = obj.forward || true;
        let title = obj.title || 'Untitled';
        let link = obj.link || 'portfolio-details.html';
        let source = 'assets/img/portfolio/' + obj.source;
        
        project += '<div class="col-lg-4 col-md-6 portfolio-item filter-' + section + '"><div class="portfolio-wrap">';
        project += '<img src="' + source + '" class="img-fluid" alt="' + alt + '">';
        project += '<div class="portfolio-links">';
        //project += '<a href="' + source + '" data-gallery="portfolioGallery" class="portfolio-lightbox" title="' + title + '"><i class="bx bx-plus"></i></a>';
        if (forward) {
            project += '<a href="' + link + '" title="More Details"><i class="bx bx-link"></i></a>';
        }
        project += '</div></div></div>';
        
        $('.portfolio-container').append(project);
    }
}

//project controller
$.getJSON("assets/json/portfolio.json", 
    function (data) {
        //add filters
        $.each(data.filters, function (name, data) {
            addFilters(name, data);
        });
        
        //add contents
        $.each(data.contents, function (key, obj) {
            addProject(obj);
        });
});
