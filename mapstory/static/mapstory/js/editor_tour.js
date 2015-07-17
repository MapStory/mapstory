editor_tour = {
    id: "welcome_tour",
    steps: [
        {
            target: "tl-nav",
            placement: "bottom",
            title: "This is the navigation menu",
            content: "Use the links here to get around on our site!"
        },
       /* {
            target: "search-panel",
            placement: "right",
            title: "Search for something",
            content: "Not actually sure what this searches"
        },*/
        {
            target: "layer-manager-panel",
            placement: "bottom",
            title: "Manage Layers",
            content: "Add, remove or edit layers in the map"
        },
        {
            target: $("a[href=#ms-toggle-preview]").get(0),
            placement: "bottom",
            title: "Press this",
            content: "To do more stuff"
        }
    ]
};