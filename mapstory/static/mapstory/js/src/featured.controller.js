/*
 *  HomePage Featured Controller
 */
(function() {
  'use strict';

  angular
    .module('mapstory')
    .controller('featuredController', featuredController);

  function featuredController($injector, $scope, $http) {
    var vm = this;

    // momentarily storing a json of an api response here in this controller with
    // the mapstories displayed in the homepage mockup so we can review and integrate
    // the changes removing less-neat
    // next PR I have will address dynamically grabbing featured content 
    vm.cards = [
      {
        abstract: "This map shows the locations of all fracking sites from 2010-2013 in West Virginia.Hydraulic fracturing, or â€œfrackingâ€, is the process of drilling and injecting fluid into the ground at a high pressure in order to fracture shale rocks to release natural gas inside.There are more than 500,000 active natural gas wells in the US.",
        category: "natureEnvironment",
        category__gn_description: "Nature & Environment",
        date: "2016-09-28T14:44:30",
        detail_url: "/story/21510",
        distribution_description: "",
        distribution_url: "",
        featured: true,
        id: 21510,
        is_published: true,
        keywords: [ ],
        owner__first_name: "Holly",
        owner__last_name: "Winscott",
        owner__username: "hwinscot",
        popular_count: 295,
        rating: 0,
        regions: [ ],
        share_count: 0,
        thumbnail_url: "https://mapstory.org/uploaded/thumbs/map21510.jpg",
        title: "Fracking Sites in West Virgina",
        type: "mapstory",
        uuid: "c9872da7-ac26-4840-8218-a469c33888cd"
      },
      {
        abstract: "The American Civil War (1861â€“1865), often referred to simply as The Civil War in the United States, was a civil war fought in the United States. In response to the election of an anti-slavery Republican as President, 11 southern slave states declared their secession from the United States and formed the Confederate States of America ('the Confederacy'); the other 25 states supported the federal government ('the Union'). After four years of warfare, mostly within the Southern states, the Confederacy surrendered and slavery was outlawed everywhere in the nation. Issues that led to war were partially resolved in the Reconstruction Era that followed, though others remained unresolved. Credit to Jeff Meyer",
        category: "geopolitics",
        category__gn_description: "Geopolitics",
        date: "2016-09-28T14:52:41",
        detail_url: "/story/21977",
        distribution_description: "",
        distribution_url: "",
        featured: true,
        id: 21977,
        is_published: true,
        keywords: [ ],
        owner__first_name: "Jeff",
        owner__last_name: "Meyer",
        owner__username: "jeffmeyer",
        popular_count: 105,
        rating: 0,
        regions: [ ],
        share_count: 0,
        thumbnail_url: "https://mapstory.org/uploaded/thumbs/map21977.jpg",
        title: "United States Civil War",
        type: "mapstory",
        uuid: "adbf0ab2-469a-4ec8-b133-b4183b108491"
      },
      {
        abstract: "This mapstory shows the growth and movement of Congressional Districts within the State of North Carolina from when it gained Statehood in 1789 to present day.",
        category: null,
        category__gn_description: null,
        csw_type: "",
        csw_wkt_geometry: "POLYGON((-84.32195281982422 33.83042526245117,-84.32195281982422 36.58811569213867,-75.45865631103516 36.58811569213867,-75.45865631103516 33.83042526245117,-84.32195281982422 33.83042526245117))",
        date: "2014-07-09T18:01:25",
        detail_url: "/layers/geonode:NorthCarolinaFinal",
        featured: false,
        id: 4575,
        is_published: true,
        keywords: [ ],
        owner__first_name: "Jonathan",
        owner__last_name: "Davis",
        owner__username: "jdavis15",
        popular_count: 106,
        rating: 0,
        regions: [ ],
        share_count: 0,
        srid: "EPSG:4269",
        subtype: "vector",
        supplemental_information: "Jeffrey B. Lewis, Brandon DeVine, Lincoln Pitcher, and Kenneth C. Martis. (2013) Digital Boundary Definitions of United States Congressional Districts, 1789-2012. [Data file and code book]. Retrieved from http://cdmaps.polisci.ucla.edu on [06/01/2014].",
        thumbnail_url: "https://mapstory.org/uploaded/thumbs/layer-f3bcaa78-07bc-11e4-985a-12313922479d-thumb.png",
        title: "Evolution of Congressional Districts in North Carolina 1789-2012",
        type: "layer",
        typename: "geonode:NorthCarolinaFinal",
        uuid: "f3bcaa78-07bc-11e4-985a-12313922479d"
      },
      {
        abstract: "Karenia Brevis is a marine dinoflagellate common in Gulf of Mexico waters, and is the organism responsible for Florida red tide. This data represents count numbers at testing sites around Florida.  ",
        category: "natureEnvironment",
        category__gn_description: "Nature & Environment",
        date: "2016-09-28T14:35:37",
        detail_url: "/story/21037",
        distribution_description: "",
        distribution_url: "",
        featured: true,
        id: 21037,
        is_published: true,
        keywords: [ ],
        owner__first_name: "Kathryn",
        owner__last_name: "Pole",
        owner__username: "kpole",
        popular_count: 114,
        rating: 0,
        regions: [ ],
        share_count: 0,
        thumbnail_url: "https://mapstory.org/uploaded/thumbs/map21037.jpg",
        title: "Karenis Brevis in Florida",
        type: "mapstory",
        uuid: "f86ea442-dee6-4fa4-ad56-80f910f56e7e"
      },
      {
        abstract: "The 'Darfur Damaged and Destroyed Villages' dataset describes the condition of villages in the Darfur region of Sudan that the U.S. Government has confirmed as either 'damaged' or 'destroyed' between the time period February 2003 to December 2010. Additionally, villages the are confirmed to have 'No Damage' are also reported. Source: Human Information Unit - US Dep of State https://hiu.state.gov/data/data.aspx",
        category: "crisis",
        category__gn_description: "Crisis",
        date: "2016-09-28T14:32:30",
        detail_url: "/story/20868",
        distribution_description: "",
        distribution_url: "",
        featured: true,
        id: 20868,
        is_published: true,
        keywords: [ ],
        owner__first_name: "Everett",
        owner__last_name: "Lasher",
        owner__username: "everett",
        popular_count: 186,
        rating: 0,
        regions: [ ],
        share_count: 0,
        thumbnail_url: "https://mapstory.org/uploaded/thumbs/map20868.jpg",
        title: "Village Destruction in the Darfur Region",
        type: "mapstory",
        uuid: "b76255cf-c584-43b2-b5af-fc787655dc67"
      },
      {
        abstract: "Major earthquake and tsunami events around the world classified by the number of fatalities. Note that this is by no means all encompassing. Inspired by http://www.infoplease.com/ipa/A0001439.html",
        category: "natureEnvironment",
        category__gn_description: "Nature & Environment",
        date: "2016-09-28T14:32:46",
        detail_url: "/story/20881",
        distribution_description: null,
        distribution_url: null,
        featured: false,
        id: 20881,
        is_published: true,
        keywords: [ ],
        owner__first_name: "Shobana",
        owner__last_name: "Atmaraman",
        owner__username: "satmaraman",
        popular_count: 24,
        rating: 0,
        regions: [ ],
        share_count: 0,
        thumbnail_url: "https://mapstory.org/uploaded/thumbs/map20881.jpg",
        title: "Earthquake and Volcano Fatalities: a sample",
        type: "mapstory",
        uuid: ""
      }
    ];
  };
})();