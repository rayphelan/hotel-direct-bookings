// Edit and Delete functions
// Rooms --------------------------------------------------------------
// Edit Room Function
const editRoomFunction = room_id => {
  $.get('/rooms/edit/' + room_id, html => {
    $('#modalContent').html(html);
  });
}
// Delete Room Function
const deleteRoomFunction = room_id => {
  $.get('/rooms/delete/' + room_id, html => {
    $('#modalContent').html(html);
  });
}
// Delete Room Request
const deleteRoomRequest = room_id => {
  $.ajax({
    url: "/api/rooms/" + room_id,
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