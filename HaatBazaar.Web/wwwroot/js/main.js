// Add class when input field is focused
$("#searchInput").focus(function () {
  $("body").addClass("focused");
});

// Remove class when input field loses focus
$("#searchInput").blur(function () {
  $("body").removeClass("focused");
});

//get user location
var userLat;
var userLon;
var map;

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      userLat = position.coords.latitude;
      userLon = position.coords.longitude;

      // Initialize the map after getting the user's location
      if ($("#map").length > 0) {
        map = L.map("map").setView([userLat, userLon], 11);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "© OpenStreetMap",
        }).addTo(map);
      }
    },
    function (error) {
      console.error("Error getting location: ", error);
    }
  );
} else {
  console.error("Geolocation is not supported by this browser.");
}

function updateLocation(userLocations, radius) {
  if (!map || !userLat || !userLon) {
    console.error("Map or user coordinates not initialized.");
    return;
  }

  map.eachLayer(function (layer) {
    if (layer instanceof L.Marker || layer instanceof L.Circle) {
      map.removeLayer(layer);
    }
  });

  // Set the map view to the custom location
  if (radius < 2) {
    map.setView([userLat, userLon], 15);
  } else {
    map.setView([userLat, userLon], 12);
  }

  var marker = L.circleMarker([userLat, userLon], {
    color: "red",
    fillColor: "#f03",
    fillOpacity: 1,
    radius: 10,
  }).addTo(map);

  var circle = L.circle([userLat, userLon], {
    color: "red",
    fillColor: "transparent",
    fillOpacity: 0.2,
    radius: radius * 1000,
  }).addTo(map);

  var totalQuantity = 0;
  var price = 0;
  var avgPrice = 0;
  var lt = 0;
  var totalPrice = 0;
  var unit = "";
  var itemsFound = false; // Flag to check if any item is found

  if (userLocations && userLocations.length > 0) {
    $.each(userLocations, function (index, location) {
      var distance = map.distance(
        [userLat, userLon],
        [location.latitude, location.longitude]
      );
      if (distance <= radius * 1000) {
        itemsFound = true; // Set the flag to true if an item is found
        var ratingHtml = `
          <div class="rating">
            <span class="star" data-rating="5">&#9733;</span>
            <span class="star" data-rating="4">&#9733;</span>
            <span class="star" data-rating="3">&#9733;</span>
            <span class="star" data-rating="2">&#9733;</span>
            <span class="star" data-rating="1">&#9733;</span>
          </div>`;
        var userMarker = L.marker([location.latitude, location.longitude])
          .addTo(map)
          .bindPopup(
            "<div class='product_image--small'><img src='https://images.unsplash.com/photo-1573196444577-af471298e034'></div>" +
              "Within " +
              radius +
              " km radius" +
              "<br>Product: " +
              location.product +
              "<br>Quantity: " +
              location.quantity +
              location.unit +
              "<br>Price: Rs: " +
              location.price +
              "<br>Rating: " +
              ratingHtml +
              "<br><br><a href='/connection/index?connectionId=" +
              location.connectId +
              "'>Connect</a>"
          );
        //.openPopup();
        lt++;
        unit = location.unit;
        var lq = location.quantity;
        totalQuantity += lq;
        totalPrice += location.price;
      }
    });

    if (lt > 0) {
      avgPrice = totalPrice / lt;
    } else {
      avgPrice = 0;
    }
  }

  if (itemsFound) {
    $(".suggestion-box").html(
      "Total Quantity: " +
        totalQuantity +
        unit +
        "<br>Avg Price: Rs: " +
        avgPrice.toFixed(2)
    );
  } else {
    $(".suggestion-box").html("Item not found on this search radius. <br> ");
  }
}

$(document).ready(function () {
  $("#searchForm").submit(function (event) {
    event.preventDefault(); // Prevent the default form submission
    $("#loader").css("display", "flex");
    var searchTerm = $("#searchInput").val();
    var selectedRadius = $("#radiusSelect").val(); // Get the selected radius
    var baseUrl =
      "https://00ff-2400-1a00-b030-f848-ac79-6aa8-35fa-4f7.ngrok-free.app/api/Search?searchItem=" +
      searchTerm;
    if (searchTerm.trim() !== "") {
      $.ajax({
        url: baseUrl,
        method: "GET",
        contentType: "application/json",
        success: function (data) {
          $("#loader").hide();
          if (data.length > 0) {
            updateLocation(data, selectedRadius); // Pass the selected radius
          } else {
            alert("No results found for the search term.");
          }
        },
        error: function (err) {
          console.error("Error fetching data: ", err);
          $("#loader").hide();
        },
      });
    } else {
      alert("Please enter a search term.");
    }
  });
});
