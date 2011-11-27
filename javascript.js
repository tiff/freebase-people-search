jQuery(function($) {
  var $output = $("output"),
      $input  = $("input[type=search]"),
      $list   = $("<ol>"),
      searchTimeout,
      oldValue,
      newValue;
  
  function search(query) {
    var deferred = $.Deferred();
    $.ajax({
      url: "https://www.googleapis.com/freebase/v1/search",
      data: {
        query: $input.val(),
        prefixed: true,
        limit: 4,
        filter: "(any type:/people/person type:/fictional_universe/fictional_character)",
        key: "AIzaSyCPHGl6rT15yTi77BBFV8mlNHYICuZpFtc"
      },
      dataType: "jsonp"
    }).done(function(data) {
      if (data && data.result && data.result.length) {
        deferred.resolve(data.result);
      } else {
        deferred.reject();
      }
    }).fail(deferred.rejected);
    
    return deferred.promise();
  }
  
  function render(results) {
    var $listItem, $image, $appendix;
    
    $list.empty();
    
    $.each(results, function(i, result) {
      $listItem = $("<li>", {
        html: result.name
      });
      
      $appendix = result.notable && result.notable.name && $("<i>", {
        text: "(" + result.notable.name + ")"
      });
      
      $image = $("<img>", {
        src: getImageSrc(result.mid)
      });
      
      $image.prependTo($listItem);
      $appendix && $appendix.appendTo($listItem);
      $listItem.appendTo($list);
    });
    
    function getImageSrc(id) {
      return "https://usercontent.googleapis.com/freebase/v1/image"
        + id
        + "?maxwidth=40&maxheight=40"
        + "&mode=fillcropmid"
        + "&key=AIzaSyCPHGl6rT15yTi77BBFV8mlNHYICuZpFtc";
    }
    
    $output.html($list);
  }
  
  function renderFallback(text) {
    var $hint = $("<p>", {
      text: text || "No results"
    });
    
    $output.html($hint);
  }
  
  $input.bind({
    keydown: function() {
      clearTimeout(searchTimeout);
    },
    keyup: function() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(function() {
        newValue = $input.val();
        if (newValue === oldValue) {
          return;
        }
        
        oldValue = newValue;
        
        if (!newValue) {
          renderFallback("Please enter something");
          return;
        }
        search(newValue).done(render).fail(renderFallback);
      }, 200);
    }
  });
  
});