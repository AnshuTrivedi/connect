$(document).ready(function() {
    var bookedSlots = JSON.parse(localStorage.getItem('bookedSlots')) || [];

    function updateBookedSlots() {
        $('#booked-slots').empty();
        bookedSlots.forEach(slot => {
            $('#booked-slots').append(`<div class="booked-slot">${slot.title} - ${slot.date} (${slot.duration} minutes) - ₹${slot.amount}</div>`);
        });
    }

    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        selectable: true,
        select: function(start) {
            $('#event-form').show();
            $('#event-time').val(moment(start).format('YYYY-MM-DDTHH:mm'));
            $('#payment-button').data('slot-start', start.format());
        },
        editable: true,
        events: bookedSlots.map(slot => ({
            title: 'Booked',
            start: slot.start,
            color: '#f44336'
        }))
    });

    $('#meeting-form').on('submit', function(e) {
        e.preventDefault();
        var title = $('#event-title').val();
        var start = $('#event-time').val();
        var duration = parseInt($('#event-duration').val());
        var amount = (duration === 15) ? 500 : (duration === 30) ? 1000 : 1500;

        // Prepare payment link
        var paymentLink = `upi://pay?pa=anshutrivedikok-1@okaxis&pn=YourName&tn=Payment%20for%20Counseling&am=${amount}&cu=INR`;

        // Show payment button and set link
        $('#payment-button').show().off('click').on('click', function() {
            // Open payment app
            window.location.href = paymentLink;

            // Simulate successful payment
            setTimeout(() => {
                bookedSlots.push({ title, start, duration, amount, date: moment(start).format('MMMM Do YYYY, h:mm a') });
                localStorage.setItem('bookedSlots', JSON.stringify(bookedSlots));
                updateBookedSlots();
                $('#calendar').fullCalendar('renderEvent', { title: 'Booked', start: start, color: '#f44336' });
                $('#event-form').hide();
                $('#meeting-form')[0].reset();
            }, 2000); // Simulating payment confirmation delay
        });

        // Confirm payment
        if (confirm(`Proceed to payment of ₹${amount} via UPI?`)) {
            // Trigger the click event to redirect to UPI app
            $('#payment-button').click();
        }
    });

    updateBookedSlots();
});
