# READ ME: Less Assets
last revised on Aug 4, 2016
Assets are now fully detached from geonode and are modularized to prevent duplication around themes. 

## file structure
```
├── style
│   ├── fonts
│   ├── maps
│   │   ├── maploom.less 
│   │   ├── ol.less  
│   │   ├── tour.less 
│   │   ├── viewer.less
│   │   ├── **MAPS.less** // @imports the above for use in themes 
│   ├── site
│   │   ├── base.less 
│   │   ├── detailpages.less 
│   │   ├── diary.less 
│   │   ├── getpage.less
│   │   ├── index.less 
│   │   ├── navbar-footer.less 
│   │   ├── profile.less 
│   │   ├── recent-activity.less
│   │   ├── search.less 
│   │   ├── **SITE.less**   // @imports the above for use in themes
                            //  also font-awesome
│   │   ├── *variables.less* // common non-theme vars (greys, social media, fonts*)
│   ├── themes
│   │   ├── {{ COLOR }} 
│   │   │   ├── brandcolors.less // primary & secondary brandcolors
│   │   │   ├── maps.less  //combines common & theme vars with maps/maps.less
│   │   │   ├── site.less //                          ^^ with site/site.less
│   │   │   ├── > maps-theme.css [grunt]compiles & applies variable values
                    //ref in composer (_map_view_maploom.html)  
                    //ref in viewer (viewer.html & layer_map.html)
│   │   │   ├── > site-theme.css [grunt]compiles & applies variable values
                    //ref in site_base.html
```

### How does this work?
* All site-related less files (profile, search, index, navbar-footer, etc) are imported into `site/site.less`, common and theme variables are imported in `themes/{{color}}/site.less`, and together these are compiled by grunt as `themes/{{color}}/site-theme.css`. 
* All map-related less files (maploom/composer, viewer, map embeds in detail pages, openlayers, tour) are imported into `maps/maps.less`, `themes/{{color}}/maps.less`, `themes/{{color}}/maps-theme.css` (same proccess as above)

### Things to know:
* Theme variables (@primary, @secondary) are declared in a color-named directory in static/style/themes. 
* Common variables are declared in site/variables.less (grayscale, fonts*, social media, etc)
* Common & theme variables aren't applied until grunt compiles less to css. 
    * If you would like to overwrite any common variables specifically for one theme, do so in the space provided in `themes/{{color}}/site.less` and/or the corresponding maps file  
     * If you would like to change a primary or secondary theme color, do so in `themes/{{color}}/brandcolors.less`, it will generate a highlight & shadow based on this tone for use throughout the site as well.
     
* Re: OpenLayers less. We can put any openlayers rules that we're modifiying to overwrite inherited styles in `maps/ol.less`. Most of these rules are also compiled from elsewhere into  `MapLoom-1.2.0.css` and loaded into Composer. This stylesheet can overwrite those rules. However, please don't delete duplications because Viewer also relies on this.

* Re: Maploom less, we can put any maploom rules that we want to overwrite inherited styles in `maps/maploom.less`.

### To update less styling rules:
* do so in the corresponding file in the `style/site` or `style/map` directories, each of these has access to common and brand theme variables.
    * check the //--- header title ---// in the compiled css if youre unsure where there rule originates
* run grunt, and the updated rules will persist for all themes. 

### Locally you can try out or create a new theme by:
1) changing `THEME = 'orange'` in your `local_settings.py` to another existing theme color (current: blue, orange, default)

or

2) create a `themes/__{{color}}__` directory. Copy `site.less`, `maps.less`, and `brandcolors.less` verbatim from another theme directory. Change the `@primary` and `@secondary` colors to anything you desire. The less will generate highlight and shadow tones from these colors.

3) add `{{color}}/**.less` next to existing themes in the grunt less task. 

  *   i.e. `src: ['orange/**.less', 'blue/**.less', 'default/**.less', '{{color}}/**.less', '!*/brandcolors.less']`

4) Run grunt and change local settings to your new theme name as in step 1 above.