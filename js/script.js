$(document).ready(function() {
    const bookedSlots = JSON.parse(localStorage.getItem('bookedSlots')) || {};
    const today = moment().startOf('day');

    function initializeSlots() {
        // Initialize slots for the next 7 days
        for (let i = 0; i < 7; i++) {
            const dateKey = today.clone().add(i, 'days').format('YYYY-MM-DD');
            if (!bookedSlots[dateKey]) {
                bookedSlots[dateKey] = [];
            }
        }
        localStorage.setItem('bookedSlots', JSON.stringify(bookedSlots));
    }

    function updateBookedSlots() {
        $('#booked-slots').empty();
        Object.entries(bookedSlots).forEach(([date, slots]) => {
            slots.forEach(slot => {
                $('#booked-slots').append(`<div class="booked-slot">${slot.title} - ${slot.date} (${slot.duration} minutes) - ₹${slot.amount}</div>`);
            });
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
        events: Object.entries(bookedSlots).flatMap(([date, slots]) =>
            slots.map(slot => ({
                title: 'Booked',
                start: slot.start,
                color: '#f44336'
            }))
        )
    });

    $('#meeting-form').on('submit', function(e) {
        e.preventDefault();
        const title = $('#event-title').val();
        const start = $('#event-time').val();
        const duration = parseInt($('#event-duration').val());
        const amount = (duration === 15) ? 500 : (duration === 30) ? 1000 : 1500;

        const dateKey = moment(start).format('YYYY-MM-DD');
        
        // Check if the time slot is already booked
        const isBooked = bookedSlots[dateKey].some(slot => slot.start === start);
        if (isBooked) {
            alert('This time slot is already booked!');
            return;
        }

        // Prepare payment link
        const paymentLink = `upi://pay?pa=anshutrivedikok-1@okaxis&pn=YourActualName&tn=Payment%20for%20Counseling&am=${amount}&cu=INR`;

        // Confirm payment
        if (confirm(`Proceed to payment of ₹${amount} via UPI?`)) {
            // Save meeting details
            bookedSlots[dateKey].push({ title, start, duration, amount, date: moment(start).format('MMMM Do YYYY, h:mm a') });
            localStorage.setItem('bookedSlots', JSON.stringify(bookedSlots));

            // Add event to the calendar
            $('#calendar').fullCalendar('renderEvent', { title: 'Booked', start: start, color: '#f44336' });

            // Redirect to payment
            window.location.href = paymentLink;

            // Reset the form
            $('#event-form').hide();
            $('#meeting-form')[0].reset();
            updateBookedSlots();
        }
    });

    initializeSlots();
    updateBookedSlots();
});
