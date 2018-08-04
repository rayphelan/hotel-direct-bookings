// Edit and Delete functions
// Rooms --------------------------------------------------------------
// Edit Room Function
const editRoomFunction = room_id => {
  $.get('/hotels/rooms/edit/' + room_id, html => {    
    $('#modalContent').html(html);
  });
}
// Delete Room Function
const deleteRoomFunction = room_id => {
  $.get('/hotels/rooms/delete/' + room_id, html => {
    $('#modalContent').html(html);
  });
}
// Delete Room Request
const deleteRoomRequest = room_id => {
  $.ajax({
    url: "/hotels/rooms/" + room_id,
    method: 'DELETE',
    success: data => {
      $('#roomModal').modal('toggle');
      $('#row' + data).fadeOut(1000);
    },
    error: () => {
      console.log('Can not delete room');
    }
  });
}

// Delete Hotel Photo
const deleteHotelPhoto = id => {
  $.ajax({
    url: "/hotel_photos/" + id,
    method: 'DELETE',
    success: data => {
      window.location.reload(true);
    },
    error: () => {
      console.log('Can not delete photo');
    }
  });
}


// Delete Room Photo
const deleteRoomPhoto = id => {
  $.ajax({
    url: "/room_photos/" + id,
    method: 'DELETE',
    success: data => {
      window.location.reload(true);
    },
    error: () => {
      console.log('Can not delete photo');
    }
  });
}