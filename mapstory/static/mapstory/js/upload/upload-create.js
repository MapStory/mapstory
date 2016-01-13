'use strict';

$(function() {
  function validKeyForName(e, currentName) {
    // Allow: backspace, delete, tab, escape, enter, ctrl+A and .
    if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
        // Allow: Ctrl+A
      (e.keyCode == 65 && e.ctrlKey === true) ||
        // Allow: home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)) {
      // let it happen, don't do anything
      return;
    }

    var charValue = String.fromCharCode(e.keyCode);
    var valid = /^[a-zA-Z]+$/.test(charValue);
    var number = /^[0-9]+$/.test(charValue);

    valid = valid ||
        // allow numbers only when shift is NOT down and also when it is not first character
      (number && e.shiftKey === false && currentName.length > 0) ||
        // allow underscore
      (e.keyCode == 189 && e.shiftKey === true);

    if (!valid) {
      //console.log('-----> key not allowed : ', e);
      e.preventDefault();
    }
  }

  $('#layer-name').keydown(function(e){
    return validKeyForName(e, $(this).val());
  });

  function cloneRow(){
    var tableBody = $('.table > tbody'),
        rowClone = $('tr:first-child', tableBody).clone();

    $('input[type=text]', rowClone).val('');
    rowClone.removeClass('hide');
    tableBody.append(rowClone);

    var attribNameInput = rowClone.find('td:first-child input');

    attribNameInput.on({
      keydown: function(e){
        return validKeyForName(e, $(this).val());
      },
      change: function() {
        this.value = this.value.replace(/\s/g, "");
      }
    });
  }

  function addDefaultAttributes() {
    cloneRow();
    var tableBody = $('.table > tbody'),
        newRow = $('tr:last-child', tableBody);

    newRow.find('td:first-child input').val('time');
    newRow.find('td select').val('org.geotools.data.postgis.PostGISDialect$XDate');
    newRow.find('td .attribute-remove').prop('disabled', true)
    //newRow.find('td .attribute-remove').css('cursor', 'not-allowed');
  }

  // test whether havving the attribute date explicitly is preferred
  addDefaultAttributes();

  // start with a non-hidden empty row
  cloneRow();

  $('#add-row').on('click', function(e) {
    e.preventDefault();
    cloneRow();
  });

  $('.table').on('click', '.attribute-remove', function(e){
    e.preventDefault();
    var row = $(this).parent().parent();
    row.remove();
  });

  $('#create-button').click(function() {
    var template =  _.template($('#alertTemplate').html());
    $('#status').html(template({
      alertLevel: 'alert-success',
      message: $('#progressTemplate').html()
    }));

    var workspace = 'geonode';
    var featureType = {
      'name': null,
      'store': {
        'name': null
      },
      'namespace': {
        'name': null
      },
      'attributes': {
        'attribute': [
        ]
      },
      'nativeCRS': 'EPSG:4326',
      'srs': 'EPSG:4326'
    };

    var storeCreateGeogig = $('#geogig_toggle').is(':checked');

    featureType.name = $('#layer-name').val();
    featureType.srs = 'EPSG:4326';
    featureType.nativeCRS = 'EPSG:4326';
    featureType.namespace.name = 'geonode';

    // when we want a new geogig datastore to be created, we'll leave the name empty
    if (storeCreateGeogig) {
      featureType.store.name = null;
    } else {
      featureType.store.name = 'mapstory_data';
    }

    // add attributes to feature type
    $('tr').each(function (i, row) {
      var row = $(row),
        name = row.find('td:first-child input').val(),
        type = row.find('td option:selected').val();
        if (name) {
          featureType.attributes.attribute.push({
            'name': name,
            /**
             * To see types, upload a layer to geoserver and then see the response from the rest endpoint as such:
             * /geoserver/rest/workspaces/geonode/datastores/datastore/featuretypes/my_layer.json
             *
             * example types:
             * java.lang.Long
             * java.lang.String
             * java.lang.Double
             * org.geotools.data.postgis.PostGISDialect$XDate  (for mapstory's xdate support)
             */
            'binding': type,
            'minOccurs': 0,
            'nillable': true
          });
        }
    });

    featureType.attributes.attribute.push({
      'name': 'geometry',
      'binding': $('#geometryType>option:selected').html(),
      'minOccurs': 0,
      'nillable': true
    });


    $.ajax({
      type: 'post',
      url: '/layers/create',
      data: {
        featureType: JSON.stringify(featureType),
        storeCreateGeogig: storeCreateGeogig
      },
      success: function (data, text) {
        console.log('success');
        var template =  _.template($('#alertTemplate').html());
        $('#status').html(template({
          alertLevel: 'alert-success',
          message: _.template($('#completedTemplate').html())({
            urlLayerInfo: '/layers/' + workspace + ':' + featureType.name,
            urlMetadata: '/layers/' + workspace + ':' + featureType.name + '/metadata',
            urlManageStyle: '/gs/' + workspace + ':' + featureType.name + '/style/manage'
          })
        }));

        window.location = '/layers/' + workspace + ':' + featureType.name + '/metadata?layer_create_mode=true';
      },
      error: function (request, status, error) {
          console.log(request.responseText);
        var template =  _.template($('#alertTemplate').html());
        $('#status').html(template({
          alertLevel: 'alert-danger',
          message: '<p>' + gettext('Error') + ' ' + request.responseText + '</p>'
        }));
      },
      complete: function () {
        console.log('complete, begin');
      }
    });
  });
});





