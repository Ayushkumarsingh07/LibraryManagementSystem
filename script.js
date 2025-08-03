document.addEventListener('DOMContentLoaded', function () {
    const today = new Date().toISOString().split("T")[0];
    console.log("LibraFlow UI initialized.");

    // Book card click handler (for future use)
    document.querySelectorAll('.book-card').forEach(card => {
        card.addEventListener('click', function () {
            console.log("Clicked on a book card.");
            // You can redirect or open modal here
        });
    });

    // Search bar logic
    const searchInput = document.querySelector('input[type="text"]');
    if (searchInput) {
        searchInput.addEventListener('keyup', function (e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                console.log(`Searching for: ${query}`);
                // Optionally: fetch(`/api/search?query=${query}`)
            }
        });
    }

    // Quick action buttons
    document.querySelectorAll('.quick-action').forEach(button => {
        button.addEventListener('click', function () {
            const action = this.dataset.action;
            console.log(`Quick action triggered: ${action}`);

            // You can open modals/forms depending on action
        
        });
    });
});
// Fetch book data from backend and render in table
async function fetchBooks() {
    try {
        const res = await fetch('http://localhost:5000/api/books');
        const books = await res.json();

        const tbody = document.getElementById('bookTableBody');
        tbody.innerHTML = ''; // Clear existing

        books.forEach(book => {
            const statusClass = {
                Available: 'status-available',
                Borrowed: 'status-borrowed',
                Overdue: 'status-overdue'
            }[book.status] || 'status-available';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${book.isbn}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${book.title}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${book.author}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${book.category}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        ${book.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button class="text-blue-500 hover:text-blue-700 mr-2"><i class="fas fa-eye"></i></button>
                    <button class="text-green-500 hover:text-green-700 mr-2"><i class="fas fa-edit"></i></button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading books:", error);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    fetchBooks(); // Load on start

    // Other event listeners...
});
const books = localStorage.getItem("books") ? JSON.parse(localStorage.getItem("books")) : [];

const stats = {
    totalBooks: books.length,
    availableBooks: books.filter(book => book.status !== 'borrowed').length,
    borrowedToday: books.filter(book => {
        if (!book.borrowedDate || book.status !== 'borrowed') return false;
        const bDate = new Date(book.borrowedDate).toISOString().split("T")[0];
        return bDate === today;
    }).length,
    pendingFines: localStorage.getItem("pendingFines") || 0
};

document.querySelectorAll(".text-2xl.font-bold").forEach(el => {
    if (el.previousElementSibling?.textContent?.includes("Total Books")) {
        el.textContent = stats.totalBooks;
    } else if (el.previousElementSibling?.textContent?.includes("Available Books")) {
        el.textContent = stats.availableBooks;
    } else if (el.previousElementSibling?.textContent?.includes("Borrowed Today")) {
        el.textContent = stats.borrowedToday;
    } else if (el.previousElementSibling?.textContent?.includes("Pending Fines")) {
        el.textContent = `₹${parseFloat(stats.pendingFines).toFixed(2)}`;
    }
});

// Update Recently Borrowed/Returned/Overdue
const borrowedEl = document.querySelector(".RecentlyBorrowedList");
const returnedEl = document.querySelector(".RecentlyReturnedList");
const overdueEl = document.querySelector(".OverdueBooksList");

if (borrowedEl) borrowedEl.innerHTML = books
    .filter(book => book.status === "borrowed")
    .slice(0, 2).map(book => `
        <div class="book-entry">
            <div class="book-title font-semibold">${book.title}</div>
            <div class="book-author text-sm text-gray-500">By: ${book.author}</div>
            <div class="book-due text-xs text-yellow-600">${book.due ? 'Due: ' + book.due : ''}</div>
            <div class="book-borrower text-xs text-gray-400">Borrowed by: ${book.borrower || 'Unknown'}</div>
        </div>
    `).join("");

if (returnedEl) returnedEl.innerHTML = books
    .filter(book => book.status === "returned")
    .slice(0, 2).map(book => `
        <div class="book-entry">
            <div class="book-title font-semibold">${book.title}</div>
            <div class="book-author text-sm text-gray-500">By: ${book.author}</div>
            <div class="book-returned-date text-xs text-green-600">${book.returnedDate ? 'Returned: ' + book.returnedDate : ''}</div>
            <div class="book-borrower text-xs text-gray-400">Returned by: ${book.borrower || 'Unknown'}</div>
        </div>
    `).join("");

if (overdueEl) overdueEl.innerHTML = books
    .filter(book => book.status === "overdue")
    .slice(0, 2).map(book => `
        <div class="book-entry">
            <div class="book-title font-semibold">${book.title}</div>
            <div class="book-author text-sm text-gray-500">By: ${book.author}</div>
            <div class="book-due text-xs text-red-600">${book.due ? 'Due: ' + book.due : ''}</div>
            <div class="book-borrower text-xs text-gray-400">Borrowed by: ${book.borrower || 'Unknown'}</div>
        </div>
    `).join("");