const list = document.getElementById('movie-list');

Sortable.create(list, {
  animation: 150,
  onSort: updateRankNumbers
});

function updateRankNumbers() {
  const items = document.querySelectorAll('#movie-list .movie-item');
  items.forEach((item, index) => {
    item.querySelector('.rank-number').textContent = index + 1 + '.';
  });
}

function prepareSubmission(event) {
  const clickedButton = event.submitter;
  const action = clickedButton.value;
  const usernameInput = document.querySelector('input[name="username"]');
  const username = usernameInput ? usernameInput.value.trim() : 'this user';

  let confirmMessage = '';
  if (action === "load") {
    confirmMessage = `Are you sure you want to load ${username}'s rankings?`;
  } else if (action === "submit") {
    confirmMessage = `Are you sure you want to save ${username}'s rankings? This will overwrite any previous rankings.`;
  }

  if (!confirm(confirmMessage)) {
    // User canceled
    event.preventDefault();
    return;
  }

  // If user is loading, no need to reorder
  if (action === "load") {
    return;
  }

  // Save button (formerly submit) - prepare the movie data
  const items = document.querySelectorAll('#movie-list .movie-item');
  const hiddenInputs = document.getElementById('hidden-inputs');
  hiddenInputs.innerHTML = '';

  items.forEach(item => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'movie';
    input.value = item.dataset.title;
    hiddenInputs.appendChild(input);
  });
}

// Prevent Enter key from submitting the form
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('form').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault(); // stop Enter from submitting
    }
  });
});

updateRankNumbers();
